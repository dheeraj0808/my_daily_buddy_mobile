import { useCallback, useEffect, useState } from 'react';

import { getDailyFood, type DailyFoodSummary } from '@/services/foodAPI';
import { getHealthSummary, type HealthSummary } from '@/services/healthAPI';
import {
  deleteWaterLog,
  getTodayWater,
  logWater,
  type TodayWaterSummary,
} from '@/services/waterAPI';
import { getErrorMessage, isAuthError } from '@/utils/errors';
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

  const runWaterMutation = async (fn: () => Promise<TodayWaterSummary>) => {
    try {
      const summary = await fn();
      setWater(summary);
      return summary;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  const addGlass = async () => {
    await runWaterMutation(() => logWater(GLASS_ML));
  };

  const setGlasses = async (glasses: number) => {
    const currentGlasses = water ? mlToGlasses(water.totalMl) : 0;
    const diff = glasses - currentGlasses;

    if (diff > 0) {
      await runWaterMutation(() => logWater(diff * GLASS_ML));
      return;
    }

    if (diff < 0) {
      const withLogs = await getTodayWater(true);
      const logs = [...(withLogs.logs ?? [])].sort(
        (a, b) => b.amount_ml - a.amount_ml || 0
      );
      let remaining = Math.abs(diff) * GLASS_ML;
      for (const log of logs) {
        if (remaining <= 0) break;
        await deleteWaterLog(log.id);
        remaining -= log.amount_ml;
      }
      const summary = await getTodayWater();
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
