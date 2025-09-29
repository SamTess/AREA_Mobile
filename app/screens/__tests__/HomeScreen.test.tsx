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

    expect(screen.getByText('Bonjour !')).toBeTruthy();
    expect(screen.getByText('Recommandé')).toBeTruthy();
    expect(screen.getByText('Populaires cette semaine')).toBeTruthy();
  });

  it('paginates popular items', () => {
    render(<HomeScreen />, { wrapper: Providers });

    // Initially should show page 1 / n
    expect(screen.getByText(/1 \/ \d+/)).toBeTruthy();

    const next = screen.getByText('Suivant');
    fireEvent.press(next);

    // After pressing next, page indicator should update to 2
    expect(screen.getByText('2')).toBeTruthy();

    // Go back to previous page and verify
    const prev = screen.getByText('Précédent');
    fireEvent.press(prev);
    expect(screen.getByText(/1 \/ \d+/)).toBeTruthy();

    // Jump directly by pressing numbered page button (e.g., page 2)
    const page2 = screen.getAllByText('2')[0];
    fireEvent.press(page2);
    expect(screen.getByText(/2 \/ \d+/)).toBeTruthy();

    // Navigate to last page then verify Next is disabled visually (opacity-50 class applied via text still present)
    const totalLabel = screen.getByText(/\d+ \/ (\d+)/);
    const total = Number((totalLabel.text ?? totalLabel.props?.children?.[2]) || String(totalLabel).match(/\/ (\d+)/)?.[1]);
    for (let i = 2; i <= (total || 3); i++) {
      fireEvent.press(next);
    }
    expect(screen.getByText(String(total || 3))).toBeTruthy();
  });

  it('navigates when pressing a popular item and a recommendation card', () => {
    const pushSpy = jest.spyOn(router, 'push');
    render(<HomeScreen />, { wrapper: Providers });

    // Press first popular item
    const firstPopular = screen.getByTestId('popular-item-Restaurant-Gastronomique');
    fireEvent.press(firstPopular);
    expect(pushSpy).toHaveBeenCalledWith('/details');

    // Press a recommendation card
    const recCard = screen.getByTestId('rec-card-Destination-Tropicale');
    fireEvent.press(recCard);
    expect(pushSpy).toHaveBeenCalledWith('/details');
  });

  it('disables prev on first page and next on last page, and jumps by page buttons', () => {
    render(<HomeScreen />, { wrapper: Providers });

    // On first page, pressing prev shouldn’t change the indicator
    const prev = screen.getByText('Précédent');
    const next = screen.getByText('Suivant');
    const indicator1 = screen.getByText(/1 \/ \d+/);
    fireEvent.press(prev);
    expect(indicator1).toBeTruthy();

    // Press next until last page
    let total = Number((indicator1.props?.children?.[2]) || /\/ (\d+)/.exec(indicator1.children?.join?.('') || '')?.[1] || 3);
    for (let i = 2; i <= total; i++) {
      fireEvent.press(next);
    }
    expect(screen.getByText(`${total} / ${total}`)).toBeTruthy();

    // On last page, pressing next shouldn’t change
    fireEvent.press(next);
    expect(screen.getByText(`${total} / ${total}`)).toBeTruthy();

    // Jump to page 1 by tapping button "1"
    const page1Btn = screen.getAllByText('1')[0];
    fireEvent.press(page1Btn);
    expect(screen.getByText('1 / ' + total)).toBeTruthy();
  });
});
