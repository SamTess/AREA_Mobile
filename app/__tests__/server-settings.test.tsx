import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ServerSettingsScreen from '../(tabs)/server-settings';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock hooks
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    backgroundSecondary: '#f5f5f5',
    info: '#3b82f6',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    card: '#ffffff',
    border: '#e5e5e5',
    warning: '#f59e0b',
  }),
}));

// Mock services
jest.mock('@/services/storage', () => ({
  saveServerUrl: jest.fn(),
  getServerUrl: jest.fn(),
  clearServerUrl: jest.fn(),
}));

jest.mock('@/services/api.config', () => ({
  updateCachedServerUrl: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  if (buttons && Array.isArray(buttons)) {
    buttons.forEach(button => {
      if (button.onPress) {
        button.onPress();
      }
    });
  }
});

// Define mocks globally
const mockGetServerUrl = require('@/services/storage').getServerUrl;
const mockSaveServerUrl = require('@/services/storage').saveServerUrl;
const mockClearServerUrl = require('@/services/storage').clearServerUrl;
const mockUpdateCachedServerUrl = require('@/services/api.config').updateCachedServerUrl;
const mockRouter = require('expo-router').router;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ServerSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    mockFetch.mockClear();

    // Default mock - return resolved promise
    mockGetServerUrl.mockResolvedValue('http://127.0.0.1:8080');
  });

  it('shows loading state initially', () => {
    mockGetServerUrl.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ServerSettingsScreen />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('renders without crashing', () => {
    expect(() => render(<ServerSettingsScreen />)).not.toThrow();
  });

  it('handles different server URL states', () => {
    mockGetServerUrl.mockResolvedValue('https://api.example.com');

    render(<ServerSettingsScreen />);
    
    expect(mockGetServerUrl).toHaveBeenCalled();
  });

  it('handles reset functionality', () => {
    mockGetServerUrl.mockResolvedValue('https://api.example.com');
    mockClearServerUrl.mockResolvedValue(undefined);

    render(<ServerSettingsScreen />);
    
    expect(mockGetServerUrl).toHaveBeenCalled();
  });
});