// Site-wide configuration. Values prefixed with VITE_ can be overridden in a .env file.
// The deploy workflow passes every VITE_ variable through even when the repository variable is
// unset, which arrives as an empty string, so empty counts as "not set".
const env = (value: string | undefined, fallback: string) => (value && value.trim() ? value.trim() : fallback);

export const site = {
  name: 'Sowards Consulting',
  appName: 'Sowards Consulting Training',
  tagline: 'Where Expertise Meets the Field',
  owner: 'Dr. Timothy Sowards, PhD',
  email: 'tim@sowardsconsulting.com',
  phone: '+1 (916) 425-5202',
  phoneHref: 'tel:+19164255202',
  website: 'https://sowardsconsulting.com',
  coursesUrl: 'https://sowardsconsulting.com/courses/',
  contactUrl: 'https://sowardsconsulting.com/contact/',
  dashboardUrl: 'https://sowardsconsulting.com/dashboard/',
  managerDashboardUrl: 'https://sowardsconsulting.com/manager-dashboard/',
  loginUrl: 'https://sowardsconsulting.com/dashboard/',
  location: 'Rancho Cordova, CA, serving agencies statewide',
  // MailerLite embedded form action URL. Leave empty until the form is created in MailerLite.
  mailerLiteFormAction: env(import.meta.env.VITE_MAILERLITE_FORM_ACTION, ''),
  // Public URL the app is served from. Used for share links and the podcast feed.
  publicUrl: env(import.meta.env.VITE_PUBLIC_URL, 'https://app.sowardsconsulting.com'),
  // Base URL where podcast MP3 files are hosted (Bunny Stream or another host).
  audioBaseUrl: env(import.meta.env.VITE_AUDIO_BASE_URL, ''),
  // WordPress app API (see wordpress/sowards-app-api.php).
  apiBase: env(import.meta.env.VITE_API_BASE, 'https://sowardsconsulting.com/wp-json/sowards/v1'),
  // Podcast directory listings. Leave a value empty until the show is listed there.
  spotifyUrl: 'https://open.spotify.com/show/2pARhndpTvYYJBThfrITl9',
  applePodcastsUrl: '',
  // Where "Start your free 30 days" sends people: the LifterLMS membership checkout on the site.
  subscribeUrl: env(import.meta.env.VITE_SUBSCRIBE_URL, 'https://sowardsconsulting.com/membership/sowards-briefing-room/'),
};

/** Subscription offer and whether the paywall is enforced. */
export const subscription = {
  // On by default. Set the PAYWALL repository variable to "off" to open everything up again.
  enforced: import.meta.env.VITE_PAYWALL !== 'off',
  trialDays: 30,
  monthlyPrice: '$9.99',
  annualPrice: '$59.99',
  /** Short offer line used wherever the price is shown. */
  get offer() {
    return `${this.monthlyPrice} a month or ${this.annualPrice} a year`;
  },
  name: "Sowards' Briefing Room",
};

export const disclaimer =
  'Educational material only. It is not legal advice and does not replace agency policy or counsel. Read the full opinion before relying on any case, and confirm unpublished decisions with counsel before citing them.';
