# CAFOP executive travel reimbursement — rate basis

Reference for the figures hard-coded in [`forms/cafop-executive-reimbursement-form.html`](../forms/cafop-executive-reimbursement-form.html).
Two of these change on a fixed calendar, so the review dates below matter.

## Meals & incidentals (per diem)

A **CAFOP board-set rate**, paid per day without receipts.

| Item | Amount |
| --- | --- |
| Meals & incidentals, full day | **$85.00** |
| First and last day of travel (75%) | **$63.75** |
| Breakfast deduction, if provided | $20.00 |
| Lunch deduction, if provided | $23.00 |
| Dinner deduction, if provided | $37.00 |
| Incidentals (never deducted) | $5.00 |

A meal furnished by the host, conference, or another party is deducted at the
amounts above; the $5 incidentals allowance stays payable. The meal components
sum to $80 and, with incidentals, to the $85 daily rate.

### Tax treatment — read before adopting

The federal per diem rate for meals and incidentals is **$68.00/day** (GSA
standard CONUS, FY2026). CAFOP's $85.00 rate exceeds it by **$17.00 per day**.

Under an accountable plan, per diem paid at or below the federal rate is not
wages and is not reported. **The excess over the federal rate is treated as
taxable income** to the member unless the full amount is substantiated with
actual receipts. Practically, the association has three options:

1. Pay $85/day and report the $17/day excess as taxable compensation on the
   member's Form W-2 or 1099.
2. Pay $85/day but require receipts for meals, converting it from a per diem
   into an actual-cost reimbursement.
3. Drop to $68/day, at which point nothing is reportable.

This is a board and treasurer decision, not a form decision — the form pays
$85/day as configured either way. Confirm the handling with whoever prepares
CAFOP's information returns before the first claim is paid.

## Lodging

Reimbursed at **actual cost. There is no nightly ceiling.** Taxes and mandatory
fees are reimbursed in addition to the room rate. An itemized folio showing a
zero balance is required; members should book the conference room block where
one is offered.

Because lodging is reimbursed against actual receipted cost, it stays inside an
accountable plan and is not reportable as income at any dollar amount — the tax
concern above applies to the flat meal per diem, not to lodging.

## Mileage — personal vehicle

The IRS standard business mileage rate is set by the calendar year and changed
mid-year in 2026:

| Period | Rate |
| --- | --- |
| 1 Jan 2026 – 30 Jun 2026 | **72.5¢ / mile** |
| 1 Jul 2026 – 31 Dec 2026 | **76.0¢ / mile** |

The applicable rate follows **the date the driving occurred**, not the date the
claim is submitted — so a claim filed in August for a June trip is paid at 72.5¢.
The form selects the rate from the date entered on each mileage leg.

### On the 100 / 200 mile question

Neither the IRS nor GSA varies the per-mile rate by trip distance. There is no
federal tier at 100 miles, at 200 miles, or anywhere else — the rate is flat.

What the federal rules *do* contain is a **constructive cost** test: when driving
is not the most advantageous method of travel, reimbursement is limited to what
the government would have paid for common carrier. CAFOP policy on this form
implements that as three distance bands:

| Round-trip distance | Treatment |
| --- | --- |
| **0 – 100 miles** | Full IRS rate. No comparison, no justification. |
| **101 – 200 miles** | Full IRS rate. State the business reason for driving in the notes. |
| **Over 200 miles** | Full IRS rate, but the payable amount is capped at the **lesser of** mileage or a comparable coach airfare plus airport ground transport. |

The band is a policy choice, not a legal requirement — the thresholds are set in
one place at the top of the form's script (`REVIEW_MI`, `LONG_TRIP_MI`) if the
board wants different numbers. The economics behind 200: at 76¢, a 200-mile round
trip reimburses $152, which is roughly where a discounted in-state coach fare
starts to compete.

Note what the cap does and does not do. A member may always choose to drive; only
the reimbursement is limited. Driving time, checked bags, and carrying materials
to the event are legitimate reasons the comparison can be waived — record the
reason in the notes and have the approver initial it.

## Review schedule

| Date | What changes |
| --- | --- |
| Late Aug 2026 | GSA publishes FY2027 per diem. CAFOP sets its own meal rate and caps no lodging, so nothing on the form changes — but the FY2027 federal M&IE figure is the number the $85 rate is measured against for the taxable excess, so record it. |
| Mid-Dec 2026 | IRS publishes the 2027 standard mileage rate; add it to the `MILEAGE` table. |

Rates live in one block near the top of the form's `<script>`:

```js
var MIE = 85, MIE_PARTIAL = 63.75;
var MEAL = { b:20, l:23, d:37 };
var LONG_TRIP_MI = 200, REVIEW_MI = 100;
var MILEAGE = [ { from:"2026-07-01", rate:0.76, label:"76.0¢" }, … ];
```

Add new mileage rates to the front of the `MILEAGE` array, newest first; the
form matches the first entry whose `from` date is on or before the date driven,
so past-year claims keep paying the correct historical rate. Also update the
rate card near the top of the markup, which is written out in plain text.

## Sources

- IRS, 2026 standard mileage rates (72.5¢ from 1 Jan 2026; raised to 76¢ from 1 Jul 2026, announced 13 Jul 2026)
- GSA, FY2026 CONUS per diem rates ($68 M&IE, effective 1 Oct 2025), Per Diem Bulletin FTR 26-01 — the federal benchmark the $85 board rate is measured against
- IRS Publication 463 / accountable plan rules, on per diem paid above the federal rate
- Federal Travel Regulation, constructive-cost rule for privately owned vehicle use
