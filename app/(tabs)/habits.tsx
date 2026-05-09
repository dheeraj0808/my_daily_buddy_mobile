import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const HABITS = [
  {
    id: '1',
    title: 'Morning Meditation',
    emoji: '🧘',
    color: '#8b5cf6',
    streak: 14,
    target: 20,
    progress: 14,
    frequency: 'Daily',
    completedToday: true,
  },
  {
    id: '2',
    title: 'Drink 8 Glasses of Water',
    emoji: '💧',
    color: '#0ea5e9',
    streak: 7,
    target: 30,
    progress: 7,
    frequency: 'Daily',
    completedToday: true,
  },
  {
    id: '3',
    title: 'Read 10 Pages',
    emoji: '📚',
    color: '#f59e0b',
    streak: 5,
    target: 21,
    progress: 5,
    frequency: 'Daily',
    completedToday: false,
  },
  {
    id: '4',
    title: 'Evening Run (30 min)',
    emoji: '🏃',
    color: '#10b981',
    streak: 3,
    target: 20,
    progress: 3,
    frequency: 'Daily',
    completedToday: false,
  },
  {
    id: '5',
    title: 'No Social Media Before 9AM',
    emoji: '📵',
    color: '#ef4444',
    streak: 10,
    target: 30,
    progress: 10,
    frequency: 'Daily',
    completedToday: true,
  },
  {
    id: '6',
    title: 'Journaling',
    emoji: '✍️',
    color: '#6366f1',
    streak: 2,
    target: 21,
    progress: 2,
    frequency: 'Daily',
    completedToday: false,
  },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

export default function HabitsScreen() {
  const [habits, setHabits] = useState(HABITS);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completedToday: !h.completedToday,
              streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1),
              progress: !h.completedToday ? h.progress + 1 : Math.max(0, h.progress - 1),
            }
          : h
      )
    );
  };

  const completedCount = habits.filter((h) => h.completedToday).length;
  const longestStreak = Math.max(...habits.map((h) => h.streak));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>My Habits</Text>
              <Text style={styles.headerSub}>
                {completedCount} of {habits.length} done today
              </Text>
            </View>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          {/* Week row */}
          <View style={styles.weekRow}>
            {DAYS.map((day, i) => (
              <View
                key={i}
                style={[styles.dayCircle, i === todayIndex && styles.dayCircleActive]}
              >
                <Text style={[styles.dayText, i === todayIndex && styles.dayTextActive]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Stats */}
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

        {/* Habits list */}
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {habits.map((habit) => {
          const pct = Math.round((habit.progress / habit.target) * 100);
          return (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitCard}
              onPress={() => toggleHabit(habit.id)}
              activeOpacity={0.85}
            >
              {/* Left icon */}
              <View style={[styles.habitIcon, { backgroundColor: habit.color + '18' }]}>
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
              </View>

              {/* Body */}
              <View style={styles.habitBody}>
                <View style={styles.habitRow}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥 {habit.streak}</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct}%`, backgroundColor: habit.color },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {habit.progress}/{habit.target} days · {pct}%
                </Text>
              </View>

              {/* Check */}
              <View
                style={[
                  styles.check,
                  habit.completedToday && {
                    backgroundColor: habit.color,
                    borderColor: habit.color,
                  },
                ]}
              >
                {habit.completedToday && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
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
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitEmoji: { fontSize: 24 },
  habitBody: { flex: 1 },
  habitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  habitTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  streakBadge: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  streakText: { fontSize: 11, fontWeight: '700', color: '#f59e0b' },
  progressBg: {
    height: 5,
    backgroundColor: '#f1f5f9',
    borderRadius: 99,
    marginBottom: 4,
  },
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
