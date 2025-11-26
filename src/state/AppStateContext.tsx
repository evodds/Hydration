import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppState, Schedule, UserProfile } from "../types/schedule";

const STORAGE_KEY = "hydration-habit-ping-state";

interface AppStateContextValue {
  state: AppState;
  setUser: (user: UserProfile | null) => void;
  setSchedule: (schedule: Schedule | null) => void;
  updateSchedule: (updates: Partial<Schedule>) => void;
  clearAll: () => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
);

const readInitialState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, schedule: null };
    const parsed = JSON.parse(raw) as AppState;
    return {
      user: parsed.user ?? null,
      schedule: parsed.schedule ?? null,
    };
  } catch (error) {
    console.warn("Failed to parse stored state", error);
    return { user: null, schedule: null };
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
    setState((prev) => ({ ...prev, user }));
  }, []);

  const setSchedule = useCallback((schedule: Schedule | null) => {
    setState((prev) => ({ ...prev, schedule }));
  }, []);

  const updateSchedule = useCallback((updates: Partial<Schedule>) => {
    setState((prev) => {
      if (!prev.schedule) return prev;
      return { ...prev, schedule: { ...prev.schedule, ...updates } };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState({ user: null, schedule: null });
  }, []);

  const value = useMemo(
    () => ({ state, setUser, setSchedule, updateSchedule, clearAll }),
    [state, setUser, setSchedule, updateSchedule, clearAll]
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
