# Phase 19 Browser Validation And WeekPlan Local-First Hardening

## Purpose

Phase 19 validated the restored WeekPlan local-first browser path and the current planning surfaces after Phase 18 stabilized the build. The phase did not add product behavior, queueing, conflict handling, MealPlan local-first persistence, or TrainingPlan local-first persistence.

## Workspace Move

The original OneDrive workspace continued to lose materialized files during validation, including:

- `index.html`
- `src/styles/theme.css`
- `src/app/routes.tsx`

To avoid validating against a changing tree, the active workspace was moved to a non-OneDrive local path:

```text
C:\Users\JoachiE\Weeknary_phase19_local_20260420_1405
```

Dependencies were reinstalled in that local workspace with:

```bash
npm install --legacy-peer-deps
```

The install passed. npm still reports 5 high severity audit findings.

## Browser Validation Support

A script-style browser validation was added:

```bash
npm run validate:phase19:browser
```

It uses the locally installed Edge/Chrome executable through the Chrome DevTools Protocol. No browser test framework dependency was added.

The script validates:

- demo-local mode with `.env.local` temporarily moved aside and restored afterward,
- remote signed-out mode with `.env.local` present,
- remote signed-in mode through the runtime panel,
- WeekPlan remote demo save through the app path,
- WeekPlan IndexedDB cache presence in `weeknary-weekplan` / `week_plans`,
- WeekPlan reload with remote signed-in state still present,
- MealPlan remote-only runtime demo save,
- TrainingPlan remote-only runtime demo save,
- PlanningContext and WeekPlan orchestration panels rendering in remote signed-in mode,
- explicit sign-out back to remote signed-out mode.

The script uses a stable local Vite cache directory because Windows/OneDrive and cold Vite transforms made initial browser startup very slow. Temporary Edge profile cleanup can emit `EPERM` warnings when Edge holds profile files briefly after close; those warnings did not block validation.

## Minimal Fixes Made

### Stable Local Workspace

Missing runtime/build files were restored in the non-OneDrive copy from:

```text
onedrive_last_version\Weeknary_figma_recovered
```

This was restoration from the existing recovery source, not UI reinvention.

### Runtime Panel Clarity

`WeekPlanRuntimePanel` now describes the actual runtime mode instead of always saying the demo-local path is restored. It also uses ASCII `-` in the compact status line.

### Browser Validation Diagnostics

`validate-phase19-browser.mjs` now:

- starts Vite through the local Vite binary instead of `npm.cmd`, avoiding `spawn EINVAL`,
- uses an isolated Vite cache path,
- handles slow first-load transforms with longer waits,
- uses case-insensitive text checks because browser `innerText` reflects CSS uppercase,
- captures page state, resource timing, console/log events, and rendered text snippets on failure,
- uses unique temporary Edge profiles per run,
- tolerates non-critical temporary-profile cleanup locks.

### Remote Demo UUIDs

The deterministic remote demo ID helper in the three app hooks was fixed to emit valid UUIDs:

- WeekPlan
- MealPlan
- TrainingPlan

The previous implementation generated too many hex characters and Supabase rejected the WeekPlan save with:

```text
invalid input syntax for type uuid
```

The fixed helper generates 16 bytes, sets UUID version/variant bits, and formats a normal UUID string.

## Browser Validation Results

Actually run and passed from the local workspace:

```bash
npm run validate:phase19:browser
```

Observed pass results:

- demo-local: Week route loads with WeekPlan runtime, PlanningContext, and orchestration panels.
- remote-signed-out: configured remote mode starts signed out without demo fallback.
- remote-signed-in: test user A signs in through the runtime panel.
- WeekPlan local-first cache: IndexedDB `weeknary-weekplan` / `week_plans` contains one cached row after remote demo save.
- WeekPlan reload: signed-in remote runtime and cached WeekPlan remain present after reload.
- MealPlan remote-only: runtime panel saves through the remote path.
- TrainingPlan remote-only: runtime panel saves through the remote path.
- PlanningContext/orchestration: panels render in remote signed-in browser mode.
- Sign-out: returns to explicit remote-signed-out state.

Not validated:

- The explicit local-save-succeeded / remote-save-failed error path was observed before the UUID fix, but a safe repeatable remote-failure scenario was not introduced in this phase.
- Two-user browser isolation was not manually exercised in the browser. It remains covered by the Phase 17 live script result, while the script currently requires corporate CA setup to rerun cleanly from Node.

## Static Validation Results

Actually run from the local workspace:

- `npm run validate:workspace`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run validate:phase15`: passed.
- Boundary scans passed with no forbidden imports found.

`npm run validate:phase16:live` was also run without insecure TLS bypass. It failed at the known corporate CA blocker:

```text
SELF_SIGNED_CERT_IN_CHAIN
```

Use `NODE_EXTRA_CA_CERTS` with the corporate root CA to rerun that live script cleanly. `NODE_TLS_REJECT_UNAUTHORIZED=0` was not used in Phase 19.

## Current Runtime Baseline

- Supabase unconfigured: demo-local in-memory mode works in the browser.
- Supabase configured and signed out: explicit remote-signed-out mode works in the browser.
- Supabase configured and signed in: WeekPlan uses the IndexedDB local-first cache over Supabase and works in the browser.
- MealPlan remains remote-only.
- TrainingPlan remains remote-only.
- PlanningContext and current orchestration panels render against remote signed-in browser state.

## Deferred Work

Still deferred:

- WeekPlan retry queue.
- WeekPlan conflict resolver.
- MealPlan local-first persistence.
- TrainingPlan local-first persistence.
- Additional orchestration intelligence.
- Generated draft detail or merge UI.
- Browser-driven two-user RLS workflow.

## Recommended Phase 20

Phase 20 should either:

1. harden the narrow WeekPlan local-first path with a small retry/visibility improvement based on the browser-validated cache behavior, or
2. perform a focused manual browser two-user validation pass if clean corporate CA configuration is available.

Do not start MealPlan or TrainingPlan local-first work until the WeekPlan local-first path is intentionally hardened or accepted as narrow-cache-only.