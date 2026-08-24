/**
 * The generated web-app page: that it is standards-mode, that the submit block
 * validates before sending, and that the payload it would post to Apps Script carries
 * what the server needs.
 *
 *   node tests/webpage.test.mjs
 */
import { chromium } from 'playwright';

// Paths are resolved from the repository root so the suite runs from anywhere.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = (p) => join(ROOT, p);
const fileUrl = (p) => pathToFileURL(join(ROOT, p)).href;

const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1000,height:900}})).newPage();
const fails=[];
function eq(l,g,w){const ok=String(g)===String(w); if(!ok)fails.push(l); console.log(`${ok?'PASS':'FAIL'}  ${l} = ${g}${ok?'':`  (want ${w})`}`);}
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
// Blocked font requests are the network's problem, not the page's.
p.on('console', m => { if (m.type()==='error' && !/Failed to load resource|ERR_(CONNECTION|NAME|INTERNET|BLOCKED|NETWORK)|net::/i.test(m.text())) errs.push('console: '+m.text()); });

// stub the Apps Script bridge and capture what the page would send
await p.addInitScript(() => {
  window.__sent = null;
  window.google = { script: { run: {
    withSuccessHandler(f){ this._s=f; return this; },
    withFailureHandler(f){ this._f=f; return this; },
    submitClaim(p){ window.__sent = p; this._s({ok:true, due:'$731.68', copiedTo:'d@example.org'}); }
  }}};
});
await p.goto(fileUrl('google-form/Index.html'));
await p.waitForTimeout(400);

eq('doctype present (standards mode)', await p.evaluate(()=>document.compatMode), 'CSS1Compat');
eq('submit block rendered', await p.locator('#submitBlock').isVisible(), true);
eq('calculator still live', await p.locator('#miles-body tr').count() > 0, true);

// submitting empty must explain what is missing, not fail silently
await p.click('#send'); await p.waitForTimeout(150);
eq('empty submit is blocked', await p.locator('#sendErr').isHidden(), false);
eq('names what is missing', (await p.textContent('#sendErr')).includes('your name'), true);
eq('nothing was sent', await p.evaluate(()=>window.__sent), null);

// fill a real claim
await p.fill('#name','Dana Whitfield'); await p.fill('#role','Treasurer');
await p.fill('#email','dana.whitfield@example.org'); await p.fill('#purpose','Q3 Board');
await p.fill('#dest','Sacramento, CA');
await p.fill('#depart','2026-09-14'); await p.fill('#ret','2026-09-16');
await p.fill('#nights','2'); await p.fill('#rate','129'); await p.fill('#tax','41.28');
const leg = p.locator('#miles-body tr').first();
await leg.locator('.m-date').fill('2026-09-14'); await leg.locator('.m-mi').fill('240');
await p.fill('#parking','24');
await p.locator('#diem-body tr').nth(1).locator('input[data-meal="l"]').check();
const other = p.locator('#other-body tr').first();
await other.locator('.o-desc').fill('Conference registration'); await other.locator('.o-amt').fill('275');
await p.fill('#advance','200');
await p.waitForTimeout(200);
eq('live total on the page', await p.textContent('#s-total'), '$731.68');

await p.check('#certify');
await p.click('#send'); await p.waitForTimeout(250);
const sent = await p.evaluate(()=>window.__sent);
eq('payload sent', !!sent, true);
eq('one mileage leg captured', sent.legs.length, 1);
eq('provided lunch counted', sent.provided.lunches, 1);
eq('other row captured', sent.other[0].amt, '275');
eq('certification captured', sent.certified, true);
eq('blank rows not sent', sent.other.length, 1);
eq('success message shown', await p.locator('#sendOk').isHidden(), false);
eq('no page errors', errs.join('|')||'none', 'none');

await b.close();
console.log(fails.length?`\n${fails.length} FAILURE(S)`:'\nALL PASS — web page');
process.exit(fails.length?1:0);
