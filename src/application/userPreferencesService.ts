import type { UserId, UserPreferences } from "../domain";
import type { UserPreferencesRepositoryPort } from "./ports";

export class UserPreferencesService {
  constructor(
    private readonly repository: UserPreferencesRepositoryPort,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async getUserPreferences(userId: UserId) {
    return this.repository.getByUserId(userId);
  }

  async getOrCreateUserPreferences(userId: UserId, seed?: Partial<UserPreferences>) {
    const existing = await this.repository.getByUserId(userId);

    if (existing) {
      return existing;
    }

    return this.repository.save(createDefaultUserPreferences(userId, this.clock(), seed));
  }

  saveUserPreferences(preferences: UserPreferences) {
    validateUserPreferences(preferences);
    return this.repository.save({
      ...preferences,
      updatedAt: this.clock(),
      version: preferences.version + 1,
    });
  }
}

export function createDefaultUserPreferences(
  userId: UserId,
  timestamp = new Date().toISOString(),
  seed: Partial<UserPreferences> = {},
): UserPreferences {
  const nutrition: UserPreferences["nutrition"] = {
    dietType: "vegan",
    goals: {
      primary: "health",
      secondary: [],
    },
    allergies: [],
    excludedIngredients: [],
    preferredIngredients: ["Tofu", "Linsen", "Haferflocken", "Gemuese"],
    dailyNutritionTarget: {
      kcal: 2200,
      protein: 140,
      carbs: 250,
      fat: 70,
    },
    proteinPriority: "high",
    weeklyBudgetCents: 2500,
    cookingSkill: "intermediate",
    cookingFrequency: "mixed",
    preferredMealComplexity: "simple",
    mealPrepMinutes: 45,
    leftoverTolerance: "medium",
    recipeRepeatTolerance: "medium",
    eatingOutFrequency: "sometimes",
    foodWasteSensitivity: "medium",
    householdSize: 1,
    cooksForOthers: false,
    sharedMealsPerWeek: 0,
    mealTiming: {
      breakfast: "normal",
      lunch: "normal",
      dinner: "normal",
      snacksPerDay: 1,
    },
    kitchen: {
      availableAppliances: ["oven", "microwave", "fridge", "freezer"],
      applianceNotes: [],
      dryStorageCapacity: "medium",
      mealPrepContainerCount: 4,
      leftoverStorageCapacity: "medium",
      batchCookingCapacity: "medium",
    },
    context: {
      eatsAtWork: false,
      reheatingAvailable: true,
      needsPortableMeals: false,
      maxPortableMealSize: "medium",
      sharedHousehold: false,
    },
    shopping: {
      shoppingPreference: "budget",
      preferredStores: [],
      shoppingDays: ["saturday"],
      shoppingFrequencyPerWeek: 1,
      carryCapacity: "medium",
      bulkBuyingTolerance: "medium",
      stockRotationTolerance: "medium",
    },
    mealsPerDay: 3,
    shoppingPreference: "budget",
  };
  const training: UserPreferences["training"] = {
    trainingGoal: "general-fitness",
    goals: {
      primary: "general_fitness",
      secondary: [],
    },
    experienceLevel: "intermediate",
    sessionsPerWeek: 3,
    minSessionsPerWeek: 2,
    maxSessionsPerWeek: 4,
    preferredDays: ["tuesday", "thursday", "saturday"],
    preferredTrainingTime: "evening",
    preferredTimeWindow: {
      start: "18:00",
      end: "20:00",
    },
    sessionDurationMinutes: 60,
    equipment: ["Kurzhanteln", "Matte"],
    platforms: [],
    recoveryCapacity: "medium",
    primaryConstraint: "time",
    cardioPreference: "moderate",
    strengthPreference: "moderate",
    mobilityPreference: "low",
    injuries: [],
    mobilityRestrictions: [],
    hardConstraints: [],
    noImpact: false,
    noHeavyStrength: false,
    noHighIntensity: false,
    currentMetrics: {
      hrZonesSource: "estimated",
    },
    history: {
      injuryHistory: [],
      sportsBackground: [],
    },
    structure: {
      currentPhase: "maintenance",
      preferredDisciplineMix: ["strength", "mobility"],
      doubleSessionTolerance: "low",
      deloadFrequencyWeeks: 4,
      mustIncludeDisciplines: [],
      excludedDisciplines: [],
    },
    availability: {
      exactTimeBlocks: [],
      preferredRestDaySpacing: "loose",
    },
    targetEvents: [],
    primaryTargetEventId: undefined,
    limitations: [],
    intensityPreference: "moderate",
  };
  const week: UserPreferences["week"] = {
    weekStartsOn: "monday",
    defaultDateRangeLengthDays: 7,
    workBlocks: [
      { day: "monday", start: "09:00", end: "17:00", label: "Arbeit" },
      { day: "tuesday", start: "09:00", end: "17:00", label: "Arbeit" },
      { day: "wednesday", start: "09:00", end: "17:00", label: "Arbeit" },
      { day: "thursday", start: "09:00", end: "17:00", label: "Arbeit" },
      { day: "friday", start: "09:00", end: "15:00", label: "Arbeit" },
    ],
    blockedTimes: [],
    focusAreas: ["Mehr Energie", "Body Recomp", "Stark bleiben"],
    bufferPreference: "balanced",
    planningStyle: "structured",
    energyPattern: "morning",
    deepWorkPreference: "morning",
    socialLoadPreference: "medium",
    maxHardDaysPerWeek: 3,
    maxEventsPerDay: 5,
    maxPlannedHoursPerDay: 10,
    maxContextSwitchesPerDay: 6,
    protectedRestDays: [],
    allowedLateEveningsPerWeek: 1,
    commuteMinutesPerTrip: 0,
    setupBufferMinutes: 10,
    teardownBufferMinutes: 10,
    minimumBufferBetweenBlocksMinutes: 15,
    fixedAppointments: [],
    recurringAppointments: [],
    mustDoBlocks: [],
    optionalBlocks: [],
    householdBlocks: [],
    errandsBlocks: [],
    mealPrepBlocks: [],
    sleep: {
      targetHours: 8,
      earliestBedtime: "21:30",
      latestBedtime: "23:30",
      earliestWakeTime: "06:00",
      latestWakeTime: "08:00",
    },
  };
  const defaults: UserPreferences = {
    id: seed.id ?? userId,
    userId,
    locale: seed.locale ?? "de-DE",
    timezone: seed.timezone ?? "Europe/Berlin",
    units: seed.units ?? "metric",
    nutrition,
    training,
    week,
    notifications: seed.notifications ?? {
      enabled: true,
    },
    createdAt: seed.createdAt ?? timestamp,
    updatedAt: seed.updatedAt ?? timestamp,
    version: seed.version ?? 0,
  };

  return {
    ...defaults,
    nutrition: mergeNested(defaults.nutrition, seed.nutrition),
    training: mergeNested(defaults.training, seed.training),
    week: mergeNested(defaults.week, seed.week),
  };
}

function mergeNested<T extends object>(defaults: T, seed?: Partial<T>): T {
  if (!seed) {
    return defaults;
  }

  const merged = { ...defaults, ...seed } as T;
  const defaultRecord = defaults as Record<string, unknown>;
  const seedRecord = seed as Record<string, unknown>;
  const mergedRecord = merged as Record<string, unknown>;

  for (const key of Object.keys(defaultRecord)) {
    const defaultValue = defaultRecord[key];
    const seedValue = seedRecord[key];

    if (
      defaultValue &&
      seedValue &&
      typeof defaultValue === "object" &&
      typeof seedValue === "object" &&
      !Array.isArray(defaultValue) &&
      !Array.isArray(seedValue)
    ) {
      mergedRecord[key] = { ...defaultValue, ...seedValue };
    }
  }

  return merged;
}

function validateUserPreferences(preferences: UserPreferences) {
  if (!preferences.userId.trim()) {
    throw new Error("UserPreferences userId is required.");
  }

  if (preferences.nutrition.mealsPerDay < 1 || preferences.nutrition.mealsPerDay > 8) {
    throw new Error("Nutrition mealsPerDay is invalid.");
  }

  if (
    preferences.training.sessionsPerWeek < 0 ||
    preferences.training.sessionsPerWeek > 14
  ) {
    throw new Error("Training sessionsPerWeek is invalid.");
  }

  if (
    preferences.training.minSessionsPerWeek !== undefined &&
    preferences.training.maxSessionsPerWeek !== undefined &&
    preferences.training.minSessionsPerWeek > preferences.training.maxSessionsPerWeek
  ) {
    throw new Error("Training minSessionsPerWeek must not exceed maxSessionsPerWeek.");
  }

  for (const targetEvent of preferences.training.targetEvents ?? []) {
    if (!targetEvent.id.trim() || !targetEvent.title.trim()) {
      throw new Error("Training target event id and title are required.");
    }

    if (targetEvent.distanceKm !== undefined && targetEvent.distanceKm <= 0) {
      throw new Error("Training target event distanceKm is invalid.");
    }

    if (targetEvent.timeHorizonWeeks !== undefined && targetEvent.timeHorizonWeeks <= 0) {
      throw new Error("Training target event timeHorizonWeeks is invalid.");
    }
  }

  if (
    preferences.training.primaryTargetEventId &&
    !(preferences.training.targetEvents ?? []).some(
      (targetEvent) => targetEvent.id === preferences.training.primaryTargetEventId,
    )
  ) {
    throw new Error("Training primaryTargetEventId does not match a target event.");
  }

  if (
    preferences.week.defaultDateRangeLengthDays < 1 ||
    preferences.week.defaultDateRangeLengthDays > 14
  ) {
    throw new Error("Week defaultDateRangeLengthDays is invalid.");
  }

  if (
    preferences.week.maxHardDaysPerWeek !== undefined &&
    (preferences.week.maxHardDaysPerWeek < 0 || preferences.week.maxHardDaysPerWeek > 7)
  ) {
    throw new Error("Week maxHardDaysPerWeek is invalid.");
  }

  if (
    preferences.week.maxEventsPerDay !== undefined &&
    preferences.week.maxEventsPerDay < 0
  ) {
    throw new Error("Week maxEventsPerDay is invalid.");
  }

  validateTimeBlocks(preferences.week.fixedAppointments ?? []);
  validateTimeBlocks(preferences.week.mustDoBlocks ?? []);
  validateTimeBlocks(preferences.week.optionalBlocks ?? []);
  validateTimeBlocks(preferences.week.householdBlocks ?? []);
  validateTimeBlocks(preferences.week.errandsBlocks ?? []);
  validateTimeBlocks(preferences.week.mealPrepBlocks ?? []);
  validateTimeBlocks(preferences.training.availability?.exactTimeBlocks ?? []);
}

function validateTimeBlocks(blocks: Array<{ id: string; title: string; start: string; end: string }>) {
  for (const block of blocks) {
    if (!block.id.trim() || !block.title.trim()) {
      throw new Error("Time block id and title are required.");
    }

    if (block.start && block.end && block.start >= block.end) {
      throw new Error(`Time block ${block.id} end must be after start.`);
    }
  }
}
