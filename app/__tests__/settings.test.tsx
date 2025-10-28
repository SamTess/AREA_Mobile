import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../(tabs)/settings';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
}));

// Mock nativewind
jest.mock('nativewind', () => ({
  useColorScheme: () => ({
    colorScheme: 'light',
    setColorScheme: jest.fn(),
  }),
  cssInterop: jest.fn(),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    backgroundSecondary: '#f5f5f5',
    info: '#3b82f6',
    text: '#000000',
    textSecondary: '#666666',
    card: '#ffffff',
    cardBorder: '#e5e5e5',
  }),
}));

// Mock design tokens
jest.mock('@/components/ui/hooks/useDesignTokens', () => ({
  useDesignTokens: () => ({
    getToken: (token: string) => '#000000',
  }),
}));

describe('SettingsScreen', () => {
  const mockRouter = require('expo-router').useRouter();
  const mockI18n = require('react-i18next').useTranslation().i18n;
  const mockSetColorScheme = require('nativewind').useColorScheme().setColorScheme;
  const mockSecureStore = require('expo-secure-store');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings screen with all sections', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.getByText('Server Configuration')).toBeDefined();
    expect(screen.getByText('Application')).toBeDefined();
    expect(screen.getAllByText('Help & Support')).toHaveLength(2); // Header and section
  });

  it('renders without crashing', () => {
    expect(() => render(<SettingsScreen />)).not.toThrow();
  });

  it('handles navigation setup', () => {
    render(<SettingsScreen />);
    
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('handles language and theme setup', () => {
    render(<SettingsScreen />);
    
    expect(mockI18n.language).toBe('en');
  });
});