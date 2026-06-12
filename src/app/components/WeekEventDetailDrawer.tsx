import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Clock,
  Pencil,
  Info,
  ListTodo,
} from "lucide-react";
import {
  DetailDrawer,
  DetailRow,
  HeroBadge,
  HeroTitleBlock,
  HorizontalDivider,
  SectionHeading,
  StatsBarItem,
} from "./ui/DetailDrawer";

export interface WeekEventDetailItem {
  id: string;
  dayKey: string;
  dayDate: number;
  title: string;
  subtitle: string;
  dayLabel: string;
  date: number;
  monthLabel: string;
  categoryLabel: string;
  icon: LucideIcon;
  iconClassName: string;
  badgeClassName: string;
  surfaceClassName: string;
  borderClassName: string;
  start?: string;
  end?: string;
  durationLabel?: string;
  allDay?: boolean;
  subtasks?: string[];
  canEdit?: boolean;
}

interface WeekEventDetailDrawerProps {
  detail: WeekEventDetailItem | null;
  onClose: () => void;
  onEdit?: () => void;
}

export function WeekEventDetailDrawer({
  detail,
  onClose,
  onEdit,
}: WeekEventDetailDrawerProps) {
  if (!detail) {
    return null;
  }

  const Icon = detail.icon;
  const timeLabel = detail.allDay
    ? "Ganztägig"
    : `${detail.start} - ${detail.end}`;

  const overviewTab = (
    <div className="space-y-6">
      <section>
        <SectionHeading className="text-gray-900">Überblick</SectionHeading>
        <div className="bg-white rounded-[16px] border border-[#EBEAE4] shadow-sm overflow-hidden">
          <DetailRow
            icon={CalendarDays}
            label="Datum"
            value={`${detail.dayLabel}, ${detail.date}. ${detail.monthLabel}`}
          />
          <HorizontalDivider />
          <DetailRow icon={Clock} label="Zeitfenster" value={timeLabel} />
          <HorizontalDivider />
          <DetailRow icon={Info} label="Kategorie" value={detail.categoryLabel} />
        </div>
      </section>

      <section>
        <SectionHeading className="text-gray-900">Kontext</SectionHeading>
        <div className="bg-white border border-[#EBEAE4] rounded-[16px] p-4 shadow-sm">
          <p className="text-[13px] text-gray-700 leading-relaxed">
            {detail.subtitle}
          </p>
        </div>
      </section>
    </div>
  );

  const subtasksTab = detail.subtasks?.length ? (
    <div className="space-y-4">
      <div className="bg-white border border-[#EBEAE4] rounded-[20px] overflow-hidden shadow-sm divide-y divide-[#EBEAE4]">
        {detail.subtasks.map((subtask) => (
          <div key={subtask} className="flex items-start gap-3 p-4 bg-white">
            <div className="mt-0.5 w-9 h-9 rounded-full bg-[#F5F4EF] flex items-center justify-center shrink-0">
              <ListTodo size={16} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900">{subtask}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Bestandteil dieses Termins.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  const tabs = [{ label: "Überblick", content: overviewTab }];
  if (subtasksTab) {
    tabs.push({ label: "Aufgaben", content: subtasksTab });
  }

  return (
    <DetailDrawer
      open={!!detail}
      onClose={onClose}
      title="Termin-Details"
      description="Details, Zeitfenster und optionale Aufgaben des ausgewählten Termins."
      hero={{
        surfaceClassName: detail.surfaceClassName,
        badges: (
          <>
            <HeroBadge className={detail.badgeClassName}>
              {detail.categoryLabel}
            </HeroBadge>
            <HeroBadge className="bg-white/70 text-gray-700">
              {detail.allDay ? "Ganztägig" : detail.durationLabel}
            </HeroBadge>
          </>
        ),
        titleBlock: (
          <HeroTitleBlock
            icon={<Icon size={22} className={detail.iconClassName} />}
            title={detail.title}
            subtitle={detail.subtitle}
          />
        ),
        statsBar: (
          <>
            <StatsBarItem
              icon={<CalendarDays size={14} className="text-gray-300" />}
              label={`${detail.dayLabel}, ${detail.date}. ${detail.monthLabel}`}
            />
            <StatsBarItem
              icon={<Clock size={14} className="text-gray-300" />}
              label={timeLabel}
            />
            <StatsBarItem
              icon={
                <div className="w-3 h-3 rounded-full border border-white/30 flex items-center justify-center p-[1.5px]">
                  <div className="w-full h-full bg-[#6A816A] rounded-full" />
                </div>
              }
              label={detail.durationLabel ?? "Ganztägig"}
            />
          </>
        ),
      }}
      tabs={tabs}
      footer={
        <div className="flex items-center gap-3">
          {detail.canEdit ? (
            <button
              onClick={onEdit}
              className="flex-1 bg-[#EEF3F7] text-[#587C96] text-[13px] font-bold py-3.5 rounded-[12px] shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Pencil size={16} />
              Bearbeiten
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="flex-1 bg-[#6A816A] text-white text-[13px] font-bold py-3.5 rounded-[12px] shadow-sm active:scale-95 transition-transform"
          >
            Schließen
          </button>
        </div>
      }
    />
  );
}
