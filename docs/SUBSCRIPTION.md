# Subscription: free for 30 days, then $9.99 a month

The subscription is sold on sowardsconsulting.com through LifterLMS and Stripe, which the site already runs. The app checks the subscription when a reader signs in with their site account. Nothing is charged inside the app, so there is no app store commission.

## What is free and what is subscriber-only

| Free for everyone | Subscribers |
|---|---|
| Home, training catalog, resource center, Downing the Duck, PC 835a reference, subscribe page | Full weekly briefs (every case) |
| The list of weekly briefs and each brief's summary and coverage notes | Audio episodes |
| The first case of each brief, as a preview | Printable roll call brief, share button |
| Episode titles and descriptions | Knowledge checks |

The paywall is **off** until you turn it on (step 4), so the live app keeps working while the site side is set up.

## 1. Create the membership and plan in LifterLMS

In WordPress:

1. LifterLMS, Memberships, Add New. Title: **Use of Force Case Law Update**. Publish.
2. On the membership, under Access Plans, add a plan:
   - Title: Monthly
   - Price: 9.99, Frequency: every 1 month, Length: until cancelled
   - Trial: enabled, trial price 0, trial length 30 days
   - Payment gateway: Stripe
3. Note the membership's post ID (hover the title in the Memberships list; the ID is in the link).
4. Copy the membership's checkout URL. The membership page URL plus the plan works, for example `https://sowardsconsulting.com/membership/use-of-force-case-law-update/`.

## 2. Install the app API on the site

1. WPCode, Add Snippet, PHP Snippet. Paste the contents of `wordpress/sowards-app-api.php` (everything below the opening comment, without a second `<?php` tag). Auto Insert, Run Everywhere, Activate.
2. Edit the CONFIG block at the top: set `SOWARDS_APP_MEMBERSHIP_ID` to the membership ID from step 1, and leave the origins unless the app moves to another address.
3. Test: `https://sowardsconsulting.com/wp-json/sowards/v1/app-me` should answer with a 401 "Sign in again" message. That proves the endpoints are live.

The snippet exposes three endpoints: sign in (username and password, or an application password), who am I (subscription status, trial end, next payment, enrolled courses with progress and certificates), and sign out. Tokens are random, stored only as hashes, expire after 90 days, and travel in an `X-Sowards-Token` header so a host that strips `Authorization` does not break sign-in. Sign-in is rate limited to 10 attempts per 15 minutes per IP. Administrators always have access so the owner can test.

## 3. Test from the app

Sign in to the app with your admin account at `/signin`. The Account page shows your subscription status, trial end, and courses. Then sign in with a test student who has started the membership trial.

## 4. Turn the paywall on

In the repository, Settings, Secrets and variables, Actions, Variables:

| Variable | Value |
|---|---|
| `PAYWALL` | `on` |
| `SUBSCRIBE_URL` | the membership checkout URL from step 1 |

Re-run the deploy workflow or wait for the nightly build. From then on, readers see the preview and the offer, and subscribers sign in once on each device.

## Notes

- Cancelling and billing changes happen on the site's dashboard, through LifterLMS and Stripe. The app links there.
- When the app later ships to the App Store or Google Play, Apple's and Google's rules on outside payments for digital content need a fresh look. The web app has no such restriction.
- A private podcast feed per subscriber (so paid episodes play in Apple Podcasts or Spotify) can be added to the same snippet later: a per-user token in the feed URL, with the app showing the link on the Account page.
