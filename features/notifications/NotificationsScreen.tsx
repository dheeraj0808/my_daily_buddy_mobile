import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import Screen from '@/components/ui/Screen';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useNotifications } from '@/hooks/use-notifications';
import { palette, radius, spacing } from '@/theme';
import { formatTime } from '@/utils/timezone';

function statusStyle(status: string) {
  const s = status.toUpperCase();
  if (s === 'SENT' || s === 'DELIVERED') return { bg: palette.success + '18', color: palette.success };
  if (s === 'FAILED') return { bg: palette.error + '18', color: palette.error };
  return { bg: palette.warning + '18', color: palette.warning };
}

export default function NotificationsScreen() {
  const { notifications, loading, refreshing, error, refresh, reload } = useNotifications();

  if (loading && !refreshing) {
    return (
      <Screen
        header={
          <ScreenHeader
            accent="primary"
            title="Notifications"
            subtitle="Loading…"
            onBack={() => router.back()}
          />
        }
      >
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
          onBack={() => router.back()}
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
        notifications.map((n) => {
          const badge = statusStyle(n.status);
          return (
            <Card key={n.id} padded style={styles.card}>
              <View style={styles.row}>
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
                    <View style={[styles.statusPill, { backgroundColor: badge.bg }]}>
                      <AppText variant="caption" color={badge.color}>
                        {n.status}
                      </AppText>
                    </View>
                    <AppText variant="caption" color={palette.textMuted}>
                      {formatTime(n.sent_at ?? n.created_at)}
                    </AppText>
                  </View>
                </View>
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.primaryLight + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 4 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
});
