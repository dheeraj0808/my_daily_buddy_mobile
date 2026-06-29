import { useCallback, useEffect, useState } from 'react';

import { listNotifications, type AppNotification } from '@/services/notificationAPI';
import { getErrorMessage, isAuthError } from '@/utils/errors';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await listNotifications();
      setNotifications(res.data);
    } catch (err) {
      if (!isAuthError(err)) {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    notifications,
    loading,
    refreshing,
    error,
    reload: () => load(),
    refresh: () => load(true),
  };
}
