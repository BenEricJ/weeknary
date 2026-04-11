import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Calendar, Utensils, Dumbbell, Moon, ClipboardCheck } from "lucide-react";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", icon: Home, path: "/app/home" },
    { label: "Woche", icon: Calendar, path: "/app/week" }, // Placeholder
    { label: "Ernährung", icon: Utensils, path: "/app/nutrition" }, // Placeholder
    { label: "Training", icon: Dumbbell, path: "/app/training" }, // Placeholder
    { label: "Schlaf", icon: Moon, path: "/app/sleep" }, // Placeholder
    { label: "Review", icon: ClipboardCheck, path: "/app/review" }, // Placeholder
  ];

  // In a real app we'd have these routes, but here we just focus on Home and Create Hub.
  
  return (
    <div className="h-full flex flex-col w-full bg-[#FAF9F6]">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="h-[80px] bg-[#FAF9F6] border-t border-gray-200/50 flex justify-between items-center px-4 pb-4 pt-2 shrink-0 z-10">
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
