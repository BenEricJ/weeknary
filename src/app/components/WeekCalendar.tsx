import React, { useRef } from "react";
import { CalendarDays, CalendarRange } from "lucide-react";

export interface DayInfo<TDate extends string | number = number> {
  day: string;
  date: TDate;
  displayDate?: string | number;
  hasData?: boolean;
}

export interface WeekInfo {
  weekNumber: number;
  label?: string;
  hasData?: boolean;
}

export type WeekCalendarSelectionMode = "day" | "week";

interface WeekCalendarProps<TDate extends string | number = number> {
  days?: DayInfo<TDate>[];
  activeDate?: TDate;
  onDateChange?: (date: TDate) => void;
  currentDate?: TDate;
  weeks?: WeekInfo[];
  activeWeek?: number;
  onWeekChange?: (weekNumber: number) => void;
  currentWeek?: number;
  selectionMode?: WeekCalendarSelectionMode;
  onSelectionModeChange?: (mode: WeekCalendarSelectionMode) => void;
  className?: string;
}

const DEFAULT_DAYS: DayInfo[] = [
  { day: "MO", date: 5 },
  { day: "DI", date: 6 },
  { day: "MI", date: 7 },
  { day: "DO", date: 8 },
  { day: "FR", date: 9 },
  { day: "SA", date: 10 },
  { day: "SO", date: 11 },
];

export function WeekCalendar<TDate extends string | number = number>({
  days = DEFAULT_DAYS as DayInfo<TDate>[],
  activeDate = 7 as TDate,
  onDateChange,
  currentDate,
  weeks,
  activeWeek,
  onWeekChange,
  currentWeek,
  selectionMode = "day",
  onSelectionModeChange,
  className = "flex justify-between items-center bg-white rounded-[16px] p-2.5 shadow-sm border border-gray-100/50",
}: WeekCalendarProps<TDate>) {
  const isWeekMode = selectionMode === "week";
  const ToggleIcon = isWeekMode ? CalendarRange : CalendarDays;
  const resolvedWeeks: WeekInfo[] =
    weeks && weeks.length > 0
      ? weeks
      : Array.from({ length: 7 }, (_, i) => ({ weekNumber: i + 1 }));
  const resolvedActiveWeek = activeWeek ?? resolvedWeeks[0]?.weekNumber;
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const swipeThreshold = 40;

  const toggleMode = () => {
    onSelectionModeChange?.(isWeekMode ? "day" : "week");
  };

  const handleSwipeEnd = (endX: number, endY: number) => {
    if (swipeStartX.current === null || swipeStartY.current === null) {
      return;
    }

    const dx = endX - swipeStartX.current;
    const dy = endY - swipeStartY.current;
    swipeStartX.current = null;
    swipeStartY.current = null;

    if (Math.abs(dx) < swipeThreshold || Math.abs(dx) < Math.abs(dy)) {
      return;
    }

    const direction = dx < 0 ? 1 : -1;

    if (isWeekMode) {
      if (!onWeekChange || resolvedWeeks.length === 0) {
        return;
      }

      const currentIndex = resolvedWeeks.findIndex(
        (week) => week.weekNumber === resolvedActiveWeek,
      );
      const nextIndex = Math.min(
        Math.max((currentIndex === -1 ? 0 : currentIndex) + direction, 0),
        resolvedWeeks.length - 1,
      );
      const next = resolvedWeeks[nextIndex];

      if (next && next.weekNumber !== resolvedActiveWeek) {
        onWeekChange(next.weekNumber);
      }

      return;
    }

    if (!onDateChange || days.length === 0) {
      return;
    }

    const currentIndex = days.findIndex((day) => day.date === activeDate);
    const nextIndex = Math.min(
      Math.max((currentIndex === -1 ? 0 : currentIndex) + direction, 0),
      days.length - 1,
    );
    const next = days[nextIndex];

    if (next && next.date !== activeDate) {
      onDateChange(next.date);
    }
  };

  return (
    <div
      className={`relative touch-pan-y ${className}`}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        swipeStartX.current = touch.clientX;
        swipeStartY.current = touch.clientY;
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0];
        handleSwipeEnd(touch.clientX, touch.clientY);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") {
          swipeStartX.current = event.clientX;
          swipeStartY.current = event.clientY;
        }
      }}
      onPointerUp={(event) => {
        if (event.pointerType === "mouse" && swipeStartX.current !== null) {
          handleSwipeEnd(event.clientX, event.clientY);
        }
      }}
    >
      {isWeekMode
        ? resolvedWeeks.map((week, idx) => {
            const isActive = week.weekNumber === resolvedActiveWeek;
            const isCurrent = week.weekNumber === currentWeek;
            const hasData = !!week.hasData;

            return (
              <div
                key={`week-${week.weekNumber}-${idx}`}
                onClick={() => onWeekChange?.(week.weekNumber)}
                className={`flex flex-col items-center gap-0.5 ${onWeekChange ? "cursor-pointer" : ""}`}
              >
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isActive || isCurrent
                      ? "text-gray-700"
                      : hasData
                        ? "text-[#4A634A]"
                        : "text-gray-400"
                  }`}
                >
                  {week.label ?? "KW"}
                </span>
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isActive
                      ? `bg-[#5E7A5E] text-white shadow-md ${isCurrent ? "ring-2 ring-[#B8C9AE]" : ""}`
                      : isCurrent
                        ? `${hasData ? "bg-[#EAF2E6]" : "bg-[#F6F8F1]"} text-[#4A634A] ring-2 ring-[#B8C9AE]`
                        : hasData
                          ? "bg-[#EAF2E6] text-[#4A634A]"
                      : "text-gray-900"
                  }`}
                >
                  {week.weekNumber}
                </div>
              </div>
            );
          })
        : days.map((day, idx) => {
            const isActive = day.date === activeDate;
            const isCurrent = currentDate !== undefined && day.date === currentDate;

            return (
              <div
                key={`${String(day.date)}-${idx}`}
                onClick={() => onDateChange?.(day.date)}
                className={`flex flex-col items-center gap-0.5 ${onDateChange ? "cursor-pointer" : ""}`}
              >
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isActive || isCurrent ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {day.day}
                </span>
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isActive
                      ? `bg-[#5E7A5E] text-white shadow-md ${isCurrent ? "ring-2 ring-[#B8C9AE]" : ""}`
                      : isCurrent
                        ? "bg-[#F6F8F1] text-[#4A634A] ring-2 ring-[#B8C9AE]"
                      : "text-gray-900"
                  }`}
                >
                  {day.displayDate ?? day.date}
                </div>
              </div>
            );
          })}

      {onSelectionModeChange ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            toggleMode();
          }}
          aria-label={
            isWeekMode
              ? "Zur Tagesauswahl wechseln"
              : "Zur Wochenauswahl wechseln"
          }
          className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors ${
            isWeekMode ? "text-[#5E7A5E]" : "text-gray-500"
          }`}
        >
          <ToggleIcon className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  );
}
