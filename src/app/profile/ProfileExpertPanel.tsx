import { PlanningContextPanel } from "../planning/PlanningContextPanel";
import { WeekPlanOrchestrationPanel } from "../planning/WeekPlanOrchestrationPanel";
import type { usePlanningContext } from "../planning/usePlanningContext";
import type { useWeekPlanOrchestration } from "../planning/useWeekPlanOrchestration";
import type { useProfileSettings } from "./useProfileSettings";
import type { useActiveWeekPlan } from "../weekPlan/useActiveWeekPlan";
import { WeekPlanRuntimePanel } from "../weekPlan/WeekPlanRuntimePanel";
import type { useActiveMealPlan } from "../mealPlan/useActiveMealPlan";
import { MealPlanRuntimePanel } from "../mealPlan/MealPlanRuntimePanel";
import type { useActiveTrainingPlan } from "../trainingPlan/useActiveTrainingPlan";
import { TrainingPlanRuntimePanel } from "../trainingPlan/TrainingPlanRuntimePanel";
import { AdvancedSection, Section } from "./ProfileForms";

export function ProfileExpertPanel({
  profileStatus,
  profileRuntimeStatus,
  profileError,
  activeWeekPlan,
  activeMealPlan,
  activeTrainingPlan,
  planningContext,
  orchestration,
}: {
  profileStatus: ReturnType<typeof useProfileSettings>["status"];
  profileRuntimeStatus: ReturnType<typeof useProfileSettings>["runtimeStatus"];
  profileError: string | null;
  activeWeekPlan: ReturnType<typeof useActiveWeekPlan>;
  activeMealPlan: ReturnType<typeof useActiveMealPlan>;
  activeTrainingPlan: ReturnType<typeof useActiveTrainingPlan>;
  planningContext: ReturnType<typeof usePlanningContext>;
  orchestration: ReturnType<typeof useWeekPlanOrchestration>;
}) {
  return (
    <div className="space-y-5">
      <Section title="Profil-Systemstatus">
        <StatusGrid
          items={[
            ["Profil", `${profileRuntimeStatus} · ${profileStatus}`],
            ["Wochenplan", `${activeWeekPlan.runtimeStatus} · ${activeWeekPlan.status}`],
            ["MealPlan", `${activeMealPlan.runtimeStatus} · ${activeMealPlan.status}`],
            ["TrainingPlan", `${activeTrainingPlan.runtimeStatus} · ${activeTrainingPlan.status}`],
            ["Planung", `${planningContext.runtimeStatus} · ${planningContext.status}`],
          ]}
        />
        {profileError ? (
          <div className="rounded-[14px] border border-[#F0D6D6] bg-[#FFF7F7] p-3 text-[12px] font-bold text-[#9C3A3A]">
            {profileError}
          </div>
        ) : null}
      </Section>

      <AdvancedSection title="Wochenplan-Speicher">
        <WeekPlanRuntimePanel
          status={activeWeekPlan.status}
          runtimeStatus={activeWeekPlan.runtimeStatus}
          error={activeWeekPlan.error}
          userEmail={activeWeekPlan.userEmail}
          isRemoteConfigured={activeWeekPlan.isRemoteConfigured}
          localFirstStatus={activeWeekPlan.localFirstStatus}
          onReload={() => void activeWeekPlan.reload()}
          onSignIn={activeWeekPlan.signIn}
          onCreateAccount={activeWeekPlan.createAccount}
          onSignOut={activeWeekPlan.signOut}
          onSaveRemoteDemoPlan={activeWeekPlan.saveRemoteDemoPlan}
          onArchiveActivePlan={activeWeekPlan.archiveActivePlan}
          onRetryRemoteSave={activeWeekPlan.retryRemoteSave}
        />
      </AdvancedSection>

      <AdvancedSection title="MealPlan-Speicher">
        <MealPlanRuntimePanel
          status={activeMealPlan.status}
          runtimeStatus={activeMealPlan.runtimeStatus}
          error={activeMealPlan.error}
          userEmail={activeMealPlan.userEmail}
          isRemoteConfigured={activeMealPlan.isRemoteConfigured}
          onReload={() => void activeMealPlan.reload()}
          onSignIn={activeMealPlan.signIn}
          onCreateAccount={activeMealPlan.createAccount}
          onSignOut={activeMealPlan.signOut}
          onSaveRemoteDemoPlan={activeMealPlan.saveRemoteDemoPlan}
          onArchiveActivePlan={activeMealPlan.archiveActivePlan}
        />
      </AdvancedSection>

      <AdvancedSection title="TrainingPlan-Speicher">
        <TrainingPlanRuntimePanel
          status={activeTrainingPlan.status}
          runtimeStatus={activeTrainingPlan.runtimeStatus}
          error={activeTrainingPlan.error}
          userEmail={activeTrainingPlan.userEmail}
          isRemoteConfigured={activeTrainingPlan.isRemoteConfigured}
          onReload={() => void activeTrainingPlan.reload()}
          onSignIn={activeTrainingPlan.signIn}
          onCreateAccount={activeTrainingPlan.createAccount}
          onSignOut={activeTrainingPlan.signOut}
          onSaveRemoteDemoPlan={activeTrainingPlan.saveRemoteDemoPlan}
          onArchiveActivePlan={activeTrainingPlan.archiveActivePlan}
        />
      </AdvancedSection>

      <AdvancedSection title="Planungsgrundlage">
        <PlanningContextPanel
          status={planningContext.status}
          context={planningContext.context}
          error={planningContext.error}
          onReload={() => void planningContext.reload()}
        />
      </AdvancedSection>

      <AdvancedSection title="Wochenplan-Entwurf">
        <WeekPlanOrchestrationPanel
          orchestration={orchestration}
          onDraftSaved={() => {
            void activeWeekPlan.reload();
            void planningContext.reload();
          }}
          onDraftActivated={() => {
            void activeWeekPlan.reload();
            void planningContext.reload();
          }}
        />
      </AdvancedSection>
    </div>
  );
}

function StatusGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-[14px] border border-gray-100 bg-white p-3 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <p className="mt-1 truncate text-[12px] font-bold text-gray-900">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

