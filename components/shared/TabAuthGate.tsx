import React from 'react';

import { useRequireAuth } from '@/hooks/use-initial-auth-redirect';
import LoadingState from '@/components/shared/LoadingState';

export default function TabAuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useRequireAuth();

  if (!isReady || !isAuthenticated) {
    return <LoadingState />;
  }

  return <>{children}</>;
}
