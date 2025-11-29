import type { UserProfile, Schedule, ReminderEvent } from '../types/schedule';

// Helper for API requests
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(errorData.message || 'An unknown error occurred');
  }
  return response.json() as Promise<T>;
}

// --- Auth ---
export async function login(email: string): Promise<UserProfile> {
  // The backend stub will find-or-create a user by email
  return apiRequest<UserProfile>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// --- User ---
export async function updateUser(userId: string, partialUser: Partial<UserProfile>): Promise<UserProfile> {
  return apiRequest<UserProfile>(`/api/user/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(partialUser),
  });
}

// --- Schedule ---
export async function fetchSchedule(userId: string): Promise<Schedule | null> {
  // Our backend stub only supports one schedule per user
  return apiRequest<Schedule | null>(`/api/user/${userId}/schedule`);
}

export async function saveSchedule(userId: string, schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
  return apiRequest<Schedule>(`/api/user/${userId}/schedule`, {
    method: 'POST',
    body: JSON.stringify(schedule),
  });
}

export async function updateSchedule(userId: string, scheduleId: string, partialSchedule: Partial<Schedule>): Promise<Schedule> {
  return apiRequest<Schedule>(`/api/user/${userId}/schedule/${scheduleId}`, {
    method: 'PATCH',
    body: JSON.stringify(partialSchedule),
  });
}

// --- Events ---
export async function fetchReminderEvents(userId: string): Promise<ReminderEvent[]> {
  return apiRequest<ReminderEvent[]>(`/api/user/${userId}/events`);
}

export async function logReminderAction(userId: string, eventId: string, status: 'drank' | 'skipped'): Promise<ReminderEvent> {
  return apiRequest<ReminderEvent>(`/api/user/${userId}/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}


