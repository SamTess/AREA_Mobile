import { API_CONFIG, HTTP_METHODS } from './api.config';
import { getCookies, saveCookies } from './storage';

interface QueryParams {
  [key: string]: string | number | boolean | null | undefined;
}

interface ApiRequestOptions {
  method?: string;
  params?: QueryParams;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(path, API_CONFIG.BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
}

/**
 * Request interceptor: Adds stored cookies to outgoing requests
 */
async function requestInterceptor(headers: Record<string, string>): Promise<Record<string, string>> {
  const storedCookies = await getCookies();

  if (storedCookies) {
    return {
      ...headers,
      Cookie: storedCookies,
    };
  }

  return headers;
}

/**
 * Response interceptor: Extracts and stores cookies from responses
 */
async function responseInterceptor(response: Response): Promise<void> {
  const setCookieHeader = response.headers.get('set-cookie');

  if (setCookieHeader) {
    // Parse and store cookies
    const cookies = parseCookies(setCookieHeader);
    if (cookies) {
      await saveCookies(cookies);
    }
  }
}

/**
 * Parses Set-Cookie header and extracts cookie values
 */
function parseCookies(setCookieHeader: string): string {
  // Split multiple cookies if present
  const cookieStrings = setCookieHeader.split(',').map(cookie => cookie.trim());

  // Extract just the cookie name=value pairs (before the first semicolon)
  const cookies = cookieStrings
    .map(cookie => {
      const parts = cookie.split(';');
      return parts[0].trim();
    })
    .filter(Boolean)
    .join('; ');

  return cookies;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  if (response.status === 204) {
    return null;
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    console.warn('Failed to parse JSON response', error);
    return null;
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = HTTP_METHODS.GET, params, headers, body, signal } = options;
  const url = buildUrl(path, params);

  const hasBody = body !== undefined && body !== null;

  // Apply request interceptor to add cookies
  const interceptedHeaders = await requestInterceptor({
    ...API_CONFIG.HEADERS,
    ...(headers || {}),
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
  });

  const requestInit: RequestInit = {
    method,
    signal,
    credentials: 'include',
    headers: interceptedHeaders,
    body: hasBody ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, requestInit);

  // Apply response interceptor to extract and store cookies
  await responseInterceptor(response);

  const data = await parseJson<T>(response);

  if (!response.ok) {
    const message = (data as unknown as { message?: string })?.message;
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (data === null || data === undefined) {
    return undefined as T;
  }

  return data as T;
}

export function get<T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.GET });
}

export function post<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.POST, body });
}

export function put<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.PUT, body });
}

export function patch<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.PATCH, body });
}

export function del<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return request<T>(path, { ...options, method: HTTP_METHODS.DELETE });
}

export const apiClient = {
  request,
  get,
  post,
  put,
  patch,
  delete: del,
};
