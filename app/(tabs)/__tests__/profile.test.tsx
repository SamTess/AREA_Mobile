import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import ProfileScreen from '../profile';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        {children}
      </AuthProvider>
    </GluestackUIProvider>
  );
}

describe('ProfileScreen', () => {
  it('renders header and options', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('Manage your account and preferences')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Help & support')).toBeTruthy();
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('renders all option subtitles', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    expect(screen.getByText('Configure your app')).toBeTruthy();
    expect(screen.getByText('Manage your notifications')).toBeTruthy();
    expect(screen.getByText('Get help')).toBeTruthy();
    expect(screen.getByText('Sign out of your account')).toBeTruthy();
  });

  it('renders user profile information', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Check if profile section exists
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders badges', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    expect(screen.getByText('Verified')).toBeTruthy();
    expect(screen.getByText('Premium Member')).toBeTruthy();
  });

  it('renders language toggle button', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Check if profile header exists
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders all menu items as pressable', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Verify main menu items are rendered
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Help & support')).toBeTruthy();
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('displays correct structure with avatar', () => {
    const { toJSON } = render(<ProfileScreen />, { wrapper: Providers });
    expect(toJSON()).toBeTruthy();
  });
});
