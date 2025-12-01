import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import type {
  BackendReminderEvent,
  BackendSchedule,
  BackendUser,
  BackendReminderStatus,
} from "./types";
import billingRoutes from "./billing.routes";
import smsRoutes from "./sms.routes";

const app = express();
app.use(cors());

// --- In-memory database (replace with real DB later) ---
interface Database {
  users: BackendUser[];
  schedules: BackendSchedule[];
  events: BackendReminderEvent[];
}

export const db: Database = {
  users: [],
  schedules: [],
  events: [],
};

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
  return times.map((time) => {
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

// --- Middleware ---
app.use(
  "/api/billing/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());

app.use("/api/billing", billingRoutes);
app.use("/api/sms", smsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/login", (req, res) => {
  const email = (req.body?.email as string | undefined)?.toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "email required" });
  let user = db.users.find((u) => u.email === email);
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
    db.users.push(user);
  }
  res.json(user);
});

app.get("/api/user/:id", (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "not found" });
  res.json(user);
});

app.patch("/api/user/:id", (req, res) => {
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const updated: BackendUser = {
    ...db.users[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.users[idx] = updated;
  res.json(updated);
});

// Single schedule per user endpoints
app.get("/api/user/:userId/schedule", (req, res) => {
  const schedule = db.schedules.find((s) => s.userId === req.params.userId) || null;
  res.json(schedule);
});

app.post("/api/user/:userId/schedule", (req, res) => {
  const now = new Date().toISOString();
  db.schedules = db.schedules.filter((s) => s.userId !== req.params.userId);
  const schedule: BackendSchedule = {
    ...req.body,
    id: randomUUID(),
    userId: req.params.userId,
    createdAt: now,
    updatedAt: now,
  };
  db.schedules.push(schedule);
  db.events = db.events.filter((ev) => ev.userId !== req.params.userId);
  const newEvents = generateEventsForSchedule(schedule, req.params.userId);
  db.events.push(...newEvents);
  res.status(201).json(schedule);
});

app.patch("/api/user/:userId/schedule/:scheduleId", (req, res) => {
  const idx = db.schedules.findIndex((s) => s.id === req.params.scheduleId);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const updated: BackendSchedule = {
    ...db.schedules[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.schedules[idx] = updated;
  db.events = db.events.filter((ev) => ev.scheduleId !== updated.id);
  const newEvents = generateEventsForSchedule(updated, req.params.userId);
  db.events.push(...newEvents);
  res.json(updated);
});

app.get("/api/user/:userId/events", (req, res) => {
  const list = db.events.filter((e) => e.userId === req.params.userId);
  res.json(list);
});

app.patch("/api/user/:userId/events/:eventId", (req, res) => {
  const idx = db.events.findIndex((ev) => ev.id === req.params.eventId);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const status = req.body?.status as BackendReminderStatus | undefined;
  if (!status || !["scheduled", "drank", "skipped"].includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }
  db.events[idx] = {
    ...db.events[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  res.json(db.events[idx]);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
