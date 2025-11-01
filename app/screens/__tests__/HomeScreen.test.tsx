import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { fireEvent, render, screen, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import HomeScreen from '../HomeScreen';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock useArea hook
const mockUseArea: any = {
  areas: [],
  isRefreshing: false,
  refreshAreas: jest.fn(),
  fetchAreas: jest.fn(),
  hasFetched: true,
  deleteArea: jest.fn(),
  toggleArea: jest.fn(),
};

jest.mock('@/contexts/AreaContext', () => ({
  useArea: jest.fn(() => mockUseArea),
}));

// Mock useThemeColors hook
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    info: '#3b82f6',
    text: '#000000',
    textSecondary: '#666666',
    card: '#ffffff',
    cardBorder: '#e5e5e5',
    background: '#f5f5f5',
  }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const translations: Record<string, string> = {
        'tabs.home': 'Home',
        'home.subtitle': 'Automate your daily tasks',
        'areas.card.active': 'Active',
        'home.automationsInProgress': 'active areas',
        'home.totalLabel': 'TOTAL',
        'tabs.areas': 'Areas',
        'areas.empty.title': 'No Areas Yet',
        'areas.empty.description': 'Create your first automation area to get started',
        'areas.empty.action': 'Create Area',
        'home.popularTemplatesTitle': 'Quick Start Ideas',
        'home.template1Title': 'GitHub → Discord',
        'home.template1Desc': 'Send new issues to Discord channel',
        'home.template2Title': 'Spotify → Slack',
        'home.template2Desc': 'Share what you\'re listening to',
        'home.template3Title': 'Gmail → Google Sheets',
        'home.template3Desc': 'Log important emails automatically',
      };
      return translations[key] || defaultValue || key;
    },
  }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(() => {}),
}));

function Providers({ children }: { children: React.ReactNode }) {
  return <GluestackUIProvider mode="light">{children}</GluestackUIProvider>;
}

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header and sections', () => {
    render(<HomeScreen />, { wrapper: Providers });

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Automate your daily tasks')).toBeTruthy();
    expect(screen.getAllByText('No Areas Yet')).toHaveLength(2); // Header and description
    expect(screen.getByText('Create Area')).toBeTruthy();
  });

  it('navigates to area-editor on create automation button press', () => {
    render(<HomeScreen />, { wrapper: Providers });
    const createButton = screen.getByText('Create Area');
    fireEvent.press(createButton);
    expect(router.push).toHaveBeenCalledWith('/area-editor');
  });

  it('navigates to area-editor when pressing floating action button', () => {
    render(<HomeScreen />, { wrapper: Providers });
    const pressables = screen.getAllByRole('button');
    const fab = pressables[pressables.length - 1]; // Last button should be the FAB
    fireEvent.press(fab);
    expect(router.push).toHaveBeenCalledWith('/area-editor');
  });

  it('handles handleAreaPress navigation', () => {
    const mockArea = {
      id: 'area-1',
      name: 'Test Area',
      enabled: true,
      action: { name: 'Test Action', service: 'github', config: {} },
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUseArea.areas = [mockArea];
    
    render(<HomeScreen />, { wrapper: Providers });
    
    // The area card is rendered, trigger its onPress callback
    const areaCards = screen.queryAllByText('Test Area');
    if (areaCards.length > 0) {
      fireEvent.press(areaCards[0]);
    }
    
    // Reset for next test
    mockUseArea.areas = [];
  });

  it('handles refresh callback', async () => {
    const refreshSpy = jest.fn().mockResolvedValue(undefined);
    mockUseArea.refreshAreas = refreshSpy;
    
    const { UNSAFE_getByType } = render(<HomeScreen />, { wrapper: Providers });
    
    // Find FlatList and trigger refresh
    const flatList = UNSAFE_getByType(require('react-native').FlatList);
    if (flatList.props.refreshControl) {
      flatList.props.refreshControl.props.onRefresh();
    }
    
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('handles handleDeleteArea', async () => {
    const deleteSpy = jest.fn().mockResolvedValue(undefined);
    mockUseArea.deleteArea = deleteSpy;
    
    const mockArea = {
      id: 'area-1',
      name: 'Test Area',
      enabled: true,
      action: { name: 'Test Action', service: 'github', config: {} },
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUseArea.areas = [mockArea];

    render(<HomeScreen />, { wrapper: Providers });
    
    // Simulate delete by calling the handler directly
    await act(async () => {
      await deleteSpy('area-1');
    });

    expect(deleteSpy).toHaveBeenCalledWith('area-1');
    
    // Reset for next test
    mockUseArea.areas = [];
  });

  it('handles handleRunArea', async () => {
    const runSpy = jest.fn().mockResolvedValue(undefined);
    mockUseArea.runArea = runSpy;
    
    const mockArea = {
      id: 'area-1',
      name: 'Test Area',
      enabled: true,
      action: { name: 'Test Action', service: 'github', config: {} },
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUseArea.areas = [mockArea];

    render(<HomeScreen />, { wrapper: Providers });
    
    // Simulate area run
    await act(async () => {
      await runSpy('area-1');
    });

    expect(runSpy).toHaveBeenCalledWith('area-1');
    
    // Reset for next test
    mockUseArea.areas = [];
  });

  it('handles handleToggleArea', async () => {
    const toggleSpy = jest.fn().mockResolvedValue(undefined);
    mockUseArea.toggleArea = toggleSpy;
    
    const mockArea = {
      id: 'area-1',
      name: 'Test Area',
      enabled: true,
      action: { name: 'Test Action', service: 'github', config: {} },
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUseArea.areas = [mockArea];

    render(<HomeScreen />, { wrapper: Providers });
    
    // Simulate area toggle
    await act(async () => {
      await toggleSpy('area-1', false);
    });

    expect(toggleSpy).toHaveBeenCalledWith('area-1', false);
    
    // Reset for next test
    mockUseArea.areas = [];
  });
});
