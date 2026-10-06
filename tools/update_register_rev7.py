#!/usr/bin/env python3
"""Apply Revision 7 to prea-register.csv.

Revision 7 closes the verification gap Revision 6 left open. The 2019 Title 15
was re-produced, so the six sections that still carried their 04/01/2014
provenance were re-read against the edition effective 01/01/2019: 1301, 1321,
1354, 1390, 1452 and 1453. The full text of 1391(f) was also obtained, which
closes the partial-list flag raised immediately after Revision 6.

No status or priority changes. Eight rows touched, gap and change_log only.

What it found.

  1391(f) has SIX elements, not the five Revision 6 could see. The sixth is
  "provision for administrative review." That is exactly the element the
  truncation flag predicted was missing, so the flag is cleared rather than
  carried. 1391(g) also exists and routes camp and commitment program removals
  to the subsection (e) process.

  1390's deprivation floor runs (a) to (k), ELEVEN items, and (k) is
  "rehabilitative programming." Revision 5 recorded a ten-item floor ending at
  (j) from the 2014 edition and credited OO 1390/1391 I.A with exceeding it by
  adding rehabilitative programming as an eleventh item. In the current text
  that item is in the regulation. The order matches the floor; it does not
  exceed it. This correction removes a credit previously given to the
  department, which is the direction a correction is least likely to be noticed
  in, so it is recorded prominently.

  1321(h)(1) confirms the 1:10 and 1:30 ratios and the (E) exclusion as cited,
  and adds two subsections the register did not carry: (C) at least two
  wide-awake youth supervision staff on duty at all times regardless of the
  number of youth, absent a backup arrangement allowing immediate response, and
  (D) at least one youth supervision staff member on duty of the same gender as
  youth housed in the facility.

  1354 runs (a) to (f) and is more useful than the 2014 text. New (d) sends
  separation imposed as discipline to 1390, and new (e) sends separation that
  results in room confinement to WIC 208.3 and 1354.5. Separation that is
  neither is therefore governed by 1354 itself, which is precisely the
  protective custody placement rows 35 and 57 are about.

  1301, 1452 and 1453 are unchanged from the 2014 text and are confirmed as
  cited.

The script asserts the pre-state of every row it touches and refuses to run
twice.
"""

import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = os.path.join(ROOT, 'prea-register.csv')
ED = 'Title 15 effective 01/01/2019'
MARK = 'VERIFIED in Revision 7'

PRE = {
    '5': ('Not Addressed', 'Critical'), '6': ('Conflict', 'Critical'),
    '16': ('Partial', 'High'), '17': ('Partial', 'Medium'),
    '35': ('Partial', 'High'), '57': ('Partial', 'High'),
    '64': ('Conflict', 'Critical'), '67': ('Partial', 'High'),
}


def ok(detail):
    return '%s against %s: %s' % (MARK, ED, detail)


S1321 = ok(
    "1321(h)(1) is confirmed as cited for juvenile halls: (A) one wide-awake youth "
    "supervision staff member for each 10 youth during waking hours, (B) one for each 30 "
    "during sleeping hours, and (E) personnel whose primary responsibility is "
    "administration, supervision of personnel, academic or trade instruction, clerical, "
    "kitchen or maintenance shall not be classified as youth supervision staff. Two "
    "subsections this register did not carry are now recorded. (C) requires at least two "
    "wide-awake youth supervision staff members on duty at all times regardless of the "
    "number of youth in detention, unless an arrangement has been made for backup support "
    "services allowing immediate response to emergencies, which is a floor the federal "
    "ratios do not state and which binds on low-count units. (D) requires at least one "
    "youth supervision staff member on duty who is the same gender as youth housed in the "
    "facility, which bears on the 115.315 cross-gender viewing and announcement duties and "
    "should be read alongside them rather than as a staffing rule alone.")

S1301 = ok(
    "1301 is unchanged and confirmed as cited: a county operating a local juvenile facility "
    "may adopt standards governing its own employees and facilities 'provided such standards "
    "and requirements meet or exceed and do not conflict with these standards and "
    "requirements.' Adopting the federal 1:8 and 1:16 ratios is therefore open to the "
    "department without a variance, and 1321(h)(1) is a floor rather than a ceiling.")

S1354 = ok(
    "1354 runs (a) to (f) and is more useful than the 2014 text this register was built on. "
    "(a) separation for reasons including protective custody. (b) consideration of positive "
    "youth development and trauma-informed care, which is new. (c) separated youth shall not "
    "be denied normal privileges available at the facility except when necessary to "
    "accomplish the objective of separation. (d) is new and provides that where the objective "
    "of separation is discipline, section 1390 applies. (e) is new and provides that where "
    "separation results in room confinement, WIC 208.3 and section 1354.5 apply. (f) requires "
    "a daily review of separated youth to determine whether separation remains necessary. The "
    "structural consequence matters for this row: (d) and (e) route disciplinary separation "
    "and room confinement elsewhere, so separation that is neither, which is the protective "
    "custody placement at issue here, is governed by 1354 itself through the (c) privileges "
    "rule and the (f) daily review. The state does regulate this placement. What is missing "
    "is the departmental order implementing it, and OO 1354 has still never been produced.")

S1452_53 = ok(
    "1452 and 1453 are unchanged from the 2014 text and confirmed as cited. 1452 requires "
    "forensic medical services for the purpose of prosecution to be collected by "
    "appropriately trained medical personnel who are not responsible for providing ongoing "
    "health care to the youth. 1453 requires policy for treating victims of sexual assault, "
    "preservation of evidence, and reporting to local law enforcement, and requires that the "
    "evidentiary examination and initial treatment occur at a health facility separate from "
    "the custodial facility, properly equipped and staffed with trained and experienced "
    "personnel.")

APPEND = {
    '5': (' ' + S1321,
          'REVISED in 7: 1321(h)(1) re-verified against the 2019 edition. (C) two-staff '
          'minimum and (D) same-gender staffing added.'),
    '6': (' ' + S1321 + ' ' + S1301,
          'REVISED in 7: 1321(h)(1) and 1301 re-verified against the 2019 edition. The '
          'conflict is unchanged on both sides. (C) and (D) added.'),
    '16': (' ' + S1452_53,
           'REVISED in 7: 1452 and 1453 re-verified against the 2019 edition, unchanged.'),
    '17': (' ' + S1452_53,
           'REVISED in 7: 1452 and 1453 re-verified against the 2019 edition, unchanged.'),
    '67': (' ' + S1452_53,
           'REVISED in 7: 1453 re-verified against the 2019 edition, unchanged.'),
    '35': (' ' + S1354,
           'REVISED in 7: 1354 re-verified against the 2019 edition, now (a) to (f). New '
           '(d) and (e) show 1354 itself governs non-disciplinary, non-confinement '
           'separation.'),
    '57': (' ' + S1354,
           'REVISED in 7: 1354 re-verified against the 2019 edition, now (a) to (f). New '
           '(d) and (e) show 1354 itself governs non-disciplinary, non-confinement '
           'separation.'),
}


def main():
    with open(REG, newline='', encoding='utf-8') as fh:
        rd = csv.DictReader(fh)
        fields = rd.fieldnames
        rows = list(rd)
    by = {r['id']: r for r in rows}

    if any(MARK in r['gap'] for r in rows):
        print('ABORTED. Revision 7 has already been applied to this register.')
        return 1

    errs = []
    for rid, (st, pr) in PRE.items():
        r = by.get(rid)
        if r is None:
            errs.append('row %s: not present' % rid)
        elif (r['status'], r['priority']) != (st, pr):
            errs.append('row %s: expected (%s, %s) but found (%s, %s)'
                        % (rid, st, pr, r['status'], r['priority']))
    if errs:
        print('ABORTED, nothing written:')
        for e in errs:
            print('  ' + e)
        return 1

    applied = []
    for rid, (extra, note) in APPEND.items():
        r = by[rid]
        r['gap'] = r['gap'].rstrip() + extra
        r['change_log'] = (r['change_log'] + ' ' + note).strip()
        applied.append(rid)

    # ---------------------------------------------------------------- row 64
    r = by['64']

    # The partial-list flag raised right after Revision 6 is now answerable.
    old_flag = ("THIS ENUMERATION IS INCOMPLETE and must not be quoted as the full list. The "
                "text extraction that produced it was truncated inside item (5), so any "
                "further items are unseen. Revision 5's reading of the 2014 predecessor "
                "recorded an administrative review element, which does not appear among the "
                "five above, and OO 1390/1391 IV supplies both an interpreter where needed "
                "and administrative review by the Assistant Division Chief, so at least one "
                "and probably two further elements exist. Obtain the full subsection before "
                "quoting the list.")
    if old_flag not in r['gap']:
        print('ABORTED, nothing written: row 64 is missing the Revision 6 truncation flag.')
        return 1
    r['gap'] = r['gap'].replace(old_flag, ok(
        "the list is now complete and it has SIX elements, not five. The sixth is "
        "'(6) provision for administrative review.' That is precisely the element the "
        "truncation flag predicted was missing, so the flag is cleared rather than carried "
        "forward. 1391(g) also exists and provides that violations resulting in removal from "
        "a camp or commitment program, short of a return to court, follow the subsection (e) "
        "process."))

    # 1390's floor. This correction removes a credit previously given.
    old_floor = ("1390 is confirmed as cited: least restrictive level, no corporal or group "
                 "punishment or degradation, and a ten-item deprivation floor at (a) to (j). "
                 "OO 1390/1391 I.A exceeds that floor by adding rehabilitative programming as "
                 "an eleventh item, which is worth preserving in any amendment.")
    if old_floor not in r['gap']:
        print('ABORTED, nothing written: row 64 is missing the Revision 5 1390 sentence.')
        return 1
    r['gap'] = r['gap'].replace(old_floor, ok(
        "1390 confirms the least restrictive level rule and the bar on corporal punishment, "
        "group punishment, and physical or psychological degradation. CORRECTION, AND IT "
        "REMOVES A CREDIT THIS REGISTER PREVIOUSLY GAVE THE DEPARTMENT. The deprivation floor "
        "runs (a) to (k), ELEVEN items, and (k) is 'rehabilitative programming.' Revision 5 "
        "read a ten-item floor ending at (j) in the 2014 edition and credited OO 1390/1391 "
        "I.A with exceeding it by adding rehabilitative programming as an eleventh item. In "
        "the current text that item is in the regulation. The order matches the floor, it "
        "does not exceed it, and no amendment should describe it as exceeding anything. Two "
        "further requirements in the current 1390 that this register did not carry: discipline "
        "policy shall promote acceptable behavior 'including the use of positive behavior "
        "interventions and supports,' and the rules of conduct and disciplinary penalties "
        "shall include both major and minor violations, be stated simply and affirmatively, "
        "be made available to all youth, and be made accessible to youth with disabilities, "
        "limited English proficiency, or limited literacy."))
    r['change_log'] = (r['change_log'] + ' REVISED in 7: 1391(f) obtained in full, six '
                       'elements, truncation flag cleared. CORRECTED in 7: the 1390 floor is '
                       'eleven items and (k) is rehabilitative programming, so OO 1390/1391 '
                       'matches rather than exceeds it.').strip()
    applied.append('64')

    missing = set(PRE) - set(applied)
    if missing:
        print('ABORTED, nothing written: rows asserted but never edited: %s'
              % ', '.join(sorted(missing, key=int)))
        return 1

    with open(REG, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    from collections import Counter
    print('Revision 7 applied to %d rows: %s'
          % (len(set(applied)), ', '.join(sorted(set(applied), key=int))))
    print('status  ', dict(Counter(r['status'] for r in rows)))
    print('priority', dict(Counter(r['priority'] for r in rows)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
