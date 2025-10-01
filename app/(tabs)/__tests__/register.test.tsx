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
});
