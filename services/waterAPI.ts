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
  logs?: WaterLog[];
}

export interface WaterLog {
  id: string;
  amount_ml: number;
}

export async function getTodayWater(includeLogs = false): Promise<TodayWaterSummary> {
  const response = await api.get('/water/today', {
    params: { tz: getDeviceTimezone(), ...(includeLogs ? { includeLogs: 'true' } : {}) },
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

export async function deleteWaterLog(id: string): Promise<TodayWaterSummary> {
  await api.delete(`/water/log/${id}`);
  return getTodayWater();
}

export interface WeeklyWaterDay {
  date: string;
  totalMl: number;
  goalMet: boolean;
  logCount: number;
}

export interface WeeklyWaterSummary {
  startDate: string;
  endDate: string;
  goalMl: number;
  days: WeeklyWaterDay[];
  weeklyTotalMl: number;
  averageDailyMl: number;
  daysGoalMet: number;
}

export async function getWeeklyWater(): Promise<WeeklyWaterSummary> {
  const response = await api.get('/water/weekly', { params: { tz: getDeviceTimezone() } });
  return unwrapData<WeeklyWaterSummary>(response);
}

export async function getWaterGoal(): Promise<{ goalMl: number }> {
  const response = await api.get('/water/goal');
  return unwrapData(response);
}
