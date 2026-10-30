// PREA incident memo template, Word view, from drafts/supervisor-guide.json.
//
// Fill-in form. The fields render in a monospaced face inside a bordered block
// so a supervisor can see at a glance what is still blank, which is the whole
// point: a blank heading reads later as an omission, a stated negative reads as
// a decision. Run `npm run memo-template`, which runs the Python guard first.

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
const OUT = path.join(ROOT, 'deliverables', 'PREA_Supervisor_Memo_Template.docx');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const FORM_FILL = 'F4F6F8';
const WARN_FILL = 'FCF0DC';
const GOOD_FILL = 'E8F0E4';
const CONTENT_W = 10080;

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
if (!data.memo) { console.error('ABORTED: no "memo" block in ' + SRC); process.exit(1); }
const M = data.memo;

// Independent of the Python guard, so running this file alone cannot ship a dash.
if (/[—–]/.test(JSON.stringify(M))) {
  console.error('ABORTED. Em or en dash in the "memo" block of drafts/supervisor-guide.json, '
    + 'which CLAUDE.md section 1 forbids.');
  process.exit(1);
}

function txt(s, o = {}) {
  return new TextRun({ text: String(s), size: o.size || TYPE.BODY, bold: !!o.bold,
    color: o.color || INK, italics: !!o.italics, font: o.font });
}
function runs(s, o = {}) {
  return String(s).split(/\*\*(.+?)\*\*/g)
    .map((part, i) => txt(part, Object.assign({}, o, { bold: i % 2 === 1 })));
}
function p(s, o = {}) {
  return new Paragraph({ children: runs(s, o), spacing: { after: 120, line: 276 } });
}
function bullet(s) {
  return new Paragraph({ children: runs(s), bullet: { level: 0 }, spacing: { after: 80, line: 264 } });
}
function table(widths, rows) {
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum !== CONTENT_W) {
    console.error('ABORTED. Column widths sum to ' + sum + ', content width is ' + CONTENT_W + '.');
    process.exit(1);
  }
  return new Table({ columnWidths: widths, width: { size: sum, type: WidthType.DXA }, rows,
    borders: ['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical']
      .reduce((a, k) => (a[k] = { style: BorderStyle.SINGLE, size: 2, color: RULE }, a), {}) });
}
function block(fill, paragraphs) {
  return table([CONTENT_W], [new TableRow({ children: [new TableCell({
    children: paragraphs, width: { size: CONTENT_W, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill, color: 'auto' },
    margins: { top: 90, bottom: 90, left: 140, right: 140 },
  })] })]);
}

const body = [];
const push = (...x) => body.push(...x);

push(
  new Paragraph({ children: [txt(M.title, { size: TYPE.TITLE, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 1400, after: 160 } }),
  new Paragraph({ children: [txt(M.subtitle, { size: TYPE.SUBTITLE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
  new Paragraph({ children: [txt('Sacramento County Probation Department', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt('Youth Detention Facility', { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
  new Paragraph({ children: [txt(data.status, { bold: true, size: TYPE.SUBTITLE })],
    alignment: AlignmentType.CENTER, spacing: { after: 320 } }),
  block(WARN_FILL, [new Paragraph({ children: runs(M.intro),
    spacing: { before: 60, after: 60, line: 264 } })]),
  new Paragraph({ children: [new PageBreak()] }),
);

M.sections.forEach((s, i) => {
  push(new Paragraph({ text: s.head, heading: HeadingLevel.HEADING_1,
    spacing: { before: i ? 300 : 0, after: 140 } }));
  push(block(FORM_FILL, s.fields.map((f, n) => new Paragraph({
    children: [txt(f, { font: 'Consolas', size: TYPE.CELL })],
    spacing: { before: n ? 70 : 20, after: 20, line: 264 },
  }))));
  if (s.note) {
    push(new Paragraph({ children: runs(s.note, { italics: true, size: TYPE.NOTE, color: MUTED }),
      spacing: { before: 120, after: 60, line: 264 } }));
  }
});

push(
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: M.avoid_head, heading: HeadingLevel.HEADING_1 }),
);
push(block(WARN_FILL, M.avoid.map((it, i) => new Paragraph({
  children: runs(it), bullet: { level: 0 },
  spacing: { before: i ? 60 : 20, after: 60, line: 264 } }))));

push(new Paragraph({ text: M.keep_head, heading: HeadingLevel.HEADING_1 }));
push(block(GOOD_FILL, M.keep.map((it, i) => new Paragraph({
  children: runs(it), bullet: { level: 0 },
  spacing: { before: i ? 60 : 20, after: 60, line: 264 } }))));

push(
  new Paragraph({ children: runs(M.caveat, { italics: true, size: TYPE.NOTE }),
    spacing: { before: 280, after: 120, line: 264 } }),
  new Paragraph({ children: [txt('Drawn from gap register Revision '
    + data.register_revision + '. This copy is regenerated from source; edits made here are '
    + 'not carried forward.', { italics: true, size: TYPE.NOTE, color: MUTED })],
    spacing: { after: 120, line: 264 } }),
);

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: TYPE.BODY, color: INK }, paragraph: { spacing: { line: 276 } } },
      heading1: { run: { font: 'Calibri', size: TYPE.H2, bold: true, color: INK },
        paragraph: { spacing: { before: 300, after: 140 } } },
      heading2: { run: { font: 'Calibri', size: TYPE.H3, bold: true, color: INK },
        paragraph: { spacing: { before: 240, after: 110 } } },
    },
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
      margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: M.title, size: TYPE.RUNNING, color: MUTED })] })] }) },
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
