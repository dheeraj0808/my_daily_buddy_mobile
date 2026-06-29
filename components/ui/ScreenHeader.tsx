import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';

import AppText from '@/components/ui/AppText';
import { gradients, palette, radius, spacing, type ScreenAccent } from '@/theme';

interface StatItem {
  value: string | number;
  label: string;
}

interface Props {
  accent: ScreenAccent;
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  stats?: StatItem[];
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenHeader({
  accent,
  title,
  subtitle,
  onAdd,
  addLabel = '+ Add',
  stats,
  children,
  style,
}: Props) {
  return (
    <LinearGradient colors={[...gradients[accent]]} style={[styles.wrap, style]}>
      <View style={styles.top}>
        <View style={styles.titles}>
          <AppText variant="h1" color={palette.onPrimary}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color={palette.onPrimaryMuted} style={styles.sub}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {onAdd ? (
          <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.85}>
            <AppText variant="label" color={palette.onPrimary}>
              {addLabel}
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>

      {stats && stats.length > 0 ? (
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statPill}>
              <AppText variant="h1" color={palette.onPrimary} style={styles.statValue}>
                {s.value}
              </AppText>
              <AppText variant="caption" color={palette.onPrimaryMuted}>
                {s.label}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titles: { flex: 1, marginRight: spacing.sm },
  sub: { marginTop: 2 },
  addBtn: {
    backgroundColor: palette.onPrimarySubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statPill: {
    flex: 1,
    backgroundColor: palette.onPrimarySubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 22 },
});
