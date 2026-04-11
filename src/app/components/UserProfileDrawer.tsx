import React from "react";
import { Drawer } from "vaul";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { SheetPlanItem } from "./home/HomeWidgets";

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
}

export function UserProfileDrawer({ isOpen, onClose }: UserProfileDrawerProps) {
  const navigate = useNavigate();

  return (
    <Drawer.Root open={isOpen} onOpenChange={onClose}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="bg-[#FAF9F6] flex flex-col rounded-t-[32px] mt-24 h-[90vh] fixed bottom-0 left-0 right-0 z-50 shadow-2xl focus:outline-none max-w-md mx-auto">
          <div className="p-4 bg-[#FAF9F6] rounded-t-[32px] flex-1 overflow-y-auto hide-scrollbar">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-6" />
            <Drawer.Title className="sr-only">Profil</Drawer.Title>
            <Drawer.Description className="sr-only">Profil und Einstellungen</Drawer.Description>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1762708590808-c453c0e4fb0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGluZyUyMGNhc3VhbHxlbnwxfHx8fDE3NzUyNjkzMzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Alex"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  Alex <ChevronRight size={18} className="text-gray-400" />
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  11. Mai • Meal Plan aktiv
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button onClick={() => navigate("/app/profile")} className="flex-1 py-3.5 bg-white border border-gray-200 rounded-2xl font-semibold text-gray-900 shadow-sm">
                Profil
              </button>
              <button onClick={() => navigate("/app/create")} className="flex-1 py-3.5 bg-[#5E7A5E] text-white rounded-2xl font-semibold shadow-sm">
                Create Hub
              </button>
            </div>

            <h3 className="text-[10px] font-bold text-gray-500 tracking-wider mb-3 uppercase">Aktive Pläne</h3>
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm mb-8 overflow-hidden">
              <SheetPlanItem icon="🥗" title="Meal Plan" subtitle="5.-11. Mai" />
              <div className="h-px bg-gray-100 mx-4" />
              <SheetPlanItem icon="🏋️" title="Training Plan" subtitle="Woche 4 von 6" />
              <div className="h-px bg-gray-100 mx-4" />
              <SheetPlanItem icon="🌙" title="Schlaf & Erholung" subtitle="Ausgewogen" />
              <div className="h-px bg-gray-100 mx-4" />
              <SheetPlanItem icon="📋" title="Wochenfokus" subtitle="Mietsituation klären" />
              <div className="p-3">
                <button onClick={() => navigate("/app/create")} className="w-full py-3.5 bg-[#5E7A5E] text-white rounded-[16px] font-semibold text-sm">
                  Zum Create Hub
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}