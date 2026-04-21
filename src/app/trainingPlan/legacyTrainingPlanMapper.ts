import type { TrainingPlan, TrainingWorkout } from "../../domain";
import type { TrainingPlanRow } from "../data/trainingPlan";

export const DEMO_TRAINING_PLAN_USER_ID = "demo-training-user";
export const DEMO_TRAINING_PLAN_ID = "demo-training-plan-2026-04-06";

const DATE_BY_MONTH_LABEL: Record<string, string> = {
  April: "2026-04",
};

export function legacyTrainingPlanToDomain(
  rows: TrainingPlanRow[],
  userId = DEMO_TRAINING_PLAN_USER_ID,
): TrainingPlan {
  const now = "2026-04-06T00:00:00.000Z";
  const days = rows.map((row) => ({
    date: rowToIsoDate(row),
    workouts: row.workoutIds.map(
      (workoutId, index): TrainingWorkout => ({
        id: `${row.tag}-${workoutId}-${index}`,
        title: workoutIdToTitle(workoutId),
        referenceWorkoutId: workoutId,
        target: row.training,
        notes: row.tageslogik,
      }),
    ),
  }));

  return {
    id: DEMO_TRAINING_PLAN_ID,
    userId,
    title: "KW 15 TrainingPlan",
    status: "active",
    source: "import",
    version: 1,
    dateRange: {
      startDate: days[0].date,
      endDate: days[days.length - 1].date,
    },
    createdAt: now,
    updatedAt: now,
    days,
    workouts: days.flatMap((day) => day.workouts),
    goals: [{ id: "mixed-week", title: "Zwift, Kraft & Run Week" }],
  };
}

function rowToIsoDate(row: TrainingPlanRow) {
  const month = DATE_BY_MONTH_LABEL[row.monthLabel] ?? "2026-04";
  return `${month}-${String(row.dayDate).padStart(2, "0")}`;
}

function workoutIdToTitle(workoutId: string) {
  return workoutId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
