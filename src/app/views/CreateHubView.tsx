import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarDays,
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

export function CreateHubView() {
  const navigate = useNavigate();
  const createHub = useCreateHub();
  const defaultRange = useMemo(() => getNextWeekRange(), []);
  const [step, setStep] = useState<WizardStep>("setup");
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [goalsText, setGoalsText] = useState(defaultGoals.join("\n"));
  const [constraintsText, setConstraintsText] = useState(defaultConstraints.join("\n"));
  const [userNotes, setUserNotes] = useState(
    "Plane eine realistische Woche mit klaren Meals, Training und Tagesstruktur.",
  );
  const [didApplyProfileDefaults, setDidApplyProfileDefaults] = useState(false);
  const [startingPoint, setStartingPoint] =
    useState<PlanBundleGenerationRequest["startingPoint"]>("new");

  useEffect(() => {
    if (didApplyProfileDefaults || !createHub.preferences) {
      return;
    }

    setGoalsText(buildGoalsFromPreferences(createHub.preferences));
    setConstraintsText(buildConstraintsFromPreferences(createHub.preferences));
    setUserNotes(buildNotesFromProfile(createHub.profile?.displayName));
    setDidApplyProfileDefaults(true);
  }, [createHub.preferences, createHub.profile, didApplyProfileDefaults]);

  const request = useMemo<PlanBundleGenerationRequest>(
    () => ({
      dateRange: { startDate, endDate },
      timezone: createHub.preferences?.timezone ?? "Europe/Berlin",
      locale: createHub.preferences?.locale ?? "de-DE",
      goals: toLines(goalsText),
      constraints: toLines(constraintsText),
      startingPoint,
      userNotes,
      profile: createHub.profile ?? undefined,
      preferences: createHub.preferences ?? undefined,
    }),
    [
      constraintsText,
      createHub.preferences,
      createHub.profile,
      endDate,
      goalsText,
      startDate,
      startingPoint,
      userNotes,
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
              onGoalsChange={setGoalsText}
              onConstraintsChange={setConstraintsText}
              onUserNotesChange={setUserNotes}
            />
          ) : null}

          {step === "preview" ? <PreviewStep createHub={createHub} /> : null}
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-[80px] z-20 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent px-6 pb-4 pt-6">
        {step === "setup" ? (
          <PrimaryButton onClick={() => setStep("context")} disabled={startDate > endDate}>
            Weiter
          </PrimaryButton>
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

function RuntimeCard({ createHub }: { createHub: ReturnType<typeof useCreateHub> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const credentials: AuthCredentials = { email, password };
  const isSignedIn = createHub.runtimeStatus === "remote-signed-in";

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
          {createHub.error ? (
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
  startDate,
  endDate,
  startingPoint,
  onStartDateChange,
  onEndDateChange,
  onStartingPointChange,
}: {
  startDate: string;
  endDate: string;
  startingPoint: PlanBundleGenerationRequest["startingPoint"];
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStartingPointChange: (
    value: PlanBundleGenerationRequest["startingPoint"],
  ) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Was wird erstellt?</h2>
        <p className="mt-1 text-[13px] leading-snug text-gray-500">
          Ein zusammenhaengender MealPlan, TrainingPlan und WeekPlan.
        </p>
      </div>

      <div className="grid gap-3">
        <HubCard
          icon={Sparkles}
          title="Combined Week Plan"
          subtitle="Meals, Training und Wochenstruktur als Bundle"
          active
        />
        <div className="grid grid-cols-2 gap-3">
          <DateInput label="Start" value={startDate} onChange={onStartDateChange} />
          <DateInput label="Ende" value={endDate} onChange={onEndDateChange} />
        </div>
        <SegmentedStartingPoint
          value={startingPoint}
          onChange={onStartingPointChange}
        />
      </div>
    </section>
  );
}

function ContextStep({
  goalsText,
  constraintsText,
  userNotes,
  onGoalsChange,
  onConstraintsChange,
  onUserNotesChange,
}: {
  goalsText: string;
  constraintsText: string;
  userNotes: string;
  onGoalsChange: (value: string) => void;
  onConstraintsChange: (value: string) => void;
  onUserNotesChange: (value: string) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Kontext fuer die KI</h2>
        <p className="mt-1 text-[13px] leading-snug text-gray-500">
          Die Ausgabe bleibt ein editierbarer Wellness-Plan.
        </p>
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
    </section>
  );
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
  active,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
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
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-gray-900">{title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{subtitle}</p>
      </div>
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
