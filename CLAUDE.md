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

Register is at **Revision 5**. 83 requirements assessed against 17 departmental policies.

Revision 5 was a verification pass against the Title 15 text, not a re-scoring. No status or
priority changed. Twenty-eight rows gained a note recording whether their California citation
was confirmed against source, and two rows gained new findings the source text supports
(rows 36 and 64). See section 7 for what is and is not verified.

| Status | Count |
|---|---|
| Addressed | 14 |
| Partial | 40 |
| Not Addressed | 16 |
| Conflict (policy states the wrong rule) | 12 |
| Not Evidenced (document exists, not produced) | 1 |

Priority: 19 critical, 33 high, 17 medium, 14 low.

Full register with gap text is in `prea-register.csv`. Columns `owner`, `target_date`, and
`disposition` are empty and intended for the department to fill.

## 4. Documents reviewed (14)

| # | Document | Dates |
|---|---|---|
| 1 | PREA Policy and Procedure, Juvenile Institutions | eff/rev 04/25/2013 |
| 2 | OO 1321 Staffing | reviewed 01/16/2020 |
| 3 | OO 1322 Training and Staff Development | eff 06/15/2015, rev 05/08/2019 |
| 4 | OO 1350.5 Screening for the Risk of Sexual Abuse | eff 11/10/2019 |
| 5 | OO 1352 Classification | eff 12/09/2019, rev 02/27/2020 |
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

Put the source PDFs in `docs/` so you can read them directly. The 1390/1391 PDF is a
scan with no text layer, so it has to be rasterized and read as images, not extracted.

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
   **Second hook added in Revision 5: 15 CCR 1324(h)** requires the policy and procedure
   manual to bar discrimination on the listed bases "including restrictive housing or
   classification decisions based solely on any of the above mentioned categories." S-8 is
   exactly that, so it is both an operational violation of 1352(e) and a defect in the
   required contents of the manual. The 1324(h) route is the cleaner BSCC inspection finding
   because it does not depend on whether PREA binds a county facility.
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
   risk from abusiveness risk.
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
    01/01/2019). OO 1352 II.G.1 S-4 High criteria omit 287 entirely, so a 287 adjudication does
    not meet the enumerated criteria. OO 1352 II.C.3 references DJJ, which closed 06/30/2023.
12. **Detention and Intake Responsibility (J-3.4).** References CYA and CYA parolees throughout.
    No PREA content. Omits the 15 CCR 1350(a) admittance elements added in 2019.

**The near miss (row 58, not scored as a conflict).** Internal Complaints gives the Internal
Affairs Manager discretion to "determine whether or not a formal investigation is necessary,"
with no carve-out for sexual abuse or sexual harassment. 115.371(a) requires an administrative
or criminal investigation for **all** such allegations. The policy never says a sexual abuse
allegation may go uninvestigated, so it is recorded as a defect in the row rather than scored
as a thirteenth conflict. If a document turns up showing the discretion has been exercised that
way in practice, it becomes one. Fix is a one-sentence carve-out.

**Conflict 5, new state-law defect found in Revision 5.** 15 CCR 1391(e) attaches the due
process elements to major rule violations **as a class**, defined as violations "which may
include withdrawal from group activities for 24 hours or more or extension of time in
custody." OO 1390/1391 IV.A attaches the hearing only where the recommended discipline is
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

**Enforcement gap.** The 5% grant penalty, 34 U.S.C. 30307(e)(2), runs through the governor's
certification, which 28 CFR 115.501(b) limits to state executive branch facilities. AG overview
at 77 Fed. Reg. 37106, 37115 states it does not encompass county facilities. DOJ: no direct
federal financial penalty for local facilities. **No private right of action under PREA.**

**Why counties are still exposed.** DJJ closed 06/30/2023 (SB 823), so no CA juvenile facility
is inside any governor's certification. CA filed an *emergency assurance* for FY2025, and that
option expired permanently 10/15/2024. Counties are "persons" under 42 U.S.C. 1983 with no
Eleventh Amendment immunity and no qualified immunity for entities (Owen v. City of
Independence, 445 U.S. 622). Being county-run is what *creates* the damages exposure.

**California hooks.** WIC 209 biennial BSCC inspection. Title 15 embeds PREA content at
1324(n), 1350.5, 1352(e)-(f), 1352.5, 1353(c), 1360(g), 1361(h), 1452, 1453.

**Title 15 verification status, established in Revision 5.** The only edition produced is
`docs/title15-bscc-juvenile.pdf`, BSCC Minimum Standards for Juvenile Facilities,
**rev. 04/01/2014**. It predates the January 2019 rewrite. Read directly, all 65 pages.

*Confirmed against that text, quotable now:* **1301** ("meet or exceed and do not conflict
with"), **1321(h)(1)(A)-(B)** (1:10 waking, 1:30 sleeping) and **1321(h)(1)(E)** (excludes
administrative, instructional, clerical, kitchen, and maintenance personnel from the youth
supervision count, the state analogue of the federal security-staff-only rule), **1324**
(biennial administrative review) and **1324(h)** (non-discrimination, restrictive housing and
classification), **1352(e)** (anti-categorical housing, with its own carve-out), **1353**
(orientation, (a) to (p)), **1354** (separation includes protective custody; privileges
retained except as necessary; **daily review** of all separated youth), **1361** (grievances,
(a) to (f), including **1361(b)** confidential filing option), **1390** (least restrictive,
ten-item deprivation floor), **1391(e)** (due process for major rule violations as a class),
**1452** and **1453** (forensic collection by non-treating personnel; evidentiary examination
**at a facility separate from the custodial facility**).

*Not confirmed, because the section or subsection does not exist in that edition:* **1350.5**,
**1352.5**, **1354.5** (absent entirely); **1324(n)** (1324 ends at (j)); **1352(f)** (1352
ends at (e)); **1360(g)** (1360 ends at (f), and (f) is "searches of transgender youth");
**1361(h)** (1361 ends at (f)); **1353(c)** as used in row 25 (in this edition 1353(c) is
"access to legal services", not resident education). These are carried forward unconfirmed,
not dropped. **Get the current BSCC edition before quoting any of them.**

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

## 10. Documents still outstanding

Referenced in reviewed policies but never produced. Several may close findings.

- General Order on child abuse and neglect reporting, if one exists
- Resident Orientation Handbook (confirmed to carry the Youth Bill of Rights)
- Hiring process, arrest notification protocol, written employee reporting requirement
- Institutional Policy on Documentation, Confidentiality and Maintenance of Records
- Institutional Policy on Video Recording and Photograph System
- Interrogations of Department Personnel policy
- Institutional Incident Report User's Guide
- **Current BSCC Title 15 edition (post January 2019).** Needed to confirm 1350.5, 1352.5,
  1354.5, 1324(n), 1352(f), 1360(g), 1361(h), and the 1353 pinpoint. The only edition
  produced is rev. 04/01/2014. Worth asking internally whether the policy shop has been
  drafting against the 2014 text, which would explain a good deal.
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

**What the drafting could and could not stand on.** Only four documents have been produced to
this project: OO 1354.5, OO 1390/1391, Internal Complaints, and Title 15 rev. 04/01/2014. Five
of the orders the redlines amend have **never been produced**: OO 1352, OO 1352.5, the PREA
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
