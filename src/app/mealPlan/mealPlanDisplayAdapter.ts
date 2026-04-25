import type { MealPlan, MealRecipe as DomainMealRecipe } from "../../domain";
import {
  createNutritionBreakdown,
  type MealRecipe,
  type NutritionPlan,
} from "../data/nutritionPlan";
import { getDateParts } from "../dateDisplay";

function recipeToDisplayRecipe(recipe: DomainMealRecipe): MealRecipe {
  return {
    id: recipe.id,
    name: recipe.name,
    use: "Generierter MealPlan",
    cookTime: "Flexibel",
    batchServings: 1,
    ingredients: recipe.ingredients.map((ingredient) => ({
      ingredient: ingredient.name,
      amount: ingredient.amount ?? "",
      unit: ingredient.unit ?? "",
    })),
    preparation: ["Nach Plan vorbereiten und an Tagesform anpassen."],
    tags: ["KI-generiert"],
    nutrition: recipe.nutrition
      ? {
          kcal: recipe.nutrition.kcal ?? 0,
          protein: recipe.nutrition.protein ?? 0,
          carbs: recipe.nutrition.carbs ?? 0,
          fat: recipe.nutrition.fat ?? 0,
          breakdown: createNutritionBreakdown(),
        }
      : undefined,
  };
}

export function mealPlanToNutritionPlan(plan: MealPlan): NutritionPlan {
  const recipes = Object.fromEntries(
    plan.recipes.map((recipe) => [recipe.id, recipeToDisplayRecipe(recipe)]),
  );

  const days = plan.days.map((day) => {
    const parts = getDateParts(day.date);
    const kcalTarget = day.targets?.kcal ?? plan.targets?.kcal ?? 0;
    const proteinTarget = day.targets?.protein ?? plan.targets?.protein ?? 0;

    return {
      dayShort: parts.dayShort,
      dayLabel: parts.dayLabel,
      isoDate: day.date,
      date: parts.date,
      monthLabel: parts.monthLabel,
      training: "Aktiver KI-Plan",
      targets: {
        kcalTarget,
        proteinTarget,
      },
      dailyLogic: `KI-generierter MealPlan fuer ${parts.dayLabel}.`,
      meals: day.meals.map((meal) => ({
        slot: meal.slotType,
        mealType: meal.external ? "external" as const : "recipe" as const,
        mealId: meal.recipeId,
        isExternal: Boolean(meal.external),
      })),
    };
  });

  return {
    week: {
      planLabel: plan.title,
      startIsoDate: plan.dateRange.startDate,
      endIsoDate: plan.dateRange.endDate,
      weekStartLabel: days[0]?.dayLabel ?? "Woche",
      persons: 1,
      mode: "KI-generiert",
      optimizationLogic: ["Aktiver generierter Plan."],
      assumptions: [],
      microRoutine: [],
      criticalNutrients: [],
    },
    days,
    recipes,
    templates: [],
    mealPrepBlock: {
      dayShort: days[0]?.dayShort ?? "MO",
      durationMin: 0,
      plan: [],
      benefits: [],
    },
    leftoverRules: [],
    externalMealGuidance: {
      title: "Externes Meal",
      kcalRange: "flexibel",
      proteinRange: "proteinbewusst",
      assumptions: [],
      tips: ["Bewusst waehlen und bei Bedarf im Plan nachtragen."],
      warning: "Externes Meal ist als flexible Platzhalter-Mahlzeit geplant.",
    },
    criticalNutrientTips: [],
    budget: {
      budgetHardCap: 0,
      shoppingCost: 0,
      pantryShare: 0,
      totalCost: 0,
      status: "Budget fuer KI-Plan nicht berechnet.",
      note: plan.shoppingList.length
        ? `Einkaufsliste: ${plan.shoppingList.join(", ")}`
        : "Keine Einkaufsliste vorhanden.",
    },
  };
}
