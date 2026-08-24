#!/usr/bin/env node
/**
 * Builds google-form/Index.html — the Apps Script web-app page — from the canonical
 * printable form plus the submit block. The form is written once and served twice;
 * this keeps the online version from drifting away from the printed one.
 *
 *   node scripts/build-webapp.mjs           # write Index.html
 *   node scripts/build-webapp.mjs --check   # fail if Index.html is stale (CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC    = join(root, 'forms/cafop-executive-reimbursement-form.html');
const BLOCK  = join(root, 'google-form/submit-block.html');
const OUT    = join(root, 'google-form/Index.html');
const check  = process.argv.includes('--check');

const src = readFileSync(SRC, 'utf8');
const block = readFileSync(BLOCK, 'utf8');

for (const tag of ['html', 'head', 'body']) {
  if (new RegExp(`<${tag}[\\s>]`, 'i').test(src)) {
    console.error(`${SRC} already contains a <${tag}> tag; it is meant to be a fragment.`);
    process.exit(2);
  }
}

// The form ends with two <p class="foot"> notes. The submit block goes above them, so
// the rate footnotes stay last on the page exactly as they do in print.
const anchor = '  <p class="foot">';
if (!src.includes(anchor)) {
  console.error('Could not find the footer paragraph to insert the submit block above.');
  process.exit(2);
}

const cut = src.indexOf('</style>') + '</style>'.length;
const head = src.slice(0, cut);
const body = src.slice(cut).replace(anchor, block + '\n' + anchor);

if (!/<meta\s+charset/i.test(head) || !/<title>/i.test(head)) {
  console.error('Expected a charset meta and a title in the source form.');
  process.exit(2);
}

const out = `<!doctype html>
<html lang="en">
<head>
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;

if (check) {
  let current = '';
  try { current = readFileSync(OUT, 'utf8'); } catch { /* missing counts as stale */ }
  if (current !== out) {
    console.error('google-form/Index.html is out of date. Run: node scripts/build-webapp.mjs');
    process.exit(1);
  }
  console.log('Index.html is in sync with the printable form.');
  process.exit(0);
}

writeFileSync(OUT, out);
console.log(`Wrote ${OUT} (${(out.length / 1024).toFixed(1)} KB).`);
console.log('Paste it into the Apps Script project as an HTML file named "Index".');
