import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  CheckCircle2,
  Dumbbell,
  Flame,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  Target,
  Timer,
  Waves,
  XCircle,
} from "lucide-react";
import {
  WorkoutDetailDrawer,
  type WorkoutData,
} from "../components/WorkoutDetailDrawer";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import { CalendarEmptyState } from "../components/CalendarEmptyState";
import { WeekCalendar, type DayInfo } from "../components/WeekCalendar";
import {
  CompactNoticeList,
  CompactNoticeRow,
  OverviewSectionHeader,
  WeeklyMetricStrip,
  type WeeklyMetricItem,
} from "../components/overview/OverviewWidgets";
import {
  getISOWeekDays,
  getISOWeekNumber,
  getISOWeekRange,
  getISOWeekYear,
  getSurroundingWeekOptions,
} from "../calendarWeekOptions";
import {
  formatWeekdayShortLabel,
  getDateParts,
  parseIsoDate,
  toIsoDate,
} from "../dateDisplay";
import { usePlanCalendarSelection } from "../planCalendarSelection";
import type {
  GeneratedTrainingWorkout,
  TrainingPlanRow,
} from "../data/trainingPlan";
import {
  buildTrainingEntries,
  evaluateTrainingEntryStatus,
  getTrainingCompletionWeekKey,
  summarizeTrainingCompletion,
  useTrainingCompletionOverrides,
  type TrainingCategory,
  type TrainingCompletionSummary,
  type TrainingEntry,
  type TrainingEntryStatus,
} from "../trainingPlan/trainingCompletion";
import { useActiveTrainingPlan } from "../trainingPlan/useActiveTrainingPlan";

export function TrainingView() {
  const navigate = useNavigate();
  const activeTrainingPlan = useActiveTrainingPlan();
  const {
    selectedDate,
    selectedWeek,
    selectionMode: calendarMode,
    setSelectedDate,
    setSelectedWeek,
    setSelectionMode: setCalendarMode,
  } = usePlanCalendarSelection();
  const currentWeekNumber = useMemo(() => getISOWeekNumber(new Date()), []);
  const selectedWeekYear = useMemo(
    () => getISOWeekYear(parseIsoDate(selectedDate)),
    [selectedDate],
  );
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const selectedTrainingDay = activeTrainingPlan.getRowByDate(selectedDate);
  const selectedDateParts = useMemo(
    () => getDateParts(selectedDate),
    [selectedDate],
  );
  const selectedWeekRange = useMemo(
    () => getISOWeekRange(selectedWeekYear, selectedWeek),
    [selectedWeekYear, selectedWeek],
  );
  const completionWeekKey = useMemo(
    () => getTrainingCompletionWeekKey(selectedWeekRange),
    [selectedWeekRange],
  );
  const { missedIds, setEntryMissed } =
    useTrainingCompletionOverrides(completionWeekKey);
  const trainingDateSet = useMemo(
    () => new Set(activeTrainingPlan.weekDays.map((day) => String(day.date))),
    [activeTrainingPlan.weekDays],
  );
  const weekDays = useMemo(
    () =>
      getISOWeekDays(selectedWeekYear, selectedWeek).map((day) => ({
        ...day,
        hasData: trainingDateSet.has(day.date),
      })),
    [selectedWeek, selectedWeekYear, trainingDateSet],
  );
  const weekOptions = useMemo(
    () =>
      getSurroundingWeekOptions(selectedWeek).map((week) => {
        const range = getISOWeekRange(selectedWeekYear, week.weekNumber);
        return {
          ...week,
          hasData: Array.from(trainingDateSet).some(
            (date) => date >= range.startDate && date <= range.endDate,
          ),
        };
      }),
    [selectedWeek, selectedWeekYear, trainingDateSet],
  );
  const currentDate = useMemo(() => {
    const today = toIsoDate(new Date());
    return weekDays.some((day) => day.date === today) ? today : undefined;
  }, [weekDays]);
  const hasSelectedDayData = useMemo(
    () => trainingDateSet.has(selectedDate),
    [selectedDate, trainingDateSet],
  );
  const hasSelectedWeekData = useMemo(
    () =>
      Array.from(trainingDateSet).some(
        (date) =>
          date >= selectedWeekRange.startDate &&
          date <= selectedWeekRange.endDate,
      ),
    [selectedWeekRange.endDate, selectedWeekRange.startDate, trainingDateSet],
  );
  const selectedWeekDays = useMemo(
    () =>
      weekDays.map((dayInfo) => ({
        dayInfo,
        row: dayInfo.hasData ? activeTrainingPlan.getRowByDate(dayInfo.date) : null,
      })),
    [activeTrainingPlan, weekDays],
  );
  const allEntries = useMemo(
    () =>
      buildTrainingEntries(
        activeTrainingPlan.rows,
        activeTrainingPlan.weekDays,
        activeTrainingPlan.plan?.source === "generated",
      ),
    [activeTrainingPlan.plan?.source, activeTrainingPlan.rows, activeTrainingPlan.weekDays],
  );
  const weekEntries = useMemo(
    () =>
      allEntries.filter(
        (entry) =>
          entry.date >= selectedWeekRange.startDate &&
          entry.date <= selectedWeekRange.endDate,
      ),
    [allEntries, selectedWeekRange.endDate, selectedWeekRange.startDate],
  );
  const todayEntries = useMemo(
    () => weekEntries.filter((entry) => entry.date === selectedDate),
    [selectedDate, weekEntries],
  );
  const completionSummary = useMemo(
    () => summarizeTrainingCompletion(weekEntries, missedIds),
    [missedIds, weekEntries],
  );
  const focusStats = useMemo(
    () => buildFocusStats(weekEntries, completionSummary),
    [completionSummary, weekEntries],
  );
  const weeklyMetrics = useMemo(
    () => buildWeeklyMetrics(weekEntries, completionSummary),
    [completionSummary, weekEntries],
  );

  const createPlanForSelection = () => {
    const range =
      calendarMode === "week"
        ? selectedWeekRange
        : { startDate: selectedDate, endDate: selectedDate };
    navigate(`/app/create?startDate=${range.startDate}&endDate=${range.endDate}`);
  };

  const goToPlanningProfile = () => {
    navigate("/app/profile?tab=planning");
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <AppTabHeader
        icon={Dumbbell}
        iconClassName="text-[#2D82D7]"
        title="Training"
        subtitle={
          <>
            {formatWeekdayShortLabel(selectedTrainingDay.tag)},{" "}
            {selectedTrainingDay.dayDate}. {selectedTrainingDay.monthLabel}
            {" · "}
            {hasSelectedDayData
              ? `${todayEntries.length} ${
                  todayEntries.length === 1 ? "Einheit" : "Einheiten"
                } geplant`
              : "keine Daten"}
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="hide-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto px-6 pb-[88px] pt-[112px]">
        <WeekCalendar
          days={weekDays}
          activeDate={selectedDate}
          onDateChange={setSelectedDate}
          currentDate={currentDate}
          weeks={weekOptions}
          activeWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          currentWeek={currentWeekNumber}
          selectionMode={calendarMode}
          onSelectionModeChange={setCalendarMode}
          className="flex items-center justify-between rounded-[16px] border border-gray-100/60 bg-white p-2 shadow-sm"
        />

        {(calendarMode === "week" ? hasSelectedWeekData : hasSelectedDayData) ? (
          calendarMode === "week" ? (
            <>
              <TrainingFocusCard stats={focusStats} />

              <section className="flex flex-col gap-3">
                <OverviewSectionHeader title="Wochenübersicht" />
                {selectedWeekDays.map(({ dayInfo, row }) => (
                  <WeeklyTrainingDayCard
                    key={dayInfo.date}
                    dayInfo={dayInfo}
                    row={row}
                    entries={weekEntries.filter((entry) => entry.date === dayInfo.date)}
                    missedIds={missedIds}
                    isActive={dayInfo.date === selectedDate}
                    onSelect={() => {
                      setSelectedDate(dayInfo.date);
                      setCalendarMode("day");
                    }}
                  />
                ))}
              </section>

              <section>
                <OverviewSectionHeader title="Diese Woche" />
                <WeeklyMetricStrip metrics={weeklyMetrics} />
              </section>
            </>
          ) : (
            <>
              <TrainingFocusCard stats={focusStats} />

              <section>
                <OverviewSectionHeader title="Heutiges Training" />
                {todayEntries.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {todayEntries.map((entry) => (
                      <TrainingWorkoutRow
                        key={entry.id}
                        entry={entry}
                        dayPrefix={null}
                        onOpen={setSelectedWorkout}
                        status={evaluateTrainingEntryStatus(entry, missedIds)}
                        onMissedChange={setEntryMissed}
                      />
                    ))}
                  </div>
                ) : (
                  <RestDayCard row={selectedTrainingDay} />
                )}
              </section>

              <section>
                <OverviewSectionHeader title="Heute beachten" />
                <CompactNoticeList>
                  <CompactNoticeRow
                    icon={<Waves size={18} className="text-[#2D82D7]" />}
                    title="Ausreichend aufwärmen"
                    description="5-10 Min Mobilität + Aktivierung."
                    iconSurfaceClassName="bg-[#F0F7FF]"
                  />
                  <div className="mx-3 h-px bg-gray-100" />
                  <CompactNoticeRow
                    icon={<Flame size={18} className="text-[#2D82D7]" />}
                    title="Progressiv trainieren"
                    description="Steigere dich Schritt für Schritt."
                    iconSurfaceClassName="bg-[#F0F7FF]"
                  />
                  <div className="mx-3 h-px bg-gray-100" />
                  <CompactNoticeRow
                    icon={<RefreshCw size={18} className="text-[#2D82D7]" />}
                    title="Regeneration nicht vergessen"
                    description="Recovery ist Teil des Fortschritts."
                    iconSurfaceClassName="bg-[#F0F7FF]"
                  />
                </CompactNoticeList>
              </section>

              <section>
                <OverviewSectionHeader title="Diese Woche" />
                <WeeklyMetricStrip metrics={weeklyMetrics} />
              </section>
            </>
          )
        ) : (
          <CalendarEmptyState
            title={
              calendarMode === "week"
                ? `Keine Trainingsdaten für KW ${selectedWeek}`
                : `Keine Trainingsdaten für ${selectedDateParts.dayLabel}, ${selectedDateParts.date}. ${selectedDateParts.monthLabel}`
            }
            description="Für diesen Zeitraum liegt im aktiven TrainingPlan noch keine Einheit vor."
            onCreatePlan={createPlanForSelection}
            onManualAdd={goToPlanningProfile}
          />
        )}
      </div>

      <WorkoutDetailDrawer
        workoutId={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
      <UserProfileDrawer isOpen={isProfileOpen} onClose={setIsProfileOpen} />
    </div>
  );
}

function TrainingFocusCard({
  stats,
}: {
  stats: { planned: number; completed: number; strength: number; endurance: number };
}) {
  return (
    <section
      className="flex flex-col rounded-[20px] border border-[#DDECF8] bg-[#F5FAFF] p-4 shadow-sm"
      style={{ height: 174, minHeight: 174 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Target size={20} className="text-[#2D82D7]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2D82D7]">
              Trainingsfokus
            </p>
            <h2 className="mt-1 text-[16px] font-bold leading-tight text-gray-900">
              Kraft & Ausdauer im Fokus
            </h2>
            <p className="mt-1 text-[11px] font-medium leading-tight text-gray-600">
              Strukturierter Plan für mehr Kraft, Ausdauer und Regeneration.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Trainingsfokus Optionen"
          className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2">
        <FocusKpiCard
          label="Einheiten"
          value={`${stats.completed} / ${stats.planned}`}
          sublabel="abgeschlossen"
        />
        <FocusKpiCard
          label="Kraft"
          value={`${stats.strength}`}
          sublabel={stats.strength === 1 ? "Einheit" : "Einheiten"}
        />
        <FocusKpiCard
          label="Ausdauer"
          value={`${stats.endurance}`}
          sublabel={stats.endurance === 1 ? "Einheit" : "Einheiten"}
        />
      </div>
    </section>
  );
}

function FocusKpiCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="h-[58px] rounded-[14px] border border-white/80 bg-white/90 px-2 py-1.5 text-center shadow-sm">
      <p className="truncate text-[8px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-bold leading-none text-gray-900">
        {value}
      </p>
      <p className="mt-1 truncate text-[8px] font-semibold leading-tight text-gray-500">
        {sublabel}
      </p>
    </div>
  );
}

function TrainingWorkoutRow({
  entry,
  dayPrefix,
  onOpen,
  status,
  onMissedChange,
  compact = false,
}: {
  entry: TrainingEntry;
  dayPrefix: string | null;
  onOpen: (workoutId: string) => void;
  status: TrainingEntryStatus;
  onMissedChange: (entryId: string, missed: boolean) => void;
  compact?: boolean;
}) {
  const Icon = entry.workout?.icon ?? Activity;
  const badgeLabel = entry.isGenerated ? "KI-Plan" : "Plan";
  const statusLabel =
    status.state === "missed"
      ? "Nicht durchgeführt"
      : status.state === "completed"
        ? "Durchgeführt"
        : "Geplant";
  const statusClassName =
    status.state === "missed"
      ? "bg-[#FCEEEE] text-[#B85450]"
      : status.state === "completed"
        ? "bg-[#EAF2E8] text-[#4A634A]"
        : "bg-[#E7F2FC] text-[#2D82D7]";
  const content = (
    <div className="grid min-h-[78px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white/85 shadow-sm">
        <Icon size={19} className="text-[#2D82D7]" />
      </div>

      <div className="min-w-0">
        <h4 className="line-clamp-2 text-[13.5px] font-bold leading-tight text-gray-900">
          {dayPrefix ? (
            <span className="mr-1 uppercase tracking-[0.12em] text-gray-900">
              {dayPrefix}
            </span>
          ) : null}
          {entry.title}
        </h4>
        <p className="mt-1 truncate text-[11.5px] font-medium leading-tight text-gray-500">
          {entry.subtitle}
        </p>
        <p className="mt-1 truncate text-[11.5px] font-medium leading-tight text-gray-500">
          {entry.focus}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="text-[11px] font-bold leading-tight text-gray-900">
          {entry.timeLabel}
        </p>
        <span className="rounded-[8px] bg-[#E7F2FC] px-2 py-0.5 text-[10px] font-bold text-[#2D82D7]">
          {badgeLabel}
        </span>
      </div>
    </div>
  );
  const className = compact
    ? "w-full text-left transition-colors hover:bg-white/35"
    : "w-full rounded-[18px] border border-[#DDECF8] bg-[#F5FAFF] text-left shadow-sm transition-colors hover:brightness-[0.99] active:scale-[0.99]";

  return (
    <div className={className}>
      {entry.workout ? (
        <button
          type="button"
          onClick={() => onOpen(entry.workoutId)}
          className="w-full text-left"
          aria-label={`${entry.title} öffnen`}
        >
          {content}
        </button>
      ) : (
        content
      )}
      <TrainingStatusActions
        entry={entry}
        status={status}
        statusLabel={statusLabel}
        statusClassName={statusClassName}
        onMissedChange={onMissedChange}
      />
    </div>
  );

}

function TrainingStatusActions({
  entry,
  status,
  statusLabel,
  statusClassName,
  onMissedChange,
}: {
  entry: TrainingEntry;
  status: TrainingEntryStatus;
  statusLabel: string;
  statusClassName: string;
  onMissedChange: (entryId: string, missed: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 px-3 pb-3">
      <span className={`rounded-[8px] px-2 py-0.5 text-[9px] font-bold ${statusClassName}`}>
        {statusLabel}
      </span>
      {status.canMarkMissed ? (
        <button
          type="button"
          onClick={() => onMissedChange(entry.id, !status.missed)}
          className="rounded-[8px] bg-white/70 px-2 py-1 text-[9px] font-bold text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-gray-800"
        >
          {status.missed ? "Als durchgeführt werten" : "Nicht durchgeführt"}
        </button>
      ) : null}
    </div>
  );
}

function RestDayCard({ row }: { row: TrainingPlanRow }) {
  return (
    <div className="rounded-[18px] border border-[#EBEAE4] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#F0F7FF]">
          <RefreshCw size={19} className="text-[#2D82D7]" />
        </div>
        <div className="min-w-0">
          <h4 className="text-[13.5px] font-bold leading-tight text-gray-900">
            Kein fixes Training
          </h4>
          <p className="mt-1 text-[11.5px] font-medium leading-snug text-gray-500">
            {row.recoveryNote ??
              "Nutze den Tag für Erholung, Mobility oder einen lockeren Spaziergang."}
          </p>
        </div>
      </div>
    </div>
  );
}

function WeeklyTrainingDayCard({
  dayInfo,
  row,
  entries,
  missedIds,
  isActive,
  onSelect,
}: {
  dayInfo: DayInfo<string>;
  row: TrainingPlanRow | null;
  entries: TrainingEntry[];
  missedIds: Set<string>;
  isActive: boolean;
  onSelect: () => void;
}) {
  const firstEntry = entries[0];
  const daySummary = summarizeTrainingCompletion(entries, missedIds);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[14px] border px-3 py-2 text-left shadow-sm transition-colors active:scale-[0.99] ${
        isActive
          ? "border-[#DDECF8] bg-[#F5FAFF]"
          : "border-gray-100 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-900">
            {row?.dayLabel ?? dayInfo.day}
          </p>
          <p className="text-[11px] text-gray-500">
            {row ? `${row.dayDate}. ${row.monthLabel}` : dayInfo.displayDate ?? dayInfo.date}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight text-gray-900">
            {firstEntry?.title ?? (row ? "Kein fixes Training" : "Kein TrainingPlan")}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-gray-500">
            {firstEntry?.subtitle ??
              row?.recoveryNote ??
              "Für diesen Tag liegt keine Einheit vor."}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[12px] font-bold text-gray-900">
            {entries.length} {entries.length === 1 ? "Einheit" : "Einheiten"}
          </p>
          {entries.length > 0 ? (
            <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] font-bold">
              <span className="flex items-center gap-0.5 text-[#4A634A]">
                <CheckCircle2 size={10} />
                {daySummary.completed}
              </span>
              <span className="flex items-center gap-0.5 text-[#B85450]">
                <XCircle size={10} />
                {daySummary.missed}
              </span>
            </div>
          ) : (
            <p className="mt-0.5 text-[10px] font-semibold text-[#2D82D7]">
              Flexibel
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function buildFocusStats(
  entries: TrainingEntry[],
  summary: TrainingCompletionSummary,
) {
  return {
    planned: summary.planned,
    completed: summary.completed,
    strength: entries.filter((entry) => entry.category === "strength").length,
    endurance: entries.filter((entry) => entry.category === "endurance").length,
  };
}

function buildWeeklyMetrics(
  entries: TrainingEntry[],
  summary: TrainingCompletionSummary,
): WeeklyMetricItem[] {
  const trainingMinutes = entries.reduce(
    (sum, entry) => sum + getEntryDurationMinutes(entry),
    0,
  );

  return [
    {
      icon: <Dumbbell size={12} className="shrink-0 text-[#2D82D7]" />,
      label: "Einheiten",
      value: `${summary.completed} / ${summary.planned}`,
      progress: summary.progressPercent,
      accentClassName: "bg-[#2D82D7]",
      trackClassName: "bg-[#DCEAF7]",
      ariaLabel: "Einheiten dieser Woche",
    },
    {
      icon: <Timer size={12} className="shrink-0 text-[#2D82D7]" />,
      label: "Trainingszeit",
      value: formatMinutes(trainingMinutes),
      progress: Math.min((trainingMinutes / 300) * 100, 100),
      accentClassName: "bg-[#2D82D7]",
      trackClassName: "bg-[#DCEAF7]",
      ariaLabel: "Trainingszeit dieser Woche",
    },
    {
      icon: <ShieldCheck size={12} className="shrink-0 text-[#2D82D7]" />,
      label: "Plan",
      value: `${summary.progressPercent}%`,
      progress: summary.progressPercent,
      accentClassName: "bg-[#2D82D7]",
      trackClassName: "bg-[#DCEAF7]",
      ariaLabel: "Planfortschritt dieser Woche",
    },
  ];
}

function getTrainingCategory(
  workout: WorkoutData | null,
  generatedWorkout: GeneratedTrainingWorkout | undefined,
  title: string,
  subtitle: string,
): TrainingCategory {
  if (workout?.sport === "Krafttraining") return "strength";
  if (workout?.sport === "Radfahren" || workout?.sport === "Laufen") return "endurance";
  if (workout?.sport === "Mobilität" || workout?.sport === "Yoga") return "mobility";

  const text = `${title} ${subtitle} ${generatedWorkout?.target ?? ""} ${
    generatedWorkout?.notes ?? ""
  }`.toLowerCase();

  if (/kraft|strength|ganzk|kurzhantel|langhantel|muskel/.test(text)) {
    return "strength";
  }
  if (/ausdauer|endurance|cardio|zone|laufen|ride|zwift|rad/.test(text)) {
    return "endurance";
  }
  if (/mobil|yoga|recovery|regeneration/.test(text)) {
    return "mobility";
  }

  return "other";
}

function splitTimeLabels(value: string) {
  if (value.toLowerCase() === "flexibel") {
    return [];
  }

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatTimeLabel(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed.toLowerCase() === "flexibel") {
    return "Flexibel";
  }

  return trimmed.replace(/\s*-\s*/g, " - ");
}

function getEntryDurationMinutes(entry: TrainingEntry) {
  const fromTimeLabel = parseTimeWindowMinutes(entry.timeLabel);

  if (fromTimeLabel > 0) {
    return fromTimeLabel;
  }

  return parseWorkoutStatsDuration(entry.workout);
}

function parseTimeWindowMinutes(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);

  if (!match) {
    return 0;
  }

  const start = Number(match[1]) * 60 + Number(match[2]);
  let end = Number(match[3]) * 60 + Number(match[4]);

  if (end < start) {
    end += 24 * 60;
  }

  return Math.max(end - start, 0);
}

function parseWorkoutStatsDuration(workout: WorkoutData | null) {
  const durationValue = workout?.statsBar
    .map((stat) => stat.val)
    .find((value) => /min|\bh\b/i.test(value));

  if (!durationValue) {
    return 0;
  }

  const minutes = durationValue.match(/(\d+(?:[,.]\d+)?)\s*min/i);
  if (minutes) {
    return Math.round(Number(minutes[1].replace(",", ".")));
  }

  const hours = durationValue.match(/(\d+(?:[,.]\d+)?)\s*h/i);
  if (hours) {
    return Math.round(Number(hours[1].replace(",", ".")) * 60);
  }

  return 0;
}

function formatMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return "0:00 h";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")} h`;
}
