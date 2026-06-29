import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useHealth } from '@/hooks/use-health';
import { logFood, searchFood } from '@/services/foodAPI';
import { logBodyMetric } from '@/services/healthAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { mlToGlasses } from '@/utils/timezone';
import { getErrorMessage } from '@/utils/errors';

const STEPS_GOAL = 10000;
const HEALTH_TIPS = [
  'Walk 10 minutes after every meal for better digestion.',
  'Sleep before 11 PM for improved recovery.',
  'Deep breathing for 5 minutes reduces daily stress.',
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
    <>
      <Screen refreshing={refreshing} onRefresh={refresh} refreshTint={palette.error} contentStyle={styles.scroll}>
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        <ScreenHeader
          accent="health"
          title="Health"
          subtitle="Track nutrition, hydration & body metrics"
          style={styles.header}
        >
          <Card padded style={styles.hrCard}>
            <View>
              <AppText variant="caption" color={palette.textSecondary}>
                Heart rate
              </AppText>
              <View style={styles.hrRow}>
                <AppText variant="display" style={styles.hrValue}>
                  {heartRate}
                </AppText>
                <AppText variant="caption"> bpm</AppText>
              </View>
              <AppText variant="caption" color={palette.textMuted}>
                Connect a wearable to sync live data
              </AppText>
            </View>
            <Ionicons name="heart" size={40} color={palette.error} />
          </Card>
        </ScreenHeader>

        {health?.latest ? (
          <TouchableOpacity style={styles.bmiCard} onPress={() => setMetricModal(true)}>
            <AppText variant="title">Body metrics</AppText>
            <AppText variant="h2" color={palette.primaryLight}>
              {health.latest.weight_kg} kg{bmi != null ? ` · BMI ${bmi}` : ''}
            </AppText>
            {bmiCategory ? <AppText variant="caption">{bmiCategory.replace('_', ' ')}</AppText> : null}
            <AppText variant="caption" color={palette.textMuted}>Tap to log new weight</AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.bmiCard} onPress={() => setMetricModal(true)}>
            <AppText variant="title">Body metrics</AppText>
            <AppText variant="caption" color={palette.textMuted}>Tap to log weight & height</AppText>
          </TouchableOpacity>
        )}

        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Ionicons name="footsteps-outline" size={22} color={palette.primaryLight} />
            <AppText variant="h2">{steps.toLocaleString()}</AppText>
            <AppText variant="caption">Steps</AppText>
            <View style={styles.metricBarBg}>
              <View style={[styles.metricBarFill, { width: `${stepsPct}%`, backgroundColor: palette.primaryLight }]} />
            </View>
            <AppText variant="caption" color={palette.textMuted}>Wearable sync coming soon</AppText>
          </Card>

          <TouchableOpacity style={styles.metricCard} onPress={() => setFoodModal(true)}>
            <Ionicons name="flame-outline" size={22} color={palette.warning} />
            <AppText variant="h2">{calories}</AppText>
            <AppText variant="caption">Calories</AppText>
            <View style={styles.metricBarBg}>
              <View style={[styles.metricBarFill, { width: `${caloriePct}%`, backgroundColor: palette.warning }]} />
            </View>
            <AppText variant="caption" color={palette.textMuted}>{caloriePct}% of {calorieGoal} kcal</AppText>
          </TouchableOpacity>
        </View>

        <Card style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View>
              <AppText variant="title">Water intake</AppText>
              <AppText variant="caption">
                {waterGlasses} of {waterGoalGlasses} glasses · {waterPct}%
              </AppText>
            </View>
            <TouchableOpacity style={styles.waterAddBtn} onPress={addGlass}>
              <AppText variant="label" color={palette.info}>+ Glass</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.glassesRow}>
            {Array.from({ length: waterGoalGlasses }).map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setGlasses(i + 1)}
                style={[styles.glass, i < waterGlasses && styles.glassFull]}
              >
                <Ionicons
                  name={i < waterGlasses ? 'water' : 'water-outline'}
                  size={18}
                  color={i < waterGlasses ? palette.info : palette.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.waterBarBg}>
            <View style={[styles.waterBarFill, { width: `${waterPct}%` }]} />
          </View>
        </Card>

        <SectionHeader title="Daily tips" />
        {HEALTH_TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <AppText variant="body">{tip}</AppText>
          </View>
        ))}
      </Screen>

      <FormModal visible={foodModal} title="Log food" onClose={() => setFoodModal(false)} onSubmit={handleLogFood} loading={saving}>
        <FormField label="Food name" value={foodQuery} onChangeText={setFoodQuery} placeholder="Search or enter name" />
        <FormField label="Calories (if custom)" value={customCalories} onChangeText={setCustomCalories} placeholder="250" />
      </FormModal>

      <FormModal visible={metricModal} title="Log body metrics" onClose={() => setMetricModal(false)} onSubmit={handleLogMetric} loading={saving}>
        <FormField label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="70" />
        <FormField label="Height (cm, optional)" value={height} onChangeText={setHeight} placeholder="175" />
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { marginHorizontal: -spacing.lg, marginTop: -spacing.md },
  hrCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  hrRow: { flexDirection: 'row', alignItems: 'flex-end' },
  hrValue: { fontSize: 36 },
  bmiCard: {
    backgroundColor: palette.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  metricCard: {
    flex: 1,
    gap: 4,
  },
  metricBarBg: { height: 5, backgroundColor: palette.surfaceMuted, borderRadius: radius.full, marginVertical: 6 },
  metricBarFill: { height: 5, borderRadius: radius.full },
  waterCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.md },
  waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  waterAddBtn: { backgroundColor: '#EFF6FF', borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 6 },
  glassesRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 },
  glass: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  glassFull: { backgroundColor: '#EFF6FF' },
  waterBarBg: { height: 6, backgroundColor: palette.surfaceMuted, borderRadius: radius.full },
  waterBarFill: { height: 6, backgroundColor: palette.info, borderRadius: radius.full },
  tipCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: palette.error,
    ...shadows.sm,
  },
});
