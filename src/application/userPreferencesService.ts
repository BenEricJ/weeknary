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
  return {
    id: seed.id ?? userId,
    userId,
    locale: seed.locale ?? "de-DE",
    timezone: seed.timezone ?? "Europe/Berlin",
    units: seed.units ?? "metric",
    nutrition: seed.nutrition ?? {
      dietType: "vegan",
      allergies: [],
      excludedIngredients: [],
      preferredIngredients: ["Tofu", "Linsen", "Haferflocken", "Gemuese"],
      dailyNutritionTarget: {
        kcal: 2200,
        protein: 140,
        carbs: 250,
        fat: 70,
      },
      weeklyBudgetCents: 2500,
      mealPrepMinutes: 45,
      mealsPerDay: 3,
      shoppingPreference: "budget",
    },
    training: seed.training ?? {
      trainingGoal: "general-fitness",
      experienceLevel: "intermediate",
      sessionsPerWeek: 3,
      preferredDays: ["tuesday", "thursday", "saturday"],
      preferredTimeWindow: {
        start: "18:00",
        end: "20:00",
      },
      sessionDurationMinutes: 60,
      equipment: ["Kurzhanteln", "Matte"],
      limitations: [],
      intensityPreference: "moderate",
    },
    week: seed.week ?? {
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
    },
    notifications: seed.notifications ?? {
      enabled: true,
    },
    createdAt: seed.createdAt ?? timestamp,
    updatedAt: seed.updatedAt ?? timestamp,
    version: seed.version ?? 0,
  };
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
    preferences.week.defaultDateRangeLengthDays < 1 ||
    preferences.week.defaultDateRangeLengthDays > 14
  ) {
    throw new Error("Week defaultDateRangeLengthDays is invalid.");
  }
}
