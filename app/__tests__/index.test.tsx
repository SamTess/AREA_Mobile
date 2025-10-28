import { render } from '@testing-library/react-native';
import React from 'react';
import Index from '../index';

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  const { Text } = require('react-native');
  return { ...actual, Redirect: ({ href }: any) => <Text>{`redirect:${href}`}</Text> };
});

describe('Index route', () => {
  it('redirects to tabs', () => {
    const { getByText } = render(<Index />);
    expect(getByText('redirect:/(tabs)')).toBeTruthy();
  });

  it('renders without errors', () => {
    const { toJSON } = render(<Index />);
    expect(toJSON()).toBeTruthy();
  });

  it('performs redirect correctly', () => {
    const { getByText } = render(<Index />);
    const redirectText = getByText('redirect:/(tabs)');
    expect(redirectText).toBeDefined();
    expect(redirectText.props.children).toBe('redirect:/(tabs)');
  });

  it('renders Redirect component', () => {
    const { toJSON } = render(<Index />);
    expect(toJSON()).toMatchSnapshot();
  });
});
