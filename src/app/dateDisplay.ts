import type { DateRange, ISODateString } from "../domain";

const DAY_LABELS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

const DAY_SHORT_LABELS = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"] as const;

const MONTH_LABELS = [
  "Januar",
  "Februar",
  "Maerz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;

export function parseIsoDate(isoDate: ISODateString) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): ISODateString {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, "0"),
    `${date.getDate()}`.padStart(2, "0"),
  ].join("-");
}

export function getDatesInRange(range: DateRange): ISODateString[] {
  const dates: ISODateString[] = [];
  const cursor = parseIsoDate(range.startDate);
  const end = parseIsoDate(range.endDate);

  while (cursor <= end) {
    dates.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function getDateParts(isoDate: ISODateString) {
  const date = parseIsoDate(isoDate);
  return {
    dayShort: DAY_SHORT_LABELS[date.getDay()],
    dayLabel: DAY_LABELS[date.getDay()],
    date: date.getDate(),
    monthLabel: MONTH_LABELS[date.getMonth()],
  };
}

export function getDefaultIsoDate(dates: ISODateString[], now = new Date()) {
  const today = toIsoDate(now);
  return dates.includes(today) ? today : dates[0];
}
