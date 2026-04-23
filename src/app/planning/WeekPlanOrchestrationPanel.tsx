import type {
  GeneratedWeekPlanDraftReview,
  WeekPlanOrchestrationChangeSummary,
  WeekPlanOrchestrationWarning,
} from "../../application";
import type { WeekPlanOrchestrationState } from "./useWeekPlanOrchestration";

export function WeekPlanOrchestrationPanel({
  orchestration,
  onDraftSaved,
  onDraftActivated,
}: {
  orchestration: WeekPlanOrchestrationState;
  onDraftSaved?: () => void;
  onDraftActivated?: () => void;
}) {
  const preview = orchestration.preview;
  const review = orchestration.review;
  const canSave =
    orchestration.status === "ready" &&
    preview?.status === "ready" &&
    Boolean(preview.draftCandidate);
  const canActivate =
    orchestration.status === "ready" &&
    review?.readiness === "activatable" &&
    Boolean(review.activationSummary.draftId);

  const saveDraft = async () => {
    const result = await orchestration.saveDraft();

    if (result?.status === "saved") {
      onDraftSaved?.();
    }
  };
  const activateDraft = async () => {
    const result = await orchestration.activateDraft();

    if (result?.status === "activated") {
      onDraftActivated?.();
    }
  };

  return (
    <section className="rounded-[18px] border border-[#E5E0D4] bg-white/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A6A42]">
            Wochenplan-Entwurf
          </p>
          <p className="mt-1 text-[13px] font-bold text-gray-900">
            {getStatusLabel(orchestration)}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {getStatusDescription(orchestration)}
          </p>
        </div>

        {orchestration.status === "error" ||
        orchestration.status === "unavailable" ? (
          <button
            type="button"
            onClick={() => void orchestration.reload()}
            className="rounded-[8px] bg-[#F5F4EF] px-3 py-2 text-[11px] font-bold text-gray-700 transition-colors hover:bg-[#ECEAE2]"
          >
            Retry
          </button>
        ) : null}
      </div>

      {preview ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <PreviewMetric
              label="Meals"
              value={preview.sourcePlans.mealPlan?.title ?? "Missing"}
            />
            <PreviewMetric
              label="Training"
              value={preview.sourcePlans.trainingPlan?.title ?? "Missing"}
            />
            <PreviewMetric
              label="Target"
              value={
                preview.targetDateRange
                  ? `${preview.targetDateRange.startDate} to ${preview.targetDateRange.endDate}`
                  : "Missing"
              }
            />
          </div>

          <ChangeSummary summary={preview.changeSummary} />

          {preview.warnings.length > 0 ? (
            <div className="rounded-[12px] bg-[#FFF7EC] px-3 py-2">
              <p className="text-[11px] font-bold text-[#9A632F]">
                Warnings
              </p>
              <div className="mt-1 space-y-1">
                {preview.warnings.map((warning, index) => (
                  <WarningLine key={`${warning.code}-${index}`} warning={warning} />
                ))}
              </div>
            </div>
          ) : null}

          {preview.draftCandidate ? (
            <div className="rounded-[12px] bg-[#F7F6F1] px-3 py-2">
              <p className="text-[11px] font-bold text-gray-800">
                Draft preview
              </p>
              <p className="mt-1 text-[11px] leading-snug text-gray-500">
                {preview.draftCandidate.title} with{" "}
                {preview.changeSummary.totalEventCount} all-day generated
                markers.
              </p>
            </div>
          ) : null}

          {canSave ? (
            <button
              type="button"
              disabled={orchestration.isSaving}
              onClick={() => void saveDraft()}
              className="w-full rounded-[8px] bg-[#6A816A] px-3 py-2 text-[12px] font-bold text-white disabled:opacity-50"
            >
              {preview.changeSummary.action === "update"
                ? "Update orchestrated draft"
                : "Create orchestrated draft"}
            </button>
          ) : null}

          {review ? <DraftReview review={review} /> : null}

          {review ? (
            <button
              type="button"
              disabled={!canActivate || orchestration.isActivating}
              onClick={() => void activateDraft()}
              className="w-full rounded-[8px] border border-[#6A816A] bg-white px-3 py-2 text-[12px] font-bold text-[#4A634A] disabled:opacity-50"
            >
              Activate generated draft
            </button>
          ) : null}
        </div>
      ) : null}

      {orchestration.message || orchestration.error ? (
        <p className="mt-3 text-[11px] leading-snug text-gray-500">
          {orchestration.message ?? orchestration.error}
        </p>
      ) : null}
    </section>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[12px] bg-[#F7F6F1] px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-1 truncate text-[11px] font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ChangeSummary({
  summary,
}: {
  summary: WeekPlanOrchestrationChangeSummary;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <PreviewMetric label="Action" value={formatAction(summary.action)} />
      <PreviewMetric
        label="Nutrition"
        value={`${summary.nutritionEventCount} markers`}
      />
      <PreviewMetric
        label="Training"
        value={`${summary.trainingEventCount} markers`}
      />
    </div>
  );
}

function WarningLine({
  warning,
}: {
  warning: WeekPlanOrchestrationWarning;
}) {
  return (
    <p className="text-[11px] leading-snug text-[#9A632F]">
      {warning.message}
    </p>
  );
}

function DraftReview({ review }: { review: GeneratedWeekPlanDraftReview }) {
  return (
    <div className="rounded-[12px] bg-[#F7F6F1] px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-gray-800">
            Generated draft review
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {getReviewDescription(review)}
          </p>
        </div>
        <span className="shrink-0 rounded-[8px] bg-white px-2 py-1 text-[10px] font-bold text-gray-600">
          {review.readiness === "activatable" ? "Activatable" : "Blocked"}
        </span>
      </div>

      {review.generatedDraft ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <PreviewMetric label="Draft" value={review.generatedDraft.title} />
          <PreviewMetric
            label="Version"
            value={`v${review.generatedDraft.version}`}
          />
        </div>
      ) : null}

      {review.warnings.length > 0 ? (
        <div className="mt-2 space-y-1">
          {review.warnings.map((warning, index) => (
            <p
              key={`${warning.code}-${index}`}
              className="text-[11px] leading-snug text-[#9A632F]"
            >
              {warning.message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getStatusLabel(orchestration: WeekPlanOrchestrationState) {
  if (orchestration.status === "loading") {
    return "Loading orchestration preview";
  }

  if (orchestration.status === "signedOut") {
    return "Remote mode, signed out";
  }

  if (orchestration.status === "unavailable") {
    return "Orchestration unavailable";
  }

  if (orchestration.status === "error") {
    return "Orchestration failed";
  }

  if (orchestration.preview?.status === "ready") {
    return "Draft preview ready";
  }

  return "Draft preview blocked";
}

function getStatusDescription(orchestration: WeekPlanOrchestrationState) {
  if (orchestration.status === "loading") {
    return "Reading planning context and upstream plan details.";
  }

  if (orchestration.status === "signedOut") {
    return "Sign in to preview user-owned orchestration inputs.";
  }

  if (
    orchestration.status === "unavailable" ||
    orchestration.status === "error"
  ) {
    return orchestration.error ?? "WeekPlan orchestration could not be loaded.";
  }

  if (orchestration.preview?.status === "ready") {
    return "Review the generated all-day markers before saving a draft.";
  }

  return "Resolve missing or misaligned inputs before creating a draft.";
}

function getReviewDescription(review: GeneratedWeekPlanDraftReview) {
  if (!review.generatedDraft) {
    return "No generated WeekPlan draft is available for activation.";
  }

  if (review.readiness === "activatable") {
    return review.activationSummary.willArchiveActiveWeekPlan
      ? "Activation will make this generated draft active and archive the current active WeekPlan."
      : "Activation will make this generated draft the active WeekPlan.";
  }

  return "Activation is blocked until the generated draft matches the current orchestration preview.";
}

function formatAction(action: WeekPlanOrchestrationChangeSummary["action"]) {
  if (action === "create") {
    return "Create draft";
  }

  if (action === "update") {
    return "Update draft";
  }

  return "Blocked";
}
