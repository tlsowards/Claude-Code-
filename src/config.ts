// Site-wide configuration. Values prefixed with VITE_ can be overridden in a .env file.
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
  location: 'Rancho Cordova, CA, serving agencies statewide',
  // MailerLite embedded form action URL. Leave empty until the form is created in MailerLite.
  mailerLiteFormAction: import.meta.env.VITE_MAILERLITE_FORM_ACTION ?? '',
  // Public URL the app is served from. Used for share links and the podcast feed.
  publicUrl: import.meta.env.VITE_PUBLIC_URL ?? 'https://app.sowardsconsulting.com',
  // Base URL where podcast MP3 files are hosted (Bunny Stream or another host).
  audioBaseUrl: import.meta.env.VITE_AUDIO_BASE_URL ?? '',
};

export const disclaimer =
  'Educational material only. It is not legal advice and does not replace agency policy or counsel. Read the full opinion before relying on any case, and confirm unpublished decisions with counsel before citing them.';
