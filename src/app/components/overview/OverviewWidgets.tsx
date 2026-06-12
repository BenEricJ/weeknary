import React from "react";

export function OverviewSectionHeader({
  title,
  rightLabel,
  onRightClick,
}: {
  title: string;
  rightLabel?: string;
  onRightClick?: () => void;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between px-1">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {rightLabel ? (
        <button
          type="button"
          onClick={onRightClick}
          className="text-[11px] font-semibold text-[#C85C19] transition-colors hover:text-[#9F4512]"
        >
          {rightLabel}
        </button>
      ) : null}
    </div>
  );
}

export function CompactNoticeList({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-gray-100 bg-white shadow-sm">
      {children}
    </div>
  );
}

export function CompactNoticeRow({
  icon,
  title,
  description,
  iconSurfaceClassName = "bg-gray-50/80",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconSurfaceClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 transition-colors hover:bg-gray-50">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconSurfaceClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[13px] font-bold leading-snug text-gray-900">
          {title}
        </h4>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export type WeeklyMetricItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress: number;
  accentClassName?: string;
  trackClassName?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function WeeklyMetricStrip({
  metrics,
}: {
  metrics: WeeklyMetricItem[];
}) {
  return (
    <div className="rounded-[16px] border border-gray-100 bg-white p-3.5 shadow-sm">
      <div className="flex items-center gap-2">
        {metrics.map((metric, index) => {
          const progressValue = Math.max(0, Math.min(metric.progress, 100));
          const content = (
            <>
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-gray-700">
                {metric.icon}
                <span className="truncate">{metric.label}</span>
              </div>
              <span className="text-[13px] font-bold leading-none text-gray-900">
                {metric.value}
              </span>
              <div
                className={`mt-1 h-1.5 w-full overflow-hidden rounded-full shadow-inner ${
                  metric.trackClassName ?? "bg-gray-100"
                }`}
              >
                <div
                  className={`h-full rounded-full shadow-sm transition-[width] duration-500 ease-out ${
                    metric.accentClassName ?? "bg-[#C85C19]"
                  }`}
                  style={{
                    width: `${progressValue}%`,
                    minWidth: progressValue > 0 ? 6 : 0,
                  }}
                />
              </div>
            </>
          );

          return (
            <React.Fragment key={metric.label}>
              {index > 0 ? (
                <div className="h-8 w-px shrink-0 bg-gray-100" />
              ) : null}
              {metric.onClick ? (
                <button
                  type="button"
                  onClick={metric.onClick}
                  className="-m-1 flex min-w-0 flex-1 flex-col gap-1 rounded-md p-1 text-left transition-colors hover:bg-gray-50 active:scale-[0.98]"
                  aria-label={metric.ariaLabel ?? metric.label}
                >
                  {content}
                </button>
              ) : (
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {content}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
