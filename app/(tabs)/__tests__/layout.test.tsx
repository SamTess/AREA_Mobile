import { AuthProvider } from '@/contexts/AuthContext';
import { testColors } from '@/test-utils/testColors';
import { render } from '@testing-library/react-native';
import React from 'react';
import TabLayout from '../_layout';

jest.mock('expo-router', () => {
  const captured: any = { tabsProps: null, screens: [] };
  const TabsComp: any = ({ children, ...props }: any) => {
    captured.tabsProps = props;
    return children ?? null;
  };
  TabsComp.Screen = (props: any) => {
    captured.screens.push(props);
    return null;
  };
  return { 
    Tabs: TabsComp, 
    __captured: captured,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
    }),
  };
});

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Helper pour wrapper avec AuthProvider
const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('TabLayout', () => {
  beforeEach(() => {
    const expoRouter = require('expo-router');
    expoRouter.__captured.screens = [];
    expoRouter.__captured.tabsProps = null;
  });
  it('renders without crashing', () => {
    renderWithAuth(<TabLayout />);
  });

  it('applies screenOptions and renders tab icons', () => {
    const expoRouter = require('expo-router');
    renderWithAuth(<TabLayout />);
    const { tabsProps, screens } = expoRouter.__captured;
    expect(tabsProps).toBeTruthy();
    expect(tabsProps.screenOptions).toBeTruthy();
    expect(tabsProps.screenOptions.headerShown).toBe(false);
    expect(tabsProps.screenOptions.tabBarLabelStyle.fontSize).toBe(12);
    expect(screens.length).toBe(5);

    // Verify that only 2 tabs are visible in the tab bar (login, register, and forgot-password have href: null)
    const visibleScreens = screens.filter((s: any) => s.options.href !== null);
    expect(visibleScreens.length).toBe(2); // Only Home and Profile are visible
    
    const icon1 = screens[0].options.tabBarIcon({ color: testColors.focused, size: 20, focused: true });
    const icon4 = screens[3].options.tabBarIcon({ color: testColors.unfocused, size: 22, focused: false });
    expect(icon1).toBeTruthy();
    expect(icon4).toBeTruthy();
  });
});
