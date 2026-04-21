export type EntityId = string;
export type UserId = string;
export type ISODateString = string;

export interface DateRange {
  startDate: ISODateString;
  endDate: ISODateString;
}

export type LocaleCode = "de-DE";
export type Timezone = "Europe/Berlin";
export type UnitsPreference = "metric";
export type ActivityLevel = "low" | "medium" | "high";
export type DietType = "omnivore" | "vegetarian" | "vegan" | "pescetarian";
export type ShoppingPreference = "budget" | "balanced" | "convenience";
export type TrainingGoal = "strength" | "hypertrophy" | "endurance" | "mobility" | "general-fitness";
export type TrainingExperienceLevel = "beginner" | "intermediate" | "advanced";
export type IntensityPreference = "low" | "moderate" | "high";
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
export type BufferPreference = "compact" | "balanced" | "spacious";
export type PlanningStyle = "structured" | "flexible" | "minimal";

export interface UserScopedMetadata {
  id: EntityId;
  userId: UserId;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends UserScopedMetadata {
  displayName: string;
  avatarUrl?: string;
  birthYear?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel: ActivityLevel;
}

export interface NutritionPreferences {
  dietType: DietType;
  allergies: string[];
  excludedIngredients: string[];
  preferredIngredients: string[];
  dailyNutritionTarget: NutritionSummary;
  weeklyBudgetCents?: number;
  mealPrepMinutes?: number;
  mealsPerDay: number;
  shoppingPreference: ShoppingPreference;
}

export interface TrainingPreferences {
  trainingGoal: TrainingGoal;
  experienceLevel: TrainingExperienceLevel;
  sessionsPerWeek: number;
  preferredDays: Weekday[];
  preferredTimeWindow?: {
    start: string;
    end: string;
  };
  sessionDurationMinutes?: number;
  equipment: string[];
  limitations: string[];
  intensityPreference: IntensityPreference;
}

export interface WeekTimeBlock {
  day: Weekday;
  start: string;
  end: string;
  label?: string;
}

export interface WeekPreferences {
  weekStartsOn: Weekday;
  defaultDateRangeLengthDays: number;
  workBlocks: WeekTimeBlock[];
  blockedTimes: WeekTimeBlock[];
  focusAreas: string[];
  bufferPreference: BufferPreference;
  planningStyle: PlanningStyle;
}

export interface NotificationPreferences {
  enabled: boolean;
}

export interface UserPreferences extends UserScopedMetadata {
  locale: LocaleCode;
  timezone: Timezone;
  units: UnitsPreference;
  nutrition: NutritionPreferences;
  training: TrainingPreferences;
  week: WeekPreferences;
  notifications: NotificationPreferences;
}

export type PlanStatus = "draft" | "active" | "archived";
export type PlanSource = "user" | "import" | "generated" | "system";

export interface PlanMetadata {
  id: EntityId;
  userId: UserId;
  title: string;
  status: PlanStatus;
  source: PlanSource;
  version: number;
  dateRange: DateRange;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type WeekPlanEventCategory =
  | "arbeit"
  | "training"
  | "nutrition"
  | "sozial"
  | "erholung"
  | "orga"
  | "mobilitaet"
  | "lernen"
  | "ehrenamt";

export interface WeekPlanEvent {
  id: EntityId;
  title: string;
  date: ISODateString;
  category: WeekPlanEventCategory;
  allDay?: boolean;
  start?: string;
  end?: string;
  subtitle?: string;
  notes?: string;
  linkedMealSlotId?: EntityId;
  linkedTrainingWorkoutId?: EntityId;
  taskIds?: EntityId[];
  tasks?: string[];
}

export interface WeekPlanFocusItem {
  id: EntityId;
  title: string;
  completed?: boolean;
}

export interface WeekPlan extends PlanMetadata {
  events: WeekPlanEvent[];
  focusItems: WeekPlanFocusItem[];
}

export type MealSlotType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealPlanIngredient {
  name: string;
  amount?: number | string;
  unit?: string;
}

export interface NutritionSummary {
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealRecipe {
  id: EntityId;
  name: string;
  ingredients: MealPlanIngredient[];
  nutrition?: NutritionSummary;
}

export interface MealSlot {
  id: EntityId;
  slotType: MealSlotType;
  recipeId?: EntityId;
  title?: string;
  external?: boolean;
}

export interface MealPlanDay {
  date: ISODateString;
  meals: MealSlot[];
  targets?: NutritionSummary;
}

export interface MealPlan extends PlanMetadata {
  days: MealPlanDay[];
  recipes: MealRecipe[];
  targets?: NutritionSummary;
  shoppingList: string[];
}

export interface TrainingWorkout {
  id: EntityId;
  title: string;
  referenceWorkoutId?: EntityId;
  target?: string;
  notes?: string;
  start?: string;
  end?: string;
}

export interface TrainingPlanDay {
  date: ISODateString;
  workouts: TrainingWorkout[];
}

export interface TrainingPlanGoal {
  id: EntityId;
  title: string;
}

export interface TrainingPlan extends PlanMetadata {
  days: TrainingPlanDay[];
  workouts: TrainingWorkout[];
  goals: TrainingPlanGoal[];
}
