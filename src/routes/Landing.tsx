import { Link, useNavigate } from "react-router-dom";

const steps = [
  {
    title: "Set your schedule once",
    body: "Pick your days, awake window, and how many pings feel right.",
    icon: "01",
  },
  {
    title: "We space the pings",
    body: "Evenly spread reminders, no milliliter math or nagging charts.",
    icon: "02",
  },
  {
    title: "Tap drank or skipped",
    body: "A simple streak view keeps you gently accountable.",
    icon: "03",
  },
];

const psychology = [
  {
    title: "No guilt dashboards",
    body: "Completion rates stay calm and neutral—no red warning walls.",
  },
  {
    title: "Predictable rhythm",
    body: "Your brain learns the cadence of pings, reducing decision fatigue.",
  },
  {
    title: "Respects your day",
    body: "Quiet periods and daylight windows keep reminders welcome, not noisy.",
  },
];

const mockTimes = [
  { time: "9:15 AM", status: "scheduled" },
  { time: "11:45 AM", status: "scheduled" },
  { time: "2:10 PM", status: "drank" },
  { time: "4:30 PM", status: "scheduled" },
];

export default function Landing() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-14">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-soft backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-hhp-primary shadow-card">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.82 3.56a1 1 0 0 0-1.64 0C8.69 7 6 10.24 6 13.27 6 17.14 8.74 20 12 20s6-2.86 6-6.73c0-3.03-2.69-6.27-5.18-9.71Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.18" />
              <path d="M9.5 13.5 11 15l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight text-hhp-ink">Hydration Habit Ping</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-hhp-inkMuted">
          <button
            type="button"
            className="transition-colors hover:text-hhp-ink focus-visible:underline"
            onClick={scrollToHowItWorks}
          >
            How it works
          </button>
          <Link className="transition-colors hover:text-hhp-ink focus-visible:underline" to="/plans">
            Pricing
          </Link>
          <Link className="transition-colors hover:text-hhp-ink focus-visible:underline" to="/auth">
            Log in
          </Link>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-hhp-primary to-cyan-400 px-4 py-2 text-xs font-semibold text-white shadow-soft transition duration-150 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            Get started
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 items-center gap-10 rounded-3xl border border-white/50 bg-white/80 p-8 shadow-soft backdrop-blur lg:grid-cols-2 lg:p-12 fade-in-up">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-hhp-primarySoft px-3 py-1 text-[11px] font-semibold text-hhp-primary">
            Gentle hydration, no guilt
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-hhp-ink sm:text-4xl lg:text-5xl">
            Tiny pings that protect your hydration habit.
          </h1>
          <p className="text-base leading-relaxed text-hhp-inkMuted sm:text-lg">
            Set your awake hours once. We’ll space out gentle reminders so you can hydrate without thinking about milliliters or charts.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-hhp-primary to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              onClick={() => navigate("/auth")}
            >
              Start my reminders
            </button>
            <button
              className="text-sm font-semibold text-hhp-ink underline-offset-4 transition hover:underline"
              onClick={scrollToHowItWorks}
            >
              See how it works
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/90 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center justify-between text-xs font-semibold text-hhp-inkMuted">
              <span className="rounded-full bg-hhp-primarySoft px-3 py-1 text-hhp-primary">Today · 4 pings</span>
              <span className="rounded-full bg-hhp-accentSoft px-3 py-1 text-hhp-accent">Last 7 days · 71%</span>
            </div>
            <div className="mt-4 space-y-2">
              {mockTimes.map((item) => (
                <div
                  key={item.time}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-hhp-primary" aria-hidden />
                    <span className="font-semibold text-hhp-ink">{item.time}</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      item.status === "drank"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-hhp-inkMuted"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-hhp-primarySoft to-white px-4 py-3 text-xs text-hhp-ink">
              We’ll avoid quiet periods and keep reminders predictable.
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="space-y-6 fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-hhp-ink sm:text-3xl">How it works</h2>
            <p className="text-sm text-hhp-inkMuted">Built for calm, schedule-first reminders.</p>
          </div>
          <div className="text-xs text-hhp-inkMuted">Takes about 60 seconds to set up.</div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex h-full flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur transition duration-150 ease-out hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-hhp-primarySoft text-xs font-semibold text-hhp-primary">
                {step.icon}
              </span>
              <h3 className="text-base font-semibold text-hhp-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-hhp-inkMuted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 fade-in-up">
        <div className="space-y-1 text-left">
          <h2 className="text-2xl font-semibold text-hhp-ink sm:text-3xl">Why this feels good</h2>
          <p className="text-sm text-hhp-inkMuted">Behavioral nudges that respect your day.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {psychology.map((item) => (
            <div
              key={item.title}
              className="flex h-full flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur"
            >
              <h3 className="text-base font-semibold text-hhp-ink">{item.title}</h3>
              <p className="text-sm leading-relaxed text-hhp-inkMuted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
