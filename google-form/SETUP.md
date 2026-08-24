# Turning the claim form into a Google Form

**The thing you need to know first: Google Forms cannot do arithmetic.** It has no
calculated fields, no per-day per diem schedule, no mileage rate that changes with
the date driven, no over-200-mile airfare comparison. A plain Google Form would
collect numbers and hand you a spreadsheet of raw answers to total by hand — which
is most of the work the HTML form was built to remove.

So this is a Form **plus** a script. The Form asks officers only for facts they
know. `Code.gs` does every calculation the moment they hit submit, writes a
computed row to a spreadsheet, and emails you the finished claim with a
**Due to officer** figure and a list of anything that needs your attention before
you pay it.

Officers get a confirmation email with the same numbers, so they know what to
expect and can flag a mistake before you cut the check.

## Setup — about ten minutes, once

1. Go to **[script.google.com](https://script.google.com)** and click **New project**.
   Sign in as the account that should own the form and receive the claims.
2. Delete the sample `function myFunction() {}` and paste in the entire contents of
   [`Code.gs`](Code.gs).
3. Rename the project something like `CAFOP Reimbursement` (click *Untitled project*).
4. Check the top of the file. `TREASURER_EMAIL` is deliberately **blank**: claims go to
   whichever Google account runs `setUp`, so if the treasurer sets this up from their own
   account, claims come to them with nothing to configure. Fill it in only to send claims
   somewhere other than the owning account. It is left blank in the repository on purpose —
   this is a public repository, and an address typed in here is published with it.
5. In the function dropdown at the top, select **`setUp`**, then click **Run**.
6. Google will ask you to authorize. Click through **Review permissions** → your
   account → **Advanced** → **Go to (project name)** → **Allow**. The unverified-app
   warning is expected: you wrote this script, it is not published to anyone else.
   It needs permission to create the form and spreadsheet, and to send you mail.
7. Open **Execution log** (bottom panel). It prints four links. Save them:
   - the **published URL** — this is what you send to officers
   - the **edit URL** — where you change wording or add questions
   - the **spreadsheet** — every submission, with the calculated columns
   - a confirmation of the email claims go to

Run `setUp` **once**. Running it again builds a second form and a second
spreadsheet; if you need to start over, delete the ones it made first.

## Test it before you send it out

Submit a claim to yourself using the published URL: departure `2026-09-14`,
return `2026-09-16`, 2 nights at `129` plus `41.28` tax, `240` miles driven
`2026-09-14`, `24` parking, 1 lunch provided, `275` other, `200` advance.

You should get an email showing **$731.68** due, and a red note that 240 miles is
over the 200-mile threshold with no airfare comparison given. That figure and that
flag are the same ones the HTML form produces for the same trip.

## What the officer sees, and what you get

The form asks for facts, not math: dates, nights, rate paid, miles, how many meals
somebody else fed them, what else they spent. Nobody has to know what the per diem
rate is or which mileage rate applied in March versus September.

Your email arrives with a line-item breakdown, the total due, and a
**Before paying this claim** box that appears when something needs judgment:

- over 200 miles driven with no airfare comparison quoted
- more provided meals reported than the trip pays for
- more nights claimed than the travel dates cover
- other expenses claimed with no description
- an amount that was not a readable number, which is counted as $0.00 rather than guessed at
- a submission where the certification box somehow was not ticked
- a return date before the departure date
- an advance larger than the claim, meaning the officer owes CAFOP

Flagged claims are also shaded red in the spreadsheet, so nothing needing review
scrolls past unnoticed.

## Receipts

The form includes a **file upload** question, which is the clean way to collect the
hotel folio. It has one requirement: **file upload only works when respondents are
signed in to a Google account**, and on a Workspace form they may need to be in
your domain. If your officers submit from personal Gmail or non-Google addresses,
`setUp` skips that question automatically and logs that it did — in that case have
them email receipts to you referencing the trip, and the claim email tells them so.

## Keeping the two forms in step

The rates live at the top of `Code.gs` and are copies of the ones in
`forms/cafop-executive-reimbursement-form.html`:

```js
var MIE = 68;              // full day meals & incidentals
var MIE_PARTIAL = 51;      // first and last travel day
var MEAL = { breakfast: 16, lunch: 19, dinner: 28 };
var MILEAGE = [ { from: '2026-07-01', rate: 0.76 }, … ];
var LONG_TRIP_MI = 200;
```

**When one changes, change both**, or the printable form and the online form will
quote different totals for the same trip. `docs/travel-reimbursement-rates.md`
lists the dates the federal figures get republished — GSA in late August, IRS in
December.

There is a check for this. From the repository root:

```
node scripts/check-rate-parity.mjs
```

It reads the constants out of both files, compares them, and fails if they disagree. It
also verifies the two internal rules the rates have to satisfy: that the travel-day rate is
exactly 75% of the full rate, and that the three meal components plus the $5 incidentals
allowance add up to the daily rate. Run it after any rate change.

If you rename a question in the Form editor, rename it in the `Q` block too. The
script matches answers by question title, so a renamed question stops being read
and silently drops out of the total.

## Two things worth deciding before you launch

**Where claims land.** Whatever account runs `setUp` receives every claim. If that is a
county or other employer address, association financial records land in an employer
mailbox, where they may fall under that employer's retention policy and public-records
obligations — many associations keep union and association business on a non-employer
account for exactly that reason. Entirely your call: run `setUp` from the account you want
claims in, or set `TREASURER_EMAIL` explicitly. Officers' confirmation copies go to
whatever address they submit from.

**Which form is the record.** You now have two. A reasonable split:

| | |
| --- | --- |
| **Google Form** | The system of record. Officers submit here, you get the math and the audit trail automatically. |
| **HTML form** | Worksheet and wet-signature copy. Officers can total a trip before filing, and it prints to PDF for signatures when a claim needs them. |

If you would rather have only one, use the Google Form — the signature blocks are
the only thing it gives up, and an emailed submission from the officer's own
account plus your approval reply is ordinarily enough of an approval trail for an
association this size. Ask whoever prepares your returns if you want certainty.

## Limits to know about

- **Sending quota.** A consumer Gmail account can send 100 script emails a day;
  Workspace allows 1,500. Nowhere near a constraint for board travel.
- **Editing after submission.** Officers can only revise a submitted claim if you
  turn on *Edit after submit* in the form settings. Off is usually right — a
  correction should come to you.
- **No live total while typing.** Google Forms cannot show a running total. The
  officer sees their figures in the confirmation email seconds later. If a live
  total matters to them, point them at the HTML form as a worksheet first.
