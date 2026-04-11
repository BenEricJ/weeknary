export type TrainingWorkoutId =
  | "zwift-strength"
  | "zwift-tempo"
  | "kraft"
  | "endurance"
  | "laufen"
  | "long-ride"
  | "mobility-flow"
  | "yoga";

export interface TrainingPlanRow {
  tag: "MO" | "DI" | "MI" | "DO" | "FR" | "SA" | "SO";
  dayLabel: string;
  dayDate: number;
  monthLabel: string;
  zeit: string;
  training: string;
  workoutIds: TrainingWorkoutId[];
  kcalZielInklTraining: number;
  proteinMindestziel: number;
  tageslogik: string;
  recoveryNote?: string;
}

export const TRAINING_PLAN_ROWS: TrainingPlanRow[] = [
  {
    tag: "MO",
    dayLabel: "Montag",
    dayDate: 6,
    monthLabel: "April",
    zeit: "06:30-07:30, 12:00-13:00",
    training: "06:30-07:30 Zwift Grundlage; 12:00-13:00 Krafttraining",
    workoutIds: ["endurance", "kraft"],
    kcalZielInklTraining: 2100,
    proteinMindestziel: 115,
    tageslogik: "Frueher Proteinanker, mittags warm, abends To-go.",
  },
  {
    tag: "DI",
    dayLabel: "Dienstag",
    dayDate: 7,
    monthLabel: "April",
    zeit: "06:30-08:00, 12:00-13:00",
    training: "06:30-08:00 Zwift Strength; 12:00-13:00 Lauftraining MIT/LOW",
    workoutIds: ["zwift-strength", "laufen"],
    kcalZielInklTraining: 2150,
    proteinMindestziel: 115,
    tageslogik:
      "Office-Tag, To-go-Mittag, externes Abendessen proteinbewusst waehlen.",
  },
  {
    tag: "MI",
    dayLabel: "Mittwoch",
    dayDate: 8,
    monthLabel: "April",
    zeit: "06:30-07:30",
    training: "06:30-07:30 Zwift Grundlage",
    workoutIds: ["endurance"],
    kcalZielInklTraining: 1950,
    proteinMindestziel: 110,
    tageslogik: "Office-Tag, kraeftiges To-go-Mittag, abends extern.",
  },
  {
    tag: "DO",
    dayLabel: "Donnerstag",
    dayDate: 9,
    monthLabel: "April",
    zeit: "12:00-13:00",
    training: "12:00-13:00 Krafttraining",
    workoutIds: ["kraft"],
    kcalZielInklTraining: 1900,
    proteinMindestziel: 110,
    tageslogik: "Mittags warm, abends To-go aus Batch-Rest.",
  },
  {
    tag: "FR",
    dayLabel: "Freitag",
    dayDate: 10,
    monthLabel: "April",
    zeit: "06:30-08:00, 12:00-13:00",
    training: "06:30-08:00 Zwift Tempo; 12:00-13:00 Lauftraining MIT/LOW",
    workoutIds: ["zwift-tempo", "laufen"],
    kcalZielInklTraining: 2150,
    proteinMindestziel: 115,
    tageslogik: "Hoher Protein- und Carb-Fokus, abends extern.",
  },
  {
    tag: "SA",
    dayLabel: "Samstag",
    dayDate: 11,
    monthLabel: "April",
    zeit: "Flexibel",
    training: "Kein fixes Training",
    workoutIds: [],
    kcalZielInklTraining: 1750,
    proteinMindestziel: 100,
    tageslogik:
      "Etwas entspannter, aber Protein weiterhin hoch halten.",
    recoveryNote:
      "Mobility Flow oder Yoga optional als lockere Recovery-Einheit (20-30 Min).",
  },
  {
    tag: "SO",
    dayLabel: "Sonntag",
    dayDate: 12,
    monthLabel: "April",
    zeit: "17:00-20:00",
    training: "17:00-20:00 Long Ride",
    workoutIds: ["long-ride"],
    kcalZielInklTraining: 2400,
    proteinMindestziel: 115,
    tageslogik:
      "Carbs vor und waehrend der Einheit, abends Recovery-Bowl.",
  },
];

export const TRAINING_WEEK_DAYS = TRAINING_PLAN_ROWS.map((row) => ({
  day: row.tag,
  date: row.dayDate,
}));

export function getTrainingPlanRowByDate(date: number) {
  return (
    TRAINING_PLAN_ROWS.find((row) => row.dayDate === date) ??
    TRAINING_PLAN_ROWS[0]
  );
}

export function getDefaultTrainingDate(currentDate = new Date()) {
  return (
    TRAINING_WEEK_DAYS.find((day) => day.date === currentDate.getDate())?.date ??
    TRAINING_WEEK_DAYS[0].date
  );
}
