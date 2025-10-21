/**
 * AuthContext OAuth Integration Tests
 * Tests for AuthContext OAuth methods using mock services
 */

// Mock the auth service before importing modules that use it
jest.mock('../../services/auth', () => ({
  loginWithOAuth: jest.fn(),
  completeOAuthRedirect: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('@/services/auth', () => ({
  loginWithOAuth: jest.fn(),
  completeOAuthRedirect: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
}));

// Mock storage
jest.mock('@/services/storage', () => ({
  getUserData: jest.fn(),
  saveUserData: jest.fn(),
  clearUserData: jest.fn(),
  clearAuthData: jest.fn(),
}));

import * as authService from '@/services/auth';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';

describe('AuthContext OAuth Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default getCurrentUser to avoid real network calls during mount
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
  });

  describe('loginWithOAuth', () => {
    it('should successfully login with GitHub', async () => {
      const mockUser = {
        id: '1',
        email: 'user@github.com',
        name: 'GitHub User',
        createdAt: new Date().toISOString(),
      };

  (authService.loginWithOAuth as jest.Mock).mockResolvedValue({ message: 'OK', user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Ensure initial fetch/hydration completes to avoid race with login
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.loginWithOAuth('github');
      });

    // (diagnostics removed)

  expect(authService.loginWithOAuth).toHaveBeenCalledWith('github');
  await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  expect(result.current.user?.email).toBe('user@github.com');
    });

    it('should successfully login with Google', async () => {
      const mockUser = {
        id: '2',
        email: 'user@google.com',
        name: 'Google User',
        createdAt: new Date().toISOString(),
      };

  (authService.loginWithOAuth as jest.Mock).mockResolvedValue({ message: 'OK', user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.loginWithGoogle?.();
      });

    // (diagnostics removed)

  expect(authService.loginWithOAuth).toHaveBeenCalledWith('google');
  await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  expect(result.current.user?.email).toBe('user@google.com');
    });

    it('should successfully login with Microsoft', async () => {
      const mockUser = {
        id: '3',
        email: 'user@microsoft.com',
        name: 'Microsoft User',
        createdAt: new Date().toISOString(),
      };

  (authService.loginWithOAuth as jest.Mock).mockResolvedValue({ message: 'OK', user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.loginWithMicrosoft?.();
      });

    // (diagnostics removed)

  expect(authService.loginWithOAuth).toHaveBeenCalledWith('microsoft');
  await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
  expect(result.current.user?.email).toBe('user@microsoft.com');
    });

    it('should handle OAuth login failure', async () => {
      (authService.loginWithOAuth as jest.Mock).mockRejectedValue(
        new Error('OAuth failed')
      );
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.loginWithGithub?.();
        });
      }).rejects.toThrow('OAuth failed');

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should fallback to getCurrentUser on error', async () => {
      const mockUser = {
        id: '4',
        email: 'fallback@example.com',
        name: 'Fallback User',
        createdAt: new Date().toISOString(),
      };

      (authService.loginWithOAuth as jest.Mock).mockRejectedValue(
        new Error('Exchange failed')
      );
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.loginWithGithub?.();
      });

      // Should succeed via fallback
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('fallback@example.com');
    });
  });

  describe('loginWithGithub wrapper', () => {
    it('should call loginWithOAuth with github provider', async () => {
      const mockUser = {
        id: '1',
        email: 'github@example.com',
        name: 'GitHub User',
        createdAt: new Date().toISOString(),
      };

  (authService.loginWithOAuth as jest.Mock).mockResolvedValue({ message: 'OK', user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.loginWithGithub?.();
      });

      expect(authService.loginWithOAuth).toHaveBeenCalledWith('github');
    });
  });

  describe('loginWithGoogle wrapper', () => {
    it('should call loginWithOAuth with google provider', async () => {
      const mockUser = {
        id: '2',
        email: 'google@example.com',
        name: 'Google User',
        createdAt: new Date().toISOString(),
      };

  (authService.loginWithOAuth as jest.Mock).mockResolvedValue({ message: 'OK', user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.loginWithGoogle?.();
      });

      expect(authService.loginWithOAuth).toHaveBeenCalledWith('google');
    });
  });

  describe('loginWithMicrosoft wrapper', () => {
    it('should call loginWithOAuth with microsoft provider', async () => {
      const mockUser = {
        id: '3',
        email: 'microsoft@example.com',
        name: 'Microsoft User',
        createdAt: new Date().toISOString(),
      };

  (authService.loginWithOAuth as jest.Mock).mockResolvedValue({ message: 'OK', user: mockUser });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.loginWithMicrosoft?.();
      });

      expect(authService.loginWithOAuth).toHaveBeenCalledWith('microsoft');
    });
  });

  describe('logout', () => {
    it('should successfully logout after OAuth login', async () => {
      const mockUser = {
        id: '1',
        email: 'user@github.com',
        name: 'GitHub User',
        createdAt: new Date().toISOString(),
      };

  (authService.loginWithOAuth as jest.Mock).mockResolvedValue({ message: 'OK', user: mockUser });
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for initial hydration
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Login first
      await act(async () => {
        await result.current.loginWithGithub?.();
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});
