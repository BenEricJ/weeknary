import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Calendar, Utensils, Dumbbell, Moon, ClipboardCheck, Sparkles } from "lucide-react";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", icon: Home, path: "/app/home" },
    { label: "Woche", icon: Calendar, path: "/app/week" }, // Placeholder
    { label: "Ernährung", icon: Utensils, path: "/app/nutrition" }, // Placeholder
    { label: "Create", icon: Sparkles, path: "/app/create" },
    { label: "Training", icon: Dumbbell, path: "/app/training" }, // Placeholder
    { label: "Schlaf", icon: Moon, path: "/app/sleep" }, // Placeholder
    { label: "Review", icon: ClipboardCheck, path: "/app/review" }, // Placeholder
  ];

  // In a real app we'd have these routes, but here we just focus on Home and Create Hub.
  
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FAF9F6]">
      <main className="h-full min-h-0 overflow-hidden">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="absolute inset-x-0 bottom-0 z-20 flex h-[80px] items-center justify-between bg-[#FAF9F6]/75 px-4 pb-4 pt-2 backdrop-blur-md">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#5E7A5E]' : 'text-gray-400'}`}
            >
              <Icon size={22} className={isActive ? "fill-[#5E7A5E]/10 stroke-[#5E7A5E]" : "stroke-gray-400"} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
