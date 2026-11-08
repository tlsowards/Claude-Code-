# Subscription: free for 30 days, then $9.99 a month or $59.99 a year

The subscription is sold on sowardsconsulting.com through LifterLMS and Stripe, which the site already runs. The app checks the subscription when a reader signs in with their site account. Nothing is charged inside the app, so there is no app store commission.

## What is free and what is subscriber-only

| Free for everyone | Subscribers |
|---|---|
| Home, training catalog, resource center, Downing the Duck, PC 835a reference, subscribe page | Full weekly briefs (every case) |
| The list of weekly briefs and each brief's summary and coverage notes | Audio episodes |
| The first case of each brief, as a preview | Printable roll call brief, share button |
| Episode titles and descriptions | Knowledge checks |

The paywall is **on** by default since November 8, 2026. Setting the `PAYWALL` repository variable to `off` opens everything up again for a rebuild.

## Live identifiers

| Item | Value |
|---|---|
| Membership | Sowards' Briefing Room, post ID 9639, `https://sowardsconsulting.com/membership/sowards-briefing-room/` |
| Monthly plan | access plan 9641, $9.99 every month, 30-day free trial, `https://sowardsconsulting.com/purchase/?plan=9641` |
| Annual plan | access plan 9642, $59.99 every year, 30-day free trial, `https://sowardsconsulting.com/purchase/?plan=9642` |
| Gateways offered at checkout | Stripe and Manual (manual is the agency-invoice path; students should pick Stripe) |

Created November 7, 2026 through the LifterLMS REST API. The steps below describe how to recreate them by hand.

## 1. Create the membership and plan in LifterLMS

In WordPress:

1. LifterLMS, Memberships, Add New. Title: **Sowards' Briefing Room**. Publish. (The podcast keeps its own name, Use of Force Case Law Update; the membership is the subscription that unlocks it and the weekly bulletins.)
2. On the membership, under Access Plans, add two plans:
   - **Monthly**: price 9.99, frequency every 1 month, length until cancelled, trial enabled, trial price 0, trial length 30 days.
   - **Annual**: price 59.99, frequency every 1 year, length until cancelled, trial enabled, trial price 0, trial length 30 days. Mark it Featured so it stands out in the pricing table.
   - Payment gateway: Stripe (the site's course plans already use it).
3. Note the membership's post ID (hover the title in the Memberships list; the ID is in the link).
4. The subscribe link in the app is the membership page, which shows both plans in a pricing table: `https://sowardsconsulting.com/membership/sowards-briefing-room/`. Each plan also has its own checkout URL of the form `https://sowardsconsulting.com/purchase/?plan=<plan id>`.

## 2. Install the app API on the site

1. WPCode, Add Snippet, PHP Snippet. Paste the contents of `wordpress/sowards-app-api.php` (everything below the opening comment, without a second `<?php` tag). Auto Insert, Run Everywhere, Activate.
2. Edit the CONFIG block at the top: set `SOWARDS_APP_MEMBERSHIP_ID` to the membership ID from step 1. The origins list holds the two production addresses; add `http://localhost:5173` only while developing locally, and remove it after.
3. Test: `https://sowardsconsulting.com/wp-json/sowards/v1/app-me` should answer with a 401 "Sign in again" message. That proves the endpoints are live.

The snippet exposes three endpoints: sign in (username and password, or an application password), who am I (subscription status, trial end, next payment, enrolled courses with progress and certificates), and sign out. Tokens are random, stored only as hashes, expire after 90 days, and travel in an `X-Sowards-Token` header so a host that strips `Authorization` does not break sign-in. Sign-in is rate limited to 10 attempts per 15 minutes per IP. Administrators always have access so the owner can test.

## 3. Test from the app

Sign in to the app with your admin account at `/signin`. The Account page shows your subscription status, trial end, and courses. Then sign in with a test student who has started the membership trial.

## 4. Turn the paywall on

In the repository, Settings, Secrets and variables, Actions, Variables:

| Variable | Value |
|---|---|
| `PAYWALL` | leave unset, or `off` to disable |
| `SUBSCRIBE_URL` | the membership checkout URL from step 1 |

Re-run the deploy workflow or wait for the nightly build. From then on, readers see the preview and the offer, and subscribers sign in once on each device.

## Notes

- The app keeps the sign-in token in the phone's browser storage for up to 90 days. The app renders only its own content, never user-submitted HTML, which is what keeps that storage safe. Keep it that way if new features are added.

- Cancelling and billing changes happen on the site's dashboard, through LifterLMS and Stripe. The app links there.
- When the app later ships to the App Store or Google Play, Apple's and Google's rules on outside payments for digital content need a fresh look. The web app has no such restriction.
- A private podcast feed per subscriber (so paid episodes play in Apple Podcasts or Spotify) can be added to the same snippet later: a per-user token in the feed URL, with the app showing the link on the Account page.
