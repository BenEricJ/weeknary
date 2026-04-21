import { WeekPlanService, type AuthSession } from "../../application";
import {
  IndexedDbWeekPlanRepository,
  type WeekPlanLocalFirstStatus,
} from "../../infrastructure/indexedDb";
import { InMemoryWeekPlanRepository } from "../../infrastructure/memory";
import { SupabaseWeekPlanRepository } from "../../infrastructure/supabase";
import type { EntityId, UserId, WeekPlan } from "../../domain";
import {
  authProvider,
  isRemoteConfigured,
  requireSupabaseClient,
} from "../supabaseRuntime";
import { WEEK_PLAN } from "../data/weekPlan";
import {
  DEMO_WEEK_PLAN_USER_ID,
  legacyWeekPlanToDomain,
} from "./legacyWeekPlanMapper";

export type WeekPlanRuntimeStatus =
  | "demo-local"
  | "remote-signed-out"
  | "remote-signed-in"
  | "remote-unavailable";

export type { WeekPlanLocalFirstStatus };

export interface WeekPlanLocalFirstRuntime {
  getStatus(userId: UserId, planId: EntityId): Promise<WeekPlanLocalFirstStatus>;
  retryRemoteSave(userId: UserId, planId: EntityId): Promise<WeekPlan>;
}

export type ResolvedWeekPlanRuntime =
  | {
      runtimeStatus: "demo-local" | "remote-signed-in";
      userId: string;
      userEmail: string | null;
      weekPlanService: WeekPlanService;
      localFirst?: WeekPlanLocalFirstRuntime;
    }
  | {
      runtimeStatus: "remote-signed-out" | "remote-unavailable";
      userId: null;
      userEmail: null;
      weekPlanService: null;
      reason?: string;
    };

const weekPlanRepository = new InMemoryWeekPlanRepository([
  legacyWeekPlanToDomain(WEEK_PLAN),
]);

export const weekPlanService = new WeekPlanService(weekPlanRepository);

export const weekPlanRuntime = {
  isRemoteConfigured,
  demoUserId: DEMO_WEEK_PLAN_USER_ID,
  repository: weekPlanRepository,
  weekPlanService,
  authProvider,
  async ensureDemoSeeded() {
    const active = await weekPlanRepository.getActiveByUser(DEMO_WEEK_PLAN_USER_ID);
    if (!active) {
      await weekPlanRepository.save(legacyWeekPlanToDomain(WEEK_PLAN));
    }
  },
};

export async function resolveWeekPlanRuntime(): Promise<ResolvedWeekPlanRuntime> {
  if (!isRemoteConfigured) {
    await weekPlanRuntime.ensureDemoSeeded();
    return {
      runtimeStatus: "demo-local",
      userId: DEMO_WEEK_PLAN_USER_ID,
      userEmail: "demo@weeknary.local",
      weekPlanService,
    };
  }

  const session: AuthSession = await authProvider.getCurrentSession();

  if (session.status === "signedOut") {
    return {
      runtimeStatus: "remote-signed-out",
      userId: null,
      userEmail: null,
      weekPlanService: null,
    };
  }

  if (session.status === "unavailable") {
    return {
      runtimeStatus: "remote-unavailable",
      userId: null,
      userEmail: null,
      weekPlanService: null,
      reason: session.reason,
    };
  }

  const localFirstRepository = new IndexedDbWeekPlanRepository(
    new SupabaseWeekPlanRepository(requireSupabaseClient()),
  );

  return {
    runtimeStatus: "remote-signed-in",
    userId: session.userId,
    userEmail: session.email ?? null,
    weekPlanService: new WeekPlanService(localFirstRepository),
    localFirst: {
      getStatus: (userId, planId) =>
        localFirstRepository.getLocalFirstStatus(userId, planId),
      retryRemoteSave: (userId, planId) =>
        localFirstRepository.retryRemoteSave(userId, planId),
    },
  };
}
