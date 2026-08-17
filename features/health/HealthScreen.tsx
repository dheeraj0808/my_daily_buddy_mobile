import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import FormModal, { FormField } from '@/components/shared/FormModal';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import FilterChips, { SectionHeader } from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useHealth } from '@/hooks/use-health';
import {
  deleteFoodLog,
  getFoodGoal,
  listFoodLogs,
  logFood,
  searchFood,
  updateFoodGoal,
  type FoodItem,
  type FoodLogEntry,
  type MealType,
} from '@/services/foodAPI';
import {
  deleteBodyMetric,
  listBodyMetrics,
  logBodyMetric,
  type BodyMetric,
} from '@/services/healthAPI';
import { getWeeklyWater, updateWaterGoal } from '@/services/waterAPI';
import type { WeeklyWaterSummary } from '@/services/waterAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';
import { mlToGlasses } from '@/utils/timezone';

const HEALTH_TIPS = [
  'Walk 10 minutes after every meal for better digestion.',
  'Sleep before 11 PM for improved recovery.',
  'Deep breathing for 5 minutes reduces daily stress.',
];

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER'];

export default function HealthScreen() {
  const { water, food, health, loading, refreshing, error, refresh, reload, addGlass, setGlasses } =
    useHealth();

  const [weekly, setWeekly] = useState<WeeklyWaterSummary | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>([]);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [foodModal, setFoodModal] = useState(false);
  const [metricModal, setMetricModal] = useState(false);
  const [goalModal, setGoalModal] = useState(false);
  const [foodQuery, setFoodQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [mealType, setMealType] = useState<MealType>('LUNCH');
  const [customCalories, setCustomCalories] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waterGoalInput, setWaterGoalInput] = useState('');
  const [calorieGoalInput, setCalorieGoalInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadExtras = useCallback(async () => {
    const [w, logs, mets] = await Promise.allSettled([
      getWeeklyWater(),
      listFoodLogs({ limit: 20 }),
      listBodyMetrics({ limit: 10 }),
    ]);
    setWeekly(w.status === 'fulfilled' ? w.value : null);
    setFoodLogs(logs.status === 'fulfilled' ? logs.value : []);
    setMetrics(mets.status === 'fulfilled' ? mets.value : []);
  }, []);

  useEffect(() => {
    loadExtras().catch(() => undefined);
  }, [loadExtras, water?.totalMl, food?.logCount]);

  useEffect(() => {
    if (!foodQuery.trim() || selectedFood) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchFood(foodQuery.trim(), 8)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [foodQuery, selectedFood]);

  const waterGlasses = water ? mlToGlasses(water.totalMl) : 0;
  const waterGoalGlasses = water ? Math.max(1, mlToGlasses(water.goalMl)) : 8;
  const waterPct = water ? Math.min(water.percentComplete, 100) : 0;

  const calories = food ? Math.round(food.calories) : 0;
  const calorieGoal = food?.goalKcal ?? 2500;
  const caloriePct = food ? Math.min(food.percentComplete, 100) : 0;

  const maxWeeklyMl = weekly?.days.length
    ? Math.max(...weekly.days.map((d) => d.totalMl), 1)
    : 1;

  const openGoalModal = async () => {
    setWaterGoalInput(String(water?.goalMl ?? 2000));
    try {
      const fg = await getFoodGoal();
      setCalorieGoalInput(String(fg.goalKcal));
    } catch {
      setCalorieGoalInput(String(calorieGoal));
    }
    setGoalModal(true);
  };

  const handleSaveGoals = async () => {
    setSaving(true);
    try {
      const waterMl = Number(waterGoalInput);
      const kcal = Number(calorieGoalInput);
      if (waterMl >= 250) await updateWaterGoal(waterMl);
      if (kcal >= 500) await updateFoodGoal(kcal);
      setGoalModal(false);
      await refresh();
      await loadExtras();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resetFoodForm = () => {
    setFoodQuery('');
    setCustomCalories('');
    setSelectedFood(null);
    setSearchResults([]);
    setMealType('LUNCH');
  };

  const handleLogFood = async () => {
    setSaving(true);
    try {
      if (selectedFood) {
        await logFood({ foodItemId: selectedFood.id, quantity: 1, mealType });
      } else if (foodQuery.trim() && customCalories) {
        await logFood({
          customName: foodQuery.trim(),
          calories: Number(customCalories),
          mealType,
        });
      } else if (foodQuery.trim()) {
        Alert.alert('Pick a result', 'Select a search result or enter calories for custom food.');
        return;
      } else {
        return;
      }
      setFoodModal(false);
      resetFoodForm();
      await refresh();
      await loadExtras();
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
      await loadExtras();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFood = (entry: FoodLogEntry) => {
    Alert.alert('Delete food log', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteFoodLog(entry.id)
            .then(async () => {
              await refresh();
              await loadExtras();
            })
            .catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
    ]);
  };

  const handleDeleteMetric = (metric: BodyMetric) => {
    Alert.alert('Delete metric', 'Remove this body metric entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteBodyMetric(metric.id)
            .then(async () => {
              await refresh();
              await loadExtras();
            })
            .catch((err) => Alert.alert('Error', getErrorMessage(err))),
      },
    ]);
  };

  if (loading && !refreshing) return <LoadingState />;

  const bmi = health?.latest?.bmi;
  const bmiCategory = health?.bmiCategory;

  return (
    <>
      <Screen
        refreshing={refreshing}
        onRefresh={async () => {
          await refresh();
          await loadExtras();
        }}
        refreshTint={palette.error}
        header={
          <ScreenHeader
            accent="health"
            title="Health"
            subtitle="Track nutrition, hydration & body metrics"
            onAdd={openGoalModal}
            addLabel="Goals"
          >
            <Card padded style={styles.hrCard}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color={palette.onPrimaryMuted}>
                  Wearables
                </AppText>
                <AppText variant="title" color={palette.onPrimary}>
                  Coming soon
                </AppText>
                <AppText variant="caption" color={palette.onPrimaryMuted}>
                  Heart rate & steps sync is on the way
                </AppText>
              </View>
              <Ionicons name="watch-outline" size={36} color={palette.onPrimaryMuted} />
            </Card>
          </ScreenHeader>
        }
      >
        {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

        {health?.latest ? (
          <TouchableOpacity style={styles.bmiCard} onPress={() => setMetricModal(true)}>
            <AppText variant="title">Body metrics</AppText>
            <AppText variant="h2" color={palette.primaryLight}>
              {health.latest.weight_kg} kg{bmi != null ? ` · BMI ${bmi}` : ''}
            </AppText>
            {bmiCategory ? <AppText variant="caption">{bmiCategory.replace('_', ' ')}</AppText> : null}
            <AppText variant="caption" color={palette.textMuted}>
              Tap to log · long-press history rows to delete
            </AppText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.bmiCard} onPress={() => setMetricModal(true)}>
            <AppText variant="title">Body metrics</AppText>
            <AppText variant="caption" color={palette.textMuted}>
              Tap to log weight & height
            </AppText>
          </TouchableOpacity>
        )}

        {metrics.length > 0 ? (
          <>
            <SectionHeader title="Metric history" />
            {metrics.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={styles.historyRow}
                onLongPress={() => handleDeleteMetric(m)}
              >
                <AppText variant="title">
                  {m.weight_kg} kg{m.bmi != null ? ` · BMI ${m.bmi}` : ''}
                </AppText>
                <AppText variant="caption" color={palette.textMuted}>
                  {m.log_date}
                </AppText>
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        <View style={styles.metricsRow}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.85}
            onPress={() => setFoodModal(true)}
          >
            <Card style={styles.metricCard}>
              <Ionicons name="flame-outline" size={22} color={palette.warning} />
              <AppText variant="h2">{calories}</AppText>
              <AppText variant="caption">Calories</AppText>
              <View style={styles.metricBarBg}>
                <View
                  style={[
                    styles.metricBarFill,
                    { width: `${caloriePct}%`, backgroundColor: palette.warning },
                  ]}
                />
              </View>
              <AppText variant="caption" color={palette.textMuted}>
                {caloriePct}% of {calorieGoal} kcal
              </AppText>
            </Card>
          </TouchableOpacity>

          <Card style={[styles.metricCard, { flex: 1 }]}>
            <Ionicons name="nutrition-outline" size={22} color={palette.success} />
            <AppText variant="h2">{foodLogs.length}</AppText>
            <AppText variant="caption">Food logs</AppText>
            <AppText variant="caption" color={palette.textMuted}>
              {foodLogs.length === 0 ? 'Tap calories to log' : 'Long-press to delete'}
            </AppText>
          </Card>
        </View>

        {foodLogs.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="No food logged today"
            subtitle="Track meals to stay on your calorie goal."
            actionLabel="+ Log food"
            onAction={() => setFoodModal(true)}
          />
        ) : (
          <>
            <SectionHeader title="Today's food logs" />
            {foodLogs.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.historyRow}
                onLongPress={() => handleDeleteFood(entry)}
              >
                <View style={{ flex: 1 }}>
                  <AppText variant="title">
                    {entry.food_item?.name ?? entry.custom_name ?? 'Food'}
                  </AppText>
                  <AppText variant="caption" color={palette.textMuted}>
                    {entry.meal_type} · {Math.round(entry.calories)} kcal
                  </AppText>
                </View>
                <Ionicons name="trash-outline" size={16} color={palette.textMuted} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <Card style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View>
              <AppText variant="title">Water intake</AppText>
              <AppText variant="caption">
                {waterGlasses} of {waterGoalGlasses} glasses · {waterPct}%
              </AppText>
            </View>
            <TouchableOpacity
              style={styles.waterAddBtn}
              onPress={() => addGlass().catch((err) => Alert.alert('Error', getErrorMessage(err)))}
            >
              <AppText variant="label" color={palette.info}>
                + Glass
              </AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.glassesRow}>
            {Array.from({ length: Math.min(waterGoalGlasses, 12) }).map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() =>
                  setGlasses(i + 1).catch((err) => Alert.alert('Error', getErrorMessage(err)))
                }
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
          {waterGoalGlasses > 12 ? (
            <AppText variant="caption" color={palette.textMuted}>
              Showing 12 of {waterGoalGlasses} — use + Glass for more
            </AppText>
          ) : null}
          <View style={styles.waterBarBg}>
            <View style={[styles.waterBarFill, { width: `${waterPct}%` }]} />
          </View>
        </Card>

        {weekly ? (
          <>
            <SectionHeader title="Water — last 7 days" />
            <Card style={styles.weeklyCard}>
              <View style={styles.weeklyMeta}>
                <AppText variant="caption">{weekly.weeklyTotalMl} ml total</AppText>
                <AppText variant="caption">
                  {weekly.daysGoalMet}/7 days on goal
                </AppText>
              </View>
              <View style={styles.chartRow}>
                {weekly.days.map((day) => {
                  const h = Math.max(8, Math.round((day.totalMl / maxWeeklyMl) * 72));
                  return (
                    <View key={day.date} style={styles.chartCol}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: h,
                            backgroundColor: day.goalMet ? palette.info : palette.surfaceMuted,
                          },
                        ]}
                      />
                      <AppText variant="caption" color={palette.textMuted}>
                        {day.date.slice(5)}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </Card>
          </>
        ) : null}

        <SectionHeader title="Daily tips" />
        {HEALTH_TIPS.map((tip, i) => (
          <View key={i} style={styles.tipCard}>
            <AppText variant="body">{tip}</AppText>
          </View>
        ))}
      </Screen>

      <FormModal
        visible={foodModal}
        title="Log food"
        onClose={() => {
          setFoodModal(false);
          resetFoodForm();
        }}
        onSubmit={handleLogFood}
        loading={saving}
      >
        <FormField
          label="Search food"
          value={foodQuery}
          onChangeText={(text) => {
            setFoodQuery(text);
            setSelectedFood(null);
          }}
          placeholder="Search or enter custom name"
        />
        {selectedFood ? (
          <AppText variant="caption" color={palette.success} style={{ marginBottom: spacing.sm }}>
            Selected: {selectedFood.name} ({selectedFood.calories} kcal)
          </AppText>
        ) : null}
        {searchResults.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.searchHit}
            onPress={() => {
              setSelectedFood(item);
              setFoodQuery(item.name);
              setSearchResults([]);
            }}
          >
            <AppText variant="title">{item.name}</AppText>
            <AppText variant="caption" color={palette.textMuted}>
              {item.calories} kcal
            </AppText>
          </TouchableOpacity>
        ))}
        <AppText variant="caption" color={palette.textSecondary} style={{ marginBottom: spacing.xs }}>
          Meal type
        </AppText>
        <FilterChips
          options={MEAL_TYPES}
          value={mealType}
          onChange={(v) => setMealType(v as MealType)}
          accent={palette.warning}
        />
        {!selectedFood ? (
          <FormField
            label="Calories (for custom food)"
            value={customCalories}
            onChangeText={setCustomCalories}
            placeholder="250"
          />
        ) : null}
      </FormModal>

      <FormModal
        visible={metricModal}
        title="Log body metrics"
        onClose={() => setMetricModal(false)}
        onSubmit={handleLogMetric}
        loading={saving}
      >
        <FormField label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="70" />
        <FormField
          label="Height (cm, optional)"
          value={height}
          onChangeText={setHeight}
          placeholder="175"
        />
      </FormModal>

      <FormModal
        visible={goalModal}
        title="Daily goals"
        onClose={() => setGoalModal(false)}
        onSubmit={handleSaveGoals}
        loading={saving}
      >
        <FormField
          label="Water goal (ml)"
          value={waterGoalInput}
          onChangeText={setWaterGoalInput}
          placeholder="2000"
        />
        <FormField
          label="Calorie goal (kcal)"
          value={calorieGoalInput}
          onChangeText={setCalorieGoalInput}
          placeholder="2500"
        />
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  hrCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  hrRow: { flexDirection: 'row', alignItems: 'flex-end' },
  hrValue: { fontSize: 36 },
  bmiCard: {
    backgroundColor: palette.surface,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  metricCard: {
    flex: 1,
    gap: 4,
  },
  metricBarBg: {
    height: 5,
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.full,
    marginVertical: 6,
  },
  metricBarFill: { height: 5, borderRadius: radius.full },
  waterCard: { marginBottom: spacing.lg, gap: spacing.md },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  waterAddBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  glassesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  glass: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassFull: { backgroundColor: '#EFF6FF' },
  waterBarBg: { height: 6, backgroundColor: palette.surfaceMuted, borderRadius: radius.full },
  waterBarFill: { height: 6, backgroundColor: palette.info, borderRadius: radius.full },
  weeklyCard: { marginBottom: spacing.lg, gap: spacing.sm },
  weeklyMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    minHeight: 90,
  },
  chartCol: { alignItems: 'center', gap: 4, flex: 1 },
  chartBar: { width: 18, borderRadius: radius.sm },
  tipCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: palette.error,
    ...shadows.sm,
  },
  historyRow: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchHit: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    gap: 2,
  },
});
