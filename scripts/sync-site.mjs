// Pulls the live course catalog from sowardsconsulting.com (LifterLMS REST, public endpoint)
// and writes content/courses.live.json. Runs before every build. If the site cannot be reached,
// the previously committed file is kept so the build never fails because of the network.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'content/courses.live.json');
const site = (process.env.SITE_URL ?? 'https://sowardsconsulting.com').replace(/\/$/, '');

function text(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#0?36;/g, '$')
    .replace(/&#8212;|&mdash;/g, ', ')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function getJson(url) {
  const r = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function main() {
  const courses = await getJson(`${site}/wp-json/llms/v1/courses?per_page=100&status=publish`);
  const result = [];
  for (const c of courses) {
    const body = text(c.content?.rendered ?? '');
    const planMatches = [...body.matchAll(/((?:Course Preview|Solo|Squad|Shift|Department|Agency)[^$]{0,60}?)\s*(FREE|\$\s?[\d,]+\.\d\d)/g)];
    const plans = planMatches.map((m) => ({ name: m[1].trim().replace(/\s*-\s*/, ': '), price: m[2].replace(/\$\s+/, '$').replace(/\.00$/, '') }));
    const modules = [...body.matchAll(/Module \d[^(]{0,80}\(~?\d+ min[^)]*\)/g)].map((m) => m[0].trim());
    const audience = body.match(/Audience:\s*(.{0,160}?)(?:\s+Total time|$)/)?.[1]?.trim();
    const totalTime = body.match(/Total time:\s*(.{0,80}?)(?:\.|\s+Course Information)/)?.[1]?.trim();
    let image = '';
    if (c.featured_media) {
      try {
        const m = await getJson(`${site}/wp-json/wp/v2/media/${c.featured_media}?_fields=source_url,media_details`);
        image = m.media_details?.sizes?.medium_large?.source_url ?? m.media_details?.sizes?.large?.source_url ?? m.source_url ?? '';
      } catch { /* image is optional */ }
    }
    result.push({
      id: c.id,
      slug: c.slug,
      title: text(c.title?.rendered ?? ''),
      url: c.permalink,
      excerpt: text(c.excerpt?.rendered ?? ''),
      audience: audience ?? '',
      totalTime: totalTime ?? '',
      modules,
      plans: dedupe(plans),
      image,
      updated: c.date_updated_gmt ?? c.date_updated ?? '',
    });
  }
  result.sort((a, b) => a.id - b.id);
  writeFileSync(out, JSON.stringify({ site, fetchedAt: new Date().toISOString(), courses: result }, null, 2) + '\n');
  console.log(`Synced ${result.length} live courses from ${site}.`);
}

function dedupe(plans) {
  const seen = new Set();
  return plans.filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true)));
}

main().catch((err) => {
  if (existsSync(out)) {
    const prev = JSON.parse(readFileSync(out, 'utf8'));
    console.warn(`Site sync skipped (${err.message}); keeping ${prev.courses?.length ?? 0} courses from ${prev.fetchedAt}.`);
  } else {
    console.warn(`Site sync failed (${err.message}) and no previous catalog exists; writing an empty one.`);
    writeFileSync(out, JSON.stringify({ site, fetchedAt: null, courses: [] }, null, 2) + '\n');
  }
});
