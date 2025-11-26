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
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 shadow-card backdrop-blur">
        <Link to="/" className="text-sm font-semibold tracking-tight text-slate-900">
          Hydration Habit Ping
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span className="cursor-pointer transition-colors hover:text-slate-900">
            How it works
          </span>
          <span className="cursor-pointer transition-colors hover:text-slate-900">
            Pricing
          </span>
          <Link to="/auth" className="transition-colors hover:text-slate-900">
            Log in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-soft sm:px-10 sm:py-12">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Set it once, and get hydration pings that fit your day.
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Tiny app that reminds you to drink water on your schedule, without heavy tracking.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </button>
          <button
            className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
            onClick={() => navigate("/auth")}
          >
            Log in
          </button>
        </div>

        <div className="text-xs uppercase tracking-wide text-slate-500">
          Built for people who just want simple hydration nudges – no tracking overload.
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Why it works</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {benefits.map((item, idx) => (
            <div
              key={item.title}
              className="flex h-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primarySoft text-sm text-brand-primary">
                {["⏱", "✅", "⚡"][idx]}
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
