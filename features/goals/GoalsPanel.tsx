import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import AppText from '@/components/ui/AppText';
import { SectionHeader } from '@/components/ui/FilterChips';
import { type GoalType, type useGoals } from '@/hooks/use-goals';
import {
  listGoalProgress,
  type Goal,
  type GoalProgressLog,
} from '@/services/goalAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'ACCUMULATE', label: 'Build up' },
  { value: 'REDUCE', label: 'Reduce' },
  { value: 'MAINTAIN', label: 'Maintain' },
  { value: 'BOOLEAN', label: 'Yes/No' },
];

type GoalsState = ReturnType<typeof useGoals>;

interface Props {
  state: GoalsState;
  onAddReady?: (openAdd: () => void) => void;
}

export default function GoalsPanel({ state, onAddReady }: Props) {
  const {
    goals,
    stats,
    error,
    reload,
    addGoal,
    logProgress,
    changeStatus,
    removeGoal,
    goalProgressPercent,
  } = state;

  const [createModal, setCreateModal] = useState(false);
  const [progressModal, setProgressModal] = useState<Goal | null>(null);
  const [historyModal, setHistoryModal] = useState<Goal | null>(null);
  const [history, setHistory] = useState<GoalProgressLog[]>([]);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [targetMin, setTargetMin] = useState('');
  const [targetMax, setTargetMax] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('ACCUMULATE');
  const [progressValue, setProgressValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onAddReady?.(() => setCreateModal(true));
  }, [onAddReady]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload: Parameters<typeof addGoal>[0] = { title: title.trim(), goalType };
      if (goalType === 'ACCUMULATE' || goalType === 'REDUCE') {
        payload.targetValue = Number(target) || 100;
      }
      if (goalType === 'MAINTAIN') {
        payload.targetMin = Number(targetMin) || 0;
        payload.targetMax = Number(targetMax) || 100;
      }
      await addGoal(payload);
      setCreateModal(false);
      setTitle('');
      setTarget('');
      setTargetMin('');
      setTargetMax('');
      setGoalType('ACCUMULATE');
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

  const openHistory = async (goal: Goal) => {
    setHistoryModal(goal);
    try {
      const res = await listGoalProgress(goal.id, 20);
      setHistory(res.data);
    } catch (err) {
      setHistory([]);
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const showGoalActions = (goal: Goal) => {
    Alert.alert(goal.title, 'Choose an action', [
      { text: 'Log progress', onPress: () => setProgressModal(goal) },
      { text: 'Progress history', onPress: () => openHistory(goal) },
      {
        text: 'Pause',
        onPress: () =>
          changeStatus(goal.id, 'PAUSED').catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
      {
        text: 'Abandon',
        style: 'destructive',
        onPress: () =>
          changeStatus(goal.id, 'ABANDONED').catch((err) =>
            Alert.alert('Error', getErrorMessage(err)),
          ),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          removeGoal(goal.id).catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: palette.secondary }]}>
          <AppText variant="h2">{stats?.byStatus?.ACTIVE ?? goals.length}</AppText>
          <AppText variant="caption">Active</AppText>
        </View>
        <View style={[styles.statCard, { borderLeftColor: palette.warning }]}>
          <AppText variant="h2">{stats?.overdue ?? 0}</AppText>
          <AppText variant="caption">Overdue</AppText>
        </View>
        <View style={[styles.statCard, { borderLeftColor: palette.success }]}>
          <AppText variant="h2">{stats?.byStatus?.COMPLETED ?? 0}</AppText>
          <AppText variant="caption">Done</AppText>
        </View>
      </View>

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
              onLongPress={() => showGoalActions(goal)}
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
                {goal.goal_type === 'MAINTAIN'
                  ? `${goal.current_value}${goal.unit ? ` ${goal.unit}` : ''} (band ${goal.target_min}–${goal.target_max})`
                  : `${goal.current_value}${goal.unit ? ` ${goal.unit}` : ''}${
                      goal.target_value != null ? ` / ${goal.target_value}` : ''
                    }`}{' '}
                · {pct}%
              </AppText>
            </TouchableOpacity>
          );
        })
      )}

      <FormModal
        visible={createModal}
        title="New goal"
        onClose={() => setCreateModal(false)}
        onSubmit={handleCreate}
        loading={saving}
      >
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
        {goalType === 'MAINTAIN' ? (
          <>
            <FormField label="Min value" value={targetMin} onChangeText={setTargetMin} placeholder="60" />
            <FormField label="Max value" value={targetMax} onChangeText={setTargetMax} placeholder="70" />
          </>
        ) : null}
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

      <FormModal
        visible={!!historyModal}
        title={historyModal ? `${historyModal.title} history` : 'Progress history'}
        onClose={() => {
          setHistoryModal(null);
          setHistory([]);
        }}
        hideSubmit
      >
        {history.length === 0 ? (
          <AppText variant="body" color={palette.textSecondary}>
            No progress logs yet.
          </AppText>
        ) : (
          history.map((log) => (
            <View key={log.id} style={styles.historyRow}>
              <AppText variant="title">{log.value}</AppText>
              <AppText variant="caption" color={palette.textMuted}>
                {new Date(log.created_at).toLocaleString()}
              </AppText>
            </View>
          ))
        )}
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  goalCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
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
  historyRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    gap: 2,
  },
});
