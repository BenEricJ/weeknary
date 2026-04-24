import type {
  GeneratedPlanBundle,
  PlanBundleGenerationErrorCode,
  PlanBundleGenerationErrorPayload,
  PlanBundleGenerationError,
  PlanBundleGenerationRequest,
  PlanBundleGeneratorPort,
} from "../../application";
import type { WeeknarySupabaseClient } from "./supabaseClient";
import { supabaseConfig } from "./supabaseConfig";
import { PlanBundleGenerationError as PlanBundleGenerationErrorClass } from "../../application";

export class SupabasePlanBundleGenerator implements PlanBundleGeneratorPort {
  constructor(private readonly client: WeeknarySupabaseClient) {}

  async generatePlanBundle(
    request: PlanBundleGenerationRequest,
  ): Promise<GeneratedPlanBundle> {
    const session = await this.client.auth.getSession();
    const accessToken = session.data.session?.access_token;

    if (!accessToken) {
      throw new PlanBundleGenerationErrorClass({
        error: "Plan bundle generation failed: authentication required.",
        code: "auth_required",
        hint: "Bitte erneut anmelden.",
        status: 401,
      });
    }

    const response = await fetch(`${supabaseConfig.url}/functions/v1/generate-plan-bundle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseConfig.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const contentType = response.headers.get("Content-Type") ?? "";
    const isJson = contentType.includes("application/json");
    const responseBody = isJson ? await response.json().catch(() => null) : await response.text();

    if (!response.ok) {
      throw toPlanBundleGenerationError(response.status, responseBody);
    }

    if (!responseBody || typeof responseBody !== "object") {
      throw new PlanBundleGenerationErrorClass({
        error: "Plan bundle generation failed: empty response.",
        code: "unexpected_error",
        hint: "Bitte spaeter erneut versuchen.",
      });
    }

    return responseBody as GeneratedPlanBundle;
  }
}

function toPlanBundleGenerationError(status: number, body: unknown): PlanBundleGenerationError {
  if (body && typeof body === "object" && "error" in body) {
    const payload = body as Partial<PlanBundleGenerationErrorPayload>;
    return new PlanBundleGenerationErrorClass({
      error:
        typeof payload.error === "string"
          ? payload.error
          : "Plan bundle generation failed.",
      code: isKnownErrorCode(payload.code) ? payload.code : "unexpected_error",
      hint: typeof payload.hint === "string" ? payload.hint : undefined,
      details: typeof payload.details === "string" ? payload.details : undefined,
      status: typeof payload.status === "number" ? payload.status : status,
    });
  }

  return new PlanBundleGenerationErrorClass({
    error: "Plan bundle generation failed.",
    code: status === 401 ? "auth_required" : "unexpected_error",
    hint: status === 401 ? "Bitte erneut anmelden." : "Bitte spaeter erneut versuchen.",
    details: typeof body === "string" && body.trim() ? body.trim() : undefined,
    status,
  });
}

function isKnownErrorCode(value: unknown): value is PlanBundleGenerationErrorCode {
  return (
    value === "auth_required" ||
    value === "invalid_request" ||
    value === "env_not_configured" ||
    value === "openai_timeout" ||
    value === "openai_request_failed" ||
    value === "openai_response_invalid" ||
    value === "unexpected_error"
  );
}
