// Renders a narration script (content/narration/<id>.txt) to an MP3 with ElevenLabs text to speech,
// in a cloned voice. Usage:
//   ELEVENLABS_API_KEY=... node scripts/make-audio-elevenlabs.mjs <brief id> --voice <voice id> [--model eleven_v4] [--out dir]
// The text is split at paragraph boundaries into requests under 9,000 characters. Each request carries
// the neighbouring text so the voice stays consistent across the joins, then ffmpeg concatenates the
// parts and writes ID3 tags. The streaming endpoint is used so long chunks start returning audio
// at once instead of making a proxy wait minutes for the first byte. Requires ffmpeg on the PATH. The key may be a placeholder when a proxy
// injects the real one.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadNarration, chunkText } from './lib/narration.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const voice = opt('voice', process.env.ELEVENLABS_VOICE_ID);
const model = opt('model', 'eleven_v4');
const outDir = resolve(opt('out', resolve(root, 'audio-out')));
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!id || !voice || !apiKey) {
  console.error('Usage: ELEVENLABS_API_KEY=... node scripts/make-audio-elevenlabs.mjs <brief id> --voice <voice id> [--model eleven_v4] [--out dir]');
  process.exit(1);
}

const { brief, text } = loadNarration(root, id);
const chunks = chunkText(text, 9000);

const work = resolve(outDir, `${id}-elevenlabs`);
mkdirSync(work, { recursive: true });
console.log(`${id}: ${text.length} characters in ${chunks.length} chunks, voice ${voice}, model ${model}`);
const parts = [];
for (let i = 0; i < chunks.length; i++) {
  const file = resolve(work, `part-${String(i + 1).padStart(2, '0')}.mp3`);
  parts.push(file);
  if (existsSync(file)) { console.log(`  part ${i + 1}: cached`); continue; }
  const body = {
    text: chunks[i],
    model_id: model,
    previous_text: i > 0 ? chunks[i - 1].slice(-600) : undefined,
    next_text: i < chunks.length - 1 ? chunks[i + 1].slice(0, 600) : undefined,
    voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true },
  };
  let r;
  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      r = undefined;
      console.error(`  part ${i + 1}: network error ${err.message}`);
    }
    if (r?.ok) break;
    if (r) {
      const msg = await r.text();
      console.error(`  part ${i + 1}: HTTP ${r.status} ${msg.slice(0, 300)}`);
      if (r.status < 500 && r.status !== 429) process.exit(1);
    }
    if (attempt < attempts) await new Promise((res) => setTimeout(res, 5000 * attempt));
  }
  if (!r?.ok) process.exit(1);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  console.log(`  part ${i + 1}: ${chunks[i].length} chars rendered`);
}

const list = resolve(work, 'parts.txt');
writeFileSync(list, parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
const out = resolve(outDir, `${brief.date}-use-of-force-case-law-update-tim.mp3`);
const title = `Use of Force Case Law Update: ${brief.title}`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy',
  '-metadata', `title=${title}`, '-metadata', 'artist=Dr. Timothy Sowards, Sowards Consulting', '-metadata', 'album=Use of Force Case Law Update',
  '-metadata', `date=${brief.date.slice(0, 4)}`, '-metadata', 'genre=Podcast', '-id3v2_version', '3', out]);
const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim();
console.log(`Wrote ${out} (${Math.round(Number(dur) / 60)} min ${Math.round(Number(dur) % 60)} s)`);
