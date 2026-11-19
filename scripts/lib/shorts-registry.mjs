// Keeps new Shorts from repeating Shorts already written into earlier kits.
//
// Rule from Dr. Sowards (November 18, 2026): no Short may repeat material that was already posted,
// from a weekly kit or a Case library kit. Each Short needs new material from the case or a clearly
// different angle. Near-duplicates are dropped, not posted.
//
// Every kit under content/youtube (weekly) and content/youtube/cases (Case library) is the record of
// what was written. A builder loads that record, offers a pool of candidate angles for a case, and
// this module keeps only the angles whose sentences have not appeared in an earlier Short for the
// same case. The kit itself says what was checked and what was skipped, so the editor can see it.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const HOOK = /^- Hook \(on screen and spoken\): (.+)$/;
const BODY = /^- Body: (.+)$/;
const HEAD = /^#### Short [\w.]+: (.+)$/;
const MIN = 30; // sentences shorter than this (a case name, a title) are too generic to count as a repeat

export function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function keyCase(name) {
  return normalize(name);
}
function keySentences(text) {
  return (text.match(/[^.!?]+[.!?]+/g) ?? [text]).map((x) => normalize(x)).filter((x) => x.length >= MIN);
}

/** Every Short already written in a kit file, keyed by case name. `exclude` is the kit being rebuilt. */
export function loadUsedShorts(root, exclude) {
  const used = new Map();
  const dirs = [resolve(root, 'content/youtube'), resolve(root, 'content/youtube/cases')];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
      const file = resolve(dir, f);
      if (exclude && resolve(exclude) === file) continue;
      const kit = file.slice(resolve(root).length + 1);
      let current = null;
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const head = line.match(HEAD);
        if (head) {
          current = { kit, caseName: head[1].trim(), hook: '', body: '' };
          const k = keyCase(current.caseName);
          if (!used.has(k)) used.set(k, []);
          used.get(k).push(current);
          continue;
        }
        if (!current) continue;
        const hook = line.match(HOOK);
        if (hook) current.hook = hook[1].trim();
        const body = line.match(BODY);
        if (body) current.body = body[1].trim();
      }
    }
  }
  return used;
}

/**
 * Turn a pool of [segment, text] pairs into candidate angles. Each segment offers its opening
 * (first sentence as the hook, next three as the body) and, when the text is long enough, a second
 * window later in the same segment, so a case with Shorts already out still has fresh material.
 */
export function angles(pool, { sentences, clean = (s) => s }) {
  const opening = [];
  const later = [];
  for (const [segment, text] of pool) {
    if (!text) continue;
    const all = sentences(text).map(clean).filter(Boolean);
    for (let start = 0; start < all.length; start += 4) {
      const hook = leadIn(all[start]);
      const body = all.slice(start + 1, start + 4).join(' ');
      if (!hook || !body) break;
      (start === 0 ? opening : later).push({ segment, hook, body, cut: start === 0 ? `the "${segment}" segment` : `later in the "${segment}" segment` });
    }
  }
  // Every segment's opening comes first, in the builder's priority order; the later windows are the reserve.
  return [...opening, ...later];
}

/** A holding paragraph opens with the disposition ("Vacated and remanded."), which is no hook for a Short. */
export function withoutDisposition(text) {
  return (text ?? '').replace(/^(?:Affirmed|Reversed|Vacated|Remanded|Dismissed|Granted|Denied)[^.!?]*[.!?]\s*/, '');
}

/** A hook lifted from mid-paragraph should not open with "Second," or "Finally,". */
function leadIn(s) {
  const t = s.replace(/^(?:First|Second|Third|Fourth|Fifth|Next|Finally|And|But),?\s+/, '');
  return t === s ? s : t.charAt(0).toUpperCase() + t.slice(1);
}

/** Pick up to `want` angles for a case that share no sentence with an earlier Short for that case or with each other. */
export function planShorts({ used, caseName, candidates, want }) {
  const earlier = used.get(keyCase(caseName)) ?? [];
  const taken = new Set();
  for (const s of earlier) for (const k of [...keySentences(s.hook), ...keySentences(s.body)]) taken.add(k);
  const shorts = [];
  const skipped = [];
  for (const c of candidates) {
    if (shorts.length >= want) break;
    const keys = [...keySentences(c.hook), ...keySentences(c.body)];
    const hit = keys.find((k) => taken.has(k));
    if (hit) {
      skipped.push(c);
      continue;
    }
    keys.forEach((k) => taken.add(k));
    shorts.push(c);
  }
  const kits = [...new Set(earlier.map((s) => s.kit))];
  return { shorts, skipped, earlier, kits, shortfall: Math.max(0, want - shorts.length) };
}

/** Lines for the kit that say what the check found. */
export function shortsNote(plan, caseName) {
  const lines = [];
  if (plan.earlier.length === 0) {
    lines.push(`No-repeat check: no earlier kit has Shorts for ${caseName}. All of these are new.`);
  } else {
    lines.push(
      `No-repeat check: ${plan.earlier.length} earlier Short${plan.earlier.length === 1 ? '' : 's'} for ${caseName} in ${plan.kits.join(', ')}. ` +
        `The Shorts below share no sentence with them${plan.skipped.length ? `; ${plan.skipped.length} candidate${plan.skipped.length === 1 ? '' : 's'} skipped as a repeat` : ''}.`,
    );
  }
  if (plan.shortfall) {
    lines.push(`Only ${plan.shorts.length} distinct angle${plan.shorts.length === 1 ? '' : 's'} left for this case. Do not fill the gap by reusing an earlier Short; ask Dr. Sowards for a new angle or leave it at ${plan.shorts.length}.`);
  }
  return lines;
}
