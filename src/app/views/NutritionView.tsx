import React, { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Apple,
  CalendarDays,
  ChevronLeft,
  Flame,
  Leaf,
  MoreHorizontal,
  MoonStar,
  Sparkles,
  Sun,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import { NutritionDayDetailDrawer } from "../components/NutritionDayDetailDrawer";
import { NutritionMealDetailDrawer } from "../components/NutritionMealDetailDrawer";
import { AppTabHeader } from "../components/AppTabHeader";
import { UserProfileDrawer } from "../components/UserProfileDrawer";
import { WeekCalendar } from "../components/WeekCalendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "../components/ui/drawer";
import {
  MEAL_SLOT_ORDER,
  NUTRITION_PLAN,
  getDayByDate,
  getExternalMealCount,
  getMealById,
  getMealSlotLabel,
  getPlannedMacrosForDay,
  getSelectedDayPrepNotes,
  getTodayPlanDate,
  getWeekDays,
  type MealRecipe,
  type MealSlotType,
} from "../data/nutritionPlan";

const SLOT_META: Record<
  MealSlotType,
  {
    icon: LucideIcon;
    iconClassName: string;
    surfaceClassName: string;
    borderClassName: string;
    badgeClassName: string;
  }
> = {
  breakfast: {
    icon: Sun,
    iconClassName: "text-[#A56A2A]",
    surfaceClassName: "bg-[#F8F1E6]",
    borderClassName: "border-[#F0E1CB]",
    badgeClassName: "bg-[#FFF7EC] text-[#A56A2A]",
  },
  lunch: {
    icon: Soup,
    iconClassName: "text-[#5A775A]",
    surfaceClassName: "bg-[#EFF4EC]",
    borderClassName: "border-[#DDE8D8]",
    badgeClassName: "bg-[#F5FAF3] text-[#5A775A]",
  },
  dinner: {
    icon: MoonStar,
    iconClassName: "text-[#6A5F8F]",
    surfaceClassName: "bg-[#F0EDF7]",
    borderClassName: "border-[#E0DAEF]",
    badgeClassName: "bg-[#F6F4FB] text-[#6A5F8F]",
  },
  snack: {
    icon: Apple,
    iconClassName: "text-[#A36A3B]",
    surfaceClassName: "bg-[#F8F0E7]",
    borderClassName: "border-[#EEDCCB]",
    badgeClassName: "bg-[#FDF7F0] text-[#A36A3B]",
  },
};

type TopStatDetails = {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
  title: string;
  lines: string[];
  footer?: string;
};

export function NutritionView() {
  const [selectedDate, setSelectedDate] = useState(() => getTodayPlanDate(NUTRITION_PLAN));
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [selectedSlotType, setSelectedSlotType] = useState<MealSlotType | null>(null);
  const [selectedTopStat, setSelectedTopStat] = useState<TopStatDetails | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const selectedDay = useMemo(
    () => getDayByDate(NUTRITION_PLAN, selectedDate),
    [selectedDate],
  );
  const selectedSlot = useMemo(
    () =>
      selectedSlotType
        ? selectedDay.meals.find((meal) => meal.slot === selectedSlotType) ?? null
        : null,
    [selectedDay, selectedSlotType],
  );
  const selectedMeal = useMemo(
    () => getMealById(NUTRITION_PLAN, selectedSlot?.mealId),
    [selectedSlot],
  );
  const plannedMacros = useMemo(
    () => getPlannedMacrosForDay(NUTRITION_PLAN, selectedDay),
    [selectedDay],
  );
  const externalMealCount = useMemo(
    () => getExternalMealCount(selectedDay),
    [selectedDay],
  );
  const prepNotes = useMemo(
    () => getSelectedDayPrepNotes(NUTRITION_PLAN, selectedDay),
    [selectedDay],
  );
  const weekDays = useMemo(() => getWeekDays(NUTRITION_PLAN), []);

  useEffect(() => {
    setIsDayDetailsOpen(false);
    setSelectedSlotType(null);
    setSelectedTopStat(null);
  }, [selectedDate]);

  const orderedMeals = useMemo(
    () =>
      MEAL_SLOT_ORDER.map((slotType) =>
        selectedDay.meals.find((meal) => meal.slot === slotType),
      ).filter(Boolean),
    [selectedDay],
  );
  const basisBreakdownLines = useMemo(
    () =>
      selectedDay.meals.flatMap((slot) => {
        const meal = getMealById(NUTRITION_PLAN, slot.mealId);

        if (slot.isExternal || !meal?.nutrition) {
          return [];
        }

        return [
          `${getMealSlotLabel(slot.slot)}: ${meal.name} (${meal.nutrition.kcal} kcal, ${meal.nutrition.protein} g Protein)`,
        ];
      }),
    [selectedDay],
  );
  const plannedMealCount = selectedDay.meals.length;
  const targetKcalPerSlot = Math.round(selectedDay.targets.kcalTarget / plannedMealCount);
  const targetProteinPerSlot = Math.round(selectedDay.targets.proteinTarget / plannedMealCount);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <AppTabHeader
        icon={UtensilsCrossed}
        title="Ernährung"
        subtitle={
          <>
            {selectedDay.dayLabel}, {selectedDay.date}. {selectedDay.monthLabel}
            {" · "}
            {plannedMacros.kcal} kcal geplant
          </>
        }
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="hide-scrollbar flex-1 overflow-y-auto px-6 pt-[112px] pb-[104px]">
        <div className="space-y-6">
          <WeekCalendar
            days={weekDays}
            activeDate={selectedDate}
            onDateChange={setSelectedDate}
            className="flex items-center justify-between rounded-[16px] border border-gray-100/60 bg-white p-2 shadow-sm"
          />

          <section className="rounded-[20px] border border-[#E4E9E4] bg-[#F2F4F2] p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#E4E9E4] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4A634A]">
                    Proteinfokus
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      externalMealCount > 0
                        ? "bg-[#F5EBDD] text-[#A36A3B]"
                        : "bg-[#E8EFE8] text-[#4A634A]"
                    }`}
                  >
                    {externalMealCount > 0 ? `${externalMealCount} externer Slot offen` : "Voll geplant"}
                  </span>
                </div>
                <p className="text-[11px] leading-snug text-gray-800">
                  {selectedDay.dailyLogic}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <TopStatCard
                icon={Flame}
                label="Ziel"
                value={`${selectedDay.targets.kcalTarget}`}
                sublabel="kcal"
                detailTitle="Kalorienziel"
                detailLines={[
                  `${selectedDay.training}.`,
                  selectedDay.dailyLogic,
                  `Auf vier Slots verteilt sind das grob ${targetKcalPerSlot} kcal pro Meal.`,
                ]}
                detailFooter={
                  externalMealCount > 0
                    ? `${externalMealCount} externer Slot bleibt dabei bewusst flexibel geplant.`
                    : "Alle vier Slots sind als fixe Planmeals hinterlegt."
                }
                onOpenDetails={setSelectedTopStat}
              />
              <TopStatCard
                icon={Leaf}
                label="Protein"
                value={`${selectedDay.targets.proteinTarget}`}
                sublabel="g Minimum"
                detailTitle="Proteinminimum"
                detailLines={[
                  `Tagesminimum fuer ${selectedDay.dayLabel}: ${selectedDay.targets.proteinTarget} g Protein.`,
                  `Auf vier Slots verteilt sind das grob ${targetProteinPerSlot} g pro Meal.`,
                  externalMealCount > 0
                    ? `${externalMealCount} externer Slot sollte proteinbewusst gewaehlt werden.`
                    : "Das komplette Proteinminimum wird ueber Planmeals abgebildet.",
                ]}
                onOpenDetails={setSelectedTopStat}
              />
              <TopStatCard
                icon={CalendarDays}
                label="Basis"
                value={`${plannedMacros.kcal}`}
                sublabel={`${plannedMacros.protein} g Protein`}
                detailTitle="Im Basiswert enthalten"
                detailLines={basisBreakdownLines}
                detailFooter={
                  externalMealCount > 0
                    ? `Externe Meals sind hier nicht eingerechnet. Aktuell offen: ${externalMealCount} Slot.`
                    : "Die Basis deckt alle Planmeals des Tages ab."
                }
                onOpenDetails={setSelectedTopStat}
              />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Vier Meals pro Tag
              </h3>
              <button
                onClick={() => setIsDayDetailsOpen(true)}
                className="text-[11px] font-semibold text-[#4A634A] transition-colors hover:text-[#314631]"
              >
                Details
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              {orderedMeals.map((slot) => {
                if (!slot) {
                  return null;
                }

                const meal = getMealById(NUTRITION_PLAN, slot.mealId);
                const slotMeta = SLOT_META[slot.slot];
                const Icon = slotMeta.icon;
                const subtitle = slot.isExternal
                  ? "Proteinreich waehlen, Calcium und Jod im Blick behalten."
                  : getMealSubtitle(meal);
                const kcalValue = slot.isExternal
                  ? "650-800"
                  : `${meal?.nutrition?.kcal ?? "-"}`;
                const proteinValue = slot.isExternal
                  ? "25-30 g"
                  : `${meal?.nutrition?.protein ?? "-"} g`;

                return (
                  <button
                    key={`${selectedDay.isoDate}-${slot.slot}`}
                    onClick={() => setSelectedSlotType(slot.slot)}
                    className={`w-full max-w-[352px] rounded-[20px] border p-3 text-left shadow-sm transition-colors hover:brightness-[0.99] active:scale-[0.99] ${slotMeta.surfaceClassName} ${slotMeta.borderClassName}`}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2.5 gap-y-2">
                      <div className="min-w-0 pl-1 pr-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Icon size={18} className={slotMeta.iconClassName} strokeWidth={2} />
                          <h4 className="text-[15px] font-bold leading-tight text-gray-900">
                            {meal?.name ?? "Extern"}
                          </h4>
                        </div>
                        <p className="text-[11.5px] leading-snug text-gray-700">
                          {subtitle}
                        </p>
                      </div>

                      <div className="row-span-2 flex shrink-0 flex-col gap-1.5">
                        <div className={`flex items-center justify-center rounded-[10px] px-2 py-1.5 text-[8px] font-bold uppercase tracking-wide ${slotMeta.badgeClassName}`}>
                          {getMealSlotLabel(slot.slot)}
                        </div>
                        <div className={`flex min-w-[66px] items-center justify-center rounded-[10px] border px-1.5 py-1.5 text-center ${slot.isExternal ? 'border-[#EEDCCB] bg-[#F8EEE1]' : 'border-white/70 bg-white/70'}`}>
                          <span className={`text-[11px] font-bold leading-none ${slot.isExternal ? 'text-[#A36A3B]' : 'text-gray-900'}`}>
                            {kcalValue}
                            <span className={`ml-1 text-[8px] font-bold uppercase tracking-wide ${slot.isExternal ? 'text-[#A36A3B]' : 'text-gray-500'}`}>
                              Kcal
                            </span>
                          </span>
                        </div>
                        <div className={`flex min-w-[66px] flex-col items-center justify-center rounded-[10px] border px-1.5 py-1.5 text-center ${slot.isExternal ? 'border-[#EEDCCB] bg-[#F8EEE1]' : 'border-white/70 bg-white/70'}`}>
                          <span className={`text-[11px] font-bold leading-none ${slot.isExternal ? 'text-[#A36A3B]' : 'text-gray-900'}`}>
                            {proteinValue}
                            <span className={`ml-1 text-[8px] font-bold uppercase tracking-wide ${slot.isExternal ? 'text-[#A36A3B]' : 'text-gray-500'}`}>
                              Prot.
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center gap-3 whitespace-nowrap pl-1 text-[11px] font-bold text-gray-800">
                        <span className="shrink-0 text-gray-600">
                          {slot.isExternal ? "Ausser Haus" : meal?.cookTime}
                        </span>
                        {!slot.isExternal && meal ? (
                          <>
                            {meal.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={`${meal.id}-${tag}`}
                                className={`flex min-w-0 items-center gap-1 ${index === 1 ? "flex-1 truncate" : "shrink-0"}`}
                              >
                                <UtensilsCrossed size={12} className="shrink-0 text-gray-500" strokeWidth={2.5} />
                                <span className={index === 1 ? "truncate" : undefined}>{tag}</span>
                              </span>
                            ))}
                          </>
                        ) : (
                          <span className="flex min-w-0 items-center gap-1 truncate text-[#A36A3B]">
                            <AlertTriangle size={12} className="shrink-0 text-[#A36A3B]" strokeWidth={2.5} />
                            Guidance statt Fixwert
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Meal-Prep & Reste
            </h3>
            <div className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
              {prepNotes.length > 0 ? (
                <div className="space-y-2.5">
                  {prepNotes.map((note) => (
                    <div
                      key={`${selectedDay.isoDate}-${note.title}`}
                      className="rounded-[16px] bg-[#F7F6F1] p-3"
                    >
                      <p className="text-[13px] font-bold text-gray-900">{note.title}</p>
                      <p className="mt-1 text-[12px] leading-snug text-gray-600">{note.subtitle}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] leading-snug text-gray-600">
                  Fuer diesen Tag ist kein spezieller Batch- oder Restelogik-Hinweis hinterlegt.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[18px] border border-[#E8E6DD] bg-[#F4F2EC] p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white/80">
                <Sparkles size={18} className="text-[#4A634A]" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900">Wocheninfo</p>
                <p className="mt-1 text-[12px] leading-snug text-gray-600">
                  {NUTRITION_PLAN.week.planLabel}
                </p>
                <p className="mt-2 text-[12px] font-medium text-gray-700">
                  Budget: {formatEuro(NUTRITION_PLAN.budget.totalCost)} / {formatEuro(NUTRITION_PLAN.budget.budgetHardCap)} EUR
                </p>
                <p className="mt-1 text-[11px] leading-snug text-gray-500">
                  {NUTRITION_PLAN.budget.status} {NUTRITION_PLAN.budget.note}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <NutritionMealDetailDrawer
        day={selectedDay}
        slot={selectedSlot}
        meal={selectedMeal}
        externalGuidance={NUTRITION_PLAN.externalMealGuidance}
        onClose={() => setSelectedSlotType(null)}
      />
      <NutritionDayDetailDrawer
        day={selectedDay}
        plan={NUTRITION_PLAN}
        open={isDayDetailsOpen}
        initialSlotType={selectedSlotType}
        onClose={() => setIsDayDetailsOpen(false)}
      />
      <TopStatDetailDrawer
        stat={selectedTopStat}
        onClose={() => setSelectedTopStat(null)}
      />
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={setIsProfileOpen}
      />
    </div>
  );
}

function TopStatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  detailTitle,
  detailLines,
  detailFooter,
  onOpenDetails,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
  detailTitle?: string;
  detailLines?: string[];
  detailFooter?: string;
  onOpenDetails?: (details: TopStatDetails) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!detailTitle || !detailLines?.length || !onOpenDetails) {
          return;
        }

        onOpenDetails({
          icon: Icon,
          label,
          value,
          sublabel,
          title: detailTitle,
          lines: detailLines,
          footer: detailFooter,
        });
      }}
      className="w-full rounded-[14px] border border-white/70 bg-white/70 px-2.5 py-2 text-left transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6A816A]/35 active:scale-[0.99]"
      aria-label={`${label}: ${value} ${sublabel}`}
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-gray-500">
        <div className="flex items-center gap-1.5">
          <Icon size={12} />
          <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <MoreHorizontal size={12} className="shrink-0 text-gray-400" />
      </div>
      <p className="text-[15px] font-bold leading-none text-gray-900">{value}</p>
      <p className="mt-0.5 text-[9px] font-medium leading-tight text-gray-500">{sublabel}</p>
    </button>
  );
}

function TopStatDetailDrawer({
  stat,
  onClose,
}: {
  stat: TopStatDetails | null;
  onClose: () => void;
}) {
  const Icon = stat?.icon;

  return (
    <Drawer open={!!stat} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="mx-auto max-w-[390px] rounded-t-[24px] border-t-0 bg-[#F5F4EF]">
        <DrawerTitle className="sr-only">
          {stat ? `${stat.label} Details` : "KPI Details"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Detailerklaerung zur ausgewaehlten Kennzahl.
        </DrawerDescription>

        {stat ? (
          <div className="px-5 pb-6 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white shadow-sm">
                  {Icon ? <Icon size={18} className="text-[#4A634A]" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6A816A]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-[18px] font-bold leading-tight text-gray-900">
                    {stat.title}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-gray-500">
                    {stat.value} {stat.sublabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-white hover:text-gray-700"
                aria-label="Details schliessen"
              >
                <ChevronLeft size={18} className="rotate-[-90deg]" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {stat.lines.map((line) => (
                <div key={line} className="rounded-[16px] bg-white px-3 py-2.5 shadow-sm">
                  <p className="text-[12px] leading-snug text-gray-700">{line}</p>
                </div>
              ))}
            </div>

            {stat.footer ? (
              <div className="mt-4 rounded-[16px] border border-[#E4E9E4] bg-[#EDF2EC] px-3 py-3">
                <p className="text-[11px] leading-snug text-[#4A634A]">{stat.footer}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function getMealSubtitle(meal: MealRecipe | null) {
  if (!meal) {
    return "Kein Rezept gefunden.";
  }

  const ingredientsPreview = meal.ingredients
    .slice(0, 3)
    .map((ingredient) => ingredient.ingredient)
    .join(", ");

  return `${ingredientsPreview}${meal.ingredients.length > 3 ? " ..." : ""}`;
}

function formatEuro(value: number) {
  return value.toFixed(2).replace(".", ",");
}
