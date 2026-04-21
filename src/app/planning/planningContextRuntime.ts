import {
  MealPlanService,
  PlanningContextService,
  TrainingPlanService,
  WeekPlanService,
} from "../../application";
import {
  SupabaseMealPlanRepository,
  SupabaseTrainingPlanRepository,
  SupabaseWeekPlanRepository,
} from "../../infrastructure/supabase";
import { mealPlanRuntime, mealPlanService } from "../mealPlan/mealPlanRuntime";
import {
  trainingPlanRuntime,
  trainingPlanService,
} from "../trainingPlan/trainingPlanRuntime";
import { weekPlanRuntime, weekPlanService } from "../weekPlan/weekPlanRuntime";
import {
  authProvider,
  isRemoteConfigured,
  requireSupabaseClient,
} from "../supabaseRuntime";

export function createPlanningContextService({
  weekPlanService,
  mealPlanService,
  trainingPlanService,
}: {
  weekPlanService: WeekPlanService;
  mealPlanService: MealPlanService;
  trainingPlanService: TrainingPlanService;
}) {
  return new PlanningContextService({
    getActiveWeekPlan: (userId) => weekPlanService.getActiveWeekPlan(userId),
    getActiveMealPlan: (userId) => mealPlanService.getActiveMealPlan(userId),
    getActiveTrainingPlan: (userId) =>
      trainingPlanService.getActiveTrainingPlan(userId),
  });
}

export const planningContextService = createPlanningContextService({
  weekPlanService,
  mealPlanService,
  trainingPlanService,
});

export type PlanningContextRuntimeStatus =
  | "demo-local"
  | "remote-signed-out"
  | "remote-signed-in"
  | "remote-unavailable";

export type ResolvedPlanningContextRuntime =
  | {
      runtimeStatus: "demo-local" | "remote-signed-in";
      userEmail: string | null;
      userIds: {
        weekPlanUserId: string;
        mealPlanUserId: string;
        trainingPlanUserId: string;
        contextUserId: string;
      };
      planningContextService: PlanningContextService;
      weekPlanService: WeekPlanService;
      mealPlanService: MealPlanService;
      trainingPlanService: TrainingPlanService;
    }
  | {
      runtimeStatus: "remote-signed-out" | "remote-unavailable";
      userEmail: null;
      userIds: null;
      planningContextService: null;
      weekPlanService: null;
      mealPlanService: null;
      trainingPlanService: null;
      reason?: string;
    };

export const planningContextRuntime = {
  isRemoteConfigured: weekPlanRuntime.isRemoteConfigured,
  demoUserIds: {
    weekPlanUserId: weekPlanRuntime.demoUserId,
    mealPlanUserId: mealPlanRuntime.demoUserId,
    trainingPlanUserId: trainingPlanRuntime.demoUserId,
  },
  planningContextService,
  async ensureDemoSeeded() {
    await Promise.all([
      weekPlanRuntime.ensureDemoSeeded(),
      mealPlanRuntime.ensureDemoSeeded(),
      trainingPlanRuntime.ensureDemoSeeded(),
    ]);
  },
};

export async function resolvePlanningContextRuntime(): Promise<ResolvedPlanningContextRuntime> {
  if (!isRemoteConfigured) {
    await planningContextRuntime.ensureDemoSeeded();
    return {
      runtimeStatus: "demo-local",
      userEmail: "demo@weeknary.local",
      userIds: {
        ...planningContextRuntime.demoUserIds,
        contextUserId: planningContextRuntime.demoUserIds.weekPlanUserId,
      },
      planningContextService,
      weekPlanService,
      mealPlanService,
      trainingPlanService,
    };
  }

  const session = await authProvider.getCurrentSession();

  if (session.status === "signedOut") {
    return {
      runtimeStatus: "remote-signed-out",
      userEmail: null,
      userIds: null,
      planningContextService: null,
      weekPlanService: null,
      mealPlanService: null,
      trainingPlanService: null,
    };
  }

  if (session.status === "unavailable") {
    return {
      runtimeStatus: "remote-unavailable",
      userEmail: null,
      userIds: null,
      planningContextService: null,
      weekPlanService: null,
      mealPlanService: null,
      trainingPlanService: null,
      reason: session.reason,
    };
  }

  const client = requireSupabaseClient();
  const remoteWeekPlanService = new WeekPlanService(
    new SupabaseWeekPlanRepository(client),
  );
  const remoteMealPlanService = new MealPlanService(
    new SupabaseMealPlanRepository(client),
  );
  const remoteTrainingPlanService = new TrainingPlanService(
    new SupabaseTrainingPlanRepository(client),
  );

  return {
    runtimeStatus: "remote-signed-in",
    userEmail: session.email ?? null,
    userIds: {
      weekPlanUserId: session.userId,
      mealPlanUserId: session.userId,
      trainingPlanUserId: session.userId,
      contextUserId: session.userId,
    },
    planningContextService: createPlanningContextService({
      weekPlanService: remoteWeekPlanService,
      mealPlanService: remoteMealPlanService,
      trainingPlanService: remoteTrainingPlanService,
    }),
    weekPlanService: remoteWeekPlanService,
    mealPlanService: remoteMealPlanService,
    trainingPlanService: remoteTrainingPlanService,
  };
}
