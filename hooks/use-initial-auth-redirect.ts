import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Redirects based on auth state: authenticated users → dashboard, others → landing.
 */
export function useInitialAuthRedirect() {
  const { isReady, isAuthenticated, refreshProfile } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      refreshProfile();
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(auth)');
    }
  }, [isReady, isAuthenticated, refreshProfile]);

  return { isReady, isAuthenticated };
}

/**
 * Protects tab routes — redirects unauthenticated users to auth landing.
 */
export function useRequireAuth() {
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isReady, isAuthenticated]);

  return { isReady, isAuthenticated };
}
