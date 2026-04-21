import React from "react";
import type { LucideIcon } from "lucide-react";
import { ProfileAvatarButton } from "./ProfileAvatarButton";

interface AppTabHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle: React.ReactNode;
  onProfileClick: () => void;
}

export function AppTabHeader({
  icon: Icon,
  iconClassName = "text-[#4A634A]",
  title,
  subtitle,
  onProfileClick,
}: AppTabHeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 bg-[#FAF9F6]/75 px-6 pb-4 pt-6 backdrop-blur-md">
      <ProfileAvatarButton
        onClick={onProfileClick}
        className="absolute right-6 top-8"
      />

      <div className="flex items-start justify-between pt-2 pr-14">
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
