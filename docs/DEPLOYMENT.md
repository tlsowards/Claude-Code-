# Deployment

The build output in `dist/` is static files. It can be hosted anywhere that serves static files over HTTPS. HTTPS is required for the install prompt and the service worker.

## Option A: subdomain (recommended first step)

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

Podcast MP3 files are not stored in this repository. Host them on Bunny Stream (already used for course video) or any CDN, then set `VITE_AUDIO_BASE_URL` to the folder URL. The RSS feed and the in-app player build each episode URL as `VITE_AUDIO_BASE_URL/<file>`.

## Podcast directories

After the feed is live at `<public URL>/podcast/feed.xml`:

1. Validate the feed with a podcast feed validator.
2. Submit it in Apple Podcasts Connect and Spotify for Podcasters under the Sowards Consulting accounts. Both read the same RSS feed.
3. The cover art at `public/podcast/cover.png` is 1400 by 1400 pixels, the minimum Apple accepts. Replace it with a designed version when ready.

## Email signup

Create the embedded form in MailerLite (already used for the de-escalation lead magnet) and set `VITE_MAILERLITE_FORM_ACTION` to the form's action URL. Until then, the Subscribe page offers an email link.
