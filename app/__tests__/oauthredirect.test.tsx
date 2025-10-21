import * as authSvc from '@/services/auth';
import { render, waitFor, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import OAuthRedirect from '../oauthredirect';

jest.mock('@/services/auth');

const mockedAuth = authSvc as jest.Mocked<typeof authSvc>;

describe('OAuthRedirect', () => {
  beforeEach(() => {
    jest.spyOn(router, 'replace').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('falls back to getCurrentUser when completeOAuthRedirect throws', async () => {
    mockedAuth.completeOAuthRedirect.mockRejectedValueOnce(new Error('server 500'));
    mockedAuth.getCurrentUser.mockResolvedValueOnce({ id: '123', name: 'Test User' } as any);

    render(<OAuthRedirect />);

    // Wait for at least one success message from fallback
    await waitFor(() => {
      const matches = screen.getAllByText(/Authentication successful|Authentication completed/);
      expect(matches.length).toBeGreaterThan(0);
    });

  expect(mockedAuth.completeOAuthRedirect).toHaveBeenCalled();
  expect(mockedAuth.getCurrentUser).toHaveBeenCalled();
  // router.replace is called after a short timeout; wait for it
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(tabs)'));
  });
});
