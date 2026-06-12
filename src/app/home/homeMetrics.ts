import { WORKOUT_DATA } from "../components/WorkoutDetailDrawer";
import {
  NUTRITION_PLAN,
  getMealById,
  type MealSlotType,
  type NutritionDay,
} from "../data/nutritionPlan";
import {
  getDayDate,
  isSameDay,
  toMinutes,
  type DayPlan,
} from "../data/weekPlan";

const EATEN_SLOT_CUTOFF_MINUTES: Record<MealSlotType, number> = {
  breakfast: 10 * 60,
  lunch: 14 * 60,
  snack: 17 * 60,
  dinner: 21 * 60,
};

function getWorkoutKcal(workoutId: string) {
  const kcalStat = WORKOUT_DATA[workoutId]?.statsBar.find((stat) =>
    stat.val.toLowerCase().includes("kcal"),
  );
  const kcalValue = kcalStat?.val.match(/\d+/g)?.join("");

  return kcalValue ? Number(kcalValue) : 0;
}

export function getBurnedWorkoutKcal(day: DayPlan, now: Date) {
  const dayDate = getDayDate(day);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isPastDay = dayDate < todayStart;
  const isToday = isSameDay(dayDate, now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return day.events.reduce((total, event) => {
    if (!event.workoutId) {
      return total;
    }

    const hasEnded = toMinutes(event.end) <= currentMinutes;
    if (!isPastDay && (!isToday || !hasEnded)) {
      return total;
    }

    return total + getWorkoutKcal(event.workoutId);
  }, 0);
}

function getExternalMealKcalEstimate() {
  const rangeValues = NUTRITION_PLAN.externalMealGuidance.kcalRange
    .match(/\d+/g)
    ?.map(Number);

  if (!rangeValues?.length) {
    return 0;
  }

  if (rangeValues.length === 1) {
    return rangeValues[0];
  }

  return Math.round((rangeValues[0] + rangeValues[1]) / 2);
}

function getNutritionDayDate(day: NutritionDay) {
  const [year, month, date] = day.isoDate.split("-").map(Number);
  return new Date(year, month - 1, date);
}

export function getEatenKcalForDay(day: NutritionDay, now: Date) {
  const dayDate = getNutritionDayDate(day);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isPastDay = dayDate < todayStart;
  const isToday = isSameDay(dayDate, now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return day.meals.reduce((total, slot) => {
    const cutoffMinutes = EATEN_SLOT_CUTOFF_MINUTES[slot.slot];
    if (!isPastDay && (!isToday || currentMinutes < cutoffMinutes)) {
      return total;
    }

    if (slot.isExternal) {
      return total + getExternalMealKcalEstimate();
    }

    const meal = getMealById(NUTRITION_PLAN, slot.mealId);
    return total + (meal?.nutrition?.kcal ?? 0);
  }, 0);
}
