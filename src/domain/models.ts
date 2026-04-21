export type EntityId = string;
export type UserId = string;
export type ISODateString = string;

export interface DateRange {
  startDate: ISODateString;
  endDate: ISODateString;
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
