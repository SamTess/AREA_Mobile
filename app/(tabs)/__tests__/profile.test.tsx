import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import ProfileScreen from '../profile';

function Providers({ children }: { children: React.ReactNode }) {
  return <GluestackUIProvider mode="light">{children}</GluestackUIProvider>;
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
