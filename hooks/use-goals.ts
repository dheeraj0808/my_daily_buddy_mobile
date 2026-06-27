import { useCallback, useEffect, useState } from 'react';

import {
  applyProgress,
  createGoal,
  deleteGoal,
  getGoalStats,
  goalProgressPercent,
  listGoals,
  updateGoal,
  type Goal,
  type GoalStats,
  type GoalType,
} from '@/services/goalAPI';
import { getErrorMessage } from '@/utils/errors';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [goalsRes, statsRes] = await Promise.all([listGoals(), getGoalStats()]);
      setGoals(goalsRes.data);
      setStats(statsRes);
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

  const addGoal = async (payload: Parameters<typeof createGoal>[0]) => {
    await createGoal(payload);
    await load(true);
  };

  const logProgress = async (id: string, value: number) => {
    await applyProgress(id, value);
    await load(true);
  };

  const changeStatus = async (id: string, status: 'ACTIVE' | 'PAUSED' | 'ABANDONED') => {
    await updateGoal(id, { status });
    await load(true);
  };

  const removeGoal = async (id: string) => {
    await deleteGoal(id);
    await load(true);
  };

  return {
    goals,
    stats,
    loading,
    refreshing,
    error,
    reload: () => load(),
    refresh: () => load(true),
    addGoal,
    logProgress,
    changeStatus,
    removeGoal,
    goalProgressPercent,
  };
}

export type { GoalType };
