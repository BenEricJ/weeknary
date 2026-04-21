# Phase 17 Live Remote Validation Results

## Purpose

Phase 17 executed the reconstructed Supabase remote persistence path against a real linked Supabase development project. The phase did not add product behavior, local-first persistence, sync queues, conflict handling, or orchestration intelligence.

## Environment

Validated project reference:

- `[redacted Supabase project ref]`

Local secret handling:

- `.env.local` was present.
- Required Supabase, database, and two-user validation keys were present.
- Secret values were not printed or committed.

Tooling:

- Supabase CLI was available through `npx supabase`.
- `npx supabase --version` returned `2.92.0`.

## Live CLI Validation

The Supabase CLI path was executed against the linked project:

```powershell
npx supabase login --token $env:SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref $env:SUPABASE_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list --linked
```

Observed results:

- CLI login succeeded.
- Project link succeeded.
- Initial dry-run and push succeeded.
- Migration history showed the three reconstructed Phase 15 migrations.
- A real schema drift was found: the remote plan tables had UUID primary keys and lacked the expected `source` column.
- Local reconstructed migrations were aligned to UUID IDs.
- A new migration was added and applied:
  - `202604170001_plan_source_columns.sql`
- Final linked migration history showed:
  - `202604150001`
  - `202604160001`
  - `202604160002`
  - `202604170001`

## Live Schema And RLS Checks

Remote schema inspection through `npx supabase db query --linked` confirmed:

- `week_plans`, `meal_plans`, and `training_plans` exist.
- Plan IDs are UUIDs with `gen_random_uuid()` defaults.
- Metadata columns exist: `user_id`, `title`, `status`, `source`, `version`, `valid_from`, `valid_to`, `payload`, `created_at`, `updated_at`, and `deleted_at`.
- Payload columns are JSONB.
- Owner-only RLS policies exist for select, insert, update, and delete on all three tables.

## Live Script Validation

The live validation script was executed with two authenticated test users:

```powershell
npm run validate:phase16:live
```

The local Node runtime could not trust the inspected HTTPS certificate chain and failed with `SELF_SIGNED_CERT_IN_CHAIN`. For that validation run only, an insecure diagnostic bypass was used. The command is intentionally omitted and must not be repeated. The durable setup is to export the corporate HTTPS inspection root certificate and run the script with `NODE_EXTRA_CA_CERTS`.

Final live script result:

- `week_plans`: user A upsert/read/update/archive/delete-cleanup passed; user B read/update/delete isolation passed.
- `meal_plans`: user A upsert/read/update/archive/delete-cleanup passed; user B read/update/delete isolation passed.
- `training_plans`: user A upsert/read/update/archive/delete-cleanup passed; user B read/update/delete isolation passed.

## Minimal Fixes Made

### UUID ID Alignment

The remote schema uses UUID plan IDs. The recovered local migration files were aligned to:

```sql
id uuid primary key default gen_random_uuid()
```

The live validation script now uses UUID row IDs.

The remote-demo ID helpers in the WeekPlan, MealPlan, and TrainingPlan hooks now produce deterministic UUID-like IDs from user-scoped text. This preserves deterministic validation behavior without colliding with UUID columns.

### Source Column Migration

The remote tables did not have the `source` metadata column expected by the repositories. The following migration was added and applied:

- `supabase/migrations/202604170001_plan_source_columns.sql`

It adds `source text not null default 'user'` to all three plan tables if missing.

### REST Range Handling

The live PostgREST path returned empty `416 Requested Range Not Satisfiable` responses for empty result sets unless REST reads included explicit range/count metadata.

The Supabase client wrapper and live validation script now add default REST headers for reads:

- `Range: 0-999`
- `Prefer: count=exact`

The Supabase repository save path now treats the empty 416 write response as ambiguous and immediately verifies the write by reading the saved row back. If the row cannot be read, save still fails.

The live validation script applies the same write-then-read verification strategy.

## Static Validation

Actually run:

- `npm install --legacy-peer-deps`: passed.
- `npm run typecheck`: passed after restoring missing recovered UI files.
- `npm run validate:phase15`: passed.
- Boundary scans:
  - `src/domain` and `src/application` had no forbidden React/browser/Supabase/IndexedDB/UI imports.
  - `src/app/views` and `src/app/components` had no direct Supabase client, repository implementation, or IndexedDB imports.

Build status:

- `npm run build` initially exposed missing recovered files (`index.html`, `theme.css`) and those files were restored from `onedrive_last_version/Weeknary_figma_recovered`.
- After restoration, the in-sandbox Vite build failed with `spawn EPERM` in Vite's Windows realpath optimization path.
- Running the approved build outside the sandbox timed out without useful output.
- Later build diagnostics showed `index.html` and `src/styles/theme.css` missing again; both were restored again at the end of the phase.
- Build success is therefore not claimed for Phase 17 in this environment. Typecheck and live Supabase validation did pass.

## Workspace Restoration Notes

The recovered workspace still intermittently loses or fails to materialize UI files. During Phase 17, missing files were restored from:

- `onedrive_last_version/Weeknary_figma_recovered`

Restored files included root/build and UI files such as `index.html`, `src/styles/theme.css`, route/layout files, and multiple UI components. This was restoration work only; no UI redesign was performed.

## Browser Runtime Validation

Not performed by this agent in a browser session.

The live backend path was validated through CLI and script. The browser checklist remains:

1. Start `npm run dev`.
2. With `.env.local` absent, confirm `demo-local`.
3. With `.env.local` present and signed out, confirm `remote-signed-out`.
4. Sign in as test user A.
5. Create remote demo WeekPlan, MealPlan, and TrainingPlan through the runtime panels.
6. Reload `/app/week`, `/app/nutrition`, and `/app/training`.
7. Confirm PlanningContext readiness when active plan ranges align.
8. Exercise the current WeekPlan orchestration preview/draft/activation flow if present.
9. Sign out and confirm remote-scoped data is hidden.
10. Sign in as test user B and confirm user A data is not visible.

## Remaining Limits

- Node still needs a trusted corporate root CA for clean live script validation without `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- Browser validation remains manual.
- Vite build remains blocked in this environment by subprocess execution behavior.
- WeekPlan IndexedDB/local-first persistence remains deferred.
- Sync queues and conflict handling remain deferred.

## Recommended Phase 18

Phase 18 should first stabilize the recovered workspace/build environment:

- investigate Vite `spawn EPERM` on Windows/OneDrive/sandbox,
- make `npm run build` pass repeatably,
- consider moving the recovered workspace out of OneDrive if file materialization continues to fail,
- then run browser validation against the now-live-validated Supabase backend.

Only after that should local-first WeekPlan recovery or further infrastructure work resume.
