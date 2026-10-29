// Management brief, Word view, from drafts/management-brief.json.
//
// The Python builder holds the guard that fails the build if an exposure item
// cites a register row that does not exist or has since been cured, so run
// `npm run brief`, which runs both, rather than this alone.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageNumber, TableOfContents,
} = require('docx');
const { TYPE } = require('./docx_style');

const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'drafts', 'management-brief.json');
const REG = path.join(ROOT, 'prea-register.csv');
const OUT = path.join(ROOT, 'deliverables', 'PREA_Management_Brief.docx');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const HEAD_FILL = 'EDEDED';
const ABUSE_FILL = 'F2DEDE';   // conflict rows, the exposure items
const WARN_FILL = 'FCF0DC';    // draft status, the asks
const GOOD_FILL = 'E6EFE6';    // what the department has right
const CONTENT_W = 10080;

const STATUS_ORDER = ['Conflict', 'Not Addressed', 'Partial', 'Addressed', 'Not Evidenced'];
const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low'];

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// Independent of the Python builder's own check, so running this file directly
// while iterating on Word styling cannot ship a dash. The content is hand
// written, so nothing generated from the register enforces the rule on it.
if (/[—–]/.test(JSON.stringify(data))) {
  console.error('ABORTED. Em or en dash in drafts/management-brief.json, which CLAUDE.md '
    + 'section 1 forbids.');
  process.exit(1);
}

// Minimal CSV read: the register has quoted fields carrying commas and newlines.
function parseCsv(text) {
  const out = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); out.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); out.push(row); }
  const head = out.shift();
  return out.filter((r) => r.length === head.length)
    .map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const rows = parseCsv(fs.readFileSync(REG, 'utf8'));

function tally(key, order) {
  const seen = new Map();
  rows.forEach((r) => seen.set(r[key], (seen.get(r[key]) || 0) + 1));
  const unknown = [...seen.keys()].filter((k) => !order.includes(k));
  if (unknown.length) {
    console.error('ABORTED. The register has ' + key + ' values this brief does not know how to '
      + 'order: ' + unknown.join(', ') + '. Add them to the order array.');
    process.exit(1);
  }
  return order.filter((k) => seen.has(k)).map((k) => [k, seen.get(k)]);
}

const byStatus = tally('status', STATUS_ORDER);
const byPriority = tally('priority', PRIORITY_ORDER);

const txt = (t, o = {}) => new TextRun({ text: String(t), size: o.size || TYPE.BODY,
  bold: !!o.bold, italics: !!o.italics, color: o.color || INK });

// **bold** spans become bold runs.
function runs(t, o = {}) {
  return String(t).split(/\*\*(.+?)\*\*/g)
    .map((part, i) => txt(part, Object.assign({}, o, { bold: i % 2 === 1 })));
}
function p(t, o = {}) {
  return new Paragraph({ children: runs(t, o), spacing: { after: 140, line: 276 } });
}
function bullet(t, o = {}) {
  return new Paragraph({ children: runs(t, o), bullet: { level: 0 },
    spacing: { after: 110, line: 272 } });
}
function cell(children, { width, fill, bold, align, span } = {}) {
  const kids = Array.isArray(children) ? children : [new Paragraph({
    children: runs(children, { bold: !!bold, size: TYPE.CELL }),
    spacing: { before: 40, after: 40, line: 240 }, alignment: align })];
  return new TableCell({ children: kids, width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 } });
}
function table(columnWidths, tableRows) {
  const sum = columnWidths.reduce((a, b) => a + b, 0);
  if (sum !== CONTENT_W) {
    console.error('ABORTED. A table\'s column widths sum to ' + sum + ' twips, but the content '
      + 'width is ' + CONTENT_W + '. Widths: [' + columnWidths.join(', ') + ']. A table wider '
      + 'than the content width runs off the page in Word and nothing in the build notices.');
    process.exit(1);
  }
  return new Table({ columnWidths, width: { size: sum, type: WidthType.DXA }, rows: tableRows,
    borders: ['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical']
      .reduce((a, k) => (a[k] = { style: BorderStyle.SINGLE, size: 2, color: RULE }, a), {}) });
}
function block(fill, paragraphs) {
  return table([CONTENT_W], [new TableRow({
    children: [cell(paragraphs, { width: CONTENT_W, fill })] })]);
}

// Section headings in the order emitted, for the cross-view check at the end.
const SECTIONS = [];
const FRONT = new Set(['Contents']);
function h1(text) {
  if (!FRONT.has(text)) SECTIONS.push(text);
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
}

const body = [];
const push = (...x) => body.push(...x);

// Title page
push(
  new Paragraph({ children: [txt(data.title, { size: TYPE.TITLE, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 1800, after: 160 } }),
  new Paragraph({ children: [txt(data.subtitle, { size: TYPE.SUBTITLE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
  new Paragraph({ children: [txt('Sacramento County Probation Department', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt('Youth Detention Facility', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
  block(WARN_FILL, [new Paragraph({ children: runs(data.status, { bold: true }),
    spacing: { before: 60, after: 60, line: 264 } })]),
  new Paragraph({ children: [txt('Drawn from gap register Revision ' + data.register_revision
    + ', ' + rows.length + ' requirements assessed against 17 departmental documents.',
    { size: TYPE.NOTE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { before: 320 } }),
  new Paragraph({ children: [new PageBreak()] }),
  h1('Contents'),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
);

function simple(key, { numbered = false, fill } = {}) {
  const s = data[key];
  push(h1(s.head));
  if (s.body) push(p(s.body));
  if (fill) {
    push(block(fill, s.items.map((it, i) => new Paragraph({
      children: runs(it), bullet: { level: 0 },
      spacing: { before: i ? 60 : 60, after: 80, line: 268 } }))));
    return;
  }
  s.items.forEach((it, i) => push(numbered
    ? new Paragraph({ children: [txt((i + 1) + '.  ', { bold: true }), ...runs(it)],
      spacing: { after: 130, line: 276 } })
    : bullet(it)));
}

simple('bottom_line', { numbered: true });
push(new Paragraph({ children: [new PageBreak()] }));
simple('applies');

// Where we stand. Two tallies side by side, both read out of the register.
push(new Paragraph({ children: [new PageBreak()] }), h1(data.standing.head), p(data.standing.body));
const S = [2900, 1240, 800, 2900, 2240];
const n = Math.max(byStatus.length, byPriority.length);
push(
  table(S, [
    new TableRow({ tableHeader: true, children: [
      cell('Status', { width: S[0], fill: HEAD_FILL, bold: true }),
      cell('Rows', { width: S[1], fill: HEAD_FILL, bold: true, align: AlignmentType.CENTER }),
      cell('', { width: S[2] }),
      cell('Priority', { width: S[3], fill: HEAD_FILL, bold: true }),
      cell('Rows', { width: S[4], fill: HEAD_FILL, bold: true, align: AlignmentType.CENTER }),
    ] }),
    ...Array.from({ length: n }, (_, i) => {
      const a = byStatus[i], b = byPriority[i];
      // Conflict and Critical are the two rows the brief tells managers to read
      // first, so they carry the fill the exposure items use.
      const af = a && a[0] === 'Conflict' ? ABUSE_FILL : undefined;
      const bf = b && b[0] === 'Critical' ? ABUSE_FILL : undefined;
      return new TableRow({ children: [
        cell(a ? a[0] : '', { width: S[0], fill: af, bold: !!af }),
        cell(a ? String(a[1]) : '', { width: S[1], fill: af, bold: !!af, align: AlignmentType.CENTER }),
        cell('', { width: S[2] }),
        cell(b ? b[0] : '', { width: S[3], fill: bf, bold: !!bf }),
        cell(b ? String(b[1]) : '', { width: S[4], fill: bf, bold: !!bf, align: AlignmentType.CENTER }),
      ] });
    }),
  ]),
  new Paragraph({ text: '', spacing: { after: 140 } }),
  block(WARN_FILL, [new Paragraph({ children: runs(data.standing.note),
    spacing: { before: 60, after: 60, line: 268 } })]),
);

// The exposure items. One page each, because each one is a thing to talk
// through rather than a line to read out.
push(new Paragraph({ children: [new PageBreak()] }), h1(data.exposure.head), p(data.exposure.body));
data.exposure.items.forEach((it, i) => {
  if (i) push(new Paragraph({ children: [new PageBreak()] }));
  push(
    new Paragraph({ children: [txt(it.n + '.  ', { bold: true, size: TYPE.H2 }),
      txt(it.head, { bold: true, size: TYPE.H2 })],
      heading: HeadingLevel.HEADING_2, spacing: { before: i ? 0 : 260, after: 60 } }),
    new Paragraph({ children: [txt('Register row' + (it.rows.length > 1 ? 's ' : ' ')
      + it.rows.join(', '), { italics: true, color: MUTED, size: TYPE.NOTE })],
      spacing: { after: 160 } }),
    p('**What our policy says.** ' + it.policy),
    p('**What the rule says.** ' + it.rule),
    block(ABUSE_FILL, [new Paragraph({ children: runs('**Why it costs us.** ' + it.why),
      spacing: { before: 60, after: 60, line: 272 } })]),
    new Paragraph({ text: '', spacing: { after: 120 } }),
    p('**The fix.** ' + it.fix),
    block(WARN_FILL, [new Paragraph({ children: runs('**What I need.** ' + it.ask),
      spacing: { before: 60, after: 60, line: 272 } })]),
  );
});

push(new Paragraph({ children: [new PageBreak()] }));
simple('unknown');
push(new Paragraph({ children: [new PageBreak()] }));
simple('liability');
push(new Paragraph({ children: [new PageBreak()] }));
simple('credit', { fill: GOOD_FILL });

push(new Paragraph({ children: [new PageBreak()] }), h1(data.waves.head), p(data.waves.body));
data.waves.items.forEach((wave, i) => {
  // Wave 3 is the long list. Without a break it spills four orphan lines onto a
  // page of its own, on a document that otherwise runs one section per page.
  if (i === 2) push(new Paragraph({ children: [new PageBreak()] }));
  push(new Paragraph({ text: wave.head, heading: HeadingLevel.HEADING_2 }), p(wave.body));
  wave.items.forEach((it) => push(bullet(it)));
});

push(new Paragraph({ children: [new PageBreak()] }));
simple('asks', { numbered: true });

push(
  new Paragraph({ text: '', spacing: { after: 200 } }),
  block(WARN_FILL, [new Paragraph({ children: runs(data.caveat, { italics: true }),
    spacing: { before: 60, after: 60, line: 268 } })]),
  new Paragraph({ children: [txt('Generated from drafts/management-brief.json by npm run brief, '
    + 'from gap register Revision ' + data.register_revision + '. Do not hand-edit.',
    { italics: true, size: TYPE.NOTE, color: MUTED })], spacing: { before: 200, line: 264 } }),
);

// The Markdown view and this one are written separately and nothing but this
// check keeps their section order in step.
const MD = path.join(ROOT, 'drafts', 'MANAGEMENT_BRIEF.md');
if (fs.existsSync(MD)) {
  const md = fs.readFileSync(MD, 'utf8').split('\n')
    .filter((l) => /^## /.test(l)).map((l) => l.replace(/^## /, '').trim());
  const a = md.join(' | ');
  const b = SECTIONS.join(' | ');
  if (a !== b) {
    console.error('ABORTED. The Markdown and Word views disagree on section order.');
    console.error('  Markdown: ' + a);
    console.error('  Word:     ' + b);
    console.error('  Both are built from drafts/management-brief.json. A section added to one '
      + 'builder has to be added to the other, in the same place.');
    process.exit(1);
  }
}

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: TYPE.BODY, color: INK },
        paragraph: { spacing: { line: 276 } } },
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
      children: [new TextRun({ text: data.title, size: TYPE.RUNNING, color: MUTED })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: TYPE.RUNNING,
        color: MUTED })] })] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, buf);
  console.log('wrote ' + path.relative(ROOT, OUT) + ' ' + buf.length + ' bytes, '
    + SECTIONS.length + ' sections');
});
