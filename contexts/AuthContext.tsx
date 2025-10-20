import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import {
  loginWithGithub as svcLoginGithub,
  loginWithGoogle as svcLoginGoogle,
  getCurrentUser,
  logout as svcLogout,
  User,
} from '../services/auth';
import { API_CONFIG, API_ENDPOINTS } from '../services/api.config';
import { saveUserData, getUserData, clearAuthData } from '../services/storage';

type AuthError = { message: string; code?: string } | null;

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError;
  login: (email: string, password: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

// Helpers
function buildUrl(path: string) {
  const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function parseErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message as string | undefined;
  } catch {
    return undefined;
  }
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError>(null);

  const loadUser = useCallback(async () => {
    const me = await getCurrentUser();
    if (me) {
      setUser(me);
      await saveUserData(JSON.stringify(me));
      return true;
    }
    return false;
  }, []);

  // Utilise la BASE_URL (fonctionne en RN/Expo)
  const tryRefresh = useCallback(async () => {
    try {
      const res = await fetch(buildUrl(API_ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bootstrap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ok = await loadUser();
      if (!ok) {
        const refreshed = await tryRefresh();
        if (refreshed) await loadUser();
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadUser, tryRefresh]);

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NEW: email/password login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(buildUrl(API_ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = (await parseErrorMessage(res)) || 'Invalid credentials';
        throw new Error(msg);
      }

      const me = await getCurrentUser();
      if (!me) throw new Error('Failed to load current user');

      setUser(me);
      await saveUserData(JSON.stringify(me));
    } catch (e: any) {
      setError({ message: e?.message || 'Login failed' });
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGithub = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await svcLoginGithub();
      setUser(res.user);
      await saveUserData(JSON.stringify(res.user));
    } catch (e: any) {
      setError({ message: e?.message || 'GitHub login failed' });
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await svcLoginGoogle();
      setUser(res.user);
      await saveUserData(JSON.stringify(res.user));
    } catch (e: any) {
      setError({ message: e?.message || 'Google login failed' });
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await svcLogout();
      setUser(null);
      await clearAuthData();
    } catch (e: any) {
      setError({ message: e?.message || 'Logout failed' });
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,                // <<— exposé au screen
      loginWithGithub,
      loginWithGoogle,
      logout,
      clearError,
      refreshAuth: bootstrap,
    }),
    [user, isLoading, error, login, loginWithGithub, loginWithGoogle, logout, clearError, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
