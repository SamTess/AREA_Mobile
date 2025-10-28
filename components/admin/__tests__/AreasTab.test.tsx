import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AreasTab from '../AreasTab';

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
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    card: '#ffffff',
    border: '#e5e5e5',
    isDark: false,
  }),
}));

// Mock services
jest.mock('@/services/admin', () => ({
  getAreas: jest.fn(),
  getAreaStats: jest.fn(),
  getAreaRuns: jest.fn(),
  deleteArea: jest.fn(),
  enableDisableArea: jest.fn(),
}));

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Define mocks globally
const mockGetAreas = require('@/services/admin').getAreas;
const mockGetAreaStats = require('@/services/admin').getAreaStats;
const mockGetAreaRuns = require('@/services/admin').getAreaRuns;
const mockDeleteArea = require('@/services/admin').deleteArea;
const mockEnableDisableArea = require('@/services/admin').enableDisableArea;

describe('AreasTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();

    // Default mocks - return resolved promises immediately
    mockGetAreas.mockResolvedValue([]);
    mockGetAreaStats.mockResolvedValue([]);
    mockGetAreaRuns.mockResolvedValue([]);
  });

  it('shows loading state initially', async () => {
    // Make one mock never resolve to keep loading state
    mockGetAreas.mockImplementation(() => new Promise(() => {}));
    mockGetAreaStats.mockResolvedValue([]);
    mockGetAreaRuns.mockResolvedValue([]);

    render(<AreasTab />);

    // Should show loading initially
    await waitFor(() => {
      expect(screen.getByTestId('activity-indicator')).toBeDefined();
    });
  });

  it('renders without crashing', async () => {
    expect(() => render(<AreasTab />)).not.toThrow();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('activity-indicator')).toBeNull();
    });
  });

  it('handles empty areas list', async () => {
    mockGetAreas.mockResolvedValue([]);
    mockGetAreaStats.mockResolvedValue([]);
    mockGetAreaRuns.mockResolvedValue([]);

    render(<AreasTab />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('activity-indicator')).toBeNull();
    });

    // Should render the component structure
    expect(screen.getByText('No areas found')).toBeDefined();
  });

  it('handles areas data', async () => {
    const mockAreas = [
      {
        id: 1,
        name: 'Test Area',
        description: 'Test Description',
        user: 'testuser',
        status: 'success',
        lastRun: '2023-01-01',
        enabled: true,
      },
    ];

    const mockStats = [
      {
        title: 'Total Areas',
        value: '1',
        icon: 'map',
      },
    ];

    mockGetAreas.mockResolvedValue(mockAreas);
    mockGetAreaStats.mockResolvedValue(mockStats);
    mockGetAreaRuns.mockResolvedValue([]);

    render(<AreasTab />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('activity-indicator')).toBeNull();
    });

    // Should render area data
    expect(screen.getByText('Test Area')).toBeDefined();
  });
});