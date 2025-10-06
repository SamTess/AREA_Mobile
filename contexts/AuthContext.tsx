import * as authService from '@/services/auth';
import * as storage from '@/services/storage';
import * as userService from '@/services/user';
import { AuthTokens, User } from '@/types/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const isAuth = await storage.isAuthenticated();
      
      if (isAuth) {
        const userData = await storage.getUserData();
        const accessToken = await storage.getAccessToken();
        const refreshToken = await storage.getRefreshToken();

        if (userData && accessToken && refreshToken) {
          setUser(JSON.parse(userData));
          setTokens({
            accessToken,
            refreshToken,
            expiresIn: 3600, // TODO: Calculer depuis le token
          });
        }
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login({ email, password });

      setUser(response.user);
      setTokens(response.tokens);

      await storage.saveAccessToken(response.tokens.accessToken);
      await storage.saveRefreshToken(response.tokens.refreshToken);
      await storage.saveUserData(JSON.stringify(response.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register({ email, password, name });

      setUser(response.user);
      setTokens(response.tokens);

      await storage.saveAccessToken(response.tokens.accessToken);
      await storage.saveRefreshToken(response.tokens.refreshToken);
      await storage.saveUserData(JSON.stringify(response.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      setUser(null);
      setTokens(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user to update');
      }

      const updatedUser = await userService.updateProfileWithAvatar({
        ...user,
        ...userData,
      });

      setUser(updatedUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
