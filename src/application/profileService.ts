import type { Profile, UserId } from "../domain";
import type { ProfileRepositoryPort } from "./ports";

export class ProfileService {
  constructor(
    private readonly repository: ProfileRepositoryPort,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async getProfile(userId: UserId) {
    return this.repository.getByUserId(userId);
  }

  async getOrCreateProfile(userId: UserId, seed?: Partial<Profile>) {
    const existing = await this.repository.getByUserId(userId);

    if (existing) {
      return existing;
    }

    return this.repository.save(createDefaultProfile(userId, this.clock(), seed));
  }

  saveProfile(profile: Profile) {
    validateProfile(profile);
    return this.repository.save({
      ...profile,
      updatedAt: this.clock(),
      version: profile.version + 1,
    });
  }
}

export function createDefaultProfile(
  userId: UserId,
  timestamp = new Date().toISOString(),
  seed: Partial<Profile> = {},
): Profile {
  return {
    id: seed.id ?? userId,
    userId,
    displayName: seed.displayName?.trim() || "Alex",
    avatarUrl: seed.avatarUrl,
    birthYear: seed.birthYear ?? 1998,
    heightCm: seed.heightCm ?? 178,
    weightKg: seed.weightKg ?? 72,
    activityLevel: seed.activityLevel ?? "medium",
    createdAt: seed.createdAt ?? timestamp,
    updatedAt: seed.updatedAt ?? timestamp,
    version: seed.version ?? 0,
  };
}

function validateProfile(profile: Profile) {
  if (!profile.userId.trim()) {
    throw new Error("Profile userId is required.");
  }

  if (!profile.displayName.trim()) {
    throw new Error("Profile display name is required.");
  }

  if (profile.birthYear !== undefined && (profile.birthYear < 1900 || profile.birthYear > 2100)) {
    throw new Error("Profile birth year is invalid.");
  }

  if (profile.heightCm !== undefined && (profile.heightCm < 50 || profile.heightCm > 260)) {
    throw new Error("Profile height is invalid.");
  }

  if (profile.weightKg !== undefined && (profile.weightKg < 20 || profile.weightKg > 400)) {
    throw new Error("Profile weight is invalid.");
  }
}
