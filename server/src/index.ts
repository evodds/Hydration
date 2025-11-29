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

app.get("/api/user/:userId/schedules", (req, res) => {
  const list = Array.from(schedules.values()).filter((s) => s.userId === req.params.userId);
  res.json(list);
});

app.post("/api/user/:userId/schedules", (req, res) => {
  const now = new Date().toISOString();
  const schedule: BackendSchedule = {
    ...req.body,
    id: randomUUID(),
    userId: req.params.userId,
    createdAt: now,
    updatedAt: now,
  };
  schedules.set(schedule.id, schedule);
  res.status(201).json(schedule);
});

app.put("/api/user/:userId/schedules/:scheduleId", (req, res) => {
  const existing = schedules.get(req.params.scheduleId);
  if (!existing) return res.status(404).json({ error: "not found" });
  const updated: BackendSchedule = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  schedules.set(updated.id, updated);
  res.json(updated);
});

app.delete("/api/user/:userId/schedules/:scheduleId", (req, res) => {
  schedules.delete(req.params.scheduleId);
  res.status(204).send();
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

// Placeholder for generating future events (replace with real scheduler logic)
app.post("/api/user/:userId/events/generate", (_req, res) => {
  // TODO: Implement generation using schedule rules
  res.json({ message: "Generation stubbed" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Hydration Habit Ping API running on http://localhost:${port}`);
});
