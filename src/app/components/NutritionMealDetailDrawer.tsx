import React, { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  Clock,
  CookingPot,
  Info,
  MoonStar,
  MoreHorizontal,
  Share,
  Soup,
  Sun,
  UtensilsCrossed,
  Apple,
} from "lucide-react";
import {
  getMealSlotLabel,
  type ExternalMealGuidance,
  type MealRecipe,
  type MealSlot,
  type MealSlotType,
  type NutritionDay,
} from "../data/nutritionPlan";

const SLOT_META: Record<
  MealSlotType,
  {
    icon: LucideIcon;
    badgeClassName: string;
    chipClassName: string;
    surfaceClassName: string;
  }
> = {
  breakfast: {
    icon: Sun,
    badgeClassName: "bg-[#F5EEE2] text-[#A56A2A]",
    chipClassName: "bg-[#FFF8EE] text-[#A56A2A]",
    surfaceClassName:
      "bg-[linear-gradient(135deg,#F9F1E2_0%,#F4E8D5_45%,#F8F6F1_100%)]",
  },
  lunch: {
    icon: Soup,
    badgeClassName: "bg-[#E9F1E8] text-[#5A775A]",
    chipClassName: "bg-[#F2F7F1] text-[#5A775A]",
    surfaceClassName:
      "bg-[linear-gradient(135deg,#EAF2E6_0%,#DDE9D8_45%,#F4F2EC_100%)]",
  },
  dinner: {
    icon: MoonStar,
    badgeClassName: "bg-[#ECE9F5] text-[#6A5F8F]",
    chipClassName: "bg-[#F5F3FB] text-[#6A5F8F]",
    surfaceClassName:
      "bg-[linear-gradient(135deg,#ECE9F8_0%,#E2DEF2_45%,#F5F2EE_100%)]",
  },
  snack: {
    icon: Apple,
    badgeClassName: "bg-[#F6EEE4] text-[#A36A3B]",
    chipClassName: "bg-[#FCF6EE] text-[#A36A3B]",
    surfaceClassName:
      "bg-[linear-gradient(135deg,#F8EFE3_0%,#F2E3D0_45%,#F8F5F0_100%)]",
  },
};

interface NutritionMealDetailDrawerProps {
  day: NutritionDay | null;
  slot: MealSlot | null;
  meal: MealRecipe | null;
  externalGuidance: ExternalMealGuidance;
  onClose: () => void;
}

export function NutritionMealDetailDrawer({
  day,
  slot,
  meal,
  externalGuidance,
  onClose,
}: NutritionMealDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("Ueberblick");

  useEffect(() => {
    setActiveTab("Ueberblick");
  }, [day?.isoDate, slot?.slot, meal?.id]);

  const slotType = slot?.slot;
  const slotMeta = slotType ? SLOT_META[slotType] : null;
  const tabs = useMemo(
    () => (meal?.preparation?.length ? ["Ueberblick", "Zubereitung"] : ["Ueberblick"]),
    [meal],
  );

  if (!day || !slot || !slotMeta || !slotType) {
    return null;
  }

  const Icon = slotMeta.icon;
  const title = meal?.name ?? externalGuidance.title;
  const subtitle = meal?.use ?? "Ausser Haus eingeplant und bewusst unpraezise als Range dargestellt.";

  return (
    <Drawer.Root open={!!slot} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-[95vh] max-w-[390px] flex-col overflow-hidden rounded-t-[24px] bg-[#F5F4EF] outline-none">
          <Drawer.Description className="sr-only">
            Detailansicht fuer eine Mahlzeit mit Zutaten, Makros und optionalen Zubereitungsschritten.
          </Drawer.Description>

          <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-[#EBEAE4]">
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-900 transition-colors hover:bg-gray-100"
              aria-label="Zurueck"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-[16px] font-bold text-gray-900">Meal-Details</h2>
            <div className="mr-1 flex items-center gap-4 text-gray-900">
              <Share size={20} strokeWidth={2} />
              <MoreHorizontal size={24} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-4 hide-scrollbar">
            <div className={`relative h-[240px] overflow-hidden ${slotMeta.surfaceClassName}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_42%)]" />
              <div className="absolute -right-8 top-0 h-36 w-36 rounded-full bg-white/50 blur-2xl" />
              <div className="absolute -left-10 bottom-8 h-32 w-32 rounded-full bg-white/35 blur-2xl" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-[6px] px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${slotMeta.badgeClassName}`}
                >
                  {getMealSlotLabel(slotType)}
                </span>
                <span className="rounded-[6px] bg-white/75 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-700">
                  {slot.isExternal ? "Extern" : `${meal?.batchServings ?? 1} Portion${meal?.batchServings === 1 ? "" : "en"}`}
                </span>
              </div>

              <div className="absolute bottom-[56px] left-4 right-4">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[16px] bg-white/80 shadow-sm">
                  <Icon size={22} className="text-gray-900" />
                </div>
                <Drawer.Title className="mb-1 text-[24px] font-bold leading-tight text-gray-900">
                  {title}
                </Drawer.Title>
                <p className="max-w-[280px] text-[12px] leading-snug text-gray-700">{subtitle}</p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/60 px-5 py-3 text-white">
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  <CalendarDays size={14} className="text-gray-300" />
                  {day.dayLabel}, {day.date}. {day.monthLabel}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  <Clock size={14} className="text-gray-300" />
                  {meal?.cookTime ?? externalGuidance.kcalRange}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium">
                  <Info size={14} className="text-gray-300" />
                  {meal?.nutrition ? `${meal.nutrition.protein} g Protein` : externalGuidance.proteinRange}
                </span>
              </div>
            </div>

            <div className="sticky top-0 z-10 flex justify-between border-b border-[#EBEAE4] bg-white px-2 pt-1 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-[12.5px] transition-all ${
                    activeTab === tab
                      ? "border-b-[2.5px] border-[#6A816A] font-bold text-[#6A816A]"
                      : "font-medium text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-5 p-5">
              {activeTab === "Ueberblick" ? (
                <div className="space-y-5">
                  {meal?.nutrition ? (
                    <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        <UtensilsCrossed size={14} className="text-[#6A816A]" />
                        Makros pro Portion
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MacroCard label="Kalorien" value={`${meal.nutrition.kcal}`} unit="kcal" />
                        <MacroCard label="Protein" value={`${meal.nutrition.protein}`} unit="g" />
                        <MacroCard label="Kohlenhydrate" value={`${meal.nutrition.carbs}`} unit="g" />
                        <MacroCard label="Fett" value={`${meal.nutrition.fat}`} unit="g" />
                      </div>
                      {meal.nutrition.note ? (
                        <p className="mt-3 text-[11px] leading-snug text-gray-500">{meal.nutrition.note}</p>
                      ) : null}
                    </section>
                  ) : (
                    <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        <AlertTriangle size={14} className="text-[#B46E3C]" />
                        Guidance statt Fixwert
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MacroCard label="Kalorien" value={externalGuidance.kcalRange} unit="" />
                        <MacroCard label="Protein" value={externalGuidance.proteinRange} unit="" />
                      </div>
                      <p className="mt-3 text-[11px] leading-snug text-gray-500">{externalGuidance.warning}</p>
                    </section>
                  )}

                  {meal ? (
                    <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        <CookingPot size={14} className="text-[#6A816A]" />
                        Zutaten
                      </div>
                      <div className="space-y-2.5">
                        {meal.ingredients.map((ingredient) => (
                          <IngredientRow
                            key={`${meal.id}-${ingredient.ingredient}`}
                            ingredient={ingredient.ingredient}
                            amount={`${ingredient.amount} ${ingredient.unit}`}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <Info size={14} className="text-[#6A816A]" />
                      Hinweise
                    </div>

                    {meal ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {meal.tags.map((tag) => (
                            <span
                              key={`${meal.id}-${tag}`}
                              className={`rounded-[8px] px-3 py-1.5 text-[12px] font-medium ${slotMeta.chipClassName}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-[12px] leading-snug text-gray-600">
                          Einsatz: {meal.use}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {externalGuidance.tips.map((tip) => (
                          <div key={tip} className="rounded-[12px] bg-[#F8F6F1] p-3">
                            <p className="text-[12px] leading-snug text-gray-700">{tip}</p>
                          </div>
                        ))}
                        <div className="rounded-[12px] border border-[#EBEAE4] bg-[#FCFBF7] p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Annahmen
                          </p>
                          <div className="mt-2 space-y-2">
                            {externalGuidance.assumptions.map((assumption) => (
                              <p key={assumption} className="text-[12px] leading-snug text-gray-700">
                                {assumption}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              ) : null}

              {activeTab === "Zubereitung" && meal ? (
                <section className="rounded-[16px] border border-[#EBEAE4] bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <CookingPot size={14} className="text-[#6A816A]" />
                    Ablauf
                  </div>
                  <div className="space-y-3">
                    {meal.preparation.map((step, index) => (
                      <div
                        key={`${meal.id}-step-${index + 1}`}
                        className="grid grid-cols-[auto_1fr] gap-3 rounded-[14px] bg-[#F8F7F2] p-3"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-bold text-gray-900">
                          {index + 1}
                        </div>
                        <p className="text-[13px] leading-snug text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[#EBEAE4] bg-white px-4 pb-8 pt-3">
            <button
              onClick={onClose}
              className="w-full rounded-[12px] bg-[#6A816A] py-3.5 text-[13px] font-bold text-white shadow-sm transition-transform active:scale-95"
            >
              Schliessen
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function MacroCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#EBEAE4] bg-[#F8F7F2] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-[18px] font-bold leading-none text-gray-900">
        {value}
        {unit ? <span className="ml-1 text-[12px] font-medium text-gray-500">{unit}</span> : null}
      </p>
    </div>
  );
}

function IngredientRow({
  ingredient,
  amount,
}: {
  ingredient: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#F8F7F2] px-3 py-2.5">
      <span className="text-[13px] font-medium text-gray-800">{ingredient}</span>
      <span className="text-[12px] font-bold text-gray-500">{amount}</span>
    </div>
  );
}
