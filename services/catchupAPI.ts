import api from './api';
import { unwrapData, unwrapPaginated, type PaginatedResponse } from './types';

export type CatchupPlanStatus = 'DRAFT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type CatchupChoice = 'ACCEPT' | 'REJECT';
export type AdjustmentType =
  | 'REDUCE_TARGET'
  | 'MICRO_HABIT'
  | 'RESCHEDULE'
  | 'PAUSE'
  | 'REST_DAY';

export interface HabitAdjustment {
  id: string;
  plan_id: string;
  habit_id: string | null;
  adjustment_type: AdjustmentType;
  title: string;
  description: string | null;
  suggested_target_count: number | null;
  suggested_days: number[] | null;
  is_applied: boolean;
}

export interface CatchupPlan {
  id: string;
  user_id: string;
  status: CatchupPlanStatus;
  title: string;
  summary: string | null;
  insights: string[];
  start_date: string;
  end_date: string;
  accepted_at: string | null;
  adjustments?: HabitAdjustment[];
  created_at: string;
  updated_at: string;
}

export async function listCatchupPlans(limit = 20): Promise<PaginatedResponse<CatchupPlan>> {
  const response = await api.get('/catchup/plans', { params: { limit } });
  return unwrapPaginated<CatchupPlan>(response);
}

export async function createCatchupDraft(): Promise<CatchupPlan> {
  const response = await api.post('/catchup/plans/draft');
  return unwrapData<CatchupPlan>(response);
}

export async function applyCatchupChoice(payload: {
  planId: string;
  choice: CatchupChoice;
  adjustmentIds?: string[];
}): Promise<CatchupPlan> {
  const response = await api.post('/catchup/plans/choices', payload);
  return unwrapData<CatchupPlan>(response);
}

export async function getCatchupAdjustments(planId: string): Promise<HabitAdjustment[]> {
  const response = await api.get(`/catchup/plans/${planId}/adjustments`);
  return unwrapData<HabitAdjustment[]>(response);
}
