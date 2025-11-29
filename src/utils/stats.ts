import type { ReminderEvent } from "../types/schedule";
import { getNowInTimezone, parseTimeToMinutes } from "./time";

export type DailyStat = {
  date: string;
  total: number;
  drank: number;
  skipped: number;
  completion: number;
};

export function buildDailyStats(events: ReminderEvent[]): Record<string, DailyStat> {
  const stats: Record<string, DailyStat> = {};
  events.forEach((event) => {
    if (!event.date) return;
    if (!stats[event.date]) {
      stats[event.date] = { date: event.date, total: 0, drank: 0, skipped: 0, completion: 0 };
    }
    stats[event.date].total += 1;
    if (event.status === "drank") stats[event.date].drank += 1;
    if (event.status === "skipped") stats[event.date].skipped += 1;
  });
  Object.values(stats).forEach((day) => {
    day.completion = day.total ? Math.round((day.drank / day.total) * 100) : 0;
  });
  return stats;
}

export function isSuccessfulDay(stat: DailyStat, threshold = 0.6) {
  return stat.total > 0 && stat.drank / stat.total >= threshold;
}

export function addDaysToDateKey(dateKey: string, delta: number) {
  const base = new Date(`${dateKey}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + delta);
  return base.toISOString().slice(0, 10);
}

export function daysBetweenDateKeys(a: string, b: string) {
  const aDate = new Date(`${a}T00:00:00Z`).getTime();
  const bDate = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((bDate - aDate) / (1000 * 60 * 60 * 24));
}

export function computeStreaks(
  events: ReminderEvent[],
  timezone: string,
  threshold = 0.6
): { currentStreak: number; bestStreak: number } {
  const stats = buildDailyStats(events);
  const successDates = Object.values(stats)
    .filter((day) => isSuccessfulDay(day, threshold))
    .map((day) => day.date)
    .sort();

  let bestStreak = 0;
  let streak = 0;
  let prev: string | null = null;

  successDates.forEach((date) => {
    if (prev && daysBetweenDateKeys(prev, date) === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
    prev = date;
    if (streak > bestStreak) bestStreak = streak;
  });

  const { dateKey: todayKey } = getNowInTimezone(timezone);
  let currentStreak = 0;
  let cursor = todayKey;
  while (isSuccessfulDay(stats[cursor] ?? { total: 0, drank: 0, skipped: 0, completion: 0 }, threshold)) {
    currentStreak += 1;
    cursor = addDaysToDateKey(cursor, -1);
  }

  return { currentStreak, bestStreak };
}

export function sortEventsChronologically(events: ReminderEvent[]) {
  return [...events].sort((a, b) => {
    if (a.date === b.date) return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    return a.date.localeCompare(b.date);
  });
}
