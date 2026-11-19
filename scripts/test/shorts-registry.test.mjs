// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadUsedShorts, angles, planShorts, shortsNote, withoutDisposition } from '../lib/shorts-registry.mjs';
import { sentences, firstSentence } from '../lib/case-text.mjs';

const shortName = (name) => name.replace(/\s*\(.*$/, '');

function kitRoot(kits) {
  const root = mkdtempSync(join(tmpdir(), 'shorts-'));
  for (const [rel, text] of Object.entries(kits)) {
    mkdirSync(join(root, rel, '..'), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}

const EARLIER = `## Video 1
#### Short 1.1: Mattos v. Agarano

- Hook (on screen and spoken): Passive resistance does not justify a Taser in dart mode.
- Body: The court weighed the minor offense against the force used. It found the balance tipped against the officers. That is the holding officers need to know.
- Card: Mattos v. Agarano
`;

test('a case with a parenthetical name is matched by the name the Short heading prints', () => {
  const root = kitRoot({ 'content/youtube/cases/kit-1.md': EARLIER });
  const used = loadUsedShorts(root);
  const name = 'Mattos v. Agarano (with Brooks v. City of Seattle)';
  const candidates = angles(
    [
      ['What this means in practice', 'Passive resistance does not justify a Taser in dart mode. The court weighed the minor offense against the force used. It found the balance tipped against the officers. That is the holding officers need to know.'],
      ['How to train it', 'Teach the resistance scale before the tool. Name the level of resistance out loud. Then name the tool that matches it. Then say why.'],
    ],
    { sentences },
  );
  const plan = planShorts({ used, caseName: shortName(name), candidates, want: 2 });
  assert.equal(plan.earlier.length, 1);
  assert.equal(plan.shorts.length, 1);
  assert.equal(plan.shorts[0].segment, 'How to train it');
  assert.equal(plan.skipped.length, 1);
  assert.equal(plan.shortfall, 1);
  assert.match(shortsNote(plan, shortName(name))[0], /1 earlier Short for Mattos v\. Agarano in content\/youtube\/cases\/kit-1\.md/);
  assert.match(shortsNote(plan, shortName(name))[1], /Only 1 distinct angle left/);
});

test('the kit being rebuilt is excluded from its own record', () => {
  const root = kitRoot({ 'content/youtube/cases/kit-1.md': EARLIER });
  const used = loadUsedShorts(root, join(root, 'content/youtube/cases/kit-1.md'));
  assert.equal(used.size, 0);
});

test('angles offer every opening first, then later windows, and never a disposition hook', () => {
  const holding = withoutDisposition('Vacated and remanded. The Court held that the Fourth Amendment governs. Reasonableness is judged on the scene. Intent does not matter. The lower court applied the wrong test. It used substantive due process. That inquiry asks about motive. Motive has no bearing here.');
  const out = angles([['Holding', holding], ['Train it', 'First, teach the test. Then run a scenario. Then make them say it. Then correct hindsight.']], { sentences });
  assert.deepEqual(out.map((a) => a.cut), ['the "Holding" segment', 'the "Train it" segment', 'later in the "Holding" segment']);
  assert.equal(out[0].hook, 'The Court held that the Fourth Amendment governs.');
  assert.equal(out[1].hook, 'Teach the test.');
  assert.equal(out[2].hook, 'It used substantive due process.');
});

test('sentence splitting keeps citations and abbreviations whole', () => {
  const text = 'Two weeks ago in Johnson v. Adgar the court held the same (490 U.S. at 395). Officers should read it. Dr. Sowards teaches it.';
  assert.equal(firstSentence(text), 'Two weeks ago in Johnson v. Adgar the court held the same (490 U.S. at 395).');
  assert.deepEqual(sentences(text), ['Two weeks ago in Johnson v. Adgar the court held the same (490 U.S. at 395).', 'Officers should read it.', 'Dr. Sowards teaches it.']);
});
