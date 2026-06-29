import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, spacing } from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  refreshTint?: string;
  contentStyle?: ViewStyle;
  /** Full-bleed header (gradient) — rendered above scroll, respects top safe area */
  header?: React.ReactNode;
  /** Default true — horizontal padding for scroll body */
  padded?: boolean;
}

export default function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  refreshTint = palette.primaryLight,
  contentStyle,
  header,
  padded = true,
}: Props) {
  const insets = useSafeAreaInsets();

  const refreshControl =
    onRefresh != null ? (
      <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={refreshTint} />
    ) : undefined;

  const bodyPadding = padded ? styles.padded : undefined;
  const bottomPad = Math.max(insets.bottom, spacing.sm) + spacing.lg;

  if (!scroll) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {header}
        <View style={[styles.content, bodyPadding, contentStyle, { paddingBottom: bottomPad }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {header ? <View style={{ paddingTop: insets.top }}>{header}</View> : <View style={{ height: insets.top }} />}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scroll, bodyPadding, { paddingBottom: bottomPad }, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl as RefreshControlProps | undefined}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  scrollView: { flex: 1 },
  content: { flex: 1 },
  scroll: { flexGrow: 1 },
  padded: { paddingHorizontal: spacing.lg },
});
