// Build deliverables/PREA_versus_Policy_Crosswalk.docx from tools/crosswalk.json.
// Run tools/build_crosswalk.py first to regenerate the JSON from the register.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, PageOrientation, TableOfContents, Header, Footer,
  PageNumber, LevelFormat, convertInchesToTwip,
} = require('docx');

const ROOT = path.dirname(__dirname);
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'crosswalk.json'), 'utf8'));

const CONTENT_W = 10080;           // 12240 page width less two 1080 margins
const STATUS_ORDER = ['Conflict', 'Not Addressed', 'Partial', 'Not Evidenced', 'Addressed'];

const INK = '1A1A1A';
const MUTED = '5A5A5A';
const RULE = 'BFBFBF';
const HEAD_FILL = 'E8E8E8';
const ALT_FILL = 'F5F5F5';
const FLAG_FILL = 'F2DEDE';       // conflicts
const WARN_FILL = 'FCF0DC';       // not addressed

const statusFill = (s) => (s === 'Conflict' ? FLAG_FILL : s === 'Not Addressed' ? WARN_FILL : undefined);

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

// "Label. body text" as a single paragraph, label bold.
function labelled(label, body, opts = {}) {
  return new Paragraph({
    children: [txt(label + ' ', { bold: true }), txt(body)],
    spacing: { after: 120, line: 276 },
    ...opts,
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

const body = [];
const push = (...x) => body.push(...x);

/* ---------------------------------------------------------------- title */

push(
  new Paragraph({
    children: [txt('PREA versus Policy', { size: 44, bold: true })],
    spacing: { before: 1400, after: 100 },
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    children: [txt('A standard-by-standard crosswalk', { size: 28, color: MUTED })],
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
    children: [txt(
      `Gap register Revision ${data.revision}. ${data.total} requirements assessed against 14 departmental policies.`,
      { size: 22, color: MUTED })],
    spacing: { after: 900 }, alignment: AlignmentType.CENTER,
  }),
  table([CONTENT_W], [
    new TableRow({
      children: [cell([
        new Paragraph({
          children: [
            txt('This is not legal advice. ', { bold: true, size: 20 }),
            txt('It is a policy-to-standard comparison prepared for internal remediation '
              + 'planning. Findings state what the documents reviewed contain. Where a '
              + 'requirement is recorded as not addressed, that means no provision appeared '
              + 'in the 14 documents reviewed, not that the practice does not occur. '
              + 'Statutory questions route to County Counsel.', { size: 20 }),
          ],
          spacing: { before: 60, after: 60, line: 260 },
        }),
      ], { width: CONTENT_W, fill: ALT_FILL })],
    }),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

/* ------------------------------------------------------------------ toc */

push(
  new Paragraph({ text: 'Contents', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
  new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-3' }),
  new Paragraph({ children: [new PageBreak()] }),
);

/* --------------------------------------------------------- 1. what this */

push(
  new Paragraph({ text: '1. What this document does', heading: HeadingLevel.HEADING_1 }),
  p('The gap register records, for each requirement, what the department has. This document '
    + 'sets the requirement and the departmental provision next to each other so the '
    + 'divergence is visible on its face, and then inverts the view so each of the 14 '
    + 'reviewed policies can be worked one at a time.'),
  p('Three divergence classes are used throughout.'),
  labelled('Conflict.', 'The policy states a rule, and the rule is wrong. This is the worst '
    + 'class, because staff following policy are out of compliance by doing what they were '
    + 'told. Twelve requirements sit here, and they are set out in full at part 3.'),
  labelled('Not Addressed.', 'The documents reviewed contain no provision on the point. '
    + 'Seventeen requirements sit here. Eleven of them cite no departmental document at all, '
    + 'so they cannot be closed by amendment: they need drafting or an administrative '
    + 'decision.'),
  labelled('Partial.', 'A provision exists and does part of the work. Thirty-nine requirements '
    + 'sit here, and this is where most of the remediation labor is. A partial finding is '
    + 'usually cheaper to close than it looks, because the drafting anchor already exists.'),
  p('Part 4 is the crosswalk in the order an auditor scores. Part 5 is the same findings '
    + 'reorganized by departmental document, which is the order the drafting actually gets '
    + 'done in.'),
  new Paragraph({ children: [new PageBreak()] }),
);

/* ------------------------------------------------------ 2. where diverge */

push(new Paragraph({ text: '2. Where policy and standard diverge', heading: HeadingLevel.HEADING_1 }));

push(new Paragraph({ text: 'By status', heading: HeadingLevel.HEADING_2 }));
push(table([6480, 1800, 1800], [
  new TableRow({
    tableHeader: true,
    children: [
      cell('Status', { width: 6480, fill: HEAD_FILL, bold: true }),
      cell('Count', { width: 1800, fill: HEAD_FILL, bold: true, align: AlignmentType.RIGHT }),
      cell('Share', { width: 1800, fill: HEAD_FILL, bold: true, align: AlignmentType.RIGHT }),
    ],
  }),
  ...STATUS_ORDER.map((s) => new TableRow({
    children: [
      cell(s, { width: 6480, fill: statusFill(s) }),
      cell(String(data.by_status[s]), { width: 1800, align: AlignmentType.RIGHT, fill: statusFill(s) }),
      cell(`${Math.round((data.by_status[s] / data.total) * 100)}%`, {
        width: 1800, align: AlignmentType.RIGHT, fill: statusFill(s),
      }),
    ],
  })),
  new TableRow({
    children: [
      cell('Total', { width: 6480, bold: true }),
      cell(String(data.total), { width: 1800, bold: true, align: AlignmentType.RIGHT }),
      cell('100%', { width: 1800, bold: true, align: AlignmentType.RIGHT }),
    ],
  }),
]));

push(new Paragraph({ text: '', spacing: { after: 240 } }));
push(new Paragraph({ text: 'By priority', heading: HeadingLevel.HEADING_2 }));
push(table([6480, 3600], [
  new TableRow({
    tableHeader: true,
    children: [
      cell('Priority', { width: 6480, fill: HEAD_FILL, bold: true }),
      cell('Count', { width: 3600, fill: HEAD_FILL, bold: true, align: AlignmentType.RIGHT }),
    ],
  }),
  ...Object.entries(data.by_priority).map(([k, v]) => new TableRow({
    children: [
      cell(k, { width: 6480 }),
      cell(String(v), { width: 3600, align: AlignmentType.RIGHT }),
    ],
  })),
]));

push(new Paragraph({ text: '', spacing: { after: 240 } }));
push(new Paragraph({ text: 'By area', heading: HeadingLevel.HEADING_2 }));
push(p('Read the Conflict and Not Addressed columns first. Those are the two classes that '
  + 'cannot be argued away as a documentation gap.'));

const matrixWidths = [3000, 900, 1236, 1236, 1236, 1236, 1236];
push(table(matrixWidths, [
  new TableRow({
    tableHeader: true,
    children: [
      cell('Area', { width: 3000, fill: HEAD_FILL, bold: true }),
      cell('All', { width: 900, fill: HEAD_FILL, bold: true, align: AlignmentType.RIGHT }),
      ...STATUS_ORDER.map((s) => cell(s, {
        width: 1236, fill: HEAD_FILL, bold: true, size: 16, align: AlignmentType.RIGHT,
      })),
    ],
  }),
  ...Object.entries(data.matrix).map(([area, m]) => new TableRow({
    children: [
      cell(area, { width: 3000 }),
      cell(String(m.total), { width: 900, align: AlignmentType.RIGHT }),
      ...STATUS_ORDER.map((s) => cell(m[s] ? String(m[s]) : '', {
        width: 1236,
        align: AlignmentType.RIGHT,
        bold: m[s] > 0 && (s === 'Conflict' || s === 'Not Addressed'),
        fill: m[s] > 0 ? statusFill(s) : undefined,
      })),
    ],
  })),
]));

push(new Paragraph({ children: [new PageBreak()] }));

/* ------------------------------------------------------- 3. conflicts */

push(
  new Paragraph({ text: '3. Class A divergence: policy states the wrong rule', heading: HeadingLevel.HEADING_1 }),
  p('Twelve requirements where a departmental document affirmatively states a rule that '
    + 'contradicts federal or California law, or contradicts another departmental document. '
    + 'These come first because they are the only class where compliant staff behavior '
    + 'produces non-compliance. Each entry names the register row it traces to.'),
);

data.conflicts.forEach((c) => {
  push(new Paragraph({
    text: `Conflict ${c.n}. ${c.topic}`,
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
  }));
  push(new Paragraph({
    children: [txt(`Register row ${c.rows.join(', ')}`, { italics: true, color: MUTED, size: 19 })],
    spacing: { after: 120 },
    keepNext: true,
  }));
  push(table([5040, 5040], [
    new TableRow({
      tableHeader: true,
      children: [
        cell('The law requires', { width: 5040, fill: HEAD_FILL, bold: true }),
        cell('The policy says', { width: 5040, fill: HEAD_FILL, bold: true }),
      ],
    }),
    new TableRow({
      children: [
        cell(c.law, { width: 5040 }),
        cell(c.policy, { width: 5040, fill: FLAG_FILL }),
      ],
    }),
  ]));
  push(new Paragraph({ text: '', spacing: { after: 80 } }));
  push(labelled('Why it matters.', c.note));
  push(labelled('Remediation.', c.fix, { spacing: { after: 300, line: 276 } }));
});

push(new Paragraph({ children: [new PageBreak()] }));

/* ------------------------------------------------------- 4. crosswalk */

push(
  new Paragraph({ text: '4. The crosswalk, requirement by requirement', heading: HeadingLevel.HEADING_1 }),
  p('Grouped by the area an auditor scores. Within an area, worst divergence first. The '
    + 'numbering is the register row, so any entry can be traced straight back to '
    + 'prea-register.csv.'),
);

data.sections.forEach((sec) => {
  push(new Paragraph({ text: sec.area, heading: HeadingLevel.HEADING_2 }));
  sec.rows.forEach((r) => {
    push(new Paragraph({
      text: `${r.id}. ${r.authority}`,
      heading: HeadingLevel.HEADING_3,
      keepNext: true,
    }));
    push(table([2400, 7680], [
      new TableRow({
        children: [
          cell('Status', { width: 2400, fill: HEAD_FILL, bold: true }),
          cell(`${r.status}, ${r.priority} priority`, { width: 7680, fill: statusFill(r.status), bold: r.status === 'Conflict' }),
        ],
      }),
      new TableRow({
        children: [
          cell('Departmental provision', { width: 2400, fill: HEAD_FILL, bold: true }),
          cell(r.county_document, { width: 7680 }),
        ],
      }),
    ]));
    push(new Paragraph({ text: '', spacing: { after: 80 } }));
    push(labelled('The standard requires.', r.requirement));
    push(labelled('Divergence.', r.gap));
    if (r.change_log) {
      push(new Paragraph({
        children: [txt(`Change log: ${r.change_log}`, { italics: true, color: MUTED, size: 19 })],
        spacing: { after: 240, line: 260 },
      }));
    } else {
      push(new Paragraph({ text: '', spacing: { after: 160 } }));
    }
  });
});

push(new Paragraph({ children: [new PageBreak()] }));

/* --------------------------------------------------- 5. policy by policy */

push(
  new Paragraph({ text: '5. The same findings, policy by policy', heading: HeadingLevel.HEADING_1 }),
  p('Part 4 is organized the way an auditor reads. This part is organized the way the work '
    + 'gets done: one document at a time. A requirement that cites more than one document '
    + 'appears under each, so the counts below sum to more than 83.'),
);

data.doc_view.forEach((d) => {
  push(new Paragraph({ text: d.name, heading: HeadingLevel.HEADING_2, keepNext: true }));
  push(new Paragraph({
    children: [txt(`${d.dates}. Cited by ${d.total} requirement${d.total === 1 ? '' : 's'}.`,
      { italics: true, color: MUTED, size: 19 })],
    spacing: { after: 120 },
    keepNext: true,
  }));
  if (d.total === 0) {
    push(p('No requirement in the register turns on this document.'));
    return;
  }
  push(table([2016, 2016, 2016, 2016, 2016], [
    new TableRow({
      tableHeader: true,
      children: STATUS_ORDER.map((s) => cell(s, {
        width: 2016, fill: HEAD_FILL, bold: true, size: 16, align: AlignmentType.CENTER,
      })),
    }),
    new TableRow({
      children: STATUS_ORDER.map((s) => cell(String(d.counts[s]), {
        width: 2016,
        align: AlignmentType.CENTER,
        bold: d.counts[s] > 0 && (s === 'Conflict' || s === 'Not Addressed'),
        fill: d.counts[s] > 0 ? statusFill(s) : undefined,
      })),
    }),
  ]));
  push(new Paragraph({ text: '', spacing: { after: 80 } }));
  if (d.conflicts.length) {
    push(labelled('Conflicts to correct.',
      d.conflicts.map((r) => `row ${r.id} (${r.authority})`).join('; ') + '.'));
  }
  if (d.not_addressed.length) {
    push(labelled('Silent on.',
      d.not_addressed.map((r) => `row ${r.id} (${r.authority})`).join('; ') + '.'));
  }
  push(new Paragraph({
    children: [txt(`All rows: ${d.rows.map((r) => r.id).join(', ')}.`, { color: MUTED, size: 19 })],
    spacing: { after: 260, line: 260 },
  }));
});

if (data.orphans.length) {
  push(new Paragraph({ text: 'No departmental document identified', heading: HeadingLevel.HEADING_2 }));
  push(p(`${data.orphans.length} requirements cite none of the 14 documents reviewed. Eleven `
    + 'record no departmental provision at all and cannot be remediated by amendment: they '
    + 'need drafting or an administrative decision. Two turn on documents that exist but were '
    + 'not produced, rows 14 and 45, and may close on production.'));
  push(table([700, 2400, 1400, 5580], [
    new TableRow({
      tableHeader: true,
      children: [
        cell('Row', { width: 700, fill: HEAD_FILL, bold: true }),
        cell('Authority', { width: 2400, fill: HEAD_FILL, bold: true }),
        cell('Status', { width: 1400, fill: HEAD_FILL, bold: true }),
        cell('Requirement', { width: 5580, fill: HEAD_FILL, bold: true }),
      ],
    }),
    ...data.orphans.map((r) => new TableRow({
      children: [
        cell(String(r.id), { width: 700 }),
        cell(r.authority, { width: 2400 }),
        cell(`${r.status}, ${r.priority}`, { width: 1400, fill: statusFill(r.status) }),
        cell(r.requirement, { width: 5580 }),
      ],
    })),
  ]));
}

push(new Paragraph({ children: [new PageBreak()] }));

/* ------------------------------------------------------------- 6. usage */

push(
  new Paragraph({ text: '6. How to use this against the register', heading: HeadingLevel.HEADING_1 }),
  p('prea-register.csv remains the working record. This document is generated from it by '
    + 'tools/build_crosswalk.py and tools/build_crosswalk_docx.js, so it is a view, not a '
    + 'second source of truth. When a finding changes, edit the CSV, record what changed in '
    + 'the change_log column using the convention already in the file, then regenerate.'),
  p('The owner, target_date, and disposition columns are intentionally empty. Populating them '
    + 'is what turns the register into the corrective action plan, which is the record that '
    + 'matters if anyone asks what the department did after it identified these issues.'),
  labelled('Sequence suggested by this view.',
    'The twelve conflicts at part 3 first, because seven of them are correctable by amendment '
    + 'and all twelve are provisions the department can be shown to have published. Then the '
    + 'eleven requirements with no departmental provision at part 5, because those need '
    + 'drafting lead time. The 39 partials last, since each already has an anchor to amend.'),
);

/* -------------------------------------------------------------- assemble */

const doc = new Document({
  creator: 'Sacramento County Probation Department',
  title: 'PREA versus Policy: a standard-by-standard crosswalk',
  description: `Gap register Revision ${data.revision}`,
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
      heading3: {
        run: { font: 'Calibri', size: 22, bold: true, color: '333333' },
        paragraph: { spacing: { before: 260, after: 100 } },
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
          children: [txt('PREA versus Policy crosswalk. YDF, register Revision '
            + data.revision + '. Not legal advice.', { size: 16, color: MUTED })],
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

const out = path.join(ROOT, 'deliverables', 'PREA_versus_Policy_Crosswalk.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', path.relative(ROOT, out), buf.length, 'bytes');
});
