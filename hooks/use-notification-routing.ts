import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

type PushData = {
  type?: string;
  referenceType?: string;
  reference_type?: string;
  referenceId?: string;
  reference_id?: string;
};

function routeFromNotificationData(data: PushData | undefined | null) {
  if (!data) {
    router.push('/notifications');
    return;
  }

  const refType = (data.referenceType ?? data.reference_type ?? data.type ?? '').toLowerCase();
  const refId = data.referenceId ?? data.reference_id;

  if (refType.includes('reminder')) {
    router.push('/(tabs)/reminders');
    return;
  }
  if (refType.includes('catchup') || refType.includes('catch-up') || refType.includes('recovery')) {
    router.push('/(tabs)/track?segment=recovery');
    return;
  }
  if (refType.includes('habit')) {
    router.push('/(tabs)/track?segment=habits');
    return;
  }
  if (refType.includes('goal')) {
    router.push('/(tabs)/track?segment=goals');
    return;
  }
  if (refType.includes('task')) {
    router.push('/(tabs)/dashboard');
    return;
  }
  if (refType.includes('subscription') || refType.includes('payment')) {
    router.push('/(tabs)/profile');
    return;
  }

  if (refId) {
    router.push('/notifications');
    return;
  }

  router.push('/notifications');
}

/** Navigate when user taps a push / local notification. */
export function useNotificationRouting(enabled: boolean) {
  const handledInitial = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as PushData;
      routeFromNotificationData(data);
    });

    if (!handledInitial.current) {
      handledInitial.current = true;
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (!response) return;
          const data = response.notification.request.content.data as PushData;
          routeFromNotificationData(data);
        })
        .catch(() => {
          // ignore cold-start lookup failures
        });
    }

    return () => sub.remove();
  }, [enabled]);
}

export function getExpoProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string } }
    | undefined;
  return (
    extra?.eas?.projectId ||
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId ||
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
    undefined
  );
}
