import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import FilterChips, { CheckCircle, SectionHeader } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/use-dashboard';
import {
    createTask,
    deleteTask,
    PRIORITY_COLORS,
    toggleTask,
    updateTask,
    type Task,
} from '@/services/taskAPI';
import { getDueReminders, type Reminder } from '@/services/reminderAPI';
import { gradients, palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { formatTime } from '@/utils/timezone';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

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
  { label: 'Track', icon: 'trending-up-outline' as const, route: '/(tabs)/track', colors: gradients.success },
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
  const [taskFilter, setTaskFilter] = useState<'All' | 'Open' | 'Done'>('All');
  const [dueReminders, setDueReminders] = useState<Reminder[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const loadDue = useCallback(async () => {
    try {
      const due = await getDueReminders();
      setDueReminders(due);
    } catch {
      setDueReminders([]);
    }
  }, []);

  useEffect(() => {
    loadDue();
  }, [loadDue, tasks.length]);

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'Open') return tasks.filter((t) => !t.is_completed);
    if (taskFilter === 'Done') return tasks.filter((t) => t.is_completed);
    return tasks;
  }, [tasks, taskFilter]);

  const done = tasks.filter((t) => t.is_completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const visibleTasks = showAll ? filteredTasks : filteredTasks.slice(0, 5);

  const firstName = profile?.first_name ?? null;
  const lastName = profile?.last_name ?? null;
  const email = profile?.email ?? '';

  const openCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setFormError(null);
    setModalVisible(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setFormError(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, { title: title.trim(), description: description.trim() || undefined });
      } else {
        await createTask({ title: title.trim(), description: description.trim() || undefined });
      }
      setModalVisible(false);
      await reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
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
    <Screen
      refreshing={refreshing}
      onRefresh={async () => {
        await refresh();
        await loadDue();
      }}
      header={
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
      }
    >
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      {dueReminders.length > 0 ? (
        <Card padded style={styles.dueCard}>
          <View style={styles.dueHeader}>
            <AppText variant="title">Due now</AppText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reminders')}>
              <AppText variant="label" color={palette.primaryLight}>
                Open
              </AppText>
            </TouchableOpacity>
          </View>
          {dueReminders.slice(0, 3).map((r) => (
            <AppText key={r.id} variant="body" color={palette.textSecondary}>
              • {r.title}
            </AppText>
          ))}
        </Card>
      ) : null}

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
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/notifications')}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="notifications-outline" size={18} color={palette.primaryLight} />
            </View>
            <AppText variant="h2">{stats.reminderCount}</AppText>
            <AppText variant="caption">Alerts</AppText>
          </Card>
        </TouchableOpacity>
      </View>

      <SectionHeader title="Today's schedule" actionLabel="+ Add task" onAction={openCreate} />

      <FilterChips
        options={['All', 'Open', 'Done'] as const}
        value={taskFilter}
        onChange={setTaskFilter}
        accent={palette.primaryLight}
      />

      {filteredTasks.length > 5 ? (
        <TouchableOpacity
          style={styles.seeAllRow}
          onPress={() => setShowAll((v) => !v)}
          activeOpacity={0.85}
        >
          <AppText variant="label" color={palette.primaryLight}>
            {showAll ? 'Show less' : `See all (${filteredTasks.length})`}
          </AppText>
        </TouchableOpacity>
      ) : null}

      {visibleTasks.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState
            icon="clipboard-outline"
            title={
              taskFilter === 'Done'
                ? 'No completed tasks'
                : taskFilter === 'Open'
                  ? 'Nothing open'
                  : 'No tasks yet'
            }
            subtitle={
              taskFilter === 'All'
                ? 'Add your first task to start tracking your day.'
                : 'Try another filter or add a new task.'
            }
            actionLabel="+ Add task"
            onAction={openCreate}
          />
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
        error={formError}
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
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  emptyCard: { marginBottom: spacing.lg, alignItems: 'center' },
  seeAllRow: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dueCard: { marginBottom: spacing.md, gap: spacing.xs, ...shadows.sm },
  dueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
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
