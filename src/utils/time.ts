import type { Schedule, ReminderEvent } from '@/types/app-types.ts';
import { createId } from '@/utils/id.ts';

export function parseTimeToMinutes(time: string): number {
  const [hRaw, mRaw] = time.split(':').map(Number);
  return (hRaw ?? 0) * 60 + (mRaw ?? 0);
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getPingDate(time: string, timezone: string): Date {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h ?? 0, m ?? 0, 0, 0);
  return target;
}

export function generatePingTimes(schedule: Schedule): ReminderEvent[] {
  const { startTime, endTime, numPings, daysOfWeek, id: scheduleId } = schedule;
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const duration = end - start;
  
  if (duration <= 0 || numPings <= 0) return [];

  const interval = duration / (numPings - 1 || 1);
  const events: ReminderEvent[] = [];

  for (let i = 0; i < numPings; i++) {
    const minutes = Math.round(start + i * interval);
    const pingTime = formatMinutesToTime(minutes);
    for (const day of daysOfWeek) {
      events.push({
        id: createId(),
        scheduleId,
        pingTime,
        status: null,
        dayOfWeek: day,
      });
    }
  }
  return events;
}
