import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { palette, radius, shadows } from '@/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export default function Card({ children, style, padded = true }: Props) {
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  padded: { padding: 16 },
});
