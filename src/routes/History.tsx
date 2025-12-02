import { useAppState } from '@/state/AppStateContext.tsx';
import { getPingDate } from '@/utils/time.ts';

export default function History() {
  const { user, reminderEvents } = useAppState();

  if (!user) return null; // Should be handled by ProtectedRoute

  // This is a simple mock for the history chart.
  // A real implementation would group events by day.
  const todayEvents = reminderEvents.filter(
    (e) => getPingDate(e.pingTime, user.timezone).toDateString() === new Date().toDateString()
  );
  
  const completion = {
    'Today': todayEvents.filter(e => e.status === 'drank').length / todayEvents.length || 0,
    'Yesterday': 0.8,
    '2 days ago': 1.0,
    '3 days ago': 0.7,
    '4 days ago': 0.9,
    '5 days ago': 0.5,
    '6 days ago': 1.0,
  };
  
  const stats = [
    { name: 'Today', value: completion['Today'] },
    { name: 'Yesterday', value: completion['Yesterday'] },
    { name: 'Mon', value: completion['2 days ago'] }, // Mocking day names
    { name: 'Sun', value: completion['3 days ago'] },
    { name: 'Sat', value: completion['4 days ago'] },
    { name: 'Fri', value: completion['5 days ago'] },
    { name: 'Thu', value: completion['6 days ago'] },
  ].reverse();

  return (
    <div className="max-w-2xl p-8 mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">History</h1>

      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Last 7 Days</h2>
        <div className="space-y-3">
          {stats.map((day) => (
            <div key={day.name} className="flex items-center">
              <span className="w-20 text-sm font-medium text-gray-600">
                {day.name}
              </span>
              <div className="flex-1 h-6 bg-gray-200 rounded-full">
                <div
                  className="h-6 bg-blue-500 rounded-full"
                  style={{ width: `${day.value * 100}%` }}
                />
              </div>
              <span className="w-12 ml-3 text-sm font-medium text-right text-gray-600">
                {Math.round(day.value * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
