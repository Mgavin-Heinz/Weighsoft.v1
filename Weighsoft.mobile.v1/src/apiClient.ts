/**
 * apiClient.ts
 *
 * Central HTTP client for talking to the Weighsoft Laravel backend.
 * Handles base URL, JWT token injection, and error parsing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuration ────────────────────────────────────────────────────────────

// For Android emulator, localhost is 10.0.2.2
// For iOS simulator, localhost works
// For a physical device, use your computer's LAN IP (e.g. 192.168.1.x)
//
// Change this to match your setup:
export const API_BASE_URL = 'http://192.168.56.1:8000/api';

const TOKEN_KEY = 'weighsoft:jwt_token';

// ─── Token storage ────────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── API error ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Core request function ────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  /** Skip adding the auth token (for login) */
  skipAuth?: boolean;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add JWT token unless this is a login request
  if (!skipAuth) {
    const token = await getToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body != null ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network error — server unreachable
    throw new ApiError(0, 'Could not reach the server. Check your connection.', err);
  }

  // Parse response body
  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),

  put: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),

  patch: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
