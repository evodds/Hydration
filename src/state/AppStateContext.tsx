import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppState,
  AppTier,
  ReminderLogEntry,
  ReminderEvent,
  Schedule,
  UserProfile,
} from "../types/schedule";
import { createId } from "../utils/id";
import { generateReminderEventsForSchedule } from "../utils/time";

const STORAGE_KEY = "hydration-habit-ping-state";

interface AppStateContextValue {
  state: AppState;
  setUser: (user: UserProfile | null) => void;
  setSchedule: (schedule: Schedule | null) => void;
  updateSchedule: (schedule: Schedule) => void;
  setTier: (tier: AppTier) => void;
  logReminderResponse: (
    reminderId: string,
    response: "drank" | "skipped"
  ) => void;
  clearHistory: () => void;
  clearAll: () => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
);

const defaultState: AppState = {
  user: null,
  schedule: null,
  tier: "free",
  reminderEvents: [],
  history: [],
};

const readInitialState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as AppState;
    return {
      user: parsed.user ?? null,
      schedule: parsed.schedule ?? null,
      tier: parsed.tier ?? "free",
      reminderEvents: parsed.reminderEvents ?? [],
      history: parsed.history ?? [],
    };
  } catch (error) {
    console.warn("Failed to parse stored state", error);
    return defaultState;
  }
};

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => readInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to persist state", error);
    }
  }, [state]);

  const setUser = useCallback((user: UserProfile | null) => {
    setState((prev) => {
      if (!user) return { ...prev, user: null };
      const now = new Date().toISOString();
      return {
        ...prev,
        user: {
          ...user,
          createdAt: user.createdAt ?? now,
        },
      };
    });
  }, []);

  const setSchedule = useCallback((schedule: Schedule | null) => {
    setState((prev) => {
      if (!schedule) {
        return { ...prev, schedule: null, reminderEvents: [] };
      }
      const nowIso = new Date().toISOString();
      const enriched: Schedule = {
        ...schedule,
        id: schedule.id || createId("schedule"),
        createdAt: schedule.createdAt || nowIso,
        updatedAt: nowIso,
      };
      const tz = prev.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const reminderEvents = generateReminderEventsForSchedule(
        enriched,
        tz,
        7
      );
      return { ...prev, schedule: enriched, reminderEvents };
    });
  }, []);

  const updateSchedule = useCallback((nextSchedule: Schedule) => {
    setState((prev) => {
      const nowIso = new Date().toISOString();
      const merged: Schedule = {
        ...(prev.schedule ?? nextSchedule),
        ...nextSchedule,
        id: nextSchedule.id || prev.schedule?.id || createId("schedule"),
        createdAt: nextSchedule.createdAt || prev.schedule?.createdAt || nowIso,
        updatedAt: nowIso,
      };
      const tz = prev.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const reminderEvents = generateReminderEventsForSchedule(
        merged,
        tz,
        7
      );
      return { ...prev, schedule: merged, reminderEvents };
    });
  }, []);

  const setTier = useCallback((tier: AppTier) => {
    setState((prev) => ({ ...prev, tier }));
  }, []);

  const logReminderResponse = useCallback(
    (reminderId: string, response: "drank" | "skipped") => {
      setState((prev) => {
        const updatedEvents: ReminderEvent[] = prev.reminderEvents.map((event) =>
          event.id === reminderId ? { ...event, status: response } : event
        );
        const newEntry: ReminderLogEntry = {
          id: createId("log"),
          reminderEventId: reminderId,
          occurredAt: new Date().toISOString(),
          response,
        };
        return {
          ...prev,
          reminderEvents: updatedEvents,
          history: [...prev.history, newEntry],
        };
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
      reminderEvents: prev.reminderEvents.map((ev) => ({
        ...ev,
        status: ev.status === "drank" || ev.status === "skipped" ? "scheduled" : ev.status,
      })),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      setUser,
      setSchedule,
      updateSchedule,
      setTier,
      logReminderResponse,
      clearHistory,
      clearAll,
    }),
    [state, setUser, setSchedule, updateSchedule, setTier, logReminderResponse, clearHistory, clearAll]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}

export { AppStateContext };
