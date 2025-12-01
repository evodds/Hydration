import React, { useState, useEffect } from 'react';
import { useAppState } from '../state/AppStateContext';
import { timezones } from '../utils/timezones';
import { Link } from 'react-router-dom';
import { updateUserPhone, sendTestSms } from '../services/api';

export default function Settings() {
  const { state, setUser, updateSchedule, clearAll } = useAppState();
  
  const [email, setEmail] = useState(state.user?.email || '');
  const [timezone, setTimezone] = useState(state.user?.timezone || '');
  const [isPaused, setIsPaused] = useState(state.schedule?.isActive === false);

  const [phone, setPhone] = useState(state.user?.phone || '');
  const [smsMessage, setSmsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setPhone(state.user?.phone || '');
  }, [state.user?.phone]);
  
  const isPro = state.user?.tier === 'pro';

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) return;
    setUser({ ...state.user, email });
    alert('Account email updated (locally).');
  };

  const handleSaveTimezone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) return;
    setUser({ ...state.user, timezone });
    alert('Timezone updated.');
  };

  const handleTogglePause = () => {
    if (!state.schedule) return;
    const newIsActive = !isPaused;
    updateSchedule({ isActive: newIsActive });
    setIsPaused(!newIsActive);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user || !isPro) return;
    
    setSmsMessage(null);
    setIsSending(true);
    
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+${phone}`;
    }

    try {
      const updatedUser = await updateUserPhone(state.user.id, formattedPhone);
      setUser(updatedUser);
      setPhone(updatedUser.phone || '');
      setSmsMessage({ type: 'success', text: 'Phone number saved!' });
    } catch (err: any) {
      setSmsMessage({ type: 'error', text: `Failed to save: ${err.message}` });
    }
    setIsSending(false);
  };

  const handleSendTest = async () => {
    if (!state.user || !isPro) return;

    setSmsMessage(null);
    setIsSending(true);
    try {
      const result = await sendTestSms(state.user.id);
      setSmsMessage({ type: 'success', text: result.message });
    } catch (err: any) {
      setSmsMessage({ type: 'error', text: `Failed to send: ${err.message}` });
    }
    setIsSending(false);
  };


  return (
    <div className="space-y-12">
      <div className="bg-white/60 shadow-soft rounded-2xl">
        <form onSubmit={handleSaveAccount} className="p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-hhp-ink">Account</h3>
          <p className="mt-2 text-sm text-hhp-ink/70">
            Update your account information.
          </p>
          <div className="mt-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hhp-primary focus:ring-hhp-primary sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-hhp-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hhp-primary-dark focus:outline-none focus:ring-2 focus:ring-hhp-primary focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/60 shadow-soft rounded-2xl">
        <form onSubmit={handleSaveTimezone} className="p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-hhp-ink">Timezone</h3>
          <p className="mt-2 text-sm text-hhp-ink/70">
            Set your local timezone for accurate reminders.
          </p>
          <div className="mt-6">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <div className="mt-1">
              <select
                id="timezone"
                name="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hhp-primary focus:ring-hhp-primary sm:text-sm"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-hhp-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hhp-primary-dark focus:outline-none focus:ring-2 focus:ring-hhp-primary focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/60 shadow-soft rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-hhp-ink">Reminders</h3>
        <p className="mt-2 text-sm text-hhp-ink/70">
          Pause or resume all reminders.
        </p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {isPaused ? 'Reminders are paused' : 'Reminders are active'}
          </span>
          <button
            type="button"
            onClick={handleTogglePause}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-hhp-primary focus:ring-offset-2 ${
              !isPaused ? 'bg-hhp-primary' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={!isPaused}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                !isPaused ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className={`bg-white/60 shadow-soft rounded-2xl ${!isPro ? 'opacity-60' : ''}`}>
        <form onSubmit={handleSavePhone} className="relative p-6 sm:p-8">
          {!isPro && (
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] rounded-2xl z-10 flex items-center justify-center">
              <Link
                to="/plans"
                className="rounded-xl bg-hhp-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-hhp-primary-dark"
              >
                Upgrade to Pro to Use SMS
              </Link>
            </div>
          )}

          <h3 className="text-xl font-semibold text-hhp-ink">
            Notifications
            {!isPro && <span className="ml-2 text-xs font-bold bg-hhp-accent text-white py-0.5 px-2 rounded-full">PRO</span>}
          </h3>
          <p className="mt-2 text-sm text-hhp-ink/70">
            Get reminders sent directly to your phone. (Pro only)
          </p>
          
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (with country code, e.g., +15551234567)
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  disabled={!isPro || isSending}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-hhp-primary focus:ring-hhp-primary sm:text-sm disabled:opacity-50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {smsMessage && (
            <div className={`mt-4 text-sm font-medium ${smsMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {smsMessage.text}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleSendTest}
              disabled={!isPro || !phone || isSending}
              className="rounded-xl bg-hhp-accent px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hhp-accent-dark focus:outline-none focus:ring-2 focus:ring-hhp-accent focus:ring-offset-2 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send Test'}
            </button>
            <button
              type="submit"
              disabled={!isPro || isSending}
              className="rounded-xl bg-hhp-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-hhp-primary-dark focus:outline-none focus:ring-2 focus:ring-hhp-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isSending ? 'Saving...' : 'Save Phone'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/60 shadow-soft rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-hhp-ink">Danger Zone</h3>
        <p className="mt-2 text-sm text-hhp-ink/70">
          Reset all your application data. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={clearAll}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
