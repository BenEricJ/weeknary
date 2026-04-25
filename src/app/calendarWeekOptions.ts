import type { WeekInfo } from "./components/WeekCalendar";
import { getDateParts, toIsoDate } from "./dateDisplay";

export function getISOWeekNumber(date: Date) {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target.getTime() - firstThursday.getTime();

  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export function getISOWeekYear(date: Date) {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);

  return target.getUTCFullYear();
}

export function getISOWeekStartDate(weekYear: number, weekNumber: number) {
  const fourthOfJanuary = new Date(Date.UTC(weekYear, 0, 4));
  const dayNumber = (fourthOfJanuary.getUTCDay() + 6) % 7;
  const firstWeekMonday = new Date(fourthOfJanuary);
  firstWeekMonday.setUTCDate(fourthOfJanuary.getUTCDate() - dayNumber);

  const startDate = new Date(firstWeekMonday);
  startDate.setUTCDate(firstWeekMonday.getUTCDate() + (weekNumber - 1) * 7);

  return new Date(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
}

export function getISOWeekRange(weekYear: number, weekNumber: number) {
  const start = getISOWeekStartDate(weekYear, weekNumber);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
  };
}

export function getISOWeekDays(weekYear: number, weekNumber: number) {
  const start = getISOWeekStartDate(weekYear, weekNumber);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const isoDate = toIsoDate(date);
    const parts = getDateParts(isoDate);

    return {
      day: parts.dayShort,
      date: isoDate,
      displayDate: parts.date,
    };
  });
}

export function getYearWeekOptions(): WeekInfo[] {
  return Array.from({ length: 53 }, (_, index) => ({
    weekNumber: index + 1,
  }));
}

export function getWeekdayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

export function getDateInISOWeek(
  weekYear: number,
  weekNumber: number,
  weekdayIndex: number,
) {
  const start = getISOWeekStartDate(weekYear, weekNumber);
  const next = new Date(start);
  next.setDate(start.getDate() + Math.min(Math.max(weekdayIndex, 0), 6));

  return toIsoDate(next);
}

export function getSurroundingWeekOptions(
  centerWeek: number,
  count = 7,
): WeekInfo[] {
  const boundedCount = Math.max(1, Math.min(count, 53));
  const startWeek = Math.min(
    Math.max(centerWeek - Math.floor(boundedCount / 2), 1),
    54 - boundedCount,
  );

  return Array.from({ length: boundedCount }, (_, index) => ({
    weekNumber: startWeek + index,
  }));
}
