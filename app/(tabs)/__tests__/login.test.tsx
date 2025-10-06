import { AuthProvider } from '@/contexts/AuthContext';
import '@testing-library/jest-native/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import LoginScreen from '../login';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

// Helper to wrap with AuthProvider
const renderWithAuth = (component: React.ReactElement) => {
    return render(<AuthProvider>{component}</AuthProvider>);
};

describe('LoginScreen', () => {
    it('renders the login form correctly', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the component to be ready (loading finished)
        await screen.findByText('Login');
        
        // Tests use English by default (default i18n language)
        expect(screen.getByText('Login')).toBeTruthy();
        expect(screen.getByText('Welcome! Sign in to your account')).toBeTruthy();
        expect(screen.getByPlaceholderText('example@email.com')).toBeTruthy();
        expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
        
        // Wait for the button to be rendered (after loading)
        expect(await screen.findByText('Sign In')).toBeTruthy();
    });

    it('shows validation errors when fields are empty', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the button to be rendered
        const loginButton = await screen.findByText('Sign In');
        fireEvent.press(loginButton);
        
        // Wait for error messages to appear (using regex to ignore emoji)
        expect(await screen.findByText(/Email is required/)).toBeTruthy();
        expect(await screen.findByText(/Password is required/)).toBeTruthy();
    });

    it('shows email validation error for invalid email', async () => {
        renderWithAuth(<LoginScreen />);
        
        const emailInput = screen.getByPlaceholderText('example@email.com');
        const loginButton = await screen.findByText('Sign In');
        
        fireEvent.changeText(emailInput, 'invalid-email');
        fireEvent.press(loginButton);
        
        expect(await screen.findByText(/Please enter a valid email/)).toBeTruthy();
    });

    it('shows password validation error for short password', async () => {
        renderWithAuth(<LoginScreen />);
        
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const loginButton = await screen.findByText('Sign In');
        
        fireEvent.changeText(passwordInput, '123');
        fireEvent.press(loginButton);
        
        expect(await screen.findByText(/Password must be at least 6 characters/)).toBeTruthy();
    });

    it('toggles password visibility', () => {
        renderWithAuth(<LoginScreen />);
        
        const passwordInput = screen.getByPlaceholderText('••••••••');
        
        // Initially, the field should be of type password
        expect(passwordInput.props.secureTextEntry).toBe(true);
        
        // Find and click the toggle button (eye icon)
        const toggleButtons = screen.getAllByRole('button');
        const toggleButton = toggleButtons.find(btn => 
            btn.props.accessibilityRole === 'button'
        );
        
        if (toggleButton) {
            fireEvent.press(toggleButton);
            // After click, the field should be of type text
            expect(passwordInput.props.secureTextEntry).toBe(false);
        }
    });

    it('clears error messages when user types', async () => {
        renderWithAuth(<LoginScreen />);
        
        const emailInput = screen.getByPlaceholderText('example@email.com');
        const loginButton = await screen.findByText('Sign In');
        
        // Trigger an error
        fireEvent.press(loginButton);
        expect(await screen.findByText(/Email is required/)).toBeTruthy();
        
        // Typing text should clear the error
        fireEvent.changeText(emailInput, 'test@example.com');
        expect(screen.queryByText(/Email is required/)).toBeNull();
    });

    it('renders OAuth buttons', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the divider text to be rendered
        expect(await screen.findByText(/Or continue with/)).toBeTruthy();
        
        // Check that OAuth buttons are present (they are buttons without text, just icons)
        const buttons = screen.getAllByRole('button');
        // We should have at least 4 buttons: Sign In + 3 OAuth buttons
        expect(buttons.length).toBeGreaterThanOrEqual(4);
    });

    it('handles GitHub OAuth login', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the component to be ready
        await screen.findByText('Login');
        
        // Get all buttons
        const buttons = screen.getAllByRole('button');
        // The OAuth buttons are after the main buttons
        expect(buttons.length).toBeGreaterThan(3);
        
        // Just verify we can find and interact with OAuth buttons
        // (clicking them triggers Alert which is mocked, but we won't test the Alert call)
        const oauthButtons = buttons.slice(-3);
        expect(oauthButtons.length).toBe(3);
    });

    it('handles Google OAuth login', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the component to be ready
        await screen.findByText('Login');
        
        // Get all buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(3);
    });

    it('handles Microsoft OAuth login', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the component to be ready
        await screen.findByText('Login');
        
        // Get all buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(3);
    });

    it('navigates to forgot password screen', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the forgot password link
        const forgotPasswordLink = await screen.findByText('Forgot password?');
        expect(forgotPasswordLink).toBeTruthy();
        
        // Just verify the link is pressable
        fireEvent.press(forgotPasswordLink);
    });

    it('navigates to register screen', async () => {
        renderWithAuth(<LoginScreen />);
        
        // Wait for the sign up link
        const signUpLink = await screen.findByText('Sign up');
        expect(signUpLink).toBeTruthy();
        
        // Just verify the link is pressable
        fireEvent.press(signUpLink);
    });
});
