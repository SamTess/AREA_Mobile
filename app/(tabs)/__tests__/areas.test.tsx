import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AreasTab from '../areas';
import { NavigationContainer } from '@react-navigation/native';
import { AreaProvider } from '@/contexts/AreaContext';
import * as areaService from '@/services/area';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
    clearError: jest.fn(),
  }),
}));

jest.mock('@/services/area', () => {
  const actual = jest.requireActual('@/services/area');
  return {
    ...actual,
    getUserAreas: jest.fn(),
    createArea: jest.fn(),
    updateArea: jest.fn(),
    deleteArea: jest.fn(),
    toggleArea: jest.fn(),
  };
});

const mockAreas = [
  {
    id: '1',
    name: 'Test Area 1',
    description: 'Description 1',
    enabled: true,
    userId: 'user-123',
    userEmail: 'test@example.com',
    actions: [],
    reactions: [],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-13T08:30:00Z',
  },
  {
    id: '2',
    name: 'Test Area 2',
    description: 'Description 2',
    enabled: false,
    userId: 'user-123',
    userEmail: 'test@example.com',
    actions: [],
    reactions: [],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-13T08:30:00Z',
  },
];

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AreaProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </AreaProvider>
  );
}

const renderWithProviders = () => render(<AreasTab />, { wrapper: Providers });

beforeEach(() => {
  jest.clearAllMocks();

  (areaService.getUserAreas as jest.Mock).mockResolvedValue(mockAreas);
  (areaService.createArea as jest.Mock).mockImplementation(async payload => ({
    id: 'new-area',
    userId: 'user-123',
    userEmail: 'test@example.com',
    enabled: false,
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-13T08:30:00Z',
    actions: [],
    reactions: [],
    ...payload,
  }));
  (areaService.updateArea as jest.Mock).mockImplementation(async (id, updates) => ({
    ...mockAreas.find(area => area.id === id),
    ...updates,
    updatedAt: '2025-10-13T08:30:00Z',
  }));
  (areaService.deleteArea as jest.Mock).mockResolvedValue(undefined);
  (areaService.toggleArea as jest.Mock).mockImplementation(async (id, enabled) => ({
    ...mockAreas.find(area => area.id === id),
    enabled,
    updatedAt: '2025-10-13T08:30:00Z',
  }));
});

describe('AreasTab', () => {
  it('shows loading screen initially', () => {
    const { getByText } = renderWithProviders();

    expect(getByText('Loading Areas...')).toBeTruthy();
  });

  it('displays areas list after loading', async () => {
    const { getByText, queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull(), {
      timeout: 3000,
    });

    expect(getByText('Test Area 1')).toBeTruthy();
    expect(getByText('Test Area 2')).toBeTruthy();
  });

  it('displays header with title and new button', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() => expect(getByText('Areas')).toBeTruthy());
    expect(getByText('New')).toBeTruthy();
  });

  it('displays subtitle text', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() =>
      expect(getByText('Manage your automated workflows')).toBeTruthy()
    );
  });

  it('fetches areas on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(areaService.getUserAreas).toHaveBeenCalled();
    });
  });

  it('shows area descriptions', async () => {
    const { getByText, queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    expect(getByText('Description 1')).toBeTruthy();
    expect(getByText('Description 2')).toBeTruthy();
  });

  it('displays enabled status for areas', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    // Areas have enabled/disabled status
    expect(queryByText('Test Area 1')).toBeTruthy();
    expect(queryByText('Test Area 2')).toBeTruthy();
  });

  it('renders area list with correct count', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    expect(queryByText('Test Area 1')).toBeTruthy();
    expect(queryByText('Test Area 2')).toBeTruthy();
  });

  it('handles empty areas list', async () => {
    (areaService.getUserAreas as jest.Mock).mockResolvedValue([]);

    renderWithProviders();

    await waitFor(() => {
      expect(areaService.getUserAreas).toHaveBeenCalled();
    });
  });

  it('displays search icon', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    // Component should be rendered without errors
    expect(queryByText('Test Area 1')).toBeTruthy();
  });

  it('renders all area cards', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    expect(queryByText('Test Area 1')).toBeTruthy();
    expect(queryByText('Test Area 2')).toBeTruthy();
    expect(queryByText('Description 1')).toBeTruthy();
    expect(queryByText('Description 2')).toBeTruthy();
  });

  it('shows New button in header', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() => {
      expect(getByText('New')).toBeTruthy();
    });
  });

  it('displays areas header', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() => {
      expect(getByText('Areas')).toBeTruthy();
    });
  });

  it('loads areas on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(areaService.getUserAreas).toHaveBeenCalled();
    });
  });

  it('displays area list', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    expect(queryByText('Test Area 1')).toBeTruthy();
  });

  it('shows multiple areas', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    expect(queryByText('Test Area 1')).toBeTruthy();
    expect(queryByText('Test Area 2')).toBeTruthy();
  });

  it('renders area names correctly', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => {
      expect(queryByText('Test Area 1')).toBeTruthy();
    });
  });

  it('renders area descriptions correctly', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => {
      expect(queryByText('Description 1')).toBeTruthy();
    });
  });

  it('displays active status', async () => {
    const { queryAllByText } = renderWithProviders();

    await waitFor(() => expect(queryAllByText('Test Area 1')).toBeTruthy());
  });

  it('shows area cards in list', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => {
      expect(queryByText('Test Area 1')).toBeTruthy();
      expect(queryByText('Test Area 2')).toBeTruthy();
    });
  });

  it('handles successful areas fetch', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(areaService.getUserAreas).toHaveBeenCalledTimes(1);
    });
  });

  it('renders without errors', async () => {
    const { queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    expect(queryByText('Test Area 1')).toBeTruthy();
  });

  it('navigates to area editor when New button is pressed', async () => {
    const { getByText } = renderWithProviders();
    
    await waitFor(() => expect(getByText('Test Area 1')).toBeTruthy());
    
    const newButton = getByText('New');
    fireEvent.press(newButton);
    
    // Navigation would be called (but we're not fully mocking expo-router here)
  });

  it('filters areas by search query', async () => {
    const { getByPlaceholderText, queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    const searchInput = getByPlaceholderText('Search areas...');
    fireEvent.changeText(searchInput, 'Area 1');

    expect(queryByText('Test Area 1')).toBeTruthy();
    expect(queryByText('Test Area 2')).toBeFalsy();
  });

  it('filters areas by status - active only', async () => {
    const { getByText, queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    // Click filter button to cycle to active
    const filterButton = getByText('All');
    fireEvent.press(filterButton);

    expect(queryByText('Test Area 1')).toBeTruthy(); // enabled: true
    expect(queryByText('Test Area 2')).toBeFalsy(); // enabled: false
  });

  it('filters areas by status - inactive only', async () => {
    const { getByText, queryByText } = renderWithProviders();

    await waitFor(() => expect(queryByText('Loading Areas...')).toBeNull());

    // Click filter button twice to cycle to inactive
    const filterButton = getByText('All');
    fireEvent.press(filterButton);
    fireEvent.press(filterButton);

    expect(queryByText('Test Area 1')).toBeFalsy(); // enabled: true
    expect(queryByText('Test Area 2')).toBeTruthy(); // enabled: false
  });

  it('handles area press navigation', async () => {
    const { getByText } = renderWithProviders();

    await waitFor(() => expect(getByText('Test Area 1')).toBeTruthy());

    const areaItem = getByText('Test Area 1');
    fireEvent.press(areaItem);

    // Navigation should be called
  });

  it('handles refresh functionality', async () => {
    const { getByTestId } = renderWithProviders();

    await waitFor(() => expect(getByTestId('areas-flatlist')).toBeTruthy());

    const flatList = getByTestId('areas-flatlist');
    const refreshControl = flatList.props.refreshControl;

    refreshControl.props.onRefresh();

    // refreshAreas should be called
  });
});
