import React, { useEffect, useMemo, useState } from "react";
import { Drawer } from "vaul";
import {
  AlertTriangle,
  ChevronLeft,
  CircleCheck,
} from "lucide-react";
import {
  MEAL_SLOT_ORDER,
  createNutritionBreakdown,
  getMealById,
  getMealSlotLabel,
  type MacroEstimate,
  type MealSlotType,
  type NutritionBreakdown,
  type NutritionDay,
  type NutritionPlan,
} from "../data/nutritionPlan";

type DetailValueItem = {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
  indent?: boolean;
};

type DetailValueGroup = {
  title: string | null;
  items: DetailValueItem[];
};

const DEFAULT_EXTERNAL_ESTIMATE: MacroEstimate = {
  kcal: 725,
  protein: 28,
  carbs: 75,
  fat: 20,
  breakdown: createNutritionBreakdown({
    fiber: 9,
    sugar: 8,
    addedSugar: 2,
    saturatedFat: 4.5,
    monounsaturatedFat: 7,
    polyunsaturatedFat: 5,
    transFat: 0,
    cholesterol: 0,
    sodium: 780,
    salt: 2,
    water: 320,
    alcohol: 0,
    biotin: 8,
    vitaminC: 10,
    vitaminD: 0.8,
    vitaminE: 2.1,
    vitaminK: 14,
    iron: 4.2,
    potassium: 760,
    calcium: 180,
    magnesium: 95,
    zinc: 2.4,
  }),
  estimated: true,
  note: "Externe Meal-Schaetzung auf Basis vergleichbarer Plan-Slots.",
};

interface NutritionDayDetailDrawerProps {
  day: NutritionDay | null;
  plan: NutritionPlan;
  open: boolean;
  initialSlotType?: MealSlotType | null;
  onClose: () => void;
}

export function NutritionDayDetailDrawer({
  day,
  plan,
  open,
  initialSlotType,
  onClose,
}: NutritionDayDetailDrawerProps) {
  const [activeSlotType, setActiveSlotType] = useState<MealSlotType>("breakfast");

  useEffect(() => {
    if (!day) {
      return;
    }

    const nextSlot =
      initialSlotType ??
      MEAL_SLOT_ORDER.find((slotType) => day.meals.some((meal) => meal.slot === slotType)) ??
      "breakfast";
    setActiveSlotType(nextSlot);
  }, [day?.isoDate, initialSlotType]);

  const plannedMacros = useMemo(
    () => (day ? getPlannedMacrosForDrawer(plan, day) : null),
    [day, plan],
  );
  const estimatedTotals = useMemo(
    () => (day ? getEstimatedTotalsForDay(plan, day) : null),
    [day, plan],
  );
  const detailBreakdown = useMemo(
    () => (day ? getEstimatedBreakdownForDay(plan, day) : null),
    [day, plan],
  );
  const mealSummaries = useMemo(
    () => (day ? getMealSummaries(plan, day) : []),
    [day, plan],
  );
  const activeMealSummary = mealSummaries.find((meal) => meal.slotType === activeSlotType) ?? null;

  if (!day || !plannedMacros || !estimatedTotals || !detailBreakdown) {
    return null;
  }

  const externalMealCount = day.meals.filter((slot) => slot.isExternal).length;
  const chartItems = [
    {
      label: "Kohlenhydrate",
      current: plannedMacros.carbs,
      target: estimatedTotals.carbs,
    },
    {
      label: "Eiweiss",
      current: plannedMacros.protein,
      target: day.targets.proteinTarget,
    },
    {
      label: "Fett",
      current: plannedMacros.fat,
      target: estimatedTotals.fat,
    },
  ];
  const detailGroups: DetailValueGroup[] = [
    {
      title: null,
      items: [
        {
          label: "Kalorien",
          value: `${plannedMacros.kcal} / ${day.targets.kcalTarget} kcal`,
          strong: true,
        },
        {
          label: "Eiweiss",
          value: `${plannedMacros.protein} / ${day.targets.proteinTarget} g`,
          strong: true,
        },
      ],
    },
    {
      title: "Kohlenhydrate",
      items: [
        {
          label: "Kohlenhydrate",
          value: `${plannedMacros.carbs} / ${estimatedTotals.carbs} g`,
          strong: true,
        },
        { label: "Ballaststoffe", value: formatGrams(detailBreakdown.fiber), muted: true },
        { label: "Zucker", value: formatGrams(detailBreakdown.sugar), muted: true },
        { label: "Zuckerzusatz", value: formatGrams(detailBreakdown.addedSugar), muted: true, indent: true },
      ],
    },
    {
      title: "Fett",
      items: [
        {
          label: "Fett",
          value: `${plannedMacros.fat} / ${estimatedTotals.fat} g`,
          strong: true,
        },
        { label: "Gesaettigte Fettsaeuren", value: formatGrams(detailBreakdown.saturatedFat), muted: true },
        { label: "Einfach unges. Fettsaeuren", value: formatGrams(detailBreakdown.monounsaturatedFat), muted: true },
        { label: "Mehrfach unges. Fettsaeuren", value: formatGrams(detailBreakdown.polyunsaturatedFat), muted: true },
        { label: "Transfettsaeuren", value: formatGrams(detailBreakdown.transFat), muted: true },
      ],
    },
    {
      title: "Sonstiges",
      items: [
        { label: "Cholesterin", value: formatMilligrams(detailBreakdown.cholesterol), muted: true },
        { label: "Natrium", value: formatMilligrams(detailBreakdown.sodium), muted: true },
        { label: "Salz", value: formatGrams(detailBreakdown.salt), muted: true },
        { label: "Wasser", value: formatMilliliters(detailBreakdown.water), muted: true },
        { label: "Alkohol", value: formatGrams(detailBreakdown.alcohol), muted: true },
      ],
    },
    {
      title: "Vitamine",
      items: [
        { label: "Vitamin B7 (Biotin)", value: formatMicrograms(detailBreakdown.biotin), muted: true },
        { label: "Vitamin C", value: formatMilligrams(detailBreakdown.vitaminC), muted: true },
        { label: "Vitamin D", value: formatMicrograms(detailBreakdown.vitaminD), muted: true },
        { label: "Vitamin E", value: formatMilligrams(detailBreakdown.vitaminE), muted: true },
        { label: "Vitamin K", value: formatMicrograms(detailBreakdown.vitaminK), muted: true },
      ],
    },
    {
      title: "Mineralstoffe",
      items: [
        { label: "Eisen", value: formatMilligrams(detailBreakdown.iron), muted: true },
        { label: "Kalium", value: formatMilligrams(detailBreakdown.potassium), muted: true },
        { label: "Kalzium", value: formatMilligrams(detailBreakdown.calcium), muted: true },
        { label: "Magnesium", value: formatMilligrams(detailBreakdown.magnesium), muted: true },
        { label: "Zink", value: formatMilligrams(detailBreakdown.zinc), muted: true },
      ],
    },
  ];

  return (
    <Drawer.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-[95vh] max-w-[390px] flex-col overflow-hidden rounded-t-[24px] bg-[#F5F4EF] outline-none">
          <Drawer.Description className="sr-only">
            Tagesdetails fuer Naehrwerte, Meal-Slots und kritische Mikronaehrstoffe.
          </Drawer.Description>

          <div className="flex items-center justify-between border-b border-[#EBEAE4] bg-white px-4 py-3">
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-900 transition-colors hover:bg-gray-100"
              aria-label="Zurueck"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center">
              <Drawer.Title className="text-[16px] font-bold text-gray-900">
                Details
              </Drawer.Title>
              <p className="text-[11px] font-medium text-gray-500">
                {day.dayLabel}, {day.date}. {day.monthLabel}
              </p>
            </div>
            <div className="w-8" />
          </div>

          <div className="hide-scrollbar flex-1 overflow-y-auto px-4 pb-5 pt-4">
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Tagesziele
                </h3>
                <div className="rounded-[18px] border border-[#DADFD8] bg-white p-4 shadow-sm">
                  <GoalProgress
                    label="Kalorien-Basis"
                    current={plannedMacros.kcal}
                    target={day.targets.kcalTarget}
                    unit="kcal"
                    colorClassName="bg-[#6A816A]"
                  />
                  <GoalProgress
                    label="Protein-Basis"
                    current={plannedMacros.protein}
                    target={day.targets.proteinTarget}
                    unit="g"
                    colorClassName="bg-[#A3B8A3]"
                  />
                  <GoalProgress
                    label="Kohlenhydrate-Basis"
                    current={plannedMacros.carbs}
                    target={estimatedTotals.carbs}
                    unit="g"
                    colorClassName="bg-[#B7BCA7]"
                  />
                  <GoalProgress
                    label="Fett-Basis"
                    current={plannedMacros.fat}
                    target={estimatedTotals.fat}
                    unit="g"
                    colorClassName="bg-[#C1B29A]"
                  />

                  <div className="mt-4 rounded-[16px] bg-[#F7F6F1] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Heute mitdenken
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {plan.week.microRoutine.slice(0, 4).map((item) => (
                        <span
                          key={item}
                          className="rounded-[8px] bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-700 shadow-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    {externalMealCount > 0 ? (
                      <p className="mt-3 text-[11px] leading-snug text-[#A36A3B]">
                        {externalMealCount} externer Slot ist eingeplant. Kohlenhydrate und Fett
                        enthalten hier Schaetzungen aus vergleichbaren Plan-Meals.
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Mahlzeiten
                </h3>
                <div className="rounded-[18px] border border-[#DADFD8] bg-white p-4 shadow-sm">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {mealSummaries.map((meal) => (
                      <button
                        key={meal.slotType}
                        onClick={() => setActiveSlotType(meal.slotType)}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                          activeSlotType === meal.slotType
                            ? "border-[#32D6BD] bg-[#F2FFFC] text-gray-900"
                            : "border-[#DADFD8] bg-white text-gray-500"
                        }`}
                      >
                        {getMealSlotLabel(meal.slotType)}
                      </button>
                    ))}
                  </div>

                  {activeMealSummary ? (
                    <div className="space-y-3">
                      <div className="rounded-[14px] bg-[#F7F6F1] p-3">
                        <p className="text-[13px] font-bold text-gray-900">
                          {activeMealSummary.title}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                          {activeMealSummary.subtitle}
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <MealMetricRow
                          label="Kalorien"
                          value={activeMealSummary.display.kcal}
                          progress={getProgressValue(
                            activeMealSummary.nutrition.kcal,
                            estimatedTotals.kcal,
                          )}
                        />
                        <MealMetricRow
                          label="Kohlenhydrate"
                          value={activeMealSummary.display.carbs}
                          progress={getProgressValue(
                            activeMealSummary.nutrition.carbs,
                            estimatedTotals.carbs,
                          )}
                        />
                        <MealMetricRow
                          label="Eiweiss"
                          value={activeMealSummary.display.protein}
                          progress={getProgressValue(
                            activeMealSummary.nutrition.protein,
                            day.targets.proteinTarget,
                          )}
                        />
                        <MealMetricRow
                          label="Fett"
                          value={activeMealSummary.display.fat}
                          progress={getProgressValue(
                            activeMealSummary.nutrition.fat,
                            estimatedTotals.fat,
                          )}
                        />
                      </div>

                      {activeMealSummary.note ? (
                        <div className="rounded-[14px] bg-[#F7F6F1] p-3">
                          <p className="text-[11px] leading-snug text-gray-500">
                            {activeMealSummary.note}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Naehrwerte
                </h3>
                <div className="rounded-[18px] border border-[#DADFD8] bg-white p-4 shadow-sm">
                  <div className="rounded-[14px] bg-[#F7F6F1] p-3">
                    <div className="mb-4 flex items-center gap-3 text-[10px] font-medium text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#32D6BD]" />
                        Basis
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#C8CDD2]" />
                        Ziel
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {chartItems.map((item) => (
                        <MacroComparisonColumn
                          key={item.label}
                          label={item.label}
                          current={item.current}
                          target={item.target}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Details
                </h3>
                <div className="space-y-4 rounded-[18px] border border-[#DADFD8] bg-white p-4 shadow-sm">
                  <div className="space-y-3">
                    {detailGroups.map((group) => (
                      <div
                        key={group.title ?? "overview"}
                        className="rounded-[14px] bg-[#F7F6F1] p-3"
                      >
                        {group.title ? (
                          <p className="mb-2 text-[11px] font-bold text-gray-900">
                            {group.title}
                          </p>
                        ) : null}
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <DetailValueRow
                              key={`${group.title ?? "overview"}-${item.label}`}
                              label={item.label}
                              value={item.value}
                              strong={item.strong}
                              muted={item.muted}
                              indent={item.indent}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[#ECEBE6] pt-4">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Kritische Mikronaehrstoffe
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {plan.criticalNutrientTips.map((tip) => (
                        <span
                          key={tip.nutrient}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            tip.status === "supplement"
                              ? "bg-[#F0EBF7] text-[#6A5F8F]"
                              : tip.status === "attention"
                                ? "bg-[#F8EEE1] text-[#A36A3B]"
                                : "bg-[#EAF2E8] text-[#4A634A]"
                          }`}
                        >
                          {tip.nutrient}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {plan.criticalNutrientTips.map((tip) => (
                        <div
                          key={`${tip.nutrient}-detail`}
                          className="flex gap-3 rounded-[14px] bg-[#F7F6F1] p-3"
                        >
                          <div className="mt-0.5">
                            {tip.status === "attention" ? (
                              <AlertTriangle size={16} className="text-[#A36A3B]" />
                            ) : (
                              <CircleCheck
                                size={16}
                                className={
                                  tip.status === "supplement"
                                    ? "text-[#6A5F8F]"
                                    : "text-[#4A634A]"
                                }
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-gray-900">
                              {tip.nutrient}
                            </p>
                            <p className="text-[12px] leading-snug text-gray-600">
                              {tip.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-[#EBEAE4] bg-white px-4 pb-8 pt-3">
            <button
              onClick={onClose}
              className="w-full rounded-[12px] bg-[#2F3130] py-3.5 text-[13px] font-bold text-white shadow-sm transition-transform active:scale-95"
            >
              Schliessen
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function GoalProgress({
  label,
  current,
  target,
  unit,
  colorClassName,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  colorClassName: string;
}) {
  const progress = Math.min(getProgressValue(current, target) * 100, 100);

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[13px] font-bold text-gray-900">{label}</span>
        <span className="text-[12px] font-medium text-gray-500">
          <span className="text-gray-900">{current}</span> / {target} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E4E7DE]">
        <div
          className={`h-full rounded-full ${colorClassName}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function MealMetricRow({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="rounded-[14px] bg-[#F7F6F1] p-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-gray-700">{label}</span>
        <span className="text-[13px] font-bold text-gray-900">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E7EAEC]">
        <div
          className="h-full rounded-full bg-[#D9DEE2]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function MacroComparisonColumn({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const progress = getProgressValue(current, target);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-28 items-end gap-2">
        <div className="flex h-full items-end">
          <div className="h-full w-3 rounded-t-[4px] bg-[#E1E5E8]" />
        </div>
        <div className="flex h-full items-end">
          <div
            className="w-3 rounded-t-[4px] bg-[#A8B0B6]"
            style={{ height: `${Math.max(progress * 100, 4)}%` }}
          />
        </div>
      </div>
      <div className="flex w-full justify-center gap-4 text-[10px] font-medium text-gray-500">
        <span>{Math.round(progress * 100)}%</span>
        <span>100%</span>
      </div>
      <p className="text-center text-[11px] font-bold text-gray-800">{label}</p>
    </div>
  );
}

function DetailValueRow({
  label,
  value,
  strong,
  muted,
  indent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
  indent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`min-w-0 ${
          strong
            ? "text-[13px] font-bold text-gray-900"
            : muted
              ? `${indent ? "pl-4" : ""} text-[12px] font-medium text-gray-500`
              : "text-[13px] font-medium text-gray-700"
        }`}
      >
        {label}
      </span>
      <span
        className={`shrink-0 ${
          strong
            ? "text-[13px] font-bold text-gray-700"
            : muted
              ? "text-[12px] font-medium text-gray-500"
              : "text-[13px] font-medium text-gray-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function getMealSummaries(plan: NutritionPlan, day: NutritionDay) {
  return MEAL_SLOT_ORDER.map((slotType) => {
    const slot = day.meals.find((meal) => meal.slot === slotType);
    if (!slot) {
      return null;
    }

    const recipe = getMealById(plan, slot.mealId);
    const nutrition = getEstimatedNutritionForSlot(plan, day, slotType, slot.isExternal);
    const isEstimated = slot.isExternal || nutrition.estimated;

    return {
      slotType,
      title: recipe?.name ?? "Externes Meal",
      subtitle: recipe?.use ?? plan.externalMealGuidance.warning,
      nutrition,
      display: {
        kcal: slot.isExternal ? plan.externalMealGuidance.kcalRange : `${nutrition.kcal} kcal`,
        carbs: `${nutrition.carbs} g`,
        protein: slot.isExternal
          ? plan.externalMealGuidance.proteinRange
          : `${nutrition.protein} g`,
        fat: `${nutrition.fat} g`,
      },
      note: slot.isExternal
        ? "Kohlenhydrate und Fett sind fuer externe Meals aus vergleichbaren Plan-Slots geschaetzt."
        : isEstimated
          ? nutrition.note
          : recipe?.nutrition?.note ?? null,
    };
  }).filter(Boolean) as Array<{
    slotType: MealSlotType;
    title: string;
    subtitle: string;
    nutrition: MacroEstimate;
    display: Record<"kcal" | "carbs" | "protein" | "fat", string>;
    note: string | undefined | null;
  }>;
}

function getEstimatedTotalsForDay(plan: NutritionPlan, day: NutritionDay): MacroEstimate {
  return day.meals.reduce(
    (totals, slot) => {
      const nutrition = getEstimatedNutritionForSlot(plan, day, slot.slot, slot.isExternal);
      return {
        kcal: totals.kcal + nutrition.kcal,
        protein: totals.protein + nutrition.protein,
        carbs: totals.carbs + nutrition.carbs,
        fat: totals.fat + nutrition.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function getEstimatedBreakdownForDay(plan: NutritionPlan, day: NutritionDay): NutritionBreakdown {
  return day.meals.reduce((totals, slot) => {
    const nutrition = getEstimatedNutritionForSlot(plan, day, slot.slot, slot.isExternal);
    return addNutritionBreakdowns(totals, nutrition.breakdown);
  }, createNutritionBreakdown());
}

function getPlannedMacrosForDrawer(plan: NutritionPlan, day: NutritionDay): MacroEstimate {
  return day.meals.reduce(
    (totals, slot) => {
      const meal = getMealById(plan, slot.mealId);
      if (!meal?.nutrition) {
        return totals;
      }

      return {
        kcal: totals.kcal + meal.nutrition.kcal,
        protein: totals.protein + meal.nutrition.protein,
        carbs: totals.carbs + meal.nutrition.carbs,
        fat: totals.fat + meal.nutrition.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function getEstimatedNutritionForSlot(
  plan: NutritionPlan,
  day: NutritionDay,
  slotType: MealSlotType,
  isExternal: boolean,
): MacroEstimate {
  if (!isExternal) {
    const slot = day.meals.find((meal) => meal.slot === slotType);
    const recipe = getMealById(plan, slot?.mealId);
    if (recipe?.nutrition) {
      return recipe.nutrition;
    }
  }

  const comparableNutritions = plan.days
    .flatMap((nutritionDay) =>
      nutritionDay.meals
        .filter((meal) => meal.slot === slotType && !meal.isExternal)
        .map((meal) => getMealById(plan, meal.mealId)?.nutrition)
        .filter(Boolean),
    )
    .filter(Boolean) as MacroEstimate[];

  if (!comparableNutritions.length) {
    return DEFAULT_EXTERNAL_ESTIMATE;
  }

  const averageBreakdown = averageNutritionBreakdowns(
    comparableNutritions.map((nutrition) => nutrition.breakdown),
  );

  return {
    kcal: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.kcal, 0) /
        comparableNutritions.length,
    ),
    protein: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.protein, 0) /
        comparableNutritions.length,
    ),
    carbs: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.carbs, 0) /
        comparableNutritions.length,
    ),
    fat: Math.round(
      comparableNutritions.reduce((sum, nutrition) => sum + nutrition.fat, 0) /
        comparableNutritions.length,
    ),
    breakdown: averageBreakdown,
    estimated: true,
    note: "Externe Meal-Schaetzung auf Basis vergleichbarer Plan-Slots.",
  };
}

function getProgressValue(current: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(current / target, 1);
}

function addNutritionBreakdowns(
  totals: NutritionBreakdown,
  values?: NutritionBreakdown,
) {
  const nextValues = values ?? createNutritionBreakdown();

  return createNutritionBreakdown({
    fiber: roundBreakdownValue(totals.fiber + nextValues.fiber),
    sugar: roundBreakdownValue(totals.sugar + nextValues.sugar),
    addedSugar: roundBreakdownValue(totals.addedSugar + nextValues.addedSugar),
    saturatedFat: roundBreakdownValue(totals.saturatedFat + nextValues.saturatedFat),
    monounsaturatedFat: roundBreakdownValue(totals.monounsaturatedFat + nextValues.monounsaturatedFat),
    polyunsaturatedFat: roundBreakdownValue(totals.polyunsaturatedFat + nextValues.polyunsaturatedFat),
    transFat: roundBreakdownValue(totals.transFat + nextValues.transFat),
    cholesterol: roundBreakdownValue(totals.cholesterol + nextValues.cholesterol),
    sodium: roundBreakdownValue(totals.sodium + nextValues.sodium),
    salt: roundBreakdownValue(totals.salt + nextValues.salt),
    water: roundBreakdownValue(totals.water + nextValues.water),
    alcohol: roundBreakdownValue(totals.alcohol + nextValues.alcohol),
    biotin: roundBreakdownValue(totals.biotin + nextValues.biotin),
    vitaminC: roundBreakdownValue(totals.vitaminC + nextValues.vitaminC),
    vitaminD: roundBreakdownValue(totals.vitaminD + nextValues.vitaminD),
    vitaminE: roundBreakdownValue(totals.vitaminE + nextValues.vitaminE),
    vitaminK: roundBreakdownValue(totals.vitaminK + nextValues.vitaminK),
    iron: roundBreakdownValue(totals.iron + nextValues.iron),
    potassium: roundBreakdownValue(totals.potassium + nextValues.potassium),
    calcium: roundBreakdownValue(totals.calcium + nextValues.calcium),
    magnesium: roundBreakdownValue(totals.magnesium + nextValues.magnesium),
    zinc: roundBreakdownValue(totals.zinc + nextValues.zinc),
  });
}

function averageNutritionBreakdowns(
  breakdowns: Array<NutritionBreakdown | undefined>,
): NutritionBreakdown {
  const validBreakdowns = breakdowns.filter(Boolean) as NutritionBreakdown[];
  if (!validBreakdowns.length) {
    return createNutritionBreakdown();
  }

  const totals = validBreakdowns.reduce(
    (currentTotals, breakdown) => addNutritionBreakdowns(currentTotals, breakdown),
    createNutritionBreakdown(),
  );
  const divisor = validBreakdowns.length;

  return createNutritionBreakdown({
    fiber: roundBreakdownValue(totals.fiber / divisor),
    sugar: roundBreakdownValue(totals.sugar / divisor),
    addedSugar: roundBreakdownValue(totals.addedSugar / divisor),
    saturatedFat: roundBreakdownValue(totals.saturatedFat / divisor),
    monounsaturatedFat: roundBreakdownValue(totals.monounsaturatedFat / divisor),
    polyunsaturatedFat: roundBreakdownValue(totals.polyunsaturatedFat / divisor),
    transFat: roundBreakdownValue(totals.transFat / divisor),
    cholesterol: roundBreakdownValue(totals.cholesterol / divisor),
    sodium: roundBreakdownValue(totals.sodium / divisor),
    salt: roundBreakdownValue(totals.salt / divisor),
    water: roundBreakdownValue(totals.water / divisor),
    alcohol: roundBreakdownValue(totals.alcohol / divisor),
    biotin: roundBreakdownValue(totals.biotin / divisor),
    vitaminC: roundBreakdownValue(totals.vitaminC / divisor),
    vitaminD: roundBreakdownValue(totals.vitaminD / divisor),
    vitaminE: roundBreakdownValue(totals.vitaminE / divisor),
    vitaminK: roundBreakdownValue(totals.vitaminK / divisor),
    iron: roundBreakdownValue(totals.iron / divisor),
    potassium: roundBreakdownValue(totals.potassium / divisor),
    calcium: roundBreakdownValue(totals.calcium / divisor),
    magnesium: roundBreakdownValue(totals.magnesium / divisor),
    zinc: roundBreakdownValue(totals.zinc / divisor),
  });
}

function roundBreakdownValue(value: number) {
  return Math.round(value * 10) / 10;
}

function formatGrams(value: number) {
  return `${value.toFixed(1).replace(".", ",")} g`;
}

function formatMilligrams(value: number) {
  return `${value.toFixed(0).replace(".", ",")} mg`;
}

function formatMicrograms(value: number) {
  return `${value.toFixed(1).replace(".", ",")} ug`;
}

function formatMilliliters(value: number) {
  return `${value.toFixed(0).replace(".", ",")} ml`;
}
