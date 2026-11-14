// Builds the Sowards Briefing Room video kit for a weekly brief: one markdown file that an editor
// (a person or an AI editing tool) builds the YouTube video, the Shorts, and the week's social posts
// from. Every sentence in the kit comes from the brief JSON, so nothing about a case is invented
// downstream. Writes content/youtube/<id>.md.
//
// Usage: node scripts/build-youtube-kit.mjs 2026-w45 [more ids...]   (no ids = all briefs)
//
// Guardrails: content/guardrails.json lists agencies and terms the channel does not discuss. An
// optional content/guardrails.private.json (git-ignored) holds the matters that must not appear in
// the repository, in the same shape. A case that matches either list is left out of the kit and the
// kit says so, because the narration audio for the week still contains it and needs a re-cut.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const briefDir = resolve(root, 'content/briefs');
const outDir = resolve(root, 'content/youtube');
mkdirSync(outDir, { recursive: true });

const APP = 'https://app.sowardsconsulting.com';
const SITE = 'https://sowardsconsulting.com';
const SUBSCRIBE = `${SITE}/membership/sowards-briefing-room/`;
const CHANNEL = 'Sowards Briefing Room';
const YOUTUBE = 'https://www.youtube.com/@SowardsConsulting';
const HANDOFF = 'Dropbox: /Claude handoff to Grok';
const DISCLAIMER =
  'Educational material only. It is not legal advice and does not replace agency policy or counsel. Read the full opinion before relying on any case, and confirm unpublished decisions with counsel before citing them.';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
function range(a, b) {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  if (ya !== yb) return `${MONTHS[ma - 1]} ${da}, ${ya} to ${MONTHS[mb - 1]} ${db}, ${yb}`;
  return ma === mb ? `${MONTHS[ma - 1]} ${da} to ${db}, ${yb}` : `${MONTHS[ma - 1]} ${da} to ${MONTHS[mb - 1]} ${db}, ${yb}`;
}
/** The Monday after the brief's coverage window, as an ISO date, for the post schedule. */
function nextMonday(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  const add = ((8 - d.getUTCDay()) % 7) || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d;
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function firstSentence(s) {
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : s).trim();
}
function sentences(s) {
  return s.match(/[^.!?]+[.!?]+(?=\s|$)/g)?.map((x) => x.trim()) ?? [s];
}
function clip(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)) + '…';
}
const statusLabel = {
  published: 'published',
  unpublished: 'unpublished, not binding precedent',
  order: 'order, not a full opinion',
  'cert-denied': 'review denied by the Supreme Court, not a ruling on the merits',
  'summary-order': 'summary order, not precedential',
  unknown: 'publication status not confirmed',
};
const settingLabel = { field: 'field', custody: 'custody', juvenile: 'juvenile', supervisors: 'supervisors', all: 'all settings' };

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
/** Returns the guardrail terms that appear anywhere in the case text, case-insensitively. */
function guardHits(c) {
  const hay = [c.name, c.court, c.docket, c.topic, c.facts, c.holding, c.dissent, c.notDecided, c.inPractice, c.trainIt, c.caution]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
  return guardTerms.filter((t) => hay.includes(t.toLowerCase()));
}

// ---- Kit ------------------------------------------------------------------------------------------
const episodes = existsSync(resolve(root, 'content/episodes.json')) ? JSON.parse(readFileSync(resolve(root, 'content/episodes.json'), 'utf8')) : [];
/** The newest episode for a brief, so a re-recorded episode wins over the original. */
function episodeFor(brief) {
  return episodes
    .filter((e) => brief.episodeIds?.includes(e.id) || e.briefId === brief.id)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
}

function buildKit(brief) {
  const yt = brief.youtube ?? {};
  const episode = episodeFor(brief);
  const allCases = brief.sections.flatMap((s) => s.cases.map((c) => ({ ...c, section: s.heading })));
  const excluded = [];
  const cases = allCases.filter((c) => {
    const hits = guardHits(c);
    if (hits.length) excluded.push({ name: c.name, hits });
    return hits.length === 0;
  });
  const lead = cases[0];
  const week = range(brief.coverageStart, brief.coverageEnd);
  const briefUrl = `${APP}/briefs/${brief.id}`;
  const caseUrl = (c) => `${APP}/briefs/${brief.id}/${c.id}`;
  const narrationPath = `content/narration/${brief.id}.txt`;
  const out = [];
  const h = (n, t) => out.push(`${'#'.repeat(n)} ${t}`, '');
  const p = (t) => out.push(t, '');
  const li = (items) => out.push(...items.map((x) => `- ${x}`), '');

  h(1, `${CHANNEL} video kit: ${week}`);
  p(`Brief: ${brief.id}. Published brief: ${briefUrl}. Channel: ${CHANNEL}, ${YOUTUBE}. Narration script: ${narrationPath}. Audio: ${episode ? `${episode.audioUrl} (${Math.round(episode.durationSeconds / 60)} minutes)` : `the ${brief.id} episode is not in content/episodes.json yet; render it first (see docs/CONTENT-WORKFLOW.md)`}. Hand-off copy of this kit: ${HANDOFF}.`);

  h(2, 'Instructions for the editor');
  li([
    'Use only the words in this file and in the narration script. Do not add facts, quotes, outcomes, dollar figures, names, or dates from any other source. If something is missing, leave it out.',
    'Keep every case name, court, date, and docket exactly as written here. The written spelling is "Sowards"; the audio pronunciation file is for the voice engine only.',
    'Visuals: brand slides (navy #1B2A4E, red #CF2E2E, gold #C9A24B, Inter and Montserrat), highlighted lines of the opinion text, a facts timeline, a circuit map, and the training photos in public/images/training. Body camera or courtroom footage only if it is public record or a court exhibit, non-graphic, with no identifiable juveniles, and obtained through a formal records request. No AI avatar or synthetic host anywhere in the video.',
    'Thumbnail: follow the thumbnail section below. No generated or avatar face, ever. A real photograph of Dr. Sowards appears only as a tested variant on staff-side corrections videos.',
    'Timestamps: the chapter list below gives the first words of each segment. Place each chapter marker where those words are spoken in the audio.',
    'Posts: the schedule below is the copy. Formatting, hashtags beyond the ones listed, and scheduling are yours. The substance is not.',
  ]);

  if (guardTerms.length === 0) {
    p('Guardrail check: no guardrail file was found, so no cases were screened. Add content/guardrails.json before publishing.');
  } else if (excluded.length) {
    p(`Guardrail check: ${excluded.length} case${excluded.length > 1 ? 's were' : ' was'} left out of this kit because the text matched the exclusion list. The narration audio still contains ${excluded.length > 1 ? 'them' : 'it'} and must be re-cut before the video is published.`);
    li(excluded.map((e) => `${e.name} (matched: ${e.hits.join(', ')})`));
  } else {
    p(`Guardrail check: ${allCases.length} case${allCases.length === 1 ? '' : 's'} screened against ${guardTerms.length} exclusion term${guardTerms.length === 1 ? '' : 's'}, none matched.`);
  }

  if (!lead) {
    p('No cases remain after the guardrail check. This week has no video.');
    return out.join('\n');
  }

  // Titles
  h(2, 'Title options');
  const titles = yt.titles?.length
    ? yt.titles
    : [
        brief.title,
        `${lead.name}: ${lead.topic}`,
        `${brief.applications?.[0]?.title ?? lead.name}. ${lead.court.split(' (')[0]}, ${lead.decided}.`,
      ];
  out.push(...titles.map((t, i) => `${i + 1}. ${t}`), '');
  p('Pick one. Titles stay under 70 characters where possible; the full case names go in the description, not the title.');

  // Thumbnail
  h(2, 'Thumbnail');
  const thumbText = yt.thumbnail?.text ?? clip(brief.applications?.[0]?.title ?? lead.name, 40).toUpperCase();
  li([
    `Text: ${thumbText}${yt.thumbnail?.redWord ? ` (red word: ${yt.thumbnail.redWord})` : ''}`,
    `Visual: ${yt.thumbnail?.visual ?? 'one element only: a highlighted line of the opinion, a dollar figure, or a single still from the facts'}`,
    'Formula: a darkened evidence image fills the frame (opinion page, court filing, settlement document, non-graphic footage still, or a brand slide), one focal element outlined with a thin gold stroke or a red box (no arrows), the headline in white heavy condensed type on a navy band, the channel badge in gold bottom right at the same size and position every time. No face. Red only as an accent. Nothing shown that the video does not deliver.',
    'Variants for YouTube Test and compare: A is the formula above; B is type only (headline plus a single icon, no photo); C is the pillar variant named in docs/YOUTUBE-NICHE-SCRUB.md section 11. Hold the title fixed and change only the thumbnail.',
  ]);

  // Description
  h(2, 'Description');
  const desc = [];
  desc.push(brief.summary);
  desc.push('');
  desc.push('Cases in this episode:');
  for (const c of cases) desc.push(`${c.name}, ${c.court.split(' (')[0]}, ${c.decided} (${statusLabel[c.status] ?? c.status}). Written brief and training points: ${caseUrl(c)}`);
  desc.push('');
  desc.push(`The full written brief, the printable roll call version, and the knowledge check are in the Sowards Briefing Room: ${briefUrl}`);
  desc.push(`Start your free 30 days: ${SUBSCRIBE}`);
  desc.push(`STC-certified courses for agencies: ${SITE}/courses/`);
  desc.push(`Subscribe for the update every week: ${YOUTUBE}`);
  desc.push('');
  desc.push('Chapters');
  desc.push('0:00 Open');
  desc.push('(fill the remaining chapter times from the chapter list below)');
  desc.push('');
  desc.push(DISCLAIMER);
  desc.push('');
  desc.push(`Dr. Timothy Sowards, PhD, has trained peace officers for over 25 years and is a POST-certified and BSCC STC-certified instructor. Sowards Consulting LLC, Rancho Cordova, California. ${SITE}`);
  out.push('```', ...desc, '```', '');

  // Chapters
  h(2, 'Chapters (first words of each segment, for timestamps)');
  const chapters = [['Open', 'This is the Use of Force Case Law Update from Sowards Consulting']];
  chapters.push(['The short version', 'Here is the short version.']);
  if (brief.coverage?.length) chapters.push(['Coverage note', 'A note on coverage this week.']);
  for (const s of brief.sections) chapters.push([s.heading, `Now, the ${s.heading}.`]);
  for (const c of cases) {
    chapters.push([`${c.name}: facts`, 'Here are the facts.']);
    chapters.push([`${c.name}: holding`, 'The holding.']);
    chapters.push([`${c.name}: in practice`, 'What this means in practice.']);
    chapters.push([`${c.name}: train it`, 'How to train it.']);
  }
  chapters.push(['Briefing room points', 'Now the application, the part to take into a briefing room']);
  chapters.push(['Close', 'That is the update for this week.']);
  out.push('| Chapter | Starts at the words |', '|---|---|', ...chapters.map(([a, b]) => `| ${a} | "${b}" |`), '');
  p('Case segments repeat in the order the cases appear in the narration. Where a case name appears more than once in the audio, use the first "Here are the facts" after that case name is spoken.');

  // Shot list
  h(2, 'Shot list');
  p('One row per narration segment. On-screen text is exact; visuals are suggestions within the rules above.');
  out.push('| Segment | On-screen text | Visual |', '|---|---|---|');
  out.push(`| Open | ${CHANNEL} / Use of Force Case Law Update / ${week} | Brand open, channel mark |`);
  out.push(`| Short version | ${clip(brief.title, 90)} | Brand slide, one line per case name |`);
  if (brief.coverage?.length) out.push('| Coverage note | What was checked this week | Brand slide, checklist |');
  for (const c of cases) {
    out.push(`| ${c.name} title card | ${c.name} / ${c.court.split(' (')[0]} / ${c.decided} / ${statusLabel[c.status] ?? c.status} | Opinion first page or caption, docket ${c.docket ?? 'n/a'} |`);
    if (c.caution) out.push(`| ${c.name} verification note | Verification note | Brand slide, gold rule |`);
    out.push(`| ${c.name} facts | Facts | Timeline built from the facts paragraph; map if a place is named |`);
    out.push(`| ${c.name} holding | Holding | Highlighted opinion text |`);
    if (c.dissent) out.push(`| ${c.name} dissent | Dissent | Highlighted opinion text, second color |`);
    if (c.notDecided) out.push(`| ${c.name} not decided | What was not decided | Brand slide |`);
    out.push(`| ${c.name} in practice | In practice: ${settingsText(c)} | Training photo or brand slide |`);
    out.push(`| ${c.name} train it | Train it | Numbered points pulled from the train-it paragraph |`);
  }
  (brief.applications ?? []).forEach((a, i) => out.push(`| Briefing room point ${i + 1} | ${a.title} | Brand slide, large numeral |`));
  out.push(`| Close | Sowards Briefing Room / Free 30 days / ${SUBSCRIBE.replace('https://', '')} | End screen with empty zones for subscribe and watch-next |`, '');

  // Shorts
  h(2, 'Shorts (vertical, under 60 seconds each)');
  cases.forEach((c, i) => {
    h(3, `Short ${i + 1}: ${c.name}`);
    li([
      `Hook (on screen and spoken): ${firstSentence(c.inPractice)}`,
      `Body: ${clip(sentences(c.trainIt).slice(0, 3).join(' '), 600)}`,
      `Card: ${c.name}, ${c.court.split(' (')[0]}, ${c.decided}`,
      `Close: Full brief and training points in the Sowards Briefing Room, link in bio.`,
      `Cut from: the "${c.name}: in practice" and "train it" segments of the long video, or re-record from this text in the same voice.`,
    ]);
  });
  if (brief.applications?.length) {
    h(3, `Short ${cases.length + 1}: this week's briefing room points`);
    li([
      `Hook: ${brief.applications.length} things to take into briefing this week.`,
      ...brief.applications.map((a, i) => `Point ${i + 1}: ${a.title}`),
      'Close: Full brief in the Sowards Briefing Room, link in bio.',
    ]);
  }

  // Pinned comment
  h(2, 'Pinned comment');
  out.push('```');
  out.push('Read the opinions yourself before relying on anything here:');
  for (const c of cases) out.push(`${c.name}: ${courtListener(c.name)}`);
  out.push(`Written brief, roll call print, and knowledge check: ${briefUrl}`);
  out.push(`Every week: ${YOUTUBE}`);
  out.push('Which case do you want broken down further? Reply and it goes on the list.');
  out.push('```', '');

  // Social schedule
  h(2, 'Post schedule');
  p(`One briefing room point a day, ${WEEKDAYS[0]} to ${WEEKDAYS[4]}, starting the Monday after the brief. Each post links to the video once it is live, and to the brief until then. Hashtags: #UseOfForce #CaseLaw #Corrections #Probation #LawEnforcementTraining`);
  const monday = nextMonday(brief.coverageEnd);
  const apps = (brief.applications ?? []).slice(0, 5);
  const fallbackApps = cases.map((c) => ({ title: c.name, body: `${firstSentence(c.inPractice)} ${firstSentence(c.trainIt)}` }));
  const schedule = apps.length ? apps : fallbackApps;
  schedule.forEach((a, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    // Attribute the post to the cases it discusses: an explicit caseId on the application wins; otherwise
    // every case whose full name or first party name appears in the text; otherwise the lead case.
    // Party names are matched as whole words, skipping generic parties such as "People" or "United States".
    const GENERIC = new Set(['People', 'United States', 'City', 'County', 'State', 'Estate']);
    const parties = (c) =>
      c.name
        .replace(/\s*\(.*$/, '')
        .split(/ v\. /)
        .map((x) => x.trim())
        .filter((x) => x && !GENERIC.has(x));
    const word = (x) => new RegExp(`\\b${x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    const named = cases.filter((c) => a.body.includes(c.name) || parties(c).some((x) => word(x).test(a.body)));
    const explicit = cases.find((c) => c.id === a.caseId);
    const relatedCases = explicit ? [explicit] : named.length ? named : [lead];
    const cite = (c) => `${c.name}, ${c.court.split(' (')[0]}, ${c.decided}`;
    // Short citation for captions: the case name without any parenthetical, plus the decision date.
    const shortName = (c) => c.name.replace(/\s*\(.*$/, '');
    const shortCites = relatedCases.map((c) => `${shortName(c)}, ${c.decided}`).join('; ');
    const shortNames = relatedCases.map(shortName).join('; ');
    h(3, `${WEEKDAYS[i]} ${isoDate(d)}: ${a.title}`);
    out.push('LinkedIn and Facebook:', '```');
    out.push(`${a.title}.`, '', a.body, '', `From this week's Use of Force Case Law Update: ${relatedCases.map(cite).join('; ')}. Full brief and how to train it: ${briefUrl}`);
    out.push('```', '');
    out.push('Instagram and TikTok caption (pair with the matching Short):', '```');
    out.push(`${a.title}. ${firstSentence(a.body)} ${shortCites}. Full brief in the Sowards Briefing Room, link in bio.`);
    out.push('```', '');
    out.push('X:', '```');
    out.push(clip(`${a.title}. ${firstSentence(a.body)} ${shortNames}. ${briefUrl}`, 275));
    out.push('```', '');
  });
  if (brief.applications?.length > 5) {
    p(`Carried to the following week or used as a reply: ${brief.applications.slice(5).map((a) => a.title).join('; ')}.`);
  }

  // Knowledge check as community post
  if (brief.quiz?.length) {
    h(2, 'Community post poll (optional, Saturday)');
    const q = brief.quiz[0];
    out.push('```', q.q, ...q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`), '', `Answer in the brief: ${briefUrl}`, '```', '');
    p(`Correct answer for the follow-up reply: ${String.fromCharCode(65 + q.answer)}. ${q.teach}`);
  }

  return out.join('\n');
}
function settingsText(c) {
  return (c.settings ?? []).map((s) => settingLabel[s] ?? s).join(', ') || 'all settings';
}
function courtListener(name) {
  return `https://www.courtlistener.com/?q=${encodeURIComponent(`"${name}"`)}`;
}

const ids = process.argv.slice(2);
const files = readdirSync(briefDir)
  .filter((f) => f.endsWith('.json'))
  .filter((f) => ids.length === 0 || ids.includes(f.replace('.json', '')));
if (files.length === 0) {
  console.error(`No briefs matched ${ids.join(', ')}`);
  process.exit(1);
}
for (const f of files) {
  const brief = JSON.parse(readFileSync(resolve(briefDir, f), 'utf8'));
  const kit = buildKit(brief);
  const out = resolve(outDir, f.replace('.json', '.md'));
  writeFileSync(out, kit + '\n');
  console.log(`${brief.id}: kit written to content/youtube/${f.replace('.json', '.md')}`);
}
