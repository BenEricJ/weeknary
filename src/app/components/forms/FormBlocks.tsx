import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { PlanBundleGenerationRequest } from "../../../application";

export function SelectBlock({
  label,
  value,
  options,
  onChange,
  formatLabel = (option) => option || "none",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  formatLabel?: (option: string) => string;
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
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextInputBlock({
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

export function NumberInputBlock({
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
        onChange={(event) => {
          const raw = event.target.value.trim();
          const parsed = Number(raw);
          onChange(raw && Number.isFinite(parsed) ? parsed : undefined);
        }}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      />
    </label>
  );
}

export function LineListBlock({
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
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
        className="mt-2 w-full resize-none bg-transparent text-[13px] leading-relaxed text-gray-900 outline-none"
      />
    </label>
  );
}

export function BooleanBlock({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
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

export function JsonBlock({
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
            setError("JSON ungültig.");
          }
        }}
        className="mt-3 w-full resize-none bg-transparent font-mono text-[12px] leading-relaxed text-gray-800 outline-none"
      />
      {error ? <span className="mt-1 block text-[10px] font-bold text-[#9C3A3A]">{error}</span> : null}
    </label>
  );
}

export function OutputPreferencesBlock({
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

export function DateInput({
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

export function SegmentedStartingPoint({
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

export function TextAreaBlock({
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

export function StepPill({
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

export function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
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

