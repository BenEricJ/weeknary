import type { WeekPlan, WeekPlanEvent } from "../../domain";
import type { DayPlan, ScheduleEntry } from "../data/weekPlan";
import { getDayDate } from "../data/weekPlan";

export const DEMO_WEEK_PLAN_USER_ID = "demo-user";
export const DEMO_WEEK_PLAN_ID = "demo-week-plan-2026-04-06";

export function legacyWeekPlanToDomain(
  days: DayPlan[],
  userId = DEMO_WEEK_PLAN_USER_ID,
): WeekPlan {
  const isoDates = days.map((day) => toIsoDate(getDayDate(day)));
  const now = "2026-04-06T00:00:00.000Z";

  return {
    id: DEMO_WEEK_PLAN_ID,
    userId,
    title: "KW 15 WeekPlan",
    status: "active",
    source: "import",
    version: 1,
    dateRange: {
      startDate: isoDates[0],
      endDate: isoDates[isoDates.length - 1],
    },
    createdAt: now,
    updatedAt: now,
    events: days.flatMap((day) => [
      ...day.allDayEvents.map((event) => entryToDomainEvent(day, event)),
      ...day.events.map((event) => entryToDomainEvent(day, event)),
    ]),
    focusItems: [],
  };
}

function entryToDomainEvent(day: DayPlan, entry: ScheduleEntry): WeekPlanEvent {
  const hasTime = "start" in entry && "end" in entry;

  return {
    id: entry.id,
    title: entry.title,
    subtitle: "subtitle" in entry ? entry.subtitle : undefined,
    date: toIsoDate(getDayDate(day)),
    category: entry.category,
    allDay: !hasTime,
    start: hasTime ? entry.start : undefined,
    end: hasTime ? entry.end : undefined,
    linkedTrainingWorkoutId: "workoutId" in entry ? entry.workoutId : undefined,
    tasks: "subtasks" in entry ? entry.subtasks : undefined,
  };
}

function toIsoDate(date: Date) {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, "0"),
    `${date.getDate()}`.padStart(2, "0"),
  ].join("-");
}
