import type { TrainingPlan, TrainingWorkout } from "../../domain";
import type { TrainingPlanRow } from "../data/trainingPlan";
import { getISOWeekNumber } from "../calendarWeekOptions";

export const DEMO_TRAINING_PLAN_USER_ID = "demo-training-user";
export const DEMO_TRAINING_PLAN_ID = "demo-training-plan-2026-04-06";

const MONTH_NUMBER_BY_LABEL: Record<string, string> = {
  Januar: "01",
  Februar: "02",
  "März": "03",
  April: "04",
  Mai: "05",
  Juni: "06",
  Juli: "07",
  August: "08",
  September: "09",
  Oktober: "10",
  November: "11",
  Dezember: "12",
};

export function legacyTrainingPlanToDomain(
  rows: TrainingPlanRow[],
  userId = DEMO_TRAINING_PLAN_USER_ID,
): TrainingPlan {
  const now = new Date().toISOString();
  const days = rows.map((row) => ({
    date: rowToIsoDate(row),
    workouts: row.workoutIds.map(
      (workoutId, index): TrainingWorkout => {
        const timeWindow = getTimeWindow(row.zeit, index);

        return {
          id: `${row.tag}-${workoutId}-${index}`,
          title: workoutIdToTitle(workoutId),
          referenceWorkoutId: workoutId,
          target: row.training,
          notes: row.tageslogik,
          start: timeWindow?.start,
          end: timeWindow?.end,
        };
      },
    ),
  }));

  return {
    id: DEMO_TRAINING_PLAN_ID,
    userId,
    title: `KW ${getISOWeekNumber(parseIsoDate(days[0].date))} TrainingPlan`,
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
  const month = MONTH_NUMBER_BY_LABEL[row.monthLabel] ?? "04";
  return `${new Date().getFullYear()}-${month}-${String(row.dayDate).padStart(2, "0")}`;
}

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function workoutIdToTitle(workoutId: string) {
  return workoutId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getTimeWindow(value: string, index: number) {
  if (value.toLowerCase() === "flexibel") {
    return null;
  }

  const segment = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)[index];
  const match = segment?.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);

  return match ? { start: match[1], end: match[2] } : null;
}
