import React, { useState } from "react";
import { Drawer } from "vaul";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Pencil,
  Info,
  ListTodo,
  MoreHorizontal,
  Share,
} from "lucide-react";

export interface WeekEventDetailItem {
  id: string;
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
  const [activeTab, setActiveTab] = useState("Überblick");

  React.useEffect(() => {
    setActiveTab("Überblick");
  }, [detail?.id]);

  if (!detail) {
    return null;
  }

  const Icon = detail.icon;
  const tabs = detail.subtasks?.length
    ? ["Überblick", "Aufgaben"]
    : ["Überblick"];

  return (
    <Drawer.Root
      open={!!detail}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-[#F5F4EF] flex flex-col rounded-t-[24px] h-[95vh] fixed bottom-0 left-0 right-0 z-50 outline-none max-w-[390px] mx-auto overflow-hidden">
          <Drawer.Description className="sr-only">
            Details, Zeitfenster und optionale Aufgaben des ausgewählten Termins.
          </Drawer.Description>
          <div className="bg-white flex items-center justify-between px-4 py-3 rounded-t-[24px] shrink-0 border-b border-[#EBEAE4]">
            <button
              onClick={onClose}
              className="text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-[16px] font-bold text-gray-900">
              Termin-Details
            </h2>
            <div className="flex items-center gap-4 text-gray-900 mr-1">
              <Share size={20} strokeWidth={2} />
              <MoreHorizontal size={24} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4 hide-scrollbar relative">
            <div className="w-full relative">
              <div
                className={`h-[240px] w-full relative overflow-hidden ${detail.surfaceClassName}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_45%)]" />
                <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/50 blur-2xl" />
                <div className="absolute bottom-10 -left-10 w-32 h-32 rounded-full bg-white/35 blur-2xl" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-[6px] backdrop-blur-sm uppercase tracking-wider ${detail.badgeClassName}`}
                  >
                    {detail.categoryLabel}
                  </span>
                  <span className="bg-white/70 text-gray-700 text-[10px] font-bold px-2 py-1 rounded-[6px] backdrop-blur-sm uppercase tracking-wider">
                    {detail.allDay ? "Ganztägig" : detail.durationLabel}
                  </span>
                </div>

                <div className="absolute bottom-[52px] left-4 right-4">
                  <div
                    className={`w-12 h-12 rounded-[16px] flex items-center justify-center mb-3 bg-white/80 shadow-sm`}
                  >
                    <Icon size={22} className={detail.iconClassName} />
                  </div>
                  <Drawer.Title className="text-[24px] font-bold leading-tight text-gray-900 mb-1">
                    {detail.title}
                  </Drawer.Title>
                  <p className="text-[12px] text-gray-700/85 leading-snug">
                    {detail.subtitle}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-3 text-white">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium">
                    <CalendarDays
                      size={14}
                      className="text-gray-300"
                    />
                    {detail.dayLabel}, {detail.date}. {detail.monthLabel}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium">
                    <Clock size={14} className="text-gray-300" />
                    {detail.allDay
                      ? "Ganztägig"
                      : `${detail.start} - ${detail.end}`}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium">
                    <div className="w-3 h-3 rounded-full border border-white/30 flex items-center justify-center p-[1.5px]">
                      <div className="w-full h-full bg-[#6A816A] rounded-full" />
                    </div>
                    {detail.durationLabel ?? "Ganztägig"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border-b border-[#EBEAE4] px-2 pt-1 flex justify-between sticky top-0 z-10 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-[12.5px] transition-all ${
                    activeTab === tab
                      ? "font-bold text-[#6A816A] border-b-[2.5px] border-[#6A816A]"
                      : "font-medium text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-6">
              {activeTab === "Überblick" ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Überblick
                    </h3>
                    <div className="bg-white rounded-[16px] border border-[#EBEAE4] shadow-sm overflow-hidden">
                      <DetailRow
                        icon={CalendarDays}
                        label="Datum"
                        value={`${detail.dayLabel}, ${detail.date}. ${detail.monthLabel}`}
                      />
                      <div className="h-px bg-[#EBEAE4] mx-3" />
                      <DetailRow
                        icon={Clock}
                        label="Zeitfenster"
                        value={
                          detail.allDay
                            ? "Ganztägig"
                            : `${detail.start} - ${detail.end}`
                        }
                      />
                      <div className="h-px bg-[#EBEAE4] mx-3" />
                      <DetailRow
                        icon={Info}
                        label="Kategorie"
                        value={detail.categoryLabel}
                      />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Kontext
                    </h3>
                    <div className="bg-white border border-[#EBEAE4] rounded-[16px] p-4 shadow-sm">
                      <p className="text-[13px] text-gray-700 leading-relaxed">
                        {detail.subtitle}
                      </p>
                    </div>
                  </section>
                </div>
              ) : null}

              {activeTab === "Aufgaben" && detail.subtasks?.length ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-white border border-[#EBEAE4] rounded-[20px] overflow-hidden shadow-sm divide-y divide-[#EBEAE4]">
                    {detail.subtasks.map((subtask) => (
                      <div
                        key={subtask}
                        className="flex items-start gap-3 p-4 bg-white"
                      >
                        <div className="mt-0.5 w-9 h-9 rounded-full bg-[#F5F4EF] flex items-center justify-center shrink-0">
                          <ListTodo
                            size={16}
                            className="text-gray-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-900">
                            {subtask}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Bestandteil dieses Termins.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="px-4 pb-8 pt-3 bg-white border-t border-[#EBEAE4] shrink-0">
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
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-9 h-9 rounded-full bg-gray-50/80 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-bold text-gray-900 leading-snug truncate">
          {label}
        </h4>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
