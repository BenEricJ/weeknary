import React, { useState } from "react";
import { Drawer } from "vaul";
import { ChevronLeft, MoreHorizontal, Share } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./utils";

/* ------------------------------------------------------------------ */
/*  DetailDrawer – wiederverwendbare Drawer-Shell                      */
/* ------------------------------------------------------------------ */

export interface DetailDrawerTab {
  label: string;
  content: React.ReactNode;
}

export interface DetailDrawerHero {
  /** Höhe der Hero-Section (default 240) */
  height?: number;
  /** Tailwind-Klasse für den Hintergrund (Gradient/Farbe) */
  surfaceClassName: string;
  /** Badges oben-links */
  badges?: React.ReactNode;
  /** Icon + Titel-Block unten */
  titleBlock?: React.ReactNode;
  /** Stats-Bar am unteren Rand */
  statsBar?: React.ReactNode;
}

export interface DetailDrawerProps {
  /** Steuert ob der Drawer offen ist */
  open: boolean;
  onClose: () => void;
  /** Header-Titel (z.B. "Termin-Details") */
  title: string;
  /** Screenreader-Beschreibung */
  description?: string;
  /** Optionale Hero-Section */
  hero?: DetailDrawerHero;
  /** Tabs – wenn gesetzt, wird Tab-Navigation angezeigt */
  tabs?: DetailDrawerTab[];
  /** Content ohne Tabs (wird ignoriert wenn tabs gesetzt) */
  children?: React.ReactNode;
  /** Footer-Buttons */
  footer?: React.ReactNode;
  /** Header-Actions rechts (default: Share + MoreHorizontal) */
  headerActions?: React.ReactNode;
}

export function DetailDrawer({
  open,
  onClose,
  title,
  description,
  hero,
  tabs,
  children,
  footer,
  headerActions,
}: DetailDrawerProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Reset tab on reopen
  React.useEffect(() => {
    if (open) setActiveTabIndex(0);
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-[#F5F4EF] flex flex-col rounded-t-[24px] h-[95vh] fixed bottom-0 left-0 right-0 z-50 outline-none max-w-[390px] mx-auto overflow-hidden">
          {description && (
            <Drawer.Description className="sr-only">
              {description}
            </Drawer.Description>
          )}

          {/* ---- Header ---- */}
          <div className="bg-white flex items-center justify-between px-4 py-3 rounded-t-[24px] shrink-0 border-b border-[#EBEAE4]">
            <button
              onClick={onClose}
              aria-label="Zurück"
              className="text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <Drawer.Title className="text-[16px] font-bold text-gray-900">
              {title}
            </Drawer.Title>
            <div className="flex items-center gap-4 text-gray-900 mr-1">
              {headerActions ?? (
                <>
                  <Share size={20} strokeWidth={2} />
                  <MoreHorizontal size={24} />
                </>
              )}
            </div>
          </div>

          {/* ---- Scrollable Body ---- */}
          <div className="flex-1 overflow-y-auto pb-4 hide-scrollbar relative">
            {/* Hero */}
            {hero && <DrawerHero {...hero} />}

            {/* Tabs */}
            {tabs && tabs.length > 0 && (
              <div className="bg-white border-b border-[#EBEAE4] px-2 pt-1 flex justify-between sticky top-0 z-10 shadow-sm">
                {tabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTabIndex(i)}
                    className={cn(
                      "flex-1 py-3 text-[12.5px] transition-all",
                      activeTabIndex === i
                        ? "font-bold text-[#6A816A] border-b-[2.5px] border-[#6A816A]"
                        : "font-medium text-gray-500 hover:text-gray-700",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-6">
              {tabs && tabs.length > 0 ? (
                <div className="animate-in fade-in duration-300">
                  {tabs[activeTabIndex]?.content}
                </div>
              ) : (
                children
              )}
            </div>
          </div>

          {/* ---- Footer ---- */}
          {footer && (
            <div className="px-4 pb-8 pt-3 bg-white border-t border-[#EBEAE4] shrink-0">
              {footer}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  DrawerHero – Hero-Section mit Gradient, Badges, Stats             */
/* ------------------------------------------------------------------ */

function DrawerHero({
  height = 240,
  surfaceClassName,
  badges,
  titleBlock,
  statsBar,
}: DetailDrawerHero) {
  return (
    <div className="w-full relative">
      <div
        className={cn(
          "w-full relative overflow-hidden",
          surfaceClassName,
        )}
        style={{ height }}
      >
        {/* Glassmorphism Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_45%)]" />
        <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-white/50 blur-2xl" />
        <div className="absolute bottom-10 -left-10 w-32 h-32 rounded-full bg-white/35 blur-2xl" />

        {/* Badges */}
        {badges && (
          <div className="absolute top-4 left-4 flex gap-2">{badges}</div>
        )}

        {/* Title block */}
        {titleBlock && (
          <div className="absolute bottom-[52px] left-4 right-4">
            {titleBlock}
          </div>
        )}

        {/* Stats bar */}
        {statsBar && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md flex items-center justify-between px-5 py-3 text-white">
            {statsBar}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionHeading – Abschnitt-Überschrift                             */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/*  SectionCard – Standard-Card-Container                              */
/* ------------------------------------------------------------------ */

export function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-[#EBEAE4] bg-white shadow-sm overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FormSection – Form-Container (rounded-[20px])                      */
/* ------------------------------------------------------------------ */

export function FormSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-[#EBEAE4] rounded-[20px] p-4 shadow-sm space-y-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FieldGroup – Form-Label-Wrapper                                    */
/* ------------------------------------------------------------------ */

export function FieldGroup({
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

/* ------------------------------------------------------------------ */
/*  DetailRow – Icon + Label + Value                                   */
/* ------------------------------------------------------------------ */

export function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="w-9 h-9 rounded-full bg-gray-50/80 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-bold text-gray-900 leading-snug truncate">
          {label}
        </h4>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HorizontalDivider – Trenn-Linie zwischen DetailRows               */
/* ------------------------------------------------------------------ */

export function HorizontalDivider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-[#EBEAE4] mx-3", className)} />;
}

/* ------------------------------------------------------------------ */
/*  ProgressBar – animierter Fortschrittsbalken                        */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  /** Wert zwischen 0 und 1 */
  value,
  /** Tailwind-Klasse für die gefüllte Farbe (default: bg-[#5E7A5E]) */
  colorClassName = "bg-[#5E7A5E]",
  /** Höhe (default: h-1.5) */
  heightClassName = "h-1.5",
}: {
  value: number;
  colorClassName?: string;
  heightClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <div
      className={cn(
        "w-full rounded-full overflow-hidden bg-[#E4E9E4]",
        heightClassName,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          colorClassName,
        )}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StatusBadge – Status-Anzeige (success / warning / info)            */
/* ------------------------------------------------------------------ */

const statusVariants = {
  success: "bg-[#EAF2E8] text-[#4A634A]",
  warning: "bg-[#F8EEE1] text-[#A36A3B]",
  info: "bg-[#F0EBF7] text-[#6A5F8F]",
} as const;

export function StatusBadge({
  variant,
  children,
  className,
}: {
  variant: keyof typeof statusVariants;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-bold",
        statusVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  HeroBadge – Kategorie-/Info-Badge in Hero-Sections                 */
/* ------------------------------------------------------------------ */

export function HeroBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold px-2 py-1 rounded-[6px] backdrop-blur-sm uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  HeroTitleBlock – Titel-Block in Hero-Sections                      */
/* ------------------------------------------------------------------ */

export function HeroTitleBlock({
  icon,
  iconClassName,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  iconClassName?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      {icon && (
        <div
          className={cn(
            "w-12 h-12 rounded-[16px] flex items-center justify-center mb-3 bg-white/80 shadow-sm",
            iconClassName,
          )}
        >
          {icon}
        </div>
      )}
      <h2 className="text-[24px] font-bold leading-tight text-gray-900 mb-1">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[12px] text-gray-700/85 leading-snug">{subtitle}</p>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  StatsBarItem – Einzelnes Item in der Hero Stats-Bar                */
/* ------------------------------------------------------------------ */

export function StatsBarItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-medium">
      {icon}
      {label}
    </span>
  );
}
