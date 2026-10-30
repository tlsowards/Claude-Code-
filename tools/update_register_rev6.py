#!/usr/bin/env python3
"""Apply Revision 6 to prea-register.csv.

Revision 6 is a second verification pass, against the Title 15 edition effective
01/01/2019, plus three citation corrections. No status or priority changes.

Source of truth for this pass:
  Title 15, Minimum Standards for Juvenile Facilities, BSCC
  Effective 01/01/2019, the post-rewrite edition, read in full in the session
  that received it.

What this pass does.

  1. Corrects three citations that Revision 5 recorded from the 04/01/2014
     edition and that the 2019 rewrite renumbered:
       15 CCR 1324(h)      ->  1324(k)   non-discrimination and restrictive housing
       15 CCR 1391(e)      ->  1391(f)   due process for major rule violations
       34 U.S.C. 30307(e)(2) -> 30307(c)(2)  the five percent grant provision
     The third is a CLAUDE.md correction only; it does not appear in the register.

  2. Confirms the eight citations Revision 5 had to carry forward unconfirmed,
     because the sections did not exist in the 2014 edition: 1350.5, 1352.5,
     1354.5, 1324(n), 1352(f), 1360(g), 1361(h), and the 1353(c) pinpoint.
     All eight exist in the 2019 edition and their text is quoted into the rows.

  3. Adds three state-law hooks the 2019 text supports and the register did not
     have: 1352(f) on the S-8 conflict, 1324(n) on retaliation, and 1361(h) on
     third-party and staff reporting.

  4. Enumerates the eleven 115.313(a) staffing plan factors into row 5, which
     previously described them without listing them.

  5. Records that neither Title 15 edition contains any PREA reference or any
     facility audit requirement, and adds the PREA section 8(c)(4) survey
     cooperation hook, which unlike the compliance certification expressly
     reaches units of local government.

A caution for whoever runs the next pass. The source PDFs live in docs/, which
is gitignored and does not survive a new container. The 2019 edition was read
directly in the session that received it, and the quotations below were taken
from that reading. They are captured into the register here precisely so the
finding outlives the file. If you need to re-verify, the PDF has to be uploaded
again.

Not re-checked against the 2019 edition, and therefore still carrying their
Revision 5 provenance against the 04/01/2014 text: 1301, 1321(a) and (h),
1354, 1390, 1452, and 1453. Those sections exist in both editions and were not
part of this pass.

The script asserts the pre-state (status, priority) of every row it touches, so
a second run fails loudly rather than double-applying.
"""

import csv
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = os.path.join(ROOT, 'prea-register.csv')

ED = 'Title 15 effective 01/01/2019, the post-rewrite edition'
MARK = 'VERIFIED in Revision 6'

# (status, priority) every touched row must currently have.
PRE = {
    '1': ('Partial', 'High'), '5': ('Not Addressed', 'Critical'),
    '9': ('Partial', 'Medium'), '10': ('Not Addressed', 'High'),
    '11': ('Addressed', 'Low'), '25': ('Addressed', 'Low'),
    '31': ('Partial', 'High'), '33': ('Addressed', 'Low'),
    '35': ('Partial', 'High'), '36': ('Conflict', 'Critical'),
    '37': ('Conflict', 'High'), '38': ('Partial', 'Medium'),
    '39': ('Partial', 'High'), '41': ('Partial', 'High'),
    '42': ('Partial', 'High'), '46': ('Not Addressed', 'High'),
    '56': ('Partial', 'Critical'), '57': ('Partial', 'High'),
    '64': ('Conflict', 'Critical'), '72': ('Addressed', 'Medium'),
    '73': ('Not Addressed', 'Critical'), '74': ('Conflict', 'Critical'),
    '75': ('Addressed', 'Low'), '80': ('Conflict', 'High'),
}

# The six NOT VERIFIED blocks Revision 5 wrote, and what replaces each.
NV = "NOT VERIFIED in Revision 5. The only Title 15 edition produced is rev. 04/01/2014, which predates the January 2019 rewrite; %s. The citation is to the post-2019 text and is carried forward unconfirmed. Obtain the current BSCC edition before quoting it."

OLD_1324N = NV % "section 1324 in that edition runs (a) through (j), so there is no subsection (n)"
OLD_1360G = NV % "section 1360 in that edition runs (a) through (f), and (f) is 'searches of transgender youth,' so there is no subsection (g)"
OLD_1352_5 = NV % "that edition contains no section 1352.5"
OLD_1350_5 = NV % "that edition contains no section 1350.5"
OLD_1354_5 = NV % "that edition contains no section 1354.5"
OLD_1361H = NV % "section 1361 in that edition runs (a) through (f), so there is no subsection (h)"


def ok(detail):
    return "%s against %s: %s" % (MARK, ED, detail)


NEW_1324N = ok(
    "1324(n) exists and reads 'establishment of a policy that prohibits all forms of "
    "sexual abuse, sexual assault and sexual harassment. The policy shall include an "
    "approach to preventing, detecting and responding to such conduct and any retaliation "
    "for reporting such conduct, as well as a provision for reporting such conduct by "
    "youth, staff or a third party.' Note what the text does not do: it does not name a "
    "victim, so unlike the federal definitions it is not written as resident-protective "
    "on its face. Whether BSCC reads it to reach conduct directed at staff is untested "
    "and is not asserted here.")

NEW_1360G = ok(
    "1360(g) exists and reads 'Cross-gender pat-down searches and strip searches are "
    "prohibited except in exigent circumstances or when conducted by a medical "
    "professional. Such searches must be justified and documented in writing.' The "
    "citation is sound as used in this row.")

NEW_1352_5 = ok(
    "1352.5 exists, titled Transgender and Intersex Youth, running (a) to (e). Most "
    "relevant to this register: (c) requires staff to 'house youth in the unit or room "
    "that best meets their individual needs,' provides that staff 'may not automatically "
    "house youth according to their external anatomy,' requires documented reasons for "
    "any placement not matching gender identity, and requires consideration of the youth's "
    "preferences and of provider recommendations. That is an expressly individualized "
    "standard, which is what makes a categorical single-room rule a conflict with it.")

NEW_1350_5 = ok(
    "1350.5 exists, titled Screening for the Risk of Sexual Abuse, requiring assessment "
    "of each youth within 72 hours of admission against eleven listed factors at (a) to "
    "(k). Two are worth noting for this register: (a) is 'Prior sexual victimization or "
    "abusiveness,' and (b) is gender nonconforming appearance or LGBTQI identification "
    "'and whether the youth may, therefore, be vulnerable to sexual abuse.' The state "
    "text treats LGBTQI status as a vulnerability factor, never as an abusiveness "
    "indicator. It also requires controls on dissemination so the information is not "
    "'exploited to the youth's detriment by staff or other youth.'")

NEW_1354_5 = ok(
    "1354.5 exists, titled Room Confinement, and tracks WIC 208.3: (a)(1) room "
    "confinement only after less restrictive options are attempted and exhausted, (a)(2) "
    "never for punishment, coercion, convenience, or retaliation by staff, (a)(3) never "
    "to the extent it compromises the youth's mental and physical health, (b) a four-hour "
    "ceiling before staff must return the youth to general population, consult mental "
    "health or medical staff, or build an individualized reintegration plan, and "
    "(b)(4)(C) documented authorization by the facility superintendent or designee every "
    "four hours thereafter. OO 1354.5 tracks the regulation closely.")

NEW_1361H = ok(
    "1361(h) exists and reads 'the policy shall provide multiple internal and external "
    "methods to report sexual abuse and sexual harassment. Whether or not associated with "
    "a grievance, concerns of parents, guardians, staff or other parties shall be "
    "addressed and documented in accordance with written policies and procedures within a "
    "specified timeframe.' That supplies a state hook for three things this register "
    "previously scored as federal-only: external reporting methods, third-party concerns "
    "including parents and guardians, and staff reporting.")

# Row-by-row edits. Each entry is (row id, list of (old, new) replacements,
# change_log note). An old string that is not found aborts the run.
CHANGES = {
    '1':  ([(OLD_1324N, NEW_1324N)],
           'REVISED in 6: 1324(n) confirmed against the 2019 edition and quoted.'),
    '46': ([(OLD_1324N, NEW_1324N)],
           'REVISED in 6: 1324(n) confirmed against the 2019 edition and quoted.'),
    '9':  ([(OLD_1360G, NEW_1360G)],
           'REVISED in 6: 1360(g) confirmed against the 2019 edition and quoted.'),
    '10': ([(OLD_1352_5, NEW_1352_5)],
           'REVISED in 6: 1352.5 confirmed against the 2019 edition and quoted.'),
    '11': ([(OLD_1352_5, NEW_1352_5)],
           'REVISED in 6: 1352.5 confirmed against the 2019 edition and quoted.'),
    '37': ([(OLD_1352_5, NEW_1352_5)],
           'REVISED in 6: 1352.5 confirmed and quoted. 1352.5(c) is the individualized '
           'standard the III.I categorical rule conflicts with.'),
    '75': ([(OLD_1352_5, NEW_1352_5)],
           'REVISED in 6: 1352.5 confirmed against the 2019 edition and quoted.'),
    '31': ([(OLD_1350_5, NEW_1350_5)],
           'REVISED in 6: 1350.5 confirmed against the 2019 edition and quoted.'),
    '33': ([(OLD_1350_5, NEW_1350_5)],
           'REVISED in 6: 1350.5 confirmed against the 2019 edition and quoted.'),
    '35': ([(OLD_1354_5, NEW_1354_5)],
           'REVISED in 6: 1354.5 confirmed against the 2019 edition and quoted.'),
    '57': ([(OLD_1354_5, NEW_1354_5)],
           'REVISED in 6: 1354.5 confirmed against the 2019 edition and quoted.'),
    '38': ([(OLD_1361H, NEW_1361H)],
           'REVISED in 6: 1361(h) confirmed against the 2019 edition and quoted.'),
    '39': ([(OLD_1361H, NEW_1361H)],
           'REVISED in 6: 1361(h) confirmed against the 2019 edition and quoted.'),
}

# Longer, row-specific rewrites handled separately.
APPEND = {
    '25': (
        " RESOLVED in Revision 6. The lettering did change in the January 2019 rewrite. "
        "In the edition effective 01/01/2019, 1353(c) reads 'age appropriate information "
        "that explains the facility's policy prohibiting sexual abuse and sexual "
        "harassment and how to report incidents or suspicions of sexual abuse or sexual "
        "harassment,' which is exactly the content this row scores. The citation is "
        "correct for the current text and was correct all along; it was the 2014 edition "
        "that did not match.",
        'RESOLVED in 6: the 1353(c) flag is cleared. The 2019 rewrite moved it; the '
        'citation is correct for current text.'),
    '80': (
        " " + ok(
            "1350.5(a) lists 'Prior sexual victimization or abusiveness' as a single "
            "screening factor and 1350.5(b) treats LGBTQI identification as bearing on "
            "whether a youth 'may, therefore, be vulnerable to sexual abuse.' The state "
            "text therefore uses victimization to assess vulnerability, never "
            "abusiveness, which is the same separation 115.341(c) draws. A further and "
            "independent hook now confirmed: 1352(f) provides that 'facility staff shall "
            "not consider lesbian, gay, bisexual, transgender, questioning or intersex "
            "identification or status as an indicator of likelihood of being sexually "
            "abusive.' That provision does not reach the II.F.2 molest-victim note "
            "directly, because that note turns on victimization history rather than "
            "LGBTQI status, but it establishes that California has legislated against "
            "precisely this species of inference inside the classification section."),
        'REVISED in 6: 1350.5 confirmed and quoted. 1352(f) added as adjacent state '
        'authority against status-based abusiveness inference.',
        [(OLD_1350_5, NEW_1350_5)]),
    '56': (
        " " + ok(
            "1324(n) requires the policy and procedure manual to establish a policy "
            "prohibiting all forms of sexual abuse, sexual assault and sexual harassment, "
            "including 'an approach to preventing, detecting and responding to such "
            "conduct and any retaliation for reporting such conduct.' Retaliation is "
            "named in the state requirement, so the absence of a retaliation response in "
            "the manual is a Title 15 defect and not only a PREA gap. That makes this row "
            "actionable on BSCC inspection independent of PREA. 1361(h) adds that "
            "concerns of 'parents, guardians, staff or other parties' shall be addressed "
            "and documented within a specified timeframe."),
        'REVISED in 6: 1324(n) added as a confirmed state hook. Retaliation is named in '
        'the required contents of the manual, so this is now a Title 15 defect too.'),
    '41': (
        " " + ok(
            "1361(h) requires the policy to 'provide multiple internal and external "
            "methods to report sexual abuse and sexual harassment' and requires that "
            "concerns of 'parents, guardians, staff or other parties' be addressed and "
            "documented within a specified timeframe. Staff are named in the state text, "
            "so a staff reporting route is a Title 15 requirement and not only a PREA "
            "one. 1324(n) independently requires a provision for reporting 'by youth, "
            "staff or a third party.'"),
        'REVISED in 6: 1361(h) and 1324(n) added as confirmed state hooks. Staff '
        'reporting is named in both, so this is a Title 15 defect too.'),
    '42': (
        " " + ok(
            "1361(h) supplies state authority for two of the five open gaps in this row. "
            "It requires 'multiple internal and external methods to report sexual abuse "
            "and sexual harassment,' which reaches the external reporting gap, and it "
            "requires that concerns of 'parents, guardians, staff or other parties' be "
            "addressed and documented within a specified timeframe 'whether or not "
            "associated with a grievance,' which reaches the third-party filing gap. It "
            "does not supply the emergency grievance track, the outer bound on the "
            "extension, or the bad-faith-only discipline rule; those remain federal-only."),
        'REVISED in 6: 1361(h) added as a confirmed state hook reaching the external '
        'reporting and third-party filing gaps.'),
    '73': (
        " " + ok(
            "Neither Title 15 edition contains any PREA reference or any facility audit "
            "requirement. Searched in full: the strings PREA, Prison Rape, 28 CFR, and "
            "Part 115 return zero hits in the 2019 edition, and the only matches for "
            "'audit' are section 1403, Health Care Monitoring and Audits, which concerns "
            "health services statistics. This confirms rather than softens the finding. "
            "The department's stated reliance on Title 15 inspection in place of a PREA "
            "audit leaves the audit standard wholly unaddressed by any state requirement, "
            "because the state has not adopted one. A second point, from the statute "
            "rather than the regulation: PREA section 8(c)(4), 34 U.S.C. 30307(c)(4), "
            "conditions grant funds on the chief executive certifying that neither the "
            "State 'nor any political subdivision or unit of local government within the "
            "State' appears in the Attorney General's report of facilities that did not "
            "cooperate with the survey under section 4(c)(2)(C). Unlike the compliance "
            "certification, which the Attorney General's overview says does not encompass "
            "county facilities, that provision names units of local government expressly. "
            "It turns on survey cooperation rather than standards compliance and bites "
            "only if the facility is drawn into the representative sample, but it is a "
            "federal lever that does reach a county facility."),
        'REVISED in 6: confirmed that neither Title 15 edition contains a PREA or audit '
        'requirement. Added the section 8(c)(4) survey cooperation hook, which expressly '
        'reaches units of local government.'),
    '72': (
        " " + ok(
            "Related, from the statute rather than Title 15: PREA section 4(c)(2)(C) "
            "directs the Attorney General to publish 'a listing of any prisons in the "
            "representative sample that did not cooperate with the survey,' and section "
            "8(c)(4) attaches a funding consequence to a State whose political "
            "subdivisions appear on it. Survey cooperation is therefore a distinct "
            "obligation from standards compliance, and it reaches local facilities "
            "expressly. Whether YDF has ever been in the sample is unknown and is worth "
            "asking, because row 81's disposition taxonomy problem means the department "
            "could not currently populate the data set if it were."),
        'REVISED in 6: added the PREA section 4(c)(2)(C) and 8(c)(4) survey cooperation '
        'interaction.'),
}


def main():
    with open(REG, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        fields = reader.fieldnames
        rows = list(reader)

    by_id = {r['id']: r for r in rows}

    if any(MARK in r['gap'] for r in rows):
        print('ABORTED. Revision 6 has already been applied to this register.')
        return 1

    errs = []
    for rid, (st, pr) in PRE.items():
        r = by_id.get(rid)
        if r is None:
            errs.append('row %s: not present' % rid)
        elif (r['status'], r['priority']) != (st, pr):
            errs.append('row %s: expected (%s, %s) but found (%s, %s)'
                        % (rid, st, pr, r['status'], r['priority']))
    if errs:
        print('ABORTED, nothing written:')
        for e in errs:
            print('  ' + e)
        return 1

    applied = []

    for rid, (subs, note) in CHANGES.items():
        r = by_id[rid]
        for old, new in subs:
            if old not in r['gap']:
                print('ABORTED, nothing written: row %s is missing its expected '
                      'Revision 5 text.' % rid)
                return 1
            r['gap'] = r['gap'].replace(old, new)
        r['change_log'] = (r['change_log'] + ' ' + note).strip()
        applied.append(rid)

    for rid, entry in APPEND.items():
        extra, note = entry[0], entry[1]
        subs = entry[2] if len(entry) > 2 else []
        r = by_id[rid]
        for old_s, new_s in subs:
            if old_s not in r['gap']:
                print('ABORTED, nothing written: row %s is missing its expected '
                      'Revision 5 text.' % rid)
                return 1
            r['gap'] = r['gap'].replace(old_s, new_s)
        r['gap'] = r['gap'].rstrip() + extra
        r['change_log'] = (r['change_log'] + ' ' + note).strip()
        applied.append(rid)

    # ---------------------------------------------------------------- row 36
    # The S-8 conflict. Two citation corrections and one new hook.
    r = by_id['36']
    before = r['gap']
    r['gap'] = r['gap'].replace('1324(h)', '1324(k)')
    r['gap'] = r['gap'].replace(
        "Note that the produced edition ends 1352 at (e); the '(f)' in this row's "
        "citation reflects the post-2019 text and is not confirmed.",
        ok("1352(f) exists and is a third and independent hook on S-8: 'facility staff "
           "shall not consider lesbian, gay, bisexual, transgender, questioning or "
           "intersex identification or status as an indicator of likelihood of being "
           "sexually abusive.' If the S-series is a sexual-risk taxonomy, which the S-4 "
           "High and S-4 Low criteria indicate, then placing LGBTQI youth into that "
           "series at all is what 1352(f) forbids, independent of the housing "
           "consequence. Confirming that requires OO 1352, which has never been produced, "
           "so it is recorded as a hook to test rather than as a scored finding.")
        + " CITATION CORRECTED in Revision 6, and this one was load-bearing. Revision 5 "
          "recorded the non-discrimination hook as 1324(h) from the 04/01/2014 edition. "
          "In the edition effective 01/01/2019, 1324(h) is 'trauma-informed approaches' "
          "and the non-discrimination provision is 1324(k). The 2019 text is also broader "
          "than the 2014 text, adding immigration status to the listed bases. Anything "
          "citing 1324(h) for this proposition, including redline change 1 as originally "
          "drafted, is wrong for the current edition.")
    if r['gap'] == before:
        print('ABORTED, nothing written: row 36 replacements did not apply.')
        return 1
    r['change_log'] = (r['change_log'] + ' CORRECTED in 6: 1324(h) is 1324(k) in the '
                       '2019 edition. 1352(f) confirmed and added as a third hook.').strip()
    applied.append('36')

    # ---------------------------------------------------------------- row 64
    r = by_id['64']
    if '1391(e)' not in r['gap']:
        print('ABORTED, nothing written: row 64 is missing its 1391(e) citations.')
        return 1
    r['gap'] = r['gap'].replace('1391(e)', '1391(f)')
    r['gap'] = r['gap'].rstrip() + (
        " CITATION CORRECTED in Revision 6. Revision 5 recorded this provision as 1391(e) "
        "from the 04/01/2014 edition. In the edition effective 01/01/2019, 1391(e) is "
        "minor rule violations handled informally and the due process elements for major "
        "rule violations moved to 1391(f). The finding is unchanged; the subsection letter "
        "is not. " + ok(
            "1391(f) requires, for major rule violations, (1) written notice of violation "
            "prior to a hearing, (2) accommodations for youth with disabilities, limited "
            "literacy, and English language learners, (3) hearing by a person who is not a "
            "party to the incident, (4) opportunity for the youth to be heard and to "
            "present evidence and testimony, and (5) provision for the youth to be "
            "assisted by staff in the hearing."))
    r['change_log'] = (r['change_log'] + ' CORRECTED in 6: 1391(e) is 1391(f) in the '
                       '2019 edition. Elements quoted.').strip()
    applied.append('64')

    # ---------------------------------------------------------------- row 74
    r = by_id['74']
    old74 = ("Note that this edition runs 1324(a) to (j); the (a)-(n) range in this row's "
             "citation reflects the post-2019 text and is not confirmed.")
    if old74 not in r['gap']:
        print('ABORTED, nothing written: row 74 is missing its Revision 5 note.')
        return 1
    r['gap'] = r['gap'].replace(old74, ok(
        "the edition effective 01/01/2019 runs 1324(a) to (n), so the range in this row's "
        "citation is correct for current text. The biennial administrative review "
        "requirement is unchanged between the two editions. Two subsections in the 2019 "
        "text bear directly on this register and did not exist in 2014: (k), the "
        "non-discrimination provision covering restrictive housing and classification, "
        "and (n), which requires the manual to carry a policy prohibiting all forms of "
        "sexual abuse, sexual assault and sexual harassment together with an approach to "
        "prevention, detection, response, and retaliation. A manual that omits (n) fails "
        "the required contents of 1324 on its face, independent of any PREA standard."))
    r['change_log'] = (r['change_log'] + ' REVISED in 6: 1324 confirmed to run (a) to (n) '
                       'in the 2019 edition; (k) and (n) identified.').strip()
    applied.append('74')

    # ----------------------------------------------------------------- row 5
    r = by_id['5']
    r['gap'] = r['gap'].rstrip() + (
        " The eleven factors are enumerated here so the staffing plan can be drafted from "
        "this row rather than from the standard. 28 CFR 115.313(a) requires the agency to "
        "take into consideration: (1) generally accepted juvenile detention, correctional, "
        "or secure residential practices; (2) any judicial findings of inadequacy; (3) any "
        "findings of inadequacy from Federal investigative agencies; (4) any findings of "
        "inadequacy from internal or external oversight bodies; (5) all components of the "
        "facility's physical plant, including blind spots or areas where staff or residents "
        "may be isolated; (6) the composition of the resident population; (7) the number "
        "and placement of supervisory staff; (8) institution programs occurring on a "
        "particular shift; (9) any applicable State or local laws, regulations, or "
        "standards; (10) the prevalence of substantiated and unsubstantiated incidents of "
        "sexual abuse; and (11) any other relevant factors. Three are harder for this "
        "department than they look. Factor 10 cannot currently be computed at all, because "
        "the Internal Affairs six-category disposition taxonomy does not map to the three "
        "PREA findings; see row 81. Factor 4 now takes in this register itself, which is a "
        "finding of inadequacy from an internal review. Factor 5 has no supporting "
        "document, because the Institutional Policy on Video Recording and Photograph "
        "System has never been produced. CORROBORATION NOTE: the eleven factors are "
        "corroborated from search, including exact-phrase matches against the Cornell, "
        "eCFR, and PREA Resource Center listings, and have not been read from the Code of "
        "Federal Regulations itself, because network access to those sources is blocked "
        "from the drafting environment. Confirm the wording against 28 CFR 115.313(a) "
        "before it is adopted into a staffing plan.")
    r['change_log'] = (r['change_log'] + ' REVISED in 6: the eleven 115.313(a) factors '
                       'enumerated, with the factor 10, 4, and 5 problems named.').strip()
    applied.append('5')

    missing = set(PRE) - set(applied)
    if missing:
        print('ABORTED, nothing written: rows asserted but never edited: %s'
              % ', '.join(sorted(missing, key=int)))
        return 1

    with open(REG, 'w', newline='', encoding='utf-8') as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print('Revision 6 applied to %d rows: %s'
          % (len(set(applied)), ', '.join(sorted(set(applied), key=int))))
    from collections import Counter
    print('status  ', dict(Counter(r['status'] for r in rows)))
    print('priority', dict(Counter(r['priority'] for r in rows)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
