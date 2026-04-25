import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Zap,
  Moon,
  Utensils,
  Flame,
  Home as HomeIcon,
  Droplet,
  Footprints,
  ShieldCheck,
} from "lucide-react";
import {
  EventEditDrawer,
  type EventEditDraft,
  type EventEditSession,
} from "../components/EventEditDrawer";
import {
  WorkoutDetailDrawer,
  WORKOUT_DATA,
} from "../components/WorkoutDetailDrawer";
import { FocusDetailDrawer } from "../components/FocusDetailDrawer";
import { AppTabHeader } from "../components/AppTabHeader";
import {
  WeekCalendar,
  type WeekCalendarSelectionMode,
} from "../components/WeekCalendar";
import { CalendarEmptyState } from "../components/CalendarEmptyState";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import { WeeklyFocusCard } from "../components/home/HomeSections";
import {
  WeekEventDetailDrawer,
  type WeekEventDetailItem,
} from "../components/WeekEventDetailDrawer";
import { DayScheduleSection } from "../components/schedule/DayScheduleSection";
import { FOCUS_STEPS } from "../data/focusSteps";
import {
  NUTRITION_PLAN,
  getDayByDate,
  getMealById,
  type MealSlotType,
  type NutritionDay,
} from "../data/nutritionPlan";
import {
  CATEGORY_META,
  WEEK_PLAN,
  buildEventDetail,
  getDayDate,
  isSameDay,
  toMinutes,
  type CategoryKey,
  type DayPlan,
  type EventItem,
  type ScheduleEntry,
} from "../data/weekPlan";
import {
  getDateInISOWeek,
  getISOWeekDays,
  getISOWeekNumber,
  getISOWeekRange,
  getISOWeekYear,
  getSurroundingWeekOptions,
  getWeekdayIndex,
} from "../calendarWeekOptions";
import { toIsoDate, parseIsoDate } from "../dateDisplay";
import { useActiveWeekPlan } from "../weekPlan/useActiveWeekPlan";
import { weekPlanToDisplayDays } from "../weekPlan/weekPlanDisplayAdapter";
import {
  createEmptyDisplayDay,
  getDayKey,
} from "../weekPlan/displayDayFactory";

const EATEN_SLOT_CUTOFF_MINUTES: Record<MealSlotType, number> =
  {
    breakfast: 10 * 60,
    lunch: 14 * 60,
    snack: 17 * 60,
    dinner: 21 * 60,
  };

function getWorkoutKcal(workoutId: string) {
  const kcalStat = WORKOUT_DATA[workoutId]?.statsBar.find(
    (stat) => stat.val.toLowerCase().includes("kcal"),
  );
  const kcalValue = kcalStat?.val.match(/\d+/g)?.join("");

  return kcalValue ? Number(kcalValue) : 0;
}

function getBurnedWorkoutKcal(day: DayPlan, now: Date) {
  const dayDate = getDayDate(day);
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const isPastDay = dayDate < todayStart;
  const isToday = isSameDay(dayDate, now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return day.events.reduce((total, event) => {
    if (!event.workoutId) {
      return total;
    }

    const hasEnded = toMinutes(event.end) <= currentMinutes;
    if (!isPastDay && (!isToday || !hasEnded)) {
      return total;
    }

    return total + getWorkoutKcal(event.workoutId);
  }, 0);
}

function getExternalMealKcalEstimate() {
  const rangeValues =
    NUTRITION_PLAN.externalMealGuidance.kcalRange
      .match(/\d+/g)
      ?.map(Number);

  if (!rangeValues?.length) {
    return 0;
  }

  if (rangeValues.length === 1) {
    return rangeValues[0];
  }

  return Math.round((rangeValues[0] + rangeValues[1]) / 2);
}

function getNutritionDayDate(day: NutritionDay) {
  const [year, month, date] = day.isoDate
    .split("-")
    .map(Number);
  return new Date(year, month - 1, date);
}

function getEatenKcalForDay(day: NutritionDay, now: Date) {
  const dayDate = getNutritionDayDate(day);
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const isPastDay = dayDate < todayStart;
  const isToday = isSameDay(dayDate, now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return day.meals.reduce((total, slot) => {
    const cutoffMinutes = EATEN_SLOT_CUTOFF_MINUTES[slot.slot];
    if (
      !isPastDay &&
      (!isToday || currentMinutes < cutoffMinutes)
    ) {
      return total;
    }

    if (slot.isExternal) {
      return total + getExternalMealKcalEstimate();
    }

    const meal = getMealById(NUTRITION_PLAN, slot.mealId);
    return total + (meal?.nutrition?.kcal ?? 0);
  }, 0);
}

export function HomeView() {
  const navigate = useNavigate();
  const activeWeekPlan = useActiveWeekPlan();
  const sourceWeekPlan = useMemo(
    () =>
      activeWeekPlan.plan
        ? weekPlanToDisplayDays(activeWeekPlan.plan)
        : WEEK_PLAN.map((day) => ({
            ...day,
            dayKey: toIsoDate(getDayDate(day)),
          })),
    [activeWeekPlan.plan],
  );
  const [weekPlan, setWeekPlan] = useState(() => sourceWeekPlan);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<
    string | null
  >(null);
  const [selectedEventDetail, setSelectedEventDetail] =
    useState<WeekEventDetailItem | null>(null);
  const [editingEvent, setEditingEvent] =
    useState<EventEditSession | null>(null);
  const [openSwipeEventId, setOpenSwipeEventId] = useState<
    string | null
  >(null);
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const currentWeekNumber = useMemo(
    () => getISOWeekNumber(new Date()),
    [],
  );
  const currentWeekYear = useMemo(() => getISOWeekYear(new Date()), []);
  const [calendarMode, setCalendarMode] =
    useState<WeekCalendarSelectionMode>("day");
  const [selectedWeek, setSelectedWeek] =
    useState(currentWeekNumber);
  const [now, setNow] = useState(() => new Date());

  const [checkedItems, setCheckedItems] = useState<
    Record<string, boolean>
  >({
    s1: true,
  });

  const toggleFocusStep = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setWeekPlan(sourceWeekPlan);
  }, [sourceWeekPlan]);

  const progressPercent = useMemo(() => {
    const completedCount =
      Object.values(checkedItems).filter(Boolean).length;
    return Math.round(
      (completedCount / FOCUS_STEPS.length) * 100,
    );
  }, [checkedItems]);

  const nextStep = useMemo(() => {
    return (
      FOCUS_STEPS.find((step) => !checkedItems[step.id]) ??
      FOCUS_STEPS[FOCUS_STEPS.length - 1]
    );
  }, [checkedItems]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const selectedDay = useMemo(
    () =>
      weekPlan.find((day) => getDayKey(day) === selectedDate) ??
      createEmptyDisplayDay(selectedDate),
    [selectedDate, weekPlan],
  );
  const hasSelectedDayData = useMemo(
    () => weekPlan.some((day) => getDayKey(day) === selectedDate),
    [selectedDate, weekPlan],
  );
  const selectedWeekRange = useMemo(
    () => getISOWeekRange(currentWeekYear, selectedWeek),
    [currentWeekYear, selectedWeek],
  );
  const hasSelectedWeekData = useMemo(
    () =>
      weekPlan.some((day) => {
        const dayKey = getDayKey(day);
        return (
          dayKey >= selectedWeekRange.startDate &&
          dayKey <= selectedWeekRange.endDate
        );
      }),
    [selectedWeekRange.endDate, selectedWeekRange.startDate, weekPlan],
  );
  const weekPlanDateSet = useMemo(
    () => new Set(weekPlan.map((day) => getDayKey(day))),
    [weekPlan],
  );
  const isSelectedDayToday = useMemo(
    () => selectedDate === toIsoDate(now),
    [selectedDate, now],
  );
  const burnedWorkoutKcal = useMemo(
    () => (hasSelectedDayData ? getBurnedWorkoutKcal(selectedDay, now) : 0),
    [hasSelectedDayData, selectedDay, now],
  );
  const selectedNutritionDay = useMemo(
    () => getDayByDate(NUTRITION_PLAN, selectedDate),
    [selectedDate],
  );
  const eatenKcal = useMemo(
    () => getEatenKcalForDay(selectedNutritionDay, now),
    [selectedNutritionDay, now],
  );

  const weekDays = useMemo(
    () =>
      getISOWeekDays(currentWeekYear, selectedWeek).map((day) => ({
        ...day,
        hasData: weekPlanDateSet.has(day.date),
      })),
    [currentWeekYear, selectedWeek, weekPlanDateSet],
  );
  const currentDate = useMemo(
    () =>
      weekDays.some((day) => day.date === toIsoDate(now))
        ? toIsoDate(now)
        : undefined,
    [now, weekDays],
  );
  const weekOptions = useMemo(
    () =>
      getSurroundingWeekOptions(selectedWeek).map((week) => {
        const range = getISOWeekRange(currentWeekYear, week.weekNumber);
        return {
          ...week,
          hasData: Array.from(weekPlanDateSet).some(
            (date) => date >= range.startDate && date <= range.endDate,
          ),
        };
      }),
    [currentWeekYear, selectedWeek, weekPlanDateSet],
  );

  const categoryOptions = useMemo(
    () =>
      Object.entries(CATEGORY_META).map(([value, meta]) => ({
        value,
        label: meta.label,
      })),
    [],
  );

  useEffect(() => {
    setOpenSwipeEventId(null);
  }, [selectedDate]);

  const openScheduleEntry = (
    day: DayPlan,
    entry: ScheduleEntry,
  ) => {
    setOpenSwipeEventId(null);

    if (entry.workoutId) {
      setSelectedWorkout(entry.workoutId);
      return;
    }

    setSelectedEventDetail(buildEventDetail(day, entry));
  };

  const openEventEditor = (dayKey: string, eventId: string) => {
    const day = weekPlan.find(
      (entry) => getDayKey(entry) === dayKey,
    );
    const event = day?.events.find(
      (entry) => entry.id === eventId,
    );

    if (!day || !event) {
      return;
    }

    setOpenSwipeEventId(null);
    setSelectedEventDetail(null);
    setEditingEvent({
      dayKey: day.dayKey ?? String(day.date),
      dayDate: day.date,
      dayLabel: day.dayLabel,
      date: day.date,
      monthLabel: day.monthLabel,
      event: { ...event },
    });
  };

  const saveEditedEvent = (draft: EventEditDraft) => {
    if (!editingEvent) {
      return;
    }

    setWeekPlan((previous) =>
      previous.some((day) => getDayKey(day) === editingEvent.dayKey)
        ? previous.map((day) =>
        getDayKey(day) === editingEvent.dayKey
          ? {
              ...day,
              events: day.events
                .some((event) => event.id === draft.id)
                ? day.events.map((event) =>
                  event.id === draft.id
                    ? {
                        ...event,
                        title: draft.title,
                        subtitle: draft.subtitle,
                        start: draft.start,
                        end: draft.end,
                        category: draft.category as CategoryKey,
                        subtasks: draft.subtasks,
                      }
                    : event,
                )
                : [
                    ...day.events,
                    {
                      id: draft.id,
                      title: draft.title,
                      subtitle: draft.subtitle,
                      start: draft.start,
                      end: draft.end,
                      category: draft.category as CategoryKey,
                      workoutId: draft.workoutId,
                      subtasks: draft.subtasks,
                    },
                  ]
                .sort(
                  (left, right) =>
                    toMinutes(left.start) -
                    toMinutes(right.start),
                ),
            }
          : day,
      )
        : [
            ...previous,
            {
              ...createEmptyDisplayDay(editingEvent.dayKey),
              events: [
                {
                  id: draft.id,
                  title: draft.title,
                  subtitle: draft.subtitle,
                  start: draft.start,
                  end: draft.end,
                  category: draft.category as CategoryKey,
                  workoutId: draft.workoutId,
                  subtasks: draft.subtasks,
                },
              ],
            },
          ],
    );

    setEditingEvent(null);
  };

  const deleteEvent = (dayKey: string, eventId: string) => {
    setWeekPlan((previous) =>
      previous.map((day) =>
        getDayKey(day) === dayKey
          ? {
              ...day,
              events: day.events.filter(
                (event) => event.id !== eventId,
              ),
            }
          : day,
      ),
    );

    if (selectedEventDetail?.id === eventId) {
      setSelectedEventDetail(null);
    }

    if (editingEvent?.event.id === eventId) {
      setEditingEvent(null);
    }

    if (openSwipeEventId === eventId) {
      setOpenSwipeEventId(null);
    }
  };

  const handleWeekChange = (weekNumber: number) => {
    const weekdayIndex = getWeekdayIndex(parseIsoDate(selectedDate));
    setSelectedWeek(weekNumber);
    setSelectedDate(
      getDateInISOWeek(currentWeekYear, weekNumber, weekdayIndex),
    );
  };

  const createPlanForSelection = () => {
    const range =
      calendarMode === "week"
        ? selectedWeekRange
        : { startDate: selectedDate, endDate: selectedDate };
    navigate(`/app/create?startDate=${range.startDate}&endDate=${range.endDate}`);
  };

  const openNewEventEditor = () => {
    const day = selectedDay;
    setEditingEvent({
      mode: "create",
      dayKey: selectedDate,
      dayDate: day.date,
      dayLabel: day.dayLabel,
      date: day.date,
      monthLabel: day.monthLabel,
      event: {
        id: `local-${Date.now()}`,
        title: "",
        subtitle: "",
        start: "09:00",
        end: "10:00",
        category: "orga",
      },
    });
  };

  return (
    <div className="relative h-full w-full bg-[#FAF9F6] flex flex-col overflow-hidden">
      <AppTabHeader
        icon={HomeIcon}
        title="Home"
        subtitle={
          <>
            {selectedDay.dayLabel}, {selectedDay.date}.{" "}
            {selectedDay.monthLabel}
            {" · "}
            {selectedDay.events.length} Blöcke geplant
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pt-[112px] pb-[88px] flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => navigate("/app/review")}
          className="bg-white rounded-[16px] p-1.5 shadow-sm border border-gray-100/80 flex items-center gap-2 min-h-[48px] w-full text-left transition-all hover:bg-gray-50 active:scale-[0.95]"
        >
          <div className="shrink-0 w-7 h-7 flex items-center justify-center bg-gray-50/50 rounded-lg">
            <Zap
              size={18}
              strokeWidth={2.5}
              className="text-[#4A634A]"
            />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] font-bold tracking-tight truncate text-gray-900">
              72
            </span>
            <span className="block text-[8px] font-semibold truncate text-[#4A634A]">
              Gut
            </span>
          </div>
        </button>
        <button
          onClick={() => navigate("/app/sleep")}
          className="bg-white rounded-[16px] p-1.5 shadow-sm border border-gray-100/80 flex items-center gap-2 min-h-[48px] w-full text-left transition-all hover:bg-gray-50 active:scale-[0.95]"
        >
          <div className="shrink-0 w-7 h-7 flex items-center justify-center bg-gray-50/50 rounded-lg">
            <Moon
              size={18}
              strokeWidth={2.5}
              className="text-[#6B5B95]"
            />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] font-bold tracking-tight truncate text-gray-900">
              7h 15
            </span>
            <span className="block text-[8px] font-semibold truncate text-[#4A634A]">
              Gut
            </span>
          </div>
        </button>
        <button
          onClick={() => navigate("/app/training")}
          className="bg-white rounded-[16px] p-1.5 shadow-sm border border-gray-100/80 flex items-center gap-2 min-h-[48px] w-full text-left transition-all hover:bg-gray-50 active:scale-[0.95]"
        >
          <div className="shrink-0 w-7 h-7 flex items-center justify-center bg-gray-50/50 rounded-lg">
            <Flame
              size={18}
              strokeWidth={2.5}
              className="text-[#D37F36]"
            />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] font-bold tracking-tight truncate text-gray-900">
              {burnedWorkoutKcal.toLocaleString("de-DE")} kcal
            </span>
            <span className="block text-[8px] font-semibold truncate text-[#4a634a]">
              Gut
            </span>
          </div>
        </button>
        <button
          onClick={() => navigate("/app/nutrition")}
          className="bg-white rounded-[16px] p-1.5 shadow-sm border border-gray-100/80 flex items-center gap-2 min-h-[48px] w-full text-left transition-all hover:bg-gray-50 active:scale-[0.95]"
        >
          <div className="shrink-0 w-7 h-7 flex items-center justify-center bg-gray-50/50 rounded-lg">
            <Utensils
              size={18}
              strokeWidth={2.5}
              className="text-[#4A634A]"
            />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] font-bold tracking-tight truncate text-gray-900">
              {eatenKcal.toLocaleString("de-DE")} kcal
            </span>
            <span className="block text-[8px] font-semibold truncate text-[#4A634A]">
              Gut
            </span>
          </div>
        </button>
      </div>

      <div className="-mt-1">
        <WeekCalendar
          days={weekDays}
          activeDate={selectedDate}
          onDateChange={setSelectedDate}
          currentDate={currentDate}
          weeks={weekOptions}
          activeWeek={selectedWeek}
          onWeekChange={handleWeekChange}
          currentWeek={currentWeekNumber}
          selectionMode={calendarMode}
          onSelectionModeChange={setCalendarMode}
          className="flex justify-between items-center bg-white rounded-[16px] p-2 shadow-sm border border-gray-100/60"
        />
      </div>

      {(calendarMode === "week" ? hasSelectedWeekData : hasSelectedDayData) ? (
        <>
      <WeeklyFocusCard
        onClick={() => setIsFocusOpen(true)}
        progressPercent={progressPercent}
        nextStep={nextStep}
      />

      <DayScheduleSection
        title={
          isSelectedDayToday ? "Heute" : selectedDay.dayLabel
        }
        day={{ ...selectedDay, allDayEvents: [] }}
        categoryMeta={CATEGORY_META}
        onOpen={(entry) =>
          openScheduleEntry(selectedDay, entry as ScheduleEntry)
        }
        onEdit={(eventId) =>
          openEventEditor(getDayKey(selectedDay), eventId)
        }
        onDelete={(eventId) =>
          deleteEvent(getDayKey(selectedDay), eventId)
        }
        openSwipeEventId={openSwipeEventId}
        onActionsOpenChange={setOpenSwipeEventId}
        maxItems={3}
        now={now}
        selectionStrategy="upcoming"
        showAllDayEvents={false}
      />

      <div>
        <div className="px-1 mb-1.5">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            Heute beachten
          </h3>
        </div>
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gray-50/80 flex items-center justify-center shrink-0">
              <Flame size={18} className="text-[#D37F36]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-gray-900 leading-snug truncate">
                Kalorien knapp
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight truncate">
                Plane vor dem Training einen Snack ein.
              </p>
            </div>
          </div>
          <div className="h-px bg-gray-100 mx-3" />
          <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gray-50/80 flex items-center justify-center shrink-0">
              <Moon size={18} className="text-[#6B5B95]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-gray-900 leading-snug truncate">
                Schlaf unter Ziel
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight truncate">
                Heute keine harte Einheit einplanen.
              </p>
            </div>
          </div>
          <div className="h-px bg-gray-100 mx-3" />
          <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gray-50/80 flex items-center justify-center shrink-0">
              <Droplet size={18} className="text-[#789A5A]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-gray-900 leading-snug truncate">
                Hydration
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight truncate">
                Noch 1-2 Gläser bis zum Ziel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div className="px-1 mb-1.5">
          <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            Diese Woche
          </h3>
        </div>
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-3.5 flex justify-between items-center">
          <div className="flex gap-2 items-center flex-1">
            <button
              onClick={() => navigate("/app/week")}
              className="flex flex-col gap-1 flex-1 min-w-0 text-left rounded-md p-1 -m-1 transition-colors hover:bg-gray-50 active:scale-[0.98]"
              aria-label="Ziele dieser Woche öffnen"
            >
              <div className="flex items-center gap-1 text-gray-700 font-bold text-[8px] uppercase tracking-wide">
                <ShieldCheck
                  size={12}
                  className="text-[#4A634A]"
                />
                <span className="truncate">Ziele</span>
              </div>
              <span className="font-bold text-[13px] text-gray-900 leading-none">
                3 / 7
              </span>
              <div className="h-1 bg-gray-100 rounded-full mt-0.5 w-full overflow-hidden">
                <div className="h-full bg-[#5E7A5E] rounded-full w-[42%]" />
              </div>
            </button>
            <div className="w-[1px] h-8 bg-gray-100 mx-0.5" />
            <button
              onClick={() => navigate("/app/training")}
              className="flex flex-col gap-1 flex-1 min-w-0 text-left rounded-md p-1 -m-1 transition-colors hover:bg-gray-50 active:scale-[0.98]"
              aria-label="Training dieser Woche öffnen"
            >
              <div className="flex items-center gap-1 text-gray-700 font-bold text-[8px] uppercase tracking-wide">
                <Footprints
                  size={12}
                  className="text-[#D37F36]"
                />
                <span className="truncate">Training</span>
              </div>
              <span className="font-bold text-[13px] text-gray-900 leading-none">
                3 / 4
              </span>
              <div className="h-1 bg-gray-100 rounded-full mt-0.5 w-full overflow-hidden">
                <div className="h-full bg-[#D37F36] rounded-full w-3/4" />
              </div>
            </button>
            <div className="w-[1px] h-8 bg-gray-100 mx-0.5" />
            <button
              onClick={() => navigate("/app/review")}
              className="flex flex-col gap-1 flex-1 min-w-0 text-left rounded-md p-1 -m-1 transition-colors hover:bg-gray-50 active:scale-[0.98]"
              aria-label="Plan-Review dieser Woche öffnen"
            >
              <div className="flex items-center gap-1 text-gray-700 font-bold text-[8px] uppercase tracking-wide">
                <ShieldCheck
                  size={12}
                  className="text-[#4A634A]"
                />
                <span className="truncate">Plan</span>
              </div>
              <span className="font-bold text-[13px] text-gray-900 leading-none">
                82%
              </span>
              <div className="h-1 bg-gray-100 rounded-full mt-0.5 w-full overflow-hidden">
                <div className="h-full bg-[#5E7A5E] rounded-full w-[82%]" />
              </div>
            </button>
          </div>
        </div>
      </div>
        </>
      ) : (
        <CalendarEmptyState
          title={
            calendarMode === "week"
              ? `Keine Daten fuer KW ${selectedWeek}`
              : `Keine Daten fuer ${selectedDay.dayLabel}, ${selectedDay.date}. ${selectedDay.monthLabel}`
          }
          description="Fuer diesen Zeitraum liegt im aktuellen Wochenplan noch nichts vor."
          onCreatePlan={createPlanForSelection}
          onManualAdd={openNewEventEditor}
        />
      )}

      </div>

      <WorkoutDetailDrawer
        workoutId={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
      <WeekEventDetailDrawer
        detail={selectedEventDetail}
        onClose={() => setSelectedEventDetail(null)}
        onEdit={() => {
          if (!selectedEventDetail?.canEdit) {
            return;
          }

          openEventEditor(
            selectedEventDetail.dayKey,
            selectedEventDetail.id,
          );
        }}
      />
      <EventEditDrawer
        session={editingEvent}
        categoryOptions={categoryOptions}
        onClose={() => setEditingEvent(null)}
        onSave={saveEditedEvent}
      />
      <FocusDetailDrawer
        isOpen={isFocusOpen}
        onClose={() => setIsFocusOpen(false)}
        checkedItems={checkedItems}
        onToggleStep={toggleFocusStep}
      />
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={setIsProfileOpen}
      />
    </div>
  );
}
