import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge, BadgeText } from '../badge';

describe('Badge', () => {
  it('renders badge with text', () => {
    const { getByText } = render(
      <Badge>
        <BadgeText>Test Badge</BadgeText>
      </Badge>
    );
    expect(getByText('Test Badge')).toBeTruthy();
  });

  it('renders badge with different actions', () => {
    const actions = ['error', 'warning', 'success', 'info', 'muted'] as const;
    
    actions.forEach(action => {
      const { getByText } = render(
        <Badge action={action}>
          <BadgeText>{action}</BadgeText>
        </Badge>
      );
      expect(getByText(action)).toBeTruthy();
    });
  });

  it('renders badge with different variants', () => {
    const variants = ['solid', 'outline'] as const;
    
    variants.forEach(variant => {
      const { getByText } = render(
        <Badge variant={variant}>
          <BadgeText>{variant}</BadgeText>
        </Badge>
      );
      expect(getByText(variant)).toBeTruthy();
    });
  });

  it('renders badge with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { getByText } = render(
        <Badge size={size}>
          <BadgeText>{size}</BadgeText>
        </Badge>
      );
      expect(getByText(size)).toBeTruthy();
    });
  });
});
