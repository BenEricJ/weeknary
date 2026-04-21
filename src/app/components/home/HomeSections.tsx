import React from "react";
import { Zap, Moon, Footprints, Utensils, Target, MoreHorizontal, Mail, Activity, Dumbbell, Flame, Droplet, ShieldCheck } from "lucide-react";
import { KpiCard, ScheduleItem, NoticeItem } from "./HomeWidgets";
import { FOCUS_STEPS, type FocusStep } from "../../data/focusSteps";

export function HomeHeader({ userName, selectedDate, onProfileClick }: { userName: string, selectedDate: number, onProfileClick: () => void }) {
  return (
    <div className="flex justify-between items-start pt-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          Guten Morgen, {userName}! <span className="text-2xl">👋</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Dienstag, {selectedDate}. Mai
        </p>
      </div>
      <button
        onClick={onProfileClick}
        className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0"
      >
        <img
          src="https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGluZyUyMGNhc3VhbHxlbnwxfHx8fDE3NzUyNjkzMzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Profile Avatar"
          className="w-full h-full object-cover"
        />
      </button>
    </div>
  );
}

export function DailyKpis() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <KpiCard icon={<Zap size={14} className="text-[#4A634A]" />} title="Energie" value="72" status="Gut" statusColor="text-[#4A634A]" />
      <KpiCard icon={<Moon size={14} className="text-[#6B5B95]" />} title="Schlaf" value="7h 15" status="Gut" statusColor="text-[#4A634A]" />
      <KpiCard icon={<Footprints size={14} className="text-[#D37F36]" />} title="Training" value="90min." status="Geplant" statusColor="text-[#D37F36]" />
      <KpiCard icon={<Utensils size={14} className="text-[#4A634A]" />} title="Ernährung" value="Im Plan" valueColor="text-[#4A634A]" />
    </div>
  );
}

interface WeeklyFocusCardProps {
  onClick: () => void;
  progressPercent: number;
  nextStep: FocusStep;
}

export function WeeklyFocusCard({ onClick, progressPercent, nextStep }: WeeklyFocusCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[#F2F4F2] rounded-[20px] p-4 flex gap-3 shadow-sm border border-[#E6EBE6] cursor-pointer hover:border-[#D1D9D1] transition-all active:scale-[0.98]"
    >
      <div className="shrink-0 pt-0.5">
        <Target size={24} strokeWidth={2} className="text-[#4A634A]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1.5">
          <span className="bg-[#E4E9E4] text-[#4A634A] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Wochen Focus
          </span>
          <button onClick={(e) => e.stopPropagation()} aria-label="Optionen" className="text-gray-500 hover:text-gray-700 transition-colors shrink-0 ml-2">
            <MoreHorizontal size={20} />
          </button>
        </div>
        <h3 className="text-[16px] font-bold text-gray-900 mb-1 leading-tight truncate">Mietsituation klären</h3>
        <p className="text-[12px] text-gray-600 mb-3 leading-snug">
          Verstehe, ob Nachmieter gestellt werden dürfen oder eine Mietreduktion möglich ist.
        </p>
        <div className="h-[1px] w-full bg-[#E6EBE6] mb-3" />
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 w-14 shrink-0">
            <span className="text-[10px] font-bold text-[#4A634A] leading-none">{progressPercent}%</span>
            <div className="h-1.5 w-full bg-[#E4E9E4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5E7A5E] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="w-[1px] h-6 bg-[#E6EBE6] shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-gray-500 block mb-0.5 uppercase tracking-wider font-medium">Nächster Schritt</span>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900">
              <nextStep.icon size={12} className="text-gray-400 shrink-0" />
              <span className="truncate">{nextStep.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TodaySchedule({ onWorkoutSelect }: { onWorkoutSelect: (id: string) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 px-1">
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Heute</h3>
        <button aria-label="Mehr Optionen" className="flex items-center justify-center px-1.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <ScheduleItem
          icon={<Activity size={18} className="text-[#5B88A5]" strokeWidth={2} />}
          title="Zwift Grundlage" details="60 Min • locker aerob" tag="06:30 Uhr" tagHighlight
          onClick={() => onWorkoutSelect("endurance")}
        />
        <ScheduleItem
          icon={<Dumbbell size={18} className="text-[#5B88A5]" />}
          title="Krafttraining – Ganzkörper" details="45 Min • 6 Übungen" tag="12:00 Uhr" tagHighlight
          onClick={() => onWorkoutSelect("kraft")}
        />
        <ScheduleItem
          icon={<Target size={18} className="text-[#D37F36]" />}
          title="Physiotherapie" details="Knie-Checkup (Wichtig)" tag="14:30 Uhr" tagHighlight
        />
      </div>
    </div>
  );
}

export function DailyNotices() {
  return (
    <div>
      <div className="px-1 mb-1.5">
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Heute beachten</h3>
      </div>
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <NoticeItem icon={<Flame size={18} className="text-[#D37F36]" />} title="Kalorien könnten knapp werden" desc="Plane vor dem Training einen Snack ein." />
        <div className="h-px bg-gray-100 mx-3" />
        <NoticeItem icon={<Moon size={18} className="text-[#6B5B95]" />} title="Schlaf leicht unter Ziel" desc="Heute keine harte Einheit einplanen." />
        <div className="h-px bg-gray-100 mx-3" />
        <NoticeItem icon={<Droplet size={18} className="text-[#789A5A]" />} title="Hydration im Blick behalten" desc="Noch 1-2 Gläser bis zu deinem Tagesziel." />
      </div>
    </div>
  );
}

export function WeeklyProgressCard() {
  return (
    <div className="mb-2">
      <div className="px-1 mb-1.5">
        <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Diese Woche</h3>
      </div>
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm p-3.5 flex justify-between items-center gap-3">
        <div className="flex gap-2 items-center flex-1 min-w-0">
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-gray-700 font-bold text-[8px] uppercase tracking-wide">
              <Target size={12} className="text-[#4A634A] shrink-0" />
              <span className="truncate">Ziele</span>
            </div>
            <span className="font-bold text-[13px] text-gray-900 leading-none">3 / 7</span>
            <div className="h-1 bg-[#F2F4F2] rounded-full mt-0.5 w-full overflow-hidden">
              <div className="h-full bg-[#5E7A5E] rounded-full w-[42%]" />
            </div>
          </div>
          <div className="w-[1px] h-8 bg-gray-100 shrink-0 mx-0.5" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-gray-700 font-bold text-[8px] uppercase tracking-wide">
              <Dumbbell size={12} className="text-gray-400 shrink-0" />
              <span className="truncate">Training</span>
            </div>
            <span className="font-bold text-[13px] text-gray-900 leading-none">3 / 4</span>
            <div className="h-1 bg-[#F8F3EA] rounded-full mt-0.5 w-full overflow-hidden">
              <div className="h-full bg-[#D37F36] rounded-full w-[75%]" />
            </div>
          </div>
          <div className="w-[1px] h-8 bg-gray-100 shrink-0 mx-0.5" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-gray-700 font-bold text-[8px] uppercase tracking-wide">
              <ShieldCheck size={12} className="text-[#4A634A] shrink-0" />
              <span className="truncate">Plan</span>
            </div>
            <span className="font-bold text-[13px] text-gray-900 leading-none">82 %</span>
            <div className="h-1 bg-[#F2F4F2] rounded-full mt-0.5 w-full overflow-hidden">
              <div className="h-full bg-[#5E7A5E] rounded-full w-[82%]" />
            </div>
          </div>
        </div>
        <div className="flex items-end gap-1 h-10 shrink-0 ml-2">
          {(["h-[40%]", "h-[60%]", "h-[45%]", "h-[70%]", "h-[85%]", "h-[50%]", "h-[30%]"] as const).map((hClass, i) => (
            <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
              <div className={`w-[4px] rounded-full ${hClass} ${i < 5 ? "bg-[#5E7A5E]" : "bg-[#E5E5E5]"}`} />
              <span className="text-[6px] font-bold text-gray-400">{["M", "D", "M", "D", "F", "S", "S"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
