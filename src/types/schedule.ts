export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export type AppTier = "free" | "pro";

export interface QuietPeriod {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface Schedule {
  id: string;
  name: string;
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
  numPings: number;
  quietPeriods: QuietPeriod[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReminderEvent {
  id: string;
  scheduleId: string;
  scheduledAt: string; // ISO timestamp
  date: string;
  time: string;
  status: "scheduled" | "drank" | "skipped";
  createdAt?: string;
  updatedAt?: string;
  scheduleName?: string;
  timezone?: string;
  localTimeLabel?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  timezone: string;
  createdAt: string;
  updatedAt?: string;
  tier: AppTier;
}

export interface AppState {
  user: UserProfile | null;
  schedule: Schedule | null;
  reminderEvents: ReminderEvent[];
  isLoading: boolean;
  tier: AppTier;
}
