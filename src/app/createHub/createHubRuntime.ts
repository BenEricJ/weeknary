import { MealPlanService, PlanBundleService, TrainingPlanService, WeekPlanService } from "../../application";
import { IndexedDbWeekPlanRepository } from "../../infrastructure/indexedDb";
import {
  SupabaseMealPlanRepository,
  SupabasePlanBundleGenerator,
  SupabaseTrainingPlanRepository,
  SupabaseWeekPlanRepository,
} from "../../infrastructure/supabase";
import {
  authProvider,
  isRemoteConfigured,
  requireSupabaseClient,
} from "../supabaseRuntime";

export type CreateHubRuntimeStatus =
  | "remote-signed-out"
  | "remote-signed-in"
  | "remote-unavailable";

export type ResolvedCreateHubRuntime =
  | {
      runtimeStatus: "remote-signed-in";
      userId: string;
      userEmail: string | null;
      planBundleService: PlanBundleService;
    }
  | {
      runtimeStatus: "remote-signed-out" | "remote-unavailable";
      userId: null;
      userEmail: null;
      planBundleService: null;
      reason?: string;
    };

export const createHubRuntime = {
  isRemoteConfigured,
  authProvider,
};

export async function resolveCreateHubRuntime(): Promise<ResolvedCreateHubRuntime> {
  if (!isRemoteConfigured) {
    return {
      runtimeStatus: "remote-unavailable",
      userId: null,
      userEmail: null,
      planBundleService: null,
      reason: "Supabase is required for AI plan generation.",
    };
  }

  const session = await authProvider.getCurrentSession();

  if (session.status === "signedOut") {
    return {
      runtimeStatus: "remote-signed-out",
      userId: null,
      userEmail: null,
      planBundleService: null,
    };
  }

  if (session.status === "unavailable") {
    return {
      runtimeStatus: "remote-unavailable",
      userId: null,
      userEmail: null,
      planBundleService: null,
      reason: session.reason,
    };
  }

  const client = requireSupabaseClient();

  return {
    runtimeStatus: "remote-signed-in",
    userId: session.userId,
    userEmail: session.email ?? null,
    planBundleService: new PlanBundleService({
      generator: new SupabasePlanBundleGenerator(client),
      mealPlanService: new MealPlanService(new SupabaseMealPlanRepository(client)),
      trainingPlanService: new TrainingPlanService(
        new SupabaseTrainingPlanRepository(client),
      ),
      weekPlanService: new WeekPlanService(
        new IndexedDbWeekPlanRepository(new SupabaseWeekPlanRepository(client)),
      ),
    }),
  };
}
