import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import {
    MOCK_USERS_DB,
    mockGetCurrentUser,
    mockLogin,
    mockLogout,
    mockRefreshToken,
    mockRegister,
} from './__mocks__/auth.mock';
import { API_CONFIG, ENV } from './api.config';
import { clearAuthData, saveAccessToken, saveRefreshToken, saveUserData } from './storage';

/**
 * Mock mode configuration
 * Set EXPO_PUBLIC_USE_MOCK=false in .env to use real backend
 */
const USE_MOCK = ENV.USE_MOCK;
const MOCK_DELAY = ENV.MOCK_DELAY;

/**
 * Login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
        const response = await mockLogin(credentials, { delay: MOCK_DELAY });
        
        await saveAccessToken(response.tokens.accessToken);
        await saveRefreshToken(response.tokens.refreshToken);
        await saveUserData(JSON.stringify(response.user));
        
        return response;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data: AuthResponse = await response.json();

        await saveAccessToken(data.tokens.accessToken);
        await saveRefreshToken(data.tokens.refreshToken);
        await saveUserData(JSON.stringify(data.user));

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Register
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
        const response = await mockRegister(data, { delay: MOCK_DELAY });

        await saveAccessToken(response.tokens.accessToken);
        await saveRefreshToken(response.tokens.refreshToken);
        await saveUserData(JSON.stringify(response.user));
        
        return response;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const responseData: AuthResponse = await response.json();

        await saveAccessToken(responseData.tokens.accessToken);
        await saveRefreshToken(responseData.tokens.refreshToken);
        await saveUserData(JSON.stringify(responseData.user));

        return responseData;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
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
        await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        await clearAuthData();
    }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
    if (USE_MOCK) {
        const { getAccessToken } = await import('./storage');
        const token = await getAccessToken();
        
        if (!token) {
            return null;
        }
        
        return mockGetCurrentUser(token, { delay: MOCK_DELAY / 2 });
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ME}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return null;
        }

        const user: User = await response.json();
        await saveUserData(JSON.stringify(user));
        
        return user;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    if (USE_MOCK) {
        const response = await mockRefreshToken(refreshToken, { delay: MOCK_DELAY / 2 });
        await saveAccessToken(response.accessToken);
        return response.accessToken;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        await saveAccessToken(data.accessToken);
        
        return data.accessToken;
    } catch (error) {
        console.error('Refresh token error:', error);
        return null;
    }
}

/**
 * Forgot Password - Send reset link to email
 */
export async function forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

        const userExists = MOCK_USERS_DB.some(user => user.email === email);
        
        if (!userExists) {
            throw new Error('Email not found');
        }
        
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send reset link');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
}

/**
 * Configuration to toggle mock mode and access mock users
 */
export const authConfig = {
    useMock: USE_MOCK,
    mockDelay: MOCK_DELAY,
    mockUsers: MOCK_USERS_DB,
    apiBaseUrl: API_CONFIG.BASE_URL,
};
