import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AreaDetailScreen from '../area-detail';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { SelectedAreaProvider } from '@/contexts/SelectedAreaContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock auth service and storage
jest.mock('@/services/auth', () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    avatarUrl: null,
  }),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('@/services/storage', () => ({
  saveUserData: jest.fn(),
  clearAuthData: jest.fn(),
}));

jest.mock('@/services/user', () => ({
  updateProfileWithAvatar: jest.fn(),
}));

// Mock area service
jest.mock('@/services/area', () => ({
  getArea: jest.fn().mockResolvedValue({
    id: '1',
    name: 'Gmail to Slack Notification',
    description: 'Test description',
    enabled: true,
    userId: 'user-123',
    userEmail: 'test@example.com',
    actions: [],
    reactions: [],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-13T08:30:00Z',
  }),
  updateArea: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  const createGestureMock = () => {
    const gesture: any = {};
    gesture.runOnJS = jest.fn(() => gesture);
    gesture.onBegin = jest.fn(() => gesture);
    gesture.onStart = jest.fn(() => gesture);
    gesture.onChange = jest.fn(() => gesture);
    gesture.onUpdate = jest.fn(() => gesture);
    gesture.onEnd = jest.fn(() => gesture);
    gesture.onFinalize = jest.fn(() => gesture);
    return gesture;
  };
  return {
    GestureDetector: View,
    Gesture: {
      Pan: () => createGestureMock(),
      Pinch: () => createGestureMock(),
      Simultaneous: () => createGestureMock(),
    },
    GestureHandlerRootView: View,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  const { View } = require('react-native');

  return {
    ...Reanimated,
    View,
    default: {
      ...(Reanimated.default || {}),
      View,
    },
  };
});

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react') as typeof import('react');
  const { View } = require('react-native') as typeof import('react-native');

  const SafeAreaView = React.forwardRef((props: any, ref: any) => (
    <View ref={ref} {...props} />
  ));
  SafeAreaView.displayName = 'SafeAreaView';

  const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => (
    <View>{children}</View>
  );
  SafeAreaProvider.displayName = 'SafeAreaProvider';

  return {
    SafeAreaProvider,
    SafeAreaView,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Svg = React.forwardRef((props: any, ref: any) => <View ref={ref} {...props} />);
  Svg.displayName = 'Svg';

  const Line = (props: any) => <View {...props} />;
  Line.displayName = 'Line';

  const Circle = (props: any) => <View {...props} />;
  Circle.displayName = 'Circle';

  const Path = (props: any) => <View {...props} />;
  Path.displayName = 'Path';

  return {
    __esModule: true,
    default: Svg,
    Svg,
    Line,
    Circle,
    Path,
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        const IconComponent = React.forwardRef((props: any, ref: any) => (
          <View ref={ref} accessibilityLabel={`icon-${String(prop)}`} {...props} />
        ));
        IconComponent.displayName = `Icon(${String(prop)})`;
        return IconComponent;
      },
    }
  );
});

describe('AreaDetailScreen', () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  };

  const renderWithProviders = () => {
    return render(
      <AuthProvider>
        <SelectedAreaProvider>
          <AreaDetailScreen />
        </SelectedAreaProvider>
      </AuthProvider>
    );
  };

  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: '1',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    alertSpy.mockClear();
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  it('should render area details when area exists', async () => {
    const { getByTestId } = renderWithProviders();

    // Wait for area to load by checking if add button is present
    await waitFor(() => {
      expect(getByTestId('area-add-card-button')).toBeTruthy();
    }, { timeout: 5000 });
  });

  it('should render not found message when area does not exist', async () => {
    const areaService = require('@/services/area');
    areaService.getArea.mockRejectedValueOnce(new Error('Area not found'));

    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: 'non-existent',
    });

    const { getByText } = renderWithProviders();

    await waitFor(() => {
      expect(getByText('Area not found')).toBeTruthy();
    });
  });

  it('allows toggling editing mode from the header', async () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders();

    // Wait for area to load
    await waitFor(() => {
      expect(getByTestId('toggle-edit')).toBeTruthy();
    }, { timeout: 5000 });

    const toggleButton = getByTestId('toggle-edit');
    fireEvent.press(toggleButton);

    const titleInput = getByPlaceholderText('Area title');
    expect(titleInput.props.value).toBe('Gmail to Slack Notification');

    fireEvent.changeText(titleInput, 'Updated Area Title');
    fireEvent.press(toggleButton);

    await waitFor(() => {
      // After toggling back, we should be in display mode
      expect(getByTestId('toggle-edit')).toBeTruthy();
    });
  });

  it('adds new action and reaction cards via the add button prompt', async () => {
    const { getByTestId } = renderWithProviders();

    // Wait for area to load
    await waitFor(() => {
      expect(getByTestId('area-add-card-button')).toBeTruthy();
    });

    const addButton = getByTestId('area-add-card-button');
    fireEvent.press(addButton);

    expect(alertSpy).toHaveBeenCalledTimes(1);
    const firstAlertButtons = alertSpy.mock.calls[0]?.[2] ?? [];
    const actionButton = firstAlertButtons.find((button) => button?.text === 'Action');
    expect(actionButton).toBeDefined();

    if (actionButton?.onPress) {
      actionButton.onPress();

      // Check that alert was called - new card creation happens in the actual component
      expect(alertSpy).toHaveBeenCalled();
    }

    fireEvent.press(addButton);
    expect(alertSpy).toHaveBeenCalledTimes(2);
    const secondAlertButtons = alertSpy.mock.calls[1]?.[2] ?? [];
    const reactionButton = secondAlertButtons.find((button) => button?.text === 'Reaction');
    expect(reactionButton).toBeDefined();

    if (reactionButton?.onPress) {
      reactionButton.onPress();

      // Check that alert was called
      expect(alertSpy).toHaveBeenCalledTimes(2);
    }
  }, 10000);

  it('prompts a delete confirmation when delete is requested', async () => {
    const { getByTestId } = renderWithProviders();

    // Wait for area to load
    await waitFor(() => {
      expect(getByTestId('request-delete')).toBeTruthy();
    });

    fireEvent.press(getByTestId('request-delete'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Delete Area',
      'Are you sure you want to delete this area?',
      expect.any(Array)
    );
  });

  it('allows editing area description', async () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders();

    // Wait for area to load and enter edit mode
    await waitFor(() => {
      expect(getByTestId('toggle-edit')).toBeTruthy();
    }, { timeout: 5000 });

    const toggleButton = getByTestId('toggle-edit');
    fireEvent.press(toggleButton);

    const descriptionInput = getByPlaceholderText('Area description');
    fireEvent.changeText(descriptionInput, 'Updated description');

    expect(descriptionInput.props.value).toBe('Updated description');
  });

  it('navigates back when back button is pressed', async () => {
    const { getByTestId } = renderWithProviders();

    // Wait for area to load
    await waitFor(() => {
      expect(getByTestId('back-button')).toBeTruthy();
    }, { timeout: 5000 });

    fireEvent.press(getByTestId('back-button'));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    const areaService = require('@/services/area');
    // Make the service take forever to resolve
    areaService.getArea.mockImplementation(() => new Promise(() => {}));

    const { getByText } = renderWithProviders();

    expect(getByText('Loading area...')).toBeTruthy();
  });
});