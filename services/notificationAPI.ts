import api from './api';

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface RegisterDeviceTokenPayload {
  token: string;
  platform: DevicePlatform;
  device_id?: string;
}

export async function registerDeviceToken(payload: RegisterDeviceTokenPayload): Promise<void> {
  await api.post('/notifications/token', payload);
}
