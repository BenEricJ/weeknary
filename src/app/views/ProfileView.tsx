import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Settings, Info, Target, Link2, Sliders } from "lucide-react";

export function ProfileView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Über mich");

  const tabs = ["Über mich", "Ziele", "Integrationen", "Einstellungen"];

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 z-10 sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200/50 transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <span className="text-base font-semibold text-gray-900">Profil</span>
        <button className="p-2 -mr-2 rounded-full hover:bg-gray-200/50 transition-colors">
          <Settings size={22} className="text-gray-900" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-28">
        {/* Profile Info */}
        <div className="flex flex-col items-center mt-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
            <img
              src="https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGluZyUyMGNhc3VhbHxlbnwxfHx8fDE3NzUyNjkzMzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Alex"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Alex</h2>
          <p className="text-sm text-gray-500 mt-1">Woche 5.-11. Mai • Meal Plan aktiv</p>
        </div>

        {/* Tabs */}
        <div className="w-full flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-6 border-b border-gray-200/80 snap-x">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap snap-start transition-all duration-200 ${
                activeTab === tab ? "bg-[#5E7A5E] text-white shadow-md scale-105" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content - Über mich */}
        {activeTab === "Über mich" && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Körper & Aktivität */}
            <Section title="KÖRPER & AKTIVITÄT">
              <div className="grid grid-cols-4 gap-3">
                <StatCard icon={<Info size={16}/>} label="28 Jahre" />
                <StatCard icon={<Target size={16}/>} label="72 kg" />
                <StatCard icon={<Link2 size={16}/>} label="178 cm" />
                <StatCard icon={<Sliders size={16}/>} label="Mittel" />
              </div>
            </Section>

            {/* Ernährung */}
            <Section title="ERNÄHRUNG">
              <div className="grid grid-cols-4 gap-3">
                <StatCard icon={<span className="text-sm">🌱</span>} label="Vegan" />
                <StatCard icon={<span className="text-sm">🚫</span>} label="Keine Allergien" />
                <StatCard icon={<span className="text-sm">⏱️</span>} label="30-45 Min." />
                <StatCard icon={<span className="text-sm">💶</span>} label="Budget" />
              </div>
            </Section>

            {/* Ziele */}
            <Section title="ZIELE">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x pb-2">
                <Tag>Mehr Energie</Tag>
                <Tag>Body Recomp</Tag>
                <Tag>Stark bleiben</Tag>
              </div>
            </Section>

            {/* Aktive Pläne */}
            <Section title="AKTIVE PLÄNE">
              <div className="flex flex-col gap-3">
                <PlanCard title="Meal Plan" subtitle="5.-11. Mai" icon="🥗" />
                <PlanCard title="Training Plan" subtitle="Woche 4 von 6" icon="🏋️" />
                <PlanCard title="Wochenfokus" subtitle="Mietsituation klären" icon="📋" />
              </div>
            </Section>
          </div>
        )}

      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-[88px] left-6 right-6 z-20 pointer-events-none">
        <button
          onClick={() => navigate("/app/create")}
          className="w-full h-14 bg-[#5E7A5E] text-white rounded-full font-semibold text-base flex items-center justify-center shadow-xl hover:bg-[#4D654D] hover:shadow-2xl active:scale-98 transition-all pointer-events-auto"
        >
          Create Hub öffnen
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="w-full">
      <h3 className="text-[10px] font-bold text-gray-500 tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="bg-white p-3.5 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-gray-100 shadow-sm aspect-square hover:shadow-md transition-shadow">
      <div className="text-gray-400 flex items-center justify-center">{icon}</div>
      <span className="text-[10px] font-medium text-gray-700 leading-tight px-1">{label}</span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 bg-white rounded-full border border-gray-200 text-sm font-semibold text-gray-700 whitespace-nowrap shadow-sm snap-start hover:shadow-md hover:border-gray-300 transition-all">
      {children}
    </div>
  );
}

function PlanCard({ title, subtitle, icon }: { title: string, subtitle: string, icon: string }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#EBE7DF] flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  );
}
