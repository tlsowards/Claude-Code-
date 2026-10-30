#!/usr/bin/env python3
"""Apply Revision 9 to prea-register.csv.

Two inputs, both arriving on the same day:

  1. OO 1352 Classification, eff. 12/09/2019, rev. 02/27/2020, produced and read
     in full (12 pages, scanned, rasterized and read as images). This is the
     order five register rows cite and no revision had ever read. It confirms
     every section number the earlier review recorded, supplies verbatim text
     for conflicts 1, 6 and 11, and corrects one theory in the department's
     favour while supplying a stronger replacement.

  2. The department's answer on residents aged 18 to 25: they are under juvenile
     court jurisdiction, CANRA reaches only persons under 18, and the department
     does not treat them as dependent adults. That resolves open question 14 and
     opens a reporting gap that no produced document addresses.

Self-checking, one-shot, and refuses to run twice.
"""

import csv
from collections import Counter

REG = 'prea-register.csv'
MARK = 'VERIFIED in Revision 9 against OO 1352'

# (status, priority) each touched row must currently carry.
PRE = {
    '31': ('Partial', 'High'),
    '32': ('Not Addressed', 'Critical'),
    '34': ('Addressed', 'Low'),
    '35': ('Partial', 'High'),
    '36': ('Conflict', 'Critical'),
    '77': ('Partial', 'High'),
    '78': ('Conflict', 'High'),
    '80': ('Conflict', 'High'),
    '83': ('Not Addressed', 'Critical'),
    '84': ('Not Addressed', 'Critical'),
    '86': ('Not Addressed', 'High'),
    '87': ('Not Addressed', 'Critical'),
}

V = ' ' + MARK + ', eff. 12/09/2019, rev. 02/27/2020, produced and read in full: '

APPEND = {
 '36': (V +
  'both halves of this conflict are now quotable. II.M "S-8 Other Guidelines" reads in full: "1. Any '
  'Lesbian, Gay, Bisexual, Transgender, Questioning and Intersex (LGBTQI) youth to further protect '
  'against victimization/discrimination within the unit setting. a. See the Transgender and Intersex '
  'Youth Policy for housing guidelines." III.I "S-8 Housing and Security Guidelines" reads in full: '
  '"1. Any youth classified S-8 will require a single room (no roommate) housing at all times." The '
  'Purpose and Scope paragraph tracks 15 CCR 1352(e) almost verbatim, including the carve-out: '
  '"Classification Officers shall not separate youth from the general population or assign youth to a '
  'single occupancy room based solely on the youth\'s actual or perceived race, ethnic group '
  'identification, ancestry, natural origin, color, religion, gender, sexual orientation, gender '
  'identity, gender expression, mental or physical disability, or HIV status. Staff are not prohibited '
  'from placing youth in a single occupancy room at the youth\'s specific request or in accordance with '
  'regulations regarding separation." FIFTH INTERNAL CONTRADICTION, NEW IN REVISION 9: II.M.1.a defers '
  'housing to the Transgender and Intersex Youth Policy, and III.I.1 then mandates single-room housing '
  'at all times. The same order both defers the housing decision and forecloses it. '
  'CORRECTION, AND IT REMOVES A THEORY FROM THIS ROW: Revision 6 recorded a 15 CCR 1352(f) hook '
  'reasoned on the S-series being a sexual-risk taxonomy. THAT REASONING FAILS. The S-series is a '
  'general security taxonomy: S-3 suicide, S-5 mental health, S-6 gang, S-7 medical. And II.M.1 states '
  'S-8\'s purpose as protection "against victimization/discrimination," which is the vulnerability '
  'framing 15 CCR 1350.5 requires, not the abusiveness framing 1352(f) forbids. On its face II.M is '
  'consistent with 1352(f). A STRONGER REPLACEMENT, GROUNDED IN THE ORDER\'S OWN TEXT: III.I.1 and '
  'III.E.1.a are word-for-word identical, both reading "will require a single room (no roommate) '
  'housing at all times," and they are the ONLY two provisions in the entire order imposing that '
  'mandate. III.E.1.a governs S-4 High, which II.F.1 defines by "the youth\'s potential for sexually '
  'acting out against other youth and/or staff" and II.G.1 populates with documented sex offenses. So '
  'the order gives LGBTQI youth the identical housing restriction it reserves for adjudicated sex '
  'offenders, and gives it to no one else. That is the 1352(f) argument, and it no longer depends on '
  'an inference about what the S-series is. It is now a scored element of this row rather than a hook '
  'to test. Page 12 also confirms the chronology: the order "Amends/Replaces Previous Order: '
  'Classification System Title XV 1352, 10/01/2013," so S-8 was created in the 2019 rewrite, five and '
  'a half years after 15 CCR 1352(e) took effect on 04/01/2014, and was signed by the Chief Deputy on '
  '02/27/2020.',
  'VERIFIED in 9 against the produced order: II.M, III.I and the Purpose paragraph quoted verbatim. '
  'Fifth internal contradiction added (II.M.1.a defers housing, III.I.1 forecloses it). CORRECTED in '
  '9: the Revision 6 1352(f) taxonomy theory fails and is withdrawn; replaced by the stronger textual '
  'argument that III.I.1 and III.E.1.a are identical and unique in the order.'),

 '80': (V +
  'the note at II.F.2 reads, in bold in the original: "Youth with a history of victim of molest, arson, '
  'or cruelty to animals should alert the Classification Officer for possible sexually inappropriate '
  'tendencies." The finding is confirmed and the wording is now exact. WORSE THAN RECORDED, NEW IN '
  'REVISION 9: the victim-to-perpetrator inference appears TWICE, not once. Besides the note, II.F.2 '
  'lists the criteria for an S-4 classification as "a. A current sexual offense; b. Prior history of '
  'sexual offense(s); c. Sexual acting out in an institutional/placement setting; d. History of '
  'victimization related to sexual abuse or a sexual offense." Criterion (d) puts the youth\'s own '
  'victimization into the S-4 determination as a lettered criterion, alongside three abusiveness '
  'criteria, independently of the note. Striking the note alone leaves the defect in force. The order '
  'then contradicts itself on the same fact: II.H.3 makes "any youth who has been the victim of any '
  'CPS referral relative to sexual abuse or has been the victim of any sustained sex offense" a '
  'criterion for S-4 Low, which the III.E.2 housing matrix treats protectively. So victimization '
  'history is used once as an abusiveness indicator and once as a vulnerability indicator, in the same '
  'classification, in the same order. The S-4 High and S-4 Low split the register described is '
  'confirmed and is sounder than the label suggests, but II.H.2 undercuts it by placing perpetrator '
  'conduct, "masturbation in front of others, exposing genitals, or continued sexual comments for the '
  'purpose of arousal," in the same Low tier as the two victimization criteria.',
  'VERIFIED in 9 against the produced order: II.F.2 note quoted exactly. EXPANDED in 9: II.F.2.d is a '
  'second, independent instance of the same inference in the lettered criteria, and II.H.3 uses the '
  'same fact for the opposite purpose. Redline 6 struck only the note and has been corrected.'),

 '78': (V +
  'the S-4 High offence list is confirmed and the omission is broader than recorded. II.G.1 reads "Any '
  'documented sex offenses listed below: a. Sodomy (286 PC); b. Lewd or lascivious acts with child '
  'under 14 (288 PC, all sub-divisions)." II.G.3 adds "A rape (261 PC, all sub-divisions) arrest or '
  'adjudication." That is the complete enumeration: 286, 288 and 261. BROADENED IN REVISION 9: PC 287 '
  'is absent as recorded, and so is PC 289, sexual penetration, which is a comparably serious offence '
  'and was never flagged. Also absent: 243.4 sexual battery, 264.1, 285 and 647.6. A youth with a '
  'documented 287 or 289 adjudication does not meet the enumerated S-4 High criteria on the face of '
  'the order. II.C.3 is confirmed as the DJJ reference: it assigns S-1 to "A youth pending Court with a '
  'disposition committing them to the California Department of Corrections and Rehabilitation, Division '
  'of Juvenile Justice (DJJ), or is already committed to the DJJ." IV.A compounds it by giving DJJ as '
  'the worked example of a legal status change requiring classification review.',
  'VERIFIED in 9 against the produced order: II.G.1, II.G.3 and II.C.3 quoted. BROADENED in 9: PC 289 '
  'is also omitted from the S-4 High enumeration, as are 243.4, 264.1, 285 and 647.6. IV.A carries a '
  'second DJJ reference.'),

 '32': (V +
  'the instruments are confirmed. I.B.6 requires the MAYSI-2 be "administered, scored, and an '
  'appropriate response initiated prior to assigning any youth to a housing unit," with the Scores by '
  'Factors report filed. I.B.12 requires the Child and Adolescent Trauma Screen and the Alternatives to '
  'Violence assessment. II.F.1 carries the note "The totality of circumstances will allow the '
  'Classification Officer and/or Supervisor to determine this classification," which confirms that the '
  'S-4 decision is a judgment rather than a scored instrument output. NEW IN REVISION 9, AND IT IS THE '
  'structural point: OO 1352 never once references OO 1350.5, the Screening for the Risk of Sexual '
  'Abuse order, anywhere in its twelve pages. The order that performs the sexual abuse risk screening '
  'and the order that makes the housing, bed and program assignments the screening is supposed to drive '
  'do not cite each other in either direction. 115.341 requires the screening results to inform exactly '
  'those assignments. The link may well exist in practice; it does not exist on paper, and an auditor '
  'tracing a screening result to a housing decision has nothing written to follow.',
  'VERIFIED in 9 against the produced order: I.B.6, I.B.12 and the II.F.1 totality note quoted. NEW in '
  '9: OO 1352 contains no reference to OO 1350.5 anywhere, so the screening-to-classification link is '
  'undocumented in both directions.'),

 '34': (V +
  'the Purpose and Scope paragraph reads "The Classification Officer shall use all information obtained '
  'to subsequently make housing, bed, program, education, and work assignments for youth with the goal '
  'of keeping all youth safe and free from sexual abuse in accordance with the Prison Rape Elimination '
  'Act," confirming the near-verbatim adoption this row credits. I.B.9 to I.B.11 are confirmed as the '
  'assignment and recording duties. The classification factors are enumerated as "age, maturity, '
  'sophistication, emotional stability, program needs, legal status, public safety considerations, '
  'gender and gender identity," on an express "including but not limited to" basis. The tightening step '
  'this row already recommends is now confirmed to be needed in both directions: OO 1352 does not '
  'reference OO 1350.5 either. See row 32.',
  'VERIFIED in 9 against the produced order: Purpose and Scope, I.B.9-11 and the classification factor '
  'list quoted. Status and priority unchanged.'),

 '35': (V +
  'III.E.1.a reads "Any youth classified S-4 high will require a single room (no roommate) housing at '
  'all times" and III.I.1 reads "Any youth classified S-8 will require a single room (no roommate) '
  'housing at all times." The two are word-for-word identical and are the only provisions in the order '
  'imposing that mandate; every other classification is written permissively, with supervisor approval '
  'and documentation in the resident\'s Classification sheet and the unit Red Book. III.D.8 supplies a '
  'general deviation rule: "Deviation from the above housing patterns must be approved and documented '
  'by a supervisor on the classification form." That rule is attached to the S-3 matrix and is not '
  'extended to III.E.1.a or III.I.1, so the two "at all times" mandates have no written override path '
  'at all. OO 1354 is still outstanding.',
  'VERIFIED in 9 against the produced order: III.E.1.a and III.I.1 quoted and confirmed identical. NEW '
  'in 9: the III.D.8 deviation rule is not extended to either "at all times" mandate.'),

 '83': (V +
  'I.B.3 is confirmed: the Classification Officer shall "Check each youth status in the Child Protective '
  'Services (CPS) database and review resident\'s most recent Court Reports and other relevant '
  'information contained in JPIP scanned documents relative to the youth." That is a registry check run '
  'against the YOUTH on admission. Reading the full order confirms the asymmetry this row records: '
  'nothing anywhere in OO 1352 requires any registry or background check of an employee, contractor, '
  'volunteer or intern. The only registry duty in the classification system runs against the children.',
  'VERIFIED in 9 against the produced order: I.B.3 quoted. The absence of any employee or contractor '
  'registry provision is confirmed by reading the full order rather than inferred.'),

 '31': (V +
  'the reassessment cycle is confirmed and is better than this row assumed. V.A requires a classification '
  'review of each youth detained more than ninety days and every ninety days thereafter. V.B requires '
  'review "following any major disciplinary actions or emergency circumstances." V.C requires review on '
  'the request of a Duty Supervisor "regardless of circumstances," or when requested by Mental Health or '
  'Medical staff. IV.A adds review on a legal status change. So there are four independent triggers, '
  'three of them event-driven rather than calendar-driven, and the Mental Health and Medical request '
  'route is the one that matters most for a youth whose vulnerability emerges after intake.',
  'VERIFIED in 9 against the produced order: V.A, V.B, V.C and IV.A quoted. Four reassessment triggers '
  'confirmed, three event-driven. Status held at Partial.'),

 '84': (V +
  'the order does weight age, and this row overstated the gap. The Purpose and Scope paragraph lists '
  '"age, maturity, sophistication, emotional stability, program needs, legal status, public safety '
  'considerations, gender and gender identity" as classification factors on an "including but not '
  'limited to" basis, and III.C.1 provides that "Unit assignments will be based upon security '
  'classification, sophistication, or physical stature." So two of the three 1350.5 factors this row '
  'names, age and physical size and stature, are in the order, and maturity and emotional stability '
  'stand in for the third. STATUS RAISED from Not Addressed to Partial on that basis, which is a change '
  'in the department\'s favour. What remains absent is what the row was really about: there is no '
  'age-based housing RULE anywhere in the order, no threshold, no provision addressing a twelve year '
  'span, and nothing distinguishing a 13 year old from a 25 year old in any of the nine classification '
  'codes. Age is a factor a Classification Officer may weigh. It is not a control. The gap is now a '
  'gap in the rule, not a gap in the factors.',
  'VERIFIED in 9 against the produced order. STATUS RAISED Not Addressed to Partial: the Purpose '
  'paragraph weights age and III.C.1 weights physical stature, so the factors exist. The absence of any '
  'age-based housing rule is unchanged and is now the whole of the finding.'
  ' CORRECTION, NEW IN REVISION 9, AND IT RUNS AGAINST THIS ROW AS REVISION 8 WROTE IT: Revision 8 '
  'stated that nothing in federal or state law keys separation to age in this facility. That was '
  'overbroad. It is true of the Title 15 edition effective 01/01/2019, which was the only thing '
  'searched, but WIC 875 is state law and it carries two age and status keyed controls. 875(j) '
  'provides that a person who is 25 years of age or older "shall not be committed to or detained in a '
  'county juvenile facility, unless the court finds that such a commitment or detention is in the best '
  'interest of that person and does not find that it would create a risk to the other youth in the '
  'juvenile facility," and authorises the juvenile court to order that person into an adult facility '
  'instead. 875(k) imposes the same bar and the same two findings on a person returning to local '
  'custody who was previously sentenced to state prison or committed to the Division of Juvenile '
  'Justice. Neither requires separation inside the facility, and neither is a housing rule, so the '
  'narrow finding survives: the controls are admission and commitment controls, exercised by the '
  'court rather than by the facility. But the broad statement was wrong and is withdrawn. '
  'OPERATIONAL CONSEQUENCE, AND IT IS A QUESTION FOR THE DEPARTMENT: the department has confirmed the '
  'hall houses residents to age 25. 875(j) bites at 25, not at 26, so every resident who is 25 or '
  'older requires a court finding on the record that detention is in that person\'s best interest and '
  'does not create a risk to the other youth. Confirm whether the population in fact tops out at 24, '
  'whether 875(j) findings exist for any resident who is 25 or older, and where they are filed. '
  'Note also 875(a)(3)(E), which requires the court to weigh the ward\'s age, developmental maturity, '
  'mental and emotional health, sexual orientation, gender identity and expression, and any '
  'disabilities or special needs in the suitability finding, which is the same factor set 1350.5 uses '
  'and is further confirmation that the state treats these as placement factors rather than as '
  'classification labels.'),

 '86': (V +
  'reading the order confirms the finding rather than closing it. Nothing in OO 1352 requires housing '
  'separation by sex, nothing keys separation to age, and nothing states the under-16 with over-18 rule '
  'the department applies in practice. The closest the order comes is III.C.1, unit assignment by '
  '"security classification, sophistication, or physical stature," which is a factor and not a rule, and '
  'S-1 at II.C, which is written for male youth only (see row 88). So all three separation controls in '
  'daily use remain undocumented after the one order most likely to have carried them has been read. The '
  'remediation is unchanged and is still the cheapest in this register.',
  'VERIFIED in 9 against the produced order: no sex-based or age-based separation rule appears anywhere '
  'in OO 1352. The finding is confirmed by reading rather than inferred from non-production.'),

 '87': (' RESOLVED IN PART IN REVISION 9, on the department\'s own answer: residents aged 18 to 25 are '
  'under juvenile court jurisdiction, but CANRA reaches only persons under 18, and THE DEPARTMENT DOES '
  'NOT TREAT THEM AS DEPENDENT ADULTS. Jurisdiction is not age: PC 11165 defines a child as a person '
  'under 18 and the 11166(a) duty arises only on suspicion that a child has been abused, so a resident '
  'over 18 under juvenile court jurisdiction is not a child. With the dependent adult route closed by '
  'departmental position, WIC 15630 does not reach them either. The consequence is the finding, and no '
  'produced document states it: WHERE BOTH RESIDENTS ARE 18 OR OVER THERE IS NO MANDATED EXTERNAL '
  'REPORTING DUTY OF ANY KIND. What remains is not nothing, and the distinction is operational. Every '
  'PREA duty is age-neutral because a resident is a resident under the subpart D definitions, so '
  '115.361(a), 115.371(a), 115.362 and 115.367 apply identically to a 24 year old. The external route is '
  'the Sheriff rather than CPS: 15 CCR 1453 requires reporting sexual assaults occurring in the facility '
  'to local law enforcement, age-neutrally, and OO 1453 I.A.8 implements it. But the two duties are not '
  'equivalent and the differences all run the same way. CANRA triggers on reasonable suspicion, binds '
  'the individual employee, and carries personal criminal exposure under 11166(c). OO 1453 I.A.8 '
  'triggers on a belief that a sexual assault occurred, binds the Duty Supervisor rather than the '
  'employee who saw it, and carries departmental consequences only. Threshold up, duty displaced off the '
  'individual, personal exposure gone, all at once, and silently. The OO 1453 trigger is also sexual '
  'assault only, so for two adult residents the harassment, exposure and masturbation-in-view tiers have '
  'no external reporting route at all. Written into the supervisor guide in Revision 9 as the three ages '
  'question asked before the tier chart.',
  'MATERIALLY REVISED in 9 on the department\'s confirmed position. Open question 14 resolved: no '
  'dependent adult route. New finding: no mandated external reporting duty where both residents are 18 '
  'or over, and the OO 1453 I.A.8 substitute differs from CANRA in threshold, in who is bound and in '
  'enforcement.'),

 '77': (' MATERIALLY REVISED IN REVISION 9. The department has confirmed that it DOES NOT treat residents '
  'aged 18 to 25 as dependent adults. That position is defensible as a general matter: WIC 15610.23(b) '
  'reaches persons 18 to 64 admitted as inpatients to a 24-hour health facility as defined by Health and '
  'Safety Code sections 1250, 1250.2 and 1250.3, and a juvenile hall is not one, so detention alone does '
  'not create dependent adult status. The difficulty is that 15610.23(a) is an INDIVIDUALIZED test, not '
  'a categorical one: a person 18 to 64 "who has physical or mental limitations that restrict his or her '
  'ability to carry out normal activities or to protect his or her rights," expressly including persons '
  'with developmental disabilities. A blanket departmental position answers categorically a question the '
  'statute asks one resident at a time, which is structurally the same defect as S-8 at row 36. '
  'SHARPENED by OO 1352, produced in Revision 9: S-5 Mental Health at II.I covers "limited functioning '
  'abilities, which would affect the youth\'s adjustment to a unit program," youth with prescribed '
  'psychotropic medication, and youth "susceptible to victimization within the unit setting, due to '
  'limited functioning and/or psychological problems." That tracks the 15610.23(a) description closely, '
  'so the department\'s own classification system already identifies the residents for whom the '
  'categorical position is weakest. The question for County Counsel is therefore narrow and answerable: '
  'not whether detained adults are dependent adults, but whether a resident over 18 carrying an S-5 '
  'classification is one. If the answer is yes, WIC 15630 supplies the mandated reporting duty that row '
  '87 finds missing for adult residents, and it reaches sexual assault through the WIC 15610.63 '
  'definition of physical abuse.',
  'MATERIALLY REVISED in 9. The department confirmed it does not treat 18 to 25 year olds as dependent '
  'adults. Recorded with the 15610.23(a) individualized-test objection and narrowed to the S-5 question, '
  'using OO 1352 II.I produced in this revision.'),
}

NEW = [
 {
  'id': '88',
  'area': 'Screening and Classification',
  'cfr_28_subpart_d': '115.341(a)-(e); 115.342(a)',
  'ca_title15_or_statute': '15 CCR 1324(k), 1352(e)',
  'requirement': ('Classification criteria that drive housing and security placement must be available '
   'to every resident the criteria describe, without regard to a basis the non-discrimination rule '
   'protects.'),
  'county_document': 'OO 1352 II.C (S-1 Security Risk Classification); III.B',
  'status': 'Not Addressed',
  'gap': (MARK + ', eff. 12/09/2019, rev. 02/27/2020: the S-1 high security classification is written '
   'for male youth only. II.C opens, in bold in the original, "Any male youth who meets the following '
   'criteria will be housed in a high-security unit, unless otherwise approved by a Duty Supervisor," '
   'and then lists the criteria: five or more major incident reports during previous stays, an arrest '
   'or adjudication for assault on staff or another youth resulting in serious injury or death, a major '
   'incident report for assaultive behaviour involving a weapon, repetitive assaultive behaviour or '
   'security breaches, a DJJ commitment, escape or attempted escape, a WIC 707(b) offence, and transfer '
   'to adult court. Every one of those criteria is behavioural or legal and none is sex-specific. No '
   'equivalent classification exists anywhere in the order for a female youth who meets them, and S-2 '
   'is not an equivalent because III.B carries restrictions, escorted movement and non-contact visiting, '
   'that III.C does not. The consequence is that a female youth with an assault adjudication and five '
   'major incident reports has no high security classification path on the face of the order, which is '
   'both a safety gap for the youth around her and a gender-based difference in treatment on a basis 15 '
   'CCR 1324(k) and 1352(e) both list. This may reflect physical plant rather than intent: the '
   'department has confirmed girls are housed separately from boys in a facility with 17 units of which '
   '12 are in use, and there may simply be no female high security unit. That is worth confirming, '
   'because the answer determines whether the fix is a drafting correction or a capacity decision. '
   'Either way the order should state the rule that actually applies to female youth meeting the II.C '
   'criteria rather than leaving them outside the classification.'),
  'priority': 'High',
  'change_log': 'NEW in 9, from OO 1352 produced and read in full.',
  'owner': '', 'target_date': '', 'disposition': '',
 },
 {
  'id': '89',
  'area': 'Screening and Classification',
  'cfr_28_subpart_d': '115.341 (controls on dissemination of screening information)',
  'ca_title15_or_statute': ('15 CCR 1350.5 (dissemination controls), 1352(e), 1324(k); '
   'Health and Safety Code 121070'),
  'requirement': ('Sensitive information obtained through screening and classification must be '
   'disseminated under appropriate controls so that it is not exploited to the resident\'s detriment by '
   'staff or other residents.'),
  'county_document': 'OO 1352 II.K.4-5 and II.K.5.a-b (S-7 Communicable Disease Log); III.H.2',
  'status': 'Not Addressed',
  'gap': (MARK + ', eff. 12/09/2019, rev. 02/27/2020: the order requires a daily log naming residents '
   'and their medical conditions and distributes it across the facility. II.K.4 requires the '
   'Classification Officer to create an S-7 Communicable Disease Log daily, and provides that "The S-7 '
   'Log will document the exact medical condition. (i.e., active TB, Hepatitis, Chicken Pox etc.)" '
   'II.K.5 requires a hard copy disseminated daily "to Intake, each YDF Housing Unit, Visitors Center, '
   'SCOE, Mental Health, Youth Advocates, Recreational Therapists, and the Kitchen by 0700 each day." '
   'II.K.5.a requires it placed "on a designated clipboard in the unit," available to Probation staff, '
   'Youth Advocates, contract employees, SCOE staff, Mental Health staff and volunteers. II.K.5.b '
   'requires it faxed to the Juvenile Court Expeditor and the Sheriff\'s Bailiffs. III.H.2 lists HIV '
   'first among the S-7 conditions. The order cites Health and Safety Code 121070 as its authority. Two '
   'concerns, and the first is primarily a state medical confidentiality question for County Counsel '
   'rather than a PREA finding. HIV status is named on the 15 CCR 1352(e) and 1324(k) protected lists, '
   'and a named daily list of residents and their exact conditions, on an open clipboard reaching '
   'volunteers, kitchen staff and bailiffs, is a wide distribution to test against 121070 and against '
   'the HIV confidentiality provisions. The PREA adjacency is narrower but real: 15 CCR 1350.5 requires '
   'controls on dissemination so screening information is not "exploited to the youth\'s detriment by '
   'staff or other youth," and 28 CFR 115.341 carries a materially similar control. The subsection '
   'lettering inside 115.341 has not been verified from this environment and is described by content '
   'rather than cited, for the reason recorded at open question 12. SECOND DEFECT, SAME PROVISION: the '
   'order assigns duties to "Youth Advocates" at II.K.5 and again at II.K.5.a, a role that no longer '
   'exists. That is the same defect class as the PREA Coordinator reference at row 2, which is scored '
   'as a conflict: an operations order routing a live duty to a position the department does not have. '
   'Here it is a distribution list rather than a report, so it is recorded in this row rather than '
   'scored separately, but it should be corrected in the same amendment.'),
  'priority': 'High',
  'change_log': 'NEW in 9, from OO 1352 produced and read in full.',
  'owner': '', 'target_date': '', 'disposition': '',
 },
 {
  'id': '90',
  'area': 'California-Specific',
  'cfr_28_subpart_d': '115.311(c); 115.313(a); 115.342(a)-(b)',
  'ca_title15_or_statute': ('WIC 875(g)(3)-(4), 875(j)-(k), 875(c)(1)(A), 875(a)(3)(E); WIC 209; '
   'BSCC Title 15 regulation text rev. 01/2023 and matrix rev. 08/14/2025, neither produced'),
  'requirement': ('Where a county operates a secure youth treatment facility, or a unit of a juvenile '
   'hall configured as one, comply with the BSCC standards governing its establishment, security, '
   'programming and staffing, including the standards specifying how the facility separates secure '
   'youth treatment wards from other detained juveniles.'),
  'county_document': 'None produced. No reviewed document references WIC 875 or a secure youth treatment facility.',
  'status': 'Not Evidenced',
  'gap': ('NEW IN REVISION 9, from WIC 875 as it currently stands. This row exists because the age span '
   'the department confirmed in Revision 8 is a product of SB 823 realignment, and the statute that '
   'produced it carries duties no reviewed document mentions. WIC 875(c)(1)(A) sets the outer limits: a '
   'ward committed to a secure youth treatment facility "shall not be held in secure confinement beyond '
   '23 years of age, or two years from the date of the commitment, whichever occurs later," extending '
   'to 25 years of age where the offence would carry an aggregate adult sentence of seven or more '
   'years. That is where a 13 to 25 population comes from. 875(g)(2) provides that such a facility "may '
   'be a unit or portion of an existing county juvenile facility, including a juvenile hall," so the '
   'question is whether any YDF unit is configured as one. THE PROVISION THAT MATTERS MOST HERE IS '
   '875(g)(3): the Board of State and Community Corrections was required by July 1, 2023 to modify or '
   'add standards for the establishment, design, security, programming and education, and staffing of '
   'any facility used as a secure youth treatment facility, developed with the concurrence of the '
   'Office of Youth and Community Restoration, and "The standards shall specify how the facility may be '
   'used to serve or to separate juveniles, other than juveniles described in subdivision (a) serving '
   'baseline confinement terms, who may also be detained in or committed to the facility or to some '
   'portion of the facility." That is an express state separation mandate, directed at exactly the '
   'mixed population this register has been documenting since Revision 8, and it is the provision '
   'Revision 8 should have found and did not. 875(g)(4) adds a BSCC biennial inspection under WIC 209 '
   'of each such facility. VERIFICATION GAP, AND IT IS THE LARGEST ONE LEFT IN THIS REGISTER: the only '
   'Title 15 editions read for this project are rev. 04/01/2014 and eff. 01/01/2019. BSCC has published '
   'at least two later artefacts, a Minimum Standards for Juvenile Facilities regulation text revised '
   '01/2023 and a standards matrix revised 08/14/2025, and has run an SYTF subcommittee of its Juvenile '
   'Regulations Revision Executive Steering Committee. The 01/01/2019 edition predates SB 823 '
   'realignment, the closure of DJJ, and any 875(g)(3) standards entirely. Every Title 15 citation in '
   'this register is verified against the 2019 edition and none is verified against the current one. '
   'Scored Not Evidenced rather than Not Addressed because the governing standard has not been '
   'produced, so whether the department complies cannot be assessed either way. Obtain the current '
   'BSCC juvenile regulations and confirm first whether any YDF unit operates as a secure youth '
   'treatment facility. If one does, the separation standards under 875(g)(3) are directly on point '
   'for rows 84 and 86 and may already supply the written rule those rows say is missing. '
   'ONE THING THIS ROW DOES NOT REST ON: SB 824 (Menjivar, 2025-2026), which would have amended 875 to '
   'add transition planning duties to the individual rehabilitation plan, FAILED on February 2, 2026, '
   'returned to the Secretary of the Senate under Joint Rule 56. Nothing in it is law and nothing in '
   'this row depends on it. The provisions quoted above are existing law that SB 824 left untouched.'),
  'priority': 'High',
  'change_log': 'NEW in 9, from WIC 875 and the confirmed failure of SB 824.',
  'owner': '', 'target_date': '', 'disposition': '',
 },
]

DOCFIX = {
 '84': ('OO 1352 (Classification), never produced; OO 1350.5; OO 1354, never produced',
        'OO 1352 (Classification), Purpose and Scope, III.C.1; OO 1350.5; OO 1354, never produced'),
 '86': ('None identified. OO 1352 never produced.',
        'None identified. OO 1352 produced and read in Revision 9: it contains no separation rule.'),
}


def main():
    with open(REG, newline='', encoding='utf-8') as fh:
        rd = csv.DictReader(fh)
        fields = rd.fieldnames
        rows = list(rd)
    by = {r['id']: r for r in rows}

    if any(MARK in r['gap'] for r in rows):
        print('ABORTED. Revision 9 has already been applied to this register.')
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
    for rid, (old, _new) in DOCFIX.items():
        if rid in by and by[rid]['county_document'] != old:
            errs.append('row %s: county_document is not the expected prior text' % rid)
    if errs:
        print('ABORTED, nothing written:')
        for e in errs:
            print('  ' + e)
        return 1

    for rid, (extra, note) in APPEND.items():
        r = by[rid]
        r['gap'] = r['gap'].rstrip() + extra
        r['change_log'] = (r['change_log'] + ' ' + note).strip()
    for rid, (_old, new) in DOCFIX.items():
        by[rid]['county_document'] = new

    by['84']['status'] = 'Partial'
    rows.extend(NEW)

    with open(REG, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print('Revision 9 applied. Rows touched: %s. Rows added: %s.'
          % (', '.join(sorted(APPEND, key=int)), ', '.join(n['id'] for n in NEW)))
    print('row 84 status raised Not Addressed -> Partial')
    print('total   ', len(rows))
    print('status  ', dict(Counter(r['status'] for r in rows)))
    print('priority', dict(Counter(r['priority'] for r in rows)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
