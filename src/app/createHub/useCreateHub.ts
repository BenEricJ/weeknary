import { useCallback, useEffect, useState } from "react";
import type {
  AuthCredentials,
  AuthSession,
  GeneratedPlanBundle,
  PlanBundleActivationMode,
  PlanBundleGenerationError,
  PlanBundleGenerationRequest,
  SavedPlanBundle,
} from "../../application";
import { PlanBundleGenerationError as PlanBundleGenerationErrorClass } from "../../application";
import type { Profile, UserPreferences } from "../../domain";
import { resolveProfileRuntime } from "../profile/profileRuntime";
import { authProvider } from "../supabaseRuntime";
import {
  createHubRuntime,
  resolveCreateHubRuntime,
  type CreateHubRuntimeStatus,
} from "./createHubRuntime";

export type CreateHubStatus =
  | "loading"
  | "ready"
  | "signedOut"
  | "unavailable"
  | "generating"
  | "saving"
  | "saved"
  | "error";

export interface CreateHubState {
  status: CreateHubStatus;
  runtimeStatus: CreateHubRuntimeStatus;
  isRemoteConfigured: boolean;
  userId: string | null;
  userEmail: string | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  bundle: GeneratedPlanBundle | null;
  savedBundle: SavedPlanBundle | null;
  error: string | null;
  generationError: PlanBundleGenerationError | null;
  reload(): Promise<void>;
  signIn(credentials: AuthCredentials): Promise<void>;
  createAccount(credentials: AuthCredentials): Promise<void>;
  signOut(): Promise<void>;
  generate(request: PlanBundleGenerationRequest): Promise<GeneratedPlanBundle | null>;
  save(mode: PlanBundleActivationMode): Promise<SavedPlanBundle | null>;
}

export function useCreateHub(): CreateHubState {
  const [status, setStatus] = useState<CreateHubStatus>("loading");
  const [runtimeStatus, setRuntimeStatus] = useState<CreateHubRuntimeStatus>(
    createHubRuntime.isRemoteConfigured ? "remote-signed-out" : "remote-unavailable",
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [bundle, setBundle] = useState<GeneratedPlanBundle | null>(null);
  const [savedBundle, setSavedBundle] = useState<SavedPlanBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] =
    useState<PlanBundleGenerationError | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setGenerationError(null);

    try {
      const runtime = await resolveCreateHubRuntime();
      const profileRuntime = await resolveProfileRuntime();
      setRuntimeStatus(runtime.runtimeStatus);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);
      setProfile(profileRuntime.profile);
      setPreferences(profileRuntime.preferences);

      if (!runtime.planBundleService) {
        setStatus(
          runtime.runtimeStatus === "remote-signed-out"
            ? "signedOut"
            : "unavailable",
        );
        setError(runtime.reason ?? null);
        return;
      }

      setStatus("ready");
    } catch (caught) {
      setRuntimeStatus("remote-unavailable");
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Create Hub could not load.");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      setStatus("loading");
      setError(null);
      setGenerationError(null);
      const session = await authProvider.signIn(credentials);
      if (!isSignedInSession(session)) {
        setStatus("error");
        setError(getAuthFailureMessage(session, "Sign in failed."));
        return;
      }
      await reload();
    },
    [reload],
  );

  const createAccount = useCallback(
    async (credentials: AuthCredentials) => {
      setStatus("loading");
      setError(null);
      setGenerationError(null);
      const session = await authProvider.createAccount(credentials);
      if (!isSignedInSession(session)) {
        setStatus("error");
        setError(getAuthFailureMessage(session, "Account creation failed."));
        return;
      }
      await reload();
    },
    [reload],
  );

  const signOut = useCallback(async () => {
    await authProvider.signOut();
    setProfile(null);
    setPreferences(null);
    setBundle(null);
    setSavedBundle(null);
    setGenerationError(null);
    await reload();
  }, [reload]);

  const generate = useCallback(async (request: PlanBundleGenerationRequest) => {
    setStatus("generating");
    setError(null);
    setGenerationError(null);
    setSavedBundle(null);

    try {
      const runtime = await resolveCreateHubRuntime();
      const profileRuntime = await resolveProfileRuntime();

      if (!runtime.planBundleService) {
        throw new Error(runtime.reason ?? "Sign in before generating a plan bundle.");
      }

      const nextBundle = await runtime.planBundleService.generatePlanBundle({
        ...request,
        profile: profileRuntime.profile ?? request.profile,
        preferences: profileRuntime.preferences ?? request.preferences,
      });
      setBundle(nextBundle);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);
      setProfile(profileRuntime.profile);
      setPreferences(profileRuntime.preferences);
      setRuntimeStatus(runtime.runtimeStatus);
      setStatus("ready");
      return nextBundle;
    } catch (caught) {
      setStatus("error");
      if (caught instanceof PlanBundleGenerationErrorClass) {
        setGenerationError(caught);
        setError(caught.message);
      } else {
        setGenerationError(
          new PlanBundleGenerationErrorClass({
            error:
              caught instanceof Error
                ? caught.message
                : "Plan bundle generation failed.",
            code: "unexpected_error",
            hint: "Bitte spaeter erneut versuchen.",
          }),
        );
        setError(
          caught instanceof Error
            ? caught.message
            : "Plan bundle generation failed.",
        );
      }
      return null;
    }
  }, []);

  const save = useCallback(
    async (mode: PlanBundleActivationMode) => {
      if (!bundle) {
        setError("Generate a plan bundle before saving.");
        return null;
      }

      setStatus("saving");
      setError(null);
      setGenerationError(null);

      try {
        const runtime = await resolveCreateHubRuntime();

        if (!runtime.planBundleService || !runtime.userId) {
          const reason = "reason" in runtime ? runtime.reason : null;
          throw new Error(reason ?? "Sign in before saving a plan bundle.");
        }

        const result = await runtime.planBundleService.savePlanBundle(
          runtime.userId,
          bundle,
          mode,
        );
        setSavedBundle(result);
        setStatus("saved");
        return result;
      } catch (caught) {
        setStatus("error");
        setError(
          caught instanceof Error ? caught.message : "Plan bundle could not be saved.",
        );
        return null;
      }
    },
    [bundle],
  );

  return {
    status,
    runtimeStatus,
    isRemoteConfigured: createHubRuntime.isRemoteConfigured,
    userId,
    userEmail,
    profile,
    preferences,
    bundle,
    savedBundle,
    error,
    generationError,
    reload,
    signIn,
    createAccount,
    signOut,
    generate,
    save,
  };
}

function isSignedInSession(session: AuthSession) {
  return session.status === "signedIn";
}

function getAuthFailureMessage(session: AuthSession, fallback: string) {
  return session.status === "unavailable" ? session.reason : fallback;
}
