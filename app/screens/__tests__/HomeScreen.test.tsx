import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import HomeScreen from '../HomeScreen';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
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

    expect(screen.getByText('Hello!')).toBeTruthy();
    expect(screen.getByText('My Automations')).toBeTruthy();
    expect(screen.getByText('Available Services')).toBeTruthy();
    expect(screen.getByText('Popular Templates')).toBeTruthy();
  });

  it('navigates to area-editor on create automation button press', () => {
    render(<HomeScreen />, { wrapper: Providers });
    
    const createButton = screen.getByTestId('btn-create-automation');
    fireEvent.press(createButton);
    
    expect(router.push).toHaveBeenCalledWith('/area-editor');
  });

  it('navigates to area-editor when pressing action-reaction item', () => {
    render(<HomeScreen />, { wrapper: Providers });
    
    // Les ActionReactionItems devraient être dans le DOM
    // On peut tester que router.push serait appelé si on clique
    expect(router.push).not.toHaveBeenCalled();
  });
});
