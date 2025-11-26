import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";
import { generatePingTimes, getNextPingDate } from "../utils/time";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Dashboard() {
  const { state, updateSchedule } = useAppState();
  const navigate = useNavigate();
  const schedule = state.schedule;

  const toggleActive = () => {
    if (!schedule) return;
    updateSchedule({ isActive: !schedule.isActive });
  };

  const nextPing =
    schedule && state.user
      ? getNextPingDate(schedule, state.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
      : null;

  const todaysPings = schedule ? generatePingTimes(schedule) : [];

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-soft sm:px-7 sm:py-7">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Current schedule</h2>
                {schedule && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
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
                <dl className="grid grid-cols-2 gap-3 text-sm text-slate-900 sm:grid-cols-3">
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-slate-500">Name</dt>
                    <dd className="font-medium">{schedule.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-slate-500">Days</dt>
                    <dd className="font-medium">{formatDays(schedule.daysOfWeek)}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-slate-500">Awake</dt>
                    <dd className="font-medium">
                      {schedule.startTime} – {schedule.endTime}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-wide text-slate-500">Pings</dt>
                    <dd className="font-medium">{schedule.numPings} per day</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-600">No schedule set yet.</p>
              )}
            </div>
            {schedule && (
              <div className="flex flex-col items-end gap-2 text-sm text-slate-700">
                <span>Schedule ON/OFF</span>
                <button
                  onClick={toggleActive}
                  className={`flex h-6 w-11 items-center rounded-full border px-0.5 transition ${
                    schedule.isActive
                      ? "border-brand-primary bg-brand-primary"
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
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={() => navigate("/schedule/create")}
            >
              {schedule ? "Edit schedule" : "Create schedule"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="text-lg font-semibold text-slate-900">Next ping</h3>
            <div className="mt-3 space-y-1">
              {nextPing ? (
                <>
                  <div className="text-xl font-semibold text-slate-900 sm:text-2xl">
                    {nextPing.label}
                  </div>
                  <p className="text-xs text-slate-500">
                    We’ll remind you around this time.
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  No pings scheduled. Turn your schedule on or adjust your awake window.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="text-lg font-semibold text-slate-900">Today’s pings</h3>
            <div className="mt-3 space-y-2 text-sm">
              {schedule && todaysPings.length ? (
                todaysPings.map((time) => (
                  <div
                    key={time}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700"
                  >
                    <span className="h-2 w-2 rounded-full bg-brand-primary" />
                    {time}
                  </div>
                ))
              ) : (
                <p className="text-slate-600">No pings for today.</p>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              In a future version this can show which ones were completed.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
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

function formatDays(days: number[]) {
  if (!days.length) return "None";
  const sorted = [...days].sort((a, b) => a - b);
  return sorted.map((d) => dayNames[d]).join(" – ");
}
