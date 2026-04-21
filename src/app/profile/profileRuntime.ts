import {
  createDefaultProfile,
  createDefaultUserPreferences,
  ProfileService,
  UserPreferencesService,
} from "../../application";
import {
  InMemoryProfileRepository,
  InMemoryUserPreferencesRepository,
} from "../../infrastructure/memory";
import {
  SupabaseProfileRepository,
  SupabaseUserPreferencesRepository,
} from "../../infrastructure/supabase";
import type { Profile, UserPreferences } from "../../domain";
import {
  authProvider,
  isRemoteConfigured,
  requireSupabaseClient,
} from "../supabaseRuntime";

export const DEMO_PROFILE_USER_ID = "demo-profile-user";

const demoProfile = createDefaultProfile(DEMO_PROFILE_USER_ID);
const demoPreferences = createDefaultUserPreferences(DEMO_PROFILE_USER_ID);
const demoProfileService = new ProfileService(
  new InMemoryProfileRepository([demoProfile]),
);
const demoUserPreferencesService = new UserPreferencesService(
  new InMemoryUserPreferencesRepository([demoPreferences]),
);

export type ProfileRuntimeStatus =
  | "demo-local"
  | "remote-signed-out"
  | "remote-signed-in"
  | "remote-unavailable";

export type ResolvedProfileRuntime =
  | {
      runtimeStatus: "demo-local" | "remote-signed-in";
      userId: string;
      userEmail: string | null;
      profileService: ProfileService;
      userPreferencesService: UserPreferencesService;
      profile: Profile;
      preferences: UserPreferences;
    }
  | {
      runtimeStatus: "remote-signed-out" | "remote-unavailable";
      userId: null;
      userEmail: null;
      profileService: null;
      userPreferencesService: null;
      profile: null;
      preferences: null;
      reason?: string;
    };

export const profileRuntime = {
  isRemoteConfigured,
  authProvider,
};

export async function resolveProfileRuntime(): Promise<ResolvedProfileRuntime> {
  if (!isRemoteConfigured) {
    return {
      runtimeStatus: "demo-local",
      userId: DEMO_PROFILE_USER_ID,
      userEmail: null,
      profileService: demoProfileService,
      userPreferencesService: demoUserPreferencesService,
      profile: await demoProfileService.getOrCreateProfile(DEMO_PROFILE_USER_ID),
      preferences:
        await demoUserPreferencesService.getOrCreateUserPreferences(DEMO_PROFILE_USER_ID),
    };
  }

  const session = await authProvider.getCurrentSession();

  if (session.status === "signedOut") {
    return {
      runtimeStatus: "remote-signed-out",
      userId: null,
      userEmail: null,
      profileService: null,
      userPreferencesService: null,
      profile: null,
      preferences: null,
    };
  }

  if (session.status === "unavailable") {
    return {
      runtimeStatus: "remote-unavailable",
      userId: null,
      userEmail: null,
      profileService: null,
      userPreferencesService: null,
      profile: null,
      preferences: null,
      reason: session.reason,
    };
  }

  const client = requireSupabaseClient();
  const profileService = new ProfileService(new SupabaseProfileRepository(client));
  const userPreferencesService = new UserPreferencesService(
    new SupabaseUserPreferencesRepository(client),
  );

  return {
    runtimeStatus: "remote-signed-in",
    userId: session.userId,
    userEmail: session.email ?? null,
    profileService,
    userPreferencesService,
    profile: await profileService.getOrCreateProfile(session.userId, {
      displayName: session.email?.split("@")[0] ?? "Alex",
    }),
    preferences: await userPreferencesService.getOrCreateUserPreferences(session.userId),
  };
}
