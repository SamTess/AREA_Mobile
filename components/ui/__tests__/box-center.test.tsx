import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Box } from '../box';
import { Center } from '../center';

describe('Box', () => {
  it('renders box with children', () => {
    const { getByText } = render(
      <Box>
        <Text>Box Content</Text>
      </Box>
    );
    expect(getByText('Box Content')).toBeTruthy();
  });

  it('renders box with custom className', () => {
    const { getByText } = render(
      <Box className="custom-class">
        <Text>Custom Box</Text>
      </Box>
    );
    expect(getByText('Custom Box')).toBeTruthy();
  });
});

describe('Center', () => {
  it('renders center with children', () => {
    const { getByText } = render(
      <Center>
        <Text>Centered Content</Text>
      </Center>
    );
    expect(getByText('Centered Content')).toBeTruthy();
  });

  it('renders center with custom className', () => {
    const { getByText } = render(
      <Center className="custom-class">
        <Text>Custom Center</Text>
      </Center>
    );
    expect(getByText('Custom Center')).toBeTruthy();
  });
});
