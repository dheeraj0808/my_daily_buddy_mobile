import api from './api';

export interface Plan {
  id: string;
  name: string;
  plan_code: string;
  duration_days: number;
  price: number;
  compare_at_price: number;
  description: string | null;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  plan: Plan;
}

export async function getMySubscription(): Promise<UserSubscription | null> {
  try {
    const response = await api.get<{ data: UserSubscription }>('/subscriptions/me');
    return response.data.data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export async function getAllPlans(): Promise<Plan[]> {
  const response = await api.get<{ data: Plan[] }>('/admin/plans');
  return response.data.data;
}

export async function changePlan(planId: string): Promise<UserSubscription> {
  const response = await api.put<{ data: UserSubscription }>(
    '/subscriptions/me',
    { plan_id: planId }
  );
  return response.data.data;
}
