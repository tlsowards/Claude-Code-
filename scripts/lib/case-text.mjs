// Text helpers shared by the Case library scripts (narration builder and video kit builder), so the
// two never drift apart on how a case's fields are shortened for speech or for a one-line cite.

/** The first decision date only. Amended-opinion history, after a semicolon or in parentheses, is written history for the Decision line, not for a cite or for speech. */
export function decidedShort(decided) {
  return decided.split(' (')[0].split(';')[0].trim();
}

// Periods inside citations and abbreviations (U.S., v., No., n.10, F.3d, Dr., Supp.) are not sentence ends.
const ABBR = /\b(U\.S\.C\.|U\.S\.|v\.|No\.|Nos\.|n\.|F\.|Supp\.|Dr\.|Mr\.|Mrs\.|Ms\.|Cir\.|Cal\.|Dist\.|Ct\.|App\.|Inc\.|Jr\.|Sr\.)/g;
// A single capital letter with a period followed by another capitalized word is an initial (Officer R. Villegas, Judge W. Fletcher), not a sentence end.
const INITIAL = /\b([A-Z])\.(?=\s+[A-Z])/g;
const MARK = '\u0001';
function protect(s) {
  return s.replace(ABBR, (m) => m.replace(/\./g, MARK)).replace(INITIAL, `$1${MARK}`);
}
function restore(s) {
  return s.replace(new RegExp(MARK, 'g'), '.');
}
/** The first sentence, with a closing quote or bracket kept on it. */
export function firstSentence(s) {
  return sentences(s)[0] ?? s.trim();
}
/**
 * Every sentence, abbreviation-safe. A sentence end inside an open quotation ("Gun! Gun! He's got a
 * gun!" justified the shot) does not split the sentence: pieces are joined until the double quotes balance.
 */
export function sentences(s) {
  const t = protect(s);
  const pieces = t.match(/[^.!?]+[.!?]+["')\]]*(?=\s|$)/g)?.map((x) => restore(x).trim()) ?? [restore(t).trim()];
  const out = [];
  let open = '';
  pieces.forEach((piece, i) => {
    open = open ? `${open} ${piece}` : piece;
    const balanced = (open.match(/"/g) ?? []).length % 2 === 0;
    const next = pieces[i + 1];
    // A quotation that closes right after its own punctuation ("...gun!" justified) continues the
    // sentence when the next piece starts in lower case.
    const continues = /["']$/.test(piece) && next !== undefined && /^[a-z]/.test(next);
    if (balanced && !continues) {
      out.push(open);
      open = '';
    }
  });
  if (open) out.push(open);
  return out;
}
