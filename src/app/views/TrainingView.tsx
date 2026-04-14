import React, { useState } from "react";
import { Dumbbell, Link2, Activity, Flower, CircleDot, Zap, MapIcon } from "lucide-react";
import { WorkoutDetailDrawer } from "../components/WorkoutDetailDrawer";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import {
  getDefaultTrainingDate,
  getTrainingPlanRowByDate,
} from "../data/trainingPlan";

// Deine neuen aufgeteilten Komponenten:
import { PlanSection, WorkoutsSection, ProgressSection } from "../components/training/TrainingTabs";
import { DateRangeModal, MetricsModal } from "../components/training/TrainingWidgets";

// --- DATEN & KONSTANTEN ---
const AVAILABLE_METRICS = [
  { id: 'vo2max', title: 'VO₂max (Schätzung)', value: '48', unit: 'ml/kg/min', change: '+2', subChange: null, trendColor: '#6A816A', textClass: 'text-[#6A816A]', points: '0,30 20,28 40,32 60,25 80,30 100,10', circleY: 10 },
  { id: 'ftp', title: 'FTP (Rad)', value: '285', unit: 'Watt', change: '+15', subChange: null, trendColor: '#3B82F6', textClass: 'text-blue-500', points: '0,35 20,35 40,30 60,35 80,20 100,15', circleY: 15 },
  { id: '5k', title: '5K Zeit', value: '21:45', unit: 'min', change: '-15', subChange: '-0:45', trendColor: '#F97316', textClass: 'text-orange-500', points: '0,15 20,25 40,30 60,25 80,30 100,28', circleY: 28 },
  { id: 'bench', title: 'Bankdrücken (1RM)', value: '85', unit: 'kg', change: '+2.5', subChange: null, trendColor: '#6A816A', textClass: 'text-[#6A816A]', points: '0,38 20,35 40,25 60,28 80,15 100,8', circleY: 8 },
  { id: 'squat', title: 'Kniebeuge (1RM)', value: '110', unit: 'kg', change: '+5', subChange: null, trendColor: '#6A816A', textClass: 'text-[#6A816A]', points: '0,38 20,35 40,25 60,28 80,15 100,8', circleY: 8 }
];

const categories = [
  { label: "Alle" },
  { label: "Kraft", icon: Dumbbell },
  { label: "Ausdauer", icon: Link2 },
  { label: "Mobilität", icon: Activity },
  { label: "Yoga", icon: Flower },
  { label: "Schwimmen", icon: Link2 },
  { label: "Pilates", icon: CircleDot },
  { label: "HIT", icon: Zap },
  { label: "Wandern", icon: MapIcon },
];

const progressData: Record<string, any> = {
  "7 Tage": {
    overview: { workouts: "3", workoutsTrend: "1 vs. Vorwoche", workoutsDir: "up", time: "2:15 h", timeTrend: "15 Min", timeDir: "up", kcal: "1.250", kcalTrend: "120 kcal", kcalDir: "up", score: "8,1", scoreTrend: "0,3", scoreDir: "up" },
    chart: { avg: "Ø 0:19 h pro Tag", trend: "+5 %", trendColor: "text-[#4A634A] bg-[#E4ECD6]", bars: [20, 10, 45, 30, 60, 15, 30], labels: ["MO", "DI", "MI", "DO", "FR", "SA", "SO"] }
  },
  "4 Wochen": {
    overview: { workouts: "8", workoutsTrend: "2 vs. letzte 4 W.", workoutsDir: "up", time: "5:45 h", timeTrend: "45 Min", timeDir: "up", kcal: "4.280", kcalTrend: "320 kcal", kcalDir: "up", score: "7,8", scoreTrend: "0,6", scoreDir: "up" },
    chart: { avg: "Ø 1:26 h pro Tag", trend: "+15 %", trendColor: "text-[#4A634A] bg-[#E4ECD6]", bars: [40, 55, 80, 45], labels: ["W1", "W2", "W3", "W4"] }
  },
  "3 Monate": {
    overview: { workouts: "24", workoutsTrend: "2 vs. Vorjahr", workoutsDir: "down", time: "18:30 h", timeTrend: "1:15 h", timeDir: "down", kcal: "14.500", kcalTrend: "800 kcal", kcalDir: "down", score: "7,5", scoreTrend: "0,2", scoreDir: "down" },
    chart: { avg: "Ø 6:10 h pro Monat", trend: "-5 %", trendColor: "text-[#9C3A3A] bg-[#F5E6E6]", bars: [60, 75, 65, 80, 90, 85, 70, 75, 85, 95, 80, 100], labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] }
  },
  "1 Jahr": {
    overview: { workouts: "96", workoutsTrend: "12 vs. Vorjahr", workoutsDir: "up", time: "74:00 h", timeTrend: "10:30 h", timeDir: "up", kcal: "58.000", kcalTrend: "8.500 kcal", kcalDir: "up", score: "8,0", scoreTrend: "0,5", scoreDir: "up" },
    chart: { avg: "Ø 6:10 h pro Monat", trend: "+12 %", trendColor: "text-[#4A634A] bg-[#E4ECD6]", bars: [40, 35, 50, 60, 55, 70, 80, 75, 65, 50, 45, 40], labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] }
  },
  "Individuell": {
    overview: { workouts: "5", workoutsTrend: "benutzerdefiniert", workoutsDir: "up", time: "4:30 h", timeTrend: "benutzerdefiniert", timeDir: "up", kcal: "2.800", kcalTrend: "benutzerdefiniert", kcalDir: "up", score: "7,9", scoreTrend: "-", scoreDir: "up" },
    chart: { avg: "Ø 0:54 h pro Tag", trend: "~", trendColor: "text-gray-500 bg-gray-100", bars: [60, 20, 80, 40, 90], labels: ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"] }
  }
};

// --- KOMPONENTE ---
export function TrainingView() {
  // -- STATES --
  const [activeTab, setActiveTab] = useState("Plan");
  const [timeRangeTab, setTimeRangeTab] = useState("4 Wochen");
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [activeDate, setActiveDate] = useState(() => getDefaultTrainingDate());
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Modals & Selections
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['vo2max', 'ftp', '5k']);

  // Vorbereitete Daten
  const currentProgress = progressData[timeRangeTab] || progressData["4 Wochen"];
  const categoriesWithActiveState = categories.map(c => ({ ...c, active: c.label === activeCategory }));
  const selectedTrainingDay = getTrainingPlanRowByDate(activeDate);

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col relative overflow-hidden">
      
      {/* HEADER */}
      <AppTabHeader
        icon={Dumbbell}
        title="Training"
        subtitle={
          <>
            {selectedTrainingDay.dayLabel}, {selectedTrainingDay.dayDate}.{" "}
            {selectedTrainingDay.monthLabel}
            {" · "}
            {selectedTrainingDay.workoutIds.length} Einheiten geplant
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-[112px] pb-[96px] flex flex-col">
        {/* MAIN TABS NAVIGATION */}
        <div className="w-full bg-[#EBEAE4] p-1 rounded-xl flex shrink-0 mb-5">
          {["Plan", "Workouts", "Fortschritt"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all duration-200 ${
                activeTab === tab 
                  ? "bg-[#6A816A] text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB INHALTE */}
        {activeTab === "Plan" && <PlanSection setSelectedWorkout={setSelectedWorkout} />}
        
        {activeTab === "Workouts" && (
          <WorkoutsSection 
            categories={categoriesWithActiveState}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            setSelectedWorkout={setSelectedWorkout}
          />
        )}
        
        {activeTab === "Fortschritt" && (
          <ProgressSection 
            timeRangeTab={timeRangeTab}
            setTimeRangeTab={setTimeRangeTab}
            setIsCalendarOpen={setIsCalendarOpen}
            currentProgress={currentProgress}
            setIsMetricsModalOpen={setIsMetricsModalOpen}
            AVAILABLE_METRICS={AVAILABLE_METRICS}
            selectedMetrics={selectedMetrics}
          />
        )}
      </div>
      
      {/* DRAWERS & MODALS */}
      <WorkoutDetailDrawer 
        workoutId={selectedWorkout} 
        onClose={() => setSelectedWorkout(null)} 
      />

      <DateRangeModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        onApply={() => { setTimeRangeTab("Individuell"); setIsCalendarOpen(false); }}
      />

      <MetricsModal 
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        metrics={AVAILABLE_METRICS}
        selectedMetrics={selectedMetrics}
        setSelectedMetrics={setSelectedMetrics}
      />
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={setIsProfileOpen}
      />
      
    </div>
  );
}
