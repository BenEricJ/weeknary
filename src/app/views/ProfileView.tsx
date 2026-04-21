import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronLeft, Loader2, Save, Settings } from "lucide-react";
import type { Profile, UserPreferences } from "../../domain";
import { useProfileSettings } from "../profile/useProfileSettings";

type ProfileTab = "profile" | "nutrition" | "training" | "week";

export function ProfileView() {
  const navigate = useNavigate();
  const settings = useProfileSettings();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [profileDraft, setProfileDraft] = useState<Profile | null>(null);
  const [preferencesDraft, setPreferencesDraft] = useState<UserPreferences | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    const savedPreferences = await settings.savePreferences(preferencesDraft);

    if (savedProfile && savedPreferences) {
      setMessage("Profil und Defaults gespeichert.");
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-[#FAF9F6]/95 px-5 pb-4 pt-8 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200/60"
            aria-label="Zurueck"
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
          <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>
            Profil
          </TabButton>
          <TabButton active={activeTab === "nutrition"} onClick={() => setActiveTab("nutrition")}>
            Ernaehrung
          </TabButton>
          <TabButton active={activeTab === "training"} onClick={() => setActiveTab("training")}>
            Training
          </TabButton>
          <TabButton active={activeTab === "week"} onClick={() => setActiveTab("week")}>
            Woche
          </TabButton>
        </div>
      </header>

      <main className="hide-scrollbar flex-1 overflow-y-auto px-6 py-5 pb-28">
        <RuntimeNotice status={settings.status} error={settings.error} />

        {profileDraft && preferencesDraft ? (
          <div className="space-y-5">
            <ProfileSummary profile={profileDraft} preferences={preferencesDraft} />

            {activeTab === "profile" ? (
              <ProfileForm profile={profileDraft} onChange={setProfileDraft} />
            ) : null}

            {activeTab === "nutrition" ? (
              <NutritionForm
                preferences={preferencesDraft}
                onChange={setPreferencesDraft}
              />
            ) : null}

            {activeTab === "training" ? (
              <TrainingForm
                preferences={preferencesDraft}
                onChange={setPreferencesDraft}
              />
            ) : null}

            {activeTab === "week" ? (
              <WeekForm preferences={preferencesDraft} onChange={setPreferencesDraft} />
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

function ProfileSummary({
  profile,
  preferences,
}: {
  profile: Profile;
  preferences: UserPreferences;
}) {
  const age = useMemo(
    () => (profile.birthYear ? new Date().getFullYear() - profile.birthYear : null),
    [profile.birthYear],
  );

  return (
    <section className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF4EE] text-xl font-bold text-[#4A634A]">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            profile.displayName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-gray-900">
            {profile.displayName}
          </h2>
          <p className="mt-1 text-[12px] text-gray-500">
            {age ? `${age} Jahre` : "Alter offen"} - {preferences.nutrition.dietType} -{" "}
            {preferences.training.sessionsPerWeek} Trainings/Woche
          </p>
        </div>
      </div>
    </section>
  );
}

function ProfileForm({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
}) {
  return (
    <Section title="Identitaet und Koerper">
      <TextInput
        label="Name"
        value={profile.displayName}
        onChange={(displayName) => onChange({ ...profile, displayName })}
      />
      <TextInput
        label="Avatar URL"
        value={profile.avatarUrl ?? ""}
        onChange={(avatarUrl) => onChange({ ...profile, avatarUrl: emptyToUndefined(avatarUrl) })}
      />
      <NumberInput
        label="Geburtsjahr"
        value={profile.birthYear}
        onChange={(birthYear) => onChange({ ...profile, birthYear })}
      />
      <NumberInput
        label="Groesse cm"
        value={profile.heightCm}
        onChange={(heightCm) => onChange({ ...profile, heightCm })}
      />
      <NumberInput
        label="Gewicht kg"
        value={profile.weightKg}
        onChange={(weightKg) => onChange({ ...profile, weightKg })}
      />
      <SelectInput
        label="Aktivitaet"
        value={profile.activityLevel}
        options={["low", "medium", "high"]}
        onChange={(activityLevel) =>
          onChange({ ...profile, activityLevel: activityLevel as Profile["activityLevel"] })
        }
      />
    </Section>
  );
}

function NutritionForm({
  preferences,
  onChange,
}: {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}) {
  const nutrition = preferences.nutrition;
  const updateNutrition = (patch: Partial<UserPreferences["nutrition"]>) =>
    onChange({ ...preferences, nutrition: { ...nutrition, ...patch } });

  return (
    <Section title="Ernaehrung Defaults">
      <SelectInput
        label="Diet Type"
        value={nutrition.dietType}
        options={["omnivore", "vegetarian", "vegan", "pescetarian"]}
        onChange={(dietType) =>
          updateNutrition({ dietType: dietType as UserPreferences["nutrition"]["dietType"] })
        }
      />
      <LineListInput
        label="Allergien"
        value={nutrition.allergies}
        onChange={(allergies) => updateNutrition({ allergies })}
      />
      <LineListInput
        label="Nicht einplanen"
        value={nutrition.excludedIngredients}
        onChange={(excludedIngredients) => updateNutrition({ excludedIngredients })}
      />
      <LineListInput
        label="Bevorzugte Zutaten"
        value={nutrition.preferredIngredients}
        onChange={(preferredIngredients) => updateNutrition({ preferredIngredients })}
      />
      <NumberInput
        label="Kcal pro Tag"
        value={nutrition.dailyNutritionTarget.kcal}
        onChange={(kcal) =>
          updateNutrition({
            dailyNutritionTarget: { ...nutrition.dailyNutritionTarget, kcal },
          })
        }
      />
      <NumberInput
        label="Protein g pro Tag"
        value={nutrition.dailyNutritionTarget.protein}
        onChange={(protein) =>
          updateNutrition({
            dailyNutritionTarget: { ...nutrition.dailyNutritionTarget, protein },
          })
        }
      />
      <NumberInput
        label="Wochenbudget Cent"
        value={nutrition.weeklyBudgetCents}
        onChange={(weeklyBudgetCents) => updateNutrition({ weeklyBudgetCents })}
      />
      <NumberInput
        label="Meal Prep Minuten"
        value={nutrition.mealPrepMinutes}
        onChange={(mealPrepMinutes) => updateNutrition({ mealPrepMinutes })}
      />
      <NumberInput
        label="Meals pro Tag"
        value={nutrition.mealsPerDay}
        onChange={(mealsPerDay) => updateNutrition({ mealsPerDay: mealsPerDay ?? 3 })}
      />
      <SelectInput
        label="Shopping"
        value={nutrition.shoppingPreference}
        options={["budget", "balanced", "convenience"]}
        onChange={(shoppingPreference) =>
          updateNutrition({
            shoppingPreference:
              shoppingPreference as UserPreferences["nutrition"]["shoppingPreference"],
          })
        }
      />
    </Section>
  );
}

function TrainingForm({
  preferences,
  onChange,
}: {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}) {
  const training = preferences.training;
  const updateTraining = (patch: Partial<UserPreferences["training"]>) =>
    onChange({ ...preferences, training: { ...training, ...patch } });

  return (
    <Section title="Training Defaults">
      <SelectInput
        label="Ziel"
        value={training.trainingGoal}
        options={["strength", "hypertrophy", "endurance", "mobility", "general-fitness"]}
        onChange={(trainingGoal) =>
          updateTraining({
            trainingGoal: trainingGoal as UserPreferences["training"]["trainingGoal"],
          })
        }
      />
      <SelectInput
        label="Level"
        value={training.experienceLevel}
        options={["beginner", "intermediate", "advanced"]}
        onChange={(experienceLevel) =>
          updateTraining({
            experienceLevel:
              experienceLevel as UserPreferences["training"]["experienceLevel"],
          })
        }
      />
      <NumberInput
        label="Sessions pro Woche"
        value={training.sessionsPerWeek}
        onChange={(sessionsPerWeek) =>
          updateTraining({ sessionsPerWeek: sessionsPerWeek ?? 3 })
        }
      />
      <LineListInput
        label="Bevorzugte Tage"
        value={training.preferredDays}
        onChange={(preferredDays) =>
          updateTraining({
            preferredDays: preferredDays as UserPreferences["training"]["preferredDays"],
          })
        }
      />
      <TextInput
        label="Zeitfenster Start"
        value={training.preferredTimeWindow?.start ?? ""}
        onChange={(start) =>
          updateTraining({
            preferredTimeWindow: {
              start,
              end: training.preferredTimeWindow?.end ?? "20:00",
            },
          })
        }
      />
      <TextInput
        label="Zeitfenster Ende"
        value={training.preferredTimeWindow?.end ?? ""}
        onChange={(end) =>
          updateTraining({
            preferredTimeWindow: {
              start: training.preferredTimeWindow?.start ?? "18:00",
              end,
            },
          })
        }
      />
      <NumberInput
        label="Dauer Minuten"
        value={training.sessionDurationMinutes}
        onChange={(sessionDurationMinutes) => updateTraining({ sessionDurationMinutes })}
      />
      <LineListInput
        label="Equipment"
        value={training.equipment}
        onChange={(equipment) => updateTraining({ equipment })}
      />
      <LineListInput
        label="Limitations"
        value={training.limitations}
        onChange={(limitations) => updateTraining({ limitations })}
      />
      <SelectInput
        label="Intensitaet"
        value={training.intensityPreference}
        options={["low", "moderate", "high"]}
        onChange={(intensityPreference) =>
          updateTraining({
            intensityPreference:
              intensityPreference as UserPreferences["training"]["intensityPreference"],
          })
        }
      />
    </Section>
  );
}

function WeekForm({
  preferences,
  onChange,
}: {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}) {
  const week = preferences.week;
  const updateWeek = (patch: Partial<UserPreferences["week"]>) =>
    onChange({ ...preferences, week: { ...week, ...patch } });

  return (
    <Section title="Woche Defaults">
      <SelectInput
        label="Wochenstart"
        value={week.weekStartsOn}
        options={["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}
        onChange={(weekStartsOn) =>
          updateWeek({ weekStartsOn: weekStartsOn as UserPreferences["week"]["weekStartsOn"] })
        }
      />
      <NumberInput
        label="Planlaenge Tage"
        value={week.defaultDateRangeLengthDays}
        onChange={(defaultDateRangeLengthDays) =>
          updateWeek({ defaultDateRangeLengthDays: defaultDateRangeLengthDays ?? 7 })
        }
      />
      <LineListInput
        label="Fokusbereiche"
        value={week.focusAreas}
        onChange={(focusAreas) => updateWeek({ focusAreas })}
      />
      <SelectInput
        label="Puffer"
        value={week.bufferPreference}
        options={["compact", "balanced", "spacious"]}
        onChange={(bufferPreference) =>
          updateWeek({
            bufferPreference: bufferPreference as UserPreferences["week"]["bufferPreference"],
          })
        }
      />
      <SelectInput
        label="Planungsstil"
        value={week.planningStyle}
        options={["structured", "flexible", "minimal"]}
        onChange={(planningStyle) =>
          updateWeek({ planningStyle: planningStyle as UserPreferences["week"]["planningStyle"] })
        }
      />
      <LineListInput
        label="Arbeitsbloecke"
        value={week.workBlocks.map(formatBlock)}
        onChange={(lines) => updateWeek({ workBlocks: lines.map(parseBlock).filter(isTimeBlock) })}
      />
      <LineListInput
        label="Blockierte Zeiten"
        value={week.blockedTimes.map(formatBlock)}
        onChange={(lines) => updateWeek({ blockedTimes: lines.map(parseBlock).filter(isTimeBlock) })}
      />
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
        {title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
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

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange(parseOptionalNumber(event.target.value))}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function LineListInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <textarea
        value={value.join("\n")}
        rows={4}
        onChange={(event) => onChange(toLines(event.target.value))}
        className="mt-2 w-full resize-none bg-transparent text-[13px] leading-relaxed text-gray-900 outline-none"
      />
    </label>
  );
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function emptyToUndefined(value: string) {
  return value.trim() ? value.trim() : undefined;
}

function formatBlock(block: UserPreferences["week"]["workBlocks"][number]) {
  return `${block.day} ${block.start}-${block.end}${block.label ? ` ${block.label}` : ""}`;
}

function parseBlock(value: string): UserPreferences["week"]["workBlocks"][number] | null {
  const match = value.match(
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(\d{2}:\d{2})-(\d{2}:\d{2})(?:\s+(.+))?$/,
  );

  if (!match) {
    return null;
  }

  return {
    day: match[1] as UserPreferences["week"]["weekStartsOn"],
    start: match[2],
    end: match[3],
    label: match[4],
  };
}

function isTimeBlock(
  value: UserPreferences["week"]["workBlocks"][number] | null,
): value is UserPreferences["week"]["workBlocks"][number] {
  return value !== null;
}
