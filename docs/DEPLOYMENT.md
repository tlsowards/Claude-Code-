# Deployment

The build output in `dist/` is static files. It can be hosted anywhere that serves static files over HTTPS. HTTPS is required for the install prompt and the service worker.

## Default: GitHub Pages, automatic

The workflow at `.github/workflows/deploy-pages.yml` builds and deploys the app to GitHub Pages on every push to `main`. The first run enables Pages on the repository. The app is then live at:

```
https://tlsowards.github.io/Claude-Code-/
```

Optional repository variables (Settings, Secrets and variables, Actions, Variables) are read at build time:

| Variable | Purpose |
|---|---|
| `AUDIO_BASE_URL` | Folder URL where the podcast MP3s are hosted. |
| `MAILERLITE_FORM_ACTION` | MailerLite embedded form action for the Subscribe page. |

To move to your own domain later, add `app.sowardsconsulting.com` as the custom domain in the repository's Pages settings, create the CNAME record at your DNS host pointing to `tlsowards.github.io`, and change `BASE_PATH` in the workflow to `/` and `VITE_PUBLIC_URL` to `https://app.sowardsconsulting.com`.

## Option A: subdomain on another static host

Host the app at `app.sowardsconsulting.com` on a static host (Cloudflare Pages, Netlify, Vercel, or the SiteGround account that already hosts the site). Set in `.env`:

```
VITE_PUBLIC_URL=https://app.sowardsconsulting.com
BASE_PATH=/
```

Configure the host to serve `index.html` for unknown paths so deep links like `/briefs/2026-w44` work.

## Option B: folder on sowardsconsulting.com

Host at `https://sowardsconsulting.com/app/`. Set:

```
VITE_PUBLIC_URL=https://sowardsconsulting.com
BASE_PATH=/app/
```

Upload `dist/` to the `app` folder and add a rewrite rule so `/app/*` serves `/app/index.html`.

## Audio hosting

Episode MP3s live in the sowardsconsulting.com media library and each episode in `content/episodes.json` points at its file with `audioUrl`. To publish a new episode, upload the MP3 in WordPress (Media, Add New), copy the file URL, and add it to the episode entry. `VITE_AUDIO_BASE_URL` remains available as a fallback for episodes that only have a `file` name.

## Podcast directories

After the feed is live at `<public URL>/podcast/feed.xml`:

1. Validate the feed with a podcast feed validator.
2. Submit it in Apple Podcasts Connect and Spotify for Podcasters under the Sowards Consulting accounts. Both read the same RSS feed.
3. The cover art at `public/podcast/cover.png` is 3000 by 3000 pixels, the size Apple recommends, with the Sowards shield above the title.

## Email signup

Create the embedded form in MailerLite (already used for the de-escalation lead magnet) and set `VITE_MAILERLITE_FORM_ACTION` to the form's action URL. Until then, the Subscribe page offers an email link.
