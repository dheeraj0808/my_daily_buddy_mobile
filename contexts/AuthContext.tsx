import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getProfile, type UserProfile } from '@/services/profileAPI';
import { storage } from '@/utils/storage';
import { isAuthError } from '@/utils/errors';
import { onSessionExpired } from '@/utils/sessionEvents';
import { usePushNotifications } from '@/hooks/use-push-notifications';

interface AuthContextValue {
  isAuthenticated: boolean;
  isReady: boolean;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const signOut = useCallback(async () => {
    await storage.clearToken();
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      setIsAuthenticated(true);
    } catch (err) {
      if (isAuthError(err)) {
        await signOut();
      } else {
        setProfile(null);
      }
    }
  }, [signOut]);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getToken();
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        await refreshProfile();
      } finally {
        setIsReady(true);
      }
    })();
  }, [refreshProfile]);

  useEffect(() => {
    return onSessionExpired(() => {
      void (async () => {
        await signOut();
        router.replace('/(auth)/login');
      })();
    });
  }, [signOut]);

  usePushNotifications(isReady && isAuthenticated);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isReady,
      profile,
      refreshProfile,
      signOut,
      setAuthenticated: setIsAuthenticated,
    }),
    [isAuthenticated, isReady, profile, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
