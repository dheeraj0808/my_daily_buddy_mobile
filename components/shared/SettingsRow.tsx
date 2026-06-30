import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import AppText from '@/components/ui/AppText';
import { palette, spacing } from '@/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
}

export default function SettingsRow({
  icon,
  iconColor = palette.primaryLight,
  iconBg = palette.primaryLight + '18',
  label,
  value,
  onPress,
  destructive,
  isLast,
}: Props) {
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={destructive ? palette.error : iconColor} />
      </View>
      <View style={styles.body}>
        <AppText variant="title" color={destructive ? palette.error : palette.text}>
          {label}
        </AppText>
        {value ? (
          <AppText variant="caption" color={palette.textSecondary}>
            {value}
          </AppText>
        ) : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={palette.textMuted} /> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.row, !isLast && styles.rowBorder]}>{content}</View>;
  }

  return (
    <TouchableOpacity style={[styles.row, !isLast && styles.rowBorder]} onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
});
