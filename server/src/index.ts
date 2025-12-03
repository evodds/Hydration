import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import { UserProfile, Schedule, ReminderEvent } from '../src/types/app-types';
import billingRoutes from './billing.routes';
import smsRoutes from './sms.routes';

const app = express();
const port = 3001;

app.use(cors());
// Use raw body for webhook, json for everything else
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(bodyParser.json());

// --- Twilio Setup ---
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) 
  : null;

// --- MOCK DATABASES ---
export const db = {
  users: [] as UserProfile[],
  schedules: [] as Schedule[],
  reminderEvents: [] as ReminderEvent[],
};

// --- HELPER TO INIT MOCK DATA ---
const initMockUser = (email: string): UserProfile => {
  const existingUser = db.users.find(u => u.email === email);
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
  db.users.push(newUser);
  return newUser;
};

// --- ROUTES ---
app.use('/api/billing', billingRoutes);
app.use('/api/sms', smsRoutes);

// 1. Auth
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  console.log(`[Server] Login attempt for: ${email}`);
  const user = initMockUser(email);
  res.json(user);
});

// 2. User
app.put('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const updates = req.body as Partial<UserProfile>;
  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  const updatedUser = { ...db.users[userIndex], ...updates };
  db.users[userIndex] = updatedUser;
  console.log(`[Server] Updated user ${userId}`);
  res.json(updatedUser);
});

// 3. Schedule: Get
app.get('/api/users/:userId/schedule', (req, res) => {
  const { userId } = req.params;
  const schedule = db.schedules.find(s => s.userId === userId);
  res.json(schedule || null);
});

// 4. Schedule: Create
app.post('/api/users/:userId/schedule', (req, res) => {
  const { userId } = req.params;
  const newSchedule = req.body as Schedule;
  
  const existingUser = db.users.find(u => u.id === userId);
  if (!existingUser) return res.status(404).json({ error: 'User not found' });

  // Remove existing schedule if any
  db.schedules = db.schedules.filter(s => s.userId !== userId);

  newSchedule.id = `sch_${Date.now()}`;
  newSchedule.userId = userId;
  db.schedules.push(newSchedule);
  
  // Generate mock events for today
  const events: ReminderEvent[] = [];
  const dayOfWeek = new Date().getDay();
  
  if (newSchedule.daysOfWeek.includes(dayOfWeek)) {
     events.push({
       id: `evt_${Date.now()}_1`,
       scheduleId: newSchedule.id,
       pingTime: '09:00',
       status: null,
       dayOfWeek: dayOfWeek
     }, {
       id: `evt_${Date.now()}_2`,
       scheduleId: newSchedule.id,
       pingTime: '12:00',
       status: null,
       dayOfWeek: dayOfWeek
     }, {
       id: `evt_${Date.now()}_3`,
       scheduleId: newSchedule.id,
       pingTime: '15:00',
       status: null,
       dayOfWeek: dayOfWeek
     });
  }
  
  // Replace old events
  db.reminderEvents = db.reminderEvents.filter(e => e.scheduleId !== newSchedule.id);
  db.reminderEvents.push(...events);
  
  console.log(`[Server] Created schedule for ${userId}`);
  res.status(201).json(newSchedule);
});

// 5. Schedule: Update
app.put('/api/users/:userId/schedule/:scheduleId', (req, res) => {
  const { scheduleId } = req.params;
  const updates = req.body as Partial<Schedule>;
  const index = db.schedules.findIndex(s => s.id === scheduleId);

  if (index === -1) return res.status(404).json({ error: 'Schedule not found' });

  const updatedSchedule = { ...db.schedules[index], ...updates };
  db.schedules[index] = updatedSchedule;
  console.log(`[Server] Updated schedule ${scheduleId}`);
  res.json(updatedSchedule);
});

// 6. Reminders: Get
app.get('/api/users/:userId/reminders', (req, res) => {
  const { userId } = req.params;
  // Find user's schedule first
  const schedule = db.schedules.find(s => s.userId === userId);
  if (!schedule) return res.json([]);
  
  const events = db.reminderEvents.filter(e => e.scheduleId === schedule.id);
  res.json(events);
});

// 7. Reminders: Update
app.put('/api/users/:userId/reminders/:eventId', (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body;
  const index = db.reminderEvents.findIndex(e => e.id === eventId);

  if (index === -1) return res.status(404).json({ error: 'Event not found' });

  db.reminderEvents[index].status = status;
  console.log(`[Server] Updated event ${eventId} to ${status}`);
  res.json(db.reminderEvents[index]);
});

app.get('/api/health', (req, res) => {
  res.send({ status: 'ok' });
});

// --- SMS SCHEDULER LOOP (Every 60s) ---
setInterval(() => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDay = now.getDay(); 

  // console.log(`[Scheduler] Tick: ${now.toLocaleTimeString()}`);

  db.users.forEach((user) => {
    if (user.tier !== 'pro' || !user.phone) return;

    const schedule = db.schedules.find(s => s.userId === user.id);
    if (!schedule || !schedule.isActive) return;
    if (!schedule.daysOfWeek.includes(currentDay)) return;

    const events = db.reminderEvents.filter(e => e.scheduleId === schedule.id);
    
    const dueEvent = events.find(e => {
      const [h, m] = e.pingTime.split(':').map(Number);
      const eventMinutes = h * 60 + m;
      // Match exact minute
      return eventMinutes === currentMinutes && e.status === null; 
    });

    if (dueEvent) {
      console.log(`[Scheduler] 🔔 Sending SMS to ${user.email} for ${dueEvent.pingTime}`);
      
      if (twilioClient && TWILIO_PHONE_NUMBER) {
        twilioClient.messages.create({
          body: `💧 Hydration Check! It's ${dueEvent.pingTime}. Time to drink!`,
          from: TWILIO_PHONE_NUMBER,
          to: user.phone
        }).then(m => console.log(`[Twilio] Sent: ${m.sid}`))
          .catch(e => console.error(`[Twilio] Error:`, e));
      } else {
        console.log(`[Scheduler] (Mock) SMS sent to ${user.phone}`);
      }
    }
  });
}, 60 * 1000);

app.listen(port, () => {
  console.log(`[Server] API is running on http://localhost:${port}`);
});
