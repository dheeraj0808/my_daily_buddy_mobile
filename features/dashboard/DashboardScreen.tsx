import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
import { formatTime } from '@/utils/timezone';
import { getErrorMessage } from '@/utils/errors';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
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

  const firstName = profile?.first_name ?? null;
  const lastName = profile?.last_name ?? null;
  const email = profile?.email ?? 'User';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#6366f1" />}
      >
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name}>{displayName(firstName, lastName, email)}</Text>
            <Text style={styles.date}>{getDate()}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(firstName, lastName, email)}</Text>
          </View>
        </View>

        <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.progressCard}>
          <Text style={styles.progressLabel}>Today's Progress</Text>
          <Text style={styles.progressPct}>{pct}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressSub}>
            {done} of {total} tasks completed
          </Text>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: '#f59e0b' }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNum}>{stats.habitStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: '#10b981' }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNum}>{pct}%</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: '#6366f1' }]}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statNum}>{stats.reminderCount}</Text>
            <Text style={styles.statLabel}>Reminders</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {tasks.length > 5 ? (
              <TouchableOpacity onPress={() => setShowAll((v) => !v)}>
                <Text style={styles.seeAll}>{showAll ? 'Show Less' : 'See All'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={openCreate}>
                <Text style={styles.seeAll}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {visibleTasks.length === 0 ? (
            <EmptyState emoji="📋" title="No tasks for today" subtitle="Tap + Add to create your first task." />
          ) : (
            visibleTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onLongPress={() => openEdit(task)}
                onPress={() => handleToggle(task)}
                activeOpacity={0.85}
              >
                <View
                  style={[styles.taskDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]}
                />
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.is_completed && styles.taskDone]}>
                    {task.title}
                  </Text>
                  {task.due_date ? (
                    <Text style={styles.taskTime}>{formatTime(task.due_date)}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(task)}
                  hitSlop={8}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.taskCheck,
                    task.is_completed && { backgroundColor: '#10b981', borderColor: '#10b981' },
                  ]}
                >
                  {task.is_completed && <Text style={styles.taskCheckMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/reminders')}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.actionGrad}>
                <Text style={styles.actionEmoji}>⏰</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Add{'\n'}Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/habits')}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.actionGrad}>
                <Text style={styles.actionEmoji}>📋</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>New{'\n'}Habit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/health')}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.actionGrad}>
                <Text style={styles.actionEmoji}>❤️</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Log{'\n'}Health</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <FormModal
        visible={modalVisible}
        title={editingTask ? 'Edit Task' : 'New Task'}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: { fontSize: 15, color: '#64748b', fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  date: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: '#6366f1' },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  progressLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  progressPct: { fontSize: 40, fontWeight: '800', color: '#fff', marginTop: 4 },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 99,
    marginTop: 12,
    marginBottom: 8,
  },
  progressBarFill: { height: 6, backgroundColor: '#fff', borderRadius: 99 },
  progressSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statNum: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 2 },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#6366f1' },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  taskDot: { width: 4, height: 40, borderRadius: 2, marginRight: 14 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  taskDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  taskTime: { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  deleteBtn: { paddingHorizontal: 8 },
  deleteText: { fontSize: 22, color: '#cbd5e1', fontWeight: '300' },
  taskCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 16, marginTop: 14 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8 },
  actionGrad: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 16,
  },
});
