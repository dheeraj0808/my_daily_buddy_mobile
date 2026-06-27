import { useCallback, useEffect, useState } from 'react';

import {
  createReminder,
  deleteReminder,
  listReminders,
  updateReminder,
  type Reminder,
  type RepeatType,
} from '@/services/reminderAPI';
import { getErrorMessage } from '@/utils/errors';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await listReminders();
      setReminders(res.data);
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

  const toggleActive = async (reminder: Reminder) => {
    await updateReminder(reminder.id, { isActive: !reminder.is_active });
    await load(true);
  };

  const addReminder = async (payload: {
    title: string;
    remindAt: string;
    repeatType?: RepeatType;
  }) => {
    await createReminder(payload);
    await load(true);
  };

  const removeReminder = async (id: string) => {
    await deleteReminder(id);
    await load(true);
  };

  return {
    reminders,
    loading,
    refreshing,
    error,
    reload: () => load(),
    refresh: () => load(true),
    toggleActive,
    addReminder,
    removeReminder,
  };
}
