# Section 01: STC Portal Submission (Course Certification)

| | |
|---|---|
| **Source handoff** | `Dropbox/Sowards Training Courses/STC_Portal_Submission_HANDOFF.md` |
| **Handoff written** | 2026-08-19 |
| **Owner** | Dr. Tim Sowards, Timothy Sowards Consulting |
| **System of record** | California BSCC STC Learning Gateway (`stc.yourlearningportal.com`) |
| **Status** | Active. One course ready to submit pending Tim's approval. |

## Objective

For each course build that Tim approves, create and submit its Request for Certification
(RFC, type "RFC Annual") in the STC Learning Gateway under the provider
**Timothy Sowards Consulting**, then verify it lands as "Submitted Pending Approval"
and report the certification number back.

## Hard prerequisite

RFC submission runs inside Tim's authenticated portal session. A cloud sandbox with no
browser link cannot reach the portal. You need the Claude in Chrome connection pointed at
Tim's Chrome where he is already logged into the Gateway.

Before anything else: connect to the browser, open the Course Certifications list, and
confirm it loads. A login screen means stop and ask Tim to log in. Never enter his password.

## Guardrails

See `../../CONVENTIONS.md`. Section-specific:

- This edits Tim's official BSCC record. Submit only courses he has **explicitly approved**,
  one at a time.
- Show Tim the fully filled form and get his OK **before** clicking the final Submit.
- Create new RFCs only. Do not delete, overwrite, or edit any existing certification,
  including the Sacramento Public Safety Training Center certs and the in-flight
  defensive tactics items already in the portal.
- Courses already Approved (ADA, Leadership and Professionalism, Cultural Diversity, PREA)
  are done. Do not resubmit them.
- If a field value is missing from the course's RFC text document, stop and ask.
  Do not invent it.

## Where the field values come from

Each built course has a `... - RFC Submission Text.docx` in its Dropbox course folder,
laid out to match the portal form:

| Document block | Portal field |
|---|---|
| Course Information block | Course Title, Certification Type, Provider, Delivery Method, Course Hours, Est. Class Size, Primary Population |
| Course Summary paragraph | Course Summary |
| Performance Objectives and Hour Block table | Performance Objectives (numbered PO list, each stating the hour block it is met in) |
| Testing Procedures line | Testing |
| Course Outline table | Course Outline grid rows: Day / Begin / End / Subject Matter / Instructional Methodology / Instructor |

Delivery Method is ILT (Instructor Led Training). Agency Specific is No.

## Submission loop, per approved course

1. Confirm Tim approved this specific course.
2. Open the course's RFC Submission Text document in Dropbox, or get the text from Tim.
3. Start a new RFC: Manage Certifications, New, set Organization to Timothy Sowards
   Consulting and Certification Type to RFC Annual, then continue the importing process.
4. Fill every field from the document using the map above.
5. Add the Course Outline rows, one per outline line.
6. Add the instructor (his profile is already in the system).
7. Set the Assurance Statement: STC policies followed, lesson plan on file,
   Assured by Provider = Yes.
8. Attachments only if Tim asks. The 4-column lesson plan is normally kept on file,
   not uploaded.
9. Fill Description of Latest Changes, Save.
10. **Show Tim the filled form. On his OK, Submit.**
11. Verify the course shows "Submitted Pending Approval" in the pending filter, then
    report the certification number.

## Course queue

Portal status below is a 2026-08-19 snapshot. Re-check live before acting.

- [ ] **Chemical Agents (8hr)** - RFC text and POST expanded outline both built, not in
      portal. This is the ready-to-submit item. Blocked only on Tim's approval.
- [ ] **Custody Fundamentals for Juvenile Institutions (8hr General)** - lesson plan and
      online build exist, no RFC text yet. Blocked: Tim to decide format and confirm the
      RFC field values.
- [ ] **Report Writing 9-I / 9-F** - methodology build in progress. Not at RFC stage.
- [x] ADA Contact and Control (4hr and 8hr) - Approved, both.
- [x] Leadership and Professionalism - Approved, listed under its portal title.
- [x] Cultural Diversity - Approved, listed under its portal title.

## Reviewer context

A BSCC STC Field Representative reviews these. The recurring correction is
"add specificity to guide the instructor," which the built lesson plans already address,
so the on-file lesson plan should hold up.

## Definition of done, per course

The RFC appears in the portal as Submitted Pending Approval, Tim approved the filled form
before submission, and the certification number has been reported back to him.
