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

Register is at **Revision 3**. 83 requirements assessed against 14 departmental policies.

| Status | Count |
|---|---|
| Addressed | 14 |
| Partial | 39 |
| Not Addressed | 17 |
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

Put the source PDFs in `docs/` so you can read them directly.

## 5. The twelve conflicts (highest priority)

Policy that states a rule contradicting the law or another departmental policy.

1. **OO 1352 II.M and III.I, S-8.** Classification created for any LGBTQI youth; single-room
   housing at all times. Violates 115.342(c) and 15 CCR 1352(e). Also contradicts OO 1352's
   own Purpose paragraph, PREA Policy III.E, and OO 1352.5 III.H. Chronology is damaging:
   1352.5 (correct rule) eff 03/2019; S-8 created 12/2019, revised 02/2020.
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
1324(n), 1350.5, 1352(e)-(f), 1352.5, 1353(c), 1360(g), 1361(h), 1452, 1453. Adult local
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

## 10. Documents still outstanding

Referenced in reviewed policies but never produced. Several may close findings.

- General Order on child abuse and neglect reporting, if one exists
- Resident Orientation Handbook (confirmed to carry the Youth Bill of Rights)
- Hiring process, arrest notification protocol, written employee reporting requirement
- Institutional Policy on Documentation, Confidentiality and Maintenance of Records
- Institutional Policy on Video Recording and Photograph System
- Internal Complaints policy (Administrative P&P Manual)
- Interrogations of Department Personnel policy
- Institutional Incident Report User's Guide
- OO 1354 and 1354.5 (separation and room confinement)
- OO 1390 and 1391 (discipline and due process)
- Volunteer, intern, and contractor onboarding and clearance procedure
- Medical and mental health service policies / Health Services agreement
- Staffing rosters and post assignments

## 11. Likely next tasks

1. **Draft the redlines for changes 1 to 7.** Amendment language, not full rewrites.
2. **Draft the new General Order on child abuse and neglect reporting.** Contents specified in
   report Part 4.1. Model the structure on the existing Dependent Adult and Elder Abuse GO.
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
