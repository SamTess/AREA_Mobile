import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import { clearAuthData, saveAccessToken, saveRefreshToken, saveUserData } from './storage';

/**
 * API configuration
 * TODO: Replace with your backend's real URL
 */
const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
    ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    TIMEOUT: 10000,
} as const;

/**
 * Mock mode enabled/disabled
 * TODO: Set to false when the backend is ready
 */
const USE_MOCK = true;

/**
 * Mock simulation delay (ms)
 */
const MOCK_DELAY = 1000;

/**
 * Mock users for testing
 */
const MOCK_USERS = [
    {
        email: 'user@example.com',
        password: 'password123',
        user: {
            id: '1',
            email: 'user@example.com',
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?img=1',
            createdAt: new Date().toISOString(),
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
            createdAt: new Date().toISOString(),
        },
    },
];

/**
 * Simulate a network delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate a mocked JWT token
 */
function generateMockToken(): string {
    return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mock login
 */
async function mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(MOCK_DELAY);

    const mockUser = MOCK_USERS.find(
        u => u.email === credentials.email && u.password === credentials.password
    );

    if (!mockUser) {
        throw new Error('Invalid credentials');
    }

    return {
        user: mockUser.user,
        tokens: {
            accessToken: generateMockToken(),
            refreshToken: generateMockToken(),
            expiresIn: 3600,
        },
    };
}

/**
 * Mock registration
 */
async function mockRegister(data: RegisterData): Promise<AuthResponse> {
    await delay(MOCK_DELAY);

    if (MOCK_USERS.some(u => u.email === data.email)) {
        throw new Error('Email already exists');
    }

    const newUser: User = {
        id: String(MOCK_USERS.length + 1),
        email: data.email,
        name: data.name || 'New User',
        avatar: `https://i.pravatar.cc/150?img=${MOCK_USERS.length + 1}`,
        createdAt: new Date().toISOString(),
    };

    return {
        user: newUser,
        tokens: {
            accessToken: generateMockToken(),
            refreshToken: generateMockToken(),
            expiresIn: 3600,
        },
    };
}

/**
 * Login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
        return mockLogin(credentials);
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
        return mockRegister(data);
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
        await delay(MOCK_DELAY / 2);
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
        await delay(MOCK_DELAY / 2);
        return MOCK_USERS[0].user;
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
        await delay(MOCK_DELAY / 2);
        const newToken = generateMockToken();
        await saveAccessToken(newToken);
        return newToken;
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
 * Configuration to toggle mock mode
 */
export const authConfig = {
    useMock: USE_MOCK,
    mockDelay: MOCK_DELAY,
    mockUsers: MOCK_USERS,
};
