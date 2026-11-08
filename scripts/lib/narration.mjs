// Shared text preparation for the audio renderers: load the brief and its narration script, apply
// the spoken spellings from content/pronunciations.json, and split the text into request-sized chunks
// at paragraph boundaries (falling back to sentence boundaries for an oversized paragraph).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function loadNarration(root, id) {
  const brief = JSON.parse(readFileSync(resolve(root, 'content/briefs', `${id}.json`), 'utf8'));
  const pronunciations = JSON.parse(readFileSync(resolve(root, 'content/pronunciations.json'), 'utf8'));
  let text = readFileSync(resolve(root, 'content/narration', `${id}.txt`), 'utf8').trim();
  for (const [written, spoken] of Object.entries(pronunciations)) {
    if (written.startsWith('_')) continue;
    text = text.replace(new RegExp(`\\b${escapeRegExp(written)}\\b`, 'g'), spoken);
  }
  return { brief, text };
}

export function chunkText(text, limit) {
  const chunks = [];
  let cur = '';
  for (const p of text.split(/\n\s*\n/)) {
    if (p.length > limit) {
      for (const sentence of p.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [p]) {
        if ((cur + ' ' + sentence).length > limit) { chunks.push(cur.trim()); cur = sentence; } else cur += ' ' + sentence;
      }
      continue;
    }
    if ((cur + '\n\n' + p).length > limit) { chunks.push(cur.trim()); cur = p; } else cur = cur ? cur + '\n\n' + p : p;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}
