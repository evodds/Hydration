import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";
import { getNowInTimezone, parseTimeToMinutes } from "../utils/time";
import { buildDailyStats, computeStreaks, isSuccessfulDay, sortEventsChronologically } from "../utils/stats";
import type { ReminderEvent } from "../types/schedule";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SUCCESS_THRESHOLD = 0.6;

type ConfirmationState = { message: string; tone: "drank" | "skipped" } | null;
type ConfettiPiece = { id: number; left: number; delay: number; color: string };

export default function Dashboard() {
  const { state, updateSchedule, logReminderAction } = useAppState();
  const navigate = useNavigate();
  const schedule = state.schedule;
  const timezone = state.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const confettiCooldownRef = useRef<number>(0);

  const nowParts = getNowInTimezone(timezone);
  const todayKey = nowParts.dateKey;
  const dailyStats = useMemo(() => buildDailyStats(state.reminderEvents), [state.reminderEvents]);
  const todaysStat = dailyStats[todayKey];
  const streaks = useMemo(
    () => computeStreaks(state.reminderEvents, timezone, SUCCESS_THRESHOLD),
    [state.reminderEvents, timezone]
  );

  const todaysEvents = useMemo(
    () =>
      sortEventsChronologically(state.reminderEvents.filter((ev) => ev.date === todayKey)),
    [state.reminderEvents, todayKey]
  );

  const scheduledEvents = useMemo(
    () => sortEventsChronologically(state.reminderEvents.filter((ev) => ev.status === "scheduled")),
    [state.reminderEvents]
  );

  const nextEvent = scheduledEvents.find(
    (ev) => ev.date > todayKey || (ev.date === todayKey && parseTimeToMinutes(ev.time) > nowParts.minutes)
  );
  const nextLabel = nextEvent ? formatEventLabel(nextEvent, timezone, todayKey) : null;
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const toggleActive = () => {
    if (!schedule) return;
    updateSchedule({ isActive: !schedule.isActive });
  };

  const showConfirmation = (response: "drank" | "skipped") => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setConfirmation(
      response === "drank"
        ? { message: "Great! Logged as drank.", tone: "drank" }
        : { message: "Logged as skipped.", tone: "skipped" }
    );
    timeoutRef.current = window.setTimeout(() => setConfirmation(null), 2000);
  };

  const triggerConfetti = () => {
    const now = Date.now();
    if (now - confettiCooldownRef.current < 1200) return;
    confettiCooldownRef.current = now;
    const colors = ["#14b8c4", "#22c55e", "#f59e0b", "#6366f1", "#ef4444"];
    const pieces = Array.from({ length: 18 }, (_, idx) => ({
      id: Date.now() + idx,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      color: colors[idx % colors.length],
    }));
    setConfetti(pieces);
    window.setTimeout(() => setConfetti([]), 1200);
  };

  const handleLogResponse = (id: string, response: "drank" | "skipped") => {
    const predictedEvents = state.reminderEvents.map((ev) =>
      ev.id === id ? { ...ev, status: response } : ev
    );
    const preStreak = computeStreaks(state.reminderEvents, timezone, SUCCESS_THRESHOLD);
    const postStreak = computeStreaks(predictedEvents, timezone, SUCCESS_THRESHOLD);
    const statsAfter = buildDailyStats(predictedEvents);
    const todayAfter = statsAfter[todayKey];
    const isTodaySuccessful = todayAfter ? isSuccessfulDay(todayAfter, SUCCESS_THRESHOLD) : false;
    const streakImproved =
      postStreak.currentStreak > preStreak.currentStreak || postStreak.bestStreak > preStreak.bestStreak;

    logReminderAction(id, response);
    showConfirmation(response);
    if (isTodaySuccessful && streakImproved) {
      triggerConfetti();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const confirmationToneClasses =
    confirmation?.tone === "drank"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-slate-100 text-hhp-inkMuted";

  const scheduleActive = schedule?.isActive ?? false;

  return (
    <div className="relative grid gap-6">
      {confetti.length > 0 && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              aria-hidden
              className="absolute h-2 w-2 rounded-full"
              style={{
                top: "10%",
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animation: `hhp-confetti-fall 1.1s ease-out forwards`,
                animationDelay: `${piece.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {confirmation && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-card ${confirmationToneClasses}`}
          role="status"
        >
          {confirmation.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-5 shadow-soft backdrop-blur fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-hhp-inkMuted">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-hhp-inkMuted">Today</div>
                <div className="text-lg font-semibold text-hhp-ink">{todayLabel}</div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-hhp-primarySoft px-3 py-1 text-xs font-semibold text-hhp-primary">
                {nextLabel ?? "No upcoming pings"}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/60 bg-white/80 px-6 py-6 shadow-soft backdrop-blur fade-in-up">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-hhp-ink">Schedule status</h2>
                  {schedule && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        schedule.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {schedule.isActive ? "Active" : "Paused"}
                    </span>
                  )}
                </div>
                {schedule ? (
                  <dl className="grid grid-cols-2 gap-3 text-sm text-hhp-ink sm:grid-cols-3">
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-hhp-inkMuted">Name</dt>
                      <dd className="font-semibold">{schedule.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-hhp-inkMuted">Days</dt>
                      <dd className="font-semibold">{formatDays(schedule.daysOfWeek)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-hhp-inkMuted">Awake window</dt>
                      <dd className="font-semibold">
                        {schedule.startTime} - {schedule.endTime}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-hhp-inkMuted">Pings</dt>
                      <dd className="font-semibold">{schedule.numPings} / day</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-hhp-inkMuted">No schedule set yet.</p>
                )}
              </div>
              {schedule && (
                <div className="flex flex-col items-end gap-2 text-sm text-hhp-inkMuted">
                  <span>Reminders</span>
                  <button
                    onClick={toggleActive}
                    role="switch"
                    aria-checked={schedule.isActive}
                    aria-label="Toggle schedule active status"
                    className={`flex h-7 w-12 items-center rounded-full border px-0.5 transition ${
                      schedule.isActive
                        ? "border-hhp-primary bg-hhp-primary"
                        : "border-slate-300 bg-slate-200"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        schedule.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
            <div className="pt-2">
              <button
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-hhp-ink transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={() => navigate("/schedule/create")}
              >
                {schedule ? "Edit schedule" : "Create schedule"}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-soft backdrop-blur fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-hhp-ink">Today’s pings</h3>
              {schedule && (
                <span className="text-xs font-semibold text-hhp-inkMuted">
                  {todaysStat ? `${todaysStat.drank}/${todaysStat.total} drank` : "0/0"}
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {schedule && todaysEvents.length ? (
                todaysEvents.map((event) => (
                  <PingRow
                    key={event.id}
                    event={event}
                    onAction={handleLogResponse}
                    isActive={scheduleActive}
                  />
                ))
              ) : (
                <p className="text-hhp-inkMuted">No pings for today.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur fade-in-up">
            <h3 className="text-lg font-semibold text-hhp-ink">Next ping</h3>
            <div className="mt-3 space-y-1">
              {nextLabel ? (
                <>
                  <div className="text-xl font-semibold text-hhp-ink sm:text-2xl">{nextLabel}</div>
                  <p className="text-xs text-hhp-inkMuted">We’ll remind you around this time.</p>
                </>
              ) : (
                <p className="text-sm text-hhp-inkMuted">
                  No pings scheduled. Turn your schedule on or adjust your awake window.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur fade-in-up">
            <h3 className="text-lg font-semibold text-hhp-ink">Streaks</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-hhp-inkMuted">Current streak</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-hhp-ink">{streaks.currentStreak}</span>
                  <span className="text-sm text-hhp-inkMuted">days</span>
                </div>
                {isSuccessfulDay(todaysStat ?? { date: todayKey, total: 0, drank: 0, skipped: 0, completion: 0 }, SUCCESS_THRESHOLD) ? (
                  <p className="text-xs text-emerald-600">On track today — keep going!</p>
                ) : (
                  <p className="text-xs text-hhp-inkMuted">Hit at least 60% of pings to extend it.</p>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-hhp-inkMuted">Best streak</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-hhp-ink">{streaks.bestStreak}</span>
                  <span className="text-sm text-hhp-inkMuted">days</span>
                </div>
                <p className="text-xs text-hhp-inkMuted">We’ll celebrate when you set a new best.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-hhp-inkMuted">
        <Link className="underline" to="/settings">
          Settings
        </Link>
        <Link className="underline" to="/plans">
          Upgrade
        </Link>
        <Link className="underline" to="/history">
          History
        </Link>
      </div>
    </div>
  );
}

function PingRow({
  event,
  onAction,
  isActive,
}: {
  event: ReminderEvent;
  onAction: (id: string, response: "drank" | "skipped") => void;
  isActive: boolean;
}) {
  const isDone = event.status !== "scheduled";
  const badgeClasses =
    event.status === "drank"
      ? "bg-emerald-50 text-emerald-700"
      : event.status === "skipped"
      ? "bg-slate-100 text-hhp-inkMuted"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-hhp-ink">
      <span className="h-2 w-2 rounded-full bg-hhp-primary" />
      <span className="font-semibold text-hhp-ink">{event.time}</span>
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClasses}`}>
        {event.status}
      </span>
      {!isDone && (
        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-hhp-ink transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={() => onAction(event.id, "drank")}
            disabled={!isActive}
          >
            Drank
          </button>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-hhp-ink transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={() => onAction(event.id, "skipped")}
            disabled={!isActive}
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

function formatDays(days: number[]) {
  if (!days.length) return "None";
  const sorted = [...days].sort((a, b) => a - b);
  return sorted.map((d) => dayNames[d]).join(" / ");
}

function formatEventLabel(event: ReminderEvent, timezone: string, todayKey: string) {
  const eventDate = new Date(`${event.date}T00:00:00Z`);
  const todayDate = new Date(`${todayKey}T00:00:00Z`);
  const diffDays = Math.round((eventDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  const dayLabel =
    diffDays === 0
      ? "Today"
      : diffDays === 1
        ? "Tomorrow"
        : new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            timeZone: timezone,
          }).format(eventDate);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`${event.date}T${event.time}:00Z`));
  return `${dayLabel} at ${timeLabel}`;
}

