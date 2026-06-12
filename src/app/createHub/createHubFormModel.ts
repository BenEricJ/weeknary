import type { PlanBundleGenerationRequest } from "../../application";
import type { useCreateHub } from "./useCreateHub";

export type WizardStep = "setup" | "context" | "preview";

export const defaultGoals = [
  "Proteinreich essen",
  "Drei Trainingseinheiten einplanen",
  "Genug Puffer für Arbeit und Erholung lassen",
];
export const defaultConstraints = [
  "Keine medizinische Beratung",
  "Meal Prep soll alltagstauglich bleiben",
  "Training moderat und editierbar planen",
];
export const defaultOutput: NonNullable<PlanBundleGenerationRequest["output"]> = {
  detailLevel: "normal",
  explanationLevel: "short",
  riskTolerance: "balanced",
  communicationStyle: "direct_de",
  format: "cards",
  conflictResolutionStyle: "adaptive",
  includeAlternatives: true,
  includePrepSteps: true,
  includeShoppingList: true,
  includeRationale: true,
  includeFallbacks: true,
  includeRecoveryNotes: true,
  includeLeftoverPlan: true,
  includeStorageHints: true,
  includeBatchCookingPlan: true,
  includeTimeEstimates: true,
  includeConstraintWarnings: true,
};

export function previousStep(step: WizardStep): WizardStep {
  if (step === "preview") {
    return "context";
  }

  return "setup";
}

export function getNextWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const daysUntilNextMonday = ((8 - day) % 7) || 7;
  const start = new Date(today);
  start.setDate(today.getDate() + daysUntilNextMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

function toInputDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildGoalsFromPreferences(
  preferences: NonNullable<ReturnType<typeof useCreateHub>["preferences"]>,
) {
  return [
    ...preferences.week.focusAreas,
    `${preferences.training.sessionsPerWeek} Trainingseinheiten pro Woche`,
    `${preferences.nutrition.dietType} essen`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildConstraintsFromPreferences(
  preferences: NonNullable<ReturnType<typeof useCreateHub>["preferences"]>,
) {
  const constraints = [
    "Keine medizinische Beratung",
    `Meal Prep bis ${preferences.nutrition.mealPrepMinutes ?? 45} Minuten`,
    `Training ${preferences.training.intensityPreference} und editierbar planen`,
    `Wochenplanung ${preferences.week.planningStyle} mit ${preferences.week.bufferPreference} Puffern`,
  ];

  if (preferences.nutrition.allergies.length > 0) {
    constraints.push(`Allergien: ${preferences.nutrition.allergies.join(", ")}`);
  }

  if (preferences.training.limitations.length > 0) {
    constraints.push(`Training-Limits: ${preferences.training.limitations.join(", ")}`);
  }

  return constraints.join("\n");
}

export function buildNotesFromProfile(displayName?: string) {
  return `Plane eine realistische Woche${displayName ? ` für ${displayName}` : ""} mit klaren Meals, Training und Tagesstruktur.`;
}

export function buildStructuredGoals({
  planningIntent,
  weekMood,
  mainFocus,
  tradeoffPreference,
  preferences,
}: {
  planningIntent: NonNullable<PlanBundleGenerationRequest["planningIntent"]>;
  weekMood: NonNullable<PlanBundleGenerationRequest["weekMood"]>;
  mainFocus: string;
  tradeoffPreference: NonNullable<PlanBundleGenerationRequest["tradeoffPreference"]>;
  preferences: ReturnType<typeof useCreateHub>["preferences"];
}) {
  const goals = [
    `Plan Intent: ${planningIntent}`,
    `Week Mood: ${weekMood}`,
    `Tradeoff: ${tradeoffPreference}`,
  ];

  if (mainFocus.trim()) {
    goals.push(`Main Focus: ${mainFocus.trim()}`);
  }

  const primaryTarget = preferences?.training.targetEvents?.find(
    (event) => event.id === preferences.training.primaryTargetEventId,
  );

  if (primaryTarget) {
    goals.push(
      `Primary Training Target: ${primaryTarget.title}${primaryTarget.timeHorizonWeeks ? ` in ${primaryTarget.timeHorizonWeeks} weeks` : ""}`,
    );
  }

  if (preferences?.training.platforms?.length) {
    goals.push(`Training platforms: ${preferences.training.platforms.join(", ")}`);
  }

  return goals;
}

export function buildStructuredConstraints({
  strictness,
  avoidThisWeek,
  failureMode,
  adherencePriority,
  changeTolerance,
  regenerationPriority,
  output,
}: {
  strictness: NonNullable<PlanBundleGenerationRequest["strictness"]>;
  avoidThisWeek: string[];
  failureMode: PlanBundleGenerationRequest["failureMode"];
  adherencePriority: NonNullable<PlanBundleGenerationRequest["adherencePriority"]>;
  changeTolerance: NonNullable<PlanBundleGenerationRequest["changeTolerance"]>;
  regenerationPriority: NonNullable<PlanBundleGenerationRequest["regenerationPriority"]>;
  output: NonNullable<PlanBundleGenerationRequest["output"]>;
}) {
  return [
    `Strictness: ${strictness}`,
    `Adherence priority: ${adherencePriority}`,
    `Change tolerance: ${changeTolerance}`,
    `Regeneration priority: ${regenerationPriority}`,
    `Risk tolerance: ${output.riskTolerance ?? "balanced"}`,
    failureMode ? `Avoid failure mode: ${failureMode}` : "",
    ...avoidThisWeek.map((item) => `Avoid this week: ${item}`),
  ].filter(Boolean);
}

export function emptyToUndefined(value: string) {
  return value.trim() ? value.trim() : undefined;
}

export function formatDateRange(startDate: string, endDate: string) {
  return `${formatInputDate(startDate)} bis ${formatInputDate(endDate)}`;
}

export function formatInputDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

export function formatOptionLabel(value: string) {
  const labels: Record<string, string> = {
    omnivore: "Omnivor",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    pescetarian: "Pescetarisch",
  };

  return labels[value] ?? value;
}
