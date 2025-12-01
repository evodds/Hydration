import React, { useState } from 'react';
import { useAppState } from '../state/AppStateContext';
import { Link } from 'react-router-dom';
import { ReminderEvent } from '../types/schedule';
import Confetti from 'react-confetti';

function getPingDate(time: string, timezone: string): Date {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h ?? 0, m ?? 0, 0, 0);
  return target;
}

function StreakCard({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="bg-white/60 shadow-soft rounded-2xl p-6 text-center">
      <h3 className="text-sm font-semibold text-hhp-ink/70 uppercase tracking-wide">
        Current Streak
      </h3>
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="text-5xl font-bold text-hhp-primary">{current}</span>
        <span className="text-3xl text-amber-500">🔥</span>
      </div>
      <p className="mt-2 text-sm text-hhp-ink/70">
        Longest streak: {longest} days
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { state, logReminderAction } = useAppState();
  const [showConfetti, setShowConfetti] = useState(false);

  if (!state.user) return null;

  const tz = state.user.timezone;

  const upcoming = state.reminderEvents.filter((e) => e.status === 'scheduled');
  const nextPingEvent = upcoming.find((e) => getPingDate(e.time, tz) > new Date());
  const nextPing = nextPingEvent ? getPingDate(nextPingEvent.time, tz) : null;

  const todayPings = state.reminderEvents.filter((e) => {
    const pingDate = getPingDate(e.time, tz);
    const now = new Date();
    return pingDate.toDateString() === now.toDateString();
  });

  const handleLogAction = (id: string, status: 'drank' | 'skipped') => {
    logReminderAction(id, status);
    if (status === 'drank') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  if (!state.schedule) {
    return (
      <div className="text-center p-8 bg-white/60 shadow-soft rounded-2xl">
        <h2 className="text-2xl font-bold text-hhp-ink">Welcome!</h2>
        <p className="mt-4 text-hhp-ink/70">
          You don't have a hydration schedule yet. Let's create one!
        </p>
        <Link
          to="/schedule/create"
          className="mt-6 inline-block rounded-xl bg-hhp-primary px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-hhp-primary-dark"
        >
          Create Schedule
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showConfetti && <Confetti recycle={false} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/60 shadow-soft rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-hhp-ink/70 uppercase tracking-wide">
            Next Ping
          </h3>
          {nextPing ? (
            <p className="mt-2 text-3xl font-bold text-hhp-ink">
              {nextPing.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          ) : (
            <p className="mt-2 text-xl font-medium text-hhp-ink/80">
              All pings done for today!
            </p>
          )}
        </div>

        <StreakCard
          current={state.user.currentStreak}
          longest={state.user.longestStreak}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-hhp-ink">Today's Pings</h2>
        <div className="mt-4 flow-root">
          <ul className="-my-4 divide-y divide-gray-200/60">
            {todayPings.length > 0 ? (
              todayPings.map((event) => (
                <PingRow
                  key={event.id}
                  event={event}
                  timezone={tz}
                  onLogAction={handleLogAction}
                />
              ))
            ) : (
              <li className="py-4 text-center text-hhp-ink/70">
                No pings scheduled for today.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface PingRowProps {
  event: ReminderEvent;
  timezone: string;
  onLogAction: (id: string, status: 'drank' | 'skipped') => void;
}

function PingRow({ event, timezone, onLogAction }: PingRowProps) {
  const pingDate = getPingDate(event.time, timezone);
  const isPast = pingDate < new Date();

  return (
    <li className="flex items-center space-x-4 py-4">
      <div className="flex-auto">
        <p className="text-lg font-medium text-hhp-ink">
          {pingDate.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>
      <div>
        {event.status === 'drank' && (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            Drank 💧
          </span>
        )}
        {event.status === 'skipped' && (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            Skipped
          </span>
        )}
        {event.status === 'scheduled' && isPast && (
          <div className="flex gap-2">
            <button
              onClick={() => onLogAction(event.id, 'drank')}
              className="rounded-xl bg-hhp-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hhp-primary-dark"
            >
              Drank
            </button>
            <button
              onClick={() => onLogAction(event.id, 'skipped')}
              className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Skip
            </button>
          </div>
        )}
        {event.status === 'scheduled' && !isPast && (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-sm font-medium text-gray-500">
            Upcoming
          </span>
        )}
      </div>
    </li>
  );
}
