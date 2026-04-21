import { useCallback, useEffect, useState } from "react";
import type { PlanningContext } from "../../application";
import {
  planningContextRuntime,
  resolvePlanningContextRuntime,
  type PlanningContextRuntimeStatus,
} from "./planningContextRuntime";

export function usePlanningContext() {
  const [status, setStatus] = useState<
    "loading" | "ready" | "signedOut" | "unavailable" | "error"
  >("loading");
  const [runtimeStatus, setRuntimeStatus] =
    useState<PlanningContextRuntimeStatus>(
      planningContextRuntime.isRemoteConfigured
        ? "remote-signed-out"
        : "demo-local",
    );
  const [context, setContext] = useState<PlanningContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const runtime = await resolvePlanningContextRuntime();
      setRuntimeStatus(runtime.runtimeStatus);

      if (!runtime.planningContextService || !runtime.userIds) {
        setContext(null);
        setError(runtime.reason ?? null);
        setStatus(
          runtime.runtimeStatus === "remote-signed-out"
            ? "signedOut"
            : "unavailable",
        );
        return;
      }

      const nextContext =
        await runtime.planningContextService.getPlanningContext(runtime.userIds);
      setContext(nextContext);
      setStatus("ready");
    } catch (caught) {
      setContext(null);
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "Planning context could not load.",
      );
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    status,
    context,
    error,
    reload,
    runtimeStatus,
  };
}
