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
});
