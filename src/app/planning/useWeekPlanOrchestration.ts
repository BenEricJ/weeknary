import { useCallback, useEffect, useState } from "react";
import type {
  GeneratedWeekPlanDraftReview,
  PlanningContextUserIds,
  WeekPlanActivationResult,
  WeekPlanOrchestrationActionResult,
  WeekPlanOrchestrationPreview,
} from "../../application";
import {
  resolveWeekPlanOrchestrationRuntime,
  weekPlanOrchestrationRuntime,
} from "./weekPlanOrchestrationRuntime";

export type WeekPlanOrchestrationLoadStatus =
  | "loading"
  | "ready"
  | "signedOut"
  | "unavailable"
  | "error";

export type WeekPlanOrchestrationRuntimeStatus =
  | "demo-local"
  | "remote-signed-out"
  | "remote-signed-in"
  | "remote-unavailable";

export interface WeekPlanOrchestrationState {
  status: WeekPlanOrchestrationLoadStatus;
  runtimeStatus: WeekPlanOrchestrationRuntimeStatus;
  isRemoteConfigured: boolean;
  preview: WeekPlanOrchestrationPreview | null;
  review: GeneratedWeekPlanDraftReview | null;
  userId: string | null;
  userEmail: string | null;
  error: string | null;
  message: string | null;
  isSaving: boolean;
  isActivating: boolean;
  reload(): Promise<void>;
  saveDraft(): Promise<WeekPlanOrchestrationActionResult | null>;
  activateDraft(): Promise<WeekPlanActivationResult | null>;
}

export function useWeekPlanOrchestration(): WeekPlanOrchestrationState {
  const [status, setStatus] =
    useState<WeekPlanOrchestrationLoadStatus>("loading");
  const [runtimeStatus, setRuntimeStatus] =
    useState<WeekPlanOrchestrationRuntimeStatus>(
      weekPlanOrchestrationRuntime.isRemoteConfigured
        ? "remote-signed-out"
        : "demo-local",
    );
  const [preview, setPreview] =
    useState<WeekPlanOrchestrationPreview | null>(null);
  const [review, setReview] = useState<GeneratedWeekPlanDraftReview | null>(
    null,
  );
  const [userIds, setUserIds] = useState<PlanningContextUserIds | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setMessage(null);

    try {
      const runtime = await resolveWeekPlanOrchestrationRuntime();
      setRuntimeStatus(runtime.runtimeStatus);

      if (!runtime.weekPlanOrchestrationService || !runtime.userIds) {
        setUserIds(null);
        setUserId(null);
        setUserEmail(null);
        setPreview(null);
        setReview(null);
        setStatus(
          runtime.runtimeStatus === "remote-signed-out"
            ? "signedOut"
            : "unavailable",
        );
        setError(runtime.reason ?? null);
        return;
      }

      if (runtime.runtimeStatus === "demo-local") {
        const nextPreview =
          await runtime.weekPlanOrchestrationService.getWeekPlanOrchestrationPreview(
            runtime.userIds,
          );
        const nextReview =
          await runtime.weekPlanOrchestrationService.getGeneratedWeekPlanDraftReview(
            runtime.userIds,
          );

        setUserIds(runtime.userIds);
        setUserId(nextPreview.userId);
        setUserEmail(runtime.userEmail);
        setPreview(nextPreview);
        setReview(nextReview);
        setRuntimeStatus("demo-local");
        setStatus("ready");
        return;
      }

      const nextPreview =
        await runtime.weekPlanOrchestrationService.getWeekPlanOrchestrationPreview(
          runtime.userIds,
        );
      const nextReview =
        await runtime.weekPlanOrchestrationService.getGeneratedWeekPlanDraftReview(
          runtime.userIds,
        );

      setUserIds(runtime.userIds);
      setUserId(runtime.userIds.weekPlanUserId);
      setUserEmail(runtime.userEmail);
      setPreview(nextPreview);
      setReview(nextReview);
      setRuntimeStatus("remote-signed-in");
      setStatus("ready");
    } catch (caught) {
      setUserIds(null);
      setUserId(null);
      setUserEmail(null);
      setPreview(null);
      setReview(null);
      setRuntimeStatus(
        weekPlanOrchestrationRuntime.isRemoteConfigured
          ? "remote-unavailable"
          : "demo-local",
      );
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "WeekPlan orchestration preview could not be loaded.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveDraft = useCallback(async () => {
    if (!userIds) {
      return null;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const result =
        await (
          await resolveWeekPlanOrchestrationRuntime()
        ).weekPlanOrchestrationService?.saveOrchestratedWeekPlanDraft(userIds);

      if (!result) {
        throw new Error("WeekPlan orchestration runtime is unavailable.");
      }

      if (result.status === "blocked") {
        setPreview(result.preview);
        setMessage(result.message);
      } else {
        await load();
        setMessage(
          result.action === "create"
            ? "Orchestrated WeekPlan draft created."
            : "Orchestrated WeekPlan draft updated.",
        );
      }

      return result;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "WeekPlan orchestration draft could not be saved.",
      );
      setStatus("error");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [load, userIds]);

  const activateDraft = useCallback(async () => {
    if (!userIds) {
      return null;
    }

    setIsActivating(true);
    setError(null);
    setMessage(null);

    try {
      const result =
        await (
          await resolveWeekPlanOrchestrationRuntime()
        ).weekPlanOrchestrationService?.activateGeneratedWeekPlanDraft(userIds);

      if (!result) {
        throw new Error("WeekPlan orchestration runtime is unavailable.");
      }

      if (result.status === "blocked") {
        setReview(result.review);
        setPreview(result.review.preview);
        setMessage(result.message);
      } else {
        await load();
        setMessage("Generated WeekPlan draft activated.");
      }

      return result;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Generated WeekPlan draft could not be activated.",
      );
      setStatus("error");
      return null;
    } finally {
      setIsActivating(false);
    }
  }, [load, userIds]);

  return {
    status,
    runtimeStatus,
    isRemoteConfigured: weekPlanOrchestrationRuntime.isRemoteConfigured,
    preview,
    review,
    userId,
    userEmail,
    error,
    message,
    isSaving,
    isActivating,
    reload: load,
    saveDraft,
    activateDraft,
  };
}
