import React from "react";

export interface DayInfo {
  day: string;
  date: number;
}

interface WeekCalendarProps {
  days?: DayInfo[];
  activeDate?: number;
  onDateChange?: (date: number) => void;
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

export function WeekCalendar({
  days = DEFAULT_DAYS,
  activeDate = 7,
  onDateChange,
  /* 1. Padding auf p-2.5 und Rundung auf 16px (rounded-[16px]) angepasst */
  className = "flex justify-between items-center bg-white rounded-[16px] p-2.5 shadow-sm border border-gray-100/50",
}: WeekCalendarProps) {
  return (
    <div className={className}>
      {days.map((d, idx) => {
        const isActive = d.date === activeDate;
        return (
          <div
            key={idx}
            onClick={() => onDateChange?.(d.date)}
            /* 2. Gap von gap-1 auf gap-0.5 reduziert */
            className={`flex flex-col items-center gap-0.5 ${onDateChange ? "cursor-pointer" : ""}`}
          >
            {/* 3. Zeilenhöhe mit leading-none fixiert, damit kein unsichtbarer Platz entsteht */}
            <span
              className={`text-[10px] font-medium leading-none ${isActive ? "text-gray-700" : "text-gray-400"}`}
            >
              {d.day}
            </span>
            <div
              /* 4. Größe w-8 h-8 (32px) ist super, da sie kleiner als die 36px der Icons ist */
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-[#5E7A5E] text-white shadow-md"
                  : "text-gray-900"
              }`}
            >
              {d.date}
            </div>
          </div>
        );
      })}
    </div>
  );
}