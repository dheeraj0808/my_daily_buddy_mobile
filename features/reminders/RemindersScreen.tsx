import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
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
import { formatRepeatType, REMINDER_COLORS } from '@/services/reminderAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { formatTime } from '@/utils/timezone';
import { getErrorMessage } from '@/utils/errors';

const FILTERS = ['All', 'Active', 'Inactive'] as const;

export default function RemindersScreen() {
  const { reminders, loading, refreshing, error, refresh, reload, toggleActive, addReminder, removeReminder } =
    useReminders();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [saving, setSaving] = useState(false);

  const filtered = reminders.filter((r) => {
    if (filter === 'Active') return r.is_active;
    if (filter === 'Inactive') return !r.is_active;
    return true;
  });

  const activeCount = reminders.filter((r) => r.is_active).length;
  const inactiveCount = reminders.length - activeCount;

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const remindAt = new Date();
      remindAt.setHours(hours || 9, minutes || 0, 0, 0);
      await addReminder({ title: title.trim(), remindAt: remindAt.toISOString(), repeatType: 'DAILY' });
      setModalVisible(false);
      setTitle('');
      setTimeStr('09:00');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) return <LoadingState />;

  return (
    <>
      <Screen refreshing={refreshing} onRefresh={refresh} refreshTint={palette.warning} contentStyle={styles.scroll}>
        <ScreenHeader
          accent="warning"
          title="Reminders"
          subtitle={`${activeCount} active · ${inactiveCount} inactive`}
          onAdd={() => setModalVisible(true)}
          addLabel="+ Add"
          stats={[
            { value: reminders.length, label: 'Total' },
            { value: inactiveCount, label: 'Inactive' },
            { value: activeCount, label: 'Active' },
          ]}
          style={styles.header}
        />

        <FilterChips options={FILTERS} value={filter} onChange={setFilter} accent={palette.warning} />
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        {filtered.length === 0 ? (
          <EmptyState icon="alarm-outline" title="No reminders" subtitle="Tap + Add to create one." />
        ) : (
          filtered.map((r, idx) => {
            const color = REMINDER_COLORS[idx % REMINDER_COLORS.length];
            const dismissed = !r.is_active;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.card, dismissed && styles.cardDone]}
                onPress={() =>
                  toggleActive(r).catch((err) => Alert.alert('Error', getErrorMessage(err)))
                }
                onLongPress={() =>
                  Alert.alert('Delete reminder', `Remove "${r.title}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () =>
                        removeReminder(r.id).catch((err) => Alert.alert('Error', getErrorMessage(err))),
                    },
                  ])
                }
                activeOpacity={0.85}
              >
                <View style={[styles.accentBar, { backgroundColor: color }]} />
                <View style={styles.cardBody}>
                  <AppText variant="title" style={dismissed ? styles.strikeText : undefined}>
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
                  </View>
                </View>
                <CheckCircle checked={dismissed} />
              </TouchableOpacity>
            );
          })
        )}
      </Screen>

      <FormModal visible={modalVisible} title="New reminder" onClose={() => setModalVisible(false)} onSubmit={handleCreate} loading={saving}>
        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Reminder title" />
        <FormField label="Time (HH:MM)" value={timeStr} onChangeText={setTimeStr} placeholder="09:00" />
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { marginHorizontal: -spacing.lg, marginTop: -spacing.md },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardDone: { opacity: 0.65 },
  accentBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: spacing.md },
  strikeText: { textDecorationLine: 'line-through', color: palette.textMuted },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  badge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
});
