import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(path) {
  const fullPath = join(root, path);

  if (!existsSync(fullPath)) {
    fail(`Missing ${path}`);
    return "";
  }

  return readFileSync(fullPath, "utf8");
}

function assertIncludes(path, content, expected) {
  if (!content.includes(expected)) {
    fail(`${path} does not include ${expected}`);
  }
}

function walkFiles(directory) {
  const fullDirectory = join(root, directory);

  if (!existsSync(fullDirectory)) {
    fail(`Missing ${directory}`);
    return [];
  }

  const files = [];

  for (const entry of readdirSync(fullDirectory)) {
    const fullPath = join(fullDirectory, entry);
    const relativePath = join(directory, entry);

    if (statSync(fullPath).isDirectory()) {
      files.push(...walkFiles(relativePath));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.dependencies?.["@supabase/supabase-js"]) {
  fail("package.json is missing @supabase/supabase-js");
}

const envExample = read(".env.example");
assertIncludes(".env.example", envExample, "VITE_SUPABASE_URL=");
assertIncludes(".env.example", envExample, "VITE_SUPABASE_ANON_KEY=");

const migrations = [
  ["supabase/migrations/202604150001_week_plans.sql", "week_plans"],
  ["supabase/migrations/202604160001_meal_plans.sql", "meal_plans"],
  ["supabase/migrations/202604160002_training_plans.sql", "training_plans"],
];

for (const [path, table] of migrations) {
  const sql = read(path);
  assertIncludes(path, sql, `create table if not exists public.${table}`);
  assertIncludes(path, sql, "enable row level security");
  assertIncludes(path, sql, `(select auth.uid()) = user_id`);
  assertIncludes(path, sql, `${table}_set_updated_at`);
}

const supabaseFiles = [
  "src/infrastructure/supabase/supabaseConfig.ts",
  "src/infrastructure/supabase/supabaseClient.ts",
  "src/infrastructure/supabase/SupabaseAuthSessionProvider.ts",
  "src/infrastructure/supabase/SupabasePlanRepository.ts",
  "src/infrastructure/supabase/SupabaseWeekPlanRepository.ts",
  "src/infrastructure/supabase/SupabaseMealPlanRepository.ts",
  "src/infrastructure/supabase/SupabaseTrainingPlanRepository.ts",
];

for (const path of supabaseFiles) {
  read(path);
}

const supabaseClient = read("src/infrastructure/supabase/supabaseClient.ts");
for (const table of ["week_plans", "meal_plans", "training_plans"]) {
  assertIncludes("src/infrastructure/supabase/supabaseClient.ts", supabaseClient, table);
}

const planRepository = read("src/infrastructure/supabase/SupabasePlanRepository.ts");
for (const expected of [
  "schemaVersion: 1",
  "getActiveByUser",
  ".eq(\"user_id\", userId)",
  "payload schemaVersion is unsupported",
]) {
  assertIncludes("src/infrastructure/supabase/SupabasePlanRepository.ts", planRepository, expected);
}

for (const path of [
  "src/app/weekPlan/weekPlanRuntime.ts",
  "src/app/mealPlan/mealPlanRuntime.ts",
  "src/app/trainingPlan/trainingPlanRuntime.ts",
  "src/app/planning/planningContextRuntime.ts",
  "src/app/planning/weekPlanOrchestrationRuntime.ts",
]) {
  const content = read(path);
  assertIncludes(path, content, "demo-local");
  assertIncludes(path, content, "remote-signed-out");
  assertIncludes(path, content, "remote-signed-in");
  assertIncludes(path, content, "remote-unavailable");
}

const forbiddenApplicationImports =
  /@supabase|indexedDB|IndexedDB|lucide-react|vaul|from\s+["']react["']|window\.|document\./;

for (const file of [...walkFiles("src/domain"), ...walkFiles("src/application")]) {
  const content = read(file);

  if (forbiddenApplicationImports.test(content)) {
    fail(`${file} contains a forbidden domain/application dependency`);
  }
}

const forbiddenViewImports =
  /@supabase|supabaseClient|Supabase[A-Za-z]+Repository|infrastructure[/\\](supabase|memory|indexedDb)|indexedDB|IndexedDB/;

for (const file of [...walkFiles("src/app/views"), ...walkFiles("src/app/components")]) {
  const content = read(file);

  if (forbiddenViewImports.test(content)) {
    fail(`${file} contains a forbidden view/component dependency`);
  }
}

if (failures.length > 0) {
  console.error("Phase 15 validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Phase 15 validation passed.");
