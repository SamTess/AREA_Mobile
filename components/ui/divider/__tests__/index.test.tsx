import React from 'react';
import { render } from '@testing-library/react-native';

import { Divider } from '../index';

describe('Divider', () => {
  it('renders horizontal divider by default', () => {
    const { getByTestId } = render(<Divider testID="divider" />);
    const divider = getByTestId('divider');
    expect(divider).toBeTruthy();
  });

  it('renders horizontal divider explicitly', () => {
    const { getByTestId } = render(<Divider testID="divider" orientation="horizontal" />);
    const divider = getByTestId('divider');
    expect(divider).toBeTruthy();
  });

  it('renders vertical divider', () => {
    const { getByTestId } = render(<Divider testID="divider" orientation="vertical" />);
    const divider = getByTestId('divider');
    expect(divider).toBeTruthy();
  });

  it('applies custom className', () => {
    const { getByTestId } = render(<Divider testID="divider" className="my-4" />);
    const divider = getByTestId('divider');
    expect(divider).toBeTruthy();
  });

  it('passes through other props', () => {
    const { getByTestId } = render(<Divider testID="divider" accessibilityLabel="section divider" />);
    const divider = getByTestId('divider');
    expect(divider.props.accessibilityLabel).toBe('section divider');
  });
});