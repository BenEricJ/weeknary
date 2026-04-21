import React from "react";
import { X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { de } from "date-fns/locale";
import "react-day-picker/dist/style.css";

// --- WIDGETS ---

export function ScheduleItem({ day, title, subtitle, time }: { day: string, title: string, subtitle?: string, time?: string }) {
  const isRestDay = title === "Ruhetag";
  return (
    <div className="flex items-center p-4 hover:bg-[#EBEAE4] transition-colors cursor-pointer">
      <div className="w-10 flex-shrink-0 text-[13px] font-bold text-gray-900">
        {day}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <span className={`text-[14.5px] font-bold ${isRestDay ? "text-gray-500" : "text-gray-900"} leading-tight mb-0.5`}>
          {title}
        </span>
        {subtitle && <span className="text-[12px] text-gray-500 font-medium">{subtitle}</span>}
      </div>
      {time && (
        <div className="text-[13px] font-bold text-gray-700 pl-4">
          {time}
        </div>
      )}
    </div>
  );
}

export function LibraryCard({ title, subtitle, img }: { title: string, subtitle: string, img: string }) {
  return (
    <div className="w-[90px] shrink-0 flex flex-col cursor-pointer group">
      <div className="w-full aspect-[4/5] bg-[#EAE8DD] rounded-[14px] overflow-hidden mb-2 relative">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h4 className="text-[12.5px] font-bold text-gray-900 leading-tight truncate">{title}</h4>
      <p className="text-[11px] text-gray-500 font-medium">{subtitle}</p>
    </div>
  );
}

// --- MODALS ---

export function DateRangeModal({ isOpen, onClose, selectedDateRange, setSelectedDateRange, onApply }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] rounded-[24px] p-5 shadow-xl w-full max-w-[340px] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[16px] text-gray-900">Zeitraum wählen</h3>
          <button 
            onClick={onClose}
            aria-label="Schließen"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="bg-white rounded-[16px] border border-[#EBEAE4] p-2 flex justify-center">
          <DayPicker
            mode="range"
            selected={selectedDateRange}
            onSelect={(range: any) => setSelectedDateRange(range || { from: undefined, to: undefined })}
            locale={de}
            showOutsideDays
            className="font-sans"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-[14px] font-bold text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-gray-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex w-full",
              head_cell: "text-gray-500 rounded-md w-9 font-medium text-[11px] text-center uppercase tracking-wide",
              row: "flex w-full mt-2",
              cell: "text-center text-[13px] p-0 relative [&:has([aria-selected])]:bg-[#E4ECD6] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-9",
              day: "h-9 w-9 p-0 font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors cursor-pointer",
              day_range_start: "day-range-start !bg-[#6A816A] !text-white hover:!bg-[#6A816A] hover:!text-white rounded-l-md",
              day_range_end: "day-range-end !bg-[#6A816A] !text-white hover:!bg-[#6A816A] hover:!text-white rounded-r-md",
              day_selected: "bg-[#E4ECD6] text-[#4A634A] font-bold",
              day_today: "bg-gray-100 text-gray-900 font-bold",
              day_outside: "text-gray-400 opacity-50",
              day_disabled: "text-gray-400 opacity-50",
              day_range_middle: "aria-selected:!bg-[#E4ECD6] aria-selected:!text-[#4A634A] !rounded-none",
              day_hidden: "invisible",
            }}
          />
        </div>
        
        <div className="mt-5 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-[12px] bg-[#EBEAE4] text-gray-700 font-bold text-[14px] hover:bg-gray-200 transition-colors"
          >
            Abbrechen
          </button>
          <button 
            onClick={onApply}
            disabled={!selectedDateRange.from}
            className="flex-1 py-3 rounded-[12px] bg-[#6A816A] text-white font-bold text-[14px] hover:bg-[#5C705C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Anwenden
          </button>
        </div>
      </div>
    </div>
  );
}

export function MetricsModal({ isOpen, onClose, metrics, selectedMetrics, setSelectedMetrics }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF9F6] rounded-t-[24px] sm:rounded-[24px] p-5 shadow-xl w-full max-w-[400px] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[16px] text-gray-900">Favoriten bearbeiten</h3>
          <button 
            onClick={onClose}
            aria-label="Schließen"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <p className="text-[13px] text-gray-600 mb-5 leading-snug">
          Wähle aus, welche Entwicklungen auf deinem Dashboard angezeigt werden sollen.
        </p>

        <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto hide-scrollbar">
          {metrics.map((metric: any) => {
            const isSelected = selectedMetrics.includes(metric.id);
            return (
              <label key={metric.id} className={`flex items-center justify-between p-3 rounded-[16px] border cursor-pointer transition-all ${isSelected ? 'bg-white border-[#6A816A] shadow-sm' : 'bg-transparent border-[#EBEAE4] hover:bg-white/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#6A816A] border-[#6A816A]' : 'bg-white border-gray-300'}`}>
                    {isSelected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={`text-[14px] font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{metric.title}</span>
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isSelected}
                  onChange={() => {
                    setSelectedMetrics((prev: any) => 
                      prev.includes(metric.id) ? prev.filter((id: string) => id !== metric.id) : [...prev, metric.id]
                    );
                  }} 
                />
              </label>
            );
          })}
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-[16px] bg-[#6A816A] text-white font-bold text-[14px] hover:bg-[#5C705C] transition-colors shadow-sm"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}