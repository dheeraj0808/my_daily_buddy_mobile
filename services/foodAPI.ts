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

function normalizeFoodItem(raw: Record<string, unknown>): FoodItem {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    brand: raw.brand != null ? String(raw.brand) : null,
    calories: Number(raw.calories_per_serving ?? raw.calories ?? 0),
    protein_g: Number(raw.protein_g ?? 0),
    carbs_g: Number(raw.carbs_g ?? 0),
    fat_g: Number(raw.fat_g ?? 0),
  };
}

export async function getDailyFood(): Promise<DailyFoodSummary> {
  const response = await api.get('/food/daily', {
    params: { tz: getDeviceTimezone() },
  });
  return unwrapData<DailyFoodSummary>(response);
}

export async function searchFood(q: string, limit = 10): Promise<FoodItem[]> {
  const response = await api.get('/food/search', { params: { q, limit } });
  const items = unwrapData<Record<string, unknown>[]>(response);
  return items.map(normalizeFoodItem);
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
