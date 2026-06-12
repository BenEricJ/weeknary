import {
  ChevronRight,
  Target,
  Clock,
  CheckSquare,
  Square,
  Info,
  AlertCircle,
  ListTodo,
} from "lucide-react";
import { FOCUS_STEPS } from "../data/focusSteps";
import {
  DetailDrawer,
  HeroBadge,
  SectionHeading,
  StatsBarItem,
} from "./ui/DetailDrawer";

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
  // Berechnung der Fortschrittswerte basierend auf den Props
  const totalSteps = FOCUS_STEPS.length;
  const completedSteps = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const overviewTab = (
    <div className="space-y-6">
      <section>
        <SectionHeading className="text-gray-900 mb-2">
          Fortschritt
        </SectionHeading>
        <div className="bg-white border border-[#EBEAE4] rounded-[16px] p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-bold text-gray-900">Gesamt</span>
            <span className="text-[13px] font-bold text-[#6A816A]">
              {progressPercent}%
            </span>
          </div>
          <div className="h-2 bg-[#F5F4EF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6A816A] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading className="text-gray-900">Hinweise</SectionHeading>
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
  );

  const tasksTab = (
    <div className="space-y-4">
      <div className="bg-white border border-[#EBEAE4] rounded-[20px] overflow-hidden shadow-sm divide-y divide-[#EBEAE4]">
        {FOCUS_STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-3 p-4 cursor-pointer active:bg-gray-50 transition-colors ${checkedItems[step.id] ? "bg-[#FAF9F5]" : "bg-white"}`}
            onClick={() => onToggleStep(step.id)}
          >
            <div className="mt-0.5">
              {checkedItems[step.id] ? (
                <CheckSquare size={20} className="text-[#6A816A]" />
              ) : (
                <Square size={20} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[13px] font-bold truncate ${checkedItems[step.id] ? "text-gray-400 line-through" : "text-gray-900"}`}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{step.info}</p>
            </div>
            <step.icon size={14} className="text-gray-300 shrink-0 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );

  const notesTab = (
    <textarea
      className="w-full bg-white border border-[#EBEAE4] rounded-2xl p-4 text-[13px] text-gray-700 h-[140px] outline-none focus:border-[#6A816A] shadow-sm"
      placeholder="Deine Notizen..."
    />
  );

  return (
    <DetailDrawer
      open={isOpen}
      onClose={onClose}
      title="Fokus-Details"
      description="Fortschritt, Aufgaben und Notizen zum aktuellen Wochenfokus."
      hero={{
        background: (
          <>
            <img
              src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&q=80&w=1000"
              alt="Wohnung"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ),
        badges: (
          <HeroBadge className="bg-[#6A816A]/90 text-white flex items-center gap-1">
            <Target size={12} /> Prio: Hoch
          </HeroBadge>
        ),
        titleBlock: (
          <>
            <h2 className="text-[24px] font-bold leading-tight mb-1">
              Mietsituation klären
            </h2>
            <p className="text-[12px] text-white/80 leading-snug">
              Klären der Nachmieter-Optionen und Vorbereitung der Kommunikation.
            </p>
          </>
        ),
        titleBlockClassName: "absolute bottom-[44px] left-4 right-4 text-white",
        statsBar: (
          <>
            <StatsBarItem
              icon={<Clock size={14} className="text-gray-300" />}
              label="4 Tage"
            />
            <StatsBarItem
              icon={<ListTodo size={14} className="text-gray-300" />}
              label={`${completedSteps}/${totalSteps}`}
            />
            <StatsBarItem
              icon={
                <div className="w-3 h-3 rounded-full border border-white/30 flex items-center justify-center p-[1.5px]">
                  <div className="w-full h-full bg-[#6A816A] rounded-full" />
                </div>
              }
              label={`${progressPercent}%`}
            />
          </>
        ),
      }}
      tabs={[
        { label: "Überblick", content: overviewTab },
        { label: "Aufgaben", content: tasksTab },
        { label: "Notizen", content: notesTab },
      ]}
      bodyClassName="p-5 space-y-7"
      footer={
        <div className="grid grid-cols-[1fr_1.3fr] gap-3">
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
      }
    />
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
      <ChevronRight size={16} className="text-gray-300 shrink-0 ml-1" />
    </div>
  );
}
