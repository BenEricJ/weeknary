import { createClient } from "npm:@supabase/supabase-js@2";

type ISODateString = string;
type MealSlotType = "breakfast" | "lunch" | "dinner" | "snack";
type WeekPlanEventCategory =
  | "arbeit"
  | "training"
  | "nutrition"
  | "sozial"
  | "erholung"
  | "orga"
  | "mobilitaet"
  | "lernen"
  | "ehrenamt";

interface PlanBundleGenerationRequest {
  dateRange: {
    startDate: ISODateString;
    endDate: ISODateString;
  };
  timezone: "Europe/Berlin";
  locale: "de-DE";
  goals: string[];
  constraints: string[];
  startingPoint: "new" | "previous-week" | "current-plan";
  userNotes: string;
  profile?: {
    displayName: string;
    birthYear?: number;
    heightCm?: number;
    weightKg?: number;
    activityLevel: "low" | "medium" | "high";
  };
  preferences?: {
    nutrition?: Record<string, unknown>;
    training?: Record<string, unknown>;
    week?: Record<string, unknown>;
  };
}

interface AiMeal {
  slotType: MealSlotType;
  title: string;
  ingredients: string[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  external: boolean;
}

interface AiWorkout {
  title: string;
  target: string;
  notes: string;
  start: string;
  end: string;
}

interface AiWeekItem {
  date: ISODateString;
  title: string;
  category: WeekPlanEventCategory;
  start: string;
  end: string;
  notes: string;
}

interface AiPlanBundle {
  summary: string;
  warnings: string[];
  mealsByDay: Array<{
    date: ISODateString;
    meals: AiMeal[];
  }>;
  trainingByDay: Array<{
    date: ISODateString;
    workouts: AiWorkout[];
  }>;
  weekItems: AiWeekItem[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const weekCategories: WeekPlanEventCategory[] = [
  "arbeit",
  "training",
  "nutrition",
  "sozial",
  "erholung",
  "orga",
  "mobilitaet",
  "lernen",
  "ehrenamt",
];

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const authHeader = request.headers.get("Authorization") ?? "";
    const user = await requireUser(authHeader);
    const input = (await request.json()) as PlanBundleGenerationRequest;
    validateRequest(input);

    const aiBundle = shouldUseMock()
      ? createMockAiBundle(input)
      : await generateAiBundle(input);
    const bundle = buildDomainBundle(input, aiBundle, user.id);

    return jsonResponse(bundle);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Plan generation failed.";
    return jsonResponse({ error: message }, getStatusForError(message));
  }
});

async function requireUser(authHeader: string) {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const supabaseAnonKey = requireEnv("SUPABASE_ANON_KEY");
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    throw new Error("Authentication required.");
  }

  return data.user;
}

async function generateAiBundle(
  input: PlanBundleGenerationRequest,
): Promise<AiPlanBundle> {
  const apiKey = requireEnv("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-5.2";
  const timeoutMs = Number(Deno.env.get("PLAN_GENERATION_TIMEOUT_MS") ?? 60_000);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions:
          "Create an editable German wellness planning draft using the supplied profile and preferences only as planning context. Do not provide medical advice. Return practical meals, workouts, and week structure only. Keep every date inside the requested range. Use empty strings for absent times.",
        input: JSON.stringify(input),
        text: {
          format: {
            type: "json_schema",
            name: "weeknary_plan_bundle",
            strict: true,
            schema: aiPlanBundleSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${details}`);
    }

    const payload = await response.json();
    return parseAiBundle(payload);
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseAiBundle(payload: Record<string, unknown>): AiPlanBundle {
  const outputText =
    typeof payload.output_text === "string"
      ? payload.output_text
      : extractOutputText(payload.output);

  if (!outputText) {
    throw new Error("OpenAI response did not contain JSON output.");
  }

  const parsed = JSON.parse(outputText) as AiPlanBundle;
  validateAiBundle(parsed);
  return parsed;
}

function extractOutputText(output: unknown) {
  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item)) {
        return [];
      }

      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) {
        return [];
      }

      return content
        .filter(
          (entry): entry is { type: string; text: string } =>
            Boolean(entry) &&
            typeof entry === "object" &&
            (entry as { type?: unknown }).type === "output_text" &&
            typeof (entry as { text?: unknown }).text === "string",
        )
        .map((entry) => entry.text);
    })
    .join("\n");
}

function buildDomainBundle(
  request: PlanBundleGenerationRequest,
  aiBundle: AiPlanBundle,
  userId: string,
) {
  const now = new Date().toISOString();
  const dates = getDatesInRange(request.dateRange.startDate, request.dateRange.endDate);
  const bundleId = crypto.randomUUID();
  const recipes: Array<{
    id: string;
    name: string;
    ingredients: Array<{ name: string }>;
    nutrition: { kcal: number; protein: number; carbs: number; fat: number };
  }> = [];
  const mealDays = dates.map((date) => {
    const aiDay = aiBundle.mealsByDay.find((day) => day.date === date);
    const meals = (aiDay?.meals ?? []).map((meal) => {
      const slotId = crypto.randomUUID();

      if (meal.external) {
        return {
          id: slotId,
          slotType: meal.slotType,
          title: meal.title,
          external: true,
        };
      }

      const recipeId = crypto.randomUUID();
      recipes.push({
        id: recipeId,
        name: meal.title,
        ingredients: meal.ingredients.map((name) => ({ name })),
        nutrition: {
          kcal: clampNutrition(meal.kcal),
          protein: clampNutrition(meal.protein),
          carbs: clampNutrition(meal.carbs),
          fat: clampNutrition(meal.fat),
        },
      });

      return {
        id: slotId,
        slotType: meal.slotType,
        recipeId,
      };
    });

    return {
      date,
      meals,
      targets: summarizeMealTargets(aiDay?.meals ?? []),
    };
  });
  const shoppingList = Array.from(
    new Set(recipes.flatMap((recipe) => recipe.ingredients.map((item) => item.name))),
  ).sort((left, right) => left.localeCompare(right));
  const trainingDays = dates.map((date) => {
    const aiDay = aiBundle.trainingByDay.find((day) => day.date === date);
    return {
      date,
      workouts: (aiDay?.workouts ?? []).map((workout) => ({
        id: crypto.randomUUID(),
        title: workout.title,
        target: workout.target,
        notes: workout.notes,
        start: normalizeTime(workout.start),
        end: normalizeTime(workout.end),
      })),
    };
  });
  const trainingWorkouts = trainingDays.flatMap((day) => day.workouts);
  const weekEvents = [
    ...aiBundle.weekItems
      .filter((item) => isDateWithinRange(item.date, request.dateRange))
      .map((item) => ({
        id: crypto.randomUUID(),
        title: item.title,
        date: item.date,
        category: item.category,
        allDay: !item.start || !item.end,
        start: normalizeTime(item.start),
        end: normalizeTime(item.end),
        notes: item.notes,
      })),
    ...mealDays.flatMap((day) =>
      day.meals.map((slot) => {
        const recipe = "recipeId" in slot
          ? recipes.find((entry) => entry.id === slot.recipeId)
          : null;
        return {
          id: crypto.randomUUID(),
          title: `Meal: ${recipe?.name ?? slot.title ?? "External meal"}`,
          date: day.date,
          category: "nutrition" as const,
          allDay: true,
          linkedMealSlotId: slot.id,
          notes: `${slot.slotType} from generated MealPlan.`,
        };
      }),
    ),
    ...trainingDays.flatMap((day) =>
      day.workouts.map((workout) => ({
        id: crypto.randomUUID(),
        title: `Training: ${workout.title}`,
        date: day.date,
        category: "training" as const,
        allDay: !workout.start || !workout.end,
        start: workout.start,
        end: workout.end,
        linkedTrainingWorkoutId: workout.id,
        notes: workout.target || workout.notes,
      })),
    ),
  ].sort(compareEvents);

  return {
    bundleId,
    summary: aiBundle.summary,
    warnings: aiBundle.warnings,
    mealPlan: {
      id: crypto.randomUUID(),
      userId,
      title: `KI MealPlan ${request.dateRange.startDate}`,
      status: "draft",
      source: "generated",
      version: 0,
      dateRange: request.dateRange,
      createdAt: now,
      updatedAt: now,
      days: mealDays,
      recipes,
      targets: summarizePlanTargets(aiBundle.mealsByDay.flatMap((day) => day.meals)),
      shoppingList,
    },
    trainingPlan: {
      id: crypto.randomUUID(),
      userId,
      title: `KI TrainingPlan ${request.dateRange.startDate}`,
      status: "draft",
      source: "generated",
      version: 0,
      dateRange: request.dateRange,
      createdAt: now,
      updatedAt: now,
      days: trainingDays,
      workouts: trainingWorkouts,
      goals: request.goals.map((goal) => ({
        id: crypto.randomUUID(),
        title: goal,
      })),
    },
    weekPlan: {
      id: crypto.randomUUID(),
      userId,
      title: `KI WeekPlan ${request.dateRange.startDate}`,
      status: "draft",
      source: "generated",
      version: 0,
      dateRange: request.dateRange,
      createdAt: now,
      updatedAt: now,
      events: weekEvents,
      focusItems: request.goals.slice(0, 3).map((goal) => ({
        id: crypto.randomUUID(),
        title: goal,
      })),
    },
  };
}

function validateRequest(request: PlanBundleGenerationRequest) {
  if (!request?.dateRange?.startDate || !request.dateRange.endDate) {
    throw new Error("dateRange is required.");
  }

  if (request.dateRange.startDate > request.dateRange.endDate) {
    throw new Error("dateRange is invalid.");
  }

  if (getDatesInRange(request.dateRange.startDate, request.dateRange.endDate).length > 14) {
    throw new Error("dateRange must not exceed 14 days.");
  }

  if (request.timezone !== "Europe/Berlin" || request.locale !== "de-DE") {
    throw new Error("Unsupported locale or timezone.");
  }
}

function validateAiBundle(bundle: AiPlanBundle) {
  if (!bundle.summary?.trim()) {
    throw new Error("Generated summary is missing.");
  }

  for (const day of bundle.mealsByDay) {
    for (const meal of day.meals) {
      if (!meal.title.trim()) {
        throw new Error("Generated meal title is missing.");
      }
    }
  }

  for (const day of bundle.trainingByDay) {
    for (const workout of day.workouts) {
      if (!workout.title.trim()) {
        throw new Error("Generated workout title is missing.");
      }
    }
  }

  for (const item of bundle.weekItems) {
    if (!weekCategories.includes(item.category)) {
      throw new Error(`Generated week item category ${item.category} is invalid.`);
    }
  }
}

function createMockAiBundle(input: PlanBundleGenerationRequest): AiPlanBundle {
  const dates = getDatesInRange(input.dateRange.startDate, input.dateRange.endDate);
  return {
    summary: "KI-Entwurf mit proteinbetonten Meals, drei Trainingseinheiten und planbaren Puffern.",
    warnings: ["Mock generation is enabled for local development."],
    mealsByDay: dates.map((date) => ({
      date,
      meals: [
        mockMeal("breakfast", "Skyr Bowl mit Beeren"),
        mockMeal("lunch", "Linsen-Reis-Bowl"),
        mockMeal("dinner", "Tofu Gemuese Pfanne"),
      ],
    })),
    trainingByDay: dates.map((date, index) => ({
      date,
      workouts: index === 1 || index === 3 || index === 5
        ? [
            {
              title: index === 5 ? "Locker laufen" : "Kraft und Mobility",
              target: "Saubere Technik und moderate Belastung.",
              notes: "An Tagesform anpassen.",
              start: "18:00",
              end: "19:00",
            },
          ]
        : [],
    })),
    weekItems: dates.map((date, index) => ({
      date,
      title: index === 0 ? "Wochenplanung pruefen" : "Pufferblock",
      category: index === 0 ? "orga" : "erholung",
      start: index === 0 ? "08:30" : "",
      end: index === 0 ? "09:00" : "",
      notes: "Editierbarer Vorschlag.",
    })),
  };
}

function mockMeal(slotType: MealSlotType, title: string): AiMeal {
  return {
    slotType,
    title,
    ingredients: ["Haferflocken", "Tofu", "Gemuese", "Reis"].slice(0, 2),
    kcal: 650,
    protein: 35,
    carbs: 70,
    fat: 18,
    external: false,
  };
}

function summarizeMealTargets(meals: AiMeal[]) {
  return {
    kcal: meals.reduce((total, meal) => total + clampNutrition(meal.kcal), 0),
    protein: meals.reduce((total, meal) => total + clampNutrition(meal.protein), 0),
    carbs: meals.reduce((total, meal) => total + clampNutrition(meal.carbs), 0),
    fat: meals.reduce((total, meal) => total + clampNutrition(meal.fat), 0),
  };
}

function summarizePlanTargets(meals: AiMeal[]) {
  if (meals.length === 0) {
    return {};
  }

  return summarizeMealTargets(meals);
}

function getDatesInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const cursor = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);

  while (cursor <= end) {
    dates.push(toIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function isDateWithinRange(date: string, range: { startDate: string; endDate: string }) {
  return date >= range.startDate && date <= range.endDate;
}

function normalizeTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value) ? value : undefined;
}

function clampNutrition(value: number) {
  return Math.max(0, Math.round(Number.isFinite(value) ? value : 0));
}

function compareEvents(
  left: { date: string; category: string; title: string; id: string },
  right: { date: string; category: string; title: string; id: string },
) {
  if (left.date !== right.date) {
    return left.date.localeCompare(right.date);
  }

  if (left.category !== right.category) {
    return left.category.localeCompare(right.category);
  }

  if (left.title !== right.title) {
    return left.title.localeCompare(right.title);
  }

  return left.id.localeCompare(right.id);
}

function shouldUseMock() {
  return Deno.env.get("WEEKNARY_PLAN_GENERATION_MOCK") === "true";
}

function requireEnv(key: string) {
  const value = Deno.env.get(key)?.trim();

  if (!value) {
    throw new Error(`${key} is not configured.`);
  }

  return value;
}

function getStatusForError(message: string) {
  if (message.includes("Authentication")) {
    return 401;
  }

  if (
    message.includes("dateRange") ||
    message.includes("locale") ||
    message.includes("timezone")
  ) {
    return 400;
  }

  return 500;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

const aiPlanBundleSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "warnings", "mealsByDay", "trainingByDay", "weekItems"],
  properties: {
    summary: { type: "string" },
    warnings: { type: "array", items: { type: "string" } },
    mealsByDay: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "meals"],
        properties: {
          date: { type: "string" },
          meals: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "slotType",
                "title",
                "ingredients",
                "kcal",
                "protein",
                "carbs",
                "fat",
                "external",
              ],
              properties: {
                slotType: {
                  type: "string",
                  enum: ["breakfast", "lunch", "dinner", "snack"],
                },
                title: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
                kcal: { type: "number" },
                protein: { type: "number" },
                carbs: { type: "number" },
                fat: { type: "number" },
                external: { type: "boolean" },
              },
            },
          },
        },
      },
    },
    trainingByDay: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "workouts"],
        properties: {
          date: { type: "string" },
          workouts: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "target", "notes", "start", "end"],
              properties: {
                title: { type: "string" },
                target: { type: "string" },
                notes: { type: "string" },
                start: { type: "string" },
                end: { type: "string" },
              },
            },
          },
        },
      },
    },
    weekItems: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["date", "title", "category", "start", "end", "notes"],
        properties: {
          date: { type: "string" },
          title: { type: "string" },
          category: {
            type: "string",
            enum: weekCategories,
          },
          start: { type: "string" },
          end: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
  },
};
