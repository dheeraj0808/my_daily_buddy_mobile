import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const USER_TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const storage = {
  getToken: async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(USER_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(USER_TOKEN_KEY);
  },

  setToken: async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(USER_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(USER_TOKEN_KEY, token);
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: async (token: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    }
  },

  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    await storage.setToken(accessToken);
    await storage.setRefreshToken(refreshToken);
  },

  clearToken: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(USER_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  },
};
