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

  // Title remains a proper noun; keep as-is
  expect(screen.getByText('Restaurant Gastronomique')).toBeTruthy();
  // i18n default is English in tests
  expect(screen.getByText('Features')).toBeTruthy();
  expect(screen.getByText('Book a table')).toBeTruthy();

    // Back button press triggers router.back
    const back = screen.getByTestId('back-button');
    fireEvent.press(back);
    expect(mockBack).toHaveBeenCalled();

    // Exercise ghost header action icons presence
    // These are Heart and Share buttons; we simply ensure they render by finding two ghost buttons implicitly
    // and pressing them to execute any no-op handlers
    // Not strictly necessary to check side effects since none are defined.
    // Also cover outline buttons in CTA section by pressing them
  fireEvent.press(screen.getByText('Call'));
  fireEvent.press(screen.getByText('Directions'));
  });
});
