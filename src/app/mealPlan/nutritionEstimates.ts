import {
  MEAL_SLOT_ORDER,
  createNutritionBreakdown,
  getMealById,
  type MacroEstimate,
  type MealSlotType,
  type NutritionBreakdown,
  type NutritionDay,
  type NutritionPlan,
} from "../data/nutritionPlan";

const DEFAULT_EXTERNAL_ESTIMATE: MacroEstimate = {
  kcal: 725,
  protein: 28,
  carbs: 75,
  fat: 20,
  breakdown: createNutritionBreakdown({
    fiber: 9,
    sugar: 8,
    addedSugar: 2,
    saturatedFat: 4.5,
    monounsaturatedFat: 7,
    polyunsaturatedFat: 5,
    transFat: 0,
    cholesterol: 0,
    sodium: 780,
    salt: 2,
    water: 320,
    alcohol: 0,
    biotin: 8,
    vitaminC: 10,
    vitaminD: 0.8,
    vitaminE: 2.1,
    vitaminK: 14,
    iron: 4.2,
    potassium: 760,
    calcium: 180,
    magnesium: 95,
    zinc: 2.4,
  }),
  estimated: true,
  note: "Externe Meal-Schätzung auf Basis vergleichbarer Plan-Slots.",
};

export function getMealSummaries(plan: NutritionPlan, day: NutritionDay) {
  return MEAL_SLOT_ORDER.map((slotType) => {
    const slot = day.meals.find((meal) => meal.slot === slotType);
    if (!slot) {
      return null;
    }

    const recipe = getMealById(plan, slot.mealId);
    const nutrition = getEstimatedNutritionForSlot(plan, day, slotType, slot.isExternal);
    const isEstimated = slot.isExternal || nutrition.estimated;

    return {
      slotType,
      title: recipe?.name ?? "Externes Meal",
      subtitle: recipe?.use ?? plan.externalMealGuidance.warning,
      nutrition,
      display: {
        kcal: slot.isExternal ? plan.externalMealGuidance.kcalRange : `${nutrition.kcal} kcal`,
        carbs: `${nutrition.carbs} g`,
        protein: slot.isExternal
          ? plan.externalMealGuidance.proteinRange
          : `${nutrition.protein} g`,
        fat: `${nutrition.fat} g`,
      },
      note: slot.isExternal
        ? "Kohlenhydrate und Fett sind für externe Meals aus vergleichbaren Plan-Slots geschätzt."
        : isEstimated
          ? nutrition.note
          : recipe?.nutrition?.note ?? null,
    };
  }).filter(Boolean) as Array<{
    slotType: MealSlotType;
    title: string;
    subtitle: string;
    nutrition: MacroEstimate;
    display: Record<"kcal" | "carbs" | "protein" | "fat", string>;
    note: string | undefined | null;
  }>;
}

export function getEstimatedTotalsForDay(plan: NutritionPlan, day: NutritionDay): MacroEstimate {
  return day.meals.reduce(
    (totals, slot) => {
      const nutrition = getEstimatedNutritionForSlot(plan, day, slot.slot, slot.isExternal);
      return {
        kcal: totals.kcal + nutrition.kcal,
        protein: totals.protein + nutrition.protein,
        carbs: totals.carbs + nutrition.carbs,
        fat: totals.fat + nutrition.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function getEstimatedBreakdownForDay(plan: NutritionPlan, day: NutritionDay): NutritionBreakdown {
  return day.meals.reduce((totals, slot) => {
    const nutrition = getEstimatedNutritionForSlot(plan, day, slot.slot, slot.isExternal);
    return addNutritionBreakdowns(totals, nutrition.breakdown);
  }, createNutritionBreakdown());
}

export function getPlannedMacrosForDrawer(plan: NutritionPlan, day: NutritionDay): MacroEstimate {
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

function getEstimatedNutritionForSlot(
  plan: NutritionPlan,
  day: NutritionDay,
  slotType: MealSlotType,
  isExternal: boolean,
): MacroEstimate {
  if (!isExternal) {
    const slot = day.meals.find((meal) => meal.slot === slotType);
    const recipe = getMealById(plan, slot?.mealId);
    if (recipe?.nutrition) {
      return recipe.nutrition;
    }
  }

  const comparableNutritions = plan.days
    .flatMap((nutritionDay) =>
      nutritionDay.meals
        .filter((meal) => meal.slot === slotType && !meal.isExternal)
        .map((meal) => getMealById(plan, meal.mealId)?.nutrition)
        .filter(Boolean),
    )
    .filter(Boolean) as MacroEstimate[];

  if (!comparableNutritions.length) {
    return DEFAULT_EXTERNAL_ESTIMATE;
  }

  const averageBreakdown = averageNutritionBreakdowns(
    comparableNutritions.map((nutrition) => nutrition.breakdown),
  );

  return {
    kcal: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.kcal, 0) /
        comparableNutritions.length,
    ),
    protein: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.protein, 0) /
        comparableNutritions.length,
    ),
    carbs: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.carbs, 0) /
        comparableNutritions.length,
    ),
    fat: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.fat, 0) /
        comparableNutritions.length,
    ),
    breakdown: averageBreakdown,
    estimated: true,
    note: "Externe Meal-Schätzung auf Basis vergleichbarer Plan-Slots.",
  };
}

export function getProgressValue(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(current / target, 1);
}

function addNutritionBreakdowns(
  totals: NutritionBreakdown,
  values?: NutritionBreakdown,
) {
  const nextValues = values ?? createNutritionBreakdown();

  return createNutritionBreakdown({
    fiber: roundBreakdownValue(totals.fiber + nextValues.fiber),
    sugar: roundBreakdownValue(totals.sugar + nextValues.sugar),
    addedSugar: roundBreakdownValue(totals.addedSugar + nextValues.addedSugar),
    saturatedFat: roundBreakdownValue(totals.saturatedFat + nextValues.saturatedFat),
    monounsaturatedFat: roundBreakdownValue(totals.monounsaturatedFat + nextValues.monounsaturatedFat),
    polyunsaturatedFat: roundBreakdownValue(totals.polyunsaturatedFat + nextValues.polyunsaturatedFat),
    transFat: roundBreakdownValue(totals.transFat + nextValues.transFat),
    cholesterol: roundBreakdownValue(totals.cholesterol + nextValues.cholesterol),
    sodium: roundBreakdownValue(totals.sodium + nextValues.sodium),
    salt: roundBreakdownValue(totals.salt + nextValues.salt),
    water: roundBreakdownValue(totals.water + nextValues.water),
    alcohol: roundBreakdownValue(totals.alcohol + nextValues.alcohol),
    biotin: roundBreakdownValue(totals.biotin + nextValues.biotin),
    vitaminC: roundBreakdownValue(totals.vitaminC + nextValues.vitaminC),
    vitaminD: roundBreakdownValue(totals.vitaminD + nextValues.vitaminD),
    vitaminE: roundBreakdownValue(totals.vitaminE + nextValues.vitaminE),
    vitaminK: roundBreakdownValue(totals.vitaminK + nextValues.vitaminK),
    iron: roundBreakdownValue(totals.iron + nextValues.iron),
    potassium: roundBreakdownValue(totals.potassium + nextValues.potassium),
    calcium: roundBreakdownValue(totals.calcium + nextValues.calcium),
    magnesium: roundBreakdownValue(totals.magnesium + nextValues.magnesium),
    zinc: roundBreakdownValue(totals.zinc + nextValues.zinc),
  });
}

function averageNutritionBreakdowns(
  breakdowns: Array<NutritionBreakdown | undefined>,
): NutritionBreakdown {
  const validBreakdowns = breakdowns.filter(Boolean) as NutritionBreakdown[];
  if (!validBreakdowns.length) {
    return createNutritionBreakdown();
  }

  const totals = validBreakdowns.reduce(
    (currentTotals, breakdown) => addNutritionBreakdowns(currentTotals, breakdown),
    createNutritionBreakdown(),
  );
  const divisor = validBreakdowns.length;

  return createNutritionBreakdown({
    fiber: roundBreakdownValue(totals.fiber / divisor),
    sugar: roundBreakdownValue(totals.sugar / divisor),
    addedSugar: roundBreakdownValue(totals.addedSugar / divisor),
    saturatedFat: roundBreakdownValue(totals.saturatedFat / divisor),
    monounsaturatedFat: roundBreakdownValue(totals.monounsaturatedFat / divisor),
    polyunsaturatedFat: roundBreakdownValue(totals.polyunsaturatedFat / divisor),
    transFat: roundBreakdownValue(totals.transFat / divisor),
    cholesterol: roundBreakdownValue(totals.cholesterol / divisor),
    sodium: roundBreakdownValue(totals.sodium / divisor),
    salt: roundBreakdownValue(totals.salt / divisor),
    water: roundBreakdownValue(totals.water / divisor),
    alcohol: roundBreakdownValue(totals.alcohol / divisor),
    biotin: roundBreakdownValue(totals.biotin / divisor),
    vitaminC: roundBreakdownValue(totals.vitaminC / divisor),
    vitaminD: roundBreakdownValue(totals.vitaminD / divisor),
    vitaminE: roundBreakdownValue(totals.vitaminE / divisor),
    vitaminK: roundBreakdownValue(totals.vitaminK / divisor),
    iron: roundBreakdownValue(totals.iron / divisor),
    potassium: roundBreakdownValue(totals.potassium / divisor),
    calcium: roundBreakdownValue(totals.calcium / divisor),
    magnesium: roundBreakdownValue(totals.magnesium / divisor),
    zinc: roundBreakdownValue(totals.zinc / divisor),
  });
}

function roundBreakdownValue(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatGrams(value: number) {
  return `${value.toFixed(1).replace(".", ",")} g`;
}

export function formatMilligrams(value: number) {
  return `${value.toFixed(0).replace(".", ",")} mg`;
}

export function formatMicrograms(value: number) {
  return `${value.toFixed(1).replace(".", ",")} ug`;
}

export function formatMilliliters(value: number) {
  return `${value.toFixed(0).replace(".", ",")} ml`;
}
