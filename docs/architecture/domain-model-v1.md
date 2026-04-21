# Domain Model V1

The v1 model defines stable names and ownership rules for the first universal architecture. It is intentionally minimal and should be expanded by vertical slices.

## Common Fields

Use these fields where applicable:

- `id`: stable entity identifier.
- `userId`: authenticated owner. Remote records must be protected by Supabase RLS.
- `createdAt`: first persistence timestamp, immutable.
- `updatedAt`: latest accepted mutation timestamp.
- `version`: monotonically incremented on accepted writes for conflict detection.
- `source`: origin of the entity or latest major content source: `user`, `import`, `generated`, or `system`.
- `deletedAt`: optional soft-delete timestamp for syncable records.

Plan-like entities also use:

- `status`: `draft`, `active`, or `archived`.
- `dateRange`: inclusive start and end dates.

## Entities

| Entity | Purpose | Ownership | Storage | Drafts | Editable |
| --- | --- | --- | --- | --- | --- |
| `Profile` | User identity and base health/profile context. Core fields: display name, avatar URL, birth year, height, weight, activity level. | One profile per auth user. | Remote plus local cache. | No. | Web and mobile. |
| `UserPreferences` | Planning defaults and constraints. Core fields: diet type, allergies, budget, meal prep, units, locale, notification preferences. | Belongs to one user. | Remote plus local cache. | No. | Web and mobile. |
| `TrainingPlan` | Planned workouts and training blocks. Core fields: title, date range, days, workouts, goals, status. | User-owned. | Remote plus local cache. | Yes. | Web and mobile. |
| `MealPlan` | Meals, recipes, targets, shopping guidance. Core fields: title, date range, days, recipes, targets, shopping list, status. | User-owned. | Remote plus local cache. | Yes. | Web and mobile. |
| `WeekPlan` | Calendar-like schedule and cross-domain plan view. Core fields: title, date range, events, focus items, status. | User-owned. | Remote plus local cache. | Yes. | Web and mobile. |
| `SleepEntry` | Logged or imported sleep record. Core fields: date, start/end time, duration, quality score, source. | User-owned. | Remote plus local cache. | No draft; imports may be pending until accepted. | Mobile primary; web can review and edit notes. |
| `ReviewEntry` | Daily or weekly reflection and scores. Core fields: period, scores, wins, problems, notes, linked plan IDs. | User-owned. | Remote plus local cache. | Yes. | Web and mobile. |
| `Insight` | Generated or computed recommendation. Core fields: scope, kind, message, evidence references, confidence, generator, expiry. | User-owned. | Remote plus local cache. | No. | Read and dismiss on web and mobile. |
| `PendingMutation` | Future offline/sync queue item. Core fields: entity type, entity ID, operation, payload, base version, attempts, status, error. | Local per user and device. | Local only initially. | No. | System only. |

## Plan Lifecycle

- `draft`: editable and not used as the daily active guidance source.
- `active`: current guidance source. By default, allow only one active plan per user, domain, and overlapping date range.
- `archived`: read-only historical record. It can be copied into a new draft but should not be edited directly.

## Notes For Current Code

- Existing static plan modules are useful source material but are not the canonical domain model.
- UI-specific fields such as icon components, Tailwind classes, drawer state, and display labels should not move into domain packages.
- Large static nutrition/training fixtures should become seed/reference data or repository fixtures before becoming user-owned records.
- Phase 7 adds `TrainingWorkout.referenceWorkoutId` as an optional reference to legacy workout-library data. This keeps workout images, icons, copy, kcal/protein display hints, and other UI metadata at the app boundary while allowing domain workouts to retain their seed/library identity.
- Phase 8 validates the existing `MealPlan` model for the current nutrition UI. Rich nutrition review rows, budget details, pantry/bulk pricing, external guidance copy, micronutrient displays, and shopping checklist UI state remain legacy/reference metadata at the app boundary.
- Phase 9 persists the current `MealPlan` domain body remotely in a user-owned Supabase `meal_plans` row with first-class metadata columns and a schema-versioned JSONB payload. Rich nutrition display/reference metadata and the shopping checklist UI state remain outside canonical remote persistence.
- Phase 10 persists the current `TrainingPlan` domain body remotely in a user-owned Supabase `training_plans` row with first-class metadata columns and a schema-versioned JSONB payload. Workout library/display metadata and static progress widgets remain legacy/reference metadata at the app boundary.
- Phase 11 introduces `PlanningContext` as a read-only application-layer orchestration input snapshot. It is not a persisted domain entity and does not merge WeekPlan, MealPlan, and TrainingPlan into one canonical model.
- Phase 12 introduces WeekPlan orchestration preview/action models as application-layer coordination models. They are not persisted domain entities; only the resulting generated `WeekPlan` draft is saved through the existing WeekPlan service and repository path.
- Phase 13 introduces generated-draft review and activation models as application-layer orchestration models. They are not persisted domain entities; activation still uses the existing `WeekPlan` lifecycle and `WeekPlanService.activateWeekPlan`.
- Phase 14 reconstructs the material TypeScript domain entrypoint from the recovered workspace state. The restored model is intentionally minimal and supports the demo-local WeekPlan, MealPlan, TrainingPlan, PlanningContext, and orchestration paths. Remote persistence and IndexedDB-specific metadata are deferred until their infrastructure files are safely recovered or rebuilt.
- Phase 15 reconstructs remote persistence for WeekPlan, MealPlan, and TrainingPlan as user-owned Supabase tables with first-class plan metadata and schema-versioned JSONB payloads. The domain model remains unchanged; repository adapters own row/payload mapping. IndexedDB/local-first metadata and sync/conflict records remain outside this restored remote foundation.
- Phase 16 adds live remote validation support around the existing model. The runtime-panel seed/archive actions and validation scripts are operational affordances; they do not add persisted domain entities or change the plan model.
- Phase 17 live validation confirms the remote persistence baseline for WeekPlan, MealPlan, and TrainingPlan uses UUID row IDs, owner-only RLS, first-class `source` metadata, and schema-versioned JSONB payload bodies. The domain model remains unchanged; the repository and validation adapters own REST/PostgREST compatibility handling.
- Phase 18 restores a narrow WeekPlan local-first repository adapter. It caches `WeekPlan` records in IndexedDB and composes over the existing Supabase repository in signed-in remote mode. The `WeekPlan` domain model and service contract remain unchanged. MealPlan and TrainingPlan remain remote-only.
