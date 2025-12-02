import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppState } from "@/state/AppStateContext.tsx";
import { type Schedule, type QuietPeriod, type DayOfWeek } from "@/types/app-types.ts";
import { generatePingTimes } from "@/utils/time.ts";
import { createId } from "@/utils/id.ts";

const dayLabels: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const defaultSchedule: Schedule = {
  id: createId("schedule"),
  name: "Workdays",
  daysOfWeek: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "19:00",
  numPings: 4,
  quietPeriods: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function CreateSchedule() {
  const { state, setSchedule } = useAppState();
  const navigate = useNavigate();

  const [form, setForm] = useState<Schedule>(state.schedule || defaultSchedule);
  const [quietRows, setQuietRows] = useState<QuietPeriod[]>([
    form.quietPeriods[0] || { start: "", end: "" },
    form.quietPeriods[1] || { start: "", end: "" },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(state.schedule || defaultSchedule);
  }, [state.schedule]);

  const toggleDay = (day: DayOfWeek) => {
    setForm((prev) => {
      const exists = prev.daysOfWeek.includes(day);
      const days = exists
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => a - b);
      return { ...prev, daysOfWeek: days };
    });
  };

  const updateQuiet = (index: number, field: keyof QuietPeriod, value: string) => {
    setQuietRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const previewSchedule = useMemo<Schedule>(
    () => ({
      ...form,
      quietPeriods: quietRows.filter((q) => q.start && q.end),
      isActive: form.isActive ?? true,
    }),
    [form, quietRows]
  );

  const pingTimes = useMemo(
    () => generatePingTimes(previewSchedule),
    [previewSchedule]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.daysOfWeek.length === 0) {
      setError("Pick at least one day.");
      return;
    }
    const startMinutes = Number(form.startTime.split(":")[0]) * 60 + Number(form.startTime.split(":")[1]);
    const endMinutes = Number(form.endTime.split(":")[0]) * 60 + Number(form.endTime.split(":")[1]);
    if (endMinutes <= startMinutes) {
      setError("End time must be after start time.");
      return;
    }
    if (form.numPings < 3 || form.numPings > 10) {
      setError("Pings must be between 3 and 10.");
      return;
    }
    setError("");
    const finalSchedule: Schedule = {
      ...form,
      quietPeriods: quietRows.filter((q) => q.start && q.end),
      isActive: form.isActive ?? true,
    };
    setSchedule(finalSchedule);
    navigate("/dashboard");
  };

  const handleCancel = () => {
    if (state.schedule) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  // --- FEATURE GATE ---
  if (state.user?.tier === "free" && state.schedule) {
    return (
      <div className="rounded-2xl bg-white/60 p-8 text-center shadow-soft">
        <h2 className="text-2xl font-bold text-hhp-ink">Upgrade to Pro</h2>
        <p className="mt-4 text-hhp-ink/70">
          The free plan supports one schedule. You've already created yours!
        </p>
        <p className="mt-2 text-hhp-ink/70">
          Upgrade to Pro to create multiple schedules (e.g., for work, weekends, or the gym).
        </p>
        <Link
          to="/plans"
          className="mt-6 inline-block rounded-xl bg-hhp-primary px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-hhp-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2"
        >
          View Pro Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Create your hydration schedule
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          We’ll ping you during your awake hours, at times that fit your day.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)]"
      >
        <div className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <Section title="Name & days" helper="Pick the days you want hydration pings.">
            <Input
              label="Schedule name"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Workdays"
            />
            <div className="flex flex-wrap gap-2">
              {(Object.keys(dayLabels) as unknown as DayOfWeek[]).map((day) => {
                const active = form.daysOfWeek.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-transparent bg-hhp-primary text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {dayLabels[day]}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">Tip: Start with weekdays if you’re easing into the habit.</p>
          </Section>

          <Section
            title="Awake window"
            helper="We’ll spread pings between these times."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Start time (e.g. 09:00)"
                type="time"
                value={form.startTime}
                onChange={(v) => setForm((p) => ({ ...p, startTime: v }))}
                placeholder="09:00"
              />
              <Input
                label="End time (e.g. 19:00)"
                type="time"
                value={form.endTime}
                onChange={(v) => setForm((p) => ({ ...p, endTime: v }))}
                placeholder="19:00"
              />
            </div>
          </Section>

          <Section
            title="How many pings per day?"
            helper="We’ll spread them between your start and end times."
          >
            <Input
              label="Number of pings"
              type="number"
              value={String(form.numPings)}
              onChange={(v) =>
                setForm((p) => ({ ...p, numPings: Number(v) || 3 }))
              }
              min={3}
              max={10}
            />
          </Section>

          <Section
            title="Quiet periods"
            helper="Optional windows to skip reminders."
            optional
          >
            <div className="space-y-3">
              {quietRows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center"
                >
                  <Input
                    label="Start"
                    type="time"
                    value={row.start}
                    onChange={(v) => updateQuiet(idx, "start", v)}
                    placeholder="13:00"
                  />
                  <Input
                    label="End"
                    type="time"
                    value={row.end}
                    onChange={(v) => updateQuiet(idx, "end", v)}
                    placeholder="14:00"
                  />
                  <div className="text-xs text-slate-500">No reminders during this time.</div>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-hhp-primary to-cyan-400 px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Save schedule &amp; view Dashboard
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="text-lg font-semibold text-slate-900">Today’s ping times (preview)</div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {pingTimes.length ? (
                pingTimes.map((time) => (
                  <div
                    key={time}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {time}
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No pings for this setup.</p>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Times are automatically spaced between your awake window, skipping quiet periods.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  helper,
  optional,
  children,
}: {
  title: string;
  helper?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-4 shadow-card backdrop-blur sm:px-5 sm:py-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        {title}
        {optional && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            Optional
          </span>
        )}
      </div>
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
      <div className="space-y-3 text-sm text-primary">{children}</div>
    </div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-900">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
      />
    </label>
  );
}





