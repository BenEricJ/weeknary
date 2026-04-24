# Weeknary

Weeknary is a Vite React app used to validate the staged planning architecture.

## Running The Active Workspace

Use this non-OneDrive local workspace as the active working copy:

```text
C:\Users\JoachiE\Weeknary_phase19_local_20260420_1405
```

The old OneDrive workspace is only a recovery/reference source if something is missing.

Use npm in this recovered workspace. The current dependency set has a Vite peer-resolution conflict under strict npm resolution, so use the legacy peer resolver for installation:

```bash
npm install --legacy-peer-deps
npm run dev
npm run validate:workspace
npm run typecheck
npm run build
npm run validate:phase15
```

There is currently no `test` script in `package.json`.

## Architecture Notes

- Phase 11 cross-domain orchestration preparation: `docs/architecture/phase-11-cross-domain-orchestration-preparation.md`
- Phase 12 controlled WeekPlan orchestration write path: `docs/architecture/phase-12-controlled-weekplan-orchestration-write-path.md`
- Phase 13 safe generated-draft review and activation: `docs/architecture/phase-13-safe-generated-draft-review-activation.md`
- Phase 14 workspace restoration and verification: `docs/architecture/phase-14-workspace-restoration-and-architecture-verification.md`
- Phase 15 remote persistence foundation restoration: `docs/architecture/phase-15-remote-persistence-foundation-restoration.md`
- Phase 16 live remote validation: `docs/architecture/phase-16-live-remote-validation.md`
- Phase 17 live remote validation results: `docs/architecture/phase-17-live-remote-validation-results.md`
- Phase 18 build stabilization and WeekPlan local-first restoration: `docs/architecture/phase-18-build-stabilization-and-weekplan-local-first-restoration.md`
- Phase 19 browser validation and WeekPlan local-first hardening: `docs/architecture/phase-19-browser-validation-and-weekplan-local-first-hardening.md`
- Phase 20 trusted live validation and WeekPlan local-first hardening: `docs/architecture/phase-20-trusted-live-validation-and-weekplan-local-first-hardening.md`
- Phase 21 trusted live validation enablement and secret hygiene completion: `docs/architecture/phase-21-trusted-live-validation-enablement-and-secret-hygiene-completion.md`

## Phase 17 Remote Persistence Status

The current workspace has demo-local and Supabase remote repository paths for WeekPlan, MealPlan, and TrainingPlan. WeekPlan also has a narrow IndexedDB-backed local-first repository composed over Supabase for signed-in remote mode.

Live Supabase validation has been performed against the linked development project documented in `docs/architecture/phase-17-live-remote-validation-results.md`. WeekPlan sync queues and conflict metadata remain deferred recovery work. MealPlan and TrainingPlan remain remote-only.

## Supabase Setup

Create a local `.env.local` from `.env.example` and provide:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

For GitHub Pages, the same two Vite values must be configured as repository
secrets because `.env.local` is local-only and is not committed:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The Pages workflow fails before the Vite build if either secret is missing.
After changing these secrets, redeploy Pages and hard-refresh the installed PWA
or clear the service worker cache so the browser loads the new build.

For the KI Create Hub Edge Function, set server-side Supabase secrets instead of
Vite variables:

```bash
npx supabase secrets set OPENAI_API_KEY=...
npx supabase secrets set OPENAI_MODEL=gpt-5.2
npx supabase secrets set PLAN_GENERATION_TIMEOUT_MS=60000
```

Local Edge Function development can use `WEEKNARY_PLAN_GENERATION_MOCK=true` to
return a deterministic generated bundle without calling OpenAI.

Apply migrations in order:

1. `supabase/migrations/202604150001_week_plans.sql`
2. `supabase/migrations/202604160001_meal_plans.sql`
3. `supabase/migrations/202604160002_training_plans.sql`
4. `supabase/migrations/202604170001_plan_source_columns.sql`

Runtime behavior:

- Missing Supabase env: seeded demo-local in-memory repositories are used.
- Supabase configured but signed out: remote signed-out state is explicit; the app does not silently fall back to demo data.
- Supabase configured and signed in: WeekPlan uses an IndexedDB-backed local-first repository composed over Supabase; MealPlan and TrainingPlan use Supabase-backed repositories.

Manual remote validation should confirm sign-in, active plan lookup, save/archive behavior, reload behavior, sign-out safety, and RLS isolation between two users.

## KI Create Hub

The `/app/create` route generates a `MealPlan`, `TrainingPlan`, and `WeekPlan`
bundle through the authenticated `generate-plan-bundle` Supabase Edge Function.
The browser never receives `OPENAI_API_KEY`; it invokes the function with the
current Supabase session. Generated bundles can be saved as drafts or activated,
which archives existing active plans through the domain services.

If generation fails, Create Hub now shows a user-facing error plus collapsible
technical details from the Edge Function response. The most common operational
cause is a missing Edge Function secret such as `OPENAI_API_KEY`.

Required Edge Function secrets:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
PLAN_GENERATION_TIMEOUT_MS=60000
```

For local validation only, the Edge Function can be switched to mock mode with
`WEEKNARY_PLAN_GENERATION_MOCK=true`. This is a development aid only and not a
production fallback path.

Validation:

```bash
npm run validate:phase20:create-hub
```

## Phase 16 Live Validation

The Supabase CLI is installed as a local dev dependency. Use `npx supabase ...` from the project root.

Required `.env.local` keys:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_ACCESS_TOKEN=
SUPABASE_PROJECT_REF=
SUPABASE_DB_PASSWORD=
WEEKNARY_TEST_USER_A_EMAIL=
WEEKNARY_TEST_USER_A_PASSWORD=
WEEKNARY_TEST_USER_B_EMAIL=
WEEKNARY_TEST_USER_B_PASSWORD=
```

Migration validation:

```bash
npx supabase --version
npx supabase login --token $env:SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref $env:SUPABASE_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list --linked
```

Create the two test users through the app runtime panel first. For trusted live validation behind corporate HTTPS inspection, set `NODE_EXTRA_CA_CERTS` in the shell before starting Node.

PowerShell:

```powershell
$env:NODE_EXTRA_CA_CERTS="C:\path\to\corporate-root-ca.pem"
npm run validate:phase20:live:trusted
Remove-Item Env:NODE_EXTRA_CA_CERTS
```

Windows Command Prompt:

```bat
set "NODE_EXTRA_CA_CERTS=C:\path\to\corporate-root-ca.pem"
npm run validate:phase20:live:trusted
set NODE_EXTRA_CA_CERTS=
```

Git Bash:

```bash
export NODE_EXTRA_CA_CERTS="/c/path/to/corporate-root-ca.pem"
npm run validate:phase20:live:trusted
unset NODE_EXTRA_CA_CERTS
```

`NODE_EXTRA_CA_CERTS` is not loaded from `.env.local`; Node must see it in the process environment before HTTPS connections are made. The certificate file must come from the corporate trust chain, must stay outside the repo, and must not be committed. `NODE_TLS_REJECT_UNAUTHORIZED=0` is rejected by the trusted validation path and must not be used as normal setup.

The live script validates owner-only RLS and save/update/archive/delete behavior for `week_plans`, `meal_plans`, and `training_plans` using normal anon-authenticated sessions. It does not use service-role credentials.

Phase 17 also found that this remote REST path requires explicit range/count handling for reliable empty-result behavior. The shared Supabase client and live validation script now add default REST read headers and verify ambiguous write responses by reading the saved row back.

## Current Build Note

`npm run build` uses Vite's native config loader. Run `npm run validate:workspace` before build to confirm the recovered files required by the current app are present.

## Phase 12 Manual Validation

Open `/app/week` and inspect the WeekPlan orchestration panel below the planning context panel. The panel is read-only until the user explicitly chooses to create or update an orchestrated draft.

Expected behavior:

- Missing or misaligned WeekPlan, MealPlan, or TrainingPlan inputs block draft creation.
- Ready inputs produce a preview with all-day nutrition and training markers.
- The explicit draft action saves a generated WeekPlan draft through the existing WeekPlan service/repository path.
- The active WeekPlan is not silently overwritten or activated.

## Phase 13 Manual Validation

After creating or updating an orchestrated draft, inspect the generated-draft review section in `/app/week`.

Expected behavior:

- No generated draft means activation is blocked.
- A stale generated draft means activation is blocked until the draft is updated.
- A fresh generated draft can be activated only through the explicit `Activate generated draft` action.
- Activation uses the existing WeekPlan service path and archives the previous active WeekPlan.

## Phase 19 Browser Validation

The active Phase 19 workspace was moved out of OneDrive to avoid disappearing recovered files:

```text
C:\Users\JoachiE\Weeknary_phase19_local_20260420_1405
```

From that local workspace, the browser validation command is:

```bash
npm run validate:phase19:browser
```

It starts local Vite servers and a headless Edge/Chrome instance through DevTools Protocol. It temporarily moves `.env.local` aside for the demo-local check and restores it before remote checks. Do not print or commit `.env.local` values.

Validated browser states in Phase 19:

- demo-local Week route with PlanningContext and orchestration panels,
- remote signed-out mode without demo fallback,
- remote signed-in test user flow,
- WeekPlan remote demo save plus IndexedDB cache presence,
- MealPlan and TrainingPlan remote-only demo saves,
- PlanningContext and orchestration panel rendering in remote signed-in mode,
- explicit sign-out back to remote signed-out.

Phase 20 extends this browser validation to confirm that the WeekPlan IndexedDB cache records remote confirmation metadata after a successful signed-in WeekPlan save. MealPlan and TrainingPlan remain remote-only.

## WeekPlan Local-First Runtime Expectations

WeekPlan signed-in mode is intentionally narrow local-first: IndexedDB cache first, Supabase confirmation second, no queue, no background sync, and no conflict resolver.

The WeekPlan runtime panel now reports whether the cached plan is locally available, whether remote confirmation is pending, confirmed, failed, or unknown for older cached rows. If remote confirmation fails after a local save, the panel shows that the WeekPlan is saved locally only and exposes a manual `Retry remote save` action for that cached WeekPlan. MealPlan and TrainingPlan are unchanged and remain remote-only in signed-in mode.

`npm run validate:phase20:live:trusted` requires `NODE_EXTRA_CA_CERTS` for the corporate root CA. Without that setup the trusted preflight fails before the live Supabase script runs.
