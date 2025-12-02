export type AppTier = 'free' | 'pro';

export interface UserProfile {
  id: string;
  email: string;
  timezone: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  tier: AppTier;
  currentStreak: number;
  longestStreak: number;
}

export interface QuietPeriod {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface Schedule {
  id: string;
  userId: string;
  name: string;
  daysOfWeek: number[]; // 0-6
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  numPings: number;
  quietPeriods: QuietPeriod[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ReminderEvent {
  id: string;
  scheduleId: string;
  pingTime: string; // "HH:mm"
  status: 'drank' | 'skipped' | null;
  dayOfWeek: number; // 0-6
}

export interface AppState {
  user: UserProfile | null;
  schedule: Schedule | null;
  reminderEvents: ReminderEvent[];
  isLoading: boolean;
  tier: AppTier;
}

export const CACHE_BUSTER = 'hello';
