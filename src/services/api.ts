import type { UserProfile, Schedule, ReminderEvent } from '@/types/app-types.ts';

const API_BASE = '/api'; // Uses the proxy we set up in vite.config.ts

// Helper for handling fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

// 1. Auth: Login / Get User
export const login = async (email: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// 2. User: Update User
export const updateUser = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

// 3. Schedule: Get Schedule
export const getSchedule = async (userId: string): Promise<Schedule | null> => {
  const response = await fetch(`${API_BASE}/users/${userId}/schedule`);
  return handleResponse(response);
};

// 4. Schedule: Create Schedule
export const createSchedule = async (userId: string, schedule: Omit<Schedule, 'id' | 'userId'>): Promise<Schedule> => {
  const response = await fetch(`${API_BASE}/users/${userId}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schedule),
  });
  return handleResponse(response);
};

// 5. Schedule: Update Schedule
export const updateSchedule = async (userId: string, scheduleId: string, updates: Partial<Schedule>): Promise<Schedule> => {
  const response = await fetch(`${API_BASE}/users/${userId}/schedule/${scheduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};

// 6. Reminders: Get Reminder Events
export const getReminderEvents = async (userId: string): Promise<ReminderEvent[]> => {
  const response = await fetch(`${API_BASE}/users/${userId}/reminders`);
  return handleResponse(response);
};

// 7. Reminders: Update Reminder Event (Log drank/skipped)
export const updateReminderEvent = async (userId: string, eventId: string, status: 'drank' | 'skipped'): Promise<ReminderEvent> => {
  const response = await fetch(`${API_BASE}/users/${userId}/reminders/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};
