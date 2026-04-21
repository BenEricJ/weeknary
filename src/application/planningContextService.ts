import type { DateRange, MealPlan, TrainingPlan, UserId, WeekPlan } from "../domain";

export interface PlanningContextUserIds {
  weekPlanUserId: UserId;
  mealPlanUserId: UserId;
  trainingPlanUserId: UserId;
  contextUserId?: UserId;
}

export type PlanningDomain = "weekPlan" | "mealPlan" | "trainingPlan";

export interface ActivePlanReference {
  domain: PlanningDomain;
  id: string;
  title: string;
  status: string;
  version: number;
  dateRange: DateRange;
  updatedAt: string;
}

export type PlanningReadiness =
  | "ready"
  | "missing-target-week-plan"
  | "missing-upstream-inputs"
  | "date-misaligned";

export interface MissingPlanningInput {
  domain: PlanningDomain;
  reason: string;
}

export interface PlanningAlignmentIssue {
  domain: "mealPlan" | "trainingPlan";
  planDateRange: DateRange;
  targetDateRange: DateRange;
  reason: string;
}

export interface PlanningContext {
  userId: UserId;
  readiness: PlanningReadiness;
  targetWeekPlan: ActivePlanReference | null;
  mealPlan: ActivePlanReference | null;
  trainingPlan: ActivePlanReference | null;
  missingInputs: MissingPlanningInput[];
  alignmentIssues: PlanningAlignmentIssue[];
  evaluatedAt: string;
}

export interface PlanningContextReaders {
  getActiveWeekPlan(userId: UserId): Promise<WeekPlan | null>;
  getActiveMealPlan(userId: UserId): Promise<MealPlan | null>;
  getActiveTrainingPlan(userId: UserId): Promise<TrainingPlan | null>;
}

export class PlanningContextService {
  constructor(
    private readonly readers: PlanningContextReaders,
    private readonly clock: () => string = () => new Date().toISOString(),
  ) {}

  async getPlanningContext(userIds: PlanningContextUserIds): Promise<PlanningContext> {
    const [weekPlan, mealPlan, trainingPlan] = await Promise.all([
      this.readers.getActiveWeekPlan(userIds.weekPlanUserId),
      this.readers.getActiveMealPlan(userIds.mealPlanUserId),
      this.readers.getActiveTrainingPlan(userIds.trainingPlanUserId),
    ]);

    const targetWeekPlan = weekPlan ? toReference("weekPlan", weekPlan) : null;
    const mealPlanReference = mealPlan ? toReference("mealPlan", mealPlan) : null;
    const trainingPlanReference = trainingPlan
      ? toReference("trainingPlan", trainingPlan)
      : null;
    const missingInputs = getMissingInputs(targetWeekPlan, mealPlanReference, trainingPlanReference);
    const alignmentIssues = targetWeekPlan
      ? [
          ...getAlignmentIssue("mealPlan", targetWeekPlan.dateRange, mealPlanReference?.dateRange),
          ...getAlignmentIssue(
            "trainingPlan",
            targetWeekPlan.dateRange,
            trainingPlanReference?.dateRange,
          ),
        ]
      : [];

    return {
      userId: userIds.contextUserId ?? userIds.weekPlanUserId,
      readiness: getReadiness(targetWeekPlan, missingInputs, alignmentIssues),
      targetWeekPlan,
      mealPlan: mealPlanReference,
      trainingPlan: trainingPlanReference,
      missingInputs,
      alignmentIssues,
      evaluatedAt: this.clock(),
    };
  }
}

function toReference(domain: PlanningDomain, plan: WeekPlan | MealPlan | TrainingPlan): ActivePlanReference {
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

function getMissingInputs(
  weekPlan: ActivePlanReference | null,
  mealPlan: ActivePlanReference | null,
  trainingPlan: ActivePlanReference | null,
) {
  const missingInputs: MissingPlanningInput[] = [];

  if (!weekPlan) {
    missingInputs.push({ domain: "weekPlan", reason: "No active WeekPlan exists." });
  }

  if (!mealPlan) {
    missingInputs.push({ domain: "mealPlan", reason: "No active MealPlan exists." });
  }

  if (!trainingPlan) {
    missingInputs.push({
      domain: "trainingPlan",
      reason: "No active TrainingPlan exists.",
    });
  }

  return missingInputs;
}

function getAlignmentIssue(
  domain: "mealPlan" | "trainingPlan",
  targetDateRange: DateRange,
  planDateRange?: DateRange,
): PlanningAlignmentIssue[] {
  if (!planDateRange) {
    return [];
  }

  if (
    planDateRange.startDate <= targetDateRange.startDate &&
    planDateRange.endDate >= targetDateRange.endDate
  ) {
    return [];
  }

  return [
    {
      domain,
      planDateRange,
      targetDateRange,
      reason: `${domain} does not cover the active WeekPlan date range.`,
    },
  ];
}

function getReadiness(
  weekPlan: ActivePlanReference | null,
  missingInputs: MissingPlanningInput[],
  alignmentIssues: PlanningAlignmentIssue[],
): PlanningReadiness {
  if (!weekPlan) {
    return "missing-target-week-plan";
  }

  if (missingInputs.some((input) => input.domain !== "weekPlan")) {
    return "missing-upstream-inputs";
  }

  if (alignmentIssues.length > 0) {
    return "date-misaligned";
  }

  return "ready";
}
