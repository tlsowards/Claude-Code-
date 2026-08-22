# Claude Code Work Sections

Working sections for the active Claude Code handoffs found in Dropbox. Each section is a
self-contained brief: what the work is, the rules that govern it, the sequence to run, and
a live checklist of what is still open.

The Dropbox handoff named in each section is the **source of truth for facts and values**.
These sections carry process and state.

## Start here

Read [`CONVENTIONS.md`](CONVENTIONS.md) before any section. It holds the rules that repeat
across all of them: no em dashes, no invented facts, never enter credentials or log into a
system of record, create rather than destroy, and verify after submitting.

## Sections

| # | Section | Domain | Source handoff | Status |
|---|---|---|---|---|
| 01 | [STC Portal Submission](sections/01-stc-portal-submission/) | Course certification, BSCC STC Learning Gateway | `Sowards Training Courses/STC_Portal_Submission_HANDOFF.md` | Active. One course ready to submit on approval. |
| 02 | [San Mateo County RFP](sections/02-san-mateo-county-rfp/) | Competitive proposal, county probation training contract | `Consulting/San Mateo County/HANDOFF_TO_CLAUDE_CODE.md` | Submission deadline has passed. Confirm outcome, then interview prep. |
| 03 | [CA FOP Treasurer](sections/03-ca-fop-treasurer/) | Nonprofit bookkeeping, dues and sponsorship reconciliation | `CA FOP/HANDOFF - FOP Treasurer Work (Claude).md` | Active. Time-sensitive chase items. |

Section 01 is the course-build line of work. Sections 02 and 03 are the other two Claude
Code handoffs that exist in Dropbox as of 2026-08-22.

## Data handling

**This repository is public.** The source handoffs contain account numbers, balances, a
payment processor account identifier, party names tied to dollar amounts, a home address,
a federal entity identifier, and third-party contact details. None of that is reproduced
here, by design. Sections describe the work and point to Dropbox for the values.

Keep it that way when adding to a section: no figures tied to named parties, no account
identifiers, no personal contact details, in files or in commit messages.

## Adding a section

1. Create `sections/NN-short-name/README.md`.
2. Open with the metadata table: source handoff, date written, owner, systems of record,
   status.
3. State the objective in one paragraph, then hard prerequisites, then guardrails
   (reference `CONVENTIONS.md`, add only what is specific to this work).
4. Give the operating procedure as a numbered sequence someone can follow cold.
5. Track open work as checkboxes, grouped, most time-sensitive first.
6. Record judgment calls already made so a later session does not reverse them.
7. Add a row to the table above.
