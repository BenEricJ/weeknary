import React, { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";

export function ReviewView() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col relative overflow-hidden">
      {/* Header */}
      <AppTabHeader
        icon={ClipboardCheck}
        title="Review"
        subtitle={
          <>
            Woche 5. - 11. Mai
            {" · "}
            4 von 5 Ziele erreicht
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-[112px] pb-[112px]">
        <div className="mt-4">
          {/* Subtitle */}
          <h2 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-1.5">
            WOCHE 5. – 11. Mai
          </h2>
          
          <p className="text-[15px] text-gray-800 mb-6 flex items-center gap-1.5">
            Diese Woche hast du 4 von 5 Zielen erreicht. 
            <span className="text-sm bg-[#5E7A5E] text-white rounded-[4px] px-[3px] py-[1px] leading-none flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-white" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </p>

          {/* Main Score Card */}
          <div className="bg-[#F1EFE7] rounded-[20px] p-5 mb-5 shadow-sm border border-[#E8E6DD]">
            <div className="flex items-center gap-5">
              {/* Circular Progress */}
              <div className="relative w-[88px] h-[88px] shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E2E4DA"
                    strokeWidth="11"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#5E7A5E"
                    strokeWidth="11"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - 0.86)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#1A1A1A]">
                  <span className="text-[26px] font-bold leading-none tracking-tight">8.6</span>
                  <span className="text-[10px] text-gray-600 font-medium mt-0.5">Score</span>
                </div>
              </div>

              {/* Score Text */}
              <div className="flex-1">
                <h3 className="text-[19px] font-bold text-gray-900 mb-1 leading-snug tracking-tight">
                  Starke Woche!
                </h3>
                <p className="text-[13px] text-gray-600 leading-[1.35]">
                  Du warst konstant und hast gute Entscheidungen getroffen.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bars Section */}
          <div className="bg-white rounded-[20px] p-[22px] mb-7 shadow-sm border border-[#E8E6DD] flex flex-col gap-[18px]">
            <ProgressBar label="Ernährung" score={8.3} />
            <ProgressBar label="Training" score={8.8} />
            <ProgressBar label="Schlaf" score={7.9} />
            <ProgressBar label="Umsetzung" score={8.9} />
          </div>

          {/* What went well */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-3">
              WAS LIEF GUT?
            </h3>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#E8E6DD] flex flex-col gap-3.5">
              <ListItem type="good" text="3 Trainingseinheiten geschafft" />
              <ListItem type="good" text="Protein-Ziel an 6 von 7 Tagen erreicht" />
              <ListItem type="good" text="Früh ins Bett gegangen" />
            </div>
          </div>

          {/* What can be better */}
          <div className="mb-8">
            <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest mb-3">
              WAS KANN BESSER WERDEN?
            </h3>
            <div className="bg-[#FCF8F8] rounded-[20px] p-5 shadow-sm border border-[#F2E8E8] flex flex-col gap-3.5">
              <ListItem type="bad" text="Kalorien an 2 Tagen etwas zu niedrig" />
              <ListItem type="bad" text="Mehr Gemüsevielfalt anstreben" />
            </div>
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

function ProgressBar({ label, score }: { label: string; score: number }) {
  const percentage = (score / 10) * 100;
  
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 text-[13.5px] font-semibold text-gray-900 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#E2E4DA] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#5E7A5E] rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-7 text-right text-[13.5px] font-semibold text-gray-500 shrink-0">{score.toFixed(1)}</span>
    </div>
  );
}

function ListItem({ type, text }: { type: 'good' | 'bad'; text: string }) {
  return (
    <div className="flex gap-3.5 items-start">
      <div className={`mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center ${
        type === 'good' ? 'bg-[#5E7A5E]' : 'bg-[#E57373]'
      }`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[11px] h-[11px] text-white" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {type === 'good' ? (
            <polyline points="20 6 9 17 4 12"></polyline>
          ) : (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          )}
        </svg>
      </div>
      <span className="text-[14px] font-medium text-gray-700 leading-snug">{text}</span>
    </div>
  );
}
