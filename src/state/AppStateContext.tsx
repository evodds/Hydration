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
  ReminderEvent,
  Schedule,
  UserProfile,
} from "../types/schedule";
import { createId } from "../utils/id";
import {
  formatDateKey,
  formatTimeKey,
  generateReminderEventsForSchedule,
  formatLocalTimeLabel,
} from "../utils/time";

const STORAGE_KEY = "hydration-habit-ping-state";

interface AppStateContextValue {
  state: AppState;
  setUser: (user: UserProfile | null) => void;
  setSchedule: (schedule: Schedule | null) => void;
  updateSchedule: (partial: Partial<Schedule>) => void;
  setTier: (tier: AppTier) => void;
  logReminderAction: (eventId: string, status: "drank" | "skipped") => void;
  clearHistory: () => void;
  clearAll: () => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined
);

const defaultState: AppState = {
  user: null,
  schedule: null,
  reminderEvents: [],
};

const normalizeUser = (storedUser: Partial<UserProfile> | null, storedTier?: AppTier): UserProfile | null => {
  if (!storedUser) return null;
  const now = new Date().toISOString();
  return {
    email: storedUser.email || "",
    timezone: storedUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: storedUser.createdAt || now,
    tier: storedUser.tier || storedTier || "free",
  };
};

const normalizeEvent = (
  raw: any,
  fallbackTimezone: string,
  fallbackScheduleName: string
): ReminderEvent => {
  const tz = raw.timezone || fallbackTimezone;
  const scheduledAt: string | undefined = raw.scheduledAt;
  const date = raw.date || (scheduledAt ? formatDateKey(new Date(scheduledAt), tz) : "");
  const time =
    raw.time ||
    (scheduledAt ? formatTimeKey(new Date(scheduledAt), tz) : "") ||
    "";
  const localTimeLabel =
    raw.localTimeLabel ||
    (scheduledAt ? formatLocalTimeLabel(new Date(scheduledAt), tz) : time);
  return {
    id: raw.id || createId("reminder"),
    scheduleId: raw.scheduleId || "",
    scheduleName: raw.scheduleName || fallbackScheduleName,
    timezone: tz,
    date,
    time,
    scheduledAt: scheduledAt || new Date().toISOString(),
    localTimeLabel,
    status: raw.status === "drank" || raw.status === "skipped" ? raw.status : "scheduled",
    createdAt: raw.createdAt || scheduledAt || new Date().toISOString(),
    updatedAt: raw.updatedAt,
  };
};

const readInitialState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    const user = normalizeUser(parsed.user ?? null, parsed.tier);
    const schedule = parsed.schedule ?? null;
    const tz = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const eventsRaw: any[] = parsed.reminderEvents || parsed.events || parsed.history || [];
    const reminderEvents = (eventsRaw as any[]).map((ev) => normalizeEvent(ev, tz, schedule?.name || ""));

    return {
      user,
      schedule,
      reminderEvents,
    } as AppState;
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
          email: user.email,
          timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          createdAt: user.createdAt || prev.user?.createdAt || now,
          tier: user.tier || prev.user?.tier || "free",
        },
      };
    });
  }, []);

  const reconcileEvents = useCallback(
    (schedule: Schedule, timezone: string, existingEvents: ReminderEvent[]) => {
      const todayKey = formatDateKey(new Date(), timezone);
      const existingMap = new Map(existingEvents.map((ev) => [`${ev.date}-${ev.time}`, ev] as const));
      const upcoming = generateReminderEventsForSchedule(schedule, timezone, 7);
      const mergedUpcoming = upcoming.map((ev) => {
        const existing = existingMap.get(`${ev.date}-${ev.time}`);
        if (!existing) return ev;
        return {
          ...ev,
          id: existing.id,
          status: existing.status,
          createdAt: existing.createdAt || ev.createdAt,
          updatedAt: existing.updatedAt,
          scheduledAt: existing.scheduledAt || ev.scheduledAt,
          localTimeLabel: existing.localTimeLabel || ev.localTimeLabel,
        };
      });

      const pastEvents = existingEvents
        .filter((ev) => ev.date && ev.date < todayKey)
        .map((ev) => ({ ...ev, scheduleName: schedule.name, timezone }));

      return [...pastEvents, ...mergedUpcoming];
    },
    []
  );

  const setSchedule = useCallback(
    (schedule: Schedule | null) => {
      setState((prev) => {
        if (!schedule) {
          return { ...prev, schedule: null, reminderEvents: [] };
        }
        const nowIso = new Date().toISOString();
        const enriched: Schedule = {
          ...schedule,
          id: schedule.id || prev.schedule?.id || createId("schedule"),
          createdAt: schedule.createdAt || prev.schedule?.createdAt || nowIso,
          updatedAt: nowIso,
        };
        const tz = prev.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const reminderEvents = reconcileEvents(enriched, tz, prev.reminderEvents);
        return { ...prev, schedule: enriched, reminderEvents };
      });
    },
    [reconcileEvents]
  );

  const updateSchedule = useCallback(
    (partial: Partial<Schedule>) => {
      setState((prev) => {
        if (!prev.schedule) return prev;
        const nowIso = new Date().toISOString();
        const mergedSchedule: Schedule = {
          ...prev.schedule,
          ...partial,
          id: prev.schedule.id || createId("schedule"),
          createdAt: prev.schedule.createdAt || nowIso,
          updatedAt: nowIso,
        };
        const tz = prev.user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const reminderEvents = reconcileEvents(mergedSchedule, tz, prev.reminderEvents);
        return { ...prev, schedule: mergedSchedule, reminderEvents };
      });
    },
    [reconcileEvents]
  );

  const setTier = useCallback((tier: AppTier) => {
    setState((prev) => {
      const now = new Date().toISOString();
      if (!prev.user) {
        return {
          ...prev,
          user: {
            email: "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            createdAt: now,
            tier,
          },
        };
      }
      return { ...prev, user: { ...prev.user, tier } };
    });
  }, []);

  const logReminderAction = useCallback((eventId: string, status: "drank" | "skipped") => {
    setState((prev) => {
      const updatedEvents = prev.reminderEvents.map((event) =>
        event.id === eventId ? { ...event, status, updatedAt: new Date().toISOString() } : event
      );
      return { ...prev, reminderEvents: updatedEvents };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, reminderEvents: [] }));
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
      logReminderAction,
      clearHistory,
      clearAll,
    }),
    [state, setUser, setSchedule, updateSchedule, setTier, logReminderAction, clearHistory, clearAll]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}

export { AppStateContext };
