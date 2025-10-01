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
  return { Tabs: TabsComp, __captured: captured };
});

describe('TabLayout', () => {
  beforeEach(() => {
    const expoRouter = require('expo-router');
    expoRouter.__captured.screens = [];
    expoRouter.__captured.tabsProps = null;
  });
  it('renders without crashing', () => {
    render(<TabLayout />);
  });

  it('applies screenOptions and renders tab icons', () => {
    const expoRouter = require('expo-router');
    render(<TabLayout />);
    const { tabsProps, screens } = expoRouter.__captured;
    expect(tabsProps).toBeTruthy();
    expect(tabsProps.screenOptions).toBeTruthy();
    expect(tabsProps.screenOptions.headerShown).toBe(false);
    expect(tabsProps.screenOptions.tabBarLabelStyle.fontSize).toBe(12);
    expect(screens.length).toBe(4);
    const icon1 = screens[0].options.tabBarIcon({ color: testColors.focused, size: 20, focused: true });
    const icon2 = screens[1].options.tabBarIcon({ color: testColors.unfocused, size: 22, focused: false });
    const icon3 = screens[2].options.tabBarIcon({ color: testColors.focused, size: 20, focused: true });
    const icon4 = screens[3].options.tabBarIcon({ color: testColors.unfocused, size: 22, focused: false });
    expect(icon1).toBeTruthy();
    expect(icon2).toBeTruthy();
    expect(icon3).toBeTruthy();
    expect(icon4).toBeTruthy();
  });
});
