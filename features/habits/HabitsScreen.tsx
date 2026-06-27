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
import { useHabits, type HabitWithStreak } from '@/hooks/use-habits';
import { DEFAULT_HABIT_COLORS, DEFAULT_HABIT_ICONS } from '@/services/habitAPI';
import { getErrorMessage } from '@/utils/errors';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function HabitsScreen() {
  const { habits, loading, refreshing, error, refresh, reload, toggleCheckIn, addHabit, removeHabit } =
    useHabits();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const longestStreak = habits.length
    ? Math.max(...habits.map((h) => h.streak.longestStreak))
    : 0;

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

  const handleToggle = async (habit: HabitWithStreak) => {
    try {
      await toggleCheckIn(habit);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const handleDelete = (habit: HabitWithStreak) => {
    Alert.alert('Delete habit', `Remove "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeHabit(habit.id);
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
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#10b981" />}
      >
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Habits</Text>
              <Text style={styles.headerSub}>
                {completedCount} of {habits.length} done today
              </Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {DAYS.map((day, i) => (
              <View key={i} style={[styles.dayCircle, i === todayIndex && styles.dayCircleActive]}>
                <Text style={[styles.dayText, i === todayIndex && styles.dayTextActive]}>{day}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
            <Text style={styles.statNum}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed{'\n'}Today</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
            <Text style={styles.statNum}>{longestStreak}🔥</Text>
            <Text style={styles.statLabel}>Longest{'\n'}Streak</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#6366f1' }]}>
            <Text style={styles.statNum}>{habits.length}</Text>
            <Text style={styles.statLabel}>Total{'\n'}Habits</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {habits.length === 0 ? (
          <EmptyState emoji="🎯" title="No habits yet" subtitle="Tap + New to start tracking." />
        ) : (
          habits.map((habit) => {
            const color = habit.color ?? '#6366f1';
            const target = habit.target_count || 21;
            const progress = habit.streak.totalCompletions;
            const pct = Math.min(100, Math.round((progress / target) * 100));
            return (
              <TouchableOpacity
                key={habit.id}
                style={styles.habitCard}
                onPress={() => handleToggle(habit)}
                onLongPress={() => handleDelete(habit)}
                activeOpacity={0.85}
              >
                <View style={[styles.habitIcon, { backgroundColor: color + '18' }]}>
                  <Text style={styles.habitEmoji}>{habit.icon ?? '✅'}</Text>
                </View>
                <View style={styles.habitBody}>
                  <View style={styles.habitRow}>
                    <Text style={styles.habitTitle}>{habit.name}</Text>
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakText}>🔥 {habit.streak.currentStreak}</Text>
                    </View>
                  </View>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.progressLabel}>
                    {progress}/{target} days · {pct}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.check,
                    habit.completedToday && { backgroundColor: color, borderColor: color },
                  ]}
                >
                  {habit.completedToday && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <FormModal
        visible={modalVisible}
        title="New Habit"
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreate}
        loading={saving}
      >
        <FormField label="Habit name" value={name} onChangeText={setName} placeholder="e.g. Morning meditation" />
      </FormModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 20 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: { backgroundColor: '#fff' },
  dayText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  dayTextActive: { color: '#10b981' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNum: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', lineHeight: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  habitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  habitEmoji: { fontSize: 24 },
  habitBody: { flex: 1 },
  habitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  habitTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  streakBadge: { backgroundColor: '#fff7ed', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  streakText: { fontSize: 11, fontWeight: '700', color: '#f59e0b' },
  progressBg: { height: 5, backgroundColor: '#f1f5f9', borderRadius: 99, marginBottom: 4 },
  progressFill: { height: 5, borderRadius: 99 },
  progressLabel: { fontSize: 11, color: '#94a3b8' },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
