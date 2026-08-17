import type { Plan, UserSubscription } from '@/services/subscriptionAPI';

/** True when price is 0 or plan name/code contains "free". */
export function isFreePlan(plan: Pick<Plan, 'plan_code' | 'name' | 'price'> | null | undefined): boolean {
  if (!plan) return true;
  const name = (plan.name ?? '').toLowerCase();
  const code = (plan.plan_code ?? '').toLowerCase();
  return (
    code === 'free_plan' ||
    code.includes('free') ||
    name.includes('free') ||
    Number(plan.price) === 0
  );
}

/** Active paid subscription (not free). */
export function isPremiumSubscription(sub: UserSubscription | null | undefined): boolean {
  if (!sub?.is_active || !sub.plan) return false;
  return !isFreePlan(sub.plan);
}

export function findFreePlan(plans: Plan[]): Plan | undefined {
  return plans.find((p) => isFreePlan(p));
}

/** Detect free-tier reminder limit (and similar) upgrade hints from API errors. */
export function isPremiumUpgradeError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 403) return true;
  const msg = String(
    (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message ?? '',
  ).toLowerCase();
  return (
    msg.includes('premium') ||
    msg.includes('upgrade') ||
    msg.includes('free plan') ||
    msg.includes('reminder limit') ||
    msg.includes('limit of')
  );
}

export function premiumUpgradeMessage(fallback = 'Upgrade to Premium in Profile to unlock this feature.'): string {
  return fallback;
}
