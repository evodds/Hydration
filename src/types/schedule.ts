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

// --- THIS IS THE FIX ---
// Define ReminderEvent *before* it is used in AppState.
export interface ReminderEvent {
  id: string;
  scheduleId: string;
  pingTime: string; // "HH:mm"
  status: 'drank' | 'skipped' | null;
  dayOfWeek: number; // 0-6
}

// Now AppState can safely use ReminderEvent
export interface AppState {
  user: UserProfile | null;
  schedule: Schedule | null;
  reminderEvents: ReminderEvent[];
  isLoading: boolean;
}
