import React from 'react';
import { render } from '@testing-library/react-native';
import { Divider } from '../divider';

describe('Divider', () => {
  it('renders divider with default orientation (horizontal)', () => {
    const { UNSAFE_root } = render(<Divider />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders divider with vertical orientation', () => {
    const { UNSAFE_root } = render(<Divider orientation="vertical" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders divider with custom className', () => {
    const { UNSAFE_root } = render(<Divider className="custom-class" />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
