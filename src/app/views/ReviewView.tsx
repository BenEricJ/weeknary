import React, { useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import {
  getISOWeekRange,
  getISOWeekYear,
} from "../calendarWeekOptions";
import { parseIsoDate } from "../dateDisplay";
import { usePlanCalendarSelection } from "../planCalendarSelection";
import { useActiveTrainingPlan } from "../trainingPlan/useActiveTrainingPlan";
import {
  buildTrainingEntries,
  getTrainingCompletionWeekKey,
  summarizeTrainingCompletion,
  useTrainingCompletionOverrides,
} from "../trainingPlan/trainingCompletion";

export function ReviewView() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const activeTrainingPlan = useActiveTrainingPlan();
  const { selectedDate, selectedWeek } = usePlanCalendarSelection();
  const selectedWeekYear = useMemo(
    () => getISOWeekYear(parseIsoDate(selectedDate)),
    [selectedDate],
  );
  const selectedWeekRange = useMemo(
    () => getISOWeekRange(selectedWeekYear, selectedWeek),
    [selectedWeek, selectedWeekYear],
  );
  const completionWeekKey = useMemo(
    () => getTrainingCompletionWeekKey(selectedWeekRange),
    [selectedWeekRange],
  );
  const { missedIds } = useTrainingCompletionOverrides(completionWeekKey);
  const trainingEntries = useMemo(
    () =>
      buildTrainingEntries(
        activeTrainingPlan.rows,
        activeTrainingPlan.weekDays,
        activeTrainingPlan.plan?.source === "generated",
      ).filter(
        (entry) =>
          entry.date >= selectedWeekRange.startDate &&
          entry.date <= selectedWeekRange.endDate,
      ),
    [
      activeTrainingPlan.plan?.source,
      activeTrainingPlan.rows,
      activeTrainingPlan.weekDays,
      selectedWeekRange.endDate,
      selectedWeekRange.startDate,
    ],
  );
  const trainingSummary = useMemo(
    () => summarizeTrainingCompletion(trainingEntries, missedIds),
    [missedIds, trainingEntries],
  );
  const overallScore = useMemo(() => {
    const staticScores = [8.3, 7.9, 8.9];
    const total = staticScores.reduce((sum, score) => sum + score, trainingSummary.score);
    return Number((total / (staticScores.length + 1)).toFixed(1));
  }, [trainingSummary.score]);
  const weekLabel = `${formatGermanDate(selectedWeekRange.startDate)} - ${formatGermanDate(
    selectedWeekRange.endDate,
  )}`;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <AppTabHeader
        icon={ClipboardCheck}
        title="Review"
        subtitle={
          <>
            KW {selectedWeek}
            {" · "}
            {trainingSummary.completed} von {trainingSummary.planned} Einheiten erledigt
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pb-[96px] pt-[112px]">
        <div className="mt-4">
          <h2 className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-900">
            KW {selectedWeek} · {weekLabel}
          </h2>

          <p className="mb-6 flex items-center gap-1.5 text-[15px] text-gray-800">
            Diese Woche hast du {trainingSummary.completed} von{" "}
            {trainingSummary.planned} Trainingseinheiten abgeschlossen.
            <span className="flex items-center justify-center rounded-[4px] bg-[#5E7A5E] px-[3px] py-[1px] text-sm leading-none text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3 w-3 text-white"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </p>

          <div className="mb-5 rounded-[20px] border border-[#E8E6DD] bg-[#F1EFE7] p-5 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="relative h-[88px] w-[88px] shrink-0">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E2E4DA"
                    strokeWidth="11"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#5E7A5E"
                    strokeWidth="11"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - overallScore / 10)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#1A1A1A]">
                  <span className="text-[26px] font-bold leading-none tracking-tight">
                    {overallScore.toFixed(1)}
                  </span>
                  <span className="mt-0.5 text-[10px] font-medium text-gray-600">
                    Score
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="mb-1 text-[19px] font-bold leading-snug tracking-tight text-gray-900">
                  {trainingSummary.missed > 0 ? "Solide Woche" : "Starke Woche!"}
                </h3>
                <p className="text-[13px] leading-[1.35] text-gray-600">
                  {trainingSummary.missed > 0
                    ? "Du hast Einheiten geschafft und siehst klar, was offen geblieben ist."
                    : "Du warst konstant und hast gute Entscheidungen getroffen."}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-7 flex flex-col gap-[18px] rounded-[20px] border border-[#E8E6DD] bg-white p-[22px] shadow-sm">
            <ProgressBar label="Ernährung" score={8.3} />
            <ProgressBar label="Training" score={trainingSummary.score} />
            <ProgressBar label="Schlaf" score={7.9} />
            <ProgressBar label="Umsetzung" score={8.9} />
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-900">
              WAS LIEF GUT?
            </h3>
            <div className="flex flex-col gap-3.5 rounded-[20px] border border-[#E8E6DD] bg-white p-5 shadow-sm">
              <ListItem
                type="good"
                text={`${trainingSummary.completed} Trainingseinheiten abgeschlossen`}
              />
              <ListItem type="good" text="Protein-Ziel an 6 von 7 Tagen erreicht" />
              <ListItem type="good" text="Früh ins Bett gegangen" />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-900">
              WAS KANN BESSER WERDEN?
            </h3>
            <div className="flex flex-col gap-3.5 rounded-[20px] border border-[#F2E8E8] bg-[#FCF8F8] p-5 shadow-sm">
              {trainingSummary.missed > 0 ? (
                <ListItem
                  type="bad"
                  text={`${trainingSummary.missed} Trainingseinheiten nicht durchgeführt`}
                />
              ) : null}
              <ListItem type="bad" text="Kalorien an 2 Tagen etwas zu niedrig" />
              <ListItem type="bad" text="Mehr Gemüsevielfalt anstreben" />
            </div>
          </div>
        </div>
      </div>
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={setIsProfileOpen}
      />
    </div>
  );
}

function ProgressBar({ label, score }: { label: string; score: number }) {
  const percentage = (score / 10) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-[13.5px] font-semibold text-gray-900">
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E2E4DA]">
        <div
          className="h-full rounded-full bg-[#5E7A5E]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[13.5px] font-semibold text-gray-500">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function ListItem({ type, text }: { type: "good" | "bad"; text: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
          type === "good" ? "bg-[#5E7A5E]" : "bg-[#E57373]"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[11px] w-[11px] text-white"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {type === "good" ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          )}
        </svg>
      </div>
      <span className="text-[14px] font-medium leading-snug text-gray-700">
        {text}
      </span>
    </div>
  );
}

function formatGermanDate(isoDate: string) {
  const date = parseIsoDate(isoDate);

  return `${date.getDate()}. ${date.toLocaleString("de-DE", {
    month: "short",
  })}`;
}
