// Generates public/podcast/feed.xml from content/episodes.json.
// Runs before every build. Configure VITE_PUBLIC_URL and VITE_AUDIO_BASE_URL in .env.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const env = { ...process.env };
  for (const name of ['.env', '.env.local']) {
    try {
      for (const line of readFileSync(resolve(root, name), 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch {
      /* file is optional */
    }
  }
  return env;
}

const env = loadEnv();
const publicUrl = (env.VITE_PUBLIC_URL ?? 'https://app.sowardsconsulting.com').replace(/\/$/, '');
const basePath = (env.BASE_PATH ?? '/').replace(/\/$/, '');
const audioBase = (env.VITE_AUDIO_BASE_URL ?? '').replace(/\/$/, '');

const episodes = JSON.parse(readFileSync(resolve(root, 'content/episodes.json'), 'utf8'))
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rfc822 = (iso) => new Date(`${iso}T12:00:00-08:00`).toUTCString();
const hms = (sec) => [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map((n) => String(n).padStart(2, '0')).join(':');

const channel = {
  title: 'Use of Force Case Law Update',
  link: `${publicUrl}${basePath}/podcast`,
  description:
    'A weekly walk through the use of force decisions that matter to officers, custody staff, supervisors, and trainers. Federal first, then California, then application. Hosted by Dr. Timothy Sowards of Sowards Consulting.',
  author: 'Dr. Timothy Sowards',
  email: 'tim@sowardsconsulting.com',
  image: `${publicUrl}${basePath}/podcast/cover.png`,
  category: 'Government',
  subcategory: 'Government',
  language: 'en-us',
};

const items = episodes
  .map((e) => {
    const url = audioBase ? `${audioBase}/${e.file}` : `${publicUrl}${basePath}/audio/${e.file}`;
    const guid = `${publicUrl}${basePath}/podcast/${e.id}`;
    return `    <item>
      <title>${esc(e.title)}</title>
      <link>${esc(guid)}</link>
      <guid isPermaLink="true">${esc(guid)}</guid>
      <pubDate>${rfc822(e.date)}</pubDate>
      <description>${esc(e.description)}</description>
      <itunes:summary>${esc(e.description)}</itunes:summary>
      <itunes:explicit>false</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>${e.durationSeconds ? `\n      <itunes:duration>${hms(e.durationSeconds)}</itunes:duration>` : ''}
      <enclosure url="${esc(url)}" length="${e.bytes}" type="audio/mpeg" />
    </item>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(channel.title)}</title>
    <link>${esc(channel.link)}</link>
    <atom:link href="${esc(`${publicUrl}${basePath}/podcast/feed.xml`)}" rel="self" type="application/rss+xml" />
    <language>${channel.language}</language>
    <description>${esc(channel.description)}</description>
    <itunes:author>${esc(channel.author)}</itunes:author>
    <itunes:owner><itunes:name>${esc(channel.author)}</itunes:name><itunes:email>${esc(channel.email)}</itunes:email></itunes:owner>
    <itunes:image href="${esc(channel.image)}" />
    <itunes:category text="${esc(channel.category)}" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <lastBuildDate>${rfc822(episodes[0].date)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

mkdirSync(resolve(root, 'public/podcast'), { recursive: true });
writeFileSync(resolve(root, 'public/podcast/feed.xml'), xml);
console.log(`Wrote public/podcast/feed.xml with ${episodes.length} episodes.`);
