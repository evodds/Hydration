const plans = [
  {
    title: "Free",
    subtitle: "Start free, stay simple.",
    items: [
      "One schedule",
      "Local email-style reminders",
      "Basic dashboard",
    ],
    action: "Current plan",
  },
  {
    title: "Pro (coming soon)",
    subtitle: "More channels and tracking.",
    items: [
      "Multiple schedules",
      "Real email / SMS reminders",
      "Weekly summary and stats",
    ],
    action: "Join waitlist",
  },
];

export default function Plans() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Plans</h1>
        <p className="text-sm text-slate-600">
          Start free, upgrade if you want more control.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`rounded-2xl border p-5 shadow-card backdrop-blur transition duration-150 ease-out hover:-translate-y-1 hover:shadow-soft ${
              plan.title.includes("Pro")
                ? "border-white/50 bg-white/60"
                : "border-white/40 bg-white/70"
            }`}
          >
            <h2 className="text-lg font-semibold text-slate-900">{plan.title}</h2>
            {plan.subtitle && (
              <p className="text-sm text-slate-600">{plan.subtitle}</p>
            )}
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {plan.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  plan.title.includes("Pro")
                    ? "bg-hhp-accentSoft text-hhp-accentPrimary"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {plan.title.includes("Pro") ? "Coming soon" : "Current plan"}
              </span>
              <button
                className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-accentPrimary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  plan.title.includes("Pro")
                    ? "border border-hhp-accentPrimary bg-gradient-to-r from-hhp-accentPrimary to-hhp-accentPrimaryLight text-white hover:scale-105"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => {
                  if (plan.action === "Join waitlist") {
                    alert("Thanks! We’ll add Pro support later.");
                  }
                }}
              >
                {plan.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
