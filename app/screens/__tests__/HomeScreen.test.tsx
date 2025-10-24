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

  it('navigates to area-editor on service press', () => {
    const pushSpy = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushSpy });
    render(<HomeScreen />, { wrapper: Providers });
    // Test logic here
    expect(pushSpy).toHaveBeenCalledWith('/area-editor');
  });

  it('navigates to area-editor on action-reaction press', () => {
    const pushSpy = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushSpy });
    // Test logic here
    expect(pushSpy).toHaveBeenCalledWith('/area-editor');
  });
});
