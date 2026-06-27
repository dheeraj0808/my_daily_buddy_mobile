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

import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import { useHealth } from '@/hooks/use-health';
import { logFood, searchFood } from '@/services/foodAPI';
import { logBodyMetric } from '@/services/healthAPI';
import { mlToGlasses } from '@/utils/timezone';
import { getErrorMessage } from '@/utils/errors';

const STEPS_GOAL = 10000;
const HEALTH_TIPS = [
  '💡 Walk 10 minutes after every meal.',
  '💡 Sleep before 11 PM for better recovery.',
  '💡 Deep breathing reduces stress by 40%.',
];

export default function HealthScreen() {
  const { water, food, health, loading, refreshing, error, refresh, reload, addGlass, setGlasses } =
    useHealth();

  const [foodModal, setFoodModal] = useState(false);
  const [metricModal, setMetricModal] = useState(false);
  const [foodQuery, setFoodQuery] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [saving, setSaving] = useState(false);

  const steps = 6432;
  const sleep = 7.5;
  const heartRate = 72;
  const stepsPct = Math.min(Math.round((steps / STEPS_GOAL) * 100), 100);

  const waterGlasses = water ? mlToGlasses(water.totalMl) : 0;
  const waterGoalGlasses = water ? Math.max(1, mlToGlasses(water.goalMl)) : 8;
  const waterPct = water ? Math.min(water.percentComplete, 100) : 0;

  const calories = food ? Math.round(food.calories) : 0;
  const calorieGoal = food?.goalKcal ?? 2500;
  const caloriePct = food ? Math.min(food.percentComplete, 100) : 0;

  const handleLogFood = async () => {
    setSaving(true);
    try {
      if (foodQuery.trim()) {
        const items = await searchFood(foodQuery.trim(), 1);
        if (items.length > 0) {
          await logFood({ foodItemId: items[0].id, quantity: 1 });
        } else if (customCalories) {
          await logFood({ customName: foodQuery.trim(), calories: Number(customCalories) });
        } else {
          Alert.alert('Not found', 'Enter calories for custom food.');
          return;
        }
      }
      setFoodModal(false);
      await refresh();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogMetric = async () => {
    if (!weight.trim()) return;
    setSaving(true);
    try {
      await logBodyMetric({
        weightKg: Number(weight),
        heightCm: height ? Number(height) : undefined,
      });
      setMetricModal(false);
      setWeight('');
      setHeight('');
      await refresh();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !refreshing) return <LoadingState />;

  const bmi = health?.latest?.bmi;
  const bmiCategory = health?.bmiCategory;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#ef4444" />}
      >
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.header}>
          <Text style={styles.headerTitle}>Health Overview</Text>
          <Text style={styles.headerSub}>Keep up the great work! 💪</Text>

          <View style={styles.hrCard}>
            <View>
              <Text style={styles.hrLabel}>Heart Rate</Text>
              <View style={styles.hrRow}>
                <Text style={styles.hrValue}>{heartRate}</Text>
                <Text style={styles.hrUnit}> bpm</Text>
              </View>
              <Text style={styles.hrStatus}>● Sample data</Text>
            </View>
            <Text style={styles.hrEmoji}>❤️</Text>
          </View>
        </LinearGradient>

        {health?.latest ? (
          <TouchableOpacity style={styles.bmiCard} onPress={() => setMetricModal(true)}>
            <Text style={styles.bmiTitle}>⚖️ Body Metrics</Text>
            <Text style={styles.bmiValue}>
              {health.latest.weight_kg} kg
              {bmi != null ? ` · BMI ${bmi}` : ''}
            </Text>
            {bmiCategory ? <Text style={styles.bmiCat}>{bmiCategory.replace('_', ' ')}</Text> : null}
            <Text style={styles.bmiTap}>Tap to log new weight</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.bmiCard} onPress={() => setMetricModal(true)}>
            <Text style={styles.bmiTitle}>⚖️ Body Metrics</Text>
            <Text style={styles.bmiTap}>Tap to log weight & height</Text>
          </TouchableOpacity>
        )}

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricEmoji}>👟</Text>
            <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Steps</Text>
            <View style={styles.metricBarBg}>
              <View style={[styles.metricBarFill, { width: `${stepsPct}%`, backgroundColor: '#6366f1' }]} />
            </View>
            <Text style={styles.metricGoal}>Sample · {stepsPct}% of {STEPS_GOAL.toLocaleString()}</Text>
          </View>

          <TouchableOpacity style={styles.metricCard} onPress={() => setFoodModal(true)}>
            <Text style={styles.metricEmoji}>🔥</Text>
            <Text style={styles.metricValue}>{calories}</Text>
            <Text style={styles.metricLabel}>Calories</Text>
            <View style={styles.metricBarBg}>
              <View style={[styles.metricBarFill, { width: `${caloriePct}%`, backgroundColor: '#f59e0b' }]} />
            </View>
            <Text style={styles.metricGoal}>{caloriePct}% of {calorieGoal} kcal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sleepCard}>
          <View style={styles.sleepLeft}>
            <Text style={styles.sleepEmoji}>😴</Text>
            <View>
              <Text style={styles.sleepLabel}>Sleep Last Night</Text>
              <View style={styles.sleepValueRow}>
                <Text style={styles.sleepValue}>{sleep}</Text>
                <Text style={styles.sleepUnit}> hrs</Text>
              </View>
            </View>
          </View>
          <View style={styles.sleepRight}>
            <View style={styles.sleepBadge}>
              <Text style={styles.sleepBadgeText}>Sample</Text>
            </View>
            <Text style={styles.sleepSub}>Recommended: 7–9 hrs</Text>
          </View>
        </View>

        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View>
              <Text style={styles.waterTitle}>💧 Water Intake</Text>
              <Text style={styles.waterSub}>
                {waterGlasses} of {waterGoalGlasses} glasses · {waterPct}%
              </Text>
            </View>
            <TouchableOpacity style={styles.waterAddBtn} onPress={addGlass}>
              <Text style={styles.waterAddText}>+ Glass</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.glassesRow}>
            {Array.from({ length: waterGoalGlasses }).map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setGlasses(i + 1)}
                style={[styles.glass, i < waterGlasses && styles.glassFull]}
              >
                <Text style={styles.glassEmoji}>{i < waterGlasses ? '💧' : '○'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.waterBarBg}>
            <View style={[styles.waterBarFill, { width: `${waterPct}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Daily Tips</Text>
        {HEALTH_TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </ScrollView>

      <FormModal visible={foodModal} title="Log Food" onClose={() => setFoodModal(false)} onSubmit={handleLogFood} loading={saving}>
        <FormField label="Food name" value={foodQuery} onChangeText={setFoodQuery} placeholder="Search or enter name" />
        <FormField label="Calories (if custom)" value={customCalories} onChangeText={setCustomCalories} placeholder="250" />
      </FormModal>

      <FormModal visible={metricModal} title="Log Body Metrics" onClose={() => setMetricModal(false)} onSubmit={handleLogMetric} loading={saving}>
        <FormField label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="70" />
        <FormField label="Height (cm, optional)" value={height} onChangeText={setHeight} placeholder="175" />
      </FormModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, marginBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 20 },
  hrCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hrLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 4 },
  hrRow: { flexDirection: 'row', alignItems: 'flex-end' },
  hrValue: { fontSize: 36, fontWeight: '800', color: '#fff' },
  hrUnit: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  hrStatus: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  hrEmoji: { fontSize: 48, opacity: 0.9 },
  bmiCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bmiTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  bmiValue: { fontSize: 18, fontWeight: '800', color: '#6366f1' },
  bmiCat: { fontSize: 13, color: '#64748b', marginTop: 4 },
  bmiTap: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  metricsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricEmoji: { fontSize: 24, marginBottom: 8 },
  metricValue: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  metricLabel: { fontSize: 12, color: '#64748b', marginTop: 2, marginBottom: 10 },
  metricBarBg: { height: 5, backgroundColor: '#f1f5f9', borderRadius: 99, marginBottom: 6 },
  metricBarFill: { height: 5, borderRadius: 99 },
  metricGoal: { fontSize: 11, color: '#94a3b8' },
  sleepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sleepLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sleepEmoji: { fontSize: 32 },
  sleepLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  sleepValueRow: { flexDirection: 'row', alignItems: 'flex-end' },
  sleepValue: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  sleepUnit: { fontSize: 14, color: '#64748b', marginBottom: 5 },
  sleepRight: { alignItems: 'flex-end', gap: 6 },
  sleepBadge: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  sleepBadgeText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  sleepSub: { fontSize: 11, color: '#94a3b8' },
  waterCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  waterTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  waterSub: { fontSize: 13, color: '#64748b' },
  waterAddBtn: { backgroundColor: '#eff6ff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  waterAddText: { fontSize: 13, fontWeight: '700', color: '#0ea5e9' },
  glassesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 4 },
  glass: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  glassFull: { backgroundColor: '#eff6ff' },
  glassEmoji: { fontSize: 18 },
  waterBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 99 },
  waterBarFill: { height: 6, backgroundColor: '#0ea5e9', borderRadius: 99 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', paddingHorizontal: 20, marginBottom: 12 },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tipText: { fontSize: 14, color: '#334155', lineHeight: 20 },
});
