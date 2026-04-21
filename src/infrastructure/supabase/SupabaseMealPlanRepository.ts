import type { MealPlanRepositoryPort } from "../../application";
import type { MealPlan } from "../../domain";
import type { WeeknarySupabaseClient } from "./supabaseClient";
import {
  mealPlanPayloadMapper,
  SupabasePlanRepository,
} from "./SupabasePlanRepository";

export class SupabaseMealPlanRepository
  extends SupabasePlanRepository<MealPlan>
  implements MealPlanRepositoryPort
{
  constructor(client: WeeknarySupabaseClient) {
    super(client, "meal_plans", mealPlanPayloadMapper());
  }
}
