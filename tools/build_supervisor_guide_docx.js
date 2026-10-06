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

const { TYPE } = require('./docx_style');

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
    children: [txt(children, { bold: !!bold, size: size || TYPE.CELL })],
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

// Section headings in the order emitted, for the cross-view check at the end.
// "Contents" and the notes page are front matter and have no Markdown analogue.
const SECTIONS = [];
const FRONT = new Set(['Contents', 'Citation and verification notes']);
function h1(text) {
  if (!FRONT.has(text)) SECTIONS.push(text);
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
}

/* -------------------------------------------------------------- title */

push(
  new Paragraph({
    children: [txt(data.title, { size: TYPE.TITLE, bold: true })],
    spacing: { before: 1200, after: 100 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt(data.subtitle, { size: TYPE.SUBTITLE, color: MUTED })],
    spacing: { after: 420 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt('Sacramento County Probation Department', { size: TYPE.META })],
    spacing: { after: 60 }, alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt('Youth Detention Facility', { size: TYPE.META })],
    spacing: { after: 400 }, alignment: AlignmentType.CENTER,
  }),
  block(WARN_FILL, [new Paragraph({
    children: [txt(data.status, { bold: true, size: TYPE.SUBTITLE })],
    spacing: { before: 80, after: 80, line: 260 }, alignment: AlignmentType.CENTER,
  })]),
  new Paragraph({ text: '', spacing: { after: 200 } }),
  block(ALT_FILL, [new Paragraph({
    children: [txt('This is not legal advice. ', { bold: true, size: TYPE.NOTE }), txt(CAVEAT, { size: TYPE.NOTE })],
    spacing: { before: 60, after: 60, line: 260 },
  })]),
  new Paragraph({ children: [new PageBreak()] }),
);

if (data.citation_note || data.verification_note) {
  push(h1('Citation and verification notes'));
  [data.citation_note, data.verification_note].filter(Boolean).forEach((note, i) => push(
    block(WARN_FILL, [new Paragraph({
      children: [txt(note)],
      spacing: { before: 60, after: 60, line: 264 },
    })]),
    new Paragraph({ text: '', spacing: { after: i === 0 ? 160 : 0 } }),
  ));
  push(new Paragraph({ children: [new PageBreak()] }));
}

/* ---------------------------------------------------------------- toc */

push(
  h1('Contents'),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({ children: [new PageBreak()] }),
);

/* -------------------------------------------------------------- why */

push(
  h1('Why this exists'),
  p(data.why),
  h1('Four rules that apply to every incident'),
);
data.principles.forEach((pr, i) => push(
  new Paragraph({ text: `${i + 1}. ${pr.head}`, heading: HeadingLevel.HEADING_2 }),
  p(pr.body),
));

/* ------------------------------------------------------- glance table */

const G = [760, 4200, 2560, 2560];
push(
  h1('The tiers at a glance'),
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
            children: [txt(t.prea_flag, { bold: isAbuse(t), size: TYPE.CELL })],
            spacing: { before: 40, after: 40, line: 240 },
          })], { width: G[2], fill }),
          cell([new Paragraph({
            children: [txt(t.cps_flag, { bold: /YES|ESCALATE/.test(t.cps_flag), size: TYPE.CELL })],
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
    h1(`Tier ${t.n}`),
    p('', { runs: [txt('The conduct. ', { bold: true }), txt(t.conduct)] }),
    table([2200, 7880], [
      new TableRow({
        children: [
          cell('PREA', { width: 2200, fill: isAbuse(t) ? ABUSE_FILL : ALT_FILL, bold: true }),
          cell([new Paragraph({
            children: [txt(t.prea_flag + '. ', { bold: true, size: TYPE.CELL }), txt(t.prea, { size: TYPE.CELL })],
            spacing: { before: 40, after: 40, line: 250 },
          })], { width: 7880, fill: isAbuse(t) ? ABUSE_FILL : undefined }),
        ],
      }),
      new TableRow({
        children: [
          cell('CPS report', { width: 2200, fill: ALT_FILL, bold: true }),
          cell([new Paragraph({
            children: [txt(t.cps_flag + '. ', { bold: true, size: TYPE.CELL }), txt(t.cps, { size: TYPE.CELL })],
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
  h1(data.flips.head),
  block(WARN_FILL, data.flips.items.map((it, i) => new Paragraph({
    children: [txt(it)],
    bullet: { level: 0 },
    spacing: { before: i ? 40 : 60, after: 60, line: 264 },
  }))),
  h1(data.doubt.head),
  p(data.doubt.body),
);
if (data.staff) {
  push(
    new Paragraph({ children: [new PageBreak()] }),
    h1(data.staff.head),
    block(ABUSE_FILL, [new Paragraph({
      children: [txt(data.staff.body)],
      spacing: { before: 60, after: 60, line: 264 },
    })]),
  );
  data.staff.items.forEach((it) => push(
    new Paragraph({ text: it.head, heading: HeadingLevel.HEADING_2 }),
    new Paragraph({
      children: it.body.split(/\*\*(.+?)\*\*/g).map((part, i) => txt(part, { bold: i % 2 === 1 })),
      spacing: { after: 120, line: 276 },
    }),
  ));
}
if (data.ages) {
  // Four rows, and the two middle ones differ only in which resident is the minor.
  // That distinction decides tier 4, so it gets its own row rather than a footnote.
  const A = [2600, 3400, 2600, 3400];
  push(
    new Paragraph({ children: [new PageBreak()] }),
    h1(data.ages.head),
    p(data.ages.body),
    table(A, [
      new TableRow({
        tableHeader: true,
        children: data.ages.columns.map((c, i) => cell(c, { width: A[i], fill: HEAD_FILL, bold: true })),
      }),
      ...data.ages.rows.map((row) => new TableRow({
        children: row.map((c, i) => cell([new Paragraph({
          children: c.split(/\*\*(.+?)\*\*/g).map((part, j) => txt(part, { bold: j % 2 === 1, size: TYPE.CELL })),
          spacing: { before: 40, after: 40, line: 240 },
        })], { width: A[i] })),
      })),
    ]),
    new Paragraph({ text: '', spacing: { after: 120 } }),
    block(WARN_FILL, [new Paragraph({
      children: data.ages.note.split(/\*\*(.+?)\*\*/g).map((part, i) => txt(part, { bold: i % 2 === 1 })),
      spacing: { before: 60, after: 60, line: 264 },
    })]),
  );
}
if (data.mixedage) {
  push(
    new Paragraph({ children: [new PageBreak()] }),
    h1(data.mixedage.head),
    block(ABUSE_FILL, [new Paragraph({
      children: [txt(data.mixedage.body)],
      spacing: { before: 60, after: 60, line: 264 },
    })]),
  );
  data.mixedage.items.forEach((it) => push(
    new Paragraph({ text: it.head, heading: HeadingLevel.HEADING_2 }),
    new Paragraph({
      children: it.body.split(/\*\*(.+?)\*\*/g).map((part, i) => txt(part, { bold: i % 2 === 1 })),
      spacing: { after: 120, line: 276 },
    }),
  ));
}
if (data.prea) {
  push(
    h1(data.prea.head),
    p(data.prea.body),
    ...data.prea.items.map((it) => new Paragraph({
      children: it.split(/\*\*(.+?)\*\*/g).map((part, i) => txt(part, { bold: i % 2 === 1 })),
      bullet: { level: 0 },
      spacing: { after: 80, line: 264 },
    })),
  );
}
if (data.canra) {
  push(
    h1(data.canra.head),
    p(data.canra.body),
    // Bold runs are marked with **...** in the source so the statutory
    // subsections that decide the chart stand out when a supervisor scans it.
    ...data.canra.items.map((it) => new Paragraph({
      children: it.split(/\*\*(.+?)\*\*/g).map((part, i) => txt(part, { bold: i % 2 === 1 })),
      bullet: { level: 0 },
      spacing: { after: 80, line: 264 },
    })),
  );
}
push(
  h1(data.defects.head),
  p(data.defects.body),
);
data.defects.items.forEach((d) => push(
  new Paragraph({ text: d.head, heading: HeadingLevel.HEADING_2 }),
  p(d.body),
));
push(
  h1(data.counsel.head),
  ...data.counsel.items.map((it) => bullet(it)),
);

const doc = new Document({
  features: { updateFields: true },
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: TYPE.BODY, color: INK }, paragraph: { spacing: { line: 276 } } },
      heading1: {
        run: { font: 'Calibri', size: TYPE.H1, bold: true, color: INK },
        paragraph: { spacing: { before: 360, after: 200 } },
      },
      heading2: {
        run: { font: 'Calibri', size: TYPE.H2, bold: true, color: INK },
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
            { size: TYPE.RUNNING, color: MUTED })],
          alignment: AlignmentType.RIGHT, spacing: { after: 120 },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [new TextRun({ children: [PageNumber.CURRENT], size: TYPE.RUNNING, color: MUTED })],
          alignment: AlignmentType.CENTER,
        })],
      }),
    },
    children: body,
  }],
});

// The two views are generated by separate programs in different languages, so
// nothing but this check keeps their section order in step. A reviewer caught
// them diverging once; this makes the next divergence a build failure. The
// order is recorded as each heading is emitted rather than read back out of the
// docx objects, which do not expose their text in any stable way.
const MD = path.join(ROOT, 'drafts', 'SUPERVISOR_GUIDE.md');
if (fs.existsSync(MD)) {
  const mdOrder = fs.readFileSync(MD, 'utf8')
    .split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim());
  const a = mdOrder.join(' | ');
  const b = SECTIONS.join(' | ');
  if (a !== b) {
    console.error('ABORTED. The Markdown and Word views disagree on section order.');
    console.error('  markdown: ' + a);
    console.error('  word:     ' + b);
    process.exit(1);
  }
}

const out = path.join(ROOT, 'deliverables', 'PREA_Supervisor_Decision_Guide.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', path.relative(ROOT, out), buf.length, 'bytes');
});
