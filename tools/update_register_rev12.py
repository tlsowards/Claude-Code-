#!/usr/bin/env python3
"""Apply Revision 12 to prea-register.csv.

OO 1352.5 Transgender and Intersex Youth, eff. 03/01/2019, produced and read in
full for the first time on 10/30. Four pages, scanned, no text layer, rasterized
at 200 dpi and read as images.

Every section number the register carried from the earlier review is confirmed:
II.A to II.D, III.A to III.K, IV.A.1 to IV.A.3 and IV.A.3.a to c. That is the
third produced order to vindicate the register's provenance.

Five things in the order were not recorded by any revision, and two of them
change what this project had said about the search provisions. Two new rows, 92
and 93. No status changes and no new conflict: the strip search tension at
IV.A.3.b is recorded as a defect in its row rather than scored, on the same
reasoning as the row 58 near miss, because the two subparagraphs govern
different sightlines and are awkward rather than strictly irreconcilable.

Self-checking, one-shot, and refuses to run twice.
"""

import csv
from collections import Counter

REG = 'prea-register.csv'
MARK = 'VERIFIED in Revision 12 against OO 1352.5'

PRE = {
    '11': ('Addressed', 'Low'),
    '36': ('Conflict', 'Critical'),
    '37': ('Conflict', 'High'),
    '75': ('Addressed', 'Low'),
    '84': ('Partial', 'Critical'),
}

V = ' ' + MARK + ', eff. 03/01/2019, produced and read in full: '

APPEND = {
 '11': (V + 'the finding that 115.315(e) is closed stands, and IV.A.1 is confirmed word for word: '
  '"Youth shall not be physically searched for the purpose of determining the youth\'s anatomical '
  'sex." IV.A.2 is also confirmed. BUT THIS ROW\'S DESCRIPTION OF IV.A.3 WAS WRONG IN TWO WAYS AND '
  'IS CORRECTED HERE. First, earlier revisions recorded IV.A.3 as respecting the youth\'s '
  'preference regarding the gender of searching staff whenever feasible. That is the subsection\'s '
  'SECOND sentence. Its first sentence states the operative rule and was never recorded: "Staff '
  'will conduct searches based on biological sex except under exigent circumstances, when '
  'performed by a medical professional, or if a transgender or intersex youth makes a request for '
  'a preferred gender staff to conduct the search." So biological sex is the default and the '
  'youth\'s preference is an exception that requires a request and supervisor approval under '
  'IV.A.3.a. See new row 92. Second, earlier revisions recorded IV.A.3.b and c together as '
  'two-staff procedures with the second staff "within hearing but out of view". That is IV.A.3.b.3 '
  'only, it governs strip searches only, and "out of view of the youth" means the youth cannot see '
  'the second staff, not that the second staff cannot see the youth. IV.A.3.c.1, the patdown rule, '
  'says the opposite: the second staff "remains present and observes". See new row 93. The order '
  'does exceed the standard at IV.A.1, IV.A.2 and IV.A.3.a, which requires the supervisor to meet '
  'directly with the youth before authorizing, and that credit is unchanged.',
  'Rev 12: IV.A.3 description corrected in two respects after reading the order. Status held at '
  'Addressed because 115.315(e) is closed by IV.A.1. New rows 92 and 93 carry what was missed.'),

 '36': (V + 'III.H is confirmed and is longer than this register recorded. It reads in full: '
  '"Staff shall not consider a youth\'s sexual orientation or gender identity as a reason to '
  'isolate or withhold program options; however, staff may consider the youth\'s past and present '
  'behavior (i.e.: past or present sexual advances, sexually acting out)." The proviso is new to '
  'this register and it does not weaken the finding against OO 1352 S-8. The proviso permits '
  'consideration of BEHAVIOUR, which is what 15 CCR 1352(f) allows, and S-8 is assigned on STATUS, '
  'which is what 1352(f) and 1352(e) forbid. If anything the proviso sharpens the contrast: this '
  'order knew how to write a behaviour-based exception and wrote one, and OO 1352 did not.',
  'Rev 12: III.H quoted in full from the produced order. Proviso new to this register. Finding '
  'unchanged and the contrast with S-8 is sharper.'),

 '37': (V + 'the defect is confirmed word for word and the struck text this project had been '
  'carrying was incomplete. III.I reads: "All transgender and intersex youth shall be provided a '
  'single room in order to ensure their privacy and safety." Through Revision 11 the redline for '
  'change 2 struck a reconstruction reading "All transgender and intersex youth shall be provided '
  'a single room," which omitted the stated rationale. The finding is unchanged; the text being '
  'replaced is longer. Everything else this row credits is confirmed: III.A (individualized '
  'assessment at admission, Identity Preference Form), III.B (no automatic housing by external '
  'anatomy, documented reasons), III.C (youth preferences and provider recommendations), III.F '
  '(individualized needs, emotional and physical safety, the youth\'s perception of where they '
  'will be most secure, documented in JPIP classification comments with date and justification), '
  'III.G (monthly reassessment), III.H, III.J (private showers) and III.K (private accommodations '
  'do not prevent program participation). TWO PROVISIONS NEW TO THIS REGISTER. III.D: "The safety '
  'and well-being of all the youth shall be the primary concern when staff is deciding where to '
  'place the transgender/intersex youth within the housing unit." III.E: "Staff shall consider the '
  'youth\'s background, age, developmental status, sophistication, social skills, charges, '
  'behavioral history and the factors that might influence the youth\'s adjustment and contribute '
  'to an overall safe and successful experience for the youth, as well as all other youth in the '
  'unit." III.E strengthens the case that the individualized machinery III.I overrides is already '
  'written and already adequate. The amendment at change 2 needs to create nothing new.',
  'Rev 12: III.I quoted verbatim and the previous struck text found incomplete. III.D and III.E '
  'added to this row. Status and priority unchanged.'),

 '75': (V + 'the order is confirmed in full and this row\'s description of it holds. Four pages, '
  'Sections I Definitions, II Guidelines, III Housing, IV Searches. THREE THINGS TO ADD. First, '
  'the order names two attachments and neither has been produced: the Identity Preference Form, '
  'and a document titled "Ensuring Fairness and Respect for the LGBTQI". The form is the '
  'instrument III.A and IV.A.3.a both run on, so what it asks the youth decides whether those '
  'provisions work. Second, the order names that form two different ways: III.A and the attachment '
  'list call it the Identity Preference Form, IV.A.3.a calls it the Identification Preference '
  'Form. Third, the order does not reference OO 1352 or OO 1350.5 anywhere in four pages, although '
  'OO 1352 II.M.1.a points here for housing guidelines. The cross-reference runs one way only, '
  'which is the same structural defect recorded against OO 1352 at rows 32 and 34. Note also that '
  'Section I carries two grammatical slips in the order\'s own text, "whose gender identity '
  'different from" and "A person who\'s sexual or reproductive anatomy", and the signature is '
  'dated 5/2019 against a March 1, 2019 effective date.',
  'Rev 12: order produced and read in full. Two unproduced attachments, a form named two ways, and '
  'no cross-reference to OO 1352 or OO 1350.5 added to this row. Status held at Addressed.'),

 '84': (V + 'OO 1352.5 III.E weights "background, age, developmental status, sophistication, '
  'social skills, charges, behavioral history" in the housing decision for transgender and '
  'intersex youth. That is a third place age is a documented factor, alongside the OO 1352 Purpose '
  'paragraph and III.C.1 physical stature. The narrow finding is unchanged and unchanged in '
  'direction: the factors exist and an age-based housing RULE does not, in any produced order.',
  'Rev 12: OO 1352.5 III.E added as a third age-weighting factor. Status held at Partial.'),
}

NEW = [
 {'id': '92',
  'area': 'Prevention Planning',
  'cfr_28_subpart_d': '115.315(a)-(d)',
  'ca_title15_or_statute': '15 CCR 1360(g); 15 CCR 1352.5(c)',
  'requirement': 'Cross-gender pat-down and strip searches are prohibited except in exigent '
    'circumstances or when performed by medical practitioners, and must be documented. Staff shall '
    'not search or physically examine a resident to determine genital status.',
  'county_document': 'OO 1352.5 IV.A.3 and IV.A.3.a',
  'status': 'Partial',
  'gap': 'NEW IN REVISION 12, on reading OO 1352.5 in full for the first time. IV.A.3 states: '
    '"Staff will conduct searches based on biological sex except under exigent circumstances, when '
    'performed by a medical professional, or if a transgender or intersex youth makes a request '
    'for a preferred gender staff to conduct the search. Whenever feasible, YDF will respect the '
    'youth\'s preference regarding the gender of the staff who conducts any search of the youth." '
    'So the default basis for searching a transgender or intersex youth is biological sex, and the '
    'youth\'s gender identity governs only where the youth asks and a supervisor approves under '
    'IV.A.3.a. Earlier revisions recorded only the second sentence and scored this area as closed. '
    'THE QUESTION THIS RAISES IS FOR COUNTY COUNSEL AND THIS REVIEW DOES NOT ANSWER IT. 15 CCR '
    '1360(g) prohibits cross-gender pat-down and strip searches except in exigent or medical '
    'circumstances. Whether a search of a transgender girl by male staff is a cross-gender search '
    'for the purpose of 1360(g) is not answered on the face of either text, and the answer decides '
    'whether IV.A.3 states a lawful default or an unlawful one. What can be said without deciding '
    'it: 15 CCR 1352.5(c) forbids housing youth automatically according to external anatomy, and '
    'IV.A.3 does for searches what 1352.5(c) forbids for housing, which is at least an '
    'inconsistency of approach inside one regulation. IV.A.3.a is a real safeguard and is credited: '
    'the on-duty supervisor must meet directly with the youth before authorizing, and the request, '
    'the rationale, the outcome and who conducted the search are documented in the file, in JPIP '
    'and on the Strip Search Authorization Application. What is missing is any documentation '
    'requirement where no request is made and the default simply operates, which is the case '
    '1360(g) would reach. Not scored as a conflict because the legal question is open.',
  'priority': 'High',
  'change_log': 'Added in Revision 12 from OO 1352.5 IV.A.3, produced and read in full 10/30. '
    'Routed to County Counsel as an open question rather than scored as a conflict.',
  'owner': '', 'target_date': '', 'disposition': ''},

 {'id': '93',
  'area': 'Prevention Planning',
  'cfr_28_subpart_d': '115.315(a)-(b)',
  'ca_title15_or_statute': '15 CCR 1360(g)',
  'requirement': 'Written search procedures that staff can actually follow, preserving the privacy '
    'and dignity of the person searched.',
  'county_document': 'OO 1352.5 IV.A.3.b.3, IV.A.3.b.4 and IV.A.3.c.1',
  'status': 'Partial',
  'gap': 'NEW IN REVISION 12, on reading OO 1352.5 in full for the first time, and it corrects '
    'this register\'s own description at row 11. The strip search procedure gives the second staff '
    'member two instructions in consecutive subparagraphs. IV.A.3.b.3: "The preferred gender staff '
    'will conduct the search while the second staff remains within hearing, but out of view of the '
    'youth (absent exigent circumstances)." IV.A.3.b.4: "For safety and security purposes, the '
    'secondary staff shall be in a position to view searcher so as to offer aid if necessary." '
    'These are reconcilable in principle, because b.3 governs whether the YOUTH can see the second '
    'staff and b.4 governs whether the second staff can see the SEARCHER, but in a single room '
    'during a strip search a position that sees the searcher will ordinarily see the youth as '
    'well, so the privacy b.3 appears to promise is not what b.3 actually says. Not scored as a '
    'conflict, on the same reasoning as the row 58 near miss: the two subparagraphs are awkward '
    'rather than strictly contradictory. The fix is one sentence saying which rule governs when '
    'both cannot be met and what the second staff does in that case. SEPARATELY, this register '
    'described IV.A.3.b and IV.A.3.c together as carrying the out-of-view rule. They do not. '
    'IV.A.3.c.1, the patdown procedure, reads: "Two staff shall be present for the search. The '
    'staff with the preferred gender of the youth conducts the search while the second staff '
    'remains present and observes." The second staff observes. There is no out-of-view element in '
    'the patdown rule at all, so the privacy protection this project credited for patdowns does '
    'not exist in the order.',
  'priority': 'Medium',
  'change_log': 'Added in Revision 12 from OO 1352.5 IV.A.3.b and IV.A.3.c, produced and read in '
    'full 10/30. Corrects an overstatement in row 11. Not scored as a conflict.',
  'owner': '', 'target_date': '', 'disposition': ''},
]


def main():
    with open(REG, newline='', encoding='utf-8') as fh:
        rd = csv.DictReader(fh)
        fields = rd.fieldnames
        rows = list(rd)
    by = {r['id']: r for r in rows}

    if any(MARK in r['gap'] for r in rows):
        print('ABORTED. Revision 12 has already been applied to this register.')
        return 1

    errs = []
    for rid, (st, pr) in PRE.items():
        r = by.get(rid)
        if r is None:
            errs.append('row %s: not present' % rid)
        elif (r['status'], r['priority']) != (st, pr):
            errs.append('row %s: expected (%s, %s) but found (%s, %s)'
                        % (rid, st, pr, r['status'], r['priority']))
    for n in NEW:
        if n['id'] in by:
            errs.append('row %s: already exists, refusing to add' % n['id'])
        if set(n) != set(fields):
            errs.append('row %s: column set does not match the register header' % n['id'])
    if errs:
        print('ABORTED, nothing written:')
        for e in errs:
            print('  ' + e)
        return 1

    for rid, (extra, note) in APPEND.items():
        r = by[rid]
        r['gap'] = r['gap'].rstrip() + extra
        r['change_log'] = (r['change_log'] + ' ' + note).strip()
    rows.extend(NEW)

    with open(REG, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print('Revision 12 applied. Rows touched: %s. Rows added: %s.'
          % (', '.join(sorted(APPEND, key=int)), ', '.join(n['id'] for n in NEW)))
    print('total   ', len(rows))
    print('status  ', dict(Counter(r['status'] for r in rows)))
    print('priority', dict(Counter(r['priority'] for r in rows)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
