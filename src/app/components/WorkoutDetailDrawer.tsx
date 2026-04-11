import React, { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import {
  Activity,
  Apple,
  Bike,
  Calendar,
  CheckSquare,
  ChevronLeft,
  Clock,
  Droplet,
  Dumbbell,
  Flower,
  Heart,
  Info,
  Map as MapIcon,
  MoreHorizontal,
  Play,
  RefreshCw,
  Share,
  Square,
  Target,
  Zap,
} from "lucide-react";

export type SportType =
  | "Laufen"
  | "Radfahren"
  | "Krafttraining"
  | "Mobilität"
  | "Yoga";

export interface WorkoutData {
  id: string;
  sport: SportType;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  icon: any;
  statsBar: { icon: any; val: string }[];
  goal: { title: string; intensity: string; level: number; loadType: string; loadVal: string };
  steps: { name: string; dur: string; int: string; target: string; color: string; isMain?: boolean }[];
  recs: { icon: any; title: string; desc: string; color: string }[];
  checklist: { id: string; label: string }[];
  tags: string[];
}

const bikeImg =
  "https://images.unsplash.com/photo-1710170600723-9095d7d3a480?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FkJTIwY3ljbGlzdCUyMG1vdW50YWluJTIwcm9hZCUyMHJlbGF4aW5nfGVufDF8fHx8MTc3NTM3NTg5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const gymImg =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW18ZW58MXx8fHwxNzc1MzgyMTAxfDA&ixlib=rb-4.1.0&q=80&w=1080";
const runImg =
  "https://images.unsplash.com/photo-1552674605-15c2145fb94c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwaW50ZXJ2YWxzfGVufDF8fHx8MTc3NTM4MzAwMHww&ixlib=rb-4.1.0&q=80&w=1080";
const yogaImg =
  "https://images.unsplash.com/photo-1599901860904-17e08c3d3170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhfGVufDF8fHx8MTc3NTM4MzI1MHww&ixlib=rb-4.1.0&q=80&w=1080";
const mobilityImg =
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGl0eSUyMGZsb3d8ZW58MXx8fHwxNzc1MzgyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080";

export const WORKOUT_DATA: Record<string, WorkoutData> = {
  endurance: {
    id: "endurance",
    sport: "Radfahren",
    title: "Zwift Grundlage",
    subtitle: "60 Min • locker aerob",
    desc: "Ruhige Grundlageneinheit auf Zwift fuer stabile Zone-2-Arbeit.",
    image: bikeImg,
    icon: Bike,
    statsBar: [{ icon: Clock, val: "60 Min" }, { icon: Heart, val: "138 bpm" }, { icon: Zap, val: "185 Watt" }, { icon: Info, val: "520 kcal" }],
    goal: { title: "Aerobe Basis stabilisieren", intensity: "Einfach", level: 1, loadType: "Belastung", loadVal: "55 TL" },
    steps: [
      { name: "Einrollen", dur: "10 Min", int: "Locker", target: "< Zone 2", color: "bg-[#3B82F6]" },
      { name: "Hauptteil", dur: "40 Min", int: "Zone 2", target: "130-145 bpm", color: "bg-[#6A816A]", isMain: true },
      { name: "Ausrollen", dur: "10 Min", int: "Sehr locker", target: "< Zone 1", color: "bg-[#9CA3AF]" },
    ],
    recs: [
      { icon: Apple, title: "Snack", desc: "Optional kleiner Carb-Snack vor dem Start", color: "text-[#3B82F6]" },
      { icon: Droplet, title: "Hydration", desc: "500-750 ml ueber die Einheit", color: "text-[#3B82F6]" },
      { icon: RefreshCw, title: "Kadenz", desc: "85-95 U/min konstant", color: "text-[#6A816A]" },
    ],
    checklist: [{ id: "c1", label: "Zwift-Setup verbunden" }, { id: "c2", label: "Bidon bereitgestellt" }, { id: "c3", label: "Snack geprueft" }],
    tags: ["Zwift", "Grundlage", "Zone 2"],
  },
  "zwift-strength": {
    id: "zwift-strength",
    sport: "Radfahren",
    title: "Zwift Strength",
    subtitle: "90 Min • Kraftausdauer",
    desc: "Zwift-Einheit mit laengeren Drueckphasen und kontrollierten Erholungen.",
    image: bikeImg,
    icon: Bike,
    statsBar: [{ icon: Clock, val: "90 Min" }, { icon: Heart, val: "148 bpm" }, { icon: Zap, val: "225 Watt" }, { icon: Info, val: "780 kcal" }],
    goal: { title: "Kraftausdauer entwickeln", intensity: "Mittel", level: 3, loadType: "Belastung", loadVal: "88 TL" },
    steps: [
      { name: "Warm-up", dur: "15 Min", int: "Locker", target: "< 140 bpm", color: "bg-[#3B82F6]" },
      { name: "Strength Blocks", dur: "4 x 10 Min", int: "Sweet Spot", target: "220-240 Watt", color: "bg-[#6A816A]", isMain: true },
      { name: "Recovery", dur: "4 x 5 Min", int: "Locker", target: "< 135 bpm", color: "bg-[#3B82F6]" },
      { name: "Cool-down", dur: "15 Min", int: "Sehr locker", target: "< Zone 1", color: "bg-[#9CA3AF]" },
    ],
    recs: [
      { icon: Apple, title: "Fueling", desc: "30-45 g Carbs pro Stunde", color: "text-[#3B82F6]" },
      { icon: RefreshCw, title: "Tritt", desc: "Kadenz etwas niedriger halten", color: "text-[#6A816A]" },
    ],
    checklist: [{ id: "zs1", label: "Luefter und Handtuch bereit" }, { id: "zs2", label: "Intervallmodus geprueft" }, { id: "zs3", label: "Trinkflasche gefuellt" }],
    tags: ["Zwift", "Strength", "Kraftausdauer"],
  },
  "zwift-tempo": {
    id: "zwift-tempo",
    sport: "Radfahren",
    title: "Zwift Tempo",
    subtitle: "90 Min • Tempoaufbau",
    desc: "Tempo-Session mit hohem Aerob-Anteil und stabilem Druck.",
    image: bikeImg,
    icon: Bike,
    statsBar: [{ icon: Clock, val: "90 Min" }, { icon: Heart, val: "154 bpm" }, { icon: Zap, val: "235 Watt" }, { icon: Info, val: "820 kcal" }],
    goal: { title: "Tempohärte verbessern", intensity: "Mittel-Hoch", level: 4, loadType: "Belastung", loadVal: "92 TL" },
    steps: [
      { name: "Warm-up", dur: "15 Min", int: "Locker", target: "< 140 bpm", color: "bg-[#3B82F6]" },
      { name: "Tempo Blocks", dur: "3 x 15 Min", int: "Tempo", target: "230-245 Watt", color: "bg-[#F97316]", isMain: true },
      { name: "Locker rollen", dur: "3 x 5 Min", int: "Locker", target: "< 135 bpm", color: "bg-[#3B82F6]" },
      { name: "Cool-down", dur: "15 Min", int: "Sehr locker", target: "< Zone 1", color: "bg-[#9CA3AF]" },
    ],
    recs: [
      { icon: Apple, title: "Carbs", desc: "Vorher und waehrenddessen Carbs priorisieren", color: "text-[#F97316]" },
      { icon: Droplet, title: "Hydration", desc: "600-800 ml pro Stunde", color: "text-[#3B82F6]" },
    ],
    checklist: [{ id: "zt1", label: "Pre-Ride Snack eingeplant" }, { id: "zt2", label: "Workout geladen" }, { id: "zt3", label: "Recovery-Drink vorbereitet" }],
    tags: ["Zwift", "Tempo", "Carbs"],
  },
  kraft: {
    id: "kraft",
    sport: "Krafttraining",
    title: "Krafttraining",
    subtitle: "60 Min • Ganzkoerper",
    desc: "Mittagsblock mit Grunduebungen und sauberer Technik.",
    image: gymImg,
    icon: Dumbbell,
    statsBar: [{ icon: Clock, val: "60 Min" }, { icon: Activity, val: "118 bpm" }, { icon: Dumbbell, val: "3.8 t" }, { icon: Info, val: "420 kcal" }],
    goal: { title: "Stabilitaet und Kraft", intensity: "Mittel", level: 3, loadType: "Volumen", loadVal: "14 Saetze" },
    steps: [
      { name: "Kniebeuge", dur: "4 x 6", int: "Schwer", target: "80 kg", color: "bg-[#5C85A8]" },
      { name: "Bankdruecken", dur: "4 x 8", int: "Mittel", target: "60 kg", color: "bg-[#5C85A8]", isMain: true },
      { name: "Rudern", dur: "3 x 10", int: "Mittel", target: "50 kg", color: "bg-[#5C85A8]" },
      { name: "Rumpfblock", dur: "10 Min", int: "Kontrolle", target: "Core", color: "bg-[#9CA3AF]" },
    ],
    recs: [
      { icon: Target, title: "Fokus", desc: "Saubere Technik vor Zusatzlast", color: "text-[#5C85A8]" },
      { icon: Droplet, title: "Hydration", desc: "Zwischen Saetzen bewusst trinken", color: "text-[#3B82F6]" },
    ],
    checklist: [{ id: "k1", label: "Aufwaermen nicht vergessen" }, { id: "k2", label: "Trinkflasche bereit" }, { id: "k3", label: "Kurz ausdehnen" }],
    tags: ["Kraft", "Ganzkoerper", "Mittagsblock"],
  },
  laufen: {
    id: "laufen",
    sport: "Laufen",
    title: "Lauftraining MIT/LOW",
    subtitle: "60 Min • moderat oder locker",
    desc: "Mittagslauf mit flexiblem Intensitaetsfenster je nach Tagesform.",
    image: runImg,
    icon: Activity,
    statsBar: [{ icon: Clock, val: "60 Min" }, { icon: MapIcon, val: "9.5 km" }, { icon: Heart, val: "146 bpm" }, { icon: Info, val: "560 kcal" }],
    goal: { title: "Laufumfang solide halten", intensity: "Leicht-Mittel", level: 2, loadType: "Belastung", loadVal: "62 TL" },
    steps: [
      { name: "Einlaufen", dur: "10 Min", int: "Locker", target: "< 120 bpm", color: "bg-[#3B82F6]" },
      { name: "Hauptteil", dur: "35 Min", int: "MIT/LOW", target: "140-155 bpm", color: "bg-[#6A816A]", isMain: true },
      { name: "Technikfokus", dur: "5 Min", int: "Locker", target: "Schrittfrequenz", color: "bg-[#F97316]" },
      { name: "Auslaufen", dur: "10 Min", int: "Locker", target: "< 120 bpm", color: "bg-[#3B82F6]" },
    ],
    recs: [{ icon: Activity, title: "Pacing", desc: "Tempo gleichmaessig halten", color: "text-[#6A816A]" }],
    checklist: [{ id: "l1", label: "Laufschuhe pruefen" }, { id: "l2", label: "Warm-up Routine" }],
    tags: ["Laufen", "MIT/LOW", "Lunch Run"],
  },
  "long-ride": {
    id: "long-ride",
    sport: "Radfahren",
    title: "Long Ride",
    subtitle: "180 Min • langer Grundlagenblock",
    desc: "Laengere Sonntagsausfahrt mit Fueling-Fokus und gleichmaessigem Druck.",
    image: bikeImg,
    icon: Bike,
    statsBar: [{ icon: Clock, val: "180 Min" }, { icon: MapIcon, val: "75 km" }, { icon: Heart, val: "142 bpm" }, { icon: Info, val: "1450 kcal" }],
    goal: { title: "Ausdauer und Verpflegung trainieren", intensity: "Mittel", level: 3, loadType: "Belastung", loadVal: "130 TL" },
    steps: [
      { name: "Einrollen", dur: "20 Min", int: "Locker", target: "< Zone 2", color: "bg-[#3B82F6]" },
      { name: "Main Ride", dur: "140 Min", int: "Zone 2", target: "135-150 bpm", color: "bg-[#6A816A]", isMain: true },
      { name: "Ausrollen", dur: "20 Min", int: "Sehr locker", target: "< Zone 1", color: "bg-[#9CA3AF]" },
    ],
    recs: [
      { icon: Apple, title: "Fueling", desc: "60-75 g Carbs pro Stunde", color: "text-[#F97316]" },
      { icon: Droplet, title: "Hydration", desc: "Mindestens 1 grosse Flasche pro Stunde", color: "text-[#3B82F6]" },
      { icon: RefreshCw, title: "Recovery", desc: "Danach Recovery-Bowl oder Shake", color: "text-[#6A816A]" },
    ],
    checklist: [{ id: "lr1", label: "Gels oder Riegel eingepackt" }, { id: "lr2", label: "Route und Wetter gecheckt" }, { id: "lr3", label: "Recovery-Mahlzeit vorbereitet" }],
    tags: ["Long Ride", "Fueling", "Sonntag"],
  },
  yoga: {
    id: "yoga",
    sport: "Yoga",
    title: "Yoga Reset",
    subtitle: "30 Min • Regeneration",
    desc: "Sanfter Yoga-Block fuer Atmung, Beweglichkeit und Parasympathikus.",
    image: yogaImg,
    icon: Flower,
    statsBar: [{ icon: Clock, val: "30 Min" }, { icon: Heart, val: "92 bpm" }, { icon: Info, val: "110 kcal" }],
    goal: { title: "Regeneration & Fokus", intensity: "Leicht", level: 1, loadType: "Fokus", loadVal: "Atmung" },
    steps: [
      { name: "Ankommen", dur: "5 Min", int: "Atmung", target: "Fokus", color: "bg-[#849C66]" },
      { name: "Flow", dur: "15 Min", int: "Mobilisation", target: "Bewegung", color: "bg-[#849C66]", isMain: true },
      { name: "Haltungen", dur: "7 Min", int: "Dehnung", target: "Halten", color: "bg-[#849C66]" },
      { name: "Entspannung", dur: "3 Min", int: "Ruhe", target: "Reset", color: "bg-[#9CA3AF]" },
    ],
    recs: [{ icon: Flower, title: "Atmung", desc: "Tief und gleichmaessig atmen", color: "text-[#849C66]" }],
    checklist: [{ id: "y1", label: "Matte ausrollen" }, { id: "y2", label: "Stoerfaktoren beseitigen" }],
    tags: ["Yoga", "Recovery", "Reset"],
  },
  "mobility-flow": {
    id: "mobility-flow",
    sport: "Mobilität",
    title: "Mobility Flow",
    subtitle: "20 Min • Recovery",
    desc: "Kurzer Beweglichkeitsblock fuer Huefte, Ruecken und Schultern.",
    image: mobilityImg,
    icon: Activity,
    statsBar: [{ icon: Clock, val: "20 Min" }, { icon: Heart, val: "90 bpm" }, { icon: Info, val: "90 kcal" }],
    goal: { title: "Spannung loesen", intensity: "Leicht", level: 1, loadType: "Fokus", loadVal: "Mobilitaet" },
    steps: [
      { name: "Spine Flow", dur: "5 Min", int: "Mobilisieren", target: "Ruecken", color: "bg-[#849C66]" },
      { name: "Hip Openers", dur: "8 Min", int: "Flow", target: "Huefte", color: "bg-[#6A816A]", isMain: true },
      { name: "Shoulder Reset", dur: "4 Min", int: "Locker", target: "Schultern", color: "bg-[#849C66]" },
      { name: "Breathing Reset", dur: "3 Min", int: "Ruhig", target: "Atmung", color: "bg-[#9CA3AF]" },
    ],
    recs: [{ icon: Flower, title: "Recovery", desc: "Nach harten Tagen bewusst ruhig bleiben", color: "text-[#849C66]" }],
    checklist: [{ id: "m1", label: "Matte bereitlegen" }, { id: "m2", label: "Enge Bereiche notieren" }],
    tags: ["Mobilitaet", "Flow", "Recovery"],
  },
};

interface Props {
  workoutId: string | null;
  onClose: () => void;
}

export function WorkoutDetailDrawer({ workoutId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("Ueberblick");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!workoutId) return;
    setActiveTab("Ueberblick");
    setCheckedItems({});
  }, [workoutId]);

  const workout = workoutId ? WORKOUT_DATA[workoutId] : null;
  const mainStep = useMemo(() => workout?.steps.find((step) => step.isMain) ?? workout?.steps[0], [workout]);
  if (!workout) return null;

  const Icon = workout.icon;

  return (
    <Drawer.Root open={!!workoutId} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-[95vh] max-w-[390px] flex-col overflow-hidden rounded-t-[24px] bg-[#F5F4EF] outline-none">
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <Drawer.Close asChild>
              <button aria-label="Zurueck" className="p-1 text-gray-900"><ChevronLeft size={24} /></button>
            </Drawer.Close>
            <h2 className="text-[16px] font-bold text-gray-900">Workout</h2>
            <div className="mr-1 flex items-center gap-4 text-gray-900"><Share size={20} strokeWidth={2} /><MoreHorizontal size={24} /></div>
          </div>

          <div className="relative flex-1 overflow-y-auto pb-4">
            <div className="relative">
              <div className="h-[240px] w-full">
                <img src={workout.image} alt={workout.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div className="absolute left-4 top-4 flex gap-2">
                <span className="flex items-center gap-1 rounded-[6px] bg-[#6A816A]/90 px-2 py-1 text-[10px] font-bold text-white"><Icon size={12} /> {workout.sport}</span>
              </div>
              <div className="absolute right-4 top-4">
                <span className="flex items-center gap-1 rounded-[6px] border border-white/30 bg-white/20 px-2 py-1 text-[10px] font-bold text-white"><Calendar size={12} /> Geplant</span>
              </div>
              <div className="absolute bottom-[44px] left-4 right-4 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <Drawer.Title className="mb-1 text-[24px] font-bold leading-tight">{workout.title}</Drawer.Title>
                    <Drawer.Description className="mb-1.5 text-[13px] font-medium text-white/90">{workout.subtitle}</Drawer.Description>
                    <p className="max-w-[240px] text-[12px] leading-snug text-white/80">{workout.desc}</p>
                  </div>
                  <button aria-label="Training starten" className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/20 bg-[#6A816A]/90">
                    <Play size={18} className="ml-1 fill-white text-white" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/60 px-5 py-3 text-white">
                {workout.statsBar.map((stat) => (
                  <span key={`${workout.id}-${stat.val}`} className="flex items-center gap-1.5 text-[12px] font-medium">
                    <stat.icon size={14} className="text-gray-300" />
                    {stat.val}
                  </span>
                ))}
              </div>
            </div>

            <div className="sticky top-0 z-10 flex justify-between border-b border-[#EBEAE4] bg-white px-2 pt-1 shadow-sm">
              {["Ueberblick", "Details", "Notizen"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-[12.5px] ${activeTab === tab ? "border-b-[2.5px] border-[#6A816A] font-bold text-[#6A816A]" : "font-medium text-gray-500"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-5 p-5">
              {activeTab === "Ueberblick" && (
                <>
                  <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <Target size={14} className="text-[#6A816A]" />
                      Ziel & Fokus
                    </div>
                    <p className="text-[14px] font-bold text-gray-900">{workout.goal.title}</p>
                    <p className="mt-1 text-[12px] text-gray-600">{mainStep ? `${mainStep.int} • ${mainStep.target}` : `${workout.goal.loadType}: ${workout.goal.loadVal}`}</p>
                  </section>

                  <section className="grid grid-cols-2 gap-3">
                    {workout.statsBar.map((stat) => (
                      <div key={`${workout.id}-${stat.val}-card`} className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-500"><stat.icon size={14} /><span className="text-[10px] font-medium uppercase tracking-wide">{labelForStat(stat.val)}</span></div>
                        <p className="text-[14px] font-bold text-gray-900">{stat.val}</p>
                      </div>
                    ))}
                  </section>

                  <section className="rounded-[16px] border border-[#EBEAE4] bg-white overflow-hidden">
                    {workout.steps.map((step, index) => (
                      <div key={`${workout.id}-${step.name}`} className={`grid grid-cols-[1fr_auto] gap-3 px-4 py-4 ${index !== workout.steps.length - 1 ? "border-b border-[#EBEAE4]" : ""} ${step.isMain ? "bg-[#F5F4EF]" : ""}`}>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${step.color}`} />
                            <span className="text-[13px] font-bold text-gray-900">{step.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-500">{step.int} • {step.target}</p>
                        </div>
                        <span className="text-[12px] font-medium text-gray-700">{step.dur}</span>
                      </div>
                    ))}
                  </section>

                  <div className="grid grid-cols-[1fr_1.05fr] gap-4">
                    <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-900">Empfehlungen</h3>
                      <div className="space-y-3">
                        {workout.recs.map((rec) => (
                          <div key={`${workout.id}-${rec.title}`} className="flex gap-2">
                            <rec.icon size={16} className={`${rec.color} mt-0.5 shrink-0`} />
                            <div>
                              <p className="text-[11px] font-bold text-gray-900">{rec.title}</p>
                              <p className="text-[10px] leading-tight text-gray-500">{rec.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-900">Checkliste</h3>
                      <div className="space-y-2.5">
                        {workout.checklist.map((item) => (
                          <label
                            key={item.id}
                            className="flex cursor-pointer items-start gap-2"
                            onClick={(event) => {
                              event.preventDefault();
                              setCheckedItems((previous) => ({ ...previous, [item.id]: !previous[item.id] }));
                            }}
                          >
                            {checkedItems[item.id] ? <CheckSquare size={14} className="mt-0.5 shrink-0 text-[#6A816A]" /> : <Square size={14} className="mt-0.5 shrink-0 text-gray-300" />}
                            <span className={`text-[11px] font-medium leading-tight ${checkedItems[item.id] ? "text-gray-400 line-through" : "text-gray-700"}`}>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}

              {activeTab === "Details" && (
                <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-900">Detaillierte Infos</h3>
                  <div className="space-y-3">
                    <DetailRow icon={Icon} label="Sportart" value={workout.sport} />
                    <DetailRow icon={Target} label="Trainingsart" value={workout.title} />
                    <DetailRow icon={Activity} label="Schwierigkeit" value={workout.goal.intensity} />
                    <DetailRow icon={Info} label={workout.goal.loadType} value={workout.goal.loadVal} />
                    {mainStep ? <DetailRow icon={Clock} label="Hauptblock" value={`${mainStep.dur} • ${mainStep.target}`} /> : null}
                  </div>
                </section>
              )}

              {activeTab === "Notizen" && (
                <>
                  <section>
                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-900">Deine Notizen</h3>
                    <textarea
                      className="h-[120px] w-full resize-none rounded-[16px] border border-[#EBEAE4] bg-white p-4 text-[13px] text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#6A816A]"
                      placeholder="Wie hat sich die Einheit angefuehlt? Was lief gut, was willst du anpassen?"
                    />
                  </section>
                  <section>
                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-900">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {workout.tags.map((tag) => (
                        <span key={`${workout.id}-${tag}`} className="rounded-[8px] bg-white px-3 py-1.5 text-[12px] font-medium text-gray-700 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_1.3fr] gap-3 border-t border-[#EBEAE4] bg-white px-4 pb-6 pt-3">
            <button className="flex items-center justify-center gap-2 rounded-[12px] border border-[#EBEAE4] bg-[#F5F4EF] py-3.5 text-[13px] font-bold text-gray-800">
              <Calendar size={16} className="text-gray-500" />
              Kalender
            </button>
            <button className="flex items-center justify-center gap-2 rounded-[12px] bg-[#6A816A] py-3.5 text-[13px] font-bold text-white">
              <Play size={16} className="fill-white" />
              Starten
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-[13px] font-medium text-gray-600"><Icon size={16} />{label}</span>
      <span className="text-[13px] font-bold text-gray-900">{value}</span>
    </div>
  );
}

function labelForStat(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("min") || lower.includes(" h")) return "Dauer";
  if (lower.includes("km")) return "Distanz";
  if (lower.includes("bpm")) return "HF";
  if (lower.includes("watt")) return "Power";
  if (lower.includes("kcal")) return "Energie";
  if (lower.includes("t")) return "Volumen";
  return "Wert";
}
