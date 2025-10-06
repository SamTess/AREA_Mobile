/**
 * Mock Authentication Service Tests
 * Tests for the mock authentication system
 */

import {
    MOCK_USERS_DB,
    MockAPIError,
    generateMockToken,
    mockGetCurrentUser,
    mockLogin,
    mockLogout,
    mockRefreshToken,
    mockRegister,
    resetMockUsers,
} from '../auth.mock';

describe('Mock Authentication Service', () => {
    beforeEach(() => {
        // Reset mock users before each test
        resetMockUsers();
    });

    describe('mockLogin', () => {
        it('should login successfully with valid credentials', async () => {
            const credentials = {
                email: 'user@example.com',
                password: 'password123',
            };

            const response = await mockLogin(credentials, { delay: 0 });

            expect(response.user.email).toBe('user@example.com');
            expect(response.user.name).toBe('John Doe');
            expect(response.tokens.accessToken).toBeDefined();
            expect(response.tokens.refreshToken).toBeDefined();
            expect(response.tokens.expiresIn).toBe(3600);
        });

        it('should throw error with invalid credentials', async () => {
            const credentials = {
                email: 'wrong@example.com',
                password: 'wrongpassword',
            };

            await expect(mockLogin(credentials, { delay: 0 })).rejects.toThrow(
                'Invalid email or password'
            );
        });

        it('should throw error with missing email', async () => {
            const credentials = {
                email: '',
                password: 'password123',
            };

            await expect(mockLogin(credentials, { delay: 0 })).rejects.toThrow(
                MockAPIError
            );
        });

        it('should throw error with missing password', async () => {
            const credentials = {
                email: 'user@example.com',
                password: '',
            };

            await expect(mockLogin(credentials, { delay: 0 })).rejects.toThrow(
                MockAPIError
            );
        });

        it('should work with all predefined users', async () => {
            for (const mockUser of MOCK_USERS_DB) {
                const response = await mockLogin(
                    {
                        email: mockUser.email,
                        password: mockUser.password,
                    },
                    { delay: 0 }
                );

                expect(response.user.email).toBe(mockUser.email);
                expect(response.user.name).toBe(mockUser.user.name);
            }
        });
    });

    describe('mockRegister', () => {
        it('should register a new user successfully', async () => {
            const data = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
            };

            const response = await mockRegister(data, { delay: 0 });

            expect(response.user.email).toBe('newuser@example.com');
            expect(response.user.name).toBe('New User');
            expect(response.tokens.accessToken).toBeDefined();
            expect(response.tokens.refreshToken).toBeDefined();
        });

        it('should throw error when email already exists', async () => {
            const data = {
                email: 'user@example.com', // Already exists
                password: 'password123',
                name: 'Test',
            };

            await expect(mockRegister(data, { delay: 0 })).rejects.toThrow(
                'Email already exists'
            );
        });

        it('should throw error with weak password', async () => {
            const data = {
                email: 'new@example.com',
                password: '123', // Too short
                name: 'Test',
            };

            await expect(mockRegister(data, { delay: 0 })).rejects.toThrow(
                'Password must be at least 6 characters'
            );
        });

        it('should throw error with missing email', async () => {
            const data = {
                email: '',
                password: 'password123',
                name: 'Test',
            };

            await expect(mockRegister(data, { delay: 0 })).rejects.toThrow(
                MockAPIError
            );
        });

        it('should use default name if not provided', async () => {
            const data = {
                email: 'noname@example.com',
                password: 'password123',
            };

            const response = await mockRegister(data, { delay: 0 });

            expect(response.user.name).toBe('New User');
        });

        it('should allow login with newly registered user', async () => {
            // Register
            const registerData = {
                email: 'newuser@example.com',
                password: 'password123',
                name: 'New User',
            };
            await mockRegister(registerData, { delay: 0 });

            // Login with the new user
            const loginResponse = await mockLogin(
                {
                    email: 'newuser@example.com',
                    password: 'password123',
                },
                { delay: 0 }
            );

            expect(loginResponse.user.email).toBe('newuser@example.com');
        });
    });

    describe('mockLogout', () => {
        it('should logout successfully', async () => {
            await expect(mockLogout({ delay: 0 })).resolves.toBeUndefined();
        });
    });

    describe('mockGetCurrentUser', () => {
        it('should get current user with valid token', async () => {
            const token = 'mock_access_token';
            const user = await mockGetCurrentUser(token, { delay: 0 });

            expect(user).toBeDefined();
            expect(user?.email).toBe('user@example.com');
        });

        it('should throw error with invalid token', async () => {
            const token = 'invalid_token';

            await expect(
                mockGetCurrentUser(token, { delay: 0 })
            ).rejects.toThrow('Invalid or expired token');
        });

        it('should throw error with empty token', async () => {
            const token = '';

            await expect(
                mockGetCurrentUser(token, { delay: 0 })
            ).rejects.toThrow(MockAPIError);
        });
    });

    describe('mockRefreshToken', () => {
        it('should refresh token successfully', async () => {
            const refreshToken = 'mock_refresh_old_token';
            const response = await mockRefreshToken(refreshToken, { delay: 0 });

            expect(response.accessToken).toBeDefined();
            expect(response.refreshToken).toBeDefined();
            expect(response.expiresIn).toBe(3600);
            expect(response.accessToken).toContain('mock_access_');
            expect(response.refreshToken).toContain('mock_refresh_');
        });

        it('should throw error with invalid refresh token', async () => {
            const refreshToken = 'invalid_token';

            await expect(
                mockRefreshToken(refreshToken, { delay: 0 })
            ).rejects.toThrow('Invalid refresh token');
        });

        it('should throw error with empty refresh token', async () => {
            const refreshToken = '';

            await expect(
                mockRefreshToken(refreshToken, { delay: 0 })
            ).rejects.toThrow(MockAPIError);
        });
    });

    describe('generateMockToken', () => {
        it('should generate unique tokens', () => {
            const token1 = generateMockToken('access');
            const token2 = generateMockToken('access');

            expect(token1).not.toBe(token2);
            expect(token1).toContain('mock_access_');
            expect(token2).toContain('mock_access_');
        });

        it('should generate different prefixes', () => {
            const accessToken = generateMockToken('access');
            const refreshToken = generateMockToken('refresh');

            expect(accessToken).toContain('mock_access_');
            expect(refreshToken).toContain('mock_refresh_');
        });
    });

    describe('resetMockUsers', () => {
        it('should reset registered users to original state', async () => {
            // Register a new user
            await mockRegister(
                {
                    email: 'temp@example.com',
                    password: 'password123',
                },
                { delay: 0 }
            );

            // Reset
            resetMockUsers();

            // Try to login with the new user (should fail)
            await expect(
                mockLogin(
                    {
                        email: 'temp@example.com',
                        password: 'password123',
                    },
                    { delay: 0 }
                )
            ).rejects.toThrow();

            // Original users should still work
            const response = await mockLogin(
                {
                    email: 'user@example.com',
                    password: 'password123',
                },
                { delay: 0 }
            );
            expect(response.user.email).toBe('user@example.com');
        });
    });

    describe('MockAPIError', () => {
        it('should create error with message and status code', () => {
            const error = new MockAPIError('Test error', 400, 'TEST_CODE');

            expect(error.message).toBe('Test error');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('TEST_CODE');
            expect(error.name).toBe('MockAPIError');
        });

        it('should use default status code', () => {
            const error = new MockAPIError('Test error');

            expect(error.statusCode).toBe(400);
        });
    });

    describe('MOCK_USERS_DB', () => {
        it('should have 3 predefined users', () => {
            expect(MOCK_USERS_DB).toHaveLength(3);
        });

        it('should have valid user structure', () => {
            MOCK_USERS_DB.forEach(mockUser => {
                expect(mockUser.email).toBeDefined();
                expect(mockUser.password).toBeDefined();
                expect(mockUser.user.id).toBeDefined();
                expect(mockUser.user.email).toBe(mockUser.email);
                expect(mockUser.user.name).toBeDefined();
                expect(mockUser.user.avatar).toBeDefined();
                expect(mockUser.user.createdAt).toBeDefined();
            });
        });
    });

    describe('Network delay simulation', () => {
        it('should respect custom delay for login', async () => {
            const startTime = Date.now();
            await mockLogin(
                {
                    email: 'user@example.com',
                    password: 'password123',
                },
                { delay: 100 }
            );
            const endTime = Date.now();

            expect(endTime - startTime).toBeGreaterThanOrEqual(100);
        });

        it('should work with zero delay', async () => {
            const startTime = Date.now();
            await mockLogin(
                {
                    email: 'user@example.com',
                    password: 'password123',
                },
                { delay: 0 }
            );
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(50);
        });
    });
});
