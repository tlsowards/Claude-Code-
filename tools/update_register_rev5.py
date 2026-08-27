#!/usr/bin/env python3
"""Apply Revision 5 to prea-register.csv.

Revision 5 is a verification pass, not a re-scoring. No status or priority
changes. Every edit records whether a California citation was confirmed
against source, and two rows gain new substantive findings that the source
text supports.

Source of truth for this pass:
  docs/title15-bscc-juvenile.pdf
  Title 15, Minimum Standards for Juvenile Facilities, BSCC
  Rev. 04/01/2014, effective 04/01/2014

That is the only Title 15 edition produced to date. It predates the January
2019 rewrite, so it cannot confirm any citation to 1350.5, 1352.5, 1354.5,
1352(f), 1353(c) as used here, 1360(g), 1361(h), or 1324(n). Those are
flagged rather than dropped, because they are probably right; they are simply
not yet checked against text.

The script asserts the pre-state (status, priority) of every row it touches,
so a second run fails loudly rather than double-applying.
"""

import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, "prea-register.csv")

ED = "Title 15 rev. 04/01/2014"

# Standard tail for a citation confirmed against the produced edition.
def ok(detail):
    return ("VERIFIED in Revision 5 against %s, the only edition produced: %s"
            % (ED, detail))

# Standard tail for a citation the produced edition cannot reach.
def pending(detail):
    return ("NOT VERIFIED in Revision 5. The only Title 15 edition produced is "
            "rev. 04/01/2014, which predates the January 2019 rewrite; %s. The "
            "citation is to the post-2019 text and is carried forward "
            "unconfirmed. Obtain the current BSCC edition before quoting it."
            % detail)

NO_1350_5 = "that edition contains no section 1350.5"
NO_1352_5 = "that edition contains no section 1352.5"
NO_1354_5 = "that edition contains no section 1354.5"

# id -> (expected status, expected priority, gap addition, change_log addition)
CHANGES = {
    # ---------------------------------------------------------------- 1324
    "1": ("Partial", "High",
          pending("section 1324 in that edition runs (a) through (j), so there "
                  "is no subsection (n)"),
          "FLAGGED in 5: 15 CCR 1324(n) not confirmed; produced edition ends 1324 at (j)."),
    "46": ("Not Addressed", "High",
           pending("section 1324 in that edition runs (a) through (j), so there "
                   "is no subsection (n)"),
           "FLAGGED in 5: 15 CCR 1324(n) not confirmed; produced edition ends 1324 at (j)."),
    "20": ("Partial", "High",
           ok("1324(d) requires an initial orientation and training program for "
              "employees, and 1324(e) requires initial orientation including "
              "safety, security, and anti-discrimination policies for support "
              "staff, contract employees, school and medical staff, program "
              "providers, and volunteers. Both subsections read as cited."),
           "VERIFIED in 5: 15 CCR 1324(d) and (e) confirmed against source."),
    "24": ("Partial", "High",
           ok("1324(e) reaches support staff, contract employees, school and "
              "medical staff, program providers, and volunteers, which is the "
              "population this requirement concerns."),
           "VERIFIED in 5: 15 CCR 1324(e) confirmed against source."),
    "74": ("Conflict", "Critical",
           ok("1324 requires the manual to be 'administratively reviewed at a "
              "minimum every two years, and updated, as necessary.' The biennial "
              "review obligation is confirmed, and it has been in force since at "
              "least April 2014, so the age of the PREA Policy (2013) and the "
              "Internal Affairs policy (2011) has been a standing defect for "
              "over a decade rather than a recent lapse. Note that this edition "
              "runs 1324(a) to (j); the (a)-(n) range in this row's citation "
              "reflects the post-2019 text and is not confirmed."),
           "VERIFIED in 5: biennial administrative review confirmed against source, "
           "in force since at least 04/2014. Subsection range (a)-(n) not confirmed."),

    # ---------------------------------------------------------------- 1321
    "5": ("Not Addressed", "Critical",
          ok("1321(a) requires 'an adequate number of personnel sufficient to "
             "carry out its program,' and 1321(h) requires assignment of "
             "sufficient youth supervision staff for continuous wide awake "
             "supervision. Both read as cited. Neither supplies the written "
             "staffing plan this requirement concerns, so the finding stands."),
          "VERIFIED in 5: 15 CCR 1321(a) and (h) confirmed against source."),
    "6": ("Conflict", "Critical",
          ok("1321(h)(1)(A) sets one wide-awake youth supervision staff member "
             "for each 10 youth during waking hours and (B) one for each 30 "
             "during sleeping hours, for juvenile halls. The conflict with the "
             "federal 1:8 and 1:16 is confirmed on both sides. Two further "
             "points from source. 1321(h)(1)(E) excludes personnel whose primary "
             "responsibility is administration, supervision of personnel, "
             "academic or trade instruction, clerical, kitchen, or maintenance "
             "from counting as youth supervision staff, which is the state "
             "analogue of the federal security-staff-only rule and means the "
             "1:10 count is already required to be a clean count. And 1301 "
             "provides that county standards may 'meet or exceed and do not "
             "conflict with' the state minimums, confirming that adopting 1:8 "
             "and 1:16 is open to the department without a variance."),
          "VERIFIED in 5: 15 CCR 1321(h)(1)(A)-(B) and 1301 confirmed against source; "
          "1321(h)(1)(E) staff-exclusion rule added."),

    # ---------------------------------------------------------------- 1352
    "36": ("Conflict", "Critical",
           "MATERIALLY STRENGTHENED in Revision 5 by verification against source. "
           "15 CCR 1352(e) reads, in the edition effective April 1, 2014: "
           "'provide that facility staff shall not separate youth from the "
           "general population or assign youth to a single occupancy room based "
           "solely on the youth's actual or perceived race, ethnic group "
           "identification, ancestry, national origin, color, religion, gender, "
           "sexual orientation, gender identity, gender expression, mental or "
           "physical disability, or HIV status.' The section then supplies its "
           "own carve-out: 'This section does not prohibit staff from placing "
           "youth in a single occupancy room at the youth's specific request or "
           "in accordance with Title 15 regulations regarding separation.' Two "
           "consequences. First, the chronology is far worse than Revision 4 "
           "recorded. This rule was not added by the 2019 Title 15 rewrite. It "
           "has been California law since at least April 1, 2014, five and a "
           "half years before OO 1352 created S-8 on December 9, 2019 and "
           "retained it on the February 27, 2020 revision. Second, the carve-out "
           "states the lawful alternative on the face of the regulation: "
           "individualized placement, or single-room housing at the youth's own "
           "request. S-8 is neither. A second and independent state hook is now "
           "confirmed: 1324(h) requires the policy and procedure manual itself "
           "to contain a non-discrimination provision barring discrimination on "
           "the same listed bases 'including restrictive housing or "
           "classification decisions based solely on any of the above mentioned "
           "categories.' S-8 is a classification decision based solely on a "
           "listed category, so it is both an operational violation of 1352(e) "
           "and a defect in the required contents of the manual under 1324(h). "
           "The 1324(h) route is the cleaner BSCC inspection finding because it "
           "does not depend on whether PREA binds a county facility. Note that "
           "the produced edition ends 1352 at (e); the '(f)' in this row's "
           "citation reflects the post-2019 text and is not confirmed.",
           "MATERIALLY REVISED in 5: 15 CCR 1352(e) verified against source and "
           "dated to 04/01/2014, not 2019, so S-8 postdates the rule by five and a "
           "half years. 15 CCR 1324(h) added as an independent hook. 1352(f) not confirmed."),
    "37": ("Conflict", "High",
           pending(NO_1352_5),
           "FLAGGED in 5: 15 CCR 1352.5 not confirmed; absent from the produced edition."),
    "10": ("Not Addressed", "High",
           pending(NO_1352_5),
           "FLAGGED in 5: 15 CCR 1352.5 not confirmed; absent from the produced edition."),
    "11": ("Addressed", "Low",
           pending(NO_1352_5),
           "FLAGGED in 5: 15 CCR 1352.5 not confirmed; absent from the produced edition."),
    "75": ("Addressed", "Low",
           pending(NO_1352_5),
           "FLAGGED in 5: 15 CCR 1352.5 not confirmed; absent from the produced edition."),

    # ---------------------------------------------------------------- 1350.5
    "31": ("Partial", "High",
           pending(NO_1350_5),
           "FLAGGED in 5: 15 CCR 1350.5 not confirmed; absent from the produced edition."),
    "33": ("Addressed", "Low",
           pending(NO_1350_5),
           "FLAGGED in 5: 15 CCR 1350.5 not confirmed; absent from the produced edition."),
    "80": ("Conflict", "High",
           pending(NO_1350_5),
           "FLAGGED in 5: 15 CCR 1350.5 not confirmed; absent from the produced edition."),

    # ---------------------------------------------------------------- 1354
    # Rows 35 and 57 are the only entries that compound ok() and pending().
    # They cite 1354 and 1354.5 together: 1354 is confirmed against the produced
    # edition, 1354.5 is absent from it, so the row needs both halves. Row 74 is
    # also partly confirmed and partly not, but it reads better as one ok() whose
    # text names the unconfirmed (a)-(n) range, so it stays a single call.
    "35": ("Partial", "High",
           ok("1354 requires written policies and procedures addressing "
              "separation 'for reasons that include, but are not be limited to, "
              "medical and mental health conditions, assaultive behavior, "
              "disciplinary consequences and protective custody,' provides that "
              "'Separated youth shall not be denied normal privileges available "
              "at the facility, except when necessary to accomplish the "
              "objective of separation,' and requires that policies 'ensure a "
              "daily review of separated youth to determine if separation "
              "remains necessary.' This confirms and sharpens the Revision 4 "
              "finding. OO 1354.5's definition of Separation tracks the 1354 "
              "list almost verbatim, so the department took the scope from 1354 "
              "and then wrote safeguards for only one branch of it. The daily "
              "review obligation attaches to all separated youth, including "
              "protective custody, and is the specific provision OO 1354 must be "
              "shown to implement.") + " " + pending(NO_1354_5),
           "VERIFIED in 5: 15 CCR 1354 confirmed against source, including the daily "
           "review duty covering protective custody. 1354.5 not confirmed."),
    "57": ("Partial", "High",
           ok("1354 expressly includes protective custody within separation and "
              "requires a daily review of all separated youth, together with "
              "retention of normal privileges except as necessary to accomplish "
              "the objective of the separation. The protective placement this "
              "requirement concerns is therefore already regulated by state law "
              "at a level OO 1354.5 does not reach, which raises the value of "
              "producing OO 1354.") + " " + pending(NO_1354_5),
           "VERIFIED in 5: 15 CCR 1354 confirmed against source. 1354.5 not confirmed."),

    # ---------------------------------------------------------------- 1390/1391
    "64": ("Conflict", "Critical",
           "NEW STATE-LAW DEFECT identified in Revision 5 by verification against "
           "source. 15 CCR 1391(e) attaches the due process elements to major "
           "rule violations as a class, defining them as violations 'which may "
           "include withdrawal from group activities for 24 hours or more or "
           "extension of time in custody,' and requires written notice before "
           "hearing, hearing by a person not a party to the incident, "
           "opportunity to be heard and present evidence and testimony, staff "
           "assistance, and administrative review. OO 1390/1391 IV.A attaches "
           "the hearing only where the recommended discipline is Program "
           "Separation. The department has therefore narrowed the trigger from "
           "the regulatory class of major rule violations to a single sanction "
           "within that class, so a youth found to have committed a major rule "
           "violation and given any lesser consequence receives none of the "
           "1391(e) protections. This was recorded in Revision 4 as a PREA "
           "observation; it is now a confirmed Title 15 defect, which makes it "
           "actionable on BSCC inspection independent of PREA. 1390 is confirmed "
           "as cited: least restrictive level, no corporal or group punishment "
           "or degradation, and a ten-item deprivation floor at (a) to (j). OO "
           "1390/1391 I.A exceeds that floor by adding rehabilitative "
           "programming as an eleventh item, which is worth preserving in any "
           "amendment.",
           "MATERIALLY REVISED in 5: 15 CCR 1391(e) verified against source. The "
           "due process trigger defect is now a confirmed Title 15 violation, not "
           "only a PREA observation."),

    # ---------------------------------------------------------------- 1360/1361
    "9": ("Partial", "Medium",
          pending("section 1360 in that edition runs (a) through (f), and (f) is "
                  "'searches of transgender youth,' so there is no subsection (g)"),
          "FLAGGED in 5: 15 CCR 1360(g) not confirmed; produced edition ends 1360 at (f)."),
    "38": ("Partial", "Medium",
           pending("section 1361 in that edition runs (a) through (f), so there "
                   "is no subsection (h)"),
           "FLAGGED in 5: 15 CCR 1361(h) not confirmed; produced edition ends 1361 at (f)."),
    "39": ("Partial", "High",
           pending("section 1361 in that edition runs (a) through (f), so there "
                   "is no subsection (h)"),
           "FLAGGED in 5: 15 CCR 1361(h) not confirmed; produced edition ends 1361 at (f)."),
    "42": ("Partial", "High",
           ok("1361 is confirmed as cited, running (a) to (f). 1361(b) is "
              "directly relevant and was not previously drawn out: it requires "
              "that 'the youth shall have the option to confidentially file the "
              "grievance.' The confidential filing option is therefore already "
              "a state requirement, which narrows what OO 1361 has to add."),
           "VERIFIED in 5: 15 CCR 1361 confirmed against source; 1361(b) confidential "
           "filing option added."),

    # ---------------------------------------------------------------- 1353
    "13": ("Partial", "Medium",
           ok("1353 requires orientation before placement in a living area, in "
              "both written and verbal form, with provision for youth with "
              "disabilities, limited English proficiency, or limited literacy, "
              "across sixteen listed topics at (a) to (p), including (p) "
              "non-discrimination policy. The accessibility duty this "
              "requirement concerns is confirmed."),
           "VERIFIED in 5: 15 CCR 1353 confirmed against source."),
    "25": ("Addressed", "Low",
           "CITATION FLAGGED in Revision 5. In the produced edition, 15 CCR "
           "1353(c) is 'access to legal services,' which is not the resident "
           "education content this row scores. Either the subsection lettering "
           "changed in the January 2019 rewrite or the citation is to the wrong "
           "subsection. The substance of the finding is unaffected, because 1353 "
           "plainly requires orientation on the listed topics, but the pinpoint "
           "must be corrected against the current edition before it is quoted.",
           "FLAGGED in 5: 15 CCR 1353(c) reads 'access to legal services' in the "
           "produced edition; pinpoint needs correction against the current text."),
    "28": ("Addressed", "Low",
           ok("1353 is confirmed, including the requirement that orientation "
              "occur prior to placement in a living area and be given in both "
              "written and verbal form."),
           "VERIFIED in 5: 15 CCR 1353 confirmed against source."),

    # ---------------------------------------------------------------- 1452/1453
    "16": ("Partial", "High",
           ok("1453 requires the health administrator, with the facility "
              "administrator, to develop policy for treating victims of sexual "
              "assault and for reporting such incidents to local law "
              "enforcement, and requires that 'the evidentiary examination and "
              "initial treatment of victims of sexual assault shall be conducted "
              "at a health facility that is separate from the custodial facility "
              "and is properly equipped and staffed with personnel trained and "
              "experienced in such procedures.' The off-site examination duty is "
              "a state requirement, not merely a PREA preference. 1452 requires "
              "forensic evidence to be collected by appropriately trained "
              "medical personnel who are not responsible for the youth's ongoing "
              "health care."),
           "VERIFIED in 5: 15 CCR 1452 and 1453 confirmed against source, including "
           "the off-site evidentiary examination requirement."),
    "17": ("Partial", "Medium",
           ok("1453 requires the evidentiary examination and initial treatment "
              "to occur at a health facility separate from the custodial "
              "facility, properly equipped and staffed with trained and "
              "experienced personnel. 1452 requires collection by trained "
              "medical personnel who are not the youth's ongoing care "
              "providers."),
           "VERIFIED in 5: 15 CCR 1452 and 1453 confirmed against source."),
    "67": ("Partial", "High",
           ok("1453 requires policy and procedures both for treating victims of "
              "sexual assault and for reporting such incidents to local law "
              "enforcement when they occur in the facility."),
           "VERIFIED in 5: 15 CCR 1453 confirmed against source."),
}


def main():
    with open(CSV_PATH, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        fields = reader.fieldnames
        rows = list(reader)

    seen = set()
    errors = []
    for r in rows:
        rid = r["id"]
        if rid not in CHANGES:
            continue
        want_status, want_priority, gap_add, log_add = CHANGES[rid]
        if r["status"] != want_status or r["priority"] != want_priority:
            errors.append(
                "row %s: expected (%s, %s) but found (%s, %s). Revision 5 may "
                "already be applied, or the row moved."
                % (rid, want_status, want_priority, r["status"], r["priority"]))
            continue
        if "in Revision 5" in r["gap"] or "in 5:" in r["change_log"]:
            errors.append("row %s already carries Revision 5 text." % rid)
            continue
        r["gap"] = r["gap"].rstrip() + " " + gap_add
        r["change_log"] = (r["change_log"] + " " if r["change_log"] else "") + log_add
        seen.add(rid)

    missing = set(CHANGES) - seen
    if missing:
        errors.append("rows named in CHANGES but not applied: %s"
                      % ", ".join(sorted(missing, key=int)))
    if errors:
        print("ABORTED, nothing written:", file=sys.stderr)
        for e in errors:
            print("  " + e, file=sys.stderr)
        return 1

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print("Revision 5 applied to %d rows: %s"
          % (len(seen), ", ".join(sorted(seen, key=int))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
