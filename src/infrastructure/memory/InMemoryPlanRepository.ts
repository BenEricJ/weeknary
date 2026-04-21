import type { EntityId, PlanMetadata, UserId } from "../../domain";
import type { RepositoryPort } from "../../application";

export class InMemoryPlanRepository<TPlan extends PlanMetadata>
  implements RepositoryPort<TPlan>
{
  private readonly records = new Map<string, TPlan>();

  constructor(seed: TPlan[] = []) {
    seed.forEach((plan) => {
      this.records.set(cacheKey(plan.userId, plan.id), clone(plan));
    });
  }

  async getById(userId: UserId, id: EntityId) {
    return cloneOrNull(this.records.get(cacheKey(userId, id)));
  }

  async listByUser(userId: UserId) {
    return Array.from(this.records.values())
      .filter((plan) => plan.userId === userId && !plan.deletedAt)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map(clone);
  }

  async save(record: TPlan) {
    const nextRecord = clone(record);
    this.records.set(cacheKey(nextRecord.userId, nextRecord.id), nextRecord);
    return clone(nextRecord);
  }

  async archive(userId: UserId, id: EntityId) {
    const current = this.records.get(cacheKey(userId, id));

    if (!current) {
      throw new Error(`Plan ${id} was not found.`);
    }

    const archived = {
      ...current,
      status: "archived",
      updatedAt: new Date().toISOString(),
      version: current.version + 1,
    } as TPlan;

    this.records.set(cacheKey(userId, id), clone(archived));
    return clone(archived);
  }
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneOrNull<T>(value: T | undefined): T | null {
  return value ? clone(value) : null;
}

function cacheKey(userId: UserId, id: EntityId) {
  return `${userId}:${id}`;
}
