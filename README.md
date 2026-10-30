# YDF PREA Compliance Project

Sacramento County Probation Department, Youth Detention Facility. PREA policy review,
remediation drafting, and training development.

`CLAUDE.md` is the project memory and is loaded automatically at the start of every
Claude Code session. Read it before doing anything else. Do not run `/init`; it would
overwrite `CLAUDE.md` with a generated one.

## Layout

```
CLAUDE.md            project memory: working rules, findings, verified authorities
prea-register.csv    the working record. 91 requirements, register Revision 11
docs/                the 17 source policy documents (not in the repository)
deliverables/        finished work product
drafts/              redlines and new policy drafts, generated from redlines.json
tools/               generators that build deliverables from the register and the redline source
```

## The register is the source of truth

`prea-register.csv` is the working record. Everything in `deliverables/` that is
generated is a view of it, not a second source of truth.

When a finding changes: edit the CSV, write what changed into the `change_log`
column using the convention already in the file, update the counts in `CLAUDE.md`
section 3, then regenerate.

The `owner`, `target_date`, and `disposition` columns are intentionally empty and
are for the department to fill. Populating them turns the register into the
corrective action plan, which is the record that matters if anyone asks what the
department did after it identified these issues.

## Generated deliverables

| Output | Built by |
|---|---|
| `deliverables/PREA_Briefing_Package.docx` | `npm run package` |
| `drafts/BRIEFING_PACKAGE.md` | same, Markdown working copy |
| `deliverables/PREA_Briefing_Package_Complete.pdf` | `npm run package-pdf` |
| `deliverables/OO_1453_Tracked_Changes.docx` | `npm run tracked-1453` |
| `deliverables/OO_1352_Tracked_Changes.docx` | `npm run tracked-1352` |
| `deliverables/OO_1352_5_Citations_and_Actions.docx` | `npm run described-1352-5` |
| `deliverables/PREA_Management_Brief.docx` | `npm run brief` |
| `drafts/MANAGEMENT_BRIEF.md` | same, Markdown working copy |
| `deliverables/PREA_versus_Policy_Crosswalk.docx` | `npm run crosswalk` |
| `deliverables/PREA_versus_Policy_Crosswalk.md` | same, Markdown source of the above |
| `deliverables/PREA_Redlines_Changes_1_to_7.docx` | `npm run redlines` |
| `drafts/REDLINES.md` | same, Markdown working copy |
| `deliverables/PREA_Staffing_Plan_Factors.docx` | `npm run staffing-factors` |
| `deliverables/PREA_Supervisor_Decision_Guide.docx` | `npm run supervisor-guide` |
| `drafts/SUPERVISOR_GUIDE.md` | same, Markdown working copy |
| `deliverables/PREA_Supervisor_Field_Card.docx` | `npm run field-card` |
| `drafts/FIELD_CARD.md` | same, Markdown working copy |
| `deliverables/PREA_Supervisor_Memo_Template.docx` | `npm run memo-template` |
| `drafts/MEMO_TEMPLATE.md` | same, Markdown working copy |

```
npm install          # first run only, installs the docx library
npm run package      # the cover; run the attachment builds first
npm run package-pdf  # renders the whole package into one PDF
npm run brief
npm run crosswalk
npm run redlines
npm run staffing-factors
npm run supervisor-guide
```

`tools/build_crosswalk.py` reads the register and writes the Markdown plus
`tools/crosswalk.json`. `tools/build_crosswalk_docx.js` builds the Word file from
that JSON. Word output, not Excel, per the preference recorded in `CLAUDE.md`.

The redlines work the same way from a different source. `drafts/redlines.json` holds the
amendment language for recommended changes 1 to 7; the Markdown and the Word file are
regenerated from it, not hand edited. `tools/build_redlines.py` aborts rather than writing
if it finds an em dash or an out-of-order item number.

All four Word builders share one type scale, `tools/docx_style.js`: body and table text
at 12pt, headings from 14pt up, per the standing preference in `CLAUDE.md` section 14.
It fails the build if an edit drops below those floors, so font sizes live there rather
than as literals in the builders.

Rebuilding a Word file with no source change still produces a few different bytes,
because the zip container carries timestamps. A `deliverables/*.docx` diff on its own
means nothing; check the Markdown view or `tools/crosswalk.json`, which are
byte-stable, before concluding that content moved.

The contents page is a Word field, so page numbers are computed by Word rather
than written into the file. The document asks Word to refresh its fields on open.
If the contents page still looks empty or stale, click in it and press F9.

The memo template is the third view of that same source. `npm run memo-template` **fails
the build** if the classification options it offers a supervisor stop matching the
categories the tier chart uses, because a memo that lets someone tick a box the chart
does not recognise would quietly reintroduce the misclassification the chart exists to
prevent.

The briefing package is the cover for a handover: what the package is, what the department
is being asked to decide, and a tab by tab schedule of what is attached. It is a
transmittal, not a second brief, so the reasoning stays in the management brief at
Attachment A. Two guards sit behind it.

`npm run package` **fails the build** if the attachment schedule and the `deliverables/`
directory disagree in either direction, or if the tab letters skip or repeat. A schedule
listing a document that is not in the package, or a document in the package that the
schedule does not mention, is the error a reader cannot recover from: it makes them
distrust the rest of the binder. The cover also reads its What we need list out of
`drafts/management-brief.json` rather than restating it, so the two cannot come to
disagree about what is being asked for. The no-dash rule covers that borrowed list as
well as the cover's own text. It did not at first, so a dash in an ask passed the Markdown
build and aborted the Word one, leaving the two views of the same cover saying different
things. A guard that checks only the file it lives in is not checking the document it
produces.

`npm run package-pdf` renders the cover and every attachment with LibreOffice and merges
them into one bookmarked PDF, in schedule order. It runs **more than once on purpose**: a
start page cannot be printed in the schedule until the attachments have been rendered, and
rebuilding the cover to carry those numbers can change the cover's own length, which moves
every number it just printed. Each pass writes what it measured, rebuilds the cover, and
renders again, until a pass measures what the cover already says. Convergence is checked
rather than assumed, and if it has not settled after four passes nothing is written and the
mismatch is printed. Stale pagination is also dropped rather than printed, since a contents
page pointing at the wrong document is worse than one with no page numbers at all.

Two orders carry their proposed amendments as **real Word tracked changes**, `w:ins` and `w:del`
with `w:delText`, so the department opens the file in Word and accepts or rejects each change.
These are the only deliverables meant to be edited in Word rather than regenerated.

They are deliberately different shapes, and the guards enforce the difference. **OO 1453 is the
whole order**, because its PDF was re-read and all fifteen paragraphs are held; its build refuses
unless the provenance statement claims the base text is the order's own words. **OO 1352 is the
provisions that change only**, because its PDF did not survive the container it was read in and
only the quoted provisions remain; its build refuses unless `complete` is false and the document
says what is not reproduced. Most importantly, **a provision marked as described rather than quoted
cannot carry a redline at all**: showing struck text for wording nobody captured would be inventing
the department's policy and marking it up, which is the one thing this format must never do. Such a
provision prints the required action instead.

The management brief is the short view of the **register**, written for managers rather
than for an auditor: where the exposure is, how the liability runs, and what is blocked on
a decision rather than on more analysis. It carries no findings of its own, so every
exposure item names the register rows it rests on. `npm run brief` **fails the build** if
one of those rows does not exist, or has since been scored Addressed, because the finding
it was written around has then been cured. It also fails if the register grows a status or
priority value the brief does not know how to order, which is the case where a new scoring
category would otherwise be silently dropped from the counts.

The field card is the short view of the supervisor guide and is built from the **same**
`drafts/supervisor-guide.json`, not a trimmed copy of the Word file. `npm run field-card`
**fails the build** if the card and the guide disagree about how many tiers there are, how
they are numbered, whether a tier is sexual abuse, or whether its CPS answer is yes. A field
card that contradicts the guide is worse than no field card, and a hand-trimmed copy of a
generated document cannot be kept honest by anything.

The card is **one sheet, printed double sided**, and two further guards keep it that way.
It had grown to six steps plus a ten role matrix and an eight phase response sequence,
which is four pages and not a card. Those now live in the Decision Guide, and both builders
fail if a sixth step appears or if either of them is moved back under the `field` block. The
card also carries one compact line per block of the action list the guide spells out in
full, and the build fails if those lines stop matching the blocks they summarise, the same
arrangement and the same reason as the tier chart.

Two more guards exist for the same reason, both added after the bug they catch had
already shipped. `tools/build_supervisor_guide_docx.js` fails the build if any table's
column widths do not sum to the content width, because a table wider than the page
looks fine in the Markdown view and runs off the edge in Word. And
`tools/build_crosswalk.py` carries a `"checked"` stamp on each entry of its hardcoded
`CONFLICTS` narratives and **fails the build** when any of them is older than
`REVISION`. That prose is a second source of truth no register migration can reach,
and it has gone stale twice. Nothing can derive it, so the only honest control is to
stop the build until someone has re-read each entry against the register and said so.

`npm run crosswalk` also checks the Layout block above against the register and the
builder's `REVISION`, and **fails the build** if the row count or the revision number
there has gone stale. That line sat at "91 requirements, register Revision 10" through
three revisions and four review rounds before anyone noticed, because no generator
touches this file. Now one does.

The generator prints a warning if any register row has neither a 28 CFR nor a
California citation, since that usually means a CSV edit blanked a column rather
than that the requirement has no authority. A clean run prints no warning.

## Deliverables produced outside this repository

These came from the prior conversation and belong in `deliverables/`, but they are
not committed: see the handling note below. They are not generated from the register,
so they do not update when it does. The master report reflects Revision 3 and predates
every revision since, so it understates what is known by a widening margin. Treat the
register and the generated crosswalk as current and the report as historical.

- `YDF_PREA_Policy_Review_Report.docx`, the master document
- `YDF_PREA_Applicability_Memo.docx`
- `YDF_PREA_Liability_Exposure_Assessment.docx`, carries a handling warning
- `YDF_PREA_Training_Gap_and_Curriculum_Plan.docx`
- `YDF_PREA_Audit_Evidence_Request.xlsx`
- `YDF_PREA_Gap_Register_Rev3.xlsx`

## Handling

**Do not commit source policy documents or the prior deliverables.** `.gitignore`
enforces this. The register and the views generated from it are what this repository
carries. Source county records stay on departmental systems.

The liability exposure assessment is candid about departmental weaknesses and is
very likely discoverable as currently prepared. Ask County Counsel to request it in
writing, in anticipation of litigation, so privilege can be asserted, before it
circulates further. The same reasoning applies to where this repository lives: a
gap register is an itemized account of known compliance failures, and its location
and access controls are part of how it will be characterized later.

Nothing in this project is legal advice. Statutory questions route to County Counsel.
