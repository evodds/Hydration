import React from 'react';
import { Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAppState } from './state/AppStateContext';
import Landing from './routes/Landing';
import Auth from './routes/Auth';
import OnboardingTimezone from './routes/OnboardingTimezone';
import CreateSchedule from './routes/CreateSchedule';
import Dashboard from './routes/Dashboard';
import Settings from './routes/Settings';
import Plans from './routes/Plans';
import History from './routes/History';

function AppLayout() {
  const { logout } = useAppState(); // Get logout
  
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between py-6">
        <Link to="/dashboard" className="text-xl font-bold text-hhp-ink">
          Hydration Habit Ping
        </Link>
        <nav className="flex items-center space-x-4 text-sm font-medium">
          <Link
            to="/history"
            className="rounded-md px-3 py-2 text-hhp-ink/70 hover:text-hhp-ink focus:outline-none focus:ring-2 focus:ring-hhp-primary"
          >
            History
          </Link>
          <Link
            to="/settings"
            className="rounded-md px-3 py-2 text-hhp-ink/70 hover:text-hhp-ink focus:outline-none focus:ring-2 focus:ring-hhp-primary"
          >
            Settings
          </Link>
          <Link
            to="/plans"
            className="rounded-md px-3 py-2 text-hhp-ink/70 hover:text-hhp-ink focus:outline-none focus:ring-2 focus:ring-hhp-primary"
          >
            Plans
          </Link>
          <button
            onClick={logout}
            className="rounded-md px-3 py-2 text-hhp-ink/70 hover:text-hhp-ink focus:outline-none focus:ring-2 focus:ring-hhp-primary"
          >
            Log out
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function RequireProfile({ children }: { children: React.ReactElement }) {
  const { state } = useAppState();
  const location = useLocation();

  if (state.isLoading) {
    // Show a loading screen while we check for a user
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl font-medium text-hhp-ink/70">Loading...</div>
      </div>
    );
  }

  if (!state.user) {
    // Redirect them to the /auth page, but save the current location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <div className="app-shell min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route
          element={
            <RequireProfile>
              <AppLayout />
            </RequireProfile>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/history" element={<History />} />
        </Route>
        
        {/* Onboarding has its own layout */}
         <Route
          path="/onboarding/timezone"
          element={
            <RequireProfile>
              <OnboardingTimezone />
            </RequireProfile>
          }
        />
         <Route
          path="/schedule/create"
          element={
            <RequireProfile>
              <CreateSchedule />
            </RequireProfile>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
