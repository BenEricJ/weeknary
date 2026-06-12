import React from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { ProfileAvatarButton } from "../ProfileAvatarButton";
import { cn } from "./utils";

/* ------------------------------------------------------------------ */
/*  PageShell – Seiten-Container mit Header + scrollbarem Content      */
/* ------------------------------------------------------------------ */

export interface PageShellProps {
  /** Lucide-Icon für den Seitentitel */
  icon: LucideIcon;
  /** Icon-Farbe (default: text-[#4A634A]) */
  iconClassName?: string;
  /** Seitentitel */
  title: string;
  /** Subtitel unter dem Titel */
  subtitle: React.ReactNode;
  /** Callback für den primären Action-Button (Plus) */
  onPrimaryAction?: () => void;
  /** Aria-Label für den primären Button */
  primaryActionLabel?: string;
  /** Primären Action-Button anzeigen */
  showPrimaryAction?: boolean;
  /** Callback für den Profil-Avatar-Button */
  onProfileClick: () => void;
  /** Scrollbarer Content-Bereich */
  children: React.ReactNode;
  /** Zusätzliche Klassen für den Content-Bereich */
  contentClassName?: string;
}

export function PageShell({
  icon: Icon,
  iconClassName = "text-[#4A634A]",
  title,
  subtitle,
  onPrimaryAction,
  primaryActionLabel = "Neue Pläne erstellen",
  showPrimaryAction = true,
  onProfileClick,
  children,
  contentClassName,
}: PageShellProps) {
  return (
    <div className="relative h-full w-full">
      {/* ---- Header ---- */}
      <header className="absolute inset-x-0 top-0 z-20 bg-[#FAF9F6]/75 px-6 pb-4 pt-6 backdrop-blur-md">
        {showPrimaryAction && onPrimaryAction ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            aria-label={primaryActionLabel}
            className="absolute right-[76px] top-8 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[#5E7A5E] shadow-sm transition-transform active:scale-95"
          >
            <Plus size={24} strokeWidth={2.4} />
          </button>
        ) : null}

        <ProfileAvatarButton
          onClick={onProfileClick}
          className="absolute right-6 top-8"
        />

        <div
          className={cn(
            "flex items-start justify-between pt-2",
            showPrimaryAction ? "pr-28" : "pr-14",
          )}
        >
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Icon size={24} className={iconClassName} />
              {title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
      </header>

      {/* ---- Scrollable Content ---- */}
      <div
        className={cn(
          "h-full overflow-y-auto hide-scrollbar pt-[100px] pb-[90px] px-4",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ContentSection – Benannte Section innerhalb einer Page             */
/* ------------------------------------------------------------------ */

export function ContentSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-4", className)}>
      {title && (
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
