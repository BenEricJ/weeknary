import type { Profile } from "../../domain";
import type { ProfileRepositoryPort } from "../../application";
import type { Json, UserScopedPayloadRow, WeeknarySupabaseClient } from "./supabaseClient";

export class SupabaseProfileRepository implements ProfileRepositoryPort {
  constructor(private readonly client: WeeknarySupabaseClient) {}

  async getByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await this.fromTable()
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.message !== "") {
      throw new Error(`profiles getByUserId failed: ${error.message}`);
    }

    if (error || !data) {
      return null;
    }

    return rowToProfile(data as UserScopedPayloadRow);
  }

  async save(profile: Profile): Promise<Profile> {
    const { error } = await this.fromTable().upsert(
      {
        id: profile.id,
        user_id: profile.userId,
        version: profile.version,
        payload: profileToPayload(profile),
        created_at: profile.createdAt,
        updated_at: profile.updatedAt,
      },
      { onConflict: "user_id" },
    );

    if (error && error.message !== "") {
      throw new Error(`profiles save failed: ${error.message}`);
    }

    const saved = await this.getByUserId(profile.userId);

    if (!saved) {
      throw new Error(`profiles save failed: saved profile ${profile.id} could not be read.`);
    }

    return saved;
  }

  private fromTable() {
    return (this.client as any).from("profiles");
  }
}

function profileToPayload(profile: Profile): Json {
  return {
    schemaVersion: 1,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    birthYear: profile.birthYear,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel,
    planningPersona: profile.planningPersona,
  };
}

function rowToProfile(row: UserScopedPayloadRow): Profile {
  const payload = requirePayload(row.payload);

  return {
    id: row.id,
    userId: row.user_id,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    displayName: stringValue(payload.displayName, "Alex"),
    avatarUrl: optionalString(payload.avatarUrl),
    birthYear: optionalNumber(payload.birthYear),
    heightCm: optionalNumber(payload.heightCm),
    weightKg: optionalNumber(payload.weightKg),
    activityLevel: payload.activityLevel === "low" || payload.activityLevel === "high"
      ? payload.activityLevel
      : "medium",
    planningPersona:
      payload.planningPersona === "flexible" || payload.planningPersona === "minimalist"
        ? payload.planningPersona
        : "structured",
  };
}

function requirePayload(payload: Json) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("profiles payload must be an object.");
  }

  const record = payload as Record<string, unknown>;

  if (record.schemaVersion !== 1) {
    throw new Error("profiles payload schemaVersion is unsupported.");
  }

  return record;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
