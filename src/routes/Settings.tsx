import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

const timezones = [
  "Use browser timezone",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Australia/Sydney",
  "UTC",
];

export default function Settings() {
  const { state, setUser, updateSchedule, clearAll } = useAppState();
  const navigate = useNavigate();
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(state.user?.email || "");

  const user = state.user;

  const currentTz = user?.timezone || "Use browser timezone";

  const handleEmailSave = () => {
    if (!user) return;
    setUser({ ...user, email: emailDraft });
    setEditingEmail(false);
  };

  const handleTimezoneChange = (value: string) => {
    if (!user) return;
    const tz =
      value === "Use browser timezone"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : value;
    setUser({ ...user, timezone: tz });
  };

  const handlePauseToggle = () => {
    if (!state.schedule) return;
    updateSchedule({ ...state.schedule, isActive: !state.schedule.isActive });
  };

  const handleDeleteAccount = () => {
    const ok = window.confirm("Delete account data from this device?");
    if (ok) {
      clearAll();
      navigate("/");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Tweak your account and reminder behavior.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900">Account</h2>
          <div className="mt-4 divide-y divide-slate-100 text-sm">
            <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">Email</div>
                {editingEmail ? (
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-hhp-primary focus:outline-none focus:ring-2 focus:ring-hhp-primary/30"
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-slate-600">{user?.email || "—"}</div>
                )}
              </div>
              {editingEmail ? (
                <div className="flex gap-2">
                  <button
                    className="rounded-full bg-hhp-primary px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:bg-cyan-600"
                    onClick={handleEmailSave}
                  >
                    Save
                  </button>
                  <button
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setEditingEmail(false);
                      setEmailDraft(user?.email || "");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setEditingEmail(true)}
                >
                  Change
                </button>
              )}
            </div>

            <div className="py-3">
              <button className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Change password
              </button>
            </div>
            <div className="py-3">
              <button
                className="w-full rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                onClick={handleDeleteAccount}
              >
                Delete account
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur">
          <h2 className="text-lg font-semibold text-slate-900">Time & reminders</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-900">Timezone</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-hhp-primary focus:outline-none focus:ring-2 focus:ring-hhp-primary/30"
                value={currentTz}
                onChange={(e) => handleTimezoneChange(e.target.value)}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Pause all reminders</div>
                <p className="text-xs text-slate-500">
                  When paused, no reminders will be sent from any schedule.
                </p>
              </div>
              <button
                onClick={handlePauseToggle}
                role="switch"
                aria-checked={!(state.schedule?.isActive ?? true)}
                aria-label="Pause all reminders"
                className={`flex h-6 w-11 items-center rounded-full border px-0.5 transition ${
                  state.schedule?.isActive
                    ? "border-hhp-primary bg-hhp-primary"
                    : "border-slate-300 bg-slate-200"
                }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${
                    state.schedule?.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
