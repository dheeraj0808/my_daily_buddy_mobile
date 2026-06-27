import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getProfile, type UserProfile } from '@/services/profileAPI';
import { storage } from '@/utils/storage';

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

  const refreshProfile = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getToken();
        const authed = !!token;
        setIsAuthenticated(authed);
        if (authed) {
          await refreshProfile();
        }
      } finally {
        setIsReady(true);
      }
    })();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await storage.clearToken();
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

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
