# Site integration (Phase 2)

What the app reads from sowardsconsulting.com, what it found there on November 6, 2026, and what still has to change on the site.

## Working now

| Feature | How |
|---|---|
| Course catalog | `scripts/sync-site.mjs` reads the public LifterLMS endpoint `/wp-json/llms/v1/courses` at build time and writes `content/courses.live.json`: title, description, audience, plans and prices, and the course image. The nightly deploy keeps it current. If the site is unreachable the last committed catalog is used. |
| STC numbers and tracks | `content/courses.meta.json`, keyed by course id. The site does not expose STC numbers through its API, so this file is maintained by hand. |
| Pricing table | Derived from the live plans on the first course that lists all six. |
| Sign in, my courses, agency dashboard | Links to the site's `/dashboard/` and `/manager-dashboard/` pages. Students use their existing site accounts. |
| Podcast audio | Episode MP3s are served from the site's own media library (`/wp-content/uploads/...`), which is public even though the podcast posts are password protected. `content/episodes.json` carries each episode's `audioUrl` and duration. The app's RSS feed uses those URLs, so no separate audio host is needed. |

## Found on the site

- **The weekly audio is produced with OpenAI text to speech.** The media library file names carry an `openai` suffix (for example `2026-10-03_2026-10-03_case_law_review_openai.mp3`), and the published episode files are re-encoded copies with ID3 titles and "Tim Sowards" as artist. Four of the six Dropbox recordings are on the site byte for byte: October 3, 18, 25, and November 1. The October 4 and October 11 recordings are not on the site; October 4 covered the same window as October 3 and was dropped from the app, and October 11 shows "audio coming" until its file is uploaded to the media library.

- **12 published online courses**, including Beyond Bias, The Standard You Walk Past, Secure Then Serve, The Last Line, and On the Unit: Title 15, which the earlier flyer did not list.
- **A podcast already exists on the site** in Seriously Simple Podcasting: a series named "sowards-daily-case-brief" with "Weekly Case Law Review" episodes back to August 29, 2026 plus deposition teaching briefs for expert witness cases. Every episode is password protected, the episode pages return 404, and the series feed at `/feed/podcast/sowards-daily-case-brief` returns 404. The podcast is therefore not usable as a public host today. The deposition briefs should stay private and are not used by the app.
- **Two pages are password protected**: "Use of Force Case Law Review" (`/use-of-force-case-law/`) and "Case Briefs" (`/case-briefs/`). These hold the updates written for Dr. Sowards. The app's weekly briefs are the public rewrite.
- **Course pages work at phone width.** A 390-pixel test of the course catalog and a course page showed no layout overflow and no site errors. Lesson video could not be tested without a student login.

## Blocked: WordPress login from the app build

The saved WordPress application password is not reaching WordPress. Every authenticated call returns `rest_not_logged_in`, which WordPress sends only when no login header arrives at all. Two possible causes, in order of likelihood:

1. The credential was saved as a bearer token instead of username and password. Check the network secret on the cloud environment and re-save it as basic authentication.
2. The web server drops the `Authorization` header before PHP sees it. Fix by adding to the site's `.htaccess`, above the WordPress block:

   ```
   RewriteEngine On
   RewriteCond %{HTTP:Authorization} ^(.*)
   RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
   ```

Until this works, nothing that needs a login can be built: reading the protected pages, reading podcast audio files, student progress, and certificate lookups.

## To make the site podcast public

In WordPress, Podcast, All Episodes: remove the password from the weekly episodes (leave the deposition briefs protected or move them to a separate private series), then Settings, Permalinks, Save to rebuild the permalink rules so episode pages stop returning 404. Set the podcast image, category, and owner email under Podcast, Settings, Feed details. The feed will then be live at `/feed/podcast/sowards-daily-case-brief` and the app can read episodes and audio from it instead of its own feed.

## Student progress inside the app (next)

The app is a static site on a different origin from WordPress, so a student's browser login on the site does not carry over. Two options once the admin login works:

- **Simplest:** keep sending students to the site's dashboard, which already works on phones.
- **In-app:** a small WordPress snippet (WPCode, like the existing `sowards/v1` endpoints) that accepts a username and application password, returns the student's enrollments, progress, and certificate links from LifterLMS, and nothing else. The app stores the token on the phone and shows "My courses" natively.
