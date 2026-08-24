/**
 * calculate_ in google-form/Code.gs, exercised directly: per diem, lodging, mileage,
 * the airfare cap, and every review flag.
 *
 *   node tests/appsscript.test.mjs
 */
// Prove the Apps Script math agrees with the HTML form, using the same trip.
import fs from 'fs';

// Paths are resolved from the repository root so the suite runs from anywhere.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = (p) => join(ROOT, p);
const fileUrl = (p) => pathToFileURL(join(ROOT, p)).href;

const src = fs.readFileSync(repo('google-form/Code.gs'), 'utf8');
const stub = `
const Utilities = {
  formatString: (f,n) => n.toFixed(2),
  formatDate: (d,tz,fmt) => fmt === 'yyyy-MM-dd'
    ? d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
    : d.toDateString()
};
const Session = { getScriptTimeZone: () => 'America/Los_Angeles' };
`;
const mod = new Function(stub + src + '; return {calculate_, money_, Q};')();
const { calculate_, money_, Q } = mod;

const fail = [];
function eq(label, got, want){ const ok = String(got)===String(want); if(!ok) fail.push(label);
  console.log(`${ok?'PASS':'FAIL'}  ${label} = ${got}${ok?'':' (want '+want+')'}`); }

// Same trip the HTML form is tested with: Sep 14-16, 2 nights @ $129 + $41.28 tax,
// 240 mi driven 2026-09-14, $24 parking, one provided lunch, $275 registration, $200 advance.
const a = {
  [Q.ROLE]:'Treasurer', [Q.PURPOSE]:'Q3 State Board Meeting', [Q.DEST]:'Sacramento, CA',
  [Q.DEPART]:'2026-09-14', [Q.RETURN]:'2026-09-16',
  [Q.NIGHTS]:'2', [Q.ROOM_RATE]:'129', [Q.ROOM_TAX]:'41.28',
  [Q.BREAKFASTS]:'0', [Q.LUNCHES]:'1', [Q.DINNERS]:'0',
  [Q.DRIVE_DATE]:'2026-09-14', [Q.MILES]:'240', [Q.AIRFARE]:'',
  [Q.PARKING]:'24', [Q.OTHER_DESC]:'Conference registration', [Q.OTHER_AMT]:'275',
  [Q.ADVANCE]:'200', [Q.NOTES]:'Carried the printed board packets and the banner.',
  [Q.CERTIFY]:['I certify these expenses were incurred on official CAFOP business, are accurate, and have not been reimbursed from any other source.']
};
let c = calculate_(a);
eq('days', c.days, 3);
eq('per diem gross', c.perDiemGross, 170);          // 51 + 68 + 51
eq('per diem after provided lunch', c.perDiem, 151);
eq('lodging', c.lodging.toFixed(2), '299.28');
eq('mileage rate (Sep 2026)', c.mileageRate, 0.76);
eq('mileage', c.mileageFull.toFixed(2), '182.40');
eq('due matches the HTML form', c.due.toFixed(2), '731.68');
eq('no airfare quoted, no cap, no flag', c.flags.length, 0);
eq('full mileage payable', c.mileage.toFixed(2), '182.40');

// with a cheaper comparable itinerary, mileage is capped
c = calculate_({...a, [Q.AIRFARE]:'148'});
eq('capped mileage', c.mileage.toFixed(2), '148.00');
eq('capped due', c.due.toFixed(2), '697.28');       // 731.68 - (182.40 - 148)
eq('capping raises no flag', c.flags.length, 0);

// the cap has no distance test — it applies to a short drive exactly the same way
c = calculate_({...a, [Q.MILES]:'80', [Q.AIRFARE]:'40'});
eq('short trip capped too', c.mileage.toFixed(2), '40.00');
c = calculate_({...a, [Q.MILES]:'80', [Q.AIRFARE]:''});
eq('short trip uncapped when blank', c.mileage.toFixed(2), '60.80');

// pre-July drive drops to 72.5 cents
c = calculate_({...a, [Q.DRIVE_DATE]:'2026-03-02', [Q.AIRFARE]:'900'});
eq('pre-July rate', c.mileageRate, 0.725);
eq('pre-July mileage', c.mileageFull.toFixed(2), '174.00');

// single-day trip pays one 75% day
c = calculate_({...a, [Q.RETURN]:'2026-09-14', [Q.LUNCHES]:'0', [Q.NIGHTS]:'', [Q.ROOM_RATE]:''});
eq('single-day per diem', c.perDiem, 51);

// reversed dates are caught, not silently zeroed
c = calculate_({...a, [Q.RETURN]:'2026-09-10'});
eq('reversed dates flagged', c.flags.some(f=>f.indexOf('before the departure')>-1), true);

// over-claimed provided meals floor at zero rather than going negative
c = calculate_({...a, [Q.BREAKFASTS]:'9', [Q.LUNCHES]:'9', [Q.DINNERS]:'9'});
eq('per diem floors at zero', c.perDiem, 0);
eq('over-provision flagged', c.flags.some(f=>f.indexOf('More meals')>-1), true);

// nights beyond the trip length get caught
c = calculate_({...a, [Q.NIGHTS]:'5'});
eq('excess nights flagged', c.flags.some(f=>f.indexOf('exceeds the nights')>-1), true);

// a garbled amount must be flagged and counted as zero, never silently truncated
c = calculate_({...a, [Q.PARKING]:'1-2-3', [Q.AIRFARE]:'148'});
eq('garbled amount counted as zero', c.otherTransport, 0);
eq('garbled amount flagged', c.flags.some(f=>f.indexOf('not a number')>-1), true);

// an unticked certification is recorded and flagged
c = calculate_({...a, [Q.CERTIFY]:[], [Q.AIRFARE]:'148'});
eq('uncertified flagged', c.certified, false);

console.log(fail.length ? `\n${fail.length} FAILURE(S)` : '\nALL PASS');
process.exit(fail.length?1:0);
