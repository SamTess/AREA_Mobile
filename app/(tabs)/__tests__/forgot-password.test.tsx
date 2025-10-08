import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import ForgotPasswordScreen from '../forgot-password';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock auth service
const mockForgotPassword = jest.fn();
jest.mock('@/services/auth', () => ({
    forgotPassword: (email: string) => mockForgotPassword(email),
}));

// Mock Alert
jest.spyOn(require('react-native').Alert, 'alert');

describe('ForgotPasswordScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<ForgotPasswordScreen />);
        
        expect(screen.getByText('forgotPassword.title')).toBeTruthy();
        expect(screen.getByText('forgotPassword.subtitle')).toBeTruthy();
        expect(screen.getByPlaceholderText('forgotPassword.emailPlaceholder')).toBeTruthy();
        expect(screen.getByText('forgotPassword.sendButton')).toBeTruthy();
        expect(screen.getByText('forgotPassword.backToLogin')).toBeTruthy();
    });

    it('validates email is required', async () => {
        render(<ForgotPasswordScreen />);
        
        const sendButton = screen.getByText('forgotPassword.sendButton');
        fireEvent.press(sendButton);
        
        await waitFor(() => {
            expect(screen.getByText('⚠️ forgotPassword.emailRequired')).toBeTruthy();
        });
    });

    it('validates email format', async () => {
        render(<ForgotPasswordScreen />);
        
        const emailInput = screen.getByPlaceholderText('forgotPassword.emailPlaceholder');
        const sendButton = screen.getByText('forgotPassword.sendButton');
        
        fireEvent.changeText(emailInput, 'invalid-email');
        fireEvent.press(sendButton);
        
        await waitFor(() => {
            expect(screen.getByText('⚠️ forgotPassword.emailInvalid')).toBeTruthy();
        });
    });

    it('sends reset link successfully', async () => {
        mockForgotPassword.mockResolvedValueOnce(undefined);
        
        render(<ForgotPasswordScreen />);
        
        const emailInput = screen.getByPlaceholderText('forgotPassword.emailPlaceholder');
        const sendButton = screen.getByText('forgotPassword.sendButton');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(sendButton);
        
        await waitFor(() => {
            expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
            expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
                'forgotPassword.successTitle',
                'forgotPassword.successMessage',
                expect.any(Array)
            );
        });
    });

    it('handles error when sending reset link fails', async () => {
        mockForgotPassword.mockRejectedValueOnce(new Error('Failed to send email'));
        
        render(<ForgotPasswordScreen />);
        
        const emailInput = screen.getByPlaceholderText('forgotPassword.emailPlaceholder');
        const sendButton = screen.getByText('forgotPassword.sendButton');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(sendButton);
        
        await waitFor(() => {
            expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
            expect(require('react-native').Alert.alert).toHaveBeenCalledWith(
                'forgotPassword.errorTitle',
                'forgotPassword.failedToSendEmail'
            );
        });
    });

    it('navigates back to login when back button is pressed', () => {
        render(<ForgotPasswordScreen />);
        
        const backButton = screen.getByText('forgotPassword.backToLogin');
        fireEvent.press(backButton);
        
        expect(mockPush).toHaveBeenCalledWith('/(tabs)/login');
    });

    it('clears email error when user types', async () => {
        render(<ForgotPasswordScreen />);
        
        const emailInput = screen.getByPlaceholderText('forgotPassword.emailPlaceholder');
        const sendButton = screen.getByText('forgotPassword.sendButton');
        
        // Trigger error
        fireEvent.press(sendButton);
        
        await waitFor(() => {
            expect(screen.getByText('⚠️ forgotPassword.emailRequired')).toBeTruthy();
        });
        
        // Clear error by typing
        fireEvent.changeText(emailInput, 'test@example.com');
        
        await waitFor(() => {
            expect(screen.queryByText('⚠️ forgotPassword.emailRequired')).toBeNull();
        });
    });

    it('shows loading state while sending email', async () => {
        mockForgotPassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        
        render(<ForgotPasswordScreen />);
        
        const emailInput = screen.getByPlaceholderText('forgotPassword.emailPlaceholder');
        const sendButton = screen.getByText('forgotPassword.sendButton');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.press(sendButton);
        
        // Should show ActivityIndicator during loading
        await waitFor(() => {
            expect(screen.getByTestId('activity-indicator')).toBeTruthy();
        });
    });
});
