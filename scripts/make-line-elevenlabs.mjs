// Render one short reusable line in Dr. Sowards' voice (a subscribe ask, a comment ask) with the same
// voice settings as the narrations, so it can be dropped into any video or Short.
//   ELEVENLABS_API_KEY=... node scripts/make-line-elevenlabs.mjs <slug> "<text>" --voice <voice id> [--model eleven_v4] [--out dir]
// Writes audio-out/<slug>.mp3. Spell "Souwards" in the text if the name is spoken; the file name and kits use "Sowards".
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !['--voice', '--model', '--out'].includes(args[i - 1]));
const [slug, text] = positional;
const voice = opt('voice', process.env.ELEVENLABS_VOICE_ID);
const model = opt('model', 'eleven_v4');
const outDir = resolve(opt('out', resolve(root, 'audio-out')));
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!slug || !text || !voice || !apiKey) {
  console.error('Usage: ELEVENLABS_API_KEY=... node scripts/make-line-elevenlabs.mjs <slug> "<text>" --voice <voice id> [--model eleven_v4] [--out dir]');
  process.exit(1);
}
const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`, {
  method: 'POST',
  headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
  body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0, use_speaker_boost: true } }),
});
if (!r.ok) {
  console.error(`ElevenLabs ${r.status}: ${await r.text()}`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
const file = resolve(outDir, `${slug}.mp3`);
writeFileSync(file, Buffer.from(await r.arrayBuffer()));
console.log(`${slug}: ${text.length} characters, written to ${file}`);
