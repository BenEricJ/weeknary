import { existsSync } from "node:fs";

const requiredFiles = [
  "index.html",
  ".env.example",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "src/main.tsx",
  "src/styles/index.css",
  "src/styles/theme.css",
  "src/app/routes.tsx",
  "src/app/layouts/RootLayout.tsx",
  "src/app/layouts/AppLayout.tsx",
  "src/app/views/WeekView.tsx",
  "src/app/views/NutritionView.tsx",
  "src/app/views/TrainingView.tsx",
  "src/app/weekPlan/weekPlanRuntime.ts",
  "src/infrastructure/supabase/supabaseClient.ts",
  "src/infrastructure/indexedDb/IndexedDbWeekPlanRepository.ts",
  "scripts/live-validation-config.mjs",
  "scripts/validate-live-trust-prereqs.mjs",
  "docs/architecture/phase-20-trusted-live-validation-and-weekplan-local-first-hardening.md",
  "docs/architecture/phase-21-trusted-live-validation-enablement-and-secret-hygiene-completion.md",
];

const missing = requiredFiles.filter((path) => !existsSync(path));

if (missing.length > 0) {
  console.error("Workspace validation failed. Missing required recovered files:");
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log("Workspace validation passed.");
