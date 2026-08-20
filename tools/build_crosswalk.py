#!/usr/bin/env python3
"""Build the PREA versus Policy crosswalk from prea-register.csv.

Emits:
  deliverables/PREA_versus_Policy_Crosswalk.md    readable source of record
  tools/crosswalk.json                            intermediate consumed by build_crosswalk_docx.js

Everything in the output is derived from prea-register.csv or from the verified
authorities recorded in CLAUDE.md. Nothing is invented here.
"""

import csv
import json
import os
import re
from collections import Counter, OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, "prea-register.csv")
JSON_PATH = os.path.join(ROOT, "tools", "crosswalk.json")
MD_PATH = os.path.join(ROOT, "deliverables", "PREA_versus_Policy_Crosswalk.md")

REVISION = 3

# Order used by 28 CFR part 115 subpart D, with the California and audit
# groupings appended, so the document tracks what an auditor scores in order.
AREA_ORDER = [
    "Prevention Planning",
    "Responsive Planning",
    "Training and Education",
    "Screening",
    "Reporting",
    "Official Response",
    "Investigations",
    "Discipline",
    "Medical and Mental Health",
    "Data Collection and Review",
    "Audit",
    "California-Specific",
]

STATUS_ORDER = ["Conflict", "Not Addressed", "Partial", "Not Evidenced", "Addressed"]

# The fourteen documents reviewed, in CLAUDE.md section 4 order. The patterns
# match how each document is named in the register's county_document column.
# documents_for() tests every pattern independently, so list order does not
# affect matching; it only sets the order of part 5. What keeps "OO 1352.5"
# from also matching the OO 1352 entry is the negative lookahead on that
# pattern, so leave it in place if these are ever reordered.
DOCUMENTS = [
    ("PREA Policy and Procedure, Juvenile Institutions", "eff/rev 04/25/2013",
     r"PREA Policy"),
    ("OO 1321 Staffing", "reviewed 01/16/2020", r"OO 1321"),
    ("OO 1322 Training and Staff Development", "eff 06/15/2015, rev 05/08/2019",
     r"OO 1322"),
    ("OO 1350.5 Screening for the Risk of Sexual Abuse", "eff 11/10/2019",
     r"OO 1350\.5"),
    ("OO 1352 Classification", "eff 12/09/2019, rev 02/27/2020",
     r"OO 1352(?!\.5)"),
    ("OO 1352.5 Transgender and Intersex Youth", "eff 03/01/2019",
     r"OO 1352\.5"),
    ("OO 1360 Searches", "eff 12/01/2019, rev 03/04/2020", r"OO 1360"),
    ("OO 1361 Grievances", "eff 01/01/2011, rev 04/03/2019", r"OO 1361"),
    ("OO 1362 Reporting of Incidents", "eff 11/01/2019", r"OO 1362"),
    ("OO 1453 Sexual Assault", "eff 04/25/2013, rev 12/09/2019", r"OO 1453"),
    ("Internal Affairs Administrative Investigations", "eff 01/11/2011, no revision",
     r"Internal Affairs"),
    ("Code of Conduct, Non-Sworn and Non-County Personnel", "eff 06/01/2011",
     r"Code of Conduct"),
    ("Detention and Intake Responsibility (J-3.4)", "undated",
     r"J-3\.4|Detention and Intake Responsibility"),
    ("General Order, Mandatory Reporting: Dependent Adult and Elder Abuse",
     "eff 06/30/2017", r"Dependent Adult|Elder Abuse"),
]

# The twelve conflicts, stated as law versus policy. Text is taken from the
# verified findings in CLAUDE.md section 5 and the register gap column. Each
# entry names the register rows it covers so the reader can trace it back.
CONFLICTS = [
    {
        "n": 1,
        "topic": "Categorical LGBTQI housing (classification S-8)",
        "rows": [36],
        "law": "28 CFR 115.342(c); 15 CCR 1352(e). LGBTI residents shall not be "
               "placed in particular housing, bed, or other assignments solely on "
               "the basis of that identification or status.",
        "policy": "OO 1352 II.M creates classification S-8 for any LGBTQI youth, "
                  "and III.I requires single-room housing at all times for S-8.",
        "note": "Also contradicts OO 1352's own Purpose and Scope paragraph, PREA "
                "Policy III.E, and OO 1352.5 III.H. The chronology is damaging: "
                "OO 1352.5 stated the correct rule effective 03/2019, and S-8 was "
                "created 12/2019 and revised 02/2020.",
        "fix": "Recommended change 1: rescind the S-8 single-room mandate.",
    },
    {
        "n": 2,
        "topic": "Categorical single-room housing for transgender and intersex youth",
        "rows": [37],
        "law": "28 CFR 115.342(d) to (g); 15 CCR 1352.5(a) to (e). Housing and "
               "program assignments are decided case by case.",
        "policy": "OO 1352.5 III.I gives all transgender and intersex youth a "
                  "single room.",
        "note": "The same categorical defect as conflict 1 but more defensible: "
                "there is a privacy rationale and program access is preserved at "
                "III.K. It still contradicts III.B, III.F, and III.H of the same "
                "order.",
        "fix": "Recommended change 2: convert to a presumptive, documented, "
               "individualized outcome.",
    },
    {
        "n": 3,
        "topic": "Child abuse reporting timeline",
        "rows": [48],
        "law": "PC 11166(a). Telephone report immediately or as soon as "
               "practicably possible, written report within 36 hours on DOJ form "
               "SS 8572.",
        "policy": "PREA Policy V.A.4 and OO 1453 I.A.9 both state that sexual "
                  "assault is reported to Child Protective Services verbally "
                  "within 24 hours.",
        "note": "The error appears in two documents, and OO 1453 restated it on a "
                "12/2019 revision. Code of Conduct VII.A.1 states the rule "
                "correctly, so the department is not uniform against itself.",
        "fix": "Recommended change 3: correct the standard and relocate it to a "
               "new department-wide General Order.",
    },
    {
        "n": 4,
        "topic": "Cross-facility notification window",
        "rows": [52],
        "law": "28 CFR 115.363(b). Notify the head of the facility where the "
               "abuse allegedly occurred within 72 hours.",
        "policy": "PREA Policy V.A.7 allows 14 days.",
        "note": "A straight timeline error. The 14-day figure appears to have "
                "been carried over from the attorney notification timeline in "
                "115.361(e)(3).",
        "fix": "Recommended change 4: correct 14 days to 72 hours.",
    },
    {
        "n": 5,
        "topic": "Discipline for allegations found false",
        "rows": [64],
        "law": "28 CFR 115.378(f) protects a good-faith report based on a "
               "reasonable belief even where the investigation does not "
               "substantiate it. 115.352(g) permits discipline only on a showing "
               "of bad faith.",
        "policy": "PREA Policy XIV.A permits discipline where an investigation "
                  "determines the allegations were false.",
        "note": "A false-allegations rule stated at this breadth suppresses "
                "reporting, which is the behavior the standard is written to "
                "protect.",
        "fix": "Recommended change 5: rewrite to a bad-faith standard.",
    },
    {
        "n": 6,
        "topic": "Victimization treated as an indicator of abusiveness",
        "rows": [80],
        "law": "28 CFR 115.341(c). Prior victimization and prior abusiveness are "
               "screened as distinct risk factors.",
        "policy": "The note at OO 1352 II.F.2 states that a history of being a "
                  "victim of molest, arson, or cruelty to animals should alert "
                  "the Classification Officer to possible sexually inappropriate "
                  "tendencies.",
        "note": "This instructs staff to treat a youth's own sexual victimization "
                "as a predictor of sexual abusiveness, which is the inference "
                "115.341(c) separates.",
        "fix": "Recommended change 6: delete the inference, split the code, and "
               "add PC 287 to the S-4 High criteria.",
    },
    {
        "n": 7,
        "topic": "Records retention",
        "rows": [59],
        "law": "28 CFR 115.371(j). Retain investigation reports for as long as "
               "the alleged abuser is employed or incarcerated, plus five years.",
        "policy": "Internal Affairs XI.C.1 sets five years. PREA Policy XVIII.B "
                  "sets ten years.",
        "note": "Three different rules govern the same records. AB 452 eliminated "
                "the limitations period for childhood sexual assault occurring on "
                "or after 01/01/2024, so the shortest of the three is the one "
                "that will be tested.",
        "fix": "Recommended change 7: adopt a single reconciled retention "
               "schedule.",
    },
    {
        "n": 8,
        "topic": "Staffing ratios",
        "rows": [6],
        "law": "28 CFR 115.313(c). At least 1:8 during waking hours and 1:16 "
               "during sleeping hours, security staff only, required since "
               "10/01/2017.",
        "policy": "OO 1321 I.B.1 to 2 sets 1:10 waking and 1:30 sleeping.",
        "note": "The county standard mirrors the Title 15 floor. 15 CCR 1301 "
                "expressly permits exceeding it. Verify rosters and post "
                "assignments before assuming the practice matches the written "
                "ratio in either direction.",
        "fix": "Recommended change 9: verify against rosters and build the "
               "115.313(a) staffing plan.",
    },
    {
        "n": 9,
        "topic": "Duty assigned to a position that does not exist",
        "rows": [2],
        "law": "28 CFR 115.311(b). Designate an upper-level, agency-wide PREA "
               "Coordinator.",
        "policy": "OO 1453 I.A.15 directs the sexual abuse incident review report "
                  "to the PREA Coordinator, a position the department does not "
                  "have.",
        "note": "Two consequences. The required report has nowhere to go, so the "
                "review terminates in a dead letter. And this is written "
                "departmental acknowledgment, dated 2019, that the role is "
                "needed.",
        "fix": "Recommended change 8: designate a PREA Coordinator and a facility "
               "Compliance Manager.",
    },
    {
        "n": 10,
        "topic": "Policy age and biennial review",
        "rows": [74],
        "law": "15 CCR 1324. The policy and procedure manual is administratively "
               "reviewed at least every two years and updated as necessary.",
        "policy": "The PREA Policy was last revised 04/25/2013. The Internal "
                  "Affairs policy is effective 01/11/2011 with no revision shown.",
        "note": "The PREA Policy predates the 01/01/2019 Title 15 rewrite that "
                "added 1350.5, 1352.5, 1324(n), and 1361(h), and predates the "
                "renumbering of PC 288a to PC 287.",
        "fix": "Recommended change 3 in part, and the full rewrite at likely next "
               "task 3.",
    },
    {
        "n": 11,
        "topic": "Obsolete statutory citations",
        "rows": [78],
        "law": "PC 287. SB 1494 renumbered PC 288a to PC 287 effective "
               "01/01/2019.",
        "policy": "PREA Policy I.I.1 still cites PC 288a. OO 1352 II.G.1 omits "
                  "287 from the S-4 High criteria entirely, so a 287 "
                  "adjudication does not meet the enumerated criteria. OO 1352 "
                  "II.C.3 references DJJ, which closed 06/30/2023.",
        "note": "The S-4 omission is the operative one: it is not a citation "
                "cosmetic, it changes who gets classified.",
        "fix": "Recommended change 6.",
    },
    {
        "n": 12,
        "topic": "Intake policy substantively obsolete",
        "rows": [79],
        "law": "15 CCR 1350 and 1350.5. Intake and admittance policy must reflect "
               "current law and carry the admittance elements added in 2019.",
        "policy": "Detention and Intake Responsibility (J-3.4) references CYA and "
                  "CYA parolees throughout, contains no PREA or sexual abuse "
                  "screening content, and does not reference OO 1350.5.",
        "note": "CYA became the Division of Juvenile Justice in 2005 and closed "
                "entirely on 06/30/2023 under SB 823.",
        "fix": "Rewrite rather than amend.",
    },
]


# Register row 79 carries a document name, "Detention and Intake Responsibility
# (J-3.4)", in the ca_title15_or_statute column rather than a citation. The
# controlling authority is the one stated in that row's requirement text. This
# override corrects the heading in this view only; the CSV is left alone so the
# fix happens at source, not in a generator.
AUTHORITY_OVERRIDES = {79: "15 CCR 1350; 15 CCR 1350.5"}


def authority(row):
    """The controlling citation for a requirement, federal first."""
    if int(row["id"]) in AUTHORITY_OVERRIDES:
        return AUTHORITY_OVERRIDES[int(row["id"])]
    if not row["cfr_28_subpart_d"] and not row["ca_title15_or_statute"]:
        return "Departmental policy structure"
    out = []
    if row["cfr_28_subpart_d"]:
        out.append("28 CFR " + row["cfr_28_subpart_d"])
    if row["ca_title15_or_statute"]:
        out.append(row["ca_title15_or_statute"])
    return "; ".join(out)


def documents_for(row):
    """Which of the fourteen reviewed documents a register row cites."""
    text = row["county_document"]
    hits = [name for name, _, pat in DOCUMENTS if re.search(pat, text)]
    return hits


def load():
    with open(CSV_PATH, newline="", encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    for r in rows:
        r["id"] = int(r["id"])
        r["authority"] = authority(r)
        r["documents"] = documents_for(r)
    return rows


def build(rows):
    by_status = Counter(r["status"] for r in rows)
    by_priority = Counter(r["priority"] for r in rows)

    # Status by area, the matrix that shows where divergence concentrates.
    matrix = OrderedDict()
    for area in AREA_ORDER:
        area_rows = [r for r in rows if r["area"] == area]
        counts = Counter(r["status"] for r in area_rows)
        matrix[area] = {
            "total": len(area_rows),
            **{s: counts.get(s, 0) for s in STATUS_ORDER},
        }

    # Part 4, grouped by area, and within an area worst divergence first.
    sections = []
    for area in AREA_ORDER:
        area_rows = sorted(
            (r for r in rows if r["area"] == area),
            key=lambda r: (STATUS_ORDER.index(r["status"]), r["id"]),
        )
        sections.append({"area": area, "rows": area_rows})

    # Part 5, the inverted view: one entry per reviewed document.
    doc_view = []
    for name, dates, _ in DOCUMENTS:
        hits = [r for r in rows if name in r["documents"]]
        counts = Counter(r["status"] for r in hits)
        doc_view.append({
            "name": name,
            "dates": dates,
            "total": len(hits),
            "counts": {s: counts.get(s, 0) for s in STATUS_ORDER},
            "conflicts": [r for r in hits if r["status"] == "Conflict"],
            "not_addressed": [r for r in hits if r["status"] == "Not Addressed"],
            "rows": sorted(hits, key=lambda r: r["id"]),
        })

    orphans = sorted(
        (r for r in rows if not r["documents"]),
        key=lambda r: (STATUS_ORDER.index(r["status"]), r["id"]),
    )

    return {
        "revision": REVISION,
        "total": len(rows),
        "by_status": {s: by_status.get(s, 0) for s in STATUS_ORDER},
        "by_priority": {p: by_priority.get(p, 0)
                        for p in ["Critical", "High", "Medium", "Low"]},
        "matrix": matrix,
        "conflicts": CONFLICTS,
        "sections": sections,
        "doc_view": doc_view,
        "orphans": orphans,
    }


def md(data):
    o = []
    w = o.append
    w("# PREA versus Policy: a standard-by-standard crosswalk")
    w("")
    w("Sacramento County Probation Department, Youth Detention Facility.")
    w("Gap register Revision %d. %d requirements assessed against 14 departmental "
      "policies." % (data["revision"], data["total"]))
    w("")
    w("**This is not legal advice.** It is a policy-to-standard comparison prepared "
      "for internal remediation planning. Statutory questions route to County "
      "Counsel.")
    w("")
    w("## 1. What this document does")
    w("")
    w("The gap register records, for each requirement, what the department has. This "
      "document sets the requirement and the departmental provision next to each "
      "other so the divergence is visible on its face, and then inverts the view so "
      "each of the 14 reviewed policies can be worked one at a time.")
    w("")
    w("Three divergence classes are used throughout.")
    w("")
    w("- **Conflict.** The policy states a rule, and the rule is wrong. This is the "
      "worst class, because staff following policy are out of compliance by doing "
      "what they were told. Twelve requirements sit here.")
    w("- **Not Addressed.** The documents reviewed contain no provision on the "
      "point. Seventeen requirements sit here.")
    w("- **Partial.** A provision exists and does part of the work. Thirty-nine "
      "requirements sit here, and this is where most of the remediation labor is.")
    w("")
    w("Findings state what the documents reviewed contain. Where a requirement is "
      "recorded as not addressed, that means no provision appeared in the 14 "
      "documents, not that the practice does not occur. Several findings will close "
      "on production of the documents listed as outstanding.")
    w("")
    w("## 2. Where policy and standard diverge")
    w("")
    w("| Status | Count |")
    w("|---|---|")
    for s in STATUS_ORDER:
        w("| %s | %d |" % (s, data["by_status"][s]))
    w("| **Total** | **%d** |" % data["total"])
    w("")
    w("| Priority | Count |")
    w("|---|---|")
    for p, n in data["by_priority"].items():
        w("| %s | %d |" % (p, n))
    w("")
    w("### Divergence by area")
    w("")
    w("| Area | Total | " + " | ".join(STATUS_ORDER) + " |")
    w("|---" * (len(STATUS_ORDER) + 2) + "|")
    for area, m in data["matrix"].items():
        w("| %s | %d | %s |" % (area, m["total"],
                                " | ".join(str(m[s]) for s in STATUS_ORDER)))
    w("")
    w("## 3. Class A divergence: policy states the wrong rule")
    w("")
    w("Twelve requirements where a departmental document affirmatively states a rule "
      "that contradicts federal or California law, or contradicts another "
      "departmental document. These are listed first because they are the only class "
      "where compliant staff behavior produces non-compliance.")
    w("")
    for c in data["conflicts"]:
        w("### Conflict %d. %s" % (c["n"], c["topic"]))
        w("")
        w("*Register row %s.*" % ", ".join(str(r) for r in c["rows"]))
        w("")
        w("**The law requires.** %s" % c["law"])
        w("")
        w("**The policy says.** %s" % c["policy"])
        w("")
        w("**Why it matters.** %s" % c["note"])
        w("")
        w("**Remediation.** %s" % c["fix"])
        w("")
    w("## 4. The crosswalk, requirement by requirement")
    w("")
    w("Grouped by the area an auditor scores. Within an area, worst divergence "
      "first.")
    w("")
    for sec in data["sections"]:
        w("### %s" % sec["area"])
        w("")
        for r in sec["rows"]:
            w("#### %d. %s" % (r["id"], r["authority"]))
            w("")
            w("| | |")
            w("|---|---|")
            w("| Status | %s |" % r["status"])
            w("| Priority | %s |" % r["priority"])
            w("| Departmental provision | %s |" % r["county_document"].replace("|", "/"))
            w("")
            w("**The standard requires.** %s" % r["requirement"])
            w("")
            w("**Divergence.** %s" % r["gap"])
            w("")
            if r["change_log"]:
                w("*Change log: %s*" % r["change_log"])
                w("")
    w("## 5. The same findings, policy by policy")
    w("")
    w("The crosswalk above is organized the way an auditor reads. This section is "
      "organized the way the work gets done: one document at a time. A requirement "
      "that cites more than one document appears under each.")
    w("")
    for d in data["doc_view"]:
        w("### %s" % d["name"])
        w("")
        w("*%s. Cited by %d requirements.*" % (d["dates"], d["total"]))
        w("")
        if d["total"] == 0:
            w("No requirement in the register turns on this document alone.")
            w("")
            continue
        w("| %s |" % " | ".join(STATUS_ORDER))
        w("|---" * len(STATUS_ORDER) + "|")
        w("| %s |" % " | ".join(str(d["counts"][s]) for s in STATUS_ORDER))
        w("")
        if d["conflicts"]:
            w("**Conflicts to correct:** %s" %
              ", ".join("row %d (%s)" % (r["id"], r["authority"]) for r in d["conflicts"]))
            w("")
        if d["not_addressed"]:
            w("**Silent on:** %s" %
              ", ".join("row %d (%s)" % (r["id"], r["authority"]) for r in d["not_addressed"]))
            w("")
        w("All rows: %s" % ", ".join(str(r["id"]) for r in d["rows"]))
        w("")
    if data["orphans"]:
        w("### No departmental document identified")
        w("")
        w("%d requirements that cite none of the 14 documents reviewed. Eleven "
          "record no departmental provision at all and cannot be remediated by "
          "amendment: they need drafting or an administrative decision. Two turn "
          "on documents that exist but were not produced (rows 14 and 45), and "
          "may close on production." % len(data["orphans"]))
        w("")
        for r in data["orphans"]:
            w("- **Row %d, %s** (%s, %s). %s" %
              (r["id"], r["authority"], r["status"], r["priority"],
               r["requirement"]))
        w("")
    w("## 6. How to use this against the register")
    w("")
    w("`prea-register.csv` remains the working record. This document is generated "
      "from it by `tools/build_crosswalk.py`, so it is a view, not a second source "
      "of truth. When a finding changes, edit the CSV, record the change in the "
      "`change_log` column, and regenerate. The `owner`, `target_date`, and "
      "`disposition` columns are intentionally empty and are what turn the register "
      "into the corrective action plan.")
    w("")
    return "\n".join(o) + "\n"


def main():
    rows = load()
    data = build(rows)
    os.makedirs(os.path.dirname(MD_PATH), exist_ok=True)
    with open(MD_PATH, "w", encoding="utf-8") as fh:
        fh.write(md(data))
    with open(JSON_PATH, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=1)
    fallback = [r["id"] for r in rows
                if r["authority"] == "Departmental policy structure"]
    if fallback:
        print("WARNING         %d row(s) have neither a 28 CFR nor a California "
              "citation and fall back to a generic heading: %s"
              % (len(fallback), ", ".join(str(i) for i in fallback)))
        print("                check the register before trusting those headings.")
    print("rows            %d" % data["total"])
    print("by status       %s" % data["by_status"])
    print("by priority     %s" % data["by_priority"])
    print("unmatched docs  %d" % len(data["orphans"]))
    print("wrote           %s" % os.path.relpath(MD_PATH, ROOT))
    print("wrote           %s" % os.path.relpath(JSON_PATH, ROOT))


if __name__ == "__main__":
    main()
