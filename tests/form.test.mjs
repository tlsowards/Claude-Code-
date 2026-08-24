/**
 * The printable form, driven in a real browser: per diem schedule, provided-meal
 * deductions, mileage rates either side of the 1 July change, the airfare cap, totals,
 * draft restore, layout at 390px, and dates in four time zones.
 *
 *   node tests/form.test.mjs
 */
import { chromium } from 'playwright';

// Paths are resolved from the repository root so the suite runs from anywhere.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = (p) => join(ROOT, p);
const fileUrl = (p) => pathToFileURL(join(ROOT, p)).href;

const FILE = fileUrl('forms/cafop-executive-reimbursement-form.html');
const b = await chromium.launch();
const fail = [];
function eq(label, got, want){ const ok = got === want; if(!ok) fail.push(`${label}: got ${got}, want ${want}`); console.log(`${ok?'PASS':'FAIL'}  ${label} = ${got}${ok?'':' (want '+want+')'}`); }

for (const scheme of ['light','dark']) {
  const ctx = await b.newContext({ colorScheme: scheme, viewport:{width:1100,height:1400} });
  const p = await ctx.newPage();
  const errs = [];
  // Script errors are the point. A blocked font request is the network's problem, not
  // the page's — the CSS carries fallbacks — and would otherwise fail this suite on any
  // machine without outbound access to Google Fonts.
  const isNetworkNoise = (t) => /Failed to load resource|ERR_(CONNECTION|NAME|INTERNET|BLOCKED|NETWORK)|net::/i.test(t);
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => {
    if (m.type() !== 'error') return;
    if (isNetworkNoise(m.text())) return;
    errs.push('console: ' + m.text());
  });
  await p.goto(FILE);
  await p.waitForTimeout(400);

  if (scheme === 'light') {
    await p.fill('#name','Dana Whitfield');
    await p.fill('#role','Treasurer');
    await p.fill('#purpose','Q3 State Board Meeting');
    await p.fill('#dest','Sacramento, CA');
    await p.fill('#depart','2026-09-14');
    await p.fill('#ret','2026-09-16');
    await p.waitForTimeout(150);
    eq('trip length', await p.textContent('#triplen'), '3 days');
    eq('email input is type=email', await p.getAttribute('#email','type'), 'email');
    eq('no date warning on a valid range', await p.locator('#dateflag').isHidden(), true);
    // reversed range must say so rather than silently building nothing
    await p.fill('#ret','2026-09-10'); await p.waitForTimeout(120);
    eq('reversed range warns', await p.locator('#dateflag').isHidden(), false);
    eq('reversed range zeroes per diem', await p.textContent('#diemsub'), '$0.00');
    await p.fill('#ret','2026-09-16'); await p.waitForTimeout(120);
    eq('warning clears', await p.locator('#dateflag').isHidden(), true);
    // single-day trip is one 75% day
    await p.fill('#ret','2026-09-14'); await p.waitForTimeout(120);
    eq('single-day trip pays 75%', await p.textContent('#diemsub'), '$51.00');
    await p.fill('#ret','2026-09-16'); await p.waitForTimeout(120);
    eq('per diem 3 days untouched', await p.textContent('#diemsub'), '$170.00');

    // tick lunch provided on the middle (full-rate) day
    await p.locator('#diem-body tr').nth(1).locator('input[data-meal="l"]').check();
    await p.waitForTimeout(120);
    eq('per diem less provided lunch', await p.textContent('#diemsub'), '$151.00');
    eq('middle day payable', await p.locator('#diem-body tr').nth(1).locator('.d-amt').textContent(), '$49.00');
    eq('first day is 75%', await p.locator('#diem-body tr').nth(0).locator('.d-amt').textContent(), '$51.00');

    // lodging over the national ceiling
    await p.fill('#nights','2'); await p.fill('#rate','129'); await p.fill('#tax','41.28');
    await p.waitForTimeout(120);
    eq('lodging subtotal at actual cost', await p.textContent('#lodgesub'), '$299.28');
    eq('no ceiling flag exists', await p.locator('#lodgeflag').count(), 0);

    // mileage: 240 mi driven in Sep 2026 -> 76 cents
    const leg = p.locator('#miles-body tr').first();
    await leg.locator('.m-date').fill('2026-09-14');
    await leg.locator('.m-mi').fill('240');
    await p.waitForTimeout(120);
    eq('rate picked from date', await leg.locator('.m-rate').textContent(), '76.0¢');
    eq('mileage amount', await leg.locator('.m-amt').textContent(), '$182.40');
    eq('airfare comparison always available', await p.locator('#compareWrap').isHidden(), false);
    eq('uncapped transport subtotal', await p.textContent('#transub'), '$182.40');

    // cheaper airfare -> reimbursement capped at constructive cost
    await p.fill('#airfare','118'); await p.fill('#airground','30');
    await p.waitForTimeout(120);
    eq('capped at the cost of flying', await p.textContent('#transub'), '$148.00');
    eq('cap is flagged', await p.locator('#mileNote').getAttribute('class'), 'note flag');

    // airfare above mileage -> full mileage payable
    await p.fill('#airfare','400');
    await p.waitForTimeout(120);
    eq('mileage cheaper, pay full', await p.textContent('#transub'), '$182.40');
    eq('cheaper-to-drive is affirmed', await p.locator('#mileNote').getAttribute('class'), 'note ok');

    // short trip: rate must not change with distance
    await leg.locator('.m-mi').fill('80');
    await p.waitForTimeout(120);
    eq('rate unchanged at short distance', await leg.locator('.m-rate').textContent(), '76.0¢');
    eq('short-trip amount', await leg.locator('.m-amt').textContent(), '$60.80');
    // no distance test: 80 miles is capped by airfare exactly like 800 would be
    await p.fill('#airfare','40'); await p.fill('#airground','0');
    await p.waitForTimeout(120);
    eq('cap applies at any distance', await p.textContent('#transub'), '$40.00');
    eq('short trip cap is flagged', await p.locator('#mileNote').getAttribute('class'), 'note flag');
    await p.fill('#airfare',''); await p.fill('#airground','');
    await p.waitForTimeout(120);
    eq('blank airfare pays full mileage', await p.textContent('#transub'), '$60.80');
    eq('uncompared reads neutral, not verified', await p.locator('#mileNote').getAttribute('class'), 'note');

    // first-half-of-2026 date drops to 72.5 cents
    await leg.locator('.m-date').fill('2026-03-02');
    await p.waitForTimeout(120);
    eq('pre-July rate', await leg.locator('.m-rate').textContent(), '72.5¢');
    eq('pre-July amount', await leg.locator('.m-amt').textContent(), '$58.00');

    await leg.locator('.m-date').fill('2026-09-14');
    await leg.locator('.m-mi').fill('240');
    await p.fill('#parking','24');
    await p.waitForTimeout(120);

    const other = p.locator('#other-body tr').first();
    await other.locator('.o-date').fill('2026-09-15');
    await other.locator('.o-desc').fill('Conference registration');
    await other.locator('.o-amt').fill('275');
    await p.fill('#advance','200');
    await p.waitForTimeout(150);
    // 299.28 lodging + (182.40 + 24) transport + 151 per diem + 275 other - 200 advance
    eq('grand total', await p.textContent('#s-total'), '$731.68');
    eq('bar mirrors total', await p.textContent('#bar-total'), '$731.68');

    // persistence
    await p.reload(); await p.waitForTimeout(400);
    eq('draft restored after reload', await p.textContent('#s-total'), '$731.68');
    eq('name restored', await p.inputValue('#name'), 'Dana Whitfield');
    eq('provided-meal restored', await p.locator('#diem-body tr').nth(1).locator('input[data-meal="l"]').isChecked(), true);

  } else {
    await p.fill('#depart','2026-09-14'); await p.fill('#ret','2026-09-16');
    await p.fill('#nights','2'); await p.fill('#rate','129');
    const leg = p.locator('#miles-body tr').first();
    await leg.locator('.m-date').fill('2026-09-14'); await leg.locator('.m-mi').fill('240');
    await p.waitForTimeout(200);
  }

  // horizontal overflow check
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  eq(`no body h-scroll (${scheme})`, overflow <= 0, true);
  eq(`no page errors (${scheme})`, errs.join('|') || 'none', 'none');
  await ctx.close();
}

// narrow viewport
const ctx = await b.newContext({ viewport:{width:390,height:900} });
const p = await ctx.newPage();
await p.goto(FILE); await p.waitForTimeout(300);
const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
eq('no h-scroll at 390px', ov <= 0, true);
await ctx.close();

// per diem dates must match what was typed, at any UTC offset
for (const tz of ['America/Los_Angeles','Asia/Tokyo','Europe/Berlin','Pacific/Auckland']) {
  const c = await b.newContext({timezoneId:tz, viewport:{width:1000,height:900}});
  const pg = await c.newPage();
  await pg.goto(FILE);
  await pg.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await pg.reload();
  await pg.fill('#depart','2026-09-14'); await pg.fill('#ret','2026-09-16');
  await pg.waitForTimeout(200);
  const isos = await pg.locator('#diem-body tr').evaluateAll(rs => rs.map(r => r.dataset.iso));
  eq(`dates unshifted in ${tz}`, isos.join(','), '2026-09-14,2026-09-15,2026-09-16');
  await c.close();
}

await b.close();
console.log(fail.length ? `\n${fail.length} FAILURE(S)` : '\nALL PASS');
process.exit(fail.length ? 1 : 0);
