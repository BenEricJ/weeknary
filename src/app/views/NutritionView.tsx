import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Apple,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  Droplet,
  Flame,
  Leaf,
  MoreHorizontal,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Sun,
  Soup,
  Target,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";
import { NutritionDayDetailDrawer } from "../components/NutritionDayDetailDrawer";
import { NutritionMealDetailDrawer } from "../components/NutritionMealDetailDrawer";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import { CalendarEmptyState } from "../components/CalendarEmptyState";
import {
  WeekCalendar,
  type DayInfo,
} from "../components/WeekCalendar";
import {
  CompactNoticeList,
  CompactNoticeRow,
  OverviewSectionHeader,
  WeeklyMetricStrip,
  type WeeklyMetricItem,
} from "../components/overview/OverviewWidgets";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "../components/ui/drawer";
import {
  MEAL_SLOT_ORDER,
  getDayByDate,
  getExternalMealCount,
  getMealById,
  getPlannedMacrosForDay,
  getSelectedDayPrepNotes,
  type MealRecipe,
  type MealSlot,
  type MealSlotType,
  type NutritionDay,
  type NutritionPlan,
} from "../data/nutritionPlan";
import { useActiveMealPlan } from "../mealPlan/useActiveMealPlan";
import {
  getISOWeekDays,
  getISOWeekNumber,
  getISOWeekRange,
  getISOWeekYear,
  getSurroundingWeekOptions,
} from "../calendarWeekOptions";
import { formatWeekdayShortLabel, getDateParts, parseIsoDate, toIsoDate } from "../dateDisplay";
import { usePlanCalendarSelection } from "../planCalendarSelection";

const SLOT_META: Record<
  MealSlotType,
  {
    icon: LucideIcon;
    iconClassName: string;
    surfaceClassName: string;
    borderClassName: string;
    labelClassName: string;
    time: string;
  }
> = {
  breakfast: {
    icon: Sun,
    iconClassName: "text-[#C85C19]",
    surfaceClassName: "bg-[#FFF9F0]",
    borderClassName: "border-[#F2E3CF]",
    labelClassName: "text-[#C85C19]",
    time: "07:30",
  },
  lunch: {
    icon: Soup,
    iconClassName: "text-[#C85C19]",
    surfaceClassName: "bg-white",
    borderClassName: "border-gray-100",
    labelClassName: "text-[#C85C19]",
    time: "12:30",
  },
  dinner: {
    icon: Leaf,
    iconClassName: "text-[#4A634A]",
    surfaceClassName: "bg-white",
    borderClassName: "border-gray-100",
    labelClassName: "text-[#4A634A]",
    time: "19:00",
  },
  snack: {
    icon: Apple,
    iconClassName: "text-[#A36A3B]",
    surfaceClassName: "bg-white",
    borderClassName: "border-gray-100",
    labelClassName: "text-[#A36A3B]",
    time: "16:30",
  },
};

type TopStatDetails = {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
  title: string;
  lines: string[];
  footer?: string;
};

type NutritionNotice = {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconSurfaceClassName?: string;
};

type HybridInfoRow = {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconSurfaceClassName?: string;
};

export function NutritionView() {
  const navigate = useNavigate();
  const activeMealPlan = useActiveMealPlan();
  const nutritionPlan = activeMealPlan.legacyPlan;
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
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [selectedSlotType, setSelectedSlotType] = useState<MealSlotType | null>(
    null,
  );
  const [selectedTopStat, setSelectedTopStat] =
    useState<TopStatDetails | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const selectedDay = useMemo(
    () => getDayByDate(nutritionPlan, selectedDate),
    [nutritionPlan, selectedDate],
  );
  const selectedSlot = useMemo(
    () =>
      selectedSlotType
        ? selectedDay.meals.find((meal) => meal.slot === selectedSlotType) ??
          null
        : null,
    [selectedDay, selectedSlotType],
  );
  const selectedMeal = useMemo(
    () => getMealById(nutritionPlan, selectedSlot?.mealId),
    [nutritionPlan, selectedSlot],
  );
  const plannedMacros = useMemo(
    () => getPlannedMacrosForDay(nutritionPlan, selectedDay),
    [nutritionPlan, selectedDay],
  );
  const externalMealCount = useMemo(
    () => getExternalMealCount(selectedDay),
    [selectedDay],
  );
  const prepNotes = useMemo(
    () => getSelectedDayPrepNotes(nutritionPlan, selectedDay),
    [nutritionPlan, selectedDay],
  );
  const selectedDateParts = useMemo(
    () => getDateParts(selectedDate),
    [selectedDate],
  );
  const hasSelectedDayData = useMemo(
    () => nutritionPlan.days.some((day) => day.isoDate === selectedDate),
    [nutritionPlan, selectedDate],
  );
  const selectedWeekRange = useMemo(
    () => getISOWeekRange(selectedWeekYear, selectedWeek),
    [selectedWeekYear, selectedWeek],
  );
  const hasSelectedWeekData = useMemo(
    () =>
      nutritionPlan.days.some(
        (day) =>
          day.isoDate >= selectedWeekRange.startDate &&
          day.isoDate <= selectedWeekRange.endDate,
      ),
    [nutritionPlan, selectedWeekRange.endDate, selectedWeekRange.startDate],
  );
  const nutritionDateSet = useMemo(
    () => new Set(nutritionPlan.days.map((day) => day.isoDate)),
    [nutritionPlan],
  );
  const weekDays = useMemo(
    () =>
      getISOWeekDays(selectedWeekYear, selectedWeek).map((day) => ({
        ...day,
        hasData: nutritionDateSet.has(day.date),
      })),
    [nutritionDateSet, selectedWeek, selectedWeekYear],
  );
  const selectedWeekDays = useMemo(
    () =>
      weekDays.map((day) => ({
        dayInfo: day,
        nutritionDay:
          nutritionPlan.days.find(
            (nutritionDay) => nutritionDay.isoDate === day.date,
          ) ?? null,
      })),
    [nutritionPlan, weekDays],
  );
  const currentDate = useMemo(() => {
    const today = toIsoDate(new Date());
    return weekDays.some((day) => day.date === today) ? today : undefined;
  }, [weekDays]);
  const weekOptions = useMemo(
    () =>
      getSurroundingWeekOptions(selectedWeek).map((week) => {
        const range = getISOWeekRange(selectedWeekYear, week.weekNumber);
        return {
          ...week,
          hasData: Array.from(nutritionDateSet).some(
            (date) => date >= range.startDate && date <= range.endDate,
          ),
        };
      }),
    [nutritionDateSet, selectedWeek, selectedWeekYear],
  );

  useEffect(() => {
    setIsDayDetailsOpen(false);
    setSelectedSlotType(null);
    setSelectedTopStat(null);
  }, [selectedDate]);

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

  const orderedMeals = useMemo(
    () =>
      MEAL_SLOT_ORDER.map((slotType) =>
        selectedDay.meals.find((meal) => meal.slot === slotType),
      ).filter((slot): slot is MealSlot => Boolean(slot)),
    [selectedDay],
  );
  const basisBreakdownLines = useMemo(
    () =>
      selectedDay.meals.flatMap((slot) => {
        const meal = getMealById(nutritionPlan, slot.mealId);

        if (slot.isExternal || !meal?.nutrition) {
          return [];
        }

        return [
          `${getDisplayMealSlotLabel(slot.slot)}: ${meal.name} (${meal.nutrition.kcal} kcal, ${meal.nutrition.protein} g Protein)`,
        ];
      }),
    [nutritionPlan, selectedDay],
  );
  const plannedMealCount = Math.max(1, selectedDay.meals.length);
  const targetKcalPerSlot = Math.round(
    selectedDay.targets.kcalTarget / plannedMealCount,
  );
  const targetProteinPerSlot = Math.round(
    selectedDay.targets.proteinTarget / plannedMealCount,
  );
  const nutritionNotices = useMemo(
    () =>
      buildNutritionNotices({
        nutritionPlan,
        selectedDay,
        plannedMacros,
        externalMealCount,
      }),
    [externalMealCount, nutritionPlan, plannedMacros, selectedDay],
  );
  const weeklyMetrics = useMemo(
    () =>
      buildWeeklyMetrics({
        nutritionPlan,
        selectedWeekRange,
        openDetails: () => setIsDayDetailsOpen(true),
      }),
    [nutritionPlan, selectedWeekRange],
  );
  const hybridInfoRows = useMemo(
    () => buildHybridInfoRows(nutritionPlan, prepNotes),
    [nutritionPlan, prepNotes],
  );

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <AppTabHeader
        icon={UtensilsCrossed}
        iconClassName="text-[#C85C19]"
        title="Ernährung"
        subtitle={
          <>
            {formatWeekdayShortLabel(selectedDay.dayShort)}, {selectedDay.date}. {selectedDay.monthLabel}
            {" · "}
            {plannedMacros.kcal} kcal geplant
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
              <section className="flex flex-col gap-3">
                <div className="px-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Wochenübersicht
                  </h3>
                </div>
                {selectedWeekDays.map(({ dayInfo, nutritionDay }) => (
                  <WeeklyNutritionDayCard
                    key={dayInfo.date}
                    dayInfo={dayInfo}
                    nutritionDay={nutritionDay}
                    nutritionPlan={nutritionPlan}
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
            <section
              className="flex flex-col rounded-[20px] border border-[#F0E1CB] bg-[#FFF8F1] p-4 shadow-sm"
              style={{ height: 174, minHeight: 174 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <Target size={20} className="text-[#C85C19]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C85C19]">
                      Ernährungsziel
                    </p>
                    <h2 className="mt-1 text-[16px] font-bold leading-tight text-gray-900">
                      Tagesziel im Blick
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-tight text-gray-600">
                      Ernähre dich ausgewogen und treffe deine Makro-Ziele.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDayDetailsOpen(true)}
                  aria-label="Tagesdetails öffnen"
                  className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2">
                <TopStatCard
                  icon={Flame}
                  label="Kalorien"
                  value={`${selectedDay.targets.kcalTarget}`}
                  sublabel="kcal"
                  progress={getProgressPercent(
                    plannedMacros.kcal,
                    selectedDay.targets.kcalTarget,
                  )}
                  detailTitle="Kalorienziel"
                  detailLines={[
                    `${selectedDay.training}.`,
                    selectedDay.dailyLogic,
                    `Auf ${plannedMealCount} Slots verteilt sind das grob ${targetKcalPerSlot} kcal pro Meal.`,
                  ]}
                  detailFooter={
                    externalMealCount > 0
                      ? `${externalMealCount} externer Slot bleibt bewusst flexibel geplant.`
                      : "Alle Slots sind als fixe Planmeals hinterlegt."
                  }
                  onOpenDetails={setSelectedTopStat}
                />
                <TopStatCard
                  icon={Leaf}
                  label="Protein"
                  value={`${selectedDay.targets.proteinTarget}`}
                  sublabel="g Minimum"
                  progress={getProgressPercent(
                    plannedMacros.protein,
                    selectedDay.targets.proteinTarget,
                  )}
                  detailTitle="Proteinminimum"
                  detailLines={[
                    `Tagesminimum für ${selectedDay.dayLabel}: ${selectedDay.targets.proteinTarget} g Protein.`,
                    `Auf ${plannedMealCount} Slots verteilt sind das grob ${targetProteinPerSlot} g pro Meal.`,
                    externalMealCount > 0
                      ? `${externalMealCount} externer Slot sollte proteinbewusst gewählt werden.`
                      : "Das komplette Proteinminimum wird über Planmeals abgebildet.",
                  ]}
                  onOpenDetails={setSelectedTopStat}
                />
                <TopStatCard
                  icon={CalendarDays}
                  label="Basis"
                  value={`${plannedMacros.kcal}`}
                  sublabel={`${plannedMacros.protein} g Protein`}
                  progress={getProgressPercent(
                    plannedMacros.kcal,
                    selectedDay.targets.kcalTarget,
                  )}
                  detailTitle="Im Basiswert enthalten"
                  detailLines={
                    basisBreakdownLines.length
                      ? basisBreakdownLines
                      : ["Für diesen Tag sind nur flexible oder externe Slots geplant."]
                  }
                  detailFooter={
                    externalMealCount > 0
                      ? `Externe Meals sind hier nicht eingerechnet. Aktuell offen: ${externalMealCount} Slot.`
                      : "Die Basis deckt alle Planmeals des Tages ab."
                  }
                  onOpenDetails={setSelectedTopStat}
                />
              </div>
            </section>

            <section>
              <OverviewSectionHeader
                title="Heute geplant"
                rightLabel="Details"
                onRightClick={() => setIsDayDetailsOpen(true)}
              />
              <div className="flex flex-col gap-2">
                {orderedMeals.map((slot) => (
                  <MealPlanRow
                    key={`${selectedDay.isoDate}-${slot.slot}`}
                    slot={slot}
                    meal={getMealById(nutritionPlan, slot.mealId)}
                    externalKcalRange={nutritionPlan.externalMealGuidance.kcalRange}
                    externalProteinRange={
                      nutritionPlan.externalMealGuidance.proteinRange
                    }
                    onClick={() => setSelectedSlotType(slot.slot)}
                  />
                ))}
              </div>
            </section>

            <section>
              <OverviewSectionHeader title="Heute beachten" />
              <CompactNoticeList>
                {nutritionNotices.map((notice, index) => (
                  <React.Fragment key={notice.title}>
                    {index > 0 ? <div className="mx-3 h-px bg-gray-100" /> : null}
                    <CompactNoticeRow
                      icon={notice.icon}
                      title={notice.title}
                      description={notice.description}
                      iconSurfaceClassName={notice.iconSurfaceClassName}
                    />
                  </React.Fragment>
                ))}
              </CompactNoticeList>
            </section>

            {hybridInfoRows.length > 0 ? (
              <section>
                <OverviewSectionHeader title="Meal-Prep & Budget" />
                <CompactNoticeList>
                  {hybridInfoRows.map((row, index) => (
                    <React.Fragment key={row.title}>
                      {index > 0 ? (
                        <div className="mx-3 h-px bg-gray-100" />
                      ) : null}
                      <CompactNoticeRow
                        icon={row.icon}
                        title={row.title}
                        description={row.description}
                        iconSurfaceClassName={row.iconSurfaceClassName}
                      />
                    </React.Fragment>
                  ))}
                </CompactNoticeList>
              </section>
            ) : null}

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
                ? `Keine Ernährungsdaten für KW ${selectedWeek}`
                : `Keine Ernährungsdaten für ${selectedDateParts.dayLabel}, ${selectedDateParts.date}. ${selectedDateParts.monthLabel}`
            }
            description="Für diesen Zeitraum liegt im aktiven MealPlan noch kein Eintrag vor."
            onCreatePlan={createPlanForSelection}
            onManualAdd={goToPlanningProfile}
          />
        )}
      </div>

      <NutritionMealDetailDrawer
        day={selectedDay}
        slot={selectedSlot}
        meal={selectedMeal}
        externalGuidance={nutritionPlan.externalMealGuidance}
        onClose={() => setSelectedSlotType(null)}
      />
      <NutritionDayDetailDrawer
        day={selectedDay}
        plan={nutritionPlan}
        open={isDayDetailsOpen}
        initialSlotType={selectedSlotType}
        onClose={() => setIsDayDetailsOpen(false)}
      />
      <TopStatDetailDrawer
        stat={selectedTopStat}
        onClose={() => setSelectedTopStat(null)}
      />
      <UserProfileDrawer isOpen={isProfileOpen} onClose={setIsProfileOpen} />
    </div>
  );
}

function TopStatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  progress,
  detailTitle,
  detailLines,
  detailFooter,
  onOpenDetails,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
  progress: number;
  detailTitle?: string;
  detailLines?: string[];
  detailFooter?: string;
  onOpenDetails?: (details: TopStatDetails) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!detailTitle || !detailLines?.length || !onOpenDetails) {
          return;
        }

        onOpenDetails({
          icon: Icon,
          label,
          value,
          sublabel,
          title: detailTitle,
          lines: detailLines,
          footer: detailFooter,
        });
      }}
      className="h-[58px] w-full rounded-[14px] border border-white/80 bg-white/85 px-2 py-1.5 text-left shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C85C19]/30 active:scale-[0.99]"
      aria-label={`${label}: ${value} ${sublabel}`}
    >
      <div className="mb-1 flex items-center justify-between gap-1.5 text-gray-500">
        <div className="flex min-w-0 items-center gap-1.5">
          <Icon size={10} className="shrink-0 text-[#C85C19]" />
          <span className="truncate text-[8px] font-bold uppercase tracking-wide">
            {label}
          </span>
        </div>
        <MoreHorizontal size={10} className="shrink-0 text-gray-400" />
      </div>
      <p className="text-[15px] font-bold leading-none text-gray-900">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[8px] font-medium leading-tight text-gray-500">
        {sublabel}
      </p>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F0E4DA] shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF8A2A] to-[#FF4D00] shadow-[0_0_6px_rgba(255,90,0,0.28)] transition-[width] duration-500 ease-out"
          style={{
            width: `${progress}%`,
            minWidth: progress > 0 ? 6 : 0,
          }}
        />
      </div>
    </button>
  );
}

function WeeklyNutritionDayCard({
  dayInfo,
  nutritionDay,
  nutritionPlan,
  isActive,
  onSelect,
}: {
  dayInfo: DayInfo<string>;
  nutritionDay: NutritionDay | null;
  nutritionPlan: NutritionPlan;
  isActive: boolean;
  onSelect: () => void;
}) {
  const macros = nutritionDay
    ? getPlannedMacrosForDay(nutritionPlan, nutritionDay)
    : null;
  const firstSlot = nutritionDay?.meals[0] ?? null;
  const firstMeal = firstSlot
    ? getMealById(nutritionPlan, firstSlot.mealId)
    : null;
  const mealCount = nutritionDay?.meals.length ?? 0;
  const previewMeals =
    nutritionDay?.meals.slice(0, 2).map((slot) => {
      const meal = getMealById(nutritionPlan, slot.mealId);
      return meal?.name ?? "Externes Meal";
    }) ?? [];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[14px] border px-3 py-2 text-left shadow-sm transition-colors active:scale-[0.99] ${
        isActive
          ? "border-[#F0D8BD] bg-[#FFF8F1]"
          : "border-gray-100 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-900">
            {dayInfo.day}
          </p>
          <p className="text-[11px] text-gray-500">
            {dayInfo.displayDate ?? dayInfo.date}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-tight text-gray-900">
            {firstMeal?.name ?? (nutritionDay ? "Flexibler Ernährungstag" : "Kein MealPlan")}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-gray-500">
            {previewMeals.length > 0
              ? previewMeals.join(" · ")
              : "Für diesen Tag liegt kein Eintrag vor."}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[12px] font-bold text-gray-900">
            {mealCount} {mealCount === 1 ? "Meal" : "Meals"}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-[#C85C19]">
            {macros ? `${macros.kcal} kcal` : "Offen"}
          </p>
        </div>
      </div>

      {macros ? (
        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-gray-600">
          <span className="rounded-md bg-[#FFF3E6] px-2 py-0.5 text-[#C85C19]">
            {macros.protein} g Protein
          </span>
          {nutritionDay?.targets.kcalTarget ? (
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">
              Ziel {nutritionDay.targets.kcalTarget} kcal
            </span>
          ) : null}
        </div>
      ) : null}
    </button>
  );
}

function MealPlanRow({
  slot,
  meal,
  externalKcalRange,
  externalProteinRange,
  onClick,
}: {
  slot: MealSlot;
  meal: MealRecipe | null;
  externalKcalRange: string;
  externalProteinRange: string;
  onClick: () => void;
}) {
  const slotMeta = SLOT_META[slot.slot];
  const Icon = slotMeta.icon;
  const title = meal?.name ?? "Externes Meal";
  const subtitle = slot.isExternal
    ? "Proteinreich wählen, Calcium und Jod im Blick behalten."
    : getMealSubtitle(meal);
  const kcalValue = slot.isExternal
    ? stripUnit(externalKcalRange, "kcal")
    : `${meal?.nutrition?.kcal ?? "-"}`;
  const proteinValue = slot.isExternal
    ? stripProteinLabel(externalProteinRange)
    : `${meal?.nutrition?.protein ?? "-"} g`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[84px] w-full rounded-[16px] border p-2.5 text-left shadow-sm transition-colors hover:brightness-[0.99] active:scale-[0.99] ${slotMeta.surfaceClassName} ${slotMeta.borderClassName}`}
    >
      <div className="grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80">
          <Icon size={18} className={slotMeta.iconClassName} />
        </div>

        <div className="min-w-0">
          <h4 className="line-clamp-2 text-[13.5px] font-bold leading-tight text-gray-900">
            {title}
          </h4>
          <p className="mt-1 truncate text-[11px] font-medium leading-tight text-gray-500">
            {subtitle}
          </p>
          <div className="mt-1.5 flex min-w-0 items-center gap-2 text-[10px] font-bold text-gray-600">
            <span className="shrink-0">{meal?.cookTime ?? "Flexibel"}</span>
            {slot.isExternal ? (
              <span className="flex min-w-0 items-center gap-1 truncate text-[#A36A3B]">
                <AlertTriangle size={11} className="shrink-0" />
                Guidance
              </span>
            ) : (
              meal?.tags.slice(0, 1).map((tag) => (
                <span
                  key={`${meal.id}-${tag}`}
                  className="flex min-w-0 items-center gap-1 truncate"
                >
                  <UtensilsCrossed size={11} className="shrink-0 text-gray-400" />
                  <span className="truncate">{tag}</span>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="text-right">
            <p className="text-[11px] font-bold leading-tight text-gray-600">
              {slotMeta.time}
            </p>
            <p
              className={`text-[10px] font-bold leading-tight ${slotMeta.labelClassName}`}
            >
              {getDisplayMealSlotLabel(slot.slot)}
            </p>
          </div>
          <div className="rounded-[10px] border border-gray-100 bg-white px-2 py-1 text-[11px] font-bold leading-none text-gray-900 shadow-sm">
            {kcalValue}
            <span className="ml-1 text-[8px] uppercase tracking-wide text-gray-500">
              kcal
            </span>
          </div>
          <div className="rounded-[10px] border border-gray-100 bg-white px-2 py-1 text-[11px] font-bold leading-none text-gray-900 shadow-sm">
            {proteinValue}
            <span className="ml-1 text-[8px] uppercase tracking-wide text-gray-500">
              prot.
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function TopStatDetailDrawer({
  stat,
  onClose,
}: {
  stat: TopStatDetails | null;
  onClose: () => void;
}) {
  const Icon = stat?.icon;

  return (
    <Drawer open={!!stat} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="mx-auto max-w-[390px] rounded-t-[24px] border-t-0 bg-[#F5F4EF]">
        <DrawerTitle className="sr-only">
          {stat ? `${stat.label} Details` : "KPI Details"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Detailerklärung zur ausgewählten Kennzahl.
        </DrawerDescription>

        {stat ? (
          <div className="px-5 pb-6 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white shadow-sm">
                  {Icon ? <Icon size={18} className="text-[#C85C19]" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C85C19]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-[18px] font-bold leading-tight text-gray-900">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-gray-500">
                    {stat.value} {stat.sublabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
                aria-label="Details schließen"
              >
                <ChevronLeft size={18} className="rotate-[-90deg]" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {stat.lines.map((line) => (
                <div
                  key={line}
                  className="rounded-[16px] bg-white px-3 py-2.5 shadow-sm"
                >
                  <p className="text-[12px] leading-snug text-gray-700">
                    {line}
                  </p>
                </div>
              ))}
            </div>

            {stat.footer ? (
              <div className="mt-4 rounded-[16px] border border-[#F0E1CB] bg-[#FFF8F1] px-3 py-3">
                <p className="text-[11px] leading-snug text-[#9F4512]">
                  {stat.footer}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function buildNutritionNotices({
  nutritionPlan,
  selectedDay,
  plannedMacros,
  externalMealCount,
}: {
  nutritionPlan: NutritionPlan;
  selectedDay: NutritionDay;
  plannedMacros: { kcal: number; protein: number; carbs: number; fat: number };
  externalMealCount: number;
}): NutritionNotice[] {
  const notices: NutritionNotice[] = [];

  if (externalMealCount > 0) {
    notices.push({
      icon: <AlertTriangle size={18} className="text-[#C85C19]" />,
      title: "Externes Meal offen",
      description: `${externalMealCount} Slot proteinbewusst wählen.`,
      iconSurfaceClassName: "bg-[#FFF3E6]",
    });
  }

  if (
    selectedDay.targets.proteinTarget > 0 &&
    plannedMacros.protein < selectedDay.targets.proteinTarget
  ) {
    notices.push({
      icon: <Leaf size={18} className="text-[#4A634A]" />,
      title: "Protein nachziehen",
      description: `Noch ${selectedDay.targets.proteinTarget - plannedMacros.protein} g bis zum Tagesziel.`,
      iconSurfaceClassName: "bg-[#EEF5EC]",
    });
  } else {
    notices.push({
      icon: <Leaf size={18} className="text-[#4A634A]" />,
      title: "Protein über den Tag verteilen",
      description: "Sehr gut so, weiterhin konstant bleiben.",
      iconSurfaceClassName: "bg-[#EEF5EC]",
    });
  }

  const criticalTip =
    nutritionPlan.criticalNutrientTips.find(
      (tip) => tip.status === "attention" || tip.status === "supplement",
    ) ?? nutritionPlan.criticalNutrientTips[0];

  if (criticalTip) {
    notices.push({
      icon: <Wheat size={18} className="text-[#C85C19]" />,
      title: `${criticalTip.nutrient} beachten`,
      description: criticalTip.action,
      iconSurfaceClassName: "bg-[#FFF3E6]",
    });
  } else {
    notices.push({
      icon: <Droplet size={18} className="text-[#789A5A]" />,
      title: "Ausreichend trinken",
      description: "Noch 2-3 Gläser bis zum Ziel.",
      iconSurfaceClassName: "bg-[#EEF5EC]",
    });
  }

  return notices.slice(0, 3);
}

function buildWeeklyMetrics({
  nutritionPlan,
  selectedWeekRange,
  openDetails,
}: {
  nutritionPlan: NutritionPlan;
  selectedWeekRange: { startDate: string; endDate: string };
  openDetails: () => void;
}): WeeklyMetricItem[] {
  const weekNutritionDays = nutritionPlan.days.filter(
    (day) =>
      day.isoDate >= selectedWeekRange.startDate &&
      day.isoDate <= selectedWeekRange.endDate,
  );
  const weekDayTarget = 7;
  const calorieDaysOnTarget = weekNutritionDays.filter((day) => {
    const macros = getPlannedMacrosForDay(nutritionPlan, day);
    if (day.targets.kcalTarget <= 0) {
      return macros.kcal > 0;
    }

    const lowerBound = day.targets.kcalTarget * 0.9;
    const upperBound = day.targets.kcalTarget * 1.1;
    return macros.kcal >= lowerBound && macros.kcal <= upperBound;
  }).length;
  const proteinDaysOnTarget = weekNutritionDays.filter((day) => {
    const macros = getPlannedMacrosForDay(nutritionPlan, day);
    return macros.protein >= day.targets.proteinTarget;
  }).length;
  const expectedMealSlots = weekDayTarget * MEAL_SLOT_ORDER.length;
  const plannedMealSlots = weekNutritionDays.reduce(
    (sum, day) => sum + day.meals.length,
    0,
  );
  const planPercent =
    expectedMealSlots > 0
      ? Math.round((plannedMealSlots / expectedMealSlots) * 100)
      : 0;

  return [
    {
      icon: <Flame size={12} className="shrink-0 text-[#C85C19]" />,
      label: "Kalorien",
      value: `${calorieDaysOnTarget} / ${weekDayTarget} Tage`,
      progress: (calorieDaysOnTarget / weekDayTarget) * 100,
      accentClassName: "bg-[#FF5A00]",
      trackClassName: "bg-[#F0E4DA]",
      onClick: openDetails,
      ariaLabel: "Kalorienwoche öffnen",
    },
    {
      icon: <Sparkles size={12} className="shrink-0 text-[#C85C19]" />,
      label: "Protein-Ziel",
      value: `${proteinDaysOnTarget} / ${weekDayTarget} Tage`,
      progress: (proteinDaysOnTarget / weekDayTarget) * 100,
      accentClassName: "bg-[#FF5A00]",
      trackClassName: "bg-[#F0E4DA]",
      onClick: openDetails,
      ariaLabel: "Proteinwoche öffnen",
    },
    {
      icon: <ShieldCheck size={12} className="shrink-0 text-[#C85C19]" />,
      label: "Plan",
      value: `${Math.min(planPercent, 100)}%`,
      progress: planPercent,
      accentClassName: "bg-[#FF5A00]",
      trackClassName: "bg-[#F0E4DA]",
      onClick: openDetails,
      ariaLabel: "Planfortschritt öffnen",
    },
  ];
}

function buildHybridInfoRows(
  nutritionPlan: NutritionPlan,
  prepNotes: Array<{ title: string; subtitle: string }>,
): HybridInfoRow[] {
  const rows: HybridInfoRow[] = [];
  const meaningfulPrepNotes = prepNotes.filter(
    (note) => note.title.trim() || note.subtitle.trim(),
  );
  const hasBudget =
    nutritionPlan.budget.totalCost > 0 || nutritionPlan.budget.budgetHardCap > 0;

  if (meaningfulPrepNotes.length > 0) {
    rows.push({
      icon: <PackageCheck size={18} className="text-[#4A634A]" />,
      title: meaningfulPrepNotes[0].title,
      description: meaningfulPrepNotes[0].subtitle || "Für heute vormerken.",
      iconSurfaceClassName: "bg-[#EEF5EC]",
    });
  }

  if (hasBudget) {
    rows.push({
      icon: <CalendarCheck size={18} className="text-[#C85C19]" />,
      title: "Budget",
      description: `${formatEuro(nutritionPlan.budget.totalCost)} / ${formatEuro(
        nutritionPlan.budget.budgetHardCap,
      )} EUR · ${nutritionPlan.budget.status}`,
      iconSurfaceClassName: "bg-[#FFF3E6]",
    });
  }

  rows.push({
    icon: <Sparkles size={18} className="text-[#4A634A]" />,
    title: "Wocheninfo",
    description: nutritionPlan.week.planLabel,
    iconSurfaceClassName: "bg-[#EEF5EC]",
  });

  return rows;
}

function getMealSubtitle(meal: MealRecipe | null) {
  if (!meal) {
    return "Kein Rezept gefunden.";
  }

  const ingredientsPreview = meal.ingredients
    .slice(0, 3)
    .map((ingredient) => ingredient.ingredient)
    .join(", ");

  return `${ingredientsPreview}${meal.ingredients.length > 3 ? " ..." : ""}`;
}

function getDisplayMealSlotLabel(slot: MealSlotType) {
  switch (slot) {
    case "breakfast":
      return "Frühstück";
    case "lunch":
      return "Mittagessen";
    case "dinner":
      return "Abendessen";
    case "snack":
      return "Snack";
    default:
      return slot;
  }
}

function getProgressPercent(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(Math.round((current / target) * 100), 100));
}

function stripUnit(value: string, unit: string) {
  return value.replace(new RegExp(`\\s*${unit}\\b`, "i"), "").trim();
}

function stripProteinLabel(value: string) {
  return value.replace(/\s*Protein\b/i, "").trim();
}

function formatEuro(value: number) {
  return value.toFixed(2).replace(".", ",");
}
