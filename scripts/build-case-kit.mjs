// Builds a Sowards Briefing Room video kit for evergreen Case library videos: one markdown file that an
// editor (a person or an AI editing tool) builds one video per case, its Shorts, and the social posts from.
// Every sentence in the kit comes from the case JSON (content/cases/<id>.json) and its narration script
// (content/narration/cases/<id>.txt), so nothing about a case is invented downstream. Coverage and caution
// notes are internal and never appear here. Writes content/youtube/cases/<kit name>.md.
//
// Usage: node scripts/build-case-kit.mjs --name "kit-1-graham-garner-deorle-hemet" --start 2026-11-23 graham-v-connor tennessee-v-garner ...
//   --name   file name for the kit (without .md)
//   --start  the Monday the first case's posts begin; each later case takes the following week
//
// Guardrails: the same lists scripts/build-youtube-kit.mjs uses (content/guardrails.json and the git-ignored
// content/guardrails.private.json). A case that matches is left out and the kit says so.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decidedShort } from './lib/case-text.mjs';
import { labelFor } from './lib/case-categories.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const caseDir = resolve(root, 'content/cases');
const outDir = resolve(root, 'content/youtube/cases');
mkdirSync(outDir, { recursive: true });

const APP = 'https://app.sowardsconsulting.com';
const SITE = 'https://sowardsconsulting.com';
const SUBSCRIBE = `${SITE}/membership/sowards-briefing-room/`;
const CHANNEL = 'Sowards Briefing Room';
const YOUTUBE = 'https://www.youtube.com/@SowardsConsulting';
const HANDOFF = 'Dropbox: /Claude handoff to Grok';
const CTA = `Follow for use-of-force case law explained for officers, and get the full teaching brief at ${APP.replace(/^https?:\/\//, '')}.`;
const DISCLAIMER =
  'Educational material only. It is not legal advice and does not replace agency policy or counsel. Read the full opinion before relying on any case.';
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const name = opt('name');
const start = opt('start');
const ids = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--name' && args[i - 1] !== '--start');
if (!name || !start || ids.length === 0 || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
  console.error('Usage: node scripts/build-case-kit.mjs --name <kit name> --start <YYYY-MM-DD, a Monday> <case id> [more ids...]');
  process.exit(1);
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
// Periods inside citations and abbreviations (U.S., v., No., n.10, F.3d, Dr., Supp.) are not sentence ends.
const ABBR = /\b(U\.S\.C\.|U\.S\.|v\.|No\.|Nos\.|n\.|F\.|Supp\.|Dr\.|Mr\.|Mrs\.|Ms\.|Cir\.|Cal\.|Dist\.|Ct\.|App\.|Inc\.|Jr\.|Sr\.)/g;
const MARK = '\u0001';
function protect(s) {
  return s.replace(ABBR, (m) => m.replace(/\./g, MARK));
}
function restore(s) {
  return s.replace(new RegExp(MARK, 'g'), '.');
}
function firstSentence(s) {
  const t = protect(s);
  const m = t.match(/^.*?[.!?]["')\]]*(?=\s|$)/);
  return restore(m ? m[0] : t).trim();
}
function sentences(s) {
  const t = protect(s);
  return (t.match(/[^.!?]+[.!?]+["')\]]*(?=\s|$)/g)?.map((x) => restore(x).trim()) ?? [restore(t)]);
}
function clip(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)) + '…';
}
/** Strip pin cites so a sentence lifted into a post reads cleanly. */
function clean(s) {
  return s.replace(/\s*\((?:\d+ (?:U\.S\.|F\.\d\w*) )?at \d+[^)]*\)/g, '').replace(/\[([A-Za-z])\]/g, '$1').replace(/\s+([.,;:])/g, '$1');
}
const statusLabel = {
  published: 'published',
  unpublished: 'unpublished, not binding precedent',
  order: 'order, not a full opinion',
  'summary-order': 'summary order, not precedential',
  unknown: 'publication status not confirmed',
};
const settingLabel = { field: 'field', custody: 'custody', juvenile: 'juvenile', supervisors: 'supervisors', all: 'all settings' };
function settingsText(c) {
  return (c.settings ?? []).map((s) => settingLabel[s] ?? s).join(', ') || 'all settings';
}
function shortName(c) {
  return c.name.replace(/\s*\(.*$/, '');
}
function courtShort(c) {
  return c.court.split(' (')[0];
}
function cite(c) {
  return `${c.name}, ${courtShort(c)}, ${decidedShort(c.decided)}`;
}
function courtListener(n) {
  return `https://www.courtlistener.com/?q=${encodeURIComponent(`"${n}"`)}`;
}
/** The channel playlist a case belongs in: its first library section's label. */
function playlist(c) {
  const k = (c.categories ?? [])[0];
  return k ? labelFor(k) : 'Use of force case law';
}
function spoken(c) {
  return shortName(c).replace(/ v\. /, ' versus ');
}

// ---- Guardrails -------------------------------------------------------------------------------
function loadGuardrails() {
  const merged = { agencies: [], matters: [], terms: [] };
  for (const file of ['content/guardrails.json', 'content/guardrails.private.json']) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    const g = JSON.parse(readFileSync(path, 'utf8'));
    for (const k of Object.keys(merged)) if (Array.isArray(g[k])) merged[k].push(...g[k]);
  }
  return merged;
}
const guard = loadGuardrails();
const guardTerms = [...guard.agencies, ...guard.matters, ...guard.terms].map((t) => t.trim()).filter(Boolean);
function guardHits(c) {
  const hay = [c.name, c.court, c.docket, c.topic, c.summary, c.facts, c.holding, c.dissent, c.notDecided, c.inPractice, c.trainIt, c.caution, ...(c.coverage ?? [])]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
  return guardTerms.filter((t) => hay.includes(t.toLowerCase()));
}

// ---- Kit ------------------------------------------------------------------------------------------
const missing = ids.filter((id) => !existsSync(resolve(caseDir, `${id}.json`)));
if (missing.length) {
  console.error(`No case file for: ${missing.join(', ')} (expected content/cases/<id>.json)`);
  process.exit(1);
}
const all = ids.map((id) => JSON.parse(readFileSync(resolve(caseDir, `${id}.json`), 'utf8')));
const excluded = [];
const cases = all.filter((c) => {
  const hits = guardHits(c);
  if (hits.length) excluded.push({ name: c.name, hits });
  return hits.length === 0;
});

const out = [];
const h = (n, t) => out.push(`${'#'.repeat(n)} ${t}`, '');
const p = (t) => out.push(t, '');
const li = (items) => out.push(...items.map((x) => `- ${x}`), '');
const caseUrl = (c) => `${APP}/cases/${c.id}`;
const minutes = (c) => (c.audio?.durationSeconds ? `${Math.round(c.audio.durationSeconds / 60)} minutes` : '');

h(1, `${CHANNEL} video kit: Case library videos, ${cases.map(shortName).join(', ')}`);
p(`Kit: ${name}. Channel: ${CHANNEL}, ${YOUTUBE}. Hand-off copy of this kit: ${HANDOFF}. These are evergreen videos from the Case library, not tied to a week. One video per case, in the order below, one release a week starting ${start}.`);
p('Each video has its own finished narration in Dr. Sowards\' voice. The audio is complete as delivered: do not cut, reorder, or add to it. Open with the brand slate over the first spoken paragraph and close with the end screen after the last words.');

h(2, 'Instructions for the editor');
li([
  'Use only the words in this file and in the narration script for each case. Do not add facts, quotes, outcomes, dollar figures, names, or dates from any other source. If something is missing, leave it out.',
  'Keep every case name, court, date, and docket exactly as written here. The written spelling is "Sowards"; the audio pronunciation file is for the voice engine only.',
  'Visuals: brand slides (navy #1B2A4E, red #CF2E2E, gold #C9A24B, Inter and Montserrat), highlighted lines of the opinion text, a facts timeline, a map when a place is named, and the training photos in public/images/training. Steady, slow-moving b-roll only. Body camera or courtroom footage only if it is public record or a court exhibit, non-graphic, with no identifiable juveniles, and obtained through a formal records request. No AI avatar or synthetic host anywhere in the video.',
  'Thumbnail: follow the thumbnail section of each video. No generated or avatar face, ever.',
  'Timestamps: each chapter list gives the first words of the segment. Place each chapter marker where those words are spoken, and list every chapter in the description starting at 0:00.',
  'Posts: the schedule below is the copy. Formatting, hashtags beyond the ones listed, and scheduling are yours. The substance is not. A post goes out only after its video is live; until then it links to the case page on the app.',
]);

if (guardTerms.length === 0) {
  p('Guardrail check: no guardrail file was found, so no cases were screened. Add content/guardrails.json before publishing.');
} else if (excluded.length) {
  p(`Guardrail check: ${excluded.length} case${excluded.length > 1 ? 's were' : ' was'} left out of this kit because the text matched the exclusion list.`);
  li(excluded.map((e) => `${e.name} (matched: ${e.hits.join(', ')})`));
} else {
  p(`Guardrail check: ${all.length} case${all.length === 1 ? '' : 's'} screened against ${guardTerms.length} exclusion term${guardTerms.length === 1 ? '' : 's'}, none matched.`);
}

if (cases.length === 0) {
  p('No cases remain after the guardrail check. There is no video in this kit.');
} else {
  h(2, `${cases.length} video${cases.length === 1 ? '' : 's'}`);
  const monday0 = new Date(`${start}T12:00:00Z`);
  li(cases.map((c, i) => {
    const d = new Date(monday0);
    d.setUTCDate(d.getUTCDate() + 7 * i);
    return `Video ${i + 1} (week of ${isoDate(d)}): ${cite(c)}. Playlist: ${playlist(c)}`;
  }));

  cases.forEach((c, vi) => {
    const yt = c.youtube ?? {};
    h(2, `Video ${vi + 1}: ${shortName(c)}`);
    p(`Decision: ${c.name}, ${courtShort(c)}, ${c.decided} (${statusLabel[c.status] ?? c.status})${c.citation ? `, ${c.citation}` : ''}${c.docket ? `, docket ${c.docket}` : ''}.`);
    p(`Suggested playlist: ${playlist(c)}. Topic sections on the app: ${(c.categories ?? []).map(labelFor).join(', ') || 'none'}.`);
    p(`Audio: ${c.audio?.url ? `${c.audio.url} (${minutes(c)}, complete narration in Dr. Sowards' voice)` : 'not rendered yet; render it with scripts/make-audio-elevenlabs.mjs --case before building the video'}. Narration script: content/narration/cases/${c.id}.txt. Case page: ${caseUrl(c)}.`);

    h(3, 'Title options');
    const titles = yt.titles?.length
      ? yt.titles
      : [`${shortName(c)}: ${c.topic}`, firstSentence(c.inPractice), `${c.applications?.[0]?.title ?? shortName(c)}. ${courtShort(c)}, ${c.decided}.`];
    out.push(...titles.map((t, i) => `${i + 1}. ${t}`), '');
    p('Pick one. Titles stay under 70 characters where possible; the full case name and citation go in the description.');

    h(3, 'Thumbnail');
    const thumb = yt.thumbnail ?? {};
    li([
      `Text: ${thumb.text ?? clip(shortName(c), 40).toUpperCase()}${thumb.redWord ? ` (red word: ${thumb.redWord})` : ''}`,
      `Visual: ${thumb.visual ?? 'one element only: a highlighted line of the opinion or a single still from the facts'}`,
      'Formula: a darkened evidence image fills the frame (opinion page, court filing, non-graphic footage still, or a brand slide), one focal element outlined with a thin gold stroke or a red box (no arrows), the headline in white heavy condensed type on a navy band, the channel badge in gold bottom right at the same size and position every time. No face. Red only as an accent. Nothing shown that the video does not deliver.',
      'Variants for YouTube Test and compare: A is the formula above; B is type only (headline plus a single icon, no photo); C is the pillar variant named in docs/YOUTUBE-NICHE-SCRUB.md section 11. Hold the title fixed and change only the thumbnail.',
    ]);

    h(3, 'Description');
    const desc = [];
    if (yt.hook) desc.push(yt.hook, '');
    desc.push(`${cite(c)} (${statusLabel[c.status] ?? c.status})${c.citation ? `, ${c.citation}` : ''}. ${c.summary}`);
    desc.push(`Written brief, training points, and knowledge check: ${caseUrl(c)}`, '');
    desc.push(`The full Case library, the weekly Use of Force Case Law Update, and the printable roll call versions are in the Sowards Briefing Room: ${APP}/cases`);
    desc.push(`Start your free 30 days: ${SUBSCRIBE}`);
    desc.push(`STC-certified courses for agencies: ${SITE}/courses/`);
    desc.push(`Subscribe for a new case every week: ${YOUTUBE}`);
    desc.push('', 'Chapters', '0:00 Open', '(fill the remaining chapter times from the chapter list below)', '', DISCLAIMER, '');
    desc.push(`Dr. Timothy Sowards, PhD, has trained peace officers for over 25 years and is a POST-certified and BSCC STC-certified instructor. Sowards Consulting LLC, Rancho Cordova, California. ${SITE}`);
    out.push('```', ...desc, '```', '');

    h(3, 'Chapters (first words of each segment, for timestamps)');
    const chapters = [
      ['Open', `${spoken(c)}. From the Sowards Briefing Room.`],
      ['The case', `${spoken(c)}. ${courtShort(c).replace(/ v\. /, ' versus ')}`],
      ['Facts', 'Here are the facts.'],
      ['Holding', 'The holding.'],
    ];
    if (c.dissent) chapters.push(['Dissent', 'On the dissent.']);
    if (c.notDecided) chapters.push(['What was not decided', 'What was not decided.']);
    chapters.push(['In practice', 'What this means in practice.'], ['Train it', 'How to train it.']);
    if (c.applications?.length) chapters.push(['Briefing room points', 'The briefing room points']);
    chapters.push(['Close', `That is ${spoken(c)}.`]);
    out.push('| Chapter | Starts at the words |', '|---|---|', ...chapters.map(([a, b]) => `| ${a} | "${b}" |`), '');

    h(3, 'Shot list');
    out.push('| Segment | On-screen text | Visual |', '|---|---|---|');
    out.push(`| Open | ${CHANNEL} / ${shortName(c)} / ${decidedShort(c.decided)} | Brand open, channel mark, then the summary as on-screen lines |`);
    out.push(`| The case | ${c.name} / ${courtShort(c)} / ${decidedShort(c.decided)} / ${statusLabel[c.status] ?? c.status} | Opinion first page or caption, docket ${c.docket ?? 'n/a'} |`);
    out.push(`| Facts | Facts | Timeline built from the facts paragraph; map if a place is named |`);
    out.push(`| Holding | Holding | Highlighted opinion text |`);
    if (c.dissent) out.push(`| Dissent | Dissent | Highlighted opinion text, second color |`);
    if (c.notDecided) out.push(`| What was not decided | What was not decided | Brand slide |`);
    out.push(`| In practice | In practice: ${settingsText(c)} | Training photo or brand slide |`);
    out.push(`| Train it | Train it | Numbered points pulled from the train-it paragraph |`);
    if (c.applications?.length) out.push(`| Briefing room points | ${c.applications.map((a, i) => `${i + 1}. ${a.title}`).join(' / ')} | One brand slide per point, title only |`);
    out.push(`| Close | Sowards Briefing Room / Free 30 days / ${SUBSCRIBE.replace('https://', '')} | End screen with empty zones for subscribe and watch-next |`, '');

    h(3, 'Shorts for this video (vertical, under 60 seconds each)');
    const shorts = [
      ['What this means in practice', c.inPractice],
      ['How to train it', c.trainIt],
    ];
    (c.applications ?? []).slice(0, 2).forEach((a) => shorts.push([`Briefing room point: ${a.title}`, `${a.title}. ${a.body}`]));
    shorts.forEach(([seg, text], i) => {
      h(4, `Short ${vi + 1}.${i + 1}: ${shortName(c)}`);
      li([
        `Hook (on screen and spoken): ${clean(firstSentence(text))}`,
        `Body: ${clean(sentences(text).slice(1, 4).join(' '))}`,
        `Card: ${cite(c)}`,
        'Close: Full brief and training points in the Sowards Briefing Room, link in bio.',
        `Cut from: the "${seg}" segment of Video ${vi + 1}, or re-record from this text in the same voice.`,
      ]);
    });

    h(3, 'Pinned comment');
    out.push('```');
    out.push('Read the opinion yourself before relying on anything here:');
    out.push(`${c.name}${c.citation ? `, ${c.citation}` : ''}: ${courtListener(c.name)}`);
    out.push(`Written brief, training points, and knowledge check: ${caseUrl(c)}`);
    out.push(`A new case every week: ${YOUTUBE}`);
    out.push('Which case do you want broken down next? Reply and it goes on the list.');
    out.push('```', '');

    h(3, `Post schedule for Video ${vi + 1}`);
    const monday = new Date(monday0);
    monday.setUTCDate(monday.getUTCDate() + 7 * vi);
    p(`One briefing room point a day, Monday to Friday, the week the video goes live. Each post links to Video ${vi + 1} once it is live, and to the case page until then: ${caseUrl(c)}. Hashtags: #UseOfForce #CaseLaw #Corrections #Probation #LawEnforcementTraining. Platforms: LinkedIn, Facebook, Instagram, TikTok, and YouTube; X is not used.`);
    const apps = (c.applications ?? []).slice(0, 5);
    apps.forEach((a, i) => {
      const d = new Date(monday);
      d.setUTCDate(d.getUTCDate() + i);
      const title = a.title.replace(/\.$/, '');
      h(4, `${WEEKDAYS[i]} ${isoDate(d)}: ${title}`);
      out.push('LinkedIn and Facebook:', '```');
      out.push(`${title}.`, '', clean(a.body), '', `From the Sowards Briefing Room Case library: ${cite(c)}. Full brief and how to train it: ${caseUrl(c)}`, '', CTA);
      out.push('```', '');
      out.push('Instagram and TikTok caption (pair with the matching Short):', '```');
      out.push(`${title}. ${clean(firstSentence(a.body))} ${shortName(c)}, ${decidedShort(c.decided)}. ${CTA}`);
      out.push('```', '');
    });
    if ((c.applications?.length ?? 0) > 5) p(`Held for replies: ${c.applications.slice(5).map((a) => a.title).join('; ')}.`);

    if (c.quiz?.length) {
      h(3, 'Community post poll (optional, Saturday)');
      const q = c.quiz[0];
      out.push('```', q.q, ...q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`), '', `Answer in the brief: ${caseUrl(c)}`, '```', '');
      p(`Correct answer for the follow-up reply: ${String.fromCharCode(65 + q.answer)}. ${q.teach}`);
    }
  });
}

const outPath = resolve(outDir, `${name}.md`);
writeFileSync(outPath, out.join('\n') + '\n');
console.log(`${name}: kit written to content/youtube/cases/${name}.md (${cases.length} video${cases.length === 1 ? '' : 's'}${excluded.length ? `, ${excluded.length} excluded` : ''})`);
