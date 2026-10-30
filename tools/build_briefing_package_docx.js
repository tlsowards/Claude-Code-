// Briefing package cover, Word view, from drafts/briefing-package.json.
//
// The Python builder holds the guards that check the attachment schedule against
// the deliverables directory and read the What we need list out of the brief, so
// run `npm run package`, which runs both, rather than this alone.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageNumber,
} = require('docx');
const { TYPE } = require('./docx_style');

const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'drafts', 'briefing-package.json');
const BRIEF = path.join(ROOT, 'drafts', 'management-brief.json');
const REG = path.join(ROOT, 'prea-register.csv');
const OUT = path.join(ROOT, 'deliverables', 'PREA_Briefing_Package.docx');
// Written by tools/make_package_pdf.py after a render pass. Absent on a first
// build, and the schedule omits the page column until the PDF exists.
const PAGINATION = path.join(ROOT, 'drafts', 'package-pagination.json');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const HEAD_FILL = 'EDEDED';
const ABUSE_FILL = 'F2DEDE';   // the conflict line, the handling note
const WARN_FILL = 'FCF0DC';    // draft status, what we need
const CONTENT_W = 10080;

const STATUS_ORDER = ['Conflict', 'Not Addressed', 'Partial', 'Addressed', 'Not Evidenced'];
const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low'];

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const asks = JSON.parse(fs.readFileSync(BRIEF, 'utf8')).asks.items;

// Independent of the Python builder's own check, so running this file directly
// while iterating on Word styling cannot ship a dash.
if (/[—–]/.test(JSON.stringify(data) + JSON.stringify(asks))) {
  console.error('ABORTED. Em or en dash in the briefing package or in the asks it reads from '
    + 'the brief, which CLAUDE.md section 1 forbids.');
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
    console.error('ABORTED. The register has ' + key + ' values this cover does not know how to '
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
      + 'width is ' + CONTENT_W + '. Widths: [' + columnWidths.join(', ') + '].');
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

// Stale pagination is worse than none, so it is dropped unless it still
// describes exactly this schedule in exactly this order.
let starts = {};
if (fs.existsSync(PAGINATION)) {
  const pg = JSON.parse(fs.readFileSync(PAGINATION, 'utf8'));
  const listed = data.attachments.items.map((it) => it.file);
  if (JSON.stringify(pg.files) === JSON.stringify(listed)) starts = pg.starts || {};
}
const paged = Object.keys(starts).length > 0;

const SECTIONS = [];
function h1(text) { SECTIONS.push(text); return new Paragraph({ text, heading: HeadingLevel.HEADING_1 }); }

const body = [];
const push = (...x) => body.push(...x);

// Cover. No contents page: the attachment schedule is the contents page.
push(
  new Paragraph({ children: [txt(data.title, { size: TYPE.TITLE, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 1700, after: 160 } }),
  new Paragraph({ children: [txt(data.subtitle, { size: TYPE.SUBTITLE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
  new Paragraph({ children: [txt('Sacramento County Probation Department', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt('Youth Detention Facility', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 360 } }),
  block(WARN_FILL, [new Paragraph({ children: runs(data.status, { bold: true }),
    spacing: { before: 60, after: 60, line: 264 } })]),
  new Paragraph({ children: [txt('Gap register Revision ' + data.register_revision + ', '
    + rows.length + ' requirements assessed against 17 departmental documents.',
    { size: TYPE.NOTE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { before: 320 } }),
  new Paragraph({ children: [new PageBreak()] }),
);

function simple(key) {
  const s = data[key];
  push(h1(s.head));
  if (s.body) push(p(s.body));
  (s.items || []).forEach((it) => push(bullet(it)));
}

simple('purpose');

// What we need, read out of the brief. This is the point of the document, so it
// sits on its own page immediately after the purpose.
push(new Paragraph({ children: [new PageBreak()] }), h1(data.ask.head), p(data.ask.body));
push(block(WARN_FILL, asks.map((it, i) => new Paragraph({
  children: [txt((i + 1) + '.  ', { bold: true }), ...runs(it)],
  spacing: { before: i ? 90 : 60, after: 90, line: 272 } }))));

// Where we stand.
push(new Paragraph({ children: [new PageBreak()] }), h1(data.standing.head), p(data.standing.body));
const S = [2900, 1800, 700, 2900, 1780];
const n = Math.max(byStatus.length, byPriority.length);
push(
  table(S, [
    new TableRow({ tableHeader: true, children: [
      cell('Status', { width: S[0], fill: HEAD_FILL, bold: true }),
      cell('Requirements', { width: S[1], fill: HEAD_FILL, bold: true, align: AlignmentType.CENTER }),
      cell('', { width: S[2] }),
      cell('Priority', { width: S[3], fill: HEAD_FILL, bold: true }),
      cell('Requirements', { width: S[4], fill: HEAD_FILL, bold: true, align: AlignmentType.CENTER }),
    ] }),
    ...Array.from({ length: n }, (_, i) => {
      const a = byStatus[i], b = byPriority[i];
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
  p(data.standing.note, { italics: true }),
);

// The attachment schedule, then a paragraph on each tab.
push(new Paragraph({ children: [new PageBreak()] }), h1(data.attachments.head),
  p(data.attachments.body));
const A = paged ? [820, 3760, 900, 4600] : [900, 4180, 5000];
push(table(A, [
  new TableRow({ tableHeader: true, children: [
    cell('Tab', { width: A[0], fill: HEAD_FILL, bold: true, align: AlignmentType.CENTER }),
    cell('Document', { width: A[1], fill: HEAD_FILL, bold: true }),
    ...(paged ? [cell('Page', { width: A[2], fill: HEAD_FILL, bold: true,
      align: AlignmentType.CENTER })] : []),
    cell('Who it is for', { width: paged ? A[3] : A[2], fill: HEAD_FILL, bold: true }),
  ] }),
  ...data.attachments.items.map((it) => new TableRow({ children: [
    cell(it.tab, { width: A[0], bold: true, align: AlignmentType.CENTER }),
    cell(it.name, { width: A[1], bold: true }),
    ...(paged ? [cell(String(starts[it.file] || ''), { width: A[2],
      align: AlignmentType.CENTER })] : []),
    cell(it.who, { width: paged ? A[3] : A[2] }),
  ] })),
]));
data.attachments.items.forEach((it) => push(
  new Paragraph({ children: [txt('Attachment ' + it.tab + '.  ', { bold: true, size: TYPE.H2 }),
    txt(it.name, { bold: true, size: TYPE.H2 })],
    heading: HeadingLevel.HEADING_2 }),
  p(it.what),
  new Paragraph({ children: runs(it.note, { italics: true, size: TYPE.NOTE }),
    spacing: { after: 160, line: 268 } }),
));

push(new Paragraph({ children: [new PageBreak()] }));
simple('howto');
push(new Paragraph({ children: [new PageBreak()] }));
simple('notincluded');

push(
  new Paragraph({ text: '', spacing: { after: 200 } }),
  block(ABUSE_FILL, [new Paragraph({ children: runs(data.caveat, { italics: true }),
    spacing: { before: 60, after: 60, line: 268 } })]),
  new Paragraph({ children: [txt('Generated from drafts/briefing-package.json by npm run '
    + 'package, from gap register Revision ' + data.register_revision + '. Do not hand-edit.',
    { italics: true, size: TYPE.NOTE, color: MUTED })], spacing: { before: 200, line: 264 } }),
);

// The Markdown view and this one are written separately and nothing but this
// check keeps their section order in step.
const MD = path.join(ROOT, 'drafts', 'BRIEFING_PACKAGE.md');
if (fs.existsSync(MD)) {
  const md = fs.readFileSync(MD, 'utf8').split('\n')
    .filter((l) => /^## /.test(l)).map((l) => l.replace(/^## /, '').trim());
  const a = md.join(' | ');
  const b = SECTIONS.join(' | ');
  if (a !== b) {
    console.error('ABORTED. The Markdown and Word views disagree on section order.');
    console.error('  Markdown: ' + a);
    console.error('  Word:     ' + b);
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
      children: [new TextRun({ text: data.title + ', ' + data.subtitle,
        size: TYPE.RUNNING, color: MUTED })] })] }) },
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
    + data.attachments.items.length + ' attachments, ' + asks.length + ' asks'
    + (paged ? ', with page numbers' : ', no page numbers yet'));
});
