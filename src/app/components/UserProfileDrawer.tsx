import { Drawer } from "vaul";
import {
  Bell,
  ChevronRight,
  Dumbbell,
  LogOut,
  Moon,
  ShieldCheck,
  Sparkles,
  User,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useProfileSettings } from "../profile/useProfileSettings";

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

const menuItems: Array<{
  icon: LucideIcon;
  label: string;
  path: string;
}> = [
  { icon: User, label: "Konto", path: "/app/profile?tab=profile" },
  { icon: Utensils, label: "Ernaehrungsprofil", path: "/app/profile?tab=nutrition" },
  { icon: Dumbbell, label: "Trainingsprofil", path: "/app/profile?tab=training" },
  { icon: Moon, label: "Schlafziele", path: "/app/profile?tab=planning" },
  { icon: Bell, label: "Benachrichtigungen", path: "/app/profile?tab=planning" },
  { icon: ShieldCheck, label: "Datenschutz", path: "/app/profile?tab=expert" },
];

export function UserProfileDrawer({ isOpen, onClose }: UserProfileDrawerProps) {
  const navigate = useNavigate();
  const settings = useProfileSettings();
  const profile = settings.profile;
  const preferences = settings.preferences;
  const displayName = profile?.displayName ?? "Profil";

  const goTo = (path: string) => {
    onClose(false);
    navigate(path);
  };

  const signOut = async () => {
    await settings.signOut();
    onClose(false);
    navigate("/");
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/35" />
        <Drawer.Content className="fixed bottom-0 right-0 top-0 z-50 flex w-[302px] max-w-[82vw] flex-col border-l border-black/[0.03] bg-[#FAF9F6] focus:outline-none">
          <Drawer.Title className="sr-only">Profil</Drawer.Title>
          <Drawer.Description className="sr-only">
            Profil und Einstellungen
          </Drawer.Description>

          <div className="flex items-center justify-between px-5 pb-3 pt-7">
            <h2 className="text-lg font-bold leading-tight text-gray-900">Profil</h2>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
              aria-label="Profil schliessen"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => goTo("/app/profile?tab=profile")}
            className="mx-5 mb-5 flex items-center gap-3 text-left"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#78916F] text-xl font-bold text-white shadow-[0_0_0_8px_rgba(120,145,111,0.16)]">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold leading-tight text-gray-900">
                {displayName}
              </p>
              <p className="mt-1 truncate text-[12px] font-medium leading-snug text-gray-500">
                {settings.userEmail ??
                  (preferences
                    ? `${formatDiet(preferences.nutrition.dietType)} · ${preferences.training.sessionsPerWeek} Trainings/Woche`
                    : "Profil wird geladen")}
              </p>
            </div>
          </button>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <button
              type="button"
              onClick={() => goTo("/app/create")}
              className="mb-4 flex min-h-12 w-full items-center gap-3 rounded-[16px] border border-[#E6EBE6] bg-[#F2F4F2] px-3 py-3 text-left"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white">
                <Sparkles size={18} className="text-[#4A634A]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold leading-tight text-gray-900">
                  Create Hub
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                  Neue Plaene erstellen
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <div className="grid gap-1">
              {menuItems.map((item) => (
                <DrawerMenuRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => goTo(item.path)}
                />
              ))}
              <DrawerMenuRow
                icon={LogOut}
                label="Abmelden"
                danger
                onClick={() => void signOut()}
              />
            </div>
          </div>

          <div className="border-t border-[#E6EBE6]/70 bg-[#EDF2EC] px-4 py-3 text-center text-[11px] font-semibold leading-tight text-[#4A634A]">
            Weeknary · Version 0.19.3
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function DrawerMenuRow({
  icon: Icon,
  label,
  danger = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition-colors hover:bg-gray-900/[0.035] ${
        danger ? "text-[#d4183d]" : "text-gray-900"
      }`}
    >
      <Icon size={18} className={danger ? "text-[#d4183d]" : "text-[#4A634A]"} />
      <span className="flex-1 text-[13px] font-semibold leading-tight">{label}</span>
      {!danger ? <ChevronRight size={16} className="text-gray-400" /> : null}
    </button>
  );
}

function formatDiet(value: string) {
  const labels: Record<string, string> = {
    omnivore: "Omnivor",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    pescetarian: "Pescetarisch",
  };

  return labels[value] ?? value;
}
