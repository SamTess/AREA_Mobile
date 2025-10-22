import { OAuthProvider, getCurrentUser as svcGetCurrentUser, loginWithOAuth as svcLoginWithOAuth, logout as svcLogout } from '@/services/auth';
import { User } from '@/types/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_CONFIG, API_ENDPOINTS } from '../services/api.config';
import { clearAuthData, getUserData, saveUserData } from '../services/storage';
import { updateProfile } from '../services/user';

type AuthError = { message: string; code?: string } | null;

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  updateUser: (payload: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

function buildUrl(path: string) {
  const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
  const final = path.startsWith('/') ? path : `/${path}`;
  return `${base}${final}`;
}

function normaliseError(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err;
  return fallback;
}

async function readJsonMessage(res: Response): Promise<string | undefined> {
  try {
    const data = await res.json();
    return (data as any)?.message;
  } catch {
    return undefined;
  }
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError>(null);

  const hydrateFromStorage = useCallback(async () => {
    const stored = await getUserData();
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
    } catch (err) {
    }
  }, []);

  const fetchRemoteUser = useCallback(async () => {
    const me = await svcGetCurrentUser();
    if (me) {
      setUser(me);
      await saveUserData(JSON.stringify(me));
    } else {
      setUser(null);
    }
    return me;
  }, []);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchRemoteUser();
    } finally {
      setIsLoading(false);
    }
  }, [fetchRemoteUser]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      await hydrateFromStorage();
      if (mounted) {
        try {
          await fetchRemoteUser();
        } finally {
          if (mounted) setIsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fetchRemoteUser, hydrateFromStorage]);

  const loginWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: authenticatedUser } = await svcLoginWithOAuth(provider);
      setUser(authenticatedUser);
      await saveUserData(JSON.stringify(authenticatedUser));
    } catch (err) {
      const fallbackUser = await svcGetCurrentUser();
      if (fallbackUser) {
        setUser(fallbackUser);
        await saveUserData(JSON.stringify(fallbackUser));
        setError(null);
        return;
      }
      const message = normaliseError(err, `${provider} login failed`);
      setError({ message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGithub = useCallback(() => loginWithOAuth('github'), [loginWithOAuth]);
  const loginWithGoogle = useCallback(() => loginWithOAuth('google'), [loginWithOAuth]);
  const loginWithMicrosoft = useCallback(() => loginWithOAuth('microsoft'), [loginWithOAuth]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await svcLogout();
      setUser(null);
      await clearAuthData();
    } catch (err) {
      const message = normaliseError(err, 'Logout failed');
      setError({ message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.REGISTER), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const msg = (await readJsonMessage(response)) || 'Registration failed';
        throw new Error(msg);
      }

      await fetchRemoteUser();
    } catch (err) {
      const message = normaliseError(err, 'Registration failed');
      setError({ message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRemoteUser]);

  const updateUser = useCallback(async (payload: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user?.id) throw new Error('No authenticated user');
      const updated = await updateProfile({ ...payload, id: payload.id ?? user.id });
      setUser(updated);
      await saveUserData(JSON.stringify(updated));
    } catch (err) {
      const message = normaliseError(err, 'Profile update failed');
      setError({ message });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      loginWithOAuth,
      loginWithGithub,
      loginWithGoogle,
      loginWithMicrosoft,
      logout,
      clearError,
      refreshAuth,
      register,
      updateUser,
    }),
    [user, isLoading, error, loginWithOAuth, loginWithGithub, loginWithGoogle, loginWithMicrosoft, logout, clearError, refreshAuth, register, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
