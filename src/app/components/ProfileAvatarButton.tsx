import React from "react";

interface ProfileAvatarButtonProps {
  onClick: () => void;
  className?: string;
}

export function ProfileAvatarButton({
  onClick,
  className = "",
}: ProfileAvatarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Profil oeffnen"
      className={`w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 active:scale-95 transition-transform ${className}`}
    >
      <img
        src="https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGluZyUyMGNhc3VhbHxlbnwxfHx8fDE3NzUyNjkzMzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Profile"
        className="w-full h-full object-cover"
      />
    </button>
  );
}
