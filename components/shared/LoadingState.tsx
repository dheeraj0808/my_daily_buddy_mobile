import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, spacing } from '@/theme';

export default function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={palette.primaryLight} />
      <AppText variant="caption" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: palette.background,
  },
  text: { marginTop: spacing.xs },
});
