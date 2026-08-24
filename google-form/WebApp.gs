/**
 * CAFOP reimbursement — web app front end.
 *
 * Serves the styled claim form at a real URL and files submissions through the same
 * calculation, ledger and email path the Google Form uses. Google Forms cannot be
 * styled beyond a header image and an accent colour; this exists so officers get the
 * designed form, with a live running total, instead.
 *
 * Lives in the same Apps Script project as Code.gs and shares its rate constants and
 * helpers, so there is exactly one set of rates in the project.
 *
 * Deploy: Deploy → New deployment → Web app → Execute as *me*, access *Anyone*.
 */

function doGet() {
  // Frame protection is left at the Apps Script default on purpose. This page files
  // claims and sends money-bearing mail on a button press, so it must not be embeddable
  // by an arbitrary origin. Only relax this if the form is genuinely being embedded in a
  // Google Site, and understand what it opens up before you do.
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('CAFOP Executive Reimbursement')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Called from the page. Recomputes everything server-side — the browser's totals are a
 * convenience for the officer, never the figure of record — then writes the ledger row
 * and sends the mail.
 */
function submitClaim(p) {
  try {
    if (!p || typeof p !== 'object') throw new Error('No claim data arrived.');

    var a = toAnswers_(p);
    var mileage = legTotals_(p.legs);
    var claim = calculate_(a, mileage);

    // Save receipts before anything else is written, so a Drive failure surfaces as a
    // failed submission the officer can retry rather than a claim recorded without them.
    var receipts = saveReceipts_(p.receipts, nameOf_(a, String(p.email || '')), p.depart);

    record_(a, claim, String(p.email || ''), receipts);
    notify_(a, claim, String(p.email || ''), receipts);

    // Only name an address the officer will actually receive mail at, so the page
    // never promises a copy that COPY_TO_OFFICER has switched off.
    var copiedTo = (COPY_TO_OFFICER && String(p.email || '').trim()) ? String(p.email).trim() : '';
    return {
      ok: true,
      due: money_(claim.due),
      copiedTo: copiedTo,
      receipts: receipts.length,
      flags: claim.flags
    };
  } catch (err) {
    // Surface the reason to the officer rather than a blank failure, and leave a trace
    // in the Executions log for whoever is debugging.
    Logger.log('submitClaim failed: ' + (err && err.stack ? err.stack : err));
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

/** Web payload → the same answer shape the Google Form produces, so one calculate_ serves both. */
function toAnswers_(p) {
  var a = {};
  a[Q.NAME]       = p.name;
  a[Q.ROLE]       = p.role;
  a[Q.PURPOSE]    = p.purpose;
  a[Q.DEST]       = p.dest;
  a[Q.DEPART]     = p.depart;
  a[Q.RETURN]     = p.ret;
  a[Q.HOTEL]      = p.hotel;
  a[Q.NIGHTS]     = p.nights;
  a[Q.ROOM_RATE]  = p.rate;
  a[Q.ROOM_TAX]   = p.tax;
  a[Q.BREAKFASTS] = p.provided ? p.provided.breakfasts : 0;
  a[Q.LUNCHES]    = p.provided ? p.provided.lunches    : 0;
  a[Q.DINNERS]    = p.provided ? p.provided.dinners    : 0;
  a[Q.AIRFARE]    = num_(p.airfare) + num_(p.airground);
  a[Q.AIR]        = p.air;
  a[Q.BAG]        = p.bag;
  a[Q.GROUND]     = p.ground;
  a[Q.PARKING]    = p.parking;
  a[Q.RENTAL]     = p.rental;
  a[Q.ADVANCE]    = p.advance;
  a[Q.NOTES]      = p.notes;
  a[Q.CERTIFY]    = p.certified ? ['certified'] : [];

  var rows = (p.other || []).filter(function (o) { return num_(o.amt) > 0; });
  a[Q.OTHER_AMT]  = rows.reduce(function (t, o) { return t + num_(o.amt); }, 0);
  a[Q.OTHER_DESC] = rows.map(function (o) { return String(o.desc || '').trim(); })
                        .filter(String).join('; ');

  // Mileage is priced per leg below; these carry the totals for the ledger and flags.
  var legs = p.legs || [];
  a[Q.MILES]      = legs.reduce(function (t, l) { return t + num_(l.miles); }, 0);
  a[Q.DRIVE_DATE] = legs.length ? legs[0].date : '';
  return a;
}

/**
 * Prices each leg at the rate for the date it was driven, so a trip spanning the
 * 1 July rate change is paid correctly rather than at one blended rate.
 */
function legTotals_(legs) {
  legs = legs || [];
  var miles = 0, amount = 0, rate = null;
  legs.forEach(function (l) {
    var m = num_(l.miles);
    if (m <= 0) return;
    var r = rateFor_(parseDate_(l.date));
    miles  += m;
    amount += m * r;
    rate = (rate === null || rate === r) ? r : -1;   // -1 marks a mixed-rate trip
  });
  if (miles === 0) return null;
  return { miles: miles, mileageFull: amount, rate: rate === -1 ? amount / miles : rate };
}


// ------------------------------------------------------------------- receipts

var PROP_FOLDER = 'cafop_receipts_folder';
var RECEIPTS_FOLDER = 'CAFOP Reimbursement Receipts';

// Re-checked here as well as in the browser. The page's limits are a courtesy to the
// officer; these are the ones that actually hold, because anyone can call submitClaim
// straight from a console and skip the picker entirely.
var MAX_FILE_BYTES  = 10 * 1024 * 1024;
var MAX_TOTAL_BYTES = 25 * 1024 * 1024;
var MAX_FILES       = 20;

// What may be written to Drive and mailed on to the treasurer. The accept= attribute on
// the file input is a hint the browser can be told to ignore; this is the real gate.
var ALLOWED_TYPES = [
  'image/', 'application/pdf', 'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

function typeAllowed_(mime) {
  var m = String(mime || '').toLowerCase();
  for (var i = 0; i < ALLOWED_TYPES.length; i++) {
    if (m.indexOf(ALLOWED_TYPES[i]) === 0) return true;
  }
  return false;
}

/**
 * Writes each uploaded receipt into a per-claim folder in the owner's Drive and returns
 * [{name, url, bytes, blob}] — url and name for the ledger and the email body, blob for
 * the attachment. Returns [] when nothing was uploaded.
 *
 * Files live in Drive rather than only on the email so the association keeps a durable
 * record that survives a mailbox being cleared out.
 */
function saveReceipts_(files, who, depart) {
  files = files || [];
  if (!files.length) return [];
  if (files.length > MAX_FILES) {
    throw new Error(files.length + ' files is more than the ' + MAX_FILES +
                    ' allowed on one claim. Send the rest by email.');
  }

  // Decode and check everything before creating a folder, so a rejected claim leaves
  // nothing behind in Drive.
  var total = 0;
  var decoded = files.map(function (f) {
    var name = String(f.name || 'receipt');
    if (!typeAllowed_(f.mimeType)) {
      throw new Error('"' + name + '" is a ' + (f.mimeType || 'unknown') +
                      ' file. Attach photos, PDFs or Word documents.');
    }
    var bytes = Utilities.base64Decode(f.data);
    if (bytes.length > MAX_FILE_BYTES) {
      throw new Error('"' + name + '" is ' + Math.round(bytes.length / 1048576) +
                      ' MB, over the 10 MB limit for one file.');
    }
    total += bytes.length;
    if (total > MAX_TOTAL_BYTES) {
      throw new Error('Those files come to more than the 25 MB allowed on one claim.');
    }
    return { name: name, bytes: bytes, mimeType: f.mimeType };
  });

  var parent = receiptsRoot_();
  var label = (depart || 'undated') + ' ' + (who || 'unknown');
  var folder = parent.createFolder(label.substring(0, 120));
  shareWith_(folder, [treasurer_()].concat(ALSO_NOTIFY || []));

  return decoded.map(function (d) {
    var blob = Utilities.newBlob(d.bytes, d.mimeType || 'application/octet-stream', d.name);
    var saved = folder.createFile(blob);
    return { name: saved.getName(), url: saved.getUrl(), bytes: d.bytes.length, blob: blob };
  });
}

/**
 * The folder lives in the Drive of whoever deployed the web app, so everyone else on the
 * claim email would hit a request-access wall on the links. Add them as viewers instead.
 * Sharing failing must not fail the claim — the files are attached to the email anyway.
 */
function shareWith_(folder, addresses) {
  var seen = {};
  (addresses || []).forEach(function (raw) {
    var address = String(raw || '').trim();
    if (!address || seen[address]) return;
    seen[address] = true;
    try {
      folder.addViewer(address);
    } catch (err) {
      Logger.log('Could not share receipts with ' + address + ': ' + err);
    }
  });
}

/** The one folder everything lands under, created on first use and remembered after. */
function receiptsRoot_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(PROP_FOLDER);
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* deleted — make a new one */ }
  }
  var folder = DriveApp.createFolder(RECEIPTS_FOLDER);
  props.setProperty(PROP_FOLDER, folder.getId());
  return folder;
}
