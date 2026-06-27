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
import { useReminders } from '@/hooks/use-reminders';
import { formatRepeatType, REMINDER_COLORS, type Reminder } from '@/services/reminderAPI';
import { formatTime } from '@/utils/timezone';
import { getErrorMessage } from '@/utils/errors';

const FILTERS = ['All', 'Active', 'Inactive'] as const;

export default function RemindersScreen() {
  const { reminders, loading, refreshing, error, refresh, reload, toggleActive, addReminder, removeReminder } =
    useReminders();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [saving, setSaving] = useState(false);

  const filtered = reminders.filter((r) => {
    if (filter === 'Active') return r.is_active;
    if (filter === 'Inactive') return !r.is_active;
    return true;
  });

  const doneCount = reminders.filter((r) => !r.is_active).length;

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const remindAt = new Date();
      remindAt.setHours(hours || 9, minutes || 0, 0, 0);
      await addReminder({
        title: title.trim(),
        remindAt: remindAt.toISOString(),
        repeatType: 'DAILY',
      });
      setModalVisible(false);
      setTitle('');
      setTimeStr('09:00');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: Reminder) => {
    try {
      await toggleActive(r);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  const handleDelete = (r: Reminder) => {
    Alert.alert('Delete reminder', `Remove "${r.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeReminder(r.id);
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
      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Reminders</Text>
            <Text style={styles.headerSub}>
              {doneCount} dismissed · {reminders.filter((r) => r.is_active).length} active
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryNum}>{reminders.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryNum}>{doneCount}</Text>
            <Text style={styles.summaryLabel}>Dismissed</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryNum}>{reminders.filter((r) => r.is_active).length}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catRow}>
        {FILTERS.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setFilter(cat)}
            style={[styles.catChip, filter === cat && styles.catChipActive]}
          >
            <Text style={[styles.catChipText, filter === cat && styles.catChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#f59e0b" />}
      >
        {filtered.length === 0 ? (
          <EmptyState emoji="⏰" title="No reminders" subtitle="Tap + Add to create one." />
        ) : (
          filtered.map((r, idx) => {
            const color = REMINDER_COLORS[idx % REMINDER_COLORS.length];
            const dismissed = !r.is_active;
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.card, dismissed && styles.cardDone]}
                onPress={() => handleToggle(r)}
                onLongPress={() => handleDelete(r)}
                activeOpacity={0.85}
              >
                <View style={[styles.cardLeft, { backgroundColor: color + '18' }]}>
                  <View style={[styles.colorDot, { backgroundColor: color }]} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, dismissed && styles.strikeText]}>{r.title}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardTime}>🕐 {formatTime(r.remind_at)}</Text>
                    <View style={[styles.repeatBadge, { backgroundColor: color + '18' }]}>
                      <Text style={[styles.repeatText, { color }]}>{formatRepeatType(r.repeat_type)}</Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.checkCircle,
                    dismissed && { backgroundColor: '#10b981', borderColor: '#10b981' },
                  ]}
                >
                  {dismissed && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <FormModal
        visible={modalVisible}
        title="New Reminder"
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreate}
        loading={saving}
      >
        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Reminder title" />
        <FormField label="Time (HH:MM)" value={timeStr} onChangeText={setTimeStr} placeholder="09:00" />
      </FormModal>
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
    marginBottom: 12,
  },
  cardDone: { opacity: 0.65 },
  cardLeft: { width: 8, alignSelf: 'stretch' },
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
