import type { UserProfile, Schedule, ReminderEvent } from '@/types/app-types.ts';

const API_BASE = '/api';

// Helper for handling fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// 1. Auth
export const login = async (email: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// 2. User
export const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

// 3. Schedule
export const getSchedule = async (userId: string): Promise<Schedule | null> => {
  const response = await fetch(`${API_BASE}/users/${userId}/schedule`);
  return handleResponse(response);
};

export const createSchedule = async (userId: string, schedule: Omit<Schedule, 'id' | 'userId'>): Promise<Schedule> => {
  const response = await fetch(`${API_BASE}/users/${userId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule),
  });
  return handleResponse(response);
};

export const updateSchedule = async (userId: string, scheduleId: string, updates: Partial<Schedule>): Promise<Schedule> => {
  const response = await fetch(`${API_BASE}/users/${userId}/schedule/${scheduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

// 4. Reminders
export const getReminderEvents = async (userId: string): Promise<ReminderEvent[]> => {
  const response = await fetch(`${API_BASE}/users/${userId}/reminders`);
  return handleResponse(response);
};

export const updateReminderEvent = async (userId: string, eventId: string, status: 'drank' | 'skipped'): Promise<ReminderEvent> => {
  const response = await fetch(`${API_BASE}/users/${userId}/reminders/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

// 5. Billing (Real)
export const createCheckoutSession = async (userId: string, priceId: string): Promise<{ url: string }> => {
  const response = await fetch(`${API_BASE}/billing/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, priceId }),
  });
  return handleResponse(response);
};