import { useProfileSettings } from "../profile/useProfileSettings";

interface ProfileAvatarButtonProps {
  onClick: () => void;
  className?: string;
}

export function ProfileAvatarButton({
  onClick,
  className = "",
}: ProfileAvatarButtonProps) {
  const settings = useProfileSettings();
  const displayName = settings.profile?.displayName ?? "Profil";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Profil oeffnen"
      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#78916F] text-[15px] font-bold text-white shadow-[0_0_0_8px_rgba(94,122,94,0.10)] transition-transform active:scale-95 ${className}`}
    >
      {settings.profile?.avatarUrl ? (
        <img
          src={settings.profile.avatarUrl}
          alt={displayName}
          className="h-full w-full object-cover"
        />
      ) : (
        displayName.slice(0, 1).toUpperCase()
      )}
    </button>
  );
}
