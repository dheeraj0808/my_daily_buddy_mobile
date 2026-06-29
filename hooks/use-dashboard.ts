import { useCallback, useEffect, useState } from 'react';

import { getActiveReminders } from '@/services/reminderAPI';
import { getHabitStreak, listHabits } from '@/services/habitAPI';
import { getTodayTasks, type Task } from '@/services/taskAPI';
import { getErrorMessage, isAuthError } from '@/utils/errors';

export function useDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ habitStreak: 0, reminderCount: 0 });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [tasksRes, reminders, habitsRes] = await Promise.all([
        getTodayTasks(),
        getActiveReminders(),
        listHabits(10),
      ]);

      setTasks(tasksRes.data);
      setStats((s) => ({ ...s, reminderCount: reminders.length }));

      let maxStreak = 0;
      await Promise.all(
        habitsRes.data.slice(0, 5).map(async (h) => {
          try {
            const streak = await getHabitStreak(h.id);
            maxStreak = Math.max(maxStreak, streak.currentStreak);
          } catch {
            /* ignore per-habit errors */
          }
        })
      );
      setStats((s) => ({ ...s, habitStreak: maxStreak }));
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
    tasks,
    loading,
    refreshing,
    error,
    stats,
    reload: () => load(),
    refresh: () => load(true),
  };
}
