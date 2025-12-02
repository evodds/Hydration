import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { UserProfile, Schedule, ReminderEvent } from '../../src/types/app-types';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- MOCK DATABASES ---
// We'll use simple in-memory objects to act as our database for now.
const MOCK_DB = {
  users: new Map<string, UserProfile>(),
  schedules: new Map<string, Schedule | null>(),
  reminderEvents: new Map<string, ReminderEvent[]>(),
};

// --- HELPER TO INIT MOCK DATA ---
const initMockUser = (email: string): UserProfile => {
  const existingUser = Array.from(MOCK_DB.users.values()).find((u) => u.email === email);
  if (existingUser) return existingUser;

  const userId = `user_${Date.now()}`;
  const newUser: UserProfile = {
    id: userId,
    email: email,
    timezone: 'America/Los_Angeles',
    tier: 'free',
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
  };
  MOCK_DB.users.set(userId, newUser);
  MOCK_DB.schedules.set(userId, null); // No schedule initially
  MOCK_DB.reminderEvents.set(userId, []); // No events initially
  return newUser;
};

// --- API ENDPOINTS ---

// 1. Auth: Login / Get User
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  console.log(`[Server] Login attempt for: ${email}`);
  const user = initMockUser(email);
  res.json(user);
});

// 2. User: Update User
app.put('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const updates = req.body as Partial<UserProfile>;
  const user = MOCK_DB.users.get(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updatedUser = { ...user, ...updates, id: userId }; // Ensure ID isn't overwritten
  MOCK_DB.users.set(userId, updatedUser);
  console.log(`[Server] Updated user ${userId}:`, updatedUser);
  res.json(updatedUser);
});

// 3. Schedule: Get Schedule
app.get('/api/users/:userId/schedule', (req, res) => {
  const { userId } = req.params;
  const schedule = MOCK_DB.schedules.get(userId);
  console.log(`[Server] Fetched schedule for ${userId}:`, schedule);
  res.json(schedule || null);
});

// 4. Schedule: Create Schedule
app.post('/api/users/:userId/schedule', (req, res) => {
  const { userId } = req.params;
  const newSchedule = req.body as Schedule;

  if (!MOCK_DB.users.has(userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  newSchedule.id = `sch_${Date.now()}`;
  newSchedule.userId = userId;
  MOCK_DB.schedules.set(userId, newSchedule);

  // When a schedule is created, generate mock events for it
  const events: ReminderEvent[] = [];
  // ... (In a real app, your `generatePingTimes` logic would live here)
  // For now, let's just create a few mock events
  if (newSchedule.daysOfWeek.includes(new Date().getDay())) {
    events.push(
      {
        id: `evt_1`,
        scheduleId: newSchedule.id,
        pingTime: '09:15',
        status: null,
        dayOfWeek: new Date().getDay(),
      },
      {
        id: `evt_2`,
        scheduleId: newSchedule.id,
        pingTime: '11:45',
        status: null,
        dayOfWeek: new Date().getDay(),
      }
    );
  }
  MOCK_DB.reminderEvents.set(userId, events);

  console.log(`[Server] Created schedule for ${userId}:`, newSchedule);
  res.status(201).json(newSchedule);
});

// 5. Schedule: Update Schedule
app.put('/api/users/:userId/schedule/:scheduleId', (req, res) => {
  const { userId, scheduleId } = req.params;
  const updates = req.body as Partial<Schedule>;
  const schedule = MOCK_DB.schedules.get(userId);

  if (!schedule || schedule.id !== scheduleId) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  const updatedSchedule = { ...schedule, ...updates, id: scheduleId, userId: userId };
  MOCK_DB.schedules.set(userId, updatedSchedule);
  console.log(`[Server] Updated schedule ${scheduleId}:`, updatedSchedule);
  res.json(updatedSchedule);
});

// 6. Reminders: Get Reminder Events
app.get('/api/users/:userId/reminders', (req, res) => {
  const { userId } = req.params;
  const events = MOCK_DB.reminderEvents.get(userId) || [];
  console.log(`[Server] Fetched ${events.length} events for ${userId}`);
  res.json(events);
});

// 7. Reminders: Update Reminder Event (Log drank/skipped)
app.put('/api/users/:userId/reminders/:eventId', (req, res) => {
  const { userId, eventId } = req.params;
  const { status } = req.body as { status: 'drank' | 'skipped' };
  const events = MOCK_DB.reminderEvents.get(userId);

  if (!events) {
    return res.status(404).json({ error: 'No events found for user' });
  }

  const eventIndex = events.findIndex((e) => e.id === eventId);
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const updatedEvent = { ...events[eventIndex], status: status };
  events[eventIndex] = updatedEvent;

  console.log(`[Server] Updated event ${eventId} to ${status}`);
  res.json(updatedEvent);
});

app.listen(port, () => {
  console.log(`[Server] API is running on http://localhost:${port}`);
});
