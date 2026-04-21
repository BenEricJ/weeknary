import { WeekPlanOrchestrationService } from "../../application";
import { authProvider } from "../supabaseRuntime";
import { weekPlanRuntime } from "../weekPlan/weekPlanRuntime";
import {
  planningContextRuntime,
  planningContextService,
  resolvePlanningContextRuntime,
} from "./planningContextRuntime";
import { mealPlanService } from "../mealPlan/mealPlanRuntime";
import { trainingPlanService } from "../trainingPlan/trainingPlanRuntime";
import { weekPlanService } from "../weekPlan/weekPlanRuntime";

export const weekPlanOrchestrationService = new WeekPlanOrchestrationService({
  planningContextService,
  weekPlanService,
  getActiveMealPlan: (userId) => mealPlanService.getActiveMealPlan(userId),
  getActiveTrainingPlan: (userId) =>
    trainingPlanService.getActiveTrainingPlan(userId),
});

export type ResolvedWeekPlanOrchestrationRuntime =
  | {
      runtimeStatus: "demo-local" | "remote-signed-in";
      userEmail: string | null;
      userIds: {
        weekPlanUserId: string;
        mealPlanUserId: string;
        trainingPlanUserId: string;
        contextUserId: string;
      };
      weekPlanOrchestrationService: WeekPlanOrchestrationService;
    }
  | {
      runtimeStatus: "remote-signed-out" | "remote-unavailable";
      userEmail: null;
      userIds: null;
      weekPlanOrchestrationService: null;
      reason?: string;
    };

export const weekPlanOrchestrationRuntime = {
  isRemoteConfigured: weekPlanRuntime.isRemoteConfigured,
  authProvider,
  weekPlanOrchestrationService,
  demoUserIds: planningContextRuntime.demoUserIds,
  ensureDemoSeeded: planningContextRuntime.ensureDemoSeeded,
};

export async function resolveWeekPlanOrchestrationRuntime(): Promise<ResolvedWeekPlanOrchestrationRuntime> {
  const runtime = await resolvePlanningContextRuntime();

  if (!runtime.planningContextService || !runtime.userIds) {
    return {
      runtimeStatus: runtime.runtimeStatus,
      userEmail: null,
      userIds: null,
      weekPlanOrchestrationService: null,
      reason: runtime.reason,
    };
  }

  return {
    runtimeStatus: runtime.runtimeStatus,
    userEmail: runtime.userEmail,
    userIds: runtime.userIds,
    weekPlanOrchestrationService: new WeekPlanOrchestrationService({
      planningContextService: runtime.planningContextService,
      weekPlanService: runtime.weekPlanService,
      getActiveMealPlan: (userId) =>
        runtime.mealPlanService.getActiveMealPlan(userId),
      getActiveTrainingPlan: (userId) =>
        runtime.trainingPlanService.getActiveTrainingPlan(userId),
    }),
  };
}
