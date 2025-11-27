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
  updatedAt: string;
}

export interface ReminderEvent {
  id: string;
  scheduleId: string;
  scheduledAt: string; // ISO string
  localTimeLabel: string; // e.g. "11:00 AM"
  status: "scheduled" | "sent" | "drank" | "skipped";
}

export interface ReminderLogEntry {
  id: string;
  reminderEventId: string;
  occurredAt: string; // ISO string
  response: "drank" | "skipped";
}

export interface UserProfile {
  email: string;
  timezone: string;
  createdAt: string;
}

export interface AppState {
  user: UserProfile | null;
  schedule: Schedule | null;
  tier: AppTier;
  reminderEvents: ReminderEvent[];
  history: ReminderLogEntry[];
}
