import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MoveRight, Loader2 } from "lucide-react";
import imgMountain from "figma:asset/84a42e7a8e5c881ba0e5be072d2446217bebb0cd.png"; // We will use Unsplash instead
// Because I fetched mountain, let's use the unsplash URL
import { ChevronDown } from "lucide-react";

export function OnboardingView() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate("/app/home");
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FAF9F6] flex flex-col justify-between">
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}

      <div className="mt-auto px-6 pb-10 flex flex-col items-center gap-6 z-10">
        <button
          onClick={handleNext}
          className="w-full h-14 bg-[#5E7A5E] text-white rounded-full font-semibold text-lg flex items-center justify-center hover:bg-[#4D654D] transition-colors"
        >
          {step === 1 ? "Los geht's" : "Weiter"}
        </button>

        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-gray-800" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step1() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <img
        src="https://images.unsplash.com/photo-1762385653076-2f0c1ec4aaa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBtb3VudGFpbiUyMHNpdHRpbmclMjBiYWNrfGVufDF8fHx8MTc3NTM3MDQ1MHww&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Mountain view"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />
      
      <div className="relative z-10 flex flex-col items-center pt-12 h-full">
        <div className="flex items-center gap-2 mb-auto">
          <div className="w-6 h-6 rounded-full border-2 border-white/80 border-t-transparent animate-spin-slow" />
          <span className="text-white font-semibold text-xl tracking-tight">Weeknary</span>
        </div>

        <div className="px-8 pb-40 w-full text-white mt-auto">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Deine Woche.<br />In Balance.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-[280px]">
            Ernährung, Training, Schlaf und alles, was wichtig ist — in einem intelligenten Plan.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div className="flex-1 w-full flex flex-col items-center pt-24 px-6 text-center">
      <h2 className="text-[28px] font-bold text-gray-900 mb-4">Alles. Verbunden.</h2>
      <p className="text-gray-600 text-lg mb-12 max-w-[260px]">
        Deine Pläne arbeiten zusammen und passen sich deinem Leben an.
      </p>

      {/* Circle Graphic Placeholder */}
      <div className="relative w-64 h-64 border-[3px] border-gray-200/50 rounded-full flex items-center justify-center">
        <div className="absolute top-0 -translate-y-1/2 flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-1">
             <span className="text-xl">🍱</span>
          </div>
          <span className="text-xs font-medium text-gray-700">Ernährung</span>
        </div>
        
        <div className="absolute right-0 translate-x-1/2 flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-1">
             <span className="text-xl">🏋️</span>
          </div>
          <span className="text-xs font-medium text-gray-700">Training</span>
        </div>

        <div className="absolute bottom-0 translate-y-1/2 flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-1">
             <span className="text-xl">📝</span>
          </div>
          <span className="text-xs font-medium text-gray-700">Review</span>
        </div>

        <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-1">
             <span className="text-xl">🌙</span>
          </div>
          <span className="text-xs font-medium text-gray-700">Schlaf</span>
        </div>

        <div className="w-24 h-24 bg-[#5E7A5E] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-8 ring-[#5E7A5E]/10">
          Du
        </div>
      </div>
    </div>
  );
}

function Step3() {
  return (
    <div className="flex-1 w-full flex flex-col items-center pt-24 px-6 text-center">
      <h2 className="text-[28px] font-bold text-gray-900 mb-4">Dein Plan. Dein Weg.</h2>
      <p className="text-gray-600 text-lg mb-10 max-w-[280px]">
        Erzähl uns ein paar Dinge über dich, und wir erstellen deinen ersten Plan.
      </p>

      <div className="w-full space-y-4 text-left">
        <SelectField label="Ernährungsstil" value="Vegan" />
        <SelectField label="Ziel" value="Mehr Energie" />
        <SelectField label="Aktivitätslevel" value="Mittel" />
        <SelectField label="Kochzeit pro Tag" value="30-45 Min." />
      </div>
    </div>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200">
      <span className="text-gray-900 font-medium">{label}</span>
      <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
        <span className="text-gray-700">{value}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </div>
  );
}
