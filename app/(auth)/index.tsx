import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import AppText from '@/components/ui/AppText';
import { gradients, palette, radius, shadows, spacing } from '@/theme';

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: 'notifications-outline' as const, label: 'Smart\nReminders' },
  { icon: 'trending-up-outline' as const, label: 'Habit\nTracking' },
  { icon: 'heart-outline' as const, label: 'Health\nInsights' },
];

export default function LandingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const mockupAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(mockupAnim, { toValue: 1, duration: 900, delay: 200, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, mockupAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <AppText variant="display" style={styles.appName}>
          My Daily Buddy
        </AppText>
        <AppText variant="caption" style={styles.tagline}>
          Manage your routine, reminders, and wellness in one place
        </AppText>
      </Animated.View>

      <Animated.View
        style={[
          styles.mockupWrapper,
          {
            opacity: mockupAnim,
            transform: [
              {
                translateY: mockupAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
              },
            ],
          },
        ]}
      >
        <View style={styles.mockupCard}>
          <View style={styles.mockupHeader}>
            <AppText variant="h2">Daily routine</AppText>
            <View style={styles.mockupAvatar}>
              <Ionicons name="person" size={18} color={palette.primaryLight} />
            </View>
          </View>
          {['Morning yoga', 'Email review', 'Team standup'].map((item, i) => (
            <View key={item} style={[styles.checklistItem, i === 2 && styles.checklistDim]}>
              <Ionicons
                name={i < 2 ? 'checkbox' : 'square-outline'}
                size={18}
                color={i < 2 ? palette.success : palette.textMuted}
              />
              <AppText variant="body" style={styles.checkLabel}>
                {item}
              </AppText>
            </View>
          ))}
          <LinearGradient colors={[...gradients.auth]} style={styles.reminderCard}>
            <AppText variant="caption" color={palette.onPrimaryMuted}>
              Next reminder
            </AppText>
            <AppText variant="title" color={palette.onPrimary}>
              1:30 PM · Project kickoff
            </AppText>
          </LinearGradient>
        </View>
      </Animated.View>

      <Animated.View style={[styles.featuresRow, { opacity: fadeAnim }]}>
        {FEATURES.map((f) => (
          <View key={f.label} style={styles.featureItem}>
            <View style={styles.featureIconCircle}>
              <Ionicons name={f.icon} size={22} color={palette.primaryLight} />
            </View>
            <AppText variant="caption" style={styles.featureLabel}>
              {f.label}
            </AppText>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(auth)/login')}>
          <LinearGradient colors={[...gradients.auth]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.getStartedBtn}>
            <AppText variant="title" color={palette.onPrimary}>
              Get started
            </AppText>
            <Ionicons name="arrow-forward" size={20} color={palette.onPrimary} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  blobTopRight: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(79,70,229,0.08)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.2,
    width: width * 0.7,
    height: height * 0.35,
    borderRadius: radius.full,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  header: { width: '100%', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, alignItems: 'center' },
  appName: { textAlign: 'center', marginBottom: spacing.xs },
  tagline: { textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  mockupWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mockupCard: {
    width: 268,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.xxl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: palette.borderLight,
    ...shadows.lg,
  },
  mockupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mockupAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checklistDim: { opacity: 0.45 },
  checkLabel: { flex: 1 },
  reminderCard: { borderRadius: radius.lg, padding: spacing.md },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  featureItem: { alignItems: 'center', gap: 6 },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: { textAlign: 'center' },
  footer: { width: '100%', paddingHorizontal: spacing.lg },
  getStartedBtn: {
    height: 56,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.lg,
  },
});
