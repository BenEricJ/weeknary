import type { TrainingPlanRepositoryPort } from "../../application";
import type { TrainingPlan } from "../../domain";
import type { WeeknarySupabaseClient } from "./supabaseClient";
import {
  SupabasePlanRepository,
  trainingPlanPayloadMapper,
} from "./SupabasePlanRepository";

export class SupabaseTrainingPlanRepository
  extends SupabasePlanRepository<TrainingPlan>
  implements TrainingPlanRepositoryPort
{
  constructor(client: WeeknarySupabaseClient) {
    super(client, "training_plans", trainingPlanPayloadMapper());
  }
}
