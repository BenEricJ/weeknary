# Phase 15 Remote Persistence Foundation Restoration

## Workspace And Persistence Assessment

Phase 15 restored the missing remote persistence foundation in the recovered workspace. This workspace still has no Git metadata in the project root, so the Supabase layer was reconstructed from the current domain/service contracts, the Phase 14 restoration baseline, and the documented Phase 15 target. It was not restored from authoritative Git history.

Additional workspace integrity gaps were found while validating the remote restoration:

- The root `index.html` was missing, so Vite could not resolve its entry module.
- Several app UI modules and layout/routing files were missing from `src`.
- `vite.config.ts`, PWA assets, and small root build-support files were missing from the root but present in `onedrive_last_version/Weeknary_figma_recovered`.

Those files were restored from the local `onedrive_last_version` recovery source only where the root file was missing. Existing root source files were not overwritten.

## Restored Or Reconstructed

Reconstructed remote persistence foundation:

- Shared Supabase config/client infrastructure under `src/infrastructure/supabase`.
- Supabase auth/session provider implementing the application-level `AuthSessionProvider` port.
- Supabase repositories for WeekPlan, MealPlan, and TrainingPlan.
- SQL migrations for `week_plans`, `meal_plans`, and `training_plans`.
- Runtime selection for demo-local, remote signed-out, remote signed-in, and remote-unavailable modes.

Restored from local recovery evidence:

- Root Vite entry file `index.html`.
- `vite.config.ts`, `postcss.config.mjs`, `default_shadcn_theme.css`, `ATTRIBUTIONS.md`, and `pnpm-workspace.yaml` where missing.
- Missing app routes, layouts, UI components, and public PWA assets.

Not restored in this phase:

- WeekPlan IndexedDB/local-first persistence.
- WeekPlan sync queue and conflict metadata persistence.
- Local-first behavior for MealPlan or TrainingPlan.
- Live Supabase/browser validation.

## Supabase Infrastructure

Remote configuration uses:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

When both values are present, `src/infrastructure/supabase/supabaseClient.ts` creates the typed Supabase client. When either value is missing, the app remains in demo-local in-memory mode for the planning slices.

The application-level auth boundary lives in `src/application/ports.ts`:

- `AuthCredentials`
- `AuthSession`
- `AuthSessionProvider`

`SupabaseAuthSessionProvider` implements that port and uses Supabase `auth.getUser()`, `signInWithPassword`, `signUp`, and `signOut`.

## Repository Mapping

The three Supabase repositories use one table per bounded slice:

- `public.week_plans`
- `public.meal_plans`
- `public.training_plans`

Each table stores first-class metadata columns:

- `id`
- `user_id`
- `title`
- `status`
- `source`
- `version`
- `valid_from`
- `valid_to`
- `created_at`
- `updated_at`
- `deleted_at`

The current domain body is stored in a schema-versioned JSONB payload:

- WeekPlan payload: `events`, `focusItems`
- MealPlan payload: `targets`, `days`, `recipes`, `shoppingList`
- TrainingPlan payload: `days`, `workouts`, `goals`

Repositories always filter by `user_id` in queries in addition to relying on RLS. Malformed row metadata or unsupported payload schema versions throw explicit repository errors.

## Runtime Mode Selection

The restored runtime behavior is:

- Supabase env missing: use seeded in-memory demo-local repositories.
- Supabase configured and no authenticated user: expose explicit `remote-signed-out` state; do not fall back to demo data.
- Supabase configured and authenticated: use Supabase-backed repositories for the active slice.
- Supabase auth unavailable: expose explicit `remote-unavailable` state.

PlanningContext and WeekPlan orchestration reuse the resolved slice runtimes so cross-domain reads do not bypass the app-level runtime/auth boundary.

## SQL And RLS

The migrations define user-owned tables with:

- primary key on `id`
- `user_id` reference to `auth.users(id)`
- status/date-range/updated indexes
- `public.set_updated_at()` trigger function
- `updated_at` triggers
- RLS enabled
- owner-only `select`, `insert`, `update`, and `delete` policies for authenticated users

The database intentionally does not enforce a single active plan per user. Lifecycle behavior remains in the application services and repositories.

Migration order:

1. `supabase/migrations/202604150001_week_plans.sql`
2. `supabase/migrations/202604160001_meal_plans.sql`
3. `supabase/migrations/202604160002_training_plans.sql`

## Verified Commands

Actually run in this workspace:

- `npm install @supabase/supabase-js --legacy-peer-deps`
- `npm install --legacy-peer-deps`
- `node scripts/validate-phase15.mjs`
- `npm run typecheck`
- `npm run build`

Validation results:

- Typecheck passed.
- Build passed.
- Phase 15 script-style validation passed.
- Build emitted non-blocking chunk-size warnings and one Rollup warning about an unknown `minify` output option from the current toolchain/plugin combination.

Boundary scans passed:

- `src/domain` and `src/application` contain no React, Supabase, IndexedDB, browser API, Vaul, Lucide, or UI imports.
- `src/app/views` and `src/app/components` contain no direct Supabase client, repository implementation, IndexedDB, or infrastructure imports.

There is still no test script in `package.json`.

## Manual Validation Checklist

Live Supabase validation was not performed in this environment. Before treating the remote path as operationally validated, run:

1. Create a Supabase project.
2. Apply the three migrations in order.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Start the app with `npm run dev`.
5. Sign in or create an account through the runtime panel.
6. Create/save/archive one WeekPlan, MealPlan, and TrainingPlan through the current developer/runtime affordances where available.
7. Reload and verify active-plan lookup.
8. Sign out and verify remote-scoped data is not shown.
9. Sign in as a second user and verify RLS prevents cross-user access.

## Known Limits

- WeekPlan local-first IndexedDB persistence is still deferred.
- WeekPlan mutation queue, retry, sync, and conflict metadata are still deferred in this recovered workspace.
- MealPlan and TrainingPlan are remote-capable but not local-first.
- No live Supabase RLS validation was performed.
- The root still has no Git metadata, so future restoration should continue to avoid destructive assumptions.

## Recommended Phase 16

Phase 16 should perform real Supabase/browser validation of WeekPlan, MealPlan, and TrainingPlan using a configured Supabase project and test users. WeekPlan local-first/IndexedDB restoration should remain deferred until this remote foundation has been validated live.
