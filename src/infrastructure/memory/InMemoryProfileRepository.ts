import type { Profile, UserId } from "../../domain";
import type { ProfileRepositoryPort } from "../../application";
import { clone } from "./InMemoryPlanRepository";

export class InMemoryProfileRepository implements ProfileRepositoryPort {
  private readonly records = new Map<UserId, Profile>();

  constructor(seed: Profile[] = []) {
    seed.forEach((profile) => {
      this.records.set(profile.userId, clone(profile));
    });
  }

  async getByUserId(userId: UserId) {
    const profile = this.records.get(userId);
    return profile ? clone(profile) : null;
  }

  async save(profile: Profile) {
    const nextProfile = clone(profile);
    this.records.set(nextProfile.userId, nextProfile);
    return clone(nextProfile);
  }
}
