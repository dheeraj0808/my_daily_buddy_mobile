import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, radius, spacing } from '@/theme';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="body" color={palette.error} style={styles.text}>
        {message}
      </AppText>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} hitSlop={8}>
          <AppText variant="label" color={palette.primaryLight}>
            Retry
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FEF2F2',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  text: { flex: 1 },
});
