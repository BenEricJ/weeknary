import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Check, Sparkles, SwitchCamera, Loader2 } from "lucide-react";

export function CreateHubView() {
  const navigate = useNavigate();
  // 1 = Start, 2 = Context (Planning), 3 = Summary, 4 = Result (Vorschau)
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    if (step === 3) {
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setStep(4);
      }, 1500);
    } else if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 4) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col pt-8 pb-4 z-10 sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-md px-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200/50 transition-colors">
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <span className="font-semibold text-lg">{step === 4 ? "Plan Vorschau" : "Create Hub"}</span>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>

        {/* Breadcrumb / Progress */}
        {step > 1 && step < 4 && (
          <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-semibold text-gray-400">
            <span className={step >= 2 ? "text-[#5E7A5E]" : ""}>1. Setup</span>
            <ChevronRight size={10} className="text-gray-300" />
            <span className={step >= 2 ? "text-[#5E7A5E]" : ""}>2. Kontext</span>
            <ChevronRight size={10} className="text-gray-300" />
            <span className={step >= 3 ? "text-[#5E7A5E]" : ""}>3. Ausgabe</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-6 pb-28">
        {step === 1 && <StartStep onSelect={handleNext} />}
        {step === 2 && <PlanningStep />}
        {step === 3 && <SummaryStep />}
        {step === 4 && <ResultStep />}
      </div>

      {/* Footer Actions */}
      {step > 1 && step < 4 && (
        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-3">
          <button
            onClick={handleNext}
            disabled={isGenerating}
            className="w-full h-14 bg-[#5E7A5E] text-white rounded-full font-semibold text-lg flex items-center justify-center shadow-lg hover:bg-[#4D654D] transition-all disabled:opacity-70"
          >
            {isGenerating ? (
              <Loader2 size={24} className="animate-spin" />
            ) : step === 3 ? (
              <span className="flex items-center gap-2">Plan generieren <Sparkles size={18} /></span>
            ) : (
              "Weiter"
            )}
          </button>
          {step === 2 && (
            <div className="flex justify-between px-4 mt-2 mb-4">
              <span className="text-xs text-gray-500 font-medium">Quick Mode</span>
              <span className="text-xs text-[#5E7A5E] font-bold px-3 py-1 bg-[#5E7A5E]/10 rounded-full">Studio Mode</span>
            </div>
          )}
          {step === 3 && (
            <button className="w-full py-4 text-gray-600 font-semibold bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              Als Entwurf speichern
            </button>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-3">
          <button className="flex-1 h-14 bg-gray-100 text-gray-700 rounded-full font-semibold text-lg flex items-center justify-center hover:bg-gray-200 transition-all">
            Anpassen
          </button>
          <button onClick={() => navigate("/app/home")} className="flex-[2] h-14 bg-[#5E7A5E] text-white rounded-full font-semibold text-lg flex items-center justify-center shadow-lg hover:bg-[#4D654D] transition-all">
            Plan übernehmen
          </button>
        </div>
      )}
    </div>
  );
}

function StartStep({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Was möchtest du erstellen?</h2>
      
      <div className="space-y-3 mb-10">
        <CreateCard icon="✨" title="Combined Week Plan" subtitle="Ernährung, Training, Schlaf & mehr" recommended onClick={onSelect} />
        <CreateCard icon="🥗" title="Meal Plan" subtitle="Lecker, nährstoffreich, zu deinem Ziel" onClick={onSelect} />
        <CreateCard icon="🏋️" title="Training Plan" subtitle="Strukturiert & progressiv" onClick={onSelect} />
        <CreateCard icon="🌙" title="Schlaf & Erholung" subtitle="Besser regenerieren, erholt aufwachen" onClick={onSelect} />
        <CreateCard icon="🎯" title="Wochenfokus" subtitle="Eine Sache, die diese Woche zählt" onClick={onSelect} />
        <CreateCard icon="📝" title="Review Prep" subtitle="Daten reflektieren, besser planen" onClick={onSelect} />
      </div>

      <h3 className="text-[10px] font-bold text-gray-500 tracking-wider mb-4 uppercase">Ausgangspunkt</h3>
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <StartPointItem icon={<span className="text-lg">🔄</span>} label="Neu starten" />
        <div className="h-px bg-gray-100 mx-4" />
        <StartPointItem icon={<span className="text-lg">📈</span>} label="Auf letzter Woche aufbauen" />
        <div className="h-px bg-gray-100 mx-4" />
        <StartPointItem icon={<span className="text-lg">⚙️</span>} label="Aktuellen Plan anpassen" />
      </div>
    </div>
  );
}

function PlanningStep() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Was soll in deinen Plan einfließen?</h2>
      <p className="text-sm font-semibold text-gray-600 mb-6">Diese Woche berücksichtigen</p>

      <div className="space-y-3">
        <ToggleItem icon="🔗" title="3 Trainingstage" subtitle="Di, Do, Sa" checked />
        <ToggleItem icon="🥂" title="2 soziale Abende" subtitle="Fr & Sa" checked />
        <ToggleItem icon="⏳" title="Wenig Zeit am Mittwoch" checked />
        <ToggleItem icon="🎯" title="Wochenfokus" subtitle="Mietsituation klären" checked />
        <ToggleItem icon="🚧" title="Wochenhindernis" subtitle="Langer Arbeitstag am Mittwoch" checked />
        <ToggleItem icon="💶" title="Budget" subtitle="Mittel (ca. 45-65€/Woche)" checked />
        <ToggleItem icon="📦" title="Vorräte berücksichtigen" subtitle="12 Zutaten verfügbar" checked />
      </div>
    </div>
  );
}

function SummaryStep() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Das wird erstellt</h2>

      <div className="space-y-3 mb-6">
        <SummaryItem icon="🥗" title="Meal Plan" subtitle="7 Tage · ~2.200 kcal/Tag" />
        <SummaryItem icon="🏋️" title="Training Plan" subtitle="3 Einheiten" />
        <SummaryItem icon="📅" title="Wochenstruktur" subtitle="Termine, Fokus & Puffer" />
        <SummaryItem icon="🌙" title="Schlaf & Recovery" subtitle="Empfehlungen" />
        <SummaryItem icon="🛒" title="Einkaufsliste" subtitle="Nach Kategorien" />
        <SummaryItem icon="📊" title="Nutrition Overview" subtitle="Makros & Mikronährstoffe" />
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
        <span className="text-[#5E7A5E]">✓</span> Erstellt in ca. 30 Sekunden
      </div>
    </div>
  );
}

function ResultStep() {
  return (
    <div className="animate-in zoom-in-95 duration-500">
      <div className="flex justify-center mb-6">
        <div className="px-4 py-1.5 bg-[#E6EFE6] text-[#4A634A] text-xs font-semibold rounded-full border border-[#D5E5D5]">
          Plan erstellt
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-1">Dein Plan für</h2>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">5.–11. Mai</h2>
      <p className="text-sm text-gray-600 mb-8">
        Alles ist bereit. Du kannst noch Anpassungen vornehmen.
      </p>

      <div className="space-y-4">
        <ResultItem
          icon={<img src="https://images.unsplash.com/photo-1747292718361-c838a9968ec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbWVhbCUyMGJvd2wlMjB0b3AlMjB2aWV3fGVufDF8fHx8MTc3NTM3MDQ1N3ww&ixlib=rb-4.1.0&q=80&w=1080" alt="Meal" className="w-full h-full object-cover rounded-xl" />}
          title="Meal Plan"
          subtitle="7 Tage · 21 Mahlzeiten"
        />
        <ResultItem
          icon={<div className="w-full h-full bg-[#EBF0FA] text-[#3B66A3] rounded-xl flex items-center justify-center text-2xl">🏋️</div>}
          title="Training Plan"
          subtitle="3 Workouts"
        />
        <ResultItem
          icon={<div className="w-full h-full bg-[#E6F3EE] text-[#2F7B5E] rounded-xl flex items-center justify-center text-2xl">📅</div>}
          title="Wochenstruktur"
          subtitle="35h Fokus · 8h Puffer"
        />
        <ResultItem
          icon={<div className="w-full h-full bg-[#FCF3E5] text-[#A67C40] rounded-xl flex items-center justify-center text-2xl">⚖️</div>}
          title="Nährstoffübersicht"
          subtitle="Ø 2.184 kcal · 122 g Protein"
        />
      </div>
    </div>
  );
}

// Subcomponents

function CreateCard({ icon, title, subtitle, recommended, onClick }: { icon: string, title: string, subtitle: string, recommended?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center justify-between hover:border-[#5E7A5E] hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[14px] bg-[#FAF9F6] border border-[#EBE7DF] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-gray-900">{title}</h4>
          <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {recommended && (
        <span className="px-2 py-1 bg-[#E6EFE6] text-[#4A634A] text-[9px] font-bold rounded uppercase tracking-wider">
          Empfohlen
        </span>
      )}
    </button>
  );
}

function StartPointItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
      <span className="text-gray-400">{icon}</span>
      <span className="text-[13px] font-semibold text-gray-800">{label}</span>
    </button>
  );
}

function ToggleItem({ icon, title, subtitle, checked = false }: { icon: string, title: string, subtitle?: string, checked?: boolean }) {
  return (
    <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-[12px] bg-[#FAF9F6] border border-[#EBE7DF] flex items-center justify-center text-lg shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-gray-900 leading-tight">{title}</h4>
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {/* Custom Switch using Checkbox for simplicity or pure CSS */}
      <div className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${checked ? 'bg-[#5E7A5E]' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

function SummaryItem({ icon, title, subtitle }: { icon: string, title: string, subtitle: string }) {
  return (
    <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="w-10 h-10 rounded-[12px] bg-[#FAF9F6] border border-[#EBE7DF] flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-[14px] font-bold text-gray-900 leading-tight">{title}</h4>
        <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function ResultItem({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
  return (
    <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#5E7A5E] transition-colors cursor-pointer">
      <div className="w-14 h-14 rounded-xl shrink-0 border border-gray-100">
        {icon}
      </div>
      <div>
        <h4 className="text-base font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
