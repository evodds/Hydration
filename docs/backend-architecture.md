# Hydration Habit Ping – Backend Architecture (Stub)

This repo is currently front-end only (localStorage). The `server/` folder provides a minimal Express/TypeScript skeleton to prepare for a real backend.

## Data Model (Backend)

- **User**
  - `id`, `email`, `timezone`, `tier ("free" | "pro")`, `createdAt`, `updatedAt`
- **Schedule**
  - `id`, `userId`, `name`, `daysOfWeek: number[]`, `startTime`, `endTime`, `numPings`, `quietPeriods: { start; end }[]`, `isActive`, `createdAt`, `updatedAt`
- **ReminderEvent**
  - `id`, `userId`, `scheduleId`, `date` (YYYY-MM-DD), `time` (HH:mm), `scheduledAt` (ISO), `status` ("scheduled" | "drank" | "skipped"), `createdAt`, `updatedAt`

## API Routes (planned)

- `GET /api/health` → `{ status: "ok" }`
- Auth
  - `POST /api/auth/login` ({ email }) → fake user create/fetch
- Users
  - `GET /api/user/:id`
  - `PATCH /api/user/:id`
- Schedules
  - `GET /api/user/:userId/schedules`
  - `POST /api/user/:userId/schedules`
  - `PUT /api/user/:userId/schedules/:scheduleId`
  - `DELETE /api/user/:userId/schedules/:scheduleId`
- Events
  - `GET /api/user/:userId/events`
  - `POST /api/user/:userId/events/generate` (stubbed)
  - `PATCH /api/user/:userId/events/:eventId` (update status)

Current implementation uses in-memory maps; replace with a real DB (e.g., Postgres/Prisma).

## Front-end API Layer

`src/services/api.ts` mirrors the above but currently reads/writes localStorage. Replace stubs with real `fetch("/api/...")` calls once the backend is live.

## Next Steps for a Real Backend

1. Add persistence (Postgres + Prisma or similar).
2. Real auth (email link or OAuth) and per-user isolation.
3. Event generation service (cron/queue) to compute upcoming reminder events.
4. Integrations for SMS/email (Twilio, SendGrid) gated by `tier`.
5. Deploy Express behind HTTPS with proper CORS/auth middleware.
