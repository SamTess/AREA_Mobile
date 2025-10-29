/**
 * Authenticated Fetch Service
 * Wrapper around fetch that automatically includes cookies from WebView
 */

import { getApiUrl } from './api.config';
import { getCookieHeader, getAuthTokenFromCookies } from './cookieManager';
import * as storage from './storage';

export interface FetchOptions extends RequestInit {
  useCookies?: boolean;
  useBearer?: boolean;
}

/**
 * Authenticated fetch that uses cookies from WebView
 */
export async function authenticatedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const apiUrl = await getApiUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;
  const {
    useCookies = true,
    useBearer = false,
    headers = {},
    ...fetchOptions
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (useCookies) {
    const cookieHeader = await getCookieHeader();
    if (cookieHeader) {
      requestHeaders['Cookie'] = cookieHeader;
    } else if (useBearer) {
      const token = await storage.getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
  } else if (useBearer) {
    const token = await storage.getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  return fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
    credentials: 'include',
  });
}

/**
 * Check if user is authenticated (has cookies or token)
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieToken = await getAuthTokenFromCookies();
  if (cookieToken) {
    return true;
  }
  const storedToken = await storage.getAccessToken();
  return !!storedToken;
}

/**
 * GET request with authentication
 */
export async function authGet(endpoint: string, options: FetchOptions = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request with authentication
 */
export async function authPost(endpoint: string, body?: any, options: FetchOptions = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request with authentication
 */
export async function authPut(endpoint: string, body?: any, options: FetchOptions = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request with authentication
 */
export async function authDelete(endpoint: string, options: FetchOptions = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * PATCH request with authentication
 */
export async function authPatch(endpoint: string, body?: any, options: FetchOptions = {}) {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}
