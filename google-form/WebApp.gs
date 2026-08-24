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

    record_(a, claim, String(p.email || ''));
    notify_(a, claim, String(p.email || ''));

    // Only name an address the officer will actually receive mail at, so the page
    // never promises a copy that COPY_TO_OFFICER has switched off.
    var copiedTo = (COPY_TO_OFFICER && String(p.email || '').trim()) ? String(p.email).trim() : '';
    return { ok: true, due: money_(claim.due), copiedTo: copiedTo, flags: claim.flags };
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
