import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Calendar,
  ClipboardCheck,
  Dumbbell,
  Moon,
  Utensils,
} from "lucide-react";
import { PlanCalendarSelectionProvider } from "../planCalendarSelection";

const navItems = [
  {
    label: "Plan",
    icon: Calendar,
    path: "/app/home",
    aliases: ["/app/week"],
  },
  { label: "Ernährung", icon: Utensils, path: "/app/nutrition" },
  { label: "Training", icon: Dumbbell, path: "/app/training" },
  { label: "Schlaf", icon: Moon, path: "/app/sleep" },
  { label: "Review", icon: ClipboardCheck, path: "/app/review" },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FAF9F6]">
      <PlanCalendarSelectionProvider>
        <main className="h-full min-h-0 overflow-hidden">
          <Outlet />
        </main>
      </PlanCalendarSelectionProvider>

      <nav className="absolute inset-x-0 bottom-0 z-20 flex h-[80px] items-center justify-between bg-[#FAF9F6]/75 px-4 pb-4 pt-2 backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname.startsWith(item.path) ||
            item.aliases?.some((alias) => location.pathname.startsWith(alias));

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 ${
                isActive ? "text-[#5E7A5E]" : "text-gray-400"
              }`}
            >
              <Icon
                size={22}
                className={
                  isActive
                    ? "fill-[#5E7A5E]/10 stroke-[#5E7A5E]"
                    : "stroke-gray-400"
                }
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
