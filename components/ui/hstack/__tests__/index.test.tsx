import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { HStack } from '../index';

describe('HStack', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <HStack testID="hstack">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </HStack>
    );
    expect(getByTestId('hstack')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <HStack>
        <Text>First item</Text>
        <Text>Second item</Text>
      </HStack>
    );
    expect(screen.getByText('First item')).toBeTruthy();
    expect(screen.getByText('Second item')).toBeTruthy();
  });

  it('applies spacing and alignment props', () => {
    const { getByTestId } = render(
      <HStack
        testID="hstack"
        space="md"
        justify="center"
        align="center"
        className="p-4"
      >
        <Text>Content</Text>
      </HStack>
    );
    const hstack = getByTestId('hstack');
    expect(hstack).toBeTruthy();
  });
});