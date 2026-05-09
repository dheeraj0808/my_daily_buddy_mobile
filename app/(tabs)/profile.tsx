import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STATS = [
  { label: 'Day Streak', value: '12', emoji: '🔥' },
  { label: 'Habits Done', value: '47', emoji: '✅' },
  { label: 'Reminders', value: '89', emoji: '⏰' },
];

type Section = {
  title: string;
  items: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    color: string;
    toggle?: boolean;
    value?: string;
  }[];
};

const SECTIONS: Section[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', color: '#6366f1' },
      { icon: 'mail-outline', label: 'Email', color: '#0ea5e9', value: 'dheeraj@example.com' },
      { icon: 'call-outline', label: 'Phone', color: '#10b981', value: '+91 98765 43210' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications-outline', label: 'Push Notifications', color: '#f59e0b', toggle: true },
      { icon: 'moon-outline', label: 'Dark Mode', color: '#8b5cf6', toggle: true },
      { icon: 'language-outline', label: 'Language', color: '#6366f1', value: 'English' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help & FAQ', color: '#0ea5e9' },
      { icon: 'shield-checkmark-outline', label: 'Privacy Policy', color: '#10b981' },
      { icon: 'star-outline', label: 'Rate the App', color: '#f59e0b' },
    ],
  },
];

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            if (Platform.OS === 'web') {
              localStorage.removeItem('userToken');
            } else {
              await SecureStore.deleteItemAsync('userToken');
            }
            router.replace('/(auth)/login');
          } catch {
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  const getToggleValue = (label: string) => {
    if (label === 'Push Notifications') return notifications;
    if (label === 'Dark Mode') return darkMode;
    return false;
  };

  const handleToggle = (label: string, val: boolean) => {
    if (label === 'Push Notifications') setNotifications(val);
    if (label === 'Dark Mode') setDarkMode(val);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#8b5cf6', '#6366f1']} style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>DS</Text>
          </View>
          <Text style={styles.name}>Dheeraj Singh</Text>
          <Text style={styles.email}>dheeraj@example.com</Text>

          {/* Edit button */}
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingRow,
                    idx < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                  activeOpacity={item.toggle ? 1 : 0.7}
                >
                  <View style={[styles.iconBg, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <View style={styles.settingRight}>
                    {item.toggle ? (
                      <Switch
                        value={getToggleValue(item.label)}
                        onValueChange={(v) => handleToggle(item.label, v)}
                        trackColor={{ false: '#e2e8f0', true: '#a5b4fc' }}
                        thumbColor={getToggleValue(item.label) ? '#6366f1' : '#fff'}
                      />
                    ) : item.value ? (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Daily Life Assistant v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 10, color: '#64748b', fontWeight: '500', marginTop: 2, textAlign: 'center' },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a' },
  settingRight: { alignItems: 'flex-end' },
  settingValue: { fontSize: 13, color: '#94a3b8' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
  version: { textAlign: 'center', fontSize: 12, color: '#cbd5e1', marginTop: 4 },
});
