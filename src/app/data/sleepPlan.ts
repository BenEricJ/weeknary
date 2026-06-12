import type { ISODateString } from "../../domain";
import { getCurrentWeekContext } from "../currentWeekPlanData";
import { getDateParts, parseIsoDate } from "../dateDisplay";

export type SleepPhaseKey = "deep" | "rem" | "light" | "awake";
export type SleepInsightTone = "good" | "warning";

export interface SleepPhaseSummary {
  key: SleepPhaseKey;
  label: string;
  durationMinutes: number;
  percent: number;
  deltaMinutes: number;
}

export interface SleepPhaseSegment {
  phase: SleepPhaseKey;
  durationMinutes: number;
}

export interface SleepWindow {
  recommendation: string;
  targetDurationMinutes: number;
  bedTime: string;
  wakeTime: string;
  reminderTime: string;
  reminderLeadMinutes: number;
}

export interface WindDownTask {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: "coffee" | "meal" | "leaf" | "temperature" | "book";
  completed: boolean;
}

export interface SleepInsight {
  title: string;
  description: string;
  tone: SleepInsightTone;
}

export interface SleepNote {
  tags: string[];
  text: string;
}

export interface SleepTrendMetric {
  id: "score" | "bedtime" | "efficiency";
  label: string;
  value: string;
  delta: string;
  points: number[];
  tone: SleepInsightTone;
}

export interface SleepEntry {
  isoDate: ISODateString;
  dayShort: string;
  dayLabel: string;
  date: number;
  monthLabel: string;
  durationMinutes: number;
  score: number;
  scoreDelta: number;
  efficiencyPercent: number;
  efficiencyDelta: number;
  hrvMs: number;
  bedTime: string;
  wakeTime: string;
  awakenings: number;
  phases: SleepPhaseSummary[];
  phaseSegments: SleepPhaseSegment[];
  window: SleepWindow;
  windDownTasks: WindDownTask[];
  insights: SleepInsight[];
  note: SleepNote;
}

export interface SleepWeekSummary {
  averageDurationMinutes: number;
  averageScore: number;
  averageEfficiencyPercent: number;
  bestNightDurationMinutes: number;
  targetHitCount: number;
  totalCount: number;
  phaseAverages: Record<SleepPhaseKey, number>;
}

export interface WeeklyPhaseBar {
  isoDate: ISODateString;
  dayShort: string;
  durationMinutes: number;
  phases: Record<SleepPhaseKey, number>;
  isTargetHit: boolean;
}

export const SLEEP_PHASE_META: Record<
  SleepPhaseKey,
  { label: string; color: string; softColor: string }
> = {
  deep: { label: "Tief", color: "#3F2E63", softColor: "#EFEAF7" },
  rem: { label: "REM", color: "#7563A0", softColor: "#F1ECF8" },
  light: { label: "Leicht", color: "#B8ADD7", softColor: "#F4F1FA" },
  awake: { label: "Wach", color: "#DDD7EF", softColor: "#F7F5FB" },
};

const TARGET_SLEEP_MINUTES = 450;

const WEEK_TEMPLATE = [
  {
    durationMinutes: 430,
    score: 76,
    scoreDelta: 1,
    efficiencyPercent: 89,
    efficiencyDelta: 1,
    hrvMs: 54,
    bedTime: "22:48",
    wakeTime: "06:04",
    awakenings: 2,
    phaseMinutes: { deep: 84, rem: 92, light: 238, awake: 16 },
  },
  {
    durationMinutes: 407,
    score: 74,
    scoreDelta: -1,
    efficiencyPercent: 88,
    efficiencyDelta: 0,
    hrvMs: 52,
    bedTime: "23:02",
    wakeTime: "06:01",
    awakenings: 2,
    phaseMinutes: { deep: 78, rem: 86, light: 229, awake: 14 },
  },
  {
    durationMinutes: 443,
    score: 84,
    scoreDelta: 4,
    efficiencyPercent: 92,
    efficiencyDelta: 2,
    hrvMs: 58,
    bedTime: "22:52",
    wakeTime: "06:15",
    awakenings: 1,
    phaseMinutes: { deep: 92, rem: 98, light: 243, awake: 10 },
  },
  {
    durationMinutes: 452,
    score: 81,
    scoreDelta: 2,
    efficiencyPercent: 91,
    efficiencyDelta: 1,
    hrvMs: 57,
    bedTime: "22:44",
    wakeTime: "06:16",
    awakenings: 1,
    phaseMinutes: { deep: 86, rem: 101, light: 250, awake: 15 },
  },
  {
    durationMinutes: 395,
    score: 70,
    scoreDelta: -4,
    efficiencyPercent: 86,
    efficiencyDelta: -2,
    hrvMs: 49,
    bedTime: "23:18",
    wakeTime: "06:08",
    awakenings: 3,
    phaseMinutes: { deep: 69, rem: 82, light: 228, awake: 16 },
  },
  {
    durationMinutes: 475,
    score: 86,
    scoreDelta: 5,
    efficiencyPercent: 93,
    efficiencyDelta: 2,
    hrvMs: 62,
    bedTime: "22:38",
    wakeTime: "06:33",
    awakenings: 1,
    phaseMinutes: { deep: 104, rem: 109, light: 250, awake: 12 },
  },
  {
    durationMinutes: 458,
    score: 80,
    scoreDelta: 1,
    efficiencyPercent: 90,
    efficiencyDelta: 1,
    hrvMs: 56,
    bedTime: "23:06",
    wakeTime: "06:44",
    awakenings: 2,
    phaseMinutes: { deep: 87, rem: 94, light: 262, awake: 15 },
  },
] as const;

export function getCurrentWeekSleepEntries(now = new Date()): SleepEntry[] {
  const currentWeek = getCurrentWeekContext(now);

  return currentWeek.days.map((day, index) => {
    const template = WEEK_TEMPLATE[index] ?? WEEK_TEMPLATE[0];
    const parts = getDateParts(day.date);

    return {
      ...template,
      isoDate: day.date,
      dayShort: parts.dayShort,
      dayLabel: parts.dayLabel,
      date: parts.date,
      monthLabel: parts.monthLabel,
      phases: buildPhaseSummaries(template.durationMinutes, template.phaseMinutes),
      phaseSegments: buildPhaseSegments(template.phaseMinutes),
      window: buildSleepWindow(template),
      windDownTasks: buildWindDownTasks(),
      insights: buildSleepInsights(index),
      note: {
        tags: ["Magnesium", "Lesen", "Kuehl"],
        text: "Vor dem Schlafen 20 min gelesen, Fenster gekippt. Aufwachen ohne Wecker um 06:09.",
      },
    };
  });
}

export function getSleepEntryByDate(
  entries: SleepEntry[],
  isoDate: ISODateString,
) {
  return entries.find((entry) => entry.isoDate === isoDate) ?? null;
}

export function getSleepEntriesInRange(
  entries: SleepEntry[],
  range: { startDate: ISODateString; endDate: ISODateString },
) {
  return entries.filter(
    (entry) => entry.isoDate >= range.startDate && entry.isoDate <= range.endDate,
  );
}

export function summarizeSleepWeek(entries: SleepEntry[]): SleepWeekSummary {
  if (entries.length === 0) {
    return {
      averageDurationMinutes: 0,
      averageScore: 0,
      averageEfficiencyPercent: 0,
      bestNightDurationMinutes: 0,
      targetHitCount: 0,
      totalCount: 0,
      phaseAverages: { deep: 0, rem: 0, light: 0, awake: 0 },
    };
  }

  const totals = entries.reduce(
    (sum, entry) => {
      const phaseMap = getPhaseMap(entry);

      return {
        durationMinutes: sum.durationMinutes + entry.durationMinutes,
        score: sum.score + entry.score,
        efficiencyPercent: sum.efficiencyPercent + entry.efficiencyPercent,
        deep: sum.deep + phaseMap.deep,
        rem: sum.rem + phaseMap.rem,
        light: sum.light + phaseMap.light,
        awake: sum.awake + phaseMap.awake,
      };
    },
    {
      durationMinutes: 0,
      score: 0,
      efficiencyPercent: 0,
      deep: 0,
      rem: 0,
      light: 0,
      awake: 0,
    },
  );

  return {
    averageDurationMinutes: Math.round(totals.durationMinutes / entries.length),
    averageScore: Math.round(totals.score / entries.length),
    averageEfficiencyPercent: Math.round(totals.efficiencyPercent / entries.length),
    bestNightDurationMinutes: Math.max(
      ...entries.map((entry) => entry.durationMinutes),
    ),
    targetHitCount: entries.filter(
      (entry) => entry.durationMinutes >= TARGET_SLEEP_MINUTES - 15,
    ).length,
    totalCount: entries.length,
    phaseAverages: {
      deep: Math.round(totals.deep / entries.length),
      rem: Math.round(totals.rem / entries.length),
      light: Math.round(totals.light / entries.length),
      awake: Math.round(totals.awake / entries.length),
    },
  };
}

export function buildWeeklyPhaseBars(entries: SleepEntry[]): WeeklyPhaseBar[] {
  return entries.map((entry) => ({
    isoDate: entry.isoDate,
    dayShort: entry.dayShort,
    durationMinutes: entry.durationMinutes,
    phases: getPhaseMap(entry),
    isTargetHit: entry.durationMinutes >= TARGET_SLEEP_MINUTES - 15,
  }));
}

export function buildSleepTrendMetrics(entry: SleepEntry): SleepTrendMetric[] {
  return [
    {
      id: "score",
      label: "Score",
      value: `${entry.score}`,
      delta: formatSigned(entry.scoreDelta),
      points: [64, 66, 69, 68, 72, 71, 75, 73, 78, 76, 80, 79, 82, 81, 84, 83, 86],
      tone: "good",
    },
    {
      id: "bedtime",
      label: "Bedtime-Konsistenz",
      value: "±18 m",
      delta: "-6 m",
      points: [82, 72, 74, 67, 70, 61, 65, 58, 62, 55, 60, 54, 56, 53, 55, 52, 54],
      tone: "good",
    },
    {
      id: "efficiency",
      label: "Effizienz",
      value: `${entry.efficiencyPercent}%`,
      delta: `${formatSigned(entry.efficiencyDelta)}%`,
      points: [62, 64, 60, 69, 66, 74, 70, 78, 75, 81, 77, 84, 80, 85, 82, 86, 84],
      tone: "warning",
    },
  ];
}

export function getWindDownCompletedCount(
  entry: SleepEntry,
  overrides: Record<string, boolean>,
) {
  return entry.windDownTasks.filter(
    (task) => overrides[task.id] ?? task.completed,
  ).length;
}

export function getPhaseMap(entry: SleepEntry): Record<SleepPhaseKey, number> {
  return entry.phases.reduce(
    (map, phase) => ({ ...map, [phase.key]: phase.durationMinutes }),
    { deep: 0, rem: 0, light: 0, awake: 0 },
  );
}

export function formatSleepDuration(totalMinutes: number, compact = false) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (compact) {
    return `${hours}h ${String(minutes).padStart(2, "0")}`;
  }

  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function formatClockDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")} h`;
}

export function getIsoDateAgeDays(isoDate: ISODateString, activeDate: ISODateString) {
  const active = parseIsoDate(activeDate).getTime();
  const target = parseIsoDate(isoDate).getTime();

  return Math.round((active - target) / (24 * 60 * 60 * 1000));
}

function buildPhaseSummaries(
  totalMinutes: number,
  phaseMinutes: Record<SleepPhaseKey, number>,
): SleepPhaseSummary[] {
  const deltas: Record<SleepPhaseKey, number> = {
    deep: 12,
    rem: 5,
    light: -4,
    awake: -6,
  };

  return (Object.keys(SLEEP_PHASE_META) as SleepPhaseKey[]).map((key) => ({
    key,
    label: SLEEP_PHASE_META[key].label,
    durationMinutes: phaseMinutes[key],
    percent: Math.round((phaseMinutes[key] / totalMinutes) * 100),
    deltaMinutes: deltas[key],
  }));
}

function buildPhaseSegments(
  phaseMinutes: Record<SleepPhaseKey, number>,
): SleepPhaseSegment[] {
  const segments: SleepPhaseSegment[] = [
    { phase: "awake", durationMinutes: 12 },
    { phase: "light", durationMinutes: 44 },
    { phase: "deep", durationMinutes: 76 },
    { phase: "rem", durationMinutes: 28 },
    { phase: "light", durationMinutes: 54 },
    { phase: "awake", durationMinutes: 6 },
    { phase: "deep", durationMinutes: 16 },
    { phase: "light", durationMinutes: 70 },
    { phase: "rem", durationMinutes: 40 },
    { phase: "light", durationMinutes: 45 },
    { phase: "deep", durationMinutes: Math.max(0, phaseMinutes.deep - 92) },
    { phase: "rem", durationMinutes: Math.max(0, phaseMinutes.rem - 68) },
  ];

  return segments.filter((segment) => segment.durationMinutes > 0);
}

function buildSleepWindow(template: (typeof WEEK_TEMPLATE)[number]): SleepWindow {
  return {
    recommendation: "Empfohlen fuer Trainingstag",
    targetDurationMinutes: 450,
    bedTime: template.bedTime <= "22:52" ? "22:45" : "23:00",
    wakeTime: template.wakeTime <= "06:15" ? "06:15" : template.wakeTime,
    reminderTime: "22:00",
    reminderLeadMinutes: 45,
  };
}

function buildWindDownTasks(): WindDownTask[] {
  return [
    {
      id: "coffee",
      title: "Letztes Koffein",
      description: "Espresso 13:40 · vor 14 Uhr",
      time: "13:40",
      icon: "coffee",
      completed: true,
    },
    {
      id: "meal",
      title: "Letzte Mahlzeit",
      description: "Tofu-Pfanne · 3 h vor Bett",
      time: "19:30",
      icon: "meal",
      completed: true,
    },
    {
      id: "wind-down",
      title: "Wind-Down",
      description: "Ab 22:00 · Bildschirme dimmen",
      time: "22:00",
      icon: "leaf",
      completed: false,
    },
    {
      id: "temperature",
      title: "Raumtemperatur",
      description: "Ziel 18 °C · aktuell 19 °C",
      time: "22:15",
      icon: "temperature",
      completed: false,
    },
    {
      id: "reading",
      title: "Lesen statt Bildschirm",
      description: "10 min vor dem Schlafengehen",
      time: "22:35",
      icon: "book",
      completed: false,
    },
  ];
}

function buildSleepInsights(index: number): SleepInsight[] {
  return [
    {
      title: "Training hilft dir",
      description:
        "Nach Sport-Tagen schlaefst du im Schnitt +18 min laenger und mit +5 % Tiefschlaf.",
      tone: "good",
    },
    {
      title: index === 6 ? "Sonntag-Effekt" : "Spaeter Abend",
      description:
        index === 6
          ? "Sonntags gehst du im Mittel 28 min spaeter ins Bett. Nimm dir abends bewusst Ruhe."
          : "Spaete Bildschirmzeit verschiebt deine Einschlafzeit im Wochenvergleich.",
      tone: "warning",
    },
  ];
}

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}
