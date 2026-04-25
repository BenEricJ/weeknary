import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  Dumbbell,
  Loader2,
  Lock,
  NotebookPen,
  Sparkles,
  Target,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type {
  AuthCredentials,
  PlanBundleActivationMode,
  PlanBundleGenerationError,
  PlanBundleGenerationRequest,
} from "../../application";
import { useCreateHub } from "../createHub/useCreateHub";

type WizardStep = "setup" | "context" | "preview";

const defaultGoals = [
  "Proteinreich essen",
  "Drei Trainingseinheiten einplanen",
  "Genug Puffer fuer Arbeit und Erholung lassen",
];
const defaultConstraints = [
  "Keine medizinische Beratung",
  "Meal Prep soll alltagstauglich bleiben",
  "Training moderat und editierbar planen",
];
const defaultOutput: NonNullable<PlanBundleGenerationRequest["output"]> = {
  detailLevel: "normal",
  explanationLevel: "short",
  riskTolerance: "balanced",
  communicationStyle: "direct_de",
  format: "cards",
  conflictResolutionStyle: "adaptive",
  includeAlternatives: true,
  includePrepSteps: true,
  includeShoppingList: true,
  includeRationale: true,
  includeFallbacks: true,
  includeRecoveryNotes: true,
  includeLeftoverPlan: true,
  includeStorageHints: true,
  includeBatchCookingPlan: true,
  includeTimeEstimates: true,
  includeConstraintWarnings: true,
};

const generationSteps: Array<{ icon: LucideIcon; label: string }> = [
  { icon: UtensilsCrossed, label: "MealPlan wird erstellt..." },
  { icon: Dumbbell, label: "TrainingPlan wird angepasst..." },
  { icon: Target, label: "Wochenfokus wird formuliert..." },
];

export function CreateHubView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createHub = useCreateHub();
  const defaultRange = useMemo(() => getNextWeekRange(), []);
  const initialRange = useMemo(() => {
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    return {
      startDate: isIsoDateParam(startDateParam)
        ? startDateParam
        : defaultRange.startDate,
      endDate: isIsoDateParam(endDateParam)
        ? endDateParam
        : isIsoDateParam(startDateParam)
          ? startDateParam
          : defaultRange.endDate,
    };
  }, [defaultRange.endDate, defaultRange.startDate, searchParams]);
  const [step, setStep] = useState<WizardStep>("setup");
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [goalsText, setGoalsText] = useState(defaultGoals.join("\n"));
  const [constraintsText, setConstraintsText] = useState(defaultConstraints.join("\n"));
  const [userNotes, setUserNotes] = useState(
    "Plane eine realistische Woche mit klaren Meals, Training und Tagesstruktur.",
  );
  const [didApplyProfileDefaults, setDidApplyProfileDefaults] = useState(false);
  const [startingPoint, setStartingPoint] =
    useState<PlanBundleGenerationRequest["startingPoint"]>("new");
  const [planningIntent, setPlanningIntent] =
    useState<NonNullable<PlanBundleGenerationRequest["planningIntent"]>>("maintain");
  const [weekMood, setWeekMood] =
    useState<NonNullable<PlanBundleGenerationRequest["weekMood"]>>("productive");
  const [strictness, setStrictness] =
    useState<NonNullable<PlanBundleGenerationRequest["strictness"]>>("balanced");
  const [mainFocus, setMainFocus] = useState("");
  const [avoidThisWeekText, setAvoidThisWeekText] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [tradeoffPreference, setTradeoffPreference] =
    useState<NonNullable<PlanBundleGenerationRequest["tradeoffPreference"]>>("consistency");
  const [failureMode, setFailureMode] = useState<PlanBundleGenerationRequest["failureMode"]>();
  const [adherencePriority, setAdherencePriority] =
    useState<NonNullable<PlanBundleGenerationRequest["adherencePriority"]>>("medium");
  const [changeTolerance, setChangeTolerance] =
    useState<NonNullable<PlanBundleGenerationRequest["changeTolerance"]>>("medium");
  const [regenerationPriority, setRegenerationPriority] =
    useState<NonNullable<PlanBundleGenerationRequest["regenerationPriority"]>>("medium");
  const [constraintsProfile, setConstraintsProfile] =
    useState<PlanBundleGenerationRequest["constraintsProfile"]>({});
  const [currentState, setCurrentState] =
    useState<PlanBundleGenerationRequest["state"]>({});
  const [output, setOutput] =
    useState<NonNullable<PlanBundleGenerationRequest["output"]>>(defaultOutput);
  const [activeGenerationStep, setActiveGenerationStep] = useState(0);

  useEffect(() => {
    if (didApplyProfileDefaults || !createHub.preferences) {
      return;
    }

    setGoalsText(buildGoalsFromPreferences(createHub.preferences));
    setConstraintsText(buildConstraintsFromPreferences(createHub.preferences));
    setUserNotes(buildNotesFromProfile(createHub.profile?.displayName));
    setMainFocus(createHub.preferences.week.focusAreas[0] ?? "");
    setDidApplyProfileDefaults(true);
  }, [createHub.preferences, createHub.profile, didApplyProfileDefaults]);

  useEffect(() => {
    if (createHub.status !== "generating") {
      setActiveGenerationStep(0);
      return;
    }

    setActiveGenerationStep(0);
    const timers = [
      window.setTimeout(() => setActiveGenerationStep(1), 1200),
      window.setTimeout(() => setActiveGenerationStep(2), 2400),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [createHub.status]);

  const request = useMemo<PlanBundleGenerationRequest>(
    () => {
      const avoidThisWeek = toLines(avoidThisWeekText);
      return {
        dateRange: { startDate, endDate },
        timezone: createHub.preferences?.timezone ?? "Europe/Berlin",
        locale: createHub.preferences?.locale ?? "de-DE",
        goals: [
          ...toLines(goalsText),
          ...buildStructuredGoals({
            planningIntent,
            weekMood,
            mainFocus,
            tradeoffPreference,
            preferences: createHub.preferences,
          }),
        ],
        constraints: [
          ...toLines(constraintsText),
          ...buildStructuredConstraints({
            strictness,
            avoidThisWeek,
            failureMode,
            adherencePriority,
            changeTolerance,
            regenerationPriority,
            output,
          }),
        ],
        startingPoint,
        userNotes: [userNotes, specialNotes].filter(Boolean).join("\n\n"),
        planningIntent,
        weekMood,
        strictness,
        mainFocus: emptyToUndefined(mainFocus),
        avoidThisWeek,
        specialNotes: emptyToUndefined(specialNotes),
        tradeoffPreference,
        adherencePriority,
        changeTolerance,
        regenerationPriority,
        failureMode,
        constraintsProfile,
        state: currentState,
        output,
        profile: createHub.profile ?? undefined,
        preferences: createHub.preferences ?? undefined,
      };
    },
    [
      adherencePriority,
      avoidThisWeekText,
      changeTolerance,
      constraintsText,
      constraintsProfile,
      createHub.preferences,
      createHub.profile,
      currentState,
      endDate,
      failureMode,
      goalsText,
      mainFocus,
      output,
      planningIntent,
      regenerationPriority,
      specialNotes,
      startDate,
      startingPoint,
      strictness,
      tradeoffPreference,
      userNotes,
      weekMood,
    ],
  );

  const canGenerate =
    createHub.status !== "generating" &&
    createHub.status !== "saving" &&
    createHub.runtimeStatus === "remote-signed-in" &&
    startDate <= endDate;

  const generate = async () => {
    const bundle = await createHub.generate(request);
    if (bundle) {
      setStep("preview");
    }
  };

  const save = async (mode: PlanBundleActivationMode) => {
    const result = await createHub.save(mode);
    if (result) {
      navigate(mode === "activate" ? "/app/week" : "/app/create");
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      {createHub.status === "generating" ? (
        <GenerationOverlay activeStep={activeGenerationStep} />
      ) : null}

      <header className="sticky top-0 z-10 border-b border-gray-100 bg-[#FAF9F6]/95 px-5 pb-4 pt-8 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => (step === "setup" ? navigate(-1) : setStep(previousStep(step)))}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200/60"
            aria-label="Zurueck"
          >
            <ChevronLeft size={22} className="text-gray-900" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E7A5E]">
              KI Create Hub
            </p>
            <h1 className="truncate text-lg font-bold text-gray-900">
              Neue Plaene erstellen
            </h1>
          </div>
          <div className="h-10 w-10" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <StepPill active={step === "setup"} done={step !== "setup"} label="Setup" />
          <StepPill active={step === "context"} done={step === "preview"} label="Kontext" />
          <StepPill active={step === "preview"} done={false} label="Preview" />
        </div>
      </header>

      <main className="hide-scrollbar flex-1 overflow-y-auto px-6 py-5 pb-[112px]">
        <div className="space-y-5">
          <RuntimeCard createHub={createHub} />

          {step === "setup" ? (
            <SetupStep
              createHub={createHub}
              startDate={startDate}
              endDate={endDate}
              startingPoint={startingPoint}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onStartingPointChange={setStartingPoint}
            />
          ) : null}

          {step === "context" ? (
            <ContextStep
              goalsText={goalsText}
              constraintsText={constraintsText}
              userNotes={userNotes}
              planningIntent={planningIntent}
              weekMood={weekMood}
              strictness={strictness}
              mainFocus={mainFocus}
              avoidThisWeekText={avoidThisWeekText}
              specialNotes={specialNotes}
              tradeoffPreference={tradeoffPreference}
              failureMode={failureMode}
              adherencePriority={adherencePriority}
              changeTolerance={changeTolerance}
              regenerationPriority={regenerationPriority}
              constraintsProfile={constraintsProfile}
              currentState={currentState}
              output={output}
              onGoalsChange={setGoalsText}
              onConstraintsChange={setConstraintsText}
              onUserNotesChange={setUserNotes}
              onPlanningIntentChange={setPlanningIntent}
              onWeekMoodChange={setWeekMood}
              onStrictnessChange={setStrictness}
              onMainFocusChange={setMainFocus}
              onAvoidThisWeekChange={setAvoidThisWeekText}
              onSpecialNotesChange={setSpecialNotes}
              onTradeoffPreferenceChange={setTradeoffPreference}
              onFailureModeChange={setFailureMode}
              onAdherencePriorityChange={setAdherencePriority}
              onChangeToleranceChange={setChangeTolerance}
              onRegenerationPriorityChange={setRegenerationPriority}
              onConstraintsProfileChange={setConstraintsProfile}
              onCurrentStateChange={setCurrentState}
              onOutputChange={setOutput}
            />
          ) : null}

          {step === "preview" ? <PreviewStep createHub={createHub} /> : null}
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-[80px] z-20 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent px-6 pb-4 pt-6">
        {step === "setup" ? (
          <div className="grid gap-2">
            <PrimaryButton onClick={() => void generate()} disabled={!canGenerate}>
              {createHub.status === "generating" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Plan generieren
                  <Sparkles size={18} />
                </>
              )}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setStep("context")}
              className="h-11 rounded-[14px] border border-[#D9D6CC] bg-white text-[12px] font-bold text-gray-800 shadow-sm"
            >
              Kontext anpassen
            </button>
          </div>
        ) : null}

        {step === "context" ? (
          <PrimaryButton onClick={() => void generate()} disabled={!canGenerate}>
            {createHub.status === "generating" ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Plan generieren
                <Sparkles size={18} />
              </>
            )}
          </PrimaryButton>
        ) : null}

        {step === "preview" ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!createHub.bundle || createHub.status === "saving"}
              onClick={() => void save("draft")}
              className="flex h-14 items-center justify-center rounded-[14px] border border-[#D9D6CC] bg-white px-3 text-[13px] font-bold text-gray-800 shadow-sm disabled:opacity-50"
            >
              Als Draft speichern
            </button>
            <button
              type="button"
              disabled={!createHub.bundle || createHub.status === "saving"}
              onClick={() => void save("activate")}
              className="flex h-14 items-center justify-center gap-2 rounded-[14px] bg-[#5E7A5E] px-3 text-[13px] font-bold text-white shadow-lg disabled:opacity-50"
            >
              {createHub.status === "saving" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Direkt aktivieren"
              )}
            </button>
          </div>
        ) : null}
      </footer>
    </div>
  );
}

function isIsoDateParam(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function GenerationOverlay({ activeStep }: { activeStep: number }) {
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

function RuntimeCard({ createHub }: { createHub: ReturnType<typeof useCreateHub> }) {
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
            {isSignedIn ? "Bereit fuer KI-Generierung" : "Anmeldung erforderlich"}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {isSignedIn
              ? createHub.userEmail ?? "Supabase Session aktiv."
              : "KI-Plaene laufen ueber eine geschuetzte Supabase Edge Function."}
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

function SetupStep({
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
  const focusSummary = preferences?.week.focusAreas[0] ?? "Ein grosses Thema pro Woche";

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
            Deinen Plan fuer die Woche
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
            badge="Naechste Woche"
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

function ContextStep({
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
        <h2 className="text-xl font-bold text-gray-900">Kontext fuer die KI</h2>
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
      return "KI-Backend ist nicht vollstaendig konfiguriert.";
    case "auth_required":
      return "Die Sitzung ist nicht mehr gueltig.";
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
      return "Die Edge Function laeuft, aber benoetigte Secrets wie OPENAI_API_KEY fehlen.";
    case "auth_required":
      return "Bitte melde dich erneut an und starte die Generierung noch einmal.";
    case "openai_timeout":
      return "Das Backend hat innerhalb des Zeitlimits keine Antwort von OpenAI erhalten.";
    case "openai_request_failed":
      return "Der Request an OpenAI oder die Edge Function ist fehlgeschlagen.";
    case "openai_response_invalid":
      return "OpenAI hat geantwortet, aber die Rueckgabe passt nicht zum erwarteten Planformat.";
    case "invalid_request":
      return "Mindestens ein Eingabewert wurde vom Backend als ungueltig erkannt.";
    default:
      return error.message;
  }
}

function PreviewStep({ createHub }: { createHub: ReturnType<typeof useCreateHub> }) {
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

function SelectBlock({
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
          <option key={option || "empty"} value={option}>
            {option || "none"}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextInputBlock({
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

function BooleanBlock({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-[14px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#5E7A5E]"
      />
    </label>
  );
}

function JsonBlock({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  return (
    <label className="block rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <textarea
        value={text}
        rows={5}
        onChange={(event) => {
          const nextText = event.target.value;
          setText(nextText);

          try {
            const parsed = JSON.parse(nextText);
            setError(null);
            onChange(parsed);
          } catch {
            setError("JSON ungueltig.");
          }
        }}
        className="mt-3 w-full resize-none bg-transparent font-mono text-[12px] leading-relaxed text-gray-800 outline-none"
      />
      {error ? <span className="mt-1 block text-[10px] font-bold text-[#9C3A3A]">{error}</span> : null}
    </label>
  );
}

function OutputPreferencesBlock({
  output,
  onChange,
}: {
  output: NonNullable<PlanBundleGenerationRequest["output"]>;
  onChange: (value: NonNullable<PlanBundleGenerationRequest["output"]>) => void;
}) {
  const updateOutput = (patch: Partial<NonNullable<PlanBundleGenerationRequest["output"]>>) =>
    onChange({ ...output, ...patch });

  return (
    <details className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-gray-500">
        Output Preferences
      </summary>
      <div className="mt-4 grid gap-3">
        <SelectBlock
          label="Detail Level"
          value={output.detailLevel ?? "normal"}
          options={["compact", "normal", "detailed"]}
          onChange={(detailLevel) =>
            updateOutput({
              detailLevel: detailLevel as NonNullable<
                PlanBundleGenerationRequest["output"]
              >["detailLevel"],
            })
          }
        />
        <SelectBlock
          label="Explanation Level"
          value={output.explanationLevel ?? "short"}
          options={["none", "short", "detailed"]}
          onChange={(explanationLevel) =>
            updateOutput({
              explanationLevel: explanationLevel as NonNullable<
                PlanBundleGenerationRequest["output"]
              >["explanationLevel"],
            })
          }
        />
        <SelectBlock
          label="Risk Tolerance"
          value={output.riskTolerance ?? "balanced"}
          options={["conservative", "balanced", "ambitious"]}
          onChange={(riskTolerance) =>
            updateOutput({
              riskTolerance: riskTolerance as NonNullable<
                PlanBundleGenerationRequest["output"]
              >["riskTolerance"],
            })
          }
        />
        <SelectBlock
          label="Communication"
          value={output.communicationStyle ?? "direct_de"}
          options={["casual_de", "direct_de", "coaching_de"]}
          onChange={(communicationStyle) =>
            updateOutput({
              communicationStyle: communicationStyle as NonNullable<
                PlanBundleGenerationRequest["output"]
              >["communicationStyle"],
            })
          }
        />
        <SelectBlock
          label="Format"
          value={output.format ?? "cards"}
          options={["calendar", "checklist", "timeline", "cards"]}
          onChange={(format) =>
            updateOutput({
              format: format as NonNullable<PlanBundleGenerationRequest["output"]>["format"],
            })
          }
        />
        <SelectBlock
          label="Conflict Resolution"
          value={output.conflictResolutionStyle ?? "adaptive"}
          options={["strict", "suggestive", "adaptive"]}
          onChange={(conflictResolutionStyle) =>
            updateOutput({
              conflictResolutionStyle: conflictResolutionStyle as NonNullable<
                PlanBundleGenerationRequest["output"]
              >["conflictResolutionStyle"],
            })
          }
        />
        {[
          "includeAlternatives",
          "includePrepSteps",
          "includeShoppingList",
          "includeRationale",
          "includeFallbacks",
          "includeRecoveryNotes",
          "includeLeftoverPlan",
          "includeStorageHints",
          "includeBatchCookingPlan",
          "includeTimeEstimates",
          "includeConstraintWarnings",
        ].map((key) => (
          <BooleanBlock
            key={key}
            label={key}
            value={Boolean(output[key as keyof typeof output])}
            onChange={(value) => updateOutput({ [key]: value })}
          />
        ))}
      </div>
    </details>
  );
}

function DateInput({
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
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      />
    </label>
  );
}

function SegmentedStartingPoint({
  value,
  onChange,
}: {
  value: PlanBundleGenerationRequest["startingPoint"];
  onChange: (value: PlanBundleGenerationRequest["startingPoint"]) => void;
}) {
  const options: Array<{
    value: PlanBundleGenerationRequest["startingPoint"];
    label: string;
  }> = [
    { value: "new", label: "Neu" },
    { value: "previous-week", label: "Letzte Woche" },
    { value: "current-plan", label: "Aktuell" },
  ];

  return (
    <div className="rounded-[16px] bg-[#EBEAE4] p-1">
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-10 rounded-[12px] text-[12px] font-bold transition-colors ${
              value === option.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextAreaBlock({
  icon: Icon,
  label,
  value,
  rows = 5,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
        <Icon size={15} className="text-[#5E7A5E]" />
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full resize-none bg-transparent text-[13px] leading-relaxed text-gray-800 outline-none"
      />
    </label>
  );
}

function StepPill({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <div
      className={`h-8 rounded-full text-center text-[11px] font-bold leading-8 ${
        active || done ? "bg-[#E5EFE5] text-[#4A634A]" : "bg-white text-gray-400"
      }`}
    >
      {label}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: import("react").ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-[#5E7A5E] text-[15px] font-bold text-white shadow-lg transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function previousStep(step: WizardStep): WizardStep {
  if (step === "preview") {
    return "context";
  }

  return "setup";
}

function getNextWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const daysUntilNextMonday = ((8 - day) % 7) || 7;
  const start = new Date(today);
  start.setDate(today.getDate() + daysUntilNextMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

function toInputDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildGoalsFromPreferences(
  preferences: NonNullable<ReturnType<typeof useCreateHub>["preferences"]>,
) {
  return [
    ...preferences.week.focusAreas,
    `${preferences.training.sessionsPerWeek} Trainingseinheiten pro Woche`,
    `${preferences.nutrition.dietType} essen`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildConstraintsFromPreferences(
  preferences: NonNullable<ReturnType<typeof useCreateHub>["preferences"]>,
) {
  const constraints = [
    "Keine medizinische Beratung",
    `Meal Prep bis ${preferences.nutrition.mealPrepMinutes ?? 45} Minuten`,
    `Training ${preferences.training.intensityPreference} und editierbar planen`,
    `Wochenplanung ${preferences.week.planningStyle} mit ${preferences.week.bufferPreference} Puffern`,
  ];

  if (preferences.nutrition.allergies.length > 0) {
    constraints.push(`Allergien: ${preferences.nutrition.allergies.join(", ")}`);
  }

  if (preferences.training.limitations.length > 0) {
    constraints.push(`Training-Limits: ${preferences.training.limitations.join(", ")}`);
  }

  return constraints.join("\n");
}

function buildNotesFromProfile(displayName?: string) {
  return `Plane eine realistische Woche${displayName ? ` fuer ${displayName}` : ""} mit klaren Meals, Training und Tagesstruktur.`;
}

function buildStructuredGoals({
  planningIntent,
  weekMood,
  mainFocus,
  tradeoffPreference,
  preferences,
}: {
  planningIntent: NonNullable<PlanBundleGenerationRequest["planningIntent"]>;
  weekMood: NonNullable<PlanBundleGenerationRequest["weekMood"]>;
  mainFocus: string;
  tradeoffPreference: NonNullable<PlanBundleGenerationRequest["tradeoffPreference"]>;
  preferences: ReturnType<typeof useCreateHub>["preferences"];
}) {
  const goals = [
    `Plan Intent: ${planningIntent}`,
    `Week Mood: ${weekMood}`,
    `Tradeoff: ${tradeoffPreference}`,
  ];

  if (mainFocus.trim()) {
    goals.push(`Main Focus: ${mainFocus.trim()}`);
  }

  const primaryTarget = preferences?.training.targetEvents?.find(
    (event) => event.id === preferences.training.primaryTargetEventId,
  );

  if (primaryTarget) {
    goals.push(
      `Primary Training Target: ${primaryTarget.title}${primaryTarget.timeHorizonWeeks ? ` in ${primaryTarget.timeHorizonWeeks} weeks` : ""}`,
    );
  }

  if (preferences?.training.platforms?.length) {
    goals.push(`Training platforms: ${preferences.training.platforms.join(", ")}`);
  }

  return goals;
}

function buildStructuredConstraints({
  strictness,
  avoidThisWeek,
  failureMode,
  adherencePriority,
  changeTolerance,
  regenerationPriority,
  output,
}: {
  strictness: NonNullable<PlanBundleGenerationRequest["strictness"]>;
  avoidThisWeek: string[];
  failureMode: PlanBundleGenerationRequest["failureMode"];
  adherencePriority: NonNullable<PlanBundleGenerationRequest["adherencePriority"]>;
  changeTolerance: NonNullable<PlanBundleGenerationRequest["changeTolerance"]>;
  regenerationPriority: NonNullable<PlanBundleGenerationRequest["regenerationPriority"]>;
  output: NonNullable<PlanBundleGenerationRequest["output"]>;
}) {
  return [
    `Strictness: ${strictness}`,
    `Adherence priority: ${adherencePriority}`,
    `Change tolerance: ${changeTolerance}`,
    `Regeneration priority: ${regenerationPriority}`,
    `Risk tolerance: ${output.riskTolerance ?? "balanced"}`,
    failureMode ? `Avoid failure mode: ${failureMode}` : "",
    ...avoidThisWeek.map((item) => `Avoid this week: ${item}`),
  ].filter(Boolean);
}

function emptyToUndefined(value: string) {
  return value.trim() ? value.trim() : undefined;
}

function formatDateRange(startDate: string, endDate: string) {
  return `${formatInputDate(startDate)} bis ${formatInputDate(endDate)}`;
}

function formatInputDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

function formatOptionLabel(value: string) {
  const labels: Record<string, string> = {
    omnivore: "Omnivor",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    pescetarian: "Pescetarisch",
  };

  return labels[value] ?? value;
}
