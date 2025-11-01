import { render } from '@testing-library/react-native';
import React from 'react';
import Index from '../index';

const mockReact = require('react');
const mockRN = require('react-native');

jest.mock('expo-router', () => ({
  Redirect: ({ href }: any) => mockReact.createElement(mockRN.Text, {}, `redirect:${href}`),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

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
