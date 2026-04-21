import type {
  DateRange,
  EntityId,
  MealPlan,
  PlanMetadata,
  TrainingPlan,
  UserId,
  WeekPlan,
} from "../../domain";
import type { RepositoryPort } from "../../application";
import type { Json, PlanRow, WeeknarySupabaseClient } from "./supabaseClient";

export type PlanTableName = "week_plans" | "meal_plans" | "training_plans";

interface PlanPayloadMapper<TPlan extends PlanMetadata> {
  toPayload(plan: TPlan): Json;
  fromPayload(row: PlanRow): Omit<TPlan, keyof PlanMetadata>;
}

export class SupabasePlanRepository<TPlan extends PlanMetadata>
  implements RepositoryPort<TPlan>
{
  constructor(
    private readonly client: WeeknarySupabaseClient,
    private readonly tableName: PlanTableName,
    private readonly mapper: PlanPayloadMapper<TPlan>,
  ) {}

  async getById(userId: UserId, id: EntityId): Promise<TPlan | null> {
    const { data, error } = await this.fromTable()
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error && !isAmbiguousEmptyRangeResponse(error)) {
      throw new Error(`${this.tableName} getById failed: ${error.message}`);
    }

    if (error) {
      return null;
    }

    return data ? this.rowToPlan(data as PlanRow) : null;
  }

  async getActiveByUser(userId: UserId): Promise<TPlan | null> {
    const { data, error } = await this.fromTable()
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && !isAmbiguousEmptyRangeResponse(error)) {
      throw new Error(`${this.tableName} getActiveByUser failed: ${error.message}`);
    }

    if (error) {
      return null;
    }

    return data ? this.rowToPlan(data as PlanRow) : null;
  }

  async listByUser(userId: UserId): Promise<TPlan[]> {
    const { data, error } = await this.fromTable()
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error && !isAmbiguousEmptyRangeResponse(error)) {
      throw new Error(`${this.tableName} listByUser failed: ${error.message}`);
    }

    if (error) {
      return [];
    }

    return (data ?? []).map((row: PlanRow) => this.rowToPlan(row));
  }

  async save(plan: TPlan): Promise<TPlan> {
    const { error } = await this.fromTable().upsert(this.planToRow(plan));

    if (error && !isAmbiguousEmptyRangeResponse(error)) {
      throw new Error(`${this.tableName} save failed: ${error.message}`);
    }

    const saved = await this.getById(plan.userId, plan.id);

    if (!saved) {
      throw new Error(`${this.tableName} save failed: saved plan ${plan.id} could not be read.`);
    }

    assertSavedMetadataMatches(this.tableName, plan, saved);

    return saved;
  }

  async archive(userId: UserId, id: EntityId): Promise<TPlan> {
    const existing = await this.getById(userId, id);

    if (!existing) {
      throw new Error(`${this.tableName} archive failed: plan ${id} was not found.`);
    }

    return this.save({
      ...existing,
      status: "archived",
      updatedAt: new Date().toISOString(),
      version: existing.version + 1,
    });
  }

  private fromTable() {
    return (this.client as any).from(this.tableName);
  }

  private planToRow(plan: TPlan) {
    return {
      id: plan.id,
      user_id: plan.userId,
      title: plan.title,
      status: plan.status,
      source: plan.source,
      version: plan.version,
      valid_from: plan.dateRange.startDate,
      valid_to: plan.dateRange.endDate,
      payload: this.mapper.toPayload(plan),
      created_at: plan.createdAt,
      updated_at: plan.updatedAt,
      deleted_at: plan.deletedAt ?? null,
    };
  }

  private rowToPlan(row: PlanRow): TPlan {
    assertValidRow(this.tableName, row);
    const body = this.mapper.fromPayload(row);

    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      status: row.status,
      source: row.source,
      version: row.version,
      dateRange: {
        startDate: row.valid_from,
        endDate: row.valid_to,
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? undefined,
      ...body,
    } as TPlan;
  }
}

function isAmbiguousEmptyRangeResponse(error: { message?: string }) {
  return error.message === "";
}

function assertSavedMetadataMatches<TPlan extends PlanMetadata>(
  tableName: string,
  expected: TPlan,
  actual: TPlan,
) {
  if (
    actual.userId !== expected.userId ||
    actual.title !== expected.title ||
    actual.status !== expected.status ||
    actual.source !== expected.source ||
    actual.version !== expected.version ||
    actual.dateRange.startDate !== expected.dateRange.startDate ||
    actual.dateRange.endDate !== expected.dateRange.endDate
  ) {
    throw new Error(`${tableName} save failed: saved plan ${expected.id} did not match the requested metadata.`);
  }
}

function assertValidRow(tableName: string, row: PlanRow) {
  if (!row.id || !row.user_id || !row.title) {
    throw new Error(`${tableName} row is missing required metadata.`);
  }

  if (!row.valid_from || !row.valid_to || row.valid_from > row.valid_to) {
    throw new Error(`${tableName} row has an invalid date range.`);
  }
}

function requirePayloadObject(tableName: string, payload: Json) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(`${tableName} payload must be an object.`);
  }

  const record = payload as Record<string, unknown>;

  if (record.schemaVersion !== 1) {
    throw new Error(`${tableName} payload schemaVersion is unsupported.`);
  }

  return record;
}

function requireArray(tableName: string, payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (!Array.isArray(value)) {
    throw new Error(`${tableName} payload.${key} must be an array.`);
  }

  return value;
}

export function weekPlanPayloadMapper(): PlanPayloadMapper<WeekPlan> {
  return {
    toPayload(plan) {
      return {
        schemaVersion: 1,
        events: plan.events as unknown as Json,
        focusItems: plan.focusItems as unknown as Json,
      };
    },
    fromPayload(row) {
      const payload = requirePayloadObject("week_plans", row.payload);
      return {
        events: requireArray("week_plans", payload, "events") as WeekPlan["events"],
        focusItems: requireArray(
          "week_plans",
          payload,
          "focusItems",
        ) as WeekPlan["focusItems"],
      };
    },
  };
}

export function mealPlanPayloadMapper(): PlanPayloadMapper<MealPlan> {
  return {
    toPayload(plan) {
      return {
        schemaVersion: 1,
        targets: (plan.targets ?? {}) as unknown as Json,
        days: plan.days as unknown as Json,
        recipes: plan.recipes as unknown as Json,
        shoppingList: plan.shoppingList as unknown as Json,
      };
    },
    fromPayload(row) {
      const payload = requirePayloadObject("meal_plans", row.payload);
      return {
        targets: payload.targets as MealPlan["targets"],
        days: requireArray("meal_plans", payload, "days") as MealPlan["days"],
        recipes: requireArray("meal_plans", payload, "recipes") as MealPlan["recipes"],
        shoppingList: requireArray(
          "meal_plans",
          payload,
          "shoppingList",
        ) as MealPlan["shoppingList"],
      };
    },
  };
}

export function trainingPlanPayloadMapper(): PlanPayloadMapper<TrainingPlan> {
  return {
    toPayload(plan) {
      return {
        schemaVersion: 1,
        days: plan.days as unknown as Json,
        workouts: plan.workouts as unknown as Json,
        goals: plan.goals as unknown as Json,
      };
    },
    fromPayload(row) {
      const payload = requirePayloadObject("training_plans", row.payload);
      return {
        days: requireArray(
          "training_plans",
          payload,
          "days",
        ) as TrainingPlan["days"],
        workouts: requireArray(
          "training_plans",
          payload,
          "workouts",
        ) as TrainingPlan["workouts"],
        goals: requireArray(
          "training_plans",
          payload,
          "goals",
        ) as TrainingPlan["goals"],
      };
    },
  };
}

export function sameDateRange(left: DateRange, right: DateRange) {
  return left.startDate === right.startDate && left.endDate === right.endDate;
}
