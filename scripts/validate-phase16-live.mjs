import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import {
  formatTrustedTlsFailure,
  LIVE_SCRIPT_REQUIRED_ENV_KEYS,
  printTrustedLiveValidationFailures,
  validateTrustedLiveValidationConfig,
} from "./live-validation-config.mjs";

const { env, failures } = validateTrustedLiveValidationConfig({
  requiredEnvKeys: LIVE_SCRIPT_REQUIRED_ENV_KEYS,
});

if (failures.length > 0) {
  printTrustedLiveValidationFailures(failures);
  process.exit(1);
}

const tableSpecs = [
  {
    table: "week_plans",
    title: "Phase 16 WeekPlan",
    payload: {
      schemaVersion: 1,
      events: [
        {
          id: "phase16-week-event",
          title: "Phase 16 remote validation marker",
          date: "2026-04-06",
          category: "orga",
          allDay: true,
        },
      ],
      focusItems: [],
    },
  },
  {
    table: "meal_plans",
    title: "Phase 16 MealPlan",
    payload: {
      schemaVersion: 1,
      targets: { kcal: 2100, protein: 115 },
      days: [
        {
          date: "2026-04-06",
          targets: { kcal: 2100, protein: 115 },
          meals: [
            {
              id: "2026-04-06-breakfast",
              slotType: "breakfast",
              title: "Phase 16 breakfast",
            },
          ],
        },
      ],
      recipes: [],
      shoppingList: [],
    },
  },
  {
    table: "training_plans",
    title: "Phase 16 TrainingPlan",
    payload: {
      schemaVersion: 1,
      days: [
        {
          date: "2026-04-06",
          workouts: [
            {
              id: "phase16-workout",
              title: "Phase 16 remote validation workout",
            },
          ],
        },
      ],
      workouts: [
        {
          id: "phase16-workout",
          title: "Phase 16 remote validation workout",
        },
      ],
      goals: [{ id: "phase16-goal", title: "Validate remote persistence" }],
    },
  },
];

const userAClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  global: {
    fetch: fetchWithDefaultRestRange,
  },
});
const userBClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  global: {
    fetch: fetchWithDefaultRestRange,
  },
});

const userA = await signIn(
  userAClient,
  env.WEEKNARY_TEST_USER_A_EMAIL,
  env.WEEKNARY_TEST_USER_A_PASSWORD,
  "user A",
);
const userB = await signIn(
  userBClient,
  env.WEEKNARY_TEST_USER_B_EMAIL,
  env.WEEKNARY_TEST_USER_B_PASSWORD,
  "user B",
);

if (userA.id === userB.id) {
  throw new Error("The two Phase 16 test users resolve to the same Supabase auth user.");
}

for (const spec of tableSpecs) {
  await validateTable(spec, userAClient, userBClient, userA.id);
}

console.log("Phase 16 live Supabase validation passed.");

function fetchWithDefaultRestRange(input, init) {
  const url =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  if (!url.includes("/rest/v1/")) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers);

  if (!headers.has("Range")) {
    headers.set("Range", "0-999");
  }

  const method = (init?.method ?? "GET").toUpperCase();

  if ((method === "GET" || method === "HEAD") && !headers.has("Prefer")) {
    headers.set("Prefer", "count=exact");
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

async function signIn(client, email, password, label) {
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(`Could not sign in ${label}: ${formatSupabaseError(error)}`);
  }

  const { data, error: userError } = await client.auth.getUser();

  if (userError || !data.user) {
    throw new Error(`Could not resolve ${label} after sign in: ${userError?.message ?? "missing user"}`);
  }

  return data.user;
}

function formatSupabaseError(error) {
  return formatTrustedTlsFailure(error);
}

async function validateTable(spec, userAClient, userBClient, userAId) {
  const rowId = randomUUID();
  const now = new Date().toISOString();
  const baseRow = {
    id: rowId,
    user_id: userAId,
    title: spec.title,
    status: "active",
    source: "user",
    version: 1,
    valid_from: "2026-04-06",
    valid_to: "2026-04-12",
    payload: spec.payload,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };

  let primaryError = null;

  try {
    const inserted = await upsertAndRead(userAClient, spec.table, baseRow);
    assertPayloadShape(spec, inserted);
    console.log(`${spec.table}: user A upsert/read passed.`);

    const userBRead = await maybeRead(userBClient, spec.table, rowId);

    if (userBRead) {
      throw new Error(`${spec.table}: user B could read user A row.`);
    }

    console.log(`${spec.table}: user B read isolation passed.`);

    const updated = await updateAndMaybeRead(userAClient, spec.table, rowId, {
      title: `${spec.title} updated`,
      version: 2,
      updated_at: new Date().toISOString(),
    });

    if (!updated || updated.title !== `${spec.title} updated`) {
      throw new Error(`${spec.table}: user A update did not return the expected row.`);
    }

    console.log(`${spec.table}: user A update passed.`);

    const userBUpdate = await updateAndMaybeRead(userBClient, spec.table, rowId, {
      title: "RLS violation attempt",
      version: 99,
      updated_at: new Date().toISOString(),
    });

    if (userBUpdate) {
      throw new Error(`${spec.table}: user B could update user A row.`);
    }

    console.log(`${spec.table}: user B update isolation passed.`);

    const archived = await updateAndMaybeRead(userAClient, spec.table, rowId, {
      status: "archived",
      version: 3,
      updated_at: new Date().toISOString(),
    });

    if (!archived || archived.status !== "archived") {
      throw new Error(`${spec.table}: user A archive update did not return the expected row.`);
    }

    console.log(`${spec.table}: user A archive update passed.`);

    const userBDeleted = await deleteAndReturn(userBClient, spec.table, rowId);

    if (userBDeleted.length > 0) {
      throw new Error(`${spec.table}: user B could delete user A row.`);
    }

    console.log(`${spec.table}: user B delete isolation passed.`);
  } catch (caught) {
    primaryError = caught;
  } finally {
    try {
      await deleteAndReturn(userAClient, spec.table, rowId);
    } catch (cleanupError) {
      if (!primaryError) {
        primaryError = cleanupError;
      } else {
        console.error(`${spec.table}: cleanup also failed: ${formatPostgrestError(cleanupError)}`);
      }
    }
  }

  if (primaryError) {
    throw primaryError;
  }

  const afterCleanup = await maybeRead(userAClient, spec.table, rowId);

  if (afterCleanup) {
    throw new Error(`${spec.table}: cleanup failed.`);
  }

  console.log(`${spec.table}: cleanup passed.`);
}

async function upsertAndRead(client, table, row) {
  const { error } = await client
    .from(table)
    .upsert(row, { onConflict: "id" });

  if (error) {
    if (!isAmbiguousEmptyRangeResponse(error)) {
      throw new Error(`${table}: upsert failed: ${formatPostgrestError(error)}`);
    }
  }

  const data = await maybeRead(client, table, row.id);

  if (!data) {
    throw new Error(`${table}: upsert succeeded but the row could not be read back.`);
  }

  return data;
}

async function maybeRead(client, table, id) {
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (isAmbiguousEmptyRangeResponse(error)) {
      return null;
    }

    throw new Error(`${table}: read failed: ${formatPostgrestError(error)}`);
  }

  return data;
}

async function updateAndMaybeRead(client, table, id, patch) {
  const { error } = await client
    .from(table)
    .update(patch)
    .eq("id", id);

  if (error) {
    if (!isAmbiguousEmptyRangeResponse(error)) {
      throw new Error(`${table}: update failed: ${formatPostgrestError(error)}`);
    }
  }

  return maybeRead(client, table, id);
}

async function deleteAndReturn(client, table, id) {
  const beforeDelete = await maybeRead(client, table, id);
  const { error } = await client
    .from(table)
    .delete()
    .eq("id", id);

  if (error) {
    if (!isAmbiguousEmptyRangeResponse(error)) {
      throw new Error(`${table}: delete failed: ${formatPostgrestError(error)}`);
    }
  }

  const afterDelete = await maybeRead(client, table, id);

  return beforeDelete && !afterDelete ? [beforeDelete] : [];
}

function isAmbiguousEmptyRangeResponse(error) {
  return error?.message === "";
}

function formatPostgrestError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (!error || typeof error !== "object") {
    return String(error);
  }

  const parts = [];

  for (const key of ["message", "code", "details", "hint"]) {
    if (error[key]) {
      parts.push(`${key}: ${error[key]}`);
    }
  }

  return parts.length > 0 ? parts.join("; ") : JSON.stringify(error);
}

function assertPayloadShape(spec, row) {
  if (!row.payload || typeof row.payload !== "object" || Array.isArray(row.payload)) {
    throw new Error(`${spec.table}: payload is malformed.`);
  }

  if (row.payload.schemaVersion !== 1) {
    throw new Error(`${spec.table}: payload schemaVersion is not 1.`);
  }

  for (const key of Object.keys(spec.payload)) {
    if (!(key in row.payload)) {
      throw new Error(`${spec.table}: payload is missing ${key}.`);
    }
  }
}
