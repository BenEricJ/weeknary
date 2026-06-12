import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ISODateString } from "../domain";
import type { WeekCalendarSelectionMode } from "./components/WeekCalendar";
import {
  getDateInISOWeek,
  getISOWeekNumber,
  getISOWeekYear,
  getWeekdayIndex,
} from "./calendarWeekOptions";
import { parseIsoDate, toIsoDate } from "./dateDisplay";

const STORAGE_KEY = "weeknary.planCalendarSelection.v1";

interface PlanCalendarSelectionState {
  selectedDate: ISODateString;
  selectedWeek: number;
  selectionMode: WeekCalendarSelectionMode;
}

interface PlanCalendarSelectionValue extends PlanCalendarSelectionState {
  setSelectedDate: (date: ISODateString) => void;
  setSelectedWeek: (weekNumber: number) => void;
  setSelectionMode: (mode: WeekCalendarSelectionMode) => void;
}

const PlanCalendarSelectionContext =
  createContext<PlanCalendarSelectionValue | null>(null);

export function PlanCalendarSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PlanCalendarSelectionState>(() =>
    readInitialState(),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setSelectedDate = useCallback((date: ISODateString) => {
    setState((previous) => ({
      ...previous,
      selectedDate: date,
      selectedWeek: getISOWeekNumber(parseIsoDate(date)),
    }));
  }, []);

  const setSelectedWeek = useCallback((weekNumber: number) => {
    setState((previous) => {
      const currentDate = parseIsoDate(previous.selectedDate);
      const weekYear = getISOWeekYear(currentDate);
      const weekdayIndex = getWeekdayIndex(currentDate);
      const selectedDate = getDateInISOWeek(
        weekYear,
        weekNumber,
        weekdayIndex,
      );

      return {
        ...previous,
        selectedDate,
        selectedWeek: weekNumber,
      };
    });
  }, []);

  const setSelectionMode = useCallback(
    (mode: WeekCalendarSelectionMode) => {
      setState((previous) => ({
        ...previous,
        selectionMode: mode,
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      setSelectedDate,
      setSelectedWeek,
      setSelectionMode,
    }),
    [setSelectedDate, setSelectedWeek, setSelectionMode, state],
  );

  return (
    <PlanCalendarSelectionContext.Provider value={value}>
      {children}
    </PlanCalendarSelectionContext.Provider>
  );
}

export function usePlanCalendarSelection() {
  const context = useContext(PlanCalendarSelectionContext);

  if (!context) {
    throw new Error(
      "usePlanCalendarSelection must be used inside PlanCalendarSelectionProvider.",
    );
  }

  return context;
}

function readInitialState(): PlanCalendarSelectionState {
  const fallback = createFallbackState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<PlanCalendarSelectionState>;
    if (
      !isIsoDate(parsed.selectedDate) ||
      !isSelectionMode(parsed.selectionMode)
    ) {
      return fallback;
    }

    return {
      selectedDate: parsed.selectedDate,
      selectedWeek: getISOWeekNumber(parseIsoDate(parsed.selectedDate)),
      selectionMode: parsed.selectionMode,
    };
  } catch {
    return fallback;
  }
}

function createFallbackState(): PlanCalendarSelectionState {
  const selectedDate = toIsoDate(new Date());

  return {
    selectedDate,
    selectedWeek: getISOWeekNumber(parseIsoDate(selectedDate)),
    selectionMode: "week",
  };
}

function isIsoDate(value: unknown): value is ISODateString {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isSelectionMode(value: unknown): value is WeekCalendarSelectionMode {
  return value === "day" || value === "week";
}
