import React, { useState } from "react";
import { Drawer } from "vaul";
import {
  ChevronLeft,
  ChevronRight,
  Share,
  MoreHorizontal,
  Target,
  Play,
  Clock,
  CheckSquare,
  Square,
  Info,
  AlertCircle,
  ArrowUpRight,
  MessageSquare,
  Plus,
  ListTodo,
} from "lucide-react";
import { FOCUS_STEPS } from "../data/focusSteps";

interface FocusDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  checkedItems: Record<string, boolean>; // Von HomeView gesteuert
  onToggleStep: (id: string) => void; // Funktion von HomeView
}

export function FocusDetailDrawer({
  isOpen,
  onClose,
  checkedItems,
  onToggleStep,
}: FocusDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("Überblick");

  // Berechnung der Fortschrittswerte basierend auf den Props
  const totalSteps = FOCUS_STEPS.length;
  const completedSteps =
    Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round(
    (completedSteps / totalSteps) * 100,
  );

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-[#F5F4EF] flex flex-col rounded-t-[24px] h-[95vh] fixed bottom-0 left-0 right-0 z-50 outline-none max-w-[390px] mx-auto overflow-hidden">
          <Drawer.Description className="sr-only">
            Fortschritt, Aufgaben und Notizen zum aktuellen Wochenfokus.
          </Drawer.Description>
          {/* Top Navigation Bar */}
          <div className="bg-white flex items-center justify-between px-4 py-3 rounded-t-[24px] shrink-0 border-b border-[#EBEAE4]">
            <button
              onClick={onClose}
              className="text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-[16px] font-bold text-gray-900">
              Fokus-Details
            </h2>
            <div className="flex items-center gap-4 text-gray-900 mr-1">
              <Share size={20} strokeWidth={2} />
              <MoreHorizontal size={24} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4 hide-scrollbar relative">
            {/* Hero Section */}
            <div className="w-full relative">
              <div className="h-[240px] w-full">
                <img
                  src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&q=80&w=1000"
                  alt="Wohnung"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-[#6A816A]/90 text-white text-[10px] font-bold px-2 py-1 rounded-[6px] flex items-center gap-1 backdrop-blur-sm uppercase tracking-wider">
                  <Target size={12} /> Prio: Hoch
                </span>
              </div>

              {/* Title & Stats Bar */}
              <div className="absolute bottom-[44px] left-4 right-4 text-white">
                <Drawer.Title className="text-[24px] font-bold leading-tight mb-1">
                  Mietsituation klären
                </Drawer.Title>
                <p className="text-[12px] text-white/80 leading-snug">
                  Klären der Nachmieter-Optionen und
                  Vorbereitung der Kommunikation.
                </p>
              </div>

              {/* Dark Stats Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-3 text-white">
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  <Clock size={14} className="text-gray-300" />{" "}
                  4 Tage
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  <ListTodo
                    size={14}
                    className="text-gray-300"
                  />{" "}
                  {completedSteps}/{totalSteps}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  <div className="w-3 h-3 rounded-full border border-white/30 flex items-center justify-center p-[1.5px]">
                    <div className="w-full h-full bg-[#6A816A] rounded-full" />
                  </div>
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-[#EBEAE4] px-2 pt-1 flex justify-between sticky top-0 z-10 shadow-sm">
              {["Überblick", "Aufgaben", "Notizen"].map(
                (tab) => (
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
                ),
              )}
            </div>

            {/* Tab Content */}
            <div className="p-5 space-y-7">
              {activeTab === "Überblick" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Fortschritt
                    </h3>
                    <div className="bg-white border border-[#EBEAE4] rounded-[16px] p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[13px] font-bold text-gray-900">
                          Gesamt
                        </span>
                        <span className="text-[13px] font-bold text-[#6A816A]">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#F5F4EF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6A816A] transition-all duration-700 ease-out"
                          style={{
                            width: `${progressPercent}%`,
                          }}
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                      Hinweise
                    </h3>
                    <div className="bg-white rounded-[16px] border border-[#EBEAE4] shadow-sm overflow-hidden flex flex-col">
                      <HintItem
                        icon={Info}
                        title="Rechtliches"
                        desc="BGB § 540 prüfen."
                        color="text-blue-500"
                      />
                      <div className="h-px bg-[#EBEAE4] mx-3" />
                      <HintItem
                        icon={AlertCircle}
                        title="Fristen"
                        desc="Kündigung bis zum 3. Werktag."
                        color="text-red-500"
                      />
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "Aufgaben" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-white border border-[#EBEAE4] rounded-[20px] overflow-hidden shadow-sm divide-y divide-[#EBEAE4]">
                    {FOCUS_STEPS.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 p-4 cursor-pointer active:bg-gray-50 transition-colors ${checkedItems[step.id] ? "bg-[#FAF9F5]" : "bg-white"}`}
                        onClick={() => onToggleStep(step.id)}
                      >
                        <div className="mt-0.5">
                          {checkedItems[step.id] ? (
                            <CheckSquare
                              size={20}
                              className="text-[#6A816A]"
                            />
                          ) : (
                            <Square
                              size={20}
                              className="text-gray-300"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[13px] font-bold truncate ${checkedItems[step.id] ? "text-gray-400 line-through" : "text-gray-900"}`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {step.info}
                          </p>
                        </div>
                        <step.icon
                          size={14}
                          className="text-gray-300 shrink-0 mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Notizen" && (
                <div className="animate-in fade-in duration-300">
                  <textarea
                    className="w-full bg-white border border-[#EBEAE4] rounded-2xl p-4 text-[13px] text-gray-700 h-[140px] outline-none focus:border-[#6A816A] shadow-sm"
                    placeholder="Deine Notizen..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-4 pb-8 pt-3 grid grid-cols-[1fr_1.3fr] gap-3 bg-white border-t border-[#EBEAE4] shrink-0">
            <button
              onClick={onClose}
              className="bg-[#F5F4EF] text-gray-800 text-[13px] font-bold py-3.5 rounded-[12px] border border-[#EBEAE4] active:scale-95 transition-transform"
            >
              Schließen
            </button>
            <button
              onClick={onClose}
              className="bg-[#6A816A] text-white text-[13px] font-bold py-3.5 rounded-[12px] shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Fokus beenden
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function HintItem({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="flex items-center gap-3 p-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="w-9 h-9 rounded-full bg-gray-50/80 flex items-center justify-center shrink-0">
        <Icon size={18} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-bold text-gray-900 leading-snug truncate">
          {title}
        </h4>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight truncate">
          {desc}
        </p>
      </div>
      <ChevronRight
        size={16}
        className="text-gray-300 shrink-0 ml-1"
      />
    </div>
  );
}
