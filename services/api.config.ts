import { Platform } from 'react-native';

/**
 * API & OAuth endpoints
 * - Cookies HttpOnly côté backend, donc withCredentials/credentials: 'include'
 */

export const ENV = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080'),
    API_URL_IOS: process.env.EXPO_PUBLIC_API_URL_IOS,
    USE_MOCK: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
    MOCK_DELAY: parseInt(process.env.EXPO_PUBLIC_MOCK_DELAY || '500', 10),
    WEB_BASE_URL: process.env.EXPO_PUBLIC_WEB_BASE_URL || 'http://localhost:3000',
};

export const API_CONFIG = {
    BASE_URL: Platform.OS === 'ios' && ENV.API_URL_IOS ? ENV.API_URL_IOS : ENV.API_URL,
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
        ME: '/api/auth/me',
        STATUS: '/api/auth/status',
    },
    OAUTH: {
        GOOGLE_AUTHORIZE: '/api/oauth/google/authorize',
        GOOGLE_EXCHANGE: '/api/oauth/google/exchange',
        GITHUB_AUTHORIZE: '/api/oauth/github/authorize',
        GITHUB_EXCHANGE: '/api/oauth/github/exchange',
    },
} as const;

export const HTTP_STATUS = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    INTERNAL: 500,
} as const;

export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'Unauthorized. Please login again.',
    SERVER: 'Server error. Please try again later.',
    UNKNOWN: 'An unknown error occurred.',
} as const;
