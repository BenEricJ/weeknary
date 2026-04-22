import type {
  ConstraintsProfile,
  CurrentState,
  DateRange,
  EntityId,
  FailureMode,
  MealPlan,
  MealSlotType,
  OutputPreferences,
  PlanIntent,
  Profile,
  Strictness,
  TrainingPlan,
  TradeoffPreference,
  UserPreferences,
  UserId,
  WeekMood,
  WeekPlan,
  WeekPlanEventCategory,
} from "../domain";
import type { MealPlanService } from "./mealPlanService";
import type { TrainingPlanService } from "./trainingPlanService";
import type { WeekPlanService } from "./weekPlanService";

export type PlanBundleActivationMode = "draft" | "activate";

export interface PlanBundleGenerationRequest {
  dateRange: DateRange;
  timezone: "Europe/Berlin";
  locale: "de-DE";
  goals: string[];
  constraints: string[];
  startingPoint: "new" | "previous-week" | "current-plan";
  userNotes: string;
  planningIntent?: PlanIntent;
  weekMood?: WeekMood;
  strictness?: Strictness;
  mainFocus?: string;
  avoidThisWeek?: string[];
  specialNotes?: string;
  tradeoffPreference?: TradeoffPreference;
  adherencePriority?: "low" | "medium" | "high";
  changeTolerance?: "low" | "medium" | "high";
  regenerationPriority?: "low" | "medium" | "high";
  failureMode?: FailureMode;
  constraintsProfile?: ConstraintsProfile;
  state?: CurrentState;
  output?: OutputPreferences;
  profile?: Profile;
  preferences?: UserPreferences;
}

export interface GeneratedPlanBundle {
  bundleId: EntityId;
  summary: string;
  warnings: string[];
  mealPlan: MealPlan;
  trainingPlan: TrainingPlan;
  weekPlan: WeekPlan;
}

export interface SavedPlanBundle {
  mode: PlanBundleActivationMode;
  mealPlan: MealPlan;
  trainingPlan: TrainingPlan;
  weekPlan: WeekPlan;
}

export interface PlanBundleGeneratorPort {
  generatePlanBundle(request: PlanBundleGenerationRequest): Promise<GeneratedPlanBundle>;
}

export interface PlanBundleServiceDependencies {
  generator: PlanBundleGeneratorPort;
  mealPlanService: MealPlanService;
  trainingPlanService: TrainingPlanService;
  weekPlanService: WeekPlanService;
  clock?: () => string;
}

const PLAN_STATUSES = new Set(["draft", "active", "archived"]);
const PLAN_SOURCES = new Set(["user", "import", "generated", "system"]);
const MEAL_SLOT_TYPES = new Set<MealSlotType>([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);
const WEEK_EVENT_CATEGORIES = new Set<WeekPlanEventCategory>([
  "arbeit",
  "training",
  "nutrition",
  "sozial",
  "erholung",
  "orga",
  "mobilitaet",
  "lernen",
  "ehrenamt",
]);

export class PlanBundleService {
  private readonly clock: () => string;

  constructor(private readonly dependencies: PlanBundleServiceDependencies) {
    this.clock = dependencies.clock ?? (() => new Date().toISOString());
  }

  async generatePlanBundle(request: PlanBundleGenerationRequest) {
    validateGenerationRequest(request);
    const bundle = await this.dependencies.generator.generatePlanBundle(request);
    validateGeneratedPlanBundle(bundle);
    return bundle;
  }

  async savePlanBundle(
    userId: UserId,
    bundle: GeneratedPlanBundle,
    mode: PlanBundleActivationMode,
  ): Promise<SavedPlanBundle> {
    validateGeneratedPlanBundle(bundle);
    const normalized = normalizeBundleForSave(userId, bundle, this.clock());

    const [mealPlan, trainingPlan, weekPlan] = await Promise.all([
      this.dependencies.mealPlanService.saveMealPlan(normalized.mealPlan),
      this.dependencies.trainingPlanService.saveTrainingPlan(normalized.trainingPlan),
      this.dependencies.weekPlanService.saveWeekPlan(normalized.weekPlan),
    ]);

    if (mode === "draft") {
      return { mode, mealPlan, trainingPlan, weekPlan };
    }

    const [activeMealPlan, activeTrainingPlan, activeWeekPlan] = await Promise.all([
      this.dependencies.mealPlanService.activateMealPlan(userId, mealPlan.id),
      this.dependencies.trainingPlanService.activateTrainingPlan(userId, trainingPlan.id),
      this.dependencies.weekPlanService.activateWeekPlan(userId, weekPlan.id),
    ]);

    return {
      mode,
      mealPlan: activeMealPlan,
      trainingPlan: activeTrainingPlan,
      weekPlan: activeWeekPlan,
    };
  }
}

function normalizeBundleForSave(
  userId: UserId,
  bundle: GeneratedPlanBundle,
  timestamp: string,
): GeneratedPlanBundle {
  return {
    ...bundle,
    mealPlan: normalizePlan(bundle.mealPlan, userId, timestamp),
    trainingPlan: normalizePlan(bundle.trainingPlan, userId, timestamp),
    weekPlan: normalizePlan(bundle.weekPlan, userId, timestamp),
  };
}

function normalizePlan<TPlan extends MealPlan | TrainingPlan | WeekPlan>(
  plan: TPlan,
  userId: UserId,
  timestamp: string,
): TPlan {
  return {
    ...plan,
    userId,
    status: "draft",
    source: "generated",
    createdAt: plan.createdAt || timestamp,
    updatedAt: timestamp,
    version: 0,
  };
}

function validateGenerationRequest(request: PlanBundleGenerationRequest) {
  if (request.dateRange.startDate > request.dateRange.endDate) {
    throw new Error("Plan bundle date range is invalid.");
  }

  if (request.timezone !== "Europe/Berlin") {
    throw new Error("Plan bundle timezone must be Europe/Berlin.");
  }

  if (request.locale !== "de-DE") {
    throw new Error("Plan bundle locale must be de-DE.");
  }
}

export function validateGeneratedPlanBundle(bundle: GeneratedPlanBundle) {
  if (!bundle.bundleId.trim()) {
    throw new Error("Plan bundle id is required.");
  }

  validateMealPlan(bundle.mealPlan);
  validateTrainingPlan(bundle.trainingPlan);
  validateWeekPlan(bundle.weekPlan);
  validateCrossPlanLinks(bundle);
}

function validatePlanMetadata(plan: MealPlan | TrainingPlan | WeekPlan, label: string) {
  if (!plan.id.trim()) {
    throw new Error(`${label} id is required.`);
  }

  if (!plan.userId.trim()) {
    throw new Error(`${label} userId is required.`);
  }

  if (!plan.title.trim()) {
    throw new Error(`${label} title is required.`);
  }

  if (!PLAN_STATUSES.has(plan.status)) {
    throw new Error(`${label} status is invalid.`);
  }

  if (!PLAN_SOURCES.has(plan.source)) {
    throw new Error(`${label} source is invalid.`);
  }

  if (plan.dateRange.startDate > plan.dateRange.endDate) {
    throw new Error(`${label} date range is invalid.`);
  }
}

function validateMealPlan(plan: MealPlan) {
  validatePlanMetadata(plan, "MealPlan");

  for (const day of plan.days) {
    if (day.date < plan.dateRange.startDate || day.date > plan.dateRange.endDate) {
      throw new Error(`MealPlan day ${day.date} is outside the plan range.`);
    }

    for (const slot of day.meals) {
      if (!MEAL_SLOT_TYPES.has(slot.slotType)) {
        throw new Error(`MealPlan slot ${slot.id} has an invalid slot type.`);
      }

      if (!slot.recipeId && !slot.title && !slot.external) {
        throw new Error(`MealPlan slot ${slot.id} needs recipeId, title, or external=true.`);
      }
    }
  }

  for (const recipe of plan.recipes) {
    if (!recipe.id.trim() || !recipe.name.trim()) {
      throw new Error("MealPlan recipe id and name are required.");
    }
  }
}

function validateTrainingPlan(plan: TrainingPlan) {
  validatePlanMetadata(plan, "TrainingPlan");

  for (const day of plan.days) {
    if (day.date < plan.dateRange.startDate || day.date > plan.dateRange.endDate) {
      throw new Error(`TrainingPlan day ${day.date} is outside the plan range.`);
    }

    for (const workout of day.workouts) {
      if (!workout.id.trim() || !workout.title.trim()) {
        throw new Error("TrainingPlan workout id and title are required.");
      }

      if (workout.start && workout.end && workout.start >= workout.end) {
        throw new Error(`TrainingPlan workout ${workout.id} end must be after start.`);
      }
    }
  }
}

function validateWeekPlan(plan: WeekPlan) {
  validatePlanMetadata(plan, "WeekPlan");

  for (const event of plan.events) {
    if (!event.id.trim() || !event.title.trim()) {
      throw new Error("WeekPlan event id and title are required.");
    }

    if (event.date < plan.dateRange.startDate || event.date > plan.dateRange.endDate) {
      throw new Error(`WeekPlan event ${event.id} is outside the plan range.`);
    }

    if (!WEEK_EVENT_CATEGORIES.has(event.category)) {
      throw new Error(`WeekPlan event ${event.id} has an invalid category.`);
    }

    if (event.start && event.end && event.start >= event.end) {
      throw new Error(`WeekPlan event ${event.id} end must be after start.`);
    }
  }
}

function validateCrossPlanLinks(bundle: GeneratedPlanBundle) {
  const mealSlotIds = new Set(
    bundle.mealPlan.days.flatMap((day) => day.meals.map((slot) => slot.id)),
  );
  const trainingWorkoutIds = new Set([
    ...bundle.trainingPlan.workouts.map((workout) => workout.id),
    ...bundle.trainingPlan.days.flatMap((day) =>
      day.workouts.map((workout) => workout.id),
    ),
  ]);

  for (const event of bundle.weekPlan.events) {
    if (event.linkedMealSlotId && !mealSlotIds.has(event.linkedMealSlotId)) {
      throw new Error(`WeekPlan event ${event.id} links to an unknown meal slot.`);
    }

    if (
      event.linkedTrainingWorkoutId &&
      !trainingWorkoutIds.has(event.linkedTrainingWorkoutId)
    ) {
      throw new Error(`WeekPlan event ${event.id} links to an unknown workout.`);
    }
  }
}
