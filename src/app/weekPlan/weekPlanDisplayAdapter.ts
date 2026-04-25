import type { WeekPlan, WeekPlanEvent } from "../../domain";
import type { DayPlan, EventItem, ScheduleEntry } from "../data/weekPlan";
import { getDateParts, getDatesInRange } from "../dateDisplay";

function toEventItem(event: WeekPlanEvent): ScheduleEntry {
  const base = {
    id: event.id,
    title: event.title,
    category: event.category,
    workoutId: event.linkedTrainingWorkoutId,
    subtasks: event.tasks,
  };

  if (event.allDay || !event.start || !event.end) {
    return base;
  }

  return {
    ...base,
    subtitle: event.subtitle ?? event.notes ?? "",
    start: event.start,
    end: event.end,
  } satisfies EventItem;
}

export function weekPlanToDisplayDays(plan: WeekPlan): DayPlan[] {
  return getDatesInRange(plan.dateRange).map((isoDate) => {
    const parts = getDateParts(isoDate);
    const entries = plan.events
      .filter((event) => event.date === isoDate)
      .map(toEventItem);

    const events = entries
      .filter((entry): entry is EventItem => "start" in entry && "end" in entry)
      .sort((left, right) => left.start.localeCompare(right.start));
    const allDayEvents = entries.filter(
      (entry): entry is Exclude<ScheduleEntry, EventItem> =>
        !("start" in entry) || !("end" in entry),
    );

    return {
      dayKey: isoDate,
      dayShort: parts.dayShort,
      dayLabel: parts.dayLabel,
      date: parts.date,
      monthLabel: parts.monthLabel,
      allDayEvents,
      events,
    };
  });
}
