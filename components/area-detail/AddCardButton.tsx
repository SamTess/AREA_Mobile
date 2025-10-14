import React, { useCallback, useEffect } from 'react';
import { Alert, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AddCardButtonProps {
  isRemoveZoneActive: boolean;
  onAddAction: () => void;
  onAddReaction: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AddCardButton({
  isRemoveZoneActive,
  onAddAction,
  onAddReaction,
  style,
  testID,
}: AddCardButtonProps) {
  const highlight = useSharedValue(0);

  useEffect(() => {
    highlight.value = withTiming(isRemoveZoneActive ? 1 : 0, {
      duration: 160,
    });
  }, [highlight, isRemoveZoneActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      highlight.value,
      [0, 1],
      ['#2563eb', '#1e3a8a']
    ),
    transform: [
      {
        scale: 1 - highlight.value * 0.05,
      },
    ],
  }));

  const handlePress = useCallback(() => {
    Alert.alert(
      'Add Card',
      'What type of card do you want to add?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Action',
          onPress: onAddAction,
        },
        {
          text: 'Reaction',
          onPress: onAddReaction,
        },
      ]
    );
  }, [onAddAction, onAddReaction]);

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      className="rounded-full p-4 shadow-lg"
      style={[animatedStyle, style]}
      testID={testID}
    >
      <Plus size={24} color="white" />
    </AnimatedTouchableOpacity>
  );
}
