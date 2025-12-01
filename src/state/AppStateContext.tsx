import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, UserProfile, Schedule, AppTier } from '../types/schedule';
import {
  login as apiLogin,
  updateUser as apiUpdateUser,
  fetchSchedule as apiFetchSchedule,
  saveSchedule as apiSaveSchedule,
  updateSchedule as apiUpdateSchedule,
  fetchReminderEvents as apiFetchReminderEvents,
  logReminderAction as apiLogReminderAction,
} from '../services/api';

// 1. Define the default (empty) state
const defaultState: AppState = {
  user: null,
  schedule: null,
  reminderEvents: [],
  isLoading: true, // Add a new loading state
  tier: 'free',
};

// 2. Update the Context Value interface
interface AppStateContextValue {
  state: AppState;
  // Auth
  login: (email: string) => Promise<void>;
  logout: () => void;
  // User
  setUser: (user: UserProfile | null) => void;
  setTier: (tier: AppTier) => Promise<void>;
  // Schedule
  setSchedule: (schedule: Schedule | null) => Promise<void>;
  updateSchedule: (partial: Partial<Schedule>) => Promise<void>;
  // Events
  logReminderAction: (eventId: string, status: 'drank' | 'skipped') => Promise<void>;
  clearHistory: () => void;
  clearAll: () => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

// 3. Rewrite the Provider
export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(defaultState);

  const login = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const user = await apiLogin(email);
      const schedule = await apiFetchSchedule(user.id);
      const events = await apiFetchReminderEvents(user.id);
      setState({
        user,
        schedule,
        reminderEvents: events || [],
        isLoading: false,
        tier: user.tier,
      });
    } catch (error) {
      console.error('Failed to log in:', error);
      setState({ ...defaultState, isLoading: false });
    }
  }, []);

  const logout = useCallback(() => {
    setState({ ...defaultState, isLoading: false });
  }, []);

  const setUser = useCallback((user: UserProfile | null) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const setTier = useCallback(async (tier: AppTier) => {
    if (!state.user) return;
    const updatedUser = await apiUpdateUser(state.user.id, { tier });
    setState((prev) => ({ ...prev, user: updatedUser, tier }));
  }, [state.user]);

  const setSchedule = useCallback(async (schedule: Schedule | null) => {
    if (!state.user) return;
    if (schedule) {
      const newSchedule = await apiSaveSchedule(state.user.id, schedule as any);
      const newEvents = await apiFetchReminderEvents(state.user.id);
      setState((prev) => ({ ...prev, schedule: newSchedule, reminderEvents: newEvents }));
    } else {
      setState((prev) => ({ ...prev, schedule: null, reminderEvents: [] }));
    }
  }, [state.user]);

  const updateSchedule = useCallback(async (partial: Partial<Schedule>) => {
    if (!state.user || !state.schedule) return;
    const updatedSchedule = await apiUpdateSchedule(state.user.id, state.schedule.id, partial);
    const newEvents = await apiFetchReminderEvents(state.user.id);
    setState((prev) => ({ ...prev, schedule: updatedSchedule, reminderEvents: newEvents }));
  }, [state.user, state.schedule]);

  const logReminderAction = useCallback(async (eventId: string, status: 'drank' | 'skipped') => {
    if (!state.user) return;
    const updatedEvent = await apiLogReminderAction(state.user.id, eventId, status);
    setState((prev) => ({
      ...prev,
      reminderEvents: prev.reminderEvents.map((e) => (e.id === eventId ? updatedEvent : e)),
      user:
        status === 'drank' && prev.user
          ? {
              ...prev.user,
              currentStreak: prev.user.currentStreak + 1,
              longestStreak: Math.max(prev.user.longestStreak, prev.user.currentStreak + 1),
            }
          : prev.user,
    }));
  }, [state.user]);

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, reminderEvents: [] }));
  }, []);

  const clearAll = useCallback(() => {
    setState({ ...defaultState, isLoading: false });
  }, []);

  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const value = {
    state,
    login,
    logout,
    setUser,
    setTier,
    setSchedule,
    updateSchedule,
    logReminderAction,
    clearHistory,
    clearAll,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};


