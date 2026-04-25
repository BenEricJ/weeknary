import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Apple,
  BriefcaseBusiness,
  HandHeart,
  HeartPulse,
  NotebookPen,
  Route,
  Sparkles,
  Users,
} from "lucide-react";

export type CategoryKey =
  | "arbeit"
  | "training"
  | "nutrition"
  | "sozial"
  | "erholung"
  | "orga"
  | "mobilitaet"
  | "lernen"
  | "ehrenamt";

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  start: string;
  end: string;
  category: CategoryKey;
  workoutId?: string;
  subtasks?: string[];
}

export type AllDayEventItem = Omit<EventItem, "start" | "end" | "subtitle">;

export interface DayPlan {
  dayKey?: string;
  dayShort: string;
  dayLabel: string;
  date: number;
  monthLabel: string;
  allDayEvents: AllDayEventItem[];
  events: EventItem[];
}

export type ScheduleEntry = EventItem | AllDayEventItem;

const WEEK_YEAR = 2026;
const MONTH_INDEX_BY_LABEL: Record<string, number> = {
  April: 3,
};

export const CATEGORY_META: Record<
  CategoryKey,
  {
    label: string;
    icon: LucideIcon;
    iconClassName: string;
    badgeClassName: string;
    surfaceClassName: string;
    borderClassName: string;
    barClassName: string;
  }
> = {
  arbeit: {
    label: "Arbeit",
    icon: BriefcaseBusiness,
    iconClassName: "text-[#5B6E91]",
    badgeClassName: "bg-[#E8EDF5] text-[#5B6E91]",
    surfaceClassName: "bg-[#F4F7FB]",
    borderClassName: "border-[#DEE6F1]",
    barClassName: "bg-[#5B6E91]",
  },
  training: {
    label: "Training",
    icon: Activity,
    iconClassName: "text-[#5B88A5]",
    badgeClassName: "bg-[#E6EFF5] text-[#5B88A5]",
    surfaceClassName: "bg-[#F3F8FB]",
    borderClassName: "border-[#D9E8F1]",
    barClassName: "bg-[#5B88A5]",
  },
  nutrition: {
    label: "Ernaehrung",
    icon: Apple,
    iconClassName: "text-[#A56A2A]",
    badgeClassName: "bg-[#F8F1E6] text-[#A56A2A]",
    surfaceClassName: "bg-[#FCF7F0]",
    borderClassName: "border-[#F0E1CB]",
    barClassName: "bg-[#A56A2A]",
  },
  sozial: {
    label: "Sozial",
    icon: Users,
    iconClassName: "text-[#B06A45]",
    badgeClassName: "bg-[#F8ECE3] text-[#B06A45]",
    surfaceClassName: "bg-[#FCF6F1]",
    borderClassName: "border-[#F0DED2]",
    barClassName: "bg-[#B06A45]",
  },
  erholung: {
    label: "Erholung",
    icon: HeartPulse,
    iconClassName: "text-[#8B5C7E]",
    badgeClassName: "bg-[#F3EAF1] text-[#8B5C7E]",
    surfaceClassName: "bg-[#FBF5FA]",
    borderClassName: "border-[#EADDEA]",
    barClassName: "bg-[#8B5C7E]",
  },
  orga: {
    label: "Orga",
    icon: Sparkles,
    iconClassName: "text-[#6B7F4B]",
    badgeClassName: "bg-[#EBF0E3] text-[#6B7F4B]",
    surfaceClassName: "bg-[#F6F8F1]",
    borderClassName: "border-[#E2E7D8]",
    barClassName: "bg-[#6B7F4B]",
  },
  mobilitaet: {
    label: "MobilitÃ¤t",
    icon: Route,
    iconClassName: "text-[#3D7C74]",
    badgeClassName: "bg-[#E2F1EE] text-[#3D7C74]",
    surfaceClassName: "bg-[#F1FAF8]",
    borderClassName: "border-[#D6ECE7]",
    barClassName: "bg-[#3D7C74]",
  },
  lernen: {
    label: "Lernen",
    icon: NotebookPen,
    iconClassName: "text-[#7A5FA3]",
    badgeClassName: "bg-[#ECE7F6] text-[#7A5FA3]",
    surfaceClassName: "bg-[#F7F4FB]",
    borderClassName: "border-[#E5DDF4]",
    barClassName: "bg-[#7A5FA3]",
  },
  ehrenamt: {
    label: "Ehrenamt",
    icon: HandHeart,
    iconClassName: "text-[#A55C5C]",
    badgeClassName: "bg-[#F6E8E8] text-[#A55C5C]",
    surfaceClassName: "bg-[#FCF5F5]",
    borderClassName: "border-[#EFDCDC]",
    barClassName: "bg-[#A55C5C]",
  },
};

export const WEEK_PLAN: DayPlan[] = [
  {
    dayShort: "MO",
    dayLabel: "Montag",
    date: 6,
    monthLabel: "April",
    allDayEvents: [
      {
        id: "mo-ad-1",
        title: "Carmen in Halbe",
        category: "sozial",
      },
    ],
    events: [
      {
        id: "mo-1",
        title: "Zwift Grundlage",
        subtitle: "FrÃ¼he Foundation-Einheit",
        start: "06:30",
        end: "07:30",
        category: "training",
        workoutId: "endurance",
      },
      {
        id: "mo-2",
        title: "Arbeiten",
        subtitle: "Arbeitsblock am Vormittag",
        start: "08:00",
        end: "12:00",
        category: "arbeit",
      },
      {
        id: "mo-3",
        title: "Krafttraining",
        subtitle: "Ganzkoerper-Mittagsblock",
        start: "12:00",
        end: "13:00",
        category: "training",
        workoutId: "kraft",
      },
      {
        id: "mo-4",
        title: "Arbeiten",
        subtitle: "Arbeitsblock am Nachmittag",
        start: "13:00",
        end: "15:00",
        category: "arbeit",
      },
      {
        id: "mo-5",
        title: "Keymaster RÃ¼ckenwind",
        subtitle: "LauenstraÃŸe 3, NeukÃ¶lln",
        start: "15:00",
        end: "20:00",
        category: "ehrenamt",
        subtasks: ["Gruppenfoto machen", "Montagspost erstellen"],
      },
      {
        id: "mo-6",
        title: "Heimweg",
        subtitle: "RÃ¼ckfahrt am Abend",
        start: "21:45",
        end: "22:15",
        category: "mobilitaet",
      },
      {
        id: "mo-7",
        title: "Lesen",
        subtitle: "Tagesabschluss ohne Bildschirm",
        start: "22:15",
        end: "23:00",
        category: "erholung",
      },
    ],
  },
  {
    dayShort: "DI",
    dayLabel: "Dienstag",
    date: 7,
    monthLabel: "April",
    allDayEvents: [
      {
        id: "di-ad-1",
        title: "Carmen in Halbe",
        category: "sozial",
      },
    ],
    events: [
      {
        id: "di-1",
        title: "Zwift Strength",
        subtitle: "Kraftausdauer auf Zwift",
        start: "06:30",
        end: "08:00",
        category: "training",
        workoutId: "zwift-strength",
      },
      {
        id: "di-2",
        title: "Arbeiten",
        subtitle: "Arbeitsblock am Vormittag",
        start: "08:00",
        end: "12:00",
        category: "arbeit",
      },
      {
        id: "di-3",
        title: "Lauftraining MIT/LOW",
        subtitle: "Moderater oder lockerer Lunch Run",
        start: "12:00",
        end: "13:00",
        category: "training",
        workoutId: "laufen",
      },
      {
        id: "di-4",
        title: "Arbeiten",
        subtitle: "Arbeitsblock am Nachmittag",
        start: "13:00",
        end: "17:00",
        category: "arbeit",
      },
      {
        id: "di-5",
        title: "Kochabend",
        subtitle: "Libauer StraÃŸe 3, Friedrichshain",
        start: "17:00",
        end: "21:00",
        category: "sozial",
      },
      {
        id: "di-6",
        title: "Heimweg",
        subtitle: "RÃ¼ckfahrt am Abend",
        start: "21:45",
        end: "22:15",
        category: "mobilitaet",
      },
      {
        id: "di-7",
        title: "Lesen",
        subtitle: "Ruhiger Abschluss",
        start: "22:15",
        end: "23:00",
        category: "erholung",
      },
    ],
  },
  {
    dayShort: "MI",
    dayLabel: "Mittwoch",
    date: 8,
    monthLabel: "April",
    allDayEvents: [
      {
        id: "mi-ad-1",
        title: "Carmen in Halbe",
        category: "sozial",
      },
    ],
    events: [
      {
        id: "mi-1",
        title: "Zwift Grundlage",
        subtitle: "Ruhige Basis-Einheit",
        start: "06:30",
        end: "07:30",
        category: "training",
        workoutId: "endurance",
      },
      {
        id: "mi-2",
        title: "Arbeiten (BÃ¼ro)",
        subtitle: "Langer BÃ¼ro-Tag",
        start: "08:00",
        end: "17:00",
        category: "arbeit",
      },
      {
        id: "mi-3",
        title: "Hangar Aufruf erstellen",
        subtitle: "Kurzer Orga-Slot mittags",
        start: "12:00",
        end: "12:30",
        category: "ehrenamt",
      },
      {
        id: "mi-4",
        title: "Fahrt nach Halbe",
        subtitle: "Berlin Ostbahnhof",
        start: "15:45",
        end: "16:30",
        category: "mobilitaet",
      },
      {
        id: "mi-5",
        title: "Carmen",
        subtitle: "Abend in Halbe",
        start: "17:00",
        end: "22:00",
        category: "sozial",
      },
      {
        id: "mi-6",
        title: "Lesen",
        subtitle: "Ruhiger Abschluss",
        start: "22:00",
        end: "23:00",
        category: "erholung",
      },
    ],
  },
  {
    dayShort: "DO",
    dayLabel: "Donnerstag",
    date: 9,
    monthLabel: "April",
    allDayEvents: [
      {
        id: "do-ad-1",
        title: "Carmen in Halbe",
        category: "sozial",
      },
      {
        id: "do-ad-2",
        title: "Velo",
        category: "mobilitaet",
      },
    ],
    events: [
      {
        id: "do-1",
        title: "Heimweg",
        subtitle: "FrÃ¼h zurÃ¼ck",
        start: "07:00",
        end: "08:00",
        category: "mobilitaet",
      },
      {
        id: "do-2",
        title: "Arbeit",
        subtitle: "Arbeitsblock am Vormittag",
        start: "08:00",
        end: "12:00",
        category: "arbeit",
      },
      {
        id: "do-3",
        title: "Krafttraining",
        subtitle: "Mittagsblock Ganzkoerper",
        start: "12:00",
        end: "13:00",
        category: "training",
        workoutId: "kraft",
      },
      {
        id: "do-4",
        title: "Arbeiten",
        subtitle: "Arbeitsblock am Nachmittag",
        start: "13:00",
        end: "15:00",
        category: "arbeit",
      },
      {
        id: "do-5",
        title: "Keymaster Hangar",
        subtitle: "Hangar 1, Columbiadamm 10",
        start: "15:00",
        end: "18:00",
        category: "ehrenamt",
      },
      {
        id: "do-6",
        title: "Hangar Post erstellen",
        subtitle: "Kurzer Abschlussblock",
        start: "20:00",
        end: "20:30",
        category: "ehrenamt",
      },
      {
        id: "do-7",
        title: "Heimweg",
        subtitle: "RÃ¼ckfahrt am Abend",
        start: "21:45",
        end: "22:15",
        category: "mobilitaet",
      },
      {
        id: "do-8",
        title: "Lesen",
        subtitle: "Runterkommen",
        start: "22:15",
        end: "23:00",
        category: "erholung",
      },
    ],
  },
  {
    dayShort: "FR",
    dayLabel: "Freitag",
    date: 10,
    monthLabel: "April",
    allDayEvents: [
      {
        id: "fr-ad-1",
        title: "Carmen in Halbe",
        category: "sozial",
      },
      {
        id: "fr-ad-2",
        title: "Velo",
        category: "mobilitaet",
      },
    ],
    events: [
      {
        id: "fr-1",
        title: "Zwift Tempo",
        subtitle: "Tempo-Einheit am Morgen",
        start: "06:30",
        end: "08:00",
        category: "training",
        workoutId: "zwift-tempo",
      },
      {
        id: "fr-2",
        title: "Arbeiten",
        subtitle: "Arbeitsblock am Vormittag",
        start: "08:00",
        end: "12:00",
        category: "arbeit",
      },
      {
        id: "fr-3",
        title: "Lauftraining MIT/LOW",
        subtitle: "Mittagslauf mit flexiblem Intensitaetsfenster",
        start: "12:00",
        end: "13:00",
        category: "training",
        workoutId: "laufen",
      },
      {
        id: "fr-4",
        title: "Arbeiten",
        subtitle: "Arbeitsblock am Nachmittag",
        start: "13:00",
        end: "17:00",
        category: "arbeit",
      },
      {
        id: "fr-5",
        title: "Einkaufen (LPG)",
        subtitle: "Einkauf fÃ¼r das Wochenende",
        start: "17:00",
        end: "18:00",
        category: "orga",
      },
    ],
  },
  {
    dayShort: "SA",
    dayLabel: "Samstag",
    date: 11,
    monthLabel: "April",
    allDayEvents: [
      {
        id: "sa-ad-1",
        title: "Carmen in Halbe",
        category: "sozial",
      },
      {
        id: "sa-ad-2",
        title: "Velo",
        category: "mobilitaet",
      },
    ],
    events: [
      {
        id: "sa-1",
        title: "Uni",
        subtitle: "Vormittagsblock",
        start: "08:00",
        end: "10:30",
        category: "lernen",
      },
    ],
  },
  {
    dayShort: "SO",
    dayLabel: "Sonntag",
    date: 12,
    monthLabel: "April",
    allDayEvents: [
      {
        id: "so-ad-1",
        title: "Carmen in Halbe",
        category: "sozial",
      },
      {
        id: "so-ad-2",
        title: "Velo",
        category: "mobilitaet",
      },
    ],
    events: [
      {
        id: "so-1",
        title: "Uni",
        subtitle: "Vormittagsblock",
        start: "08:00",
        end: "10:30",
        category: "lernen",
      },
      {
        id: "so-2",
        title: "Long Ride",
        subtitle: "Laengerer Grundlagenblock am Nachmittag",
        start: "17:00",
        end: "20:00",
        category: "training",
        workoutId: "long-ride",
      },
      {
        id: "so-3",
        title: "Vorkochen",
        subtitle: "Vorbereitung fÃ¼r die Woche",
        start: "20:00",
        end: "22:00",
        category: "orga",
      },
      {
        id: "so-4",
        title: "Lesen",
        subtitle: "SpÃ¤ter Ausklang",
        start: "22:15",
        end: "23:00",
        category: "erholung",
      },
    ],
  },
];

export function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getDurationMinutes(start: string, end: string) {
  return toMinutes(end) - toMinutes(start);
}

function formatMinutes(totalMinutes: number) {
  if (totalMinutes < 90) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes.toString().padStart(2, "0")}`;
}

function isTimedEvent(entry: ScheduleEntry): entry is EventItem {
  return "start" in entry && "end" in entry;
}

export function getDayDate(day: DayPlan) {
  return new Date(
    WEEK_YEAR,
    MONTH_INDEX_BY_LABEL[day.monthLabel] ?? 0,
    day.date,
  );
}

export function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function buildEventDetail(day: DayPlan, entry: ScheduleEntry) {
  const meta = CATEGORY_META[entry.category];

  return {
    id: entry.id,
    dayKey: day.dayKey ?? String(day.date),
    dayDate: day.date,
    title: entry.title,
    subtitle:
      "subtitle" in entry
        ? entry.subtitle
        : "Ganztagiger Termin in dieser Woche.",
    dayLabel: day.dayLabel,
    date: day.date,
    monthLabel: day.monthLabel,
    categoryLabel: meta.label,
    icon: meta.icon,
    iconClassName: meta.iconClassName,
    badgeClassName: meta.badgeClassName,
    surfaceClassName: meta.surfaceClassName,
    borderClassName: meta.borderClassName,
    start: isTimedEvent(entry) ? entry.start : undefined,
    end: isTimedEvent(entry) ? entry.end : undefined,
    durationLabel: isTimedEvent(entry)
      ? formatMinutes(getDurationMinutes(entry.start, entry.end))
      : "GanztÃ¤gig",
    allDay: !isTimedEvent(entry),
    subtasks: "subtasks" in entry ? entry.subtasks : undefined,
    canEdit: isTimedEvent(entry),
  };
}

