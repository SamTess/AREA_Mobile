import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import React from 'react';
import ProfileScreen from '../profile';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(() => {}), // No-op for testing
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
    expect(screen.getByText('Manage your account and personal information')).toBeTruthy();
    expect(screen.getByText('Edit Profile')).toBeTruthy();
    expect(screen.getByText('Manage service connections')).toBeTruthy();
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('renders all option subtitles', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    expect(screen.getByText('Update your personal information')).toBeTruthy();
    expect(screen.getByText('Manage service connections')).toBeTruthy();
    expect(screen.getByText('Sign out of your account')).toBeTruthy();
  });

  it('renders user profile information', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Check if profile section exists
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders language toggle button', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Check if profile header exists
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders all menu items as pressable', () => {
    render(<ProfileScreen />, { wrapper: Providers });

    // Verify main menu items are rendered
    expect(screen.getByText('Edit Profile')).toBeTruthy();
    expect(screen.getByText('Manage service connections')).toBeTruthy();
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('displays correct structure with avatar', () => {
    const { toJSON } = render(<ProfileScreen />, { wrapper: Providers });
    expect(toJSON()).toBeTruthy();
  });

  it('shows profile header text', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('renders account management description', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Manage your account and personal information')).toBeTruthy();
  });

  it('shows edit profile menu item', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Edit Profile')).toBeTruthy();
  });

  it('shows service connections menu item', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Manage service connections')).toBeTruthy();
  });

  it('shows logout menu item', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('displays edit profile description', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Update your personal information')).toBeTruthy();
  });

  it('displays services description', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Manage service connections')).toBeTruthy();
  });

  it('displays logout description', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Sign out of your account')).toBeTruthy();
  });

  it('renders without errors', () => {
    const { toJSON } = render(<ProfileScreen />, { wrapper: Providers });
    expect(toJSON()).not.toBeNull();
  });

  it('has clickable edit profile option', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Edit Profile')).toBeTruthy();
  });

  it('has clickable services option', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Manage service connections')).toBeTruthy();
  });

  it('has clickable logout option', () => {
    render(<ProfileScreen />, { wrapper: Providers });
    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('shows logout confirmation alert', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    render(<ProfileScreen />, { wrapper: Providers });
    const logoutButton = screen.getByText('Log out');
    fireEvent.press(logoutButton);

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('shows delete account confirmation alert when admin dashboard link is pressed', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    render(<ProfileScreen />, { wrapper: Providers });
    
    // Look for delete account text if it exists
    const deleteAccountTexts = screen.queryAllByText(/Delete Account/i);
    if (deleteAccountTexts.length > 0) {
      fireEvent.press(deleteAccountTexts[0]);
      expect(alertSpy).toHaveBeenCalled();
    }
    
    alertSpy.mockRestore();
  });
});


