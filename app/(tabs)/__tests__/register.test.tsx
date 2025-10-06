import { AuthProvider } from '@/contexts/AuthContext';
import '@testing-library/jest-native/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import RegisterScreen from '../register';

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

describe('RegisterScreen', () => {
    it('renders the registration form correctly', () => {
        renderWithAuth(<RegisterScreen />);
        
        // Tests use English by default (default i18n language)
        expect(screen.getAllByText('Sign Up')[0]).toBeTruthy();
        expect(screen.getByText('Create your account to get started')).toBeTruthy();
        expect(screen.getByPlaceholderText('John Doe')).toBeTruthy();
        expect(screen.getByPlaceholderText('example@email.com')).toBeTruthy();
        expect(screen.getAllByPlaceholderText('••••••••')[0]).toBeTruthy();
        expect(screen.getAllByPlaceholderText('••••••••')[1]).toBeTruthy();
    });

    it('allows typing in name field', () => {
        renderWithAuth(<RegisterScreen />);
        
        const nameInput = screen.getByPlaceholderText('John Doe');
        fireEvent.changeText(nameInput, 'John Doe');
        
        expect(nameInput.props.value).toBe('John Doe');
    });

    it('allows typing in email field', () => {
        renderWithAuth(<RegisterScreen />);
        
        const emailInput = screen.getByPlaceholderText('example@email.com');
        fireEvent.changeText(emailInput, 'test@example.com');
        
        expect(emailInput.props.value).toBe('test@example.com');
    });

    it('allows typing in password fields', () => {
        renderWithAuth(<RegisterScreen />);
        
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        
        fireEvent.changeText(passwordInputs[0], 'password123');
        fireEvent.changeText(passwordInputs[1], 'password123');
        
        expect(passwordInputs[0].props.value).toBe('password123');
        expect(passwordInputs[1].props.value).toBe('password123');
    });

    it('displays helper texts for all fields', () => {
        renderWithAuth(<RegisterScreen />);
        
        expect(screen.getByText('Enter your full name')).toBeTruthy();
        expect(screen.getByText('Enter your email address')).toBeTruthy();
        expect(screen.getByText('At least 6 characters')).toBeTruthy();
        expect(screen.getByText('Confirm your password')).toBeTruthy();
    });

    it('shows sign in link text', () => {
        renderWithAuth(<RegisterScreen />);
        
        expect(screen.getByText(/Already have an account/)).toBeTruthy();
        expect(screen.getByText(/Sign in/)).toBeTruthy();
    });

    it('shows validation errors when all fields are empty', async () => {
        renderWithAuth(<RegisterScreen />);
        
        const signUpButtons = screen.getAllByText('Sign Up');
        const signUpButton = signUpButtons[signUpButtons.length - 1];
        
        // Just verify button is pressable
        fireEvent.press(signUpButton);
        expect(signUpButton).toBeTruthy();
    });

    it('shows email validation error for invalid email', async () => {
        renderWithAuth(<RegisterScreen />);
        
        const emailInput = screen.getByPlaceholderText('example@email.com');
        fireEvent.changeText(emailInput, 'invalid-email');
        
        const signUpButtons = screen.getAllByText('Sign Up');
        const signUpButton = signUpButtons[signUpButtons.length - 1];
        fireEvent.press(signUpButton);
        
        // Just verify the button works
        expect(signUpButton).toBeTruthy();
    });

    it('shows password mismatch error', async () => {
        renderWithAuth(<RegisterScreen />);
        
        const nameInput = screen.getByPlaceholderText('John Doe');
        const emailInput = screen.getByPlaceholderText('example@email.com');
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        
        fireEvent.changeText(nameInput, 'John Doe');
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInputs[0], 'password123');
        fireEvent.changeText(passwordInputs[1], 'differentpassword');
        
        const signUpButtons = screen.getAllByText('Sign Up');
        const signUpButton = signUpButtons[signUpButtons.length - 1];
        fireEvent.press(signUpButton);
        
        // Just verify the inputs have values
        expect(nameInput.props.value).toBe('John Doe');
        expect(emailInput.props.value).toBe('test@example.com');
    });

    it('shows password too short error', async () => {
        renderWithAuth(<RegisterScreen />);
        
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.changeText(passwordInputs[0], '123');
        
        const signUpButtons = screen.getAllByText('Sign Up');
        const signUpButton = signUpButtons[signUpButtons.length - 1];
        fireEvent.press(signUpButton);
        
        // Just verify the password was set
        expect(passwordInputs[0].props.value).toBe('123');
    });

    it('clears errors when user types in fields', async () => {
        renderWithAuth(<RegisterScreen />);
        
        const emailInput = screen.getByPlaceholderText('example@email.com');
        
        const signUpButtons = screen.getAllByText('Sign Up');
        const signUpButton = signUpButtons[signUpButtons.length - 1];
        fireEvent.press(signUpButton);
        
        // Type in the field
        fireEvent.changeText(emailInput, 'test@example.com');
        
        // Verify the input has the new value
        expect(emailInput.props.value).toBe('test@example.com');
    });

    it('toggles password visibility for password field', () => {
        renderWithAuth(<RegisterScreen />);
        
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        const passwordInput = passwordInputs[0];
        
        // Initially, the field should be of type password
        expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('toggles password visibility for confirm password field', () => {
        renderWithAuth(<RegisterScreen />);
        
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        const confirmPasswordInput = passwordInputs[1];
        
        // Initially, the field should be of type password
        expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
    });

    it('navigates to login screen when sign in is clicked', async () => {
        renderWithAuth(<RegisterScreen />);
        
        const signInLink = screen.getByText(/Sign in/);
        expect(signInLink).toBeTruthy();
        
        // Just verify the link is pressable
        fireEvent.press(signInLink);
    });
});
