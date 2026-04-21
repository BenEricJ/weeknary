import { useCallback, useEffect, useState } from "react";
import type { AuthCredentials } from "../../application";
import type { WeekPlan } from "../../domain";
import { WEEK_PLAN } from "../data/weekPlan";
import {
  legacyWeekPlanToDomain,
} from "./legacyWeekPlanMapper";
import {
  resolveWeekPlanRuntime,
  weekPlanRuntime,
  type WeekPlanLocalFirstStatus,
  type WeekPlanRuntimeStatus,
} from "./weekPlanRuntime";
import { authProvider } from "../supabaseRuntime";

export type ActiveWeekPlanStatus =
  | "loading"
  | "ready"
  | "empty"
  | "signedOut"
  | "unavailable"
  | "error";

export function useActiveWeekPlan() {
  const [status, setStatus] = useState<ActiveWeekPlanStatus>("loading");
  const [runtimeStatus, setRuntimeStatus] = useState<WeekPlanRuntimeStatus>(
    weekPlanRuntime.isRemoteConfigured ? "remote-signed-out" : "demo-local",
  );
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localFirstStatus, setLocalFirstStatus] =
    useState<WeekPlanLocalFirstStatus | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const runtime = await resolveWeekPlanRuntime();
      setRuntimeStatus(runtime.runtimeStatus);

      if (!runtime.weekPlanService || !runtime.userId) {
        setPlan(null);
        setUserId(null);
        setUserEmail(null);
        setLocalFirstStatus(null);
        setError("reason" in runtime ? runtime.reason ?? null : null);
        setStatus(
          runtime.runtimeStatus === "remote-signed-out"
            ? "signedOut"
            : "unavailable",
        );
        return;
      }

      const activePlan = await runtime.weekPlanService.getActiveWeekPlan(
        runtime.userId,
      );
      setPlan(activePlan);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);
      setLocalFirstStatus(
        activePlan && runtime.localFirst
          ? await runtime.localFirst.getStatus(runtime.userId, activePlan.id)
          : null,
      );
      setStatus(activePlan ? "ready" : "empty");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "WeekPlan could not load.");
      setLocalFirstStatus(null);
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
    const runtime = await resolveWeekPlanRuntime();

    if (!runtime.weekPlanService || !runtime.userId) {
      throw new Error("Sign in before creating a remote WeekPlan demo seed.");
    }

    const now = new Date().toISOString();
    const seed = legacyWeekPlanToDomain(WEEK_PLAN, runtime.userId);
    let saveError: unknown = null;

    try {
      await runtime.weekPlanService.saveWeekPlan({
        ...seed,
        id: scopedDemoId("week", runtime.userId),
        userId: runtime.userId,
        title: "Remote validation WeekPlan",
        source: "user",
        createdAt: now,
        updatedAt: now,
      });
    } catch (caught) {
      saveError = caught;
    }

    await reload();

    if (saveError) {
      throw saveError;
    }
  }, [reload]);

  const archiveActivePlan = useCallback(async () => {
    if (!plan || !userId) {
      throw new Error("No active WeekPlan is available to archive.");
    }

    const runtime = await resolveWeekPlanRuntime();

    if (!runtime.weekPlanService || !runtime.userId) {
      throw new Error("Sign in before archiving a remote WeekPlan.");
    }

    let archiveError: unknown = null;

    try {
      await runtime.weekPlanService.archiveWeekPlan(runtime.userId, plan.id);
    } catch (caught) {
      archiveError = caught;
    }

    await reload();

    if (archiveError) {
      throw archiveError;
    }
  }, [plan, reload, userId]);

  const retryRemoteSave = useCallback(async () => {
    if (!plan || !userId) {
      throw new Error("No cached WeekPlan is available to retry.");
    }

    const runtime = await resolveWeekPlanRuntime();

    if (
      runtime.runtimeStatus !== "remote-signed-in" ||
      !runtime.localFirst ||
      !runtime.userId
    ) {
      throw new Error("WeekPlan remote retry is available only in signed-in local-first mode.");
    }

    let retryError: unknown = null;

    try {
      await runtime.localFirst.retryRemoteSave(runtime.userId, plan.id);
    } catch (caught) {
      retryError = caught;
    }

    await reload();

    if (retryError) {
      throw retryError;
    }
  }, [plan, reload, userId]);

  return {
    status,
    plan,
    userId,
    userEmail,
    error,
    reload,
    runtimeStatus,
    localFirstStatus,
    isRemoteConfigured: weekPlanRuntime.isRemoteConfigured,
    signIn,
    createAccount,
    signOut,
    saveRemoteDemoPlan,
    archiveActivePlan,
    retryRemoteSave,
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
