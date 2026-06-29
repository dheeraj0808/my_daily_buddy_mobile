import React from 'react';

import LoadingState from '@/components/shared/LoadingState';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import HabitsPanel from '@/features/habits/HabitsPanel';
import { useHabits } from '@/hooks/use-habits';
import { palette, spacing } from '@/theme';
import { StyleSheet } from 'react-native';

/** @deprecated Use Track tab — kept for internal reuse only */
export default function HabitsScreen() {
  const state = useHabits();

  if (state.loading && !state.refreshing) return <LoadingState />;

  return (
    <Screen refreshing={state.refreshing} onRefresh={state.refresh} refreshTint={palette.success} contentStyle={styles.scroll}>
      <ScreenHeader accent="success" title="Habits" subtitle="Daily routines" style={styles.header} />
      <HabitsPanel state={state} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { marginHorizontal: -spacing.lg, marginTop: -spacing.md },
});
