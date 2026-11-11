const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");

assert(process.env.TZ, "Set TZ explicitly to make the calendar case reproducible");
const root = path.resolve(__dirname, "../../..");
const frontendRequire = createRequire(path.join(root, "frontend/package.json"));
const ts = frontendRequire("typescript");
const source = fs.readFileSync(
  path.join(root, "frontend/src/lib/financial-utils.ts"),
  "utf8",
);
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const sandbox = { exports: {} };
vm.runInNewContext(code, sandbox);
const { computeKPIs, computeMonthlyData } = sandbox.exports;
const input = [{
  create_date: "2024-02-01",
  amount: 500,
  operation_type: "income",
  category: "sales",
  business_type: "B2C",
}];
const expected = [{
  month: "Feb 2024",
  income: 500,
  outcome: 0,
  profitPercent: 100,
}];
const observed = computeMonthlyData(input);
console.log(JSON.stringify({
  timezone: process.env.TZ,
  input,
  expected,
  observed,
}));
assert.equal(JSON.stringify(computeKPIs([])), JSON.stringify({
  totalIncome: 0,
  totalOutcome: 0,
  profit: 0,
  profitPercent: 0,
}), "Empty KPI input must remain zero");
assert.equal(computeMonthlyData([]).length, 0, "Empty monthly input must remain empty");
assert.equal(JSON.stringify(observed), JSON.stringify(expected),
  "ISO calendar date must keep its month regardless of timezone");
console.log("PASS: calendar month, totals and empty inputs");
