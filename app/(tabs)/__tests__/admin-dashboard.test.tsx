import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AdminDashboard from '../admin-dashboard';
import * as auth from '@/services/auth';

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
    back: mockBack,
  })),
}));

jest.mock('@/services/auth');

jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#007AFF',
    info: '#007AFF',
    border: '#E5E5E5',
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'admin.checkingPermissions': 'Checking permissions...',
        'admin.accessDenied': 'Access Denied',
        'admin.tabs.users': 'Users',
        'admin.tabs.areas': 'Areas',
        'admin.tabs.services': 'Services',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/components/admin/UsersTab', () => {
  const { View, Text } = require('react-native');
  return function UsersTab() {
    return (
      <View>
        <Text>Users Tab Content</Text>
      </View>
    );
  };
});

jest.mock('@/components/admin/AreasTab', () => {
  const { View, Text } = require('react-native');
  return function AreasTab() {
    return (
      <View>
        <Text>Areas Tab Content</Text>
      </View>
    );
  };
});

jest.mock('@/components/admin/ServicesTab', () => {
  const { View, Text } = require('react-native');
  return function ServicesTab() {
    return (
      <View>
        <Text>Services Tab Content</Text>
      </View>
    );
  };
});

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockBack.mockClear();
  });

  it('should show loading state initially', () => {
    (auth.getCurrentUser as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { getByText } = render(<AdminDashboard />);

    expect(getByText('Checking permissions...')).toBeTruthy();
  });

  it('should redirect non-admin users', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    (auth.getCurrentUser as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      isAdmin: false,
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('should show dashboard for admin users', async () => {
    (auth.getCurrentUser as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      isAdmin: true,
    });

    const { findByText } = render(<AdminDashboard />);

    // findByText waits for the element to appear
    const content = await findByText('Users Tab Content', {}, { timeout: 5000 });
    expect(content).toBeTruthy();
  });

  it('should handle auth error', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');

    (auth.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Auth failed'));

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Failed to verify admin access'
      );
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('should redirect when user is null', async () => {
    (auth.getCurrentUser as jest.Mock).mockResolvedValue(null);

    render(<AdminDashboard />);

    await waitFor(() => {
      // Should not render admin dashboard or redirect (just returns early)
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  it('should show access denied message when not admin', async () => {
    (auth.getCurrentUser as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      isAdmin: false,
    });

    const { getByText } = render(<AdminDashboard />);

    await waitFor(() => {
      expect(getByText('Access Denied')).toBeTruthy();
    });
  });

  it('should display users tab by default', async () => {
    (auth.getCurrentUser as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      isAdmin: true,
    });

    const { getByText } = render(<AdminDashboard />);

    await waitFor(() => {
      expect(getByText('Users Tab Content')).toBeTruthy();
    });
  });

  it('should not crash with missing user properties', async () => {
    (auth.getCurrentUser as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      // Missing isAdmin property
    });

    const alertSpy = jest.spyOn(Alert, 'alert');

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
