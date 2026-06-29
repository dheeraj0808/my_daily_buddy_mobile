import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import LoadingState from '@/components/shared/LoadingState';
import FilterChips from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import GoalsPanel from '@/features/goals/GoalsPanel';
import HabitsPanel from '@/features/habits/HabitsPanel';
import { useGoals } from '@/hooks/use-goals';
import { useHabits } from '@/hooks/use-habits';
import { palette, spacing } from '@/theme';

const SEGMENTS = ['Habits', 'Goals'] as const;
type Segment = (typeof SEGMENTS)[number];

function segmentToKey(segment: Segment): 'habits' | 'goals' {
  return segment === 'Habits' ? 'habits' : 'goals';
}

function keyToSegment(key: string | undefined): Segment {
  return key === 'goals' ? 'Goals' : 'Habits';
}

export default function TrackScreen() {
  const { segment: segmentParam } = useLocalSearchParams<{ segment?: string }>();
  const [segment, setSegment] = useState<Segment>(() => keyToSegment(segmentParam));
  const [subtitle, setSubtitle] = useState('Daily habits & long-term goals');

  const habitsState = useHabits();
  const goalsState = useGoals();

  const openHabitsAdd = useRef<() => void>(() => {});
  const openGoalsAdd = useRef<() => void>(() => {});

  const registerHabitsAdd = useCallback((fn: () => void) => {
    openHabitsAdd.current = fn;
  }, []);

  const registerGoalsAdd = useCallback((fn: () => void) => {
    openGoalsAdd.current = fn;
  }, []);

  const activeKey = segmentToKey(segment);
  const isHabits = activeKey === 'habits';
  const activeState = isHabits ? habitsState : goalsState;

  useEffect(() => {
    if (segmentParam) {
      setSegment(keyToSegment(segmentParam));
    }
  }, [segmentParam]);

  const handleHabitsSummary = useCallback((summary: { subtitle: string }) => {
    if (segmentToKey(segment) === 'habits') setSubtitle(summary.subtitle);
  }, [segment]);

  const handleGoalsSummary = useCallback((summary: { subtitle: string }) => {
    if (segmentToKey(segment) === 'goals') setSubtitle(summary.subtitle);
  }, [segment]);

  const handleSegmentChange = (next: Segment) => {
    setSegment(next);
  };

  const handleAdd = () => {
    if (isHabits) openHabitsAdd.current();
    else openGoalsAdd.current();
  };

  if (activeState.loading && !activeState.refreshing) {
    return <LoadingState />;
  }

  return (
    <Screen
      refreshing={activeState.refreshing}
      onRefresh={activeState.refresh}
      refreshTint={isHabits ? palette.success : palette.secondary}
      contentStyle={styles.scroll}
    >
      <ScreenHeader
        accent="track"
        title="Track"
        subtitle={subtitle}
        onAdd={handleAdd}
        addLabel="+ Add"
        style={styles.header}
      />

      <View style={styles.segmentWrap}>
        <FilterChips
          options={SEGMENTS}
          value={segment}
          onChange={handleSegmentChange}
          accent={isHabits ? palette.success : palette.secondary}
        />
      </View>

      {isHabits ? (
        <HabitsPanel state={habitsState} onAddReady={registerHabitsAdd} onSummaryChange={handleHabitsSummary} />
      ) : (
        <GoalsPanel state={goalsState} onAddReady={registerGoalsAdd} onSummaryChange={handleGoalsSummary} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { marginHorizontal: -spacing.lg, marginTop: -spacing.md },
  segmentWrap: { marginBottom: spacing.sm },
});
