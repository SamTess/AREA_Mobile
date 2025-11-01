import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { Pressable } from '../index';

describe('Pressable', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<Pressable testID="pressable" />);
    expect(getByTestId('pressable')).toBeTruthy();
  });

  it('handles onPress events', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Pressable testID="pressable" onPress={onPressMock} />
    );
    const pressable = getByTestId('pressable');
    fireEvent.press(pressable);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('passes through other props', () => {
    const { getByTestId } = render(
      <Pressable
        testID="pressable"
        accessibilityLabel="pressable button"
      />
    );
    const pressable = getByTestId('pressable');
    expect(pressable.props.accessibilityLabel).toBe('pressable button');
  });
});