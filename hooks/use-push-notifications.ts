import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { registerDeviceToken, type DevicePlatform } from '@/services/notificationAPI';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function resolvePlatform(): DevicePlatform {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

async function obtainPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const expoToken = await Notifications.getExpoPushTokenAsync();
    return expoToken.data;
  } catch {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    return typeof deviceToken.data === 'string' ? deviceToken.data : String(deviceToken.data);
  }
}

/**
 * Registers the device push token with the backend when the user is authenticated.
 */
export function usePushNotifications(enabled: boolean) {
  const lastToken = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      lastToken.current = null;
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const token = await obtainPushToken();
        if (!token || cancelled || token === lastToken.current) return;

        await registerDeviceToken({
          token,
          platform: resolvePlatform(),
          device_id: Device.modelName ?? undefined,
        });
        lastToken.current = token;
      } catch (err) {
        if (__DEV__) {
          console.warn('[Push] Token registration failed:', err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
