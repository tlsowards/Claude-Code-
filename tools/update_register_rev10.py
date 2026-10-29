#!/usr/bin/env python3
"""Apply Revision 10 to prea-register.csv.

OO 1453 Sexual Assault, eff. 04/25/2013, last revised 12/09/2019, produced and
read in full for the first time. Three pages, scanned, rasterized at 200 dpi and
read as images.

Every I.A citation the register carried from the earlier review is confirmed
verbatim. The order also contains a provision no revision had recorded, I.A.6,
which directs the duty supervisor to take an initial statement from the victim
and the suspect and to Mirandize the suspect. That provision is a new conflict
against WIC 625.6, and it corrects the supervisor role matrix published on
10/29, which told supervisors not to conduct fact finding.

Self-checking, one-shot, and refuses to run twice.
"""

import csv
from collections import Counter

REG = 'prea-register.csv'
MARK = 'VERIFIED in Revision 10 against OO 1453'

PRE = {
    '2':  ('Conflict', 'Critical'),
    '16': ('Partial', 'High'),
    '17': ('Partial', 'Medium'),
    '18': ('Partial', 'High'),
    '19': ('Partial', 'High'),
    '47': ('Partial', 'High'),
    '48': ('Conflict', 'Critical'),
    '53': ('Partial', 'High'),
    '54': ('Partial', 'Medium'),
    '67': ('Partial', 'High'),
    '69': ('Partial', 'High'),
}

V = ' ' + MARK + ', eff. 04/25/2013, last revised 12/09/2019, produced and read in full: '

APPEND = {
 '48': (V + 'the error is confirmed word for word. I.A.9 reads: "All incidents of sexual assault '
  'shall be reported to Child Protective Services verbally within 24 hours. A formal written '
  'reported shall be completed and forwarded to Child Protective Services within 36 hours of '
  'receiving information concerning the incident." The 24 hour figure is the order\'s own text, not '
  'a paraphrase, and the typographical error in "written reported" is also the order\'s. PC 11166(a) '
  'requires the telephone report immediately or as soon as is practicably possible. The 36 hour '
  'written figure is correct. Note also the scope limiter that runs through the whole order: the '
  'duty attaches to "all incidents of sexual assault," so on the face of the order the touching, '
  'exposure and masturbation tiers do not trigger it even where 11165.1(b)(4) and (b)(5) require a '
  'report. Redline 3 should correct the timeline and the scope in the same amendment.',
  'VERIFIED in 10 against the produced order: I.A.9 quoted verbatim. The conflict is confirmed and '
  'now carries the order\'s own words. New: the order\'s scope limiter means the CPS duty as written '
  'does not reach conduct short of sexual assault.'),

 '2': (V + 'I.A.15 is confirmed word for word: "At the conclusion of the sexual assault '
  'investigation, an incident review shall be conducted by upper management officials, with input '
  'from supervisors, investigators, and medical or mental health practitioners. A report shall be '
  'generated and forwarded to the PREA coordinator and Department Chief." The dead letter is the '
  'order\'s own text. The report has a second addressee that does exist, the Department Chief, so '
  'the interim fix is to route it there and note the vacancy in the report itself.',
  'VERIFIED in 10 against the produced order: I.A.15 quoted verbatim, including the reference to a '
  'PREA coordinator the department does not have.'),

 '53': (V + 'the first responder duties are confirmed and the wording is now exact. I.A.1: '
  '"Separate the victim and suspect immediately and ensure that the victim and suspect have no '
  'contact with one another (no access to toilet, see #5 below)." I.A.3: "Unit staff shall protect '
  'the crime scene (youth\'s room/shower area/laundry room, etc.) by sealing off the area and not '
  'allowing access by other staff or youth." I.A.4: "Prevent the victim and suspect from showering." '
  'I.A.5: "If possible, keep the victim and suspect from using the bathroom. If they use the '
  'bathroom, the toilet tissue shall be collected as evidence." I.A.2 adds a step no revision had '
  'recorded: "Immediately notify the Supervisor on duty. The Supervisor on Duty shall notify a '
  'facility Chief Deputy or Assistant Chief Deputy." The 115.364(b) gap, the distinct duties of a '
  'non-security first responder, is confirmed absent.',
  'VERIFIED in 10 against the produced order: I.A.1 and I.A.3 to I.A.5 quoted verbatim. I.A.2, the '
  'notification chain to a Chief Deputy or Assistant Chief Deputy, is new to this register.'),

 '19': (V + 'confirmed. I.A.8: "If after initial inquiry it is believed a sexual assault occurred, '
  'the Sheriff\'s Department will be notified immediately by the duty Supervisor in order to take a '
  'report." I.A.10: "The reporting/investigating officer (usually a Supervisor) shall brief the '
  'responding Sheriff\'s officers upon their arrival. Sheriff\'s officers will be provided with a '
  'room to conduct any interviews." I.A.14: "If a consensual sex act occurred, all discovery and '
  'investigative reports are to be forwarded to the Supervising District Attorney and the Sacramento '
  'Sheriff\'s Sexual Assaults Unit." Two phrases in I.A.8 and I.A.10 matter and were not previously '
  'recorded. The Sheriff trigger is conditioned on an "initial inquiry" by the facility, and the '
  'parenthetical "(usually a Supervisor)" confirms that the department treats the Duty Supervisor as '
  'the investigating officer. See row 91, which is where that leads.',
  'VERIFIED in 10 against the produced order: I.A.8, I.A.10 and I.A.14 quoted verbatim. New: the '
  'Sheriff trigger runs through an "initial inquiry" by the facility, and I.A.10 names the Supervisor '
  'as the usual investigating officer.'),

 '16': (V + 'the fallback evidence protocol is confirmed word for word. I.A.11: "If the Sheriff\'s '
  'Department, C.S.I. (Crime Scene Investigations) or detectives cannot respond immediately, the duty '
  'supervisor may need to collect evidence," followed by (a) photograph crime scene, (b) "After '
  'putting gloves on, collect evidence, clearly marking date, time, location, ownership and '
  'description of item," and (c) "Seal all evidence bags and envelopes, log items and place evidence '
  'in the evidence locker located in the Property Room at Intake/Booking." I.A.12 is new to this '
  'register: "Non-consensual sexual assault suspects shall undergo a \'suspect rape exam\', which '
  'shall be the responsibility of the Sheriff\'s Department as the investigating agency." The '
  '115.321(a) gap stands: the protocol is a chain of custody procedure, not a uniform evidence '
  'protocol developmentally appropriate for youth and adapted from the DOJ OVW national protocol.',
  'VERIFIED in 10 against the produced order: I.A.11 quoted verbatim. I.A.12, the suspect rape exam '
  'and its assignment to the Sheriff, is new to this register.'),

 '17': (V + 'I.A.13 is confirmed: victims "shall be transported by a Transportation Officer, or '
  'designated staff appointed by the duty Supervisor (taking gender into consideration), to a local '
  'medical facility for an evidentiary exam." The off-site requirement is satisfied. The gaps stand '
  'unchanged: no SAFE or SANE preference, no documentation of efforts to secure one, and no express '
  'statement that the examination is provided without financial cost to the youth.',
  'VERIFIED in 10 against the produced order: I.A.13 transport and off-site examination confirmed.'),

 '18': (V + 'I.A.13 is confirmed and it is stronger than this row credited, but its scope is '
  'narrower than assumed and that correction matters. The order states: "Pursuant to Section 264.2 of '
  'the California Penal Code, a sexual assault victim has the right to have a victim advocate and/or '
  'victim support person, of the victim\'s choosing, present during their medical examination. In '
  'most cases, the victim advocate will be from a local Rape Crisis Center. Sheriff\'s Officers will '
  'follow Youth Detention Facility staff to the Med Center and fill out all necessary paperwork. '
  'Pursuant to Section 679.04, a sexual assault victim has the right to have a victim advocate and/or '
  'victim support person, of the victim\'s choosing, present during all investigatory interviews '
  'conducted by law enforcement, the district attorney, or defense counsel." CORRECTION TO THIS '
  'PROJECT\'S OWN WORK: the supervisor guide and the field card have treated the 679.04 right as '
  'attaching to investigatory interviews generally. As the order recites the statute, and as the '
  'statute reads, it attaches to interviews conducted by LAW ENFORCEMENT, THE DISTRICT ATTORNEY OR '
  'DEFENSE COUNSEL. It does not on its face reach the initial statement the duty supervisor is '
  'directed to take under I.A.6. That makes the I.A.6 problem worse rather than better, because the '
  'one interview the order actually assigns to facility staff is the one with no advocate right '
  'attached to it. See row 91. The 115.321(d) and (e) gaps stand: the agency must ATTEMPT to make an '
  'advocate available rather than treat it as a right the victim invokes, and must document those '
  'efforts.',
  'VERIFIED in 10 against the produced order: I.A.13 quoted verbatim. CORRECTION: PC 679.04 as '
  'recited reaches interviews by law enforcement, the DA or defense counsel, not the duty '
  'supervisor\'s I.A.6 initial statement. This project had stated it more broadly.'),

 '69': (V + 'I.A.15 confirmed verbatim, and the credit this row gives is correct: upper management '
  'officials conduct the review with input from supervisors, investigators, and medical or mental '
  'health practitioners, and a written report is generated. Two limits are now exact rather than '
  'inferred. The trigger is "at the conclusion of the sexual assault investigation," so on the face '
  'of the order a review is not required where no investigation occurred, where the conduct was not '
  'characterised as sexual assault, or for sexual harassment at all. And the report is addressed to '
  'the PREA coordinator and the Department Chief, the first of whom does not exist.',
  'VERIFIED in 10 against the produced order: I.A.15 quoted verbatim. The review trigger is confirmed '
  'as limited to sexual assault investigations.'),

 '54': (V + 'reading the whole order confirms this row\'s central finding and sharpens it. The order '
  'is titled Sexual Assault, its stated Authority is the Prison Rape Elimination Act, and every '
  'operative provision is keyed to "sexual assault." The Purpose paragraph makes employees '
  'responsible for reporting information or suspicion "that a youth is being, or has been sexually '
  'assaulted." I.A.9 reports "all incidents of sexual assault" to CPS. I.A.15 triggers the review at '
  'the conclusion of "the sexual assault investigation." Nothing in the three pages addresses sexual '
  'harassment, exposure, or touching not characterised as assault. So the department has a coordinated '
  'response plan in all but name for the most serious band and nothing written for the band that '
  'actually generates most incidents. That is the gap to close, and it is a scope amendment to an '
  'order that otherwise works rather than a new document.',
  'VERIFIED in 10 against the produced order: the sexual assault scope limiter is confirmed across '
  'the Purpose paragraph, I.A.9 and I.A.15. The coordinated response plan credit stands.'),

 '47': (V + 'the Purpose and Scope paragraph is confirmed word for word: "All employees are '
  'responsible for protecting youth in their custody/care and are responsible for the immediate and '
  'confidential reporting to the duty supervisor any information and/or suspicion that indicates a '
  'youth is being, or has been sexually assaulted." Immediate, confidential, to the duty supervisor, '
  'on information or suspicion. That is a real and well drafted duty. The three gaps this row records '
  'are confirmed by reading the full order: sexual harassment is not a separately reportable category '
  'anywhere in it, retaliation is not mentioned, and staff neglect or violation of responsibilities '
  'contributing to an incident is not mentioned.',
  'VERIFIED in 10 against the produced order: the staff reporting duty quoted verbatim from the '
  'Purpose paragraph. All three recorded gaps confirmed by reading the full order.'),

 '67': (V + 'I.A.13 confirms the evidentiary examination and the transport arrangement, and I.A.7 '
  'adds a provision not previously recorded: "When interacting with the alleged victim of sexual '
  'assault, staff are expected to be professional and display sensitivity towards the victim as the '
  'trauma may affect them both physically, emotionally and mentally." That is a trauma informed '
  'instruction and it is worth crediting. The gaps stand: emergency contraception and STI '
  'prophylaxis, the no-cost provision, and the rule that treatment does not depend on naming the '
  'abuser or cooperating with the investigation.',
  'VERIFIED in 10 against the produced order. I.A.7, the trauma informed interaction instruction, is '
  'new to this register and is credited.'),
}

NEW = [
 {
  'id': '91',
  'area': 'Response and Investigation',
  'cfr_28_subpart_d': '115.334; 115.371(a)-(b); 115.321(d)-(e)',
  'ca_title15_or_statute': 'WIC 625.6 (as amended by SB 203, eff. 01/01/2021); PC 679.04; Evidence Code 780',
  'requirement': ('Where policy directs facility staff to question a youth suspected of an offence, '
   'that direction must account for the mandatory consultation with counsel that California requires '
   'before any custodial interrogation of a youth 17 or younger, and for the training the '
   'investigation standard requires of whoever conducts it.'),
  'county_document': 'OO 1453 I.A.6; I.A.8 ("after initial inquiry"); I.A.10 ("usually a Supervisor")',
  'status': 'Conflict',
  'gap': (MARK + ', produced and read in full. THIS IS THE THIRTEENTH CONFLICT AND IT WAS NOT '
   'PREVIOUSLY RECORDED IN ANY REVISION. I.A.6 reads in full: "The duty supervisor shall take an '
   'initial statement from the victim and suspect. All suspects involved in a sexual assault shall be '
   'read a \'Miranda Warning\', prior to any questioning." Two further provisions confirm this is the '
   'department\'s deliberate design rather than an aside: I.A.8 conditions the Sheriff notification on '
   'what is believed "after initial inquiry," and I.A.10 refers to "the reporting/investigating '
   'officer (usually a Supervisor)." THE DEFECT: WIC 625.6, as amended by SB 203 and effective '
   '01/01/2021, requires that a youth 17 years of age or younger consult with legal counsel, in '
   'person, by telephone or by video conference, BEFORE a custodial interrogation and BEFORE waiving '
   'any Miranda rights, and that consultation MAY NOT BE WAIVED. Before SB 203 the rule reached only '
   'youth 15 or younger, and the earlier provision carried a sunset that SB 203 removed. OO 1453 was '
   'last revised 12/09/2019, more than a year before SB 203 took effect, and it has not been updated. '
   'As written the order directs a supervisor to Mirandize and question a youth suspect with no '
   'mention of the consultation the statute makes mandatory and unwaivable. The consequences are not '
   'abstract: WIC 625.6(b) directs courts to weigh noncompliance in deciding whether the youth\'s '
   'statements are admissible, and to consider a willful violation when assessing the officer\'s '
   'credibility under Evidence Code 780. A supervisor following this order to the letter can suppress '
   'the department\'s own case and damage their own credibility as a witness. SECOND DEFECT, PREA '
   'SIDE: 115.334 requires specialized training for those who conduct sexual abuse investigations, and '
   'nothing in the order conditions the I.A.6 statement on that training. THIRD, AND IT IS THE ONE '
   'MOST EASILY MISSED: the PC 679.04 advocate right that I.A.13 correctly recites attaches to '
   'investigatory interviews conducted by law enforcement, the district attorney or defense counsel. '
   'It does not on its face reach the I.A.6 initial statement. So the one interview the order assigns '
   'to facility staff is the only one in the sequence with no advocate right attached. '
   'THIS CORRECTS THIS PROJECT\'S OWN PUBLISHED WORK. The supervisor role matrix issued on 10/29 told '
   'supervisors they do not conduct fact finding and do not interview. That is contradicted by the '
   'department\'s own governing order, which had not been produced when the matrix was written. The '
   'stop-point moves rather than disappearing: taking an initial statement from the victim and the '
   'suspect is directed by I.A.6, and canvassing further witnesses to test whether the allegation is '
   'true is not directed anywhere and is what belongs to a trained investigator. The remedy is an '
   'amendment to I.A.6 adding the 625.6 consultation, not advice to supervisors to ignore the order.'),
  'priority': 'Critical',
  'change_log': 'NEW in 10, from OO 1453 produced and read in full. Thirteenth conflict.',
  'owner': '', 'target_date': '', 'disposition': '',
 },
]


def main():
    with open(REG, newline='', encoding='utf-8') as fh:
        rd = csv.DictReader(fh)
        fields = rd.fieldnames
        rows = list(rd)
    by = {r['id']: r for r in rows}

    if any(MARK in r['gap'] for r in rows):
        print('ABORTED. Revision 10 has already been applied to this register.')
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

    print('Revision 10 applied. Rows touched: %s. Rows added: %s.'
          % (', '.join(sorted(APPEND, key=int)), ', '.join(n['id'] for n in NEW)))
    print('total   ', len(rows))
    print('status  ', dict(Counter(r['status'] for r in rows)))
    print('priority', dict(Counter(r['priority'] for r in rows)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
