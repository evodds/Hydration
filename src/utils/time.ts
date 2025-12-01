import type { Schedule, DayOfWeek, ReminderEvent } from "../types/app-types";
import { createId } from "./id";

export function parseTimeToMinutes(time: string): number {
  const [hRaw, mRaw] = time.split(":").map(Number);
  if (Number.isNaN(hRaw) || Number.isNaN(mRaw)) return 0;
  const h = Math.min(Math.max(hRaw, 0), 23);
  const m = Math.min(Math.max(mRaw, 0), 59);
  return h * 60 + m;
}

export function formatMinutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function roundToNearestFive(mins: number): number {
  return Math.round(mins / 5) * 5;
}

export function generatePingTimes(schedule: Schedule): string[] {
  const start = parseTimeToMinutes(schedule.startTime);
  const end = parseTimeToMinutes(schedule.endTime);
  if (end <= start || schedule.numPings < 1) return [];

  const interval = (end - start) / (schedule.numPings + 1);
  const quietRanges = (schedule.quietPeriods || []).map((qp) => ({
    start: parseTimeToMinutes(qp.start),
    end: parseTimeToMinutes(qp.end),
  }));

  const times: string[] = [];
  for (let i = 1; i <= schedule.numPings; i += 1) {
    const raw = start + interval * i;
    const rounded = roundToNearestFive(raw);
    const minutes = Math.min(Math.max(rounded, start), end);
    const inQuiet = quietRanges.some(
      (qp) => minutes >= qp.start && minutes < qp.end
    );
    if (!inQuiet) {
      times.push(formatMinutesToTime(minutes));
    }
  }
  return Array.from(new Set(times)).sort();
}

export function getNextPingDate(
  schedule: Schedule,
  timezone: string,
  now: Date = new Date()
): { date: Date; label: string } | null {
  if (!schedule.isActive) return null;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;
  let currentHour = Number(getPart("hour") || 0);
  const currentMinute = Number(getPart("minute") || 0);
  const dayPeriod = getPart("dayPeriod");
  if (dayPeriod === "pm" && currentHour !== 12) currentHour += 12;
  if (dayPeriod === "am" && currentHour === 12) currentHour = 0;
  const dayName = getPart("weekday") || "Sun";

  const dayMap: Record<string, DayOfWeek> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const todayIndex = dayMap[dayName] ?? 0;
  const currentMinutes = currentHour * 60 + currentMinute;

  const isDayActive = schedule.daysOfWeek.includes(todayIndex);
  const baseTimes = isDayActive ? generatePingTimes(schedule) : [];
  const nextToday = baseTimes.find(
    (t) => parseTimeToMinutes(t) > currentMinutes
  );
  if (nextToday) {
    const [hour, minute] = nextToday.split(":").map(Number);
    const result = new Date(now);
    result.setHours(hour, minute, 0, 0);
    return { date: result, label: `Today at ${formatLabelTime(result)}` };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const targetDay = ((todayIndex + offset) % 7) as DayOfWeek;
    if (!schedule.daysOfWeek.includes(targetDay)) continue;
    const times = generatePingTimes(schedule);
    if (!times.length) continue;
    const [hour, minute] = times[0].split(":").map(Number);
    const result = new Date(now);
    result.setDate(now.getDate() + offset);
    result.setHours(hour, minute, 0, 0);
    const labelPrefix = offset === 1 ? "Tomorrow" : formatWeekday(targetDay);
    return { date: result, label: `${labelPrefix} at ${formatLabelTime(result)}` };
  }

  return null;
}

function formatLabelTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatWeekday(dayIndex: number) {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return names[dayIndex] ?? "Next";
}

export function dayOfWeekFromDate(date: Date, timezone: string): DayOfWeek {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(date);
  const map: Record<string, DayOfWeek> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[name] ?? 0;
}

export function generateReminderEventsForSchedule(
  schedule: Schedule,
  timezone: string,
  numDays: number
): ReminderEvent[] {
  if (!schedule.isActive) return [];
  const safeDays = Math.max(1, Math.min(numDays, 30));
  const baseTimes = generatePingTimes(schedule);
  if (!baseTimes.length) return [];

  const events: ReminderEvent[] = [];
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const todayKey = formatDateKey(now, tz);

  for (let offset = 0; offset < safeDays; offset += 1) {
    const day = new Date(now);
    day.setHours(12, 0, 0, 0);
    day.setDate(now.getDate() + offset);
    const weekday = dayOfWeekFromDate(day, tz);
    if (!schedule.daysOfWeek.includes(weekday)) continue;

    const dateKey = formatDateKey(day, tz);

    baseTimes.forEach((time) => {
      const [h, m] = time.split(":").map(Number);
      const eventDate = new Date(day);
      eventDate.setHours(h, m, 0, 0);
      events.push({
        id: createId("reminder"),
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        timezone: tz,
        date: dateKey,
        time,
        scheduledAt: eventDate.toISOString(),
        localTimeLabel: formatLocalTimeLabel(eventDate, tz),
        status: "scheduled",
        createdAt: dateKey === todayKey ? now.toISOString() : eventDate.toISOString(),
      });
    });
  }

  return events.sort((a, b) => {
    if (a.date === b.date) return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
    return a.date.localeCompare(b.date);
  });
}

export function formatDateKey(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatTimeKey(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .slice(0, 5);
}

export function getNowInTimezone(timezone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "0";
  const dateKey = `${get("year")}-${get("month")}-${get("day")}`;
  const hours = Number(get("hour"));
  const minutes = Number(get("minute"));

  return { date: now, dateKey, timeKey: `${get("hour")}:${get("minute")}`, minutes: hours * 60 + minutes };
}

export function formatLocalTimeLabel(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
