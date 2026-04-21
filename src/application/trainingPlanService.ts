import type { EntityId, TrainingPlan, TrainingWorkout, UserId } from "../domain";
import type { TrainingPlanRepositoryPort } from "./ports";

export class TrainingPlanService {
  constructor(
    private readonly repository: TrainingPlanRepositoryPort,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  getActiveTrainingPlan(userId: UserId) {
    return this.repository.getActiveByUser(userId);
  }

  getTrainingPlanById(userId: UserId, planId: EntityId) {
    return this.repository.getById(userId, planId);
  }

  listTrainingPlans(userId: UserId) {
    return this.repository.listByUser(userId);
  }

  saveTrainingPlan(plan: TrainingPlan) {
    validateTrainingPlan(plan);
    return this.repository.save({ ...plan, version: plan.version + 1 });
  }

  archiveTrainingPlan(userId: UserId, planId: EntityId) {
    return this.repository.archive(userId, planId);
  }

  async activateTrainingPlan(userId: UserId, planId: EntityId) {
    const plans = await this.repository.listByUser(userId);
    const target = plans.find((plan) => plan.id === planId);

    if (!target) {
      throw new Error(`TrainingPlan ${planId} was not found.`);
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

  async updateTrainingWorkout(
    userId: UserId,
    planId: EntityId,
    dayDate: string,
    workoutId: EntityId,
    patch: Partial<TrainingWorkout>,
  ) {
    const plan = await this.requirePlan(userId, planId);
    return this.saveTrainingPlan({
      ...plan,
      days: plan.days.map((day) =>
        day.date === dayDate
          ? {
              ...day,
              workouts: day.workouts.map((workout) =>
                workout.id === workoutId ? { ...workout, ...patch } : workout,
              ),
            }
          : day,
      ),
    });
  }

  async removeTrainingWorkout(
    userId: UserId,
    planId: EntityId,
    dayDate: string,
    workoutId: EntityId,
  ) {
    const plan = await this.requirePlan(userId, planId);
    return this.saveTrainingPlan({
      ...plan,
      days: plan.days.map((day) =>
        day.date === dayDate
          ? {
              ...day,
              workouts: day.workouts.filter((workout) => workout.id !== workoutId),
            }
          : day,
      ),
    });
  }

  private async requirePlan(userId: UserId, planId: EntityId) {
    const plan = await this.repository.getById(userId, planId);
    if (!plan) {
      throw new Error(`TrainingPlan ${planId} was not found.`);
    }
    return plan;
  }
}

function validateTrainingPlan(plan: TrainingPlan) {
  if (!plan.title.trim()) {
    throw new Error("TrainingPlan title is required.");
  }

  if (plan.dateRange.startDate > plan.dateRange.endDate) {
    throw new Error("TrainingPlan date range is invalid.");
  }

  for (const day of plan.days) {
    if (day.date < plan.dateRange.startDate || day.date > plan.dateRange.endDate) {
      throw new Error(`TrainingPlan day ${day.date} is outside the plan range.`);
    }

    for (const workout of day.workouts) {
      if (!workout.title.trim()) {
        throw new Error("Training workout title is required.");
      }

      if (workout.start && workout.end && workout.start >= workout.end) {
        throw new Error("Training workout end must be after start.");
      }
    }
  }
}
