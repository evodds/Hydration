import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { AppStateProvider, useAppState } from "./state/AppStateContext";
import Landing from "./routes/Landing";
import Auth from "./routes/Auth";
import OnboardingTimezone from "./routes/OnboardingTimezone";
import CreateSchedule from "./routes/CreateSchedule";
import Dashboard from "./routes/Dashboard";
import Settings from "./routes/Settings";
import Plans from "./routes/Plans";
import History from "./routes/History";

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-primary">
      <div className="hhp-backdrop" aria-hidden />
      <div className="page-shell relative z-10">{children}</div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAll } = useAppState();
  const hideNav = ["/", "/auth", "/onboarding/timezone"].includes(
    location.pathname
  );

  return (
    <AppShell>
      {!hideNav && (
        <nav className="mb-8">
          <div className="flex items-center justify-between rounded-full border border-white/50 bg-white/70 px-5 py-3 shadow-card backdrop-blur">
            <Link to="/dashboard" className="flex items-center gap-2">
              <DropletLogo />
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Hydration Habit Ping
              </span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-slate-100">
              <Link
                className="text-slate-100 transition-colors hover:text-white"
                to="/settings"
              >
                Settings
              </Link>
              <Link
                className="text-slate-100 transition-colors hover:text-white"
                to="/plans"
              >
                Upgrade
              </Link>
              <button
                className="font-medium text-red-100 transition-colors hover:text-red-200"
                onClick={() => {
                  clearAll();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </nav>
      )}
      {children}
    </AppShell>
  );
}

function DropletLogo() {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-card"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-brand-primary"
      >
        <path
          d="M12.82 3.56a1 1 0 0 0-1.64 0C8.69 7 6 10.24 6 13.27 6 17.14 8.74 20 12 20s6-2.86 6-6.73c0-3.03-2.69-6.27-5.18-9.71Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="url(#grad)"
          fillOpacity="0.35"
        />
        <path
          d="M9.5 13.5 11 15l3.5-3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="grad" x1="6" y1="4" x2="18" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0fa3c8" stopOpacity="0.7" />
            <stop offset="1" stopColor="#37c2df" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding/timezone" element={<OnboardingTimezone />} />
      <Route
        path="/schedule/create"
        element={
          <RequireProfile>
            <CreateSchedule />
          </RequireProfile>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireProfile>
            <Dashboard />
          </RequireProfile>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireProfile>
            <Settings />
          </RequireProfile>
        }
      />
      <Route
        path="/plans"
        element={
          <RequireProfile>
            <Plans />
          </RequireProfile>
        }
      />
      <Route
        path="/history"
        element={
          <RequireProfile>
            <History />
          </RequireProfile>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { state } = useAppState();
  if (!state.user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AppStateProvider>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </AppStateProvider>
  );
}

export default App;
