# Hydration Habit Ping

Simple schedule-first hydration reminder MVP. Users set days, awake window, number of pings, and optional quiet periods. The app calculates evenly spaced ping times, shows the next ping and today’s pings on the dashboard, and stores everything locally.

## Quickstart
```bash
npm install
npm run dev
```

## Notes
- All data is stored in `localStorage` under `hydration-habit-ping-state`.
- No real email/SMS sending yet; this is front-end only.
- Routes: landing, auth, onboarding/timezone, schedule create/edit, dashboard, settings, plans, history.

## Next steps
- Hook up a backend for real auth and reminder delivery.
- Wire an email/SMS provider for actual pings.
