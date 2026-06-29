import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import { CheckCircle, SectionHeader } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useHabits, type HabitWithStreak } from '@/hooks/use-habits';
import { DEFAULT_HABIT_COLORS, DEFAULT_HABIT_ICONS } from '@/services/habitAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function HabitsScreen() {
  const { habits, loading, refreshing, error, refresh, reload, toggleCheckIn, addHabit, removeHabit } = useHabits();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const longestStreak = habits.length ? Math.max(...habits.map((h) => h.streak.longestStreak)) : 0;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addHabit({
        name: name.trim(),
        icon: DEFAULT_HABIT_ICONS[habits.length % DEFAULT_HABIT_ICONS.length],
        color: DEFAULT_HABIT_COLORS[habits.length % DEFAULT_HABIT_COLORS.length],
      });
      setModalVisible(false);
      setName('');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) return <LoadingState />;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} refreshTint={palette.success} contentStyle={styles.scroll}>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      <ScreenHeader
        accent="success"
        title="Habits"
        subtitle={`${completedCount} of ${habits.length} done today`}
        onAdd={() => setModalVisible(true)}
        addLabel="+ New"
        style={styles.header}
      >
        <View style={styles.weekRow}>
          {DAYS.map((day, i) => (
            <View key={`${day}-${i}`} style={[styles.dayCircle, i === todayIndex && styles.dayCircleActive]}>
              <AppText variant="label" color={i === todayIndex ? palette.success : palette.onPrimaryMuted}>
                {day}
              </AppText>
            </View>
          ))}
        </View>
      </ScreenHeader>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: palette.success }]}>
          <AppText variant="h2">{completedCount}</AppText>
          <AppText variant="caption">Completed today</AppText>
        </View>
        <View style={[styles.statCard, { borderLeftColor: palette.warning }]}>
          <AppText variant="h2">{longestStreak}</AppText>
          <AppText variant="caption">Longest streak</AppText>
        </View>
        <View style={[styles.statCard, { borderLeftColor: palette.primaryLight }]}>
          <AppText variant="h2">{habits.length}</AppText>
          <AppText variant="caption">Total habits</AppText>
        </View>
      </View>

      <SectionHeader title="Today's habits" />

      {habits.length === 0 ? (
        <EmptyState icon="flag-outline" title="No habits yet" subtitle="Tap + New to start tracking." />
      ) : (
        habits.map((habit) => <HabitRow key={habit.id} habit={habit} onToggle={toggleCheckIn} onDelete={removeHabit} />)
      )}

      <FormModal visible={modalVisible} title="New habit" onClose={() => setModalVisible(false)} onSubmit={handleCreate} loading={saving}>
        <FormField label="Habit name" value={name} onChangeText={setName} placeholder="e.g. Morning meditation" />
      </FormModal>
    </Screen>
  );
}

function HabitRow({
  habit,
  onToggle,
  onDelete,
}: {
  habit: HabitWithStreak;
  onToggle: (h: HabitWithStreak) => void;
  onDelete: (id: string) => void;
}) {
  const color = habit.color ?? palette.primaryLight;
  const pct = Math.min(100, Math.round(habit.streak.completionRate));

  const handleToggle = () => {
    onToggle(habit).catch((err) => Alert.alert('Error', getErrorMessage(err)));
  };

  const handleDelete = () => {
    Alert.alert('Delete habit', `Remove "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(habit.id).catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.habitCard}
      onPress={handleToggle}
      onLongPress={handleDelete}
      activeOpacity={0.85}
    >
      <View style={[styles.habitIcon, { backgroundColor: color + '18' }]}>
        <AppText variant="title">{habit.icon ?? '✓'}</AppText>
      </View>
      <View style={styles.habitBody}>
        <View style={styles.habitRow}>
          <AppText variant="title" style={styles.habitTitle}>
            {habit.name}
          </AppText>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={12} color={palette.warning} />
            <AppText variant="caption" color={palette.warning}>
              {habit.streak.currentStreak}
            </AppText>
          </View>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <AppText variant="caption">
          {habit.streak.currentStreak} day streak · {pct}% completion
        </AppText>
      </View>
      <CheckCircle checked={habit.completedToday} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { marginHorizontal: -spacing.lg, marginTop: -spacing.md },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.onPrimarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: { backgroundColor: palette.white },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginVertical: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  habitCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.sm,
  },
  habitIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  habitBody: { flex: 1 },
  habitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  habitTitle: { flex: 1, marginRight: spacing.sm },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF7ED', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  progressBg: { height: 5, backgroundColor: palette.surfaceMuted, borderRadius: radius.full, marginBottom: 4 },
  progressFill: { height: 5, borderRadius: radius.full },
});
