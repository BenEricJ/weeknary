# Phase 21 Trusted Live Validation Enablement And Secret Hygiene Completion

## Purpose

Phase 21 completes operational hardening around trusted live Supabase validation and secret hygiene. It does not change WeekPlan local-first runtime behavior, MealPlan behavior, TrainingPlan behavior, orchestration, UI, sync queues, conflict handling, or offline scope.

The active workspace remains:

```text
C:\Users\JoachiE\Weeknary_phase19_local_20260420_1405
```

## Trusted Live Validation Changes

Live validation configuration is centralized in `scripts/live-validation-config.mjs`.

The helper owns:

- `.env`, `.env.local`, and process environment loading,
- required live validation key names,
- rejection of `NODE_TLS_REJECT_UNAUTHORIZED=0`,
- `NODE_EXTRA_CA_CERTS` checks for missing path, missing file, directory path, unreadable file, and invalid PEM certificate boundaries,
- short remediation output for PowerShell, Windows Command Prompt, and Git Bash.

`scripts/validate-live-trust-prereqs.mjs` now prints deterministic non-secret failure codes before the live script runs. `scripts/validate-phase16-live.mjs` reuses the same helper and reports when the CA file is present but live TLS still fails.

The supported commands are:

```bash
npm run validate:phase20:live:trusted
npm run validate:phase21:live:trusted
```

The Phase 21 command is an alias. The Phase 20 command remains the acceptance path for continuity.

## CA Setup Workflow

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

The CA file must be provided externally by the developer or corporate environment. Do not commit certificates, internal hostnames, real Supabase credentials, database passwords, or test-user passwords.

## Secret Hygiene

`.env.example` remains placeholder-only. `.gitignore` keeps `.env` and `.env.*` ignored except `.env.example`.

Historical documentation was sanitized where needed:

- a real Supabase project reference in the Phase 17 validation results was replaced with a placeholder,
- the old insecure TLS bypass command example was removed,
- current docs keep only prohibition and trusted `NODE_EXTRA_CA_CERTS` remediation guidance.

If any real values were previously exposed outside `.env.local`, rotate them outside this repository change.

## Runtime Behavior

No runtime behavior changed in Phase 21.

- WeekPlan remains narrow local-first with IndexedDB metadata and manual retry from Phase 20.
- MealPlan remains remote-only in signed-in mode.
- TrainingPlan remains remote-only in signed-in mode.
- No queues, conflict resolver, background sync, or product-wide offline platform were added.

## Validation Notes

Validation should distinguish:

- build/typecheck validation,
- browser validation,
- deterministic trusted preflight validation,
- actual CA-backed live Supabase validation.

CA-backed live Supabase success must not be claimed unless `npm run validate:phase20:live:trusted` runs with a real corporate CA file and valid live credentials.

Actually run during Phase 21 implementation:

- `npm run validate:workspace`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed with the existing non-blocking Rollup `minify` and chunk-size warnings.
- `npm run validate:phase15`: passed.
- `npm run validate:phase19:browser`: passed, including WeekPlan remote-confirmation metadata and unchanged MealPlan/TrainingPlan remote-only saves.
- `npm run validate:phase20:live:trusted` with no `NODE_EXTRA_CA_CERTS`: failed deterministically with `MISSING_CA_PATH`.
- `npm run validate:phase20:live:trusted` with a nonexistent CA path: failed deterministically with `MISSING_CA_FILE`.
- `npm run validate:phase20:live:trusted` with a temporary non-PEM file: failed deterministically with `INVALID_CA_FORMAT`.
- `npm run validate:phase21:live:trusted`: routed to the Phase 20 trusted command and failed deterministically with `MISSING_CA_PATH` when no CA was set.

CA-backed live Supabase validation was not run to success because no corporate CA file was available in the shell. This is an external environment blocker, not a claimed code pass.

## Deferred

Still deferred:

- broader offline sync,
- WeekPlan conflict handling,
- MealPlan local-first persistence,
- TrainingPlan local-first persistence,
- background retry workers,
- product-wide offline infrastructure.
