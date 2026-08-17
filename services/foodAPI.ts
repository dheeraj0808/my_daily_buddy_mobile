import api from './api';
import { unwrapData, unwrapPaginated } from './types';
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

export async function getFoodGoal(): Promise<{ goalKcal: number }> {
  const response = await api.get('/food/goal');
  return unwrapData(response);
}

export async function updateFoodGoal(goalKcal: number): Promise<{ goalKcal: number }> {
  const response = await api.put('/food/goal', { goalKcal });
  return unwrapData(response);
}

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';

export interface FoodLogEntry {
  id: string;
  user_id: string;
  food_item_id: string | null;
  custom_name: string | null;
  meal_type: MealType;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at?: string;
  created_at: string;
  food_item?: FoodItem | null;
}

export async function listFoodLogs(params?: {
  limit?: number;
  date?: string;
}): Promise<FoodLogEntry[]> {
  const response = await api.get('/food/logs', {
    params: { tz: getDeviceTimezone(), limit: params?.limit ?? 30, date: params?.date },
  });
  try {
    return unwrapPaginated<FoodLogEntry>(response).data;
  } catch {
    const result = unwrapData<FoodLogEntry[]>(response);
    return Array.isArray(result) ? result : [];
  }
}

export async function deleteFoodLog(id: string): Promise<void> {
  await api.delete(`/food/log/${id}`);
}
