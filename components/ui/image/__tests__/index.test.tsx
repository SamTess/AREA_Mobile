import React from 'react';
import { render } from '@testing-library/react-native';

import { Image } from '../index';

describe('Image', () => {
  it('renders correctly with source', () => {
    const { getByTestId } = render(
      <Image
        testID="image"
        source={{ uri: 'https://example.com/image.png' }}
      />
    );
    const image = getByTestId('image');
    expect(image).toBeTruthy();
  });

  it('applies alt text as accessibility label', () => {
    const { getByTestId } = render(
      <Image
        testID="image"
        source={{ uri: 'https://example.com/image.png' }}
        alt="Test image"
      />
    );
    const image = getByTestId('image');
    expect(image.props.accessibilityLabel).toBe('Test image');
  });

  it('accepts different sizes', () => {
    const { getByTestId } = render(
      <Image
        testID="image"
        source={{ uri: 'https://example.com/image.png' }}
        size="lg"
      />
    );
    const image = getByTestId('image');
    expect(image).toBeTruthy();
  });

  it('passes through other props', () => {
    const { getByTestId } = render(
      <Image
        testID="image"
        source={{ uri: 'https://example.com/image.png' }}
        resizeMode="cover"
      />
    );
    const image = getByTestId('image');
    expect(image.props.resizeMode).toBe('cover');
  });
});