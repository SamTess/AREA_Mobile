import React from 'react';
import { render } from '@testing-library/react-native';

import { Box } from '../index';

describe('Box', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<Box testID="box" />);
    expect(getByTestId('box')).toBeTruthy();
  });

  it('applies className correctly', () => {
    const { getByTestId } = render(<Box testID="box" className="bg-red-500" />);
    const box = getByTestId('box');
    expect(box).toBeTruthy();
  });

  it('passes through other props', () => {
    const { getByTestId } = render(<Box testID="box" accessibilityLabel="test label" />);
    const box = getByTestId('box');
    expect(box.props.accessibilityLabel).toBe('test label');
  });
});