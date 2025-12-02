import { Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AppStateProvider, useAppState } from '@/state/AppStateContext.tsx';
import Landing from '@/routes/Landing.tsx';
import Auth from '@/routes/Auth.tsx';
import OnboardingTimezone from '@/routes/OnboardingTimezone.tsx';
import CreateSchedule from '@/routes/CreateSchedule.tsx';
import Dashboard from '@/routes/Dashboard.tsx';
import History from '@/routes/History.tsx';
import Plans from '@/routes/Plans.tsx';
import Settings from '@/routes/Settings.tsx';
import ProtectedRoute from '@/components/ProtectedRoute.tsx';
import { ReactComponent as Logo } from '@/assets/logo.svg';

// --- Main App Layout (for logged-in users) ---
function AppLayout() {
  const { user } = useAppState();
  const location = useLocation();

  // A simple function to determine if a nav link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="flex flex-col w-64 p-6 bg-white shadow-lg">
        <div className="flex items-center space-x-2 mb-10">
          <Logo className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">Hydration</span>
        </div>
        <div className="space-y-2">
          <Link
            to="/"
            className={`px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-medium ${
              isActive('/')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Dashboard</span>
          </Link>
          <Link
            to="/history"
            className={`px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-medium ${
              isActive('/history')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>History</span>
          </Link>
          <Link
            to="/plans"
            className={`px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-medium ${
              isActive('/plans')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Plans</span>
          </Link>
          <Link
            to="/settings"
            className={`px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-medium ${
              isActive('/settings')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Settings</span>
          </Link>
        </div>
        <div className="mt-auto text-sm text-gray-500">
          <p>Logged in as</p>
          <p className="font-medium text-gray-700 truncate">{user?.email}</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

// --- Main App Component (handles routing) ---
function AppRoutes() {
  const { user, isLoading } = useAppState();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding/timezone" element={<OnboardingTimezone />} />
      <Route path="/onboarding/create-schedule" element={<CreateSchedule />} />

      {/* --- Protected Routes --- */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="history" element={<History />} />
        <Route path="plans" element={<Plans />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* --- Catch-all Redirect --- */}
      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/landing'} replace />}
      />
    </Routes>
  );
}

// --- Entry Point ---
export default function App() {
  return (
    <AppStateProvider>
      <AppRoutes />
    </AppStateProvider>
  );
}
