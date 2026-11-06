// Generates public/sitemap.xml and public/robots.txt from the content folder.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function loadEnv() {
  const env = { ...process.env };
  for (const name of ['.env', '.env.local']) {
    try {
      for (const line of readFileSync(resolve(root, name), 'utf8').split('\n')) {
        const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
      }
    } catch { /* optional */ }
  }
  return env;
}
const env = loadEnv();
const publicUrl = (env.VITE_PUBLIC_URL ?? 'https://app.sowardsconsulting.com').replace(/\/$/, '');
const base = (env.BASE_PATH ?? '/').replace(/\/$/, '');
const origin = `${publicUrl}${base}`;

const staticRoutes = ['/', '/briefs', '/podcast', '/training', '/resources', '/downing-the-duck', '/reference/pc835a', '/subscribe', '/about'];
const briefDir = resolve(root, 'content/briefs');
const briefs = readdirSync(briefDir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(resolve(briefDir, f), 'utf8')));
const episodes = JSON.parse(readFileSync(resolve(root, 'content/episodes.json'), 'utf8'));

const urls = [];
for (const r of staticRoutes) urls.push({ loc: `${origin}${r === '/' ? '/' : r}`, priority: r === '/' ? '1.0' : '0.7' });
for (const b of briefs) {
  urls.push({ loc: `${origin}/briefs/${b.id}`, lastmod: b.date, priority: '0.9' });
  for (const s of b.sections) for (const c of s.cases) urls.push({ loc: `${origin}/briefs/${b.id}/${c.id}`, lastmod: b.date, priority: '0.8' });
}
for (const e of episodes) urls.push({ loc: `${origin}/podcast/${e.id}`, lastmod: e.date, priority: '0.6' });

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(resolve(root, 'public/sitemap.xml'), xml);
writeFileSync(resolve(root, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Wrote sitemap.xml with ${urls.length} URLs.`);
