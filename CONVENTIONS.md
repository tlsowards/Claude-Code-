# Working Conventions

Rules that apply to every section in this repo. They are pulled from the recurring
instructions across all three Dropbox handoffs. Read this before starting any section.

## Writing

- **Never use em dashes.** Use commas, colons, parentheses, or restructure the sentence.
- **No invented facts.** If a value is unknown, use a bracketed placeholder and ask.
  Do not guess at course numbers, dates, dollar figures, institution names, contact
  details, or account balances.
- **Verify before asserting.** Check the source system or document, then state the fact.

## Credentials and official systems

- **Never enter a password, never log into banking, never bypass a login.**
  Tim logs into QuickBooks, Stripe, Exchange Bank, the STC Learning Gateway, and the
  OpenGov portal himself. You drive an already-authenticated browser session.
- **Official records get a second look.** Anything that writes to a government or
  financial system of record (a BSCC RFC, a bid submission, a QuickBooks transaction)
  is shown to Tim fully filled in, and submitted only on his explicit approval for that
  specific item.
- **Create, do not destroy.** Do not delete, overwrite, or edit existing certifications
  or reconciled transactions. Recategorize instead of deleting. Reverse anything
  irreversible only with explicit approval.
- **Verify after submitting.** Re-open the record and confirm the expected state before
  reporting done.

## Data handling

This repository is **public**. The source handoffs in Dropbox contain account numbers,
balances, party names tied to dollar amounts, personal addresses, and third-party contact
details. None of that belongs in this repo.

- Keep the Dropbox document as the single source of truth for sensitive values.
- Sections here carry process, guardrails, sequence, and open-item tracking only.
- If you need a specific value, read it from Dropbox at the time you need it. Do not
  copy it into a file here, a commit message, a PR body, or an issue.

## Source of truth

Each section names its Dropbox handoff. That document wins on facts. This repo tracks
what is done, what is open, and how the work runs.
