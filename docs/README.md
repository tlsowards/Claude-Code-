# docs/

The 17 source policy documents go here. They are not in the repository.

Keep the original filenames or rename them to match the numbering in CLAUDE.md
section 4. Claude Code reads PDFs directly, so a citation can be checked against
the source rather than trusted from a summary.

One caveat on extraction. Most of these PDFs carry a text layer and can be read
straight through. `1390-1391-discipline.pdf` does not: it is a scan, and text
extraction returns nothing. Rasterize its pages to images and read those instead.
If an extraction comes back empty or near-empty, that is the reason, and an empty
extraction must never be read as an empty policy.

Nothing in this project should assert what a policy says without the PDF being
readable here or the assertion being traceable to `prea-register.csv`.

## title15-bscc-juvenile.pdf

BSCC, Minimum Standards for Juvenile Facilities, Title 15, **rev. 04/01/2014**.

This is the edition the department produced. It predates the January 2019 rewrite and
therefore contains no section 1350.5, 1352.5, or 1354.5, and the word "PREA" does not appear
in it. It was read in full for the Revision 5 verification pass. What it does and does not
confirm is recorded in `CLAUDE.md` section 7. The current edition is still outstanding.
