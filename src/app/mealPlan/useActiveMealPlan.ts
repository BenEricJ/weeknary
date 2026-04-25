import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthCredentials, AuthSession } from "../../application";
import type { MealPlan } from "../../domain";
import {
  NUTRITION_PLAN,
  getDayByDate,
  getExternalMealCount,
  getMealById,
  getPlannedMacrosForDay,
  getSelectedDayPrepNotes,
  getTodayPlanDate,
  getWeekDays,
} from "../data/nutritionPlan";
import {
  legacyNutritionPlanToDomain,
} from "./legacyNutritionPlanMapper";
import { mealPlanToNutritionPlan } from "./mealPlanDisplayAdapter";
import { mealPlanRuntime } from "./mealPlanRuntime";
import { authProvider } from "../supabaseRuntime";
import { resolveMealPlanRuntime } from "./mealPlanRuntime";

export function useActiveMealPlan() {
  const [status, setStatus] = useState<
    "loading" | "ready" | "empty" | "signedOut" | "unavailable" | "error"
  >("loading");
  const [runtimeStatus, setRuntimeStatus] = useState<
    "demo-local" | "remote-signed-out" | "remote-signed-in" | "remote-unavailable"
  >(mealPlanRuntime.isRemoteConfigured ? "remote-signed-out" : "demo-local");
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const runtime = await resolveMealPlanRuntime();
      setRuntimeStatus(runtime.runtimeStatus);

      if (!runtime.mealPlanService || !runtime.userId) {
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

      const active = await runtime.mealPlanService.getActiveMealPlan(runtime.userId);
      setPlan(active);
      setUserId(runtime.userId);
      setUserEmail(runtime.userEmail);
      setStatus(active ? "ready" : "empty");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "MealPlan could not load.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const signIn = useCallback(
    async (credentials: AuthCredentials) => {
      setStatus("loading");
      setError(null);
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
    await reload();
  }, [reload]);

  const saveRemoteDemoPlan = useCallback(async () => {
    const runtime = await resolveMealPlanRuntime();

    if (!runtime.mealPlanService || !runtime.userId) {
      throw new Error("Sign in before creating a remote MealPlan demo seed.");
    }

    const now = new Date().toISOString();
    const seed = legacyNutritionPlanToDomain(NUTRITION_PLAN, runtime.userId);
    await runtime.mealPlanService.saveMealPlan({
      ...seed,
      id: scopedDemoId("meal", runtime.userId),
      userId: runtime.userId,
      title: "Remote validation MealPlan",
      source: "user",
      createdAt: now,
      updatedAt: now,
    });
    await reload();
  }, [reload]);

  const archiveActivePlan = useCallback(async () => {
    if (!plan || !userId) {
      throw new Error("No active MealPlan is available to archive.");
    }

    const runtime = await resolveMealPlanRuntime();

    if (!runtime.mealPlanService || !runtime.userId) {
      throw new Error("Sign in before archiving a remote MealPlan.");
    }

    await runtime.mealPlanService.archiveMealPlan(runtime.userId, plan.id);
    await reload();
  }, [plan, reload, userId]);

  const displayPlan = useMemo(
    () => (plan ? mealPlanToNutritionPlan(plan) : NUTRITION_PLAN),
    [plan],
  );

  return {
    status,
    plan,
    userId,
    userEmail,
    legacyPlan: displayPlan,
    weekDays: getWeekDays(displayPlan),
    defaultDate: getTodayPlanDate(displayPlan),
    getDayByDate: (date: number | string) => getDayByDate(displayPlan, date),
    getMealById: (mealId?: string) => getMealById(displayPlan, mealId),
    getPlannedMacrosForDay: (date: number | string) =>
      getPlannedMacrosForDay(displayPlan, getDayByDate(displayPlan, date)),
    getSelectedDayPrepNotes: (date: number | string) =>
      getSelectedDayPrepNotes(displayPlan, getDayByDate(displayPlan, date)),
    getExternalMealCount: (date: number | string) =>
      getExternalMealCount(getDayByDate(displayPlan, date)),
    error,
    reload,
    runtimeStatus,
    isRemoteConfigured: mealPlanRuntime.isRemoteConfigured,
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

function isSignedInSession(session: AuthSession) {
  return session.status === "signedIn";
}

function getAuthFailureMessage(session: AuthSession, fallback: string) {
  return session.status === "unavailable" ? session.reason : fallback;
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
