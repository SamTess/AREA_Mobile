/**
 * Authenticated Fetch Service
 * Wrapper around fetch that automatically includes cookies from WebView
 */

import { getApiUrl } from './api.config';
import { getCookieHeader, getAuthTokenFromCookies } from './cookieManager';
import * as storage from './storage';

export interface FetchOptions extends RequestInit {
  useCookies?: boolean; // Default: true
  useBearer?: boolean;  // Default: false (fallback if no cookies)
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

  // Try to use cookies first (WebView OAuth)
  if (useCookies) {
    const cookieHeader = await getCookieHeader();
    if (cookieHeader) {
      requestHeaders['Cookie'] = cookieHeader;
      console.log('🍪 Using cookies for request');
    } else if (useBearer) {
      // Fallback to Bearer token if no cookies and useBearer is true
      const token = await storage.getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Using Bearer token (fallback)');
      }
    }
  } else if (useBearer) {
    // Use Bearer token explicitly
    const token = await storage.getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Using Bearer token');
    }
  }

  return fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
    credentials: 'include', // Important for cookies
  });
}

/**
 * Check if user is authenticated (has cookies or token)
 */
export async function isAuthenticated(): Promise<boolean> {
  // Check cookies first
  const cookieToken = await getAuthTokenFromCookies();
  if (cookieToken) {
    return true;
  }
  
  // Fallback to stored token
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
