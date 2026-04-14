import React, { useState } from "react";
import { Moon, Sun, Activity } from "lucide-react";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";

export function SleepView() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Überblick");

  const weeklyData = [
    { day: "MO", value: 7.75, label: "7:45", color: "bg-[#91ABC4]" },
    { day: "DI", value: 7.16, label: "7:10", color: "bg-[#91ABC4]" },
    { day: "MI", value: 5.5, label: "7:30", color: "bg-[#557FAD]", active: true },
    { day: "DO", value: 7.75, label: "7:45", color: "bg-[#7198C1]" },
    { day: "FR", value: 8.0, label: "8:00", color: "bg-[#7198C1]" },
    { day: "SA", value: 8.0, label: "8:00", color: "bg-[#7198C1]" },
    { day: "SO", value: 7.25, label: "7:15", color: "bg-[#91ABC4]" },
  ];

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col relative overflow-hidden">
      {/* Header */}
      <AppTabHeader
        icon={Moon}
        iconClassName="text-[#557FAD]"
        title="Schlaf"
        subtitle={
          <>
            Mittwoch, 8. April
            {" · "}
            7:15 h Schlafzeit
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-[112px] pb-[104px] flex flex-col gap-6">
        {/* Tabs */}
        <div className="w-full bg-[#EAECE5] p-1 rounded-xl flex shrink-0">
          {["Überblick", "Analyse", "Trends"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === tab ? "bg-[#5E7A5E] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Score Card */}
        <div className="bg-[#F4F4F0] rounded-[24px] p-5 flex items-center gap-5 shadow-sm border border-gray-100/50 shrink-0">
          <div className="relative w-[88px] h-[88px] shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="44" cy="44" r="38" stroke="#DEE6EE" strokeWidth="10" fill="none" />
              <circle 
                cx="44" cy="44" r="38" 
                stroke="#557FAD" 
                strokeWidth="10" 
                fill="none" 
                strokeDasharray="238.76" 
                strokeDashoffset={238.76 - (238.76 * 0.78)} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
              <span className="text-[28px] font-bold text-gray-900 leading-none tracking-tight">78</span>
              <span className="text-[11px] font-medium text-gray-500 mt-0.5">Score</span>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-[17px] font-bold text-gray-900 mb-1">Gut erholt</h2>
            <p className="text-[13px] text-gray-600 leading-snug pr-2">
              Dein Körper ist bereit für einen produktiven Tag.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 shrink-0">
          <StatCard value="7:15 h" label="Schlafzeit" />
          <StatCard value="88%" label="Schlafqualität" />
          <StatCard value="56" label="HRV" />
        </div>

        {/* Chart Section */}
        <div className="shrink-0">
          <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">Diese Woche</h3>
          
          <div className="bg-[#F4F4F0] rounded-[24px] p-5 shadow-sm border border-gray-100/50">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600">
                <div className="w-2 h-2 rounded-sm bg-[#557FAD]" /> 04:55
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600">
                <div className="w-2 h-2 rounded-sm bg-[#7198C1]" /> 0:26
              </div>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-gray-600">
                <div className="w-2 h-2 rounded-sm bg-[#91ABC4]" /> 08:30
              </div>
            </div>
            
            {/* Bars */}
            <div className="h-[140px] flex items-end justify-between px-1">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex flex-col items-center flex-1 justify-end h-full">
                  <span className={`text-[11px] font-bold mb-1.5 ${d.active ? 'text-gray-900' : 'text-gray-500'}`}>{d.label}</span>
                  <div 
                    className={`w-[28px] rounded-[6px] ${d.color} transition-all duration-500`}
                    style={{ height: `${(d.value / 8.0) * 85}px` }}
                  />
                  <div className="mt-2.5 h-[22px] flex items-center justify-center w-full">
                    {d.active ? (
                      <div className="bg-[#5E7A5E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {d.day}
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-gray-400">
                        {d.day}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Factors Section */}
        <div className="shrink-0 mb-4">
          <h3 className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">Faktoren</h3>
          
          <div className="flex flex-col gap-1">
            <FactorRow 
              icon={<Moon size={16} className="text-gray-600" />} 
              label="Schlafenszeit" 
              value="22:45" 
              status="Gut" 
            />
            <div className="h-px bg-gray-200/50 mx-2" />
            <FactorRow 
              icon={<Sun size={16} className="text-gray-600" />} 
              label="Aufwachzeit" 
              value="06:00" 
              status="Okay" 
              isWarning 
            />
            <div className="h-px bg-gray-200/50 mx-2" />
            <FactorRow 
              icon={<Activity size={16} className="text-gray-600" />} 
              label="Tiefschlaf" 
              value="1:45 h" 
              status="Gut" 
            />
          </div>
        </div>
      </div>
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={setIsProfileOpen}
      />
    </div>
  );
}

function StatCard({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex-1 bg-[#F4F4F0] rounded-[16px] py-4 px-2 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100/50">
      <div className="text-[19px] font-bold text-gray-900 mb-0.5 tracking-tight">{value}</div>
      <div className="text-[11px] font-medium text-gray-500">{label}</div>
    </div>
  );
}

function FactorRow({ icon, label, value, status, isWarning = false }: { icon: React.ReactNode, label: string, value: string, status: string, isWarning?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 px-2">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[14px] font-medium text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[14px] font-medium text-gray-900">{value}</span>
        <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
          isWarning 
            ? "bg-[#D9A05B]/15 text-[#D9A05B]" 
            : "bg-[#789378]/15 text-[#5E7A5E]"
        }`}>
          {status}
        </div>
      </div>
    </div>
  );
}
