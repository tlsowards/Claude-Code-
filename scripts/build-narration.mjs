// Turns a weekly brief (content/briefs/<id>.json) into a spoken narration script for a general
// audience of trainers, supervisors, and officers. Writes content/narration/<id>.txt.
// Usage: node scripts/build-narration.mjs 2026-w44 [more ids...]   (no ids = all briefs)
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const briefDir = resolve(root, 'content/briefs');
const outDir = resolve(root, 'content/narration');
mkdirSync(outDir, { recursive: true });

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
function range(a, b) {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return ma === mb ? `${MONTHS[ma - 1]} ${da} through ${db}, ${yb}` : `${MONTHS[ma - 1]} ${da} through ${MONTHS[mb - 1]} ${db}, ${yb}`;
}
/** Make citations and docket numbers easier to read aloud. */
function speakable(s) {
  return s
    .replace(/\bF\.4th\b/g, 'F fourth')
    .replace(/\bF\.3d\b/g, 'F third')
    .replace(/\bU\.S\.C\./g, 'U S C')
    .replace(/\bU\.S\.\b/g, 'U S')
    .replace(/\bv\.\s/g, 'versus ')
    .replace(/\bNo\.\s/g, 'number ')
    .replace(/\bsection (\d+)([a-z])\b/gi, (m, n, l) => `section ${n} ${l}`)
    .replace(/\(\d+(st|nd|rd|th) Cir\. (\d{4})\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
const statusLine = {
  published: 'This is a published decision.',
  unpublished: 'This decision is unpublished, so it is not binding precedent.',
  order: 'This is an order, not a full opinion.',
  'cert-denied': 'The Supreme Court declined to review this case, which is not a ruling on the merits.',
  'summary-order': 'This is a summary order, not a precedential opinion.',
};

function narrate(brief) {
  const p = [];
  p.push(`This is the Use of Force Case Law Update from Sowards Consulting, for the week of ${range(brief.coverageStart, brief.coverageEnd)}. This update is written for trainers, supervisors, and the officers they train, in patrol, probation, custody, and juvenile settings. The order is always the same: federal law first, starting with the Ninth Circuit and the Supreme Court, then the other federal circuits, then California, and then application, meaning what to do with it on the street, in the jail, and in the juvenile hall. Every case ends with two things: what it means in practice, and how to train it.`);
  p.push(`Here is the short version. ${brief.summary}`);
  if (brief.coverage?.length) {
    p.push(`A note on coverage this week. ${brief.coverage.map((c) => c.replace(/\s+$/, '')).join(' ')}`);
  }
  for (const section of brief.sections) {
    const head = section.heading;
    if (section.cases.length === 0) {
      p.push(`Now, the ${head}. ${section.note ?? 'Nothing to report this week.'}`);
      continue;
    }
    p.push(`Now, the ${head}.${section.note ? ' ' + section.note : ''}`);
    for (const c of section.cases) {
      const lines = [];
      lines.push(`${speakable(c.name)}. ${speakable(c.court)}, decided ${c.decided}${c.docket ? `, docket number ${c.docket}` : ''}. ${statusLine[c.status] ?? ''}`);
      if (c.caution) lines.push(`A verification note before the facts. ${c.caution}`);
      lines.push(`Here are the facts. ${speakable(c.facts)}`);
      lines.push(`The holding. ${speakable(c.holding)}`);
      if (c.dissent) lines.push(`On the dissent. ${speakable(c.dissent)}`);
      if (c.notDecided) lines.push(`What was not decided. ${speakable(c.notDecided)}`);
      lines.push(`What this means in practice. ${speakable(c.inPractice)}`);
      lines.push(`How to train it. ${speakable(c.trainIt)}`);
      p.push(lines.join(' '));
    }
  }
  p.push(`Now the application, the part to take into a briefing room or a training block this week.`);
  brief.applications.forEach((a, i) => p.push(`${['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth'][i] ?? `Number ${i + 1}`}, ${a.title.replace(/\.$/, '')}. ${a.body}`));
  p.push(`That is the update for this week. Everything here comes from the courts' own opinions unless the brief says otherwise. Read the full opinion before relying on any case, confirm unpublished decisions with counsel before citing them, and check every point against your agency's policy. The written brief, a printable roll call version, and a short knowledge check are in the Sowards Consulting app. This has been the Use of Force Case Law Update from Sowards Consulting, at sowardsconsulting dot com. Train hard, document everything, and stay safe out there.`);
  return p.join('\n\n');
}

const ids = process.argv.slice(2);
const files = readdirSync(briefDir).filter((f) => f.endsWith('.json')).filter((f) => ids.length === 0 || ids.includes(f.replace('.json', '')));
for (const f of files) {
  const brief = JSON.parse(readFileSync(resolve(briefDir, f), 'utf8'));
  const text = narrate(brief);
  const out = resolve(outDir, f.replace('.json', '.txt'));
  writeFileSync(out, text + '\n');
  const words = text.split(/\s+/).length;
  console.log(`${brief.id}: ${words} words, about ${Math.round(words / 150)} minutes at 150 wpm -> content/narration/${f.replace('.json', '.txt')}`);
}
