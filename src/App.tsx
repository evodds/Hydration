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
    <div className="min-h-screen bg-brand-subtle text-primary">
      <div className="page-shell">{children}</div>
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
        <nav className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-3 shadow-card backdrop-blur">
          <Link
            to="/dashboard"
            className="text-sm font-semibold tracking-tight text-slate-900"
          >
            Hydration Habit Ping
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Link className="transition-colors hover:text-slate-900" to="/settings">
              Settings
            </Link>
            <Link className="transition-colors hover:text-slate-900" to="/plans">
              Upgrade
            </Link>
            <button
              className="font-medium text-red-500 transition-colors hover:text-red-600"
              onClick={() => {
                clearAll();
                navigate("/");
              }}
            >
              Log out
            </button>
          </div>
        </nav>
      )}
      {children}
    </AppShell>
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
