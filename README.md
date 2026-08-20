# YDF PREA Compliance Project

Sacramento County Probation Department, Youth Detention Facility. PREA policy review,
remediation drafting, and training development.

`CLAUDE.md` is the project memory and is loaded automatically at the start of every
Claude Code session. Read it before doing anything else. Do not run `/init`; it would
overwrite `CLAUDE.md` with a generated one.

## Layout

```
CLAUDE.md            project memory: working rules, findings, verified authorities
prea-register.csv    the working record. 83 requirements, register Revision 3
docs/                the 14 source policy PDFs (not in the repository)
deliverables/        finished work product
drafts/              redlines and new policy drafts
tools/               generators that build deliverables from the register
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

```
npm install          # first run only, installs the docx library
npm run crosswalk
```

`tools/build_crosswalk.py` reads the register and writes the Markdown plus
`tools/crosswalk.json`. `tools/build_crosswalk_docx.js` builds the Word file from
that JSON. Word output, not Excel, per the preference recorded in `CLAUDE.md`.

## Deliverables produced outside this repository

These came from the prior conversation and belong in `deliverables/`. They are not
generated from the register and are not checked in here.

- `YDF_PREA_Policy_Review_Report.docx`, the master document
- `YDF_PREA_Applicability_Memo.docx`
- `YDF_PREA_Liability_Exposure_Assessment.docx`, carries a handling warning
- `YDF_PREA_Training_Gap_and_Curriculum_Plan.docx`
- `YDF_PREA_Audit_Evidence_Request.xlsx`
- `YDF_PREA_Gap_Register_Rev3.xlsx`

## Handling

The liability exposure assessment is candid about departmental weaknesses and is
very likely discoverable as currently prepared. Ask County Counsel to request it in
writing, in anticipation of litigation, so privilege can be asserted, before it
circulates further.

Nothing in this project is legal advice. Statutory questions route to County Counsel.
