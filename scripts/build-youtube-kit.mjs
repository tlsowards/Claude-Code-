// Builds the Sowards Briefing Room video kit for a weekly brief: one markdown file that an editor
// (a person or an AI editing tool) builds the week's individual case videos, their Shorts, and the social
// posts from. The channel posts one video per marquee decision (or per issue, when a brief groups cases in
// youtube.videos); the long weekly episode stays on the app and the podcast. Every sentence in the kit comes from the brief JSON, so nothing about a case is invented
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
import { loadUsedShorts, angles, planShorts, shortsNote, withoutDisposition } from './lib/shorts-registry.mjs';
import { firstSentence, sentences } from './lib/case-text.mjs';

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
const COMMENT_ASK = 'Would your agency train this? Tell me in the comments.';
const COMMENT_ASK_AUDIO = 'https://sowardsconsulting.com/wp-content/uploads/2026/11/sowards-briefing-room-comment-ask.mp3';
const SUBSCRIBE_ASK_AUDIO = { long: 'https://sowardsconsulting.com/wp-content/uploads/2026/11/sowards-briefing-room-subscribe-ask-long.mp3', short: 'https://sowardsconsulting.com/wp-content/uploads/2026/11/sowards-briefing-room-subscribe-ask-short.mp3' };

const CTA = `Follow for weekly use-of-force case law, and get the full teaching brief at ${APP.replace(/^https?:\/\//, '')}.`;
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
  // The internal caution text is screened too: a guardrail term that appears only there still keeps the case out of the kit.
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

/** Short citation without any parenthetical. */
function shortName(c) {
  return c.name.replace(/\s*\(.*$/, '');
}
function courtShort(c) {
  return c.court.split(' (')[0];
}
function cite(c) {
  return `${c.name}, ${courtShort(c)}, ${c.decided}`;
}

/**
 * Which videos to make this week. A brief may name them in youtube.videos: [{ cases: [ids], titles, thumbnail, hook }].
 * Otherwise every published appellate or Supreme Court decision gets its own video, and unpublished or
 * order-only decisions become Shorts only. The long weekly episode stays on the app and the podcast; it is
 * not posted to the channel.
 */
function planVideos(brief, cases) {
  const byId = Object.fromEntries(cases.map((c) => [c.id, c]));
  const planned = (brief.youtube?.videos ?? [])
    .map((v) => ({ ...v, cases: (v.cases ?? []).map((id) => byId[id]).filter(Boolean) }))
    .filter((v) => v.cases.length > 0);
  if (planned.length) {
    const used = new Set(planned.flatMap((v) => v.cases.map((c) => c.id)));
    return { videos: planned, shortsOnly: cases.filter((c) => !used.has(c.id)) };
  }
  const videos = cases.filter((c) => c.status === 'published').map((c) => ({ cases: [c] }));
  const used = new Set(videos.flatMap((v) => v.cases.map((c) => c.id)));
  return { videos, shortsOnly: cases.filter((c) => !used.has(c.id)) };
}

function buildKit(brief, usedShorts) {
  const yt = brief.youtube ?? {};
  const episode = episodeFor(brief);
  const allCases = brief.sections.flatMap((s) => s.cases.map((c) => ({ ...c, section: s.heading })));
  const excluded = [];
  const cases = allCases.filter((c) => {
    const hits = guardHits(c);
    if (hits.length) excluded.push({ name: c.name, hits });
    return hits.length === 0;
  });
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
  p('The channel posts individual case videos, not the whole weekly brief. The weekly episode stays on the app and the podcast. Each video below covers one decision, or two or three decisions on the same issue, and comes with its own Shorts. The audio for each video is cut from the weekly narration: every case segment is contiguous and runs from the spoken case name through "How to train it."');

  h(2, 'Instructions for the editor');
  li([
    'Use only the words in this file and in the narration script. Do not add facts, quotes, outcomes, dollar figures, names, or dates from any other source. If something is missing, leave it out.',
    'Keep every case name, court, date, and docket exactly as written here. The written spelling is "Sowards"; the audio pronunciation file is for the voice engine only.',
    'Visuals: brand slides (navy #1B2A4E, red #CF2E2E, gold #C9A24B, Inter and Montserrat), highlighted lines of the opinion text, a facts timeline, a circuit map, and the training photos in public/images/training. Steady, slow-moving b-roll only. Body camera or courtroom footage only if it is public record or a court exhibit, non-graphic, with no identifiable juveniles, and obtained through a formal records request. No AI avatar or synthetic host anywhere in the video.',
    'Thumbnail: follow the thumbnail section of each video. No generated or avatar face, ever. A real photograph of Dr. Sowards appears only as a tested variant on staff-side corrections videos.',
  `Opening question and comment ask (Dr. Sowards, November 23, 2026): every video and every Short opens with its question on screen in the first two seconds, over the brand slate, before the first spoken words. Every close carries the comment ask "${COMMENT_ASK}" spoken in Dr. Sowards' voice (${COMMENT_ASK_AUDIO}, 3 seconds) and on screen, followed by the subscribe ask (short line ${SUBSCRIBE_ASK_AUDIO.short}, long line ${SUBSCRIBE_ASK_AUDIO.long}) under the animated Subscribe or Follow button. These are inserts at natural pauses; the narration audio stays as delivered.`,
    'Timestamps: each chapter list gives the first words of the segment. Place each chapter marker where those words are spoken, and list every chapter in the description starting at 0:00.',
    'Posts: the schedule below is the copy. Formatting, hashtags beyond the ones listed, and scheduling are yours. The substance is not. A post about a case goes out only after that case page is live on the app.',
  ]);

  if (guardTerms.length === 0) {
    p('Guardrail check: no guardrail file was found, so no cases were screened. Add content/guardrails.json before publishing.');
  } else if (excluded.length) {
    p(`Guardrail check: ${excluded.length} case${excluded.length > 1 ? 's were' : ' was'} left out of this kit because the text matched the exclusion list. The narration audio still contains ${excluded.length > 1 ? 'them' : 'it'}; do not cut a video or Short from ${excluded.length > 1 ? 'those segments' : 'that segment'}.`);
    li(excluded.map((e) => `${e.name} (matched: ${e.hits.join(', ')})`));
  } else {
    p(`Guardrail check: ${allCases.length} case${allCases.length === 1 ? '' : 's'} screened against ${guardTerms.length} exclusion term${guardTerms.length === 1 ? '' : 's'}, none matched.`);
  }

  if (cases.length === 0) {
    p('No cases remain after the guardrail check. This week has no video.');
    return out.join('\n');
  }

  const { videos, shortsOnly } = planVideos(brief, cases);
  h(2, `This week: ${videos.length} video${videos.length === 1 ? '' : 's'}${shortsOnly.length ? ` and ${shortsOnly.length} Shorts-only case${shortsOnly.length === 1 ? '' : 's'}` : ''}`);
  li([
    ...videos.map((v, i) => `Video ${i + 1}: ${v.cases.map(shortName).join(' and ')}`),
    ...shortsOnly.map((c) => `Shorts only (no long video): ${shortName(c)}, ${statusLabel[c.status] ?? c.status}`),
  ]);

  // Two Shorts per case, each on a distinct angle. The no-repeat check drops any angle that shares a
  // sentence with a Short already written for this case in an earlier kit (weekly or Case library).
  const shortsFor = (c, label) => {
    const pool = [
      ['What this means in practice', c.inPractice],
      ['How to train it', c.trainIt],
      ['Holding', withoutDisposition(c.holding)],
      ['Dissent', c.dissent],
      ['What was not decided', c.notDecided],
    ];
    const plan = planShorts({ used: usedShorts, caseName: shortName(c), candidates: angles(pool, { sentences, name: shortName(c) }), want: 2 });
    const items = plan.shorts.map((s) => [
      `Question (on screen, first two seconds): ${s.question}`,
      `Hook (on screen and spoken): ${s.hook}`,
      `Body: ${s.body}`,
      `Card: ${cite(c)}`,
      `Close (spoken and on screen): "${COMMENT_ASK}" then "Subscribe and follow for a new case every week." Full brief and training points in the Sowards Briefing Room, link in bio.`,
      `Cut from: ${s.cut} of ${label}, or re-record from this text in the same voice.`,
    ]);
    return { items, note: shortsNote(plan, shortName(c)) };
  };

  videos.forEach((v, vi) => {
    const lead = v.cases[0];
    const multi = v.cases.length > 1;
    h(2, `Video ${vi + 1}: ${v.cases.map(shortName).join(' and ')}`);
    p(`${multi ? 'Decisions' : 'Decision'}: ${v.cases.map((c) => `${cite(c)} (${statusLabel[c.status] ?? c.status})`).join('; ')}. Audio: cut the ${multi ? 'segments' : 'segment'} for ${v.cases.map((c) => `"${shortName(c)}"`).join(' and ')} from the weekly narration, in that order, ${multi ? 'joined back to back' : 'as one piece'}. Open with the brand slate and close with the end screen.`);

    h(3, 'Opening question (on screen, first two seconds)');
    p(v.question ?? (multi ? `What did ${v.cases.map(shortName).join(' and ')} decide, and what changes on your next shift?` : `What did ${shortName(lead)} decide, and what does it change on your next shift?`));

    h(3, 'Title options');
    // A video's own titles win; the brief's top-level titles still apply to the first video for briefs written before videos were listed.
    const titles = v.titles?.length
      ? v.titles
      : vi === 0 && yt.titles?.length
      ? yt.titles
      : [
          `${shortName(lead)}: ${lead.topic}`,
          `${firstSentence(lead.inPractice)}`,
          `${lead.applications?.[0]?.title ?? shortName(lead)}. ${courtShort(lead)}, ${lead.decided}.`,
        ];
    out.push(...titles.map((t, i) => `${i + 1}. ${t}`), '');
    p('Pick one. Titles stay under 70 characters where possible; the full case names go in the description, not the title.');

    h(3, 'Thumbnail');
    const thumb = v.thumbnail ?? (vi === 0 ? yt.thumbnail : undefined) ?? {};
    li([
      `Text: ${thumb.text ?? clip(shortName(lead), 40).toUpperCase()}${thumb.redWord ? ` (red word: ${thumb.redWord})` : ''}`,
      `Visual: ${thumb.visual ?? 'one element only: a highlighted line of the opinion or a single still from the facts'}`,
      'Standard (approved by Dr. Sowards, November 18, 2026). Variant A is the default: a darkened opinion page fills the frame, one sentence quoted exactly from the opinion outlined in a thin gold stroke, the headline in white heavy condensed type on a navy band, one red word, and the gold series badge bottom right at the same size and position every time.',
      'Keep testing Variant B: type only, the headline plus a single icon on a plain field, no photo. Hold the title fixed and change only the thumbnail.',
      'For a short, well-known case name (Graham, Barnes, Torres), try the case-name variant: CASE v. NAME in very large type plus the one-line holding. For a long case name, use the holding as the headline instead.',
      'Headlines are two to five words, high contrast, one accent color. Red only as an accent.',
      'Never: a face (real, generated, or cartoon), red arrows, outrage words such as DESTROYS, SLAPS DOWN, or BACKFIRES, or any claim the video does not deliver.',
    ]);

    h(3, 'Description');
    const desc = [];
    if (v.hook) desc.push(v.hook, '');
    for (const c of v.cases) {
      desc.push(`${cite(c)} (${statusLabel[c.status] ?? c.status}). ${firstSentence(c.facts)} ${firstSentence(c.holding)}`);
      desc.push(`Written brief and training points: ${caseUrl(c)}`, '');
    }
    desc.push(`The full written brief for the week, the printable roll call version, and the knowledge check are in the Sowards Briefing Room: ${briefUrl}`);
    desc.push(`Start your free 30 days: ${SUBSCRIBE}`);
    desc.push(`STC-certified courses for agencies: ${SITE}/courses/`);
    desc.push(`Subscribe for a new case every week: ${YOUTUBE}`);
    desc.push('', 'Chapters', '0:00 Open', '(fill the remaining chapter times from the chapter list below)', '', DISCLAIMER, '');
    desc.push(`Dr. Timothy Sowards, PhD, has trained peace officers for over 25 years and is a POST-certified and BSCC STC-certified instructor. Sowards Consulting LLC, Rancho Cordova, California. ${SITE}`);
    out.push('```', ...desc, '```', '');

    h(3, 'Chapters (first words of each segment, for timestamps)');
    const chapters = [['Open', 'Brand slate (no narration)']];
    for (const c of v.cases) {
      chapters.push([`${shortName(c)}`, `${shortName(c).replace(/ v\. /, ' versus ')}.`]);
      chapters.push([`${shortName(c)}: facts`, 'Here are the facts.']);
      chapters.push([`${shortName(c)}: holding`, 'The holding.']);
      if (c.dissent) chapters.push([`${shortName(c)}: dissent`, 'On the dissent.']);
      if (c.notDecided) chapters.push([`${shortName(c)}: not decided`, 'What was not decided.']);
      chapters.push([`${shortName(c)}: in practice`, 'What this means in practice.']);
      chapters.push([`${shortName(c)}: train it`, 'How to train it.']);
    }
    chapters.push(['Close', 'End screen (no narration)']);
    out.push('| Chapter | Starts at the words |', '|---|---|', ...chapters.map(([a, b]) => `| ${a} | "${b}" |`), '');

    h(3, 'Shot list');
    out.push('| Segment | On-screen text | Visual |', '|---|---|---|');
    out.push(`| Open | ${CHANNEL} / ${v.cases.map(shortName).join(' and ')} / ${lead.decided} | Brand open, channel mark |`);
    for (const c of v.cases) {
      out.push(`| ${shortName(c)} title card | ${c.name} / ${courtShort(c)} / ${c.decided} / ${statusLabel[c.status] ?? c.status} | Opinion first page or caption, docket ${c.docket ?? 'n/a'} |`);
      out.push(`| ${shortName(c)} facts | Facts | Timeline built from the facts paragraph; map if a place is named |`);
      out.push(`| ${shortName(c)} holding | Holding | Highlighted opinion text |`);
      if (c.dissent) out.push(`| ${shortName(c)} dissent | Dissent | Highlighted opinion text, second color |`);
      if (c.notDecided) out.push(`| ${shortName(c)} not decided | What was not decided | Brand slide |`);
      out.push(`| ${shortName(c)} in practice | In practice: ${settingsText(c)} | Training photo or brand slide |`);
      out.push(`| ${shortName(c)} train it | Train it | Numbered points pulled from the train-it paragraph |`);
    }
    out.push(`| Close | "${COMMENT_ASK}" / Sowards Briefing Room / Free 30 days / ${SUBSCRIBE.replace('https://', '')} | Comment ask spoken (${COMMENT_ASK_AUDIO}) and on screen, then the long subscribe ask, over the end screen with empty zones for subscribe and watch-next |`, '');

    h(3, 'Shorts for this video (vertical, under 60 seconds each)');
    let n = 0;
    for (const c of v.cases) {
      const { items: list, note } = shortsFor(c, `Video ${vi + 1}`);
      note.forEach((line) => p(line));
      for (const items of list) {
        n += 1;
        h(4, `Short ${vi + 1}.${n}: ${shortName(c)}`);
        li(items);
      }
    }

    h(3, 'Pinned comment');
    out.push('```');
    out.push('Read the opinion yourself before relying on anything here:');
    for (const c of v.cases) out.push(`${c.name}: ${courtListener(c.name)}`);
    out.push(`Written brief, roll call print, and knowledge check: ${briefUrl}`);
    out.push(`A new case every week: ${YOUTUBE}`);
    out.push('Which case do you want broken down next? Reply and it goes on the list.');
    out.push('```', '');
  });

  if (shortsOnly.length) {
    h(2, 'Shorts-only cases');
    p('These decisions are unpublished or are orders rather than opinions, so they get Shorts and a post but no long video. Cut from the weekly narration segment for the case.');
    shortsOnly.forEach((c, i) => {
      const { items: list, note } = shortsFor(c, 'the weekly narration');
      note.forEach((line) => p(line));
      for (const [k, items] of list.entries()) {
        h(4, `Short S${i + 1}.${k + 1}: ${shortName(c)}`);
        li(items);
      }
    });
  }

  // Social schedule
  h(2, 'Post schedule');
  p(`One briefing room point a day, ${WEEKDAYS[0]} to ${WEEKDAYS[4]}, starting the Monday after the brief. Each post links to the video for its case once that video is live, and to the case page until then. Hashtags: #UseOfForce #CaseLaw #Corrections #Probation #LawEnforcementTraining. Platforms: LinkedIn, Facebook, Instagram, TikTok, and YouTube; X is not used.`);
  const monday = nextMonday(brief.coverageEnd);
  const apps = (brief.applications ?? []).slice(0, 5);
  const fallbackApps = cases.map((c) => ({ title: c.name, body: `${firstSentence(c.inPractice)} ${firstSentence(c.trainIt)}`, caseId: c.id }));
  const schedule = apps.length ? apps : fallbackApps;
  const GENERIC = new Set(['People', 'United States', 'City', 'County', 'State', 'Estate']);
  const parties = (c) => shortName(c).split(/ v\. /).map((x) => x.trim()).filter((x) => x && !GENERIC.has(x));
  const word = (x) => new RegExp(`\\b${x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
  const videoFor = (c) => videos.findIndex((v) => v.cases.some((x) => x.id === c.id));
  schedule.forEach((a, i) => {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() + i);
    const named = cases.filter((c) => a.body.includes(c.name) || parties(c).some((x) => word(x).test(a.body)));
    const explicit = cases.find((c) => c.id === a.caseId);
    const relatedCases = explicit ? [explicit] : named.length ? named : [cases[0]];
    const primary = relatedCases[0];
    const vIdx = videoFor(primary);
    const link = caseUrl(primary);
    const shortCites = relatedCases.map((c) => `${shortName(c)}, ${c.decided}`).join('; ');
    h(3, `${WEEKDAYS[i]} ${isoDate(d)}: ${a.title}`);
    p(`Links to: ${vIdx >= 0 ? `Video ${vIdx + 1} once live, otherwise ` : ''}${link}`);
    out.push('LinkedIn and Facebook:', '```');
    out.push(`${a.title}.`, '', a.body, '', `From this week's Use of Force Case Law Update: ${relatedCases.map(cite).join('; ')}. Full brief and how to train it: ${link}`, '', CTA);
    out.push('```', '');
    out.push('Instagram and TikTok caption (pair with the matching Short):', '```');
    out.push(`${a.title}. ${firstSentence(a.body)} ${shortCites}. ${CTA}`);
    out.push('```', '');
  });
  if (brief.applications?.length > 5) {
    p(`Carried to the following week or used as a reply: ${brief.applications.slice(5).map((a) => a.title).join('; ')}.`);
  }

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
  const out = resolve(outDir, f.replace('.json', '.md'));
  // Shorts already written in every other kit, so this kit never repeats one (see scripts/lib/shorts-registry.mjs).
  const kit = buildKit(brief, loadUsedShorts(root, out));
  writeFileSync(out, kit + '\n');
  console.log(`${brief.id}: kit written to content/youtube/${f.replace('.json', '.md')}`);
}
