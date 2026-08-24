#!/usr/bin/env node
/**
 * The printable form and the Google Form each carry their own copy of the rates.
 * Nothing stops one from being updated without the other, and the failure is quiet:
 * two officers filing the same trip on different forms get different totals.
 *
 * This compares the constants in both files and exits non-zero if they disagree.
 *   node scripts/check-rate-parity.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORM = 'forms/cafop-executive-reimbursement-form.html';
const GS   = 'google-form/Code.gs';

function read(rel) {
  try { return readFileSync(join(root, rel), 'utf8'); }
  catch { console.error(`Cannot read ${rel}`); process.exit(2); }
}

/** Pull `name = <number>` out of a source file, whatever the surrounding syntax. */
function scalar(src, name, file) {
  const m = src.match(new RegExp(`\\b${name}\\s*[:=]\\s*(-?[\\d.]+)`));
  if (!m) { console.error(`Could not find ${name} in ${file}`); process.exit(2); }
  return Number(m[1]);
}

function meals(src, file) {
  const m = src.match(/MEAL\s*=\s*\{([^}]*)\}/);
  if (!m) { console.error(`Could not find MEAL in ${file}`); process.exit(2); }
  const out = {};
  for (const [, key, value] of m[1].matchAll(/(\w+)\s*:\s*([\d.]+)/g)) {
    out[key[0]] = Number(value);   // b/l/d, so `b:16` and `breakfast:16` both key to "b"
  }
  return out;
}

function mileage(src, file) {
  const m = src.match(/MILEAGE\s*=\s*\[([\s\S]*?)\]/);
  if (!m) { console.error(`Could not find MILEAGE in ${file}`); process.exit(2); }
  return [...m[1].matchAll(/from\s*:\s*["']([\d-]+)["']\s*,\s*rate\s*:\s*([\d.]+)/g)]
    .map(([, from, rate]) => `${from}=${Number(rate)}`);
}

const a = read(FORM), b = read(GS);
const checks = [
  ['MIE',          scalar(a, 'MIE', FORM),          scalar(b, 'MIE', GS)],
  ['MIE_PARTIAL',  scalar(a, 'MIE_PARTIAL', FORM),  scalar(b, 'MIE_PARTIAL', GS)],
  ['REVIEW_MI',    scalar(a, 'REVIEW_MI', FORM),    scalar(b, 'REVIEW_MI', GS)],
  ['LONG_TRIP_MI', scalar(a, 'LONG_TRIP_MI', FORM), scalar(b, 'LONG_TRIP_MI', GS)],
  ['MEAL',         JSON.stringify(meals(a, FORM)),  JSON.stringify(meals(b, GS))],
  ['MILEAGE',      mileage(a, FORM).join(', '),     mileage(b, GS).join(', ')]
];

let bad = 0;
for (const [name, form, gs] of checks) {
  const ok = String(form) === String(gs);
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'DIFF'}  ${name.padEnd(13)} ${form}${ok ? '' : `   ≠   ${gs}`}`);
}

// The partial-day rate has to actually be 75% of the full rate in both.
const full = scalar(a, 'MIE', FORM), partial = scalar(a, 'MIE_PARTIAL', FORM);
const expected = Math.round(full * 0.75 * 100) / 100;
if (partial !== expected) {
  bad++;
  console.log(`DIFF  75% rule       MIE_PARTIAL is ${partial}, but 75% of ${full} is ${expected}`);
} else {
  console.log(`ok    75% rule       ${partial} is 75% of ${full}`);
}

// Meal components plus the $5 incidentals allowance must add up to the daily rate.
const m = meals(a, FORM);
const sum = (m.b || 0) + (m.l || 0) + (m.d || 0) + 5;
if (sum !== full) {
  bad++;
  console.log(`DIFF  components     ${m.b} + ${m.l} + ${m.d} + 5 incidentals = ${sum}, not ${full}`);
} else {
  console.log(`ok    components     ${m.b} + ${m.l} + ${m.d} + 5 incidentals = ${full}`);
}

console.log(bad
  ? `\n${bad} mismatch(es). The two forms would pay different amounts for the same trip.`
  : '\nRates agree across both forms.');
process.exit(bad ? 1 : 0);
