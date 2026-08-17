import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import ErrorBanner from '@/components/shared/ErrorBanner';
import AppText from '@/components/ui/AppText';
import Card from '@/components/ui/Card';
import { type useCatchUp } from '@/hooks/use-catchup';
import type { CatchupPlan } from '@/services/catchupAPI';
import { palette, radius, shadows, spacing } from '@/theme';
import { getErrorMessage } from '@/utils/errors';

type CatchUpState = ReturnType<typeof useCatchUp>;

interface Props {
  state: CatchUpState;
  onSubtitleChange?: (text: string) => void;
}

export default function CatchUpPanel({ state, onSubtitleChange }: Props) {
  const { plans, loading, error, premiumRequired, reload, generateDraft, acceptPlan, rejectPlan } =
    state;
  const [selectedByPlan, setSelectedByPlan] = useState<Record<string, string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);

  useEffect(() => {
    const draft = plans.filter((p) => p.status === 'DRAFT').length;
    onSubtitleChange?.(
      premiumRequired
        ? 'Premium feature — upgrade to unlock recovery plans'
        : `${draft} draft · ${plans.length} total plans`,
    );
  }, [plans, premiumRequired, onSubtitleChange]);

  useEffect(() => {
    setSelectedByPlan((prev) => {
      const next = { ...prev };
      for (const plan of plans) {
        if (plan.status !== 'DRAFT') continue;
        if (next[plan.id]?.length) continue;
        next[plan.id] = (plan.adjustments ?? []).map((a) => a.id);
      }
      return next;
    });
  }, [plans]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={palette.primaryLight} />
        <AppText variant="caption">Loading recovery plans…</AppText>
      </View>
    );
  }

  if (premiumRequired) {
    return (
      <Card padded style={styles.premiumCard}>
        <EmptyState
          icon="lock-closed-outline"
          title="Catch-up recovery is premium"
          subtitle="Get personalized habit recovery plans when you miss days. Upgrade your plan in Profile."
          actionLabel="View plans"
          onAction={() => router.push('/(tabs)/profile')}
        />
      </Card>
    );
  }

  return (
    <View>
      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}

      <TouchableOpacity
        style={[styles.generateBtn, generating && styles.disabled]}
        disabled={generating}
        onPress={async () => {
          setGenerating(true);
          try {
            await generateDraft();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setGenerating(false);
          }
        }}
      >
        {generating ? (
          <ActivityIndicator color={palette.white} size="small" />
        ) : (
          <Ionicons name="sparkles-outline" size={18} color={palette.white} />
        )}
        <AppText variant="label" color={palette.white}>
          {generating ? 'Generating…' : 'Generate recovery draft'}
        </AppText>
      </TouchableOpacity>

      {plans.length === 0 ? (
        <EmptyState
          icon="fitness-outline"
          title="No recovery plans yet"
          subtitle="Generate a draft when habits slip — we'll suggest a 7-day catch-up."
          actionLabel="Generate draft"
          onAction={() => {
            setGenerating(true);
            generateDraft()
              .catch((err) => Alert.alert('Error', getErrorMessage(err)))
              .finally(() => setGenerating(false));
          }}
        />
      ) : (
        plans.map((plan) => (
          <DraftPlanCard
            key={plan.id}
            plan={plan}
            selectedIds={selectedByPlan[plan.id] ?? []}
            busy={busyPlanId === plan.id}
            onToggle={(adjId) => {
              setSelectedByPlan((prev) => {
                const current = prev[plan.id] ?? [];
                const next = current.includes(adjId)
                  ? current.filter((id) => id !== adjId)
                  : [...current, adjId];
                return { ...prev, [plan.id]: next };
              });
            }}
            onAccept={async () => {
              const ids = selectedByPlan[plan.id] ?? [];
              if (ids.length === 0) {
                Alert.alert(
                  'Select adjustments',
                  'Choose at least one adjustment, or select all before accepting.',
                );
                return;
              }
              setBusyPlanId(plan.id);
              try {
                await acceptPlan(plan.id, ids);
              } catch (err) {
                Alert.alert('Error', getErrorMessage(err));
              } finally {
                setBusyPlanId(null);
              }
            }}
            onReject={async () => {
              setBusyPlanId(plan.id);
              try {
                await rejectPlan(plan.id);
              } catch (err) {
                Alert.alert('Error', getErrorMessage(err));
              } finally {
                setBusyPlanId(null);
              }
            }}
          />
        ))
      )}
    </View>
  );
}

function DraftPlanCard({
  plan,
  selectedIds,
  busy,
  onToggle,
  onAccept,
  onReject,
}: {
  plan: CatchupPlan;
  selectedIds: string[];
  busy: boolean;
  onToggle: (id: string) => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const adjustments = useMemo(() => plan.adjustments ?? [], [plan.adjustments]);

  return (
    <Card padded style={styles.planCard}>
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
      {adjustments.length ? (
        <View style={styles.adjustments}>
          <AppText variant="label" color={palette.textSecondary}>
            {plan.status === 'DRAFT' ? 'Select adjustments to apply' : 'Suggested adjustments'}
          </AppText>
          {adjustments.map((adj) => {
            const selected = selectedIds.includes(adj.id);
            return (
              <TouchableOpacity
                key={adj.id}
                style={styles.adjustmentRow}
                disabled={plan.status !== 'DRAFT' || busy}
                onPress={() => onToggle(adj.id)}
                activeOpacity={0.8}
              >
                {plan.status === 'DRAFT' ? (
                  <Ionicons
                    name={selected ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={selected ? palette.primaryLight : palette.textMuted}
                  />
                ) : (
                  <View style={styles.adjustmentDot} />
                )}
                <View style={styles.adjustmentBody}>
                  <AppText variant="title">{adj.title}</AppText>
                  {adj.description ? (
                    <AppText variant="caption" color={palette.textMuted}>
                      {adj.description}
                    </AppText>
                  ) : null}
                  <AppText variant="caption" color={palette.primaryLight}>
                    {adj.adjustment_type.replace(/_/g, ' ')}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
      {plan.status === 'DRAFT' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.acceptBtn, busy && styles.disabled]}
            onPress={onAccept}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={palette.white} size="small" />
            ) : (
              <AppText variant="label" color={palette.white}>
                Accept plan
              </AppText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.rejectBtn, busy && styles.disabled]}
            onPress={onReject}
            disabled={busy}
          >
            <AppText variant="label" color={palette.textSecondary}>
              Dismiss
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}
    </Card>
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
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  premiumCard: { alignItems: 'center', ...shadows.sm },
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
  disabled: { opacity: 0.6 },
  planCard: { marginBottom: spacing.sm, gap: spacing.sm, ...shadows.sm },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  insights: { gap: 4 },
  adjustments: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border,
  },
  adjustmentRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  adjustmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.primaryLight,
    marginTop: 7,
  },
  adjustmentBody: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  acceptBtn: {
    flex: 1,
    backgroundColor: palette.success,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
});
