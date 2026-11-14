# Content workflow

Every piece of content is a JSON file under `content/`. Nothing is hard-coded in the pages. Until the app is connected to the WordPress site, publishing means editing a file, committing, and redeploying.

## Publish a weekly brief

1. Copy the most recent file in `content/briefs/` and rename it to the new week, for example `2026-w45.json`.
2. Set `id`, `title`, `date`, `coverageStart`, `coverageEnd`, and `summary`.
3. Fill `coverage` with the research notes for the week: what was checked, what could not be confirmed, and which decisions are unpublished.
4. Add cases to the four sections (Ninth Circuit, Supreme Court, Other federal circuits, California). Each case has:
   - `facts`, `holding`, optional `dissent` and `notDecided`
   - `inPractice`: what it means on the floor or on the street
   - `trainIt`: how it should be trained
   - `caution`: any verification limit the reader needs to see
   - `status`: `published`, `unpublished`, `order`, `cert-denied`, or `summary-order`
   - `courtKey`: used to build the "read the opinion" link
   - `settings`: which audiences it applies to (`field`, `custody`, `juvenile`, `supervisors`, `all`)
5. Write the `applications` list: the points to take into a briefing room this week.
6. Set `episodeIds` to the matching podcast episode ids.
7. Add three `quiz` questions: `q`, four `options`, the `answer` index, and a `teach` sentence shown after the reader answers.
8. Run `npm run build`. The build fails if the JSON is malformed. Each case also gets its own page at `/briefs/<brief id>/<case id>` and an entry in the sitemap.

### Voice

Briefs are written for the general training population, not to any one person. Neutral third person, no first-person narration. Every case ends with practice and training points. Do not invent citations, docket numbers, or links. If the opinion was not read, say so in `caution`.

## Record a podcast episode

Episodes are read in Dr. Sowards' own voice. The standard is the ElevenLabs professional clone named "Tim" with the Eleven v4 model. OpenAI's Onyx voice is the fallback only.

1. Write the narration script: `node scripts/build-narration.mjs <brief id>` writes `content/narration/<brief id>.txt` from the brief JSON. Read it through; it is what will be spoken.
2. Render it: `ELEVENLABS_API_KEY=... node scripts/make-audio-elevenlabs.mjs <brief id> --voice <voice id of "Tim"> --out audio-out`. The key is never committed; in a Claude cloud session it is proxy-injected and the variable holds a placeholder. The output is `audio-out/<date>-use-of-force-case-law-update-tim.mp3`.
3. Spoken spellings live in `content/pronunciations.json`. "Sowards" is rendered as "Souwards" so the voice engines say it correctly; the written briefs keep the real spelling. Add a line there for any other name the engine mispronounces.
4. Listen to the opening, one case, and the close before publishing.

## Publish a podcast episode

One command does the whole thing when the site episode already exists: `scripts/publish-episode.sh <brief id> <site episode id>` builds the narration, renders it in Dr. Sowards' voice, uploads the MP3 to the site's media library, points the site's episode at it with episode notes, and adds the entry to `content/episodes.json`. Then run `npm run build` and commit. The manual steps are:

1. Upload the MP3 to the WordPress media library on sowardsconsulting.com (Media, Add New) and copy its file URL.
2. Add an entry to `content/episodes.json` with `id`, `title`, `date`, `description`, `audioUrl` (the media library URL), `bytes` (file size in bytes), `durationSeconds`, and `briefId`.
3. Run `npm run build`. The feed at `public/podcast/feed.xml` is regenerated. The public feed is a funnel for podcast directories: an episode appears in it 28 days after its date (`FEED_DELAY_DAYS` overrides this; `0` disables the delay), and every item carries a line pointing listeners to the app for current episodes. Subscribers always hear the newest episode in the app on the day it is published. The nightly deploy rebuilds the feed, so held-back episodes appear on schedule without a commit.

## Build the YouTube video kit

The Sowards Briefing Room channel is faceless: Dr. Sowards' cloned voice over brand slides, opinion text, timelines, and training photos. The editor (a person or an AI editing tool) works from one file per brief so that nothing about a case is invented downstream.

1. Optional: add a `youtube` block to the brief JSON with up to three `titles` written in the channel's title grammar and a `thumbnail` object (`text`, `redWord`, `visual`). Without it the kit falls back to the brief title and the first briefing room point.
2. Run `npm run youtube -- <brief id>`. It writes `content/youtube/<brief id>.md` with title options, thumbnail text, the full description, chapter markers (the first words of each segment, so timestamps can be placed against the audio), a shot list, one Short per case plus a briefing-room-points Short, the pinned comment, a Monday-to-Friday post schedule for LinkedIn, Facebook, Instagram, TikTok, and X, and a Saturday community poll from the knowledge check.
3. Read the guardrail line near the top. Every case is screened against `content/guardrails.json` and the git-ignored `content/guardrails.private.json` (same shape: `agencies`, `matters`, `terms`). A matched case is left out of the kit, and the kit says the narration audio still contains it and needs a re-cut before publishing. Keep retained matters, opposing parties, and client agencies in the private file only.
4. Copy the kit into the Dropbox folder `/Claude handoff to Grok` as `<brief id> video kit.md`. Grok builds the video and schedules the posts from there, Dr. Sowards approves, and the substance stays as written. The standing rules for the folder are in its `00 READ ME FIRST` file.
5. Commit the kit with the brief so the week's video and posts are reproducible.

Rules the kit repeats to the editor: no AI avatar or synthetic host, non-graphic visuals only, footage only from public records or court exhibits obtained through a formal request, no identifiable juveniles, the written spelling "Sowards" everywhere on screen, and the thumbnail formula in docs/YOUTUBE-NICHE-SCRUB.md section 11 (no face by default, badge always, never a generated likeness).

## Update the catalog, resources, or references

Edit `content/courses.json`, `content/resources.json`, `content/duck.json`, or `content/pc835a.json` and rebuild. The California instructors category in the resource center is intentionally empty until Sowards Consulting chooses who to list.
