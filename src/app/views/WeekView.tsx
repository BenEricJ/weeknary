import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarDays, ChevronRight, Pencil, Target, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import {
  EventEditDrawer,
  type EventEditDraft,
  type EventEditSession,
} from "../components/EventEditDrawer";
import { FocusDetailDrawer } from "../components/FocusDetailDrawer";
import { FOCUS_STEPS } from "../data/focusSteps";
import {
  WeekEventDetailDrawer,
  type WeekEventDetailItem,
} from "../components/WeekEventDetailDrawer";
import { WorkoutDetailDrawer } from "../components/WorkoutDetailDrawer";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import { CalendarEmptyState } from "../components/CalendarEmptyState";
import {
  WeekCalendar,
  type WeekCalendarSelectionMode,
} from "../components/WeekCalendar";
import { useActiveWeekPlan } from "../weekPlan/useActiveWeekPlan";
import { weekPlanToDisplayDays } from "../weekPlan/weekPlanDisplayAdapter";
import { parseIsoDate, toIsoDate } from "../dateDisplay";
import {
  getDateInISOWeek,
  getISOWeekDays,
  getISOWeekNumber,
  getISOWeekRange,
  getISOWeekYear,
  getSurroundingWeekOptions,
  getWeekdayIndex,
} from "../calendarWeekOptions";
import {
  createEmptyDisplayDay,
  getDayKey,
} from "../weekPlan/displayDayFactory";
import { DayScheduleSection } from "../components/schedule/DayScheduleSection";
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

type ViewMode = "day" | "week";
interface CategorySummary {
  category: CategoryKey;
  count: number;
  totalMinutes: number;
}

function getDurationMinutes(start: string, end: string) {
  return toMinutes(end) - toMinutes(start);
}

function formatMinutes(totalMinutes: number) {
  if (totalMinutes < 90) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes.toString().padStart(2, "0")}`;
}

function isTimedEvent(entry: ScheduleEntry): entry is EventItem {
  return "start" in entry && "end" in entry;
}


function summarizeByCategory(events: EventItem[]): CategorySummary[] {
  const totals = new Map<CategoryKey, CategorySummary>();

  events.forEach((event) => {
    const current = totals.get(event.category) ?? {
      category: event.category,
      count: 0,
      totalMinutes: 0,
    };

    current.count += 1;
    current.totalMinutes += getDurationMinutes(event.start, event.end);
    totals.set(event.category, current);
  });

  return Array.from(totals.values()).sort(
    (left, right) => right.totalMinutes - left.totalMinutes,
  );
}

function getPlannedMinutes(events: EventItem[]) {
  return events.reduce(
    (total, event) => total + getDurationMinutes(event.start, event.end),
    0,
  );
}

function getFeaturedEvent(day: DayPlan, now: Date) {
  if (day.events.length === 0) {
    return null;
  }

  const selectedDate = getDayDate(day);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (isSameDay(selectedDate, now)) {
    const currentEvent = day.events.find(
      (event) =>
        toMinutes(event.start) <= currentMinutes &&
        currentMinutes < toMinutes(event.end),
    );

    if (currentEvent) {
      return { event: currentEvent, label: "Gerade" };
    }

    const upcomingEvent = day.events.find(
      (event) => toMinutes(event.start) > currentMinutes,
    );

    if (upcomingEvent) {
      return { event: upcomingEvent, label: "Als Nächstes" };
    }

    return {
      event: day.events[day.events.length - 1],
      label: "Zuletzt",
    };
  }

  if (selectedDate > now) {
    return { event: day.events[0], label: "Tagesstart" };
  }

  return {
    event: day.events[day.events.length - 1],
    label: "Zuletzt",
  };
}

export function WeekView() {
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
  const [selectedDate, setSelectedDate] = useState(() => {
    return toIsoDate(new Date());
  });
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [selectedEventDetail, setSelectedEventDetail] =
    useState<WeekEventDetailItem | null>(null);
  const [editingEvent, setEditingEvent] =
    useState<EventEditSession | null>(null);
  const [openSwipeEventId, setOpenSwipeEventId] =
    useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFocusOpen, setIsFocusOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
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
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    s1: true,
  });

  useEffect(() => {
    setWeekPlan(sourceWeekPlan);
  }, [sourceWeekPlan]);

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

  const selectedDaySummary = useMemo(
    () => summarizeByCategory(selectedDay.events),
    [selectedDay],
  );
  const completedFocusStepIds = useMemo(
    () => new Set(
      Object.entries(checkedItems)
        .filter(([, isChecked]) => isChecked)
        .map(([id]) => id),
    ),
    [checkedItems],
  );
  const progressPercent = useMemo(() => {
    return Math.round(
      (completedFocusStepIds.size / FOCUS_STEPS.length) * 100,
    );
  }, [completedFocusStepIds]);
  const nextFocusStep = useMemo(() => {
    return (
      FOCUS_STEPS.find((step) => !completedFocusStepIds.has(step.id)) ??
      FOCUS_STEPS[FOCUS_STEPS.length - 1]
    );
  }, [completedFocusStepIds]);

  const weekDays = useMemo(
    () =>
      getISOWeekDays(currentWeekYear, selectedWeek).map((day) => ({
        ...day,
        hasData: weekPlanDateSet.has(day.date),
      })),
    [currentWeekYear, selectedWeek, weekPlanDateSet],
  );
  const selectedWeekDays = useMemo(
    () =>
      weekDays.map(
        (day) =>
          weekPlan.find((entry) => getDayKey(entry) === day.date) ??
          createEmptyDisplayDay(day.date),
      ),
    [weekDays, weekPlan],
  );
  const weekSummary = useMemo(
    () => summarizeByCategory(selectedWeekDays.flatMap((day) => day.events)),
    [selectedWeekDays],
  );

  const selectedDayPlannedMinutes = useMemo(
    () => getPlannedMinutes(selectedDay.events),
    [selectedDay],
  );

  const weekPlannedMinutes = useMemo(
    () => getPlannedMinutes(selectedWeekDays.flatMap((day) => day.events)),
    [selectedWeekDays],
  );

  const featuredEvent = useMemo(
    () => getFeaturedEvent(selectedDay, now),
    [selectedDay, now],
  );
  const currentDate = useMemo(() => {
    const today = toIsoDate(now);
    return weekDays.some((day) => day.date === today)
      ? today
      : undefined;
  }, [now, weekDays]);
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
  const toggleFocusStep = (id: string) => {
    setCheckedItems((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  useEffect(() => {
    setOpenSwipeEventId(null);
  }, [selectedDate, viewMode]);

  const openScheduleEntry = (
    day: DayPlan,
    entry: ScheduleEntry,
  ) => {
    setOpenSwipeEventId(null);

    if (isTimedEvent(entry) && entry.workoutId) {
      setSelectedWorkout(entry.workoutId);
      return;
    }

    setSelectedEventDetail(buildEventDetail(day, entry));
  };

  const openEventEditor = (dayKey: string, eventId: string) => {
    const day = weekPlan.find((entry) => getDayKey(entry) === dayKey);
    const event = day?.events.find((entry) => entry.id === eventId);

    if (!day || !event) {
      return;
    }

    setOpenSwipeEventId(null);
    setSelectedEventDetail(null);
    setEditingEvent({
      dayKey,
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
                    toMinutes(left.start) - toMinutes(right.start),
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
              events: day.events.filter((event) => event.id !== eventId),
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

    setOpenSwipeEventId(null);
  };

  const openCategoryFromDay = (category: CategoryKey) => {
    const matchingEvent = selectedDay.events.find(
      (event) => event.category === category,
    );

    if (matchingEvent) {
      openScheduleEntry(selectedDay, matchingEvent);
      return;
    }

    const matchingAllDayEvent = selectedDay.allDayEvents.find(
      (event) => event.category === category,
    );

    if (matchingAllDayEvent) {
      openScheduleEntry(selectedDay, matchingAllDayEvent);
    }
  };

  const openCategoryFromWeek = (category: CategoryKey) => {
    const matchingDay = selectedWeekDays.find(
      (day) =>
        day.events.some((event) => event.category === category) ||
        day.allDayEvents.some(
          (event) => event.category === category,
        ),
    );

    if (!matchingDay) {
      return;
    }

    setSelectedDate(getDayKey(matchingDay));

    const matchingEvent = matchingDay.events.find(
      (event) => event.category === category,
    );

    if (matchingEvent) {
      openScheduleEntry(matchingDay, matchingEvent);
      return;
    }

    const matchingAllDayEvent = matchingDay.allDayEvents.find(
      (event) => event.category === category,
    );

    if (matchingAllDayEvent) {
      openScheduleEntry(matchingDay, matchingAllDayEvent);
    }
  };

  const categoryOptions = useMemo(
    () =>
      Object.entries(CATEGORY_META).map(([value, meta]) => ({
        value,
        label: meta.label,
      })),
    [],
  );

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
    setEditingEvent({
      mode: "create",
      dayKey: selectedDate,
      dayDate: selectedDay.date,
      dayLabel: selectedDay.dayLabel,
      date: selectedDay.date,
      monthLabel: selectedDay.monthLabel,
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
        icon={CalendarDays}
        title="Woche"
        subtitle={
          <>
            {selectedDay.dayLabel}, {selectedDay.date}. {selectedDay.monthLabel}
            {" · "}
            {selectedDay.events.length} Blöcke geplant
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pt-[112px] pb-[88px] flex flex-col gap-5">
      <div className="bg-[#ECE9E1] rounded-[16px] p-1 flex">
        <button
          onClick={() => setViewMode("day")}
          className={`flex-1 py-2 rounded-[12px] text-[13px] font-semibold transition-all ${
            viewMode === "day"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Heute
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`flex-1 py-2 rounded-[12px] text-[13px] font-semibold transition-all ${
            viewMode === "week"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Woche
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

      {(viewMode === "week" ? hasSelectedWeekData : hasSelectedDayData) ? (
      viewMode === "day" ? (
        <>
          {featuredEvent ? (
            <button
              onClick={() =>
                openScheduleEntry(selectedDay, featuredEvent.event)
              }
              className="w-full text-left bg-[#F2F4F2] rounded-[20px] p-4 border border-[#E4E9E4] shadow-sm transition-colors hover:bg-[#EDF1ED]"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-[10px] font-bold text-[#4A634A] tracking-[0.18em] uppercase">
                  {featuredEvent.label}
                </span>
                <span className="text-[11px] font-semibold text-gray-500">
                  {featuredEvent.event.start} - {featuredEvent.event.end}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${CATEGORY_META[featuredEvent.event.category].surfaceClassName}`}
                >
                  {React.createElement(CATEGORY_META[featuredEvent.event.category].icon, {
                    size: 20,
                    className: CATEGORY_META[featuredEvent.event.category].iconClassName,
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h2 className="text-[16px] font-bold text-gray-900 leading-tight min-w-0 flex-1">
                      {featuredEvent.event.title}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 text-right ${CATEGORY_META[featuredEvent.event.category].badgeClassName}`}
                    >
                      {CATEGORY_META[featuredEvent.event.category].label}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-600 leading-snug">
                    {featuredEvent.event.subtitle}
                  </p>
                  {featuredEvent.event.subtasks?.length ? (
                    <div className="mt-2 flex flex-col gap-1">
                      {featuredEvent.event.subtasks.map((subtask) => (
                        <span
                          key={subtask}
                          className="text-[11px] text-gray-700 leading-tight"
                        >
                          • {subtask}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <ChevronRight size={18} className="text-gray-400 shrink-0 mt-1" />
              </div>
            </button>
          ) : null}

          <DayScheduleSection
            title="Tagesplan"
            rightLabel={`${formatMinutes(selectedDayPlannedMinutes)} geplant`}
            day={selectedDay}
            categoryMeta={CATEGORY_META}
            onOpen={(entry) => openScheduleEntry(selectedDay, entry as ScheduleEntry)}
            onEdit={(eventId) => openEventEditor(getDayKey(selectedDay), eventId)}
            onDelete={(eventId) => deleteEvent(getDayKey(selectedDay), eventId)}
            openSwipeEventId={openSwipeEventId}
            onActionsOpenChange={setOpenSwipeEventId}
          />

          <section className="pb-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                Nach Kategorien
              </h3>
              <span className="text-[11px] font-semibold text-gray-500">
                {selectedDaySummary.length} Bereiche
              </span>
            </div>
            <CategorySummaryPanel
              summaries={selectedDaySummary}
              totalMinutes={selectedDayPlannedMinutes}
              onSelectCategory={openCategoryFromDay}
            />
          </section>
        </>
      ) : (
        <>
          <WeeklyFocusWeekCard
            onClick={() => setIsFocusOpen(true)}
            progressPercent={progressPercent}
            nextStepLabel={nextFocusStep.label}
            nextStepInfo={nextFocusStep.info}
          />
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                Wochenüberblick
              </h3>
              <span className="text-[11px] font-semibold text-gray-500">
                {formatMinutes(weekPlannedMinutes)} gesamt
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {selectedWeekDays.map((day) => (
                <button
                  key={getDayKey(day)}
                  onClick={() => {
                    setSelectedDate(getDayKey(day));
                    setViewMode("day");
                  }}
                  className={`w-full text-left rounded-[18px] p-3.5 border shadow-sm transition-colors ${
                    getDayKey(day) === selectedDate
                      ? "bg-[#F2F4F2] border-[#DCE4DC]"
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-gray-900">
                          {day.dayLabel}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {day.date}. {day.monthLabel}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-600 truncate">
                        {day.events[0]?.title ?? "Keine Termine"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold text-gray-900">
                        {formatMinutes(getPlannedMinutes(day.events))}
                      </div>
                      <div className="text-[10px] font-medium text-gray-500">
                        {day.events.length} Blöcke
                      </div>
                    </div>
                  </div>
                  {day.allDayEvents.length > 0 ? (
                    <div className="flex items-center gap-1.5 mt-3 overflow-x-auto hide-scrollbar">
                      {day.allDayEvents.map((event) => (
                        <span
                          key={event.id}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${CATEGORY_META[event.category].badgeClassName}`}
                        >
                          {event.title}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex items-center gap-1.5 mt-3 overflow-x-auto hide-scrollbar">
                    {summarizeByCategory(day.events).map((item) => (
                      <span
                        key={item.category}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${CATEGORY_META[item.category].badgeClassName}`}
                      >
                        {CATEGORY_META[item.category].label}:{" "}
                        {formatMinutes(item.totalMinutes)}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="pb-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
                Woche nach Kategorien
              </h3>
              <span className="text-[11px] font-semibold text-gray-500">
                {weekSummary.length} Bereiche
              </span>
            </div>
            <CategorySummaryPanel
              summaries={weekSummary}
              totalMinutes={weekPlannedMinutes}
              onSelectCategory={openCategoryFromWeek}
            />
          </section>
        </>
      )
      ) : (
        <CalendarEmptyState
          title={
            viewMode === "week"
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

function WeeklyFocusWeekCard({
  onClick,
  progressPercent,
  nextStepLabel,
  nextStepInfo,
}: {
  onClick: () => void;
  progressPercent: number;
  nextStepLabel: string;
  nextStepInfo: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
          Wochenfokus
        </h3>
      </div>
      <button
        onClick={onClick}
        className="w-full text-left bg-[#F2F4F2] rounded-[18px] border border-[#E4E9E4] shadow-sm p-4 transition-colors hover:bg-[#EDF1ED]"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#E4E9E4] flex items-center justify-center shrink-0">
            <Target size={18} className="text-[#4A634A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <h3 className="text-[15px] font-bold text-gray-900 truncate">
                Mietsituation klären
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4E9E4] text-[#4A634A] shrink-0">
                Fokus
              </span>
            </div>
            <p className="text-[12px] text-gray-600 leading-snug">
              Nächster Schritt: {nextStepLabel}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
              {nextStepInfo}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-1.5 flex-1 bg-[#E4E9E4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5E7A5E] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#4A634A] shrink-0">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>
      </button>
    </section>
  );
}

function EventCard({
  event,
  onOpen,
  onEdit,
  onDelete,
  isActionsOpen,
  onActionsOpenChange,
}: {
  event: EventItem;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isActionsOpen: boolean;
  onActionsOpenChange: (isOpen: boolean) => void;
}) {
  const meta = CATEGORY_META[event.category];
  const Icon = meta.icon;
  const actionsWidth = 160;

  return (
    <div className="relative overflow-hidden rounded-[18px]">
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          onClick={onEdit}
          className="w-20 bg-[#5B88A5] text-white text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:brightness-95"
          aria-label={`${event.title} bearbeiten`}
        >
          <Pencil size={16} />
          Bearbeiten
        </button>
        <button
          onClick={onDelete}
          className="w-20 bg-[#B85450] text-white text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:brightness-95"
          aria-label={`${event.title} löschen`}
        >
          <Trash2 size={16} />
          Löschen
        </button>
      </div>
      <motion.button
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.05}
        animate={{ x: isActionsOpen ? -actionsWidth : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        onDragEnd={(_, info) => {
          const shouldOpen =
            info.offset.x < -64 || info.velocity.x < -500;
          onActionsOpenChange(shouldOpen);
        }}
        onClick={() => {
          if (isActionsOpen) {
            onActionsOpenChange(false);
            return;
          }

          onOpen();
        }}
        className={`relative w-full text-left rounded-[16px] border p-2.5 shadow-sm transition-colors hover:brightness-[0.99] ${meta.surfaceClassName} ${meta.borderClassName}`}
        style={{ touchAction: "pan-y" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70">
            <Icon size={18} className={meta.iconClassName} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="truncate text-[13px] font-bold leading-tight text-gray-900">
              {event.title}
            </h4>
            <p className="mt-0.5 truncate text-[11px] leading-tight text-gray-500">
              {event.subtitle}
            </p>
            {event.subtasks?.length ? (
              <div className="mt-1.5 flex flex-col gap-0.5">
                {event.subtasks.map((subtask) => (
                  <span
                    key={subtask}
                    className="truncate text-[10px] leading-tight text-gray-600"
                  >
                    • {subtask}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1 self-start">
            <span className="rounded-md bg-[#EAE8E3] px-2 py-0.5 text-[9px] font-semibold text-gray-800">
              {event.start} - {event.end}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${meta.badgeClassName}`}
            >
              {meta.label}
            </span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

function CategorySummaryPanel({
  summaries,
  totalMinutes,
  onSelectCategory,
}: {
  summaries: CategorySummary[];
  totalMinutes: number;
  onSelectCategory?: (category: CategoryKey) => void;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-3.5 overflow-x-auto hide-scrollbar">
      <div className="flex gap-1.5 items-center min-w-max">
        {summaries.map((summary, index) => (
          <React.Fragment key={summary.category}>
            {index > 0 ? (
              <div className="w-[1px] h-8 bg-gray-100 shrink-0 mx-0.5" />
            ) : null}
            <SummaryMetric
              summary={summary}
              totalMinutes={totalMinutes}
              onClick={
                onSelectCategory
                  ? () => onSelectCategory(summary.category)
                  : undefined
              }
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function SummaryMetric({
  summary,
  totalMinutes,
  onClick,
}: {
  summary: CategorySummary;
  totalMinutes: number;
  onClick?: () => void;
}) {
  const meta = CATEGORY_META[summary.category];
  const Icon = meta.icon;
  const progressWidth =
    totalMinutes > 0
      ? Math.max(
          10,
          Math.round((summary.totalMinutes / totalMinutes) * 100),
        )
      : 0;

  const content = (
    <>
      <div className="flex items-center gap-1 text-gray-700 font-bold text-[8px] uppercase tracking-wide">
        <Icon size={12} className={`${meta.iconClassName} shrink-0`} />
        <span className="truncate">{meta.label}</span>
      </div>
      <div className="text-[13px] font-bold text-gray-900 leading-none">
        {formatMinutes(summary.totalMinutes)}
      </div>
      <div className="text-[9px] font-medium text-gray-500 leading-none">
        {summary.count} Blöcke
      </div>
      <div className="h-1 bg-gray-100 rounded-full mt-0.5 w-full overflow-hidden">
        <div
          className={`h-full rounded-full ${meta.barClassName}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col gap-1 w-[92px] shrink-0 text-left rounded-[12px] p-1 -m-1 transition-colors hover:bg-gray-50"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-[92px] shrink-0 text-left">
      {content}
    </div>
  );
}

function SummaryCard({ summary }: { summary: CategorySummary }) {
  const meta = CATEGORY_META[summary.category];
  const Icon = meta.icon;

  return (
    <div
      className={`rounded-[18px] p-3.5 border shadow-sm ${meta.surfaceClassName} ${meta.borderClassName}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${meta.badgeClassName}`}
        >
          <Icon size={16} className={meta.iconClassName} />
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          {summary.count} Blöcke
        </span>
      </div>
      <div className="text-[14px] font-bold text-gray-900 mb-0.5">
        {meta.label}
      </div>
      <div className="text-[20px] font-bold text-gray-900 leading-none">
        {formatMinutes(summary.totalMinutes)}
      </div>
    </div>
  );
}

