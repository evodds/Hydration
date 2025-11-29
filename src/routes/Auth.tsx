import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext";

function looksLikeEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function Auth() {
  const { state, setUser } = useAppState();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!looksLikeEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setUser({
      email,
      timezone: state.user?.timezone || "",
      createdAt: new Date().toISOString(),
      tier: state.user?.tier || "free",
    });
    navigate("/onboarding/timezone");
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/60 bg-white/85 px-6 py-7 shadow-soft backdrop-blur-sm sm:px-8 sm:py-9 fade-in-up">
        <div className="flex items-center gap-3 justify-center text-hhp-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hhp-primarySoft text-hhp-primary shadow-card">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.82 3.56a1 1 0 0 0-1.64 0C8.69 7 6 10.24 6 13.27 6 17.14 8.74 20 12 20s6-2.86 6-6.73c0-3.03-2.69-6.27-5.18-9.71Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.18" />
              <path d="M9.5 13.5 11 15l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="text-left">
            <div className="text-xs font-semibold uppercase tracking-wide text-hhp-inkMuted">Hydration Habit Ping</div>
            <div className="text-lg font-semibold text-hhp-ink">Let’s set up your pings</div>
          </div>
        </div>
        <p className="text-center text-sm text-hhp-inkMuted">
          We’ll use your email to keep your settings on this device. No spam. No passwords yet.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-sm">
            <label className="block font-semibold text-hhp-ink">Email</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-hhp-ink placeholder:text-slate-400 transition focus:border-hhp-primary focus:outline-none focus:ring-2 focus:ring-hhp-primary/30"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              required
            />
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-hhp-primary to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hhp-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Continue
          </button>
          <div className="space-y-2 text-center text-xs text-hhp-inkMuted">
            <p>You can change your email later in Settings.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
