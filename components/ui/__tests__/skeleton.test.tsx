import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { act } from 'react-test-renderer';
import { Skeleton, SkeletonText } from '../skeleton';

// Mock useDesignTokens
jest.mock('../hooks/useDesignTokens', () => ({
  useDesignTokens: () => ({
    getToken: (token: string) => {
      const tokens: Record<string, string> = {
        'gray-200': '#e5e7eb',
        'background-100': '#f2f1f1',
      };
      return tokens[token] || '#000000';
    },
  }),
}));

describe('Skeleton', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });
  
  it('renders when loaded with children', () => {
    const { toJSON } = render(
      <Skeleton isLoaded testID="skeleton">
        <Text>content</Text>
      </Skeleton>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders children when loaded', () => {
    render(
      <Skeleton isLoaded>
        <Text>loaded</Text>
      </Skeleton>
    );
    expect(screen.getByText('loaded')).toBeTruthy();
  });

  it('supports variants with loaded state', () => {
    const { toJSON } = render(
      <Skeleton variant="rounded" testID="v" isLoaded>
        <Text>content</Text>
      </Skeleton>
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(toJSON()).toBeTruthy();
  });
});

describe('SkeletonText', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });
  
  it('renders when loaded with children', () => {
    const { toJSON } = render(
      <SkeletonText isLoaded testID="skeleton-text">
        <Text>content</Text>
      </SkeletonText>
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders children when loaded', () => {
    render(
      <SkeletonText isLoaded>
        <Text>text-loaded</Text>
      </SkeletonText>
    );
    expect(screen.getByText('text-loaded')).toBeTruthy();
  });
});
