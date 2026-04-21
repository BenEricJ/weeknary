import type { TrainingPlan, UserId } from "../../domain";
import type { TrainingPlanRepositoryPort } from "../../application";
import { InMemoryPlanRepository } from "./InMemoryPlanRepository";

export class InMemoryTrainingPlanRepository
  extends InMemoryPlanRepository<TrainingPlan>
  implements TrainingPlanRepositoryPort
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
