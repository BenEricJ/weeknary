import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const LIVE_VALIDATION_REQUIRED_ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_DB_PASSWORD",
  "WEEKNARY_TEST_USER_A_EMAIL",
  "WEEKNARY_TEST_USER_A_PASSWORD",
  "WEEKNARY_TEST_USER_B_EMAIL",
  "WEEKNARY_TEST_USER_B_PASSWORD",
];

export const LIVE_SCRIPT_REQUIRED_ENV_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "WEEKNARY_TEST_USER_A_EMAIL",
  "WEEKNARY_TEST_USER_A_PASSWORD",
  "WEEKNARY_TEST_USER_B_EMAIL",
  "WEEKNARY_TEST_USER_B_PASSWORD",
];

export function loadLiveValidationEnv(root = process.cwd()) {
  return {
    ...parseEnvFile(root, ".env"),
    ...parseEnvFile(root, ".env.local"),
    ...process.env,
  };
}

export function validateTrustedLiveValidationConfig({
  root = process.cwd(),
  requiredEnvKeys = LIVE_VALIDATION_REQUIRED_ENV_KEYS,
} = {}) {
  const env = loadLiveValidationEnv(root);
  const failures = [];

  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
    failures.push({
      code: "INSECURE_TLS_BYPASS",
      message:
        "NODE_TLS_REJECT_UNAUTHORIZED=0 is not allowed for trusted live validation.",
    });
  }

  failures.push(...validateNodeExtraCaCerts());

  const missingEnvKeys = requiredEnvKeys.filter((key) => !env[key]);

  if (missingEnvKeys.length > 0) {
    failures.push({
      code: "MISSING_LIVE_ENV",
      message: `Missing live validation environment keys: ${missingEnvKeys.join(", ")}`,
    });
  }

  return {
    env,
    failures,
    caPath: process.env.NODE_EXTRA_CA_CERTS?.trim() ?? "",
  };
}

export function printTrustedLiveValidationFailures(failures) {
  console.error("Trusted live validation prerequisites failed:");
  for (const failure of failures) {
    console.error(`- ${failure.code}: ${failure.message}`);
  }
  console.error("");
  printTrustedLiveValidationRemediation();
}

export function printTrustedLiveValidationRemediation() {
  console.error("Trusted setup examples:");
  console.error('PowerShell: $env:NODE_EXTRA_CA_CERTS="C:\\path\\to\\corporate-root-ca.pem"');
  console.error('Command Prompt: set "NODE_EXTRA_CA_CERTS=C:\\path\\to\\corporate-root-ca.pem"');
  console.error('Git Bash: export NODE_EXTRA_CA_CERTS="/c/path/to/corporate-root-ca.pem"');
  console.error("Run: npm run validate:phase20:live:trusted");
  console.error("Unset after validation if desired:");
  console.error("PowerShell: Remove-Item Env:NODE_EXTRA_CA_CERTS");
  console.error("Command Prompt: set NODE_EXTRA_CA_CERTS=");
  console.error("Git Bash: unset NODE_EXTRA_CA_CERTS");
}

export function formatTrustedTlsFailure(error) {
  const message = error?.message ?? String(error);
  const details = collectErrorDetails(error);
  const isTlsCertificateError = details.some((detail) =>
    /SELF_SIGNED_CERT_IN_CHAIN|self-signed certificate|unable to verify|certificate/i.test(
      detail,
    ),
  );

  if (!isTlsCertificateError && message !== "fetch failed") {
    return message;
  }

  return [
    message,
    "",
    "CA present but live TLS still failed.",
    "Verify NODE_EXTRA_CA_CERTS points to the corporate root CA used for this network path.",
    "Do not use NODE_TLS_REJECT_UNAUTHORIZED=0.",
    "Run: npm run validate:phase20:live:trusted",
  ].join("\n");
}

export function collectErrorDetails(error) {
  const details = [];
  const visited = new Set();
  let current = error;

  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);

    if (current.message) {
      details.push(String(current.message));
    }

    if (current.code) {
      details.push(String(current.code));
    }

    current = current.cause;
  }

  return details;
}

function validateNodeExtraCaCerts() {
  const caPath = process.env.NODE_EXTRA_CA_CERTS?.trim();

  if (!caPath) {
    return [
      {
        code: "MISSING_CA_PATH",
        message:
          "NODE_EXTRA_CA_CERTS is not set. Set it to the corporate root CA PEM/CRT path before starting Node.",
      },
    ];
  }

  if (!existsSync(caPath)) {
    return [
      {
        code: "MISSING_CA_FILE",
        message: "NODE_EXTRA_CA_CERTS points to a missing file.",
      },
    ];
  }

  let stat;

  try {
    stat = statSync(caPath);
  } catch (error) {
    return [
      {
        code: "UNREADABLE_CA_FILE",
        message: `NODE_EXTRA_CA_CERTS could not be inspected: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ];
  }

  if (!stat.isFile()) {
    return [
      {
        code: "CA_PATH_NOT_FILE",
        message: "NODE_EXTRA_CA_CERTS must point to a certificate file, not a directory.",
      },
    ];
  }

  let caContent;

  try {
    caContent = readFileSync(caPath, "utf8");
  } catch (error) {
    return [
      {
        code: "UNREADABLE_CA_FILE",
        message: `NODE_EXTRA_CA_CERTS could not be read: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ];
  }

  const beginCount = countMatches(caContent, "-----BEGIN CERTIFICATE-----");
  const endCount = countMatches(caContent, "-----END CERTIFICATE-----");

  if (beginCount === 0 || beginCount !== endCount) {
    return [
      {
        code: "INVALID_CA_FORMAT",
        message:
          "NODE_EXTRA_CA_CERTS must be a PEM/CRT bundle with matching certificate boundaries.",
      },
    ];
  }

  return [];
}

function parseEnvFile(root, path) {
  const fullPath = join(root, path);

  if (!existsSync(fullPath)) {
    return {};
  }

  const entries = {};
  const content = readFileSync(fullPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    entries[key] = value;
  }

  return entries;
}

function countMatches(value, pattern) {
  return value.split(pattern).length - 1;
}
