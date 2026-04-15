export type MealSlotType = "breakfast" | "lunch" | "dinner" | "snack";

export interface NutritionTargets {
  kcalTarget: number;
  proteinTarget: number;
}

export interface MacroEstimate {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  breakdown?: NutritionBreakdown;
  estimated?: boolean;
  note?: string;
}

export interface NutritionBreakdown {
  fiber: number;
  sugar: number;
  addedSugar: number;
  saturatedFat: number;
  monounsaturatedFat: number;
  polyunsaturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  salt: number;
  water: number;
  alcohol: number;
  biotin: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
  iron: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  zinc: number;
}

export interface MealIngredient {
  ingredient: string;
  amount: number | string;
  unit: string;
}

export interface MealRecipe {
  id: string;
  name: string;
  use: string;
  cookTime: string;
  batchServings: number;
  ingredients: MealIngredient[];
  preparation: string[];
  tags: string[];
  nutrition?: MacroEstimate;
}

export interface MealSlot {
  slot: MealSlotType;
  mealType: "recipe" | "external";
  mealId?: string;
  isExternal: boolean;
}

export interface NutritionTemplate {
  name: string;
  use: string;
  base: string;
}

export interface LeftoverRule {
  sourceMealName: string;
  amount: string;
  targetDayShort: string;
  note: string;
}

export interface MealPrepBlock {
  dayShort: string;
  durationMin: number;
  plan: string[];
  benefits: string[];
}

export interface CriticalNutrientTip {
  nutrient: string;
  status: "good" | "attention" | "supplement";
  action: string;
}

export interface ExternalMealGuidance {
  title: string;
  kcalRange: string;
  proteinRange: string;
  assumptions: string[];
  tips: string[];
  warning: string;
}

export interface WeeklyBudgetSummary {
  budgetHardCap: number;
  shoppingCost: number;
  pantryShare: number;
  totalCost: number;
  status: string;
  note: string;
}

export interface ShoppingPantryItem {
  product: string;
  amount: string;
  use: string;
}

export interface ShoppingListItem {
  product: string;
  plannedAmount: string;
  priceReference: string;
  weeklyCost: number;
  use: string[];
}

export interface ShoppingStore {
  store: string;
  items: ShoppingListItem[];
}

export interface BulkPantryCost {
  product: string;
  plannedAmount: string;
  costShare: number;
  priceStatus: string;
}

export interface NutrientReviewRow {
  nutrient: string;
  target: string;
  planValue: string;
  rating: string;
  mainSources: string[];
  correction: string;
}

export interface WeeklyReview {
  strengths: string[];
  gapsAndActions: string[];
  criticismAndCounterpoints: string[];
}

export interface NutritionShoppingAndReview {
  pantry: ShoppingPantryItem[];
  stores: ShoppingStore[];
  bulkPantryDetails: BulkPantryCost[];
  costDrivers: string[];
  priceJumpAlternatives: string[];
  nutrients: NutrientReviewRow[];
  review: WeeklyReview;
}

export interface NutritionWeekMeta {
  planLabel: string;
  startIsoDate: string;
  endIsoDate: string;
  weekStartLabel: string;
  persons: number;
  mode: string;
  optimizationLogic: string[];
  assumptions: string[];
  microRoutine: string[];
  criticalNutrients: string[];
}

export interface NutritionDay {
  dayShort: string;
  dayLabel: string;
  isoDate: string;
  date: number;
  monthLabel: string;
  training: string;
  targets: NutritionTargets;
  kcalBasis: number;
  kcalTrainingPlus: number;
  plannedKcal: number;
  plannedProtein: number;
  hint: string;
  dailyLogic: string;
  meals: MealSlot[];
}

export interface NutritionPlan {
  week: NutritionWeekMeta;
  days: NutritionDay[];
  recipes: Record<string, MealRecipe>;
  templates: NutritionTemplate[];
  mealPrepBlock: MealPrepBlock;
  leftoverRules: LeftoverRule[];
  externalMealGuidance: ExternalMealGuidance;
  criticalNutrientTips: CriticalNutrientTip[];
  budget: WeeklyBudgetSummary;
  shoppingAndReview: NutritionShoppingAndReview;
}

const DAY_LABELS: Record<string, string> = {
  Mon: "Montag",
  Tue: "Dienstag",
  Wed: "Mittwoch",
  Thu: "Donnerstag",
  Fri: "Freitag",
  Sat: "Samstag",
  Sun: "Sonntag",
};

const DAY_SHORT_LABELS: Record<string, string> = {
  Mon: "MO",
  Tue: "DI",
  Wed: "MI",
  Thu: "DO",
  Fri: "FR",
  Sat: "SA",
  Sun: "SO",
};

const MONTH_LABELS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function roundTo(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function createNutritionBreakdown(
  values: Partial<NutritionBreakdown> = {},
): NutritionBreakdown {
  return {
    fiber: 0,
    sugar: 0,
    addedSugar: 0,
    saturatedFat: 0,
    monounsaturatedFat: 0,
    polyunsaturatedFat: 0,
    transFat: 0,
    cholesterol: 0,
    sodium: 0,
    salt: 0,
    water: 0,
    alcohol: 0,
    biotin: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    iron: 0,
    potassium: 0,
    calcium: 0,
    magnesium: 0,
    zinc: 0,
    ...values,
  };
}

const RECIPE_NUTRITION_BREAKDOWN_OVERRIDES: Record<string, Partial<NutritionBreakdown>> = {
  "apfel-proteinshake": {
    fiber: 11.8,
    sugar: 23.6,
    sodium: 345,
    salt: 0.9,
    water: 390,
    biotin: 13,
    vitaminC: 11,
    vitaminD: 2.1,
    vitaminE: 3.8,
    iron: 5.9,
    potassium: 860,
    calcium: 430,
    magnesium: 140,
    zinc: 3.1,
  },
  "joghurt-oats-glas": {
    fiber: 12.6,
    sugar: 19.4,
    sodium: 280,
    salt: 0.7,
    water: 310,
    biotin: 14,
    vitaminC: 8,
    vitaminD: 1.3,
    vitaminE: 4.1,
    iron: 5.4,
    potassium: 760,
    calcium: 350,
    magnesium: 132,
    zinc: 3,
  },
  "apfel-proteinbowl": {
    fiber: 13.4,
    sugar: 21.2,
    sodium: 255,
    salt: 0.6,
    water: 300,
    biotin: 14,
    vitaminC: 10,
    vitaminD: 1.1,
    vitaminE: 4.7,
    iron: 5.5,
    potassium: 820,
    calcium: 320,
    magnesium: 145,
    zinc: 3.2,
  },
  "tahin-apfel-shake": {
    fiber: 11.2,
    sugar: 22.8,
    sodium: 360,
    salt: 0.9,
    water: 380,
    biotin: 12,
    vitaminC: 10,
    vitaminD: 2,
    vitaminE: 4.9,
    iron: 6.2,
    potassium: 830,
    calcium: 490,
    magnesium: 156,
    zinc: 3.5,
  },
  "overnight-oats-apfel": {
    fiber: 13.8,
    sugar: 23.4,
    sodium: 300,
    salt: 0.8,
    water: 410,
    biotin: 15,
    vitaminC: 10,
    vitaminD: 1.6,
    vitaminE: 3.8,
    iron: 5.7,
    potassium: 930,
    calcium: 405,
    magnesium: 150,
    zinc: 3.2,
  },
  "tomaten-mung-dal": {
    fiber: 16.1,
    sugar: 10.2,
    sodium: 910,
    salt: 2.4,
    water: 520,
    biotin: 16,
    vitaminC: 19,
    vitaminE: 1.9,
    vitaminK: 21,
    iron: 8.7,
    potassium: 1240,
    calcium: 165,
    magnesium: 170,
    zinc: 4.5,
  },
  "couscous-soja-bowl": {
    fiber: 12.4,
    sugar: 8.1,
    sodium: 760,
    salt: 1.9,
    water: 340,
    biotin: 11,
    vitaminC: 13,
    vitaminE: 2.2,
    vitaminK: 18,
    iron: 7.5,
    potassium: 900,
    calcium: 140,
    magnesium: 118,
    zinc: 3.8,
  },
  "seitan-pilz-pfanne": {
    fiber: 10.2,
    sugar: 6.8,
    sodium: 790,
    salt: 2,
    water: 360,
    biotin: 10,
    vitaminC: 15,
    vitaminE: 1.2,
    vitaminK: 14,
    iron: 8.8,
    potassium: 1180,
    calcium: 95,
    magnesium: 112,
    zinc: 5.4,
  },
  "tofu-lauch-polenta": {
    fiber: 8.4,
    sugar: 7.1,
    sodium: 690,
    salt: 1.7,
    water: 420,
    biotin: 9,
    vitaminC: 9,
    vitaminD: 1,
    vitaminE: 2.8,
    vitaminK: 23,
    iron: 7.2,
    potassium: 970,
    calcium: 430,
    magnesium: 145,
    zinc: 4.4,
  },
  "ofenkartoffeln-seitan": {
    fiber: 11.3,
    sugar: 10.6,
    sodium: 580,
    salt: 1.5,
    water: 350,
    biotin: 10,
    vitaminC: 24,
    vitaminE: 3.6,
    vitaminK: 18,
    iron: 8.1,
    potassium: 1410,
    calcium: 145,
    magnesium: 136,
    zinc: 4.8,
  },
  "kartoffel-soja-pfanne": {
    fiber: 12.1,
    sugar: 9.4,
    sodium: 720,
    salt: 1.8,
    water: 360,
    biotin: 10,
    vitaminC: 21,
    vitaminE: 3.3,
    vitaminK: 17,
    iron: 6.9,
    potassium: 1320,
    calcium: 155,
    magnesium: 130,
    zinc: 4.1,
  },
  "recovery-couscous-bowl": {
    fiber: 11.9,
    sugar: 9,
    sodium: 920,
    salt: 2.3,
    water: 370,
    biotin: 11,
    vitaminC: 18,
    vitaminE: 2,
    vitaminK: 19,
    iron: 8.4,
    potassium: 1010,
    calcium: 160,
    magnesium: 126,
    zinc: 4.7,
  },
  "apfel-kernmix": {
    fiber: 5.8,
    sugar: 17.5,
    sodium: 150,
    salt: 0.4,
    water: 130,
    biotin: 7,
    vitaminC: 7,
    vitaminE: 3.2,
    vitaminK: 6,
    iron: 1.4,
    potassium: 290,
    calcium: 42,
    magnesium: 64,
    zinc: 1.1,
  },
  "sojajoghurt-dip": {
    fiber: 4.6,
    sugar: 9.1,
    sodium: 240,
    salt: 0.6,
    water: 250,
    biotin: 8,
    vitaminC: 8,
    vitaminD: 0.7,
    vitaminE: 1.2,
    vitaminK: 12,
    iron: 2.2,
    potassium: 420,
    calcium: 180,
    magnesium: 52,
    zinc: 1.5,
  },
  "ride-snack-salzkartoffeln": {
    fiber: 6.3,
    sugar: 2.6,
    sodium: 420,
    salt: 1.1,
    water: 250,
    biotin: 5,
    vitaminC: 20,
    vitaminE: 0.2,
    vitaminK: 7,
    iron: 1.8,
    potassium: 1260,
    calcium: 42,
    magnesium: 82,
    zinc: 1.3,
  },
};

function withNutritionBreakdown(recipeId: string, nutrition: MacroEstimate): MacroEstimate {
  const defaults = createNutritionBreakdown({
    fiber: roundTo(nutrition.carbs * 0.14),
    sugar: roundTo(nutrition.carbs * 0.22),
    addedSugar: 0,
    saturatedFat: roundTo(nutrition.fat * 0.22),
    monounsaturatedFat: roundTo(nutrition.fat * 0.36),
    polyunsaturatedFat: roundTo(nutrition.fat * 0.3),
    transFat: 0,
    cholesterol: 0,
    sodium: Math.round(320 + nutrition.protein * 4),
    salt: roundTo(0.8 + nutrition.protein * 0.008),
    water: Math.round(220 + nutrition.kcal * 0.35),
    alcohol: 0,
    biotin: roundTo(6 + nutrition.protein * 0.15),
    vitaminC: roundTo(4 + nutrition.carbs * 0.1),
    vitaminD: roundTo(0.8 + nutrition.protein * 0.02),
    vitaminE: roundTo(1.5 + nutrition.fat * 0.18),
    vitaminK: roundTo(8 + nutrition.carbs * 0.15),
    iron: roundTo(2.5 + nutrition.protein * 0.08),
    potassium: Math.round(300 + nutrition.carbs * 5),
    calcium: Math.round(120 + nutrition.protein * 4),
    magnesium: Math.round(60 + nutrition.carbs * 0.8 + nutrition.fat * 1.6),
    zinc: roundTo(1.2 + nutrition.protein * 0.035),
    ...RECIPE_NUTRITION_BREAKDOWN_OVERRIDES[recipeId],
  });

  return {
    ...nutrition,
    breakdown: defaults,
  };
}

export const MEAL_SLOT_ORDER: MealSlotType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
];

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function buildDay(
  isoDate: string,
  training: string,
  kcalTarget: number,
  proteinTarget: number,
  kcalBasisOrDailyLogic: number | string,
  kcalTrainingPlusOrMeals: number | MealSlot[],
  plannedKcal = kcalTarget,
  plannedProtein = proteinTarget,
  hint = "",
  dailyLogic = "",
  meals: MealSlot[] = [],
): NutritionDay {
  const date = parseIsoDate(isoDate);
  const dayKey = date.toLocaleDateString("en-US", { weekday: "short" });
  const isLegacyCall = typeof kcalBasisOrDailyLogic === "string";
  const resolvedDailyLogic = isLegacyCall ? kcalBasisOrDailyLogic : dailyLogic;
  const resolvedMeals = isLegacyCall
    ? (kcalTrainingPlusOrMeals as MealSlot[])
    : meals;

  return {
    dayShort: DAY_SHORT_LABELS[dayKey],
    dayLabel: DAY_LABELS[dayKey],
    isoDate,
    date: date.getDate(),
    monthLabel: MONTH_LABELS[date.getMonth()],
    training,
    targets: {
      kcalTarget,
      proteinTarget,
    },
    kcalBasis: isLegacyCall ? kcalTarget : kcalBasisOrDailyLogic,
    kcalTrainingPlus: isLegacyCall ? 0 : (kcalTrainingPlusOrMeals as number),
    plannedKcal: isLegacyCall ? kcalTarget : plannedKcal,
    plannedProtein: isLegacyCall ? proteinTarget : plannedProtein,
    hint: isLegacyCall ? "" : hint,
    dailyLogic: resolvedDailyLogic,
    meals: resolvedMeals,
  };
}

function buildMeal(slot: MealSlotType, mealId: string): MealSlot {
  return {
    slot,
    mealType: "recipe",
    mealId,
    isExternal: false,
  };
}

function buildExternalMeal(slot: MealSlotType): MealSlot {
  return {
    slot,
    mealType: "external",
    isExternal: true,
  };
}

function buildRecipe(
  id: string,
  name: string,
  use: string,
  cookTime: string,
  ingredients: Array<[string, number | string, string]>,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  tags: string[],
  batchServings = 1,
): MealRecipe {
  return {
    id,
    name,
    use,
    cookTime,
    batchServings,
    ingredients: ingredients.map(([ingredient, amount, unit]) => ({
      ingredient,
      amount,
      unit,
    })),
    preparation: [
      "Zutaten vorbereiten.",
      "Nach Wochenplan kurz garen, mixen oder verpacken.",
      "Mit Jodsalz und Gewuerzen abschmecken.",
    ],
    tags,
    nutrition: {
      kcal,
      protein,
      carbs,
      fat,
      estimated: true,
      note: "Protein aus Plan uebernommen; weitere Makros grob geschaetzt.",
    },
  };
}

export const NUTRITION_PLAN: NutritionPlan = {
  week: {
    planLabel:
      "KW 16 13.04.2026 - 19.04.2026 | Kostenfokus | meal prep und batches erlaubt",
    startIsoDate: "2026-04-13",
    endIsoDate: "2026-04-19",
    weekStartLabel: "Montag",
    persons: 1,
    mode: "meal prep und batches erlaubt",
    optimizationLogic: [
      "Kostenminimierung bei 25 EUR Hard Cap",
      "Naehrstoffdeckung und Protein-Ziel 110 g/Tag absichern",
      "Zeit knapp halten und Batches erlauben",
      "Regionale und saisonale Auswahl priorisieren",
      "Aepfel, Moehren, Zwiebeln, Lauch, Pilze und haltbare Tomatenprodukte priorisiert; keine Exoten eingeplant.",
    ],
    assumptions: [
      "Externe Abendmahlzeiten wurden mit 650 kcal und 25 g Protein angesetzt; externes Sonntagsmittag mit 800 kcal und 30 g Protein.",
      "Trainingsaufschlaege: Mo +350, Di +550, Mi +200, Do +150, Fr +500, So +650 kcal.",
      "Unbepreiste Pantry-Basics wie Hafer, Couscous, Weizenmehl, Tahin und Leinsamen wurden konservativ als Bestandsanteil pauschal mit 1.10 EUR beruecksichtigt.",
      "Joddeckung setzt konsequenten Einsatz von Jodsalz in den Hauptmahlzeiten voraus.",
      "Calcium wird ueber angereicherten Drink und Calcium-Supplement abgesichert.",
    ],
    microRoutine: [
      "Vitamin B12 Montag und Donnerstag morgens laut Packung.",
      "Vitamin D taeglich 1 Perle zum Fruehstueck als April-Annahme.",
      "Taeglich 1 Paranuss fuer Selen.",
      "Kreatin taeglich 3-5 g im Morgenshake.",
      "Jodsalz konsequent in den Hauptmahlzeiten verwenden.",
    ],
    criticalNutrients: ["Calcium", "Jod", "Selen", "Vitamin D", "B12"],
  },
  days: [
    buildDay(
      "2026-04-13",
      "Rad Grundlage 60 min + Kraft 35 min",
      2100,
      110,
      1750,
      350,
      2120,
      114,
      "Abend to-go",
      "Frueher Shake, warmer Pasta-Proteinanker, abends transportable Couscous Bowl.",
      [
        buildMeal("breakfast", "apfel-zimt-shake"),
        buildMeal("lunch", "seitan-lauch-pasta"),
        buildMeal("dinner", "to-go-couscous-bowl"),
        buildMeal("snack", "apfel-soja-crumbles"),
      ],
    ),
    buildDay(
      "2026-04-14",
      "Rad Strength 90 min + Lauf 35 min",
      2300,
      110,
      1750,
      550,
      2230,
      111,
      "Mittag to-go, Abend extern",
      "Hoher Trainingsaufschlag, Mittag als Dal-Topf, externes Abendessen proteinbewusst waehlen.",
      [
        buildMeal("breakfast", "kaffee-hafer-shake"),
        buildMeal("lunch", "to-go-dal-topf"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "apfel-soja-crumbles"),
      ],
    ),
    buildDay(
      "2026-04-15",
      "Rad Grundlage 60 min",
      1950,
      110,
      1750,
      200,
      1980,
      110,
      "Mittag to-go, Abend extern",
      "Office-Tag mit Chili-Couscous als dichte To-go-Mahlzeit, abends extern.",
      [
        buildMeal("breakfast", "karottenkuchen-shake"),
        buildMeal("lunch", "to-go-chili-couscous"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "soja-crumbles"),
      ],
    ),
    buildDay(
      "2026-04-16",
      "Kraft 35 min",
      1900,
      110,
      1750,
      150,
      1900,
      112,
      "Abend to-go",
      "Mittags Pilz-Schnetzelpfanne, abends Seitan-Rest als transportabler Wrap.",
      [
        buildMeal("breakfast", "kakao-hafer-shake"),
        buildMeal("lunch", "pilz-schnetzelpfanne"),
        buildMeal("dinner", "to-go-seitan-wrap"),
        buildMeal("snack", "moehren-senf"),
      ],
    ),
    buildDay(
      "2026-04-17",
      "Rad Tempo 90 min + Lauf 35 min",
      2250,
      110,
      1750,
      500,
      2210,
      111,
      "Abend extern",
      "Trainingsfreitag mit Pasta-Rest, externes Abendessen als flexible Komponente.",
      [
        buildMeal("breakfast", "vanille-apfel-shake"),
        buildMeal("lunch", "tomaten-schnetzelpasta"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "apfel-soja-crumbles"),
      ],
    ),
    buildDay(
      "2026-04-18",
      "Kein Training",
      1750,
      110,
      1750,
      0,
      1770,
      111,
      "Abend extern",
      "Ruhetag mit Mung-Tofu-Wrap mittags und externem Abendessen.",
      [
        buildMeal("breakfast", "zimt-apfel-shake"),
        buildMeal("lunch", "mung-ruehrei-wrap"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "moehren-senf"),
      ],
    ),
    buildDay(
      "2026-04-19",
      "Long Ride 180 min",
      2400,
      110,
      1750,
      650,
      2360,
      116,
      "Mittag extern, abends Meal-Prep-Nutzung",
      "Long-Ride-Tag mit grossem Shake, externem Mittag und schneller Couscous-Recovery.",
      [
        buildMeal("breakfast", "hafer-shake-gross"),
        buildExternalMeal("lunch"),
        buildMeal("dinner", "long-ride-couscous"),
        buildMeal("snack", "apfel-paranuss"),
      ],
    ),
  ],
  recipes: {
    "apfel-zimt-shake": buildRecipe("apfel-zimt-shake", "Apfel-Zimt Shake", "Schnelles Fruehstueck mit Kreatin direkt im Shake.", "5 min", [
      ["Haferflocken", 70, "g"],
      ["Haferdrink", 300, "ml"],
      ["Wasser", 300, "ml"],
      ["Erbsenprotein", 30, "g"],
      ["Apfel", 150, "g"],
      ["Leinsamen", 15, "g"],
      ["Zimt", 1, "TL"],
    ], 585, 38, 82, 12, ["Shake", "Schnell", "Fruehstueck"]),
    "kaffee-hafer-shake": buildRecipe("kaffee-hafer-shake", "Kaffee-Hafer Shake", "Bitter-suesser Shake fuer den hohen Trainingsdienstag.", "5 min", [
      ["Haferflocken", 70, "g"],
      ["Haferdrink", 300, "ml"],
      ["Wasser", 250, "ml"],
      ["Erbsenprotein", 30, "g"],
      ["Instantkaffee", 1, "TL"],
      ["Leinsamen", 15, "g"],
    ], 520, 37, 67, 11, ["Shake", "Training", "Fruehstueck"]),
    "karottenkuchen-shake": buildRecipe("karottenkuchen-shake", "Karottenkuchen Shake", "Moehre und Apfel als regionale Shake-Varianz.", "5 min", [
      ["Haferflocken", 65, "g"],
      ["Haferdrink", 300, "ml"],
      ["Wasser", 300, "ml"],
      ["Erbsenprotein", 30, "g"],
      ["Moehre", 100, "g"],
      ["Apfel", 80, "g"],
      ["Leinsamen", 15, "g"],
    ], 555, 37, 76, 12, ["Shake", "Regional", "Fruehstueck"]),
    "kakao-hafer-shake": buildRecipe("kakao-hafer-shake", "Kakao-Hafer Shake", "Schokoladiger Shake fuer den Krafttag.", "5 min", [
      ["Haferflocken", 70, "g"],
      ["Haferdrink", 300, "ml"],
      ["Wasser", 300, "ml"],
      ["Erbsenprotein", 30, "g"],
      ["Kakaopulver", 1, "EL"],
      ["Leinsamen", 15, "g"],
    ], 545, 38, 68, 13, ["Shake", "Krafttag", "Fruehstueck"]),
    "vanille-apfel-shake": buildRecipe("vanille-apfel-shake", "Vanille-Apfel Shake", "Apfel-Shake fuer den Tempo- und Lauftag.", "5 min", [
      ["Haferflocken", 70, "g"],
      ["Haferdrink", 300, "ml"],
      ["Wasser", 300, "ml"],
      ["Erbsenprotein", 30, "g"],
      ["Apfel", 150, "g"],
      ["Leinsamen", 15, "g"],
      ["Vanille", 1, "Prise"],
    ], 585, 38, 82, 12, ["Shake", "Training", "Fruehstueck"]),
    "zimt-apfel-shake": buildRecipe("zimt-apfel-shake", "Zimt-Apfel Shake", "Ruhetags-Shake mit Hafer, Apfel und Leinsamen.", "5 min", [
      ["Haferflocken", 70, "g"],
      ["Haferdrink", 300, "ml"],
      ["Wasser", 300, "ml"],
      ["Erbsenprotein", 30, "g"],
      ["Apfel", 150, "g"],
      ["Leinsamen", 15, "g"],
      ["Zimt", 1, "TL"],
    ], 585, 38, 82, 12, ["Shake", "Schnell", "Fruehstueck"]),
    "hafer-shake-gross": buildRecipe("hafer-shake-gross", "Hafer-Shake gross", "Groesserer Shake fuer den Long-Ride-Tag.", "5 min", [
      ["Haferflocken", 90, "g"],
      ["Haferdrink", 300, "ml"],
      ["Wasser", 300, "ml"],
      ["Erbsenprotein", 35, "g"],
      ["Apfel", 150, "g"],
      ["Leinsamen", 15, "g"],
    ], 690, 43, 102, 13, ["Long Ride", "Shake", "Fruehstueck"]),
    "seitan-lauch-pasta": buildRecipe("seitan-lauch-pasta", "Seitan-Lauch-Pasta", "Montagmittag mit Seitan-Basis; zweite Basisportion fuer Donnerstag.", "20 min", [
      ["Vollkornspaghetti", 120, "g"],
      ["Seitan-Pulver", 50, "g"],
      ["Weizenmehl", 15, "g"],
      ["Lauch", 80, "g"],
      ["Zwiebel", 50, "g"],
      ["Tomatenmark", 15, "g"],
      ["Sojasauce", 10, "ml"],
      ["Hefeflocken", 10, "g"],
    ], 710, 47, 105, 6, ["Warm", "Batch", "Protein"]),
    "to-go-couscous-bowl": buildRecipe("to-go-couscous-bowl", "To-go Couscous Bowl", "Montagabend transportable Bowl.", "15 min", [
      ["Couscous", 100, "g"],
      ["Soja-Schnetzel", 60, "g"],
      ["Moehre", 150, "g"],
      ["Zwiebel", 50, "g"],
      ["Tahin", 15, "g"],
    ], 665, 32, 94, 12, ["To-go", "Bowl", "Protein"]),
    "to-go-dal-topf": buildRecipe("to-go-dal-topf", "To-go Dal-Topf", "Dienstagmittag mikrowellentauglich im Buero.", "25 min", [
      ["Mungbohnen geschaelt", 70, "g"],
      ["Tofu", 200, "g"],
      ["Moehre", 150, "g"],
      ["Lauch", 100, "g"],
      ["Tomatenmark", 20, "g"],
    ], 610, 42, 65, 17, ["To-go", "Dal", "Lunch"]),
    "to-go-chili-couscous": buildRecipe("to-go-chili-couscous", "To-go Chili-Couscous", "Mittwochmittag als dichter To-go-Topf.", "25 min", [
      ["Couscous", 90, "g"],
      ["Kidney Bohnen", 120, "g"],
      ["Soja-Schnetzel", 40, "g"],
      ["Gehackte Tomaten", 200, "g"],
      ["Zwiebel", 60, "g"],
      ["Moehre", 80, "g"],
      ["Tomatenmark", 10, "g"],
    ], 690, 38, 112, 5, ["To-go", "Batch", "Lunch"], 2),
    "pilz-schnetzelpfanne": buildRecipe("pilz-schnetzelpfanne", "Pilz-Schnetzelpfanne", "Donnerstagmittag mit schnellen Fladen.", "20 min", [
      ["Soja-Schnetzel", 50, "g"],
      ["Champignons", 125, "g"],
      ["Moehre", 100, "g"],
      ["Zwiebel", 60, "g"],
      ["Weizenmehl", 100, "g"],
    ], 645, 34, 101, 5, ["Warm", "Pilze", "Lunch"]),
    "to-go-seitan-wrap": buildRecipe("to-go-seitan-wrap", "To-go Seitan-Wrap", "Donnerstagabend aus Montag-Seitanbasis.", "20 min", [
      ["Seitan-Basis", 1, "Portion"],
      ["Weizenmehl", 100, "g"],
      ["Moehre", 80, "g"],
      ["Tahin", 10, "g"],
      ["Senf", 1, "TL"],
    ], 610, 41, 80, 9, ["To-go", "Wrap", "Rest"]),
    "tomaten-schnetzelpasta": buildRecipe("tomaten-schnetzelpasta", "Tomaten-Schnetzelpasta", "Freitagmittag nutzt Chili-Basis als Pastasauce.", "15 min", [
      ["Vollkornspaghetti", 100, "g"],
      ["Chili-Basis", 1, "Portion"],
    ], 655, 36, 107, 5, ["Rest", "Pasta", "Lunch"]),
    "mung-ruehrei-wrap": buildRecipe("mung-ruehrei-wrap", "Mung-Ruehrei Wrap", "Samstagmittag mit Mungbohnen, Tofu und Pilzen.", "25 min", [
      ["Mungbohnen geschaelt", 70, "g"],
      ["Tofu", 200, "g"],
      ["Champignons", 125, "g"],
      ["Weizenmehl", 100, "g"],
      ["Hefeflocken", 5, "g"],
    ], 720, 47, 82, 19, ["Wrap", "Protein", "Lunch"]),
    "long-ride-couscous": buildRecipe("long-ride-couscous", "Long-Ride Couscous", "Schnelles Post-Ride-Dinner mit hoher Proteindichte.", "15 min", [
      ["Couscous", 100, "g"],
      ["Long-Ride Seitan-Basis", 1, "Portion"],
      ["Soja-Schnetzel", 40, "g"],
    ], 720, 44, 104, 7, ["Long Ride", "Recovery", "Dinner"]),
    "apfel-soja-crumbles": buildRecipe("apfel-soja-crumbles", "Apfel Soja-Crumbles", "Salziger Protein-Snack plus Apfel.", "8 min", [
      ["Soja-Schnetzel", 20, "g"],
      ["Sojasauce", 5, "ml"],
      ["Apfel", 150, "g"],
    ], 180, 10, 28, 1, ["Snack", "Protein", "Schnell"]),
    "soja-crumbles": buildRecipe("soja-crumbles", "Soja-Crumbles", "Salziger Protein-Snack ohne Nuss-Overeating.", "8 min", [
      ["Soja-Schnetzel", 20, "g"],
      ["Sojasauce", 5, "ml"],
    ], 95, 10, 8, 1, ["Snack", "Protein", "Schnell"]),
    "moehren-senf": buildRecipe("moehren-senf", "Moehren Senf", "Einfacher regionaler Crunch-Snack.", "3 min", [
      ["Moehre", 180, "g"],
      ["Senf", 1, "TL"],
    ], 85, 2, 16, 1, ["Snack", "Regional", "Schnell"]),
    "apfel-paranuss": buildRecipe("apfel-paranuss", "Apfel Paranuss", "Selenroutine am Sonntag.", "2 min", [
      ["Apfel", 150, "g"],
      ["Paranuss", 1, "Stk"],
    ], 130, 2, 21, 4, ["Snack", "Selen", "Schnell"]),
  },
  templates: [
    { name: "Hafer-Shake Apfel", use: "Basis fuer Mo, Fr und Sa mit Apfel-Zimt- oder Vanille-Varianz.", base: "Hafer + Haferdrink + Wasser + Erbsenprotein + Apfel + Leinsamen" },
    { name: "Hafer-Shake Kaffee", use: "Fuer Di und Fr geeignet; bitter-suess ohne Zusatzkauf.", base: "Hafer + Haferdrink + Wasser + Erbsenprotein + Instantkaffee + Leinsamen" },
    { name: "Hafer-Shake Karotte", use: "Mit Zimt, ergibt karottenkuchenartige Note.", base: "Hafer + Haferdrink + Wasser + Erbsenprotein + Moehre + Apfel + Leinsamen" },
    { name: "Hafer-Shake Kakao", use: "Fuer Donnerstag; salzige Snacks spaeter einplanen.", base: "Hafer + Haferdrink + Wasser + Erbsenprotein + Kakao + Leinsamen" },
    { name: "Hafer-Shake gross", use: "Sonntag groesser fuer Long-Ride-Tag.", base: "Mehr Hafer + Haferdrink + Wasser + Erbsenprotein + Apfel + Leinsamen" },
  ],
  mealPrepBlock: {
    dayShort: "SO",
    durationMin: 90,
    plan: [
      "Long-Ride Seitan-Basis fuer 3 Portionen vorkochen.",
      "3 Fruehstuecks-Trockensets aus Hafer, Leinsamen und Gewuerzen vorbereiten.",
      "Moehren-Zwiebel-Basis fuer 2 Portionen vorbereiten.",
    ],
    benefits: ["Sonntag Abend", "Folgewoche Montag", "Folgewoche Dienstag"],
  },
  leftoverRules: [
    { sourceMealName: "Montag Mittag Seitan-Basis", amount: "1 Portion", targetDayShort: "DO", note: "Als To-go Seitan-Wrap nutzen." },
    { sourceMealName: "Mittwoch Mittag Chili-Basis", amount: "1 Portion", targetDayShort: "FR", note: "Als Tomaten-Schnetzelpasta nutzen." },
    { sourceMealName: "Sonntag Meal-Prep-Block Long-Ride Seitan-Basis", amount: "2 Portionen", targetDayShort: "SO", note: "Fuer Folgewoche Montag und Dienstag kaltstellen oder einfrieren." },
  ],
  externalMealGuidance: {
    title: "Externes Meal",
    kcalRange: "650 kcal Abend / 800 kcal Sonntagmittag",
    proteinRange: "25 g Abend / 30 g Sonntagmittag",
    assumptions: [
      "Externe Abendmahlzeiten wurden mit 650 kcal und 25 g Protein angesetzt.",
      "Externes Sonntagsmittag wurde mit 800 kcal und 30 g Protein angesetzt.",
      "Makros bleiben bewusst als Planannahme markiert.",
    ],
    tips: [
      "Gezielt Tofu, Bohnen, Linsen oder Seitan waehlen.",
      "Wenn das Meal proteinarm ausfaellt, 20-30 g Erbsenprotein in Wasser ergaenzen.",
      "Jodsalz und Calcium bleiben extern die groessten Unsicherheitsfaktoren.",
    ],
    warning: "Externe Mahlzeiten sind die groesste Unsicherheitsquelle dieser Woche. Fokus auf Protein, nicht nur auf Kalorien.",
  },
  criticalNutrientTips: [
    { nutrient: "Calcium", status: "attention", action: "Calcium ueber angereicherten Haferdrink und ALTAPHARMA Calcium absichern." },
    { nutrient: "Jod", status: "attention", action: "Jodsalz konsequent in Hauptmahlzeiten nutzen; sonst entsteht eine Luecke." },
    { nutrient: "Selen", status: "good", action: "Taeglich genau 1 Paranuss, nicht mehrere Paranuesse stapeln." },
    { nutrient: "B12", status: "supplement", action: "Montag und Donnerstag morgens laut Packung supplementieren." },
    { nutrient: "Vitamin D", status: "supplement", action: "Taeglich 1 Perle zum Fruehstueck als April-Annahme." },
  ],
  budget: {
    budgetHardCap: 25,
    shoppingCost: 15.28,
    pantryShare: 8.6,
    totalCost: 23.88,
    status: "Innerhalb des Budgets, aber nur knapp und nur wegen starker Nutzung vorhandener Bulk-Produkte.",
    note: "Budgetpuffer 1.12 EUR. Preise werden aus der gelieferten Referenz uebernommen.",
  },
  shoppingAndReview: {
    pantry: [
      { product: "Jodsalz", amount: "vorhanden", use: "Jodabsicherung" },
      { product: "Weizenmehl Typ 405", amount: "2000 g", use: "Wraps und Fladen" },
      { product: "Tahin", amount: "1 Glas", use: "Dressing und Wraps" },
      { product: "Hafer", amount: "500 g", use: "Shakes" },
      { product: "Couscous", amount: "vorhanden", use: "Bowls und schnelle Kohlenhydrate" },
      { product: "Tomatenmark", amount: "150 g", use: "Saucen" },
      { product: "Leinsamen", amount: "150 g", use: "Omega-3" },
      { product: "Sojasauce", amount: "200 ml", use: "Wuerzung" },
      { product: "Lauch", amount: "170 g", use: "Pasta und Dal" },
      { product: "Mischgemuese", amount: "400 g", use: "Reserve falls externe Mahlzeiten ausfallen" },
      { product: "VITAM Hefeflocken MAXI", amount: "2500 g", use: "Riboflavin und Umami" },
      { product: "planeo Soja Schnetzel", amount: "10000 g", use: "Proteinanker" },
      { product: "buxtrade Erbsenprotein", amount: "5000 g", use: "Morgenshakes" },
      { product: "Mungbohnen geschaelt gespalten", amount: "5000 g", use: "Dal und Ruehrei" },
      { product: "planeo Seitan Pulver", amount: "5000 g", use: "Proteinanker" },
      { product: "altapharma Vitamin B12 hochdosiert", amount: "vorhanden", use: "B12-Absicherung" },
      { product: "altapharma Vitamin D3 2.000 I.E.", amount: "vorhanden", use: "Vitamin-D-Absicherung" },
      { product: "GENUSS PLUS Paranusskerne", amount: "vorhanden", use: "Selen" },
      { product: "buxtrade Kreatin Monohydrat Pulver", amount: "vorhanden", use: "Kraft- und Ausdauerunterstuetzung" },
    ],
    stores: [
      {
        store: "Lidl",
        items: [
          { product: "Aepfel", plannedAmount: "1000 g", priceReference: "12.03.2026 Lidl Apfel rot, suess-saeuerl 2 kg = 3.29 EUR", weeklyCost: 1.65, use: ["Shakes", "Snacks"] },
          { product: "Bio Moehren", plannedAmount: "1000 g", priceReference: "12.03.2026 Lidl Bio Moehren 2 Einheiten = 2.98 EUR", weeklyCost: 1.49, use: ["Dal", "Bowls", "Wraps", "Snacks"] },
          { product: "Bio Zwiebel rot 500 g", plannedAmount: "500 g", priceReference: "12.03.2026 Lidl Bio Zwiebel rot 500 g = 1.29 EUR", weeklyCost: 1.29, use: ["Saucen", "Pfannen"] },
          { product: "Porree", plannedAmount: "2 Stueck", priceReference: "12.03.2026 Lidl Porree 2 Stueck = 0.69 EUR", weeklyCost: 0.69, use: ["Pasta", "Dal"] },
          { product: "Bio Champignons", plannedAmount: "250 g", priceReference: "12.03.2026 Lidl Bio Champignons 250 g = 1.89 EUR", weeklyCost: 1.89, use: ["Donnerstag Mittag", "Samstag Mittag"] },
          { product: "Bioland Tofu natur", plannedAmount: "400 g", priceReference: "12.03.2026 Lidl Bioland Tofu natur 400 g = 2.29 EUR", weeklyCost: 2.29, use: ["Dienstag Mittag", "Samstag Mittag"] },
          { product: "Haferdrink", plannedAmount: "2 Liter", priceReference: "12.03.2026 Lidl Haferdrink 1,8% 2 Stueck = 1.70 EUR", weeklyCost: 1.7, use: ["Shakes"] },
          { product: "Kidney Bohnen", plannedAmount: "2 Dosen", priceReference: "12.03.2026 Lidl Kidney Bohnen 2 Stueck = 1.58 EUR", weeklyCost: 1.58, use: ["Chili-Basis"] },
          { product: "Bio Geh.Tomat.Knob.", plannedAmount: "2 Dosen", priceReference: "12.03.2026 Lidl Bio Geh.Tomat.Knob. 2 Stueck = 1.50 EUR", weeklyCost: 1.5, use: ["Chili-Basis", "Long-Ride Seitan-Basis"] },
          { product: "Bio Spaghetti Vollk.", plannedAmount: "500 g", priceReference: "12.03.2026 Lidl Bio Spaghetti Vollk. 500 g = 0.85 EUR", weeklyCost: 0.85, use: ["Montag Mittag", "Freitag Mittag"] },
        ],
      },
      {
        store: "Rossmann",
        items: [
          { product: "ALTAPHARMA CALCIUM", plannedAmount: "7 Tabletten", priceReference: "12.03.2026 Rossmann ALTAPHARMA CALCIUM 10 Stueck = 0.50 EUR", weeklyCost: 0.35, use: ["Taegliche Calcium-Absicherung"] },
        ],
      },
    ],
    bulkPantryDetails: [
      { product: "Erbsenprotein", plannedAmount: "210 g", costShare: 2.52, priceStatus: "belegt" },
      { product: "Soja-Schnetzel", plannedAmount: "290 g", costShare: 1.74, priceStatus: "belegt" },
      { product: "Seitan-Pulver", plannedAmount: "160 g", costShare: 0.96, priceStatus: "belegt" },
      { product: "Mungbohnen geschaelt", plannedAmount: "140 g", costShare: 1.09, priceStatus: "belegt" },
      { product: "Hefeflocken", plannedAmount: "20 g", costShare: 0.48, priceStatus: "belegt" },
      { product: "Paranuesse", plannedAmount: "35 g", costShare: 1.05, priceStatus: "belegt" },
      { product: "Hafer, Couscous, Weizenmehl, Tahin, Leinsamen", plannedAmount: "Wochenanteil", costShare: 0.76, priceStatus: "geschaetzt" },
    ],
    costDrivers: ["Proteinabsicherung ueber Isolate und Bulk", "Tofu als Abwechslungsanker", "Frischware trotz engem Budget"],
    priceJumpAlternatives: [
      "Tofu streichen und durch mehr Mung-Ruehrei ersetzen",
      "Champignons streichen und Mischgemuese aus dem Tiefkuehlfach nutzen",
      "Apfelmenge um 300-400 g senken und mehr Moehren in die Shakes geben",
    ],
    nutrients: [
      { nutrient: "Kalorien", target: "Durchschnitt 2090 kcal/Tag", planValue: "Durchschnitt 2081 kcal/Tag", rating: "nahe Ziel", mainSources: ["Hafer", "Couscous", "Spaghetti", "externe Mahlzeiten"], correction: "An Di und Fr bei Hunger 1 Extra-Apfel oder 1 zusaetzlicher Wrap." },
      { nutrient: "Protein", target: "110 g/Tag", planValue: "Durchschnitt 112 g/Tag", rating: "gedeckt", mainSources: ["Erbsenprotein", "Seitan", "Soja-Schnetzel", "Tofu", "Mungbohnen"], correction: "Falls extern proteinarm gegessen wird, abends 20-30 g Erbsenprotein in Wasser ergaenzen." },
      { nutrient: "Kohlenhydrate", target: "ausdauerorientiert hoch", planValue: "Durchschnitt 253 g/Tag", rating: "gedeckt", mainSources: ["Hafer", "Couscous", "Spaghetti", "Aepfel", "Moehren"], correction: "Vor Long Ride bei Bedarf Fruehstueck um 20 g Hafer erhoehen." },
      { nutrient: "Fett", target: "moderat", planValue: "Durchschnitt 57 g/Tag", rating: "gedeckelt", mainSources: ["Leinsamen", "Tahin", "Mandeln", "Tofu"], correction: "Nusssnacks nicht frei laufen lassen; salzige Soja-Crumbles priorisieren." },
      { nutrient: "Ballaststoffe", target: "mindestens 30 g/Tag", planValue: "Durchschnitt 42 g/Tag", rating: "robust gedeckt", mainSources: ["Hafer", "Moehren", "Bohnen", "Vollkornspaghetti", "Leinsamen"], correction: "Bei Magenstress vor harten Einheiten den Moehrenanteil morgens leicht senken." },
      { nutrient: "Omega-3", target: "mindestens 2 g ALA/Tag", planValue: "Durchschnitt 2.7 g ALA/Tag", rating: "gedeckt", mainSources: ["Leinsamen"], correction: "15 g Leinsamen taeglich beibehalten." },
      { nutrient: "Calcium", target: "1000 mg/Tag", planValue: "Durchschnitt 1070 mg/Tag", rating: "gedeckt mit Supplementstuetze", mainSources: ["Haferdrink", "ALTAPHARMA CALCIUM", "Tahin", "Tofu"], correction: "Ohne Calciumtabletten waere die Deckung im Budget unsicher." },
      { nutrient: "Eisen", target: "mindestens 15 mg/Tag", planValue: "Durchschnitt 18.5 mg/Tag", rating: "gedeckt", mainSources: ["Seitan", "Soja-Schnetzel", "Mungbohnen", "Hafer", "Tahin"], correction: "Zu eisenreichen Mahlzeiten Aepfel oder Moehren mitessen; Kaffee nicht direkt dazu." },
      { nutrient: "Zink", target: "mindestens 10 mg/Tag", planValue: "Durchschnitt 11.3 mg/Tag", rating: "gedeckt", mainSources: ["Hafer", "Seitan", "Soja-Schnetzel", "Tahin", "Weizen"], correction: "Bei sinkender Mehl- oder Tahinmenge waere Zink der erste Wackelkandidat." },
      { nutrient: "Jod", target: "150 ug/Tag", planValue: "Durchschnitt 160 ug/Tag", rating: "nur bei konsequentem Jodsalz gedeckt", mainSources: ["Jodsalz"], correction: "Taeglich in den Hauptmahlzeiten salzen; sonst entsteht eine Luecke." },
      { nutrient: "Selen", target: "mindestens 60 ug/Tag", planValue: "Durchschnitt 80 ug/Tag", rating: "gedeckt", mainSources: ["1 Paranuss taeglich"], correction: "Nicht mehrere Paranuesse taeglich stapeln." },
      { nutrient: "B12", target: "robuste Supplementdeckung", planValue: "gedeckt ueber Supplement", rating: "nur via Supplement robust", mainSources: ["altapharma Vitamin B12 hochdosiert"], correction: "Lebensmittel allein reichen hier nicht." },
      { nutrient: "Vitamin D", target: "Supplementabsicherung in April", planValue: "gedeckt ueber Supplement", rating: "nur via Supplement robust", mainSources: ["altapharma Vitamin D3 2.000 I.E."], correction: "Ohne Supplement bleibt April unsicher." },
      { nutrient: "Riboflavin", target: "mindestens 1.4 mg/Tag", planValue: "Durchschnitt 1.7 mg/Tag", rating: "gedeckt", mainSources: ["Hafer", "Champignons", "Hefeflocken", "Mandeln"], correction: "Beim Streichen von Pilzen und Hefeflocken sinkt die Reserve deutlich." },
    ],
    review: {
      strengths: [
        "Protein wird trotz 25-EUR-Rahmen erreicht.",
        "Regional-saisonale Frischware bleibt sichtbar drin.",
        "To-go-Bedarf ist sauber abgedeckt.",
        "Abendliches Nusssnacken wird durch salzige Protein-Snacks systemisch entschaerft.",
      ],
      gapsAndActions: [
        "Calcium ist ohne Supplement und angereicherten Drink zu wacklig; deshalb bewusst abgesichert.",
        "Jod haengt fast vollstaendig am Jodsalz; das muss praktisch wirklich genutzt werden.",
        "Externe Mahlzeiten bleiben die groesste Unsicherheit; bei sehr kohlenhydratlastigen Restaurantgerichten Protein per Shake nachziehen.",
      ],
      criticismAndCounterpoints: [
        "Der Plan bleibt nur unter 25 EUR wegen grosser Bestaende an Erbsenprotein, Seitan und Soja-Schnetzeln; als Stand-alone-Wocheneinkauf waere er so nicht replizierbar.",
        "Das Proteinziel wird funktional erreicht, aber kulinarisch teilweise ueber Isolate und texturierte Produkte statt ueber ganze Lebensmittel.",
        "Hohe Abwechslung und Kostenminimierung ziehen in verschiedene Richtungen; noch guenstiger waere ein repetitiverer Plan.",
        "Die Kalorien auf Di, Fr und So haengen relativ stark an den angenommenen externen Mahlzeiten; real kann der Plan dort unter oder ueber Ziel landen.",
        "Calcium und Vitamin D sind hier nicht elegant, sondern pragmatisch geloest; wer Lebensmittelzentrierung priorisiert, muesste das Budget oder die Wiederholungen erhoehen.",
      ],
    },
  },
};

for (const [recipeId, recipe] of Object.entries(NUTRITION_PLAN.recipes)) {
  if (!recipe.nutrition) {
    continue;
  }

  recipe.nutrition = withNutritionBreakdown(recipeId, recipe.nutrition);
}

export function getMealSlotLabel(slot: MealSlotType) {
  switch (slot) {
    case "breakfast":
      return "Frühstück";
    case "lunch":
      return "Mittagessen";
    case "dinner":
      return "Abendessen";
    case "snack":
      return "Snack";
    default:
      return slot;
  }
}

export function getDayByDate(plan: NutritionPlan, date: number) {
  return plan.days.find((day) => day.date === date) ?? plan.days[0];
}

export function getMealById(plan: NutritionPlan, mealId?: string) {
  if (!mealId) {
    return null;
  }

  return plan.recipes[mealId] ?? null;
}

export function getWeekDays(plan: NutritionPlan) {
  return plan.days.map((day) => ({
    day: day.dayShort,
    date: day.date,
  }));
}

export function getTodayPlanDate(plan: NutritionPlan) {
  const now = new Date();
  const isoDate = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, "0"),
    `${now.getDate()}`.padStart(2, "0"),
  ].join("-");

  return plan.days.find((day) => day.isoDate === isoDate)?.date ?? plan.days[0].date;
}

export function getSelectedDayPrepNotes(plan: NutritionPlan, day: NutritionDay) {
  const notes = plan.leftoverRules
    .filter((rule) => rule.targetDayShort === day.dayShort)
    .map((rule) => ({
      title: rule.sourceMealName,
      subtitle: `${rule.amount} | ${rule.note}`,
    }));

  if (plan.mealPrepBlock.dayShort === day.dayShort) {
    notes.unshift({
      title: `Meal-Prep Block (${plan.mealPrepBlock.durationMin} min)`,
      subtitle: plan.mealPrepBlock.plan[0] ?? "",
    });
  }

  return notes;
}

export function getPlannedMacrosForDay(plan: NutritionPlan, day: NutritionDay) {
  const recipeTotals = day.meals.reduce(
    (totals, slot) => {
      const meal = getMealById(plan, slot.mealId);

      if (!meal?.nutrition) {
        return totals;
      }

      return {
        kcal: totals.kcal + meal.nutrition.kcal,
        protein: totals.protein + meal.nutrition.protein,
        carbs: totals.carbs + meal.nutrition.carbs,
        fat: totals.fat + meal.nutrition.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    ...recipeTotals,
    kcal: day.plannedKcal,
    protein: day.plannedProtein,
  };
}

export function getExternalMealCount(day: NutritionDay) {
  return day.meals.filter((slot) => slot.isExternal).length;
}
