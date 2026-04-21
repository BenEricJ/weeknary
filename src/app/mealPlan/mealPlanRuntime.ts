import { MealPlanService } from "../../application";
import { InMemoryMealPlanRepository } from "../../infrastructure/memory";
import { SupabaseMealPlanRepository } from "../../infrastructure/supabase";
import { NUTRITION_PLAN } from "../data/nutritionPlan";
import {
  authProvider,
  isRemoteConfigured,
  requireSupabaseClient,
} from "../supabaseRuntime";
import {
  DEMO_MEAL_PLAN_USER_ID,
  legacyNutritionPlanToDomain,
} from "./legacyNutritionPlanMapper";

const mealPlanRepository = new InMemoryMealPlanRepository([
  legacyNutritionPlanToDomain(NUTRITION_PLAN),
]);

export const mealPlanService = new MealPlanService(mealPlanRepository);

export const mealPlanRuntime = {
  isRemoteConfigured,
  demoUserId: DEMO_MEAL_PLAN_USER_ID,
  repository: mealPlanRepository,
  mealPlanService,
  async ensureDemoSeeded() {
    const active = await mealPlanRepository.getActiveByUser(DEMO_MEAL_PLAN_USER_ID);
    if (!active) {
      await mealPlanRepository.save(legacyNutritionPlanToDomain(NUTRITION_PLAN));
    }
  },
};

export type ResolvedMealPlanRuntime =
  | {
      runtimeStatus: "demo-local" | "remote-signed-in";
      userId: string;
      userEmail: string | null;
      mealPlanService: MealPlanService;
    }
  | {
      runtimeStatus: "remote-signed-out" | "remote-unavailable";
      userId: null;
      userEmail: null;
      mealPlanService: null;
      reason?: string;
    };

export async function resolveMealPlanRuntime(): Promise<ResolvedMealPlanRuntime> {
  if (!isRemoteConfigured) {
    await mealPlanRuntime.ensureDemoSeeded();
    return {
      runtimeStatus: "demo-local",
      userId: DEMO_MEAL_PLAN_USER_ID,
      userEmail: "demo@weeknary.local",
      mealPlanService,
    };
  }

  const session = await authProvider.getCurrentSession();

  if (session.status === "signedOut") {
    return {
      runtimeStatus: "remote-signed-out",
      userId: null,
      userEmail: null,
      mealPlanService: null,
    };
  }

  if (session.status === "unavailable") {
    return {
      runtimeStatus: "remote-unavailable",
      userId: null,
      userEmail: null,
      mealPlanService: null,
      reason: session.reason,
    };
  }

  return {
    runtimeStatus: "remote-signed-in",
    userId: session.userId,
    userEmail: session.email ?? null,
    mealPlanService: new MealPlanService(
      new SupabaseMealPlanRepository(requireSupabaseClient()),
    ),
  };
}
