import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const USER_TOKEN_KEY = 'userToken';

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

  clearToken: async (): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(USER_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(USER_TOKEN_KEY);
    }
  },
};
