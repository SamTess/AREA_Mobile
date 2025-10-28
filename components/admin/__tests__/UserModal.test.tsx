import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import UserModal from '../UserModal';
import * as adminService from '@/services/admin';
import type { User } from '@/types/admin';

// Mock services
jest.mock('@/services/admin', () => ({
  getUserById: jest.fn(),
}));

// Mock react-i18next
const mockT = (key: string, defaultValue?: string) => defaultValue || key;
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock hooks
jest.mock('@/hooks/useThemeColors', () => ({
  useThemeColors: () => ({
    background: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#e5e5e5',
    backgroundSecondary: '#f5f5f5',
    primary: '#3b82f6',
  }),
}));

describe('UserModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockGetUserById = adminService.getUserById as jest.MockedFunction<typeof adminService.getUserById>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders modal when visible', () => {
    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    expect(screen.getByText('admin.modal.addTitle')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    render(
      <UserModal
        visible={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    // Modal should not be visible
    expect(screen.queryByText('admin.modal.addTitle')).toBeNull();
  });

  it('renders edit title when user is provided', async () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
    };

    mockGetUserById.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
    });

    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={mockUser}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('admin.modal.editTitle')).toBeTruthy();
    });
  });

  it('loads user data when editing', async () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
    };

    mockGetUserById.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      profileData: {
        firstName: 'John',
        lastName: 'Doe',
      },
    } as any);

    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={mockUser}
      />
    );

    await waitFor(() => {
      expect(mockGetUserById).toHaveBeenCalledWith('1');
    });
  });

  it('handles user data loading error', async () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
    };

    mockGetUserById.mockRejectedValue(new Error('Failed to load'));

    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={mockUser}
      />
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('admin.modal.loadError');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('closes modal when close button is pressed', async () => {
    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    const closeButton = screen.getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates required first name', async () => {
    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('admin.modal.firstNamePlaceholder')).toBeTruthy();
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'admin.modal.validationError',
        'admin.modal.firstNameRequired'
      );
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates required last name', async () => {
    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      fireEvent.changeText(firstNameInput, 'John');
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'admin.modal.validationError',
        'admin.modal.lastNameRequired'
      );
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates required email', async () => {
    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      const lastNameInput = screen.getByPlaceholderText('admin.modal.lastNamePlaceholder');
      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'admin.modal.validationError',
        'admin.modal.emailRequired'
      );
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      const lastNameInput = screen.getByPlaceholderText('admin.modal.lastNamePlaceholder');
      const emailInput = screen.getByPlaceholderText('admin.modal.emailPlaceholder');
      const passwordInput = screen.getByPlaceholderText('admin.modal.passwordPlaceholder');
      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'admin.modal.validationError',
        'admin.modal.emailInvalid'
      );
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates password for new user', async () => {
    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      const lastNameInput = screen.getByPlaceholderText('admin.modal.lastNamePlaceholder');
      const emailInput = screen.getByPlaceholderText('admin.modal.emailPlaceholder');
      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'admin.modal.validationError',
        'admin.modal.passwordRequired'
      );
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data for new user', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      const lastNameInput = screen.getByPlaceholderText('admin.modal.lastNamePlaceholder');
      const emailInput = screen.getByPlaceholderText('admin.modal.emailPlaceholder');
      const passwordInput = screen.getByPlaceholderText('admin.modal.passwordPlaceholder');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        isAdmin: false,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('submits form with admin role', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      const lastNameInput = screen.getByPlaceholderText('admin.modal.lastNamePlaceholder');
      const emailInput = screen.getByPlaceholderText('admin.modal.emailPlaceholder');
      const passwordInput = screen.getByPlaceholderText('admin.modal.passwordPlaceholder');

      fireEvent.changeText(firstNameInput, 'Admin');
      fireEvent.changeText(lastNameInput, 'User');
      fireEvent.changeText(emailInput, 'admin@example.com');
      fireEvent.changeText(passwordInput, 'admin123');
    });

    // Toggle admin switch
    const adminSwitch = screen.getByRole('switch');
    fireEvent(adminSwitch, 'valueChange', true);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          isAdmin: true,
        })
      );
    });
  });

  it('handles submit error', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Submit failed'));

    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      const lastNameInput = screen.getByPlaceholderText('admin.modal.lastNamePlaceholder');
      const emailInput = screen.getByPlaceholderText('admin.modal.emailPlaceholder');
      const passwordInput = screen.getByPlaceholderText('admin.modal.passwordPlaceholder');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to save user. Please try again.');
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('updates existing user without password', async () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
    };

    mockGetUserById.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
    });

    mockOnSubmit.mockResolvedValue(undefined);

    render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={mockUser}
      />
    );

    await waitFor(() => {
      expect(mockGetUserById).toHaveBeenCalled();
    });

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
        })
      );
    });
  });

  it('resets form when modal is closed and reopened', async () => {
    const { rerender } = render(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      fireEvent.changeText(firstNameInput, 'John');
    });

    // Close modal
    rerender(
      <UserModal
        visible={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    // Reopen modal
    rerender(
      <UserModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        user={null}
      />
    );

    await waitFor(() => {
      const firstNameInput = screen.getByPlaceholderText('admin.modal.firstNamePlaceholder');
      expect(firstNameInput.props.value).toBe('');
    });
  });
});
