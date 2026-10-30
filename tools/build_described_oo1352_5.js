// OO 1352.5: its provisions, what each one does, and the action required.
//
// The third of three documents built per order, and the only one that is not a
// redline. OO 1453 reproduces a whole order with real Word revisions because its
// text was produced. OO 1352 reproduces the provisions that change, because only
// those were quoted before its PDF was lost. OO 1352.5 was never produced at all,
// so there is no text to strike and this document does not pretend otherwise.
//
// The hazard here is not that the document will be wrong. It is that it will be
// mistaken for the other two, or that it will quietly propose something different
// from the redline that covers the same numbered change. Both are guarded below.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, Header, Footer, PageNumber,
} = require('docx');
const { TYPE } = require('./docx_style');

const ROOT = path.dirname(__dirname);
const SRC = path.join(ROOT, 'drafts', 'oo1352-5-described.json');
const REDLINES = path.join(ROOT, 'drafts', 'redlines.json');
const OUT = path.join(ROOT, 'deliverables', 'OO_1352_5_Citations_and_Actions.docx');

const INK = '1A1A1A';
const MUTED = '595959';
const RULE = 'BFBFBF';
const WARN_FILL = 'FCF0DC';
const NOTE_FILL = 'EDF1F7';
const GAP_FILL = 'F2DEDE';
const OK_FILL = 'EAF1EA';
const CONTENT_W = 10080;

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const fail = (...m) => { console.error('ABORTED. ' + m.join(' ')); process.exit(1); };

// Nothing in this file is quoted from the order, so unlike the two redline
// builders there is no exemption: the no-dash rule covers every string here.
const DASH = new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']');
const dashed = [];
(function walk(o, at) {
  if (typeof o === 'string') { if (DASH.test(o)) dashed.push(at + ': ' + o.slice(0, 80)); return; }
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, at + '[' + i + ']'));
  if (o && typeof o === 'object') return Object.entries(o).forEach(([k, v]) => walk(v, at + '/' + k));
}(data, ''));
if (dashed.length) {
  fail('Em or en dash in this document, which CLAUDE.md section 1 forbids. Nothing here is '
    + 'quoted from the order, so every string is checked:\n  ' + dashed.join('\n  '));
}

// This document must keep saying what it is not.
if (data.complete !== false) fail('"complete" is not false.');
if (data.is_redline !== false) {
  fail('"is_redline" is not false. This builder produces a document with no struck or inserted '
    + 'text. If the order has been produced, build it the way OO 1453 is built.');
}
if (!/never been produced/i.test(data.provenance) || !/none of its words/i.test(data.provenance)) {
  fail('The provenance statement must say the order has never been produced and that this '
    + 'document contains none of its words. Those two sentences are the only thing standing '
    + 'between this file and a reader who takes it for the department\'s policy.');
}
if (!/not a redline/i.test(data.subtitle || '')) {
  fail('The subtitle must say in terms that this is not a redline. It sits next to two '
    + 'attachments that are, and the cover page is where a reader decides which kind of '
    + 'document they are holding.');
}
// No tab letters. This document is handed out inside the briefing packet, where
// it is Attachment J, and also on its own to whoever is producing the order. A tab
// letter is a fact about the packet's running order, not about this document, and
// the first draft of this file got one wrong: it called OO 1453 Attachment G when
// G is the staffing factors. Naming the document instead cannot go stale.
const tabs = [];
(function scan(o, at) {
  if (typeof o === 'string') {
    const m = o.match(/Attachment [A-Z]\b/g);
    if (m) tabs.push(at + ': ' + m.join(', '));
    return;
  }
  if (Array.isArray(o)) return o.forEach((v, i) => scan(v, at + '[' + i + ']'));
  if (o && typeof o === 'object') return Object.entries(o).forEach(([k, v]) => scan(v, at + '/' + k));
}(data, ''));
if (tabs.length) {
  fail('This document names a packet tab letter:\n  ' + tabs.join('\n  ')
    + '\nTab letters belong to the briefing packet\'s running order, which changes when an '
    + 'attachment is added, and this document also travels on its own. Name the document '
    + 'instead of its tab.');
}
if (/tracked.?changes|redline/i.test(path.basename(OUT))) {
  fail('The output filename says tracked changes or redline. It is neither. A filename travels '
    + 'further than a cover page, because it is what gets forwarded in an email.');
}
// No redline machinery, anywhere. These keys are how the other two builders carry
// kept and struck text, and their presence here means someone started reconstructing.
const QUOTED_KEYS = ['runs', 'sub', 'verbatim', 'kept', 'struck', 'del', 'status'];
const smuggled = [];
(data.provisions || []).forEach((pr) => QUOTED_KEYS.forEach((k) => {
  if (k in pr) smuggled.push(pr.cite + ': ' + k);
}));
if (smuggled.length) {
  fail('These provisions carry keys this builder will not render, and that the redline builders '
    + 'use for the order\'s own words: ' + smuggled.join(', ') + '. No wording of this order is '
    + 'held, so there is nothing to keep or strike. A redline on text nobody quoted is '
    + 'invented policy.');
}
// Shape of each provision.
const bad = [];
(data.provisions || []).forEach((pr) => {
  if (!pr.cite) bad.push('a provision with no citation');
  if (!pr.label) bad.push(pr.cite + ': no label');
  if (!(pr.rows || []).length) bad.push(pr.cite + ': no register rows');
  if (!pr.described) bad.push(pr.cite + ': nothing described');
  if (!pr.action) bad.push(pr.cite + ': no required action, so it would print as a citation '
    + 'and nothing else');
  if (pr.amend === true && !pr.change) bad.push(pr.cite + ': amended but names no change number');
  if (pr.amend !== true && pr.change) bad.push(pr.cite + ': names change ' + pr.change
    + ' but is not marked for amendment');
  if (pr.amend !== true && (pr.proposed || []).length) {
    bad.push(pr.cite + ': carries proposed language but is not marked for amendment');
  }
  if (pr.amend === true && !(pr.proposed || []).length) {
    bad.push(pr.cite + ': marked for amendment and proposes no language');
  }
});
if (bad.length) fail('Provision defects:\n  ' + bad.join('\n  '));

// The guard that matters most, and the one CLAUDE.md section 22 paid for twice.
// When a second deliverable is built for a numbered change that already has one,
// the risk is not that it will be wrong on its own terms. It is that it will
// quietly propose something different. The redline for change 2 and this document
// must propose the same words, character for character.
const red = JSON.parse(fs.readFileSync(REDLINES, 'utf8'));
(data.provisions || []).filter((pr) => pr.amend === true).forEach((pr) => {
  const item = (red.items || []).find((x) => x.n === pr.change);
  if (!item) fail('Change ' + pr.change + ' is not in the redlines, so the two deliverables '
    + 'cannot be checked against each other.');
  const theirs = (item.insert || []).flatMap((ins) => ins.text || []);
  const ours = pr.proposed || [];
  if (theirs.length !== ours.length || theirs.some((t, i) => t !== ours[i])) {
    const diff = [];
    for (let i = 0; i < Math.max(theirs.length, ours.length); i += 1) {
      if (theirs[i] !== ours[i]) {
        diff.push('  paragraph ' + (i + 1) + '\n    redline: ' + (theirs[i] || '(absent)')
          + '\n    here   : ' + (ours[i] || '(absent)'));
      }
    }
    fail('Change ' + pr.change + ' is proposed differently in the redlines and in this '
      + 'document:\n' + diff.join('\n') + '\nTwo attachments in one packet proposing two '
      + 'amendments under one number is how a reader stops trusting the packet. Fix the '
      + 'source, not this check.');
  }
});

const txt = (t, o = {}) => new TextRun({ text: String(t), size: o.size || TYPE.BODY,
  bold: !!o.bold, italics: !!o.italics, color: o.color || INK });
function runs(t, o = {}) {
  return String(t).split(/\*\*(.+?)\*\*/g)
    .map((part, i) => txt(part, Object.assign({}, o, { bold: i % 2 === 1 })));
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
  new Paragraph({ children: runs(data.subtitle, { size: TYPE.SUBTITLE, color: MUTED }),
    alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
  new Paragraph({ children: [txt(data.facility, { size: TYPE.META })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [txt(data.effective, { size: TYPE.NOTE, color: MUTED })],
    alignment: AlignmentType.CENTER, spacing: { after: 280 } }),
  block(GAP_FILL, [new Paragraph({ children: runs(data.provenance),
    spacing: { before: 60, after: 60, line: 272 } })]),
  spacer(),
  block(WARN_FILL, [
    new Paragraph({ children: runs(data.how_to_read),
      spacing: { before: 60, after: 120, line: 272 } }),
    new Paragraph({ children: runs(data.not_reproduced), spacing: { after: 60, line: 272 } }),
  ]),
  new Paragraph({ children: [txt('NOT LEGAL ADVICE. A working draft for departmental review. '
    + 'Route to County Counsel before adoption.', { bold: true, size: TYPE.NOTE })],
    alignment: AlignmentType.CENTER, spacing: { before: 280, line: 268 } }),
  new Paragraph({ children: [new PageBreak()] }),
);

push(new Paragraph({ text: 'The provisions at a glance', heading: HeadingLevel.HEADING_1 }));
push(p(data.summary_note));
data.provisions.forEach((pr) => {
  push(new Paragraph({ children: [
    txt(pr.cite + '.  ', { bold: true }),
    txt(pr.label),
    txt('  Register row' + (pr.rows.length > 1 ? 's ' : ' ') + pr.rows.join(', ') + '. '
      + (pr.amend ? 'Amendment required, change ' + pr.change + '.' : 'No amendment required.'),
      { italics: true, color: MUTED, size: TYPE.NOTE }),
  ], spacing: { after: 120, line: 276 } }));
});
push(new Paragraph({ children: [new PageBreak()] }));

push(new Paragraph({ text: 'Provision by provision', heading: HeadingLevel.HEADING_1 }));
data.provisions.forEach((pr, i) => {
  if (i) push(spacer(200));
  push(new Paragraph({ children: [
    txt(pr.cite, { bold: true, size: TYPE.H2 }),
    txt(pr.amend ? '   Change ' + pr.change : '   No amendment required',
      { color: MUTED, size: TYPE.NOTE }),
  ], heading: HeadingLevel.HEADING_2 }));
  push(new Paragraph({ children: runs(pr.label, { italics: true, size: TYPE.NOTE }),
    spacing: { after: 140, line: 268 } }));
  push(block(NOTE_FILL, [new Paragraph({
    children: runs('**What the register records this provision as doing.** ' + pr.described),
    spacing: { before: 60, after: 60, line: 272 } })]));
  push(spacer(100));

  if (pr.problem) {
    push(block(GAP_FILL, [new Paragraph({ children: runs('**The problem.** ' + pr.problem),
      spacing: { before: 60, after: 60, line: 272 } })]));
    push(spacer(100));
  }
  if ((pr.authority || []).length) {
    push(new Paragraph({ children: [txt('Authority', { bold: true })],
      spacing: { before: 60, after: 80 } }));
    pr.authority.forEach((a) => push(new Paragraph({ children: runs(a),
      bullet: { level: 0 }, spacing: { after: 80, line: 272 } })));
  }
  push(block(pr.amend ? WARN_FILL : OK_FILL, [new Paragraph({
    children: runs('**Action required.** ' + pr.action),
    spacing: { before: 60, after: 60, line: 272 } })]));

  if ((pr.proposed || []).length) {
    push(spacer(140));
    push(new Paragraph({ children: [
      txt('Proposed replacement language.', { bold: true }),
      txt('  Drafted by this review. These are not the order\'s words and are not presented as '
        + 'an edit to its text.', { italics: true, color: MUTED, size: TYPE.NOTE }),
    ], spacing: { after: 100, line: 272 } }));
    if (pr.proposed_heading) {
      push(new Paragraph({ children: [txt(pr.cite + '  ' + pr.proposed_heading, { bold: true })],
        spacing: { after: 100 }, indent: { left: 420 } }));
    }
    pr.proposed.forEach((t) => push(new Paragraph({ children: runs(t),
      spacing: { after: 100, line: 276 }, indent: { left: 420 } })));
  }
  if (pr.watch) {
    push(spacer(100));
    push(block(WARN_FILL, [new Paragraph({ children: runs('**Watch this.** ' + pr.watch),
      spacing: { before: 60, after: 60, line: 272 } })]));
  }
});

push(new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: 'Before adoption', heading: HeadingLevel.HEADING_1 }));
data.before_adoption.forEach((t) => push(
  block(WARN_FILL, [new Paragraph({ children: runs(t),
    spacing: { before: 60, after: 60, line: 272 } })]), spacer()));
push(new Paragraph({ children: [txt('Drawn from gap register Revision ' + data.register_revision
  + '. This copy is regenerated from source; edits made here are not carried forward.',
  { italics: true, size: TYPE.NOTE, color: MUTED })], spacing: { before: 200, line: 268 } }));

const doc = new Document({
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
      children: [new TextRun({ text: data.order + ', citations and required actions',
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
  const a = data.provisions.filter((x) => x.amend).length;
  console.log('wrote ' + path.relative(ROOT, OUT) + ' ' + buf.length + ' bytes, '
    + data.provisions.length + ' provisions (' + a + ' requiring amendment, '
    + (data.provisions.length - a) + ' not), no tracked changes by design');
});
