// Turns a Case library teaching brief (content/cases/<id>.json) into a spoken narration script for a
// single evergreen case video on the Sowards Briefing Room channel. Writes content/narration/cases/<id>.txt.
// Only the officer-facing material is read: facts, holding, dissent, what was not decided, what it means
// in practice, how to train it, and the briefing room points. Coverage and caution notes are internal
// research records and are never narrated. Pin cites are dropped from the spoken text.
// Usage: node scripts/build-case-narration.mjs graham-v-connor [more ids...]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const caseDir = resolve(root, 'content/cases');
const outDir = resolve(root, 'content/narration/cases');
mkdirSync(outDir, { recursive: true });

/** Make citations, pin cites, and docket numbers easier to read aloud. */
export function speakable(s) {
  return s
    // Parenthetical pin cites: (490 U.S. at 388), (at 396 to 397), (at 395 n.10), (at 390 n.1)
    .replace(/\s*\((?:\d+ (?:U\.S\.|F\.\d\w*) )?at \d+[^)]*\)/g, '')
    // Bracketed editorial capitals: [T]here -> There
    .replace(/\[([A-Za-z])\]/g, '$1')
    .replace(/\bF\.4th\b/g, 'F fourth')
    .replace(/\bF\.3d\b/g, 'F third')
    .replace(/\bF\.2d\b/g, 'F second')
    .replace(/\bF\. Supp\./g, 'F Supp')
    .replace(/\bU\.S\.C\./g, 'U S C')
    .replace(/\bU\.S\.\b/g, 'U S')
    .replace(/\bv\.\s/g, 'versus ')
    .replace(/\bNo\.\s/g, 'number ')
    .replace(/\bn\.(\d+)\b/g, 'footnote $1')
    .replace(/\bsection (\d+)([a-z])\b/gi, (m, n, l) => `section ${n} ${l}`)
    .replace(/\(\d+(st|nd|rd|th) Cir\. (\d{4})\)/g, '')
    .replace(/\(en banc\)/g, 'en banc')
    .replace(/\bDr\. Sowards' /g, 'my ')
    .replace(/\bDr\. Sowards teaches\b/g, 'I teach')
    .replace(/\bThe course also connects\b/g, 'I also connect')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();
}
const statusLine = {
  published: 'This is a published decision.',
  unpublished: 'This decision is unpublished, so it is not binding precedent.',
  order: 'This is an order, not a full opinion.',
  'summary-order': 'This is a summary order, not a precedential opinion.',
  unknown: 'Check the publication status of this decision before citing it.',
};
const ORD = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'];

export function narrateCase(c) {
  const name = speakable(c.name);
  const court = speakable(c.court.split(' (')[0]);
  const p = [];
  p.push(`${name}. From the Sowards Briefing Room. ${c.summary}`);
  // The first decision date only; amended-opinion history is written history, not spoken.
  const decided = c.decided.split(';')[0].split(' (')[0].trim();
  p.push(`${name}. ${court}, decided ${decided}${c.docket ? `, docket number ${speakable(c.docket.split(' (')[0])}` : ''}. ${statusLine[c.status] ?? ''}`.trim());
  p.push(`Here are the facts. ${speakable(c.facts)}`);
  p.push(`The holding. ${speakable(c.holding)}`);
  if (c.dissent) p.push(`On the dissent. ${speakable(c.dissent)}`);
  if (c.notDecided) p.push(`What was not decided. ${speakable(c.notDecided)}`);
  p.push(`What this means in practice. ${speakable(c.inPractice)}`);
  p.push(`How to train it. ${speakable(c.trainIt)}`);
  if (c.applications?.length) {
    p.push('The briefing room points, the part to take into a briefing or a training block.');
    c.applications.forEach((a, i) => p.push(`${ORD[i] ?? `Number ${i + 1}`}, ${speakable(a.title).replace(/\.$/, '')}. ${speakable(a.body)}`));
  }
  p.push(`That is ${name}. Read the full opinion before relying on it, and check every point against your agency's policy. The written brief, the training points, and a short knowledge check are in the Sowards Consulting app, at app dot sowardsconsulting dot com. I am Dr. Tim Sowards. Train hard, document everything, and stay safe out there.`);
  return p.join('\n\n');
}

const ids = process.argv.slice(2);
if (ids.length === 0) {
  console.error('Usage: node scripts/build-case-narration.mjs <case id> [more ids...]');
  process.exit(1);
}
const missing = ids.filter((id) => !existsSync(resolve(caseDir, `${id}.json`)));
if (missing.length) {
  console.error(`No case file for: ${missing.join(', ')} (expected content/cases/<id>.json)`);
  process.exit(1);
}
for (const id of ids) {
  const c = JSON.parse(readFileSync(resolve(caseDir, `${id}.json`), 'utf8'));
  const text = narrateCase(c);
  writeFileSync(resolve(outDir, `${id}.txt`), text + '\n');
  const words = text.split(/\s+/).length;
  console.log(`${id}: ${words} words, ${text.length} characters, about ${Math.round(words / 150)} minutes at 150 wpm -> content/narration/cases/${id}.txt`);
}
