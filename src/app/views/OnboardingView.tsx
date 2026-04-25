import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Apple,
  ClipboardCheck,
  Dumbbell,
  Leaf,
  Loader2,
  Lock,
  Mail,
  Moon,
} from "lucide-react";
import type { AuthCredentials } from "../../application";
import { authProvider } from "../supabaseRuntime";
import { profileRuntime, resolveProfileRuntime } from "../profile/profileRuntime";
import mountainImage from "../../assets/84a42e7a8e5c881ba0e5be072d2446217bebb0cd.png";

type OnboardingStep = 0 | 1 | 2 | 3;
type AuthMode = "signIn" | "createAccount" | "demo";

interface OnboardingPrefs {
  displayName: string;
  email: string;
  password: string;
  kcalGoal: number;
  sessionsPerWeek: number;
  trainingHours: number;
}

const domainCards = [
  {
    icon: Apple,
    label: "Ernaehrung",
    desc: "Vegan und alltagstauglich",
  },
  {
    icon: Dumbbell,
    label: "Training",
    desc: "Volumen passend zum Rhythmus",
  },
  {
    icon: ClipboardCheck,
    label: "Review",
    desc: "Rueckblick und naechste Ziele",
  },
  {
    icon: Moon,
    label: "Schlaf",
    desc: "Erholung als Planungsfaktor",
  },
];

export function OnboardingView() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(0);
  const [prefs, setPrefs] = useState<OnboardingPrefs>({
    displayName: "Ben",
    email: "",
    password: "",
    kcalGoal: 2200,
    sessionsPerWeek: 3,
    trainingHours: 5,
  });
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const isRemoteConfigured = profileRuntime.isRemoteConfigured;

  const canSubmit = useMemo(() => {
    if (!prefs.displayName.trim() || status === "saving") {
      return false;
    }

    if (!isRemoteConfigured) {
      return true;
    }

    return Boolean(prefs.email.trim() && prefs.password.length >= 6);
  }, [isRemoteConfigured, prefs.displayName, prefs.email, prefs.password, status]);

  const updatePrefs = (patch: Partial<OnboardingPrefs>) => {
    setPrefs((current) => ({ ...current, ...patch }));
    setError(null);
  };

  const handleComplete = async (mode: AuthMode) => {
    if (!canSubmit) {
      return;
    }

    setStatus("saving");
    setError(null);

    try {
      if (isRemoteConfigured) {
        const credentials: AuthCredentials = {
          email: prefs.email.trim(),
          password: prefs.password,
        };
        const session =
          mode === "createAccount"
            ? await authProvider.createAccount(credentials)
            : await authProvider.signIn(credentials);

        if (session.status !== "signedIn") {
          throw new Error(
            session.status === "unavailable"
              ? session.reason
              : "Anmeldung fehlgeschlagen. Bitte pruefe E-Mail und Passwort.",
          );
        }
      }

      const runtime = await resolveProfileRuntime();

      if (!runtime.profileService || !runtime.userPreferencesService) {
        throw new Error(runtime.reason ?? "Profil konnte nicht geladen werden.");
      }

      await runtime.profileService.saveProfile({
        ...runtime.profile,
        displayName: prefs.displayName.trim(),
      });

      await runtime.userPreferencesService.saveUserPreferences({
        ...runtime.preferences,
        nutrition: {
          ...runtime.preferences.nutrition,
          dietType: "vegan",
          dailyNutritionTarget: {
            ...runtime.preferences.nutrition.dailyNutritionTarget,
            kcal: prefs.kcalGoal,
          },
        },
        training: {
          ...runtime.preferences.training,
          sessionsPerWeek: prefs.sessionsPerWeek,
          structure: {
            ...runtime.preferences.training.structure,
            weeklyVolumeTargetMinutes: prefs.trainingHours * 60,
          },
        },
      });

      navigate("/app/home");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Onboarding konnte nicht abgeschlossen werden.",
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FAF9F6]">
      {step === 0 ? <SplashStep onNext={() => setStep(1)} /> : null}
      {step === 1 ? <HeroStep onNext={() => setStep(2)} /> : null}
      {step === 2 ? <DomainsStep onNext={() => setStep(3)} /> : null}
      {step === 3 ? (
        <ProfileSetupStep
          prefs={prefs}
          status={status}
          error={error}
          canSubmit={canSubmit}
          isRemoteConfigured={isRemoteConfigured}
          onChange={updatePrefs}
          onBack={() => setStep(2)}
          onSubmit={handleComplete}
        />
      ) : null}
    </div>
  );
}

function SplashStep({ onNext }: { onNext: () => void }) {
  return (
    <section className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-10 text-center">
      <div className="relative h-24 w-24">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#1a1a2e] text-5xl font-bold leading-none text-white shadow-[0_12px_32px_rgba(26,26,46,0.25)]">
          W
        </div>
        <div className="absolute -inset-2 rounded-[34px] border border-dashed border-[#5E7A5E]/50" />
      </div>
      <div>
        <h1 className="text-[28px] font-bold leading-tight tracking-normal text-gray-900">
          Weeknary
        </h1>
        <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
          Deine Woche. In Balance.
        </p>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="mt-3 h-14 w-full rounded-full bg-[#5E7A5E] text-[16px] font-semibold text-white transition-colors hover:bg-[#4D654D] active:scale-[0.98]"
      >
        Los geht's
      </button>
      <p className="text-[11px] leading-relaxed text-gray-400">
        Vegan · Ernaehrung · Training · Schlaf
      </p>
    </section>
  );
}

function HeroStep({ onNext }: { onNext: () => void }) {
  return (
    <section className="absolute inset-0 bg-[#1a1a2e]">
      <img
        src={mountainImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />
      <div className="absolute inset-x-0 bottom-0 px-7 pb-11 text-white">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
          Erzaehl uns ein paar Dinge ueber dich
        </p>
        <h2 className="text-4xl font-bold leading-tight tracking-normal">
          Deine Woche.
          <br />
          In Balance.
        </h2>
        <p className="mt-3 max-w-[280px] text-[13px] leading-relaxed text-white/75">
          Wir erstellen deinen ersten Plan auf Basis deiner Ziele in weniger als
          30 Sekunden.
        </p>
        <button
          type="button"
          onClick={onNext}
          className="mt-7 h-14 w-full rounded-full bg-[#5E7A5E] text-[16px] font-semibold text-white transition-colors hover:bg-[#4D654D] active:scale-[0.98]"
        >
          Weiter
        </button>
        <StepDots active={0} tone="dark" />
      </div>
    </section>
  );
}

function DomainsStep({ onNext }: { onNext: () => void }) {
  return (
    <section className="absolute inset-0 flex flex-col bg-[#FAF9F6] px-6 pb-11 pt-14">
      <div className="flex flex-1 flex-col justify-center">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A634A]">
          Was Weeknary fuer dich tut
        </p>
        <h2 className="text-[30px] font-bold leading-tight tracking-normal text-gray-900">
          Alles.
          <br />
          Verbunden.
        </h2>
        <p className="mt-2 max-w-[285px] text-[13px] leading-relaxed text-gray-500">
          Vier Lebensbereiche. Ein Plan. Abgestimmt auf deinen Rhythmus.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-2.5">
          {domainCards.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F2F4F2]">
                <Icon size={18} className="text-[#4A634A]" />
              </div>
              <p className="text-[13px] font-bold text-gray-900">{label}</p>
              <p className="mt-1 text-[11px] leading-snug text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="h-14 w-full rounded-full bg-[#5E7A5E] text-[16px] font-semibold text-white transition-colors hover:bg-[#4D654D] active:scale-[0.98]"
      >
        Weiter
      </button>
      <StepDots active={1} />
    </section>
  );
}

function ProfileSetupStep({
  prefs,
  status,
  error,
  canSubmit,
  isRemoteConfigured,
  onChange,
  onBack,
  onSubmit,
}: {
  prefs: OnboardingPrefs;
  status: "idle" | "saving";
  error: string | null;
  canSubmit: boolean;
  isRemoteConfigured: boolean;
  onChange: (patch: Partial<OnboardingPrefs>) => void;
  onBack: () => void;
  onSubmit: (mode: AuthMode) => Promise<void>;
}) {
  const isSaving = status === "saving";

  return (
    <section className="absolute inset-0 overflow-y-auto bg-[#FAF9F6] px-6 pb-11 pt-14">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 text-[12px] font-bold text-gray-500"
      >
        Zurueck
      </button>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4A634A]">
        Schritt 3 von 3
      </p>
      <h2 className="text-[28px] font-bold leading-tight tracking-normal text-gray-900">
        Dein Plan.
        <br />
        Dein Weg.
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
        Erzaehl uns ein paar Dinge ueber dich, und wir speichern deinen ersten
        Weeknary-Start.
      </p>

      <div className="mt-7 grid gap-4">
        <TextInput
          label="Wie heisst du?"
          value={prefs.displayName}
          placeholder="Vorname"
          onChange={(displayName) => onChange({ displayName })}
        />

        {isRemoteConfigured ? (
          <div className="grid gap-3 rounded-[18px] border border-[#E6EBE6] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F4F2]">
                <Lock size={18} className="text-[#4A634A]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">Account</p>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  Profil und Plaene werden mit Supabase synchronisiert.
                </p>
              </div>
            </div>
            <TextInput
              label="E-Mail"
              type="email"
              value={prefs.email}
              placeholder="du@example.com"
              icon={Mail}
              onChange={(email) => onChange({ email })}
            />
            <TextInput
              label="Passwort"
              type="password"
              value={prefs.password}
              placeholder="Mindestens 6 Zeichen"
              onChange={(password) => onChange({ password })}
            />
          </div>
        ) : (
          <div className="rounded-[18px] border border-[#E6EBE6] bg-[#F2F4F2] p-4">
            <p className="text-[13px] font-bold text-gray-900">Demo-Modus</p>
            <p className="mt-1 text-[11px] leading-snug text-gray-500">
              Supabase ist nicht konfiguriert. Deine Angaben werden in der lokalen
              Demo-Runtime gespeichert.
            </p>
          </div>
        )}

        <NumberInput
          label="Kalorienziel"
          value={prefs.kcalGoal}
          min={1200}
          max={4000}
          step={50}
          suffix="kcal"
          onChange={(kcalGoal) => onChange({ kcalGoal })}
        />

        <SegmentedNumberInput
          label="Training pro Woche"
          value={prefs.sessionsPerWeek}
          options={[2, 3, 4, 5, 6]}
          suffix="x"
          onChange={(sessionsPerWeek) => onChange({ sessionsPerWeek })}
        />

        <SegmentedNumberInput
          label="Trainingsvolumen"
          value={prefs.trainingHours}
          options={[3, 4, 5, 6, 8]}
          suffix="h"
          onChange={(trainingHours) => onChange({ trainingHours })}
        />

        <div className="flex items-center gap-3 rounded-2xl border border-[#E6EBE6] bg-[#F2F4F2] p-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white">
            <Leaf size={18} className="text-[#4A634A]" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-gray-900">100 % vegan</p>
            <p className="text-[11px] leading-snug text-gray-500">
              Weeknary startet vegan, kein Opt-out erforderlich.
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[14px] border border-[#F0D6D6] bg-[#FFF7F7] p-3 text-[12px] font-bold text-[#9C3A3A]">
            {error}
          </div>
        ) : null}
      </div>

      <div className="mt-7 grid gap-2">
        {isRemoteConfigured ? (
          <div className="grid grid-cols-2 gap-2">
            <SubmitButton
              disabled={!canSubmit}
              loading={isSaving}
              onClick={() => void onSubmit("signIn")}
            >
              Einloggen
            </SubmitButton>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void onSubmit("createAccount")}
              className="h-14 rounded-full border border-[#DAD6CB] bg-white text-[14px] font-bold text-gray-800 shadow-sm disabled:opacity-50"
            >
              Account erstellen
            </button>
          </div>
        ) : (
          <SubmitButton
            disabled={!canSubmit}
            loading={isSaving}
            onClick={() => void onSubmit("demo")}
          >
            Demo starten
          </SubmitButton>
        )}
        <StepDots active={2} />
      </div>
    </section>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  type = "text",
  icon: Icon,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  icon?: typeof Mail;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#4A634A]">
        {label}
      </span>
      <div className="relative">
        {Icon ? (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        ) : null}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 w-full rounded-xl border-0 bg-[#F3F3F5] px-3.5 text-[15px] font-medium text-gray-900 outline-none transition focus:ring-2 focus:ring-[#6A816A]/60 ${
            Icon ? "pl-9" : ""
          }`}
        />
      </div>
    </label>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#4A634A]">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-12 w-full rounded-xl border-0 bg-[#F3F3F5] px-3.5 pr-14 text-[15px] font-medium text-gray-900 outline-none transition focus:ring-2 focus:ring-[#6A816A]/60"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">
          {suffix}
        </span>
      </div>
    </label>
  );
}

function SegmentedNumberInput({
  label,
  value,
  options,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#4A634A]">
        {label}
      </span>
      <div className="grid grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`h-11 rounded-[10px] text-[14px] font-bold transition-colors ${
              value === option
                ? "bg-[#5E7A5E] text-white"
                : "bg-[#F3F3F5] text-gray-700"
            }`}
          >
            {option}
            {suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

function SubmitButton({
  children,
  disabled,
  loading,
  onClick,
}: {
  children: string;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#5E7A5E] text-[15px] font-bold text-white transition-colors hover:bg-[#4D654D] disabled:opacity-50"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : null}
      {loading ? "Wird gespeichert..." : children}
    </button>
  );
}

function StepDots({
  active,
  tone = "light",
}: {
  active: number;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mt-5 flex justify-center gap-1.5">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full transition-all ${
            index === active
              ? "w-5 bg-[#5E7A5E]"
              : tone === "dark"
                ? "w-1.5 bg-white/30"
                : "w-1.5 bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
