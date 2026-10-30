// OO 1453 with the proposed amendments as real Word tracked changes.
//
// This is not a redline summary. It is the order's own text with <w:ins> and
// <w:del> revisions, so Word shows them in the Review pane and the department
// can Accept or Reject each one and be left with a clean adopted order.
//
// The base text is VERBATIM from the produced PDF. That is the whole basis on
// which this document is safe to hand over, so the guard below refuses to build
// if the provenance statement that says so has been removed.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, InsertedTextRun, DeletedTextRun,
  HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, Header, Footer, PageNumber,
} = require('docx');
const { TYPE } = require('./docx_style');

const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'drafts', 'oo1453-tracked.json');
const OUT = path.join(ROOT, 'deliverables', 'OO_1453_Tracked_Changes.docx');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const WARN_FILL = 'FCF0DC';
const NOTE_FILL = 'EDF1F7';
const CONTENT_W = 10080;

const AUTHOR = 'PREA Policy Review';
const DATE = '2026-10-30T00:00:00Z';

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// The no-dash rule in CLAUDE.md section 1 governs what this project writes. It
// cannot govern what the Department wrote: paragraph 1 of this order contains
// an en dash in "no access to toilet - see #5 below", and a tracked-changes
// document that silently corrected the Department's punctuation would be
// misrepresenting the base text, which is the one thing this document must not
// do. So the check runs over authored text only. Quoted text is exempt by
// construction rather than by an allowlist of known exceptions.
const DASH = new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']');
function authoredStrings(d) {
  const out = [];
  const add = (where, v) => { if (typeof v === 'string') out.push([where, v]); };
  add('provenance', d.provenance);
  (d.notes || []).forEach((n, i) => {
    add('notes[' + i + '].on', n.on); add('notes[' + i + '].text', n.text);
  });
  (d.before_adoption || []).forEach((t, i) => add('before_adoption[' + i + ']', t));
  (d.items || []).forEach((it) => {
    add('I.A.' + it.n + ' label', it.label);
    const amended = it.runs.some((r) => r[0] !== 'keep');
    // keep and del runs are the order's own words. Only ins is ours.
    it.runs.forEach(([kind, text], i) => {
      if (kind === 'ins') add('I.A.' + it.n + ' insert[' + i + ']', text);
    });
    // Subparagraphs under an amended item are text we wrote. Under an
    // unamended item they are the order's.
    if (amended) (it.sub || []).forEach(([l, t]) => add('I.A.' + it.n + ' sub ' + l, t));
  });
  return out;
}
const dashed = authoredStrings(data).filter(([, v]) => DASH.test(v));
if (dashed.length) {
  console.error('ABORTED. Em or en dash in text this project wrote, which CLAUDE.md section 1 '
    + 'forbids. Text quoted from the order is exempt and is not checked:');
  dashed.forEach(([where, v]) => console.error('  ' + where + ': ' + v.slice(0, 80)));
  process.exit(1);
}

// A tracked-changes document asserts "this is your policy, with edits". That is
// only true while the base text really is the order's. Refuse to build without
// the statement that says so, and without at least one real revision.
if (!/verbatim|own words/i.test(data.provenance || '')) {
  console.error('ABORTED. The provenance statement no longer says the base text is the order\'s '
    + 'own words. A tracked-changes document whose base text is reconstructed reads as the '
    + 'department\'s policy with edits, which is exactly the claim it would not be entitled to '
    + 'make.');
  process.exit(1);
}
const revised = data.items.filter((it) => it.runs.some((r) => r[0] !== 'keep'));
if (!revised.length) {
  console.error('ABORTED. No item carries a del or ins run, so this would ship as a plain copy '
    + 'of the order while being titled a tracked-changes version.');
  process.exit(1);
}
// Every amended item has to say which numbered change it belongs to and which
// register rows it rests on, because that is what the department correlates
// against the briefing packet.
const unlabelled = revised.filter((it) => !it.change || !it.label || !(it.rows || []).length);
if (unlabelled.length) {
  console.error('ABORTED. These amended items do not name a change number, a label and the '
    + 'register rows behind them: ' + unlabelled.map((it) => it.n).join(', '));
  process.exit(1);
}

let revId = 1000;
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

// Cover
push(
  new Paragraph({ children: [txt(data.order, { size: TYPE.TITLE, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 1400, after: 140 } }),
  new Paragraph({ children: [txt('Proposed amendments, shown as tracked changes',
    { size: TYPE.SUBTITLE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
  new Paragraph({ children: [txt(data.facility, { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt(data.effective, { size: TYPE.NOTE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
  block(WARN_FILL, [
    new Paragraph({ children: runs('**How to read this.** The text below is the order as it '
      + 'stands today. Struck text is proposed for deletion and underlined text is proposed to '
      + 'replace it. In Word, use Review, then Accept or Reject, one change at a time. Accepting '
      + 'every change leaves a clean amended order.'),
      spacing: { before: 60, after: 120, line: 272 } }),
    new Paragraph({ children: runs(data.provenance),
      spacing: { after: 60, line: 272 } }),
  ]),
  new Paragraph({ children: [txt('NOT LEGAL ADVICE. A working draft for departmental review. '
    + 'Route to County Counsel before adoption. See the notes at the end, which state what has '
    + 'to be confirmed first.', { bold: true, size: TYPE.NOTE })],
    alignment: AlignmentType.CENTER, spacing: { before: 300, line: 268 } }),
  new Paragraph({ children: [new PageBreak()] }),
);

// What changed, correlated to the numbered changes in the briefing packet.
push(new Paragraph({ text: 'What is proposed, and where it comes from',
  heading: HeadingLevel.HEADING_1 }));
push(p('Two paragraphs of this order are amended. Each traces to a numbered change in the '
  + 'briefing packet and to the register rows behind it.'));
revised.forEach((it) => {
  push(new Paragraph({ children: [
    txt('Paragraph I.A.' + it.n + '.  ', { bold: true }),
    txt(it.label),
    txt('  Register row' + (it.rows.length > 1 ? 's ' : ' ') + it.rows.join(', ') + '.',
      { italics: true, color: MUTED, size: TYPE.NOTE }),
  ], spacing: { after: 120, line: 276 } }));
});
push(p('Three further defects in this order are recorded in the notes at the end and are '
  + 'deliberately not amended here, because the fix is not a change of wording.'));
push(new Paragraph({ children: [new PageBreak()] }));

// The order itself.
push(new Paragraph({ text: data.order, heading: HeadingLevel.HEADING_1 }));
data.front.forEach((sec) => {
  push(new Paragraph({ text: sec.head, heading: HeadingLevel.HEADING_2 }));
  sec.paras.forEach((t) => push(p(t)));
});
push(new Paragraph({ text: 'I. Guidelines', heading: HeadingLevel.HEADING_2 }));
push(p(data.lead));

data.items.forEach((it) => {
  const amended = it.runs.some((r) => r[0] !== 'keep');
  push(new Paragraph({
    children: [txt(it.n + '.  ', { bold: true }), ...revisionRuns(it.runs)],
    spacing: { before: amended ? 180 : 120, after: 120, line: 276 },
    indent: { left: 420, hanging: 300 },
  }));
  (it.sub || []).forEach(([letter, text]) => {
    // Subparagraphs under an amended item are entirely new text, so the whole
    // run is an insertion. Under an unamended item they are the order's own.
    const kids = amended
      ? [txt(letter + '.  ', { bold: true }), ...revisionRuns([['ins', text]])]
      : [txt(letter + '.  ', { bold: true }), txt(text)];
    push(new Paragraph({ children: kids,
      spacing: { after: 100, line: 272 }, indent: { left: 900, hanging: 300 } }));
  });
  if (amended) {
    push(new Paragraph({ children: [txt('Change ' + it.change + '. See the notes at the end.',
      { italics: true, color: MUTED, size: TYPE.NOTE })],
      spacing: { after: 160 }, indent: { left: 420 } }));
  }
});

// Notes and the before-adoption block.
push(new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: 'Notes on each change', heading: HeadingLevel.HEADING_1 }));
data.notes.forEach((n) => {
  push(new Paragraph({ children: [
    txt(n.on, { bold: true }),
    txt(n.change ? '  (Change ' + n.change + ')' : '  (No amendment proposed)',
      { italics: true, color: MUTED, size: TYPE.NOTE }),
  ], spacing: { before: 200, after: 80 } }));
  push(block(NOTE_FILL, [new Paragraph({ children: runs(n.text),
    spacing: { before: 60, after: 60, line: 272 } })]));
});

push(new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: 'Before adoption', heading: HeadingLevel.HEADING_1 }));
data.before_adoption.forEach((t) => push(
  block(WARN_FILL, [new Paragraph({ children: runs(t),
    spacing: { before: 60, after: 60, line: 272 } })]),
  new Paragraph({ text: '', spacing: { after: 120 } }),
));
push(new Paragraph({ children: [txt('Generated from drafts/oo1453-tracked.json by npm run '
  + 'tracked-1453, from gap register Revision ' + data.register_revision + '. Do not hand-edit: '
  + 'the next build overwrites it. Accepting or rejecting the tracked changes in Word is the '
  + 'intended way to use this file, and that copy is the department\'s, not this build\'s.',
  { italics: true, size: TYPE.NOTE, color: MUTED })], spacing: { before: 200, line: 268 } }));

const doc = new Document({
  features: { updateFields: true, trackRevisions: true },
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
      children: [new TextRun({ text: data.order + ', proposed amendments',
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
    + data.items.length + ' paragraphs, ' + revised.length + ' amended ('
    + revised.map((it) => 'I.A.' + it.n + ' change ' + it.change).join(', ') + ')');
});
