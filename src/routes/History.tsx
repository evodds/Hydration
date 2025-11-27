import { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";

export default function History() {
  const { state, clearHistory } = useAppState();

  const timezone =
    state.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const rows = useMemo(() => {
    if (!state.history.length) return [];
    return [...state.history]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      )
      .map((entry) => {
        const event = state.reminderEvents.find(
          (ev) => ev.id === entry.reminderEventId
        );
        const label =
          event?.localTimeLabel ||
          new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(entry.occurredAt));
        const date = new Intl.DateTimeFormat("en-CA", {
          timeZone: timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(entry.occurredAt));
        return {
          id: entry.id,
          date,
          label,
          response: entry.response,
        };
      });
  }, [state.history, state.reminderEvents, timezone]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">History & stats</h1>
        <p className="text-sm text-slate-600">
          Future view of how often you followed your hydration pings.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/40 bg-white/70 p-6 shadow-card backdrop-blur">
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500">
          Weekly completion chart (placeholder)
        </div>

        <div className="flex items-center justify-between">
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
              {rows.length ? (
                rows.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="py-2 pr-4">{row.date}</td>
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2 pr-4 capitalize">{row.response}</td>
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
