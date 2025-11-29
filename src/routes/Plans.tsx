import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";
import { createCheckoutSession } from "../services/api";

// TODO: Replace with your actual Stripe Price ID from the Stripe dashboard.
const STRIPE_PRO_PRICE_ID = "price_1SYfBcAAaoKtpBVmXIcrEwbt";

export default function Plans() {
  const { state } = useAppState();
  const [message, setMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("success")) {
      setMessage("Payment successful! Your account is now Pro.");
    }
    if (query.get("cancel")) {
      setMessage("Payment canceled. Your plan was not changed.");
    }
  }, [location.search]);

  const handleUpgradeClick = async () => {
    if (STRIPE_PRO_PRICE_ID === "YOUR_PRICE_ID_HERE") {
      setMessage("Stripe has not been configured by the developer yet.");
      return;
    }
    if (!state.user) {
      setMessage("Please log in to upgrade.");
      return;
    }
    if (state.user.tier === "pro") {
      setMessage("You are already on the Pro plan.");
      return;
    }

    setIsRedirecting(true);
    setMessage("Redirecting to secure checkout...");

    try {
      const { url } = await createCheckoutSession(state.user.id, STRIPE_PRO_PRICE_ID);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setMessage("Failed to create checkout session. Please try again.");
      setIsRedirecting(false);
    }
  };

  const isPro = state.user?.tier === "pro";

  return (
    <div className="mx-auto max-w-4xl py-12">
      <h2 className="text-center text-3xl font-bold tracking-tight text-hhp-ink sm:text-4xl">
        Plans
      </h2>
      <p className="mt-4 text-center text-lg text-hhp-ink/70">Choose the plan that's right for you.</p>

      {message && (
        <div
          className={`mt-6 rounded-lg p-4 ${
            message.includes("successful")
              ? "bg-emerald-50 text-emerald-700"
              : message.includes("Stripe")
                ? "bg-red-50 text-red-700"
                : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div
          className={`rounded-3xl border p-8 shadow-soft ${
            isPro ? "border-gray-200" : "border-hhp-primary ring-2 ring-hhp-primary"
          }`}
        >
          <h3 className="text-xl font-semibold text-hhp-ink">Free</h3>
          <p className="mt-2 text-hhp-ink/70">For getting started.</p>
          <ul className="mt-6 space-y-3 text-hhp-ink/90">
            <li className="flex items-center gap-2">✅ One schedule</li>
            <li className="flex items-center gap-2">✅ Local reminders</li>
            <li className="flex items-center gap-2">✅ 7-day history</li>
          </ul>
          <button
            disabled={!isPro}
            className="mt-8 w-full rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 opacity-70 cursor-not-allowed"
          >
            {isPro ? "Switch to Free (Coming Soon)" : "Your Current Plan"}
          </button>
        </div>

        <div
          className={`rounded-3xl border p-8 shadow-soft ${
            isPro ? "border-hhp-primary ring-2 ring-hhp-primary" : "border-gray-200"
          }`}
        >
          <h3 className="text-xl font-semibold text-hhp-ink">Pro</h3>
          <p className="mt-2 text-hhp-ink/70">For advanced habits.</p>
          <ul className="mt-6 space-y-3 text-hhp-ink/90">
            <li className="flex items-center gap-2">✅ Multiple schedules</li>
            <li className="flex items-center gap-2">✅ SMS reminders (Coming Soon)</li>
            <li className="flex items-center gap-2">✅ Unlimited history</li>
          </ul>
          <button
            onClick={handleUpgradeClick}
            disabled={isPro || isRedirecting}
            className={`mt-8 w-full rounded-xl px-4 py-2 text-sm font-medium ${
              isPro
                ? "bg-gray-100 text-gray-700 opacity-70 cursor-not-allowed"
                : "bg-hhp-primary text-white hover:bg-hhp-primary-dark"
            } ${isRedirecting ? "opacity-50" : ""}`}
          >
            {isRedirecting ? "Redirecting..." : isPro ? "Your Current Plan" : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}
