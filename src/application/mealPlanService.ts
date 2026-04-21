import type { EntityId, MealPlan, MealSlot, UserId } from "../domain";
import type { MealPlanRepositoryPort } from "./ports";

export class MealPlanService {
  constructor(
    private readonly repository: MealPlanRepositoryPort,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  getActiveMealPlan(userId: UserId) {
    return this.repository.getActiveByUser(userId);
  }

  getMealPlanById(userId: UserId, planId: EntityId) {
    return this.repository.getById(userId, planId);
  }

  listMealPlans(userId: UserId) {
    return this.repository.listByUser(userId);
  }

  saveMealPlan(plan: MealPlan) {
    validateMealPlan(plan);
    return this.repository.save({ ...plan, version: plan.version + 1 });
  }

  archiveMealPlan(userId: UserId, planId: EntityId) {
    return this.repository.archive(userId, planId);
  }

  async activateMealPlan(userId: UserId, planId: EntityId) {
    const plans = await this.repository.listByUser(userId);
    const target = plans.find((plan) => plan.id === planId);

    if (!target) {
      throw new Error(`MealPlan ${planId} was not found.`);
    }

    const now = this.clock();
    await Promise.all(
      plans
        .filter((plan) => plan.status === "active" && plan.id !== planId)
        .map((plan) =>
          this.repository.save({
            ...plan,
            status: "archived",
            updatedAt: now,
            version: plan.version + 1,
          }),
        ),
    );

    return this.repository.save({
      ...target,
      status: "active",
      updatedAt: now,
      version: target.version + 1,
    });
  }

  async updateMealSlot(
    userId: UserId,
    planId: EntityId,
    dayDate: string,
    slotId: EntityId,
    patch: Partial<MealSlot>,
  ) {
    const plan = await this.requirePlan(userId, planId);
    const nextPlan = {
      ...plan,
      days: plan.days.map((day) =>
        day.date === dayDate
          ? {
              ...day,
              meals: day.meals.map((slot) =>
                slot.id === slotId ? { ...slot, ...patch } : slot,
              ),
            }
          : day,
      ),
    };

    return this.saveMealPlan(nextPlan);
  }

  async removeMealSlot(userId: UserId, planId: EntityId, dayDate: string, slotId: EntityId) {
    const plan = await this.requirePlan(userId, planId);
    return this.saveMealPlan({
      ...plan,
      days: plan.days.map((day) =>
        day.date === dayDate
          ? { ...day, meals: day.meals.filter((slot) => slot.id !== slotId) }
          : day,
      ),
    });
  }

  private async requirePlan(userId: UserId, planId: EntityId) {
    const plan = await this.repository.getById(userId, planId);
    if (!plan) {
      throw new Error(`MealPlan ${planId} was not found.`);
    }
    return plan;
  }
}

function validateMealPlan(plan: MealPlan) {
  if (!plan.title.trim()) {
    throw new Error("MealPlan title is required.");
  }

  if (plan.dateRange.startDate > plan.dateRange.endDate) {
    throw new Error("MealPlan date range is invalid.");
  }

  for (const day of plan.days) {
    if (day.date < plan.dateRange.startDate || day.date > plan.dateRange.endDate) {
      throw new Error(`MealPlan day ${day.date} is outside the plan range.`);
    }

    for (const slot of day.meals) {
      if (!slot.recipeId && !slot.title && !slot.external) {
        throw new Error("Meal slot must have recipeId, title, or external=true.");
      }
    }
  }

  for (const recipe of plan.recipes) {
    if (!recipe.name.trim()) {
      throw new Error("Meal recipe name is required.");
    }
  }
}
