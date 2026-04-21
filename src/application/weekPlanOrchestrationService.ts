import type {
  ActivePlanReference,
  PlanningContext,
  PlanningContextService,
  PlanningContextUserIds,
} from "./planningContextService";
import type { ClockPort, WeekPlanService } from "./weekPlanService";
import type {
  DateRange,
  EntityId,
  ISODateString,
  MealPlan,
  MealSlot,
  TrainingPlan,
  TrainingWorkout,
  UserId,
  WeekPlan,
  WeekPlanEvent,
} from "../domain";

export type WeekPlanOrchestrationStatus = "blocked" | "ready";
export type WeekPlanOrchestrationDraftAction =
  | "blocked"
  | "create"
  | "update";

export type WeekPlanOrchestrationWarningCode =
  | "missing-target-week-plan"
  | "missing-upstream-inputs"
  | "date-misaligned"
  | "upstream-plan-unavailable"
  | "active-week-plan-protected";

export interface WeekPlanOrchestrationWarning {
  code: WeekPlanOrchestrationWarningCode;
  message: string;
  domain?: "weekPlan" | "mealPlan" | "trainingPlan";
}

export interface WeekPlanOrchestrationChangeSummary {
  action: WeekPlanOrchestrationDraftAction;
  nutritionEventCount: number;
  trainingEventCount: number;
  totalEventCount: number;
  existingDraftId?: EntityId;
}

export interface WeekPlanOrchestrationPreview {
  status: WeekPlanOrchestrationStatus;
  userId: UserId;
  planningContext: PlanningContext;
  targetDateRange: DateRange | null;
  sourcePlans: {
    weekPlan: ActivePlanReference | null;
    mealPlan: ActivePlanReference | null;
    trainingPlan: ActivePlanReference | null;
  };
  warnings: WeekPlanOrchestrationWarning[];
  changeSummary: WeekPlanOrchestrationChangeSummary;
  draftCandidate: WeekPlan | null;
  existingDraft: ActivePlanReference | null;
  generatedAt: string;
}

export type WeekPlanOrchestrationActionResult =
  | {
      status: "saved";
      action: Exclude<WeekPlanOrchestrationDraftAction, "blocked">;
      plan: WeekPlan;
      preview: WeekPlanOrchestrationPreview;
    }
  | {
      status: "blocked";
      message: string;
      preview: WeekPlanOrchestrationPreview;
    };

export type WeekPlanActivationReadiness = "activatable" | "blocked";

export type WeekPlanActivationWarningCode =
  | "preview-blocked"
  | "no-generated-draft"
  | "stale-generated-draft"
  | "active-week-plan-will-be-archived";

export interface WeekPlanActivationWarning {
  code: WeekPlanActivationWarningCode;
  message: string;
}

export interface GeneratedWeekPlanDraftReview {
  readiness: WeekPlanActivationReadiness;
  userId: UserId;
  preview: WeekPlanOrchestrationPreview;
  generatedDraft: ActivePlanReference | null;
  warnings: WeekPlanActivationWarning[];
  activationSummary: {
    action: "activate-generated-draft" | "blocked";
    draftId?: EntityId;
    activeWeekPlanId?: EntityId;
    willArchiveActiveWeekPlan: boolean;
  };
  reviewedAt: string;
}

export type WeekPlanActivationResult =
  | {
      status: "activated";
      plan: WeekPlan;
      review: GeneratedWeekPlanDraftReview;
    }
  | {
      status: "blocked";
      message: string;
      review: GeneratedWeekPlanDraftReview;
    };

export interface WeekPlanOrchestrationReaders {
  getActiveMealPlan(userId: UserId): Promise<MealPlan | null>;
  getActiveTrainingPlan(userId: UserId): Promise<TrainingPlan | null>;
}

export interface WeekPlanOrchestrationDependencies
  extends WeekPlanOrchestrationReaders {
  planningContextService: PlanningContextService;
  weekPlanService: WeekPlanService;
  clock?: ClockPort;
  idFactory?: () => EntityId;
}

export class WeekPlanOrchestrationService {
  private readonly clock: ClockPort;
  private readonly idFactory: () => EntityId;

  constructor(private readonly dependencies: WeekPlanOrchestrationDependencies) {
    this.clock = dependencies.clock ?? (() => new Date().toISOString());
    this.idFactory = dependencies.idFactory ?? createUuid;
  }

  async getWeekPlanOrchestrationPreview(
    userIds: PlanningContextUserIds,
  ): Promise<WeekPlanOrchestrationPreview> {
    const planningContext =
      await this.dependencies.planningContextService.getPlanningContext(userIds);
    const basePreview = this.createBasePreview(planningContext);

    if (planningContext.readiness !== "ready") {
      return {
        ...basePreview,
        status: "blocked",
        warnings: getContextWarnings(planningContext),
      };
    }

    const [mealPlan, trainingPlan, weekPlans] = await Promise.all([
      this.dependencies.getActiveMealPlan(userIds.mealPlanUserId),
      this.dependencies.getActiveTrainingPlan(userIds.trainingPlanUserId),
      this.dependencies.weekPlanService.listWeekPlans(userIds.weekPlanUserId),
    ]);

    if (!mealPlan || !trainingPlan || !planningContext.targetWeekPlan) {
      return {
        ...basePreview,
        status: "blocked",
        warnings: [
          ...getContextWarnings(planningContext),
          {
            code: "upstream-plan-unavailable",
            message:
              "Planning inputs changed before orchestration could read full source plans.",
          },
        ],
      };
    }

    const existingDraft = findExistingGeneratedDraft(
      weekPlans,
      userIds.weekPlanUserId,
      planningContext.targetWeekPlan.dateRange,
    );
    const draftCandidate = this.buildDraftCandidate({
      userId: userIds.weekPlanUserId,
      targetWeekPlan: planningContext.targetWeekPlan,
      mealPlan,
      trainingPlan,
      existingDraft,
    });
    const changeSummary = summarizeDraft(
      existingDraft ? "update" : "create",
      draftCandidate.events,
      existingDraft?.id,
    );

    return {
      ...basePreview,
      status: "ready",
      warnings: [
        {
          code: "active-week-plan-protected",
          domain: "weekPlan",
          message:
            "The active WeekPlan is protected; orchestration will save a generated draft only.",
        },
      ],
      changeSummary,
      draftCandidate,
      existingDraft: existingDraft
        ? toActivePlanReference("weekPlan", existingDraft)
        : null,
    };
  }

  async saveOrchestratedWeekPlanDraft(
    userIds: PlanningContextUserIds,
  ): Promise<WeekPlanOrchestrationActionResult> {
    const preview = await this.getWeekPlanOrchestrationPreview(userIds);

    if (!preview.draftCandidate || preview.changeSummary.action === "blocked") {
      return {
        status: "blocked",
        message: "WeekPlan orchestration draft cannot be saved yet.",
        preview,
      };
    }

    const savedPlan = await this.dependencies.weekPlanService.saveWeekPlan(
      preview.draftCandidate,
    );

    return {
      status: "saved",
      action: preview.changeSummary.action,
      plan: savedPlan,
      preview,
    };
  }

  async getGeneratedWeekPlanDraftReview(
    userIds: PlanningContextUserIds,
  ): Promise<GeneratedWeekPlanDraftReview> {
    const preview = await this.getWeekPlanOrchestrationPreview(userIds);
    const baseReview = this.createBaseReview(preview);

    if (preview.status !== "ready" || !preview.draftCandidate) {
      return {
        ...baseReview,
        warnings: [
          {
            code: "preview-blocked",
            message:
              "Generated draft activation is blocked until the orchestration preview is ready.",
          },
        ],
      };
    }

    const weekPlans = await this.dependencies.weekPlanService.listWeekPlans(
      userIds.weekPlanUserId,
    );
    const generatedDraft = findExistingGeneratedDraft(
      weekPlans,
      userIds.weekPlanUserId,
      preview.draftCandidate.dateRange,
    );

    if (!generatedDraft) {
      return {
        ...baseReview,
        warnings: [
          {
            code: "no-generated-draft",
            message:
              "Create or update an orchestrated WeekPlan draft before activation.",
          },
        ],
      };
    }

    const activeWeekPlan = weekPlans.find(
      (plan) =>
        plan.userId === userIds.weekPlanUserId && plan.status === "active",
    );
    const freshnessMatches = generatedDraftMatchesPreview(
      generatedDraft,
      preview.draftCandidate,
    );
    const generatedDraftReference = toActivePlanReference(
      "weekPlan",
      generatedDraft,
    );

    if (!freshnessMatches) {
      return {
        ...baseReview,
        generatedDraft: generatedDraftReference,
        warnings: [
          {
            code: "stale-generated-draft",
            message:
              "The generated draft no longer matches the current deterministic preview. Update the draft before activation.",
          },
        ],
        activationSummary: {
          action: "blocked",
          draftId: generatedDraft.id,
          activeWeekPlanId: activeWeekPlan?.id,
          willArchiveActiveWeekPlan: false,
        },
      };
    }

    return {
      ...baseReview,
      readiness: "activatable",
      generatedDraft: generatedDraftReference,
      warnings: activeWeekPlan
        ? [
            {
              code: "active-week-plan-will-be-archived",
              message:
                "Activating the generated draft will archive the current active WeekPlan through WeekPlanService.",
            },
          ]
        : [],
      activationSummary: {
        action: "activate-generated-draft",
        draftId: generatedDraft.id,
        activeWeekPlanId: activeWeekPlan?.id,
        willArchiveActiveWeekPlan: Boolean(activeWeekPlan),
      },
    };
  }

  async activateGeneratedWeekPlanDraft(
    userIds: PlanningContextUserIds,
  ): Promise<WeekPlanActivationResult> {
    const review = await this.getGeneratedWeekPlanDraftReview(userIds);

    if (
      review.readiness !== "activatable" ||
      !review.activationSummary.draftId
    ) {
      return {
        status: "blocked",
        message: "Generated WeekPlan draft cannot be activated yet.",
        review,
      };
    }

    const activatedPlan =
      await this.dependencies.weekPlanService.activateWeekPlan(
        userIds.weekPlanUserId,
        review.activationSummary.draftId,
      );

    return {
      status: "activated",
      plan: activatedPlan,
      review,
    };
  }

  private createBasePreview(
    planningContext: PlanningContext,
  ): WeekPlanOrchestrationPreview {
    return {
      status: "blocked",
      userId: planningContext.userId,
      planningContext,
      targetDateRange: planningContext.targetWeekPlan?.dateRange ?? null,
      sourcePlans: {
        weekPlan: planningContext.targetWeekPlan,
        mealPlan: planningContext.mealPlan,
        trainingPlan: planningContext.trainingPlan,
      },
      warnings: [],
      changeSummary: summarizeDraft("blocked", []),
      draftCandidate: null,
      existingDraft: null,
      generatedAt: this.clock(),
    };
  }

  private createBaseReview(
    preview: WeekPlanOrchestrationPreview,
  ): GeneratedWeekPlanDraftReview {
    return {
      readiness: "blocked",
      userId: preview.userId,
      preview,
      generatedDraft: null,
      warnings: [],
      activationSummary: {
        action: "blocked",
        willArchiveActiveWeekPlan: false,
      },
      reviewedAt: this.clock(),
    };
  }

  private buildDraftCandidate({
    userId,
    targetWeekPlan,
    mealPlan,
    trainingPlan,
    existingDraft,
  }: {
    userId: UserId;
    targetWeekPlan: ActivePlanReference;
    mealPlan: MealPlan;
    trainingPlan: TrainingPlan;
    existingDraft: WeekPlan | null;
  }): WeekPlan {
    const now = this.clock();
    const events = [
      ...buildMealEvents(mealPlan, targetWeekPlan.dateRange),
      ...buildTrainingEvents(trainingPlan, targetWeekPlan.dateRange),
    ].sort(compareEvents);

    return {
      id: existingDraft?.id ?? this.idFactory(),
      userId,
      title: `Orchestrated Draft: ${targetWeekPlan.title}`,
      dateRange: { ...targetWeekPlan.dateRange },
      status: "draft",
      source: "generated",
      createdAt: existingDraft?.createdAt ?? now,
      updatedAt: existingDraft?.updatedAt ?? now,
      version: existingDraft?.version ?? 0,
      events,
      focusItems: [],
    };
  }
}

function getContextWarnings(
  planningContext: PlanningContext,
): WeekPlanOrchestrationWarning[] {
  const warnings: WeekPlanOrchestrationWarning[] = [];

  if (planningContext.readiness === "missing-target-week-plan") {
    warnings.push({
      code: "missing-target-week-plan",
      domain: "weekPlan",
      message: "No active WeekPlan exists as orchestration target.",
    });
  }

  planningContext.missingInputs.forEach((input) => {
    if (input.domain === "weekPlan") {
      return;
    }

    warnings.push({
      code: "missing-upstream-inputs",
      domain: input.domain,
      message: `${formatDomain(input.domain)} is missing an active plan.`,
    });
  });

  planningContext.alignmentIssues.forEach((issue) => {
    warnings.push({
      code: "date-misaligned",
      domain: issue.domain,
      message: `${formatDomain(issue.domain)} ${issue.planDateRange.startDate} to ${issue.planDateRange.endDate} does not cover WeekPlan ${issue.targetDateRange.startDate} to ${issue.targetDateRange.endDate}.`,
    });
  });

  return warnings;
}

function findExistingGeneratedDraft(
  plans: WeekPlan[],
  userId: UserId,
  dateRange: DateRange,
) {
  return (
    plans
      .filter(
        (plan) =>
          plan.userId === userId &&
          plan.status === "draft" &&
          plan.source === "generated" &&
          plan.dateRange.startDate === dateRange.startDate &&
          plan.dateRange.endDate === dateRange.endDate,
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ??
    null
  );
}

function buildMealEvents(
  mealPlan: MealPlan,
  targetRange: DateRange,
): WeekPlanEvent[] {
  const recipeById = new Map(
    mealPlan.recipes.map((recipe) => [recipe.id, recipe]),
  );

  return mealPlan.days
    .filter((day) => isWithinDateRange(day.date, targetRange))
    .flatMap((day) =>
      day.meals.map((slot) => mealSlotToWeekPlanEvent(day.date, slot, recipeById)),
    );
}

function mealSlotToWeekPlanEvent(
  date: ISODateString,
  slot: MealSlot,
  recipeById: Map<EntityId, { name: string }>,
): WeekPlanEvent {
  const recipeName = slot.recipeId ? recipeById.get(slot.recipeId)?.name : null;
  const title =
    recipeName ?? slot.title ?? (slot.external ? "External meal" : "Meal");

  return {
    id: deterministicEventId("meal", date, slot.id),
    title: `Meal: ${title}`,
    date,
    allDay: true,
    category: "nutrition",
    linkedMealSlotId: slot.id,
    notes: `${formatMealSlot(slot.slotType)} from MealPlan.`,
  };
}

function buildTrainingEvents(
  trainingPlan: TrainingPlan,
  targetRange: DateRange,
): WeekPlanEvent[] {
  return trainingPlan.days
    .filter((day) => isWithinDateRange(day.date, targetRange))
    .flatMap((day) =>
      day.workouts.map((workout) =>
        trainingWorkoutToWeekPlanEvent(day.date, workout),
      ),
    );
}

function trainingWorkoutToWeekPlanEvent(
  date: ISODateString,
  workout: TrainingWorkout,
): WeekPlanEvent {
  return {
    id: deterministicEventId("training", date, workout.id),
    title: `Training: ${workout.title}`,
    date,
    allDay: true,
    category: "training",
    linkedTrainingWorkoutId: workout.referenceWorkoutId ?? workout.id,
    notes: workout.target ?? workout.notes,
  };
}

function summarizeDraft(
  action: WeekPlanOrchestrationDraftAction,
  events: WeekPlanEvent[],
  existingDraftId?: EntityId,
): WeekPlanOrchestrationChangeSummary {
  const nutritionEventCount = events.filter(
    (event) => event.category === "nutrition",
  ).length;
  const trainingEventCount = events.filter(
    (event) => event.category === "training",
  ).length;

  return {
    action,
    nutritionEventCount,
    trainingEventCount,
    totalEventCount: events.length,
    existingDraftId,
  };
}

function toActivePlanReference(
  domain: "weekPlan",
  plan: WeekPlan,
): ActivePlanReference {
  return {
    domain,
    id: plan.id,
    title: plan.title,
    status: plan.status,
    version: plan.version,
    dateRange: { ...plan.dateRange },
    updatedAt: plan.updatedAt,
  };
}

function generatedDraftMatchesPreview(
  generatedDraft: WeekPlan,
  draftCandidate: WeekPlan,
) {
  return (
    JSON.stringify(toGeneratedDraftComparable(generatedDraft)) ===
    JSON.stringify(toGeneratedDraftComparable(draftCandidate))
  );
}

function toGeneratedDraftComparable(plan: WeekPlan) {
  return {
    title: plan.title,
    dateRange: {
      startDate: plan.dateRange.startDate,
      endDate: plan.dateRange.endDate,
    },
    status: plan.status,
    source: plan.source,
    events: [...plan.events].sort(compareEvents).map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      allDay: event.allDay,
      category: event.category,
      linkedTrainingWorkoutId: event.linkedTrainingWorkoutId,
      linkedMealSlotId: event.linkedMealSlotId,
      notes: event.notes,
      taskIds: event.taskIds,
      tasks: event.tasks,
    })),
    focusItems: [...plan.focusItems].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
  };
}

function compareEvents(left: WeekPlanEvent, right: WeekPlanEvent) {
  if (left.date !== right.date) {
    return left.date.localeCompare(right.date);
  }

  if (left.category !== right.category) {
    return left.category.localeCompare(right.category);
  }

  if (left.title !== right.title) {
    return left.title.localeCompare(right.title);
  }

  return left.id.localeCompare(right.id);
}

function isWithinDateRange(date: ISODateString, range: DateRange) {
  return date >= range.startDate && date <= range.endDate;
}

function deterministicEventId(
  source: "meal" | "training",
  date: ISODateString,
  sourceId: EntityId,
) {
  return `generated:${source}:${date}:${sourceId}`;
}

function formatMealSlot(slotType: MealSlot["slotType"]) {
  return slotType.charAt(0).toUpperCase() + slotType.slice(1);
}

function formatDomain(domain: "weekPlan" | "mealPlan" | "trainingPlan") {
  switch (domain) {
    case "weekPlan":
      return "WeekPlan";
    case "mealPlan":
      return "MealPlan";
    case "trainingPlan":
      return "TrainingPlan";
  }
}

function createUuid() {
  return `generated-week-plan-draft-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}
