# CAFOP executive travel reimbursement — rate basis

Reference for the figures hard-coded in [`forms/cafop-executive-reimbursement-form.html`](../forms/cafop-executive-reimbursement-form.html).
Two of these change on a fixed calendar, so the review dates below matter.

## Meals & incidentals (per diem)

The **GSA standard CONUS rate** — the federal default for any location without
its own published rate. Paid per day, no receipts required.

| Item | Amount |
| --- | --- |
| M&IE, full day | **$68.00** |
| M&IE, first and last day of travel (75%) | **$51.00** |
| Breakfast deduction, if provided | $16.00 |
| Lunch deduction, if provided | $19.00 |
| Dinner deduction, if provided | $28.00 |
| Incidentals (never deducted) | $5.00 |

Effective 1 Oct 2025 – 30 Sep 2026 (federal FY2026). A meal furnished by the
host, conference, or another party is deducted at the amounts above; the $5
incidentals allowance stays payable.

Paying at — not above — the federal rate is what keeps this simple: per diem at
or below the federal rate sits inside an accountable plan, so it is not wages,
is not reported on a W-2 or 1099, and needs no meal receipts. Any rate above
$68/day would make the excess taxable to the member unless substantiated with
actual receipts.

Non-standard localities carry higher published M&IE tiers, up to $92/day. If
CAFOP travel concentrates in high-cost California metros, adopting the
locality-specific tables would raise reimbursement while staying federal — and
therefore still non-reportable. That is the supported way to pay more than $68.

### One open policy question

Federal per diem is payable only for travel that requires an overnight stay; a
same-day trip earns no M&IE under the federal rules. This form does not enforce
that — it pays 75% for a single-day trip. If the board wants to match the
federal treatment, that is a one-line change in `buildDiem`.

## Lodging

Reimbursed at **actual cost. There is no nightly ceiling.** Taxes and mandatory
fees are reimbursed in addition to the room rate. An itemized folio showing a
zero balance is required; members should book the conference room block where
one is offered.

Because lodging is reimbursed against actual receipted cost, it stays inside an
accountable plan and is not reportable as income at any dollar amount.

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
| Late Aug 2026 | GSA publishes FY2027 per diem; update the M&IE rate and its meal breakdown for travel on or after 1 Oct 2026. Lodging is uncapped, so the FY2027 lodging figure does not apply here. |
| Mid-Dec 2026 | IRS publishes the 2027 standard mileage rate; add it to the `MILEAGE` table. |

Rates live in one block near the top of the form's `<script>`:

```js
var MIE = 68, MIE_PARTIAL = 51;
var MEAL = { b:16, l:19, d:28 };
var LONG_TRIP_MI = 200, REVIEW_MI = 100;
var MILEAGE = [ { from:"2026-07-01", rate:0.76, label:"76.0¢" }, … ];
```

Add new mileage rates to the front of the `MILEAGE` array, newest first; the
form matches the first entry whose `from` date is on or before the date driven,
so past-year claims keep paying the correct historical rate. Also update the
rate card near the top of the markup, which is written out in plain text.

## Sources

- IRS, 2026 standard mileage rates (72.5¢ from 1 Jan 2026; raised to 76¢ from 1 Jul 2026, announced 13 Jul 2026)
- GSA, FY2026 CONUS per diem rates ($68 M&IE, effective 1 Oct 2025), Per Diem Bulletin FTR 26-01
- GSA, M&IE breakdown table, FY2026 ($16 / $19 / $28 / $5 incidentals; 75% on travel days)
- IRS Publication 463 / accountable plan rules, on per diem paid at or above the federal rate
- Federal Travel Regulation, constructive-cost rule for privately owned vehicle use

## Known constraints

- **The form is authored as an artifact fragment**, so it deliberately carries no
  `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` — the hosting layer supplies
  them. Opened straight from disk it therefore renders in quirks mode. Measured
  effect is 19px of document height and no box-model differences, but a
  standalone distribution copy should be wrapped in an HTML5 skeleton. The
  `charset` and `viewport` meta tags are honored from the top of the file either
  way, so encoding and mobile layout are correct in both paths.
- **Typefaces load from Google Fonts.** The file is otherwise self-contained, but
  it is not offline-clean: opening it requests fonts from `fonts.googleapis.com`
  and `fonts.gstatic.com`, which discloses the opener's IP and user-agent to
  Google. Fallback stacks are solid, so the form is fully usable with no network.
  Removing the two `<link>` tags makes it truly self-contained at the cost of the
  typography.
- **Drafts persist in the browser** via `localStorage` under the key
  `cafop-exp-01`, including name and email, until the traveler uses **Clear
  form**. This is stated on the form itself.
