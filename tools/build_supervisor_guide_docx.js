// Build deliverables/PREA_Supervisor_Decision_Guide.docx from
// drafts/supervisor-guide.json. Run tools/build_supervisor_guide.py first: it
// validates the source and writes the Markdown working copy. Both outputs are
// views of the same JSON.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, TableOfContents, Header, Footer, PageNumber,
} = require('docx');

const ROOT = path.dirname(__dirname);
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'drafts', 'supervisor-guide.json'), 'utf8'));

const CONTENT_W = 10080;
const INK = '1A1A1A', MUTED = '5A5A5A', RULE = 'BFBFBF';
const HEAD_FILL = 'E8E8E8', ALT_FILL = 'F5F5F5';
const ABUSE_FILL = 'F2DEDE';   // sexual abuse tiers
const WARN_FILL = 'FCF0DC';    // draft status, defects
const STEP_FILL = 'E7EFE4';    // required steps

const CAVEAT = 'It is a policy and standards analysis prepared for internal use. The CANRA '
  + 'determinations in particular route to County Counsel before this issues to anyone.';

// Content is hand written rather than generated from the register, so nothing
// else enforces the no-em-dash rule from CLAUDE.md section 1 on it.
const flat = JSON.stringify(data);
if (/[—–]/.test(flat)) {
  console.error('ABORTED. Em or en dash in drafts/supervisor-guide.json, which '
    + 'CLAUDE.md section 1 forbids.');
  process.exit(1);
}

const txt = (t, o = {}) => new TextRun({ text: String(t), color: INK, ...o });

function p(text, opts = {}) {
  const { runs, ...rest } = opts;
  return new Paragraph({
    children: runs || [txt(text)],
    spacing: { after: 120, line: 276 },
    ...rest,
  });
}

function bullet(text, fill) {
  return new Paragraph({
    children: [txt(text)],
    bullet: { level: 0 },
    spacing: { after: 80, line: 264 },
  });
}

function cell(children, { width, fill, bold, size, align, span } = {}) {
  const kids = Array.isArray(children) ? children : [new Paragraph({
    children: [txt(children, { bold: !!bold, size: size || 19 })],
    spacing: { before: 40, after: 40, line: 240 },
    alignment: align,
  })];
  return new TableCell({
    children: kids,
    width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    shading: fill ? { type: ShadingType.CLEAR, fill, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

function table(columnWidths, rows) {
  return new Table({
    columnWidths,
    width: { size: columnWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    rows,
    borders: ['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical']
      .reduce((a, k) => (a[k] = { style: BorderStyle.SINGLE, size: 2, color: RULE }, a), {}),
  });
}

function block(fill, paragraphs) {
  return table([CONTENT_W], [new TableRow({
    children: [cell(paragraphs, { width: CONTENT_W, fill })],
  })]);
}

const isAbuse = (t) => /SEXUAL ABUSE/.test(t.prea_flag);

const body = [];
const push = (...x) => body.push(...x);

/* -------------------------------------------------------------- title */

push(
  new Paragraph({
    children: [txt(data.title, { size: 40, bold: true })],
    spacing: { before: 1200, after: 100 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt(data.subtitle, { size: 26, color: MUTED })],
    spacing: { after: 420 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt('Sacramento County Probation Department', { size: 24 })],
    spacing: { after: 60 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt('Youth Detention Facility', { size: 24 })],
    spacing: { after: 400 }, alignment: AlignmentType.CENTER,
  }),
  block(WARN_FILL, [new Paragraph({
    children: [txt(data.status, { bold: true, size: 22 })],
    spacing: { before: 80, after: 80, line: 260 }, alignment: AlignmentType.CENTER,
  })]),
  new Paragraph({ text: '', spacing: { after: 200 } }),
  block(ALT_FILL, [new Paragraph({
    children: [txt('This is not legal advice. ', { bold: true, size: 20 }), txt(CAVEAT, { size: 20 })],
    spacing: { before: 60, after: 60, line: 260 },
  })]),
  new Paragraph({ children: [new PageBreak()] }),
);

/* ---------------------------------------------------------------- toc */

push(
  new Paragraph({ text: 'Contents', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
);

/* -------------------------------------------------------------- why */

push(
  new Paragraph({ text: 'Why this exists', heading: HeadingLevel.HEADING_1 }),
  p(data.why),
  new Paragraph({ text: 'Four rules that apply to every incident', heading: HeadingLevel.HEADING_1 }),
);
data.principles.forEach((pr, i) => push(
  new Paragraph({ text: `${i + 1}. ${pr.head}`, heading: HeadingLevel.HEADING_2 }),
  p(pr.body),
));

/* ------------------------------------------------------- glance table */

const G = [760, 4200, 2560, 2560];
push(
  new Paragraph({ text: 'The tiers at a glance', heading: HeadingLevel.HEADING_1 }),
  p('Find the conduct, then read the full tier. The two right columns are different tests '
    + 'and they do not track each other.'),
  table(G, [
    new TableRow({
      tableHeader: true,
      children: [
        cell('Tier', { width: G[0], fill: HEAD_FILL, bold: true }),
        cell('Conduct', { width: G[1], fill: HEAD_FILL, bold: true }),
        cell('PREA', { width: G[2], fill: HEAD_FILL, bold: true }),
        cell('CPS report', { width: G[3], fill: HEAD_FILL, bold: true }),
      ],
    }),
    ...data.tiers.map((t) => {
      const fill = isAbuse(t) ? ABUSE_FILL : undefined;
      return new TableRow({
        children: [
          cell(String(t.n), { width: G[0], fill }),
          cell(t.conduct.split('.')[0], { width: G[1], fill }),
          cell([new Paragraph({
            children: [txt(t.prea_flag, { bold: isAbuse(t), size: 19 })],
            spacing: { before: 40, after: 40, line: 240 },
          })], { width: G[2], fill }),
          cell([new Paragraph({
            children: [txt(t.cps_flag, { bold: /YES|ESCALATE/.test(t.cps_flag), size: 19 })],
            spacing: { before: 40, after: 40, line: 240 },
          })], { width: G[3], fill }),
        ],
      });
    }),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

/* ------------------------------------------------------------- tiers */

data.tiers.forEach((t, idx) => {
  push(
    new Paragraph({ text: `Tier ${t.n}`, heading: HeadingLevel.HEADING_1 }),
    p('', { runs: [txt('The conduct. ', { bold: true }), txt(t.conduct)] }),
    table([2200, 7880], [
      new TableRow({
        children: [
          cell('PREA', { width: 2200, fill: isAbuse(t) ? ABUSE_FILL : ALT_FILL, bold: true }),
          cell([new Paragraph({
            children: [txt(t.prea_flag + '. ', { bold: true, size: 19 }), txt(t.prea, { size: 19 })],
            spacing: { before: 40, after: 40, line: 250 },
          })], { width: 7880, fill: isAbuse(t) ? ABUSE_FILL : undefined }),
        ],
      }),
      new TableRow({
        children: [
          cell('CPS report', { width: 2200, fill: ALT_FILL, bold: true }),
          cell([new Paragraph({
            children: [txt(t.cps_flag + '. ', { bold: true, size: 19 }), txt(t.cps, { size: 19 })],
            spacing: { before: 40, after: 40, line: 250 },
          })], { width: 7880 }),
        ],
      }),
    ]),
    new Paragraph({ text: 'Required steps', heading: HeadingLevel.HEADING_2 }),
    block(STEP_FILL, t.steps.map((s, i) => new Paragraph({
      children: [txt(s)],
      bullet: { level: 0 },
      spacing: { before: i ? 40 : 60, after: 60, line: 264 },
    }))),
  );
  if (idx < data.tiers.length - 1) push(new Paragraph({ children: [new PageBreak()] }));
});

/* ------------------------------------------------- flips, doubt, etc */

push(
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ text: data.flips.head, heading: HeadingLevel.HEADING_1 }),
  block(WARN_FILL, data.flips.items.map((it, i) => new Paragraph({
    children: [txt(it)],
    bullet: { level: 0 },
    spacing: { before: i ? 40 : 60, after: 60, line: 264 },
  }))),
  new Paragraph({ text: data.doubt.head, heading: HeadingLevel.HEADING_1 }),
  p(data.doubt.body),
  new Paragraph({ text: data.defects.head, heading: HeadingLevel.HEADING_1 }),
  p(data.defects.body),
);
data.defects.items.forEach((d) => push(
  new Paragraph({ text: d.head, heading: HeadingLevel.HEADING_2 }),
  p(d.body),
));
push(
  new Paragraph({ text: data.counsel.head, heading: HeadingLevel.HEADING_1 }),
  ...data.counsel.items.map((it) => bullet(it)),
);

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 21, color: INK }, paragraph: { spacing: { line: 276 } } },
      heading1: {
        run: { font: 'Calibri', size: 32, bold: true, color: INK },
        paragraph: { spacing: { before: 360, after: 200 } },
      },
      heading2: {
        run: { font: 'Calibri', size: 25, bold: true, color: INK },
        paragraph: { spacing: { before: 300, after: 140 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [txt('Supervisor decision guide. YDF. DRAFT, not for issuance. Not legal advice.',
            { size: 16, color: MUTED })],
          alignment: AlignmentType.RIGHT, spacing: { after: 120 },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED })],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    children: body,
  }],
});

const out = path.join(ROOT, 'deliverables', 'PREA_Supervisor_Decision_Guide.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', path.relative(ROOT, out), buf.length, 'bytes');
});
