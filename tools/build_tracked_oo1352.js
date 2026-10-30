// OO 1352 with the proposed amendments as real Word tracked changes.
//
// The counterpart to build_tracked_oo1453.js, and deliberately a different
// document. That one reproduces a whole order because the whole order is held.
// This one reproduces the provisions that change, because OO 1352's PDF did not
// survive the container it was read in and only the quoted provisions remain.
//
// The guards below exist to stop that difference being papered over. A document
// that looks like the department's policy and is not is the single worst thing
// this project could hand over, and an extract that forgets to say it is an
// extract becomes exactly that.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, InsertedTextRun, DeletedTextRun,
  HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, Header, Footer, PageNumber,
} = require('docx');
const { TYPE } = require('./docx_style');

const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'drafts', 'oo1352-tracked.json');
const OUT = path.join(ROOT, 'deliverables', 'OO_1352_Tracked_Changes.docx');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const WARN_FILL = 'FCF0DC';
const NOTE_FILL = 'EDF1F7';
const GAP_FILL = 'F2DEDE';
const CONTENT_W = 10080;

const AUTHOR = 'PREA Policy Review';
const DATE = '2026-10-30T00:00:00Z';

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// Authored text only. Quoted text from the order is exempt by construction, for
// the reason recorded in CLAUDE.md: a house style rule governs what this project
// writes and cannot govern what it quotes.
const DASH = new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']');
const authored = [];
const add = (w, v) => { if (typeof v === 'string') authored.push([w, v]); };
add('provenance', data.provenance);
add('not_reproduced', data.not_reproduced);
(data.before_adoption || []).forEach((t, i) => add('before_adoption[' + i + ']', t));
(data.provisions || []).forEach((pr) => {
  add(pr.cite + ' label', pr.label);
  add(pr.cite + ' status_note', pr.status_note);
  add(pr.cite + ' action', pr.action);
  (pr.runs || []).forEach(([kind, text], i) => {
    if (kind === 'ins') add(pr.cite + ' insert[' + i + ']', text);
  });
  (pr.sub || []).forEach(([l, t]) => add(pr.cite + ' sub ' + l, t));
});
const dashed = authored.filter(([, v]) => DASH.test(v));
if (dashed.length) {
  console.error('ABORTED. Em or en dash in text this project wrote, which CLAUDE.md section 1 '
    + 'forbids. Text quoted from the order is exempt and is not checked:');
  dashed.forEach(([w, v]) => console.error('  ' + w + ': ' + v.slice(0, 80)));
  process.exit(1);
}

// This document is an extract and has to keep saying so.
if (data.complete !== false) {
  console.error('ABORTED. "complete" is not false. This builder reproduces only the provisions '
    + 'that change. If the whole order is now held, build it the way OO 1453 is built rather '
    + 'than letting an extract describe itself as the order.');
  process.exit(1);
}
if (!/not the whole order/i.test(data.provenance || '') || !data.not_reproduced) {
  console.error('ABORTED. The provenance statement must say this is not the whole order, and '
    + '"not_reproduced" must say what is missing. Without both, an extract reads as the '
    + 'department\'s policy with edits, which is a claim it is not entitled to make.');
  process.exit(1);
}
// A provision whose words are not held cannot carry a redline. This is the
// guard that matters most: showing struck text for a provision nobody quoted
// would be inventing the department's policy and marking it up.
const faked = (data.provisions || []).filter(
  (pr) => pr.status === 'described' && (pr.runs || []).some((r) => r[0] !== 'ins'));
if (faked.length) {
  console.error('ABORTED. These provisions are marked "described", meaning their words are not '
    + 'held, and yet carry kept or struck text: ' + faked.map((p) => p.cite).join(', ')
    + '. A redline on text nobody quoted is invented policy.');
  process.exit(1);
}
const describedNoAction = (data.provisions || []).filter(
  (pr) => pr.status === 'described' && !pr.action);
if (describedNoAction.length) {
  console.error('ABORTED. These provisions are "described" and state no required action, so they '
    + 'would print as a citation and nothing else: '
    + describedNoAction.map((p) => p.cite).join(', '));
  process.exit(1);
}
const unlabelled = (data.provisions || []).filter(
  (pr) => !pr.change || !pr.label || !(pr.rows || []).length);
if (unlabelled.length) {
  console.error('ABORTED. These provisions do not name a change number, a label and the register '
    + 'rows behind them: ' + unlabelled.map((p) => p.cite).join(', '));
  process.exit(1);
}

let revId = 2000;
const txt = (t, o = {}) => new TextRun({ text: String(t), size: o.size || TYPE.BODY,
  bold: !!o.bold, italics: !!o.italics, color: o.color || INK });
function runs(t, o = {}) {
  return String(t).split(/\*\*(.+?)\*\*/g)
    .map((part, i) => txt(part, Object.assign({}, o, { bold: i % 2 === 1 })));
}
function revisionRuns(list) {
  return list.map(([kind, text]) => {
    revId += 1;
    if (kind === 'del') {
      return new DeletedTextRun({ text, id: revId, author: AUTHOR, date: DATE, size: TYPE.BODY });
    }
    if (kind === 'ins') {
      return new InsertedTextRun({ text, id: revId, author: AUTHOR, date: DATE, size: TYPE.BODY });
    }
    return txt(text);
  });
}
function p(t, o = {}) {
  return new Paragraph({ children: runs(t, o), spacing: { after: 140, line: 276 } });
}
function cell(children, { width, fill } = {}) {
  return new TableCell({ children, width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 } });
}
function block(fill, paragraphs) {
  return new Table({ columnWidths: [CONTENT_W], width: { size: CONTENT_W, type: WidthType.DXA },
    rows: [new TableRow({ children: [cell(paragraphs, { width: CONTENT_W, fill })] })],
    borders: ['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical']
      .reduce((a, k) => (a[k] = { style: BorderStyle.SINGLE, size: 2, color: RULE }, a), {}) });
}

const body = [];
const push = (...x) => body.push(...x);

push(
  new Paragraph({ children: [txt(data.order, { size: TYPE.TITLE, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 1300, after: 140 } }),
  new Paragraph({ children: [txt('The provisions that change, shown as tracked changes',
    { size: TYPE.SUBTITLE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
  new Paragraph({ children: [txt(data.facility, { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt(data.effective, { size: TYPE.NOTE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 280 } }),
  block(GAP_FILL, [new Paragraph({ children: runs(data.provenance),
    spacing: { before: 60, after: 60, line: 272 } })]),
  new Paragraph({ text: '', spacing: { after: 120 } }),
  block(WARN_FILL, [
    new Paragraph({ children: runs('**How to read this.** Struck text is proposed for deletion '
      + 'and underlined text is proposed to replace it. In Word, use Review, then Accept or '
      + 'Reject, one change at a time.'), spacing: { before: 60, after: 120, line: 272 } }),
    new Paragraph({ children: runs(data.not_reproduced), spacing: { after: 60, line: 272 } }),
  ]),
  new Paragraph({ children: [txt('NOT LEGAL ADVICE. A working draft for departmental review. '
    + 'Route to County Counsel before adoption.', { bold: true, size: TYPE.NOTE })],
    alignment: AlignmentType.CENTER, spacing: { before: 280, line: 268 } }),
  new Paragraph({ children: [new PageBreak()] }),
);

push(new Paragraph({ text: 'What is proposed, and where it comes from',
  heading: HeadingLevel.HEADING_1 }));
push(p('Two numbered changes touch this order. Each provision below names the change it belongs '
  + 'to and the register rows behind it.'));
data.provisions.forEach((pr) => {
  push(new Paragraph({ children: [
    txt(pr.cite + '.  ', { bold: true }),
    txt(pr.label),
    txt('  Register row' + (pr.rows.length > 1 ? 's ' : ' ') + pr.rows.join(', ')
      + (pr.status === 'described' ? '. Words not held, no redline shown.' : '.'),
      { italics: true, color: MUTED, size: TYPE.NOTE }),
  ], spacing: { after: 120, line: 276 } }));
});
push(new Paragraph({ children: [new PageBreak()] }));

push(new Paragraph({ text: 'The provisions', heading: HeadingLevel.HEADING_1 }));
data.provisions.forEach((pr, i) => {
  if (i) push(new Paragraph({ text: '', spacing: { after: 200 } }));
  push(new Paragraph({ children: [
    txt(pr.cite, { bold: true, size: TYPE.H2 }),
    txt('   Change ' + pr.change, { color: MUTED, size: TYPE.NOTE }),
  ], heading: HeadingLevel.HEADING_2 }));
  push(new Paragraph({ children: runs(pr.status_note, { italics: true, size: TYPE.NOTE }),
    spacing: { after: 140, line: 268 } }));

  if (pr.status === 'described') {
    push(block(GAP_FILL, [new Paragraph({
      children: runs('**No redline shown.** ' + pr.action),
      spacing: { before: 60, after: 60, line: 272 } })]));
    return;
  }
  push(new Paragraph({ children: revisionRuns(pr.runs),
    spacing: { after: 120, line: 276 }, indent: { left: 420 } }));
  (pr.sub || []).forEach(([letter, text]) => {
    push(new Paragraph({
      children: [txt(letter + '.  ', { bold: true }), ...revisionRuns([['ins', text]])],
      spacing: { after: 100, line: 272 }, indent: { left: 900, hanging: 300 } }));
  });
});

push(new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: 'Before adoption', heading: HeadingLevel.HEADING_1 }));
data.before_adoption.forEach((t) => push(
  block(WARN_FILL, [new Paragraph({ children: runs(t),
    spacing: { before: 60, after: 60, line: 272 } })]),
  new Paragraph({ text: '', spacing: { after: 120 } }),
));
push(new Paragraph({ children: [txt('Drawn from gap register Revision ' + data.register_revision + '. Accepting or rejecting '
  + 'the tracked changes in Word is the intended way to use this file, and the copy you save '
  + 'afterwards is the department\'s.', { italics: true, size: TYPE.NOTE, color: MUTED })],
  spacing: { before: 200, line: 268 } }));

const doc = new Document({
  features: { updateFields: true, trackRevisions: true },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: TYPE.BODY, color: INK },
        paragraph: { spacing: { line: 276 } } },
      heading1: { run: { font: 'Calibri', size: TYPE.H1, bold: true, color: INK },
        paragraph: { spacing: { before: 320, after: 180 } } },
      heading2: { run: { font: 'Calibri', size: TYPE.H2, bold: true, color: INK },
        paragraph: { spacing: { before: 280, after: 100 } } },
    },
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
      margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: data.order + ', provisions that change',
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
  const v = data.provisions.filter((x) => x.status === 'verbatim').length;
  console.log('wrote ' + path.relative(ROOT, OUT) + ' ' + buf.length + ' bytes, '
    + data.provisions.length + ' provisions (' + v + ' with redlines, '
    + (data.provisions.length - v) + ' described only)');
});
