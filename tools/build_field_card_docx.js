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
const CONTENT_W = 10080;

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!data.field) { console.error('ABORTED: no "field" block in ' + SRC); process.exit(1); }
const F = data.field;

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
  return new Paragraph({ children: runs(s, opts), spacing: { after: 120, line: 276 } });
}
function bullet(s, opts = {}) {
  return new Paragraph({ children: runs(s, opts), bullet: { level: 0 },
    spacing: { after: 70, line: 264 } });
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
    spacing: { before: 320, after: 160 },
  });
}

// Title page
push(
  new Paragraph({ children: [txt(F.title, { size: TYPE.TITLE, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 1600, after: 160 } }),
  new Paragraph({ children: [txt(F.subtitle, { size: TYPE.SUBTITLE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
  new Paragraph({ children: [txt('Sacramento County Probation Department', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt('Youth Detention Facility', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
  new Paragraph({ children: [txt(data.status, { bold: true, size: TYPE.SUBTITLE })],
    alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
  block(WARN_FILL, [new Paragraph({ children: runs(F.intro), spacing: { before: 60, after: 60, line: 264 } })]),
  new Paragraph({ children: [new PageBreak()] }),
);

// Step 1, ages
let s = steps[1];
const A1 = [3400, 6680];
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
const T = [760, 4120, 2500, 2700];
push(new Paragraph({ children: [new PageBreak()] }), stepHead(s), p(s.why),
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

// Step 4, act
s = steps[4];
push(new Paragraph({ children: [new PageBreak()] }), stepHead(s), p(s.why));
F.actions.forEach((blk) => {
  push(new Paragraph({ text: blk.head, heading: HeadingLevel.HEADING_2 }));
  blk.items.forEach((it) => push(bullet(it)));
});

// Step 5, the record block
s = steps[5];
push(new Paragraph({ children: [new PageBreak()] }), stepHead(s), p(s.why),
  block(STEP_FILL, F.record.lines.map((line, i) => new Paragraph({
    children: [txt(line, { size: TYPE.CELL })],
    spacing: { before: i ? 90 : 60, after: 60, line: 264 } }))));

// Step 6, the response sequence
s = steps[6];
push(new Paragraph({ children: [new PageBreak()] }), stepHead(s), p(s.why));
F.after.phases.forEach((ph) => {
  push(new Paragraph({ text: ph.head, heading: HeadingLevel.HEADING_2 }));
  push(new Paragraph({ children: [txt(ph.cite, { italics: true, color: MUTED, size: TYPE.NOTE })],
    spacing: { after: 90 } }));
  ph.items.forEach((it) => push(bullet(it)));
});
push(new Paragraph({ text: F.after.gaps_head, heading: HeadingLevel.HEADING_2 }));
push(block(WARN_FILL, F.after.gaps.map((g, i) => new Paragraph({
  children: runs(g), bullet: { level: 0 },
  spacing: { before: i ? 40 : 60, after: 60, line: 264 } }))));

// Roles the department has not filled. Shading is keyed off this, so keep it
// in step with the wording used in the roles block of the JSON.
const MISSING_ROLE = /NOT CURRENTLY DESIGNATED|DOES NOT EXIST|NOT DESIGNATED/;

// Role matrix
if (F.roles) {
  const R = F.roles;
  const M = [2600, 3740, 3740];
  push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ text: R.head, heading: HeadingLevel.HEADING_1 }),
    p(R.body),
    table(M, [
      new TableRow({ tableHeader: true,
        children: R.columns.map((c, i) => cell(c, { width: M[i], fill: HEAD_FILL, bold: true })) }),
      ...R.rows.map((row) => {
        // Shade the WHOLE row where the role does not exist, the same way the
        // tier chart computes its fill once per row. Testing the regex per cell
        // only ever shaded the "Does not" column, because that is the only one
        // the flag phrase appears in, which under-delivers the visual cue on a
        // document whose value is being scannable under pressure.
        const flagged = row.some((c) => MISSING_ROLE.test(c));
        const fill = flagged ? ABUSE_FILL : undefined;
        return new TableRow({
          children: row.map((c, i) => cell([new Paragraph({
            children: runs(c, { size: TYPE.CELL }),
            spacing: { before: 40, after: 40, line: 240 },
          })], { width: M[i], fill })) });
      }),
    ]),
    new Paragraph({ text: R.stop_head, heading: HeadingLevel.HEADING_2 }),
  );
  R.stop.forEach((it) => push(bullet(it)));
  push(
    new Paragraph({ text: R.decision_head, heading: HeadingLevel.HEADING_2 }),
    block(WARN_FILL, [new Paragraph({ children: runs(R.decision),
      spacing: { before: 60, after: 60, line: 264 } })]),
  );
}

// Close
push(
  new Paragraph({ children: [new PageBreak()] }),
  block(ABUSE_FILL, [new Paragraph({ children: runs(F.doubt), spacing: { before: 60, after: 60, line: 264 } })]),
  new Paragraph({ children: runs(F.caveat, { italics: true, size: TYPE.NOTE }),
    spacing: { before: 240, after: 120, line: 264 } }),
  new Paragraph({ children: [txt('Generated from drafts/supervisor-guide.json by npm run field-card. '
    + 'Do not hand-edit this file; the next build overwrites it. Drawn from gap register Revision '
    + data.register_revision + '.', { italics: true, size: TYPE.NOTE, color: MUTED })],
    spacing: { after: 120, line: 264 } }),
);

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: TYPE.BODY, color: INK }, paragraph: { spacing: { line: 276 } } },
      heading1: { run: { font: 'Calibri', size: TYPE.H1, bold: true, color: INK },
        paragraph: { spacing: { before: 320, after: 180 } } },
      heading2: { run: { font: 'Calibri', size: TYPE.H2, bold: true, color: INK },
        paragraph: { spacing: { before: 260, after: 120 } } },
    },
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
      margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
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
