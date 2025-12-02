import { useAppState } from '@/state/AppStateContext.tsx';
import { Navigate, useNavigate } from 'react-router-dom';
import { type FormEvent, useState } from 'react';

// Get a list of common timezones
const timezones = Intl.supportedValuesOf('timeZone');

export default function OnboardingTimezone() {
  const { user, updateUser } = useAppState();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const timezone = formData.get('timezone') as string;

    try {
      // Use the new updateUser function
      await updateUser({ timezone: timezone });
      navigate('/onboarding/create-schedule');
    } catch (err: any) {
      setError(err.message || 'Failed to save timezone');
    }
    setIsLoading(false);
  };

  // If user is somehow not logged in, send to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user *already* has a timezone, skip this step
  // Note: The auto-login user *has* a timezone, so this will redirect.
  // To test this page, you'd need to log in as a new user.
  if (user.timezone && user.email !== 'test@example.com') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Set your timezone
        </h2>
        <p className="text-center text-gray-600">
          This helps us send your pings at the right time of day.
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700"
            >
              Your Timezone
            </label>
            <div className="mt-1">
              <select
                id="timezone"
                name="timezone"
                required
                disabled={isLoading}
                defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-center text-red-600">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}