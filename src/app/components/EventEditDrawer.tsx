import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  ListTodo,
  Save,
  Share,
} from "lucide-react";
import {
  DetailDrawer,
  FieldGroup,
  HeroBadge,
  SectionHeading,
  StatsBarItem,
} from "./ui/DetailDrawer";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

export interface EventEditSession {
  mode?: "create" | "edit";
  dayKey: string;
  dayDate: number;
  dayLabel: string;
  date: number;
  monthLabel: string;
  event: {
    id: string;
    title: string;
    subtitle: string;
    start: string;
    end: string;
    category: string;
    workoutId?: string;
    subtasks?: string[];
  };
}

export interface EventEditDraft {
  id: string;
  title: string;
  subtitle: string;
  start: string;
  end: string;
  category: string;
  workoutId?: string;
  subtasks?: string[];
}

interface CategoryOption {
  value: string;
  label: string;
}

interface EventEditDrawerProps {
  session: EventEditSession | null;
  categoryOptions: CategoryOption[];
  onClose: () => void;
  onSave: (draft: EventEditDraft) => void;
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function EventEditDrawer({
  session,
  categoryOptions,
  onClose,
  onSave,
}: EventEditDrawerProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [category, setCategory] = useState("");
  const [subtasksText, setSubtasksText] = useState("");

  useEffect(() => {
    if (!session) {
      return;
    }

    setTitle(session.event.title);
    setSubtitle(session.event.subtitle);
    setStart(session.event.start);
    setEnd(session.event.end);
    setCategory(session.event.category);
    setSubtasksText(session.event.subtasks?.join("\n") ?? "");
  }, [session]);

  const isTimeRangeValid = useMemo(() => {
    if (!start || !end) {
      return false;
    }

    return toMinutes(end) > toMinutes(start);
  }, [end, start]);

  if (!session) {
    return null;
  }
  const isCreateMode = session.mode === "create";

  const handleSave = () => {
    if (!title.trim() || !isTimeRangeValid) {
      return;
    }

    const subtasks = subtasksText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    onSave({
      id: session.event.id,
      title: title.trim(),
      subtitle: subtitle.trim(),
      start,
      end,
      category,
      workoutId: session.event.workoutId,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });
  };

  return (
    <DetailDrawer
      open={!!session}
      onClose={onClose}
      title={isCreateMode ? "Termin erstellen" : "Termin bearbeiten"}
      description="Bearbeite Titel, Beschreibung, Kategorie und Zeitfenster des ausgewählten Termins."
      headerActions={<Share size={20} strokeWidth={2} />}
      hero={{
        height: 200,
        surfaceClassName: "bg-[#E4ECD6]",
        badges: (
          <HeroBadge className="bg-white/70 text-[#4A634A]">
            {isCreateMode ? "Neu" : "Bearbeiten"}
          </HeroBadge>
        ),
        titleBlockClassName: "absolute bottom-[44px] left-4 right-4",
        titleBlock: (
          <>
            <h3 className="text-[24px] font-bold leading-tight text-gray-900 mb-1">
              {title || "Termin"}
            </h3>
            <p className="text-[12px] text-gray-700/85 leading-snug">
              {session.dayLabel}, {session.date}. {session.monthLabel}
            </p>
          </>
        ),
        statsBar: (
          <>
            <StatsBarItem
              icon={<CalendarDays size={14} className="text-gray-300" />}
              label={session.dayLabel}
            />
            <StatsBarItem
              icon={<Clock size={14} className="text-gray-300" />}
              label={start && end ? `${start} - ${end}` : "Zeit wählen"}
            />
            <StatsBarItem
              icon={<Save size={14} className="text-gray-300" />}
              label="Entwurf"
            />
          </>
        ),
      }}
      footer={
        <div className="grid grid-cols-[1fr_1.3fr] gap-3">
          <button
            onClick={onClose}
            className="bg-[#F5F4EF] text-gray-800 text-[13px] font-bold py-3.5 rounded-[12px] border border-[#EBEAE4] active:scale-95 transition-transform"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !isTimeRangeValid}
            className="bg-[#6A816A] disabled:bg-[#B7C2B7] disabled:cursor-not-allowed text-white text-[13px] font-bold py-3.5 rounded-[12px] shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save size={16} />
            Änderungen sichern
          </button>
        </div>
      }
    >
      <section>
        <SectionHeading className="text-gray-900">
          Basisdaten
        </SectionHeading>
        <div className="bg-white border border-[#EBEAE4] rounded-[20px] p-4 shadow-sm space-y-4">
          <FieldGroup label="Titel">
            <Input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Titel des Termins"
              className="h-11 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]"
            />
          </FieldGroup>
          <FieldGroup label="Beschreibung">
            <Textarea
              value={subtitle}
              onChange={(event) =>
                setSubtitle(event.target.value)
              }
              placeholder="Kurzer Kontext"
              className="min-h-24 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]"
            />
          </FieldGroup>
          <FieldGroup label="Kategorie">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
        </div>
      </section>

      <section>
        <SectionHeading className="text-gray-900">
          Zeitfenster
        </SectionHeading>
        <div className="bg-white border border-[#EBEAE4] rounded-[20px] p-4 shadow-sm grid grid-cols-2 gap-3">
          <FieldGroup label="Beginn">
            <Input
              type="time"
              value={start}
              onChange={(event) =>
                setStart(event.target.value)
              }
              className="h-11 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]"
            />
          </FieldGroup>
          <FieldGroup label="Ende">
            <Input
              type="time"
              value={end}
              onChange={(event) =>
                setEnd(event.target.value)
              }
              className="h-11 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]"
            />
          </FieldGroup>
          {!isTimeRangeValid ? (
            <p className="col-span-2 text-[11px] font-medium text-[#B85450]">
              Das Ende muss nach dem Beginn liegen.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <SectionHeading className="text-gray-900">
          Aufgaben im Block
        </SectionHeading>
        <div className="bg-white border border-[#EBEAE4] rounded-[20px] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <ListTodo size={16} />
            <span className="text-[12px] font-medium">
              Eine Aufgabe pro Zeile
            </span>
          </div>
          <Textarea
            value={subtasksText}
            onChange={(event) =>
              setSubtasksText(event.target.value)
            }
            placeholder="Gruppenfoto machen&#10;Montagspost erstellen"
            className="min-h-28 rounded-[12px] border-[#EBEAE4] bg-[#FAF9F5]"
          />
        </div>
      </section>
    </DetailDrawer>
  );
}
