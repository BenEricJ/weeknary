import { useState } from "react";
import { CalendarDays, Check, CheckCircle2, Dumbbell, Loader2, Lock, NotebookPen, Sparkles, Target, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { AuthCredentials, PlanBundleGenerationError, PlanBundleGenerationRequest } from "../../application";
import { useCreateHub } from "./useCreateHub";
import { BooleanBlock, DateInput, JsonBlock, OutputPreferencesBlock, SegmentedStartingPoint, SelectBlock, TextAreaBlock, TextInputBlock } from "../components/forms/FormBlocks";
import { formatDateRange, formatOptionLabel } from "./createHubFormModel";

const generationSteps: Array<{ icon: LucideIcon; label: string }> = [
  { icon: UtensilsCrossed, label: "MealPlan wird erstellt..." },
  { icon: Dumbbell, label: "TrainingPlan wird angepasst..." },
  { icon: Target, label: "Wochenfokus wird formuliert..." },
];

export function GenerationOverlay({ activeStep }: { activeStep: number }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#FAF9F6]/95 px-8 backdrop-blur-md">
      <Loader2 size={36} className="animate-spin text-[#5E7A5E]" />
      <div className="text-center">
        <p className="text-[15px] font-bold text-gray-900">Wird erstellt...</p>
        <p className="mt-1 text-[12px] text-gray-500">
          {generationSteps[activeStep]?.label ?? generationSteps[0].label}
        </p>
      </div>
      <div className="mt-2 grid w-full gap-2">
        {generationSteps.map(({ icon: Icon, label }, index) => (
          <div
            key={label}
            className={`flex items-center gap-3 transition-opacity ${
              index <= activeStep ? "opacity-100" : "opacity-40"
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                index < activeStep
                  ? "bg-[#E4E9E4]"
                  : index === activeStep
                    ? "bg-[#5E7A5E]"
                    : "bg-gray-100"
              }`}
            >
              {index < activeStep ? (
                <Check size={14} className="text-[#4A634A]" />
              ) : (
                <Icon
                  size={14}
                  className={index === activeStep ? "text-white" : "text-gray-400"}
                />
              )}
            </div>
            <span
              className={`text-[12px] font-bold ${
                index === activeStep ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RuntimeCard({ createHub }: { createHub: ReturnType<typeof useCreateHub> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const credentials: AuthCredentials = { email, password };
  const isSignedIn = createHub.runtimeStatus === "remote-signed-in";
  const generationError = createHub.generationError;

  return (
    <section className="rounded-[18px] border border-[#E5E0D4] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEF4EE]">
          {isSignedIn ? (
            <CheckCircle2 size={18} className="text-[#4A634A]" />
          ) : (
            <Lock size={18} className="text-[#8A6F4D]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-gray-900">
            {isSignedIn ? "Bereit für KI-Generierung" : "Anmeldung erforderlich"}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {isSignedIn
              ? createHub.userEmail ?? "Supabase Session aktiv."
              : "KI-Pläne laufen über eine geschützte Supabase Edge Function."}
          </p>
          {generationError ? (
            <div className="mt-3 rounded-[14px] border border-[#F0D6D6] bg-[#FFF7F7] p-3">
              <p className="text-[12px] font-bold text-[#9C3A3A]">
                {getGenerationErrorHeadline(generationError)}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#8E4A4A]">
                {getGenerationErrorDescription(generationError)}
              </p>
              {generationError.hint ? (
                <p className="mt-2 text-[11px] font-bold text-[#9C3A3A]">
                  {generationError.hint}
                </p>
              ) : null}
              {(generationError.technicalDetails || generationError.status) ? (
                <details className="mt-3 rounded-[12px] border border-[#E7CACA] bg-white/80 p-3">
                  <summary className="cursor-pointer text-[11px] font-bold text-[#8E4A4A]">
                    Technische Details
                  </summary>
                  <div className="mt-2 space-y-1 text-[11px] leading-snug text-[#6F5B5B]">
                    <p>Code: {generationError.code}</p>
                    {generationError.status ? <p>HTTP-Status: {generationError.status}</p> : null}
                    {generationError.technicalDetails ? (
                      <p className="break-words">{generationError.technicalDetails}</p>
                    ) : null}
                  </div>
                </details>
              ) : null}
            </div>
          ) : createHub.error ? (
            <p className="mt-2 text-[11px] leading-snug text-[#9C3A3A]">
              {createHub.error}
            </p>
          ) : null}
        </div>
      </div>

      {!isSignedIn ? (
        <div className="mt-4 space-y-2">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-[12px] border border-gray-200 bg-[#FAF9F6] px-3 text-[13px] outline-none focus:border-[#5E7A5E]"
            placeholder="E-Mail"
            type="email"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-[12px] border border-gray-200 bg-[#FAF9F6] px-3 text-[13px] outline-none focus:border-[#5E7A5E]"
            placeholder="Passwort"
            type="password"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void createHub.signIn(credentials)}
              className="h-10 rounded-[12px] bg-[#5E7A5E] text-[12px] font-bold text-white"
            >
              Einloggen
            </button>
            <button
              type="button"
              onClick={() => void createHub.createAccount(credentials)}
              className="h-10 rounded-[12px] border border-[#DAD6CB] bg-white text-[12px] font-bold text-gray-800"
            >
              Account erstellen
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void createHub.signOut()}
          className="mt-3 text-[11px] font-bold text-gray-500"
        >
          Abmelden
        </button>
      )}
    </section>
  );
}

export function SetupStep({
  createHub,
  startDate,
  endDate,
  startingPoint,
  onStartDateChange,
  onEndDateChange,
  onStartingPointChange,
}: {
  createHub: ReturnType<typeof useCreateHub>;
  startDate: string;
  endDate: string;
  startingPoint: PlanBundleGenerationRequest["startingPoint"];
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStartingPointChange: (
    value: PlanBundleGenerationRequest["startingPoint"],
  ) => void;
}) {
  const preferences = createHub.preferences;
  const mealSummary = preferences
    ? `${formatOptionLabel(preferences.nutrition.dietType)} · ${preferences.nutrition.dailyNutritionTarget.kcal ?? "offenes"} kcal Ziel`
    : "Profil-Defaults werden geladen";
  const trainingMinutes = preferences?.training.structure?.weeklyVolumeTargetMinutes;
  const trainingSummary = preferences
    ? `${preferences.training.sessionsPerWeek} Einheiten${
        trainingMinutes ? ` · ${Math.round(trainingMinutes / 60)}h Volumen` : ""
      }`
    : "Training wird aus Defaults abgeleitet";
  const focusSummary = preferences?.week.focusAreas[0] ?? "Ein großes Thema pro Woche";

  return (
    <section className="space-y-4">
      <section className="flex gap-3 rounded-[20px] border border-[#E6EBE6] bg-[#F2F4F2] p-4 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white">
          <Sparkles size={22} className="text-[#4A634A]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#4A634A]">
            Create Hub
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-gray-900">
            Deinen Plan für die Woche
          </h2>
          <p className="mt-1 text-[12px] leading-snug text-gray-600">
            Wir generieren MealPlan, TrainingPlan und Wochenfokus auf deinen
            Rhythmus abgestimmt.
          </p>
        </div>
      </section>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
          Bausteine
        </p>
        <div className="grid gap-2.5">
          <HubCard
            icon={UtensilsCrossed}
            title="MealPlan"
            subtitle={mealSummary}
            badge="Angepasst"
            active
          />
          <HubCard
            icon={Dumbbell}
            title="TrainingPlan"
            subtitle={trainingSummary}
            badge="Im Rhythmus"
          />
          <HubCard
            icon={Target}
            title="Wochenfokus"
            subtitle={focusSummary}
            badge="Nächste Woche"
          />
        </div>
      </div>

      <section className="rounded-[18px] border border-[#E8E6DD] bg-[#F4F2EC] p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-[#4A634A]" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-gray-900">
              {createHub.bundle ? "Zuletzt generiert" : "Planzeitraum"}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {formatDateRange(startDate, endDate)}
            </p>
          </div>
          <span className="rounded-full bg-[#E4E9E4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4A634A]">
            {createHub.bundle ? "Preview" : "Bereit"}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <DateInput label="Start" value={startDate} onChange={onStartDateChange} />
        <DateInput label="Ende" value={endDate} onChange={onEndDateChange} />
      </div>
      <SegmentedStartingPoint
        value={startingPoint}
        onChange={onStartingPointChange}
      />
    </section>
  );
}

export function ContextStep({
  goalsText,
  constraintsText,
  userNotes,
  planningIntent,
  weekMood,
  strictness,
  mainFocus,
  avoidThisWeekText,
  specialNotes,
  tradeoffPreference,
  failureMode,
  adherencePriority,
  changeTolerance,
  regenerationPriority,
  constraintsProfile,
  currentState,
  output,
  onGoalsChange,
  onConstraintsChange,
  onUserNotesChange,
  onPlanningIntentChange,
  onWeekMoodChange,
  onStrictnessChange,
  onMainFocusChange,
  onAvoidThisWeekChange,
  onSpecialNotesChange,
  onTradeoffPreferenceChange,
  onFailureModeChange,
  onAdherencePriorityChange,
  onChangeToleranceChange,
  onRegenerationPriorityChange,
  onConstraintsProfileChange,
  onCurrentStateChange,
  onOutputChange,
}: {
  goalsText: string;
  constraintsText: string;
  userNotes: string;
  planningIntent: NonNullable<PlanBundleGenerationRequest["planningIntent"]>;
  weekMood: NonNullable<PlanBundleGenerationRequest["weekMood"]>;
  strictness: NonNullable<PlanBundleGenerationRequest["strictness"]>;
  mainFocus: string;
  avoidThisWeekText: string;
  specialNotes: string;
  tradeoffPreference: NonNullable<PlanBundleGenerationRequest["tradeoffPreference"]>;
  failureMode: PlanBundleGenerationRequest["failureMode"];
  adherencePriority: NonNullable<PlanBundleGenerationRequest["adherencePriority"]>;
  changeTolerance: NonNullable<PlanBundleGenerationRequest["changeTolerance"]>;
  regenerationPriority: NonNullable<PlanBundleGenerationRequest["regenerationPriority"]>;
  constraintsProfile: PlanBundleGenerationRequest["constraintsProfile"];
  currentState: PlanBundleGenerationRequest["state"];
  output: NonNullable<PlanBundleGenerationRequest["output"]>;
  onGoalsChange: (value: string) => void;
  onConstraintsChange: (value: string) => void;
  onUserNotesChange: (value: string) => void;
  onPlanningIntentChange: (value: NonNullable<PlanBundleGenerationRequest["planningIntent"]>) => void;
  onWeekMoodChange: (value: NonNullable<PlanBundleGenerationRequest["weekMood"]>) => void;
  onStrictnessChange: (value: NonNullable<PlanBundleGenerationRequest["strictness"]>) => void;
  onMainFocusChange: (value: string) => void;
  onAvoidThisWeekChange: (value: string) => void;
  onSpecialNotesChange: (value: string) => void;
  onTradeoffPreferenceChange: (
    value: NonNullable<PlanBundleGenerationRequest["tradeoffPreference"]>,
  ) => void;
  onFailureModeChange: (value: PlanBundleGenerationRequest["failureMode"]) => void;
  onAdherencePriorityChange: (
    value: NonNullable<PlanBundleGenerationRequest["adherencePriority"]>,
  ) => void;
  onChangeToleranceChange: (
    value: NonNullable<PlanBundleGenerationRequest["changeTolerance"]>,
  ) => void;
  onRegenerationPriorityChange: (
    value: NonNullable<PlanBundleGenerationRequest["regenerationPriority"]>,
  ) => void;
  onConstraintsProfileChange: (value: PlanBundleGenerationRequest["constraintsProfile"]) => void;
  onCurrentStateChange: (value: PlanBundleGenerationRequest["state"]) => void;
  onOutputChange: (value: NonNullable<PlanBundleGenerationRequest["output"]>) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Kontext für die KI</h2>
        <p className="mt-1 text-[13px] leading-snug text-gray-500">
          Die Ausgabe bleibt ein editierbarer Wellness-Plan.
        </p>
      </div>
      <div className="grid gap-3">
        <SelectBlock
          label="Intent"
          value={planningIntent}
          options={["reset", "optimize", "maintain", "build_routine", "busy_week"]}
          onChange={(value) =>
            onPlanningIntentChange(
              value as NonNullable<PlanBundleGenerationRequest["planningIntent"]>,
            )
          }
        />
        <SelectBlock
          label="Week Mood"
          value={weekMood}
          options={["calm", "productive", "athletic", "social", "recovery"]}
          onChange={(value) =>
            onWeekMoodChange(value as NonNullable<PlanBundleGenerationRequest["weekMood"]>)
          }
        />
        <SelectBlock
          label="Striktheit"
          value={strictness}
          options={["loose", "balanced", "strict"]}
          onChange={(value) =>
            onStrictnessChange(value as NonNullable<PlanBundleGenerationRequest["strictness"]>)
          }
        />
        <SelectBlock
          label="Tradeoff"
          value={tradeoffPreference}
          options={["consistency", "performance", "flexibility", "recovery"]}
          onChange={(value) =>
            onTradeoffPreferenceChange(
              value as NonNullable<PlanBundleGenerationRequest["tradeoffPreference"]>,
            )
          }
        />
        <SelectBlock
          label="Failure Mode"
          value={failureMode ?? ""}
          options={[
            "",
            "overeating",
            "under_eating",
            "overplanning",
            "underplanning",
            "fatigue",
            "time_loss",
            "social_disruption",
            "inconsistency",
          ]}
          onChange={(value) =>
            onFailureModeChange(value ? (value as PlanBundleGenerationRequest["failureMode"]) : undefined)
          }
        />
        <SelectBlock
          label="Adherence"
          value={adherencePriority}
          options={["low", "medium", "high"]}
          onChange={(value) =>
            onAdherencePriorityChange(
              value as NonNullable<PlanBundleGenerationRequest["adherencePriority"]>,
            )
          }
        />
        <SelectBlock
          label="Change Tolerance"
          value={changeTolerance}
          options={["low", "medium", "high"]}
          onChange={(value) =>
            onChangeToleranceChange(
              value as NonNullable<PlanBundleGenerationRequest["changeTolerance"]>,
            )
          }
        />
        <SelectBlock
          label="Regeneration"
          value={regenerationPriority}
          options={["low", "medium", "high"]}
          onChange={(value) =>
            onRegenerationPriorityChange(
              value as NonNullable<PlanBundleGenerationRequest["regenerationPriority"]>,
            )
          }
        />
        <TextInputBlock label="Main Focus" value={mainFocus} onChange={onMainFocusChange} />
      </div>
      <TextAreaBlock
        icon={Target}
        label="Ziele"
        value={goalsText}
        onChange={onGoalsChange}
      />
      <TextAreaBlock
        icon={CheckCircle2}
        label="Constraints"
        value={constraintsText}
        onChange={onConstraintsChange}
      />
      <TextAreaBlock
        icon={NotebookPen}
        label="Notizen"
        value={userNotes}
        onChange={onUserNotesChange}
        rows={4}
      />
      <TextAreaBlock
        icon={CheckCircle2}
        label="Diese Woche vermeiden"
        value={avoidThisWeekText}
        onChange={onAvoidThisWeekChange}
        rows={4}
      />
      <TextAreaBlock
        icon={NotebookPen}
        label="Special Notes"
        value={specialNotes}
        onChange={onSpecialNotesChange}
        rows={4}
      />
      <JsonBlock
        label="Constraints Profile"
        value={constraintsProfile ?? {}}
        onChange={(value) =>
          onConstraintsProfileChange(
            value && typeof value === "object" && !Array.isArray(value)
              ? (value as PlanBundleGenerationRequest["constraintsProfile"])
              : {},
          )
        }
      />
      <JsonBlock
        label="Current State"
        value={currentState ?? {}}
        onChange={(value) =>
          onCurrentStateChange(
            value && typeof value === "object" && !Array.isArray(value)
              ? (value as PlanBundleGenerationRequest["state"])
              : {},
          )
        }
      />
      <OutputPreferencesBlock output={output} onChange={onOutputChange} />
    </section>
  );
}

function getGenerationErrorHeadline(error: PlanBundleGenerationError) {
  switch (error.code) {
    case "env_not_configured":
      return "KI-Backend ist nicht vollständig konfiguriert.";
    case "auth_required":
      return "Die Sitzung ist nicht mehr gültig.";
    case "openai_timeout":
      return "Die KI-Antwort hat zu lange gedauert.";
    case "openai_request_failed":
      return "Die KI-Generierung ist aktuell nicht erreichbar.";
    case "openai_response_invalid":
      return "Die KI-Antwort konnte nicht verarbeitet werden.";
    case "invalid_request":
      return "Die Anfrage konnte nicht verarbeitet werden.";
    default:
      return "Die KI-Generierung ist fehlgeschlagen.";
  }
}

function getGenerationErrorDescription(error: PlanBundleGenerationError) {
  switch (error.code) {
    case "env_not_configured":
      return "Die Edge Function läuft, aber benötigte Secrets wie OPENAI_API_KEY fehlen.";
    case "auth_required":
      return "Bitte melde dich erneut an und starte die Generierung noch einmal.";
    case "openai_timeout":
      return "Das Backend hat innerhalb des Zeitlimits keine Antwort von OpenAI erhalten.";
    case "openai_request_failed":
      return "Der Request an OpenAI oder die Edge Function ist fehlgeschlagen.";
    case "openai_response_invalid":
      return "OpenAI hat geantwortet, aber die Rückgabe passt nicht zum erwarteten Planformat.";
    case "invalid_request":
      return "Mindestens ein Eingabewert wurde vom Backend als ungültig erkannt.";
    default:
      return error.message;
  }
}

export function PreviewStep({ createHub }: { createHub: ReturnType<typeof useCreateHub> }) {
  const bundle = createHub.bundle;

  if (!bundle) {
    return (
      <section className="rounded-[18px] border border-[#E5E0D4] bg-white p-4 shadow-sm">
        <p className="text-[13px] font-bold text-gray-900">Noch keine Preview</p>
        <p className="mt-1 text-[12px] text-gray-500">
          Generiere zuerst ein Plan-Bundle.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Plan Preview</h2>
        <p className="mt-1 text-[13px] leading-snug text-gray-600">
          {bundle.summary}
        </p>
      </div>

      {bundle.warnings.length > 0 ? (
        <div className="rounded-[14px] bg-[#FFF7EC] p-3">
          {bundle.warnings.map((warning) => (
            <p key={warning} className="text-[11px] font-medium text-[#9A632F]">
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3">
        <PreviewCard
          icon={UtensilsCrossed}
          title={bundle.mealPlan.title}
          value={`${bundle.mealPlan.days.reduce((total, day) => total + day.meals.length, 0)} Meals`}
          subtitle={`${bundle.mealPlan.shoppingList.length} Einkaufsposten`}
        />
        <PreviewCard
          icon={Dumbbell}
          title={bundle.trainingPlan.title}
          value={`${bundle.trainingPlan.workouts.length} Workouts`}
          subtitle={`${bundle.trainingPlan.goals.length} Ziele`}
        />
        <PreviewCard
          icon={CalendarDays}
          title={bundle.weekPlan.title}
          value={`${bundle.weekPlan.events.length} Events`}
          subtitle={`${bundle.weekPlan.focusItems.length} Fokusitems`}
        />
      </div>

      {createHub.savedBundle ? (
        <div className="rounded-[14px] border border-[#DCE7DC] bg-[#F2F7F2] p-3">
          <p className="text-[12px] font-bold text-[#4A634A]">
            {createHub.savedBundle.mode === "activate"
              ? "Plan-Bundle wurde aktiviert."
              : "Plan-Bundle wurde als Draft gespeichert."}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function HubCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  active,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-[18px] border p-4 shadow-sm ${
        active ? "border-[#D6E4D6] bg-[#F2F7F2]" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white">
        <Icon size={20} className="text-[#5E7A5E]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-gray-900">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{subtitle}</p>
      </div>
      {badge ? (
        <span className="shrink-0 rounded-full bg-[#E4E9E4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4A634A]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  value,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#F7F6F1]">
        <Icon size={20} className="text-[#5E7A5E]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-gray-900">{title}</p>
        <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p>
      </div>
      <span className="shrink-0 rounded-[10px] bg-[#EEF4EE] px-2.5 py-1 text-[11px] font-bold text-[#4A634A]">
        {value}
      </span>
    </div>
  );
}
