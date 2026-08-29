---
name: canvas-weekly
description: Run the weekly Canvas discussion pass for a course - pull the week's student posts, draft a substantive reply and a probing follow-up question for each, propose content to add to the thread, and render a review page for the instructor to edit and post. Use when asked to do the weekly Canvas run, draft discussion replies, or prepare the week's discussion responses. Never posts to Canvas.
---

# Weekly Canvas discussion pass

Produce drafts for the instructor to review, edit, and post themselves. **You
never post to Canvas.** The instructor is the author of record; federal
distance-education rules on regular and substantive interaction depend on that
being true.

## Steps

1. **Get a bundle.** Either path produces the same thing:

   - *Pasted thread* (no API access): `python3 -m canvas_weekly.from_paste --in <file> --school-name "<school>"`
   - *API*: `python3 -m canvas_weekly.fetch_week --school <id> --days 7`

   If the API path reports an unreachable host, the environment network policy is
   still blocking `*.instructure.com` — say so and offer the paste path rather
   than working around it. If the instructor pastes a thread straight into chat,
   write it to a file in the paste format and run `from_paste` on it.

2. **Read the bundle.** Each topic carries `topic_prompt` (what the instructor
   asked), `thread` (the full conversation for context), and `needs_reply` (the
   posts with no instructor response in the window). Draft only for `needs_reply`.

3. **Draft.** Write `drafts/<school>-<date>.json`:

   ```json
   {
     "school_id": "chico",
     "replies": [
       { "topic_id": 1, "entry_id": 9, "author": "Student Name",
         "draft": "reply text",
         "probing_question": "one open question that pushes their thinking",
         "note": "optional flag for the instructor" }
     ],
     "topic_additions": [
       { "topic_id": 1, "content": "a short substantive addition to the thread",
         "probing_questions": ["question for the whole class"] }
     ]
   }
   ```

4. **Render.** `python3 -m canvas_weekly.render_review --bundle <b> --drafts <d> --out reviews/<school>-<date>.html`
   Publish it as an Artifact and give the instructor the link.

## What a good draft looks like

- **Engage the specific claim.** Name what the student actually argued and
  respond to that. A reply that would fit any post is worthless.
- **Add something they don't have** — a concept name, a counter-case, a piece
  of evidence, a distinction they blurred. Two to four sentences of substance.
- **Ask one open question**, not a quiz question. It should have no answer you
  already hold, and it should be answerable from where the student currently
  stands. "What would change your mind?" beats "What are the three stages?"
- **Match the register of the course.** Read `topic_prompt` and the surrounding
  thread for how formal this instructor is, and write in that voice.
- **Never assess or grade.** No "great job," no scores, no praise inflation.
- **Flag rather than fix.** If a post shows real misunderstanding, possible
  academic-integrity trouble, or personal distress, put it in `note` for the
  instructor instead of handling it in the draft.

## Never

- Post, reply, or write to Canvas through any endpoint.
- Copy student names or post text into commits, PRs, or anything leaving this
  machine. `bundles/`, `drafts/`, and `reviews/` are gitignored — keep it that way.
- Invent course facts (due dates, policies, readings) not present in the bundle.
