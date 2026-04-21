# Phase 12 Controlled WeekPlan Orchestration Write Path

## Scope

Phase 12 adds the first explicit WeekPlan orchestration write path. It uses the Phase 11 planning context as readiness input, reads full MealPlan and TrainingPlan details only inside the application orchestration service, and saves only generated WeekPlan drafts.

The implemented path is:

```text
WeekView
-> useWeekPlanOrchestration
-> WeekPlanOrchestrationService
-> PlanningContextService + MealPlan/TrainingPlan readers + WeekPlanService
-> runtime-selected repositories
```

This phase does not auto-generate plans, overwrite the active WeekPlan, add AI planning, add cross-domain sync, or introduce a product-wide orchestration platform.

## Repository Assessment

Before this phase:

- `PlanningContextService` could read active WeekPlan, MealPlan, and TrainingPlan references and evaluate readiness.
- `WeekPlanService` already supported listing and saving plans through the runtime-selected repository path.
- WeekPlan already had draft, active, archived, generated source, local-first, and remote-backed behavior.
- MealPlan and TrainingPlan exposed active plan reads through their services and remote-capable runtimes.

Reuse decisions:

- The orchestration service depends on existing services/readers instead of repositories or infrastructure.
- Full MealPlan and TrainingPlan reads happen only when the planning context is ready.
- Saving goes through `WeekPlanService.saveWeekPlan`.
- The active WeekPlan remains protected; orchestration writes generated drafts only.

## Preview And Draft Policy

Preview generation is deterministic and conservative:

- Missing target WeekPlan blocks draft creation.
- Missing MealPlan or TrainingPlan blocks draft creation.
- Date misalignment blocks draft creation.
- Ready inputs produce all-day WeekPlan markers only.
- Meal slots become all-day `nutrition` events.
- Training workouts become all-day `training` events.
- Event IDs are deterministic from source type, date, and source item ID.
- Focus items remain empty in this phase.

Draft persistence policy:

- Generated drafts use `status: draft` and `source: generated`.
- Existing generated drafts are matched by user, date range, `draft` status, and `generated` source.
- If multiple generated drafts match, the most recently updated one is updated.
- If no generated draft matches, a new draft is created.
- The active WeekPlan is never updated by orchestration.

## UI Integration

`WeekPlanOrchestrationPanel` is rendered in `WeekView` below the read-only planning context panel.

It shows:

- target/source plan summary
- missing or misaligned input warnings
- proposed nutrition and training marker counts
- whether the action will create or update a generated draft
- one explicit user-triggered save button

The panel has no activation, merge, AI, repair, or background write behavior.

## Known Limitations

- No generated draft activation flow exists.
- No merge UI exists.
- No user-edit preservation policy exists for regenerated draft content.
- No timed scheduling is inferred from upstream plans.
- No orchestration conflict resolution exists beyond keeping the active WeekPlan separate.
- Live remote validation still depends on configured Supabase records for all three slices.

## Deferred Work

Phase 13 should either:

- add a draft review/activation flow that keeps generated and user-authored content safe, or
- validate the draft orchestration path against real remote WeekPlan, MealPlan, and TrainingPlan data before adding richer scheduling logic.

Continue deferring AI planning, automatic writes, background jobs, Sleep/Review integration, broad sync, and product-wide orchestration abstractions.
