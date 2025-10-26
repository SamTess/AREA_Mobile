/**
 * OAuth Service
 * Handles OAuth provider loading and initiation
 */

import { getApiUrl } from './api.config';

export interface OAuthProvider {
  providerKey: string;
  providerLabel: string;
  providerLogoUrl: string;
  userAuthUrl?: string;
  clientId?: string;
}

/**
 * Get available OAuth providers from backend
 */
export async function getOAuthProviders(): Promise<OAuthProvider[]> {
  try {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/api/oauth/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OAuth providers');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching OAuth providers:', error);
    return [];
  }
}

/**
 * Get OAuth authorization URL for a provider
 */
export async function getOAuthUrl(providerKey: string): Promise<string> {
  const apiUrl = await getApiUrl();
  return `${apiUrl}/api/oauth/${providerKey.toLowerCase()}/authorize`;
}
