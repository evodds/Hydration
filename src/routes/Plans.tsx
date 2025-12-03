import { useState } from 'react';
import { useAppState } from '@/state/AppStateContext.tsx';
import { createCheckoutSession } from '@/services/api.ts';

const CheckIcon = (props: React.ComponentProps<'svg'>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" {...props}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

// REPLACE WITH YOUR ACTUAL STRIPE PRICE ID
const STRIPE_PRICE_ID = 'price_1SYfBcAAaoKTpBVmXlcrEwbt'; 

export default function Plans() {
  const { user } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPro = user?.tier === 'pro';

  const handleUpgrade = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(user.id, STRIPE_PRICE_ID);
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initiate upgrade.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl p-8 mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Plans</h1>
      {error && <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-lg">{error}</div>}
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800">{isPro ? 'You are on the Pro Plan' : 'Upgrade to Pro'}</h2>
        <p className="mt-4 text-gray-600">{isPro ? 'Thanks for being a Pro user! You have access to all features.' : 'Get SMS reminders, multiple schedules, and more.'}</p>
        <ul className="mt-6 space-y-3 text-gray-700">
          <li className="flex items-center space-x-3"><CheckIcon className="text-green-500" /><span>Browser-based reminders</span></li>
          <li className="flex items-center space-x-3"><CheckIcon className="text-green-500" /><span>Basic hydration tracking</span></li>
          <li className="flex items-center space-x-3"><CheckIcon className={isPro ? 'text-green-500' : 'text-gray-400'} /><span className={!isPro ? 'text-gray-400' : ''}>SMS notifications</span></li>
          <li className="flex items-center space-x-3"><CheckIcon className={isPro ? 'text-green-500' : 'text-gray-400'} /><span className={!isPro ? 'text-gray-400' : ''}>Multiple schedules</span></li>
        </ul>
        {!isPro && <button onClick={handleUpgrade} disabled={isLoading} className="w-full px-6 py-3 mt-8 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">{isLoading ? 'Redirecting to Stripe...' : 'Upgrade Now ($5/mo)'}</button>}
      </div>
    </div>
  );
}
