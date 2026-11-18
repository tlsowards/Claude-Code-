// The Case library's section labels, read from the app's own definition (src/data/caseCategories.ts) so the
// scripts and the app never drift. The parse is deliberately narrow: each entry's id and label.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/data/caseCategories.ts');
const text = readFileSync(source, 'utf8');
const entries = [...text.matchAll(/id:\s*'([a-z-]+)'[\s\S]*?label:\s*'([^']+)'/g)].map((m) => [m[1], m[2]]);
if (entries.length === 0) throw new Error(`No categories parsed from ${source}`);

export const categoryLabel = Object.fromEntries(entries);

/** Label for a category id; warns on stderr and returns the raw id when the app does not define it. */
export function labelFor(id) {
  if (!(id in categoryLabel)) {
    console.error(`Warning: category "${id}" is not defined in src/data/caseCategories.ts`);
    return id;
  }
  return categoryLabel[id];
}
