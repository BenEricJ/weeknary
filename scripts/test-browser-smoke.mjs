import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const appBasePath = "/weeknary";
const envLocalPath = join(root, ".env.local");
const envLocalBackupPath = join(root, ".env.local.phase19-browser-backup");
const browserPath =
  process.env.BROWSER_PATH ??
  [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].find((candidate) => existsSync(candidate));

const results = [];

if (typeof WebSocket === "undefined") {
  fail("browser automation", "Node WebSocket API is unavailable.");
}

if (!browserPath) {
  fail("browser automation", "No local Edge/Chrome executable was found.");
}

try {
  await validateDemoLocalMode();
  await validateRemoteModes();
  printResults();
} catch (error) {
  printResults();
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
}

async function validateDemoLocalMode() {
  await withEnvLocalMoved(async () => {
    const server = await startDevServer(5191);
    const browser = await openBrowser({
      url: `http://127.0.0.1:5191${appBasePath}/app/week`,
      debugPort: 9291,
      profileName: ".phase19-browser-demo-profile",
    });

    try {
      const text = await waitForText(browser.client, "WeekPlan runtime", 300000);
      assertText(text, "demo-local", "demo-local WeekPlan runtime");
      assertText(text, "Planning context", "demo-local PlanningContext panel");
      assertText(text, "WeekPlan orchestration", "demo-local orchestration panel");
      pass("demo-local", "Week route loads with demo-local runtime, PlanningContext, and orchestration panels.");
    } finally {
      await browser.close();
      await server.stop();
    }
  });
}

async function validateRemoteModes() {
  const env = loadEnv();
  const required = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "WEEKNARY_TEST_USER_A_EMAIL",
    "WEEKNARY_TEST_USER_A_PASSWORD",
  ];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    skip("remote browser validation", `Missing environment keys: ${missing.join(", ")}`);
    return;
  }

  const server = await startDevServer(5192);
  const browser = await openBrowser({
    url: `http://127.0.0.1:5192${appBasePath}/app/week`,
    debugPort: 9292,
    profileName: ".phase19-browser-remote-profile",
  });

  try {
    const signedOutText = await waitForText(browser.client, "remote-signed-out - signedOut", 300000);
    assertText(signedOutText, "remote-signed-out - signedOut", "remote signed-out WeekPlan runtime");
    assertText(signedOutText, "Remote mode is configured", "remote signed-out description");
    pass("remote-signed-out", "Configured remote browser starts signed out without demo fallback.");

    await signInThroughRuntimePanel(
      browser.client,
      env.WEEKNARY_TEST_USER_A_EMAIL,
      env.WEEKNARY_TEST_USER_A_PASSWORD,
    );
    const signedInText = await waitForText(browser.client, "Signed in as", 180000);
    assertText(signedInText, "remote-signed-in", "remote signed-in runtime marker");
    pass("remote-signed-in", "Test user A signs in through the runtime panel.");

    await clickButton(browser.client, "Create remote demo");
    await waitForText(browser.client, "Remote demo seed succeeded.", 45000);
    await waitForText(browser.client, "remote confirmed", 45000);

    const indexedDbState = await readWeekPlanIndexedDb(browser.client);
    if (!indexedDbState.dbExists || !indexedDbState.storeExists || indexedDbState.count < 1) {
      throw new Error(
        `WeekPlan IndexedDB cache was not populated: ${JSON.stringify(indexedDbState)}`,
      );
    }
    if (!indexedDbState.hasRemoteConfirmedStatus) {
      throw new Error(
        `WeekPlan IndexedDB cache does not record remote confirmation: ${JSON.stringify(indexedDbState)}`,
      );
    }
    pass(
      "weekplan-local-first-cache",
      `IndexedDB weeknary-weekplan/week_plans contains ${indexedDbState.count} cached row(s) with remote confirmation metadata.`,
    );

    await browser.client.send("Page.navigate", {
      url: `http://127.0.0.1:5192${appBasePath}/app/week`,
    });
    const reloadedText = await waitForText(browser.client, "remote-signed-in", 45000);
    assertText(reloadedText, "WeekPlan runtime", "WeekPlan runtime after reload");
    pass("weekplan-reload", "Week route reloads with signed-in remote runtime and cached WeekPlan present.");

    await validateRemoteRoute(browser.client, "nutrition", "MealPlan runtime", "Remote validation MealPlan");
    await validateRemoteRoute(browser.client, "training", "TrainingPlan runtime", "Remote validation TrainingPlan");

    await browser.client.send("Page.navigate", {
      url: `http://127.0.0.1:5192${appBasePath}/app/week`,
    });
    const planningText = await waitForText(browser.client, "Planning context", 45000);
    assertText(planningText, "WeekPlan orchestration", "orchestration panel after remote reload");
    pass("planning-surfaces", "PlanningContext and orchestration panels render in remote signed-in browser mode.");

    await waitForText(browser.client, "Sign out", 45000);
    await clickButton(browser.client, "Sign out");
    const signedOutAgainText = await waitForText(browser.client, "remote-signed-out", 45000);
    assertText(signedOutAgainText, "Sign in", "signed-out state after sign out");
    pass("sign-out", "Signing out returns to explicit remote-signed-out state.");
  } finally {
    await browser.close();
    await server.stop();
  }
}

async function validateRemoteRoute(client, route, panelLabel, _expectedTitle) {
  await client.send("Page.navigate", {
    url: `http://127.0.0.1:5192${appBasePath}/app/${route}`,
  });
  const text = await waitForText(client, "remote-signed-in", 180000);
  assertText(text, panelLabel, `${route} runtime panel`);
  await waitForText(client, "Create remote demo", 45000);
  await clickButton(client, "Create remote demo");
  await waitForText(client, "Remote demo seed succeeded.", 45000);
  pass(`${route}-remote`, `${panelLabel} saves and reloads through remote-only runtime.`);
}

async function withEnvLocalMoved(callback) {
  const hadEnvLocal = existsSync(envLocalPath);
  if (hadEnvLocal && existsSync(envLocalBackupPath)) {
    throw new Error(
      ".env.local.phase19-browser-backup already exists; refusing to move .env.local.",
    );
  }

  if (hadEnvLocal) {
    renameSync(envLocalPath, envLocalBackupPath);
  }

  try {
    await callback();
  } finally {
    if (hadEnvLocal && existsSync(envLocalBackupPath)) {
      renameSync(envLocalBackupPath, envLocalPath);
    }
  }
}

function loadEnv() {
  const env = { ...process.env };
  for (const path of [join(root, ".env"), envLocalPath]) {
    if (!existsSync(path)) {
      continue;
    }

    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  return env;
}

async function startDevServer(port) {
  const viteBin = join(root, "node_modules", "vite", "bin", "vite.js");
  const cacheDir = join(root, ".phase19-vite-cache", "shared");
  mkdirSync(cacheDir, { recursive: true });
  let child;
  try {
    child = spawn(
      process.execPath,
      [
        viteBin,
        "--configLoader",
        "native",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--strictPort",
      ],
      {
        cwd: root,
        env: { ...process.env, ...loadEnv(), WEEKNARY_VITE_CACHE_DIR: cacheDir },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  } catch (error) {
    throw new Error(
      `Could not start Vite dev server with ${process.execPath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  await waitUntil(async () => {
    if (child.exitCode !== null) {
      throw new Error(`Vite dev server exited early:\n${output}`);
    }

    try {
      const response = await fetch(`http://127.0.0.1:${port}${appBasePath}/app/week`);
      return response.ok;
    } catch {
      return false;
    }
  }, 60000, `Vite dev server did not start on port ${port}.\n${output}`);

  return {
    async stop() {
      if (child.exitCode === null) {
        child.kill();
        await delay(1000);
      }
    },
  };
}

async function openBrowser({ url, debugPort, profileName }) {
  const profileDir = resolve(root, `${profileName}-${Date.now()}`);
  await removeWithRetry(profileDir, { optional: true });
  mkdirSync(profileDir, { recursive: true });

  let child;
  try {
    child = spawn(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      url,
    ]);
  } catch (error) {
    throw new Error(
      `Could not start browser at ${browserPath}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const wsUrl = await waitForDevTools(debugPort, child);
  const client = await connectDevTools(wsUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Page.navigate", { url });
  await delay(1000);

  return {
    client,
    async close() {
      await client.send("Browser.close").catch(() => undefined);
      await waitUntil(
        () => child.exitCode !== null,
        5000,
        "Browser did not exit after Browser.close.",
      ).catch(() => undefined);
      if (child.exitCode === null) {
        child.kill();
        await delay(1000);
      }
      await removeWithRetry(profileDir, { optional: true });
    },
  };
}

async function waitForDevTools(port, child) {
  return waitUntil(async () => {
    if (child.exitCode !== null) {
      throw new Error(`Browser exited early with code ${child.exitCode}.`);
    }

    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const pages = await response.json();
      const page = pages.find((entry) => entry.type === "page" && entry.webSocketDebuggerUrl);
      return page?.webSocketDebuggerUrl ?? false;
    } catch {
      return false;
    }
  }, 30000, "Browser DevTools endpoint did not become available.");
}

function connectDevTools(wsUrl) {
  return new Promise((resolvePromise, reject) => {
    const ws = new WebSocket(wsUrl);
    let messageId = 0;
    const pending = new Map();
    const events = [];

    ws.addEventListener("open", () => {
      resolvePromise({
        events,
        send(method, params = {}) {
          const id = ++messageId;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((resolve, rejectSend) => {
            pending.set(id, { resolve, reject: rejectSend });
          });
        },
      });
    });

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (
        message.method === "Runtime.exceptionThrown" ||
        message.method === "Log.entryAdded" ||
        message.method === "Runtime.consoleAPICalled"
      ) {
        events.push(message);
        if (events.length > 20) {
          events.shift();
        }
      }

      if (!message.id || !pending.has(message.id)) {
        return;
      }

      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        request.reject(new Error(message.error.message));
      } else {
        request.resolve(message.result);
      }
    });

    ws.addEventListener("error", () => {
      reject(new Error("Browser DevTools WebSocket failed."));
    });
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed.");
  }

  return result.result?.value;
}

async function getBodyText(client) {
  return evaluate(client, "document.body ? document.body.innerText : ''");
}

async function waitForText(client, expectedText, timeoutMs) {
  const started = Date.now();
  let lastText = "";

  while (Date.now() - started < timeoutMs) {
    lastText = await getBodyText(client);
    if (includesText(lastText, expectedText)) {
      return lastText;
    }
    await delay(500);
  }

  throw new Error(
    `Timed out waiting for browser text: ${expectedText}\n${await getPageDebugInfo(
      client,
      lastText,
    )}`,
  );
}

async function getPageDebugInfo(client, text) {
  const debug = await evaluate(
    client,
    `({
      href: location.href,
      readyState: document.readyState,
      title: document.title,
      bodyLength: document.body ? document.body.innerText.length : -1,
      htmlSnippet: document.documentElement ? document.documentElement.outerHTML.slice(0, 1000) : "",
      resources: performance.getEntriesByType("resource")
        .slice(-20)
        .map((entry) => ({
          name: entry.name,
          duration: Math.round(entry.duration),
          transferSize: entry.transferSize ?? 0
        }))
    })`,
  ).catch((error) => ({
    href: "unavailable",
    readyState: "unavailable",
    title: "unavailable",
    bodyLength: -1,
    htmlSnippet: error instanceof Error ? error.message : String(error),
  }));

  return [
    `Location: ${debug.href}`,
    `Ready state: ${debug.readyState}`,
    `Title: ${debug.title}`,
    `Body text length: ${debug.bodyLength}`,
    `Rendered text snippet: ${text.slice(0, 1000)}`,
    `HTML snippet: ${debug.htmlSnippet}`,
    `Resources: ${JSON.stringify(debug.resources ?? [])}`,
    `Browser events: ${formatBrowserEvents(client.events ?? [])}`,
  ].join("\n");
}

function formatBrowserEvents(events) {
  if (events.length === 0) {
    return "none captured";
  }

  return events
    .map((event) => {
      if (event.method === "Runtime.exceptionThrown") {
        return event.params?.exceptionDetails?.exception?.description ??
          event.params?.exceptionDetails?.text ??
          "Runtime exception";
      }

      if (event.method === "Log.entryAdded") {
        return `${event.params?.entry?.level ?? "log"}: ${
          event.params?.entry?.text ?? ""
        }`;
      }

      if (event.method === "Runtime.consoleAPICalled") {
        return `${event.params?.type ?? "console"}: ${event.params?.args
          ?.map((arg) => arg.value ?? arg.description ?? "")
          .join(" ")}`;
      }

      return event.method;
    })
    .join(" | ");
}

async function signInThroughRuntimePanel(client, email, password) {
  const result = await evaluate(
    client,
    `(() => {
      const setValue = (element, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        setter.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      };
      const inputs = Array.from(document.querySelectorAll("input"));
      const emailInput = inputs.find((input) => input.placeholder?.toLowerCase() === "email") ?? inputs[0];
      const passwordInput = inputs.find((input) => input.type === "password" || input.placeholder?.toLowerCase() === "password") ?? inputs[1];
      const signInButton = Array.from(document.querySelectorAll("button"))
        .find((button) => button.textContent.trim().toLowerCase() === "sign in");
      if (!emailInput || !passwordInput || !signInButton) {
        return {
          ok: false,
          inputCount: inputs.length,
          placeholders: inputs.map((input) => input.placeholder ?? ""),
          buttonTexts: Array.from(document.querySelectorAll("button")).map((button) => button.textContent.trim())
        };
      }
      setValue(emailInput, ${JSON.stringify(email)});
      setValue(passwordInput, ${JSON.stringify(password)});
      signInButton.click();
      return { ok: true };
    })()`,
  );

  if (!result?.ok) {
    throw new Error(
      `Could not find runtime panel sign-in controls: ${JSON.stringify(result)}`,
    );
  }
}

async function clickButton(client, label) {
  const result = await evaluate(
    client,
    `(() => {
      const button = Array.from(document.querySelectorAll("button"))
        .find((candidate) => candidate.textContent.trim().toLowerCase() === ${JSON.stringify(label)}.toLowerCase() && !candidate.disabled);
      if (!button) {
        return { ok: false };
      }
      button.click();
      return { ok: true };
    })()`,
  );

  if (!result?.ok) {
    throw new Error(`Could not click enabled button: ${label}`);
  }
}

async function readWeekPlanIndexedDb(client) {
  return evaluate(
    client,
    `new Promise((resolve) => {
      const request = indexedDB.open("weeknary-weekplan");
      request.onerror = () => resolve({ dbExists: false, storeExists: false, count: 0, hasRemoteConfirmedStatus: false });
      request.onsuccess = () => {
        const db = request.result;
        const storeExists = db.objectStoreNames.contains("week_plans");
        if (!storeExists) {
          db.close();
          resolve({ dbExists: true, storeExists: false, count: 0, hasRemoteConfirmedStatus: false });
          return;
        }
        const transaction = db.transaction("week_plans", "readonly");
        const getAllRequest = transaction.objectStore("week_plans").getAll();
        getAllRequest.onsuccess = () => {
          const rows = Array.isArray(getAllRequest.result) ? getAllRequest.result : [];
          const count = rows.length;
          const hasRemoteConfirmedStatus = rows.some((row) => row?.localFirstStatus?.remoteState === "remote-confirmed");
          db.close();
          resolve({ dbExists: true, storeExists: true, count, hasRemoteConfirmedStatus });
        };
        getAllRequest.onerror = () => {
          db.close();
          resolve({ dbExists: true, storeExists: true, count: 0, hasRemoteConfirmedStatus: false });
        };
      };
    })`,
  );
}

async function waitUntil(callback, timeoutMs, failureMessage) {
  const started = Date.now();
  let lastError;

  while (Date.now() - started < timeoutMs) {
    try {
      const value = await callback();
      if (value) {
        return value;
      }
    } catch (error) {
      lastError = error;
      if (error instanceof Error && !error.message.includes("fetch failed")) {
        throw error;
      }
    }
    await delay(500);
  }

  if (lastError) {
    throw lastError;
  }
  throw new Error(failureMessage);
}

function assertText(text, expected, label) {
  if (!includesText(text, expected)) {
    throw new Error(
      `Missing browser text for ${label}: ${expected}\nRendered text snippet: ${text.slice(0, 1200)}`,
    );
  }
}

function includesText(text, expected) {
  return text.toLocaleLowerCase("en-US").includes(
    expected.toLocaleLowerCase("en-US"),
  );
}

function pass(label, message) {
  results.push({ label, status: "passed", message });
}

function skip(label, message) {
  results.push({ label, status: "skipped", message });
}

function fail(label, message) {
  results.push({ label, status: "failed", message });
  printResults();
  process.exit(1);
}

function printResults() {
  if (results.length === 0) {
    return;
  }

  console.log("Phase 19 browser validation results:");
  for (const result of results) {
    console.log(`- ${result.status.toUpperCase()} ${result.label}: ${result.message}`);
  }
}

function delay(ms) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });
}

async function removeWithRetry(path, { optional = false } = {}) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(path, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 4) {
        if (optional) {
          console.warn(
            `Warning: could not remove temporary browser validation path ${path}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return;
        }
        throw error;
      }
      await delay(500);
    }
  }
}
