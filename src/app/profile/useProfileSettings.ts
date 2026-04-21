import { useCallback, useEffect, useState } from "react";
import type { AuthCredentials } from "../../application";
import type { Profile, UserPreferences } from "../../domain";
import { authProvider } from "../supabaseRuntime";
import {
  profileRuntime,
  resolveProfileRuntime,
  type ProfileRuntimeStatus,
} from "./profileRuntime";

export type ProfileSettingsStatus =
  | "loading"
  | "ready"
  | "signedOut"
  | "unavailable"
  | "saving"
  | "error";

export interface ProfileSettingsState {
  status: ProfileSettingsStatus;
  runtimeStatus: ProfileRuntimeStatus;
  isRemoteConfigured: boolean;
  userId: string | null;
  userEmail: string | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  error: string | null;
  reload(): Promise<void>;
  signIn(credentials: AuthCredentials): Promise<void>;
  createAccount(credentials: AuthCredentials): Promise<void>;
  signOut(): Promise<void>;
  saveProfile(profile: Profile): Promise<Profile | null>;
  savePreferences(preferences: UserPreferences): Promise<UserPreferences | null>;
}

export function useProfileSettings(): ProfileSettingsState {
  const [status, setStatus] = useState<ProfileSettingsStatus>("loading");
  const [runtimeStatus, setRuntimeStatus] = useState<ProfileRuntimeStatus>(
    profileRuntime.isRemoteConfigured ? "remote-signed-out" : "demo-local",
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const runtime = await resolveProfileRuntime();
      setRuntimeStatus(runtime.runtimeStatus);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);
      setProfile(runtime.profile);
      setPreferences(runtime.preferences);

      if (!runtime.profileService || !runtime.userPreferencesService) {
        setStatus(runtime.runtimeStatus === "remote-signed-out" ? "signedOut" : "unavailable");
        setError(runtime.reason ?? null);
        return;
      }

      setStatus("ready");
    } catch (caught) {
      setRuntimeStatus("remote-unavailable");
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Profile settings could not load.");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      await authProvider.signIn(credentials);
      await reload();
    },
    [reload],
  );

  const createAccount = useCallback(
    async (credentials: AuthCredentials) => {
      await authProvider.createAccount(credentials);
      await reload();
    },
    [reload],
  );

  const signOut = useCallback(async () => {
    await authProvider.signOut();
    setProfile(null);
    setPreferences(null);
    await reload();
  }, [reload]);

  const saveProfile = useCallback(async (nextProfile: Profile) => {
    setStatus("saving");
    setError(null);

    try {
      const runtime = await resolveProfileRuntime();

      if (!runtime.profileService) {
        throw new Error(runtime.reason ?? "Sign in before saving profile settings.");
      }

      const saved = await runtime.profileService.saveProfile(nextProfile);
      setProfile(saved);
      setStatus("ready");
      return saved;
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Profile could not be saved.");
      return null;
    }
  }, []);

  const savePreferences = useCallback(async (nextPreferences: UserPreferences) => {
    setStatus("saving");
    setError(null);

    try {
      const runtime = await resolveProfileRuntime();

      if (!runtime.userPreferencesService) {
        throw new Error(runtime.reason ?? "Sign in before saving user preferences.");
      }

      const saved = await runtime.userPreferencesService.saveUserPreferences(nextPreferences);
      setPreferences(saved);
      setStatus("ready");
      return saved;
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Preferences could not be saved.");
      return null;
    }
  }, []);

  return {
    status,
    runtimeStatus,
    isRemoteConfigured: profileRuntime.isRemoteConfigured,
    userId,
    userEmail,
    profile,
    preferences,
    error,
    reload,
    signIn,
    createAccount,
    signOut,
    saveProfile,
    savePreferences,
  };
}
