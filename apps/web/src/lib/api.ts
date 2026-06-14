import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@acm/shared';

/**
 * Axios instance pointed at the NestJS backend. Attaches the access token and
 * transparently refreshes it on 401 using the refresh token.
 */
export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api`,
  withCredentials: true,
});

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('acm_at', token);
    else localStorage.removeItem('acm_at');
  }
}
export function loadAccessToken() {
  if (typeof window !== 'undefined') accessToken = localStorage.getItem('acm_at');
  return accessToken;
}

api.interceptors.request.use((config) => {
  const token = accessToken ?? loadAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config!;
    if (error.response?.status === 401 && !(original as any)._retry) {
      (original as any)._retry = true;
      refreshing ??= refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers!.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('acm_rt') : null;
    if (!refreshToken) return null;
    const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/auth/refresh`,
      { refreshToken },
    );
    const token = data.data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

/** Unwrap the { success, data } envelope and throw on error. */
export async function unwrap<T>(p: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await p;
  if (!data.success || data.data === undefined) {
    throw new Error(data.error?.message ?? 'Request failed');
  }
  return data.data;
}
