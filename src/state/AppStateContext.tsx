import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, UserProfile, Schedule, ReminderEvent, AppTier } from '@/types/app-types.ts';
import {
  login as apiLogin,
  updateUser as apiUpdateUser,
  getSchedule as apiGetSchedule,
  createSchedule as apiCreateSchedule,
  updateSchedule as apiUpdateSchedule,
  getReminderEvents as apiGetReminderEvents,
  updateReminderEvent as apiUpdateReminderEvent
} from '@/services/api.ts';

// 1. Define the default (empty) state
const defaultState: AppState = {
  user: null,
  schedule: null,
  reminderEvents: [],
  isLoading: true,
  tier: 'free',
};

// 2. Create the context
export const AppStateContext = createContext<
  AppState & {
    login: (email: string) => Promise<void>;
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
    setSchedule: (schedule: Schedule | null) => Promise<void>;
    updateSchedule: (partial: Partial<Schedule>) => Promise<void>;
    logReminderAction: (eventId: string, status: 'drank' | 'skipped') => Promise<void>;
    setTier: (tier: AppTier) => Promise<void>;
    // We'll add more actions here later
  }
>({
  ...defaultState,
  login: async () => {},
  updateUser: async () => {},
  setSchedule: async () => {},
  updateSchedule: async () => {},
  logReminderAction: async () => {},
  setTier: async () => {},
});

// 3. Create the hook to use the context
export const useAppState = () => useContext(AppStateContext);

// 4. Create the Provider component
type AppStateProviderProps = {
  children: ReactNode;
};

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [state, setState] = useState<AppState>(defaultState);

  // --- MOCK AUTH ON LOAD (for dev) ---
  // In a real app, you'd check localStorage for a token
  // For now, let's just log in as a test user on load
  useEffect(() => {
    const autoLogin = async () => {
      await login('test@example.com');
    };
    autoLogin();
  }, []); // Empty dependency array means this runs once on mount

  // --- ACTIONS ---

  const login = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const user = await apiLogin(email);
      const schedule = await apiGetSchedule(user.id);
      const events = await apiGetReminderEvents(user.id);
      setState({ user, schedule, reminderEvents: events, isLoading: false, tier: user.tier });
    } catch (error) {
      console.error('Login failed:', error);
      setState((prev) => ({ ...prev, isLoading: false, user: null }));
    }
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!state.user) return;
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const updatedUser = await apiUpdateUser(state.user.id, updates);
        setState((prev) => ({ ...prev, user: updatedUser, tier: updatedUser.tier, isLoading: false }));
      } catch (error) {
        console.error('Failed to update user:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.user]
  );

  const setSchedule = useCallback(
    async (schedule: Schedule | null) => {
      if (!state.user) return;
      setState((prev) => ({ ...prev, isLoading: true }));

      // For this prototype, we'll just support creating a new schedule
      // A real app would handle deleting too
      if (schedule) {
        try {
          const newSchedule = await apiCreateSchedule(state.user.id, schedule as any);
          const newEvents = await apiGetReminderEvents(state.user.id);
          setState((prev) => ({ ...prev, schedule: newSchedule, reminderEvents: newEvents, isLoading: false }));
        } catch (error) {
          console.error('Failed to create schedule:', error);
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        // Logic to delete schedule would go here
        setState((prev) => ({ ...prev, schedule: null, reminderEvents: [], isLoading: false }));
      }
    },
    [state.user]
  );

  const updateSchedule = useCallback(
    async (partial: Partial<Schedule>) => {
      if (!state.user || !state.schedule) return;
      setState((prev) => ({ ...prev, isLoading: true }));
      try {
        const updatedSchedule = await apiUpdateSchedule(state.user.id, state.schedule.id, partial);
        // Assume events might need refreshing if schedule changes
        const newEvents = await apiGetReminderEvents(state.user.id);
        setState((prev) => ({ ...prev, schedule: updatedSchedule, reminderEvents: newEvents, isLoading: false }));
      } catch (error) {
        console.error('Failed to update schedule:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.user, state.schedule]
  );

  const logReminderAction = useCallback(
    async (eventId: string, status: 'drank' | 'skipped') => {
      if (!state.user) return;
      // Optimistic UI update
      const originalEvents = state.reminderEvents;
      const optimisticEvents = originalEvents.map((e) =>
        e.id === eventId ? { ...e, status: status } : e
      );
      setState((prev) => ({ ...prev, reminderEvents: optimisticEvents }));

      try {
        // Send to server
        const updatedEvent = await apiUpdateReminderEvent(state.user.id, eventId, status);
        // True-up state with server response
        setState((prev) => ({
          ...prev,
          reminderEvents: prev.reminderEvents.map((e) => (e.id === eventId ? updatedEvent : e)),
        }));
      } catch (error) {
        console.error('Failed to log action:', error);
        // Rollback on error
        setState((prev) => ({ ...prev, reminderEvents: originalEvents }));
      }
    },
    [state.user, state.reminderEvents]
  );

  const setTier = useCallback(
    async (tier: AppTier) => {
      if (!state.user) return;
      await updateUser({ tier });
    },
    [state.user, updateUser]
  );

  const value = {
    ...state,
    login,
    updateUser,
    setSchedule,
    updateSchedule,
    logReminderAction,
    setTier,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};
