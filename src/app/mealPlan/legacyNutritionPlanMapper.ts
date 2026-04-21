import type { MealPlan, MealRecipe, MealSlot } from "../../domain";
import type { NutritionPlan } from "../data/nutritionPlan";

export const DEMO_MEAL_PLAN_USER_ID = "demo-meal-user";
export const DEMO_MEAL_PLAN_ID = "demo-meal-plan-2026-04-06";

export function legacyNutritionPlanToDomain(
  plan: NutritionPlan,
  userId = DEMO_MEAL_PLAN_USER_ID,
): MealPlan {
  const now = "2026-04-06T00:00:00.000Z";

  return {
    id: DEMO_MEAL_PLAN_ID,
    userId,
    title: plan.week.planLabel,
    status: "active",
    source: "import",
    version: 1,
    dateRange: {
      startDate: plan.week.startIsoDate,
      endDate: plan.week.endIsoDate,
    },
    createdAt: now,
    updatedAt: now,
    targets: {},
    recipes: Object.values(plan.recipes).map(
      (recipe): MealRecipe => ({
        id: recipe.id,
        name: recipe.name,
        ingredients: recipe.ingredients.map((ingredient) => ({
          name: ingredient.ingredient,
          amount: ingredient.amount,
          unit: ingredient.unit,
        })),
        nutrition: recipe.nutrition
          ? {
              kcal: recipe.nutrition.kcal,
              protein: recipe.nutrition.protein,
              carbs: recipe.nutrition.carbs,
              fat: recipe.nutrition.fat,
            }
          : undefined,
      }),
    ),
    days: plan.days.map((day) => ({
      date: day.isoDate,
      targets: {
        kcal: day.targets.kcalTarget,
        protein: day.targets.proteinTarget,
      },
      meals: day.meals.map(
        (slot): MealSlot => ({
          id: `${day.isoDate}-${slot.slot}`,
          slotType: slot.slot,
          recipeId: slot.mealId,
          title: slot.isExternal ? "External meal" : undefined,
          external: slot.isExternal,
        }),
      ),
    })),
    shoppingList: [],
  };
}
