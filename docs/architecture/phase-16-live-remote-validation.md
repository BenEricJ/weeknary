# Phase 16 Live Remote Validation

## Purpose

Phase 16 prepares and executes live validation for the reconstructed Supabase remote persistence foundation. It does not add product behavior and does not restore IndexedDB/local-first, sync queues, or conflict handling.

The validation target is:

- WeekPlan remote persistence
- MealPlan remote persistence
- TrainingPlan remote persistence
- authenticated runtime selection
- owner-only RLS behavior
- PlanningContext and WeekPlan orchestration behavior over remote data

## Workspace Findings

The recovered workspace had no `.env` or `.env.local`, no Supabase CLI in `PATH`, and no `supabase/config.toml`. The CLI was added as a local dev dependency and initialized with `npx supabase init`.

The workspace also remains sensitive to missing recovered UI/build files. If Vite reports missing `index.html` or UI modules, restore missing files from `onedrive_last_version/Weeknary_figma_recovered` before running validation.

## Supabase Setup

Create `.env.local` from `.env.example` and fill:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- `WEEKNARY_TEST_USER_A_EMAIL`
- `WEEKNARY_TEST_USER_A_PASSWORD`
- `WEEKNARY_TEST_USER_B_EMAIL`
- `WEEKNARY_TEST_USER_B_PASSWORD`

Do not commit `.env.local`.

## Migration Validation

Use the local CLI dependency:

```bash
npx supabase --version
npx supabase login --token $env:SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref $env:SUPABASE_PROJECT_REF
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list --linked
```

Expected migrations:

1. `202604150001_week_plans.sql`
2. `202604160001_meal_plans.sql`
3. `202604160002_training_plans.sql`

The migrations create user-owned `week_plans`, `meal_plans`, and `training_plans` tables with metadata columns, schema-versioned JSONB payloads, updated-at triggers, useful indexes, RLS enabled, and owner-only policies.

## Runtime Validation

The runtime mode expectations are:

- Missing Supabase env: `demo-local`
- Supabase configured and signed out: `remote-signed-out`
- Supabase configured and signed in: `remote-signed-in`
- Auth/client failure: `remote-unavailable`

The Week, Nutrition, and Training screens expose compact runtime panels for:

- sign in
- create account
- sign out
- create/update a remote demo active plan
- archive the active plan
- reload runtime state

These are developer validation affordances only.

## Live Script Validation

After test users exist, run:

```bash
npm run validate:phase16:live
```

If Node reports `SELF_SIGNED_CERT_IN_CHAIN`, the network path is likely using corporate HTTPS inspection. Export the corporate root CA as PEM/CRT and point Node at it before running the live script:

```powershell
$env:NODE_EXTRA_CA_CERTS="C:\path\to\corporate-root-ca.pem"
npm run validate:phase16:live
```

The script signs in both users with the anon key and verifies for each table:

- user A can upsert/read a valid row
- user B cannot read user A's row
- user A can update and archive the row
- user B cannot update or delete user A's row
- user A can clean up the test row
- payload shape remains schema-versioned and table-compatible

The script does not print credentials and does not use a service-role key.

## Browser Validation Checklist

1. Run `npm run dev`.
2. With no `.env.local`, confirm demo-local mode.
3. Restore `.env.local`, restart Vite, and confirm remote signed-out mode.
4. Create test user A through a runtime panel, or sign in if it already exists.
5. Create remote demo WeekPlan, MealPlan, and TrainingPlan.
6. Confirm `/app/week`, `/app/nutrition`, and `/app/training` load signed-in remote mode.
7. Confirm PlanningContext sees all three active remote plans and reports readiness when date ranges align.
8. Confirm WeekPlan orchestration preview reads remote MealPlan and TrainingPlan inputs.
9. Create/update an orchestrated WeekPlan draft and explicitly activate it if the current orchestration UI is available.
10. Sign out and confirm remote-scoped data is no longer shown.
11. Create or sign in as test user B and confirm user A data is not visible.

## Validation Status

This phase distinguishes validation types:

- Static validation: build, typecheck, boundary scans, Phase 15 script.
- CLI validation: Supabase CLI availability, project link, dry-run, push, migration history.
- Live RLS validation: Phase 16 script with two authenticated users.
- Browser validation: manual runtime and orchestration checks.

Do not claim live validation until the CLI and live script have been run against a real Supabase project.

## Implementation-Time Results

Actually verified in the recovered workspace:

- `npm install --legacy-peer-deps` completed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run validate:phase15` passed.
- `npx supabase --version` returned `2.92.0`.
- `npm run validate:phase16:live` ran and correctly stopped because required live environment values were missing.
- `npx supabase db push --dry-run` and `npx supabase migration list --linked` ran and correctly stopped with `Cannot find project ref. Have you run supabase link?`

Not live-validated yet:

- Supabase project linking.
- Migration application to a hosted project.
- Two-user RLS checks.
- Browser sign-in and remote plan seed/archive checks.
- PlanningContext and WeekPlan orchestration against real remote rows.

Current blocker:

- No `.env` or `.env.local` is present in this workspace.
- The project is not linked with `supabase link`.
- No test-user credentials are available to the live validation script.

## Known Limits

- Email confirmation can block app-created test-user sign-in. If that happens, disable confirmation for the dev project or confirm the users manually in Supabase before running the script.
- WeekPlan IndexedDB/local-first remains deferred.
- Sync queues and conflict handling remain deferred.
- No service-role validation is used; this phase intentionally validates through anon-authenticated user sessions.

## Recommended Phase 17

If Phase 16 live validation passes, Phase 17 should restore WeekPlan local-first IndexedDB persistence and mutation queue behavior on top of the now-verified remote foundation. If live validation is blocked, Phase 17 should first resolve the exact Supabase environment blocker.
