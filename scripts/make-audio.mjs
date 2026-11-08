// Renders a narration script (content/narration/<id>.txt) to an MP3 with OpenAI text to speech.
// Usage: OPENAI_API_KEY=... node scripts/make-audio.mjs <brief id> [--voice onyx] [--out dir]
// The text is split at paragraph boundaries into requests under 4,000 characters, each chunk is
// rendered, and ffmpeg joins the chunks and writes ID3 tags. Requires ffmpeg on the PATH.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadNarration, chunkText } from './lib/narration.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) {
  console.error('Usage: node scripts/make-audio.mjs <brief id> [--voice onyx] [--out dir]');
  process.exit(1);
}
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const voice = opt('voice', 'onyx');
const outDir = resolve(opt('out', resolve(root, 'audio-out')));
const model = opt('model', 'gpt-4o-mini-tts');
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Set OPENAI_API_KEY (or a placeholder when a proxy injects the real key).');
  process.exit(1);
}

const { brief, text } = loadNarration(root, id);
const chunks = chunkText(text, 3800);

const instructions =
  'You are a calm, authoritative law enforcement training instructor reading a weekly case law update to officers, supervisors, and trainers. Measured pace, clear articulation, serious but conversational, no dramatization. Read case names and numbers slowly and clearly. Pause briefly at section changes.';

const work = resolve(outDir, id);
mkdirSync(work, { recursive: true });
console.log(`${id}: ${text.length} characters in ${chunks.length} chunks, voice ${voice}, model ${model}`);
const parts = [];
for (let i = 0; i < chunks.length; i++) {
  const file = resolve(work, `part-${String(i + 1).padStart(2, '0')}.mp3`);
  parts.push(file);
  if (existsSync(file)) { console.log(`  part ${i + 1}: cached`); continue; }
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, voice, input: chunks[i], instructions, response_format: 'mp3' }),
  });
  if (!r.ok) {
    console.error(`  part ${i + 1}: HTTP ${r.status} ${await r.text()}`);
    process.exit(1);
  }
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  console.log(`  part ${i + 1}: ${chunks[i].length} chars rendered`);
}

const list = resolve(work, 'parts.txt');
writeFileSync(list, parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
const out = resolve(outDir, `${brief.date}-use-of-force-case-law-update.mp3`);
const title = `Use of Force Case Law Update: ${brief.title}`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy',
  '-metadata', `title=${title}`, '-metadata', 'artist=Sowards Consulting', '-metadata', 'album=Use of Force Case Law Update',
  '-metadata', `date=${brief.date.slice(0, 4)}`, '-metadata', 'genre=Podcast', '-id3v2_version', '3', out]);
const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
console.log(`Wrote ${out} (${Math.floor(Number(dur) / 60)} min ${Math.round(Number(dur) % 60)} s)`);
