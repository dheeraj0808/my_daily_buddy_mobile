import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { getApiBaseUrl, logApiUrlResolution } from '@/constants/config';
import { storage } from '@/utils/storage';
import { emitSessionExpired } from '@/utils/sessionEvents';

const REQUEST_TIMEOUT_MS = 45_000;
const AUTH_TIMEOUT_MS = 60_000;

const api = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (__DEV__) {
  logApiUrlResolution();
}

api.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrl();

    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await storage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data: result } = await axios.post(
      `${getApiBaseUrl()}/auth/refresh-token`,
      { refresh_token: refreshToken },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    const access = result?.data?.access_token;
    const refresh = result?.data?.refresh_token;
    if (access) {
      if (refresh) {
        await storage.setTokens(access, refresh);
      } else {
        await storage.setToken(access);
      }
      return access;
    }
  } catch {
    await storage.clearToken();
    emitSessionExpired();
  }
  return null;
}

async function handleUnauthorized(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      const newToken = await handleUnauthorized();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      emitSessionExpired();
    }

    if (__DEV__) {
      console.error('[API] Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
export { AUTH_TIMEOUT_MS, REQUEST_TIMEOUT_MS };
