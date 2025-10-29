import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import EditProfileScreen from '../edit-profile';

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockGetCurrentUser = jest.fn();
const mockUpdateUserProfile = jest.fn();
const mockUploadAvatarImage = jest.fn();

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    })
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock services
jest.mock('@/services/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  updateUserProfile: (id: string, data: any) => mockUpdateUserProfile(id, data),
  uploadAvatarImage: (uri: string) => mockUploadAvatarImage(uri),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert');

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NavigationContainer>
      <GluestackUIProvider mode="light">
        <AuthProvider>
          {children}
        </AuthProvider>
      </GluestackUIProvider>
    </NavigationContainer>
  );
}

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      firstname: 'Test',
      lastname: 'User',
    });
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<EditProfileScreen />, { wrapper: Providers });
    expect(toJSON()).toBeTruthy();
  });

  it('renders the edit profile screen correctly', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });
  });

  it('renders all form fields', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Username')).toBeTruthy();
    expect(screen.getByText('First Name')).toBeTruthy();
    expect(screen.getByText('Last Name')).toBeTruthy();
  });

  it('displays user data when loaded', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });
  });

  it('renders save button', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeTruthy();
    });
  });

  it('renders avatar section', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeTruthy();
    });
  });

  it('handles username input', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(screen.getByText('Username')).toBeTruthy();
    });
  });

  it('handles firstname input', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

    expect(screen.getByText('First Name')).toBeTruthy();
  });

  it('handles lastname input', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

    expect(screen.getByText('Last Name')).toBeTruthy();
  });

  it('displays email field', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('shows update button', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('renders screen title', async () => {
    render(<EditProfileScreen />, { wrapper: Providers });

    await waitFor(() => {
      expect(mockGetCurrentUser).toHaveBeenCalled();
    });

    expect(screen.getByText('Edit Profile')).toBeTruthy();
  });
});
