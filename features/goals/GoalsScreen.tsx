import React from 'react';
import { StyleSheet } from 'react-native';

import LoadingState from '@/components/shared/LoadingState';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import GoalsPanel from '@/features/goals/GoalsPanel';
import { useGoals } from '@/hooks/use-goals';
import { palette, spacing } from '@/theme';

/** @deprecated Use Track tab — kept for internal reuse only */
export default function GoalsScreen() {
  const state = useGoals();

  if (state.loading && !state.refreshing) return <LoadingState />;

  return (
    <Screen refreshing={state.refreshing} onRefresh={state.refresh} refreshTint={palette.secondary} contentStyle={styles.scroll}>
      <ScreenHeader accent="goals" title="Goals" subtitle="Long-term targets" style={styles.header} />
      <GoalsPanel state={state} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  header: { marginHorizontal: -spacing.lg, marginTop: -spacing.md, marginBottom: spacing.lg },
});
