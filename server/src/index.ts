import express from "express";
import { randomUUID } from "crypto";
import {
  BackendReminderEvent,
  BackendSchedule,
  BackendUser,
  BackendReminderStatus,
} from "./types";

const app = express();
app.use(express.json());

// In-memory stores (replace with real DB later)
const users = new Map<string, BackendUser>();
const schedules = new Map<string, BackendSchedule>();
const events = new Map<string, BackendReminderEvent>();

function parseTimeToMinutes(time: string) {
  const [hRaw, mRaw] = time.split(":").map(Number);
  if (Number.isNaN(hRaw) || Number.isNaN(mRaw)) return 0;
  const h = Math.min(Math.max(hRaw, 0), 23);
  const m = Math.min(Math.max(mRaw, 0), 59);
  return h * 60 + m;
}

function formatMinutesToTime(minutes: number) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function generateEventsForSchedule(schedule: BackendSchedule, userId: string): BackendReminderEvent[] {
  if (!schedule.isActive || schedule.numPings < 1) return [];
  const start = parseTimeToMinutes(schedule.startTime);
  const end = parseTimeToMinutes(schedule.endTime);
  if (end <= start) return [];
  const interval = (end - start) / (schedule.numPings + 1);
  const times: string[] = [];
  for (let i = 1; i <= schedule.numPings; i += 1) {
    const raw = start + interval * i;
    const rounded = Math.round(raw / 5) * 5;
    times.push(formatMinutesToTime(rounded));
  }
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);
  return times.map((time, idx) => {
    const [h, m] = time.split(":").map(Number);
    const scheduledAt = new Date(today);
    scheduledAt.setHours(h, m, 0, 0);
    return {
      id: randomUUID(),
      userId,
      scheduleId: schedule.id,
      date: dateKey,
      time,
      scheduledAt: scheduledAt.toISOString(),
      status: "scheduled" as BackendReminderStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", (req, res) => {
  const email = (req.body?.email as string | undefined)?.toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "email required" });
  let user = Array.from(users.values()).find((u) => u.email === email);
  if (!user) {
    const now = new Date().toISOString();
    user = {
      id: randomUUID(),
      email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tier: "free",
      createdAt: now,
      updatedAt: now,
    };
    users.set(user.id, user);
  }
  res.json(user);
});

app.get("/api/user/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "not found" });
  res.json(user);
});

app.patch("/api/user/:id", (req, res) => {
  const user = users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "not found" });
  const updated: BackendUser = {
    ...user,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  users.set(updated.id, updated);
  res.json(updated);
});

// Single schedule per user endpoints
app.get("/api/user/:userId/schedule", (req, res) => {
  const schedule = Array.from(schedules.values()).find((s) => s.userId === req.params.userId) || null;
  res.json(schedule);
});

app.post("/api/user/:userId/schedule", (req, res) => {
  const now = new Date().toISOString();
  const existing = Array.from(schedules.values()).find((s) => s.userId === req.params.userId);
  if (existing) schedules.delete(existing.id);
  const schedule: BackendSchedule = {
    ...req.body,
    id: randomUUID(),
    userId: req.params.userId,
    createdAt: now,
    updatedAt: now,
  };
  schedules.set(schedule.id, schedule);
  // regenerate events
  const newEvents = generateEventsForSchedule(schedule, req.params.userId);
  newEvents.forEach((ev) => events.set(ev.id, ev));
  res.status(201).json(schedule);
});

app.patch("/api/user/:userId/schedule/:scheduleId", (req, res) => {
  const existing = schedules.get(req.params.scheduleId);
  if (!existing) return res.status(404).json({ error: "not found" });
  const updated: BackendSchedule = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  schedules.set(updated.id, updated);
  // regenerate events
  Array.from(events.values())
    .filter((ev) => ev.scheduleId === updated.id)
    .forEach((ev) => events.delete(ev.id));
  const newEvents = generateEventsForSchedule(updated, req.params.userId);
  newEvents.forEach((ev) => events.set(ev.id, ev));
  res.json(updated);
});

app.get("/api/user/:userId/events", (req, res) => {
  const list = Array.from(events.values()).filter((e) => e.userId === req.params.userId);
  res.json(list);
});

app.patch("/api/user/:userId/events/:eventId", (req, res) => {
  const ev = events.get(req.params.eventId);
  if (!ev) return res.status(404).json({ error: "not found" });
  const status = req.body?.status as BackendReminderStatus | undefined;
  if (!status || !["scheduled", "drank", "skipped"].includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }
  const updated: BackendReminderEvent = {
    ...ev,
    status,
    updatedAt: new Date().toISOString(),
  };
  events.set(updated.id, updated);
  res.json(updated);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`?? Server is running on http://localhost:${PORT}`);
});
