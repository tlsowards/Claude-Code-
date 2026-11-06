// GitHub Pages and most static hosts serve 404.html for unknown paths.
// Copying index.html there makes deep links like /briefs/2026-w44 load the app.
import { copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'));
console.log('Wrote dist/404.html');
