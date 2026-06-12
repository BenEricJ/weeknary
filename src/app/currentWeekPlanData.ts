import type {
  ISODateString,
  MealPlan,
  PlanMetadata,
  TrainingPlan,
  WeekPlan,
} from "../domain";
import {
  getISOWeekDays,
  getISOWeekNumber,
  getISOWeekRange,
  getISOWeekYear,
} from "./calendarWeekOptions";
import { getDateParts, parseIsoDate } from "./dateDisplay";
import type { DayPlan } from "./data/weekPlan";
import type { NutritionPlan } from "./data/nutritionPlan";
import type { TrainingPlanRow } from "./data/trainingPlan";

export function getCurrentWeekContext(now = new Date()) {
  const weekYear = getISOWeekYear(now);
  const weekNumber = getISOWeekNumber(now);
  const range = getISOWeekRange(weekYear, weekNumber);
  const days = getISOWeekDays(weekYear, weekNumber);

  return {
    weekYear,
    weekNumber,
    range,
    days,
  };
}

export function applyCurrentWeekToDayPlans(
  days: DayPlan[],
  now = new Date(),
): DayPlan[] {
  const currentWeek = getCurrentWeekContext(now);

  return days.map((day, index) => {
    const currentDay = currentWeek.days[index] ?? currentWeek.days[0];
    const parts = getDateParts(currentDay.date);

    return {
      ...day,
      dayKey: currentDay.date,
      dayShort: parts.dayShort,
      dayLabel: parts.dayLabel,
      date: parts.date,
      monthLabel: parts.monthLabel,
    };
  });
}

export function applyCurrentWeekToNutritionPlan(
  plan: NutritionPlan,
  now = new Date(),
): NutritionPlan {
  const currentWeek = getCurrentWeekContext(now);
  const labelSuffix = plan.week.planLabel.includes("|")
    ? ` | ${plan.week.planLabel.split("|").slice(1).join("|").trim()}`
    : "";
  const startLabel = formatGermanDate(currentWeek.range.startDate);
  const endLabel = formatGermanDate(currentWeek.range.endDate);

  return {
    ...plan,
    week: {
      ...plan.week,
      planLabel: `KW ${currentWeek.weekNumber} ${startLabel} - ${endLabel}${labelSuffix}`,
      startIsoDate: currentWeek.range.startDate,
      endIsoDate: currentWeek.range.endDate,
      weekStartLabel: getDateParts(currentWeek.range.startDate).dayLabel,
    },
    days: plan.days.map((day, index) => {
      const currentDay = currentWeek.days[index] ?? currentWeek.days[0];
      const parts = getDateParts(currentDay.date);

      return {
        ...day,
        dayShort: parts.dayShort,
        dayLabel: parts.dayLabel,
        isoDate: currentDay.date,
        date: parts.date,
        monthLabel: parts.monthLabel,
      };
    }),
  };
}

export function applyCurrentWeekToTrainingRows(
  rows: TrainingPlanRow[],
  now = new Date(),
) {
  const currentWeek = getCurrentWeekContext(now);
  const shiftedRows = rows.map((row, index) => {
    const currentDay = currentWeek.days[index] ?? currentWeek.days[0];
    const parts = getDateParts(currentDay.date);

    return {
      ...row,
      tag: parts.dayShort as TrainingPlanRow["tag"],
      dayLabel: parts.dayLabel,
      dayDate: parts.date,
      monthLabel: parts.monthLabel,
    };
  });

  return {
    rows: shiftedRows,
    weekDays: shiftedRows.map((row, index) => ({
      day: row.tag,
      date: currentWeek.days[index]?.date ?? currentWeek.range.startDate,
      displayDate: row.dayDate,
      hasData: true,
    })),
    defaultDate: getDefaultCurrentWeekDate(
      currentWeek.days.map((day) => day.date),
      now,
    ),
  };
}

export function shouldShiftPlanToCurrentWeek(plan: PlanMetadata) {
  return Boolean(plan);
}

export function applyCurrentWeekToWeekPlan(
  plan: WeekPlan,
  now = new Date(),
): WeekPlan {
  if (!shouldShiftPlanToCurrentWeek(plan)) {
    return plan;
  }

  const shiftedRange = getCurrentWeekContext(now).range;

  return {
    ...plan,
    title: withCurrentWeekTitle(plan.title, "WeekPlan", now),
    dateRange: shiftedRange,
    events: plan.events.map((event) => ({
      ...event,
      date: shiftIsoDateIntoRange(
        event.date,
        plan.dateRange.startDate,
        shiftedRange,
      ),
    })),
  };
}

export function applyCurrentWeekToMealPlan(
  plan: MealPlan,
  now = new Date(),
): MealPlan {
  if (!shouldShiftPlanToCurrentWeek(plan)) {
    return plan;
  }

  const shiftedRange = getCurrentWeekContext(now).range;

  return {
    ...plan,
    title: withCurrentWeekTitle(plan.title, "MealPlan", now),
    dateRange: shiftedRange,
    days: plan.days.map((day) => ({
      ...day,
      date: shiftIsoDateIntoRange(
        day.date,
        plan.dateRange.startDate,
        shiftedRange,
      ),
    })),
  };
}

export function applyCurrentWeekToTrainingPlan(
  plan: TrainingPlan,
  now = new Date(),
): TrainingPlan {
  if (!shouldShiftPlanToCurrentWeek(plan)) {
    return plan;
  }

  const shiftedRange = getCurrentWeekContext(now).range;

  return {
    ...plan,
    title: withCurrentWeekTitle(plan.title, "TrainingPlan", now),
    dateRange: shiftedRange,
    days: plan.days.map((day) => ({
      ...day,
      date: shiftIsoDateIntoRange(
        day.date,
        plan.dateRange.startDate,
        shiftedRange,
      ),
    })),
  };
}

function getDefaultCurrentWeekDate(dates: ISODateString[], now: Date) {
  const today = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, "0"),
    `${now.getDate()}`.padStart(2, "0"),
  ].join("-") as ISODateString;

  return dates.includes(today) ? today : dates[0];
}

function formatGermanDate(isoDate: ISODateString) {
  const date = parseIsoDate(isoDate);
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}.${date.getFullYear()}`;
}

function shiftIsoDateIntoRange(
  isoDate: ISODateString,
  sourceStartDate: ISODateString,
  targetRange: { startDate: ISODateString; endDate: ISODateString },
) {
  const source = parseIsoDate(isoDate);
  const sourceStart = parseIsoDate(sourceStartDate);
  const targetStart = parseIsoDate(targetRange.startDate);
  const dayOffset = Math.min(
    Math.max(
      Math.round(
        (source.getTime() - sourceStart.getTime()) / (24 * 60 * 60 * 1000),
      ),
      0,
    ),
    6,
  );
  const shifted = new Date(targetStart);
  shifted.setDate(targetStart.getDate() + dayOffset);

  return [
    shifted.getFullYear(),
    `${shifted.getMonth() + 1}`.padStart(2, "0"),
    `${shifted.getDate()}`.padStart(2, "0"),
  ].join("-") as ISODateString;
}

function withCurrentWeekTitle(title: string, fallback: string, now: Date) {
  const { weekNumber } = getCurrentWeekContext(now);

  if (/^KW\s+\d+/i.test(title)) {
    return title.replace(/^KW\s+\d+/i, `KW ${weekNumber}`);
  }

  if (title.toLowerCase().includes(fallback.toLowerCase())) {
    return title;
  }

  return `KW ${weekNumber} ${fallback}`;
}
