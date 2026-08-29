# Weekly Canvas discussion assistant

Each week, pull the discussion activity from a Canvas course, draft a substantive
reply and a probing follow-up question for every student post that hasn't been
answered, propose content to add to the thread, and render it all as one review
page. The instructor edits and posts.

**This tooling never writes to Canvas.** See [Why drafts, not autopost](#why-drafts-not-autopost).

## Setup

### 1. Allow Canvas through the network policy

Claude Code's remote environment blocks outbound traffic by default. Right now a
connection to any `*.instructure.com` host returns `403` on CONNECT. Add your
school's Canvas host to the environment's allowed domains before anything here
will run. (Environment settings are documented at
https://code.claude.com/docs/en/claude-code-on-the-web.)

### 2. Get an API token

In Canvas: **Account → Settings → Approved Integrations → + New Access Token**.
Give it a purpose and an expiry date.

Some institutions disable instructor-generated tokens. If the button isn't there,
that's the answer — ask the campus Canvas admin whether a token can be issued
for this purpose, and tell them what it's for.

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
canvas_weekly/canvas_client.py   Canvas REST client (stdlib only, paginated)
canvas_weekly/fetch_week.py      read a week of discussion activity → bundle
canvas_weekly/render_review.py   bundle + drafts → review page
.claude/skills/canvas-weekly/    how Claude runs the weekly pass
config.example.json              copy to config.json
```
