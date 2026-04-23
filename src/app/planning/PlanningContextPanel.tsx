import type { PlanningContext } from "../../application";

export function PlanningContextPanel({
  status,
  context,
  error,
  onReload,
}: {
  status: string;
  context: PlanningContext | null;
  error?: string | null;
  onReload?: () => void;
}) {
  return (
    <section className="rounded-[18px] border border-[#DCE4DC] bg-[#F7F9F5] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A634A]">
            Planungsgrundlage
          </p>
          <p className="mt-1 text-[13px] font-bold text-gray-900">
            {context ? formatReadiness(context.readiness) : status}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {error ?? getDescription(context)}
          </p>
        </div>
        {onReload ? (
          <button
            type="button"
            onClick={onReload}
            className="rounded-[8px] bg-white px-3 py-2 text-[11px] font-bold text-gray-700"
          >
            Reload
          </button>
        ) : null}
      </div>

      {context ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <PlanChip label="Week" value={context.targetWeekPlan?.title ?? "Missing"} />
          <PlanChip label="Meals" value={context.mealPlan?.title ?? "Missing"} />
          <PlanChip
            label="Training"
            value={context.trainingPlan?.title ?? "Missing"}
          />
        </div>
      ) : null}
    </section>
  );
}

function PlanChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[12px] bg-white px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-1 truncate text-[11px] font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function formatReadiness(readiness: PlanningContext["readiness"]) {
  switch (readiness) {
    case "ready":
      return "Ready for orchestration";
    case "missing-target-week-plan":
      return "Missing active WeekPlan";
    case "missing-upstream-inputs":
      return "Missing upstream inputs";
    case "date-misaligned":
      return "Date ranges misaligned";
  }
}

function getDescription(context: PlanningContext | null) {
  if (!context) {
    return "Reading active WeekPlan, MealPlan, and TrainingPlan.";
  }

  if (context.missingInputs.length > 0) {
    return context.missingInputs.map((input) => input.reason).join(" ");
  }

  if (context.alignmentIssues.length > 0) {
    return context.alignmentIssues.map((issue) => issue.reason).join(" ");
  }

  return "All active planning inputs cover the target week.";
}
