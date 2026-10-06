# YDF PREA Compliance Project

Sacramento County Probation Department, Youth Detention Facility. PREA policy review,
remediation drafting, and training development. This file is the project memory. Read it
before doing anything else.

---

## 1. Working rules (non-negotiable)

- **Never use em dashes.** Use commas, colons, or rewrite the sentence.
- **No hallucination.** If you are not sure, say so and ask. Do not assume.
- **Verify before asserting.** Statute numbers, section numbers, case citations, and dates
  get checked, not recalled. This work product goes to administrators, County Counsel, and
  potentially into litigation. A wrong citation is worse than no citation.
- **Distinguish "not in the documents" from "not done."** The department frequently performs
  a practice that is not written down. Findings say "does not appear in the documents
  reviewed," never "the department fails to."
- **Flag corrections loudly.** When a new document changes an earlier finding, say so
  explicitly and record it in the change log column. See section 8 for corrections already made.
- **This is not legal advice.** Every deliverable carries that caveat and routes statutory
  questions to County Counsel.

## 2. Who the user is

Tim. 25-year Sacramento County Probation veteran, currently assigned to YDF in a
supervisory and administrative capacity. Owns use of force training, PREA compliance work,
and the FTO program. PhD in Public Policy and Administration, MS in Criminal Justice,
STC-certified instructor, teaches criminal justice at several colleges. Runs Sowards
Consulting LLC doing expert witness work, use of force training, and corrections consulting.

Practical consequence: he knows use of force, Title 15, and juvenile detention operations
cold. Do not explain Graham, Kingsley, or Title 15 basics to him. Do explain PREA standards
in detail, since that is the subject he is building expertise in. He wants substance, not
hedging, and he will catch a wrong citation.

## 3. Project state

Register is at **Revision 9**. 90 requirements assessed against 17 departmental policies.

Revision 6 verified against the Title 15 edition **effective 01/01/2019** and corrected three
citations. Revision 7 closed the gap it left, re-reading the six sections still carrying their
04/01/2014 provenance. **Every Title 15 citation in this register is verified against the current
edition.**

**Revision 8 is the first pass driven by facility facts rather than documents.** See section 15
for the facts and what they produced: four new rows (84 to 87) and one priority raised.

**Revision 9 is the largest single pass since Revision 4**, and it rests on three things that
arrived on one day: **OO 1352 Classification, produced and read in full for the first time**; the
department's answer that residents aged 18 to 25 are **not treated as dependent adults**; and
**WIC 875**, which corrects a Revision 8 finding. Twelve rows revised, three added (88 to 90), one
status raised (row 84, Not Addressed to Partial). See section 16.

| Status | Count |
|---|---|
| Addressed | 14 |
| Partial | 41 |
| Not Addressed | 21 |
| Conflict (policy states the wrong rule) | 12 |
| Not Evidenced (document exists, not produced) | 2 |

Priority: 21 critical, 39 high, 16 medium, 14 low.

Full register with gap text is in `prea-register.csv`. Columns `owner`, `target_date`, and
`disposition` are empty and intended for the department to fill.

## 4. Documents reviewed (17)

| # | Document | Dates |
|---|---|---|
| 1 | PREA Policy and Procedure, Juvenile Institutions | eff/rev 04/25/2013 |
| 2 | OO 1321 Staffing | reviewed 01/16/2020 |
| 3 | OO 1322 Training and Staff Development | eff 06/15/2015, rev 05/08/2019 |
| 4 | OO 1350.5 Screening for the Risk of Sexual Abuse | eff 11/10/2019 |
| 5 | OO 1352 Classification | eff 12/09/2019, rev 02/27/2020. **Produced and read in full in Revision 9** |
| 6 | OO 1352.5 Transgender and Intersex Youth | eff 03/01/2019 |
| 7 | OO 1360 Searches | eff 12/01/2019, rev 03/04/2020 |
| 8 | OO 1361 Grievances | eff 01/01/2011, rev 04/03/2019 |
| 9 | OO 1362 Reporting of Incidents | eff 11/01/2019 |
| 10 | OO 1453 Sexual Assault | eff 04/25/2013, rev 12/09/2019 |
| 11 | Internal Affairs Administrative Investigations | eff 01/11/2011, no revision |
| 12 | Code of Conduct, Non-Sworn and Non-County Personnel | eff 06/01/2011 |
| 13 | Detention and Intake Responsibility (J-3.4) | undated |
| 14 | General Order, Mandatory Reporting: Dependent Adult and Elder Abuse | eff 06/30/2017 |
| 15 | OO 1354.5 Room Confinement | eff 04/05/2023 |
| 16 | OO 1390/1391 Discipline and Discipline Process | eff 10/01/2013, rev 05/01/2020 |
| 17 | Internal Complaints (Administrative P&P Manual) | rev 10/30/2013 |

Documents 15 to 17 were produced after Revision 3 and are assessed in Revision 4.
Note the dates: 1354.5 is the newest policy in the set by nearly three years, and it shows.

Two further source documents have been produced and read, and are authority rather than
departmental policy, so they are not numbered above: **Title 15 effective 01/01/2019** (the
post-rewrite edition, basis for Revision 6) and **PREA, Public Law 108-79, as enacted**.

Put the source PDFs in `docs/` so you can read them directly. The 1390/1391 PDF is a
scan with no text layer, so it has to be rasterized and read as images, not extracted. **So is
the OO 1352 PDF**: `pypdf` returns 363 characters across its twelve pages. Install `pymupdf`,
render each page at 200 dpi, and read the PNGs. That works and is the only thing that does.

**`docs/` is gitignored and does not survive a new container.** Every verified quotation is
therefore captured into `prea-register.csv` or into this file at the time it is read, so the
finding outlives the PDF. If a citation needs re-checking, the source has to be uploaded again.

## 5. The twelve conflicts (highest priority)

Policy that states a rule contradicting the law or another departmental policy.
Still twelve after Revision 4. Nothing in the three new documents cured a conflict, and
nothing in them created one, though see the near miss recorded at the end of this section.

1. **OO 1352 II.M and III.I, S-8.** Classification created for any LGBTQI youth; single-room
   housing at all times. Violates 115.342(c) and 15 CCR 1352(e). Also contradicts OO 1352's
   own Purpose paragraph, PREA Policy III.E, and OO 1352.5 III.H.
   **Chronology corrected in Revision 5, and it is worse than previously recorded.**
   15 CCR 1352(e) is not a product of the 2019 rewrite. It appears in the edition effective
   **04/01/2014**, verified against source. S-8 was created 12/09/2019 and retained on the
   02/27/2020 revision, five and a half years after the state rule was already in force.
   1352(e) also states the lawful alternative on its face: individualized placement, or a
   single room **at the youth's specific request**.
   **Second hook, corrected in Revision 6: 15 CCR 1324(k)**, not 1324(h). In the edition
   effective 01/01/2019, 1324(h) is "trauma-informed approaches" and the non-discrimination
   provision is **1324(k)**, which is also broader than the 2014 text because it adds
   immigration status. It requires the policy and procedure manual to bar discrimination on
   the listed bases "including restrictive housing or classification decisions based solely on
   any of the above mentioned categories." S-8 is exactly that, so it is both an operational
   violation of 1352(e) and a defect in the required contents of the manual. The 1324(k) route
   is the cleaner BSCC inspection finding because it does not depend on whether PREA binds a
   county facility.
   **Third hook, new in Revision 6: 15 CCR 1352(f)**, which did not exist in the 2014 edition:
   "facility staff shall not consider lesbian, gay, bisexual, transgender, questioning or
   intersex identification or status as an indicator of likelihood of being sexually abusive."
   If the S-series is a sexual-risk taxonomy, which the S-4 criteria indicate, then placing
   LGBTQI youth in that series at all is what 1352(f) forbids, independent of the housing
   consequence. **That reasoning was tested against OO 1352 in Revision 9 and it FAILS. It is
   withdrawn.** The S-series is a general security taxonomy, not a sexual-risk one: S-3 is suicide,
   S-5 mental health, S-6 gang, S-7 medical. And II.M.1 states S-8's purpose as protection "against
   victimization/discrimination," which is the vulnerability framing 1350.5 requires rather than the
   abusiveness framing 1352(f) forbids. On its face II.M is consistent with 1352(f).
   **A stronger replacement, from the order's own text.** III.I.1 ("Any youth classified S-8 will
   require a single room (no roommate) housing at all times") and III.E.1.a ("Any youth classified
   S-4 high will require a single room (no roommate) housing at all times") are **word for word
   identical, and are the only two provisions in the entire order imposing that mandate.** Every
   other classification is written permissively, with supervisor approval and documentation. S-4 High
   is the documented-sex-offence category, defined by II.F.1 as turning on "the youth's potential for
   sexually acting out against other youth and/or staff." **So the order gives LGBTQI youth the
   identical housing restriction it reserves for adjudicated sex offenders, and gives it to no one
   else.** That is now a scored element of row 36, not a hook.
   **Fifth internal contradiction, new in Revision 9.** II.M.1.a says "See the Transgender and
   Intersex Youth Policy for housing guidelines," deferring housing to OO 1352.5. III.I.1 then
   forecloses it. The same order defers the decision and decides it.
   **Also confirmed:** page 12 records that this order "Amends/Replaces Previous Order: Classification
   System Title XV 1352, 10/01/2013," so S-8 was created in the 2019 rewrite, and the III.D.8
   deviation rule ("Deviation from the above housing patterns must be approved and documented by a
   supervisor") is attached to the S-3 matrix and is **not** extended to either "at all times"
   mandate, so neither has a written override path.
2. **OO 1352.5 III.I.** All transgender and intersex youth get a single room. Same categorical
   defect, more defensible (privacy rationale, program access preserved at III.K), but
   contradicts III.B, III.F, III.H of the same order.
3. **PREA Policy V.A.4 AND OO 1453 I.A.9.** CPS report "within 24 hours." PC 11166(a) requires
   immediate telephone report. Error in two documents; 1453 restated it on a 12/2019 revision.
   Code of Conduct VII.A.1 states it correctly.
4. **PREA Policy V.A.7.** 14 days to notify another facility. 115.363(b) requires 72 hours.
5. **PREA Policy XIV.A.** Discipline for allegations "found false." 115.378(f) protects
   good-faith reports; 115.352(g) requires a bad-faith showing.
6. **OO 1352 II.F.2 note.** History of being a molest victim treated as an indicator of
   "sexually inappropriate tendencies." Contradicts 115.341(c), which separates victimization
   risk from abusiveness risk. **Confirmed verbatim in Revision 9, and it is worse than recorded:
   the inference appears twice.** Besides the bolded note, **II.F.2.d** lists "History of
   victimization related to sexual abuse or a sexual offense" as a lettered S-4 criterion alongside
   three abusiveness criteria. Striking the note alone leaves the defect in force, and redline 6 as
   first drafted struck only the note. The order then contradicts itself on the same fact: **II.H.3**
   makes being "the victim of any CPS referral relative to sexual abuse" a criterion for S-4 **Low**,
   which the III.E.2 matrix treats protectively. Same fact, opposite uses, one classification.
7. **Retention conflict.** IA XI.C.1 = 5 years; PREA Policy XVIII.B = 10 years;
   115.371(j) = abuser tenure + 5 years. Against AB 452, which eliminated the limitations
   period for childhood sexual assault occurring on or after 01/01/2024.
8. **OO 1321.** 1:10 waking / 1:30 sleeping. 115.313(c) requires 1:8 / 1:16 since 10/01/2017.
   15 CCR 1301 permits exceeding the state floor. **Verify rosters before assuming a gap.**
9. **OO 1453 I.A.15.** Directs the incident review report to "the PREA coordinator," a position
   the department does not have. Written 2019 acknowledgment that the role is needed.
10. **Policy age.** PREA Policy last revised 2013; IA policy 2011. 15 CCR 1324 requires
    administrative review at least every two years.
11. **Citations.** PREA Policy I.I.1 cites PC 288a (renumbered to PC 287 by SB 1494 eff
    01/01/2019). OO 1352 II.C.3 references DJJ, which closed 06/30/2023, and **IV.A carries a second
    DJJ reference** as the worked example of a legal status change. **Confirmed and broadened in
    Revision 9:** the S-4 High enumeration is complete at II.G.1 ("a. Sodomy (286 PC); b. Lewd or
    lascivious acts with child under 14 (288 PC, all sub-divisions)") plus II.G.3 (rape, 261 PC, all
    subdivisions). **PC 289, sexual penetration, is omitted as well as 287**, and was never flagged.
    Also absent: 243.4, 264.1, 285 and 647.6.
12. **Detention and Intake Responsibility (J-3.4).** References CYA and CYA parolees throughout.
    No PREA content. Omits the 15 CCR 1350(a) admittance elements added in 2019.

**The near miss (row 58, not scored as a conflict).** Internal Complaints gives the Internal
Affairs Manager discretion to "determine whether or not a formal investigation is necessary,"
with no carve-out for sexual abuse or sexual harassment. 115.371(a) requires an administrative
or criminal investigation for **all** such allegations. The policy never says a sexual abuse
allegation may go uninvestigated, so it is recorded as a defect in the row rather than scored
as a thirteenth conflict. If a document turns up showing the discretion has been exercised that
way in practice, it becomes one. Fix is a one-sentence carve-out.

**Conflict 5, state-law defect found in Revision 5, citation corrected in Revision 6.**
**15 CCR 1391(f)**, not 1391(e). In the edition effective 01/01/2019, 1391(e) is minor rule
violations handled informally and the due process elements for major rule violations moved to
**1391(f)**. That subsection attaches those elements to major rule violations **as a class**
and requires six elements, obtained in full in Revision 7: (1) written notice of violation
prior to a hearing, (2) accommodations for youth with disabilities, limited literacy and English
language learners, (3) hearing by a person who is not a party to the incident, (4) opportunity
for the youth to be heard and present evidence and testimony, (5) provision for the youth to be
assisted by staff in the hearing process, and (6) **provision for administrative review**. The
sixth is the element the Revision 6 truncation flag predicted was missing, and that flag is now
cleared. **1391(g)** also exists: violations resulting in removal from a camp or commitment
program, short of a return to court, follow the subsection (e) process. OO 1390/1391 IV.A attaches the hearing only where the recommended discipline is
Program Separation. The department narrowed the trigger from the regulatory class to one
sanction within it. Recorded in Revision 4 as a PREA observation; now a confirmed Title 15
defect, actionable on BSCC inspection independent of PREA. Row 64.

**Conflict 5 narrowed in Revision 4.** OO 1390/1391 supplies the formal disciplinary process
115.378 requires, so the remediation is now extending an existing process rather than drafting
one. The PREA Policy XIV.A false-allegations defect itself is unchanged.

## 6. The fifteen recommended policy changes

Full text in `YDF_PREA_Policy_Review_Report.docx` Part 4. Summary:

Correctable by amendment (1 to 7):
1. Rescind the S-8 single-room mandate (OO 1352 II.M, III.I)
2. Convert OO 1352.5 III.I to a presumptive, documented individualized outcome
3. Correct the mandated reporting standard and relocate it to a new department-wide General Order
4. Correct cross-facility notification from 14 days to 72 hours (PREA V.A.7)
5. Rewrite the false allegations provision to a bad-faith standard (PREA XIV.A)
6. Delete the S-4 victim-to-perpetrator inference, split the code, add PC 287
7. Adopt a single reconciled records retention schedule

Requires drafting or an administrative decision (8 to 15):
8. Designate a PREA Coordinator and facility Compliance Manager
9. Verify staffing against 1:8 / 1:16 and build the 115.313(a) staffing plan
10. Rebuild the PREA elements of OO 1361 (emergency grievance track, external reporting,
    third-party filing, private staff reporting, extension outer bound)
11. Add the data analysis and corrective action loop (115.387, 115.388)
12. Complete the incident review and broaden OO 1453 (115.364(b), 115.365, 115.386)
13. Add retaliation monitoring (115.367)
14. Add notification duties: family, counsel, and outcome to the resident (115.361(e), 115.373)
15. Reduce hiring, contractor screening, and staff reporting to writing (115.317, 115.351(e))

## 7. Verified legal authorities (do not re-research)

**Applicability.** PREA covers local government confinement facilities, 34 U.S.C. 30309(7).
"Agency" includes local units, 28 CFR 115.5. Subpart D covers juvenile facilities. DOJ guidance
states the standards apply equally to locally operated facilities.

**Enforcement gap.** The 5% grant penalty, **34 U.S.C. 30307(c)(2)** (corrected in Revision 6
from 30307(e)(2); PREA section 8 has only subsections (a), (b) and (c)), runs through the
governor's certification, which 28 CFR 115.501(b) limits to state executive branch facilities. AG overview
at 77 Fed. Reg. 37106, 37115 states it does not encompass county facilities. DOJ: no direct
federal financial penalty for local facilities. **No private right of action under PREA.**

**Why counties are still exposed.** DJJ closed 06/30/2023 (SB 823), so no CA juvenile facility
is inside any governor's certification. CA filed an *emergency assurance* for FY2025, and that
option expired permanently 10/15/2024. Counties are "persons" under 42 U.S.C. 1983 with no
Eleventh Amendment immunity and no qualified immunity for entities (Owen v. City of
Independence, 445 U.S. 622). Being county-run is what *creates* the damages exposure.

**California hooks.** WIC 209 biennial BSCC inspection. Title 15 embeds PREA content at
1324(n), 1350.5, 1352(e)-(f), 1352.5, 1353(c), 1360(g), 1361(h), 1452, 1453.

**WIC 875, secure youth treatment facilities, read in Revision 9.** This is where the 13 to 25 age
span comes from and it carries duties no reviewed document mentions. **875(c)(1)(A)**: no secure
confinement beyond 23, or two years from commitment, whichever is later, extending to **25** where
the offence would carry an aggregate adult sentence of seven or more years. **875(g)(2)**: such a
facility may be "a unit or portion of an existing county juvenile facility, including a juvenile
hall." **875(g)(3)**: BSCC was required by 07/01/2023 to adopt standards for such facilities, and
those standards "shall specify how the facility may be used to serve or to separate juveniles,
other than juveniles described in subdivision (a) serving baseline confinement terms, who may also
be detained in or committed to the facility." **That is an express state separation mandate for a
mixed population.** **875(g)(4)**: BSCC biennial WIC 209 inspection of each such facility.
**875(j)**: a person 25 or older "shall not be committed to or detained in a county juvenile
facility" absent court findings of best interest **and** no "risk to the other youth in the juvenile
facility." **875(k)**: same bar for a person returning to local custody who was previously sentenced
to state prison or committed to DJJ. **875(a)(3)(E)**: the court weighs age, developmental maturity,
mental and emotional health, sexual orientation, gender identity and expression, and disabilities.

**SB 824 (Menjivar, 2025-2026) is NOT law.** It would have amended 875 to add transition-planning
duties to the individual rehabilitation plan. It **failed on 02/02/2026**, returned to the Secretary
of the Senate under Joint Rule 56. Everything quoted above is existing law it left untouched. Do not
cite SB 824 for any proposition.

**Title 15 verification status, as of Revision 6.** Two editions have been read in full:
`title15-bscc-juvenile.pdf`, **rev. 04/01/2014**, and `title15-bscc-juvenile-2019.pdf`,
**effective 01/01/2019**, the post-rewrite edition.

*Confirmed against the 2019 edition in Revision 6, quotable now:* **1324** running (a) to (n),
including **1324(k)** (non-discrimination, restrictive housing and classification, now adding
immigration status) and **1324(n)** (the manual must carry a policy prohibiting all forms of
sexual abuse, sexual assault and sexual harassment, with an approach to prevention, detection,
response and retaliation, and reporting by youth, staff or a third party); **1350.5** (screening
within 72 hours against eleven factors, LGBTQI status treated as vulnerability and never as
abusiveness); **1352(e)** (unchanged from 2014) and **1352(f)** (LGBTQI status is not an
indicator of likelihood of being sexually abusive); **1352.5** (a) to (e), including **1352.5(c)**
(house youth in the unit or room that best meets their individual needs, no automatic housing by
external anatomy, documented reasons, youth preference and provider recommendations considered);
**1353(c)** (age appropriate information on the sexual abuse policy and how to report, which
resolves the Revision 5 flag on row 25); **1354.5** (room confinement, tracking WIC 208.3);
**1360(g)** (cross-gender pat-down and strip searches prohibited except exigent or medical,
documented); **1361(h)** (multiple internal and external reporting methods; concerns of parents,
guardians, staff or other parties addressed and documented on a timeframe); **1391(e)** (minor
rule violations, informal) and **1391(f)** (due process for major rule violations as a class).

*Also confirmed against the 2019 edition, in Revision 7:* **1301** ("meet or exceed and do not
conflict with", unchanged); **1321(h)(1)** (A) 1:10 waking, (B) 1:30 sleeping, (E) the exclusion
of administrative, instructional, clerical, kitchen and maintenance personnel, plus **(C)** at
least two wide-awake youth supervision staff at all times absent a backup arrangement and
**(D)** at least one staff member of the same gender as youth housed, both new to this register;
**1354** now (a) to (f), with new **(d)** routing disciplinary separation to 1390 and new **(e)**
routing room-confinement separation to WIC 208.3 and 1354.5; **1390** (see the correction in
section 8, the floor is eleven items); **1391(f)** in full, six elements; **1452** and **1453**
unchanged. **No Title 15 citation in this register now rests on the 2014 edition alone.**

**The edition effective 01/01/2019 is still the operative one. Do not draft against the pending
revision.** The department advises that the **January 2023 juvenile regulations text is still under
consideration and not approved**, and that its contents may change. It is a proposed revision in an
open rulemaking by the Juvenile Regulations Revision Executive Steering Committee, not an adopted
edition. **Do not cite it for any proposition.** Every Title 15 citation in this register is
verified against the operative edition and is sound.

What is genuinely open is narrower, and it is a finding about the state rather than the department.
WIC 875(g)(3) required BSCC to adopt secure youth treatment facility standards, including separation
standards, by 07/01/2023, and the revision that would carry them is still pending. Whether anything
SYTF-specific was adopted separately, including by emergency rulemaking, has not been established.
875(g)(3) answers part of it on its face: "Pending the final adoption of these modified standards, a
secure youth treatment facility shall comply with applicable minimum standards for juvenile
facilities in Title 15 and Title 24." So the 2019 edition governs such a unit by operation of the
statute. See row 90.

**Neither edition read contains any PREA reference or any facility audit requirement.** In the 2019
edition the strings PREA, Prison Rape, 28 CFR and Part 115 return zero hits, and the only "audit"
matches are section 1403, Health Care Monitoring and Audits. California has not adopted a PREA
audit requirement for juvenile facilities.

A trap for the next reader: in the 2019 PDF the section headers for **1352.5 and 1354.5 print
without a period after the number**, so a regex expecting `§ 1352.5.` misses them and reports a
false negative. Match on the title.

The word "PREA" does not appear anywhere in the 2014 edition. Two case-insensitive matches
are the letters inside "spread". Adult local
detention standard 15 CCR 1041(b) expressly cross-references 34 U.S.C. 30303(a)(1). Gov Code
815.6 mandatory duty liability; "enactment" includes a regulation (Gov Code 810.6); CACI 423.
Gov Code 818.2 is the County's defense.

**Civil exposure.** AB 452 eliminated the SOL for childhood sexual assault occurring on or
after 01/01/2024 (CCP 340.1). CCP 352 tolls during minority for earlier incidents. Gov Code
905(m) exempts these claims from the Government Claims Act presentation requirement. CCP 340.1
provides treble damages for a cover-up. Farmer v. Brennan, 511 U.S. 825; Kingsley v.
Hendrickson, 576 U.S. 389; Castro v. County of Los Angeles, 833 F.3d 1060 (9th Cir. 2016)
(en banc, objective standard for pretrial detainee failure-to-protect); Monell, 436 U.S. 658.

**Mandated reporting (CANRA).** PC 11166(a): telephone immediately or as soon as practicably
possible, written report within 36 hours on DOJ form SS 8572. PC 11165.9: recipients are any
police or sheriff's department, the county probation department if designated, or the county
welfare department. PC 11166(i)(1): duty is individual, no supervisor may impede or inhibit,
no sanction for reporting. **PC 11166(j): a county probation department that receives a report
must itself cross-report to law enforcement with jurisdiction, the WIC 300 agency, and the DA,
written within 36 hours.** PC 11172(a) immunity. PC 11166(c) penalties. PC 11166.5 signed
acknowledgment (confirm applicability with counsel).

**Other.** OYCR Ombudsperson: WIC 2200, 2200.2, 2200.5, 2200.7. Youth Bill of Rights: WIC
224.70 to 224.74, extended to all juvenile facilities by AB 2417; 224.72 posting and parent
packet duties. Gov Code 12940(j)(1) and (k) for staff harassed by residents; CACI 2528.

## 8. Corrections already made (do not repeat these errors)

- **Rev 1 said no 15 CCR 1352.5 policy existed.** It does, effective 03/01/2019, and it is
  comprehensive. Monthly reassessment exceeds the twice-yearly federal minimum.
- **Rev 1 and 2 scored 115.364 and 115.365 as gaps.** OO 1453 largely closes both.
- **Rev 2 said "seven of eleven" 115.331(a) topics are covered.** Wrong count. PREA Policy
  II.A.2 has seven lettered bullets but (c) and (d) map to a single federal topic.
  **Six of eleven covered, five missing:** (1) zero tolerance, (2) how to fulfill
  responsibilities under agency procedures, (3) residents' right to be free from abuse,
  (4) freedom from retaliation, (11) age of consent.
- **Rev 2 inferred no employee duty to disclose existed.** Wrong. Employees are required to
  report; that supplies 115.317(f). Open question is whether the duty reaches non-criminal
  conduct.
- **Rev 2 flagged an OO 1360 / 1352.5 search conflict.** They reconcile. OO 1352.5 IV.A.3.b
  supplies the exception (preferred gender staff conducts, second staff within hearing but out
  of view). Recommend only a cross-reference in 1360.
- **Youth advocates no longer exist.** External access is the OYCR Ombudsperson plus counsel.
  115.351(e) staff private reporting reverted to Not Addressed.
- **Rev 3 said 115.351(e) had no departmental route at all.** Corrected in 4. Internal
  Complaints supplies an express, mandatory route to the Assistant Division Chief of Internal
  Affairs, which is one of the three fixes rev 3 itself named as sufficient. Now **Partial**,
  priority held at High. What is missing is the word confidential, not the channel.
- **Rev 1 to 3 scored the WIC 208.3 room confinement interaction as unaddressed.** OO 1354.5,
  eff 04/05/2023, supplies the four-hour review cycle, documented supervisor and manager
  authorization, and the prohibition on punitive confinement. Do not re-raise those.
- **Rev 1 to 4 treated the Title 15 LGBTQI housing rule as part of the 2019 rewrite.** It is
  not. 15 CCR 1352(e) is in the edition effective 04/01/2014. This materially worsens
  conflict 1: S-8 postdates the state rule by five and a half years, not one. Corrected in 5.
- **Rev 5 cited the non-discrimination hook as 15 CCR 1324(h). It is 1324(k).** In the
  edition effective 01/01/2019, 1324(h) is "trauma-informed approaches." Corrected in 6.
  This one was load-bearing: it is the second hook on conflict 1 and it was in the authority
  line of redline change 1 as first drafted.
- **Rev 5 cited the major rule violation due process elements as 15 CCR 1391(e). It is
  1391(f).** In the 2019 edition 1391(e) is minor rule violations handled informally.
  Corrected in 6. The finding is unchanged; the subsection letter is not.
- **Rev 1 to 5 cited the five percent grant penalty as 34 U.S.C. 30307(e)(2). It is
  30307(c)(2).** Verified against Public Law 108-79 as enacted: PREA section 8 has only
  subsections (a), (b) and (c), and the penalty with its certification-or-assurance choice is
  section 8(c)(2). Corrected in 6.
- **Rev 5 could not confirm eight citations and carried them forward unconfirmed. All eight
  exist.** 1350.5, 1352.5, 1354.5, 1324(n), 1352(f), 1360(g), 1361(h) and the 1353(c) pinpoint
  are all in the 2019 edition, now quoted into their rows. Do not re-flag them.
- **Revision 6 first stated the 15 CCR 1391(f) element list as though it were complete. It is
  not.** The text extraction behind it was truncated inside the fifth item, and the 2014
  predecessor carried an administrative review element that is not among those five. Corrected
  immediately after Revision 6 in both the register and this file. The lesson generalises: a
  quotation taken from a truncated extraction must be marked as partial at the moment it is
  written, not assumed complete because it reads like a list.
- **Rev 5 credited OO 1390/1391 I.A with exceeding the 15 CCR 1390 deprivation floor by adding
  rehabilitative programming as an eleventh item. It does not exceed it.** The 2019 edition's
  floor runs (a) to **(k)**, eleven items, and **(k) is "rehabilitative programming."** The order
  matches the regulation. Corrected in 7. Note the direction: this removes a credit previously
  given to the department, which is the direction a correction is least likely to be noticed in.
  No amendment should describe OO 1390/1391 as exceeding anything here.
- **The Revision 6 flag that the 1391(f) element list was truncated is resolved, and it was
  right.** The full subsection has six elements and the sixth is "provision for administrative
  review." Obtained in Revision 7. The hedge was correct and is now cleared.
- **Rev 6 recorded a 15 CCR 1352(f) hook on conflict 1 reasoned on the S-series being a
  sexual-risk taxonomy. That reasoning fails and is withdrawn in 9.** OO 1352 shows the S-series is a
  general security taxonomy, and II.M.1 frames S-8 as protection against victimization, which is the
  framing 1352(f) requires rather than the one it forbids. A stronger textual replacement is recorded
  at conflict 1, so the conclusion survives and the reasoning does not. Note the direction: this
  correction removes a theory the department would have had to answer.
- **Rev 8 said nothing in federal or state law keys separation to age in this facility. Overbroad,
  corrected in 9.** It is true of the Title 15 edition effective 01/01/2019, which is all that was
  searched, but **WIC 875(j) and (k)** bar detaining a person 25 or older, or one returning from
  state prison or DJJ, absent court findings including no "risk to the other youth," and **875(g)(3)**
  directs BSCC to adopt standards specifying how a secure youth treatment facility separates its
  wards from other detained juveniles. The narrow finding survives, because those are admission and
  commitment controls exercised by the court rather than housing rules. The broad one does not. The
  lesson: a search of one edition of one regulation is not a search of state law.
- **Redline 6 struck the II.F.2 note only. The same inference is also at II.F.2.d.** Found in 9 on
  reading the order. A redline drafted from a register row inherits whatever that row did not record.
- **Revision 9 called the January 2023 BSCC juvenile regulations text an adopted edition and the
  2019 one stale. It is a pending proposal, still under consideration. Corrected by the department
  immediately after 9.** The error was inferring adoption from document titles returned by a search,
  without confirming status. **New standing rule: a proposed or pending regulation is not authority.
  Confirm adoption before citing any regulation, and never draft against a text that can still
  change.** The practical consequence is good news: the edition effective 01/01/2019 is operative, so
  every Title 15 citation in this register stands.
- **Do not assume isolation is available as a disciplinary sanction.** OO 1390/1391 III omits
  it from the consequences list and OO 1354.5 I.C.1 prohibits confinement for punishment. The
  department has excluded it, which is a stronger position than complying with the isolation
  safeguards. Say so rather than leaving it to inference.

## 9. Open questions for the department

1. How many juvenile facilities does the department operate? (drives 115.311(c))
2. Any agreement housing youth for another jurisdiction, or any federal grant referencing
   28 CFR Part 115? (would make PREA contractually binding)
3. Actual staffing ratios against rosters (blocks recommended change 9)
4. Does a General Order on child abuse reporting exist? (see report Part 4.1)
5. Which "Office of the Inspector General" does OO 1361 I.C mean? CA OIG oversight runs to CDCR.
6. Does the OYCR Ombudsperson forward reports to the agency, and allow anonymity on request?
7. Does a child abuse registry check occur in hiring? Are contractors and volunteers screened?
8. Exact language of the employee reporting duty: does it reach non-criminal conduct?
9. Has any PREA audit or consultant review ever been done at YDF?
10. Is the annual public data publication required by PREA Policy XVIII.C actually happening?
11. Does the CBA contain anything limiting removal of an alleged staff abuser? (115.366)
12. **Confirm the subsection lettering inside 115.378 against the CFR before quoting it.**
    Only 115.378(f), the good-faith reporting protection, is verified. The register describes
    the other elements of that standard by content rather than by letter for this reason.
    This environment's network egress is restricted, so eCFR and Cornell could not be reached.
13. **Does 115.387 data collection reach sexual harassment, or only sexual abuse?** The standard
    is written around allegations of sexual abuse. The supervisor guide originally asserted that
    a sexual harassment incident "enters the PREA data set"; that is now stated as the safe
    default rather than a confirmed requirement, because the CFR text could not be read from
    this environment. It decides whether the department's collection instrument has one scope or
    two. See register row 70.
14. ~~Does the Dependent Adult and Elder Abuse General Order reach a resident aged 18 to 25?~~
    **Answered in Revision 9: the department does not treat them as dependent adults.** The
    consequence is recorded at rows 77 and 87. **The narrowed question that replaces it:** is a
    resident over 18 who carries the OO 1352 **S-5 Mental Health** classification a dependent adult
    under WIC 15610.23(a)? The blanket position is defensible as to 15610.23(b), since a juvenile
    hall is not a 24-hour health facility, but 15610.23(a) is an individualized test and S-5 tracks
    its language closely. Narrow question, not a broad one.
15. **Does any YDF unit operate as a secure youth treatment facility under WIC 875(g)(2)?** This
    decides whether the 875(g)(3) separation standards apply, and those standards may already supply
    the written rule rows 84 and 86 say is missing.
16. **Do WIC 875(j) findings exist for any resident who is 25 or older?** The department has
    confirmed the hall houses to 25. 875(j) bites **at** 25, not at 26, so each such resident needs a
    court finding of best interest and no risk to other youth. Confirm whether the population in fact
    tops out at 24, and if not, where those findings are filed.

## 10. Documents still outstanding

Referenced in reviewed policies but never produced. Several may close findings.

- General Order on child abuse and neglect reporting, if one exists
- Resident Orientation Handbook (confirmed to carry the Youth Bill of Rights)
- Hiring process, arrest notification protocol, written employee reporting requirement
- Institutional Policy on Documentation, Confidentiality and Maintenance of Records
- Institutional Policy on Video Recording and Photograph System
- Interrogations of Department Personnel policy
- Institutional Incident Report User's Guide
- **Any adopted SYTF-specific BSCC standards, if they exist.** Not the full regulations: the
  edition effective 01/01/2019 is operative and has been read. The narrow question is whether
  anything was adopted under WIC 875(g)(3), including by emergency rulemaking. **The January 2023
  revision is a pending proposal and must not be drafted against.** See row 90.
- ~~Current BSCC Title 15 edition (post January 2019).~~ **Produced and read in Revision 6.**
  All eight citations are confirmed. One question it raised is still worth asking internally:
  whether the policy shop has been drafting against the 2014 text, since two of the
  department's own citations match the superseded numbering. Note also that the edition
  produced is effective 01/01/2019 and BSCC published a standards matrix revised January 2023,
  so a later amendment may exist and has not been seen.
- OO 1354 (separation). **Now the highest-value outstanding document.** OO 1354.5 defines
  Separation to include protective custody and then regulates only room confinement, so the
  placement 115.342(b) and 115.368 actually govern is the one with the fewest written
  safeguards. See rows 35 and 57.
- Volunteer, intern, and contractor onboarding and clearance procedure
- Medical and mental health service policies / Health Services agreement
- Staffing rosters and post assignments

## 11. Likely next tasks

1. ~~Draft the redlines for changes 1 to 7.~~ **Done.** `drafts/redlines.json` is the source;
   `drafts/REDLINES.md` and `deliverables/PREA_Redlines_Changes_1_to_7.docx` are generated
   from it by `npm run redlines`. Do not hand-edit either output. Section 13 records what the
   drafting assumed and what has to be confirmed before any of it is adopted.
2. **Draft the new General Order on child abuse and neglect reporting.** Contents specified in
   report Part 4.1. Model the structure on the existing Dependent Adult and Elder Abuse GO.
   Redline 3 stage two is the cross-reference that replaces the interim text once this issues.
3. **Draft the rewritten PREA Policy** to Subpart D order so each provision maps to what an
   auditor scores.
4. **Build the Tier 1 and supervisor lesson plans** from report Parts 5 and 6.
5. **Update the register** as documents arrive. Increment the revision number, record every
   change in the `change_log` column, and tell the user what moved and in which direction.

## 12. Deliverables already produced

Download these from the prior conversation and keep them in `deliverables/`:

| File | Contents |
|---|---|
| `YDF_PREA_Policy_Review_Report.docx` | **The master document.** Findings, 12 conflicts, 11 critical gaps, the 15 changes, all-staff training, supervisor curriculum, implementation sequence, full 83-row inventory |
| `YDF_PREA_Applicability_Memo.docx` | Whether PREA binds a county-run juvenile hall, and by what mechanism |
| `YDF_PREA_Liability_Exposure_Assessment.docx` | Nine theories of liability. **Carries a handling warning: route through County Counsel before circulating** |
| `YDF_PREA_Training_Gap_and_Curriculum_Plan.docx` | Longer-form training analysis (report Part 5 is the condensed version) |
| `YDF_PREA_Audit_Evidence_Request.xlsx` | 40 document requests and 16 open questions |
| `YDF_PREA_Gap_Register_Rev3.xlsx` | Excel version of `prea-register.csv` |

The user has said he prefers Word over Excel for reports going forward.

---

## 13. The redlines for changes 1 to 7

Drafted against register Revision 5. Source is `drafts/redlines.json`; run `npm run redlines`
to regenerate the Markdown and the Word file. The builder aborts rather than writing if it
finds an em dash or an out-of-order item number.

**What the drafting could and could not stand on.** **Updated in Revision 9: OO 1352 has now been
produced and read in full, so changes 1 and 6 no longer rest on reconstruction.** Both have been
rewritten against the order's real words, and change 6 gained an item it was missing (II.F.2.d).
Four of the orders the redlines amend are still **unproduced**: OO 1352.5, the PREA
Policy, OO 1453, and the Internal Affairs policy. For those, the struck text in each redline is
a **reconstruction of what the register describes, not a quotation**, and the section numbers
trace to the register, which traces to the earlier review that did read the orders. Every item
carries a Before adoption block saying which it is. Do not let a redline circulate as though the
struck text were the order's real words.

The one exception is the Internal Complaints piece of change 7, which is grounded in the
produced document.

**Drafting decisions worth knowing before touching them again.**

- **Change 1** replaces OO 1352 II.M in place rather than striking it, so no renumbering is
  needed. The insert tracks the 15 CCR 1352(e) list verbatim and carries the regulation's own
  carve-out, single occupancy at the youth's specific request, documented. It adds a fourth
  paragraph barring any classification code that carries an automatic housing consequence, which
  is what stops S-8 from reappearing under another letter.
- **Change 2** makes single occupancy the presumptive outcome of the III.F determination rather
  than a status rule. Flagged in the Why: a presumption applied without a real determination is
  the same defect in better clothes, so the JPIP documentation is what makes it work.
- **Change 3 is staged.** Stage one corrects PC 11166(a) in place in both PREA Policy V.A.4 and
  OO 1453 I.A.9 now; stage two replaces both with a cross-reference once the General Order
  issues. Paragraph 2 of stage one says internal notification does not satisfy or delay the
  mandated report, which is the operationally important sentence. Paragraph 4 (the PC 11166(j)
  cross-report duty) assumes the county has designated Probation to receive mandated reports
  under PC 11165.9. **That designation is unconfirmed.** Confirm before adopting paragraph 4.
- **Change 4** adds the receiving side of 115.363 (paragraph 3), which the current policy does
  not address at all, and it references the change 7 retention schedule. If 7 is deferred, that
  reference has to point somewhere else.
- **Change 5** keeps the ability to discipline a fabricated report, with the burden on the
  department, so nothing operational is lost. It expressly does not add a false reporting rule
  violation to OO 1390/1391, which would recreate the defect in a second document.
- **Change 6** splits S-4 into **S-4A** (risk of being sexually abusive) and **S-4B** (risk of
  being sexually victimized). PC 288.5 and 289.6 in the S-4A offense list are the drafter's
  judgment, not from the order, and are flagged as such. The list ends with a successor-statute
  catch-all so the next renumbering does not reopen the 287 gap.
- **Change 7** is the one the department cannot fully solve itself. Paragraph 3 is drafted as a
  **destruction moratorium** for conduct on or after 01/01/2024, because AB 452 left that class
  of claim with no limitations period and no fixed retention figure can cover it. County Counsel
  sets the schedule, not a policy revision.

**Conforming items folded in that were not in the report's change list.** Change 6 carries the
PREA Policy I.I.1 (288a to 287) correction and the OO 1352 II.C.3 DJJ deletion, both from
conflict 11, because they sit in the same documents and the same amendment cycle. Change 2
carries the OO 1360 search cross-reference. Change 5 carries the bad-faith rule for OO 1361.
These are labelled as conforming changes, not as part of the numbered change.

---

## 14. Typography and document formatting (standing preference)

Tim's stated preference, and it applies to everything produced for this project.

| Element | Size |
|---|---|
| Body text and paragraphs | **12pt minimum** |
| Headings | **14pt minimum** |
| PowerPoint body wording | **16pt minimum**, larger where it fits |

These are floors, not targets. Heading levels ascend from the floor so hierarchy
survives: H3 at 14pt, H2 at 15pt, H1 at 17pt, title 24pt, subtitle 16pt.

**Where this is enforced.** `tools/docx_style.js` holds the single type scale that all
four Word builders import. It converts points to the half-points the `docx` library
wants, so nobody has to do that arithmetic again, and it **fails the build** if any body
or heading value is edited below its floor. Do not reintroduce numeric font sizes into
the builders; add a name to the scale instead.

That file exists because the four builders previously carried their own literals, and
the result drifted to 10.5pt body text and 9.5pt table cells without anyone deciding to.
Table cell text counts as body text and sits at 12pt.

**The one deliberate exception.** Running heads and page numbers are set at 9pt. They
are document furniture rather than paragraphs of the report, and at 12pt they compete
with the text. That call is a single line in `docx_style.js` if it is ever revisited.

**Consequence worth expecting.** Raising body from 10.5pt and cells from 9.5pt makes
every document meaningfully longer. The crosswalk in particular is a long document with
large tables. That is the intended trade: legibility over page count.

**No PowerPoint generator exists yet.** When the Tier 1 and supervisor lesson plans are
built, the 16pt floor applies, and the scale belongs in a sibling module rather than in
the deck builder.

---

## 15. The facility, and what knowing it changed (Revision 8)

Confirmed by the department. Everything before Revision 8 was inferred from documents; this is
the first pass that rests on how the place actually runs.

- The **Juvenile Hall houses residents aged 13 to 25.** A twelve year span in one facility.
- **17 units, 12 in use.**
- **Girls are housed separately from boys.**
- **Boys are grouped by age.**
- A resident **under 16 housed with one over 18 is uncommon but not prohibited.**

**The headline finding, row 84.** Title 15 defines "Youth" as any person in the custody of the
facility, expressly including persons over 18, so every state duty applies identically to a 13
year old and a 25 year old. Searched the full 2019 text: separation under 1354 is keyed to
behavior and status, and **no provision anywhere keys separation to age.** On the federal side
neither 115.14 nor 115.114 applies in a juvenile facility. **Nothing in the 2019 Title 15 edition
or in 28 CFR Part 115 requires sight and sound separation of a 13 year old from a 25 year old
here.** *(Revision 8 stated this as "nothing in federal or state law," which was overbroad. See the
WIC 875 correction in section 8 and row 90. The narrow finding stands: 875(j) and (k) are admission
controls exercised by the court, and 875(g)(3) directs BSCC to write separation standards that have
never been produced to this project. None of the three is a housing rule binding the facility
today.)* Classification is
the only control, and it sits in OO 1352, which has never been produced and which carries both
documented classification defects.

**Row 85. Title 15 has its own definition of sexual abuse and it is broader than PREA's.** It
counts coercion by **manipulation**, where the federal resident-on-resident definition requires
coercion by overt or implied threats of violence, and it reaches **voyeurism between residents**,
which the federal definition treats as a staff-only prong. 1324(n) makes it enforceable. A
department screening only against the federal test will close conduct the state standard reaches.

**Row 86. Every separation control the department relies on is practice, not policy.** Sex
separation, age grouping, and keeping under-16s away from over-18s are all in daily use and none
appears in the documents reviewed. Title 15 requires none of them, so the department is exceeding
the standard and recording none of it. The remediation is the cheapest in the register: write
down what is already done, plus a written override path for the uncommon cases, because a rule
with no stated exception is not a control.

**Row 87. The mixed-age consent collision.** PREA's "unable to consent or refuse" limb governs,
so apparent willingness does not take a minor-with-adult incident out of PREA. CANRA's
voluntary-conduct exception is narrower than it looks: it reaches only 286, 287 and 289, not
touching under 11165.1(b)(4) and not 261.5; it requires a finding of no indicators of abuse,
which is a post-investigation conclusion rather than a unit observation; and it is unavailable
outright for a person 21 or older with a minor under 16, a live pairing here. **The rule to write
down: staff do not apply consent analysis, and the CANRA exception is never applied at facility
level.**

**A distinction to have ready, added to row 36.** Someone will ask why sex-segregated housing is
lawful if categorical housing on a listed basis is not, since gender is on the 1352(e) and
1324(k) lists. 1352(e) bars separating a youth **from the general population** or assigning to a
**single occupancy room** solely on a listed basis. A girls unit is a general population
assignment and is neither. S-8 is a single occupancy assignment on a listed basis and is both.
Same list, opposite result.

**What this did to the supervisor guide.** The tier chart was written assuming both residents
are minors, which in a 13 to 25 facility is often wrong, so Revision 8 added age qualifiers to
the chart itself rather than leaving them in prose nobody reads under pressure.

- **Tier 4** (masturbation in view) now reads **YES if the youth who saw it is under 18.**
  11165.1(b)(5)'s element is masturbation in the presence of a **child**. Two adult residents,
  no CANRA duty, however many times it happens.
- **Tiers 5 and 6** now read **YES if either resident is under 18.** (b)(4) reaches touching the
  intimate parts "of a child, **or of the perpetrator by a child**," so it is keyed to a child on
  either side of the contact. Which resident is the victim is an investigative conclusion, not a
  floor call, and PC 11172(a) gives the reporter immunity. Where both are 18 or over, CANRA does
  not apply at all, because there is no child.
- A new **mixed ages section** carries the consent rule, the three limits on the CANRA voluntary
  conduct exception, and a worked example: **repeated masturbation in view, both residents over
  18.** CANRA no, PREA yes, and the repetition is what does it, because that conduct is not a
  resident-on-resident abuse prong but repeated unwelcome actions of a derogatory or offensive
  sexual nature are sexual harassment under 115.6. Live alongside it: PC 314, which is
  age-neutral; OO 1390/1391 II.B.4, which still does not define sexual misconduct; and open
  question 14.
- **One claim walked back.** Tier 2 asserted that a sexual harassment incident enters the PREA
  data set. 115.387 is written around sexual abuse and could not be read from here, so the guide
  now says log it, treat inclusion as the safe default, and confirm the scope. Open question 13.

**The state-side point raised and deliberately not resolved.** Title 15's definition reaches
voyeurism between residents, but voyeurism describes the watcher, not the person exposing
himself. Whether it reaches exhibitionist conduct between residents is not answered on the face
of the text. Recorded as a County Counsel question rather than scored.

**Still open.** Twelve units in use describes one facility's size; it does not answer how many
juvenile facilities the department operates, which is what 115.311(c) turns on. Open question 1
stands.

---

## 16. OO 1352 read, and what it changed (Revision 9)

Produced and read in full on the same day as two other inputs: the department's answer on dependent
adult status, and WIC 875. Twelve pages, scanned, no text layer. Rasterize at 200 dpi with
`pymupdf` and read the images; `pypdf` returns 363 characters.

**The register's citations to this order were accurate.** Every section number the earlier review
recorded, II.C.3, II.F.2, II.G.1, II.H, II.M, III.E.1.a, III.I, I.B.3, I.B.6, I.B.12, V.A-C, is
right. That is worth knowing about the provenance of the rest of the register.

**What is now quotable rather than reconstructed.** The S-8 text, the III.I.1 single-room mandate,
the Purpose and Scope paragraph tracking 1352(e), the II.F.2 molest-victim note, and the S-4 High
offence list. Conflicts 1, 6 and 11 all carry the order's real words now.

**The three findings that changed direction.**

1. **The 1352(f) theory on conflict 1 is withdrawn and replaced with a better one.** See section 5.
   Reasoning out, conclusion stronger.
2. **Conflict 6 is bigger.** The victim-to-perpetrator inference is at II.F.2.d as well as the note,
   and the order uses the same fact for the opposite purpose at II.H.3.
3. **Row 84 is smaller, and that favours the department.** The Purpose paragraph weights age and
   III.C.1 weights physical stature, so the factors exist. Status raised Not Addressed to Partial.
   What is still missing is an age-based housing **rule**, which is a narrower claim.

**Three new rows.**

- **88. S-1 is written for male youth only.** II.C opens "Any **male** youth who meets the following
  criteria will be housed in a high-security unit." Every criterion under it is behavioural or legal
  and none is sex-specific. A female youth who meets them has no high-security path on the face of
  the order. May reflect physical plant rather than intent; ask before assuming.
- **89. The S-7 communicable disease log.** A daily list naming residents and their "exact medical
  condition," HIV among them, on a clipboard in every unit and distributed to the kitchen, SCOE,
  volunteers, contractors, the Juvenile Court Expeditor and the Sheriff's Bailiffs. HIV status is on
  the 1352(e) and 1324(k) protected lists. Primarily a Health and Safety Code 121070 question for
  County Counsel. The same provision also routes duties to **Youth Advocates**, a role that no longer
  exists, which is the conflict 9 defect class.
- **90. WIC 875 and the secure youth treatment facility framework.** Scored **Not Evidenced**.
  **Corrected immediately after Revision 9 by the department**: this row first said the January 2023
  BSCC text was an adopted edition making the 2019 one stale. It is a pending proposal. The 2019
  edition is operative and the register's Title 15 citations are sound. See section 7 and the
  correction in section 8.

**One structural finding worth more than its row.** OO 1352 **never once references OO 1350.5**, in
twelve pages. The order that screens for sexual abuse risk and the order that makes the housing, bed
and program assignments the screening is meant to drive do not cite each other in either direction.
115.341 requires the screening results to inform exactly those assignments. The link may exist in
practice; on paper there is nothing for an auditor to follow. Rows 32 and 34.

**And the other half of Revision 9, from the department's answer.** Residents aged 18 to 25 are
under juvenile court jurisdiction, but **jurisdiction is not age**: PC 11165 defines a child as a
person under 18, so CANRA does not reach them, and the department does not treat them as dependent
adults. **Where both residents are 18 or over there is no mandated external reporting duty of any
kind.** What remains is age-neutral and operationally different: every PREA duty applies unchanged,
and 15 CCR 1453 with OO 1453 I.A.8 routes sexual assaults to the Sheriff rather than to CPS. But
that substitute triggers on a higher threshold, binds the Duty Supervisor rather than the employee
who saw it, carries no personal criminal exposure, and reaches sexual assault only, so the
harassment, exposure and masturbation tiers have no external route at all. Written into the
supervisor guide as the **three ages question** asked before the tier chart. Rows 77 and 87.
