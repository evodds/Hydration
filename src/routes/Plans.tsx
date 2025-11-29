import { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";

const plans = [
  {
    title: "Free",
    subtitle: "Start free, stay simple.",
    items: ["One schedule", "Local reminders stored on your device", "Basic dashboard"],
    action: "Current plan",
    tier: "free" as const,
  },
  {
    title: "Pro (coming soon)",
    subtitle: "More channels and tracking.",
    items: ["Multiple schedules", "Email / SMS reminders", "Deeper analytics & exports"],
    action: "Join waitlist",
    tier: "pro" as const,
  },
];

export default function Plans() {
  const { state, setTier } = useAppState();
  const userTier = state.user?.tier ?? "free";
  const planCards = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        isCurrent: userTier === plan.tier,
      })),
    [userTier]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Plans</h1>
        <p className="text-sm text-slate-600">Start free, upgrade if you want more control.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {planCards.map((plan) => (
          <div
            key={plan.title}
            className={`rounded-2xl border p-5 shadow-card backdrop-blur transition duration-150 ease-out hover:-translate-y-1 hover:shadow-soft ${
              plan.tier === "pro" ? "border-white/60 bg-white/80" : "border-white/40 bg-white/70"
            }`}
          >
            <h2 className="text-lg font-semibold text-slate-900">{plan.title}</h2>
            {plan.subtitle && <p className="text-sm text-slate-600">{plan.subtitle}</p>}
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {plan.items.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  plan.tier === "pro" ? "bg-hhp-accentSoft text-hhp-accent" : "bg-slate-100 text-slate-700"
                }`}
              >
                {plan.tier === "pro" ? "Coming soon" : "Included"}
              </span>
              <button
                className={`rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  plan.tier === "pro"
                    ? "border border-hhp-primary bg-gradient-to-r from-hhp-primary to-cyan-400 text-white hover:scale-105"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => {
                  if (plan.tier === "pro") {
                    setTier("pro");
                    alert("You’re on the Pro waitlist. We’ll email you when it’s ready.");
                  }
                }}
                disabled={plan.isCurrent}
              >
                {plan.isCurrent ? "Current plan" : plan.action}
              </button>
            </div>
            {plan.tier === "pro" && (
              <p className="mt-2 text-xs text-slate-500">
                We'll flag Pro-only features in the UI; upgrading is a local preview only.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
