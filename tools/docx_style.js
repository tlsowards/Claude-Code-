// Typography for every Word deliverable in this project.
//
// The docx library takes sizes in half-points, so 24 means 12pt. Writing that
// arithmetic out once here is the whole point of this file: the four builders
// used to carry their own literals, which is how the body text drifted down to
// 10.5pt and table cells to 9.5pt without anyone deciding to.
//
// The floors are a standing preference recorded in CLAUDE.md section 14:
// body text at least 12pt, headings at least 14pt. Heading levels ascend from
// that floor so the hierarchy survives rather than flattening to one size.
//
// Running heads and page numbers sit below the body floor on purpose. They are
// document furniture, not paragraphs of the report, and at 12pt they compete
// with the text. If that call is ever revisited, this is the only line to edit.

const pt = (n) => Math.round(n * 2);

const TYPE = {
  BODY: pt(12),      // default run, paragraphs
  CELL: pt(12),      // table cell text
  NOTE: pt(12),      // caveat blocks, change-log and status lines
  H3: pt(14),        // heading floor
  H2: pt(15),
  H1: pt(17),
  SUBTITLE: pt(16),  // title-page subtitle
  META: pt(13),      // title-page department and facility lines
  TITLE: pt(24),     // title-page title
  RUNNING: pt(9),    // running head and page number, furniture not body
};

// Guard the floors rather than trusting them to stay put. A future edit that
// drops body or a heading below the preference fails the build instead of
// shipping a document nobody can read comfortably.
const BODY_FLOOR = pt(12);
const HEADING_FLOOR = pt(14);
const tooSmall = [];
for (const k of ['BODY', 'CELL', 'NOTE']) {
  if (TYPE[k] < BODY_FLOOR) tooSmall.push(`${k} is ${TYPE[k] / 2}pt, below the 12pt body floor`);
}
for (const k of ['H1', 'H2', 'H3']) {
  if (TYPE[k] < HEADING_FLOOR) tooSmall.push(`${k} is ${TYPE[k] / 2}pt, below the 14pt heading floor`);
}
if (tooSmall.length) {
  console.error('ABORTED. tools/docx_style.js violates the typography floors in '
    + 'CLAUDE.md section 14:');
  tooSmall.forEach((m) => console.error('  ' + m));
  process.exit(1);
}

module.exports = { TYPE, pt };
