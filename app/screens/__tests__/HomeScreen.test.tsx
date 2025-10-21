import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import HomeScreen from '../HomeScreen';

function Providers({ children }: { children: React.ReactNode }) {
  return <GluestackUIProvider mode="light">{children}</GluestackUIProvider>;
}

describe('HomeScreen', () => {
  it('renders header and sections', () => {
    render(<HomeScreen />, { wrapper: Providers });

    expect(screen.getByText('Hello!')).toBeTruthy();
    expect(screen.getByText('My Automations')).toBeTruthy();
    expect(screen.getByText('Available Services')).toBeTruthy();
    expect(screen.getByText('Popular Templates')).toBeTruthy();
  });

  it('navigates when pressing create button and a service card', () => {
    const pushSpy = jest.spyOn(router, 'push');
    render(<HomeScreen />, { wrapper: Providers });

    // Press the create automation CTA button
    const createBtn = screen.getByTestId('btn-create-automation');
    fireEvent.press(createBtn);
    expect(pushSpy).toHaveBeenCalledWith('/details');

    // Press a service card
    const githubService = screen.getByTestId('service-card-GitHub');
    fireEvent.press(githubService);
    expect(pushSpy).toHaveBeenCalledWith('/details');
  });
});
