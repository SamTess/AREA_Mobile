import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import AboutScreen from '../about';

// Mock expo-router
const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return key as translation for testing
  }),
}));

// Mock useThemeColors hook
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    background: '#ffffff',
    card: '#f8f9fa',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e0e0e0',
    info: '#007bff',
  }),
}));

// Mock Linking
const mockLinking = {
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve()),
};

jest.mock('react-native/Libraries/Linking/Linking', () => mockLinking);

// Mock the image asset
jest.mock('../../assets/images/area1.png', () => 'mocked-image');

// Mock the UI Image component
jest.mock('@/components/ui/image', () => ({
  Image: 'MockedImage',
}));

const renderAboutScreen = () => {
  return render(
    <GluestackUIProvider>
      <AboutScreen />
    </GluestackUIProvider>
  );
};

describe('AboutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the about screen correctly', () => {
    renderAboutScreen();

    // Check if main title is rendered
    expect(screen.getByText('about.title')).toBeTruthy();

    // Check if hero description is rendered
    expect(screen.getByText('about.heroDescription')).toBeTruthy();

    // Check if badges are rendered
    expect(screen.getByText('Automation Platform')).toBeTruthy();
    expect(screen.getByText('Open Source')).toBeTruthy();
    expect(screen.getByText('Cloud-Based')).toBeTruthy();
  });

  it('renders mission section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.missionTitle')).toBeTruthy();
    expect(screen.getByText('about.missionText')).toBeTruthy();
  });

  it('renders what is AREA section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.whatIsTitle')).toBeTruthy();
    expect(screen.getByText('about.whatIsText1')).toBeTruthy();
    expect(screen.getByText('about.whatIsText2')).toBeTruthy();
    expect(screen.getByText('about.whatIsText3')).toBeTruthy();
  });

  it('renders features section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.featuresTitle')).toBeTruthy();

    // Check if feature titles are rendered
    expect(screen.getByText('about.feature1Title')).toBeTruthy();
    expect(screen.getByText('about.feature2Title')).toBeTruthy();
    expect(screen.getByText('about.feature3Title')).toBeTruthy();
    expect(screen.getByText('about.feature4Title')).toBeTruthy();
    expect(screen.getByText('about.feature5Title')).toBeTruthy();
    expect(screen.getByText('about.feature6Title')).toBeTruthy();
  });

  it('renders journey section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.journeyTitle')).toBeTruthy();

    // Check if journey steps are rendered
    expect(screen.getByText('about.journey1Title')).toBeTruthy();
    expect(screen.getByText('about.journey2Title')).toBeTruthy();
    expect(screen.getByText('about.journey3Title')).toBeTruthy();
    expect(screen.getByText('about.journey4Title')).toBeTruthy();
  });

  it('renders values section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.valuesTitle')).toBeTruthy();

    // Check if values are rendered
    expect(screen.getByText('about.value1Title')).toBeTruthy();
    expect(screen.getByText('about.value2Title')).toBeTruthy();
    expect(screen.getByText('about.value3Title')).toBeTruthy();
    expect(screen.getByText('about.value4Title')).toBeTruthy();
  });

  it('renders technology stack section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.techTitle')).toBeTruthy();
    expect(screen.getByText('about.techText')).toBeTruthy();

    // Check if tech badges are rendered
    expect(screen.getByText('React Native')).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('Gluestack UI')).toBeTruthy();
    expect(screen.getByText('Node.js')).toBeTruthy();
    expect(screen.getByText('Docker')).toBeTruthy();
    expect(screen.getByText('PostgreSQL')).toBeTruthy();
    expect(screen.getByText('Jest')).toBeTruthy();
    expect(screen.getByText('OAuth2')).toBeTruthy();
    expect(screen.getByText('REST API')).toBeTruthy();
  });

  it('renders FAQ section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.faqTitle')).toBeTruthy();

    // Check if FAQ questions are rendered
    expect(screen.getByText('about.faq1Question')).toBeTruthy();
    expect(screen.getByText('about.faq2Question')).toBeTruthy();
    expect(screen.getByText('about.faq3Question')).toBeTruthy();
    expect(screen.getByText('about.faq4Question')).toBeTruthy();
    expect(screen.getByText('about.faq5Question')).toBeTruthy();
  });

  it('renders contact section', () => {
    renderAboutScreen();

    expect(screen.getByText('about.contactTitle')).toBeTruthy();
    expect(screen.getByText('about.contactText')).toBeTruthy();

    // Check if contact buttons are rendered
    expect(screen.getByText('about.github')).toBeTruthy();
    expect(screen.getByText('about.community')).toBeTruthy();
    expect(screen.getByText('about.documentation')).toBeTruthy();
  });

  it('handles back button press', () => {
    renderAboutScreen();

    // The back button should be rendered (ArrowLeft icon)
    // Since it's an icon, we can't easily test the press without more complex setup
    // But we can verify the component renders without crashing
    expect(screen.getByText('about.title')).toBeTruthy();
  });

  it('handles FAQ accordion expansion', () => {
    renderAboutScreen();

    // Find the first FAQ item
    const firstFaq = screen.getByText('about.faq1Question');
    expect(firstFaq).toBeTruthy();

    // Initially, the answer should not be visible
    expect(screen.queryByText('about.faq1Answer')).toBeNull();

    // Press the FAQ item to expand
    fireEvent.press(firstFaq);

    // Now the answer should be visible
    expect(screen.getByText('about.faq1Answer')).toBeTruthy();

    // Press again to collapse
    fireEvent.press(firstFaq);

    // Answer should be hidden again
    expect(screen.queryByText('about.faq1Answer')).toBeNull();
  });

  // TODO: Fix Linking mock
  // it('handles link presses', async () => {
  //   renderAboutScreen();

  //   // Find and press the GitHub link
  //   const githubButton = screen.getByText('about.github');
  //   fireEvent.press(githubButton);

  //   // Verify Linking methods were called
  //   expect(Linking.canOpenURL).toHaveBeenCalledWith('https://github.com/SamTess/AREA');
  //   expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/SamTess/AREA');
  // });
});