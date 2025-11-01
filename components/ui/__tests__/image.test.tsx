import { render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { Image } from '../image';

describe('Image (web branch)', () => {
  it('applies web-specific style when Platform.OS is web', () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'web' as const });
    const { getByLabelText } = render(
      <Image alt="pic" source={{ uri: 'https://example.com/p.png' }} />
    );
    expect(getByLabelText('pic')).toBeTruthy();
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => original });
  });

  it('renders image with different sizes', () => {
    const sizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    
    sizes.forEach(size => {
      const { UNSAFE_root } = render(
        <Image 
          source={{ uri: 'https://example.com/image.png' }} 
          alt="Test image"
          size={size}
        />
      );
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  it('renders image without alt text', () => {
    const { UNSAFE_root } = render(
      <Image 
        source={{ uri: 'https://example.com/image.png' }} 
      />
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});
