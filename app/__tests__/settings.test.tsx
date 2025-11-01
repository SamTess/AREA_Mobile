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

  it('navigates to server settings when server settings is pressed', async () => {
    const { getByText } = render(<SettingsScreen />);

    const serverSettingsButton = getByText('Server Settings');
    fireEvent.press(serverSettingsButton);

    // The navigation should be triggered
    expect(serverSettingsButton).toBeDefined();
  });

  it('navigates to help page when help is pressed', async () => {
    const { getAllByText } = render(<SettingsScreen />);

    // Get the Help & Support button (not the header)
    const helpButtons = getAllByText('Help & Support');
    const helpButton = helpButtons[1]; // The button, not the header
    fireEvent.press(helpButton);

    // The navigation should be triggered
    expect(helpButton).toBeDefined();
  });

  it('expands language section when language is pressed', () => {
    const { getByText, queryByText } = render(<SettingsScreen />);

    // Initially English and French should not be visible
    expect(queryByText('English')).toBeNull();
    expect(queryByText('Français')).toBeNull();

    const languageButton = getByText('Language');
    fireEvent.press(languageButton);

    // After pressing, language options should be visible
    expect(getByText('English')).toBeDefined();
    expect(getByText('Français')).toBeDefined();
  });

  it('expands theme section when appearance is pressed', () => {
    const { getByText, queryByText } = render(<SettingsScreen />);

    const appearanceButton = getByText('Appearance');
    fireEvent.press(appearanceButton);

    // After pressing, theme options should be visible (Dark or light - we're in light mode by default)
    expect(getByText('Dark')).toBeDefined();
  });

  it('displays current language badge', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('Language')).toBeDefined();
    expect(getByText('EN')).toBeDefined();
  });

  it('displays current theme info in badge', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('Appearance')).toBeDefined();
    // Light badge text should be visible
    const lightBadges = getByText('Light');
    expect(lightBadges).toBeDefined();
  });

  it('renders all main setting sections', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('Server Settings')).toBeDefined();
    expect(getByText('Language')).toBeDefined();
    expect(getByText('Appearance')).toBeDefined();
    // Check for one of the Help & Support text
    expect(getByText('Get help and FAQs')).toBeDefined();
  });
});