import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronLeft, Loader2, Plus, Save, Settings, Trash2 } from "lucide-react";
import type {
  KitchenAppliance,
  Profile,
  TimeBlock,
  TrainingTargetEvent,
  UserPreferences,
  Weekday,
} from "../../domain";
import { useProfileSettings } from "../profile/useProfileSettings";

type ProfileTab = "profile" | "nutrition" | "training" | "week";

const weekdays: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const kitchenAppliances: KitchenAppliance[] = [
  "stand_mixer",
  "food_processor",
  "blender",
  "vacuum_sealer",
  "oven",
  "microwave",
  "air_fryer",
  "rice_cooker",
  "pressure_cooker",
  "slow_cooker",
  "toaster",
  "induction_stove",
  "gas_stove",
  "fridge",
  "freezer",
];

export function ProfileView() {
  const navigate = useNavigate();
  const settings = useProfileSettings();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [profileDraft, setProfileDraft] = useState<Profile | null>(null);
  const [preferencesDraft, setPreferencesDraft] = useState<UserPreferences | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings.profile) {
      setProfileDraft(settings.profile);
    }

    if (settings.preferences) {
      setPreferencesDraft(settings.preferences);
    }
  }, [settings.profile, settings.preferences]);

  const canSave =
    profileDraft &&
    preferencesDraft &&
    settings.status !== "saving" &&
    settings.status !== "loading";

  const save = async () => {
    if (!profileDraft || !preferencesDraft) {
      return;
    }

    const savedProfile = await settings.saveProfile(profileDraft);
    const savedPreferences = await settings.savePreferences(preferencesDraft);

    if (savedProfile && savedPreferences) {
      setMessage("Profil und Defaults gespeichert.");
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#FAF9F6]">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-[#FAF9F6]/95 px-5 pb-4 pt-8 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-200/60"
            aria-label="Zurueck"
          >
            <ChevronLeft size={22} className="text-gray-900" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E7A5E]">
              Einstellungen
            </p>
            <h1 className="truncate text-lg font-bold text-gray-900">Profil</h1>
          </div>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => void save()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 shadow-sm disabled:opacity-50"
            aria-label="Speichern"
          >
            {settings.status === "saving" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")}>
            Profil
          </TabButton>
          <TabButton active={activeTab === "nutrition"} onClick={() => setActiveTab("nutrition")}>
            Ernaehrung
          </TabButton>
          <TabButton active={activeTab === "training"} onClick={() => setActiveTab("training")}>
            Training
          </TabButton>
          <TabButton active={activeTab === "week"} onClick={() => setActiveTab("week")}>
            Woche
          </TabButton>
        </div>
      </header>

      <main className="hide-scrollbar flex-1 overflow-y-auto px-6 py-5 pb-28">
        <RuntimeNotice status={settings.status} error={settings.error} />

        {profileDraft && preferencesDraft ? (
          <div className="space-y-5">
            <ProfileSummary profile={profileDraft} preferences={preferencesDraft} />

            {activeTab === "profile" ? (
              <ProfileForm profile={profileDraft} onChange={setProfileDraft} />
            ) : null}

            {activeTab === "nutrition" ? (
              <NutritionForm preferences={preferencesDraft} onChange={setPreferencesDraft} />
            ) : null}

            {activeTab === "training" ? (
              <TrainingForm preferences={preferencesDraft} onChange={setPreferencesDraft} />
            ) : null}

            {activeTab === "week" ? (
              <WeekForm preferences={preferencesDraft} onChange={setPreferencesDraft} />
            ) : null}

            {message ? (
              <div className="flex items-center gap-2 rounded-[14px] border border-[#DCE7DC] bg-[#F2F7F2] p-3 text-[12px] font-bold text-[#4A634A]">
                <Check size={15} />
                {message}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[18px] border border-gray-100 bg-white p-4 text-[13px] font-bold text-gray-700 shadow-sm">
            Profil wird geladen.
          </div>
        )}
      </main>

      <footer className="absolute inset-x-0 bottom-[80px] z-20 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent px-6 pb-4 pt-6">
        <button
          type="button"
          disabled={!canSave}
          onClick={() => void save()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-[#5E7A5E] text-[15px] font-bold text-white shadow-lg transition-colors disabled:opacity-50"
        >
          {settings.status === "saving" ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              Speichern
              <Save size={18} />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}

function RuntimeNotice({
  status,
  error,
}: {
  status: ReturnType<typeof useProfileSettings>["status"];
  error: string | null;
}) {
  if (!error && status !== "signedOut" && status !== "unavailable") {
    return null;
  }

  return (
    <div className="mb-5 rounded-[16px] border border-[#E5E0D4] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEF4EE]">
          <Settings size={18} className="text-[#5E7A5E]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-900">
            {status === "signedOut" ? "Anmeldung erforderlich" : "Profil-Modus"}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500">
            {error ?? "Lokale Demo-Defaults sind aktiv."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSummary({
  profile,
  preferences,
}: {
  profile: Profile;
  preferences: UserPreferences;
}) {
  const age = useMemo(
    () => (profile.birthYear ? new Date().getFullYear() - profile.birthYear : null),
    [profile.birthYear],
  );
  const primaryTarget = preferences.training.targetEvents?.find(
    (event) => event.id === preferences.training.primaryTargetEventId,
  );

  return (
    <section className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF4EE] text-xl font-bold text-[#4A634A]">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            profile.displayName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-gray-900">
            {profile.displayName}
          </h2>
          <p className="mt-1 text-[12px] text-gray-500">
            {age ? `${age} Jahre` : "Alter offen"} - {preferences.nutrition.dietType} -{" "}
            {preferences.training.sessionsPerWeek} Trainings/Woche
            {primaryTarget ? ` - ${primaryTarget.title}` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function ProfileForm({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (profile: Profile) => void;
}) {
  return (
    <Section title="Identitaet und Planung">
      <TextInput
        label="Name"
        value={profile.displayName}
        onChange={(displayName) => onChange({ ...profile, displayName })}
      />
      <TextInput
        label="Avatar URL"
        value={profile.avatarUrl ?? ""}
        onChange={(avatarUrl) => onChange({ ...profile, avatarUrl: emptyToUndefined(avatarUrl) })}
      />
      <NumberInput
        label="Geburtsjahr"
        value={profile.birthYear}
        onChange={(birthYear) => onChange({ ...profile, birthYear })}
      />
      <NumberInput
        label="Groesse cm"
        value={profile.heightCm}
        onChange={(heightCm) => onChange({ ...profile, heightCm })}
      />
      <NumberInput
        label="Gewicht kg"
        value={profile.weightKg}
        onChange={(weightKg) => onChange({ ...profile, weightKg })}
      />
      <SelectInput
        label="Aktivitaet"
        value={profile.activityLevel}
        options={["low", "medium", "high"]}
        onChange={(activityLevel) =>
          onChange({ ...profile, activityLevel: activityLevel as Profile["activityLevel"] })
        }
      />
      <SelectInput
        label="Planungsstil"
        value={profile.planningPersona ?? "structured"}
        options={["structured", "flexible", "minimalist"]}
        onChange={(planningPersona) =>
          onChange({
            ...profile,
            planningPersona: planningPersona as Profile["planningPersona"],
          })
        }
      />
    </Section>
  );
}

function NutritionForm({
  preferences,
  onChange,
}: {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}) {
  const nutrition = preferences.nutrition;
  const updateNutrition = (patch: Partial<UserPreferences["nutrition"]>) =>
    onChange({ ...preferences, nutrition: { ...nutrition, ...patch } });
  const updateGoals = (patch: Partial<NonNullable<UserPreferences["nutrition"]["goals"]>>) =>
    updateNutrition({ goals: { primary: "health", secondary: [], ...nutrition.goals, ...patch } });
  const updateMealTiming = (
    patch: Partial<NonNullable<UserPreferences["nutrition"]["mealTiming"]>>,
  ) => updateNutrition({ mealTiming: { ...nutrition.mealTiming, ...patch } });
  const updateKitchen = (
    patch: Partial<NonNullable<UserPreferences["nutrition"]["kitchen"]>>,
  ) => updateNutrition({ kitchen: { ...nutrition.kitchen, ...patch } });
  const updateContext = (
    patch: Partial<NonNullable<UserPreferences["nutrition"]["context"]>>,
  ) => updateNutrition({ context: { ...nutrition.context, ...patch } });
  const updateShopping = (
    patch: Partial<NonNullable<UserPreferences["nutrition"]["shopping"]>>,
  ) => updateNutrition({ shopping: { ...nutrition.shopping, ...patch } });

  return (
    <Section title="Ernaehrung Defaults">
      <SelectInput
        label="Diet Type"
        value={nutrition.dietType}
        options={["omnivore", "vegetarian", "vegan", "pescetarian"]}
        onChange={(dietType) =>
          updateNutrition({ dietType: dietType as UserPreferences["nutrition"]["dietType"] })
        }
      />
      <SelectInput
        label="Primaeres Ziel"
        value={nutrition.goals?.primary ?? "health"}
        options={["maintain", "fat_loss", "muscle_gain", "performance", "health"]}
        onChange={(primary) =>
          updateGoals({ primary: primary as NonNullable<typeof nutrition.goals>["primary"] })
        }
      />
      <LineListInput
        label="Sekundaere Ziele"
        value={nutrition.goals?.secondary ?? []}
        onChange={(secondary) =>
          updateGoals({
            secondary: secondary as NonNullable<typeof nutrition.goals>["secondary"],
          })
        }
      />
      <LineListInput
        label="Allergien"
        value={nutrition.allergies}
        onChange={(allergies) => updateNutrition({ allergies })}
      />
      <LineListInput
        label="Nicht einplanen"
        value={nutrition.excludedIngredients}
        onChange={(excludedIngredients) => updateNutrition({ excludedIngredients })}
      />
      <LineListInput
        label="Bevorzugte Zutaten"
        value={nutrition.preferredIngredients}
        onChange={(preferredIngredients) => updateNutrition({ preferredIngredients })}
      />
      <NumberInput
        label="Kcal pro Tag"
        value={nutrition.dailyNutritionTarget.kcal}
        onChange={(kcal) =>
          updateNutrition({
            dailyNutritionTarget: { ...nutrition.dailyNutritionTarget, kcal },
          })
        }
      />
      <NumberInput
        label="Protein g pro Tag"
        value={nutrition.dailyNutritionTarget.protein}
        onChange={(protein) =>
          updateNutrition({
            dailyNutritionTarget: { ...nutrition.dailyNutritionTarget, protein },
          })
        }
      />
      <NumberInput
        label="Carbs g pro Tag"
        value={nutrition.dailyNutritionTarget.carbs}
        onChange={(carbs) =>
          updateNutrition({
            dailyNutritionTarget: { ...nutrition.dailyNutritionTarget, carbs },
          })
        }
      />
      <NumberInput
        label="Fett g pro Tag"
        value={nutrition.dailyNutritionTarget.fat}
        onChange={(fat) =>
          updateNutrition({
            dailyNutritionTarget: { ...nutrition.dailyNutritionTarget, fat },
          })
        }
      />
      <SelectInput
        label="Protein Prioritaet"
        value={nutrition.proteinPriority ?? "high"}
        options={["normal", "high", "very_high"]}
        onChange={(proteinPriority) =>
          updateNutrition({
            proteinPriority:
              proteinPriority as UserPreferences["nutrition"]["proteinPriority"],
          })
        }
      />
      <NumberInput
        label="Wochenbudget Cent"
        value={nutrition.weeklyBudgetCents}
        onChange={(weeklyBudgetCents) => updateNutrition({ weeklyBudgetCents })}
      />
      <NumberInput
        label="Meals pro Tag"
        value={nutrition.mealsPerDay}
        onChange={(mealsPerDay) => updateNutrition({ mealsPerDay: mealsPerDay ?? 3 })}
      />
      <SelectInput
        label="Shopping"
        value={nutrition.shoppingPreference}
        options={["budget", "balanced", "convenience"]}
        onChange={(shoppingPreference) =>
          updateNutrition({
            shoppingPreference:
              shoppingPreference as UserPreferences["nutrition"]["shoppingPreference"],
          })
        }
      />

      <AdvancedSection title="Kochen und Alltag">
        <SelectInput
          label="Kochskill"
          value={nutrition.cookingSkill ?? "intermediate"}
          options={["basic", "intermediate", "advanced"]}
          onChange={(cookingSkill) =>
            updateNutrition({
              cookingSkill: cookingSkill as UserPreferences["nutrition"]["cookingSkill"],
            })
          }
        />
        <SelectInput
          label="Kochrhythmus"
          value={nutrition.cookingFrequency ?? "mixed"}
          options={["daily", "batch", "mixed", "minimal"]}
          onChange={(cookingFrequency) =>
            updateNutrition({
              cookingFrequency:
                cookingFrequency as UserPreferences["nutrition"]["cookingFrequency"],
            })
          }
        />
        <SelectInput
          label="Meal Komplexitaet"
          value={nutrition.preferredMealComplexity ?? "simple"}
          options={["simple", "normal", "elaborate"]}
          onChange={(preferredMealComplexity) =>
            updateNutrition({
              preferredMealComplexity:
                preferredMealComplexity as UserPreferences["nutrition"]["preferredMealComplexity"],
            })
          }
        />
        <NumberInput
          label="Meal Prep Minuten"
          value={nutrition.mealPrepMinutes}
          onChange={(mealPrepMinutes) => updateNutrition({ mealPrepMinutes })}
        />
        <SelectInput
          label="Reste Toleranz"
          value={nutrition.leftoverTolerance ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(leftoverTolerance) =>
            updateNutrition({
              leftoverTolerance:
                leftoverTolerance as UserPreferences["nutrition"]["leftoverTolerance"],
            })
          }
        />
        <SelectInput
          label="Rezept Wiederholung"
          value={nutrition.recipeRepeatTolerance ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(recipeRepeatTolerance) =>
            updateNutrition({
              recipeRepeatTolerance:
                recipeRepeatTolerance as UserPreferences["nutrition"]["recipeRepeatTolerance"],
            })
          }
        />
        <SelectInput
          label="Auswaertsessen"
          value={nutrition.eatingOutFrequency ?? "sometimes"}
          options={["never", "rare", "sometimes", "often"]}
          onChange={(eatingOutFrequency) =>
            updateNutrition({
              eatingOutFrequency:
                eatingOutFrequency as UserPreferences["nutrition"]["eatingOutFrequency"],
            })
          }
        />
        <SelectInput
          label="Food Waste Sensitivitaet"
          value={nutrition.foodWasteSensitivity ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(foodWasteSensitivity) =>
            updateNutrition({
              foodWasteSensitivity:
                foodWasteSensitivity as UserPreferences["nutrition"]["foodWasteSensitivity"],
            })
          }
        />
      </AdvancedSection>

      <AdvancedSection title="Haushalt und Meal Timing">
        <NumberInput
          label="Haushaltsgroesse"
          value={nutrition.householdSize}
          onChange={(householdSize) => updateNutrition({ householdSize })}
        />
        <BooleanInput
          label="Kocht fuer andere"
          value={nutrition.cooksForOthers ?? false}
          onChange={(cooksForOthers) => updateNutrition({ cooksForOthers })}
        />
        <NumberInput
          label="Geteilte Meals pro Woche"
          value={nutrition.sharedMealsPerWeek}
          onChange={(sharedMealsPerWeek) => updateNutrition({ sharedMealsPerWeek })}
        />
        <SelectInput
          label="Fruehstueck"
          value={nutrition.mealTiming?.breakfast ?? "normal"}
          options={["none", "light", "normal", "big"]}
          onChange={(breakfast) =>
            updateMealTiming({
              breakfast:
                breakfast as NonNullable<UserPreferences["nutrition"]["mealTiming"]>["breakfast"],
            })
          }
        />
        <SelectInput
          label="Lunch"
          value={nutrition.mealTiming?.lunch ?? "normal"}
          options={["none", "light", "normal", "big"]}
          onChange={(lunch) =>
            updateMealTiming({
              lunch: lunch as NonNullable<UserPreferences["nutrition"]["mealTiming"]>["lunch"],
            })
          }
        />
        <SelectInput
          label="Dinner"
          value={nutrition.mealTiming?.dinner ?? "normal"}
          options={["none", "light", "normal", "big"]}
          onChange={(dinner) =>
            updateMealTiming({
              dinner:
                dinner as NonNullable<UserPreferences["nutrition"]["mealTiming"]>["dinner"],
            })
          }
        />
        <NumberInput
          label="Snacks pro Tag"
          value={nutrition.mealTiming?.snacksPerDay}
          onChange={(snacksPerDay) => updateMealTiming({ snacksPerDay })}
        />
      </AdvancedSection>

      <AdvancedSection title="Kueche">
        <LineListInput
          label="Geraete"
          value={nutrition.kitchen?.availableAppliances ?? []}
          onChange={(availableAppliances) =>
            updateKitchen({
              availableAppliances: availableAppliances.filter((entry): entry is KitchenAppliance =>
                kitchenAppliances.includes(entry as KitchenAppliance),
              ),
            })
          }
        />
        <LineListInput
          label="Geraete Notizen"
          value={nutrition.kitchen?.applianceNotes ?? []}
          onChange={(applianceNotes) => updateKitchen({ applianceNotes })}
        />
        <NumberInput
          label="Kuehlschrank Liter"
          value={nutrition.kitchen?.fridgeVolumeLiters}
          onChange={(fridgeVolumeLiters) => updateKitchen({ fridgeVolumeLiters })}
        />
        <NumberInput
          label="Freezer Liter"
          value={nutrition.kitchen?.freezerVolumeLiters}
          onChange={(freezerVolumeLiters) => updateKitchen({ freezerVolumeLiters })}
        />
        <SelectInput
          label="Trockenlager"
          value={nutrition.kitchen?.dryStorageCapacity ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(dryStorageCapacity) =>
            updateKitchen({
              dryStorageCapacity:
                dryStorageCapacity as NonNullable<
                  UserPreferences["nutrition"]["kitchen"]
                >["dryStorageCapacity"],
            })
          }
        />
        <NumberInput
          label="Meal Prep Container"
          value={nutrition.kitchen?.mealPrepContainerCount}
          onChange={(mealPrepContainerCount) => updateKitchen({ mealPrepContainerCount })}
        />
        <SelectInput
          label="Reste Lager"
          value={nutrition.kitchen?.leftoverStorageCapacity ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(leftoverStorageCapacity) =>
            updateKitchen({
              leftoverStorageCapacity:
                leftoverStorageCapacity as NonNullable<
                  UserPreferences["nutrition"]["kitchen"]
                >["leftoverStorageCapacity"],
            })
          }
        />
        <SelectInput
          label="Batch Cooking Kapazitaet"
          value={nutrition.kitchen?.batchCookingCapacity ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(batchCookingCapacity) =>
            updateKitchen({
              batchCookingCapacity:
                batchCookingCapacity as NonNullable<
                  UserPreferences["nutrition"]["kitchen"]
                >["batchCookingCapacity"],
            })
          }
        />
      </AdvancedSection>

      <AdvancedSection title="Arbeits- und Einkaufs-Kontext">
        <BooleanInput
          label="Isst bei Arbeit"
          value={nutrition.context?.eatsAtWork ?? false}
          onChange={(eatsAtWork) => updateContext({ eatsAtWork })}
        />
        <BooleanInput
          label="Aufwaermen moeglich"
          value={nutrition.context?.reheatingAvailable ?? true}
          onChange={(reheatingAvailable) => updateContext({ reheatingAvailable })}
        />
        <BooleanInput
          label="Portable Meals benoetigt"
          value={nutrition.context?.needsPortableMeals ?? false}
          onChange={(needsPortableMeals) => updateContext({ needsPortableMeals })}
        />
        <SelectInput
          label="Max Portable Meal Size"
          value={nutrition.context?.maxPortableMealSize ?? "medium"}
          options={["small", "medium", "large"]}
          onChange={(maxPortableMealSize) =>
            updateContext({
              maxPortableMealSize:
                maxPortableMealSize as NonNullable<
                  UserPreferences["nutrition"]["context"]
                >["maxPortableMealSize"],
            })
          }
        />
        <BooleanInput
          label="Shared Household"
          value={nutrition.context?.sharedHousehold ?? false}
          onChange={(sharedHousehold) => updateContext({ sharedHousehold })}
        />
        <LineListInput
          label="Stores"
          value={nutrition.shopping?.preferredStores ?? []}
          onChange={(preferredStores) => updateShopping({ preferredStores })}
        />
        <LineListInput
          label="Shopping Tage"
          value={nutrition.shopping?.shoppingDays ?? []}
          onChange={(shoppingDays) =>
            updateShopping({
              shoppingDays: shoppingDays.filter((day): day is Weekday =>
                weekdays.includes(day as Weekday),
              ),
            })
          }
        />
        <NumberInput
          label="Einkaeufe pro Woche"
          value={nutrition.shopping?.shoppingFrequencyPerWeek}
          onChange={(shoppingFrequencyPerWeek) => updateShopping({ shoppingFrequencyPerWeek })}
        />
        <NumberInput
          label="Max Tragegewicht kg"
          value={nutrition.shopping?.maxCarryWeightKg}
          onChange={(maxCarryWeightKg) => updateShopping({ maxCarryWeightKg })}
        />
        <SelectInput
          label="Tragekapazitaet"
          value={nutrition.shopping?.carryCapacity ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(carryCapacity) =>
            updateShopping({
              carryCapacity:
                carryCapacity as NonNullable<UserPreferences["nutrition"]["shopping"]>["carryCapacity"],
            })
          }
        />
        <SelectInput
          label="Bulk Buying"
          value={nutrition.shopping?.bulkBuyingTolerance ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(bulkBuyingTolerance) =>
            updateShopping({
              bulkBuyingTolerance:
                bulkBuyingTolerance as NonNullable<
                  UserPreferences["nutrition"]["shopping"]
                >["bulkBuyingTolerance"],
            })
          }
        />
        <SelectInput
          label="Stock Rotation"
          value={nutrition.shopping?.stockRotationTolerance ?? "medium"}
          options={["low", "medium", "high"]}
          onChange={(stockRotationTolerance) =>
            updateShopping({
              stockRotationTolerance:
                stockRotationTolerance as NonNullable<
                  UserPreferences["nutrition"]["shopping"]
                >["stockRotationTolerance"],
            })
          }
        />
      </AdvancedSection>
    </Section>
  );
}

function TrainingForm({
  preferences,
  onChange,
}: {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}) {
  const training = preferences.training;
  const updateTraining = (patch: Partial<UserPreferences["training"]>) =>
    onChange({ ...preferences, training: { ...training, ...patch } });
  const updateGoals = (patch: Partial<NonNullable<UserPreferences["training"]["goals"]>>) =>
    updateTraining({
      goals: { primary: "general_fitness", secondary: [], ...training.goals, ...patch },
    });
  const updateMetrics = (
    patch: Partial<NonNullable<UserPreferences["training"]["currentMetrics"]>>,
  ) => updateTraining({ currentMetrics: { ...training.currentMetrics, ...patch } });
  const updateHistory = (
    patch: Partial<NonNullable<UserPreferences["training"]["history"]>>,
  ) => updateTraining({ history: { ...training.history, ...patch } });
  const updateStructure = (
    patch: Partial<NonNullable<UserPreferences["training"]["structure"]>>,
  ) => updateTraining({ structure: { ...training.structure, ...patch } });
  const updateAvailability = (
    patch: Partial<NonNullable<UserPreferences["training"]["availability"]>>,
  ) => updateTraining({ availability: { ...training.availability, ...patch } });
  const updateTargetEvent = (id: string, patch: Partial<TrainingTargetEvent>) => {
    updateTraining({
      targetEvents: (training.targetEvents ?? []).map((event) =>
        event.id === id ? { ...event, ...patch } : event,
      ),
    });
  };
  const addTargetEvent = () => {
    const id = `target-${Date.now()}`;
    const nextEvents = [
      ...(training.targetEvents ?? []),
      {
        id,
        title: "Neues Ziel",
        type: "running_race" as const,
        timeHorizonWeeks: 12,
        priority: "medium" as const,
      },
    ];

    updateTraining({
      targetEvents: nextEvents,
      primaryTargetEventId: training.primaryTargetEventId ?? id,
    });
  };
  const removeTargetEvent = (id: string) => {
    const nextEvents = (training.targetEvents ?? []).filter((event) => event.id !== id);
    updateTraining({
      targetEvents: nextEvents,
      primaryTargetEventId:
        training.primaryTargetEventId === id ? nextEvents[0]?.id : training.primaryTargetEventId,
    });
  };

  return (
    <Section title="Training Defaults">
      <SelectInput
        label="Legacy Ziel"
        value={training.trainingGoal}
        options={["strength", "hypertrophy", "endurance", "mobility", "general-fitness"]}
        onChange={(trainingGoal) =>
          updateTraining({
            trainingGoal: trainingGoal as UserPreferences["training"]["trainingGoal"],
          })
        }
      />
      <SelectInput
        label="Primaeres Ziel"
        value={training.goals?.primary ?? "general_fitness"}
        options={["strength", "hypertrophy", "endurance", "mobility", "general_fitness"]}
        onChange={(primary) =>
          updateGoals({ primary: primary as NonNullable<typeof training.goals>["primary"] })
        }
      />
      <LineListInput
        label="Sekundaere Ziele"
        value={training.goals?.secondary ?? []}
        onChange={(secondary) =>
          updateGoals({
            secondary: secondary as NonNullable<typeof training.goals>["secondary"],
          })
        }
      />
      <SelectInput
        label="Level"
        value={training.experienceLevel}
        options={["beginner", "intermediate", "advanced"]}
        onChange={(experienceLevel) =>
          updateTraining({
            experienceLevel:
              experienceLevel as UserPreferences["training"]["experienceLevel"],
          })
        }
      />
      <NumberInput
        label="Sessions pro Woche"
        value={training.sessionsPerWeek}
        onChange={(sessionsPerWeek) =>
          updateTraining({ sessionsPerWeek: sessionsPerWeek ?? 3 })
        }
      />
      <NumberInput
        label="Min Sessions"
        value={training.minSessionsPerWeek}
        onChange={(minSessionsPerWeek) => updateTraining({ minSessionsPerWeek })}
      />
      <NumberInput
        label="Max Sessions"
        value={training.maxSessionsPerWeek}
        onChange={(maxSessionsPerWeek) => updateTraining({ maxSessionsPerWeek })}
      />
      <LineListInput
        label="Bevorzugte Tage"
        value={training.preferredDays}
        onChange={(preferredDays) =>
          updateTraining({
            preferredDays: preferredDays.filter((day): day is Weekday =>
              weekdays.includes(day as Weekday),
            ),
          })
        }
      />
      <SelectInput
        label="Trainingszeit"
        value={training.preferredTrainingTime ?? "evening"}
        options={["morning", "midday", "evening", "flexible"]}
        onChange={(preferredTrainingTime) =>
          updateTraining({
            preferredTrainingTime:
              preferredTrainingTime as UserPreferences["training"]["preferredTrainingTime"],
          })
        }
      />
      <TextInput
        label="Zeitfenster Start"
        value={training.preferredTimeWindow?.start ?? ""}
        onChange={(start) =>
          updateTraining({
            preferredTimeWindow: {
              start,
              end: training.preferredTimeWindow?.end ?? "20:00",
            },
          })
        }
      />
      <TextInput
        label="Zeitfenster Ende"
        value={training.preferredTimeWindow?.end ?? ""}
        onChange={(end) =>
          updateTraining({
            preferredTimeWindow: {
              start: training.preferredTimeWindow?.start ?? "18:00",
              end,
            },
          })
        }
      />
      <NumberInput
        label="Dauer Minuten"
        value={training.sessionDurationMinutes}
        onChange={(sessionDurationMinutes) => updateTraining({ sessionDurationMinutes })}
      />
      <LineListInput
        label="Equipment"
        value={training.equipment}
        onChange={(equipment) => updateTraining({ equipment })}
      />
      <LineListInput
        label="Plattformen"
        value={training.platforms ?? []}
        onChange={(platforms) => updateTraining({ platforms })}
      />
      <LineListInput
        label="Limitations"
        value={training.limitations}
        onChange={(limitations) => updateTraining({ limitations })}
      />
      <SelectInput
        label="Intensitaet"
        value={training.intensityPreference}
        options={["low", "moderate", "high"]}
        onChange={(intensityPreference) =>
          updateTraining({
            intensityPreference:
              intensityPreference as UserPreferences["training"]["intensityPreference"],
          })
        }
      />
      <SelectInput
        label="Recovery Capacity"
        value={training.recoveryCapacity ?? "medium"}
        options={["low", "medium", "high"]}
        onChange={(recoveryCapacity) =>
          updateTraining({
            recoveryCapacity:
              recoveryCapacity as UserPreferences["training"]["recoveryCapacity"],
          })
        }
      />
      <SelectInput
        label="Primaere Einschraenkung"
        value={training.primaryConstraint ?? "time"}
        options={["time", "fatigue", "equipment", "motivation", "injury"]}
        onChange={(primaryConstraint) =>
          updateTraining({
            primaryConstraint:
              primaryConstraint as UserPreferences["training"]["primaryConstraint"],
          })
        }
      />
      <SelectInput
        label="Cardio"
        value={training.cardioPreference ?? "moderate"}
        options={["none", "low", "moderate", "high"]}
        onChange={(cardioPreference) =>
          updateTraining({
            cardioPreference:
              cardioPreference as UserPreferences["training"]["cardioPreference"],
          })
        }
      />
      <SelectInput
        label="Kraft"
        value={training.strengthPreference ?? "moderate"}
        options={["none", "low", "moderate", "high"]}
        onChange={(strengthPreference) =>
          updateTraining({
            strengthPreference:
              strengthPreference as UserPreferences["training"]["strengthPreference"],
          })
        }
      />
      <SelectInput
        label="Mobility"
        value={training.mobilityPreference ?? "low"}
        options={["none", "low", "moderate", "high"]}
        onChange={(mobilityPreference) =>
          updateTraining({
            mobilityPreference:
              mobilityPreference as UserPreferences["training"]["mobilityPreference"],
          })
        }
      />

      <AdvancedSection title="Zielereignisse">
        <div className="grid gap-3">
          {(training.targetEvents ?? []).map((event) => (
            <TargetEventCard
              key={event.id}
              event={event}
              isPrimary={training.primaryTargetEventId === event.id}
              onPrimary={() => updateTraining({ primaryTargetEventId: event.id })}
              onRemove={() => removeTargetEvent(event.id)}
              onChange={(patch) => updateTargetEvent(event.id, patch)}
            />
          ))}
          <button
            type="button"
            onClick={addTargetEvent}
            className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#D9D6CC] bg-white text-[12px] font-bold text-gray-800"
          >
            <Plus size={16} />
            Ziel hinzufuegen
          </button>
        </div>
      </AdvancedSection>

      <AdvancedSection title="Gesundheit und Constraints">
        <LineListInput
          label="Injuries"
          value={training.injuries ?? []}
          onChange={(injuries) => updateTraining({ injuries })}
        />
        <LineListInput
          label="Mobility Restrictions"
          value={training.mobilityRestrictions ?? []}
          onChange={(mobilityRestrictions) => updateTraining({ mobilityRestrictions })}
        />
        <LineListInput
          label="Harte Constraints"
          value={training.hardConstraints ?? []}
          onChange={(hardConstraints) => updateTraining({ hardConstraints })}
        />
        <BooleanInput
          label="No Impact"
          value={training.noImpact ?? false}
          onChange={(noImpact) => updateTraining({ noImpact })}
        />
        <BooleanInput
          label="No Heavy Strength"
          value={training.noHeavyStrength ?? false}
          onChange={(noHeavyStrength) => updateTraining({ noHeavyStrength })}
        />
        <BooleanInput
          label="No High Intensity"
          value={training.noHighIntensity ?? false}
          onChange={(noHighIntensity) => updateTraining({ noHighIntensity })}
        />
      </AdvancedSection>

      <AdvancedSection title="Metriken">
        <NumberInput label="FTP" value={training.currentMetrics?.ftp} onChange={(ftp) => updateMetrics({ ftp })} />
        <NumberInput
          label="Threshold Pace min/km"
          value={training.currentMetrics?.thresholdPaceMinPerKm}
          onChange={(thresholdPaceMinPerKm) => updateMetrics({ thresholdPaceMinPerKm })}
        />
        <NumberInput
          label="Resting HR"
          value={training.currentMetrics?.restingHeartRate}
          onChange={(restingHeartRate) => updateMetrics({ restingHeartRate })}
        />
        <NumberInput
          label="Max HR"
          value={training.currentMetrics?.maxHeartRate}
          onChange={(maxHeartRate) => updateMetrics({ maxHeartRate })}
        />
        <NumberInput
          label="VO2max"
          value={training.currentMetrics?.vo2maxEstimate}
          onChange={(vo2maxEstimate) => updateMetrics({ vo2maxEstimate })}
        />
        <SelectInput
          label="HR Zones Source"
          value={training.currentMetrics?.hrZonesSource ?? "estimated"}
          options={["estimated", "tested", "device_based"]}
          onChange={(hrZonesSource) =>
            updateMetrics({
              hrZonesSource:
                hrZonesSource as NonNullable<
                  UserPreferences["training"]["currentMetrics"]
                >["hrZonesSource"],
            })
          }
        />
      </AdvancedSection>

      <AdvancedSection title="History, Structure, Availability">
        <NumberInput
          label="Jahre konsistent"
          value={training.history?.yearsOfConsistentTraining}
          onChange={(yearsOfConsistentTraining) => updateHistory({ yearsOfConsistentTraining })}
        />
        <LineListInput
          label="Injury History"
          value={training.history?.injuryHistory ?? []}
          onChange={(injuryHistory) => updateHistory({ injuryHistory })}
        />
        <LineListInput
          label="Sports Background"
          value={training.history?.sportsBackground ?? []}
          onChange={(sportsBackground) => updateHistory({ sportsBackground })}
        />
        <SelectInput
          label="Phase"
          value={training.structure?.currentPhase ?? "maintenance"}
          options={["base", "build", "peak", "deload", "maintenance"]}
          onChange={(currentPhase) =>
            updateStructure({
              currentPhase:
                currentPhase as NonNullable<UserPreferences["training"]["structure"]>["currentPhase"],
            })
          }
        />
        <LineListInput
          label="Discipline Mix"
          value={training.structure?.preferredDisciplineMix ?? []}
          onChange={(preferredDisciplineMix) =>
            updateStructure({
              preferredDisciplineMix:
                preferredDisciplineMix as NonNullable<
                  UserPreferences["training"]["structure"]
                >["preferredDisciplineMix"],
            })
          }
        />
        <NumberInput
          label="Weekly Volume Target"
          value={training.structure?.weeklyVolumeTargetMinutes}
          onChange={(weeklyVolumeTargetMinutes) => updateStructure({ weeklyVolumeTargetMinutes })}
        />
        <NumberInput
          label="Weekly Volume Cap"
          value={training.structure?.weeklyVolumeCapMinutes}
          onChange={(weeklyVolumeCapMinutes) => updateStructure({ weeklyVolumeCapMinutes })}
        />
        <SelectInput
          label="Double Session Tolerance"
          value={training.structure?.doubleSessionTolerance ?? "low"}
          options={["low", "medium", "high"]}
          onChange={(doubleSessionTolerance) =>
            updateStructure({
              doubleSessionTolerance:
                doubleSessionTolerance as NonNullable<
                  UserPreferences["training"]["structure"]
                >["doubleSessionTolerance"],
            })
          }
        />
        <NumberInput
          label="Deload Frequency Weeks"
          value={training.structure?.deloadFrequencyWeeks}
          onChange={(deloadFrequencyWeeks) => updateStructure({ deloadFrequencyWeeks })}
        />
        <LineListInput
          label="Must Include Disciplines"
          value={training.structure?.mustIncludeDisciplines ?? []}
          onChange={(mustIncludeDisciplines) => updateStructure({ mustIncludeDisciplines })}
        />
        <LineListInput
          label="Excluded Disciplines"
          value={training.structure?.excludedDisciplines ?? []}
          onChange={(excludedDisciplines) => updateStructure({ excludedDisciplines })}
        />
        <JsonInput
          label="Exact Time Blocks JSON"
          value={training.availability?.exactTimeBlocks ?? []}
          onChange={(exactTimeBlocks) =>
            updateAvailability({ exactTimeBlocks: exactTimeBlocks as TimeBlock[] })
          }
        />
        <SelectInput
          label="Rest Day Spacing"
          value={training.availability?.preferredRestDaySpacing ?? "loose"}
          options={["none", "loose", "strict"]}
          onChange={(preferredRestDaySpacing) =>
            updateAvailability({
              preferredRestDaySpacing:
                preferredRestDaySpacing as NonNullable<
                  UserPreferences["training"]["availability"]
                >["preferredRestDaySpacing"],
            })
          }
        />
      </AdvancedSection>
    </Section>
  );
}

function TargetEventCard({
  event,
  isPrimary,
  onPrimary,
  onRemove,
  onChange,
}: {
  event: TrainingTargetEvent;
  isPrimary: boolean;
  onPrimary: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<TrainingTargetEvent>) => void;
}) {
  return (
    <div className="rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrimary}
          className={`rounded-[10px] px-2.5 py-1 text-[11px] font-bold ${
            isPrimary ? "bg-[#E5EFE5] text-[#4A634A]" : "bg-[#F4F2EC] text-gray-500"
          }`}
        >
          {isPrimary ? "Primaer" : "Als primaer"}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7EEEE] text-[#9C3A3A]"
          aria-label="Ziel entfernen"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid gap-3">
        <TextInput label="Titel" value={event.title} onChange={(title) => onChange({ title })} />
        <SelectInput
          label="Typ"
          value={event.type}
          options={[
            "running_race",
            "cycling_event",
            "triathlon",
            "strength_test",
            "mobility_goal",
            "other",
          ]}
          onChange={(type) => onChange({ type: type as TrainingTargetEvent["type"] })}
        />
        <TextInput
          label="Zieldatum"
          value={event.targetDate ?? ""}
          onChange={(targetDate) => onChange({ targetDate: emptyToUndefined(targetDate) })}
        />
        <NumberInput
          label="Horizont Wochen"
          value={event.timeHorizonWeeks}
          onChange={(timeHorizonWeeks) => onChange({ timeHorizonWeeks })}
        />
        <NumberInput
          label="Distanz km"
          value={event.distanceKm}
          onChange={(distanceKm) => onChange({ distanceKm })}
        />
        <TextInput
          label="Zielzeit"
          value={event.targetTime ?? ""}
          onChange={(targetTime) => onChange({ targetTime: emptyToUndefined(targetTime) })}
        />
        <SelectInput
          label="Prioritaet"
          value={event.priority}
          options={["low", "medium", "high"]}
          onChange={(priority) => onChange({ priority: priority as TrainingTargetEvent["priority"] })}
        />
        <TextInput
          label="Notizen"
          value={event.notes ?? ""}
          onChange={(notes) => onChange({ notes: emptyToUndefined(notes) })}
        />
      </div>
    </div>
  );
}

function WeekForm({
  preferences,
  onChange,
}: {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}) {
  const week = preferences.week;
  const updateWeek = (patch: Partial<UserPreferences["week"]>) =>
    onChange({ ...preferences, week: { ...week, ...patch } });
  const updateSleep = (patch: Partial<NonNullable<UserPreferences["week"]["sleep"]>>) =>
    updateWeek({ sleep: { ...week.sleep, ...patch } });

  return (
    <Section title="Woche Defaults">
      <SelectInput
        label="Wochenstart"
        value={week.weekStartsOn}
        options={weekdays}
        onChange={(weekStartsOn) =>
          updateWeek({ weekStartsOn: weekStartsOn as UserPreferences["week"]["weekStartsOn"] })
        }
      />
      <NumberInput
        label="Planlaenge Tage"
        value={week.defaultDateRangeLengthDays}
        onChange={(defaultDateRangeLengthDays) =>
          updateWeek({ defaultDateRangeLengthDays: defaultDateRangeLengthDays ?? 7 })
        }
      />
      <LineListInput
        label="Fokusbereiche"
        value={week.focusAreas}
        onChange={(focusAreas) => updateWeek({ focusAreas })}
      />
      <SelectInput
        label="Puffer"
        value={week.bufferPreference}
        options={["compact", "balanced", "spacious"]}
        onChange={(bufferPreference) =>
          updateWeek({
            bufferPreference: bufferPreference as UserPreferences["week"]["bufferPreference"],
          })
        }
      />
      <SelectInput
        label="Planungsstil"
        value={week.planningStyle}
        options={["structured", "flexible", "minimal"]}
        onChange={(planningStyle) =>
          updateWeek({ planningStyle: planningStyle as UserPreferences["week"]["planningStyle"] })
        }
      />
      <SelectInput
        label="Energieverlauf"
        value={week.energyPattern ?? "morning"}
        options={["morning", "afternoon", "evening", "variable"]}
        onChange={(energyPattern) =>
          updateWeek({ energyPattern: energyPattern as UserPreferences["week"]["energyPattern"] })
        }
      />
      <SelectInput
        label="Deep Work"
        value={week.deepWorkPreference ?? "morning"}
        options={["morning", "afternoon", "evening", "none"]}
        onChange={(deepWorkPreference) =>
          updateWeek({
            deepWorkPreference:
              deepWorkPreference as UserPreferences["week"]["deepWorkPreference"],
          })
        }
      />
      <SelectInput
        label="Social Load"
        value={week.socialLoadPreference ?? "medium"}
        options={["low", "medium", "high"]}
        onChange={(socialLoadPreference) =>
          updateWeek({
            socialLoadPreference:
              socialLoadPreference as UserPreferences["week"]["socialLoadPreference"],
          })
        }
      />
      <NumberInput
        label="Max harte Tage"
        value={week.maxHardDaysPerWeek}
        onChange={(maxHardDaysPerWeek) => updateWeek({ maxHardDaysPerWeek })}
      />
      <NumberInput
        label="Max Events pro Tag"
        value={week.maxEventsPerDay}
        onChange={(maxEventsPerDay) => updateWeek({ maxEventsPerDay })}
      />
      <NumberInput
        label="Max geplante Stunden"
        value={week.maxPlannedHoursPerDay}
        onChange={(maxPlannedHoursPerDay) => updateWeek({ maxPlannedHoursPerDay })}
      />
      <NumberInput
        label="Max Kontextwechsel"
        value={week.maxContextSwitchesPerDay}
        onChange={(maxContextSwitchesPerDay) => updateWeek({ maxContextSwitchesPerDay })}
      />
      <LineListInput
        label="Geschuetzte Ruhetage"
        value={week.protectedRestDays ?? []}
        onChange={(protectedRestDays) =>
          updateWeek({
            protectedRestDays: protectedRestDays.filter((day): day is Weekday =>
              weekdays.includes(day as Weekday),
            ),
          })
        }
      />
      <LineListInput
        label="Arbeitsbloecke"
        value={week.workBlocks.map(formatBlock)}
        onChange={(lines) => updateWeek({ workBlocks: lines.map(parseBlock).filter(isTimeBlock) })}
      />
      <LineListInput
        label="Blockierte Zeiten"
        value={week.blockedTimes.map(formatBlock)}
        onChange={(lines) => updateWeek({ blockedTimes: lines.map(parseBlock).filter(isTimeBlock) })}
      />

      <AdvancedSection title="Puffer und Schlaf">
        <NumberInput
          label="Late Evenings pro Woche"
          value={week.allowedLateEveningsPerWeek}
          onChange={(allowedLateEveningsPerWeek) => updateWeek({ allowedLateEveningsPerWeek })}
        />
        <NumberInput
          label="Commute Minuten"
          value={week.commuteMinutesPerTrip}
          onChange={(commuteMinutesPerTrip) => updateWeek({ commuteMinutesPerTrip })}
        />
        <NumberInput
          label="Setup Buffer"
          value={week.setupBufferMinutes}
          onChange={(setupBufferMinutes) => updateWeek({ setupBufferMinutes })}
        />
        <NumberInput
          label="Teardown Buffer"
          value={week.teardownBufferMinutes}
          onChange={(teardownBufferMinutes) => updateWeek({ teardownBufferMinutes })}
        />
        <NumberInput
          label="Min Buffer zwischen Blocks"
          value={week.minimumBufferBetweenBlocksMinutes}
          onChange={(minimumBufferBetweenBlocksMinutes) =>
            updateWeek({ minimumBufferBetweenBlocksMinutes })
          }
        />
        <NumberInput
          label="Ziel Schlafstunden"
          value={week.sleep?.targetHours}
          onChange={(targetHours) => updateSleep({ targetHours })}
        />
        <TextInput
          label="Frueheste Bettzeit"
          value={week.sleep?.earliestBedtime ?? ""}
          onChange={(earliestBedtime) =>
            updateSleep({ earliestBedtime: emptyToUndefined(earliestBedtime) })
          }
        />
        <TextInput
          label="Spaeteste Bettzeit"
          value={week.sleep?.latestBedtime ?? ""}
          onChange={(latestBedtime) =>
            updateSleep({ latestBedtime: emptyToUndefined(latestBedtime) })
          }
        />
        <TextInput
          label="Frueheste Wake Time"
          value={week.sleep?.earliestWakeTime ?? ""}
          onChange={(earliestWakeTime) =>
            updateSleep({ earliestWakeTime: emptyToUndefined(earliestWakeTime) })
          }
        />
        <TextInput
          label="Spaeteste Wake Time"
          value={week.sleep?.latestWakeTime ?? ""}
          onChange={(latestWakeTime) =>
            updateSleep({ latestWakeTime: emptyToUndefined(latestWakeTime) })
          }
        />
      </AdvancedSection>

      <AdvancedSection title="Zeitbloecke JSON">
        <JsonInput
          label="Fixed Appointments"
          value={week.fixedAppointments ?? []}
          onChange={(fixedAppointments) => updateWeek({ fixedAppointments: fixedAppointments as TimeBlock[] })}
        />
        <JsonInput
          label="Recurring Appointments"
          value={week.recurringAppointments ?? []}
          onChange={(recurringAppointments) =>
            updateWeek({
              recurringAppointments:
                recurringAppointments as UserPreferences["week"]["recurringAppointments"],
            })
          }
        />
        <JsonInput
          label="Must Do Blocks"
          value={week.mustDoBlocks ?? []}
          onChange={(mustDoBlocks) => updateWeek({ mustDoBlocks: mustDoBlocks as TimeBlock[] })}
        />
        <JsonInput
          label="Optional Blocks"
          value={week.optionalBlocks ?? []}
          onChange={(optionalBlocks) => updateWeek({ optionalBlocks: optionalBlocks as TimeBlock[] })}
        />
        <JsonInput
          label="Household Blocks"
          value={week.householdBlocks ?? []}
          onChange={(householdBlocks) => updateWeek({ householdBlocks: householdBlocks as TimeBlock[] })}
        />
        <JsonInput
          label="Errands Blocks"
          value={week.errandsBlocks ?? []}
          onChange={(errandsBlocks) => updateWeek({ errandsBlocks: errandsBlocks as TimeBlock[] })}
        />
        <JsonInput
          label="Meal Prep Blocks"
          value={week.mealPrepBlocks ?? []}
          onChange={(mealPrepBlocks) => updateWeek({ mealPrepBlocks: mealPrepBlocks as TimeBlock[] })}
        />
      </AdvancedSection>
    </Section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
        {title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function AdvancedSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {title}
      </summary>
      <div className="mt-3 grid gap-3">{children}</div>
    </details>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full px-4 text-[12px] font-bold ${
        active ? "bg-[#5E7A5E] text-white shadow-sm" : "bg-white text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange(parseOptionalNumber(event.target.value))}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-9 w-full bg-transparent text-[13px] font-bold text-gray-900 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function BooleanInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#5E7A5E]"
      />
    </label>
  );
}

function LineListInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <textarea
        value={value.join("\n")}
        rows={4}
        onChange={(event) => onChange(toLines(event.target.value))}
        className="mt-2 w-full resize-none bg-transparent text-[13px] leading-relaxed text-gray-900 outline-none"
      />
    </label>
  );
}

function JsonInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
  }, [value]);

  return (
    <label className="block rounded-[16px] border border-gray-100 bg-white p-3 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <textarea
        value={text}
        rows={5}
        onChange={(event) => {
          const nextText = event.target.value;
          setText(nextText);

          try {
            const parsed = JSON.parse(nextText);
            setError(null);
            onChange(parsed);
          } catch {
            setError("JSON ungueltig.");
          }
        }}
        className="mt-2 w-full resize-none bg-transparent font-mono text-[12px] leading-relaxed text-gray-900 outline-none"
      />
      {error ? <span className="mt-1 block text-[10px] font-bold text-[#9C3A3A]">{error}</span> : null}
    </label>
  );
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function emptyToUndefined(value: string) {
  return value.trim() ? value.trim() : undefined;
}

function formatBlock(block: UserPreferences["week"]["workBlocks"][number]) {
  return `${block.day} ${block.start}-${block.end}${block.label ? ` ${block.label}` : ""}`;
}

function parseBlock(value: string): UserPreferences["week"]["workBlocks"][number] | null {
  const match = value.match(
    /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(\d{2}:\d{2})-(\d{2}:\d{2})(?:\s+(.+))?$/,
  );

  if (!match) {
    return null;
  }

  return {
    day: match[1] as UserPreferences["week"]["weekStartsOn"],
    start: match[2],
    end: match[3],
    label: match[4],
  };
}

function isTimeBlock(
  value: UserPreferences["week"]["workBlocks"][number] | null,
): value is UserPreferences["week"]["workBlocks"][number] {
  return value !== null;
}
