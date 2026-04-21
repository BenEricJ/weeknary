# Phase 13 Safe Generated-Draft Review And Activation

## Scope

Phase 13 adds a safe review and explicit activation path for generated WeekPlan drafts created by the Phase 12 orchestration flow.

The path remains:

```text
WeekView
-> useWeekPlanOrchestration
-> WeekPlanOrchestrationService
-> PlanningContextService + WeekPlanService
-> runtime-selected WeekPlan repository
```

This phase does not auto-activate drafts, add AI planning, merge user edits, change MealPlan or TrainingPlan persistence, or add new Supabase/IndexedDB infrastructure.

## Review Model

`GeneratedWeekPlanDraftReview` is an application-layer model. It is not persisted.

The review evaluates:

- current orchestration preview readiness
- latest generated WeekPlan draft for the same user and date range
- whether the draft still matches the deterministic generated preview
- whether activation would archive a currently active WeekPlan

Activation is blocked when:

- the orchestration preview is blocked
- no generated draft exists
- the generated draft is stale or manually changed relative to the current deterministic preview

Stale detection ignores entity id, version, and timestamps. It compares generated content: title, status, source, date range, generated events, and focus items.

## Activation Behavior

Activation is explicit and user-triggered.

When activation is allowed, `WeekPlanOrchestrationService.activateGeneratedWeekPlanDraft` delegates to `WeekPlanService.activateWeekPlan`.

That keeps the existing WeekPlan semantics:

- the generated draft becomes active
- other active WeekPlans for the same user are archived
- repository/runtime selection remains unchanged
- no active WeekPlan is modified during preview or review loading

## UI Integration

`WeekPlanOrchestrationPanel` now includes a compact generated-draft review section.

It shows:

- whether a generated draft exists
- whether the draft is activatable or blocked
- stale/missing warnings
- the activation effect
- an explicit `Activate generated draft` button

The activation button is disabled unless the application service reports `activatable`.

## Known Limitations

- Manual edits inside generated drafts are not preserved across regeneration.
- Stale generated drafts cannot be activated; users must update the generated draft first.
- No merge UI exists.
- No generated draft detail screen exists.
- No live Supabase/browser validation was performed in this phase.

## Recommended Phase 14 Scope

Phase 14 should either:

- add a generated draft detail/review screen before activation, or
- validate the full orchestration draft creation and activation flow against real remote WeekPlan, MealPlan, and TrainingPlan records.

Continue deferring AI planning, automatic activation, merge/conflict UI, Sleep/Review integration, and product-wide orchestration abstractions.
