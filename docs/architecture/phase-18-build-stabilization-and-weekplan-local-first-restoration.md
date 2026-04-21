# Phase 18 Build Stabilization And WeekPlan Local-First Restoration

## Purpose

Phase 18 stabilized the recovered Vite workspace enough for repeatable build validation, then restored only the narrow WeekPlan local-first read/write path. It did not add product behavior, restore MealPlan or TrainingPlan local-first persistence, add sync queues, add conflict handling, or change orchestration behavior.

## Workspace And Build Stabilization

The workspace still lives under OneDrive:

- `C:\Users\JoachiE\OneDrive - BASF\Python Projects\Weeknary_figma_recovered`

Several directories are reparse points and recovered files had previously disappeared between validation commands. During this phase, missing files were restored from:

- `onedrive_last_version/Weeknary_figma_recovered`

Restored files included routing, layouts, UI components, PWA assets, and the original Vite support files where the root copy was missing.

The recovered `vite.config.ts` originally used `__dirname`, which fails under Vite's native ESM config loader. It now derives `__dirname` from `import.meta.url`.

The build/dev scripts now use Vite's native config loader:

```bash
vite build --configLoader native
vite --configLoader native
```

This avoids the previous config-bundling subprocess path that was blocked by `spawn EPERM`.

A small workspace validation script was added:

```bash
npm run validate:workspace
```

It checks for the recovered root entry, style, route, layout, WeekPlan runtime, and persistence files that are required for the current build path.

## WeekPlan Local-First Restoration

Only WeekPlan local-first persistence was restored.

The remote signed-in WeekPlan runtime now composes:

```text
WeekView/HomeView
-> useActiveWeekPlan
-> WeekPlanService
-> IndexedDbWeekPlanRepository
-> SupabaseWeekPlanRepository
```

The IndexedDB repository:

- implements `WeekPlanRepositoryPort`,
- stores only WeekPlan records,
- hydrates from Supabase when the local cache is empty,
- saves locally first, then verifies the remote save,
- keeps `WeekPlanService` repository-agnostic,
- does not introduce a generic offline framework,
- does not add MealPlan or TrainingPlan local-first behavior.

If a remote save fails after the local save succeeds, the repository throws an explicit error that states the local save happened but the remote save failed. No retry queue or conflict resolver was added in this phase.

## Not Restored

Still deferred:

- MealPlan local-first persistence.
- TrainingPlan local-first persistence.
- Sync queues.
- Conflict resolution.
- Background retry workers.
- Generated draft merge tooling.
- New orchestration behavior.

## Validation Results

Actually run:

- `npm install --legacy-peer-deps`: passed; npm still reports 5 high severity audit findings.
- `npm run validate:workspace`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed twice with `--configLoader native`.
- `npm run validate:phase15`: passed.
- Boundary scans passed:
  - `src/domain` and `src/application` had no forbidden React/browser/Supabase/IndexedDB/Vaul/Lucide/UI imports.
  - `src/app/views` and `src/app/components` had no direct Supabase client, repository implementation, or IndexedDB imports.
- MealPlan and TrainingPlan were scanned for IndexedDB imports; no matches were found.

Build notes:

- The successful builds are slow in the OneDrive workspace.
- The second successful build took over eight minutes.
- Build output still has non-blocking warnings:
  - unknown Rollup output option `minify`,
  - chunks larger than 500 kB.

Live Supabase validation:

- `npm run validate:phase16:live` without a corporate CA still fails at `SELF_SIGNED_CERT_IN_CHAIN`.
- This confirms the Phase 17 environment blocker remains.
- The script was not rerun with `NODE_TLS_REJECT_UNAUTHORIZED=0` in Phase 18 because that is only a diagnostic workaround, not normal setup.

Browser validation:

- A short-lived dev-server check was attempted but timed out in the job wrapper.
- After the timeout, no server was reachable on `127.0.0.1:5173`.
- Browser/runtime validation is therefore not claimed in Phase 18.

## Current Runtime Behavior

- Supabase unconfigured: demo-local in-memory mode remains available.
- Supabase configured and signed out: explicit remote-signed-out mode remains.
- Supabase configured and signed in: WeekPlan now uses the IndexedDB-backed WeekPlan repository composed over Supabase.
- MealPlan and TrainingPlan remain remote-only in signed-in mode.

## Risks And Limits

- The project still sits in a OneDrive path. If file materialization problems return, copy the workspace to a non-OneDrive local directory before continuing feature work.
- WeekPlan local-first has no retry queue or conflict resolver.
- Browser validation is still needed before treating the local-first path as product-ready.
- Clean live Supabase script validation needs `NODE_EXTRA_CA_CERTS` pointing at the corporate root CA.

## Recommended Phase 19

Phase 19 should perform browser validation of:

1. demo-local mode,
2. remote signed-out mode,
3. remote signed-in WeekPlan local-first behavior,
4. WeekPlan local save/read/reload behavior,
5. remote Supabase persistence after local-first writes,
6. PlanningContext and orchestration over the current active plans.

Do not restore MealPlan or TrainingPlan local-first until the WeekPlan local-first path is manually validated in the browser.
