# Roadmap

## Phase 1 (this repository): web app with static content

Done: brand shell, installable PWA, five weekly briefs with printable roll call versions, share buttons, and knowledge checks, case-level pages with a sitemap for search, podcast page and RSS feed, training catalog and pricing, resource center, Downing the Duck, PC 835a reference, subscribe page, and automatic deployment to GitHub Pages on merge.

Open items that need information from Sowards Consulting:

- Audio host URL for the podcast MP3 files.
- MailerLite form action for the Subscribe page.
- Which California instructors and training centers to list in the resource center.
- Confirmation of the full live course list and STC numbers for the Manipulation and PREA courses.
- Decide whether the two Force of Law books should appear in the app as products.

## Phase 2: connect to sowardsconsulting.com (WordPress and LifterLMS)

Status and findings are in [Site integration](SITE-INTEGRATION.md). The course catalog, pricing, and sign-in links now come from the live site. Student progress in the app and the site podcast are blocked on the items listed there.

The live site already runs the LMS: courses, enrollment, quizzes, certificates, agency dashboards, and pricing. The app should read from it rather than duplicate it.

- Register two custom post types in WordPress: `weekly_brief` (with the same fields as the JSON) and `podcast_episode`. Publish from the WordPress editor, and the app reads them through the REST API.
- Read the course catalog from LifterLMS so the Training page matches the live site automatically.
- Sign-in: let a student log in with their existing site account and see their enrolled courses, progress, and certificates inside the app.
- This needs the site allowed in the build environment and a WordPress application password entered through the secure credential form.

## Subscription

Built: sign-in with the site account, account page with subscription status and course progress, paywall on briefs, cases, audio, print, and knowledge checks with a free preview. Setup steps are in [Subscription](SUBSCRIPTION.md). The paywall is off until the membership exists on the site.

## Phase 3: notifications and native apps

- Web push notifications for new briefs and episodes (needs a small server component or a push service).
- Wrap the same web app for iOS and Android with Capacitor and submit under Sowards Consulting's Apple and Google developer accounts.
- Offline reading of the most recent briefs.
