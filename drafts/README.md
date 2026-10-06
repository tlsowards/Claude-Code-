# drafts/

Redlines and new policy drafts.

## Redlines for recommended changes 1 to 7

`redlines.json` is the source of truth. `REDLINES.md` and
`deliverables/PREA_Redlines_Changes_1_to_7.docx` are generated views of it, the same
arrangement `prea-register.csv` and the crosswalk use. Edit the JSON, then regenerate:

```
npm run redlines
```

`tools/build_redlines.py` validates the source and writes the Markdown. It aborts rather
than writing if it finds an em dash or an out-of-order item number, because the amendment
language is meant to be pasted straight into departmental orders.
`tools/build_redlines_docx.js` builds the Word file from the same JSON.

Each change carries a **Before adoption** block. Read it first. Five of the seven changes
touch orders that have never been produced to this review, so the struck text in those is
a reconstruction of what the register describes, not a quotation, and the section numbers
need confirming against the PDFs before any of it circulates.

## Supervisor decision guide

`supervisor-guide.json` is the source. `SUPERVISOR_GUIDE.md` and
`deliverables/PREA_Supervisor_Decision_Guide.docx` are generated views. Rebuild with
`npm run supervisor-guide`. Both generators abort on an em dash.

It answers the question line staff actually ask: a youth said or did something sexual to
another youth, is this PREA, and do I have to call CPS. Five conduct tiers, each with the
PREA classification, the CANRA answer, and the required steps.

**It carries a DRAFT status line and must not be issued until County Counsel confirms the
CANRA column.** The hard case is tier 4: intentional touching of an enumerated body area is
unambiguously PREA sexual abuse, while the same conduct between similarly aged detained youth
may not map to any offense enumerated at Penal Code 11165.1. That tension is real, it is
flagged in the document rather than resolved, and it is the reason the guide routes rather
than answers.

## Still to draft

Per CLAUDE.md section 11:

1. New General Order on child abuse and neglect reporting, modelled on the existing
   Dependent Adult and Elder Abuse General Order. Change 3 depends on it, and carries an
   interim in-place correction for use until it issues.
2. Rewritten PREA Policy in 28 CFR part 115 subpart D order.
3. Tier 1 and supervisor lesson plans.
