import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import LoadingState from '@/components/shared/LoadingState';
import FilterChips from '@/components/ui/FilterChips';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import CatchUpPanel from '@/features/catchup/CatchUpPanel';
import GoalsPanel from '@/features/goals/GoalsPanel';
import HabitsPanel from '@/features/habits/HabitsPanel';
import { useGoals } from '@/hooks/use-goals';
import { useHabits } from '@/hooks/use-habits';
import { palette } from '@/theme';

const SEGMENTS = ['Habits', 'Goals', 'Recovery'] as const;
type Segment = (typeof SEGMENTS)[number];

function segmentToKey(segment: Segment): 'habits' | 'goals' | 'recovery' {
  if (segment === 'Goals') return 'goals';
  if (segment === 'Recovery') return 'recovery';
  return 'habits';
}

function keyToSegment(key: string | undefined): Segment {
  if (key === 'goals') return 'Goals';
  if (key === 'recovery' || key === 'catchup') return 'Recovery';
  return 'Habits';
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
  const isGoals = activeKey === 'goals';
  const isRecovery = activeKey === 'recovery';
  const activeState = isHabits ? habitsState : isGoals ? goalsState : null;

  useEffect(() => {
    if (segmentParam) {
      setSegment(keyToSegment(segmentParam));
    }
  }, [segmentParam]);

  useEffect(() => {
    if (isRecovery) return;
    if (isHabits) {
      const completed = habitsState.habits.filter((h) => h.completedToday).length;
      setSubtitle(`${completed} of ${habitsState.habits.length} habits done today`);
    } else {
      setSubtitle(
        `${goalsState.stats?.total ?? goalsState.goals.length} goals · ${Math.round(goalsState.stats?.completionRate ?? 0)}% completion`
      );
    }
  }, [segment, isHabits, isRecovery, habitsState.habits, goalsState.goals, goalsState.stats]);

  const handleAdd = () => {
    if (isHabits) openHabitsAdd.current();
    else if (isGoals) openGoalsAdd.current();
  };

  if (activeState?.loading && !activeState.refreshing) {
    return <LoadingState />;
  }

  return (
    <Screen
      refreshing={activeState?.refreshing ?? false}
      onRefresh={activeState?.refresh}
      refreshTint={isHabits ? palette.success : isGoals ? palette.secondary : palette.primaryLight}
      header={
        <ScreenHeader
          accent="track"
          title="Track"
          subtitle={subtitle}
          onAdd={isRecovery ? undefined : handleAdd}
          addLabel="+ Add"
        />
      }
    >
      <View style={styles.segmentWrap}>
        <FilterChips
          options={[...SEGMENTS]}
          value={segment}
          onChange={setSegment}
          accent={isHabits ? palette.success : isGoals ? palette.secondary : palette.primaryLight}
        />
      </View>

      {isHabits ? (
        <HabitsPanel state={habitsState} onAddReady={registerHabitsAdd} />
      ) : isGoals ? (
        <GoalsPanel state={goalsState} onAddReady={registerGoalsAdd} />
      ) : (
        <CatchUpPanel onSubtitleChange={setSubtitle} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentWrap: { marginBottom: 4 },
});
