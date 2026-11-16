// Text helpers shared by the Case library scripts (narration builder and video kit builder), so the
// two never drift apart on how a case's fields are shortened for speech or for a one-line cite.

/** The first decision date only. Amended-opinion history, after a semicolon or in parentheses, is written history for the Decision line, not for a cite or for speech. */
export function decidedShort(decided) {
  return decided.split(' (')[0].split(';')[0].trim();
}
