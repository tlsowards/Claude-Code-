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
3. Run `npm run build`. The feed at `public/podcast/feed.xml` is regenerated.

## Update the catalog, resources, or references

Edit `content/courses.json`, `content/resources.json`, `content/duck.json`, or `content/pc835a.json` and rebuild. The California instructors category in the resource center is intentionally empty until Sowards Consulting chooses who to list.
