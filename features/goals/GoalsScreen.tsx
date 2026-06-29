import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useGoals, type GoalType } from '@/hooks/use-goals';
import type { Goal } from '@/services/goalAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'ACCUMULATE', label: 'Build up' },
  { value: 'REDUCE', label: 'Reduce' },
  { value: 'BOOLEAN', label: 'Yes/No' },
];

export default function GoalsScreen() {
  const { goals, stats, loading, refreshing, error, refresh, reload, addGoal, logProgress, removeGoal, goalProgressPercent } =
    useGoals();

  const [createModal, setCreateModal] = useState(false);
  const [progressModal, setProgressModal] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('ACCUMULATE');
  const [progressValue, setProgressValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload: Parameters<typeof addGoal>[0] = { title: title.trim(), goalType };
      if (goalType === 'ACCUMULATE' || goalType === 'REDUCE') {
        payload.targetValue = Number(target) || 100;
      }
      await addGoal(payload);
      setCreateModal(false);
      setTitle('');
      setTarget('');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleProgress = async () => {
    if (!progressModal || !progressValue.trim()) return;
    setSaving(true);
    try {
      await logProgress(progressModal.id, Number(progressValue));
      setProgressModal(null);
      setProgressValue('');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) return <LoadingState />;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} refreshTint={palette.secondary} contentStyle={styles.scroll}>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      <ScreenHeader
        accent="goals"
        title="Goals"
        subtitle={`${stats?.total ?? 0} total · ${Math.round(stats?.completionRate ?? 0)}% completion`}
        onAdd={() => setCreateModal(true)}
        addLabel="+ New"
        stats={[
          { value: stats?.byStatus?.ACTIVE ?? goals.length, label: 'Active' },
          { value: stats?.overdue ?? 0, label: 'Overdue' },
          { value: stats?.byStatus?.COMPLETED ?? 0, label: 'Done' },
        ]}
        style={styles.header}
      />

      <SectionHeader title="Active goals" />

      {goals.length === 0 ? (
        <EmptyState icon="trophy-outline" title="No goals yet" subtitle="Set a long-term goal to stay motivated." />
      ) : (
        goals.map((goal) => {
          const pct = goalProgressPercent(goal);
          return (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalCard}
              onPress={() => setProgressModal(goal)}
              onLongPress={() =>
                Alert.alert('Delete goal', `Remove "${goal.title}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => removeGoal(goal.id).catch((err) => Alert.alert('Error', getErrorMessage(err))) },
                ])
              }
            >
              <View style={styles.goalHeader}>
                <AppText variant="title" style={styles.goalTitle}>
                  {goal.title}
                </AppText>
                <View style={styles.typeBadge}>
                  <AppText variant="caption" color={palette.secondary}>
                    {goal.goal_type}
                  </AppText>
                </View>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              <AppText variant="caption">
                {goal.current_value}
                {goal.unit ? ` ${goal.unit}` : ''}
                {goal.target_value != null ? ` / ${goal.target_value}` : ''} · {pct}%
              </AppText>
            </TouchableOpacity>
          );
        })
      )}

      <FormModal visible={createModal} title="New goal" onClose={() => setCreateModal(false)} onSubmit={handleCreate} loading={saving}>
        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Run a marathon" />
        <AppText variant="label" style={styles.fieldLabel}>
          Type
        </AppText>
        <View style={styles.typeRow}>
          {GOAL_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.typeChip, goalType === t.value && styles.typeChipActive]}
              onPress={() => setGoalType(t.value)}
            >
              <AppText variant="label" color={goalType === t.value ? palette.white : palette.textSecondary}>
                {t.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        {(goalType === 'ACCUMULATE' || goalType === 'REDUCE') && (
          <FormField label="Target value" value={target} onChangeText={setTarget} placeholder="100" />
        )}
      </FormModal>

      <FormModal
        visible={!!progressModal}
        title="Log progress"
        onClose={() => setProgressModal(null)}
        onSubmit={handleProgress}
        loading={saving}
      >
        <FormField
          label={progressModal?.goal_type === 'BOOLEAN' ? 'Value (0 or 1)' : 'Progress value'}
          value={progressValue}
          onChangeText={setProgressValue}
          placeholder="10"
        />
      </FormModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { marginHorizontal: -spacing.lg, marginTop: -spacing.md, marginBottom: spacing.lg },
  goalCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    ...shadows.sm,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  goalTitle: { flex: 1 },
  typeBadge: { backgroundColor: '#F5F3FF', borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  progressBg: { height: 6, backgroundColor: palette.surfaceMuted, borderRadius: radius.full, marginBottom: 6 },
  progressFill: { height: 6, backgroundColor: palette.secondary, borderRadius: radius.full },
  fieldLabel: { marginBottom: spacing.sm },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: palette.border,
  },
  typeChipActive: { backgroundColor: palette.secondary, borderColor: palette.secondary },
});
