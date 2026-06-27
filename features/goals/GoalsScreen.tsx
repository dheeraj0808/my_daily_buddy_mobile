import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import { useGoals, type GoalType } from '@/hooks/use-goals';
import type { Goal } from '@/services/goalAPI';
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
      const payload: Parameters<typeof addGoal>[0] = {
        title: title.trim(),
        goalType,
      };
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

  const handleDelete = (goal: Goal) => {
    Alert.alert('Delete goal', `Remove "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeGoal(goal.id);
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) return <LoadingState />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#8b5cf6" />}
      >
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        <LinearGradient colors={['#8b5cf6', '#6366f1']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Goals</Text>
              <Text style={styles.headerSub}>
                {stats?.total ?? 0} total · {Math.round(stats?.completionRate ?? 0)}% completion
              </Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModal(true)}>
              <Text style={styles.addBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Text style={styles.statNum}>{stats?.byStatus?.ACTIVE ?? goals.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statNum}>{stats?.overdue ?? 0}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statNum}>{stats?.byStatus?.COMPLETED ?? 0}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Active Goals</Text>
        {goals.length === 0 ? (
          <EmptyState emoji="🎯" title="No goals yet" subtitle="Set a long-term goal to stay motivated." />
        ) : (
          goals.map((goal) => {
            const pct = goalProgressPercent(goal);
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onPress={() => setProgressModal(goal)}
                onLongPress={() => handleDelete(goal)}
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalType}>{goal.goal_type}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {goal.current_value}
                  {goal.unit ? ` ${goal.unit}` : ''}
                  {goal.target_value != null ? ` / ${goal.target_value}` : ''} · {pct}%
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <FormModal visible={createModal} title="New Goal" onClose={() => setCreateModal(false)} onSubmit={handleCreate} loading={saving}>
        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Run a marathon" />
        <Text style={styles.fieldLabel}>Type</Text>
        <View style={styles.typeRow}>
          {GOAL_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.typeChip, goalType === t.value && styles.typeChipActive]}
              onPress={() => setGoalType(t.value)}
            >
              <Text style={[styles.typeChipText, goalType === t.value && styles.typeChipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {(goalType === 'ACCUMULATE' || goalType === 'REDUCE') && (
          <FormField label="Target value" value={target} onChangeText={setTarget} placeholder="100" />
        )}
      </FormModal>

      <FormModal
        visible={!!progressModal}
        title="Log Progress"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', paddingHorizontal: 20, marginBottom: 14 },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  goalType: { fontSize: 11, fontWeight: '600', color: '#8b5cf6', backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  progressBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 99, marginBottom: 6 },
  progressFill: { height: 6, backgroundColor: '#8b5cf6', borderRadius: 99 },
  progressText: { fontSize: 12, color: '#64748b' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0' },
  typeChipActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  typeChipTextActive: { color: '#fff' },
});
