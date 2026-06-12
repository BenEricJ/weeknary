import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Check, ChevronLeft, Loader2, Save, Settings } from "lucide-react";
import type { Profile, UserPreferences } from "../../domain";

import { usePlanningContext } from "../planning/usePlanningContext";
import { useWeekPlanOrchestration } from "../planning/useWeekPlanOrchestration";
import { ProfileExpertPanel } from "../profile/ProfileExpertPanel";
import { ProfileForm, ProfileSummary, NutritionForm, TrainingForm, WeekPlanningForm } from "../profile/ProfileForms";
import { useProfileSettings } from "../profile/useProfileSettings";
import { useActiveMealPlan } from "../mealPlan/useActiveMealPlan";
import { useActiveTrainingPlan } from "../trainingPlan/useActiveTrainingPlan";
import { useActiveWeekPlan } from "../weekPlan/useActiveWeekPlan";
import { formatOptionLabel, sanitizeUserPreferences } from "../profile/profileFormModel";

type ProfileTab = "profile" | "nutrition" | "training" | "planning" | "expert";

const profileTabs: ProfileTab[] = ["profile", "nutrition", "training", "planning", "expert"];

function parseProfileTab(value: string | null): ProfileTab | null {
  return value && profileTabs.includes(value as ProfileTab) ? (value as ProfileTab) : null;
}

export function ProfileView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const settings = useProfileSettings();
  const activeWeekPlan = useActiveWeekPlan();
  const activeMealPlan = useActiveMealPlan();
  const activeTrainingPlan = useActiveTrainingPlan();
  const planningContext = usePlanningContext();
  const orchestration = useWeekPlanOrchestration();
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    () => parseProfileTab(searchParams.get("tab")) ?? "profile",
  );
  const [profileDraft, setProfileDraft] = useState<Profile | null>(null);
  const [preferencesDraft, setPreferencesDraft] = useState<UserPreferences | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const tab = parseProfileTab(searchParams.get("tab"));

    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    if (settings.profile) {
      setProfileDraft(settings.profile);
    }

    if (settings.preferences) {
      setPreferencesDraft(settings.preferences);
    }
  }, [settings.profile, settings.preferences]);

  const canSave =
    profileDraft &&
    preferencesDraft &&
    settings.status !== "saving" &&
    settings.status !== "loading";

  const save = async () => {
    if (!profileDraft || !preferencesDraft) {
      return;
    }

    const savedProfile = await settings.saveProfile(profileDraft);
    const savedPreferences = await settings.savePreferences(
      sanitizeUserPreferences(preferencesDraft),
    );

    if (savedProfile && savedPreferences) {
      setMessage("Profil und Defaults gespeichert.");
    }
  };

  const selectTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-[#FAF9F6]/95 px-5 pb-4 pt-8 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200/60"
            aria-label="Zurück"
          >
            <ChevronLeft size={22} className="text-gray-900" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E7A5E]">
              Einstellungen
            </p>
            <h1 className="truncate text-lg font-bold text-gray-900">Profil</h1>
          </div>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => void save()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm disabled:opacity-50"
            aria-label="Speichern"
          >
            {settings.status === "saving" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <TabButton active={activeTab === "profile"} onClick={() => selectTab("profile")}>
            Profil
          </TabButton>
          <TabButton active={activeTab === "nutrition"} onClick={() => selectTab("nutrition")}>
            Ernährung
          </TabButton>
          <TabButton active={activeTab === "training"} onClick={() => selectTab("training")}>
            Training
          </TabButton>
          <TabButton active={activeTab === "planning"} onClick={() => selectTab("planning")}>
            Planung
          </TabButton>
          <TabButton active={activeTab === "expert"} onClick={() => selectTab("expert")}>
            Expert
          </TabButton>
        </div>
      </header>

      <main className="hide-scrollbar flex-1 overflow-y-auto px-6 py-5 pb-[220px]">
        <RuntimeNotice status={settings.status} error={settings.error} />

        {profileDraft && preferencesDraft ? (
          <div className="space-y-5">
            <ProfileSummary profile={profileDraft} preferences={preferencesDraft} />

            {activeTab === "profile" ? (
              <ProfileForm profile={profileDraft} onChange={setProfileDraft} />
            ) : null}

            {activeTab === "nutrition" ? (
              <NutritionForm preferences={preferencesDraft} onChange={setPreferencesDraft} />
            ) : null}

            {activeTab === "training" ? (
              <TrainingForm preferences={preferencesDraft} onChange={setPreferencesDraft} />
            ) : null}

            {activeTab === "planning" ? (
              <WeekPlanningForm preferences={preferencesDraft} onChange={setPreferencesDraft} />
            ) : null}

            {activeTab === "expert" ? (
              <ProfileExpertPanel
                profileStatus={settings.status}
                profileRuntimeStatus={settings.runtimeStatus}
                profileError={settings.error}
                activeWeekPlan={activeWeekPlan}
                activeMealPlan={activeMealPlan}
                activeTrainingPlan={activeTrainingPlan}
                planningContext={planningContext}
                orchestration={orchestration}
              />
            ) : null}

            {message ? (
              <div className="flex items-center gap-2 rounded-[14px] border border-[#DCE7DC] bg-[#F2F7F2] p-3 text-[12px] font-bold text-[#4A634A]">
                <Check size={15} />
                {message}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[18px] border border-gray-100 bg-white p-4 text-[13px] font-bold text-gray-700 shadow-sm">
            Profil wird geladen.
          </div>
        )}
      </main>

      <footer className="absolute inset-x-0 bottom-[80px] z-20 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent px-6 pb-4 pt-6">
        <button
          type="button"
          disabled={!canSave}
          onClick={() => void save()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-[#5E7A5E] text-[15px] font-bold text-white shadow-lg transition-colors disabled:opacity-50"
        >
          {settings.status === "saving" ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Speichern
              <Save size={18} />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}

function RuntimeNotice({
  status,
  error,
}: {
  status: ReturnType<typeof useProfileSettings>["status"];
  error: string | null;
}) {
  if (!error && status !== "signedOut" && status !== "unavailable") {
    return null;
  }

  return (
    <div className="mb-5 rounded-[16px] border border-[#E5E0D4] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEF4EE]">
          <Settings size={18} className="text-[#5E7A5E]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900">
            {status === "signedOut" ? "Anmeldung erforderlich" : "Profil-Modus"}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {error ?? "Lokale Demo-Defaults sind aktiv."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full px-4 text-[12px] font-bold ${
        active ? "bg-[#5E7A5E] text-white shadow-sm" : "bg-white text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
