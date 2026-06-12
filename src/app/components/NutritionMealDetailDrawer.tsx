import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  Clock,
  CookingPot,
  Info,
  MoonStar,
  Soup,
  Sun,
  UtensilsCrossed,
  Apple,
} from "lucide-react";
import {
  DetailDrawer,
  HeroBadge,
  HeroTitleBlock,
  StatsBarItem,
} from "./ui/DetailDrawer";
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
  const slotType = slot?.slot;
  const slotMeta = slotType ? SLOT_META[slotType] : null;

  if (!day || !slot || !slotMeta || !slotType) {
    return null;
  }

  const Icon = slotMeta.icon;
  const title = meal?.name ?? externalGuidance.title;
  const subtitle = meal?.use ?? "Außer Haus eingeplant und bewusst unpräzise als Range dargestellt.";

  const overviewTab = (
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
  );

  const preparationTab = meal?.preparation?.length ? (
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
  ) : null;

  const tabs = [{ label: "Überblick", content: overviewTab }];
  if (preparationTab) {
    tabs.push({ label: "Zubereitung", content: preparationTab });
  }

  return (
    <DetailDrawer
      open={!!slot}
      onClose={onClose}
      title="Meal-Details"
      description="Detailansicht für eine Mahlzeit mit Zutaten, Makros und optionalen Zubereitungsschritten."
      hero={{
        surfaceClassName: slotMeta.surfaceClassName,
        badges: (
          <>
            <HeroBadge className={slotMeta.badgeClassName}>
              {getMealSlotLabel(slotType)}
            </HeroBadge>
            <HeroBadge className="bg-white/75 text-gray-700">
              {slot.isExternal ? "Extern" : `${meal?.batchServings ?? 1} Portion${meal?.batchServings === 1 ? "" : "en"}`}
            </HeroBadge>
          </>
        ),
        titleBlock: (
          <HeroTitleBlock
            icon={<Icon size={22} className="text-gray-900" />}
            title={title}
            subtitle={subtitle}
          />
        ),
        statsBar: (
          <>
            <StatsBarItem
              icon={<CalendarDays size={14} className="text-gray-300" />}
              label={`${day.dayLabel}, ${day.date}. ${day.monthLabel}`}
            />
            <StatsBarItem
              icon={<Clock size={14} className="text-gray-300" />}
              label={meal?.cookTime ?? externalGuidance.kcalRange}
            />
            <StatsBarItem
              icon={<Info size={14} className="text-gray-300" />}
              label={meal?.nutrition ? `${meal.nutrition.protein} g Protein` : externalGuidance.proteinRange}
            />
          </>
        ),
      }}
      tabs={tabs}
      bodyClassName="space-y-5 p-5"
      footer={
        <button
          onClick={onClose}
          className="w-full rounded-[12px] bg-[#6A816A] py-3.5 text-[13px] font-bold text-white shadow-sm transition-transform active:scale-95"
        >
          Schliessen
        </button>
      }
    />
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
