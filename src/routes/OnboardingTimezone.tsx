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
      <div className="w-full space-y-8 rounded-3xl border border-white/40 bg-white/70 px-6 py-8 shadow-soft backdrop-blur sm:px-8 sm:py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Quick timezone check</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            We’ll use this to send reminders at the right times for you.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-900">Timezone</label>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card ring-brand-primary transition hover:border-brand-primary hover:ring-2">
                <input
                  type="radio"
                  className="mt-1 h-4 w-4 text-brand-primary focus:ring-brand-primary"
                  checked={tz === "Use browser timezone"}
                  onChange={() => setTz("Use browser timezone")}
                />
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-900">Use my current timezone</div>
                  <p className="text-xs text-slate-600">
                    Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </div>
              </label>

              <div className="space-y-2 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Or choose another
                </div>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                  value={tz}
                  onChange={(e) => setTz(e.target.value)}
                >
                  {timezones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <label className="font-medium text-slate-900">Language (optional)</label>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30">
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
              <option>Deutsch</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Continue
            </button>
            <button
              type="button"
              className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
              onClick={handleSkip}
            >
              Skip for now
            </button>
          </div>
          <p className="text-xs text-slate-500">You can always change this later in Settings.</p>
        </form>
      </div>
    </div>
  );
}
