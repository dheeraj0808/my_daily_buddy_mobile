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

const REMINDERS = [
  {
    id: '1',
    title: 'Morning Meditation',
    time: '06:30 AM',
    category: 'Wellness',
    color: '#10b981',
    done: true,
    repeat: 'Daily',
  },
  {
    id: '2',
    title: 'Take Vitamins',
    time: '08:00 AM',
    category: 'Health',
    color: '#ef4444',
    done: true,
    repeat: 'Daily',
  },
  {
    id: '3',
    title: 'Team Standup Meeting',
    time: '09:30 AM',
    category: 'Work',
    color: '#6366f1',
    done: false,
    repeat: 'Weekdays',
  },
  {
    id: '4',
    title: 'Lunch Break',
    time: '01:00 PM',
    category: 'Personal',
    color: '#f59e0b',
    done: false,
    repeat: 'Daily',
  },
  {
    id: '5',
    title: 'Drink Water',
    time: '03:00 PM',
    category: 'Health',
    color: '#0ea5e9',
    done: false,
    repeat: 'Every 2hrs',
  },
  {
    id: '6',
    title: 'Evening Run',
    time: '06:00 PM',
    category: 'Fitness',
    color: '#8b5cf6',
    done: false,
    repeat: 'Daily',
  },
  {
    id: '7',
    title: 'Read Before Bed',
    time: '09:30 PM',
    category: 'Personal',
    color: '#f59e0b',
    done: false,
    repeat: 'Daily',
  },
];

const CATEGORIES = ['All', 'Health', 'Work', 'Wellness', 'Fitness', 'Personal'];

export default function RemindersScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [reminders, setReminders] = useState(REMINDERS);

  const filtered =
    activeCategory === 'All'
      ? reminders
      : reminders.filter((r) => r.category === activeCategory);

  const doneCount = reminders.filter((r) => r.done).length;

  const toggleDone = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Reminders</Text>
            <Text style={styles.headerSub}>
              {doneCount} of {reminders.length} done today
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Summary pills */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryNum}>{reminders.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryNum}>{doneCount}</Text>
            <Text style={styles.summaryLabel}>Done</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryNum}>{reminders.length - doneCount}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
          >
            <Text
              style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reminder list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.card, r.done && styles.cardDone]}
            onPress={() => toggleDone(r.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardLeft, { backgroundColor: r.color + '18' }]}>
              <View style={[styles.colorDot, { backgroundColor: r.color }]} />
            </View>

            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, r.done && styles.strikeText]}>
                {r.title}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardTime}>🕐 {r.time}</Text>
                <View style={[styles.repeatBadge, { backgroundColor: r.color + '18' }]}>
                  <Text style={[styles.repeatText, { color: r.color }]}>{r.repeat}</Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.checkCircle,
                r.done && { backgroundColor: '#10b981', borderColor: '#10b981' },
              ]}
            >
              {r.done && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
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
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  summaryNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' },
  catScroll: { maxHeight: 56 },
  catRow: { paddingHorizontal: 20, paddingVertical: 12, gap: 8, flexDirection: 'row' },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  catChipActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  catChipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDone: { opacity: 0.65 },
  cardLeft: { width: 8, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 8, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  strikeText: { textDecorationLine: 'line-through', color: '#94a3b8' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  cardTime: { fontSize: 12, color: '#64748b' },
  repeatBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  repeatText: { fontSize: 11, fontWeight: '600' },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
