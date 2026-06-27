import api from './api';
import { unwrapData } from './types';
import { getDeviceTimezone } from '@/utils/timezone';

export interface BodyMetric {
  id: string;
  user_id: string;
  weight_kg: number;
  height_cm: number | null;
  bmi: number | null;
  log_date: string;
  note: string | null;
  created_at: string;
}

export interface HealthSummary {
  latest: BodyMetric | null;
  bmiCategory: string | null;
}

export async function getHealthSummary(): Promise<HealthSummary> {
  const response = await api.get('/health/metrics/summary');
  return unwrapData<HealthSummary>(response);
}

export async function getLatestMetric(): Promise<BodyMetric | null> {
  const response = await api.get('/health/metrics/latest');
  return unwrapData<BodyMetric | null>(response);
}

export async function logBodyMetric(payload: {
  weightKg: number;
  heightCm?: number;
  note?: string;
}): Promise<BodyMetric> {
  const response = await api.post('/health/metrics', {
    ...payload,
    tz: getDeviceTimezone(),
  });
  return unwrapData<BodyMetric>(response);
}
