import type { UserId, UserPreferences } from "../../domain";
import type { UserPreferencesRepositoryPort } from "../../application";
import { clone } from "./InMemoryPlanRepository";

export class InMemoryUserPreferencesRepository implements UserPreferencesRepositoryPort {
  private readonly records = new Map<UserId, UserPreferences>();

  constructor(seed: UserPreferences[] = []) {
    seed.forEach((preferences) => {
      this.records.set(preferences.userId, clone(preferences));
    });
  }

  async getByUserId(userId: UserId) {
    const preferences = this.records.get(userId);
    return preferences ? clone(preferences) : null;
  }

  async save(preferences: UserPreferences) {
    const nextPreferences = clone(preferences);
    this.records.set(nextPreferences.userId, nextPreferences);
    return clone(nextPreferences);
  }
}
