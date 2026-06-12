import type { TrainingPlan, TrainingWorkout } from "../../domain";
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
    const displayWorkouts = day.workouts.map((workout, index) => ({
      workout,
      displayId: getDisplayWorkoutId(workout),
      timeLabel: getWorkoutTimeLabel(workout, index),
    }));
    const generatedWorkouts = Object.fromEntries(
      displayWorkouts
        .filter(({ workout }) => !workout.referenceWorkoutId)
        .map(({ workout, displayId, timeLabel }) => [
          displayId,
          {
            id: displayId,
            title: workout.title,
            subtitle:
              workout.target || workout.notes || "KI-generierte Einheit",
            notes: workout.notes ?? "",
            target: workout.target ?? "",
            timeLabel,
          },
        ]),
    );

    return {
      tag: parts.dayShort as TrainingPlanRow["tag"],
      dayLabel: parts.dayLabel,
      dayDate: parts.date,
      monthLabel: parts.monthLabel,
      zeit:
        displayWorkouts.map(({ timeLabel }) => timeLabel).join(", ") ||
        "Flexibel",
      training:
        displayWorkouts
          .map(({ workout, timeLabel }) =>
            timeLabel === "Flexibel"
              ? workout.title
              : `${timeLabel} ${workout.title}`,
          )
          .join("; ") || "Kein fixes Training",
      workoutIds: displayWorkouts.map(({ displayId }) => displayId),
      generatedWorkouts,
      kcalZielInklTraining: 0,
      proteinMindestziel: 0,
      tageslogik:
        day.workouts.find((workout) => workout.notes)?.notes ??
        (day.workouts.length
          ? "KI-generierter Trainingstag."
          : "Kein fixes Training im aktiven Plan."),
      recoveryNote: day.workouts.length
        ? undefined
        : "Nutze den Tag fuer Erholung oder lockere Bewegung.",
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

function getDisplayWorkoutId(workout: TrainingWorkout) {
  return workout.referenceWorkoutId ?? workout.id;
}

function getWorkoutTimeLabel(workout: TrainingWorkout, index: number) {
  if (workout.start && workout.end) {
    return `${workout.start}-${workout.end}`;
  }

  return getTimeLabelFromText(workout.target, index) ?? "Flexibel";
}

function getTimeLabelFromText(value: string | undefined, index: number) {
  if (!value) {
    return null;
  }

  const segments = value
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const segment = segments[index] ?? segments[0] ?? value;
  const match = segment.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);

  return match ? `${match[1]}-${match[2]}` : null;
}
