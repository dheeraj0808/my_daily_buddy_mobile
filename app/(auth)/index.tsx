import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../../constants/Colors';

const { width, height } = Dimensions.get('window');

// Mini checklist items for the phone mockup
const CHECKLIST = [
  { label: 'Morning Yoga', icon: '🧘', done: true },
  { label: 'Email Review', icon: '📧', done: true },
  { label: 'Team Standup', icon: '👥', done: false },
];

const FEATURES = [
  { icon: '🔔', label: 'Smart\nReminders' },
  { icon: '📈', label: 'Habit\nTracking' },
  { icon: '❤️', label: 'Health\nOverview' },
];

export default function LandingScreen() {
  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const mockupAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(mockupAnim, {
        toValue: 1,
        duration: 900,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.appName}>My Daily Buddy</Text>
        <Text style={styles.tagline}>
          Manage your routine, reminders, and health easily
        </Text>
      </Animated.View>

      {/* Phone Mockup */}
      <Animated.View
        style={[
          styles.mockupWrapper,
          {
            opacity: mockupAnim,
            transform: [
              {
                translateY: mockupAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.mockupCard}>
          {/* Mockup Header */}
          <View style={styles.mockupHeader}>
            <Text style={styles.mockupTitle}>Daily Routine</Text>
            <Text style={styles.mockupAvatar}>👤</Text>
          </View>

          {/* Checklist */}
          <View style={styles.checklistContainer}>
            {CHECKLIST.map((item, i) => (
              <View
                key={i}
                style={[styles.checklistItem, !item.done && styles.checklistDim]}
              >
                <Text style={styles.checkIcon}>
                  {item.done ? '☑️' : '⬜'}
                </Text>
                <Text style={styles.checkLabel}>{item.label}</Text>
                <Text style={styles.checkItemIcon}>{item.icon}</Text>
              </View>
            ))}
          </View>

          {/* Reminder card */}
          <LinearGradient
            colors={['#2563eb', '#004ac6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reminderCard}
          >
            <Text style={styles.reminderLabel}>Next Reminder</Text>
            <Text style={styles.reminderTime}>1:30 PM – Project Kickoff</Text>
            <Text style={styles.reminderClock}>⏱</Text>
          </LinearGradient>

          {/* Health stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statCaption}>Steps</Text>
              <Text style={[styles.statValue, { color: Colors.primary }]}>6,432</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statCaption}>Sleep</Text>
              <Text style={[styles.statValue, { color: '#006c49' }]}>7.5 hrs</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Features row */}
      <Animated.View style={[styles.featuresRow, { opacity: fadeAnim }]}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureItem}>
            <View style={styles.featureIconCircle}>
              <Text style={styles.featureEmoji}>{f.icon}</Text>
            </View>
            <Text style={styles.featureLabel}>{f.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Get Started Button */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/login')}
        >
          <LinearGradient
            colors={['#2563eb', '#004ac6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.getStartedBtn}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Text style={styles.getStartedArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.lg,
  },
  // Background accents
  blobTopRight: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 9999,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.7,
    height: height * 0.35,
    borderRadius: 9999,
    backgroundColor: 'rgba(78,222,163,0.08)',
  },
  // Header
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: Spacing.xl,
    alignItems: 'center',
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0b1c30',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: '#434655',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
  // Mockup
  mockupWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupCard: {
    width: 268,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 36,
    padding: 20,
    gap: 14,
    // Glass effect
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.8)',
    // Shadow
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 12,
  },
  mockupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b1c30',
  },
  mockupAvatar: {
    fontSize: 20,
  },
  // Checklist
  checklistContainer: {
    gap: 10,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checklistDim: {
    opacity: 0.4,
  },
  checkIcon: {
    fontSize: 16,
  },
  checkLabel: {
    fontSize: 14,
    color: '#0b1c30',
    flex: 1,
    fontWeight: '500',
  },
  checkItemIcon: {
    fontSize: 14,
  },
  // Reminder
  reminderCard: {
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  reminderLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 20,
  },
  reminderClock: {
    position: 'absolute',
    top: 10,
    right: 14,
    fontSize: 28,
    opacity: 0.3,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#eff4ff',
    borderRadius: 14,
    padding: 12,
  },
  statCaption: {
    fontSize: 11,
    color: '#434655',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: Spacing.md,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dce9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#434655',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  // Footer
  footer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  getStartedBtn: {
    height: 52,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  getStartedArrow: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
});
