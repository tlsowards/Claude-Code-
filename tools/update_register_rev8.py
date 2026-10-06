#!/usr/bin/env python3
"""Apply Revision 8 to prea-register.csv.

Revision 8 is the first pass driven by facility facts rather than by documents.
The department confirmed: the Juvenile Hall houses residents aged 13 to 25; it
has 17 units of which 12 are in use; girls are housed separately from boys;
boys are grouped by age; and a resident under 16 housed with one over 18 is
uncommon but not prohibited.

Unlike Revisions 5 to 7 this pass does change the counts. It adds three rows
and raises one priority.

  NEW 84  the mixed-age population, and the fact that neither PREA nor Title 15
          requires any separation by age, so classification is the only control
  NEW 85  15 CCR's own definition of sexual abuse, which is broader than the
          PREA resident-on-resident definition on coercion
  NEW 86  sex and age separation operating as undocumented practice
  ROW 77  dependent adult reporting, Medium to High, because adults are in the
          main population rather than an occasional edge case

It also records the unit count in rows 3 and 5, and adds the general-population
versus single-occupancy distinction to row 36 and the sex-segregation
interaction to row 37.

Verified against the Title 15 edition effective 01/01/2019, read in full:
  "Youth" means any person in the custody of the juvenile facility, and "may be
  a minor under the age of 18 or a person over 18 years of age."
  "Sexual abuse" is sexual activity or voyeurism by one or more persons upon
  another person who does not consent, is unable to refuse, or is coerced into
  the act by manipulation, violence, or by overt or implied threats.
  Separation under 1354 is keyed to behavior and status. No provision keys
  separation to age, and no provision requires housing separation by sex. The
  only sex-related housing rule is the 1321(h)(1)(D) staffing requirement.

Asserts the pre-state of every row it touches and refuses to run twice.
"""

import csv
import os
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = os.path.join(ROOT, 'prea-register.csv')
ED = 'Title 15 effective 01/01/2019'
MARK = 'VERIFIED in Revision 8'

PRE = {
    '3': ('Not Addressed', 'Critical'), '5': ('Not Addressed', 'Critical'),
    '36': ('Conflict', 'Critical'), '37': ('Conflict', 'High'),
    '77': ('Partial', 'Medium'),
}

FACILITY = ('Facility facts confirmed by the department in Revision 8: the Juvenile Hall '
            'houses residents aged 13 to 25, has 17 units of which 12 are in use, houses girls '
            'separately from boys, groups boys by age, and treats a resident under 16 housed '
            'with one over 18 as uncommon but not prohibited.')

NEW = [
 {'id': '84', 'area': 'California-Specific',
  'cfr_28_subpart_d': '115.341(a)-(e); 115.342(a)-(b)',
  'ca_title15_or_statute': '15 CCR 1302 (definition of youth), 1350.5(d)-(f), 1352, 1354',
  'requirement': ('Use screening and classification to keep residents safe, including by '
                  'weighting age, level of emotional and cognitive development, and physical '
                  'size and stature, in a facility whose population spans a twelve year age '
                  'range.'),
  'county_document': 'OO 1352 (Classification), never produced; OO 1350.5; OO 1354, never produced',
  'status': 'Not Addressed', 'priority': 'Critical',
  'gap': (FACILITY + ' ' + MARK + ' against ' + ED + ': Title 15 defines "Youth" as "any person '
   'who is in the custody of the juvenile facility. This person may be a minor under the age of '
   '18 or a person over 18 years of age," and includes persons under both juvenile and adult '
   'court jurisdiction. Every Title 15 duty therefore applies identically to a 13 year old and a '
   '25 year old. Searched in full: separation under 1354 is keyed to behavior and status, and no '
   'provision anywhere in the edition keys separation to age. On the federal side neither 115.14 '
   'nor 115.114, the youthful inmate and youthful detainee standards, applies in a juvenile '
   'facility, and a person over 18 held in one remains a resident under the subpart D '
   'definitions. The consequence is the finding: NOTHING IN FEDERAL OR STATE LAW REQUIRES SIGHT '
   'AND SOUND SEPARATION OF A 13 YEAR OLD FROM A 25 YEAR OLD IN THIS FACILITY. The only control '
   'is classification. 1350.5 supplies the right factors at (d) age, (e) level of emotional and '
   'cognitive development, and (f) physical size and stature, so the state screening instrument '
   'contemplates exactly this problem. Whether OO 1352 weights those factors across a twelve '
   'year span cannot be assessed, because OO 1352 has never been produced, and the two '
   'classification defects this register does document, the S-8 mandate at row 36 and the S-4 '
   'victim to perpetrator inference at row 80, both sit in that same order. Scored Not Addressed '
   'because no produced document contains an age based housing provision, not because the '
   'department does nothing: see row 86, where the practice exists and the documentation does '
   'not.'),
  'change_log': 'NEW in 8, from facility facts confirmed by the department.',
  'owner': '', 'target_date': '', 'disposition': ''},

 {'id': '85', 'area': 'California-Specific',
  'cfr_28_subpart_d': '115.6 (definitions), by comparison',
  'ca_title15_or_statute': '15 CCR 1302 (definition of sexual abuse), 1324(n)',
  'requirement': ('Departmental policy must prohibit sexual abuse as California defines it, '
                  'which is not the same as the federal definition.'),
  'county_document': 'PREA Policy (definitions section); OO 1453',
  'status': 'Not Addressed', 'priority': 'High',
  'gap': (MARK + ' against ' + ED + ': Title 15 carries its own definition. "Sexual abuse" is '
   '"sexual activity or voyeurism by one or more persons upon another person who does not '
   'consent, is unable to refuse, or is coerced into the act by manipulation, violence, or by '
   'overt or implied threats." It is broader than the federal resident-on-resident definition at '
   '28 CFR 115.6 in two ways that matter operationally. First, coercion: the state counts '
   'coercion by MANIPULATION, where the federal definition requires that the resident be coerced '
   'by overt or implied threats of violence. Manipulation by an older resident over a younger one '
   'is the realistic coercion vector in a facility spanning 13 to 25, and it is precisely the '
   'case that can fail the federal test while meeting the state one. Second, voyeurism: the '
   'state definition reaches voyeurism by one or more persons upon another, where under the '
   'federal definition voyeurism is a staff-only prong and does not appear among the '
   'resident-on-resident prongs at all. 1324(n) requires the policy and procedure manual to '
   'prohibit all forms of sexual abuse, so this is an enforceable state standard and not '
   'background. No produced departmental document adopts or reflects the state definition. The '
   'practical risk is a department that screens incidents against the federal test alone and '
   'closes conduct the state standard reaches.'),
  'change_log': 'NEW in 8, from verification against the 2019 edition.',
  'owner': '', 'target_date': '', 'disposition': ''},

 {'id': '86', 'area': 'California-Specific',
  'cfr_28_subpart_d': '115.313(a); 115.342(a)-(b)',
  'ca_title15_or_statute': '15 CCR 1324 (required contents of the manual), 1352',
  'requirement': ('Controls the department actually relies on should appear in the policy and '
                  'procedure manual, which 1324 requires to address at a minimum all applicable '
                  'regulations and to be available to and reviewed by all employees.'),
  'county_document': 'None identified. OO 1352 never produced.',
  'status': 'Not Addressed', 'priority': 'High',
  'gap': (FACILITY + ' Three separation controls are in daily use and none of them appears in '
   'the documents reviewed: girls housed separately from boys, boys grouped by age, and a '
   'resident under 16 kept apart from one over 18 in all but uncommon cases. ' + MARK +
   ' against ' + ED + ': no provision requires housing separation by sex. The only sex-related '
   'housing rule in the edition is 1321(h)(1)(D), at least one youth supervision staff member on '
   'duty of the same gender as youth housed. There is likewise no age-based rule. So the '
   'department is operating three controls that neither the state nor the federal standard '
   'requires, which is a stronger position than compliance, and recording none of them. An '
   'undocumented control cannot be audited, does not survive staff turnover, erodes silently '
   'under population pressure, and in litigation reads as "we usually do not" rather than "our '
   'policy prohibits." The remediation is the cheapest in this register because the practice '
   'already exists: write it down. Two halves are needed. State the rule, including the age span '
   'threshold the department actually applies. Then state the exception path, because the '
   'department describes the under-16 with over-18 pairing as uncommon rather than impossible: '
   'who authorizes it, what justification is recorded, what additional safeguards attach, and '
   'where it is documented. A rule without a written override is not a control.'),
  'change_log': 'NEW in 8, from facility facts confirmed by the department.',
  'owner': '', 'target_date': '', 'disposition': ''},

 {'id': '87', 'area': 'California-Specific',
  'cfr_28_subpart_d': '115.6 (definitions); 115.371(a)',
  'ca_title15_or_statute': ('PC 11165.1(a) and (b); PC 261.5, 286, 287, 288, 289; '
                            '15 CCR 1302'),
  'requirement': ('Decide whether sexual contact between two residents is abuse without '
                  'relying on apparent consent, in a facility that houses both minors and '
                  'adults.'),
  'county_document': 'PREA Policy; OO 1390/1391 II.B.4 (sexual misconduct, undefined)',
  'status': 'Not Addressed', 'priority': 'Critical',
  'gap': ('Where a resident under 18 and a resident over 18 are involved in the same incident, '
   'the federal and state tests can return opposite answers, and neither can be resolved on the '
   'unit. PREA side: resident-on-resident sexual abuse requires that the resident does not '
   'consent, is coerced by overt or implied threats of violence, or is UNABLE TO CONSENT OR '
   'REFUSE. That third limb is the one that governs the mixed-age case. A minor who cannot '
   'lawfully consent to sexual activity with an adult under California law is unable to consent '
   'within the meaning of the definition, so apparent willingness does not take the incident out '
   'of PREA, and 115.371(a) requires the allegation to be investigated regardless. CANRA side: '
   'the analysis is narrower and more treacherous. 11165.1(b)(4) reaches intentional touching of '
   'the intimate parts of a child for sexual arousal or gratification, and a child is anyone '
   'under 18, so touching a 17 year old is reportable on that basis alone. Against that, '
   '11165.1(a) carries an exception: sexual assault does not include VOLUNTARY conduct in '
   'violation of sections 286, 287 or 289 where there are NO INDICATORS OF ABUSE, unless the '
   'conduct is between a person 21 or older and a minor under 16. Three things about that '
   'exception have to be understood before anyone relies on it. It reaches only 286, 287 and '
   '289, so it does not reach touching under (b)(4) and does not reach intercourse under 261.5. '
   'It requires a finding of no indicators of abuse, which in a custodial setting with an age '
   'gap is a conclusion reached after investigation and never an observation made on a unit. And '
   'it is unavailable outright for a person 21 or older with a minor under 16, which in a '
   'facility housing 13 to 25 is a live pairing rather than a hypothetical. Add the state '
   'definition at row 85, which counts coercion by manipulation where the federal definition '
   'requires threats of violence: manipulation of a younger resident by an older one is the '
   'characteristic mixed-age fact pattern, and it is reachable under state law in cases where '
   'the federal test alone would not reach it. The operational rule that follows is narrow and '
   'should be written down: staff do not apply consent analysis, the PREA report and '
   'investigation proceed regardless of apparent willingness, and the CANRA voluntary-conduct '
   'exception is never applied at the facility level. No produced document states any of this, '
   'and OO 1390/1391 II.B.4 makes it worse by listing sexual misconduct as a major rule '
   'violation without defining it, so nothing distinguishes a coerced act from a non-coerced one '
   'for either disciplinary or reporting purposes. See row 64.'),
  'change_log': 'NEW in 8. The mixed-age consent collision, from facility facts.',
  'owner': '', 'target_date': '', 'disposition': ''},
]

APPEND = {
 '3': (' ' + FACILITY + ' Note that this answers a different question than the one this row '
       'asks. Twelve units in use describes the size of one facility; it does not say how many '
       'juvenile facilities the department operates, which is what 115.311(c) turns on. Open '
       'question 1 stays open.',
       'REVISED in 8: unit count recorded. The facility count 115.311(c) turns on is still open.'),
 '5': (' ' + FACILITY + ' The unit count is a direct input to the staffing plan. Twelve units in '
       'use interacts with 1321(h)(1)(C), which requires at least two wide-awake youth '
       'supervision staff on duty at all times regardless of the number of youth in detention, '
       'absent a backup arrangement allowing immediate response. On a low-count unit that floor '
       'binds before any ratio does, and with twelve units running it is a staffing question '
       'before it is a PREA question. Factor 6, the composition of the resident population, now '
       'has a concrete answer that the plan has to weigh: a twelve year age span, 13 to 25.',
       'REVISED in 8: unit count and the 1321(h)(1)(C) two-staff interaction recorded against '
       'factors 5 and 6.'),
 '36': (' DISTINCTION WORTH HAVING READY, added in Revision 8. The department houses girls '
        'separately from boys, and someone will reasonably ask why that is lawful if categorical '
        'housing on a listed basis is not, since gender is on the 1352(e) and 1324(k) lists. The '
        'answer is in the operative words. 1352(e) bars separating a youth FROM THE GENERAL '
        'POPULATION or assigning to a SINGLE OCCUPANCY ROOM solely on a listed basis. A girls '
        'unit is a general population assignment and is neither of those things. S-8 is a single '
        'occupancy assignment made solely on a listed basis and is squarely both. Same list, '
        'opposite result, and the difference is the operational consequence rather than the '
        'category. This is the cleanest way to explain the finding to an administrator who '
        'pushes back.',
        'REVISED in 8: added the general population versus single occupancy distinction.'),
 '37': (' Revision 8 adds the housing context that makes this finding bite harder. The department '
        'houses girls separately from boys, so a transgender or intersex youth is the case the '
        'system has no default for, and III.I resolves it by assigning a single room by status '
        'rather than by the individualized determination III.B and III.F require. Where every '
        'other resident is housed in general population by sex, that difference is the whole '
        'finding. Recommended change 2 makes single occupancy the presumptive outcome of the '
        'III.F determination instead.',
        'REVISED in 8: sex-segregated housing context added.'),
 '77': (' PRIORITY RAISED from Medium to High in Revision 8. The department confirmed the '
        'Juvenile Hall houses residents to age 25, so adults are in the main population rather '
        'than an occasional edge case. Once a resident turns 18 CANRA stops applying to them '
        'entirely, because it protects a child, and this becomes the primary reporting pathway '
        'for a substantial part of the population. WIC 15610.23 turns on qualifying physical or '
        'mental limitations rather than on age alone, so it is not automatic and the cross '
        'reference has to say how the determination is made rather than merely pointing at the '
        'dependent adult order.',
        'REVISED in 8: priority Medium to High. Adults are in the main population, so this is '
        'the primary reporting pathway once CANRA drops away.'),
}


def main():
    with open(REG, newline='', encoding='utf-8') as fh:
        rd = csv.DictReader(fh)
        fields = rd.fieldnames
        rows = list(rd)
    by = {r['id']: r for r in rows}

    if any(MARK in r['gap'] for r in rows):
        print('ABORTED. Revision 8 has already been applied to this register.')
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

    by['77']['priority'] = 'High'
    rows.extend(NEW)

    with open(REG, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print('Revision 8 applied. Rows touched: %s. Rows added: %s.'
          % (', '.join(sorted(APPEND, key=int)), ', '.join(n['id'] for n in NEW)))
    print('total   ', len(rows))
    print('status  ', dict(Counter(r['status'] for r in rows)))
    print('priority', dict(Counter(r['priority'] for r in rows)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
