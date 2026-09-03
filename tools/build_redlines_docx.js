// Build deliverables/PREA_Redlines_Changes_1_to_7.docx from drafts/redlines.json.
// Run tools/build_redlines.py first: it validates the source and writes the
// Markdown working copy. Both outputs are views of the same JSON.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, TableOfContents, Header, Footer, PageNumber,
} = require('docx');

const ROOT = path.dirname(__dirname);
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'drafts', 'redlines.json'), 'utf8'));

const CONTENT_W = 10080;           // 12240 page width less two 1080 margins

const INK = '1A1A1A';
const MUTED = '5A5A5A';
const RULE = 'BFBFBF';
const ALT_FILL = 'F5F5F5';
const STRIKE_FILL = 'F2DEDE';      // text coming out
const INSERT_FILL = 'E7EFE4';      // text going in
const WARN_FILL = 'FCF0DC';        // before adoption

const CAVEAT = 'It is proposed amendment language prepared for internal remediation '
  + 'planning. Statutory questions, and every item in a Before adoption block, route to '
  + 'County Counsel.';

function txt(text, opts = {}) {
  return new TextRun({ text: String(text), color: INK, ...opts });
}

function p(text, opts = {}) {
  const { runs, ...rest } = opts;
  return new Paragraph({
    children: runs || [txt(text)],
    spacing: { after: 120, line: 276 },
    ...rest,
  });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    children: [txt(text, opts.run || {})],
    bullet: { level: 0 },
    spacing: { after: 80, line: 264 },
  });
}

function cell(children, { width, fill, bold, size, align, span } = {}) {
  const kids = Array.isArray(children) ? children : [
    new Paragraph({
      children: [txt(children, { bold: !!bold, size: size || 19 })],
      spacing: { before: 40, after: 40, line: 240 },
      alignment: align,
    }),
  ];
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
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      left: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      right: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: RULE },
    },
  });
}

// A full-width shaded block. Used for the three call-out kinds so that a reader
// scanning the page can tell struck text from inserted text from a warning
// without reading a word of it.
function block(fill, paragraphs) {
  return table([CONTENT_W], [
    new TableRow({ children: [cell(paragraphs, { width: CONTENT_W, fill })] }),
  ]);
}

const body = [];
const push = (...x) => body.push(...x);

/* ---------------------------------------------------------------- title */

push(
  new Paragraph({
    children: [txt('Redlines', { size: 44, bold: true })],
    spacing: { before: 1400, after: 100 },
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt(data.set, { size: 28, color: MUTED })],
    spacing: { after: 500 },
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt('Sacramento County Probation Department', { size: 24 })],
    spacing: { after: 60 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt('Youth Detention Facility', { size: 24 })],
    spacing: { after: 400 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt(`${data.subtitle}. Drawn from gap register Revision `
      + `${data.register_revision}.`, { size: 22, color: MUTED })],
    spacing: { after: 900 }, alignment: AlignmentType.CENTER,
  }),
  block(ALT_FILL, [
    new Paragraph({
      children: [
        txt('This is not legal advice. ', { bold: true, size: 20 }),
        txt(CAVEAT, { size: 20 }),
      ],
      spacing: { before: 60, after: 60, line: 260 },
    }),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

/* ------------------------------------------------------------------ toc */

push(
  new Paragraph({ text: 'Contents', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
);

/* -------------------------------------------------------- how to read */

push(
  new Paragraph({ text: 'How to read a redline', heading: HeadingLevel.HEADING_1 }),
  p('Each change gives the provision to strike, the language to insert in its place, the '
    + 'conforming edits the amendment needs to be complete, and a Before adoption block. '
    + 'Read that block first.'),
  p('Struck text is shaded and struck through. Where the source order has not been produced '
    + 'to this review, the struck text is a reconstruction of what the register describes, '
    + 'not a quotation, and each item says which it is. Inserted language is shaded and is '
    + 'written to be pasted into the order with its own numbering.'),
  p('Items 1 through 7 require no new policy and can be completed on an amendment cycle. '
    + 'They are ordered as they appear in the master report.'),

  new Paragraph({ text: 'Source documents', heading: HeadingLevel.HEADING_2 }),
  p('Produced and read directly:'),
  ...data.produced.map((d) => bullet(d)),
  p('Not produced. Every provision cited in these documents traces to the register, which '
    + 'traces to the earlier review that read them. Confirm each section number and its '
    + 'wording against the PDF before any of this is circulated:'),
  ...data.not_produced.map((d) => bullet(d)),

  new Paragraph({ text: 'The seven changes', heading: HeadingLevel.HEADING_2 }),
  table([620, 5200, 1200, 3060], [
    new TableRow({
      tableHeader: true,
      children: [
        cell('#', { width: 620, fill: 'E8E8E8', bold: true }),
        cell('Change', { width: 5200, fill: 'E8E8E8', bold: true }),
        cell('Priority', { width: 1200, fill: 'E8E8E8', bold: true }),
        cell('Document', { width: 3060, fill: 'E8E8E8', bold: true }),
      ],
    }),
    ...data.items.map((it, i) => new TableRow({
      children: [
        cell(String(it.n), { width: 620, fill: i % 2 ? ALT_FILL : undefined }),
        cell(it.title, { width: 5200, fill: i % 2 ? ALT_FILL : undefined }),
        cell(it.priority, { width: 1200, fill: i % 2 ? ALT_FILL : undefined }),
        cell(it.targets[0], { width: 3060, fill: i % 2 ? ALT_FILL : undefined }),
      ],
    })),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

/* ------------------------------------------------------------- the seven */

data.items.forEach((it, idx) => {
  push(new Paragraph({
    text: `${it.n}. ${it.title}`,
    heading: HeadingLevel.HEADING_1,
  }));

  const facts = [
    ['Priority', [it.priority]],
    ['Document', it.targets],
    ['Authority', it.authority],
    ['Register rows', [it.rows.join(', ')]],
  ];
  push(table([2000, 8080], facts.map(([label, lines]) => new TableRow({
    children: [
      cell(label, { width: 2000, fill: ALT_FILL, bold: true }),
      cell(lines.map((line, i) => new Paragraph({
        children: [txt(line, { size: 19 })],
        spacing: { before: i ? 20 : 40, after: 40, line: 240 },
      })), { width: 8080 }),
    ],
  }))));

  push(
    new Paragraph({ text: 'The defect', heading: HeadingLevel.HEADING_2 }),
    p(it.problem),
    new Paragraph({ text: 'Strike', heading: HeadingLevel.HEADING_2 }),
  );
  it.strike.forEach((s) => {
    push(
      p('', { runs: [txt(s.cite, { bold: true })], spacing: { after: 60 } }),
      block(STRIKE_FILL, [
        new Paragraph({
          children: [txt(s.text, { strike: true })],
          spacing: { before: 60, after: 60, line: 260 },
        }),
      ]),
      // status is stored ready to print, so this view and the Markdown view
      // cannot drift. Do not re-case it here.
      p('', {
        runs: [txt(s.status, { italics: true, size: 18, color: MUTED })],
        spacing: { before: 60, after: 200 },
      }),
    );
  });

  push(new Paragraph({ text: 'Insert', heading: HeadingLevel.HEADING_2 }));
  it.insert.forEach((ins) => {
    push(
      p('', { runs: [txt(ins.cite, { bold: true })], spacing: { after: 60 } }),
      block(INSERT_FILL, [
        new Paragraph({
          children: [txt(ins.heading, { bold: true })],
          spacing: { before: 60, after: 100, line: 260 },
        }),
        ...ins.text.map((para, i) => new Paragraph({
          children: [txt(para)],
          spacing: { after: i === ins.text.length - 1 ? 60 : 120, line: 276 },
        })),
      ]),
      p('', { spacing: { after: 140 } }),
    );
  });

  push(new Paragraph({ text: 'Conforming changes', heading: HeadingLevel.HEADING_2 }));
  it.conforming.forEach((c) => push(bullet(c)));

  push(
    new Paragraph({ text: 'Why', heading: HeadingLevel.HEADING_2 }),
    p(it.why),
    new Paragraph({ text: 'Before adoption', heading: HeadingLevel.HEADING_2 }),
    block(WARN_FILL, it.before_adoption.map((b, i) => new Paragraph({
      children: [txt(b)],
      bullet: { level: 0 },
      spacing: { before: i ? 40 : 60, after: 60, line: 264 },
    }))),
  );

  if (idx < data.items.length - 1) {
    push(new Paragraph({ children: [new PageBreak()] }));
  }
});

const doc = new Document({
  features: {
    // The table of contents is a Word field. docx cannot compute page numbers,
    // so without this Word shows an empty contents page until someone presses F9.
    updateFields: true,
  },
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
          children: [txt('Redlines, ' + data.set + '. YDF, register Revision '
            + data.register_revision + '. Not legal advice.', { size: 16, color: MUTED })],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
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

const out = path.join(ROOT, 'deliverables', 'PREA_Redlines_Changes_1_to_7.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', path.relative(ROOT, out), buf.length, 'bytes');
});
