import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '@/components/ui/AppText';
import { palette, spacing } from '@/theme';

export default function LoadingState({
  message = 'Loading...',
  inline = false,
}: {
  message?: string;
  /** Compact loader for embedding inside a Screen (no full-bleed chrome). */
  inline?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        inline ? styles.inline : styles.full,
        !inline && { paddingTop: insets.top },
      ]}
    >
      <ActivityIndicator size="large" color={palette.primaryLight} />
      <AppText variant="caption" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  full: {
    flex: 1,
    backgroundColor: palette.background,
  },
  inline: {
    paddingVertical: spacing.xxl,
  },
  text: { marginTop: spacing.xs },
});
