# Section 03: California FOP Treasurer Work

| | |
|---|---|
| **Source handoff** | `Dropbox/CA FOP/HANDOFF - FOP Treasurer Work (Claude).md` |
| **Handoff written** | week of 2026-08-17 |
| **Role** | Dr. Tim Sowards, Treasurer, California FOP |
| **Systems** | QuickBooks Online (two companies), Stripe, Exchange Bank |
| **Status** | Active. Chase items are time-sensitive as of the weekend of 2026-08-22. |

> **Sensitive section.** Account numbers, balances, the Stripe account identifier, lodge
> and sponsor names tied to dollar amounts, and people's contact details stay in the
> Dropbox handoff and the source workbooks. Do not copy them into this repo, a commit
> message, a PR, or an issue. Read them from Dropbox when you need them.

## Objective

Continue the treasurer work without re-deriving context: chase the outstanding dues and
sponsorship money, keep the two sets of books clean and separate, and keep the year-end
reporting accurate.

## Guardrails

See `../../CONVENTIONS.md`. Section-specific:

- **Never enter banking credentials and never log into banking.** Tim logs into
  QuickBooks, Stripe, and the bank himself. You drive the browser after he is logged in.
- **Never delete or carelessly edit reconciled transactions.** Recategorize, meaning
  change the income or expense account, rather than delete. Un-reconcile only with Tim's
  explicit approval. His stated concern, in his words: "every time I try to delete it, it
  messes stuff up." Respect that.
- **Confirm which entity you are in before pulling any number.**
- **Report format:** lead with operating income versus expenses. Keep non-cash investment
  gains separate.

## Entity structure

Two **separate** QuickBooks companies. Do not conflate them.

| Entity | What it holds |
|---|---|
| **California Fraternal Police Foundation** | Charitable arm: the annual fundraiser, survivor and member donations. |
| **California State Lodge Fraternal Order of Police** | The general fund that runs the organization: dues, PAC, conferences, officer stipends, the President's Meeting, the Biennial Conference. Also holds the one credit card. |

Each has its own bank account. Account numbers are in the handoff.

**Fiscal year runs July 1 to June 30.** FY25-26 closed 6/30/2026 and is the year the
annual report decks cover. Current year is FY26-27.

**Stripe** is a single account collecting sponsor, exhibitor, and event registration
payments for **both** entities. Two things follow from that and explain most of the
reconciliation pain:

1. Stripe charges the payer the tier price plus the card fee, so a tier amount never
   matches the deposit exactly.
2. Stripe pays out in **lumped ACH batches** that mix multiple payments together, which
   is why QuickBooks cannot itemize a Stripe deposit by sponsor.

## QuickBooks browser quirks

These cost real time. Check them before assuming a bug is something else.

- The Chart of Accounts text-search filter sticks on the prior term. Fix: triple-click the
  box, press Backspace, then type the new term.
- The Bank Deposit form intermittently loads with the bank-account field blank, showing
  "Choose an account." **Do not save in that state.** Saving would wipe the bank account
  off a reconciled deposit. Reopen the form, or wait until the correct account name
  appears, then edit.
- Report drill-downs sometimes throw "This info isn't available right now." Hit the
  refresh icon and retry.

## Established findings, do not re-derive

- **Per-capita split.** The QuickBooks per-capita membership account holds **state**
  per-capita only. National per-capita is a separate expense account. This was confirmed
  by matching the QuickBooks cycle total to the state column of the tracking sheet rather
  than to state plus national.
- **Dues tie out.** Per-capita net for FY25-26 matches the dues figure on the deck
  exactly. Totals tie within about 2 percent. The remaining variance is
  **returned and bounced ACHs**, not miscoding.
- **Sponsor money was scattered** across the President's Meeting income account, the
  conference account (booked as offsets), and batched Stripe deposits. That is why
  nothing tied cleanly.
- **A new "Sponsorship Income" account** (type Income, detail Non-Profit Income) was
  created in the general fund books, starting FY26-27. Prior-year sponsorships were left
  where they were, per Tim: start it this fiscal year.
- **Current-year biennial sponsorship deposits** were moved into Sponsorship Income and
  tagged in the description. Batched Stripe conference deposits were **left** in the
  conference account because they mix sponsor dollars with flat-rate registrations and
  cannot be split in QuickBooks.
- **The inter-company repayment to the Foundation cleared**, settling the amount due
  between the two entities in FY26-27. Bank cleared balance matched QuickBooks.

## Open work

### Dues and bounced ACHs

- [ ] **Confirm the large returned draft re-cleared.** It bounced in late July and the
      re-draw was expected Thursday 8/20. Verify against the bank. If it did not clear,
      this is a real gap, not a timing issue.
- [ ] **Two lodges are bouncing a second time.** One returned with a stopped-payment
      code, one with an account-closed code. Neither will clear by re-drawing. Both need
      to be converted to checks. Decide the approach with Tim and make the ask.
- [ ] **Older returns** across several lodges, plus a prior-cycle return being re-drawn in
      pieces, are itemized in the handoff table. Work them after the two above.
- [ ] **Book the per-capita item that was collecting** on the failed account number once
      it clears the bank, and clear the related expense and deposit wash pairs.

Master tracker: the per-capita tracking workbook in the CA FOP Dropbox folder, split by
lodge into first half, last half, and supplementals, with separate state and national
columns.

### Sponsorships

- [ ] **Four sponsors are marked paid on the exhibitor sheet but have no payment in
      QuickBooks or Stripe.** This was researched, not assumed. Two of the four have no
      footprint in either system at all and need direct follow-up first. Treat all four
      as pending checks.
- [ ] **Three more are already showing unpaid** on the sheet. One of them paid for a board
      lunch rather than the sponsorship tier and may still come through.
- [ ] **Correct the exhibitor sheet:** flip the four from paid to pending, and note the
      one sponsor showing blank who did in fact pay, just for the other event.

Roughly $17,000 is outstanding against the sheet in total. Per-sponsor names and amounts,
including the list of ten confirmed-paid sponsors not to chase, are in the handoff.

### Parked, lower priority

- [ ] **Officer stipend accounts payable cleanup.** Bank-matched stipend bill payments
      with no open bill to apply to, netting to real cash. Untangle carefully with Tim,
      or hand it to the CPA firm.
- [ ] **Vendor de-duplication**, roughly 2,500 vendor records with several lodge merges
      pending. QuickBooks merge procedure: rename the duplicate to **exactly** the
      keeper's name, then confirm the potential-duplicate prompt.
- [ ] **Going forward:** code new sponsorships to Sponsorship Income, and when a Stripe
      deposit lands, split it so sponsor dollars go to Sponsorship Income and flat-rate
      registrations go to the conference or registration line.

## Year-end decks

Two decks for FY25-26, one per entity, live in the CA FOP Dropbox folder. The general fund
deck carries a refreshed balance sheet after a credit-card cleanup, a corrected
President's Meeting budget line on the plan versus result slide, and a
**new Events and Sponsorships slide** added as the fifth slide, with a footnote covering
money that arrived after the fiscal year closed.

Deck style, if you build or edit slides:

| Element | Spec |
|---|---|
| Slide size / layout | 13.333 x 7.5 in, Blank layout |
| Eyebrow | Cambria 12.5 bold, gold `C8A34A` |
| Title | Cambria 32 bold, navy `1B2A4A` |
| Cards | Rounded rectangle, fill `F4F6F9` |
| Event headers | Green `2E7D5B` |
| Total bar | Rounded rectangle navy `142340`, gold `E6CF8E` label, white Cambria amount |
| Body text | Gray `6C7482` |

The builder scripts from the prior session were scratchpad only and are not in Dropbox.
Rebuild them if slide work resumes.

## Suggested first moves

1. Confirm the large re-draw cleared.
2. Decide how to pursue the two lodges bouncing on a closed account and a stopped payment,
   most likely by requesting checks.
3. Follow up on the four pending sponsor checks, starting with the two that have no
   footprint in any system.
4. Update the exhibitor sheet: four from paid to pending, plus the one correction the
   other way.
