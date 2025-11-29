import { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";
import {
  addDaysToDateKey,
  buildDailyStats,
  computeStreaks,
  isSuccessfulDay,
  sortEventsChronologically,
} from "../utils/stats";
import { getNowInTimezone } from "../utils/time";

export default function History() {
  const { state, clearHistory } = useAppState();
  const timezone = state.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const stats = useMemo(() => buildDailyStats(state.reminderEvents), [state.reminderEvents]);
  const { dateKey: todayKey } = getNowInTimezone(timezone);

  const lastSeven = useMemo(() => {
    const days: Array<{ date: string; label: string; drank: number; total: number; percent: number }> = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = addDaysToDateKey(todayKey, -i);
      const stat = stats[date] ?? { date, drank: 0, total: 0, skipped: 0, completion: 0 };
      days.push({
        date,
        label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(date + "T00:00:00Z")),
        drank: stat.drank ?? 0,
        total: stat.total ?? 0,
        percent: stat.completion ?? 0,
      });
    }
    return days;
  }, [stats, todayKey]);

  const lastSevenTotals = lastSeven.reduce(
    (acc, day) => {
      acc.drank += day.drank;
      acc.total += day.total;
      return acc;
    },
    { drank: 0, total: 0 }
  );

  const successLast30 = useMemo(() => {
    let successDays = 0;
    for (let i = 0; i < 30; i += 1) {
      const date = addDaysToDateKey(todayKey, -i);
      const stat = stats[date];
      if (stat && isSuccessfulDay(stat)) successDays += 1;
    }
    return successDays;
  }, [stats, todayKey]);

  const recentResponses = useMemo(() => {
    const responded = state.reminderEvents.filter((ev) => ev.status !== "scheduled");
    const sorted = sortEventsChronologically(responded).reverse();
    return sorted;
  }, [state.reminderEvents]);

  const streaks = useMemo(
    () => computeStreaks(state.reminderEvents, timezone),
    [state.reminderEvents, timezone]
  );

  const hasEvents = state.reminderEvents.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">History & stats</h1>
        <p className="text-sm text-slate-600">
          Track how often you follow your hydration pings and keep an eye on streaks.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Last 7 days</h3>
            <p className="text-xs text-slate-500">
              {hasEvents
                ? Math.round(lastSevenTotals.total ? (lastSevenTotals.drank / lastSevenTotals.total) * 100 : 0) + "% drank overall"
                : "No responses yet"}
            </p>
          </div>
          <div className="text-xs text-slate-600">
            Current streak: <span className="font-semibold text-slate-900">{streaks.currentStreak}</span> | Best streak: <span className="font-semibold text-slate-900">{streaks.bestStreak}</span>
          </div>
        </div>

        {hasEvents ? (
          <div className="flex h-32 items-end gap-2" role="list">
            {lastSeven.map((day) => {
              const barHeight = day.total ? Math.max(day.percent, 6) : 0;
              const label = day.date + ": " + (day.total ? day.drank + "/" + day.total : "0/0") + " pings drank (" + day.percent + "%)";
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1" role="listitem">
                  <div className="flex h-24 w-full items-end rounded-md bg-slate-100 px-1">
                    <div
                      role="img"
                      aria-label={label}
                      title={label}
                      className="w-full rounded-md bg-hhp-primary shadow-sm transition-all"
                      style={{ height: barHeight + "%" }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{day.label}</span>
                  <span className="text-[11px] text-slate-500">{day.percent}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-100 px-4 py-6 text-xs text-slate-600">
            No responses logged yet. Mark a ping as "Drank" or "Skip" from your Dashboard to see progress.
          </p>
        )}

        <p className="text-xs text-slate-600">
          In the last 30 days, you hit your hydration goal on <span className="font-semibold text-slate-900">{successLast30}</span> day{successLast30 === 1 ? "" : "s"}.
        </p>

        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-semibold text-slate-900">Recent responses</h3>
          <button
            className="text-xs font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
            onClick={clearHistory}
          >
            Clear history
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-600 sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Time</th>
                <th className="pb-2 pr-4">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentResponses.length ? (
                recentResponses.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="py-2 pr-4">{row.date}</td>
                    <td className="py-2 pr-4">{row.time}</td>
                    <td className="py-2 pr-4 capitalize">{row.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-3 text-slate-600">
                    No responses yet. Mark a ping as "Drank" or "Skip" from your Dashboard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
