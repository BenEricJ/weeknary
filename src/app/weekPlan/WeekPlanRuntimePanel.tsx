import { useState } from "react";
import type { AuthCredentials } from "../../application";
import type { WeekPlanLocalFirstStatus } from "./weekPlanRuntime";

export function WeekPlanRuntimePanel({
  status,
  runtimeStatus,
  error,
  userEmail,
  isRemoteConfigured,
  onReload,
  onSignIn,
  onCreateAccount,
  onSignOut,
  onSaveRemoteDemoPlan,
  onArchiveActivePlan,
  onRetryRemoteSave,
  localFirstStatus,
}: {
  status: string;
  runtimeStatus: string;
  error?: string | null;
  userEmail?: string | null;
  isRemoteConfigured?: boolean;
  localFirstStatus?: WeekPlanLocalFirstStatus | null;
  onReload?: () => void;
  onSignIn?: (credentials: AuthCredentials) => Promise<void>;
  onCreateAccount?: (credentials: AuthCredentials) => Promise<void>;
  onSignOut?: () => Promise<void>;
  onSaveRemoteDemoPlan?: () => Promise<void>;
  onArchiveActivePlan?: () => Promise<void>;
  onRetryRemoteSave?: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const credentials = { email, password };
  const canSubmit = email.trim().length > 0 && password.length > 0;
  const runtimeDescription = getRuntimeDescription(runtimeStatus, status);
  const runAction = async (label: string, action?: () => Promise<void>) => {
    if (!action) {
      return;
    }

    setActionMessage(null);

    try {
      await action();
      setActionMessage(`${label} succeeded.`);
    } catch (caught) {
      setActionMessage(caught instanceof Error ? caught.message : `${label} failed.`);
    }
  };

  return (
    <section className="rounded-[18px] border border-[#E5E0D4] bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6A816A]">
            WeekPlan runtime
          </p>
          <p className="mt-1 text-[12px] font-bold text-gray-900">
            {runtimeStatus} - {status}
          </p>
          {userEmail ? (
            <p className="mt-1 text-[11px] leading-snug text-gray-500">
              Signed in as {userEmail}
            </p>
          ) : null}
          {error ? (
            <p className="mt-1 text-[11px] leading-snug text-[#9A3F3F]">
              {error}
            </p>
          ) : (
            <p className="mt-1 text-[11px] leading-snug text-gray-500">
              {runtimeDescription}
            </p>
          )}
          {localFirstStatus ? (
            <p
              className={`mt-1 text-[11px] leading-snug ${
                localFirstStatus.remoteState === "remote-save-failed"
                  ? "text-[#9A3F3F]"
                  : "text-gray-500"
              }`}
            >
              {getLocalFirstDescription(localFirstStatus)}
            </p>
          ) : null}
        </div>
        {onReload ? (
          <button
            type="button"
            onClick={onReload}
            className="rounded-[8px] bg-[#F5F4EF] px-3 py-2 text-[11px] font-bold text-gray-700"
          >
            Reload
          </button>
        ) : null}
      </div>

      {isRemoteConfigured && status === "signedOut" ? (
        <div className="mt-3 grid grid-cols-1 gap-2">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="rounded-[8px] border border-[#E5E0D4] bg-white px-3 py-2 text-[12px]"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className="rounded-[8px] border border-[#E5E0D4] bg-white px-3 py-2 text-[12px]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void onSignIn?.(credentials)}
              className="flex-1 rounded-[8px] bg-[#6A816A] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50"
            >
              Sign in
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void onCreateAccount?.(credentials)}
              className="flex-1 rounded-[8px] bg-[#F5F4EF] px-3 py-2 text-[11px] font-bold text-gray-700 disabled:opacity-50"
            >
              Create account
            </button>
          </div>
        </div>
      ) : null}

      {isRemoteConfigured && status !== "signedOut" && userEmail ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void runAction("Remote demo seed", onSaveRemoteDemoPlan)}
            className="rounded-[8px] bg-[#6A816A] px-3 py-2 text-[11px] font-bold text-white"
          >
            Create remote demo
          </button>
          <button
            type="button"
            disabled={status !== "ready"}
            onClick={() => void runAction("Archive active plan", onArchiveActivePlan)}
            className="rounded-[8px] bg-[#F5F4EF] px-3 py-2 text-[11px] font-bold text-gray-700 disabled:opacity-50"
          >
            Archive active
          </button>
          {localFirstStatus?.remoteState === "remote-save-failed" ? (
            <button
              type="button"
              onClick={() => void runAction("Remote save retry", onRetryRemoteSave)}
              className="rounded-[8px] bg-[#F5F4EF] px-3 py-2 text-[11px] font-bold text-gray-700"
            >
              Retry remote save
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void runAction("Sign out", onSignOut)}
            className="rounded-[8px] bg-[#F5F4EF] px-3 py-2 text-[11px] font-bold text-gray-700"
          >
            Sign out
          </button>
        </div>
      ) : null}

      {actionMessage ? (
        <p className="mt-2 text-[11px] leading-snug text-gray-500">
          {actionMessage}
        </p>
      ) : null}
    </section>
  );
}

function getRuntimeDescription(runtimeStatus: string, status: string) {
  if (runtimeStatus === "demo-local") {
    return "Demo-local in-memory WeekPlan path is active.";
  }

  if (runtimeStatus === "remote-signed-out" || status === "signedOut") {
    return "Remote mode is configured. Sign in to load user-owned WeekPlans.";
  }

  if (runtimeStatus === "remote-signed-in") {
    return "Remote WeekPlan path is signed in with the local-first cache layer.";
  }

  return "Remote WeekPlan runtime is unavailable.";
}

function getLocalFirstDescription(status: WeekPlanLocalFirstStatus) {
  if (!status.localCacheAvailable) {
    return "Local-first: no local WeekPlan cache is available.";
  }

  if (status.remoteState === "remote-confirmed") {
    return `Local-first: local cache available, remote confirmed${formatTimestamp(
      status.remoteConfirmedAt,
    )}.`;
  }

  if (status.remoteState === "remote-save-pending") {
    return "Local-first: local save succeeded, remote confirmation is pending.";
  }

  if (status.remoteState === "remote-save-failed") {
    return `Local-first: saved locally only, remote confirmation failed${formatTimestamp(
      status.remoteFailedAt,
    )}.`;
  }

  if (status.remoteState === "local-cache-available") {
    return "Local-first: local cache available, remote confirmation is not recorded.";
  }

  return "Local-first: local cache available, remote confirmation is unknown.";
}

function formatTimestamp(value?: string) {
  return value ? ` at ${value}` : "";
}
