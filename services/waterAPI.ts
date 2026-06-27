import api from './api';
import { unwrapData } from './types';
import { getDeviceTimezone } from '@/utils/timezone';

export interface TodayWaterSummary {
  date: string;
  totalMl: number;
  goalMl: number;
  percentComplete: number;
  remainingMl: number;
  logCount: number;
  goalMet: boolean;
}

export async function getTodayWater(): Promise<TodayWaterSummary> {
  const response = await api.get('/water/today', {
    params: { tz: getDeviceTimezone() },
  });
  return unwrapData<TodayWaterSummary>(response);
}

export async function logWater(amountMl: number): Promise<TodayWaterSummary> {
  const response = await api.post('/water/log', {
    amountMl,
    tz: getDeviceTimezone(),
  });
  const result = unwrapData<{ today: TodayWaterSummary }>(response);
  return result.today;
}

export async function updateWaterGoal(goalMl: number): Promise<{ goalMl: number }> {
  const response = await api.put('/water/goal', { goalMl });
  return unwrapData(response);
}
