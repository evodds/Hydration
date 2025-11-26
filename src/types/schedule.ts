export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface QuietPeriod {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface Schedule {
  name: string;
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
  numPings: number;
  quietPeriods: QuietPeriod[];
  isActive: boolean;
}

export interface UserProfile {
  email: string;
  timezone: string;
}

export interface AppState {
  user: UserProfile | null;
  schedule: Schedule | null;
}
