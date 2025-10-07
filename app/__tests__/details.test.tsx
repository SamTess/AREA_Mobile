import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import DetailsScreen from '../details';

const mockBack = jest.fn();
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return { ...actual, router: { back: jest.fn(() => mockBack()) } };
});

function Providers({ children }: { children: React.ReactNode }) {
  return <GluestackUIProvider mode="light">{children}</GluestackUIProvider>;
}

describe('DetailsScreen', () => {
  it('renders content and handles back button', () => {
    render(<DetailsScreen />, { wrapper: Providers });
  // Details screen now renders the placeholder while the real details UI is in progress
  expect(screen.getByText('Page under construction')).toBeTruthy();
  expect(screen.getByText('This feature will be available soon')).toBeTruthy();

  // Back button press should trigger router.back (the mock calls mockBack)
  const back = screen.getByTestId('back-button');
  fireEvent.press(back);
  expect(mockBack).toHaveBeenCalled();
  });
});
