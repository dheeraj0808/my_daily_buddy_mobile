import api from './api';
import { unwrapData, unwrapPaginated, type PaginatedResponse } from './types';
import { getDeviceTimezone } from '@/utils/timezone';

export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  remind_at: string;
  repeat_type: RepeatType;
  repeat_days: number[] | null;
  timezone: string;
  is_active: boolean;
  last_triggered_at: string | null;
  snoozed_until: string | null;
  last_completed_date: string | null;
  linked_habit_id: string | null;
  linked_task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderPayload {
  title: string;
  description?: string;
  remindAt: string;
  repeatType?: RepeatType;
  repeatDays?: number[];
  timezone?: string;
  isActive?: boolean;
  linkedHabitId?: string | null;
  linkedTaskId?: string | null;
}

export interface UpdateReminderPayload {
  title?: string;
  description?: string;
  remindAt?: string;
  repeatType?: RepeatType;
  repeatDays?: number[];
  timezone?: string;
  isActive?: boolean;
  linkedHabitId?: string | null;
  linkedTaskId?: string | null;
}

const tz = () => getDeviceTimezone();

export async function listReminders(limit = 50): Promise<PaginatedResponse<Reminder>> {
  const response = await api.get('/reminders', { params: { limit } });
  return unwrapPaginated<Reminder>(response);
}

export async function getActiveReminders(): Promise<Reminder[]> {
  const response = await api.get('/reminders/active');
  return unwrapData<Reminder[]>(response);
}

export async function getDueReminders(): Promise<Reminder[]> {
  const response = await api.get('/reminders/due', { params: { tz: tz() } });
  return unwrapData<Reminder[]>(response);
}

export async function createReminder(payload: CreateReminderPayload): Promise<Reminder> {
  const response = await api.post('/reminders', { timezone: tz(), ...payload });
  return unwrapData<Reminder>(response);
}

export async function updateReminder(id: string, payload: UpdateReminderPayload): Promise<Reminder> {
  const response = await api.patch(`/reminders/${id}`, payload);
  return unwrapData<Reminder>(response);
}

export async function deleteReminder(id: string): Promise<void> {
  await api.delete(`/reminders/${id}`);
}

export async function snoozeReminder(id: string, minutes: number): Promise<Reminder> {
  const response = await api.post(`/reminders/${id}/snooze`, { minutes });
  return unwrapData<Reminder>(response);
}

export async function markReminderDone(id: string): Promise<Reminder> {
  const response = await api.post(`/reminders/${id}/done`);
  return unwrapData<Reminder>(response);
}

export function isReminderDoneToday(reminder: Reminder): boolean {
  if (!reminder.last_completed_date) return false;
  const tz = reminder.timezone || getDeviceTimezone();
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: tz });
  return reminder.last_completed_date === today;
}

export function formatRepeatType(repeat: RepeatType): string {
  switch (repeat) {
    case 'DAILY':
      return 'Daily';
    case 'WEEKLY':
      return 'Weekly';
    case 'MONTHLY':
      return 'Monthly';
    default:
      return 'Once';
  }
}

export const REMINDER_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];
