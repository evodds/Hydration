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
  scheduleName: string;
  timezone: string;
  date: string; // YYYY-MM-DD in user timezone
  time: string; // HH:mm
  scheduledAt: string; // ISO timestamp
  localTimeLabel: string; // e.g. "3:15 PM"
  status: "scheduled" | "drank" | "skipped";
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  email: string;
  timezone: string;
  createdAt: string;
  tier: AppTier;
}

export interface AppState {
  user: UserProfile | null;
  schedule: Schedule | null;
  reminderEvents: ReminderEvent[];
}
