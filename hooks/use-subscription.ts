import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Plan, UserSubscription } from '@/services/subscriptionAPI';
import { getAllPlans, getMySubscription } from '@/services/subscriptionAPI';
import { findFreePlan, isFreePlan, isPremiumSubscription } from '@/utils/premium';
import { getErrorMessage, isAuthError } from '@/utils/errors';

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sub, allPlans] = await Promise.all([getMySubscription(), getAllPlans()]);
      setSubscription(sub);
      setPlans(allPlans);
    } catch (err) {
      if (!isAuthError(err)) setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isPremium = useMemo(() => isPremiumSubscription(subscription), [subscription]);
  const isOnFreePlan = useMemo(
    () => !subscription || isFreePlan(subscription.plan),
    [subscription],
  );
  const freePlan = useMemo(() => findFreePlan(plans), [plans]);

  return {
    subscription,
    plans,
    loading,
    error,
    isPremium,
    isOnFreePlan,
    freePlan,
    reload: load,
    setSubscription,
  };
}
