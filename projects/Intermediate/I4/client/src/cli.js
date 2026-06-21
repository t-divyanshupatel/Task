#!/usr/bin/env node

import { convertCurrency, fetchHealth, fetchRates } from "./api.js";
import {
  formatConvertResult,
  formatRatesResult,
  parseConvertArgs,
} from "./validate.js";

function printUsage() {
  console.error(`Usage:
  currency-cli health
  currency-cli rates
  currency-cli convert <amount> <from> <to>

Environment:
  CONVERTER_API_URL   Base URL of the FastAPI service (default: http://127.0.0.1:8000)

Examples:
  currency-cli convert 100 USD EUR
  currency-cli rates
  CONVERTER_API_URL=http://127.0.0.1:8000 currency-cli health`);
}

async function main() {
  const [, , command, ...args] = process.argv;

  if (!command) {
    printUsage();
    process.exit(2);
  }

  try {
    if (command === "health") {
      const result = await fetchHealth();
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === "rates") {
      const result = await fetchRates();
      console.log(formatRatesResult(result));
      return;
    }

    if (command === "convert") {
      const [amount, fromCurrency, toCurrency] = args;

      if (!amount || !fromCurrency || !toCurrency) {
        printUsage();
        process.exit(2);
      }

      const parsed = parseConvertArgs(amount, fromCurrency, toCurrency);
      const result = await convertCurrency(parsed);
      console.log(formatConvertResult(result));
      return;
    }

    printUsage();
    process.exit(2);
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
}

main();
