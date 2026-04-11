import React from "react";

export function KpiCard({
  icon,
  title,
  value,
  status,
  statusColor = "text-gray-500",
  valueColor = "text-gray-900",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  status?: string;
  statusColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-[12px] p-2.5 flex flex-col gap-1 shadow-sm border border-gray-100">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate">{title}</span>
      </div>
      <span className={`text-[13px] font-bold leading-none ${valueColor}`}>{value}</span>
      {status && <span className={`text-[10px] font-semibold ${statusColor}`}>{status}</span>}
    </div>
  );
}

export function ScheduleItem({
  icon,
  title,
  details,
  tag,
  tagHighlight,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  details: string;
  tag: string;
  tagHighlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-[12px] p-3 flex items-center gap-3 shadow-sm border border-gray-100 hover:border-gray-200 transition-all active:scale-[0.98]"
    >
      <div className="shrink-0 w-8 h-8 rounded-full bg-[#F2F4F2] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-[13px] text-gray-900 block truncate">{title}</span>
        <span className="text-[11px] text-gray-400 block truncate">{details}</span>
      </div>
      <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${tagHighlight ? "bg-[#EBF1EB] text-[#4A634A]" : "bg-gray-100 text-gray-500"}`}>
        {tag}
      </span>
    </button>
  );
}

export function NoticeItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 px-3.5 py-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-[13px] text-gray-900 block">{title}</span>
        <span className="text-[11px] text-gray-500 block mt-0.5">{desc}</span>
      </div>
    </div>
  );
}

export function SheetPlanItem({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-[13px] text-gray-900 block truncate">{title}</span>
        <span className="text-[11px] text-gray-500 block truncate">{subtitle}</span>
      </div>
    </div>
  );
}

