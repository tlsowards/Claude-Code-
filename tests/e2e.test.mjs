/**
 * A whole submission through google-form/Code.gs and WebApp.gs with Google's services
 * stubbed — both the Google Form path and the web app path — checking the spreadsheet
 * row and the emails that come out the far end.
 *
 *   node tests/e2e.test.mjs
 */
/**
 * Runs the real google-form/Code.gs end to end with Google's services stubbed:
 * a synthetic form submission goes in, and we inspect the spreadsheet row that
 * gets written and the emails that get sent.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Paths are resolved from the repository root so the suite runs from anywhere.
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = (p) => join(ROOT, p);
const fileUrl = (p) => pathToFileURL(join(ROOT, p)).href;


const SRC = readFileSync(repo('google-form/Code.gs'), 'utf8') + '\n' +
            readFileSync(repo('google-form/WebApp.gs'), 'utf8');

const sent = [];
const sheetRows = [];
const formats = [];
let props = {};

function pad(n){ return String(n).padStart(2,'0'); }
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const sandbox = {
  console,
  Logger: { log: () => {} },
  Utilities: {
    formatDate(d, tz, pattern) {
      if (pattern === 'yyyy-MM-dd') return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      if (pattern === 'EEE, MMM d, yyyy') return `${DAYS[d.getDay()]}, ${MONS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      throw new Error('unstubbed date pattern: ' + pattern);
    },
    formatString(fmt, n) {
      if (fmt !== '%.2f') throw new Error('unstubbed format: ' + fmt);
      return n.toFixed(2);
    },
    base64Decode: (d) => Buffer.from(String(d), 'base64'),
    newBlob: (bytes, mime, name) => ({ __blob: true, bytes, mime, name })
  },
  Session: {
    getScriptTimeZone: () => 'America/Los_Angeles',
    getEffectiveUser: () => ({ getEmail: () => 'treasurer@example.org' })
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: k => (k in props ? props[k] : null),
      setProperty: (k, v) => { props[k] = v; }
    })
  },
  SpreadsheetApp: {
    openById: () => ({
      getSheetByName: () => sheetObj,
      insertSheet: () => sheetObj
    })
  },
  MailApp: { sendEmail: o => sent.push(o) },
  DriveApp: {
    createFolder: (name) => makeFolder(name),
    getFolderById: (id) => { if (id === 'gone') throw new Error('deleted'); return makeFolder('root'); }
  },
  HtmlService: { createHtmlOutputFromFile: () => ({ setTitle(){return this}, addMetaTag(){return this}, setXFrameOptionsMode(){return this} }), XFrameOptionsMode:{ALLOWALL:1} }
};

const drive = { folders: [], files: [] };
function makeFolder(name) {
  drive.folders.push(name);
  return {
    getId: () => 'folder-' + drive.folders.length,
    createFolder: (n) => makeFolder(n),
    createFile: (blob) => {
      drive.files.push({ folder: name, name: blob.name, mime: blob.mime });
      return {
        getName: () => blob.name,
        getUrl: () => 'https://drive.example/' + encodeURIComponent(blob.name)
      };
    }
  };
}

const sheetObj = {
  appendRow: r => sheetRows.push(r),
  getLastRow: () => sheetRows.length,
  setFrozenRows: () => {},
  getRange: (row, col, _nr, nc) => {
    const rec = { row, col, span: nc || 1 };
    const chain = {
      setNumberFormat: f => { formats.push({...rec, numberFormat: f}); return chain; },
      setFontWeight: () => chain,
      setBackground: () => chain,
      setFontColor: () => chain
    };
    return chain;
  }
};

vm.createContext(sandbox);
vm.runInContext(SRC, sandbox);

// --- the scenario from SETUP.md -------------------------------------------
const Q = sandbox.Q;
const D = (s) => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); };

const answers = {
  [Q.ROLE]:'Treasurer',
  [Q.PURPOSE]:'Q3 State Board Meeting',
  [Q.DEST]:'Sacramento, CA',
  [Q.DEPART]: D('2026-09-14'),
  [Q.RETURN]: D('2026-09-16'),
  [Q.HOTEL]:'Hyatt Regency Sacramento',
  [Q.NIGHTS]:'2', [Q.ROOM_RATE]:'129', [Q.ROOM_TAX]:'41.28',
  [Q.BREAKFASTS]:'0', [Q.LUNCHES]:'1', [Q.DINNERS]:'0',
  [Q.DRIVE_DATE]: D('2026-09-14'), [Q.MILES]:'240',
  [Q.PARKING]:'24',
  [Q.OTHER_DESC]:'Conference registration', [Q.OTHER_AMT]:'275',
  [Q.ADVANCE]:'200',
  [Q.NOTES]:'Drove to carry the printed board packets and the banner.',
  [Q.CERTIFY]:['I certify these expenses were incurred on official CAFOP business.']
};

props = { cafop_sheet_id: 'sheet123', cafop_treasurer_email: 'treasurer@example.org' };

const event = {
  response: {
    getItemResponses: () => Object.keys(answers).map(t => ({
      getItem: () => ({ getTitle: () => t }),
      getResponse: () => answers[t]
    })),
    getRespondentEmail: () => 'dana.whitfield@example.org'
  }
};

sandbox.onFormSubmit(event);

// --- assertions ------------------------------------------------------------
const fails = [];
function eq(label, got, want) {
  const ok = String(got) === String(want);
  if (!ok) fails.push(label);
  console.log(`${ok?'PASS':'FAIL'}  ${label} = ${got}${ok?'':`  (want ${want})`}`);
}

const header = sheetRows[0], row = sheetRows[1];
eq('header written once', sheetRows.length, 2);
eq('header column count', header.length, 21);
eq('data column count', row.length, 21);
eq('DUE TO OFFICER is column 18', header.indexOf('DUE TO OFFICER') + 1, 18);
eq('due amount', row[17].toFixed(2), '731.68');
eq('lodging', row[9].toFixed(2), '299.28');
eq('mileage payable', row[10].toFixed(2), '182.40');
eq('miles', row[11], 240);
eq('mileage rate picked from drive date', row[12], 0.76);
eq('per diem', row[14].toFixed(2), '151.00');
eq('days', row[8], 3);
eq('certified recorded', row[18], 'yes');
eq('miles column not currency', formats.find(f=>f.col===12)?.numberFormat, '#,##0.0');
eq('rate column 3dp', formats.find(f=>f.col===13)?.numberFormat, '0.000');

eq('two emails sent', sent.length, 2);
eq('treasurer copy', sent[0].to, 'treasurer@example.org');
eq('extra recipients are cc-ed, not sent separately', sent[0].cc, 'roger@cafop.org');
eq('one treasurer-side email, not two', sent.filter(m => m.to === 'treasurer@example.org').length, 1);
eq('officer copy', sent[1].to, 'dana.whitfield@example.org');
eq('subject carries the total', sent[0].subject.includes('$731.68'), true);
eq('clean claim raises no review banner', sent[0].subject.includes('NEEDS REVIEW'), false);
eq('body shows mileage at the national rate', /76\.0/.test(sent[0].htmlBody), true);
eq('body has no undefined', /undefined|NaN|\[object/.test(sent[0].htmlBody), false);
eq('notes are escaped into the body', sent[0].htmlBody.includes('board packets'), true);
// Google Form path has no name field, so the header must not print the email twice
eq('google form header does not repeat the email',
   (sent[0].htmlBody.match(/dana\.whitfield@example\.org/g) || []).length, 1);
eq('google form ledger names the role', sheetRows[1][1], 'Treasurer');
eq('google form header shows role then address',
   sent[0].htmlBody.includes('<b>Treasurer</b>'), true);

// ---- web app path: the same trip filed through submitClaim ------------------
sent.length = 0; sheetRows.length = 1;
const webPayload = {
  name:'Dana Whitfield', role:'Treasurer', email:'dana.whitfield@example.org',
  purpose:'Q3 State Board Meeting', dest:'Sacramento, CA',
  depart:'2026-09-14', ret:'2026-09-16',
  hotel:'Hyatt Regency', nights:'2', rate:'129', tax:'41.28',
  legs:[{date:'2026-09-14', route:'Home → venue', miles:'240'}],
  airfare:'', airground:'', air:'', bag:'', ground:'', parking:'24', rental:'',
  provided:{breakfasts:0, lunches:1, dinners:0},
  other:[{date:'2026-09-15', desc:'Conference registration', amt:'275'}],
  advance:'200', notes:'Carried the board packets.', certified:true
};
const web = sandbox.submitClaim({ ...webPayload });
eq('web app returns ok', web.ok, true);
eq('web app total matches the printable form', web.due, '$731.68');
eq('web app wrote a ledger row', sheetRows.length, 2);
eq('web app used the officer name', sheetRows[1][1], 'Dana Whitfield — Treasurer');
eq('officer name reaches the email', sent[0].htmlBody.includes('Dana Whitfield — Treasurer'), true);
eq('email no longer says just "Officer"', /<b>Officer<\/b>/.test(sent[0].htmlBody), false);
eq('copy promised only when actually sent', web.copiedTo, 'dana.whitfield@example.org');
eq('web app emailed treasurer and officer', sent.length, 2);
eq('web app recorded certification', sheetRows[1][18], 'yes');

// with neither name nor role, the address must still appear exactly once
sent.length = 0; sheetRows.length = 1;
sandbox.onFormSubmit({ response: {
  getItemResponses: () => Object.entries({...answers, [Q.ROLE]:''})
    .map(([t,v]) => ({ getItem:()=>({getTitle:()=>t}), getResponse:()=>v })),
  getRespondentEmail: () => 'nameless@example.org'
}});
eq('no name and no role still prints the address once',
   (sent[0].htmlBody.match(/nameless@example\.org/g) || []).length, 1);

// the airfare cap works through the web path too
sent.length = 0; sheetRows.length = 1;
const capped = sandbox.submitClaim({
  name:'Dana Whitfield', role:'Treasurer', email:'d@example.org', purpose:'Board', dest:'Sacramento',
  depart:'2026-09-14', ret:'2026-09-16', nights:'2', rate:'129', tax:'41.28',
  legs:[{date:'2026-09-14', miles:'240'}], airfare:'118', airground:'30', parking:'24',
  provided:{breakfasts:0,lunches:1,dinners:0}, other:[{desc:'Reg', amt:'275'}],
  advance:'200', certified:true
});
// identical to the $731.68 trip except for the cap: 182.40 mileage becomes 148.00
eq('web app applies the airfare cap', capped.due, '$697.28');

// a trip spanning the 1 July rate change is priced per leg, not blended
sent.length = 0; sheetRows.length = 1;
const split = sandbox.submitClaim({
  name:'A', role:'Trustee', email:'a@example.org', purpose:'x', dest:'y',
  depart:'2026-06-29', ret:'2026-07-02',
  legs:[{date:'2026-06-29', miles:'100'}, {date:'2026-07-02', miles:'100'}],
  provided:{breakfasts:0,lunches:0,dinners:0}, other:[], certified:true
});
// 100 x 0.725 + 100 x 0.76 = 72.50 + 76.00 = 148.50
eq('legs priced at their own rates', sheetRows[1][10].toFixed(2), '148.50');

// a failed submission reports why instead of dying silently
const bad = sandbox.submitClaim(null);
eq('bad payload returns an error, not a crash', bad.ok, false);


// HTML injection through a free-text field must not survive into the email
sent.length = 0; sheetRows.length = 1;
sandbox.onFormSubmit({ response: {
  getItemResponses: () => Object.entries({...answers, [Q.PURPOSE]:'<script>alert(1)</script>'})
    .map(([t,v]) => ({ getItem:()=>({getTitle:()=>t}), getResponse:()=>v })),
  getRespondentEmail: () => 'dana.whitfield@example.org'
}});
eq('script tag escaped, not live', sent[0].htmlBody.includes('<script>alert(1)</script>'), false);
eq('script tag still readable', sent[0].htmlBody.includes('&lt;script&gt;'), true);

// ---- receipts -------------------------------------------------------------
sent.length = 0; sheetRows.length = 1; drive.folders = []; drive.files = [];
props = { cafop_sheet_id: 'sheet123', cafop_treasurer_email: 'treasurer@example.org' };

const withReceipts = sandbox.submitClaim({
  ...webPayload,
  receipts: [
    { name: 'folio.pdf',   mimeType: 'application/pdf', data: Buffer.from('hotel folio').toString('base64') },
    { name: 'parking.jpg', mimeType: 'image/jpeg',      data: Buffer.from('parking').toString('base64') }
  ]
});

eq('submission with receipts succeeds', withReceipts.ok, true);
eq('receipt count returned to the page', withReceipts.receipts, 2);
eq('both files written to Drive', drive.files.length, 2);
eq('filed under one per-claim folder', drive.files[0].folder, drive.files[1].folder);
eq('folder named for the trip', /2026-09-14/.test(drive.files[0].folder), true);
eq('treasurer email carries the attachments', (sent[0].attachments || []).length, 2);
eq('officer copy does not resend their own files', (sent[1].attachments || []).length, 0);
eq('email links the receipts', sent[0].htmlBody.includes('drive.example'), true);
eq('ledger row records the links',
   /folio\.pdf/.test(sheetRows[1][19]) && /parking\.jpg/.test(sheetRows[1][19]), true);
eq('ledger still 21 columns', sheetRows[1].length, 21);
eq('flags stayed in the last column', sheetRows[0][20], 'Flags');

// no receipts is the normal case and must stay clean
sent.length = 0; sheetRows.length = 1; drive.folders = []; drive.files = [];
sandbox.submitClaim({ ...webPayload });
eq('no upload creates no Drive folder', drive.folders.length, 0);
eq('no upload means no attachments', (sent[0].attachments || []).length, 0);
eq('ledger says so plainly', sheetRows[1][19], 'none attached');

console.log(fails.length ? `\n${fails.length} FAILURE(S)` : '\nALL PASS — end to end');
process.exit(fails.length ? 1 : 0);
