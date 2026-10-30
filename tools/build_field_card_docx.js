// Supervisor field card, Word view, from drafts/supervisor-guide.json.
//
// Short view of the same source as the full Decision Guide. The Python builder
// holds the guard that fails the build if the card and the guide disagree about
// a tier, so run `npm run field-card`, which runs both, rather than this alone.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageNumber,
} = require('docx');
const { TYPE } = require('./docx_style');

const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'drafts', 'supervisor-guide.json');
const OUT = path.join(ROOT, 'deliverables', 'PREA_Supervisor_Field_Card.docx');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const HEAD_FILL = 'EDEDED';
const ABUSE_FILL = 'F7DDDD';
const WARN_FILL = 'FCF0DC';
const STEP_FILL = 'E7EEF6';
// Letter width 12240 less two 720 twip (half inch) margins. The card is a
// single sheet, so it runs tighter margins than the report length documents.
const CONTENT_W = 10800;

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!data.field) { console.error('ABORTED: no "field" block in ' + SRC); process.exit(1); }
const F = data.field;

// Same length guard the Python builder carries. The card was cut to five steps
// on 10/29; the response sequence and the role matrix moved to the top level of
// the JSON and are rendered by the Decision Guide. Either coming back under
// "field", or a sixth step, puts this back over a page.
const CARD_STEPS = 5;
if (F.steps.length !== CARD_STEPS || F.after || F.roles) {
  console.error('ABORTED. The field card is over length: ' + F.steps.length + ' steps'
    + (F.after ? ', plus a response sequence' : '') + (F.roles ? ', plus a role matrix' : '')
    + '. It is built for ' + CARD_STEPS + ' steps. Added detail goes in the Supervisor '
    + 'Decision Guide, not here.');
  process.exit(1);
}

// Independent of the Python builder's own check, so running this file directly
// while iterating on Word styling cannot ship a dash. Same guard as
// build_supervisor_guide_docx.js. The content is hand written, so nothing
// generated from the register enforces the no-em-dash rule on it.
if (/[\u2014\u2013]/.test(JSON.stringify(F))) {
  console.error('ABORTED. Em or en dash in the "field" block of drafts/supervisor-guide.json, '
    + 'which CLAUDE.md section 1 forbids.');
  process.exit(1);
}

function txt(s, opts = {}) {
  return new TextRun({ text: s, size: opts.size || TYPE.BODY, bold: !!opts.bold,
    color: opts.color || INK, italics: !!opts.italics });
}
// **bold** spans become bold runs.
function runs(s, opts = {}) {
  return String(s).split(/\*\*(.+?)\*\*/g)
    .map((part, i) => txt(part, Object.assign({}, opts, { bold: i % 2 === 1 })));
}
function p(s, opts = {}) {
  return new Paragraph({ children: runs(s, opts), spacing: { after: 90, line: 252 } });
}
function bullet(s, opts = {}) {
  return new Paragraph({ children: runs(s, opts), bullet: { level: 0 },
    spacing: { after: 50, line: 248 } });
}
function cell(children, { width, fill, bold, align, span } = {}) {
  const kids = Array.isArray(children) ? children : [new Paragraph({
    children: runs(children, { bold: !!bold, size: TYPE.CELL }),
    spacing: { before: 40, after: 40, line: 240 }, alignment: align,
  })];
  return new TableCell({ children: kids, width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 } });
}
function table(columnWidths, rows) {
  const sum = columnWidths.reduce((a, b) => a + b, 0);
  if (sum !== CONTENT_W) {
    console.error('ABORTED. Column widths sum to ' + sum + ', content width is ' + CONTENT_W
      + '. Widths: [' + columnWidths.join(', ') + '].');
    process.exit(1);
  }
  return new Table({ columnWidths, width: { size: sum, type: WidthType.DXA }, rows,
    borders: ['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical']
      .reduce((a, k) => (a[k] = { style: BorderStyle.SINGLE, size: 2, color: RULE }, a), {}) });
}
function block(fill, paragraphs) {
  return table([CONTENT_W], [new TableRow({ children: [cell(paragraphs, { width: CONTENT_W, fill })] })]);
}

const body = [];
const push = (...x) => body.push(...x);
const steps = {}; F.steps.forEach((s) => { steps[s.n] = s; });

function stepHead(s) {
  return new Paragraph({
    children: [txt('Step ' + s.n + '.  ', { bold: true, size: TYPE.H1 }),
               txt(s.head, { bold: true, size: TYPE.H1 })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 100 },
  });
}

// Masthead. No title page: this is a two page card and a cover would be a
// third of it.
push(
  new Paragraph({ children: [txt(F.title, { size: TYPE.H1, bold: true })],
    spacing: { after: 60 } }),
  new Paragraph({ children: [txt(F.subtitle, { size: TYPE.NOTE, color: MUTED }),
    txt('   Sacramento County Probation Department, Youth Detention Facility.',
      { size: TYPE.NOTE, color: MUTED })], spacing: { after: 120 } }),
  block(WARN_FILL, [new Paragraph({ children: runs(F.intro, { size: TYPE.CELL }),
    spacing: { before: 60, after: 60, line: 264 } })]),
);

// Step 1, ages
let s = steps[1];
const A1 = [3400, 7400];
push(stepHead(s), p(s.why),
  table(A1, [
    new TableRow({ tableHeader: true,
      children: s.columns.map((c, i) => cell(c, { width: A1[i], fill: HEAD_FILL, bold: true })) }),
    ...s.rows.map((row) => new TableRow({
      children: row.map((c, i) => cell([new Paragraph({
        children: runs(c, { size: TYPE.CELL }), spacing: { before: 40, after: 40, line: 240 },
      })], { width: A1[i] })) })),
  ]),
);

// Step 2, the tier chart
s = steps[2];
const T = [700, 4500, 2600, 3000];
push(stepHead(s), p(s.why),
  table(T, [
    new TableRow({ tableHeader: true, children: [
      cell('Tier', { width: T[0], fill: HEAD_FILL, bold: true }),
      cell('What happened', { width: T[1], fill: HEAD_FILL, bold: true }),
      cell('Is it PREA?', { width: T[2], fill: HEAD_FILL, bold: true }),
      cell('CPS report?', { width: T[3], fill: HEAD_FILL, bold: true }),
    ] }),
    ...F.tiers.map((t) => {
      const abuse = /SEXUAL ABUSE/.test(t.prea);
      const fill = abuse ? ABUSE_FILL : undefined;
      return new TableRow({ children: [
        cell(String(t.n), { width: T[0], fill, bold: true, align: AlignmentType.CENTER }),
        cell(t.what, { width: T[1], fill }),
        cell(t.prea, { width: T[2], fill, bold: abuse }),
        cell(t.cps, { width: T[3], fill, bold: /^YES/i.test(t.cps) }),
      ] });
    }),
  ]),
);

// Step 3, flips
s = steps[3];
push(stepHead(s), p(s.why), block(WARN_FILL, F.flips.map((it, i) => new Paragraph({
  children: runs(it), bullet: { level: 0 },
  spacing: { before: i ? 40 : 60, after: 60, line: 264 } }))));

// Step 4, act. One row per block of the full action list, which the Decision
// Guide carries in full. The Python builder guards that the two stay in step.
s = steps[4];
const C = [2500, 8300];
push(stepHead(s), p(s.why),
  table(C, [
    new TableRow({ tableHeader: true, children: [
      cell('When', { width: C[0], fill: HEAD_FILL, bold: true }),
      cell('Do', { width: C[1], fill: HEAD_FILL, bold: true }),
    ] }),
    ...F.actnow.map((r) => new TableRow({ children: [
      cell(r.head, { width: C[0], bold: true }),
      cell(r.line, { width: C[1] }),
    ] })),
  ]),
);

// Step 5, the record block
s = steps[5];
push(stepHead(s), p(s.why),
  block(STEP_FILL, F.record.lines.map((line, i) => new Paragraph({
    children: [txt(line, { size: TYPE.CELL })],
    spacing: { before: i ? 90 : 60, after: 60, line: 264 } }))));

// Close
push(
  block(ABUSE_FILL, [new Paragraph({ children: runs(F.doubt, { size: TYPE.CELL }),
    spacing: { before: 60, after: 60, line: 252 } })]),
  new Paragraph({ children: [
    txt(F.caveat + '  ', { italics: true, size: TYPE.NOTE }),
    txt('Drawn from gap register Revision ' + data.register_revision + '. This copy is regenerated '
      + 'from source; edits made here are not carried forward.',
      { italics: true, size: TYPE.NOTE, color: MUTED }),
  ], spacing: { before: 140, line: 252 } }),
);

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: TYPE.BODY, color: INK }, paragraph: { spacing: { line: 252 } } },
      heading1: { run: { font: 'Calibri', size: TYPE.H1, bold: true, color: INK },
        paragraph: { spacing: { before: 200, after: 100 } } },
      heading2: { run: { font: 'Calibri', size: TYPE.H2, bold: true, color: INK },
        paragraph: { spacing: { before: 260, after: 120 } } },
    },
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
      margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: F.title, size: TYPE.RUNNING, color: MUTED })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: TYPE.RUNNING, color: MUTED })] })] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  console.log('wrote ' + path.relative(ROOT, OUT) + ' ' + buf.length + ' bytes');
});
