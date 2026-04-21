import React, { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  ListTodo,
  Save,
  Share,
} from "lucide-react";
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
    <Drawer.Root
      open={!!session}
      onOpenChange={(open) => !open && onClose()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-[#F5F4EF] flex flex-col rounded-t-[24px] h-[95vh] fixed bottom-0 left-0 right-0 z-50 outline-none max-w-[390px] mx-auto overflow-hidden">
          <Drawer.Title className="sr-only">Termin bearbeiten</Drawer.Title>
          <Drawer.Description className="sr-only">
            Bearbeite Titel, Beschreibung, Kategorie und Zeitfenster des ausgewählten Termins.
          </Drawer.Description>
          <div className="bg-white flex items-center justify-between px-4 py-3 rounded-t-[24px] shrink-0 border-b border-[#EBEAE4]">
            <button
              onClick={onClose}
              className="text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-[16px] font-bold text-gray-900">
              Termin bearbeiten
            </h2>
            <div className="flex items-center gap-4 text-gray-900 mr-1">
              <Share size={20} strokeWidth={2} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4 hide-scrollbar relative">
            <div className="w-full relative">
              <div className="h-[200px] w-full bg-[#E4ECD6] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.85),transparent_45%)]" />
                <div className="absolute -top-8 -right-6 w-32 h-32 rounded-full bg-white/50 blur-2xl" />
                <div className="absolute bottom-8 -left-8 w-28 h-28 rounded-full bg-white/30 blur-2xl" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/70 text-[#4A634A] text-[10px] font-bold px-2 py-1 rounded-[6px] backdrop-blur-sm uppercase tracking-wider">
                    Bearbeiten
                  </span>
                </div>
                <div className="absolute bottom-[44px] left-4 right-4">
                  <h3 className="text-[24px] font-bold leading-tight text-gray-900 mb-1">
                    {title || "Termin"}
                  </h3>
                  <p className="text-[12px] text-gray-700/85 leading-snug">
                    {session.dayLabel}, {session.date}. {session.monthLabel}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-3 text-white">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium">
                    <CalendarDays
                      size={14}
                      className="text-gray-300"
                    />
                    {session.dayLabel}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium">
                    <Clock size={14} className="text-gray-300" />
                    {start && end ? `${start} - ${end}` : "Zeit wählen"}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium">
                    <Save size={14} className="text-gray-300" />
                    Entwurf
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-6">
              <section>
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Basisdaten
                </h3>
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
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Zeitfenster
                </h3>
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
                <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Aufgaben im Block
                </h3>
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
            </div>
          </div>

          <div className="px-4 pb-8 pt-3 grid grid-cols-[1fr_1.3fr] gap-3 bg-white border-t border-[#EBEAE4] shrink-0">
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}
