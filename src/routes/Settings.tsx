import { useAppState } from '@/state/AppStateContext.tsx';
import { type FormEvent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user, updateUser, updateSchedule, schedule } = useAppState();
  const [phone, setPhone] = useState(user?.phone || '');
  const [isScheduleActive, setIsScheduleActive] = useState(
    schedule?.isActive || true
  );
  const [status, setStatus] = useState('');

  // Sync local state if user/schedule context changes
  useEffect(() => {
    if (user) setPhone(user.phone || '');
  }, [user]);

  useEffect(() => {
    if (schedule) setIsScheduleActive(schedule.isActive);
  }, [schedule]);

  const handlePhoneSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('Updating...');
    try {
      // THIS IS THE FIX: Use `updateUser` instead of `updateUserPhone`
      await updateUser({ phone: phone });
      setStatus('Phone number updated!');
    } catch (err) {
      setStatus('Failed to update phone.');
    }
  };

  const handleScheduleToggle = async () => {
    if (!schedule) return;
    const newStatus = !isScheduleActive;
    setIsScheduleActive(newStatus); // Optimistic update
    setStatus('Updating schedule...');
    try {
      await updateSchedule({ isActive: newStatus });
      setStatus(
        newStatus ? 'Schedule re-activated!' : 'Schedule paused.'
      );
    } catch (err) {
      setIsScheduleActive(!newStatus); // Rollback
      setStatus('Failed to update schedule.');
    }
  };

  if (!user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl p-8 mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

      {/* Phone Number for SMS */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">SMS Notifications (Pro)</h2>
        {user.tier === 'free' && (
          <p className="text-sm text-gray-600 mb-4">
            Upgrade to Pro to receive reminders via SMS.
          </p>
        )}
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={user.tier === 'free'}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="+15551234567"
            />
          </div>
          <button
            type="submit"
            disabled={user.tier === 'free'}
            className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Phone
          </button>
        </form>
      </div>

      {/* Pause All Reminders */}
      {schedule && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Manage Schedule</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">
              {isScheduleActive ? 'Schedule is Active' : 'Schedule is Paused'}
            </span>
            <button
              onClick={handleScheduleToggle}
              className={`px-4 py-2 rounded-md font-semibold text-white shadow ${
                isScheduleActive
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isScheduleActive ? 'Pause All' : 'Re-activate'}
            </button>
          </div>
        </div>
      )}

      {status && (
        <p className="mt-4 text-sm text-center text-gray-600">{status}</p>
      )}
    </div>
  );
}