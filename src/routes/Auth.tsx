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
  const [password, setPassword] = useState("");
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
    });
    navigate("/onboarding/timezone");
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/40 bg-white/70 px-6 py-7 shadow-soft backdrop-blur sm:px-8 sm:py-8">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-primarySoft px-3 py-1 text-[11px] font-medium text-brand-primary">
            Step 1 of 3 • Sign in
          </div>
          <div className="text-lg font-semibold text-slate-900">Hydration Habit Ping</div>
          <div className="mt-1 flex justify-center gap-6 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">Log in</span>
            <span>Sign up</span>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-sm">
            <label className="block font-medium text-slate-900">Email</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
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
          <div className="space-y-1 text-sm">
            <label className="block font-medium text-slate-900">Password (optional)</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition duration-150 ease-out hover:bg-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Continue
          </button>
          <div className="space-y-2 text-center text-xs text-slate-500">
            <p>We only use your email to remember your schedule on this device.</p>
            <button type="button" className="text-sm text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline">
              Forgot password
            </button>
          </div>
        </form>
      </div>
      <div className="fixed bottom-6 text-center text-xs text-slate-500">
        By continuing, you agree to the Terms & Privacy.
      </div>
    </div>
  );
}
