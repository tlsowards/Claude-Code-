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
