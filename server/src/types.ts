export type BackendAppTier = "free" | "pro";

export interface BackendUser {
  id: string;
  email: string;
  timezone: string;
  tier: BackendAppTier;
  stripeCustomerId?: string;
  phone?: string;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export type BackendDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface BackendQuietPeriod {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface BackendSchedule {
  id: string;
  userId: string;
  name: string;
  daysOfWeek: BackendDayOfWeek[];
  startTime: string;
  endTime: string;
  numPings: number;
  quietPeriods: BackendQuietPeriod[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BackendReminderStatus = "scheduled" | "drank" | "skipped";

export interface BackendReminderEvent {
  id: string;
  userId: string;
  scheduleId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  scheduledAt: string;
  status: BackendReminderStatus;
  createdAt: string;
  updatedAt: string;
}
