# Sowards Consulting training app

An installable web app for Sowards Consulting: weekly use of force case law briefs written for the general training population, the Use of Force Case Law Update podcast, the STC-certified training catalog, a resource center for trainers, and the free Downing the Duck and PC 835a references.

It is built as a progressive web app, so it works in any browser and can be added to a phone's home screen. The same code can later be wrapped for the Apple App Store and Google Play.

## Quick start

```bash
npm install
npm run dev        # local development server
npm run build      # generates the podcast feed, type-checks, and builds to dist/
npm run preview    # serves the production build locally
```

Copy `.env.example` to `.env` to set the public URL, the audio host, and the MailerLite form.

## Where things live

| Path | What it is |
|---|---|
| `content/briefs/*.json` | One file per weekly brief. Add a file, rebuild, and it appears. |
| `content/episodes.json` | Podcast episode list. Drives the podcast page and the RSS feed. |
| `content/courses.live.json` | Online course catalog synced from sowardsconsulting.com at build time. |
| `content/courses.meta.json` | STC numbers and track labels by course id, maintained by hand. |
| `content/courses.json` | Upcoming courses and the pricing note. |
| `content/resources.json` | Trainer resource center categories and links. |
| `content/duck.json` | Downing the Duck six-stage framework. |
| `content/pc835a.json` | PC 835a after AB 392 quick reference. |
| `scripts/sync-site.mjs` | Reads the live course catalog from the site. |
| `scripts/build-feed.mjs` | Generates `public/podcast/feed.xml` from the episode list. |
| `scripts/build-sitemap.mjs` | Generates `public/sitemap.xml` and `public/robots.txt` for search engines. |
| `wordpress/sowards-app-api.php` | WPCode snippet for the site: sign-in, subscription check, courses and certificates for the app. |
| `.github/workflows/deploy-pages.yml` | Builds and deploys to GitHub Pages on every push to `main`. |
| `src/pages/` | One React component per screen. |
| `src/config.ts` | Site name, contact details, and environment-driven settings. |
| `src/styles.css` | Brand tokens (navy, red, gold, Inter, Montserrat) and layout. |
| `docs/` | Content workflow, deployment, and roadmap. |

## Deployment

Merging to `main` deploys the app to GitHub Pages automatically. See [Deployment](docs/DEPLOYMENT.md) for the live address, optional variables, and moving to a custom domain.

## Documentation

- [Content workflow](docs/CONTENT-WORKFLOW.md): how to publish a weekly brief and a podcast episode.
- [Deployment](docs/DEPLOYMENT.md): hosting options, audio hosting, and podcast directory submission.
- [Roadmap](docs/ROADMAP.md): connecting to the WordPress and LifterLMS site, push notifications, native app wrappers.
- [Subscription](docs/SUBSCRIPTION.md): how the free 30 days, then $9.99 a month or $59.99 a year, is set up on the site and enforced in the app.
- [Site integration](docs/SITE-INTEGRATION.md): what the app reads from sowardsconsulting.com and what still needs to change on the site.
- [Market landscape and growth plan](docs/MARKET-AND-GROWTH.md): who competes for the same sign-ups, where Sowards is different, and how to draw people to the app.
