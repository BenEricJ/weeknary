import React from "react";
import { CalendarDays, NotebookPen, Sparkles } from "lucide-react";

interface CalendarEmptyStateProps {
  title: string;
  description: string;
  createLabel?: string;
  manualLabel?: string;
  onCreatePlan: () => void;
  onManualAdd: () => void;
}

export function CalendarEmptyState({
  title,
  description,
  createLabel = "Plan erstellen",
  manualLabel = "Manuell hinzufuegen",
  onCreatePlan,
  onManualAdd,
}: CalendarEmptyStateProps) {
  return (
    <section className="rounded-[20px] border border-dashed border-[#C7D3BE] bg-[#F6F8F1] p-5 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-white shadow-sm">
        <CalendarDays size={20} className="text-[#5E7A5E]" />
      </div>
      <h3 className="mt-3 text-[15px] font-bold leading-tight text-gray-900">
        {title}
      </h3>
      <p className="mx-auto mt-1 max-w-[300px] text-[12px] leading-snug text-gray-600">
        {description}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCreatePlan}
          className="flex items-center justify-center gap-2 rounded-[12px] bg-[#6A816A] px-3 py-3 text-[12px] font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          <Sparkles size={15} />
          {createLabel}
        </button>
        <button
          type="button"
          onClick={onManualAdd}
          className="flex items-center justify-center gap-2 rounded-[12px] border border-[#DDE6D7] bg-white px-3 py-3 text-[12px] font-bold text-[#4A634A] shadow-sm transition-transform active:scale-[0.98]"
        >
          <NotebookPen size={15} />
          {manualLabel}
        </button>
      </div>
    </section>
  );
}
