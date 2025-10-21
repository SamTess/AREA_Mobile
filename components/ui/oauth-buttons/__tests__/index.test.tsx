import { render } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';
import { GithubIcon, GoogleIcon, MicrosoftIcon } from '..';

describe('OAuth Buttons index', () => {
  it('exports the icons', () => {
    // Just ensure that the icons are importable and render without crashing
    const { getByTestId } = render(
      <>
        <View testID="github-wrapper">
          <GithubIcon />
        </View>
        <View testID="google-wrapper">
          <GoogleIcon />
        </View>
        <View testID="microsoft-wrapper">
          <MicrosoftIcon />
        </View>
      </>
    );

    expect(getByTestId('github-wrapper')).toBeTruthy();
    expect(getByTestId('google-wrapper')).toBeTruthy();
    expect(getByTestId('microsoft-wrapper')).toBeTruthy();
  });
});
