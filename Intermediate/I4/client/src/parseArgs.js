const SUPPORTED = new Set(["USD", "EUR", "GBP", "INR", "JPY"]);

export function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    amount: undefined,
    from: undefined,
    to: undefined,
    baseUrl: process.env.CONVERT_API_URL ?? "http://127.0.0.1:8000",
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (token === "--help" || token === "-h") {
      options.help = true;
      continue;
    }

    if (token === "--amount" || token === "-a") {
      options.amount = args[index + 1];
      index += 1;
      continue;
    }

    if (token === "--from" || token === "-f") {
      options.from = args[index + 1];
      index += 1;
      continue;
    }

    if (token === "--to" || token === "-t") {
      options.to = args[index + 1];
      index += 1;
      continue;
    }

    if (token === "--url") {
      options.baseUrl = args[index + 1];
      index += 1;
      continue;
    }

    if (options.amount === undefined) {
      options.amount = token;
      continue;
    }

    if (options.from === undefined) {
      options.from = token;
      continue;
    }

    if (options.to === undefined) {
      options.to = token;
      continue;
    }

    throw new Error(`Unexpected argument: ${token}`);
  }

  return options;
}

export function validateCliInput({ amount, from, to }) {
  const errors = [];

  const parsedAmount = Number(amount);
  if (amount === undefined || amount === "") {
    errors.push("amount is required");
  } else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.push("amount must be a positive number");
  }

  const fromCurrency = from?.toUpperCase();
  if (!from) {
    errors.push("from currency is required");
  } else if (from.length !== 3 || !SUPPORTED.has(fromCurrency)) {
    errors.push(`from must be one of: ${[...SUPPORTED].sort().join(", ")}`);
  }

  const toCurrency = to?.toUpperCase();
  if (!to) {
    errors.push("to currency is required");
  } else if (to.length !== 3 || !SUPPORTED.has(toCurrency)) {
    errors.push(`to must be one of: ${[...SUPPORTED].sort().join(", ")}`);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      amount: parsedAmount,
      from: fromCurrency,
      to: toCurrency,
    },
  };
}

export function formatConversion(result) {
  return `${result.amount} ${result.from} = ${result.result} ${result.to} (rate: ${result.rate})`;
}

export function printHelp() {
  console.log(`Usage: convert [--amount|-a] <amount> [--from|-f] <code> [--to|-t] <code> [--url <baseUrl>]

Examples:
  npm run convert -- 100 USD EUR
  npm run convert -- --amount 50 --from GBP --to INR

Environment:
  CONVERT_API_URL  Base URL for the converter API (default: http://127.0.0.1:8000)
`);
}
