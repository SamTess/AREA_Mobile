/**
 * OAuth Flow Tests
 * Tests for OAuth authentication using mock services
 */

import {
    MockAPIError,
    mockCompleteOAuthRedirect,
    mockLoginWithOAuth,
} from '../__mocks__/auth.mock';

describe('OAuth Authentication', () => {
  describe('mockLoginWithOAuth', () => {
    it('should successfully login with GitHub', async () => {
      const user = await mockLoginWithOAuth('github', { delay: 0 });

      expect(user).toBeDefined();
      expect(user.email).toBe('user-github@example.com');
      expect(user.name).toBe('Github User');
      expect(user.id).toContain('oauth_github_');
    });

    it('should successfully login with Google', async () => {
      const user = await mockLoginWithOAuth('google', { delay: 0 });

      expect(user).toBeDefined();
      expect(user.email).toBe('user-google@example.com');
      expect(user.name).toBe('Google User');
      expect(user.id).toContain('oauth_google_');
    });

    it('should successfully login with Microsoft', async () => {
      const user = await mockLoginWithOAuth('microsoft', { delay: 0 });

      expect(user).toBeDefined();
      expect(user.email).toBe('user-microsoft@example.com');
      expect(user.name).toBe('Microsoft User');
      expect(user.id).toContain('oauth_microsoft_');
    });

    it('should return user with avatar URL', async () => {
      const user = await mockLoginWithOAuth('github', { delay: 0 });

      expect(user.avatarUrl).toBeDefined();
      expect(user.avatarUrl).toContain('pravatar.cc');
    });

    it('should return user with creation timestamp', async () => {
      const user = await mockLoginWithOAuth('google', { delay: 0 });

      expect(user.createdAt).toBeDefined();
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    });
  });

  describe('mockCompleteOAuthRedirect', () => {
    it('should complete redirect with valid code and provider', async () => {
      const result = await mockCompleteOAuthRedirect(
        {
          code: 'mock_authorization_code_123',
          provider: 'github',
        },
        { delay: 0 }
      );

      expect(result).toBeDefined();
      expect(result.message).toBe('OAuth authentication successful');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('user-github@example.com');
    });

    it('should throw error when code is missing', async () => {
      await expect(
        mockCompleteOAuthRedirect(
          {
            provider: 'github',
          },
          { delay: 0 }
        )
      ).rejects.toThrow(MockAPIError);

      await expect(
        mockCompleteOAuthRedirect(
          {
            provider: 'github',
          },
          { delay: 0 }
        )
      ).rejects.toThrow('Authorization code required');
    });

    it('should handle OAuth error from provider', async () => {
      await expect(
        mockCompleteOAuthRedirect(
          {
            code: 'some_code',
            provider: 'google',
            error: 'access_denied',
            error_description: 'User denied access',
          },
          { delay: 0 }
        )
      ).rejects.toThrow('User denied access');
    });

    it('should handle OAuth error without description', async () => {
      await expect(
        mockCompleteOAuthRedirect(
          {
            code: 'some_code',
            provider: 'microsoft',
            error: 'server_error',
          },
          { delay: 0 }
        )
      ).rejects.toThrow('OAuth authentication failed');
    });

    it('should default to github provider when not specified', async () => {
      const result = await mockCompleteOAuthRedirect(
        {
          code: 'mock_code',
        },
        { delay: 0 }
      );

      expect(result.user.email).toBe('user-github@example.com');
    });

    it('should work with all supported providers', async () => {
      const providers: Array<'github' | 'google' | 'microsoft'> = [
        'github',
        'google',
        'microsoft',
      ];

      for (const provider of providers) {
        const result = await mockCompleteOAuthRedirect(
          {
            code: `mock_code_${provider}`,
            provider,
          },
          { delay: 0 }
        );

        expect(result.message).toBe('OAuth authentication successful');
        expect(result.user.email).toBe(`user-${provider}@example.com`);
      }
    });
  });

  describe('OAuth Error Handling', () => {
    it('should throw MockAPIError with correct status code', async () => {
      try {
        await mockCompleteOAuthRedirect({ provider: 'github' }, { delay: 0 });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(MockAPIError);
        expect((error as MockAPIError).statusCode).toBe(400);
        expect((error as MockAPIError).code).toBe('MISSING_CODE');
      }
    });

    it('should include error code in OAuth errors', async () => {
      try {
        await mockCompleteOAuthRedirect(
          {
            code: 'code',
            error: 'invalid_scope',
          },
          { delay: 0 }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(MockAPIError);
        expect((error as MockAPIError).code).toBe('INVALID_SCOPE');
      }
    });
  });

  describe('Performance', () => {
    it('should respect delay configuration', async () => {
      const startTime = Date.now();
      await mockLoginWithOAuth('github', { delay: 100 });
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it('should complete quickly with zero delay', async () => {
      const startTime = Date.now();
      await mockCompleteOAuthRedirect(
        {
          code: 'mock_code',
          provider: 'google',
        },
        { delay: 0 }
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });
  });
});
