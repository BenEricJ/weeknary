import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  AlarmClock,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Coffee,
  Edit3,
  Leaf,
  MoreHorizontal,
  Moon,
  Settings2,
  Sparkles,
  Sun,
  Thermometer,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { AppTabHeader } from "../components/AppTabHeader";
import { CalendarEmptyState } from "../components/CalendarEmptyState";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import { WeekCalendar, type DayInfo } from "../components/WeekCalendar";
import { OverviewSectionHeader } from "../components/overview/OverviewWidgets";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "../components/ui/drawer";
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
import {
  SLEEP_PHASE_META,
  buildSleepTrendMetrics,
  buildWeeklyPhaseBars,
  formatClockDuration,
  formatSleepDuration,
  getCurrentWeekSleepEntries,
  getSleepEntriesInRange,
  getSleepEntryByDate,
  getWindDownCompletedCount,
  summarizeSleepWeek,
  type SleepEntry,
  type SleepInsight,
  type SleepPhaseKey,
  type SleepTrendMetric,
  type SleepWindow,
  type SleepWeekSummary,
  type WeeklyPhaseBar,
  type WindDownTask,
} from "../data/sleepPlan";

const SLEEP_ACTIVE_CLASS = "bg-[#6A5F8F] text-white";
const SLEEP_RING_CLASS = "ring-[#C8BEE5]";
const SLEEP_CURRENT_CLASS = "bg-[#F3EFF9] text-[#6A5F8F]";
const SLEEP_DATA_CLASS = "bg-[#F0EBF7] text-[#6A5F8F]";
const PHASE_ORDER: SleepPhaseKey[] = ["deep", "rem", "light", "awake"];

export function SleepView() {
  const navigate = useNavigate();
  const {
    selectedDate,
    selectedWeek,
    selectionMode: calendarMode,
    setSelectedDate,
    setSelectedWeek,
    setSelectionMode: setCalendarMode,
  } = usePlanCalendarSelection();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState<"window" | "note" | "phases" | null>(null);
  const [taskOverrides, setTaskOverrides] = useState<Record<string, boolean>>({});
  const [windowOverrides, setWindowOverrides] = useState<Record<string, SleepWindow>>({});

  const sleepEntries = useMemo(() => getCurrentWeekSleepEntries(), []);
  const currentWeekNumber = useMemo(() => getISOWeekNumber(new Date()), []);
  const selectedWeekYear = useMemo(
    () => getISOWeekYear(parseIsoDate(selectedDate)),
    [selectedDate],
  );
  const selectedWeekRange = useMemo(
    () => getISOWeekRange(selectedWeekYear, selectedWeek),
    [selectedWeek, selectedWeekYear],
  );
  const sleepDateSet = useMemo(
    () => new Set(sleepEntries.map((entry) => entry.isoDate)),
    [sleepEntries],
  );
  const selectedDateParts = useMemo(
    () => getDateParts(selectedDate),
    [selectedDate],
  );
  const selectedEntry = useMemo(
    () => getSleepEntryByDate(sleepEntries, selectedDate),
    [selectedDate, sleepEntries],
  );
  const weekEntries = useMemo(
    () => getSleepEntriesInRange(sleepEntries, selectedWeekRange),
    [selectedWeekRange, sleepEntries],
  );
  const weekSummary = useMemo(
    () => summarizeSleepWeek(weekEntries),
    [weekEntries],
  );
  const weekPhaseBars = useMemo(
    () => buildWeeklyPhaseBars(weekEntries),
    [weekEntries],
  );
  const trendMetrics = useMemo(
    () => (selectedEntry ? buildSleepTrendMetrics(selectedEntry) : []),
    [selectedEntry],
  );
  const weekDays = useMemo(
    () =>
      getISOWeekDays(selectedWeekYear, selectedWeek).map((day) => ({
        ...day,
        hasData: sleepDateSet.has(day.date),
      })),
    [selectedWeek, selectedWeekYear, sleepDateSet],
  );
  const selectedWeekDays = useMemo(
    () =>
      weekDays.map((dayInfo) => ({
        dayInfo,
        entry: getSleepEntryByDate(sleepEntries, dayInfo.date),
      })),
    [sleepEntries, weekDays],
  );
  const weekOptions = useMemo(
    () =>
      getSurroundingWeekOptions(selectedWeek).map((week) => {
        const range = getISOWeekRange(selectedWeekYear, week.weekNumber);
        return {
          ...week,
          hasData: Array.from(sleepDateSet).some(
            (date) => date >= range.startDate && date <= range.endDate,
          ),
        };
      }),
    [selectedWeek, selectedWeekYear, sleepDateSet],
  );
  const currentDate = useMemo(() => {
    const today = toIsoDate(new Date());
    return weekDays.some((day) => day.date === today) ? today : undefined;
  }, [weekDays]);
  const hasSelectedDayData = !!selectedEntry;
  const hasSelectedWeekData = weekEntries.length > 0;
  const selectedWindow = selectedEntry
    ? windowOverrides[selectedEntry.isoDate] ?? selectedEntry.window
    : null;

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

  const toggleTask = (task: WindDownTask) => {
    const currentValue = taskOverrides[task.id] ?? task.completed;
    setTaskOverrides((previous) => ({
      ...previous,
      [task.id]: !currentValue,
    }));
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <AppTabHeader
        icon={Moon}
        iconClassName="text-[#6A5F8F]"
        title="Schlaf"
        subtitle={
          <>
            {formatWeekdayShortLabel(selectedEntry?.dayShort ?? selectedDateParts.dayShort)},{" "}
            {selectedEntry?.date ?? selectedDateParts.date}.{" "}
            {selectedEntry?.monthLabel ?? selectedDateParts.monthLabel}
            {" · "}
            {selectedEntry
              ? `${formatSleepDuration(selectedEntry.durationMinutes)} Schlafzeit`
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
          activeClassName={SLEEP_ACTIVE_CLASS}
          activeRingClassName={SLEEP_RING_CLASS}
          currentClassName={SLEEP_CURRENT_CLASS}
          currentDataClassName={SLEEP_DATA_CLASS}
          dataClassName={SLEEP_DATA_CLASS}
          dataLabelClassName="text-[#6A5F8F]"
          toggleActiveClassName="text-[#6A5F8F]"
        />

        {(calendarMode === "week" ? hasSelectedWeekData : hasSelectedDayData) ? (
          calendarMode === "week" ? (
            <SleepWeekDashboard
              bars={weekPhaseBars}
              summary={weekSummary}
              trendMetrics={trendMetrics}
              days={selectedWeekDays}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setCalendarMode("day");
              }}
            />
          ) : selectedEntry ? (
            <SleepDayDashboard
              entry={selectedEntry}
              sleepWindow={selectedWindow ?? selectedEntry.window}
              onWindowChange={(nextWindow) => {
                setWindowOverrides((previous) => ({
                  ...previous,
                  [selectedEntry.isoDate]: nextWindow,
                }));
              }}
              taskOverrides={taskOverrides}
              onToggleTask={toggleTask}
              onOpenPhases={() => setOpenDrawer("phases")}
              onOpenWindow={() => setOpenDrawer("window")}
              onOpenNote={() => setOpenDrawer("note")}
            />
          ) : null
        ) : (
          <CalendarEmptyState
            title={
              calendarMode === "week"
                ? `Keine Schlafdaten für KW ${selectedWeek}`
                : `Keine Schlafdaten für ${selectedDateParts.dayLabel}, ${selectedDateParts.date}. ${selectedDateParts.monthLabel}`
            }
            description="Für diesen Zeitraum liegt lokal noch kein Schlafeintrag vor."
            onCreatePlan={createPlanForSelection}
            onManualAdd={goToPlanningProfile}
          />
        )}
      </div>

      <SleepWindowDrawer
        entry={selectedEntry}
        sleepWindow={selectedWindow}
        open={openDrawer === "window"}
        onSave={(nextWindow) => {
          if (!selectedEntry) {
            return;
          }

          setWindowOverrides((previous) => ({
            ...previous,
            [selectedEntry.isoDate]: nextWindow,
          }));
          setOpenDrawer(null);
        }}
        onReset={() => {
          if (!selectedEntry) {
            return;
          }

          setWindowOverrides((previous) => {
            const next = { ...previous };
            delete next[selectedEntry.isoDate];
            return next;
          });
          setOpenDrawer(null);
        }}
        onClose={() => setOpenDrawer(null)}
      />
      <SleepPhaseDrawer
        entry={selectedEntry}
        open={openDrawer === "phases"}
        onClose={() => setOpenDrawer(null)}
      />
      <SleepNoteDrawer
        entry={selectedEntry}
        open={openDrawer === "note"}
        onClose={() => setOpenDrawer(null)}
      />
      <UserProfileDrawer isOpen={isProfileOpen} onClose={setIsProfileOpen} />
    </div>
  );
}

function SleepDayDashboard({
  entry,
  sleepWindow,
  onWindowChange,
  taskOverrides,
  onToggleTask,
  onOpenPhases,
  onOpenWindow,
  onOpenNote,
}: {
  entry: SleepEntry;
  sleepWindow: SleepWindow;
  onWindowChange: (sleepWindow: SleepWindow) => void;
  taskOverrides: Record<string, boolean>;
  onToggleTask: (task: WindDownTask) => void;
  onOpenPhases: () => void;
  onOpenWindow: () => void;
  onOpenNote: () => void;
}) {
  return (
    <>
      <LastNightAnalysisCard entry={entry} onOpenPhases={onOpenPhases} />
      <SleepWindowCard
        entry={entry}
        sleepWindow={sleepWindow}
        onWindowChange={onWindowChange}
        onOpen={onOpenWindow}
      />
      <WindDownSection
        entry={entry}
        taskOverrides={taskOverrides}
        onToggleTask={onToggleTask}
      />
      <InsightsSection insights={entry.insights} />
      <SleepNoteSection entry={entry} onOpen={onOpenNote} />
    </>
  );
}

function SleepWeekDashboard({
  bars,
  summary,
  trendMetrics,
  days,
  selectedDate,
  onSelectDate,
}: {
  bars: WeeklyPhaseBar[];
  summary: SleepWeekSummary;
  trendMetrics: SleepTrendMetric[];
  days: Array<{ dayInfo: DayInfo<string>; entry: SleepEntry | null }>;
  selectedDate: string;
  onSelectDate: (date: SleepEntry["isoDate"]) => void;
}) {
  return (
    <>
      <WeeklyPhasesSection bars={bars} summary={summary} activeDate={selectedDate} />
      <TrendSection metrics={trendMetrics} />
      <section className="flex flex-col gap-3">
        <OverviewSectionHeader title="Woche · Nächte" />
        {days.map(({ dayInfo, entry }) => (
          <WeeklyNightRow
            key={dayInfo.date}
            dayInfo={dayInfo}
            entry={entry}
            isActive={dayInfo.date === selectedDate}
            onSelect={() => entry && onSelectDate(entry.isoDate)}
          />
        ))}
      </section>
    </>
  );
}

function LastNightAnalysisCard({
  entry,
  onOpenPhases,
}: {
  entry: SleepEntry;
  onOpenPhases: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenPhases}
      className="w-full rounded-[20px] border border-[#E7E4DF] bg-white p-4 text-left shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.99]"
      aria-label="Phasen-Aufschlüsselung öffnen"
    >
      <div className="grid grid-cols-[94px_minmax(0,1fr)] gap-4">
        <ScoreRing score={entry.score} />
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
              Letzte Nacht
            </p>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7F3FB] text-[#6A5F8F]">
              <MoreHorizontal size={17} />
            </span>
          </div>
          <h2 className="mt-1 text-[19px] font-bold leading-tight text-gray-900">
            {formatSleepDuration(entry.durationMinutes)}
          </h2>
          <p className="mt-1 truncate text-[11px] font-semibold text-gray-500">
            {entry.bedTime} - {entry.wakeTime} · {entry.phases.length} Phasen ·{" "}
            {entry.awakenings} Aufwachen
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusPill icon={<Sparkles size={10} />} label="Erholt" />
            <StatusPill label={`Effizienz ${entry.efficiencyPercent} %`} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6A5F8F]">
            Schlafphasen
          </p>
          <PhaseLegend />
        </div>
        <PhaseTimeline entry={entry} />
      </div>
    </button>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 37;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-[94px] w-[94px] shrink-0">
      <svg className="h-full w-full -rotate-90">
        <circle
          cx="47"
          cy="47"
          r={radius}
          stroke="#E8E2F1"
          strokeWidth="7"
          fill="none"
        />
        <circle
          cx="47"
          cy="47"
          r={radius}
          stroke="#6A5F8F"
          strokeWidth="7"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * score) / 100}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] font-bold uppercase tracking-wide text-[#6A5F8F]">
          Score
        </span>
        <span className="text-[24px] font-bold leading-none text-gray-900">
          {score}
        </span>
        <span className="mt-0.5 text-[8px] font-semibold text-gray-400">
          +{Math.max(score - 80, 0)} vs ø
        </span>
      </div>
    </div>
  );
}

function StatusPill({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF2E8] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#4A634A]">
      {icon}
      {label}
    </span>
  );
}

function PhaseLegend() {
  return (
    <div className="flex items-center gap-1.5">
      {PHASE_ORDER.map((phase) => (
        <span
          key={phase}
          className="flex items-center gap-1 text-[8px] font-semibold text-gray-500"
        >
          <span
            className="h-1.5 w-1.5 rounded-[2px]"
            style={{ backgroundColor: SLEEP_PHASE_META[phase].color }}
          />
          {SLEEP_PHASE_META[phase].label}
        </span>
      ))}
    </div>
  );
}

function PhaseTimeline({ entry }: { entry: SleepEntry }) {
  const total = entry.phaseSegments.reduce(
    (sum, segment) => sum + segment.durationMinutes,
    0,
  );

  return (
    <>
      <div className="flex h-4 overflow-hidden rounded-[4px] bg-[#F4F1FA]">
        {entry.phaseSegments.map((segment, index) => (
          <div
            key={`${segment.phase}-${index}`}
            style={{
              width: `${(segment.durationMinutes / total) * 100}%`,
              backgroundColor: SLEEP_PHASE_META[segment.phase].color,
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[9px] font-medium text-gray-400">
        <span>{entry.bedTime}</span>
        <span>00:30</span>
        <span>02:30</span>
        <span>04:30</span>
        <span>{entry.wakeTime}</span>
      </div>
    </>
  );
}

function PhaseBreakdownSection({ entry }: { entry: SleepEntry }) {
  return (
    <section>
      <OverviewSectionHeader title="Phasen-Aufschlüsselung" />
      <div className="grid grid-cols-4 gap-2">
        {entry.phases.map((phase) => (
          <div
            key={phase.key}
            className="min-w-0 rounded-[12px] border border-gray-100 bg-white p-2.5 shadow-sm"
          >
            <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-gray-500">
              <span
                className="h-2 w-2 rounded-[2px]"
                style={{ backgroundColor: SLEEP_PHASE_META[phase.key].color }}
              />
              {phase.label}
            </p>
            <p className="mt-2 text-[14px] font-bold leading-none text-gray-900">
              {formatSleepDuration(phase.durationMinutes, true)}
            </p>
            <p className="mt-1 text-[9px] font-semibold text-gray-500">
              {phase.percent}%
            </p>
            <p
              className={`mt-1 truncate text-[8px] font-bold ${
                phase.deltaMinutes >= 0 ? "text-[#4A634A]" : "text-[#A36A3B]"
              }`}
            >
              {phase.deltaMinutes >= 0 ? "+" : ""}
              {phase.deltaMinutes} m vs ø
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SleepWindowCard({
  entry,
  sleepWindow,
  onWindowChange,
  onOpen,
}: {
  entry: SleepEntry;
  sleepWindow: SleepWindow;
  onWindowChange: (sleepWindow: SleepWindow) => void;
  onOpen: () => void;
}) {
  return (
    <section>
      <OverviewSectionHeader title="Heute Nacht" />
      <div className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold leading-tight text-gray-900">
              Schlaffenster
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-gray-500">
              {sleepWindow.recommendation}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F0EBF7] px-3 py-2 text-[10px] font-bold text-[#6A5F8F] transition-colors hover:bg-[#E8E0F3]"
          >
            <Settings2 size={13} />
            Anpassen
          </button>
        </div>

        <SleepWindowRange
          sleepWindow={sleepWindow}
          onChange={(patch) =>
            onWindowChange(updateSleepWindowFromTimes(sleepWindow, patch))
          }
        />

        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <p className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#6A5F8F]">
              <Moon size={13} />
              Bett
            </p>
            <p className="text-[14px] font-bold leading-none text-gray-900">
              {sleepWindow.bedTime}
            </p>
          </div>
          <span className="rounded-full bg-[#F0EBF7] px-3 py-1 text-[11px] font-bold text-[#6A5F8F]">
            {formatSleepDuration(sleepWindow.targetDurationMinutes, true)}
          </span>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-[9px] font-bold uppercase text-[#6A5F8F]">
              Wecker
              <Sun size={13} className="text-[#C86F2D]" />
            </p>
            <p className="text-[14px] font-bold leading-none text-gray-900">
              {sleepWindow.wakeTime}
            </p>
          </div>
        </div>

        <div className="mt-4 h-px bg-gray-100" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Bell size={15} className="shrink-0 text-[#6A5F8F]" />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-gray-900">
                Wind-Down-Erinnerung
              </p>
              <p className="truncate text-[10px] font-medium text-gray-500">
                {sleepWindow.reminderTime} · {sleepWindow.reminderLeadMinutes} min vor Bett
              </p>
            </div>
          </div>
          <div className="flex h-6 w-10 items-center justify-end rounded-full bg-[#5E7A5E] p-0.5">
            <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SleepWindowRange({
  sleepWindow,
  onChange,
}: {
  sleepWindow: SleepWindow;
  onChange?: (patch: Partial<Pick<SleepWindow, "bedTime" | "wakeTime">>) => void;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const blockDragRef = useRef<{
    startClientX: number;
    startBedPosition: number;
    startWakePosition: number;
  } | null>(null);
  const bedPosition = getWindowPositionPercent(sleepWindow.bedTime);
  const wakePosition = getWindowPositionPercent(sleepWindow.wakeTime);
  const left = Math.min(bedPosition, wakePosition);
  const right = 100 - Math.max(bedPosition, wakePosition);
  const isEditable = Boolean(onChange);

  const updateFromPointer = (
    event: React.PointerEvent<HTMLButtonElement | HTMLDivElement>,
    handle: "bed" | "wake",
  ) => {
    if (!onChange || !trackRef.current) {
      return;
    }

    const rect = trackRef.current.getBoundingClientRect();
    const rawPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const minimumGapPercent = (15 / (18 * 60)) * 100;
    const percent =
      handle === "bed"
        ? Math.min(rawPercent, wakePosition - minimumGapPercent)
        : Math.max(rawPercent, bedPosition + minimumGapPercent);
    const nextTime = getTimeFromWindowPositionPercent(percent);

    onChange(
      handle === "bed"
        ? { bedTime: nextTime, wakeTime: sleepWindow.wakeTime }
        : { bedTime: sleepWindow.bedTime, wakeTime: nextTime },
    );
  };

  const updateBlockFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onChange || !trackRef.current || !blockDragRef.current) {
      return;
    }

    const rect = trackRef.current.getBoundingClientRect();
    const drag = blockDragRef.current;
    const rawDeltaPercent =
      ((event.clientX - drag.startClientX) / rect.width) * 100;
    const deltaPercent = Math.max(
      -drag.startBedPosition,
      Math.min(rawDeltaPercent, 100 - drag.startWakePosition),
    );

    onChange({
      bedTime: getTimeFromWindowPositionPercent(
        drag.startBedPosition + deltaPercent,
      ),
      wakeTime: getTimeFromWindowPositionPercent(
        drag.startWakePosition + deltaPercent,
      ),
    });
  };

  const startDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    handle: "bed" | "wake",
  ) => {
    if (!onChange) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event, handle);
  };

  const startBlockDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!onChange) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    blockDragRef.current = {
      startClientX: event.clientX,
      startBedPosition: bedPosition,
      startWakePosition: wakePosition,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return (
    <div className="mt-4">
      <div
        ref={trackRef}
        className={`relative h-11 rounded-[9px] bg-[#EFEAF7] ${
          isEditable ? "cursor-pointer touch-none" : ""
        }`}
        onPointerDown={(event) => {
          if (!onChange) {
            return;
          }

          const distanceToBed = Math.abs(event.clientX - getHandleClientX(trackRef.current, bedPosition));
          const distanceToWake = Math.abs(event.clientX - getHandleClientX(trackRef.current, wakePosition));
          updateFromPointer(event, distanceToBed <= distanceToWake ? "bed" : "wake");
        }}
      >
        <div
          className={`absolute top-0 h-full rounded-[9px] bg-[#7563A0] ${
            isEditable ? "cursor-grab touch-none active:cursor-grabbing" : ""
          }`}
          style={{ left: `${left}%`, right: `${right}%` }}
          onPointerDown={startBlockDrag}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              updateBlockFromPointer(event);
            }
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            blockDragRef.current = null;
          }}
          onPointerCancel={() => {
            blockDragRef.current = null;
          }}
        />
        <button
          type="button"
          aria-label="Bettzeit verschieben"
          disabled={!isEditable}
          onPointerDown={(event) => startDrag(event, "bed")}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              updateFromPointer(event, "bed");
            }
          }}
          className={`absolute top-[-3px] h-[48px] w-3 -translate-x-1/2 rounded-full border-2 border-[#6A5F8F] bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8BEE5] ${
            isEditable ? "cursor-ew-resize" : "pointer-events-none"
          }`}
          style={{ left: `${bedPosition}%` }}
        />
        <button
          type="button"
          aria-label="Weckerzeit verschieben"
          disabled={!isEditable}
          onPointerDown={(event) => startDrag(event, "wake")}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              updateFromPointer(event, "wake");
            }
          }}
          className={`absolute top-[-3px] h-[48px] w-3 -translate-x-1/2 rounded-full border-2 border-[#6A5F8F] bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8BEE5] ${
            isEditable ? "cursor-ew-resize" : "pointer-events-none"
          }`}
          style={{ left: `${wakePosition}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[9px] font-medium text-gray-400">
        <span>18</span>
        <span>21</span>
        <span>00</span>
        <span>03</span>
        <span>06</span>
        <span>09</span>
        <span>12</span>
      </div>
    </div>
  );
}

function getHandleClientX(element: HTMLDivElement | null, percent: number) {
  if (!element) {
    return 0;
  }

  const rect = element.getBoundingClientRect();
  return rect.left + (rect.width * percent) / 100;
}

function getWindowPositionPercent(time: string) {
  let totalMinutes = parseClockMinutes(time);

  if (totalMinutes < 18 * 60) {
    totalMinutes += 24 * 60;
  }

  const start = 18 * 60;
  const end = 36 * 60;

  return Math.max(0, Math.min(((totalMinutes - start) / (end - start)) * 100, 100));
}

function getTimeFromWindowPositionPercent(percent: number) {
  const clampedPercent = Math.max(0, Math.min(percent, 100));
  const start = 18 * 60;
  const end = 36 * 60;
  const rawMinutes = start + (clampedPercent / 100) * (end - start);
  const roundedMinutes = Math.round(rawMinutes / 15) * 15;

  return formatClockTime(roundedMinutes);
}

function updateSleepWindowFromTimes(
  sleepWindow: SleepWindow,
  patch: Partial<Pick<SleepWindow, "bedTime" | "wakeTime">>,
) {
  const nextWindow = { ...sleepWindow, ...patch };

  return {
    ...nextWindow,
    targetDurationMinutes: getSleepWindowDurationMinutes(
      nextWindow.bedTime,
      nextWindow.wakeTime,
    ),
    reminderTime:
      patch.bedTime !== sleepWindow.bedTime
        ? subtractClockMinutes(nextWindow.bedTime, nextWindow.reminderLeadMinutes)
        : nextWindow.reminderTime,
  };
}

function updateSleepWindowDuration(
  sleepWindow: SleepWindow,
  targetDurationMinutes: number,
) {
  return {
    ...sleepWindow,
    targetDurationMinutes,
    wakeTime: addClockMinutes(sleepWindow.bedTime, targetDurationMinutes),
  };
}

function updateSleepWindowReminderLead(
  sleepWindow: SleepWindow,
  reminderLeadMinutes: number,
) {
  return {
    ...sleepWindow,
    reminderLeadMinutes,
    reminderTime: subtractClockMinutes(sleepWindow.bedTime, reminderLeadMinutes),
  };
}

function getSleepWindowDurationMinutes(bedTime: string, wakeTime: string) {
  const bedMinutes = getWindowTimelineMinutes(bedTime);
  let wakeMinutes = getWindowTimelineMinutes(wakeTime);

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  return wakeMinutes - bedMinutes;
}

function getWindowTimelineMinutes(time: string) {
  const minutes = parseClockMinutes(time);

  return minutes < 18 * 60 ? minutes + 24 * 60 : minutes;
}

function parseClockMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function addClockMinutes(time: string, minutesToAdd: number) {
  return formatClockTime(parseClockMinutes(time) + minutesToAdd);
}

function subtractClockMinutes(time: string, minutesToSubtract: number) {
  return formatClockTime(parseClockMinutes(time) - minutesToSubtract);
}

function formatClockTime(totalMinutes: number) {
  const minutesInDay = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(minutesInDay / 60);
  const minutes = minutesInDay % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


function WeeklyPhasesSection({
  bars,
  summary,
  activeDate,
}: {
  bars: WeeklyPhaseBar[];
  summary: SleepWeekSummary;
  activeDate: string;
}) {
  return (
    <section>
      <OverviewSectionHeader
        title="Woche · Phasen"
        rightLabel={`Ø ${formatSleepDuration(summary.averageDurationMinutes, true)}`}
      />
      <div className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative h-[118px]">
          <div className="absolute left-0 right-0 top-3 border-t border-dashed border-[#CFC6E3]" />
          <span className="absolute right-0 top-[-2px] text-[9px] font-bold uppercase text-[#6A5F8F]">
            Ziel 7,5h
          </span>
          <div className="absolute inset-x-0 bottom-0 flex h-[98px] items-end justify-between px-3">
            {bars.map((bar) => (
              <button
                key={bar.isoDate}
                type="button"
                className="flex w-7 flex-col items-center gap-2"
                aria-label={`${bar.dayShort} ${formatSleepDuration(bar.durationMinutes)}`}
              >
                <StackedPhaseBar bar={bar} active={bar.isoDate === activeDate} />
                <span className="text-[9px] font-bold text-gray-400">
                  {formatWeekdayShortLabel(bar.dayShort)}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-[12px] bg-[#F7F3FB] px-3 py-2 text-[11px] font-bold text-[#6A5F8F]">
          <span>
            {formatWeekdayShortLabel(
              bars.find((bar) => bar.isoDate === activeDate)?.dayShort ?? "Mi",
            )}{" "}
            · {formatClockDuration(
              bars.find((bar) => bar.isoDate === activeDate)?.durationMinutes ??
                summary.averageDurationMinutes,
            )}
          </span>
          <span>
            Tief {formatSleepDuration(summary.phaseAverages.deep, true)} · REM{" "}
            {formatSleepDuration(summary.phaseAverages.rem, true)}
          </span>
        </div>
      </div>
    </section>
  );
}

function StackedPhaseBar({
  bar,
  active,
}: {
  bar: WeeklyPhaseBar;
  active: boolean;
}) {
  const maxHeight = 94;
  const height = Math.max(62, Math.min((bar.durationMinutes / 480) * maxHeight, maxHeight));
  const total = PHASE_ORDER.reduce((sum, phase) => sum + bar.phases[phase], 0);

  return (
    <div
      className={`flex w-[18px] flex-col-reverse overflow-hidden rounded-[4px] ${
        active ? "ring-2 ring-[#C8BEE5]" : ""
      }`}
      style={{ height }}
    >
      {PHASE_ORDER.map((phase) => (
        <span
          key={phase}
          style={{
            height: `${(bar.phases[phase] / total) * 100}%`,
            backgroundColor: SLEEP_PHASE_META[phase].color,
          }}
        />
      ))}
    </div>
  );
}

function TrendSection({ metrics }: { metrics: SleepTrendMetric[] }) {
  return (
    <section>
      <OverviewSectionHeader title="30-Tage-Trends" />
      <div className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
        {metrics.map((metric, index) => (
          <React.Fragment key={metric.id}>
            {index > 0 ? <div className="my-3 h-px bg-gray-100" /> : null}
            <TrendMetricRow metric={metric} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function TrendMetricRow({ metric }: { metric: SleepTrendMetric }) {
  const color = metric.tone === "good" ? "#6A5F8F" : "#B06E2C";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_112px] items-center gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
          {metric.label}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[15px] font-bold leading-none text-gray-900">
            {metric.value}
          </span>
          <span
            className={`text-[10px] font-bold ${
              metric.tone === "good" ? "text-[#4A634A]" : "text-[#B06E2C]"
            }`}
          >
            {metric.delta}
          </span>
        </div>
      </div>
      <Sparkline points={metric.points} color={color} />
    </div>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);
  const polyline = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 108;
      const y = 34 - ((point - min) / range) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 108 38" className="h-[38px] w-[108px]" aria-hidden="true">
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WindDownSection({
  entry,
  taskOverrides,
  onToggleTask,
}: {
  entry: SleepEntry;
  taskOverrides: Record<string, boolean>;
  onToggleTask: (task: WindDownTask) => void;
}) {
  const completedCount = getWindDownCompletedCount(entry, taskOverrides);

  return (
    <section>
      <OverviewSectionHeader
        title="Wind-Down · Heute"
        rightLabel={`${completedCount} / ${entry.windDownTasks.length}`}
      />
      <div className="overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm">
        {entry.windDownTasks.map((task, index) => (
          <React.Fragment key={task.id}>
            {index > 0 ? <div className="mx-3 h-px bg-gray-100" /> : null}
            <WindDownRow
              task={task}
              completed={taskOverrides[task.id] ?? task.completed}
              onToggle={() => onToggleTask(task)}
            />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

const WIND_DOWN_ICONS: Record<WindDownTask["icon"], LucideIcon> = {
  coffee: Coffee,
  meal: Utensils,
  leaf: Leaf,
  temperature: Thermometer,
  book: BookOpen,
};

function WindDownRow({
  task,
  completed,
  onToggle,
}: {
  task: WindDownTask;
  completed: boolean;
  onToggle: () => void;
}) {
  const Icon = WIND_DOWN_ICONS[task.icon];

  return (
    <button
      type="button"
      onClick={onToggle}
      className="grid min-h-[54px] w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F3EFF9]">
        <Icon size={17} className="text-[#6A5F8F]" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[12px] font-bold leading-tight text-gray-900">
          {task.title}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-gray-500">
          {task.description}
        </p>
      </div>
      <span className="text-[10px] font-semibold text-gray-400">{task.time}</span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
          completed
            ? "border-[#5E7A5E] bg-[#5E7A5E] text-white"
            : "border-gray-300 bg-white text-transparent"
        }`}
      >
        <Check size={15} />
      </span>
    </button>
  );
}

function InsightsSection({ insights }: { insights: SleepInsight[] }) {
  return (
    <section>
      <OverviewSectionHeader title="Insights" />
      <div className="flex flex-col gap-3">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className={`rounded-[18px] border p-4 shadow-sm ${
              insight.tone === "good"
                ? "border-[#E1E8DE] bg-[#F8FAF7]"
                : "border-[#EEE6DA] bg-[#FCFAF5]"
            }`}
          >
            <div className="grid grid-cols-[38px_minmax(0,1fr)] gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white shadow-sm">
                {insight.tone === "good" ? (
                  <TrendingUp size={17} className="text-[#4A634A]" />
                ) : (
                  <AlarmClock size={17} className="text-[#B06E2C]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-tight text-gray-900">
                  {insight.title}
                </p>
                <p className="mt-1 text-[11px] font-medium leading-snug text-gray-600">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SleepNoteSection({
  entry,
  onOpen,
}: {
  entry: SleepEntry;
  onOpen: () => void;
}) {
  return (
    <section>
      <OverviewSectionHeader title="Notizen · Letzte Nacht" />
      <button
        type="button"
        onClick={onOpen}
        className="w-full rounded-[18px] border border-gray-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-gray-50"
      >
        <div className="grid grid-cols-[38px_minmax(0,1fr)_auto] gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#F3EFF9]">
            <Edit3 size={17} className="text-[#6A5F8F]" />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {entry.note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#EAF2E8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#4A634A]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="line-clamp-2 text-[11px] font-medium leading-snug text-gray-600">
              {entry.note.text}
            </p>
          </div>
          <Edit3 size={15} className="text-gray-400" />
        </div>
      </button>
    </section>
  );
}

function WeeklyNightRow({
  dayInfo,
  entry,
  isActive,
  onSelect,
}: {
  dayInfo: DayInfo<string>;
  entry: SleepEntry | null;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!entry}
      className={`w-full rounded-[14px] border px-3 py-2 text-left shadow-sm transition-colors active:scale-[0.99] ${
        isActive
          ? "border-[#E7DFF4] bg-[#FBF9FF]"
          : "border-gray-100 bg-white hover:bg-gray-50"
      } ${entry ? "" : "opacity-60"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-900">
            {entry?.dayLabel ?? dayInfo.day}
          </p>
          <p className="text-[11px] text-gray-500">
            {entry
              ? `${entry.date}. ${entry.monthLabel}`
              : dayInfo.displayDate ?? dayInfo.date}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight text-gray-900">
            {entry ? formatSleepDuration(entry.durationMinutes) : "Kein Eintrag"}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-gray-500">
            {entry
              ? `${entry.bedTime} - ${entry.wakeTime} · Effizienz ${entry.efficiencyPercent}%`
              : "Für diesen Tag liegt kein Eintrag vor."}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[12px] font-bold text-gray-900">
            {entry ? `Score ${entry.score}` : "Offen"}
          </p>
          <ChevronRight size={15} className="ml-auto mt-1 text-gray-400" />
        </div>
      </div>
    </button>
  );
}

function SleepWindowDrawer({
  entry,
  sleepWindow,
  open,
  onSave,
  onReset,
  onClose,
}: {
  entry: SleepEntry | null;
  sleepWindow: SleepWindow | null;
  open: boolean;
  onSave: (sleepWindow: SleepWindow) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<SleepWindow | null>(sleepWindow);

  useEffect(() => {
    if (open) {
      setDraft(sleepWindow);
    }
  }, [open, sleepWindow]);

  const updateDraft = (patch: Partial<SleepWindow>) => {
    setDraft((previous) => (previous ? { ...previous, ...patch } : previous));
  };
  const updateDraftTimes = (
    patch: Partial<Pick<SleepWindow, "bedTime" | "wakeTime">>,
  ) => {
    setDraft((previous) =>
      previous ? updateSleepWindowFromTimes(previous, patch) : previous,
    );
  };
  const updateDraftDuration = (targetDurationMinutes: number) => {
    setDraft((previous) =>
      previous
        ? updateSleepWindowDuration(previous, targetDurationMinutes)
        : previous,
    );
  };
  const updateDraftReminderLead = (reminderLeadMinutes: number) => {
    setDraft((previous) =>
      previous
        ? updateSleepWindowReminderLead(previous, reminderLeadMinutes)
        : previous,
    );
  };

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent className="mx-auto max-w-[390px] rounded-t-[24px] border-t-0 bg-[#F5F4EF]">
        <DrawerTitle className="sr-only">Schlaffenster anpassen</DrawerTitle>
        <DrawerDescription className="sr-only">
          Lokale Einstellungen für Bettzeit, Wecker und Wind-Down-Erinnerung.
        </DrawerDescription>
        {entry && draft ? (
          <div className="px-5 pb-6 pt-4">
            <DrawerHeader title="Schlaffenster" onClose={onClose} />
            <div className="mt-4 rounded-[18px] bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6A5F8F]">
                Vorschau
              </p>
              <SleepWindowRange
                sleepWindow={draft}
                onChange={(patch) => updateDraftTimes(patch)}
              />
              <div className="mt-3 flex items-center justify-between text-[12px] font-bold text-gray-900">
                <span>Bett {draft.bedTime}</span>
                <span className="rounded-full bg-[#F0EBF7] px-2.5 py-1 text-[#6A5F8F]">
                  {formatSleepDuration(draft.targetDurationMinutes, true)}
                </span>
                <span>Wecker {draft.wakeTime}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <TimeField
                label="Bettzeit"
                value={draft.bedTime}
                onChange={(bedTime) => updateDraftTimes({ bedTime })}
              />
              <TimeField
                label="Wecker"
                value={draft.wakeTime}
                onChange={(wakeTime) => updateDraftTimes({ wakeTime })}
              />
              <NumberField
                label="Zieldauer (min)"
                value={draft.targetDurationMinutes}
                min={300}
                max={600}
                step={15}
                onChange={(targetDurationMinutes) =>
                  updateDraftDuration(targetDurationMinutes)
                }
              />
              <TimeField
                label="Reminder"
                value={draft.reminderTime}
                onChange={(reminderTime) => updateDraft({ reminderTime })}
              />
              <NumberField
                label="Vorlauf (min)"
                value={draft.reminderLeadMinutes}
                min={10}
                max={120}
                step={5}
                onChange={(reminderLeadMinutes) =>
                  updateDraftReminderLead(reminderLeadMinutes)
                }
              />
            </div>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Empfehlung
              </span>
              <input
                value={draft.recommendation}
                onChange={(event) =>
                  updateDraft({ recommendation: event.target.value })
                }
                className="h-11 w-full rounded-[12px] border border-[#EBEAE4] bg-white px-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-[#6A5F8F]"
              />
            </label>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onReset}
                className="rounded-[12px] border border-[#E7DFF4] bg-white py-3 text-[12px] font-bold text-[#6A5F8F] shadow-sm transition-colors hover:bg-[#F7F3FB]"
              >
                Zurücksetzen
              </button>
              <button
                type="button"
                onClick={() => onSave(draft)}
                className="rounded-[12px] bg-[#6A5F8F] py-3 text-[12px] font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
              >
                Speichern
              </button>
            </div>
            <div className="hidden">
              <DrawerInfoRow label="Zieldauer" value={formatSleepDuration(entry.window.targetDurationMinutes)} />
              <DrawerInfoRow label="Bettzeit" value={entry.window.bedTime} />
              <DrawerInfoRow label="Wecker" value={entry.window.wakeTime} />
              <DrawerInfoRow
                label="Wind-Down"
                value={`${entry.window.reminderTime} · ${entry.window.reminderLeadMinutes} min vorher`}
              />
            </div>
            <p className="hidden">
              Diese Version zeigt die Anpassung als lokalen UI-Flow. Persistenz und
              echte Slider-Logik werden erst mit der Schlafdaten-Anbindung ergänzt.
            </p>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function SleepPhaseDrawer({
  entry,
  open,
  onClose,
}: {
  entry: SleepEntry | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent className="mx-auto max-w-[390px] rounded-t-[24px] border-t-0 bg-[#F5F4EF]">
        <DrawerTitle className="sr-only">Phasen-Aufschlüsselung</DrawerTitle>
        <DrawerDescription className="sr-only">
          Details zu Tiefschlaf, REM, Leichtschlaf und Wachphasen.
        </DrawerDescription>
        {entry ? (
          <div className="px-5 pb-6 pt-4">
            <DrawerHeader title="Schlafphasen" onClose={onClose} />
            <div className="mt-4">
              <PhaseBreakdownSection entry={entry} />
            </div>
            <div className="mt-4 rounded-[16px] border border-[#E7DFF4] bg-white px-3 py-3 shadow-sm">
              <p className="text-[12px] font-medium leading-snug text-gray-600">
                Die Phasen zeigen, wie sich deine letzte Nacht zwischen Tiefschlaf,
                REM, Leichtschlaf und kurzen Wachmomenten verteilt hat.
              </p>
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[12px] border border-[#EBEAE4] bg-white px-3 text-[13px] font-bold text-gray-900 outline-none focus:border-[#6A5F8F]"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          if (Number.isFinite(nextValue)) {
            onChange(Math.max(min, Math.min(nextValue, max)));
          }
        }}
        className="h-11 w-full rounded-[12px] border border-[#EBEAE4] bg-white px-3 text-[13px] font-bold text-gray-900 outline-none focus:border-[#6A5F8F]"
      />
    </label>
  );
}

function SleepNoteDrawer({
  entry,
  open,
  onClose,
}: {
  entry: SleepEntry | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DrawerContent className="mx-auto max-w-[390px] rounded-t-[24px] border-t-0 bg-[#F5F4EF]">
        <DrawerTitle className="sr-only">Schlafnotiz</DrawerTitle>
        <DrawerDescription className="sr-only">
          Notiz und Tags der letzten Nacht.
        </DrawerDescription>
        {entry ? (
          <div className="px-5 pb-6 pt-4">
            <DrawerHeader title="Notiz" onClose={onClose} />
            <div className="mt-4 rounded-[18px] bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {entry.note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#F0EBF7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6A5F8F]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-[13px] font-medium leading-relaxed text-gray-700">
                {entry.note.text}
              </p>
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function DrawerHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[18px] font-bold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full bg-white px-3 py-2 text-[11px] font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
      >
        Schließen
      </button>
    </div>
  );
}

function DrawerInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-white px-3 py-3 shadow-sm">
      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-[13px] font-bold text-gray-900">{value}</span>
    </div>
  );
}
