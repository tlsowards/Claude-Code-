# YDF PREA Compliance Project

Sacramento County Probation Department, Youth Detention Facility. PREA policy review,
remediation drafting, and training development.

`CLAUDE.md` is the project memory and is loaded automatically at the start of every
Claude Code session. Read it before doing anything else. Do not run `/init`; it would
overwrite `CLAUDE.md` with a generated one.

## Layout

```
CLAUDE.md            project memory: working rules, findings, verified authorities
prea-register.csv    the working record. 83 requirements, register Revision 5
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
| `deliverables/PREA_versus_Policy_Crosswalk.docx` | `npm run crosswalk` |
| `deliverables/PREA_versus_Policy_Crosswalk.md` | same, Markdown source of the above |
| `deliverables/PREA_Redlines_Changes_1_to_7.docx` | `npm run redlines` |
| `drafts/REDLINES.md` | same, Markdown working copy |
| `deliverables/PREA_Staffing_Plan_Factors.docx` | `npm run staffing-factors` |

```
npm install          # first run only, installs the docx library
npm run crosswalk
npm run redlines
npm run staffing-factors
```

`tools/build_crosswalk.py` reads the register and writes the Markdown plus
`tools/crosswalk.json`. `tools/build_crosswalk_docx.js` builds the Word file from
that JSON. Word output, not Excel, per the preference recorded in `CLAUDE.md`.

The redlines work the same way from a different source. `drafts/redlines.json` holds the
amendment language for recommended changes 1 to 7; the Markdown and the Word file are
regenerated from it, not hand edited. `tools/build_redlines.py` aborts rather than writing
if it finds an em dash or an out-of-order item number.

The contents page is a Word field, so page numbers are computed by Word rather
than written into the file. The document asks Word to refresh its fields on open.
If the contents page still looks empty or stale, click in it and press F9.

The generator prints a warning if any register row has neither a 28 CFR nor a
California citation, since that usually means a CSV edit blanked a column rather
than that the requirement has no authority. A clean run prints no warning.

## Deliverables produced outside this repository

These came from the prior conversation and belong in `deliverables/`, but they are
not committed: see the handling note below. They are not generated from the register,
so they do not update when it does. The master report reflects Revision 3 and predates
the three documents assessed in Revision 4, so it now understates what is known.

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
