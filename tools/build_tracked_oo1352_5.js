// OO 1352.5 with the proposed amendment as real Word tracked changes.
//
// The third complete tracked changes order, and the one that replaced a
// document built on its absence. Until 10/30 this order had never been produced,
// so the packet carried a citations-and-actions document instead, with guards
// whose whole job was to stop anyone reconstructing the order's wording. The PDF
// arrived, so the reconstruction is gone and this is the order's own words.
//
// The guard that matters is the same one the OO 1453 build taught: the no-dash
// rule runs over authored text only. This order's own front matter carries en
// dashes in "Title 15 - 1352.5" and in its heading. Tidying them would
// misrepresent the base text, which is the one thing this document must not do.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, InsertedTextRun, DeletedTextRun,
  HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, Header, Footer, PageNumber,
} = require('docx');
const { TYPE } = require('./docx_style');

const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'drafts', 'oo1352-5-tracked.json');
const REDLINES = path.join(ROOT, 'drafts', 'redlines.json');
const OUT = path.join(ROOT, 'deliverables', 'OO_1352_5_Tracked_Changes.docx');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const WARN_FILL = 'FCF0DC';
const GAP_FILL = 'F2DEDE';
const CONTENT_W = 10080;

const AUTHOR = 'PREA Policy Review';
const DATE = '2026-10-30T00:00:00Z';

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const fail = (...m) => { console.error('ABORTED. ' + m.join(' ')); process.exit(1); };

// Walk every item in the nested section tree.
function eachItem(fn) {
  const walk = (it, sec, trail) => {
    fn(it, sec, trail);
    (it.children || []).forEach((c) => walk(c, sec, trail + '.' + it.label));
  };
  (data.sections || []).forEach((s) => (s.items || []).forEach((it) => walk(it, s, s.n)));
}

// Authored text only. Text quoted from the order is exempt by construction, for
// the reason recorded in CLAUDE.md: a house style rule governs what this project
// writes and cannot govern what it quotes.
const DASH = new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']');
const authored = [];
const add = (w, v) => { if (typeof v === 'string') authored.push([w, v]); };
add('order', data.order);
add('facility', data.facility);
add('effective', data.effective);
add('provenance', data.provenance);
(data.notes || []).forEach((t, i) => add('notes[' + i + ']', t));
(data.before_adoption || []).forEach((t, i) => add('before_adoption[' + i + ']', t));
eachItem((it, sec, trail) => {
  const cite = trail + '.' + it.label;
  add(cite + ' change_label', it.change_label);
  (it.runs || []).forEach(([kind, text], i) => {
    if (kind === 'ins') add(cite + ' insert[' + i + ']', text);
  });
  (it.sub || []).forEach(([l, t]) => add(cite + ' sub ' + l, t));
});
const dashed = authored.filter(([, v]) => DASH.test(v));
if (dashed.length) {
  fail('Em or en dash in text this project wrote, which CLAUDE.md section 1 forbids. Text '
    + 'quoted from the order is exempt and is not checked:\n  '
    + dashed.map(([w, v]) => w + ': ' + v.slice(0, 80)).join('\n  '));
}

// This document reproduces the whole order and has to be entitled to say so.
if (data.complete !== true) {
  fail('"complete" is not true. This builder reproduces the whole order. If only some '
    + 'provisions are held, build it the way OO 1352 is built rather than letting an extract '
    + 'describe itself as the order.');
}
if (!/order's own words/i.test(data.provenance || '')) {
  fail('The provenance statement must say the base text is the order\'s own words. A tracked '
    + 'changes document asserts "this is your policy, with edits", and that claim is only safe '
    + 'while it is true.');
}
// A document with nothing marked is not a tracked changes document.
let revisions = 0;
eachItem((it) => { (it.runs || []).forEach((r) => { if (r[0] !== 'keep') revisions += 1; }); });
if (!revisions) fail('No run is marked inserted or deleted, so nothing would be tracked.');

// Every amended provision must be correlated to the packet.
const unlabelled = [];
eachItem((it, sec, trail) => {
  const amended = (it.runs || []).some((r) => r[0] !== 'keep') || (it.sub || []).length;
  if (!amended) return;
  if (!it.change || !it.change_label || !(it.rows || []).length) {
    unlabelled.push(trail + '.' + it.label);
  }
});
if (unlabelled.length) {
  fail('These provisions carry revisions and do not name a change number, a label and the '
    + 'register rows behind them: ' + unlabelled.join(', ')
    + '. That correlation is what the department checks against the briefing packet.');
}

// The same drift guard the citations document carried. Two deliverables for one
// numbered change must not quietly propose different words.
const red = JSON.parse(fs.readFileSync(REDLINES, 'utf8'));
eachItem((it, sec, trail) => {
  if (!it.change || !(it.sub || []).length) return;
  const item = (red.items || []).find((x) => x.n === it.change);
  if (!item) fail('Change ' + it.change + ' is not in the redlines, so the two deliverables '
    + 'cannot be checked against each other.');
  const theirs = (item.insert || []).flatMap((ins) => ins.text || [])
    .map((t) => t.replace(/^\d+\.\s*/, ''));
  const ours = it.sub.map((x) => x[1]);
  if (theirs.length !== ours.length || theirs.some((t, i) => t !== ours[i])) {
    const diff = [];
    for (let i = 0; i < Math.max(theirs.length, ours.length); i += 1) {
      if (theirs[i] !== ours[i]) {
        diff.push('  paragraph ' + (i + 1) + '\n    redline: ' + (theirs[i] || '(absent)')
          + '\n    here   : ' + (ours[i] || '(absent)'));
      }
    }
    fail('Change ' + it.change + ' is proposed differently in the redlines and in this '
      + 'document:\n' + diff.join('\n') + '\nTwo attachments in one packet proposing two '
      + 'amendments under one number is how a reader stops trusting the packet.');
  }
});

// The struck text must be the order's words, not the reconstruction this project
// carried before the PDF arrived. Checked against the redline's strike entry,
// which was corrected in the same pass.
eachItem((it, sec, trail) => {
  if (!it.change) return;
  const struck = (it.runs || []).filter((r) => r[0] === 'del').map((r) => r[1]).join(' ');
  if (!struck) return;
  const item = (red.items || []).find((x) => x.n === it.change);
  const quoted = (item.strike || []).some((s) => s.text.trim() === struck.trim());
  if (!quoted) {
    fail('The text struck at ' + trail + '.' + it.label + ' does not match the redline\'s '
      + 'strike entry for change ' + it.change + '.\n  here   : ' + struck
      + '\n  redline: ' + ((item.strike || [])[0] || {}).text
      + '\nBoth documents strike the same provision and must strike the same words.');
  }
});

// The cover sentence states two counts. Derive them, because a hardcoded count
// that is correct today is the bug this project has caught in its own prose more
// than once. Review flagged these two as the next instance waiting to happen.
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
  'Nine', 'Ten'];
const word = (n) => (n < WORDS.length ? WORDS[n] : String(n));
const noteCount = (data.notes || []).length;
const amendedCites = [];
const amendedChanges = new Set();
eachItem((it, sec, trail) => {
  if ((it.runs || []).some((r) => r[0] !== 'keep') || (it.sub || []).length) {
    amendedCites.push(trail + '.' + it.label);
    if (it.change) amendedChanges.add(it.change);
  }
});
const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const changeList = [...amendedChanges].sort((a, b) => a - b);
const howToRead = '**How to read this.** Struck text is proposed for deletion and underlined '
  + 'text is proposed to replace it. In Word, use Review, then Accept or Reject, one change at a '
  + 'time. Accepting every change leaves a clean amended order. '
  + word(amendedCites.length) + ' provision' + (amendedCites.length === 1 ? ' is' : 's are')
  + ' amended, ' + list(amendedCites) + ', under change' + (changeList.length === 1 ? ' ' : 's ')
  + list(changeList.map(String)) + ' of the briefing packet. '
  + word(noteCount) + ' further finding' + (noteCount === 1 ? ' is' : 's are')
  + ' recorded at the end and deliberately not amended.';

let revId = 3000;
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
const p = (t, o = {}) => new Paragraph({ children: runs(t, o), spacing: { after: 140, line: 276 } });
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
const spacer = (after = 120) => new Paragraph({ text: '', spacing: { after } });

const body = [];
const push = (...x) => body.push(...x);

push(
  new Paragraph({ children: [txt(data.order, { size: TYPE.TITLE, bold: true })],
    alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 140 } }),
  new Paragraph({ children: [txt('The order, with the proposed amendment as tracked changes',
    { size: TYPE.SUBTITLE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
  new Paragraph({ children: [txt(data.facility, { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt(data.effective, { size: TYPE.NOTE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 280 } }),
  block(GAP_FILL, [new Paragraph({ children: runs(data.provenance),
    spacing: { before: 60, after: 60, line: 272 } })]),
  spacer(),
  block(WARN_FILL, [new Paragraph({ children: runs(howToRead),
    spacing: { before: 60, after: 60, line: 272 } })]),
  new Paragraph({ children: [txt('NOT LEGAL ADVICE. A working draft for departmental review. '
    + 'Route to County Counsel before adoption.', { bold: true, size: TYPE.NOTE })],
    alignment: AlignmentType.CENTER, spacing: { before: 280, line: 268 } }),
  new Paragraph({ children: [new PageBreak()] }),
);

// Front matter, the order's own.
push(new Paragraph({ children: [txt(data.heading_quoted, { bold: true, size: TYPE.H1 })],
  alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
(data.front || []).forEach((t) => push(p(t)));
push(spacer(160));

const INDENT = { 1: 420, 2: 900, 3: 1380 };
function renderItem(it, sec, trail, depth) {
  const cite = trail + '.' + it.label;
  const amended = (it.runs || []).some((r) => r[0] !== 'keep') || (it.sub || []).length;
  if (amended) {
    push(spacer(100));
    push(block(WARN_FILL, [new Paragraph({
      children: runs('**' + cite + '.  ' + it.change_label + '**  Register row'
        + (it.rows.length > 1 ? 's ' : ' ') + it.rows.join(', ') + '.'),
      spacing: { before: 60, after: 60, line: 272 } })]));
    push(spacer(80));
  }
  push(new Paragraph({
    children: [txt(it.label + '.  ', { bold: true }), ...revisionRuns(it.runs || [])],
    spacing: { after: 110, line: 276 },
    indent: { left: INDENT[depth] || 1380, hanging: 300 },
  }));
  (it.sub || []).forEach(([letter, text]) => {
    push(new Paragraph({
      children: [...revisionRuns([['ins', letter + '.  ' + text]])],
      spacing: { after: 100, line: 272 },
      indent: { left: (INDENT[depth] || 1380) + 480, hanging: 300 },
    }));
  });
  (it.children || []).forEach((c) => renderItem(c, sec, cite, depth + 1));
}

(data.sections || []).forEach((sec) => {
  push(new Paragraph({ children: [
    txt(sec.n + '.  ', { bold: true, size: TYPE.H2 }), txt(sec.title, { bold: true, size: TYPE.H2 }),
  ], heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 120 } }));
  (sec.preamble || []).forEach((t) => push(new Paragraph({ children: [txt(t)],
    spacing: { after: 110, line: 276 }, indent: { left: 420 } })));
  (sec.items || []).forEach((it) => renderItem(it, sec, sec.n, 1));
  (sec.postamble || []).forEach((t) => push(new Paragraph({ children: [txt(t)],
    spacing: { before: 100, after: 110, line: 276 }, indent: { left: 420 } })));
});

push(spacer(200));
(data.back || []).forEach((t) => push(p(t)));

push(new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: 'Findings recorded and not amended', heading: HeadingLevel.HEADING_1 }));
push(p('Reading the whole order produced ' + word(noteCount).toLowerCase()
  + ' finding' + (noteCount === 1 ? '' : 's') + ' that are not changes of wording, '
  + 'or not inside any numbered change. They are recorded here rather than drafted into the '
  + 'text.'));
(data.notes || []).forEach((t) => push(
  block(GAP_FILL, [new Paragraph({ children: runs(t),
    spacing: { before: 60, after: 60, line: 272 } })]), spacer()));

push(new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: 'Before adoption', heading: HeadingLevel.HEADING_1 }));
(data.before_adoption || []).forEach((t) => push(
  block(WARN_FILL, [new Paragraph({ children: runs(t),
    spacing: { before: 60, after: 60, line: 272 } })]), spacer()));
push(new Paragraph({ children: [txt('Drawn from gap register Revision ' + data.register_revision
  + '. Accepting or rejecting the tracked changes in Word is the intended way to use this file, '
  + 'and the copy you save afterwards is the department\'s.',
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
        paragraph: { spacing: { before: 280, after: 100 } } },
    },
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
      margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: data.order + ', with proposed amendment',
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
  let n = 0;
  eachItem(() => { n += 1; });
  console.log('wrote ' + path.relative(ROOT, OUT) + ' ' + buf.length + ' bytes, whole order, '
    + n + ' provisions, ' + revisions + ' tracked revisions, ' + (data.notes || []).length
    + ' findings recorded and not amended');
});
