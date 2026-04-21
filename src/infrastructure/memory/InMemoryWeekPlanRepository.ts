import type { UserId, WeekPlan } from "../../domain";
import type { WeekPlanRepositoryPort } from "../../application";
import { InMemoryPlanRepository } from "./InMemoryPlanRepository";

export class InMemoryWeekPlanRepository
  extends InMemoryPlanRepository<WeekPlan>
  implements WeekPlanRepositoryPort
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
