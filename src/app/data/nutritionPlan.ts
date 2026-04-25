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
  dailyLogic: string,
  meals: MealSlot[],
): NutritionDay {
  const date = parseIsoDate(isoDate);
  const dayKey = date.toLocaleDateString("en-US", { weekday: "short" });

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
    dailyLogic,
    meals,
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

export const NUTRITION_PLAN: NutritionPlan = {
  week: {
    planLabel:
      "KW 15 06.04.2026 - 12.04.2026 | Proteinfokus | meal prep und batches erlaubt",
    startIsoDate: "2026-04-06",
    endIsoDate: "2026-04-12",
    weekStartLabel: "Montag",
    persons: 1,
    mode: "meal prep und batches erlaubt",
    optimizationLogic: [
      "Protein-Ziel 110 g/Tag im Wochenschnitt",
      "Budget-Hard-Cap 25 EUR möglichst einhalten",
      "Hohe Varianz trotz knapper Kosten",
      "Regionale und saisonale Auswahl für Deutschland Anfang April",
      "Kochkomplexität eher hoch, aber werktags alltagstauglich",
    ],
    assumptions: [
      "Externe Mahlzeiten wurden für die Nährstofflogik mit ca. 650-800 kcal und 25-30 g Protein als vegan/proteinbewusst angenommen.",
      "Preisannahme ohne Kassenzettel: VEMONDO High Protein Sojadrink 1,29 EUR pro 1 l.",
      "Nicht voll monetarisierte Pantryartikel machen die realen Vollkosten wahrscheinlich leicht höher.",
    ],
    microRoutine: [
      "Täglich 1 Paranuss aus dem Bestand.",
      "Täglich B12 aus dem Bestand.",
      "Vitamin D saisonabhängig weiterführen.",
      "Kreatin optional 3-5 g/Tag aus dem Bestand.",
      "Jodsalz konsequent in den gekochten Mahlzeiten verwenden.",
      "Zusätzlich täglich 250-350 ml HP-Sojadrink einplanen, falls externe Meals calciumarm ausfallen.",
    ],
    criticalNutrients: ["Calcium", "Jod", "Vitamin D", "B12"],
  },
  days: [
    buildDay(
      "2026-04-06",
      "06:30-07:30 Zwift Grundlage; 12:00-13:00 Krafttraining",
      2100,
      115,
      "Früher Proteinanker, mittags warm, abends To-go.",
      [
        buildMeal("breakfast", "apfel-proteinshake"),
        buildMeal("lunch", "tomaten-mung-dal"),
        buildMeal("dinner", "couscous-soja-bowl"),
        buildMeal("snack", "apfel-kernmix"),
      ],
    ),
    buildDay(
      "2026-04-07",
      "06:30-08:00 Zwift Strength; 12:00-13:00 Lauftraining MIT/LOW",
      2150,
      115,
      "Office-Tag, To-go-Mittag, externes Abendessen proteinbewusst wählen.",
      [
        buildMeal("breakfast", "joghurt-oats-glas"),
        buildMeal("lunch", "couscous-soja-bowl"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "apfel-kernmix"),
      ],
    ),
    buildDay(
      "2026-04-08",
      "06:30-07:30 Zwift Grundlage",
      1950,
      110,
      "Office-Tag, kräftiges To-go-Mittag, abends extern.",
      [
        buildMeal("breakfast", "apfel-proteinbowl"),
        buildMeal("lunch", "seitan-pilz-pfanne"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "sojajoghurt-dip"),
      ],
    ),
    buildDay(
      "2026-04-09",
      "12:00-13:00 Krafttraining",
      1900,
      110,
      "Mittags warm, abends To-go aus Batch-Rest.",
      [
        buildMeal("breakfast", "tahin-apfel-shake"),
        buildMeal("lunch", "tofu-lauch-polenta"),
        buildMeal("dinner", "seitan-pilz-pfanne"),
        buildMeal("snack", "apfel-kernmix"),
      ],
    ),
    buildDay(
      "2026-04-10",
      "06:30-08:00 Zwift Tempo; 12:00-13:00 Lauftraining MIT/LOW",
      2150,
      115,
      "Hoher Protein- und Carb-Fokus, abends extern.",
      [
        buildMeal("breakfast", "apfel-proteinshake"),
        buildMeal("lunch", "ofenkartoffeln-seitan"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "apfel-kernmix"),
      ],
    ),
    buildDay(
      "2026-04-11",
      "Kein fixes Training",
      1750,
      100,
      "Etwas entspannter, aber Protein weiterhin hoch halten.",
      [
        buildMeal("breakfast", "joghurt-oats-glas"),
        buildMeal("lunch", "kartoffel-soja-pfanne"),
        buildExternalMeal("dinner"),
        buildMeal("snack", "sojajoghurt-dip"),
      ],
    ),
    buildDay(
      "2026-04-12",
      "17:00-20:00 Long Ride",
      2400,
      115,
      "Carbs vor und während der Einheit, abends Recovery-Bowl.",
      [
        buildMeal("breakfast", "overnight-oats-apfel"),
        buildExternalMeal("lunch"),
        buildMeal("dinner", "recovery-couscous-bowl"),
        buildMeal("snack", "ride-snack-salzkartoffeln"),
      ],
    ),
  ],
  recipes: {
    "apfel-proteinshake": {
      id: "apfel-proteinshake",
      name: "Apfel Proteinshake",
      use: "Nach morgendlichem Training oder bei sehr wenig Zeit.",
      cookTime: "5 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "VEMONDO High Protein Sojadrink", amount: 300, unit: "ml" },
        { ingredient: "Haferflocken", amount: 40, unit: "g" },
        { ingredient: "Erbsenprotein", amount: 20, unit: "g" },
        { ingredient: "Apfel", amount: 150, unit: "g" },
        { ingredient: "Leinsamen", amount: 10, unit: "g" },
      ],
      preparation: [
        "Apfel grob schneiden.",
        "Alle Zutaten in den Mixer geben.",
        "Fein mixen.",
        "Direkt trinken.",
      ],
      tags: ["Schnell", "Proteinanker", "Frühstück"],
      nutrition: {
        kcal: 507,
        protein: 38,
        carbs: 54,
        fat: 13,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "joghurt-oats-glas": {
      id: "joghurt-oats-glas",
      name: "Joghurt Oats Glas",
      use: "Office-geeignet, schnell löffelbar und gut vorbereitbar.",
      cookTime: "5 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Soja Classic Joghurt", amount: 250, unit: "g" },
        { ingredient: "Haferflocken", amount: 40, unit: "g" },
        { ingredient: "Erbsenprotein", amount: 20, unit: "g" },
        { ingredient: "Apfel", amount: 120, unit: "g" },
        { ingredient: "Leinsamen", amount: 10, unit: "g" },
        { ingredient: "Sonnenblumenkerne", amount: 10, unit: "g" },
      ],
      preparation: [
        "Apfel klein würfeln.",
        "Joghurt und Erbsenprotein glatt rühren.",
        "Hafer, Leinsamen und Apfel einrühren.",
        "Mit Sonnenblumenkernen toppen und essen.",
      ],
      tags: ["Office", "Meal-Prep", "Frühstück"],
      nutrition: {
        kcal: 529,
        protein: 35,
        carbs: 51,
        fat: 19,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "apfel-proteinbowl": {
      id: "apfel-proteinbowl",
      name: "Apfel Proteinbowl",
      use: "Etwas sättigender als der Shake, aber weiter unter 5 Minuten.",
      cookTime: "5 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Soja Classic Joghurt", amount: 250, unit: "g" },
        { ingredient: "Haferflocken", amount: 30, unit: "g" },
        { ingredient: "Erbsenprotein", amount: 20, unit: "g" },
        { ingredient: "Apfel", amount: 150, unit: "g" },
        { ingredient: "Leinsamen", amount: 10, unit: "g" },
        { ingredient: "Sonnenblumenkerne", amount: 15, unit: "g" },
      ],
      preparation: [
        "Apfel reiben oder fein schneiden.",
        "Joghurt mit Erbsenprotein glatt rühren.",
        "Hafer und Leinsamen unterheben.",
        "Apfel und Sonnenblumenkerne daraufgeben.",
      ],
      tags: ["Sättigend", "Proteinanker", "Frühstück"],
      nutrition: {
        kcal: 537,
        protein: 35,
        carbs: 50,
        fat: 21,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "tahin-apfel-shake": {
      id: "tahin-apfel-shake",
      name: "Tahin Apfel Shake",
      use: "Mehr Fett und Calcium, sinnvoll an Krafttagen.",
      cookTime: "5 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "VEMONDO High Protein Sojadrink", amount: 300, unit: "ml" },
        { ingredient: "Haferflocken", amount: 30, unit: "g" },
        { ingredient: "Erbsenprotein", amount: 20, unit: "g" },
        { ingredient: "Tahin", amount: 15, unit: "g" },
        { ingredient: "Apfel", amount: 150, unit: "g" },
        { ingredient: "Leinsamen", amount: 10, unit: "g" },
      ],
      preparation: [
        "Apfel grob schneiden.",
        "Alle Zutaten in den Mixer geben.",
        "Sehr fein mixen.",
        "Sofort trinken.",
      ],
      tags: ["Calcium", "Krafttag", "Frühstück"],
      nutrition: {
        kcal: 559,
        protein: 40,
        carbs: 51,
        fat: 21,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "overnight-oats-apfel": {
      id: "overnight-oats-apfel",
      name: "Overnight Oats Apfel",
      use: "Vor dem Long Ride, wenn morgens kein Aufwand gewünscht ist.",
      cookTime: "5 min aktiv, über Nacht ziehen",
      batchServings: 1,
      ingredients: [
        { ingredient: "Soja Classic Joghurt", amount: 200, unit: "g" },
        { ingredient: "VEMONDO High Protein Sojadrink", amount: 250, unit: "ml" },
        { ingredient: "Haferflocken", amount: 50, unit: "g" },
        { ingredient: "Erbsenprotein", amount: 15, unit: "g" },
        { ingredient: "Apfel", amount: 150, unit: "g" },
        { ingredient: "Leinsamen", amount: 10, unit: "g" },
      ],
      preparation: [
        "Joghurt, Sojadrink und Erbsenprotein verrühren.",
        "Hafer und Leinsamen einrühren.",
        "Apfel würfeln und unterheben.",
        "Über Nacht kalt stellen.",
      ],
      tags: ["Long Ride", "Meal-Prep", "Frühstück"],
      nutrition: {
        kcal: 603,
        protein: 41,
        carbs: 65,
        fat: 18,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "tomaten-mung-dal": {
      id: "tomaten-mung-dal",
      name: "Tomaten Mung Dal",
      use: "Warmer Proteinanker für den Wochenstart.",
      cookTime: "15 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Mungbohnen geschält gespalten", amount: 100, unit: "g" },
        { ingredient: "Couscous", amount: 60, unit: "g" },
        { ingredient: "Zwiebel", amount: 80, unit: "g" },
        { ingredient: "Möhren", amount: 120, unit: "g" },
        { ingredient: "Tomatenmark", amount: 25, unit: "g" },
        { ingredient: "Sojasauce", amount: 10, unit: "ml" },
        { ingredient: "Hefeflocken", amount: 10, unit: "g" },
        { ingredient: "Jodsalz", amount: 3, unit: "g" },
      ],
      preparation: [
        "Mungbohnen mit gewürfelter Zwiebel und Möhre kochen.",
        "Tomatenmark und Sojasauce einrühren.",
        "Couscous separat mit heißem Wasser quellen lassen.",
        "Dal mit Hefeflocken abschmecken und mit Couscous servieren.",
      ],
      tags: ["Warm", "Lunch", "Proteinreich"],
      nutrition: {
        kcal: 718,
        protein: 38,
        carbs: 119,
        fat: 3,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "couscous-soja-bowl": {
      id: "couscous-soja-bowl",
      name: "Couscous Soja Bowl",
      use: "Mo Abend To-go, Di Mittag To-go.",
      cookTime: "15 min",
      batchServings: 2,
      ingredients: [
        { ingredient: "Soja Schnetzel", amount: 50, unit: "g" },
        { ingredient: "Couscous", amount: 80, unit: "g" },
        { ingredient: "Möhren", amount: 100, unit: "g" },
        { ingredient: "Porree", amount: 50, unit: "g" },
        { ingredient: "Zwiebel", amount: 50, unit: "g" },
        { ingredient: "Sojasauce", amount: 15, unit: "ml" },
        { ingredient: "Zitronensaft", amount: 10, unit: "ml" },
        { ingredient: "Sesam", amount: 10, unit: "g" },
        { ingredient: "Jodsalz", amount: 2, unit: "g" },
      ],
      preparation: [
        "Couscous mit heißem Wasser quellen lassen.",
        "Soja Schnetzel einweichen und ausdrücken.",
        "Zwiebel, Möhre und Porree anbraten, Soja Schnetzel zugeben.",
        "Mit Sojasauce und Zitrone abschmecken, über Couscous füllen und mit Sesam toppen.",
      ],
      tags: ["To-go", "Batch", "Lunch/Dinner"],
      nutrition: {
        kcal: 634,
        protein: 38,
        carbs: 83,
        fat: 8,
        estimated: true,
        note: "Makros pro Portion als grobe Rezept-Schätzung.",
      },
    },
    "seitan-pilz-pfanne": {
      id: "seitan-pilz-pfanne",
      name: "Seitan Pilz Pfanne",
      use: "Mi Mittag To-go, Do Abend To-go.",
      cookTime: "20 min",
      batchServings: 2,
      ingredients: [
        { ingredient: "Seitan Pulver", amount: 70, unit: "g" },
        { ingredient: "Champignons", amount: 125, unit: "g" },
        { ingredient: "Kartoffeln", amount: 300, unit: "g" },
        { ingredient: "Zwiebel", amount: 60, unit: "g" },
        { ingredient: "Sojasauce", amount: 15, unit: "ml" },
        { ingredient: "Zitronensaft", amount: 5, unit: "ml" },
        { ingredient: "Jodsalz", amount: 3, unit: "g" },
      ],
      preparation: [
        "Seitan aus Pulver nach Packlogik anrühren und kurz garen.",
        "Kartoffeln würfeln und weich braten.",
        "Zwiebel und Champignons separat kräftig anbraten.",
        "Alles zusammen mit Sojasauce und Zitronensaft schwenken.",
      ],
      tags: ["To-go", "Batch", "Proteinreich"],
      nutrition: {
        kcal: 558,
        protein: 62,
        carbs: 68,
        fat: 3,
        estimated: true,
        note: "Makros pro Portion als grobe Rezept-Schätzung.",
      },
    },
    "tofu-lauch-polenta": {
      id: "tofu-lauch-polenta",
      name: "Tofu Lauch Polenta",
      use: "Warme Mittagsmahlzeit für den Krafttag.",
      cookTime: "15 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Bioland Tofu natur", amount: 200, unit: "g" },
        { ingredient: "Polenta", amount: 80, unit: "g" },
        { ingredient: "Porree", amount: 100, unit: "g" },
        { ingredient: "Zwiebel", amount: 50, unit: "g" },
        { ingredient: "VEMONDO High Protein Sojadrink", amount: 150, unit: "ml" },
        { ingredient: "Hefeflocken", amount: 10, unit: "g" },
        { ingredient: "Sojasauce", amount: 10, unit: "ml" },
        { ingredient: "Jodsalz", amount: 2, unit: "g" },
      ],
      preparation: [
        "Polenta in heißer Flüssigkeit mit Sojadrink cremig rühren.",
        "Zwiebel und Porree anbraten.",
        "Tofu würfeln und kräftig mitbraten.",
        "Mit Sojasauce und Hefeflocken abschmecken und auf Polenta geben.",
      ],
      tags: ["Warm", "Krafttag", "Lunch"],
      nutrition: {
        kcal: 775,
        protein: 52,
        carbs: 84,
        fat: 22,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "ofenkartoffeln-seitan": {
      id: "ofenkartoffeln-seitan",
      name: "Ofenkartoffeln Seitan",
      use: "Protein- und Carb-Fokus für den Trainingsfreitag.",
      cookTime: "20 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Seitan Pulver", amount: 70, unit: "g" },
        { ingredient: "Kartoffeln", amount: 350, unit: "g" },
        { ingredient: "Möhren", amount: 150, unit: "g" },
        { ingredient: "Tahin", amount: 15, unit: "g" },
        { ingredient: "Zitronensaft", amount: 10, unit: "ml" },
        { ingredient: "Jodsalz", amount: 3, unit: "g" },
      ],
      preparation: [
        "Kartoffeln und Möhren würfeln und im Ofen rösten.",
        "Seitan aus Pulver anrühren und garen.",
        "Tahin mit Zitrone und Wasser zur Sauce rühren.",
        "Alles zusammen mit Jodsalz servieren.",
      ],
      tags: ["Warm", "Proteinreich", "Lunch"],
      nutrition: {
        kcal: 683,
        protein: 63,
        carbs: 85,
        fat: 10,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "kartoffel-soja-pfanne": {
      id: "kartoffel-soja-pfanne",
      name: "Kartoffel Soja Pfanne",
      use: "Entspannter Samstag, aber weiter proteinbewusst.",
      cookTime: "15 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Soja Schnetzel", amount: 45, unit: "g" },
        { ingredient: "Kartoffeln", amount: 350, unit: "g" },
        { ingredient: "Möhren", amount: 120, unit: "g" },
        { ingredient: "Zwiebel", amount: 60, unit: "g" },
        { ingredient: "Tahin", amount: 15, unit: "g" },
        { ingredient: "Hefeflocken", amount: 10, unit: "g" },
        { ingredient: "Sojasauce", amount: 10, unit: "ml" },
        { ingredient: "Jodsalz", amount: 2, unit: "g" },
      ],
      preparation: [
        "Soja Schnetzel einweichen und ausdrücken.",
        "Kartoffeln mit Zwiebel und Möhre anbraten.",
        "Soja Schnetzel zugeben und würzen.",
        "Mit Tahin, Hefeflocken und etwas Wasser cremig ziehen.",
      ],
      tags: ["Warm", "Lunch", "Proteinbewusst"],
      nutrition: {
        kcal: 627,
        protein: 38,
        carbs: 87,
        fat: 10,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "recovery-couscous-bowl": {
      id: "recovery-couscous-bowl",
      name: "Recovery Couscous Bowl",
      use: "Recovery-Dinner nach dem Long Ride.",
      cookTime: "15 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Soja Schnetzel", amount: 60, unit: "g" },
        { ingredient: "Couscous", amount: 90, unit: "g" },
        { ingredient: "Mischgemüse", amount: 200, unit: "g" },
        { ingredient: "Zwiebel", amount: 60, unit: "g" },
        { ingredient: "Tomatenmark", amount: 20, unit: "g" },
        { ingredient: "Sojasauce", amount: 15, unit: "ml" },
        { ingredient: "Hefeflocken", amount: 10, unit: "g" },
        { ingredient: "Jodsalz", amount: 3, unit: "g" },
      ],
      preparation: [
        "Couscous mit heißem Wasser quellen lassen.",
        "Soja Schnetzel einweichen und ausdrücken.",
        "Zwiebel, Mischgemüse und Tomatenmark anbraten.",
        "Soja Schnetzel zugeben, würzen und auf Couscous servieren.",
      ],
      tags: ["Recovery", "Dinner", "Carbs"],
      nutrition: {
        kcal: 726,
        protein: 48,
        carbs: 106,
        fat: 4,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "apfel-kernmix": {
      id: "apfel-kernmix",
      name: "Apfel Kernmix",
      use: "Schneller Snack mit Selen-Routine.",
      cookTime: "3 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Apfel", amount: 150, unit: "g" },
        { ingredient: "Sonnenblumenkerne", amount: 15, unit: "g" },
        { ingredient: "Paranuss", amount: 1, unit: "Stk" },
        { ingredient: "Jodsalz", amount: 1, unit: "g" },
      ],
      preparation: [
        "Apfel waschen und schneiden.",
        "Sonnenblumenkerne leicht salzen.",
        "Mit 1 Paranuss zusammen verpacken.",
      ],
      tags: ["Snack", "Selen", "Schnell"],
      nutrition: {
        kcal: 198,
        protein: 4,
        carbs: 25,
        fat: 11,
        estimated: true,
        note: "Makros als grobe Rezept-Schaetzung aus den Zutaten summiert.",
      },
    },
    "sojajoghurt-dip": {
      id: "sojajoghurt-dip",
      name: "Sojajoghurt Dip",
      use: "Snack für Office oder entspannten Nachmittag.",
      cookTime: "5 min",
      batchServings: 1,
      ingredients: [
        { ingredient: "Soja Classic Joghurt", amount: 150, unit: "g" },
        { ingredient: "Möhren", amount: 150, unit: "g" },
        { ingredient: "Zitronensaft", amount: 10, unit: "ml" },
        { ingredient: "Hefeflocken", amount: 5, unit: "g" },
        { ingredient: "Jodsalz", amount: 1, unit: "g" },
      ],
      preparation: [
        "Joghurt mit Zitrone, Hefeflocken und Salz verrühren.",
        "Möhren in Sticks schneiden.",
        "Dip mit Möhren essen oder mitnehmen.",
      ],
      tags: ["Snack", "Office", "Calcium"],
      nutrition: {
        kcal: 159,
        protein: 10,
        carbs: 19,
        fat: 4,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
    "ride-snack-salzkartoffeln": {
      id: "ride-snack-salzkartoffeln",
      name: "Ride Snack Salzkartoffeln",
      use: "Snack während des Long Ride.",
      cookTime: "10 min aktiv",
      batchServings: 1,
      ingredients: [
        { ingredient: "Kartoffeln", amount: 350, unit: "g" },
        { ingredient: "Jodsalz", amount: 2, unit: "g" },
      ],
      preparation: [
        "Kartoffeln weich kochen.",
        "Pellen oder halbieren.",
        "Leicht salzen und in Box packen.",
      ],
      tags: ["Ride", "Snack", "Carbs"],
      nutrition: {
        kcal: 270,
        protein: 7,
        carbs: 60,
        fat: 0,
        estimated: true,
        note: "Makros als grobe Rezept-Schätzung aus den Zutaten summiert.",
      },
    },
  },
  templates: [
    {
      name: "Proteinshake Apfel-Hafer",
      use: "Nach morgendlichem Training oder bei sehr wenig Zeit.",
      base: "HP-Sojadrink + Hafer + Erbsenprotein + Apfel + Leinsamen",
    },
    {
      name: "Joghurt-Oats Glas",
      use: "Office-geeignet, schnell löffelbar, gut vorbereitbar.",
      base: "Sojajoghurt + Hafer + Erbsenprotein + Apfel + Leinsamen",
    },
    {
      name: "Proteinbowl Apfel",
      use: "Etwas sättigender als der Shake, aber weiter unter 5 Minuten.",
      base: "Sojajoghurt + Hafer + Erbsenprotein + Apfel + Sonnenblumenkerne",
    },
    {
      name: "Tahin-Shake Apfel",
      use: "Mehr Fett und Calcium, sinnvoll an Krafttagen.",
      base: "HP-Sojadrink + Tahin + Hafer + Erbsenprotein + Apfel",
    },
    {
      name: "Overnight Oats Apfel",
      use: "Vor dem Long Ride, wenn morgens kein Aufwand gewünscht ist.",
      base: "Sojajoghurt + HP-Sojadrink + Hafer + Erbsenprotein + Apfel",
    },
  ],
  mealPrepBlock: {
    dayShort: "SO",
    durationMin: 60,
    plan: [
      "Seitan-Basis für 2 Portionen vorbereiten und dämpfen.",
      "Kartoffeln für Ride-Snack vorkochen und salzen.",
      "Couscous-Basis für Recovery Bowl vorbereiten.",
      "1 Blech Möhren/Kartoffeln rösten als Basis für Sonntagabend und Wochenstart danach.",
    ],
    benefits: [
      "So Snack",
      "So Abend",
      "Mo Folge-Woche ausserhalb dieses Plans",
    ],
  },
  leftoverRules: [
    {
      sourceMealName: "Couscous Soja Bowl",
      amount: "2 Portionen gekocht",
      targetDayShort: "MO",
      note: "Direkt als Batch kochen; Montagabend ist die erste Portion.",
    },
    {
      sourceMealName: "Couscous Soja Bowl",
      amount: "2 Portionen gekocht",
      targetDayShort: "DI",
      note: "Zweite Portion lässt sich Dienstag in der Mikrowelle gut nutzen.",
    },
    {
      sourceMealName: "Seitan Pilz Pfanne",
      amount: "2 Portionen gekocht",
      targetDayShort: "MI",
      note: "Mittwochs frisch kochen, die erste Portion direkt als To-go nutzen.",
    },
    {
      sourceMealName: "Seitan Pilz Pfanne",
      amount: "2 Portionen gekocht",
      targetDayShort: "DO",
      note: "Donnerstag kalt oder aufgewärmt als Batch-Rest einplanen.",
    },
    {
      sourceMealName: "Sonntags-Meal-Prep",
      amount: "2 Basisportionen",
      targetDayShort: "SO",
      note: "Verbessert vor allem Sonntagabend und den Wochenstart danach.",
    },
  ],
  externalMealGuidance: {
    title: "Externes Meal",
    kcalRange: "650-800 kcal",
    proteinRange: "25-30 g Protein",
    assumptions: [
      "Für die Wochenlogik als vegan und proteinbewusst angenommen.",
      "Makros bleiben absichtlich als Range markiert, damit keine Scheingenauigkeit entsteht.",
      "Calcium und Jod sind extern weniger robust als in den selbst gekochten Meals.",
    ],
    tips: [
      "Gezielt Tofu, Bohnen, Linsen oder Seitan wählen.",
      "Wenn das Meal proteinarm ausfällt, zusätzlich 250-350 ml HP-Sojadrink einplanen.",
      "Jodsalz und Calcium sind extern die größten Unsicherheitsfaktoren.",
    ],
    warning:
      "Externe Mahlzeiten sind die größte Unsicherheitsquelle dieser Woche. Fokus auf Protein, nicht nur auf Kalorien.",
  },
  criticalNutrientTips: [
    {
      nutrient: "Calcium",
      status: "attention",
      action: "Täglich 500-700 ml HP-Sojadrink sicherstellen, sonst fällt Calcium schnell ab.",
    },
    {
      nutrient: "Jod",
      status: "attention",
      action: "Jodsalz konsequent in gekochten Meals nutzen; extern ist Jod unsicher.",
    },
    {
      nutrient: "Vitamin D",
      status: "supplement",
      action: "Anfang April weiter supplementieren, besonders bei wenig Sonne.",
    },
    {
      nutrient: "B12",
      status: "good",
      action: "Supplement täglich bzw. nach fester Routine weiterführen.",
    },
  ],
  budget: {
    budgetHardCap: 25,
    shoppingCost: 18.79,
    pantryShare: 6.18,
    totalCost: 24.97,
    status: "Knapp innerhalb des Caps auf Basis bepreister Bestände.",
    note:
      "Unbepreiste Pantryartikel wurden nicht voll monetarisiert. Reale Vollkosten können leicht über 25 EUR liegen.",
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

export function getDayByDate(plan: NutritionPlan, date: number | string) {
  return (
    plan.days.find((day) =>
      typeof date === "string" ? day.isoDate === date : day.date === date,
    ) ?? plan.days[0]
  );
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
    date: day.isoDate,
    displayDate: day.date,
  }));
}

export function getTodayPlanDate(plan: NutritionPlan) {
  const now = new Date();
  const isoDate = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, "0"),
    `${now.getDate()}`.padStart(2, "0"),
  ].join("-");

  return plan.days.find((day) => day.isoDate === isoDate)?.isoDate ?? plan.days[0].isoDate;
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
  return day.meals.reduce(
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
}

export function getExternalMealCount(day: NutritionDay) {
  return day.meals.filter((slot) => slot.isExternal).length;
}
