import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewProps } from 'react-native';

type SkeletonVariant = 'rounded' | 'sharp' | 'circular';

interface SkeletonProps extends ViewProps {
  variant?: SkeletonVariant;
  isLoaded?: boolean;
  speed?: number;
  startColor?: string;
}

interface SkeletonTextProps extends ViewProps {
  _lines?: number;
  gap?: number;
  isLoaded?: boolean;
  speed?: number;
  startColor?: string;
}

const getDuration = (speed = 2) => {
  switch (speed) {
    case 1:
      return 750;
    case 2:
      return 1000;
    case 3:
      return 1500;
    default:
      return 2000;
  }
};

const Skeleton = React.forwardRef<View, SkeletonProps>(
  ({ variant = 'rounded', isLoaded = false, speed = 2, startColor, className = '', children, style, ...props }, ref) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (!isLoaded) {
        const duration = getDuration(speed);
        const animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration,
              useNativeDriver: false,
            }),
          ])
        );
        animation.start();

        return () => animation.stop();
      }
    }, [isLoaded, speed, animatedValue]);

    const backgroundColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#E5E7EB', '#F3F4F6'], // gray-200 to gray-100
    });

    const variantClasses = {
      rounded: 'rounded-md',
      sharp: '',
      circular: 'rounded-full',
    };

    if (isLoaded && children) {
      return <View ref={ref}>{children}</View>;
    }

    return (
      <Animated.View
        ref={ref}
        className={`bg-background-200 ${variantClasses[variant]} ${className}`}
        style={[
          {
            backgroundColor,
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

const SkeletonText = React.forwardRef<View, SkeletonTextProps>(
  ({ _lines = 3, gap = 2, isLoaded = false, speed = 2, className = '', children, style, ...props }, ref) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (!isLoaded) {
        const duration = getDuration(speed);
        const animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration,
              useNativeDriver: false,
            }),
          ])
        );
        animation.start();

        return () => animation.stop();
      }
    }, [isLoaded, speed, animatedValue]);

    const backgroundColor = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#E5E7EB', '#F3F4F6'], // gray-200 to gray-100
    });

    const gapClasses = {
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
    };

    if (isLoaded && children) {
      return <View ref={ref}>{children}</View>;
    }

    return (
      <View ref={ref} className={`${gapClasses[gap as keyof typeof gapClasses]} ${className}`} style={style} {...props}>
        {Array.from({ length: _lines }, (_, i) => (
          <Animated.View
            key={i}
            className={`bg-background-200 rounded-md h-3 ${i === _lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={{
              backgroundColor,
            }}
          />
        ))}
      </View>
    );
  }
);

Skeleton.displayName = 'Skeleton';
SkeletonText.displayName = 'SkeletonText';

export {
  Skeleton,
  SkeletonText
};

export type {
  SkeletonProps,
  SkeletonTextProps
};
