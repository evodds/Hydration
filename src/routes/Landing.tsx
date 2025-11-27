import { Link, useNavigate } from "react-router-dom";

const benefits = [
  {
    title: "Schedule-first reminders",
    body: "Set your awake window and we’ll handle the ping times.",
  },
  {
    title: "No ml/oz tracking",
    body: "Stay hydrated without obsessing over exact amounts.",
  },
  {
    title: "Lightweight, no bloat",
    body: "Simple reminders, fast setup, and no clutter.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <header className="flex items-center justify-between rounded-full border border-white/50 bg-white/70 px-5 py-3 shadow-card backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-card">
            <span className="text-lg">💧</span>
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Hydration Habit Ping
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-100">
          <span className="cursor-pointer transition-colors hover:text-white">
            How it works
          </span>
          <span className="cursor-pointer transition-colors hover:text-white">
            Pricing
          </span>
          <Link to="/auth" className="transition-colors hover:text-white">
            Log in
          </Link>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-hhp-accentPrimary to-hhp-accentPrimaryLight px-4 py-2 text-xs font-semibold text-white shadow-soft transition duration-150 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Get started
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-white/30 bg-white/60 px-8 py-10 shadow-soft backdrop-blur sm:px-10 sm:py-12">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Gentle hydration pings that follow your day.
          </h1>
          <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
            Set your awake window once. We space reminders for you—no tracking overload, just light nudges to drink.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-hhp-accentPrimary to-hhp-accentPrimaryLight px-7 py-3 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            onClick={() => navigate("/auth")}
          >
            Start my reminders
          </button>
          <button
            className="text-sm font-medium text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
            onClick={() => navigate("/auth")}
          >
            Log in
          </button>
        </div>

        <div className="text-center text-xs uppercase tracking-wide text-slate-500">
          Built for people who want calm, schedule-first hydration nudges.
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 text-center">
          Why it works
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {benefits.map((item, idx) => (
            <div
              key={item.title}
              className="flex h-full flex-col gap-3 rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-card backdrop-blur transition duration-150 ease-out hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hhp-accentSoft text-lg text-hhp-accentPrimary">
                {["⏱", "✅", "🌿"][idx]}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-700">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
