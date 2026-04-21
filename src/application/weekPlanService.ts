import type { EntityId, UserId, WeekPlan } from "../domain";
import type { WeekPlanRepositoryPort } from "./ports";

export type ClockPort = () => string;

export class WeekPlanService {
  constructor(
    private readonly repository: WeekPlanRepositoryPort,
    private readonly clock: ClockPort = () => new Date().toISOString(),
  ) {}

  getActiveWeekPlan(userId: UserId) {
    return this.repository.getActiveByUser(userId);
  }

  getWeekPlanById(userId: UserId, planId: EntityId) {
    return this.repository.getById(userId, planId);
  }

  listWeekPlans(userId: UserId) {
    return this.repository.listByUser(userId);
  }

  async saveWeekPlan(plan: WeekPlan) {
    validateWeekPlan(plan);
    const now = this.clock();
    return this.repository.save({
      ...plan,
      updatedAt: now,
      version: plan.version + 1,
    });
  }

  archiveWeekPlan(userId: UserId, planId: EntityId) {
    return this.repository.archive(userId, planId);
  }

  async activateWeekPlan(userId: UserId, planId: EntityId) {
    const plans = await this.repository.listByUser(userId);
    const target = plans.find((plan) => plan.id === planId);

    if (!target) {
      throw new Error(`WeekPlan ${planId} was not found.`);
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
}

function validateWeekPlan(plan: WeekPlan) {
  if (!plan.title.trim()) {
    throw new Error("WeekPlan title is required.");
  }

  if (plan.dateRange.startDate > plan.dateRange.endDate) {
    throw new Error("WeekPlan date range is invalid.");
  }

  for (const event of plan.events) {
    if (!event.title.trim()) {
      throw new Error("WeekPlan event title is required.");
    }

    if (event.start && event.end && event.start >= event.end) {
      throw new Error("WeekPlan event end must be after start.");
    }
  }
}
