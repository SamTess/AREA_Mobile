import { AuthProvider } from '@/contexts/AuthContext';
import '@testing-library/jest-native/extend-expect';



import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import RegisterScreen from '../register';

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Mock auth service
const mockRegister = jest.fn();
const mockGetCurrentUser = jest.fn(() => Promise.resolve(null));
jest.mock('@/services/auth', () => ({
    register: (payload: any) => mockRegister(payload),
    getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock secure store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Ensure Alert.alert is present and mocked
(Alert as any).alert = jest.fn();

// Helper to wrap with AuthProvider
const renderWithAuth = (component: React.ReactElement) => {
    return render(<AuthProvider>{component}</AuthProvider>);
};

// Mock the AuthContext hook to avoid provider bootstrap side-effects
jest.mock('@/contexts/AuthContext', () => {
    return {
        useAuth: () => ({
            register: (email: string, password: string, firstName: string, lastName: string, username: string) => mockRegister({ email, password, firstName, lastName, username }),
            isLoading: false,
            clearError: jest.fn(),
        }),
        AuthProvider: ({ children }: any) => children,
    };
});

describe('RegisterScreen', () => {
    beforeEach(() => {
            mockRegister.mockReset();
            mockGetCurrentUser.mockReset();
            mockGetCurrentUser.mockImplementation(() => Promise.resolve(null));
            mockRegister.mockImplementation(() => Promise.resolve({ user: { id: '1', email: 'john@example.com' } }));
    });

    it('renders the registration form and placeholders', async () => {
        renderWithAuth(<RegisterScreen />);

    // Wait for the header to appear
    expect(await screen.findByRole('header')).toBeTruthy();

        expect(screen.getByPlaceholderText('John')).toBeTruthy();
        expect(screen.getByPlaceholderText('Doe')).toBeTruthy();
        expect(screen.getByPlaceholderText('example@email.com')).toBeTruthy();
        expect(screen.getAllByPlaceholderText('••••••••').length).toBeGreaterThanOrEqual(2);
    });

    it('allows typing and shows validation when fields are empty', async () => {
        renderWithAuth(<RegisterScreen />);

    const signUpButton = await screen.findByTestId('register-submit');
    fireEvent.press(signUpButton);

        // After pressing without filling, errors should be shown (we check for any error text)
        expect(await screen.findByText(/Enter your first name|Email is required/i)).toBeTruthy();
    });

    it('shows password mismatch error', async () => {
        renderWithAuth(<RegisterScreen />);

        const firstName = screen.getByPlaceholderText('John');
        const lastName = screen.getByPlaceholderText('Doe');
        const email = screen.getByPlaceholderText('example@email.com');
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');

        fireEvent.changeText(firstName, 'John');
        fireEvent.changeText(lastName, 'Doe');
        fireEvent.changeText(email, 'test@example.com');
        fireEvent.changeText(passwordInputs[0], 'password123');
        fireEvent.changeText(passwordInputs[1], 'different');
        const usernameInput = screen.getByPlaceholderText('Choose a username');
        fireEvent.changeText(usernameInput, 'johndoe');

    const signUpButton = await screen.findByTestId('register-submit');
    fireEvent.press(signUpButton);

    // i18n is not initialized in tests; the component shows the literal error text
    expect(await screen.findByText(/Passwords do not match/i)).toBeTruthy();
    });

    it('submits the form successfully when valid', async () => {
        mockRegister.mockResolvedValueOnce({ ok: true });

        renderWithAuth(<RegisterScreen />);

        const firstName = screen.getByPlaceholderText('John');
        const lastName = screen.getByPlaceholderText('Doe');
        const email = screen.getByPlaceholderText('example@email.com');
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        const username = screen.getByPlaceholderText('Choose a username');

        fireEvent.changeText(firstName, 'John');
        fireEvent.changeText(lastName, 'Doe');
        fireEvent.changeText(username, 'johndoe');
        fireEvent.changeText(email, 'john@example.com');
        fireEvent.changeText(passwordInputs[0], 'password123');
        fireEvent.changeText(passwordInputs[1], 'password123');

        const signUpButton = await screen.findByTestId('register-submit');
    fireEvent.press(signUpButton);

        await waitFor(() => expect(mockRegister).toHaveBeenCalled());
        expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            email: 'john@example.com',
        }));
    });

    it('shows error for missing first name', async () => {
        renderWithAuth(<RegisterScreen />);

        const signUpButton = await screen.findByTestId('register-submit');
        fireEvent.press(signUpButton);

        expect(await screen.findByText(/First name is required/i)).toBeTruthy();
    });

    it('shows error for short username', async () => {
        renderWithAuth(<RegisterScreen />);

        const username = screen.getByPlaceholderText('Choose a username');
        fireEvent.changeText(username, 'ab');  // Too short (< 3 chars)

        const signUpButton = await screen.findByTestId('register-submit');
        fireEvent.press(signUpButton);

        expect(await screen.findByText(/must be at least 3 characters/i)).toBeTruthy();
    });

    it('shows error for invalid email', async () => {
        renderWithAuth(<RegisterScreen />);

        const email = screen.getByPlaceholderText('example@email.com');
        fireEvent.changeText(email, 'not-an-email');

        const signUpButton = await screen.findByTestId('register-submit');
        fireEvent.press(signUpButton);

        expect(await screen.findByText(/Please enter a valid email/i)).toBeTruthy();
    });

    it('shows error for short password', async () => {
        renderWithAuth(<RegisterScreen />);

        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.changeText(passwordInputs[0], 'short');  // Less than 8 chars

        const signUpButton = await screen.findByTestId('register-submit');
        fireEvent.press(signUpButton);

        expect(await screen.findByText(/Password must be at least 8 characters/i)).toBeTruthy();
    });

    it('shows error for username too long', async () => {
        renderWithAuth(<RegisterScreen />);

        const username = screen.getByPlaceholderText('Choose a username');
        fireEvent.changeText(username, 'a'.repeat(51));  // More than 50 chars

        const signUpButton = await screen.findByTestId('register-submit');
        fireEvent.press(signUpButton);

        expect(await screen.findByText(/must not exceed 50 characters/i)).toBeTruthy();
    });

    it('shows error for first name too short', async () => {
        renderWithAuth(<RegisterScreen />);

        const firstName = screen.getByPlaceholderText('John');
        fireEvent.changeText(firstName, 'A');  // Only 1 char

        const signUpButton = await screen.findByTestId('register-submit');
        fireEvent.press(signUpButton);

        expect(await screen.findByText(/must be at least 2 characters/i)).toBeTruthy();
    });

    it('shows error for last name too short', async () => {
        renderWithAuth(<RegisterScreen />);

        const lastName = screen.getByPlaceholderText('Doe');
        fireEvent.changeText(lastName, 'B');  // Only 1 char

        const signUpButton = await screen.findByTestId('register-submit');
        fireEvent.press(signUpButton);

        expect(await screen.findByText(/must be at least 2 characters/i)).toBeTruthy();
    });
});