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

## Still to draft

Per CLAUDE.md section 11:

1. New General Order on child abuse and neglect reporting, modelled on the existing
   Dependent Adult and Elder Abuse General Order. Change 3 depends on it, and carries an
   interim in-place correction for use until it issues.
2. Rewritten PREA Policy in 28 CFR part 115 subpart D order.
3. Tier 1 and supervisor lesson plans.
