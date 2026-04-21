import type { UserPreferences } from "../../domain";
import type { UserPreferencesRepositoryPort } from "../../application";
import type { Json, UserScopedPayloadRow, WeeknarySupabaseClient } from "./supabaseClient";
import { createDefaultUserPreferences } from "../../application";

export class SupabaseUserPreferencesRepository implements UserPreferencesRepositoryPort {
  constructor(private readonly client: WeeknarySupabaseClient) {}

  async getByUserId(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.fromTable()
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.message !== "") {
      throw new Error(`user_preferences getByUserId failed: ${error.message}`);
    }

    if (error || !data) {
      return null;
    }

    return rowToUserPreferences(data as UserScopedPayloadRow);
  }

  async save(preferences: UserPreferences): Promise<UserPreferences> {
    const { error } = await this.fromTable().upsert(
      {
        id: preferences.id,
        user_id: preferences.userId,
        version: preferences.version,
        payload: preferencesToPayload(preferences),
        created_at: preferences.createdAt,
        updated_at: preferences.updatedAt,
      },
      { onConflict: "user_id" },
    );

    if (error && error.message !== "") {
      throw new Error(`user_preferences save failed: ${error.message}`);
    }

    const saved = await this.getByUserId(preferences.userId);

    if (!saved) {
      throw new Error(
        `user_preferences save failed: saved preferences ${preferences.id} could not be read.`,
      );
    }

    return saved;
  }

  private fromTable() {
    return (this.client as any).from("user_preferences");
  }
}

function preferencesToPayload(preferences: UserPreferences): Json {
  return {
    schemaVersion: 1,
    locale: preferences.locale,
    timezone: preferences.timezone,
    units: preferences.units,
    nutrition: preferences.nutrition as unknown as Json,
    training: preferences.training as unknown as Json,
    week: preferences.week as unknown as Json,
    notifications: preferences.notifications as unknown as Json,
  };
}

function rowToUserPreferences(row: UserScopedPayloadRow): UserPreferences {
  const payload = requirePayload(row.payload);
  const defaults = createDefaultUserPreferences(row.user_id, row.created_at, {
    id: row.id,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

  return {
    ...defaults,
    locale: payload.locale === "de-DE" ? payload.locale : defaults.locale,
    timezone:
      payload.timezone === "Europe/Berlin" ? payload.timezone : defaults.timezone,
    units: payload.units === "metric" ? payload.units : defaults.units,
    nutrition:
      payload.nutrition && typeof payload.nutrition === "object" && !Array.isArray(payload.nutrition)
        ? { ...defaults.nutrition, ...(payload.nutrition as UserPreferences["nutrition"]) }
        : defaults.nutrition,
    training:
      payload.training && typeof payload.training === "object" && !Array.isArray(payload.training)
        ? { ...defaults.training, ...(payload.training as UserPreferences["training"]) }
        : defaults.training,
    week:
      payload.week && typeof payload.week === "object" && !Array.isArray(payload.week)
        ? { ...defaults.week, ...(payload.week as UserPreferences["week"]) }
        : defaults.week,
    notifications:
      payload.notifications &&
      typeof payload.notifications === "object" &&
      !Array.isArray(payload.notifications)
        ? {
            ...defaults.notifications,
            ...(payload.notifications as UserPreferences["notifications"]),
          }
        : defaults.notifications,
  };
}

function requirePayload(payload: Json) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("user_preferences payload must be an object.");
  }

  const record = payload as Record<string, unknown>;

  if (record.schemaVersion !== 1) {
    throw new Error("user_preferences payload schemaVersion is unsupported.");
  }

  return record;
}
