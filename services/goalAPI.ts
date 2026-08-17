import api from './api';
import { unwrapData, unwrapPaginated, type PaginatedResponse } from './types';

export type GoalType = 'ACCUMULATE' | 'REDUCE' | 'MAINTAIN' | 'BOOLEAN';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ABANDONED';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  status: GoalStatus;
  initial_value: number;
  target_value: number | null;
  target_min: number | null;
  target_max: number | null;
  current_value: number;
  unit: string | null;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  overdue: number;
  completionRate: number;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  goalType: GoalType;
  targetValue?: number;
  targetMin?: number;
  targetMax?: number;
  unit?: string;
  initialValue?: number;
  startDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  status?: 'ACTIVE' | 'PAUSED' | 'ABANDONED';
  dueDate?: string;
  notes?: string;
}

export async function listGoals(limit = 50): Promise<PaginatedResponse<Goal>> {
  const response = await api.get('/goals', { params: { limit, status: 'ACTIVE' } });
  return unwrapPaginated<Goal>(response);
}

export async function getGoalStats(): Promise<GoalStats> {
  const response = await api.get('/goals/stats');
  return unwrapData<GoalStats>(response);
}

export async function createGoal(payload: CreateGoalPayload): Promise<Goal> {
  const response = await api.post('/goals', payload);
  return unwrapData<Goal>(response);
}

export async function updateGoal(id: string, payload: UpdateGoalPayload): Promise<Goal> {
  const response = await api.patch(`/goals/${id}`, payload);
  return unwrapData<Goal>(response);
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}

export async function applyProgress(id: string, value: number): Promise<{ goal: Goal }> {
  const response = await api.post(`/goals/${id}/progress`, { value });
  return unwrapData<{ goal: Goal }>(response);
}

export interface GoalProgressLog {
  id: string;
  goal_id: string;
  value: number;
  previous_value?: number;
  note?: string | null;
  created_at: string;
}

export async function listGoalProgress(
  id: string,
  limit = 20,
): Promise<PaginatedResponse<GoalProgressLog>> {
  const response = await api.get(`/goals/${id}/progress`, { params: { limit } });
  return unwrapPaginated<GoalProgressLog>(response);
}

export function goalProgressPercent(goal: Goal): number {
  if (goal.goal_type === 'BOOLEAN') {
    return goal.current_value >= 1 ? 100 : 0;
  }
  if (goal.goal_type === 'MAINTAIN' && goal.target_min != null && goal.target_max != null) {
    const inRange =
      goal.current_value >= goal.target_min && goal.current_value <= goal.target_max;
    return inRange ? 100 : 50;
  }
  if (goal.goal_type === 'REDUCE' && goal.target_value != null) {
    const start = Number(goal.initial_value) || goal.current_value;
    const total = start - goal.target_value;
    if (total <= 0) return 100;
    return Math.min(100, Math.round(((start - goal.current_value) / total) * 100));
  }
  if (goal.target_value != null && goal.target_value > 0) {
    return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
  }
  return 0;
}
