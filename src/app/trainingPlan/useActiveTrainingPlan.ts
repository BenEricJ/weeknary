import { useCallback, useEffect, useState } from "react";
import type { AuthCredentials } from "../../application";
import type { TrainingPlan } from "../../domain";
import {
  TRAINING_PLAN_ROWS,
  TRAINING_WEEK_DAYS,
  getDefaultTrainingDate,
  getTrainingPlanRowByDate,
} from "../data/trainingPlan";
import {
  legacyTrainingPlanToDomain,
} from "./legacyTrainingPlanMapper";
import { trainingPlanRuntime } from "./trainingPlanRuntime";
import { authProvider } from "../supabaseRuntime";
import { resolveTrainingPlanRuntime } from "./trainingPlanRuntime";

export function useActiveTrainingPlan() {
  const [status, setStatus] = useState<
    "loading" | "ready" | "empty" | "signedOut" | "unavailable" | "error"
  >("loading");
  const [runtimeStatus, setRuntimeStatus] = useState<
    "demo-local" | "remote-signed-out" | "remote-signed-in" | "remote-unavailable"
  >(trainingPlanRuntime.isRemoteConfigured ? "remote-signed-out" : "demo-local");
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const runtime = await resolveTrainingPlanRuntime();
      setRuntimeStatus(runtime.runtimeStatus);

      if (!runtime.trainingPlanService || !runtime.userId) {
        setPlan(null);
        setUserId(null);
        setUserEmail(null);
        setError("reason" in runtime ? runtime.reason ?? null : null);
        setStatus(
          runtime.runtimeStatus === "remote-signed-out"
            ? "signedOut"
            : "unavailable",
        );
        return;
      }

      const active =
        await runtime.trainingPlanService.getActiveTrainingPlan(runtime.userId);
      setPlan(active);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);
      setStatus(active ? "ready" : "empty");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "TrainingPlan could not load.",
      );
      setStatus("error");
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
    await reload();
  }, [reload]);

  const saveRemoteDemoPlan = useCallback(async () => {
    const runtime = await resolveTrainingPlanRuntime();

    if (!runtime.trainingPlanService || !runtime.userId) {
      throw new Error("Sign in before creating a remote TrainingPlan demo seed.");
    }

    const now = new Date().toISOString();
    const seed = legacyTrainingPlanToDomain(TRAINING_PLAN_ROWS, runtime.userId);
    await runtime.trainingPlanService.saveTrainingPlan({
      ...seed,
      id: scopedDemoId("training", runtime.userId),
      userId: runtime.userId,
      title: "Remote validation TrainingPlan",
      source: "user",
      createdAt: now,
      updatedAt: now,
    });
    await reload();
  }, [reload]);

  const archiveActivePlan = useCallback(async () => {
    if (!plan || !userId) {
      throw new Error("No active TrainingPlan is available to archive.");
    }

    const runtime = await resolveTrainingPlanRuntime();

    if (!runtime.trainingPlanService || !runtime.userId) {
      throw new Error("Sign in before archiving a remote TrainingPlan.");
    }

    await runtime.trainingPlanService.archiveTrainingPlan(runtime.userId, plan.id);
    await reload();
  }, [plan, reload, userId]);

  return {
    status,
    plan,
    userId,
    userEmail,
    rows: TRAINING_PLAN_ROWS,
    weekDays: TRAINING_WEEK_DAYS,
    defaultDate: getDefaultTrainingDate(),
    getRowByDate: getTrainingPlanRowByDate,
    error,
    reload,
    runtimeStatus,
    isRemoteConfigured: trainingPlanRuntime.isRemoteConfigured,
    signIn,
    createAccount,
    signOut,
    saveRemoteDemoPlan,
    archiveActivePlan,
  };
}

function scopedDemoId(kind: string, userId: string) {
  return uuidFromText(`remote-demo-${kind}-${userId}`);
}

function uuidFromText(input: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  const bytes = Array.from({ length: 16 }, (_, index) => {
    hash ^= input.charCodeAt(index % input.length) + index;
    hash = Math.imul(hash, 0x01000193);
    return (hash >>> ((index % 4) * 8)) & 0xff;
  });

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
