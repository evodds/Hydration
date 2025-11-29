import type { ReminderEvent, Schedule, UserProfile } from "../types/schedule";
import { createId } from "../utils/id";
import { generateReminderEventsForSchedule } from "../utils/time";

// NOTE: This is a lightweight front-end stub. Replace localStorage logic with real fetch("/api/...") calls later.
const STORAGE_KEY = "hydration-habit-ping-state";

type PersistedState = {
  user: UserProfile | null;
  schedule: Schedule | null;
  reminderEvents: ReminderEvent[];
};

function readLocalState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, schedule: null, reminderEvents: [] };
    return JSON.parse(raw) as PersistedState;
  } catch {
    return { user: null, schedule: null, reminderEvents: [] };
  }
}

function writeLocalState(next: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export async function fakeLogin(email: string): Promise<UserProfile> {
  const now = new Date().toISOString();
  const state = readLocalState();
  const user: UserProfile = state.user || {
    email,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: now,
    tier: "free",
  };
  const updated = { ...state, user };
  writeLocalState(updated);
  return user;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  return readLocalState().user;
}

export async function fetchSchedule(): Promise<Schedule | null> {
  return readLocalState().schedule;
}

export async function saveSchedule(schedule: Schedule): Promise<Schedule> {
  const state = readLocalState();
  const now = new Date().toISOString();
  const enriched: Schedule = {
    ...schedule,
    id: schedule.id || createId("schedule"),
    createdAt: schedule.createdAt || now,
    updatedAt: now,
  };
  const tz = state.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const reminderEvents = generateReminderEventsForSchedule(enriched, tz, 7);
  const updatedState = { ...state, schedule: enriched, reminderEvents };
  writeLocalState(updatedState);
  return enriched;
}

export async function fetchReminderEvents(): Promise<ReminderEvent[]> {
  return readLocalState().reminderEvents;
}

export async function updateReminderEventStatus(id: string, status: "drank" | "skipped"): Promise<void> {
  const state = readLocalState();
  const reminderEvents = state.reminderEvents.map((ev) =>
    ev.id === id ? { ...ev, status, updatedAt: new Date().toISOString() } : ev
  );
  writeLocalState({ ...state, reminderEvents });
}

// TODO: Replace these stubs with real HTTP calls to /api once backend is live.
