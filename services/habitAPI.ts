import api from './api';
import { unwrapData, unwrapPaginated, type PaginatedResponse } from './types';
import { getDeviceTimezone, getTodayDateString } from '@/utils/timezone';

export type FrequencyType = 'DAILY' | 'WEEKLY' | 'CUSTOM';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency_type: FrequencyType;
  frequency_days: number[] | null;
  target_count: number;
  unit: string | null;
  color: string | null;
  icon: string | null;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitStreak {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  lastCompletedDate: string | null;
}

export interface CreateHabitPayload {
  name: string;
  description?: string;
  frequencyType?: FrequencyType;
  frequencyDays?: number[];
  targetCount?: number;
  unit?: string;
  color?: string;
  icon?: string;
  startDate?: string;
}

export interface UpdateHabitPayload {
  name?: string;
  description?: string;
  frequencyType?: FrequencyType;
  frequencyDays?: number[];
  targetCount?: number;
  unit?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

const tz = () => getDeviceTimezone();

export async function listHabits(limit = 50): Promise<PaginatedResponse<Habit>> {
  const response = await api.get('/habits', { params: { limit, isActive: true } });
  return unwrapPaginated<Habit>(response);
}

export async function createHabit(payload: CreateHabitPayload): Promise<Habit> {
  const response = await api.post('/habits', payload);
  return unwrapData<Habit>(response);
}

export async function updateHabit(id: string, payload: UpdateHabitPayload): Promise<Habit> {
  const response = await api.patch(`/habits/${id}`, payload);
  return unwrapData<Habit>(response);
}

export async function deleteHabit(id: string): Promise<void> {
  await api.delete(`/habits/${id}`);
}

export async function getHabitStreak(id: string): Promise<HabitStreak> {
  const response = await api.get(`/habits/${id}/streak`, { params: { tz: tz() } });
  return unwrapData<HabitStreak>(response);
}

export async function checkInHabit(id: string, date?: string): Promise<unknown> {
  const response = await api.post(`/habits/${id}/check-in`, { date, tz: tz() });
  return unwrapData(response);
}

export async function undoCheckIn(id: string, date?: string): Promise<void> {
  const d = date ?? getTodayDateString();
  await api.delete(`/habits/${id}/check-in/${d}`, { params: { tz: tz() } });
}

export function isCompletedToday(streak: HabitStreak): boolean {
  return streak.lastCompletedDate === getTodayDateString();
}

export const DEFAULT_HABIT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];
export const DEFAULT_HABIT_ICONS = ['🧘', '💧', '📚', '🏃', '📵', '✍️', '💪', '🥗'];
