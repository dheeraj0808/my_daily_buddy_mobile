import { useCallback, useEffect, useState } from 'react';

import {
  applyCatchupChoice,
  createCatchupDraft,
  listCatchupPlans,
  type CatchupPlan,
} from '@/services/catchupAPI';
import { getErrorMessage, isAuthError } from '@/utils/errors';

export function useCatchUp() {
  const [plans, setPlans] = useState<CatchupPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premiumRequired, setPremiumRequired] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    setPremiumRequired(false);

    try {
      const res = await listCatchupPlans();
      setPlans(res.data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setPremiumRequired(true);
        setPlans([]);
      } else if (!isAuthError(err)) {
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

  const generateDraft = async () => {
    await createCatchupDraft();
    await load(true);
  };

  const acceptPlan = async (planId: string, adjustmentIds?: string[]) => {
    await applyCatchupChoice({ planId, choice: 'ACCEPT', adjustmentIds });
    await load(true);
  };

  const rejectPlan = async (planId: string) => {
    await applyCatchupChoice({ planId, choice: 'REJECT' });
    await load(true);
  };

  return {
    plans,
    loading,
    refreshing,
    error,
    premiumRequired,
    reload: () => load(),
    refresh: () => load(true),
    generateDraft,
    acceptPlan,
    rejectPlan,
  };
}
