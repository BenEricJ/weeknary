import { existsSync, readFileSync } from "node:fs";

function read(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing required file: ${path}`);
  }

  return readFileSync(path, "utf8");
}

function assertIncludes(path, content, expected) {
  if (!content.includes(expected)) {
    throw new Error(`${path} does not include expected content: ${expected}`);
  }
}

function assertNotIncludes(path, content, forbidden) {
  if (content.includes(forbidden)) {
    throw new Error(`${path} still includes forbidden content: ${forbidden}`);
  }
}

const requiredFiles = [
  "src/app/views/CreateHubView.tsx",
  "src/app/createHub/useCreateHub.ts",
  "src/app/createHub/createHubRuntime.ts",
  "src/application/planBundleService.ts",
  "src/infrastructure/supabase/SupabasePlanBundleGenerator.ts",
  "supabase/functions/generate-plan-bundle/index.ts",
];

for (const file of requiredFiles) {
  read(file);
}

const planBundleService = read("src/application/planBundleService.ts");
assertIncludes(
  "src/application/planBundleService.ts",
  planBundleService,
  'export type PlanBundleActivationMode = "draft" | "activate"',
);
assertIncludes(
  "src/application/planBundleService.ts",
  planBundleService,
  "validateCrossPlanLinks",
);
assertIncludes(
  "src/application/planBundleService.ts",
  planBundleService,
  "activateMealPlan",
);
assertIncludes(
  "src/application/planBundleService.ts",
  planBundleService,
  "activateTrainingPlan",
);
assertIncludes(
  "src/application/planBundleService.ts",
  planBundleService,
  "activateWeekPlan",
);

const edgeFunction = read("supabase/functions/generate-plan-bundle/index.ts");
assertIncludes(
  "supabase/functions/generate-plan-bundle/index.ts",
  edgeFunction,
  "https://api.openai.com/v1/responses",
);
assertIncludes(
  "supabase/functions/generate-plan-bundle/index.ts",
  edgeFunction,
  'type: "json_schema"',
);
assertIncludes(
  "supabase/functions/generate-plan-bundle/index.ts",
  edgeFunction,
  'requireEnv("OPENAI_API_KEY")',
);
assertIncludes(
  "supabase/functions/generate-plan-bundle/index.ts",
  edgeFunction,
  "client.auth.getUser()",
);

const createHubView = read("src/app/views/CreateHubView.tsx");
assertIncludes("src/app/views/CreateHubView.tsx", createHubView, "useCreateHub");
assertIncludes("src/app/views/CreateHubView.tsx", createHubView, 'save("draft")');
assertIncludes("src/app/views/CreateHubView.tsx", createHubView, 'save("activate")');

const envExample = read(".env.example");
for (const forbidden of [
  "libryqcuiadbxvhzaxmf",
  "sbp_",
  "benben2010@me.com",
  "eric.joachim@mailbox.org",
]) {
  assertNotIncludes(".env.example", envExample, forbidden);
}
assertIncludes(".env.example", envExample, "OPENAI_API_KEY=");
assertIncludes(".env.example", envExample, "OPENAI_MODEL=gpt-5.2");

console.log("Phase 20 Create Hub validation passed.");
