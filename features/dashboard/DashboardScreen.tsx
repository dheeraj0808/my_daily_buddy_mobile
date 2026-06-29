import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import { CheckCircle, SectionHeader } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/use-dashboard';
import {
  createTask,
  deleteTask,
  PRIORITY_COLORS,
  toggleTask,
  type Task,
  updateTask,
} from '@/services/taskAPI';
import { gradients, palette, radius, shadows, spacing } from '@/theme';
import { formatTime } from '@/utils/timezone';
import { getErrorMessage } from '@/utils/errors';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function displayName(first: string | null, last: string | null, email: string): string {
  const name = [first, last].filter(Boolean).join(' ');
  return name || email.split('@')[0];
}

function initials(first: string | null, last: string | null, email: string): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

const QUICK_ACTIONS = [
  { label: 'Reminder', icon: 'alarm-outline' as const, route: '/(tabs)/reminders', colors: gradients.warning },
  { label: 'Habit', icon: 'checkmark-circle-outline' as const, route: '/(tabs)/habits', colors: gradients.success },
  { label: 'Health', icon: 'heart-outline' as const, route: '/(tabs)/health', colors: gradients.health },
] as const;

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { tasks, loading, refreshing, error, stats, reload, refresh } = useDashboard();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const done = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const visibleTasks = showAll ? tasks : tasks.slice(0, 5);

  const firstName = profile?.first_name ?? null;
  const lastName = profile?.last_name ?? null;
  const email = profile?.email ?? '';

  const openCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setModalVisible(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, { title: title.trim(), description: description.trim() || undefined });
      } else {
        await createTask({ title: title.trim(), description: description.trim() || undefined });
      }
      setModalVisible(false);
      await reload();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      await toggleTask(task.id);
      await reload();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Delete task', `Remove "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(task.id);
            await reload();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) return <LoadingState />;

  const name = profile ? displayName(firstName, lastName, email) : 'there';

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} contentStyle={styles.scroll}>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      <LinearGradient colors={[...gradients.primaryDeep]} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <AppText variant="caption" color={palette.onPrimaryMuted}>
              {getGreeting()}
            </AppText>
            <AppText variant="h1" color={palette.onPrimary}>
              {name}
            </AppText>
            <AppText variant="caption" color={palette.onPrimaryMuted}>
              {getDate()}
            </AppText>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
            <AppText variant="title" color={palette.primaryLight}>
              {profile ? initials(firstName, lastName, email) : '?'}
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.progressInner}>
          <View style={styles.progressRow}>
            <AppText variant="label" color={palette.onPrimaryMuted}>
              Today&apos;s progress
            </AppText>
            <AppText variant="h1" color={palette.onPrimary}>
              {pct}%
            </AppText>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.max(pct, 2)}%` }]} />
          </View>
          <AppText variant="caption" color={palette.onPrimaryMuted}>
            {done} of {total} tasks completed
          </AppText>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="flame" size={18} color={palette.warning} />
          </View>
          <AppText variant="h2">{stats.habitStreak}</AppText>
          <AppText variant="caption">Streak</AppText>
        </Card>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-done" size={18} color={palette.success} />
          </View>
          <AppText variant="h2">{pct}%</AppText>
          <AppText variant="caption">Done</AppText>
        </Card>
        <Card style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="notifications-outline" size={18} color={palette.primaryLight} />
          </View>
          <AppText variant="h2">{stats.reminderCount}</AppText>
          <AppText variant="caption">Alerts</AppText>
        </Card>
      </View>

      <SectionHeader
        title="Today's schedule"
        actionLabel={tasks.length > 5 ? (showAll ? 'Show less' : 'See all') : '+ Add task'}
        onAction={() => (tasks.length > 5 ? setShowAll((v) => !v) : openCreate())}
      />

      {visibleTasks.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState
            icon="clipboard-outline"
            title="No tasks yet"
            subtitle="Add your first task to start tracking your day."
          />
          <TouchableOpacity style={styles.emptyBtn} onPress={openCreate} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color={palette.white} />
            <AppText variant="title" color={palette.white}>
              Add task
            </AppText>
          </TouchableOpacity>
        </Card>
      ) : (
        visibleTasks.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <TouchableOpacity
              style={styles.taskMain}
              onLongPress={() => openEdit(task)}
              onPress={() => handleToggle(task)}
              activeOpacity={0.85}
            >
              <View style={[styles.taskDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
              <View style={styles.taskInfo}>
                <AppText variant="title" style={task.is_completed ? styles.taskDone : undefined}>
                  {task.title}
                </AppText>
                {task.due_date ? <AppText variant="caption">{formatTime(task.due_date)}</AppText> : null}
              </View>
              <CheckCircle checked={task.is_completed} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(task)} hitSlop={8} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={palette.textMuted} />
            </TouchableOpacity>
          </View>
        ))
      )}

      <SectionHeader title="Quick actions" />
      <View style={styles.actionsRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionBtn}
            onPress={() => router.push(action.route)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[...action.colors]} style={styles.actionGrad}>
              <Ionicons name={action.icon} size={24} color={palette.white} />
            </LinearGradient>
            <AppText variant="caption">{action.label}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <FormModal
        visible={modalVisible}
        title={editingTask ? 'Edit task' : 'New task'}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSave}
        loading={saving}
      >
        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" />
        <FormField
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add details..."
          multiline
        />
      </FormModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 0, paddingHorizontal: 0, paddingBottom: spacing.xl },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    marginBottom: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroText: { flex: 1, gap: 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  progressInner: {
    backgroundColor: palette.onPrimarySubtle,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.full,
  },
  progressBarFill: { height: 8, backgroundColor: palette.white, borderRadius: radius.full },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.md },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, alignItems: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  taskCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  taskMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  taskDot: { width: 4, height: 40, borderRadius: 2, marginRight: spacing.md },
  taskInfo: { flex: 1 },
  taskDone: { textDecorationLine: 'line-through', color: palette.textMuted },
  deleteBtn: { paddingHorizontal: spacing.sm },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: spacing.sm },
  actionGrad: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
});
