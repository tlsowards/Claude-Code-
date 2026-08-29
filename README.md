# Weekly Canvas discussion assistant

Each week, pull the discussion activity from a Canvas course, draft a substantive
reply and a probing follow-up question for every student post that hasn't been
answered, propose content to add to the thread, and render it all as one review
page. The instructor edits and posts.

**This tooling never writes to Canvas.** See [Why drafts, not autopost](#why-drafts-not-autopost).

## Browser workflow (no token, no admin)

Canvas's own frontend calls its API with your session cookie and a CSRF token, so
a script running in your browser can do the same. This needs no personal access
token, which matters because many institutions disable instructor tokens.

1. Open the discussion topic while logged in.
2. Open the console (F12) and paste `browser/fetch_thread.js`. It reads the
   thread and copies a bundle to your clipboard. Read-only.
3. Give the bundle to Claude. It drafts replies and returns a `post.js`.
4. Paste `post.js` into the console on the same page. It posts as you.

Chrome blocks console pasting until you type `allow pasting` once per session.
Re-running `post.js` is safe: it re-reads the thread first and skips any post you
have already replied to.

## Two other ways to run this

**Paste (no API access needed).** Copy the discussion thread out of Canvas into a
text file and run `from_paste`. Everything downstream — drafting, the review
page — is identical. Start here; many institutions disable instructor access
tokens, and this path never depends on one.

**API (automatic fetch).** If you can get a token, `fetch_week` pulls the threads
for you and tracks which posts you have already answered. Same output.

## Paste workflow

Copy the thread from your browser into a file shaped like this:

```
COURSE: ECON 103 - Microeconomics
TOPIC: Week 4: Is a monopoly ever good for consumers?
URL: https://your-school.instructure.com/courses/900/discussion_topics/11
ME: Your Name
PROMPT: Read Ch. 7, then argue a position with evidence.

--- Dana R.
Natural monopolies in utilities lower costs.

  --- Priya K.
  But evergreening extends them past the incentive window.
```

Each `---` line starts a post, and the rest of that line is the author. Indent
the marker two spaces per level of reply nesting. `ME:` is what keeps the tool
from drafting replies to your own posts, and marks threads you already answered
so they are left alone. `URL:` and `PROMPT:` are optional; both sharpen the drafts.

```bash
python3 -m canvas_weekly.from_paste --in week4.txt --school-name "CSU Chico"
```

Repeat the header block in the same file for more than one topic.

## API setup

### 1. Allow Canvas through the network policy

Claude Code's remote environment blocks outbound traffic by default. Right now a
connection to any `*.instructure.com` host returns `403` on CONNECT. Add your
school's Canvas host to the environment's allowed domains before anything here
will run. (Environment settings are documented at
https://code.claude.com/docs/en/claude-code-on-the-web.)

### 2. Get an API token

In Canvas: **Account → Settings → Approved Integrations → + New Access Token**.
Give it a purpose and an expiry date.

Some institutions disable instructor-generated tokens — if the button isn't
there, or creating one fails, that setting is on and it isn't something you can
work around from your own account. Either ask the campus Canvas admin whether a
token can be issued for this purpose, or just use the paste workflow above,
which needs nothing but your normal browser login.

Tokens carry your full instructor permissions. Keep them in the environment, not
in a file:

```
export CANVAS_TOKEN_CHICO="…"
```

### 3. Configure courses

```bash
cp config.example.json config.json
```

Fill in each school's `base_url` (the domain you log into Canvas at) and the
course IDs — the number in a course URL, `…/courses/123456`. `config.json` is
gitignored.

Verify the connection:

```bash
python3 -c "from canvas_weekly.canvas_client import CanvasClient; import json; \
  s=json.load(open('config.json'))['schools'][0]; \
  print(CanvasClient.from_school(s).whoami()['name'])"
```

## Running a week

```bash
python3 -m canvas_weekly.fetch_week --school chico --days 7
```

Writes `bundles/chico-<date>.json` — the week's topics, the full thread for
context, and the posts with no instructor reply.

`--days` is a hard window: a post that was never answered stops appearing once
it ages past it. If you skip a week, run that week with `--days 14` so nothing
falls through the gap.

Claude then drafts from that bundle (see `.claude/skills/canvas-weekly/SKILL.md`)
and renders the review page:

```bash
python3 -m canvas_weekly.render_review \
  --bundle bundles/chico-<date>.json \
  --drafts  drafts/chico-<date>.json \
  --out     reviews/chico-<date>.html
```

Each draft has a copy button and a link straight to the Canvas thread.

## Scheduling it

Once the prototype works end to end, set up a recurring Routine so the fetch and
drafting run before you sit down to it — e.g. Sunday evening, so drafts are
waiting Monday morning. Ask Claude to "set up the weekly Canvas run for <school>
on Sunday evenings" and it will create the trigger.

## Why drafts, not autopost

Canvas's API can post replies, and this tool deliberately doesn't.

Federal distance-education regulations require *regular and substantive
interaction* between students and the **instructor of record**, and that
requirement is tied to accreditation and Title IV eligibility. An agent posting
unreviewed under your name is squarely what those rules are about. Most
institutions also now have AI-disclosure policies for instructors, and student
discussion posts are education records under FERPA — which is why `bundles/`,
`drafts/`, and `reviews/` never leave the machine and never enter git.

Reviewing and posting yourself keeps the interaction yours, keeps you inside
those rules, and still removes most of the weekly labor. Worth confirming your
specific policy with each institution before the first run — the four campuses
will not have identical rules.

## Layout

```
canvas_weekly/canvas_client.py   read-only Canvas client (GET-only, paginated)
canvas_weekly/fetch_week.py      read a week of discussion activity → bundle
canvas_weekly/from_paste.py      pasted thread text → the same bundle, no API
canvas_weekly/render_review.py   bundle + drafts → review page
canvas_weekly/make_poster.py     bundle + drafts → browser script that posts
browser/fetch_thread.js          console snippet: read a thread, no token
.claude/skills/canvas-weekly/    how Claude runs the weekly pass
config.example.json              copy to config.json
```
