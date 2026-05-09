import axios from 'axios';

import { getApiBaseUrl } from '@/constants/config';
import { storage } from '@/utils/storage';

/**
 * Base URL: see `constants/config.ts` (`EXPO_PUBLIC_API_URL` or `expo.extra.apiUrl`).
 * Device testing: point EXPO_PUBLIC_API_URL at your machine (e.g. http://192.168.x.x:5001/api).
 */

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT Bearer token from secure storage
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for easy debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
