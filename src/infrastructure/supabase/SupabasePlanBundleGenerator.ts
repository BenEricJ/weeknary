import type {
  GeneratedPlanBundle,
  PlanBundleGenerationRequest,
  PlanBundleGeneratorPort,
} from "../../application";
import type { WeeknarySupabaseClient } from "./supabaseClient";

export class SupabasePlanBundleGenerator implements PlanBundleGeneratorPort {
  constructor(private readonly client: WeeknarySupabaseClient) {}

  async generatePlanBundle(
    request: PlanBundleGenerationRequest,
  ): Promise<GeneratedPlanBundle> {
    const { data, error } = await this.client.functions.invoke<GeneratedPlanBundle>(
      "generate-plan-bundle",
      { body: request },
    );

    if (error) {
      throw new Error(`Plan bundle generation failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("Plan bundle generation failed: empty response.");
    }

    return data;
  }
}
