import React from 'react';
import { render } from '@testing-library/react-native';
import AreaDetailScreen from '../area-detail';
import { useLocalSearchParams } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  const createPanMock = () => {
    const pan = {
      runOnJS: jest.fn().mockReturnThis(),
      onBegin: jest.fn().mockReturnThis(),
      onStart: jest.fn().mockReturnThis(),
      onChange: jest.fn().mockReturnThis(),
      onUpdate: jest.fn().mockReturnThis(),
      onEnd: jest.fn().mockReturnThis(),
      onFinalize: jest.fn().mockReturnThis(),
    };
    return pan;
  };
  return {
    GestureDetector: View,
    Gesture: {
      Pan: () => createPanMock(),
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
  const Line = (props: any) => <View {...props} />;
  const Circle = (props: any) => <View {...props} />;

  return {
    __esModule: true,
    default: Svg,
    Svg,
    Line,
    Circle,
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
  beforeEach(() => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: '1',
    });
  });

  it('should render area details when area exists', () => {
    const { getByText } = render(<AreaDetailScreen />);

  // Check if area name is displayed
  expect(getByText('Gmail to Slack Notification')).toBeTruthy();
  });

  it('should render not found message when area does not exist', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: 'non-existent',
    });

    const { getByText } = render(<AreaDetailScreen />);

    expect(getByText('Area not found')).toBeTruthy();
  });
});