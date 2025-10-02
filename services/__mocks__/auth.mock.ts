/**
 * Mock Authentication Service
 * This file contains mock data and functions for testing authentication
 * without a real backend. It simulates realistic API behavior.
 */

import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';

/**
 * Mock users database
 * These users can be used for testing login
 */
export const MOCK_USERS_DB = [
    {
        email: 'user@example.com',
        password: 'password123',
        user: {
            id: '1',
            email: 'user@example.com',
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?img=1',
            createdAt: '2024-01-01T00:00:00.000Z',
        },
    },
    {
        email: 'test@test.com',
        password: 'test123',
        user: {
            id: '2',
            email: 'test@test.com',
            name: 'Jane Smith',
            avatar: 'https://i.pravatar.cc/150?img=2',
            createdAt: '2024-01-02T00:00:00.000Z',
        },
    },
    {
        email: 'admin@example.com',
        password: 'admin123',
        user: {
            id: '3',
            email: 'admin@example.com',
            name: 'Admin User',
            avatar: 'https://i.pravatar.cc/150?img=3',
            createdAt: '2024-01-03T00:00:00.000Z',
        },
    },
];

/**
 * Registered users storage (for new registrations)
 */
let registeredUsers: typeof MOCK_USERS_DB = [...MOCK_USERS_DB];

/**
 * Reset registered users (useful for tests)
 */
export function resetMockUsers(): void {
    registeredUsers = [...MOCK_USERS_DB];
}

/**
 * Simulate network delay
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a mock JWT token
 */
export function generateMockToken(prefix = 'access'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `mock_${prefix}_${timestamp}_${random}`;
}

/**
 * Mock API Error
 */
export class MockAPIError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400,
        public code?: string
    ) {
        super(message);
        this.name = 'MockAPIError';
    }
}

/**
 * Mock login
 * Simulates API POST /auth/login
 */
export async function mockLogin(
    credentials: LoginCredentials,
    options: { delay: number } = { delay: 1000 }
): Promise<AuthResponse> {
    await delay(options.delay);

    // Validate input
    if (!credentials.email || !credentials.password) {
        throw new MockAPIError('Email and password are required', 400, 'MISSING_FIELDS');
    }

    // Find user
    const mockUser = registeredUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
    );

    if (!mockUser) {
        throw new MockAPIError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Return auth response
    return {
        user: mockUser.user,
        tokens: {
            accessToken: generateMockToken('access'),
            refreshToken: generateMockToken('refresh'),
            expiresIn: 3600, // 1 hour
        },
    };
}

/**
 * Mock registration
 * Simulates API POST /auth/register
 */
export async function mockRegister(
    data: RegisterData,
    options: { delay: number } = { delay: 1000 }
): Promise<AuthResponse> {
    await delay(options.delay);

    // Validate input
    if (!data.email || !data.password) {
        throw new MockAPIError('Email and password are required', 400, 'MISSING_FIELDS');
    }

    if (data.password.length < 6) {
        throw new MockAPIError('Password must be at least 6 characters', 400, 'WEAK_PASSWORD');
    }

    // Check if email already exists
    if (registeredUsers.some(u => u.email === data.email)) {
        throw new MockAPIError('Email already exists', 409, 'EMAIL_EXISTS');
    }

    // Create new user
    const newUser: User = {
        id: String(registeredUsers.length + 1),
        email: data.email,
        name: data.name || 'New User',
        avatar: `https://i.pravatar.cc/150?img=${registeredUsers.length + 1}`,
        createdAt: new Date().toISOString(),
    };

    // Add to registered users
    registeredUsers.push({
        email: data.email,
        password: data.password,
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name || 'New User',
            avatar: newUser.avatar || `https://i.pravatar.cc/150?img=${registeredUsers.length + 1}`,
            createdAt: newUser.createdAt,
        },
    });

    // Return auth response
    return {
        user: newUser,
        tokens: {
            accessToken: generateMockToken('access'),
            refreshToken: generateMockToken('refresh'),
            expiresIn: 3600,
        },
    };
}

/**
 * Mock logout
 * Simulates API POST /auth/logout
 */
export async function mockLogout(
    options: { delay: number } = { delay: 500 }
): Promise<void> {
    await delay(options.delay);
    // In real API, this would invalidate the token
    return;
}

/**
 * Mock get current user
 * Simulates API GET /auth/me
 */
export async function mockGetCurrentUser(
    token: string,
    options: { delay: number } = { delay: 500 }
): Promise<User | null> {
    await delay(options.delay);

    // Validate token
    if (!token || !token.startsWith('mock_access_')) {
        throw new MockAPIError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }

    // For mock, return first user
    return registeredUsers[0]?.user || null;
}

/**
 * Mock refresh token
 * Simulates API POST /auth/refresh
 */
export async function mockRefreshToken(
    refreshToken: string,
    options: { delay: number } = { delay: 500 }
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    await delay(options.delay);

    // Validate refresh token
    if (!refreshToken || !refreshToken.startsWith('mock_refresh_')) {
        throw new MockAPIError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Return new tokens
    return {
        accessToken: generateMockToken('access'),
        refreshToken: generateMockToken('refresh'),
        expiresIn: 3600,
    };
}

/**
 * Mock configuration
 */
export const mockConfig = {
    users: MOCK_USERS_DB,
    delay: {
        login: 1000,
        register: 1000,
        logout: 500,
        getCurrentUser: 500,
        refreshToken: 500,
    },
};
