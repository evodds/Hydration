// --- Forcing a cache refresh ---
import React, { useState } from 'react';
import { useAppState } from '@/state/AppStateContext.tsx';
import { Link, Navigate } from 'react-router-dom';
import { ReminderEvent } from '@/types/app-types.ts';
import Confetti from 'react-confetti';
import { getPingDate } from '@/utils/time.ts';

function StreakCard({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-sm font-medium text-gray-500">Streak</h3>
      <div className="flex items-baseline mt-2 space-x-2">
        <span className="text-3xl font-bold text-blue-600">{current}</span>
        <span className="text-sm text-gray-500">days</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">Longest: {longest} days</p>
    </div>
  );
}

function PingRow({
  event,
  onLogAction,
}: {
  event: ReminderEvent;
  onLogAction: (id: string, status: 'drank' | 'skipped') => void;
}) {
  const { user } = useAppState();
  if (!user) return null;

  const isComplete = !!event.status;
  const isPast = getPingDate(event.pingTime, user.timezone) < new Date();

  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <span
          className={`inline-block w-2.5 h-2.5 mr-3 rounded-full ${
            isComplete
              ? event.status === 'drank'
                ? 'bg-green-400'
                : 'bg-red-400'
              : isPast
              ? 'bg-gray-300'
              : 'bg-blue-400'
          }`}
        ></span>
        <span
          className={`font-medium ${
            isComplete ? 'text-gray-400 line-through' : 'text-gray-700'
          }`}
        >
          {event.pingTime}
        </span>
      </div>
      <div className="flex space-x-2">
        {isComplete ? (
          <span className="px-3 py-1 text-xs font-semibold text-gray-500 capitalize bg-gray-100 rounded-full">
            {event.status}
          </span>
        ) : (
          <>
            <button
              onClick={() => onLogAction(event.id, 'skipped')}
              className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200"
            >
              Skip
            </button>
            <button
              onClick={() => onLogAction(event.id, 'drank')}
              className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200"
            >
              Drank
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default function Dashboard() {
  const { user, schedule, reminderEvents, logReminderAction, isLoading } =
    useAppState();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleLogAction = async (
    id: string,
    status: 'drank' | 'skipped'
  ) => {
    // Use the new logReminderAction from the context
    await logReminderAction(id, status);

    // Check for confetti
    const allDone = reminderEvents.every(
      (e) => e.status !== null || e.id === id
    );
    if (allDone) {
      setShowConfetti(true);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading app...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          No schedule found.
        </h2>
        <p className="text-gray-500 mb-6">
          Get started by creating your first hydration schedule.
        </p>
        <Link
          to="/onboarding/create-schedule"
          className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700"
        >
          Create Schedule
        </Link>
      </div>
    );
  }

  const completedCount = reminderEvents.filter((e) => e.status === 'drank').length;
  const totalCount = reminderEvents.length;
  const allDone = reminderEvents.every((e) => e.status !== null);

  return (
    <div className="max-w-2xl p-8 mx-auto">
      {showConfetti && (
        <Confetti
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Good Morning, {user.email.split('@')[0]}
      </h1>

      {/* <StreakCard current={user.currentStreak} longest={user.longestStreak} /> */}

      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">
            Today's Pings
          </h3>
          <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
            {completedCount} / {totalCount} completed
          </span>
        </div>
        <ul className="divide-y divide-gray-200">
          {reminderEvents.length > 0 ? (
            reminderEvents.map((event) => (
              <PingRow
                key={event.id}
                event={event}
                onLogAction={handleLogAction}
              />
            ))
          ) : (
            <p className="py-4 text-sm text-center text-gray-500">
              No pings scheduled for today.
            </p>
          )}
        </ul>
        {allDone && reminderEvents.length > 0 && (
          <p className="pt-4 text-sm font-semibold text-center text-green-600">
            All done for today! Great job! 🎉
          </p>
        )}
      </div>
    </div>
  );
}
