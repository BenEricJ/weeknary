# Phase 20 Trusted Live Validation And WeekPlan Local-First Hardening

## Purpose

Phase 20 makes the live Supabase validation path reproducible with trusted corporate CA handling and hardens only the existing narrow WeekPlan local-first runtime behavior. It does not add product features, queues, conflict resolution, background sync, MealPlan local-first persistence, or TrainingPlan local-first persistence.

The active workspace is:

```text
C:\Users\JoachiE\Weeknary_phase19_local_20260420_1405
```

The old OneDrive workspace is not the active development target.

## Trusted Live Validation

A trusted live validation preflight was added:

```bash
npm run validate:phase20:live:trusted
```

That script first runs `scripts/validate-live-trust-prereqs.mjs`, then runs the existing `scripts/validate-phase16-live.mjs`.

Required inputs:

- `NODE_EXTRA_CA_CERTS`, set in the shell before Node starts, pointing to a readable corporate root CA PEM/CRT bundle.
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- `WEEKNARY_TEST_USER_A_EMAIL`
- `WEEKNARY_TEST_USER_A_PASSWORD`
- `WEEKNARY_TEST_USER_B_EMAIL`
- `WEEKNARY_TEST_USER_B_PASSWORD`

Windows PowerShell example:

```powershell
$env:NODE_EXTRA_CA_CERTS="C:\path\to\corporate-root-ca.pem"
npm run validate:phase20:live:trusted
```

`NODE_EXTRA_CA_CERTS` is intentionally read from the process environment, not `.env.local`, because Node must load the extra CA bundle before HTTPS connections are made. The preflight rejects `NODE_TLS_REJECT_UNAUTHORIZED=0`; that insecure bypass is not a normal project workflow.

`.env.example` now contains placeholders only. Real project credentials and test-user passwords belong in `.env.local` or process environment variables and must not be printed or committed.

## WeekPlan Local-First Hardening

The signed-in WeekPlan runtime still follows the same architecture:

```text
WeekView / HomeView
-> useActiveWeekPlan
-> WeekPlanService
-> IndexedDbWeekPlanRepository
-> SupabaseWeekPlanRepository
```

`IndexedDbWeekPlanRepository` now stores WeekPlan-only local-first metadata alongside the cached WeekPlan record:

- local cache availability,
- remote save pending,
- remote confirmed with timestamp,
- remote failed with timestamp and error,
- unknown for older cached records without metadata.

When a WeekPlan save writes locally but remote confirmation fails, the repository keeps the cached WeekPlan and records the remote failure. The runtime panel shows that the plan is saved locally only and offers a manual `Retry remote save` action.

The retry action is narrow and explicit:

- WeekPlan-only,
- user-triggered,
- retries the current cached WeekPlan by ID,
- does not increment the version,
- does not add a queue,
- does not run in the background,
- does not detect or resolve conflicts.

## Runtime Behavior

- Supabase unconfigured: WeekPlan uses demo-local in-memory data.
- Supabase configured and signed out: WeekPlan reports explicit `remote-signed-out`.
- Supabase configured and signed in: WeekPlan uses IndexedDB local-first over Supabase and shows local/remote confirmation state in the existing runtime panel.
- MealPlan remains remote-only in signed-in mode.
- TrainingPlan remains remote-only in signed-in mode.

## Validation Notes

Build/typecheck/browser validation are separate from CA-backed live validation:

- `npm run validate:workspace` checks the recovered workspace files.
- `npm run typecheck` checks TypeScript.
- `npm run build` checks the Vite production build.
- `npm run validate:phase15` checks restored architecture boundaries and remote persistence files.
- `npm run validate:phase19:browser` checks browser runtime behavior and now verifies WeekPlan remote-confirmation metadata in IndexedDB.
- `npm run validate:phase20:live:trusted` is the trusted CA-backed live Supabase path and requires the corporate CA plus live credentials.

If `NODE_EXTRA_CA_CERTS` is unavailable, CA-backed live validation is blocked by environment setup, not by a claimed code success.

Actually run during Phase 20 implementation:

- `npm run validate:workspace`: passed.
- `npm run typecheck`: passed after fixing the WeekPlan retry runtime union narrowing.
- `npm run build`: passed with the existing non-blocking Rollup `minify` and chunk-size warnings.
- `npm run validate:phase15`: passed.
- `npm run validate:phase19:browser`: passed, including WeekPlan remote-confirmation metadata in IndexedDB and unchanged MealPlan/TrainingPlan remote-only saves.
- `npm run validate:phase20:live:trusted`: blocked by missing `NODE_EXTRA_CA_CERTS`; the preflight stopped before running live Supabase validation.

CA-backed live Supabase validation was not claimed in this phase because the corporate CA path was not available in the shell.

## Deferred

Still deferred:

- WeekPlan retry queue,
- WeekPlan conflict resolver,
- background sync,
- MealPlan local-first persistence,
- TrainingPlan local-first persistence,
- generated draft detail UX,
- richer orchestration logic,
- Expo migration,
- product-wide offline platform work.
