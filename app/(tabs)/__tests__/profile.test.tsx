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

    expect(screen.getByText('Profil')).toBeTruthy();
    expect(screen.getByText('Gérez votre compte et vos préférences')).toBeTruthy();
    expect(screen.getByText('Paramètres')).toBeTruthy();
    expect(screen.getByText('Notifications')).toBeTruthy();
    expect(screen.getByText('Aide et support')).toBeTruthy();
    expect(screen.getByText('Se déconnecter')).toBeTruthy();
  });
});
