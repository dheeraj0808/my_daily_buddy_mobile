import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import FilterChips, { CheckCircle } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useReminders } from '@/hooks/use-reminders';
import { listHabits } from '@/services/habitAPI';
import {
  formatRepeatType,
  isReminderDoneToday,
  REMINDER_COLORS,
  type Reminder,
  type RepeatType,
} from '@/services/reminderAPI';
import { listTasks } from '@/services/taskAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { isPremiumUpgradeError, premiumUpgradeMessage } from '@/utils/premium';
import { formatTime } from '@/utils/timezone';

const FILTERS = ['All', 'Active', 'Inactive'] as const;
const LINK_TYPES = ['None', 'Habit', 'Task'] as const;
const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'NONE', label: 'Once' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];
const WEEKDAY_LABELS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export default function RemindersScreen() {
  const {
    reminders,
    loading,
    refreshing,
    error,
    refresh,
    reload,
    toggleActive,
    addReminder,
    editReminder,
    removeReminder,
    snooze,
    markDone,
  } = useReminders();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [title, setTitle] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [repeatType, setRepeatType] = useState<RepeatType>('DAILY');
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [linkType, setLinkType] = useState<(typeof LINK_TYPES)[number]>('None');
  const [linkedHabitId, setLinkedHabitId] = useState<string | null>(null);
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);
  const [habitOptions, setHabitOptions] = useState<{ id: string; label: string }[]>([]);
  const [taskOptions, setTaskOptions] = useState<{ id: string; label: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [habitsRes, tasksRes] = await Promise.all([listHabits(100), listTasks({ limit: 100 })]);
        if (cancelled) return;
        setHabitOptions(habitsRes.data.map((h) => ({ id: h.id, label: h.name })));
        setTaskOptions(tasksRes.data.map((t) => ({ id: t.id, label: t.title })));
      } catch {
        // Non-blocking
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!modalVisible) return;
    let cancelled = false;
    (async () => {
      try {
        const [habitsRes, tasksRes] = await Promise.all([
          listHabits(100),
          listTasks({ limit: 100, completed: false }),
        ]);
        if (cancelled) return;
        setHabitOptions(habitsRes.data.map((h) => ({ id: h.id, label: h.name })));
        setTaskOptions(tasksRes.data.map((t) => ({ id: t.id, label: t.title })));
      } catch {
        if (!cancelled) {
          setHabitOptions([]);
          setTaskOptions([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modalVisible]);

  const habitNameById = useMemo(
    () => Object.fromEntries(habitOptions.map((h) => [h.id, h.label])),
    [habitOptions],
  );
  const taskNameById = useMemo(
    () => Object.fromEntries(taskOptions.map((t) => [t.id, t.label])),
    [taskOptions],
  );

  const filtered = reminders.filter((r) => {
    if (filter === 'Active') return r.is_active;
    if (filter === 'Inactive') return !r.is_active;
    return true;
  });

  const activeCount = reminders.filter((r) => r.is_active).length;
  const inactiveCount = reminders.length - activeCount;

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setTimeStr('09:00');
    setRepeatType('DAILY');
    setRepeatDays([1, 2, 3, 4, 5]);
    setLinkType('None');
    setLinkedHabitId(null);
    setLinkedTaskId(null);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (r: Reminder) => {
    setEditing(r);
    setTitle(r.title);
    const d = new Date(r.remind_at);
    setTimeStr(
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    );
    setRepeatType(r.repeat_type ?? 'DAILY');
    setRepeatDays(r.repeat_days?.length ? r.repeat_days : [1, 2, 3, 4, 5]);
    if (r.linked_habit_id) {
      setLinkType('Habit');
      setLinkedHabitId(r.linked_habit_id);
      setLinkedTaskId(null);
    } else if (r.linked_task_id) {
      setLinkType('Task');
      setLinkedTaskId(r.linked_task_id);
      setLinkedHabitId(null);
    } else {
      setLinkType('None');
      setLinkedHabitId(null);
      setLinkedTaskId(null);
    }
    setModalVisible(true);
  };

  const buildRemindAt = () => {
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(timeStr.trim());
    if (!match) {
      throw new Error('Enter time as HH:MM (24-hour), e.g. 09:30.');
    }
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const base = editing?.remind_at ? new Date(editing.remind_at) : new Date();
    if (Number.isNaN(base.getTime())) {
      throw new Error('Could not read the reminder date. Try again.');
    }
    const remindAt = new Date(base);
    remindAt.setHours(hours, minutes, 0, 0);
    // New reminders: if time already passed today, schedule tomorrow.
    if (!editing && remindAt.getTime() < Date.now()) {
      remindAt.setDate(remindAt.getDate() + 1);
    }
    return remindAt.toISOString();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (linkType === 'Habit' && !linkedHabitId) {
      setFormError('Select a habit to link, or choose None.');
      return;
    }
    if (linkType === 'Task' && !linkedTaskId) {
      setFormError('Select a task to link, or choose None.');
      return;
    }
    if (repeatType === 'WEEKLY' && repeatDays.length === 0) {
      setFormError('Pick at least one weekday for weekly reminders.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        title: title.trim(),
        remindAt: buildRemindAt(),
        repeatType,
        repeatDays: repeatType === 'WEEKLY' ? repeatDays : undefined,
        linkedHabitId: linkType === 'Habit' ? linkedHabitId : null,
        linkedTaskId: linkType === 'Task' ? linkedTaskId : null,
      };
      if (editing) {
        await editReminder(editing.id, payload);
      } else {
        await addReminder(payload);
      }
      setModalVisible(false);
      resetForm();
    } catch (err) {
      if (isPremiumUpgradeError(err)) {
        Alert.alert('Upgrade required', premiumUpgradeMessage(getErrorMessage(err)), [
          { text: 'Not now', style: 'cancel' },
          { text: 'View plans', onPress: () => router.push('/(tabs)/profile') },
        ]);
      } else {
        setFormError(getErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const showActions = (r: Reminder) => {
    Alert.alert(r.title, 'Choose an action', [
      { text: 'Edit', onPress: () => openEdit(r) },
      {
        text: 'Mark done',
        onPress: () => markDone(r.id).catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
      {
        text: 'Snooze 15 min',
        onPress: () => snooze(r.id, 15).catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
      {
        text: 'Snooze 30 min',
        onPress: () => snooze(r.id, 30).catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
      {
        text: r.is_active ? 'Pause' : 'Activate',
        onPress: () => toggleActive(r).catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          removeReminder(r.id).catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading && !refreshing) return <LoadingState />;

  return (
    <>
      <Screen
        refreshing={refreshing}
        onRefresh={refresh}
        refreshTint={palette.warning}
        header={
          <ScreenHeader
            accent="warning"
            title="Reminders"
            subtitle={`${activeCount} active · ${inactiveCount} inactive`}
            onAdd={openCreate}
            addLabel="+ Add"
            stats={[
              { value: reminders.length, label: 'Total' },
              { value: inactiveCount, label: 'Inactive' },
              { value: activeCount, label: 'Active' },
            ]}
          />
        }
      >
        <FilterChips options={[...FILTERS]} value={filter} onChange={setFilter} accent={palette.warning} />
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon="alarm-outline"
            title={
              filter === 'Active'
                ? 'No active reminders'
                : filter === 'Inactive'
                  ? 'No paused reminders'
                  : 'No reminders yet'
            }
            subtitle={
              filter === 'All'
                ? 'Tap + Add to create your first reminder.'
                : 'Try another filter or create a new reminder.'
            }
            actionLabel="+ Add reminder"
            onAction={openCreate}
          />
        ) : (
          filtered.map((r, idx) => {
            const color = REMINDER_COLORS[idx % REMINDER_COLORS.length];
            const isInactive = !r.is_active;
            const doneToday = isReminderDoneToday(r);
            const linkedLabel = r.linked_habit_id
              ? habitNameById[r.linked_habit_id] ?? 'Linked habit'
              : r.linked_task_id
                ? taskNameById[r.linked_task_id] ?? 'Linked task'
                : null;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.card, (isInactive || doneToday) && styles.cardDone]}
                onPress={() => showActions(r)}
                activeOpacity={0.85}
              >
                <View style={[styles.accentBar, { backgroundColor: color }]} />
                <View style={styles.cardBody}>
                  <AppText variant="title" style={isInactive ? styles.strikeText : undefined}>
                    {r.title}
                  </AppText>
                  <View style={styles.cardMeta}>
                    <Ionicons name="time-outline" size={14} color={palette.textSecondary} />
                    <AppText variant="caption">{formatTime(r.remind_at)}</AppText>
                    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
                      <AppText variant="caption" color={color}>
                        {formatRepeatType(r.repeat_type)}
                      </AppText>
                    </View>
                    {doneToday ? (
                      <View style={[styles.badge, styles.doneBadge]}>
                        <AppText variant="caption" color={palette.success}>
                          Done today
                        </AppText>
                      </View>
                    ) : null}
                    {linkedLabel ? (
                      <View style={[styles.badge, { backgroundColor: palette.primary + '14' }]}>
                        <AppText variant="caption" color={palette.primary}>
                          {linkedLabel}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                </View>
                <CheckCircle checked={doneToday} color={doneToday ? palette.success : palette.warning} />
              </TouchableOpacity>
            );
          })
        )}
      </Screen>

      <FormModal
        visible={modalVisible}
        title={editing ? 'Edit reminder' : 'New reminder'}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        onSubmit={handleSave}
        loading={saving}
        error={formError}
      >
        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Reminder title" />
        <FormField label="Time (HH:MM)" value={timeStr} onChangeText={setTimeStr} placeholder="09:00" />

        <AppText variant="caption" color={palette.textSecondary} style={styles.linkLabel}>
          Repeat
        </AppText>
        <FilterChips
          options={REPEAT_OPTIONS.map((o) => o.label)}
          value={REPEAT_OPTIONS.find((o) => o.value === repeatType)?.label ?? 'Daily'}
          onChange={(label) => {
            const match = REPEAT_OPTIONS.find((o) => o.label === label);
            if (match) setRepeatType(match.value);
          }}
          accent={palette.warning}
        />

        {repeatType === 'WEEKLY' ? (
          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((day) => {
              const active = repeatDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() =>
                    setRepeatDays((prev) =>
                      prev.includes(day.value)
                        ? prev.filter((d) => d !== day.value)
                        : [...prev, day.value].sort((a, b) => a - b),
                    )
                  }
                >
                  <AppText variant="caption" color={active ? palette.white : palette.textSecondary}>
                    {day.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <AppText variant="caption" color={palette.textSecondary} style={styles.linkLabel}>
          Link to (optional)
        </AppText>
        <FilterChips
          options={[...LINK_TYPES]}
          value={linkType}
          onChange={(value) => {
            setLinkType(value);
            setLinkedHabitId(null);
            setLinkedTaskId(null);
          }}
          accent={palette.warning}
        />
        {linkType === 'Habit' ? (
          habitOptions.length > 0 ? (
            <FilterChips
              options={habitOptions.map((h) => h.label)}
              value={habitOptions.find((h) => h.id === linkedHabitId)?.label ?? ''}
              onChange={(label) => {
                const match = habitOptions.find((h) => h.label === label);
                setLinkedHabitId(match?.id ?? null);
              }}
              accent={palette.primary}
            />
          ) : (
            <AppText variant="caption" color={palette.textMuted}>
              No habits available
            </AppText>
          )
        ) : null}
        {linkType === 'Task' ? (
          taskOptions.length > 0 ? (
            <FilterChips
              options={taskOptions.map((t) => t.label)}
              value={taskOptions.find((t) => t.id === linkedTaskId)?.label ?? ''}
              onChange={(label) => {
                const match = taskOptions.find((t) => t.label === label);
                setLinkedTaskId(match?.id ?? null);
              }}
              accent={palette.primary}
            />
          ) : (
            <AppText variant="caption" color={palette.textMuted}>
              No open tasks available
            </AppText>
          )
        ) : null}
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardDone: { opacity: 0.65 },
  accentBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: spacing.md },
  strikeText: { textDecorationLine: 'line-through', color: palette.textMuted },
  cardMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  badge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  doneBadge: { backgroundColor: palette.success + '18' },
  linkLabel: { marginTop: spacing.sm, marginBottom: spacing.xs },
  weekRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
  },
  dayChipActive: {
    backgroundColor: palette.warning,
    borderColor: palette.warning,
  },
});
