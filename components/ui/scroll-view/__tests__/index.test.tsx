import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScrollView } from '../index';

describe('ScrollView', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <ScrollView testID="scroll-view">
        <Text>Content</Text>
      </ScrollView>
    );
    expect(getByTestId('scroll-view')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <ScrollView>
        <Text>Test content</Text>
      </ScrollView>
    );
    expect(screen.getByText('Test content')).toBeTruthy();
  });

  it('passes through scroll props', () => {
    const { getByTestId } = render(
      <ScrollView
        testID="scroll-view"
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    );
    const scrollView = getByTestId('scroll-view');
    expect(scrollView.props.horizontal).toBe(true);
    expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
  });
});