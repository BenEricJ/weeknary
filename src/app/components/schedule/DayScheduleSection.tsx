import React from "react";
import type { LucideIcon } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface ScheduleEventItem {
  id: string;
  title: string;
  subtitle: string;
  start: string;
  end: string;
  category: string;
  workoutId?: string;
  subtasks?: string[];
}

interface ScheduleAllDayItem {
  id: string;
  title: string;
  category: string;
}

interface ScheduleDay {
  allDayEvents: ScheduleAllDayItem[];
  events: ScheduleEventItem[];
}

interface ScheduleCategoryMeta {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  badgeClassName: string;
  surfaceClassName: string;
  borderClassName: string;
}

interface DayScheduleSectionProps {
  title: string;
  rightLabel?: string;
  day: ScheduleDay;
  categoryMeta: Record<string, ScheduleCategoryMeta>;
  onOpen: (entry: ScheduleEventItem | ScheduleAllDayItem) => void;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  openSwipeEventId?: string | null;
  onActionsOpenChange?: (eventId: string | null) => void;
  selectionStrategy?: "all" | "upcoming";
  maxItems?: number;
  now?: Date;
  showAllDayEvents?: boolean;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getVisibleEvents(
  events: ScheduleEventItem[],
  selectionStrategy: "all" | "upcoming",
  maxItems?: number,
  now?: Date,
) {
  let visibleEvents = events;

  if (selectionStrategy === "upcoming" && now) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const upcoming = events.filter(
      (event) => toMinutes(event.end) > currentMinutes,
    );
    visibleEvents = upcoming.length > 0 ? upcoming : events;
  }

  if (typeof maxItems === "number") {
    visibleEvents = visibleEvents.slice(0, maxItems);
  }

  return visibleEvents;
}

export function DayScheduleSection({
  title,
  rightLabel,
  day,
  categoryMeta,
  onOpen,
  onEdit,
  onDelete,
  openSwipeEventId = null,
  onActionsOpenChange,
  selectionStrategy = "all",
  maxItems,
  now,
  showAllDayEvents = true,
}: DayScheduleSectionProps) {
  const visibleEvents = getVisibleEvents(
    day.events,
    selectionStrategy,
    maxItems,
    now,
  );

  const allowActions =
    typeof onEdit === "function" &&
    typeof onDelete === "function" &&
    typeof onActionsOpenChange === "function";

  return (
    <section>
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
          {title}
        </h3>
        {rightLabel ? (
          <span className="text-[11px] font-semibold text-gray-500">
            {rightLabel}
          </span>
        ) : null}
      </div>
      {showAllDayEvents && day.allDayEvents.length > 0 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-1">
          {day.allDayEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => onOpen(event)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${categoryMeta[event.category].badgeClassName}`}
            >
              Ganztägig: {event.title}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {visibleEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            meta={categoryMeta[event.category]}
            onOpen={() => onOpen(event)}
            onEdit={allowActions ? () => onEdit(event.id) : undefined}
            onDelete={allowActions ? () => onDelete(event.id) : undefined}
            isActionsOpen={openSwipeEventId === event.id}
            onActionsOpenChange={
              allowActions
                ? (isOpen) => onActionsOpenChange(isOpen ? event.id : null)
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

function EventCard({
  event,
  meta,
  onOpen,
  onEdit,
  onDelete,
  isActionsOpen,
  onActionsOpenChange,
}: {
  event: ScheduleEventItem;
  meta: ScheduleCategoryMeta;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isActionsOpen: boolean;
  onActionsOpenChange?: (isOpen: boolean) => void;
}) {
  const Icon = meta.icon;
  const actionsWidth = 160;
  const hasActions = onEdit && onDelete && onActionsOpenChange;

  const cardContent = (
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
  );

  if (!hasActions) {
    return (
      <button
        onClick={onOpen}
        className={`w-full text-left rounded-[16px] border p-2.5 shadow-sm transition-colors hover:brightness-[0.99] ${meta.surfaceClassName} ${meta.borderClassName}`}
      >
        {cardContent}
      </button>
    );
  }

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
        {cardContent}
      </motion.button>
    </div>
  );
}
