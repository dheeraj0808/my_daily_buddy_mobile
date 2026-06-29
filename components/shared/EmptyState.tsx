import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, spacing } from '@/theme';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon = 'folder-open-outline', title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={32} color={palette.textMuted} />
      </View>
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', maxWidth: 260 },
});
