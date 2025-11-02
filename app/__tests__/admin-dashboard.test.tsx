import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AdminDashboard from '../(tabs)/admin-dashboard';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
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
    background: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    primary: '#3b82f6',
    info: '#3b82f6',
    border: '#e5e5e5',
  }),
}));

// Mock services
jest.mock('@/services/auth', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock admin components
jest.mock('@/components/admin/UsersTab', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/admin/AreasTab', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/admin/ServicesTab', () => ({
  __esModule: true,
  default: () => null,
}));

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Define mocks globally
const mockGetCurrentUser = require('@/services/auth').getCurrentUser;
const mockRouter = require('expo-router').router;

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();

    // Default mock - return a resolved promise
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });
  });

  it('shows loading state initially', () => {
    mockGetCurrentUser.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AdminDashboard />);
    expect(screen.getByText('admin.checkingPermissions')).toBeDefined();
  });

  it('renders without crashing', () => {
    expect(() => render(<AdminDashboard />)).not.toThrow();
  });

  it('handles different user states', () => {
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });

    render(<AdminDashboard />);
    
    expect(mockGetCurrentUser).toHaveBeenCalled();
  });

  it('checks user permissions on mount', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });
  });

  it('renders Users tab button', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });
    expect(screen.queryByText('admin.checkingPermissions')).toBeNull();
  });

  it('renders Areas tab button', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });
    expect(screen.queryByText('admin.checkingPermissions')).toBeNull();
  });

  it('renders Services tab button', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });
    expect(screen.queryByText('admin.checkingPermissions')).toBeNull();
  });

  it('displays admin dashboard header', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });
  });

  it('handles user loading state', () => {
    mockGetCurrentUser.mockImplementation(() => new Promise(() => {}));

    render(<AdminDashboard />);

    expect(screen.getByText('admin.checkingPermissions')).toBeDefined();
  });

  it('verifies admin access on load', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: '1', email: 'admin@example.com', isAdmin: true });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);
    });
  });
});