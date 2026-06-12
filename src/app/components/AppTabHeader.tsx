import React from "react";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { ProfileAvatarButton } from "./ProfileAvatarButton";

interface AppTabHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle: React.ReactNode;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  showPrimaryAction?: boolean;
  onProfileClick: () => void;
}

export function AppTabHeader({
  icon: Icon,
  iconClassName = "text-[#4A634A]",
  title,
  subtitle,
  onPrimaryAction,
  primaryActionLabel = "Neue Pläne erstellen",
  showPrimaryAction = true,
  onProfileClick,
}: AppTabHeaderProps) {
  const navigate = useNavigate();
  const handlePrimaryAction = onPrimaryAction ?? (() => navigate("/app/create"));

  return (
    <header className="absolute inset-x-0 top-0 z-20 bg-[#FAF9F6]/75 px-6 pb-4 pt-6 backdrop-blur-md">
      {showPrimaryAction ? (
        <button
          type="button"
          onClick={handlePrimaryAction}
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
        className={`flex items-start justify-between pt-2 ${
          showPrimaryAction ? "pr-28" : "pr-14"
        }`}
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
  );
}
