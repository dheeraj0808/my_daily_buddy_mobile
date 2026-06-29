import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, radius, spacing } from '@/theme';

interface Props {
  title?: string;
  subtitle?: string;
}

export default function BrandHeader({
  title = 'My Daily Buddy',
  subtitle = 'Your personal routine & wellness companion',
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logo}>
        <AppText variant="h1" color={palette.primaryLight} style={styles.logoText}>
          MDB
        </AppText>
      </View>
      <AppText variant="display" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="caption" style={styles.subtitle}>
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xxl,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  logoText: { letterSpacing: 1 },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', maxWidth: 280, lineHeight: 20 },
});
