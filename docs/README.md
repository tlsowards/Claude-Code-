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
confirm is recorded in `CLAUDE.md` section 7.

Superseded for verification purposes by `title15-bscc-juvenile-2019.pdf`. Keep it: the
04/01/2014 text is what establishes that 1352(e) has been in force since at least that date,
which is what makes the S-8 chronology finding what it is.

## title15-bscc-juvenile-2019.pdf

BSCC, Minimum Standards for Juvenile Facilities, Title 15, **effective 01/01/2019**. The
post-rewrite edition. Read in full.

Contains 1350.5, 1352.5, and 1354.5, so all eight citations that Revision 5 had to carry
forward unconfirmed are now confirmed to exist. Two cautions for anyone reading it here.
First, the section headers for 1352.5 and 1354.5 print **without a period after the number**,
so a regex expecting `§ 1352.5.` will miss them and report a false negative. Match on the
title instead. Second, two subsections were renumbered from the 2014 edition: the
non-discrimination provision moved from 1324(h) to **1324(k)**, and the due process elements
for major rule violations moved from 1391(e) to **1391(f)**.

The word "PREA" does not appear in this edition either, and neither does any facility audit
requirement. The only "audit" hits are section 1403, health care monitoring and audits.

## prea-public-law-108-79.pdf

The Prison Rape Elimination Act of 2003, Public Law 108-79, 117 Stat. 972, as enacted.
The statute, not the standards: it does not contain 28 CFR part 115 and cannot be used to
verify any standard. Section 8 has only subsections (a), (b), and (c), so the 5 percent
grant provision is **section 8(c)(2)**, codified at 34 U.S.C. 30307(c)(2).

## Applied in Revision 6

`title15-bscc-juvenile-2019.pdf` and `prea-public-law-108-79.pdf` have been worked into the
register. Revision 6 confirmed all eight previously unconfirmed citations, corrected three
that the 2019 rewrite renumbered (1324(h) to **1324(k)**, 1391(e) to **1391(f)**, and
34 U.S.C. 30307(e)(2) to **30307(c)(2)**), and quoted the confirming text into the rows.

Because `docs/` is gitignored and does not survive a new container, **the quotations are now
the durable record**, not these PDFs. A future session that needs to re-verify has to have the
source uploaded again. That is the reason Revision 6 quoted the text into the register instead
of merely recording that it had been checked.

**Revision 7 closed that gap.** The 2019 edition was re-produced and the six outstanding
sections were re-read against it: 1301, 1321, 1354, 1390, 1452 and 1453, along with the full
text of 1391(f). No Title 15 citation in the register now rests on the 2014 edition alone.

Two findings from that pass. 1391(f) has **six** elements, the sixth being provision for
administrative review, which clears the truncation flag raised after Revision 6. And 1390's
deprivation floor runs (a) to **(k)**, eleven items, with (k) being rehabilitative programming,
which corrects a credit Revision 5 had given OO 1390/1391 for exceeding the floor.
