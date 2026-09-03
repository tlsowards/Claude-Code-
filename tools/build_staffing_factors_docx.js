// Build deliverables/PREA_Staffing_Plan_Factors.docx, a one-page pasteable table
// of the eleven factors at 28 CFR 115.313(a) with what each asks YDF for.
// Standalone: the content is here rather than in the register, because the
// register describes these factors and does not enumerate them.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
} = require('docx');

const ROOT = path.dirname(__dirname);
const CONTENT_W = 10080;
const INK = '1A1A1A', MUTED = '5A5A5A', RULE = 'BFBFBF';
const HEAD_FILL = 'E8E8E8', ALT_FILL = 'F5F5F5', WARN_FILL = 'FCF0DC';

const FACTORS = [
  ['Generally accepted juvenile detention, correctional, or secure residential practices',
   'Benchmarking against professional standards, not only Title 15.'],
  ['Any judicial findings of inadequacy',
   'Consent decrees, court orders, findings in past litigation.'],
  ['Any findings of inadequacy from Federal investigative agencies',
   'DOJ Civil Rights Division, any CRIPA activity.'],
  ['Any findings of inadequacy from internal or external oversight bodies',
   'BSCC inspection findings, the juvenile court judge’s annual inspection, the Juvenile '
   + 'Justice and Delinquency Prevention Commission, the OYCR Ombudsperson, and internal reviews.'],
  ['All components of the facility’s physical plant, including blind spots or areas where '
   + 'staff or residents may be isolated',
   'A walked and documented sightline survey of every unit, with camera coverage mapped against it.'],
  ['The composition of the resident population',
   'Age spread, size and stature, screening results under 15 CCR 1350.5, who is classified where.'],
  ['The number and placement of supervisory staff',
   'Not headcount alone. Where supervisors physically are, by shift.'],
  ['Institution programs occurring on a particular shift',
   'School, visiting, recreation, medical passes. Staffing that works at 0300 does not work '
   + 'during program movement.'],
  ['Any applicable State or local laws, regulations, or standards',
   '15 CCR 1321(h)(1), and the fact that 15 CCR 1301 permits the county to exceed it.'],
  ['The prevalence of substantiated and unsubstantiated incidents of sexual abuse',
   'Departmental incident data by location and shift. Currently blocked: the Internal Affairs '
   + 'six-category disposition taxonomy does not map to the three PREA findings. See register row 81.'],
  ['Any other relevant factors', 'The catch-all.'],
];

// The content above is written by hand rather than generated from the register,
// so nothing else enforces the no-em-dash rule in CLAUDE.md section 1 on it.
// Fail loudly at build time rather than shipping one into a departmental document.
const DASHES = FACTORS.flat().filter((s) => /[\u2014\u2013]/.test(s));
if (DASHES.length) {
  console.error('ABORTED. Em or en dash in the factor text, which CLAUDE.md section 1 forbids:');
  DASHES.forEach((s) => console.error('  ' + s.slice(0, 90)));
  process.exit(1);
}

const txt = (t, o = {}) => new TextRun({ text: String(t), color: INK, ...o });

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
      .reduce((acc, k) => (acc[k] = { style: BorderStyle.SINGLE, size: 2, color: RULE }, acc), {}),
  });
}

const W = [620, 4400, 5060];

const body = [
  new Paragraph({
    children: [txt('The eleven staffing plan factors', { size: 32, bold: true })],
    spacing: { after: 80 },
  }),
  new Paragraph({
    children: [txt('28 CFR 115.313(a). Sacramento County Probation Department, Youth Detention '
      + 'Facility. Register row 5, recommended change 9.', { size: 20, color: MUTED })],
    spacing: { after: 260 },
  }),
  new Paragraph({
    children: [txt('The agency shall develop, document, and make its best efforts to comply on a '
      + 'regular basis with a staffing plan that provides for adequate levels of staffing and, '
      + 'where applicable, video monitoring, to protect residents against sexual abuse. In '
      + 'calculating adequate staffing levels and determining the need for video monitoring, the '
      + 'agency shall take into consideration:')],
    spacing: { after: 180, line: 276 },
  }),
  table(W, [
    new TableRow({
      tableHeader: true,
      children: [
        cell('#', { width: W[0], fill: HEAD_FILL, bold: true }),
        cell('Factor', { width: W[1], fill: HEAD_FILL, bold: true }),
        cell('What it asks YDF for', { width: W[2], fill: HEAD_FILL, bold: true }),
      ],
    }),
    ...FACTORS.map(([factor, ask], i) => new TableRow({
      children: [
        cell(String(i + 1), { width: W[0], fill: i % 2 ? ALT_FILL : undefined }),
        cell(factor, { width: W[1], fill: i % 2 ? ALT_FILL : undefined }),
        cell(ask, { width: W[2], fill: i % 2 ? ALT_FILL : undefined }),
      ],
    })),
  ]),
  new Paragraph({
    children: [
      txt('Then 115.313(b). ', { bold: true }),
      txt('Where the staffing plan is not complied with, the facility shall document and justify '
        + 'all deviations. That is the provision that turns the plan from paper into a record.'),
    ],
    spacing: { before: 240, after: 200, line: 276 },
  }),
  table([CONTENT_W], [new TableRow({
    children: [cell([
      new Paragraph({
        children: [
          txt('Verification. ', { bold: true, size: 20 }),
          txt('The eleven factors are corroborated from two independent searches, including '
            + 'exact-phrase matches against the Cornell, eCFR, and PREA Resource Center listings '
            + 'of the standard. They have not been read from the Code of Federal Regulations '
            + 'itself, because network access to eCFR, Cornell, govinfo, and the PREA Resource '
            + 'Center was unavailable when this was prepared. Confirm the wording and numbering '
            + 'against 28 CFR 115.313(a) before this is adopted into a staffing plan.',
            { size: 20 }),
        ],
        spacing: { before: 60, after: 100, line: 260 },
      }),
      new Paragraph({
        children: [
          txt('Not legal advice. ', { bold: true, size: 20 }),
          txt('Prepared for internal remediation planning. Statutory questions route to County '
            + 'Counsel.', { size: 20 }),
        ],
        spacing: { after: 60, line: 260 },
      }),
    ], { width: CONTENT_W, fill: WARN_FILL })],
  })]),
];

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 21, color: INK }, paragraph: { spacing: { line: 276 } } },
    },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
      },
    },
    children: body,
  }],
});

const out = path.join(ROOT, 'deliverables', 'PREA_Staffing_Plan_Factors.docx');
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', path.relative(ROOT, out), buf.length, 'bytes');
});
