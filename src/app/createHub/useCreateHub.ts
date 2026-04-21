import { useCallback, useEffect, useState } from "react";
import type {
  AuthCredentials,
  GeneratedPlanBundle,
  PlanBundleActivationMode,
  PlanBundleGenerationRequest,
  SavedPlanBundle,
} from "../../application";
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
  bundle: GeneratedPlanBundle | null;
  savedBundle: SavedPlanBundle | null;
  error: string | null;
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
  const [bundle, setBundle] = useState<GeneratedPlanBundle | null>(null);
  const [savedBundle, setSavedBundle] = useState<SavedPlanBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const runtime = await resolveCreateHubRuntime();
      setRuntimeStatus(runtime.runtimeStatus);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);

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
    setBundle(null);
    setSavedBundle(null);
    await reload();
  }, [reload]);

  const generate = useCallback(async (request: PlanBundleGenerationRequest) => {
    setStatus("generating");
    setError(null);
    setSavedBundle(null);

    try {
      const runtime = await resolveCreateHubRuntime();

      if (!runtime.planBundleService) {
        throw new Error(runtime.reason ?? "Sign in before generating a plan bundle.");
      }

      const nextBundle = await runtime.planBundleService.generatePlanBundle(request);
      setBundle(nextBundle);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);
      setRuntimeStatus(runtime.runtimeStatus);
      setStatus("ready");
      return nextBundle;
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "Plan bundle generation failed.",
      );
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
    bundle,
    savedBundle,
    error,
    reload,
    signIn,
    createAccount,
    signOut,
    generate,
    save,
  };
}
