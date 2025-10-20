import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import {
    MOCK_USERS_DB,
    mockGetCurrentUser,
    mockLogin,
    mockLogout,
    mockRegister,
} from './__mocks__/auth.mock';
import { API_CONFIG, ENV } from './api.config';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { clearAuthData, saveUserData } from './storage';

/**
 * Mock mode configuration
 * Set EXPO_PUBLIC_USE_MOCK=false in .env to use real backend
 */
const USE_MOCK = ENV.USE_MOCK;
const MOCK_DELAY = ENV.MOCK_DELAY;

/**
 * Helpers
 */
async function safeJson<T = any>(res: Response): Promise<T | null> {
    try { 
        return (await res.json()) as T;
    } catch {
        return null;
    }
}

async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const url = `${API_CONFIG.BASE_URL}${input}`;
    return fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
        ...init,
    });
}

/** Stocke le provider/return_url pour le handoff web -> mobile */
export function startOAuth(provider: 'github' | 'google' | 'microsoft', returnUrl = '/(tabs)') {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('oauth_provider', provider);
            window.localStorage.setItem('oauth_return_url', returnUrl);
            window.localStorage.removeItem('oauth_link_mode'); // par défaut auth, pas link
        }
    } catch { /* ignore */ }
}

/** Login (email / mdp) */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
        const response = await mockLogin(credentials, { delay: MOCK_DELAY });
        if (response.user) await saveUserData(JSON.stringify(response.user));
        return response;
    }

    const response = await apiFetch(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = (await safeJson<{ message?: string }>(response)) || {};
        throw new Error(error.message || 'Login failed');
    }

    const data = (await safeJson<AuthResponse>(response)) || { message: 'OK', user: null };
    if (data.user) await saveUserData(JSON.stringify(data.user));
    return data;
}

/**
 * Register
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
        const response = await mockRegister(data, { delay: MOCK_DELAY });
        if (response.user) await saveUserData(JSON.stringify(response.user));
        return response;
    }

    const response = await apiFetch(API_CONFIG.ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = (await safeJson<{ message?: string }>(response)) || {};
        throw new Error(error.message || 'Registration failed');
    }

    const responseData = (await safeJson<AuthResponse>(response)) || { message: 'OK', user: null };
    if (responseData.user) await saveUserData(JSON.stringify(responseData.user));
    return responseData;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
    if (USE_MOCK) {
        await mockLogout({ delay: MOCK_DELAY / 2 });
        await clearAuthData();
        return;
    }

    try {
        await apiFetch(API_CONFIG.ENDPOINTS.LOGOUT, { method: 'POST' });
    } catch (e) {
        console.error('Logout error:', e);
    } finally {
        await clearAuthData();
    }
}

/** Current user (via /api/auth/me) */
export async function getCurrentUser(): Promise<User | null> {
    if (USE_MOCK) return mockGetCurrentUser({ delay: MOCK_DELAY / 2 });

    try {
        const response = await apiFetch(API_CONFIG.ENDPOINTS.ME, { method: 'GET' });
        if (!response.ok) return null;

        // Backend returns { message, user }
        const data = await safeJson<AuthResponse | User>(response);
        let user: User | null = null;

        if (data && typeof data === 'object' && 'message' in (data as any)) {
            user = (data as AuthResponse).user;
        } else {
            user = (data as User) || null;
        }

        if (user) await saveUserData(JSON.stringify(user));
        return user;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

/**
 * Forgot Password - Send reset link to email
 */
export async function forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
        await new Promise(res => setTimeout(res, MOCK_DELAY));
        const exists = MOCK_USERS_DB.some(u => u.email === email);
        if (!exists) throw new Error('Email not found');
        return;
    }
    throw new Error('Forgot password is not supported by the current backend.');
}

/** Google OAuth */
export async function loginWithGoogle(): Promise<AuthResponse> {
    if (USE_MOCK) {
        const user = MOCK_USERS_DB[0]?.user || null;
        if (user) await saveUserData(JSON.stringify(user));
        return { message: 'Mock Google OAuth successful', user };
    }

    try { WebBrowser.maybeCompleteAuthSession(); } catch { }
    startOAuth('google', '/(tabs)');

    const redirectUri = Linking.createURL('oauthredirect');
    const authorizeUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.OAUTH.GOOGLE_AUTHORIZE}`;

    const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri);
    if (result.type !== 'success' || !result.url) {
        if (result.type === 'cancel' || result.type === 'dismiss') throw new Error('Google login cancelled');
        throw new Error('Google login failed');
    }

    const parsed = Linking.parse(result.url);
    const code = (parsed as any)?.queryParams?.code as string | undefined;
    if (!code) {
        const err = (parsed as any)?.queryParams?.error || 'Missing authorization code';
        throw new Error(`Google login error: ${err}`);
    }

    const exchange = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.OAUTH.GOOGLE_EXCHANGE}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ code }) }
    );
    if (!exchange.ok) {
        const err = (await safeJson<{ message?: string }>(exchange)) || {};
        throw new Error(err.message || 'Failed to exchange authorization code');
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Failed to retrieve user after Google login');
    await saveUserData(JSON.stringify(currentUser));
    return { message: 'Login successful', user: currentUser };
}

/** GitHub OAuth */
export async function loginWithGithub(): Promise<AuthResponse> {
    if (USE_MOCK) {
        const user = MOCK_USERS_DB[0]?.user || null;
        if (user) await saveUserData(JSON.stringify(user));
        return { message: 'Mock GitHub OAuth successful', user };
    }

    try { WebBrowser.maybeCompleteAuthSession(); } catch { }
    startOAuth('github', '/(tabs)');

    const redirectUri = Linking.createURL('oauthredirect');
    const authorizeUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.OAUTH.GITHUB_AUTHORIZE}`;

    const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri);
    if (result.type !== 'success' || !result.url) {
        if (result.type === 'cancel' || result.type === 'dismiss') throw new Error('GitHub login cancelled');
        throw new Error('GitHub login failed');
    }

    const parsed = Linking.parse(result.url);
    const code = (parsed as any)?.queryParams?.code as string | undefined;
    if (!code) {
        const err = (parsed as any)?.queryParams?.error || 'Missing authorization code';
        throw new Error(`GitHub login error: ${err}`);
    }

    const exchange = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.OAUTH.GITHUB_EXCHANGE}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ code }) }
    );
    if (!exchange.ok) {
        const err = (await safeJson<{ message?: string }>(exchange)) || {};
        throw new Error(err.message || 'Failed to exchange authorization code');
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Failed to retrieve user after GitHub login');
    await saveUserData(JSON.stringify(currentUser));
    return { message: 'Login successful', user: currentUser };
}

/** Expose config utile au debug */
export const authConfig = {
    useMock: USE_MOCK,
    mockDelay: MOCK_DELAY,
    apiBaseUrl: API_CONFIG.BASE_URL,
};
