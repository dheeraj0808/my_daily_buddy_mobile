import { router, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Redirects on cold start / auth state change without interrupting in-progress OTP flow.
 */
export function useInitialAuthRedirect() {
  const { isReady, isAuthenticated, refreshProfile } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated) {
      if (inAuthGroup) {
        refreshProfile();
        router.replace('/(tabs)/dashboard');
      }
      return;
    }

    if (!inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isReady, isAuthenticated, refreshProfile, segments]);

  return { isReady, isAuthenticated };
}

/**
 * Protects tab routes — redirects unauthenticated users to login.
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
