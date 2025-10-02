/**
 * API Configuration
 * Centralized configuration for backend API
 */

/**
 * Environment variables
 */
export const ENV = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
    USE_MOCK: process.env.EXPO_PUBLIC_USE_MOCK !== 'false', // Default to true for development
    MOCK_DELAY: parseInt(process.env.EXPO_PUBLIC_MOCK_DELAY || '1000', 10),
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    
    // User
    USER_PROFILE: '/user/profile',
    USER_UPDATE: '/user/update',
    USER_DELETE: '/user/delete',
    
    // TODO: Add more endpoints as needed
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
    BASE_URL: ENV.API_URL,
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
