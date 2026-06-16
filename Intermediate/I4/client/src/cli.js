#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { convertCurrency } from "./api.js";
import {
  formatConversion,
  parseArgs,
  printHelp,
  validateCliInput,
} from "./parseArgs.js";

export async function run(argv, fetchImpl = fetch) {
  const options = parseArgs(argv);

  if (options.help) {
    printHelp();
    return 0;
  }

  const validation = validateCliInput(options);
  if (!validation.ok) {
    for (const error of validation.errors) {
      console.error(`Error: ${error}`);
    }
    printHelp();
    return 1;
  }

  try {
    const result = await convertCurrency(
      {
        baseUrl: options.baseUrl,
        ...validation.value,
      },
      fetchImpl,
    );
    console.log(formatConversion(result));
    return 0;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const exitCode = await run(process.argv);
  process.exit(exitCode);
}
