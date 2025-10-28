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

  it('handles reset functionality', async () => {
    mockGetServerUrl.mockResolvedValue('https://api.example.com');
    mockClearServerUrl.mockResolvedValue(undefined);

    const { getByText } = render(<ServerSettingsScreen />);
    
    await waitFor(() => {
      expect(mockGetServerUrl).toHaveBeenCalled();
    });

    // Find and press reset button
    const resetButton = getByText('Reset to Default');
    fireEvent.press(resetButton);

    // Alert should be shown
    expect(mockAlert).toHaveBeenCalled();
  });

  it('validates empty URL and shows error alert', async () => {
    render(<ServerSettingsScreen />);

    const input = await screen.findByTestId('server-url-input');
    const saveBtn = await screen.findByTestId('save-button');

    fireEvent.changeText(input, '   ');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Server URL is required'
      );
    });

    expect(mockSaveServerUrl).not.toHaveBeenCalled();
  });

  it('validates invalid URL and shows error alert', async () => {
    render(<ServerSettingsScreen />);

    const input = await screen.findByTestId('server-url-input');
    const saveBtn = await screen.findByTestId('save-button');

    fireEvent.changeText(input, 'not-a-valid-url');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Please enter a valid URL (http:// or https://)'
      );
    });

    expect(mockSaveServerUrl).not.toHaveBeenCalled();
  });

  it('shows alert when health check fails (non-OK)', async () => {
    mockFetch.mockResolvedValue({ ok: false } as any);

    render(<ServerSettingsScreen />);

    const input = await screen.findByTestId('server-url-input');
    const saveBtn = await screen.findByTestId('save-button');

    fireEvent.changeText(input, 'http://example.com');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Server health check failed. Please verify the URL.'
      );
    });

    expect(mockSaveServerUrl).not.toHaveBeenCalled();
  });

  it('shows alert when health check throws', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));

    render(<ServerSettingsScreen />);

    const input = await screen.findByTestId('server-url-input');
    const saveBtn = await screen.findByTestId('save-button');

    fireEvent.changeText(input, 'http://example.com');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Server health check failed. Please verify the URL.'
      );
    });

    expect(mockSaveServerUrl).not.toHaveBeenCalled();
  });

  it('saves URL successfully, updates cache and navigates back', async () => {
    mockFetch.mockResolvedValue({ ok: true } as any);
    mockSaveServerUrl.mockResolvedValue(undefined);

    render(<ServerSettingsScreen />);

    const input = await screen.findByTestId('server-url-input');
    const saveBtn = await screen.findByTestId('save-button');

    const url = 'https://api.example.com';
    fireEvent.changeText(input, url);
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockSaveServerUrl).toHaveBeenCalledWith(url);
      expect(mockUpdateCachedServerUrl).toHaveBeenCalledWith(url);
      // Success alert displayed
      expect(mockAlert).toHaveBeenCalledWith(
        'Success',
        'Server URL saved successfully. Please restart the app for changes to take effect.',
        expect.any(Array)
      );
      // onPress of OK should have been called by our alert mock
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('shows error alert if saving URL fails', async () => {
    mockFetch.mockResolvedValue({ ok: true } as any);
    mockSaveServerUrl.mockRejectedValue(new Error('save failed'));

    render(<ServerSettingsScreen />);

    const input = await screen.findByTestId('server-url-input');
    const saveBtn = await screen.findByTestId('save-button');

    fireEvent.changeText(input, 'http://example.com');
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Error',
        'Failed to save server URL'
      );
    });
  });

  it('confirms reset to default and clears stored URL', async () => {
    mockClearServerUrl.mockResolvedValue(undefined);

    render(<ServerSettingsScreen />);

    const reset = await screen.findByText('Reset to Default');
    fireEvent.press(reset);

    await waitFor(() => {
      expect(mockClearServerUrl).toHaveBeenCalled();
      expect(mockUpdateCachedServerUrl).toHaveBeenCalledWith(null);
    });

    // The default URL should be displayed in the "Current Server URL" section
    await waitFor(() => {
      expect(screen.getByText('http://127.0.0.1:8080')).toBeDefined();
    });
  });

  it('loads and displays server URL from storage', async () => {
    mockGetServerUrl.mockResolvedValue('https://custom.server.com');

    render(<ServerSettingsScreen />);

    await waitFor(() => {
      expect(mockGetServerUrl).toHaveBeenCalled();
    });
  });

  it('uses default URL when storage is empty', async () => {
    mockGetServerUrl.mockResolvedValue(null);

    render(<ServerSettingsScreen />);

    await waitFor(() => {
      expect(mockGetServerUrl).toHaveBeenCalled();
    });
  });

  it('handles error loading server URL', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetServerUrl.mockRejectedValue(new Error('Load failed'));

    render(<ServerSettingsScreen />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to load server URL:', expect.any(Error));
    });

    consoleError.mockRestore();
  });
});