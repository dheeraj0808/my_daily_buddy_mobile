import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import LoadingState from '@/components/shared/LoadingState';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import { useCatchUp } from '@/hooks/use-catchup';
import { palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

interface Props {
  onSubtitleChange?: (text: string) => void;
}

export default function CatchUpPanel({ onSubtitleChange }: Props) {
  const { plans, loading, error, premiumRequired, reload, generateDraft, acceptPlan, rejectPlan } =
    useCatchUp();

  React.useEffect(() => {
    const draft = plans.filter((p) => p.status === 'DRAFT').length;
    onSubtitleChange?.(
      premiumRequired
        ? 'Premium feature — upgrade to unlock recovery plans'
        : `${draft} draft · ${plans.length} total plans`,
    );
  }, [plans, premiumRequired, onSubtitleChange]);

  if (loading) return <LoadingState />;

  if (premiumRequired) {
    return (
      <Card padded style={styles.premiumCard}>
        <Ionicons name="lock-closed-outline" size={32} color={palette.primaryLight} />
        <AppText variant="title" style={styles.premiumTitle}>
          Catch-up recovery is premium
        </AppText>
        <AppText variant="body" color={palette.textSecondary} style={styles.premiumBody}>
          Get personalized habit recovery plans when you miss days. Upgrade your plan in Profile.
        </AppText>
        <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/(tabs)/profile')}>
          <AppText variant="label" color={palette.white}>
            View plans
          </AppText>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <View>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      <TouchableOpacity
        style={styles.generateBtn}
        onPress={() =>
          generateDraft().catch((err) => Alert.alert('Error', getErrorMessage(err)))
        }
      >
        <Ionicons name="sparkles-outline" size={18} color={palette.white} />
        <AppText variant="label" color={palette.white}>
          Generate recovery draft
        </AppText>
      </TouchableOpacity>

      {plans.length === 0 ? (
        <EmptyState
          icon="fitness-outline"
          title="No recovery plans yet"
          subtitle="Generate a draft when habits slip — we'll suggest a 7-day catch-up."
        />
      ) : (
        plans.map((plan) => (
          <Card key={plan.id} padded style={styles.planCard}>
            <View style={styles.planHeader}>
              <AppText variant="title">{plan.title}</AppText>
              <View style={[styles.statusBadge, statusStyle(plan.status)]}>
                <AppText variant="caption" color={statusColor(plan.status)}>
                  {plan.status}
                </AppText>
              </View>
            </View>
            {plan.summary ? (
              <AppText variant="body" color={palette.textSecondary}>
                {plan.summary}
              </AppText>
            ) : null}
            {plan.insights?.length ? (
              <View style={styles.insights}>
                {plan.insights.slice(0, 2).map((insight) => (
                  <AppText key={insight} variant="caption" color={palette.textMuted}>
                    • {insight}
                  </AppText>
                ))}
              </View>
            ) : null}
            {plan.status === 'DRAFT' ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() =>
                    acceptPlan(plan.id).catch((err) => Alert.alert('Error', getErrorMessage(err)))
                  }
                >
                  <AppText variant="label" color={palette.white}>
                    Accept plan
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() =>
                    rejectPlan(plan.id).catch((err) => Alert.alert('Error', getErrorMessage(err)))
                  }
                >
                  <AppText variant="label" color={palette.textSecondary}>
                    Dismiss
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : null}
          </Card>
        ))
      )}
    </View>
  );
}

function statusStyle(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return { backgroundColor: palette.success + '18' };
    case 'DRAFT':
      return { backgroundColor: palette.warning + '18' };
    case 'REJECTED':
    case 'EXPIRED':
      return { backgroundColor: palette.textMuted + '22' };
    default:
      return { backgroundColor: palette.surfaceMuted };
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return palette.success;
    case 'DRAFT':
      return palette.warning;
    default:
      return palette.textMuted;
  }
}

const styles = StyleSheet.create({
  premiumCard: { alignItems: 'center', gap: spacing.sm, ...shadows.sm },
  premiumTitle: { marginTop: spacing.xs, textAlign: 'center' },
  premiumBody: { textAlign: 'center' },
  upgradeBtn: {
    marginTop: spacing.sm,
    backgroundColor: palette.primaryLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  planCard: { marginBottom: spacing.sm, gap: spacing.sm, ...shadows.sm },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  insights: { gap: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  acceptBtn: {
    flex: 1,
    backgroundColor: palette.success,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
});
