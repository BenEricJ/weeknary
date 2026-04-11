import React from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Leaf,
  Play,
  Plus,
} from "lucide-react";
import { LibraryCard } from "./TrainingWidgets";
import { WeekCalendar } from "../WeekCalendar";
import { WORKOUT_DATA } from "../WorkoutDetailDrawer";
import {
  TRAINING_PLAN_ROWS,
  TRAINING_WEEK_DAYS,
  getTrainingPlanRowByDate,
  type TrainingWorkoutId,
} from "../../data/trainingPlan";

const RECOVERY_IDS: TrainingWorkoutId[] = [
  "mobility-flow",
  "yoga",
];
const LIBRARY_IDS: TrainingWorkoutId[] = [
  "endurance",
  "zwift-strength",
  "zwift-tempo",
  "kraft",
  "laufen",
  "long-ride",
  "mobility-flow",
  "yoga",
];

const TRAINING_CATEGORY_META = {
  ausdauer: {
    label: "Ausdauer",
    iconClassName: "text-[#5B88A5]",
    badgeClassName: "bg-[#E6EFF5] text-[#5B88A5]",
    surfaceClassName: "bg-[#F3F8FB]",
    borderClassName: "border-[#D9E8F1]",
  },
  kraft: {
    label: "Kraft",
    iconClassName: "text-[#B06A45]",
    badgeClassName: "bg-[#F8ECE3] text-[#B06A45]",
    surfaceClassName: "bg-[#FCF6F1]",
    borderClassName: "border-[#F0DED2]",
  },
  mobilitaet: {
    label: "Mobilitaet",
    iconClassName: "text-[#3D7C74]",
    badgeClassName: "bg-[#E2F1EE] text-[#3D7C74]",
    surfaceClassName: "bg-[#F1FAF8]",
    borderClassName: "border-[#D6ECE7]",
  },
  yoga: {
    label: "Yoga",
    iconClassName: "text-[#8B5C7E]",
    badgeClassName: "bg-[#F3EAF1] text-[#8B5C7E]",
    surfaceClassName: "bg-[#FBF5FA]",
    borderClassName: "border-[#EADDEA]",
  },
} as const;

function normalizeCategory(value: string) {
  return value
    .replace("ä", "ae")
    .replace("Ä", "Ae")
    .replace("Ã¤", "ae")
    .toLowerCase();
}

function getWorkoutCategory(workoutId: string) {
  const sport = WORKOUT_DATA[workoutId]?.sport;
  if (sport === "Krafttraining") return "kraft";
  if (sport === "Mobilität") return "mobilitaet";
  if (sport === "Yoga") return "yoga";
  return "ausdauer";
}

function getWorkoutCategoryMeta(workoutId: string) {
  return TRAINING_CATEGORY_META[getWorkoutCategory(workoutId)];
}

function matchesCategory(
  workoutId: string,
  activeCategory: string,
) {
  const normalized = normalizeCategory(activeCategory);
  return (
    normalized === "alle" ||
    getWorkoutCategory(workoutId) === normalized
  );
}

function buildWeeklyEntries(
  activeDate: number,
  activeCategory: string,
) {
  const scheduled = TRAINING_PLAN_ROWS.flatMap((row) =>
    row.workoutIds
      .filter((workoutId) =>
        matchesCategory(workoutId, activeCategory),
      )
      .map((workoutId) => ({ workoutId, row })),
  ).filter((entry) => entry.row.dayDate !== activeDate);

  const recoveryEntries = RECOVERY_IDS.filter((workoutId) =>
    matchesCategory(workoutId, activeCategory),
  ).map((workoutId) => ({
    workoutId,
    label:
      workoutId === "mobility-flow"
        ? "Recovery Option"
        : "Optional",
  }));

  return { scheduled, recoveryEntries };
}

function formatWorkoutMeta(workoutId: string) {
  const stats = WORKOUT_DATA[workoutId]?.statsBar ?? [];
  return stats
    .slice(0, 3)
    .map((stat) => stat.val)
    .join(" • ");
}

function getWorkoutEnergy(workoutId: string) {
  const stats = WORKOUT_DATA[workoutId]?.statsBar ?? [];
  return (
    stats.find((stat) =>
      stat.val.toLowerCase().includes("kcal"),
    )?.val ?? "n/a"
  );
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

function buildPlanEntries() {
  return TRAINING_PLAN_ROWS.flatMap((row) => {
    if (row.workoutIds.length > 0) {
      const timeLabels = splitTimeLabels(row.zeit);
      return row.workoutIds.map((workoutId, index) => ({
        id: `${row.tag}-${workoutId}-${index}`,
        row,
        workoutId,
        timeLabel: timeLabels[index] ?? row.zeit,
        isOptional: false,
      }));
    }

    if (row.recoveryNote) {
      return RECOVERY_IDS.map((workoutId) => ({
        id: `${row.tag}-${workoutId}`,
        row,
        workoutId,
        timeLabel: "Flexibel",
        isOptional: true,
      }));
    }

    return [];
  });
}

function PlanWorkoutCard({
  workoutId,
  row,
  timeLabel,
  isOptional,
  onClick,
}: {
  workoutId: string;
  row: (typeof TRAINING_PLAN_ROWS)[number];
  timeLabel: string;
  isOptional: boolean;
  onClick: (workoutId: string) => void;
}) {
  const workout = WORKOUT_DATA[workoutId];
  if (!workout) return null;
  const Icon = workout.icon ?? Leaf;
  const energy = getWorkoutEnergy(workoutId);
  const focusText = workout.goal.title;
  const meta = getWorkoutCategoryMeta(workoutId);

  return (
    <button
      onClick={() => onClick(workoutId)}
      className={`w-full text-left rounded-[14px] px-2.5 py-2 border shadow-sm transition-colors hover:brightness-[0.99] ${meta.surfaceClassName} ${meta.borderClassName}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/70">
          <Icon size={20} className={meta.iconClassName} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[12px] font-bold text-gray-900 leading-tight min-w-0 flex-1">
              <span className="mr-1 text-[#4A634A] uppercase tracking-[0.14em]">
                {row.tag}
              </span>
              {workout.title}
            </h4>
            {isOptional ? (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap bg-[#EEF4E7] text-[#5A7650]">
                Optional
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[10px] text-gray-500 leading-tight">
            {workout.subtitle}
          </p>
          <p className="mt-1.5 text-[10px] text-gray-700 leading-tight">
            {focusText}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1 self-start">
          <span
            className={`rounded-md px-1.5 py-0.5 text-[8px] font-semibold ${meta.badgeClassName}`}
          >
            {timeLabel}
          </span>
          <span className="rounded-md bg-[#FDEFD9] px-1.5 py-0.5 text-[8px] font-semibold text-[#B06A45]">
            {energy}
          </span>
        </div>
      </div>
    </button>
  );
}

function TrainingCard({
  workoutId,
  badge,
  onClick,
}: {
  workoutId: string;
  badge?: string;
  onClick: (workoutId: string) => void;
}) {
  const workout = WORKOUT_DATA[workoutId];
  if (!workout) return null;
  const Icon = workout.icon;
  const meta = getWorkoutCategoryMeta(workoutId);
  const badgeClassName =
    badge === "Optional"
      ? "bg-[#EEF4E7] text-[#5A7650]"
      : meta.badgeClassName;

  return (
    <div
      onClick={() => onClick(workoutId)}
      className={`rounded-[20px] p-3 border shadow-sm flex gap-3 cursor-pointer transition-colors hover:brightness-[0.99] ${meta.surfaceClassName} ${meta.borderClassName}`}
    >
      <div className="flex-1 py-1 pl-1">
        <div className="flex items-center gap-2 mb-1.5">
          <Icon
            size={18}
            className={meta.iconClassName}
            strokeWidth={2}
          />
          <h4 className="text-[15px] font-bold text-gray-900 leading-tight">
            {workout.title}
          </h4>
          {badge ? (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] ${badgeClassName}`}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <p className="text-[11px] font-medium text-gray-600 mb-2">
          {workout.subtitle}
        </p>
        <p className="text-[11.5px] text-gray-700 leading-snug mb-3">
          {workout.desc}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-800">
          <span className="flex items-center gap-1">
            <Clock
              size={12}
              className="text-gray-500"
              strokeWidth={2.5}
            />
            {formatWorkoutMeta(workoutId)}
          </span>
        </div>
      </div>
      <div className="w-[96px] h-[120px] rounded-[16px] overflow-hidden relative shrink-0">
        <img
          src={workout.image}
          alt={workout.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-1.5 right-1.5 w-7 h-7 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
          <Play
            size={12}
            className="text-white fill-white ml-0.5"
          />
        </div>
      </div>
    </div>
  );
}

function WeekEntryRow({
  workoutId,
  label,
  onClick,
}: {
  workoutId: string;
  label: string;
  onClick: (workoutId: string) => void;
}) {
  const workout = WORKOUT_DATA[workoutId];
  if (!workout) return null;
  const Icon = workout.icon;
  const meta = getWorkoutCategoryMeta(workoutId);

  return (
    <div
      onClick={() => onClick(workoutId)}
      className={`w-full text-left rounded-[18px] p-3.5 border shadow-sm transition-colors hover:brightness-[0.99] cursor-pointer ${meta.surfaceClassName} ${meta.borderClassName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 bg-white/70">
              <Icon size={18} className={meta.iconClassName} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate">
                {workout.title}
              </h4>
              <p className="mt-0.5 text-[11px] text-gray-500 truncate">
                {workout.subtitle}
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[12px] font-bold text-gray-900">
            {label}
          </div>
          <div className="text-[10px] font-medium text-gray-500">
            geplant
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanSection({
  setSelectedWorkout,
}: {
  setSelectedWorkout: (workoutId: string) => void;
}) {
  const planEntries = buildPlanEntries();
  const enduranceUnits = planEntries.filter(
    (entry) =>
      getWorkoutCategory(entry.workoutId) === "ausdauer",
  ).length;
  const strengthUnits = planEntries.filter(
    (entry) => getWorkoutCategory(entry.workoutId) === "kraft",
  ).length;
  const recoveryUnits = planEntries.filter(
    (entry) => entry.isOptional,
  ).length;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="w-full text-left bg-[#F2F4F2] rounded-[20px] p-4 border border-[#E4E9E4] shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[10px] font-bold text-[#4A634A] tracking-[0.18em] uppercase">
            Trainingsfokus
          </span>
          <span className="text-[11px] font-semibold text-gray-500">
            {planEntries.length} Einheiten
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 bg-[#F6F8F1]">
            <Activity size={20} className="text-[#4A634A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h2 className="text-[16px] font-bold text-gray-900 leading-tight min-w-0 flex-1">
                Zwift, Kraft & Run Week
              </h2>
            </div>
            <p className="text-[12px] text-gray-600 leading-snug">
              Strukturierter Mix aus Ausdauer, Kraft und Run.
              Alle Einheiten stehen unten einzeln, Recovery
              bleibt als optionale Session im Plan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto hide-scrollbar">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap bg-[#EAE8E3] text-gray-800">
            {enduranceUnits} Ausdauer-Einheiten
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap bg-[#EEF1F6] text-[#5B6E91]">
            {strengthUnits} Kraft-Einheiten
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap bg-[#FDEFD9] text-[#B06A45]">
            Long Ride am Sonntag
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap bg-[#EEF4E7] text-[#5A7650]">
            {recoveryUnits} Recovery-Optionen
          </span>
        </div>
      </div>

      <section>
        <div className="mb-2 px-1">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            Trainingsliste
          </h3>
        </div>
        <div className="flex flex-col gap-2">
          {planEntries.map((entry) => (
            <PlanWorkoutCard
              key={entry.id}
              workoutId={entry.workoutId}
              row={entry.row}
              timeLabel={entry.timeLabel}
              isOptional={entry.isOptional}
              onClick={setSelectedWorkout}
            />
          ))}
          <button
            type="button"
            className="w-full rounded-[14px] border border-dashed border-[#C7D3BE] bg-[#F6F8F1] px-3 py-3 text-left shadow-sm transition-colors hover:bg-[#EEF3E7]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80">
                <Plus size={20} className="text-[#6A816A]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[12px] font-bold text-gray-900 leading-tight">
                  Training hinzufügen
                </h4>
                <p className="mt-0.5 text-[10px] text-gray-500 leading-tight">
                  Weitere Einheit oder eigene Session ergänzen
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

export function WorkoutsSection({
  categories,
  activeCategory,
  setActiveCategory,
  activeDate,
  setActiveDate,
  setSelectedWorkout,
}: any) {
  const activeRow = getTrainingPlanRowByDate(activeDate);
  const dayWorkouts = activeRow.workoutIds.filter((workoutId) =>
    matchesCategory(workoutId, activeCategory),
  );
  const { scheduled, recoveryEntries } = buildWeeklyEntries(
    activeDate,
    activeCategory,
  );

  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      <div className="flex gap-[7px] overflow-x-auto hide-scrollbar pb-3 mb-3 -mx-6 px-6">
        {categories.map((cat: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveCategory(cat.label)}
            className={`flex items-center gap-[5px] px-[15px] py-[9px] rounded-[10px] text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors shadow-sm ${
              cat.active
                ? "bg-[#6A816A] text-white border border-[#6A816A]"
                : "bg-[#F5F4EF] text-gray-700 border border-[#EBEAE4] hover:bg-[#EBEAE4]"
            }`}
          >
            {cat.icon && (
              <cat.icon size={16} strokeWidth={2.5} />
            )}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-4">
          DIESE WOCHE
        </h3>
        <WeekCalendar
          days={TRAINING_WEEK_DAYS}
          activeDate={activeDate}
          onDateChange={setActiveDate}
          className="flex justify-between items-center bg-white rounded-[16px] p-2 shadow-sm border border-gray-100/60 mb-5"
        />

        {dayWorkouts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {dayWorkouts.map((workoutId) => (
              <TrainingCard
                key={`${activeRow.tag}-${workoutId}`}
                workoutId={workoutId}
                badge={
                  activeRow.tag === "SA"
                    ? "Optional"
                    : activeRow.dayLabel
                }
                onClick={setSelectedWorkout}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#F5F4EF] rounded-[20px] p-6 border border-[#EBEAE4] shadow-sm flex flex-col items-center justify-center text-center gap-2">
            <div className="w-12 h-12 bg-[#EBEAE4] rounded-full flex items-center justify-center mb-1">
              <Leaf
                size={24}
                className="text-[#849C66]"
                strokeWidth={2}
              />
            </div>
            <h4 className="text-[15px] font-bold text-gray-900">
              Kein fixes Training
            </h4>
            <p className="text-[12px] text-gray-500 max-w-[240px]">
              {activeRow.recoveryNote ??
                "Nutze den Tag fuer Erholung, einen Spaziergang oder lockeres Stretching."}
            </p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-[13.5px] font-bold text-gray-900 mb-[14px]">
          Weitere Einheiten diese Woche
        </h3>
        <div className="flex flex-col gap-2.5">
          {scheduled.map((entry) => (
            <WeekEntryRow
              key={`${entry.row.tag}-${entry.workoutId}`}
              workoutId={entry.workoutId}
              label={`${entry.row.tag}, ${entry.row.zeit}`}
              onClick={setSelectedWorkout}
            />
          ))}
          {recoveryEntries.map((entry) => (
            <WeekEntryRow
              key={`recovery-${entry.workoutId}`}
              workoutId={entry.workoutId}
              label={entry.label}
              onClick={setSelectedWorkout}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
            WORKOUT-BIBLIOTHEK
          </h3>
          <button className="text-[12px] font-semibold text-[#6A816A]">
            Alle anzeigen
          </button>
        </div>

        <div className="flex gap-[9px] overflow-x-auto hide-scrollbar -mx-6 px-6 pb-2">
          {LIBRARY_IDS.filter((workoutId) =>
            matchesCategory(workoutId, activeCategory),
          ).map((workoutId) => {
            const workout = WORKOUT_DATA[workoutId];
            return (
              <LibraryCard
                key={workoutId}
                title={workout.title}
                subtitle={workout.subtitle}
                img={workout.image}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProgressSection({
  timeRangeTab,
  setTimeRangeTab,
  setIsCalendarOpen,
  currentProgress,
  setIsMetricsModalOpen,
  AVAILABLE_METRICS,
  selectedMetrics,
}: any) {
  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      <div className="flex bg-[#EBEAE4] p-1 rounded-[12px] mb-8">
        {["7 Tage", "4 Wochen", "3 Monate", "1 Jahr"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setTimeRangeTab(tab)}
              className={`flex-1 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all duration-200 ${
                timeRangeTab === tab
                  ? "bg-[#6A816A] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ),
        )}
        <button
          onClick={() => setIsCalendarOpen(true)}
          className={`w-9 shrink-0 flex items-center justify-center rounded-[8px] transition-all duration-200 ${
            timeRangeTab === "Individuell"
              ? "bg-[#6A816A] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
          aria-label="Individueller Zeitraum"
        >
          <Calendar size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-3.5">
          UEBERSICHT
        </h3>
        <div className="bg-[#F5F4EF] rounded-[24px] py-4 px-2 border border-[#EBEAE4] shadow-sm flex items-center justify-around">
          {[
            {
              label: "Workouts",
              value: currentProgress.overview.workouts,
              trend: currentProgress.overview.workoutsTrend,
              dir: currentProgress.overview.workoutsDir,
            },
            {
              label: "Trainingszeit",
              value: currentProgress.overview.time,
              trend: currentProgress.overview.timeTrend,
              dir: currentProgress.overview.timeDir,
            },
            {
              label: "kcal verbrannt",
              value: currentProgress.overview.kcal,
              trend: currentProgress.overview.kcalTrend,
              dir: currentProgress.overview.kcalDir,
            },
            {
              label: "Ø Score",
              value: currentProgress.overview.score,
              trend: currentProgress.overview.scoreTrend,
              dir: currentProgress.overview.scoreDir,
            },
          ].map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 ? (
                <div className="w-px h-10 bg-[#EBEAE4]" />
              ) : null}
              <div className="flex flex-col items-center flex-1">
                <span className="text-[20px] font-bold text-gray-900 leading-none mb-1.5">
                  {item.value}
                </span>
                <span className="text-[11px] font-medium text-gray-600 mb-1">
                  {item.label}
                </span>
                <span
                  className={`text-[9px] font-bold flex items-center ${item.dir === "up" ? "text-[#6A816A]" : "text-[#9C3A3A]"}`}
                >
                  {item.dir === "up" ? (
                    <ArrowUpRight
                      size={10}
                      strokeWidth={3}
                      className="mr-0.5"
                    />
                  ) : (
                    <ArrowDownRight
                      size={10}
                      strokeWidth={3}
                      className="mr-0.5"
                    />
                  )}
                  {item.trend}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
            TRAININGSZEIT
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-gray-700">
              {currentProgress.chart.avg}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] ${currentProgress.chart.trendColor}`}
            >
              {currentProgress.chart.trend}
            </span>
          </div>
        </div>
        <div className="bg-[#F5F4EF] rounded-[24px] p-5 border border-[#EBEAE4] shadow-sm flex flex-col h-[160px]">
          <div className="flex-1 flex items-end gap-2 relative mt-4">
            <div className="absolute -left-1 top-[-10px] bottom-0 flex flex-col justify-between text-[10px] text-gray-400 font-medium">
              <span>2 h</span>
              <span>1 h</span>
              <span>0</span>
            </div>
            <div className="absolute left-6 right-0 top-0 h-px bg-[#EBEAE4]" />
            <div className="absolute left-6 right-0 top-1/2 h-px bg-[#EBEAE4]" />
            <div className="absolute left-6 right-0 bottom-0 h-px bg-[#EBEAE4]" />

            <div className="flex-1 h-full ml-6 flex items-end justify-between relative z-10 pt-2">
              {currentProgress.chart.bars.map(
                (h: number, i: number) => (
                  <div
                    key={i}
                    className="bg-[#849C66] rounded-t-[4px] opacity-90"
                    style={{
                      height: `${h}%`,
                      width: `${Math.min(80 / currentProgress.chart.bars.length, 12)}%`,
                    }}
                  />
                ),
              )}
            </div>
          </div>
          <div className="flex justify-between items-center ml-6 mt-2 text-[10px] text-gray-500 font-medium">
            {currentProgress.chart.labels.map(
              (l: string, i: number) => (
                <span key={i} className="flex-1 text-center">
                  {l}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">
            FAVORITEN
          </h3>
          <button
            onClick={() => setIsMetricsModalOpen(true)}
            className="text-[12px] font-semibold text-[#6A816A]"
          >
            Bearbeiten
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {AVAILABLE_METRICS.filter((metric: any) =>
            selectedMetrics.includes(metric.id),
          ).map((metric: any) => (
            <div
              key={metric.id}
              className="rounded-[18px] border border-[#EBEAE4] bg-[#F5F4EF] p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-bold text-gray-900">
                  {metric.title}
                </span>
                <span
                  className={`text-[11px] font-bold ${metric.textClass}`}
                >
                  {metric.change}
                </span>
              </div>
              <p className="text-[20px] font-bold text-gray-900">
                {metric.value}{" "}
                <span className="text-[11px] font-medium text-gray-500">
                  {metric.unit}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}