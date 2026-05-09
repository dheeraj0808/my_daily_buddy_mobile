import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const TASKS = [
  { id: '1', title: 'Morning Yoga', time: '07:00 AM', done: true, color: '#10b981' },
  { id: '2', title: 'Team Standup', time: '09:30 AM', done: true, color: '#6366f1' },
  { id: '3', title: 'Deep Work Session', time: '11:00 AM', done: false, color: '#6366f1' },
  { id: '4', title: 'Drink 2L Water', time: '02:00 PM', done: false, color: '#0ea5e9' },
  { id: '5', title: 'Evening Walk', time: '06:00 PM', done: false, color: '#f59e0b' },
];

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

const done = TASKS.filter((t) => t.done).length;
const total = TASKS.length;
const pct = Math.round((done / total) * 100);

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name}>Dheeraj Singh</Text>
            <Text style={styles.date}>{getDate()}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DS</Text>
          </View>
        </View>

        {/* Progress card */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <Text style={styles.progressLabel}>Today's Progress</Text>
          <Text style={styles.progressPct}>{pct}%</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressSub}>
            {done} of {total} tasks completed
          </Text>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: '#f59e0b' }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: '#10b981' }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNum}>{pct}%</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: '#6366f1' }]}>
            <Text style={styles.statIcon}>⏰</Text>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>Reminders</Text>
          </View>
        </View>

        {/* Today's schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {TASKS.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={[styles.taskDot, { backgroundColor: task.color }]} />
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.done && styles.taskDone]}>
                  {task.title}
                </Text>
                <Text style={styles.taskTime}>{task.time}</Text>
              </View>
              <View
                style={[
                  styles.taskCheck,
                  task.done && { backgroundColor: '#10b981', borderColor: '#10b981' },
                ]}
              >
                {task.done && <Text style={styles.taskCheckMark}>✓</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.actionGrad}>
                <Text style={styles.actionEmoji}>⏰</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Add{'\n'}Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.actionGrad}>
                <Text style={styles.actionEmoji}>📋</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>New{'\n'}Habit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.actionGrad}>
                <Text style={styles.actionEmoji}>❤️</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Log{'\n'}Health</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
