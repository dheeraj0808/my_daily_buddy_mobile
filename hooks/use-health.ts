import { useCallback, useEffect, useState } from 'react';

import { getDailyFood, type DailyFoodSummary } from '@/services/foodAPI';
import { getHealthSummary, type HealthSummary } from '@/services/healthAPI';
import { getTodayWater, logWater, type TodayWaterSummary } from '@/services/waterAPI';
import { getErrorMessage } from '@/utils/errors';
import { GLASS_ML, mlToGlasses } from '@/utils/timezone';

export function useHealth() {
  const [water, setWater] = useState<TodayWaterSummary | null>(null);
  const [food, setFood] = useState<DailyFoodSummary | null>(null);
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [w, f, h] = await Promise.all([getTodayWater(), getDailyFood(), getHealthSummary()]);
      setWater(w);
      setFood(f);
      setHealth(h);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addGlass = async () => {
    const summary = await logWater(GLASS_ML);
    setWater(summary);
  };

  const setGlasses = async (glasses: number) => {
    const currentGlasses = water ? mlToGlasses(water.totalMl) : 0;
    const diff = glasses - currentGlasses;
    if (diff > 0) {
      const summary = await logWater(diff * GLASS_ML);
      setWater(summary);
    }
  };

  return {
    water,
    food,
    health,
    loading,
    refreshing,
    error,
    reload: () => load(),
    refresh: () => load(true),
    addGlass,
    setGlasses,
  };
}
