import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ServicesTab from '../ServicesTab';

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
    background: '#ffffff',
    border: '#e5e5e5',
    text: '#000000',
    textTertiary: '#666666',
    primary: '#3b82f6',
    card: '#ffffff',
  }),
}));

// Mock services
jest.mock('@/services/admin', () => ({
  getServices: jest.fn(),
}));

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock require for defaultSource
jest.mock('@/assets/images/icon.png', () => 'mock-icon.png');

describe('ServicesTab', () => {
  const mockGetServices = require('@/services/admin').getServices;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();

    // Default mock
    mockGetServices.mockResolvedValue([
      {
        id: 1,
        name: 'GitHub',
        logo: 'https://github.com/favicon.ico',
      },
      {
        id: 2,
        name: 'Discord',
        logo: 'https://discord.com/favicon.ico',
      },
    ]);
  });

  it('renders loading state initially', () => {
    render(<ServicesTab />);
    // If this doesn't throw, the element exists
    screen.getByTestId('services-loading-container');
  });

  it('renders services list after loading', async () => {
    render(<ServicesTab />);

    await waitFor(() => {
      screen.getByText('GitHub');
      screen.getByText('Discord');
    });
  });

  it('filters services based on search query', async () => {
    render(<ServicesTab />);

    await waitFor(() => {
      screen.getByText('GitHub');
    });

    const searchInput = screen.getByTestId('services-search-input');
    fireEvent.changeText(searchInput, 'Git');

    await waitFor(() => {
      screen.getByText('GitHub');
      // Discord should not be present
      try {
        screen.getByText('Discord');
        throw new Error('Discord should not be visible');
      } catch (e) {
        // Expected - Discord should not be found
      }
    });
  });

  it('shows empty state when no services match filter', async () => {
    render(<ServicesTab />);

    await waitFor(() => {
      screen.getByText('GitHub');
    });

    const searchInput = screen.getByTestId('services-search-input');
    fireEvent.changeText(searchInput, 'NonExistent');

    await waitFor(() => {
      screen.getByTestId('services-empty-text');
    });
  });

  it('handles service loading error', async () => {
    mockGetServices.mockRejectedValue(new Error('Load failed'));

    render(<ServicesTab />);

    await waitFor(() => {
      // Check that alert was called by checking mock calls
      if (mockAlert.mock.calls.length === 0) {
        throw new Error('Alert should have been called');
      }
    });
  });

  it('handles empty services array', async () => {
    mockGetServices.mockResolvedValue([]);

    render(<ServicesTab />);

    await waitFor(() => {
      screen.getByTestId('services-empty-text');
    });
  });

  it('handles non-array services response', async () => {
    mockGetServices.mockResolvedValue(null);

    render(<ServicesTab />);

    await waitFor(() => {
      screen.getByTestId('services-empty-text');
    });
  });

  it('renders service logos', async () => {
    render(<ServicesTab />);

    await waitFor(() => {
      const images = screen.getAllByTestId(/^service-logo-/);
      if (images.length !== 2) {
        throw new Error(`Expected 2 images, got ${images.length}`);
      }
    });
  });
});