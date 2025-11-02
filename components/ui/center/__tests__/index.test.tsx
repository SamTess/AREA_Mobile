import React from 'react';
import { render } from '@testing-library/react-native';

import { Center } from '../index';

describe('Center', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<Center testID="center" />);
    expect(getByTestId('center')).toBeTruthy();
  });

  it('applies className correctly', () => {
    const { getByTestId } = render(<Center testID="center" className="bg-blue-500" />);
    const center = getByTestId('center');
    expect(center).toBeTruthy();
  });

  it('passes through other props', () => {
    const { getByTestId } = render(<Center testID="center" accessibilityLabel="centered content" />);
    const center = getByTestId('center');
    expect(center.props.accessibilityLabel).toBe('centered content');
  });
});