import api from './api';
import { unwrapData, unwrapPaginated, type PaginatedResponse } from './types';
import { getDeviceTimezone } from '@/utils/timezone';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  isCompleted?: boolean;
}

const tz = () => getDeviceTimezone();

export async function getTodayTasks(limit = 50): Promise<PaginatedResponse<Task>> {
  const response = await api.get('/tasks/today', { params: { limit, tz: tz() } });
  return unwrapPaginated<Task>(response);
}

export async function listTasks(params?: {
  page?: number;
  limit?: number;
  completed?: boolean;
}): Promise<PaginatedResponse<Task>> {
  const response = await api.get('/tasks', { params: { ...params, tz: tz() } });
  return unwrapPaginated<Task>(response);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await api.post('/tasks', payload);
  return unwrapData<Task>(response);
}

export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const response = await api.patch(`/tasks/${id}`, payload);
  return unwrapData<Task>(response);
}

export async function toggleTask(id: string): Promise<Task> {
  const response = await api.patch(`/tasks/${id}/toggle`);
  return unwrapData<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#6366f1',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};
