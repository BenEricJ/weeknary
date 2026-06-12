import { useCallback, useEffect, useMemo, useState } from "react";
import type { DayInfo } from "../components/WeekCalendar";
import {
  WORKOUT_DATA,
  type WorkoutData,
} from "../components/WorkoutDetailDrawer";
import type {
  GeneratedTrainingWorkout,
  TrainingPlanRow,
} from "../data/trainingPlan";
import { toIsoDate } from "../dateDisplay";

const STORAGE_KEY = "weeknary.trainingCompletion.v1";

export type TrainingCategory = "strength" | "endurance" | "mobility" | "other";
export type TrainingCompletionState = "planned" | "completed" | "missed";

export type TrainingEntry = {
  id: string;
  date: string;
  row: TrainingPlanRow;
  workoutId: string;
  workout: WorkoutData | null;
  generatedWorkout?: GeneratedTrainingWorkout;
  title: string;
  subtitle: string;
  focus: string;
  timeLabel: string;
  category: TrainingCategory;
  isGenerated: boolean;
};

export type TrainingEntryStatus = {
  state: TrainingCompletionState;
  elapsed: boolean;
  completed: boolean;
  missed: boolean;
  canMarkMissed: boolean;
};

export type TrainingCompletionSummary = {
  planned: number;
  completed: number;
  missed: number;
  pending: number;
  progressPercent: number;
  score: number;
};

type StoredMissedEntries = Record<string, string[]>;

export function useTrainingCompletionOverrides(weekKey: string) {
  const [missedIds, setMissedIds] = useState<Set<string>>(() =>
    readMissedTrainingIds(weekKey),
  );

  useEffect(() => {
    setMissedIds(readMissedTrainingIds(weekKey));
  }, [weekKey]);

  const setEntryMissed = useCallback(
    (entryId: string, missed: boolean) => {
      setMissedIds((previous) => {
        const next = new Set(previous);

        if (missed) {
          next.add(entryId);
        } else {
          next.delete(entryId);
        }

        writeMissedTrainingIds(weekKey, next);
        return next;
      });
    },
    [weekKey],
  );

  return useMemo(
    () => ({
      missedIds,
      setEntryMissed,
    }),
    [missedIds, setEntryMissed],
  );
}

export function getTrainingCompletionWeekKey(range: {
  startDate: string;
  endDate: string;
}) {
  return `${range.startDate}_${range.endDate}`;
}

export function readMissedTrainingIds(weekKey: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw) as StoredMissedEntries;
    const ids = Array.isArray(parsed[weekKey]) ? parsed[weekKey] : [];
    return new Set(ids.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set<string>();
  }
}

export function buildTrainingEntries(
  rows: TrainingPlanRow[],
  weekDays: DayInfo<string>[],
  planIsGenerated: boolean,
): TrainingEntry[] {
  return rows.flatMap((row, rowIndex) => {
    const date = String(weekDays[rowIndex]?.date ?? "");
    const timeLabels = splitTimeLabels(row.zeit);

    return row.workoutIds.map((workoutId, workoutIndex) => {
      const workout = WORKOUT_DATA[workoutId] ?? null;
      const generatedWorkout = row.generatedWorkouts?.[workoutId];
      const title = workout?.title ?? generatedWorkout?.title ?? row.training;
      const subtitle =
        workout?.subtitle ??
        generatedWorkout?.subtitle ??
        generatedWorkout?.target ??
        row.tageslogik;
      const focus =
        generatedWorkout?.target ||
        workout?.goal.title ||
        generatedWorkout?.notes ||
        row.tageslogik;
      const timeLabel = formatTimeLabel(
        timeLabels[workoutIndex] ?? generatedWorkout?.timeLabel ?? row.zeit,
      );

      return {
        id: `${date}-${workoutId}-${workoutIndex}`,
        date,
        row,
        workoutId,
        workout,
        generatedWorkout,
        title,
        subtitle,
        focus,
        timeLabel,
        category: getTrainingCategory(workout, generatedWorkout, title, subtitle),
        isGenerated: planIsGenerated || Boolean(generatedWorkout),
      };
    });
  });
}

export function evaluateTrainingEntryStatus(
  entry: Pick<TrainingEntry, "date" | "timeLabel" | "id">,
  missedIds: Set<string>,
  now = new Date(),
): TrainingEntryStatus {
  const missed = missedIds.has(entry.id);
  const elapsed = hasEntryElapsed(entry, now);
  const completed = elapsed && !missed;

  return {
    state: missed ? "missed" : completed ? "completed" : "planned",
    elapsed,
    completed,
    missed,
    canMarkMissed: elapsed,
  };
}

export function summarizeTrainingCompletion(
  entries: TrainingEntry[],
  missedIds: Set<string>,
  now = new Date(),
): TrainingCompletionSummary {
  const planned = entries.length;
  const statuses = entries.map((entry) =>
    evaluateTrainingEntryStatus(entry, missedIds, now),
  );
  const completed = statuses.filter((status) => status.completed).length;
  const missed = statuses.filter((status) => status.missed).length;
  const pending = Math.max(planned - completed - missed, 0);
  const progressPercent = planned > 0 ? Math.round((completed / planned) * 100) : 0;

  return {
    planned,
    completed,
    missed,
    pending,
    progressPercent,
    score: planned > 0 ? Number(((completed / planned) * 10).toFixed(1)) : 0,
  };
}

export function getEntryDurationMinutes(entry: Pick<TrainingEntry, "timeLabel" | "workout">) {
  const fromTimeLabel = parseTimeWindowMinutes(entry.timeLabel);

  if (fromTimeLabel > 0) {
    return fromTimeLabel;
  }

  return parseWorkoutStatsDuration(entry.workout);
}

export function formatMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return "0:00 h";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")} h`;
}

function writeMissedTrainingIds(weekKey: string, missedIds: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredMissedEntries) : {};
    const next = { ...parsed };
    const ids = Array.from(missedIds);

    if (ids.length > 0) {
      next[weekKey] = ids;
    } else {
      delete next[weekKey];
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures; the automatic elapsed status still works.
  }
}

function hasEntryElapsed(
  entry: Pick<TrainingEntry, "date" | "timeLabel">,
  now: Date,
) {
  const today = toIsoDate(now);

  if (entry.date < today) {
    return true;
  }

  if (entry.date > today) {
    return false;
  }

  const endMinutes = parseTimeWindowEndMinutes(entry.timeLabel);
  if (endMinutes === null) {
    return false;
  }

  return now.getHours() * 60 + now.getMinutes() >= endMinutes;
}

function parseTimeWindowEndMinutes(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);

  if (!match) {
    return null;
  }

  let end = Number(match[3]) * 60 + Number(match[4]);
  const start = Number(match[1]) * 60 + Number(match[2]);

  if (end < start) {
    end += 24 * 60;
  }

  return end;
}

function getTrainingCategory(
  workout: WorkoutData | null,
  generatedWorkout: GeneratedTrainingWorkout | undefined,
  title: string,
  subtitle: string,
): TrainingCategory {
  if (workout?.sport === "Krafttraining") return "strength";
  if (workout?.sport === "Radfahren" || workout?.sport === "Laufen") return "endurance";
  if (workout?.sport === "Mobilität" || workout?.sport === "Yoga") return "mobility";

  const text = `${title} ${subtitle} ${generatedWorkout?.target ?? ""} ${
    generatedWorkout?.notes ?? ""
  }`.toLowerCase();

  if (/kraft|strength|ganzk|kurzhantel|langhantel|muskel/.test(text)) {
    return "strength";
  }
  if (/ausdauer|endurance|cardio|zone|laufen|ride|zwift|rad/.test(text)) {
    return "endurance";
  }
  if (/mobil|yoga|recovery|regeneration/.test(text)) {
    return "mobility";
  }

  return "other";
}

function splitTimeLabels(value: string) {
  if (value.toLowerCase() === "flexibel") {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatTimeLabel(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed.toLowerCase() === "flexibel") {
    return "Flexibel";
  }

  return trimmed.replace(/\s*-\s*/g, " - ");
}

function parseTimeWindowMinutes(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);

  if (!match) {
    return 0;
  }

  const start = Number(match[1]) * 60 + Number(match[2]);
  let end = Number(match[3]) * 60 + Number(match[4]);

  if (end < start) {
    end += 24 * 60;
  }

  return Math.max(end - start, 0);
}

function parseWorkoutStatsDuration(workout: WorkoutData | null) {
  const durationValue = workout?.statsBar
    .map((stat) => stat.val)
    .find((value) => /min|\bh\b/i.test(value));

  if (!durationValue) {
    return 0;
  }

  const minutes = durationValue.match(/(\d+(?:[,.]\d+)?)\s*min/i);
  if (minutes) {
    return Math.round(Number(minutes[1].replace(",", ".")));
  }

  const hours = durationValue.match(/(\d+(?:[,.]\d+)?)\s*h/i);
  if (hours) {
    return Math.round(Number(hours[1].replace(",", ".")) * 60);
  }

  return 0;
}
