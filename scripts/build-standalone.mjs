#!/usr/bin/env node
/**
 * The form is authored as an artifact fragment — no <!doctype>, <html>, <head> or
 * <body>, because the hosting layer supplies them. That is correct for publishing
 * and wrong for a file you email to someone: with no doctype a browser opens it in
 * quirks mode.
 *
 * This wraps the fragment in a real HTML5 document so it can be distributed as a
 * standalone file. Generated on demand rather than committed, so there is no second
 * copy to drift out of step with the original.
 *
 *   node scripts/build-standalone.mjs [outfile]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'forms/cafop-executive-reimbursement-form.html');
const out = process.argv[2] || join(root, 'forms/cafop-reimbursement-form.standalone.html');

const src = readFileSync(SRC, 'utf8');

// Everything up to and including </style> belongs in <head>; the rest is <body>.
const split = src.indexOf('</style>');
if (split === -1) {
  console.error('Expected a </style> tag in the source fragment — its structure has changed.');
  process.exit(2);
}
const head = src.slice(0, split + '</style>'.length).trim();
const body = src.slice(split + '</style>'.length).trim();

// Match on a tag boundary, so <header> is not mistaken for <head>.
for (const tag of ['html', 'head', 'body']) {
  if (new RegExp(`<${tag}[\\s>]`, 'i').test(src)) {
    console.error(`The source already contains a <${tag}> tag — it is no longer a bare fragment, so wrapping would nest tags.`);
    process.exit(2);
  }
}
if (/<!doctype/i.test(src)) {
  console.error('The source already declares a doctype — it is no longer a bare fragment.');
  process.exit(2);
}
if (!/<meta charset/i.test(head)) { console.error('No charset meta found in the head material.'); process.exit(2); }
if (!/<title>/i.test(head))       { console.error('No title found in the head material.'); process.exit(2); }

writeFileSync(out, `<!doctype html>
<html lang="en">
<head>
${head}
</head>
<body>
${body}
</body>
</html>
`);

console.log(`Wrote ${out}`);
console.log('Standards mode, self-contained apart from the Google Fonts links.');
console.log('Email it, put it on a shared drive, or open it straight from disk.');
