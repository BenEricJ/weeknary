import type { RecurringTimeBlock, TimeBlock, TimeBlockCategory, UserPreferences, Weekday } from "../../domain";

export const weekdays: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const kitchenAppliances = [
  "stand_mixer",
  "food_processor",
  "blender",
  "vacuum_sealer",
  "oven",
  "microwave",
  "air_fryer",
  "rice_cooker",
  "pressure_cooker",
  "slow_cooker",
  "toaster",
  "induction_stove",
  "gas_stove",
  "fridge",
  "freezer",
] as const;

export const timeBlockCategories: TimeBlockCategory[] = [
  "work",
  "training",
  "meal",
  "recovery",
  "social",
  "admin",
  "commute",
  "sleep",
  "household",
  "errand",
  "custom",
];

export const levelOptions = ["low", "medium", "high"];

export function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function emptyToUndefined(value: string) {
  return value.trim() ? value.trim() : undefined;
}

export function createDefaultWeekTimeBlock(title: string): UserPreferences["week"]["workBlocks"][number] {
  return {
    day: "monday",
    start: "09:00",
    end: "10:00",
    label: title,
  };
}

export function createDefaultTimeBlock(category: TimeBlockCategory = "custom"): TimeBlock {
  return {
    id: createLocalId("block"),
    title: "Neuer Block",
    category,
    start: "09:00",
    end: "10:00",
    isFixed: false,
    priority: "medium",
    energyDemand: "medium",
  };
}

export function createDefaultRecurringTimeBlock(): RecurringTimeBlock {
  return {
    ...createDefaultTimeBlock("custom"),
    weekday: "monday",
  };
}

function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function sanitizeUserPreferences(preferences: UserPreferences): UserPreferences {
  const week = preferences.week;

  return {
    ...preferences,
    week: {
      ...week,
      workBlocks: sanitizeWeekTimeBlocks(week.workBlocks),
      blockedTimes: sanitizeWeekTimeBlocks(week.blockedTimes),
      fixedAppointments: sanitizeTimeBlocks(week.fixedAppointments),
      recurringAppointments: sanitizeRecurringTimeBlocks(week.recurringAppointments),
      mustDoBlocks: sanitizeTimeBlocks(week.mustDoBlocks),
      optionalBlocks: sanitizeTimeBlocks(week.optionalBlocks),
      householdBlocks: sanitizeTimeBlocks(week.householdBlocks),
      errandsBlocks: sanitizeTimeBlocks(week.errandsBlocks),
      mealPrepBlocks: sanitizeTimeBlocks(week.mealPrepBlocks),
    },
  };
}

function sanitizeWeekTimeBlocks(blocks: UserPreferences["week"]["workBlocks"]) {
  return blocks
    .filter((block) => weekdays.includes(block.day) && isValidTimeRange(block.start, block.end))
    .map((block) => ({
      day: block.day,
      start: block.start.trim(),
      end: block.end.trim(),
      label: block.label?.trim() || undefined,
    }));
}

function sanitizeTimeBlocks(blocks?: TimeBlock[]) {
  return blocks
    ?.filter(isValidTimeBlock)
    .map((block) => ({
      ...block,
      title: block.title.trim(),
      start: block.start.trim(),
      end: block.end.trim(),
      location: block.location?.trim() || undefined,
      notes: block.notes?.trim() || undefined,
    }));
}

function sanitizeRecurringTimeBlocks(blocks?: RecurringTimeBlock[]) {
  return blocks
    ?.filter((block) => weekdays.includes(block.weekday) && isValidTimeBlock(block))
    .map((block) => ({
      ...block,
      title: block.title.trim(),
      start: block.start.trim(),
      end: block.end.trim(),
      location: block.location?.trim() || undefined,
      notes: block.notes?.trim() || undefined,
    }));
}

function isValidTimeBlock(block: TimeBlock | RecurringTimeBlock) {
  return (
    Boolean(block.id.trim()) &&
    Boolean(block.title.trim()) &&
    timeBlockCategories.includes(block.category) &&
    isValidTimeRange(block.start, block.end)
  );
}

function isValidTimeRange(start: string, end: string) {
  return isValidTime(start) && isValidTime(end) && start < end;
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export function formatOptionLabel(value: string) {
  const labels: Record<string, string> = {
    "": "Nicht gesetzt",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    compact: "Kompakt",
    balanced: "Ausgewogen",
    spacious: "Großzügig",
    structured: "Strukturiert",
    flexible: "Flexibel",
    minimalist: "Minimalistisch",
    minimal: "Minimal",
    morning: "Morgens",
    midday: "Mittags",
    afternoon: "Nachmittags",
    evening: "Abends",
    variable: "Variabel",
    none: "Keine",
    work: "Arbeit",
    training: "Training",
    meal: "Mahlzeit",
    recovery: "Erholung",
    social: "Sozial",
    admin: "Admin",
    commute: "Pendeln",
    sleep: "Schlaf",
    household: "Haushalt",
    errand: "Erledigung",
    custom: "Individuell",
    omnivore: "Omnivor",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    pescetarian: "Pescetarisch",
    maintain: "Halten",
    fat_loss: "Fettverlust",
    muscle_gain: "Muskelaufbau",
    performance: "Performance",
    health: "Gesundheit",
    normal: "Normal",
    very_high: "Sehr hoch",
    budget: "Budget",
    convenience: "Komfort",
    basic: "Basis",
    intermediate: "Fortgeschritten",
    advanced: "Advanced",
    daily: "Täglich",
    batch: "Batch",
    mixed: "Gemischt",
    elaborate: "Aufwendig",
    never: "Nie",
    rare: "Selten",
    sometimes: "Manchmal",
    often: "Oft",
    light: "Leicht",
    big: "Groß",
    strength: "Kraft",
    hypertrophy: "Hypertrophie",
    endurance: "Ausdauer",
    mobility: "Mobilität",
    "general-fitness": "Allgemeine Fitness",
    general_fitness: "Allgemeine Fitness",
    beginner: "Einsteiger",
    moderate: "Moderat",
    time: "Zeit",
    fatigue: "Fatigue",
    equipment: "Equipment",
    motivation: "Motivation",
    injury: "Verletzung",
    base: "Base",
    build: "Build",
    peak: "Peak",
    deload: "Deload",
    maintenance: "Maintenance",
    loose: "Locker",
    strict: "Strikt",
    running_race: "Laufrennen",
    cycling_event: "Radevent",
    triathlon: "Triathlon",
    strength_test: "Krafttest",
    mobility_goal: "Mobilitätsziel",
    other: "Sonstiges",
    estimated: "Geschätzt",
    tested: "Getestet",
    device_based: "Gerätebasiert",
  };

  return labels[value] ?? value;
}
