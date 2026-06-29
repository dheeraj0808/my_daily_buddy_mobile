import api from './api';
import { unwrapPaginated, type PaginatedResponse } from './types';

export type DevicePlatform = 'ios' | 'android' | 'web';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';
export type NotificationType = 'REMINDER' | 'SYSTEM' | 'SUBSCRIPTION';

export interface RegisterDeviceTokenPayload {
  token: string;
  platform: DevicePlatform;
  device_id?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export async function registerDeviceToken(payload: RegisterDeviceTokenPayload): Promise<void> {
  await api.post('/notifications/token', payload);
}

export async function listNotifications(limit = 50): Promise<PaginatedResponse<AppNotification>> {
  const response = await api.get('/notifications', { params: { limit, sortBy: 'created_at', sortOrder: 'DESC' } });
  return unwrapPaginated<AppNotification>(response);
}
