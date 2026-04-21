import {
  printTrustedLiveValidationFailures,
  validateTrustedLiveValidationConfig,
} from "./live-validation-config.mjs";

const { failures } = validateTrustedLiveValidationConfig();

if (failures.length > 0) {
  printTrustedLiveValidationFailures(failures);
  process.exit(1);
}

console.log("Trusted live validation prerequisites passed.");
