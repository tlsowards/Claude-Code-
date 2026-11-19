// Text helpers shared by the Case library scripts (narration builder and video kit builder), so the
// two never drift apart on how a case's fields are shortened for speech or for a one-line cite.

/** The first decision date only. Amended-opinion history, after a semicolon or in parentheses, is written history for the Decision line, not for a cite or for speech. */
export function decidedShort(decided) {
  return decided.split(' (')[0].split(';')[0].trim();
}

// Periods inside citations and abbreviations (U.S., v., No., n.10, F.3d, Dr., Supp.) are not sentence ends.
const ABBR = /\b(U\.S\.C\.|U\.S\.|v\.|No\.|Nos\.|n\.|F\.|Supp\.|Dr\.|Mr\.|Mrs\.|Ms\.|Cir\.|Cal\.|Dist\.|Ct\.|App\.|Inc\.|Jr\.|Sr\.)/g;
const MARK = '\u0001';
function protect(s) {
  return s.replace(ABBR, (m) => m.replace(/\./g, MARK));
}
function restore(s) {
  return s.replace(new RegExp(MARK, 'g'), '.');
}
/** The first sentence, with a closing quote or bracket kept on it. */
export function firstSentence(s) {
  const t = protect(s);
  const m = t.match(/^.*?[.!?]["')\]]*(?=\s|$)/);
  return restore(m ? m[0] : t).trim();
}
/** Every sentence, abbreviation-safe. */
export function sentences(s) {
  const t = protect(s);
  return (t.match(/[^.!?]+[.!?]+["')\]]*(?=\s|$)/g)?.map((x) => restore(x).trim()) ?? [restore(t)]);
}
