import type { TrainingPlan } from "../../domain";
import type { DayInfo } from "../components/WeekCalendar";
import type { TrainingPlanRow } from "../data/trainingPlan";
import { getDateParts, getDefaultIsoDate } from "../dateDisplay";

export interface TrainingPlanDisplay {
  rows: TrainingPlanRow[];
  weekDays: DayInfo<string>[];
  defaultDate: string;
}

export function trainingPlanToDisplay(plan: TrainingPlan): TrainingPlanDisplay {
  const rows = plan.days.map((day) => {
    const parts = getDateParts(day.date);
    const generatedWorkouts = Object.fromEntries(
      day.workouts.map((workout) => [
        workout.id,
        {
          id: workout.id,
          title: workout.title,
          subtitle: workout.target || workout.notes || "KI-generierte Einheit",
          notes: workout.notes ?? "",
          target: workout.target ?? "",
          timeLabel:
            workout.start && workout.end
              ? `${workout.start}-${workout.end}`
              : "Flexibel",
        },
      ]),
    );

    return {
      tag: parts.dayShort as TrainingPlanRow["tag"],
      dayLabel: parts.dayLabel,
      dayDate: parts.date,
      monthLabel: parts.monthLabel,
      zeit: day.workouts
        .map((workout) =>
          workout.start && workout.end ? `${workout.start}-${workout.end}` : "Flexibel",
        )
        .join(", ") || "Flexibel",
      training:
        day.workouts
          .map((workout) =>
            workout.start && workout.end
              ? `${workout.start}-${workout.end} ${workout.title}`
              : workout.title,
          )
          .join("; ") || "Kein fixes Training",
      workoutIds: day.workouts.map((workout) => workout.id),
      generatedWorkouts,
      kcalZielInklTraining: 0,
      proteinMindestziel: 0,
      tageslogik: day.workouts.length
        ? "KI-generierter Trainingstag."
        : "Kein fixes Training im aktiven Plan.",
      recoveryNote: day.workouts.length ? undefined : "Nutze den Tag fuer Erholung oder lockere Bewegung.",
    } satisfies TrainingPlanRow;
  });

  return {
    rows,
    weekDays: rows.map((row, index) => ({
      day: row.tag,
      date: plan.days[index].date,
      displayDate: row.dayDate,
    })),
    defaultDate: getDefaultIsoDate(plan.days.map((day) => day.date)),
  };
}
