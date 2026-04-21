import type { MealPlan, UserId } from "../../domain";
import type { MealPlanRepositoryPort } from "../../application";
import { InMemoryPlanRepository } from "./InMemoryPlanRepository";

export class InMemoryMealPlanRepository
  extends InMemoryPlanRepository<MealPlan>
  implements MealPlanRepositoryPort
{
  async getActiveByUser(userId: UserId) {
    const plans = await this.listByUser(userId);
    return (
      plans
        .filter((plan) => plan.status === "active")
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ??
      null
    );
  }
}
