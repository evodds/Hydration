import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

const timezones = [
  "Use browser timezone",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

export default function OnboardingTimezone() {
  const navigate = useNavigate();
  const { state, setUser } = useAppState();
  const initial = useMemo(
    () => state.user?.timezone || "Use browser timezone",
    [state.user]
  );
  const [tz, setTz] = useState(initial);

  const resolveTimezone = () =>
    tz === "Use browser timezone"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : tz;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.user) {
      navigate("/auth");
      return;
    }
    setUser({ ...state.user, timezone: resolveTimezone() });
    navigate("/schedule/create");
  };

  const handleSkip = () => {
    if (!state.user) {
      navigate("/auth");
      return;
    }
    setUser({
      ...state.user,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    navigate("/schedule/create");
  };

  return (
    <div className="mx-auto flex max-w-3xl items-center justify-center px-4">
      <div className="w-full space-y-8 rounded-3xl border border-white/60 bg-white/80 px-6 py-8 shadow-soft backdrop-blur sm:px-8 sm:py-10 fade-in-up">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-hhp-primarySoft px-3 py-1 text-[11px] font-semibold text-hhp-primary">
            We’ll match pings to your day
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-hhp-ink">Which timezone do you live in?</h1>
          <p className="text-sm leading-relaxed text-hhp-inkMuted">
            We’ll schedule your reminders based on this. You can change it later.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
            <div className="flex items-center justify-between text-xs font-semibold text-hhp-inkMuted">
              <span>Detected timezone</span>
              <span className="rounded-full bg-hhp-primarySoft px-3 py-1 text-hhp-primary">Suggested</span>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card ring-hhp-primary transition hover:border-hhp-primary hover:ring-2">
              <input
                type="radio"
                className="mt-1 h-4 w-4 text-hhp-primary focus:ring-hhp-primary"
                checked={tz === "Use browser timezone"}
                onChange={() => setTz("Use browser timezone")}
              />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-hhp-ink">Use my current timezone</div>
                <p className="text-xs text-hhp-inkMuted">
                  Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
            </label>

            <div className="space-y-2 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-hhp-inkMuted">Or choose another</div>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-hhp-ink placeholder:text-slate-400 transition focus:border-hhp-primary focus:outline-none focus:ring-2 focus:ring-hhp-primary/30"
                value={tz}
                onChange={(e) => setTz(e.target.value)}
              >
                {timezones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              <p className="text-xs text-hhp-inkMuted">We’ll use this for all schedule times.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-hhp-primary to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Continue
            </button>
            <button
              type="button"
              className="text-sm font-medium text-hhp-inkMuted underline-offset-4 transition hover:text-hhp-ink hover:underline"
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
