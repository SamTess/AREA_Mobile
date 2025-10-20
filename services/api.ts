import { API_CONFIG, HTTP_METHODS } from './api.config';

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
  const requestInit: RequestInit = {
    method,
    signal,
    credentials: 'include',
    headers: {
      ...API_CONFIG.HEADERS,
      ...(headers || {}),
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, requestInit);
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
