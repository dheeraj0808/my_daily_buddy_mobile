import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useNotifications } from '@/hooks/use-notifications';
import { palette, radius, shadows, spacing } from '@/theme';
import { formatTime } from '@/utils/timezone';

export default function NotificationsScreen() {
  const { notifications, loading, refreshing, error, refresh, reload } = useNotifications();

  if (loading && !refreshing) {
    return (
      <Screen header={<ScreenHeader accent="primary" title="Notifications" subtitle="Loading…" />}>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={refresh}
      header={
        <ScreenHeader
          accent="primary"
          title="Notifications"
          subtitle={`${notifications.length} total`}
        />
      }
    >
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      {notifications.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No notifications yet"
          subtitle="Reminder alerts and updates will appear here."
        />
      ) : (
        notifications.map((n) => (
          <View key={n.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={n.type === 'REMINDER' ? 'alarm-outline' : 'notifications-outline'}
                size={20}
                color={palette.primaryLight}
              />
            </View>
            <View style={styles.body}>
              <AppText variant="title">{n.title}</AppText>
              <AppText variant="body" color={palette.textSecondary}>
                {n.body}
              </AppText>
              <View style={styles.meta}>
                <AppText variant="caption" color={palette.textMuted}>
                  {n.status}
                </AppText>
                <AppText variant="caption" color={palette.textMuted}>
                  {formatTime(n.sent_at ?? n.created_at)}
                </AppText>
              </View>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.primaryLight + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
});
