import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, Loader2, Sparkles } from "lucide-react";
import type { PlanBundleActivationMode, PlanBundleGenerationRequest } from "../../application";
import { useCreateHub } from "../createHub/useCreateHub";
import { ContextStep, GenerationOverlay, PreviewStep, RuntimeCard, SetupStep } from "../createHub/CreateHubSteps";
import { PrimaryButton, StepPill } from "../components/forms/FormBlocks";
import { buildConstraintsFromPreferences, buildGoalsFromPreferences, buildNotesFromProfile, buildStructuredConstraints, buildStructuredGoals, defaultConstraints, defaultGoals, defaultOutput, emptyToUndefined, getNextWeekRange, previousStep, toLines, type WizardStep } from "../createHub/createHubFormModel";

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
            aria-label="Zurück"
          >
            <ChevronLeft size={22} className="text-gray-900" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E7A5E]">
              KI Create Hub
            </p>
            <h1 className="truncate text-lg font-bold text-gray-900">
              Neue Pläne erstellen
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
