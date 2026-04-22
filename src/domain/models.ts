export type EntityId = string;
export type UserId = string;
export type ISODateString = string;

export interface DateRange {
  startDate: ISODateString;
  endDate: ISODateString;
}

export interface TimeWindow {
  start: string;
  end: string;
}

export interface TimeBlock {
  id: EntityId;
  title: string;
  category: TimeBlockCategory;
  start: string;
  end: string;
  isFixed: boolean;
  priority?: Level3;
  energyDemand?: EnergyDemand;
  location?: string;
  notes?: string;
}

export interface RecurringTimeBlock {
  id: EntityId;
  title: string;
  category: TimeBlockCategory;
  weekday: Weekday;
  start: string;
  end: string;
  isFixed: boolean;
  priority?: Level3;
  energyDemand?: EnergyDemand;
  location?: string;
  notes?: string;
}

export type LocaleCode = "de-DE";
export type Timezone = "Europe/Berlin";
export type UnitsPreference = "metric";
export type Level3 = "low" | "medium" | "high";
export type Strictness = "loose" | "balanced" | "strict";
export type ActivityLevel = "low" | "medium" | "high";
export type DietType = "omnivore" | "vegetarian" | "vegan" | "pescetarian";
export type NutritionGoal =
  | "maintain"
  | "fat_loss"
  | "muscle_gain"
  | "performance"
  | "health";
export type ShoppingPreference = "budget" | "balanced" | "convenience";
export type TrainingGoal = "strength" | "hypertrophy" | "endurance" | "mobility" | "general-fitness";
export type TrainingProfileGoal =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "mobility"
  | "general_fitness";
export type TrainingExperienceLevel = "beginner" | "intermediate" | "advanced";
export type IntensityPreference = "low" | "moderate" | "high";
export type TrainingPhase = "base" | "build" | "peak" | "deload" | "maintenance";
export type PrimaryConstraint = "time" | "fatigue" | "equipment" | "motivation" | "injury";
export type MealComplexity = "simple" | "normal" | "elaborate";
export type CookingSkill = "basic" | "intermediate" | "advanced";
export type CookingFrequency = "daily" | "batch" | "mixed" | "minimal";
export type EatingOutFrequency = "never" | "rare" | "sometimes" | "often";
export type ProteinPriority = "normal" | "high" | "very_high";
export type AppetitePattern = "low" | "normal" | "high" | "variable";
export type MealStructure = "fixed" | "flexible" | "chaotic";
export type AdherenceLevel = "low" | "medium" | "high";
export type ShoppingCarryCapacity = "low" | "medium" | "high";
export type StorageCapacity = "low" | "medium" | "high";
export type PortableMealSize = "small" | "medium" | "large";
export type MealSize = "none" | "light" | "normal" | "big";
export type CardioPreference = "none" | "low" | "moderate" | "high";
export type StrengthPreference = "none" | "low" | "moderate" | "high";
export type MobilityPreference = "none" | "low" | "moderate" | "high";
export type PlanIntent =
  | "reset"
  | "optimize"
  | "maintain"
  | "build_routine"
  | "busy_week";
export type WeekMood = "calm" | "productive" | "athletic" | "social" | "recovery";
export type CommunicationStyle = "casual_de" | "direct_de" | "coaching_de";
export type TradeoffPreference =
  | "consistency"
  | "performance"
  | "flexibility"
  | "recovery";
export type PlanFormat = "calendar" | "checklist" | "timeline" | "cards";
export type ConflictResolutionStyle = "strict" | "suggestive" | "adaptive";
export type TimeBlockCategory =
  | "work"
  | "training"
  | "meal"
  | "recovery"
  | "social"
  | "admin"
  | "commute"
  | "sleep"
  | "household"
  | "errand"
  | "custom";
export type EnergyDemand = "low" | "medium" | "high";
export type TrainingTargetEventType =
  | "running_race"
  | "cycling_event"
  | "triathlon"
  | "strength_test"
  | "mobility_goal"
  | "other";
export type KitchenAppliance =
  | "stand_mixer"
  | "food_processor"
  | "blender"
  | "vacuum_sealer"
  | "oven"
  | "microwave"
  | "air_fryer"
  | "rice_cooker"
  | "pressure_cooker"
  | "slow_cooker"
  | "toaster"
  | "induction_stove"
  | "gas_stove"
  | "fridge"
  | "freezer";
export type HRZonesSource = "estimated" | "tested" | "device_based";
export type FailureMode =
  | "overeating"
  | "under_eating"
  | "overplanning"
  | "underplanning"
  | "fatigue"
  | "time_loss"
  | "social_disruption"
  | "inconsistency";
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
export type PlanningPersona = "structured" | "flexible" | "minimalist";
export type EnergyPattern = "morning" | "afternoon" | "evening" | "variable";
export type TimePreference = "morning" | "midday" | "evening" | "flexible";
export type DetailLevel = "compact" | "normal" | "detailed";
export type ExplanationLevel = "none" | "short" | "detailed";
export type RiskTolerance = "conservative" | "balanced" | "ambitious";
export type SorenessLevel = "none" | "low" | "medium" | "high";

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
  planningPersona?: PlanningPersona;
}

export interface NutritionPreferences {
  dietType: DietType;
  goals?: {
    primary?: NutritionGoal;
    secondary?: NutritionGoal[];
  };
  allergies: string[];
  excludedIngredients: string[];
  preferredIngredients: string[];
  dailyNutritionTarget: NutritionSummary;
  proteinPriority?: ProteinPriority;
  weeklyBudgetCents?: number;
  cookingSkill?: CookingSkill;
  cookingFrequency?: CookingFrequency;
  preferredMealComplexity?: MealComplexity;
  mealPrepMinutes?: number;
  leftoverTolerance?: Level3;
  recipeRepeatTolerance?: Level3;
  eatingOutFrequency?: EatingOutFrequency;
  foodWasteSensitivity?: Level3;
  householdSize?: number;
  cooksForOthers?: boolean;
  sharedMealsPerWeek?: number;
  mealTiming?: PreferredMealTiming;
  kitchen?: KitchenPreferences;
  context?: NutritionContextPreferences;
  shopping?: NutritionShoppingPreferences;
  mealsPerDay: number;
  shoppingPreference: ShoppingPreference;
}

export interface TrainingPreferences {
  trainingGoal: TrainingGoal;
  goals?: {
    primary?: TrainingProfileGoal;
    secondary?: TrainingProfileGoal[];
  };
  experienceLevel: TrainingExperienceLevel;
  sessionsPerWeek: number;
  minSessionsPerWeek?: number;
  maxSessionsPerWeek?: number;
  preferredDays: Weekday[];
  preferredTrainingTime?: TimePreference;
  preferredTimeWindow?: {
    start: string;
    end: string;
  };
  sessionDurationMinutes?: number;
  equipment: string[];
  platforms?: string[];
  recoveryCapacity?: Level3;
  primaryConstraint?: PrimaryConstraint;
  cardioPreference?: CardioPreference;
  strengthPreference?: StrengthPreference;
  mobilityPreference?: MobilityPreference;
  injuries?: string[];
  mobilityRestrictions?: string[];
  hardConstraints?: string[];
  noImpact?: boolean;
  noHeavyStrength?: boolean;
  noHighIntensity?: boolean;
  currentMetrics?: TrainingMetrics;
  history?: TrainingHistory;
  structure?: TrainingStructure;
  availability?: TrainingAvailability;
  targetEvents?: TrainingTargetEvent[];
  primaryTargetEventId?: EntityId;
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
  energyPattern?: EnergyPattern;
  deepWorkPreference?: "morning" | "afternoon" | "evening" | "none";
  socialLoadPreference?: Level3;
  maxHardDaysPerWeek?: number;
  maxEventsPerDay?: number;
  maxPlannedHoursPerDay?: number;
  maxContextSwitchesPerDay?: number;
  protectedRestDays?: Weekday[];
  allowedLateEveningsPerWeek?: number;
  commuteMinutesPerTrip?: number;
  setupBufferMinutes?: number;
  teardownBufferMinutes?: number;
  minimumBufferBetweenBlocksMinutes?: number;
  fixedAppointments?: TimeBlock[];
  recurringAppointments?: RecurringTimeBlock[];
  mustDoBlocks?: TimeBlock[];
  optionalBlocks?: TimeBlock[];
  householdBlocks?: TimeBlock[];
  errandsBlocks?: TimeBlock[];
  mealPrepBlocks?: TimeBlock[];
  sleep?: SleepPreferences;
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

export interface PreferredMealTiming {
  breakfast?: MealSize;
  lunch?: MealSize;
  dinner?: MealSize;
  snacksPerDay?: number;
}

export interface KitchenPreferences {
  availableAppliances?: KitchenAppliance[];
  applianceNotes?: string[];
  fridgeVolumeLiters?: number;
  freezerVolumeLiters?: number;
  dryStorageCapacity?: StorageCapacity;
  mealPrepContainerCount?: number;
  leftoverStorageCapacity?: StorageCapacity;
  batchCookingCapacity?: StorageCapacity;
}

export interface NutritionContextPreferences {
  eatsAtWork?: boolean;
  reheatingAvailable?: boolean;
  needsPortableMeals?: boolean;
  maxPortableMealSize?: PortableMealSize;
  sharedHousehold?: boolean;
}

export interface NutritionShoppingPreferences {
  shoppingPreference?: ShoppingPreference;
  preferredStores?: string[];
  shoppingDays?: Weekday[];
  shoppingFrequencyPerWeek?: number;
  maxCarryWeightKg?: number;
  carryCapacity?: ShoppingCarryCapacity;
  bulkBuyingTolerance?: Level3;
  stockRotationTolerance?: Level3;
}

export interface TrainingMetrics {
  ftp?: number;
  thresholdPaceMinPerKm?: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  vo2maxEstimate?: number;
  hrZonesSource?: HRZonesSource;
}

export interface TrainingTargetEvent {
  id: EntityId;
  title: string;
  type: TrainingTargetEventType;
  targetDate?: ISODateString;
  timeHorizonWeeks?: number;
  distanceKm?: number;
  targetTime?: string;
  priority: Level3;
  notes?: string;
}

export interface TrainingHistory {
  yearsOfConsistentTraining?: number;
  injuryHistory?: string[];
  sportsBackground?: string[];
}

export interface TrainingStructure {
  currentPhase?: TrainingPhase;
  preferredDisciplineMix?: Array<
    "strength" | "cycling" | "running" | "swimming" | "mobility"
  >;
  weeklyVolumeTargetMinutes?: number;
  weeklyVolumeCapMinutes?: number;
  doubleSessionTolerance?: Level3;
  deloadFrequencyWeeks?: number;
  mustIncludeDisciplines?: string[];
  excludedDisciplines?: string[];
}

export interface TrainingAvailability {
  exactTimeBlocks?: TimeBlock[];
  preferredRestDaySpacing?: "none" | "loose" | "strict";
}

export interface SleepPreferences {
  targetHours?: number;
  earliestBedtime?: string;
  latestBedtime?: string;
  earliestWakeTime?: string;
  latestWakeTime?: string;
}

export interface ConstraintsProfile {
  hardConstraints?: string[];
  softConstraints?: string[];
  nonNegotiables?: string[];
  schedule?: {
    fixedAppointments?: TimeBlock[];
    recurringAppointments?: RecurringTimeBlock[];
    blackoutDates?: ISODateString[];
    minimumBufferBetweenBlocksMinutes?: number;
    maxPlannedHoursPerDay?: number;
  };
  sleep?: SleepPreferences;
  health?: {
    injuries?: string[];
    painPoints?: string[];
    medicalNotes?: string[];
    recoveryLimitations?: string[];
  };
  energy?: {
    maxHardSessionsPerWeek?: number;
    maxCognitiveLoadBlocksPerDay?: number;
    preferredRecoveryDaySpacing?: "none" | "loose" | "strict";
  };
}

export interface CurrentState {
  today?: {
    weightKg?: number;
    sleepHoursLastNight?: number;
    sleepQuality?: Level3;
    energyLevel?: Level3;
    stressLevel?: Level3;
    sorenessLevel?: SorenessLevel;
    motivationLevel?: Level3;
    mentalLoad?: Level3;
    physicalFatigue?: Level3;
    notes?: string;
  };
  week?: {
    averageSleepHours?: number;
    recoveryStatus?: Level3;
    schedulePressure?: Level3;
  };
  nutrition?: {
    currentMealStructure?: MealStructure;
    adherenceLevel?: AdherenceLevel;
    appetitePattern?: AppetitePattern;
  };
  training?: {
    currentPhase?: TrainingPhase;
    currentFitnessLevel?: Level3;
    currentFatigueLevel?: Level3;
    currentSorenessLevel?: SorenessLevel;
    averageSessionsPerWeekLast4Weeks?: number;
    averageMinutesPerWeekLast4Weeks?: number;
    recentLongestSessionMinutes?: number;
  };
}

export interface OutputPreferences {
  detailLevel?: DetailLevel;
  explanationLevel?: ExplanationLevel;
  riskTolerance?: RiskTolerance;
  communicationStyle?: CommunicationStyle;
  format?: PlanFormat;
  conflictResolutionStyle?: ConflictResolutionStyle;
  includeAlternatives?: boolean;
  includePrepSteps?: boolean;
  includeShoppingList?: boolean;
  includeRationale?: boolean;
  includeFallbacks?: boolean;
  includeRecoveryNotes?: boolean;
  includeLeftoverPlan?: boolean;
  includeStorageHints?: boolean;
  includeBatchCookingPlan?: boolean;
  includeTimeEstimates?: boolean;
  includeConstraintWarnings?: boolean;
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
