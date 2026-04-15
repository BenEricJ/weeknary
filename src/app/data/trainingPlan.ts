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
  kcalBasis: number;
  kcalTrainingPlus: number;
  plannedKcal: number;
  plannedProtein: number;
  kcalZielInklTraining: number;
  proteinMindestziel: number;
  hinweis: string;
  tageslogik: string;
  recoveryNote?: string;
}

export const TRAINING_PLAN_ROWS: TrainingPlanRow[] = [
  {
    tag: "MO",
    dayLabel: "Montag",
    dayDate: 13,
    monthLabel: "April",
    zeit: "Rad 60 min, Kraft 35 min",
    training: "Rad Grundlage 60 min + Kraft 35 min",
    workoutIds: ["endurance", "kraft"],
    kcalBasis: 1750,
    kcalTrainingPlus: 350,
    plannedKcal: 2120,
    plannedProtein: 114,
    kcalZielInklTraining: 2100,
    proteinMindestziel: 110,
    hinweis: "Abend to-go",
    tageslogik: "Frueher Shake, warmer Pasta-Proteinanker, abends transportable Couscous Bowl.",
  },
  {
    tag: "DI",
    dayLabel: "Dienstag",
    dayDate: 14,
    monthLabel: "April",
    zeit: "Rad 90 min, Lauf 35 min",
    training: "Rad Strength 90 min + Lauf 35 min",
    workoutIds: ["zwift-strength", "laufen"],
    kcalBasis: 1750,
    kcalTrainingPlus: 550,
    plannedKcal: 2230,
    plannedProtein: 111,
    kcalZielInklTraining: 2300,
    proteinMindestziel: 110,
    hinweis: "Mittag to-go, Abend extern",
    tageslogik:
      "Hoher Trainingsaufschlag, Mittag als Dal-Topf, externes Abendessen proteinbewusst waehlen.",
  },
  {
    tag: "MI",
    dayLabel: "Mittwoch",
    dayDate: 15,
    monthLabel: "April",
    zeit: "Rad 60 min",
    training: "Rad Grundlage 60 min",
    workoutIds: ["endurance"],
    kcalBasis: 1750,
    kcalTrainingPlus: 200,
    plannedKcal: 1980,
    plannedProtein: 110,
    kcalZielInklTraining: 1950,
    proteinMindestziel: 110,
    hinweis: "Mittag to-go, Abend extern",
    tageslogik: "Office-Tag mit Chili-Couscous als dichte To-go-Mahlzeit, abends extern.",
  },
  {
    tag: "DO",
    dayLabel: "Donnerstag",
    dayDate: 16,
    monthLabel: "April",
    zeit: "Kraft 35 min",
    training: "Kraft 35 min",
    workoutIds: ["kraft"],
    kcalBasis: 1750,
    kcalTrainingPlus: 150,
    plannedKcal: 1900,
    plannedProtein: 112,
    kcalZielInklTraining: 1900,
    proteinMindestziel: 110,
    hinweis: "Abend to-go",
    tageslogik: "Mittags Pilz-Schnetzelpfanne, abends Seitan-Rest als transportabler Wrap.",
  },
  {
    tag: "FR",
    dayLabel: "Freitag",
    dayDate: 17,
    monthLabel: "April",
    zeit: "Rad 90 min, Lauf 35 min",
    training: "Rad Tempo 90 min + Lauf 35 min",
    workoutIds: ["zwift-tempo", "laufen"],
    kcalBasis: 1750,
    kcalTrainingPlus: 500,
    plannedKcal: 2210,
    plannedProtein: 111,
    kcalZielInklTraining: 2250,
    proteinMindestziel: 110,
    hinweis: "Abend extern",
    tageslogik: "Trainingsfreitag mit Pasta-Rest, externes Abendessen als flexible Komponente.",
  },
  {
    tag: "SA",
    dayLabel: "Samstag",
    dayDate: 18,
    monthLabel: "April",
    zeit: "Flexibel",
    training: "Kein Training",
    workoutIds: [],
    kcalBasis: 1750,
    kcalTrainingPlus: 0,
    plannedKcal: 1770,
    plannedProtein: 111,
    kcalZielInklTraining: 1750,
    proteinMindestziel: 110,
    hinweis: "Abend extern",
    tageslogik:
      "Ruhetag mit Mung-Tofu-Wrap mittags und externem Abendessen.",
    recoveryNote:
      "Mobility Flow oder Yoga optional als lockere Recovery-Einheit (20-30 Min).",
  },
  {
    tag: "SO",
    dayLabel: "Sonntag",
    dayDate: 19,
    monthLabel: "April",
    zeit: "Long Ride 180 min",
    training: "Long Ride 180 min",
    workoutIds: ["long-ride"],
    kcalBasis: 1750,
    kcalTrainingPlus: 650,
    plannedKcal: 2360,
    plannedProtein: 116,
    kcalZielInklTraining: 2400,
    proteinMindestziel: 110,
    hinweis: "Mittag extern, abends Meal-Prep-Nutzung",
    tageslogik:
      "Long-Ride-Tag mit grossem Shake, externem Mittag und schneller Couscous-Recovery.",
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
