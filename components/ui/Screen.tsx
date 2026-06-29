import React from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';

import { palette, spacing } from '@/theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  refreshTint?: string;
  contentStyle?: ViewStyle;
  header?: React.ReactNode;
}

export default function Screen({
  children,
  scroll = true,
  refreshing,
  onRefresh,
  refreshTint = palette.primaryLight,
  contentStyle,
  header,
}: Props) {
  const refreshControl =
    onRefresh != null ? (
      <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={refreshTint} />
    ) : undefined;

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        {header}
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {header}
      <ScrollView
        contentContainerStyle={[styles.scroll, contentStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl as RefreshControlProps | undefined}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { flex: 1 },
  scroll: { paddingBottom: spacing.xl },
});
