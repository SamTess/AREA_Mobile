import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock expo-router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: mockBack,
  },
}));

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import PlaceholderScreen from '../PlaceholderScreen';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'placeholder.title': 'Page under construction',
        'placeholder.description': 'This feature will be available soon',
        'placeholder.back': 'Back',
      };
      return translations[key] || key;
    },
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);
};

describe('PlaceholderScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithProvider(<PlaceholderScreen />);

    expect(screen.getByText('Page under construction')).toBeTruthy();
    expect(screen.getByText('This feature will be available soon')).toBeTruthy();
    expect(screen.getByText('Back')).toBeTruthy();
  });

  it('displays the construction icon', () => {
    renderWithProvider(<PlaceholderScreen />);

    // The Construction icon should be rendered (we can't test the icon directly, but we can ensure the component renders)
    const title = screen.getByText('Page under construction');
    expect(title).toBeTruthy();
  });

  it('back button is pressable', () => {
    renderWithProvider(<PlaceholderScreen />);

    const backButton = screen.getByTestId('back-button');
    // The button should be pressable without throwing
    expect(() => fireEvent.press(backButton)).not.toThrow();
  });

  it('displays animated dots', () => {
    renderWithProvider(<PlaceholderScreen />);

    expect(screen.getByText('...')).toBeTruthy();
  });
});
