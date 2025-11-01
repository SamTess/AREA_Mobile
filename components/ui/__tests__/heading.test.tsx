import React from 'react';
import { render } from '@testing-library/react-native';
import { Heading } from '../heading';

describe('Heading', () => {
  it('renders heading with default size', () => {
    const { getByText } = render(<Heading>Default Heading</Heading>);
    expect(getByText('Default Heading')).toBeTruthy();
  });

  it('renders heading with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;
    
    sizes.forEach(size => {
      const { getByText } = render(<Heading size={size}>Heading {size}</Heading>);
      expect(getByText(`Heading ${size}`)).toBeTruthy();
    });
  });

  it('renders bold heading', () => {
    const { getByText } = render(<Heading bold>Bold Heading</Heading>);
    expect(getByText('Bold Heading')).toBeTruthy();
  });

  it('renders heading with custom className', () => {
    const { getByText } = render(<Heading className="custom-class">Custom Heading</Heading>);
    expect(getByText('Custom Heading')).toBeTruthy();
  });
});
