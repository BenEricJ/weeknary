import type { DayPlan } from "../data/weekPlan";
import { getDateParts } from "../dateDisplay";

export function getDayKey(day: DayPlan) {
  return day.dayKey ?? String(day.date);
}

export function createEmptyDisplayDay(isoDate: string): DayPlan {
  const parts = getDateParts(isoDate);

  return {
    dayKey: isoDate,
    dayShort: parts.dayShort,
    dayLabel: parts.dayLabel,
    date: parts.date,
    monthLabel: parts.monthLabel,
    allDayEvents: [],
    events: [],
  };
}
