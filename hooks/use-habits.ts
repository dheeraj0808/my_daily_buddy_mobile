import { useCallback, useEffect, useState } from 'react';

import {
  checkInHabit,
  createHabit,
  deleteHabit,
  getHabitStreak,
  isCompletedToday,
  listHabits,
  undoCheckIn,
  updateHabit,
  type Habit,
  type HabitStreak,
} from '@/services/habitAPI';
import { getErrorMessage, isAuthError } from '@/utils/errors';

const EMPTY_STREAK: HabitStreak = {
  currentStreak: 0,
  longestStreak: 0,
  totalCompletions: 0,
  completionRate: 0,
  lastCompletedDate: null,
};

export interface HabitWithStreak extends Habit {
  streak: HabitStreak;
  completedToday: boolean;
}

async function loadHabitWithStreak(habit: Habit): Promise<HabitWithStreak> {
  try {
    const streak = await getHabitStreak(habit.id);
    return {
      ...habit,
      streak,
      completedToday: isCompletedToday(streak),
    };
  } catch {
    return {
      ...habit,
      streak: EMPTY_STREAK,
      completedToday: false,
    };
  }
}

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await listHabits();
      const withStreaks = await Promise.all(res.data.map(loadHabitWithStreak));
      setHabits(withStreaks);
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

  const runMutation = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  const toggleCheckIn = async (habit: HabitWithStreak) => {
    await runMutation(async () => {
      if (habit.completedToday) {
        await undoCheckIn(habit.id);
      } else {
        await checkInHabit(habit.id);
      }
      await load(true);
    });
  };

  const addHabit = async (payload: Parameters<typeof createHabit>[0]) => {
    await runMutation(async () => {
      await createHabit(payload);
      await load(true);
    });
  };

  const editHabit = async (id: string, payload: Parameters<typeof updateHabit>[1]) => {
    await runMutation(async () => {
      await updateHabit(id, payload);
      await load(true);
    });
  };

  const removeHabit = async (id: string) => {
    await runMutation(async () => {
      await deleteHabit(id);
      await load(true);
    });
  };

  return {
    habits,
    loading,
    refreshing,
    error,
    reload: () => load(),
    refresh: () => load(true),
    toggleCheckIn,
    addHabit,
    editHabit,
    removeHabit,
  };
}
