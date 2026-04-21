import { TrainingPlanService } from "../../application";
import { InMemoryTrainingPlanRepository } from "../../infrastructure/memory";
import { SupabaseTrainingPlanRepository } from "../../infrastructure/supabase";
import { TRAINING_PLAN_ROWS } from "../data/trainingPlan";
import {
  authProvider,
  isRemoteConfigured,
  requireSupabaseClient,
} from "../supabaseRuntime";
import {
  DEMO_TRAINING_PLAN_USER_ID,
  legacyTrainingPlanToDomain,
} from "./legacyTrainingPlanMapper";

const trainingPlanRepository = new InMemoryTrainingPlanRepository([
  legacyTrainingPlanToDomain(TRAINING_PLAN_ROWS),
]);

export const trainingPlanService = new TrainingPlanService(trainingPlanRepository);

export const trainingPlanRuntime = {
  isRemoteConfigured,
  demoUserId: DEMO_TRAINING_PLAN_USER_ID,
  repository: trainingPlanRepository,
  trainingPlanService,
  async ensureDemoSeeded() {
    const active = await trainingPlanRepository.getActiveByUser(
      DEMO_TRAINING_PLAN_USER_ID,
    );
    if (!active) {
      await trainingPlanRepository.save(legacyTrainingPlanToDomain(TRAINING_PLAN_ROWS));
    }
  },
};

export type ResolvedTrainingPlanRuntime =
  | {
      runtimeStatus: "demo-local" | "remote-signed-in";
      userId: string;
      userEmail: string | null;
      trainingPlanService: TrainingPlanService;
    }
  | {
      runtimeStatus: "remote-signed-out" | "remote-unavailable";
      userId: null;
      userEmail: null;
      trainingPlanService: null;
      reason?: string;
    };

export async function resolveTrainingPlanRuntime(): Promise<ResolvedTrainingPlanRuntime> {
  if (!isRemoteConfigured) {
    await trainingPlanRuntime.ensureDemoSeeded();
    return {
      runtimeStatus: "demo-local",
      userId: DEMO_TRAINING_PLAN_USER_ID,
      userEmail: "demo@weeknary.local",
      trainingPlanService,
    };
  }

  const session = await authProvider.getCurrentSession();

  if (session.status === "signedOut") {
    return {
      runtimeStatus: "remote-signed-out",
      userId: null,
      userEmail: null,
      trainingPlanService: null,
    };
  }

  if (session.status === "unavailable") {
    return {
      runtimeStatus: "remote-unavailable",
      userId: null,
      userEmail: null,
      trainingPlanService: null,
      reason: session.reason,
    };
  }

  return {
    runtimeStatus: "remote-signed-in",
    userId: session.userId,
    userEmail: session.email ?? null,
    trainingPlanService: new TrainingPlanService(
      new SupabaseTrainingPlanRepository(requireSupabaseClient()),
    ),
  };
}
