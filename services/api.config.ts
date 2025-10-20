import { Platform } from 'react-native';
/**
 * API Configuration
 * Centralized configuration for backend API
 */

/**
 * Environment variables
 */
export const ENV = {
    // Use Android emulator loopback by default; override via EXPO_PUBLIC_API_URL
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080',
    // Optional iOS specific API URL for testing on iPhone/simulator (use your machine LAN IP)
    API_URL_IOS: process.env.EXPO_PUBLIC_API_URL_IOS,
    USE_MOCK: process.env.EXPO_PUBLIC_USE_MOCK !== 'false', // Default to true for development
    MOCK_DELAY: parseInt(process.env.EXPO_PUBLIC_MOCK_DELAY || '1000', 10),
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    // OAuth
    OAUTH: {
        GOOGLE_AUTHORIZE: '/api/oauth/google/authorize',
        GOOGLE_EXCHANGE: '/api/oauth/google/exchange',
        GITHUB_AUTHORIZE: '/api/oauth/github/authorize',
        GITHUB_EXCHANGE: '/api/oauth/github/exchange',
    },
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
    BASE_URL: Platform.OS === 'ios' ? (ENV.API_URL_IOS || ENV.API_URL) : ENV.API_URL,
    ENDPOINTS: API_ENDPOINTS,
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
    },
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
} as const;

/**
 * API Response status codes
 */
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'Unauthorized. Please login again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN: 'An unknown error occurred.',
} as const;
