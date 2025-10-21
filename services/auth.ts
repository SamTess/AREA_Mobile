import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import {
    MOCK_USERS_DB,
    mockGetCurrentUser,
    mockLogin,
    mockLogout,
    mockRegister,
} from './__mocks__/auth.mock';
import { API_CONFIG, ENV } from './api.config';
import { get, post } from './api';
import { clearAuthData, saveUserData } from './storage';

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
        if (response.user) {
            await saveUserData(JSON.stringify(response.user));
        }
        return response;
    }

    try {
        const data = await post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, credentials);
        if (data.user) {
            await saveUserData(JSON.stringify(data.user));
        }
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
        if (response.user) {
            await saveUserData(JSON.stringify(response.user));
        }
        return response;
    }

    try {
        const responseData = await post<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, data);
        if (responseData.user) {
            await saveUserData(JSON.stringify(responseData.user));
        }
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
        await post<void>(API_CONFIG.ENDPOINTS.LOGOUT);
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
        return mockGetCurrentUser({ delay: MOCK_DELAY / 2 });
    }

    try {
        // Backend returns { message, user }
        const data = await get<AuthResponse | User>(API_CONFIG.ENDPOINTS.ME);
        let user: User | null = null;
        if (data && 'message' in (data as any)) {
            user = (data as AuthResponse).user;
        } else {
            user = (data as User) || null;
        }
        if (user) {
            await saveUserData(JSON.stringify(user));
        }
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
        await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

        const userExists = MOCK_USERS_DB.some(user => user.email === email);

        if (!userExists) {
            throw new Error('Email not found');
        }

        return;
    }

    try {
        // Not supported by current backend per spec
        throw new Error('Forgot password is not supported by the current backend.');
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
