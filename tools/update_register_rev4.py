#!/usr/bin/env python3
"""Revision 4 of prea-register.csv.

Applies the findings from three documents produced after Revision 3:

  OO 1354.5 Room Confinement, eff. 04/05/2023
  OO 1390/1391 Discipline and Discipline Process, eff. 10/01/2013, rev. 05/01/2020
  Internal Complaints, Administrative P&P Manual, rev. 10/30/2013

Run once. It asserts the pre-state of every row it touches, so a second run
fails loudly rather than double-applying.

Subsection lettering: only subsections already carried in the register or in
CLAUDE.md section 7 are cited (115.378(f), 115.352(g), 115.342(h)). Lettering
within 115.378 beyond (f) is not asserted here because it could not be checked
against the CFR from this environment. See the note in CLAUDE.md section 9.
"""

import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, "prea-register.csv")

R1354 = "OO 1354.5 (Room Confinement, eff. 04/05/2023)"
R1390 = "OO 1390/1391 (Discipline and Discipline Process, eff. 10/01/2013, rev. 05/01/2020)"
RIC = "Internal Complaints (Administrative P&P Manual, rev. 10/30/2013)"

# id -> dict of changes. `doc_add` is appended to county_document, `gap_add` to
# gap, `gap_set` replaces gap outright, `status`/`priority` set those fields.
# `log` is appended to change_log.
CHANGES = {

    # ---------------------------------------------------------------- 1354.5
    "35": {
        "expect": ("Partial", "High"),
        "doc_add": "%s I.A-E, II.A-K, III.A" % R1354,
        "gap_set": (
            "Materially improved by OO 1354.5, effective April 5, 2023, which was not "
            "available for revisions 1 through 3. What that order supplies: room "
            "confinement only on enumerated criteria, with less restrictive options "
            "attempted and exhausted (I.A), which is the last resort standard; an express "
            "prohibition on confinement for punishment, coercion, convenience, or "
            "retaliation by staff, and on confinement that compromises the youth's mental "
            "or physical health (I.C), tracking WIC 208.3; thorough documentation in an "
            "Institutional Incident Report including the time placed and the time removed, "
            "imposed only by a supervisor or Watch Commander (I.B); and for extended room "
            "confinement beyond four hours, documented justification (II.E), imposition "
            "only by a YDF manager (II.G), documented manager authorization for the initial "
            "extension and again every four hours thereafter carrying the justification, the "
            "basis for the extension, and the date and time the youth is authorized to "
            "return to full programming (II.K), an individualized reintegration plan with "
            "goals and objectives (II.H.4, II.K.3), and immediate discontinuance once the "
            "youth can safely return (II.H.5). III.A guarantees one hour of large muscle "
            "exercise, education including individual instruction in the unit day space or "
            "the youth's room where classroom attendance is unsafe, and access to medical "
            "services and mental health counseling. The four-hour review cycle and the "
            "documented supervisor authorization that revision 3 recorded as missing are "
            "therefore present, and the WIC 208.3 interaction that revision 3 said the PREA "
            "policy did not address is now addressed in a current order. Two defects persist "
            "and one is new. First, III.A guarantees access to medical services and mental "
            "health counseling, where the standard requires daily visits from a medical or "
            "mental health clinician. Access is a weaker duty than an affirmative daily "
            "visit, and on its face weaker than the regular visits language in PREA Policy "
            "III.D that revision 3 already scored as insufficient. Second, no provision "
            "expressly requires documentation of why no alternative separation could be "
            "arranged, which 115.342(h) requires, although I.A.4 makes exhaustion of less "
            "restrictive options a criterion and I.B requires thorough IIR documentation, so "
            "this is close. Third and most significant for PREA: OO 1354.5 defines "
            "Separation in its definitions section, expressly including protective custody, "
            "and then regulates only Room Confinement and Extended Room Confinement. None of "
            "the safeguards above attach to a protective separation, which is the placement "
            "this standard actually governs. OO 1352's categorical single-room rules for S-4 "
            "High and S-8 remain in place and remain the other half of this finding. OO 1354, "
            "still outstanding, is the document that would close the scope hole."
        ),
        "log": "REVISED in 4: OO 1354.5 reviewed. Four-hour cycle, supervisor authorization, "
               "exercise, education, and the punitive-use prohibition are now documented. "
               "Daily clinician visits still missing, and OO 1354.5 excludes protective "
               "separation from its own scope.",
    },
    "57": {
        "expect": ("Partial", "High"),
        "doc_add": "%s Definitions, I.A-E, II.A-K, III.A" % R1354,
        "gap_set": (
            "Sharpened by OO 1354.5. That order builds a detailed safeguard structure for "
            "room confinement: enumerated criteria, imposition only by a supervisor or Watch "
            "Commander, YDF manager authorization for any extension and again every four "
            "hours, documented justification and reintegration planning, and an enumerated "
            "list of provisions that may not be withdrawn. It then places protective "
            "separation outside its own scope. The Definitions section defines Separation as "
            "limiting a youth's participation in regular programming for a specific purpose "
            "including protective custody, and the operative sections govern only Room "
            "Confinement and Extended Room Confinement. The practical result is that the "
            "placement 115.368 governs, segregated housing used to protect a resident alleged "
            "to have suffered sexual abuse, carries fewer written safeguards than a placement "
            "used for a youth who is a behavior problem. That is the wrong way round and it "
            "is the kind of asymmetry an auditor and a plaintiff both notice. The remedy is "
            "less new drafting than extension: apply the OO 1354.5 authorization, "
            "documentation, review, and non-deprivable provisions to protective separation, "
            "and produce OO 1354 so the two can be reconciled. The daily clinician visit "
            "defect recorded at row 35 carries over here, since 115.368 incorporates the "
            "115.342 isolation requirements by reference."
        ),
        "log": "REVISED in 4: OO 1354.5 reviewed. It defines Separation to include protective "
               "custody and then regulates only room confinement, leaving the placement this "
               "standard governs with fewer safeguards than a behavioral placement.",
    },

    # ---------------------------------------------------------------- 1390/1391
    "64": {
        "expect": ("Conflict", "Critical"),
        "doc_add": "%s Purpose, I.A, II.B.4, III, IV, V" % R1390,
        "gap_set": (
            "The conflict is unchanged. PREA Policy XIV.A still permits discipline where an "
            "investigation determines allegations were false. 115.378(f) protects a good-faith "
            "report based on a reasonable belief even where the investigation does not "
            "substantiate it, and 115.352(g) permits discipline only where the agency "
            "demonstrates bad faith. As written the policy chills reporting and it will be read "
            "to a jury that way. Rewrite to a bad-faith standard with the burden on the "
            "department. OO 1390/1391 contains no false reporting provision, so it neither "
            "cures nor compounds that defect; worth preserving in the rewrite is that neither "
            "its minor nor its major rule violation list includes false reporting or lying. "
            "What OO 1390/1391 does supply, and what revisions 1 through 3 could not credit, is "
            "the formal disciplinary process the standard requires. Section IV builds a due "
            "process hearing with written notice of the violation before the hearing, a hearing "
            "officer who is not a party to the incident, an opportunity to be heard and to "
            "present evidence and testimony, staff assistance on request, an interpreter where "
            "needed, accommodations for youth with disabilities, limited literacy, and English "
            "language learners, a documented finding, administrative review by the Assistant "
            "Division Chief, and an appeal under section V that may not increase the sanction. "
            "Two strengths beyond the standard should be recorded: section III lists the "
            "available consequences and isolation is not among them, and OO 1354.5 I.C.1 "
            "independently prohibits room confinement for punishment, so the department has "
            "effectively excluded the isolation sanction whose conditions this standard "
            "otherwise regulates. That element of the requirement is satisfied by exclusion "
            "rather than by compliance, which is a stronger position, and it should be stated "
            "that way rather than left to inference. Four defects remain. First, the due "
            "process hearing attaches only where the recommended discipline is Program "
            "Separation (IV.A, IV.D.2). Sexual misconduct is a major rule violation at II.B.4, "
            "but where the recommended consequence is point loss, loss of commissary privilege, "
            "early bed, loss of bank points, or demotion to a lower level, no hearing is "
            "required by the order's own terms, whereas the standard requires the formal "
            "process for any discipline imposed for resident-on-resident sexual abuse. Second, "
            "sexual misconduct is listed as a major rule violation and is nowhere defined, so "
            "nothing distinguishes coerced from non-coerced sexual activity between residents, "
            "and nothing carves out sexual contact with a staff member, which the standard "
            "permits to be disciplined only on a finding that the staff member did not consent. "
            "That omission is serious in California, where PC 289.6 makes sexual activity "
            "between staff and a confined person criminal irrespective of purported consent, so "
            "a youth disciplined for sexual misconduct arising from staff contact would be "
            "punished for being the victim of a crime. Third, no provision requires "
            "consideration of whether a mental disability or mental illness contributed to the "
            "behavior when determining sanctions. IV.B.2 provides procedural accommodations at "
            "the hearing, which is a different thing, and the Purpose paragraph's "
            "trauma-informed language is permissive, using should rather than shall. Fourth, "
            "the standard requires sanctions commensurate with the resident's disciplinary "
            "history and consistent with those imposed for comparable offenses by residents "
            "with similar histories. The Purpose paragraph's least restrictive level language "
            "and the appeal ground at V.A.3 for discipline different from that received by "
            "others for the same offense reach part of this, but neither states the "
            "history-informed comparison. Confirm subsection lettering within 115.378 against "
            "the CFR before any of this is quoted in a deliverable; only (f) is verified here."
        ),
        "log": "MATERIALLY REVISED in 4: OO 1390/1391 reviewed. The formal disciplinary process "
               "the standard requires now largely exists, so remediation shifts from drafting a "
               "process to extending one. The XIV.A conflict is unchanged. Two new defects: the "
               "due process trigger is limited to Program Separation, and sexual misconduct is "
               "undefined with no staff-consent carve-out.",
    },

    # ---------------------------------------------------- Internal Complaints
    "41": {
        "expect": ("Not Addressed", "High"),
        "status": "Partial",
        "doc_set": "%s, Non-Discretionary Referral to Internal Affairs; Personnel Complaint "
                   "Intake Form" % RIC,
        "gap_set": (
            "Upgraded from Not Addressed. Revision 3 recorded that staff had no private channel "
            "and named the cheap fix as a confidential line, a named recipient outside the "
            "chain, or an express route to Internal Affairs stated in policy. The Internal "
            "Complaints policy supplies the third of those. Any internally generated complaint "
            "where staff misconduct is alleged or present shall be referred to the Assistant "
            "Division Chief of Internal Affairs where the matter involves unreasonable use of "
            "force, threats of violence toward a resident, retaliation for filing a grievance, "
            "or criminal conduct, documented on a Personnel Complaint Intake Form and forwarded "
            "to the Internal Affairs Manager. Staff sexual abuse of a resident is criminal "
            "conduct, so the route is mandatory and the recipient is named and sits outside the "
            "living unit chain. That is a method within the meaning of the standard. What is "
            "still missing is the privacy the standard exists to provide. The policy nowhere "
            "states that the route is confidential, does not say who makes the referral or that "
            "any employee may make it directly, and does not address the case the standard is "
            "written for, where the suspected abuser is the reporting employee's supervisor or "
            "the institutional manager to whom resident grievances are routed for review. The "
            "residual fix is narrow: state in policy that any employee may report directly and "
            "confidentially to Internal Affairs without going through the chain of command and "
            "that no supervisor may impede or inhibit the report, which also aligns the "
            "department with PC 11166(i)(1). Priority is held at High notwithstanding the "
            "narrowing, because the part that remains open is precisely the scenario the "
            "standard protects."
        ),
        "log": "REVISED in 4: upgraded from Not Addressed to Partial. Internal Complaints "
               "supplies the express, mandatory route to Internal Affairs that revision 3 "
               "identified as a sufficient fix. Privacy is still not stated. Priority held at "
               "High.",
    },
    "38": {
        "expect": ("Partial", "Medium"),
        "doc_add": "%s, Resident Grievances or Complaints; Non-Discretionary Referral to "
                   "Internal Affairs" % RIC,
        "gap_add": (
            "Internal Complaints narrows the retaliation element. It makes retaliation for "
            "filing a grievance a non-discretionary referral to the Assistant Division Chief of "
            "Internal Affairs, which gives a resident complaint about retaliation a mandatory "
            "destination once it is made. It does not make retaliation a separately reportable "
            "category within the resident-facing reporting routes, which is what this standard "
            "requires, and it does not name staff neglect or violation of responsibilities as "
            "reportable. Its resident grievance section also inserts a review gate: a grievance "
            "alleging staff misconduct is forwarded to an institutional manager for review, and "
            "only if that manager determines misconduct is alleged or present does the matter "
            "become a personnel complaint. For a sexual abuse allegation that gate should not "
            "exist, and removing it belongs in the same amendment as the OO 1361 rebuild."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. Retaliation now has a mandatory "
               "destination once reported. New observation: an institutional manager review "
               "gate sits ahead of the personnel complaint route.",
    },
    "42": {
        "expect": ("Partial", "High"),
        "doc_add": "%s, Resident Grievances or Complaints" % RIC,
        "gap_add": (
            "Internal Complaints, now reviewed, closes none of the five gaps above. It directs "
            "that resident grievances be handled first under the Juvenile Institutions "
            "Grievance Policy, and adds one provision worth keeping in the rebuild: every "
            "attempt shall be made to interview the grievant and identified resident witnesses "
            "regardless of whether they have been released. It also inserts the institutional "
            "manager review gate described at row 38, which sits awkwardly against the duty to "
            "accept and process a sexual abuse grievance and should be expressly excepted for "
            "those allegations."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. None of the five gaps close.",
    },
    "47": {
        "expect": ("Partial", "High"),
        "doc_add": "%s, Non-Discretionary Referral to Internal Affairs" % RIC,
        "gap_add": (
            "Internal Complaints partially reaches the retaliation element, but at the routing "
            "level rather than the duty level: retaliation for filing a grievance is a "
            "mandatory Internal Affairs referral once a complaint exists. It imposes no duty on "
            "staff to report retaliation they observe, and it does not touch sexual harassment "
            "as a separately reportable category or staff neglect or violation of "
            "responsibilities contributing to an incident. The reporting duty and the routing "
            "rule need to be stated together, in the same amendment."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. Retaliation routing exists; the "
               "staff reporting duty still does not reach it.",
    },
    "56": {
        "expect": ("Partial", "Critical"),
        "doc_add": "%s, Non-Discretionary Referral to Internal Affairs; Notification and "
                   "Tracking" % RIC,
        "gap_add": (
            "Internal Complaints supplies the first operational retaliation element the "
            "department has on paper. Retaliation for filing a grievance is a non-discretionary "
            "referral to the Assistant Division Chief of Internal Affairs, all such matters are "
            "tracked and their documentation retained by Internal Affairs, and a Case "
            "Dispositional Notice goes to the complainant. That is a named recipient and a "
            "tracking mechanism, and it partially answers the designation element. It does not "
            "reach retaliation for reporting sexual abuse by any route other than a grievance, "
            "and it does not reach retaliation against staff who report or cooperate. "
            "Everything on the monitoring side remains absent: no 90-day monitoring period, no "
            "enumerated indicators, no periodic status checks with the youth, and no protection "
            "measures list. Priority stays Critical."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. A designated recipient and tracking "
               "now exist for grievance retaliation; all monitoring elements still missing.",
    },
    "58": {
        "expect": ("Partial", "Critical"),
        "doc_add": "%s, Non-Discretionary Referral to Internal Affairs; Discretionary Referral "
                   "to Internal Affairs; Personnel Complaint Intake Form" % RIC,
        "gap_add": (
            "Internal Complaints, now reviewed, cuts both ways. It adds intake quality that the "
            "earlier documents did not supply: the Personnel Complaint Intake Form must carry "
            "the complainant's name and contact information, identifying information for the "
            "employee suspected of misconduct, the specific date, time, and nature of each "
            "allegation, witness information, and any investigative leads and items of "
            "evidentiary value. It also requires that every attempt be made to interview the "
            "grievant and identified resident witnesses regardless of whether they have been "
            "released. Against that, it states that the Internal Affairs Manager will determine "
            "whether or not a formal investigation is necessary, with no exception for "
            "allegations of sexual abuse or sexual harassment, where 115.371(a) requires that "
            "an administrative or criminal investigation be completed for all such allegations. "
            "The policy nowhere says that a sexual abuse allegation may go uninvestigated, so "
            "this is recorded as a defect rather than scored as a thirteenth conflict, but it "
            "is the closest thing in the documents reviewed to one. Correct it with an express "
            "carve-out: allegations of sexual abuse or sexual harassment are referred and "
            "investigated, and the discretion not to investigate does not reach them."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. Intake and evidence-preservation "
               "elements credited. New defect: unqualified Internal Affairs Manager discretion "
               "over whether to investigate, with no sexual abuse carve-out. Recorded as a "
               "defect, not scored as a conflict.",
    },
    "59": {
        "expect": ("Conflict", "Critical"),
        "doc_add": "%s, Notification and Tracking; Resident Grievances or Complaints" % RIC,
        "gap_add": (
            "Internal Complaints adds a fourth departmental document pointing at Internal "
            "Affairs retention, stating that all discretionary and non-discretionary "
            "investigative documentation and evidence shall be retained by Internal Affairs. It "
            "states no period, so it neither resolves nor worsens the three-way conflict, but it "
            "does mean the reconciled schedule has to be reflected in four documents rather "
            "than three. It supplies part of the rule that a departure does not terminate an "
            "investigation: every attempt shall be made to interview the grievant and "
            "identified resident witnesses regardless of whether they have been released, which "
            "is the resident half. The staff half, that an alleged abuser's resignation or "
            "separation does not terminate the investigation, still does not appear in the "
            "documents reviewed, and it interacts directly with the unmet reporting duty at "
            "row 62."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. A fourth document now bears on "
               "retention. The resident half of the no-termination-on-departure rule is "
               "supplied; the staff half is not.",
    },
    "61": {
        "expect": ("Partial", "Critical"),
        "doc_add": "%s, Notification and Tracking" % RIC,
        "gap_add": (
            "Internal Complaints extends the notification duty beyond Internal Affairs XI.B.1. "
            "Internal Affairs sends Case Dispositional Notices to complainants in all cases "
            "resulting in a formal investigation completed by either Internal Affairs or the "
            "Division, and the affected Division provides notice of the outcome to the "
            "complaining party for matters resolved without a formal investigation. That widens "
            "coverage without changing the character of the gap: notification remains contingent "
            "on the youth being treated as the complainant, it uses Internal Affairs disposition "
            "language rather than substantiated, unsubstantiated, or unfounded, and none of the "
            "four ongoing notifications following a staff abuse allegation or the two following "
            "a youth-on-youth allegation appear. The duty is also qualified as owed to the "
            "extent it can be given by law and policy, which needs to be reconciled with "
            "115.373 rather than left standing as a general reservation."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. Notification now reaches "
               "Division-resolved matters as well as Internal Affairs investigations; the "
               "character of the gap is unchanged.",
    },
    "62": {
        "expect": ("Partial", "High"),
        "doc_add": "%s, full document" % RIC,
        "gap_add": (
            "Internal Complaints adds the intake and tracking layer around the Internal Affairs "
            "disciplinary machinery: a Personnel Complaint Intake Form, a Complaint Action "
            "Report returned to the referring division, tracking and retention of all "
            "discretionary and non-discretionary matters by Internal Affairs, and dispositional "
            "notices to both the complainant and the subject staff member. Neither of the two "
            "PREA-specific additions is supplied: the presumptive termination rule and the duty "
            "to report terminations, and resignations by staff who would have been terminated, "
            "to law enforcement and to relevant licensing bodies. One further observation for "
            "the rewrite: the non-discretionary referral list names unreasonable use of force, "
            "discrimination, sexual harassment or workplace violence, threats of violence "
            "toward a resident, and criminal conduct, but does not name staff sexual abuse or "
            "sexual harassment of a resident as a category of its own. It is caught as criminal "
            "conduct, but an auditor scores the named category, and the employment-context "
            "reading of the sexual harassment entry makes the omission worth curing."
        ),
        "log": "REVISED in 4: Internal Complaints reviewed. Intake and tracking credited; "
               "neither PREA-specific element closes. Staff sexual abuse of a resident is not a "
               "named mandatory-referral category.",
    },
}


def main():
    with open(CSV_PATH, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        fields = reader.fieldnames
        rows = list(reader)

    seen = set()
    for row in rows:
        ch = CHANGES.get(row["id"])
        if not ch:
            continue
        seen.add(row["id"])

        exp_status, exp_priority = ch["expect"]
        if (row["status"], row["priority"]) != (exp_status, exp_priority):
            sys.exit("row %s: expected %s/%s, found %s/%s. Aborting without writing."
                     % (row["id"], exp_status, exp_priority, row["status"], row["priority"]))

        if "doc_set" in ch:
            row["county_document"] = ch["doc_set"]
        elif "doc_add" in ch:
            row["county_document"] = row["county_document"].rstrip("; ") + "; " + ch["doc_add"]

        if "gap_set" in ch:
            row["gap"] = ch["gap_set"]
        elif "gap_add" in ch:
            row["gap"] = row["gap"].rstrip() + " " + ch["gap_add"]

        if "status" in ch:
            row["status"] = ch["status"]
        if "priority" in ch:
            row["priority"] = ch["priority"]

        row["change_log"] = (row["change_log"].rstrip() + " " + ch["log"]).strip()

    missing = set(CHANGES) - seen
    if missing:
        sys.exit("rows not found in register: %s" % ", ".join(sorted(missing)))

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    from collections import Counter
    print("rows updated  %d" % len(seen))
    print("status        %s" % dict(Counter(r["status"] for r in rows)))
    print("priority      %s" % dict(Counter(r["priority"] for r in rows)))


if __name__ == "__main__":
    main()
