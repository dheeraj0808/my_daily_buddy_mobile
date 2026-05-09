import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Mirrors root layout: if a token exists after startup, land on the main tabs dashboard.
 */
export function useInitialAuthRedirect() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let token: string | null = null;
        if (Platform.OS === 'web') {
          token = localStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }
        setIsAuthenticated(!!token);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isReady, isAuthenticated]);

  return { isReady, isAuthenticated };
}
