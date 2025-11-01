import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { VStack } from '../index';

describe('VStack', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <VStack testID="vstack">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </VStack>
    );
    expect(getByTestId('vstack')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <VStack>
        <Text>Top item</Text>
        <Text>Bottom item</Text>
      </VStack>
    );
    expect(screen.getByText('Top item')).toBeTruthy();
    expect(screen.getByText('Bottom item')).toBeTruthy();
  });

  it('applies spacing and reversed props', () => {
    const { getByTestId } = render(
      <VStack
        testID="vstack"
        space="lg"
        reversed={true}
        className="p-4"
      >
        <Text>Content</Text>
      </VStack>
    );
    const vstack = getByTestId('vstack');
    expect(vstack).toBeTruthy();
  });
});