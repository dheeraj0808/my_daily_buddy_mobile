import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, radius, spacing } from '@/theme';

interface Props<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  accent?: string;
}

export default function FilterChips<T extends string>({
  options,
  value,
  onChange,
  accent = palette.primaryLight,
}: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
            activeOpacity={0.85}
          >
            <AppText variant="label" color={active ? palette.white : palette.textSecondary}>
              {opt}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="h2">{title}</AppText>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={8}>
          <AppText variant="label" color={palette.primaryLight}>
            {actionLabel}
          </AppText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function CheckCircle({ checked, color = palette.success }: { checked: boolean; color?: string }) {
  return (
    <View style={[styles.check, checked && { backgroundColor: color, borderColor: color }]}>
      {checked ? <Ionicons name="checkmark" size={14} color={palette.white} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 52 },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
