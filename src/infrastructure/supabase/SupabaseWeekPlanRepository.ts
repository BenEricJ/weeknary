import type { WeekPlanRepositoryPort } from "../../application";
import type { WeekPlan } from "../../domain";
import type { WeeknarySupabaseClient } from "./supabaseClient";
import {
  SupabasePlanRepository,
  weekPlanPayloadMapper,
} from "./SupabasePlanRepository";

export class SupabaseWeekPlanRepository
  extends SupabasePlanRepository<WeekPlan>
  implements WeekPlanRepositoryPort
{
  constructor(client: WeeknarySupabaseClient) {
    super(client, "week_plans", weekPlanPayloadMapper());
  }
}
