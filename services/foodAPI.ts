import api from './api';
import { unwrapData } from './types';
import { getDeviceTimezone } from '@/utils/timezone';

export interface DailyFoodSummary {
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  goalKcal: number;
  remainingKcal: number;
  percentComplete: number;
  goalMet: boolean;
  logCount: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export async function getDailyFood(): Promise<DailyFoodSummary> {
  const response = await api.get('/food/daily', {
    params: { tz: getDeviceTimezone() },
  });
  return unwrapData<DailyFoodSummary>(response);
}

export async function searchFood(q: string, limit = 10): Promise<FoodItem[]> {
  const response = await api.get('/food/search', { params: { q, limit } });
  return unwrapData<FoodItem[]>(response);
}

export async function logFood(payload: {
  foodItemId?: string;
  customName?: string;
  calories?: number;
  quantity?: number;
  mealType?: string;
}): Promise<DailyFoodSummary> {
  const response = await api.post('/food/log', {
    ...payload,
    tz: getDeviceTimezone(),
  });
  const result = unwrapData<{ daily: DailyFoodSummary }>(response);
  return result.daily;
}
