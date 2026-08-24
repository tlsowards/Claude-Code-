/**
 * CAFOP Executive Travel Reimbursement — Google Form intake.
 *
 * Google Forms cannot calculate. This script closes that gap: the Form collects
 * only raw facts (dates, miles, nights, rate paid, meals provided), and everything
 * derived — the per diem schedule, the mileage rate for the date driven, the
 * airfare cap on mileage, the totals — is computed here on submit,
 * logged to a spreadsheet, and emailed to the treasurer as a finished claim.
 *
 * Setup: see SETUP.md. Short version — paste this into a new project at
 * script.google.com, run setUp() once, authorize it, and share the form URL
 * the execution log prints.
 *
 * Rates must stay in step with forms/cafop-executive-reimbursement-form.html.
 */

// ---------------------------------------------------------------- configuration

// Where claims are sent. Leave blank and setUp() uses the Google account that runs it,
// so the treasurer just runs setUp() from their own account and claims come to them.
// Set it explicitly only to send claims somewhere other than the owning account.
var TREASURER_EMAIL = '';
var FORM_TITLE      = 'CAFOP Executive Travel Reimbursement';
var COPY_TO_OFFICER = true;   // email the submitting officer their computed total

// Meals & incidentals — GSA standard CONUS, FY2026.
var MIE          = 68;    // full day
var MIE_PARTIAL  = 51;    // first and last day of travel (75%)
var MEAL         = { breakfast: 16, lunch: 19, dinner: 28 };

// Mileage — IRS standard business rates, newest first.
var MILEAGE = [
  { from: '2026-07-01', rate: 0.76  },
  { from: '2026-01-01', rate: 0.725 },
  { from: '2025-01-01', rate: 0.70  }
];

// Question titles. Responses are matched by title, so if you rename a question
// in the Form editor, rename it here too.
var Q = {
  NAME:        'Name',                     // web app only; the Google Form uses the account email
  ROLE:        'Executive role or office',
  PURPOSE:     'Business purpose or event',
  DEST:        'Destination (city, state)',
  DEPART:      'Departure date',
  RETURN:      'Return date',
  HOTEL:       'Hotel or property',
  NIGHTS:      'Number of nights',
  ROOM_RATE:   'Room rate per night',
  ROOM_TAX:    'Lodging taxes and fees',
  BREAKFASTS:  'Breakfasts provided to you',
  LUNCHES:     'Lunches provided to you',
  DINNERS:     'Dinners provided to you',
  DRIVE_DATE:  'Date driven',
  MILES:       'Round-trip miles driven',
  AIRFARE:     'Comparable coach airfare plus airport ground transport',
  AIR:         'Air or rail ticket',
  BAG:         'Baggage fees',
  GROUND:      'Taxi, rideshare or transit',
  PARKING:     'Parking and tolls',
  RENTAL:      'Rental car and fuel',
  OTHER_DESC:  'Other expenses — what were they',
  OTHER_AMT:   'Other expenses — total',
  ADVANCE:     'Advance or CAFOP card charges already paid',
  NOTES:       'Notes or exceptions',
  RECEIPTS:    'Receipts',
  CERTIFY:     'Certification'
};

var PROP_FORM  = 'cafop_form_id';
var PROP_SHEET = 'cafop_sheet_id';
var PROP_EMAIL = 'cafop_treasurer_email';
var LEDGER     = 'Calculated claims';

// ---------------------------------------------------------------------- set up

/**
 * Run this once. Creates the form, creates the spreadsheet, links them, and
 * installs the on-submit trigger. Safe to re-run only if you first delete the
 * form and sheet it made — otherwise you get a second set.
 */
function setUp() {
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(
    'Submit within 30 days of return. Enter what you actually paid and how far you ' +
    'drove — the association calculates the per diem, the mileage rate and the totals ' +
    'for you, and emails you a copy. Attach every receipt except meals; meals are paid ' +
    'per diem and need none.');
  form.setCollectEmail(true);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    'Claim received. You will get an emailed copy with the calculated total within a minute.');

  form.addSectionHeaderItem().setTitle('Trip')
      .setHelpText('The travel dates drive the meal per diem, so get them right.');
  textItem_(form, Q.ROLE, 'e.g. Treasurer, President, Trustee', true);
  textItem_(form, Q.PURPOSE, 'e.g. Q3 State Board Meeting', true);
  textItem_(form, Q.DEST, '', true);
  form.addDateItem().setTitle(Q.DEPART).setRequired(true);
  form.addDateItem().setTitle(Q.RETURN).setRequired(true);

  form.addSectionHeaderItem().setTitle('Lodging')
      .setHelpText('Reimbursed at actual cost — there is no nightly cap. Attach the itemized folio.');
  textItem_(form, Q.HOTEL, '', false);
  numberItem_(form, Q.NIGHTS, 'Leave blank if you did not stay overnight.', false);
  numberItem_(form, Q.ROOM_RATE, 'Dollars per night, before tax.', false);
  numberItem_(form, Q.ROOM_TAX, 'Total taxes and mandatory fees for the stay.', false);

  form.addSectionHeaderItem().setTitle('Meals')
      .setHelpText('Paid per diem at the federal rate — no receipts. You only need to tell us ' +
                   'which meals somebody else already fed you, so they can be deducted.');
  numberItem_(form, Q.BREAKFASTS, 'How many breakfasts were provided by the host or conference? Enter 0 if none.', false);
  numberItem_(form, Q.LUNCHES, 'How many lunches were provided? Enter 0 if none.', false);
  numberItem_(form, Q.DINNERS, 'How many dinners were provided? Enter 0 if none.', false);

  form.addSectionHeaderItem().setTitle('Travel')
      .setHelpText('Leave the mileage questions blank if you did not drive.');
  form.addDateItem().setTitle(Q.DRIVE_DATE)
      .setHelpText('The mileage rate is set by the date you drove, not the date you file.')
      .setRequired(false);
  numberItem_(form, Q.MILES, 'Total round-trip miles.', false);
  numberItem_(form, Q.AIRFARE,
    'Only if flying was a realistic option for this trip. Quote a comparable coach itinerary plus ' +
    'airport parking or ground transport — mileage is reimbursed at the lesser of the two. Leave ' +
    'blank for a local drive or where no commercial service reaches the destination.', false);
  numberItem_(form, Q.AIR, '', false);
  numberItem_(form, Q.BAG, '', false);
  numberItem_(form, Q.GROUND, '', false);
  numberItem_(form, Q.PARKING, '', false);
  numberItem_(form, Q.RENTAL, '', false);

  form.addSectionHeaderItem().setTitle('Other and settlement');
  form.addParagraphTextItem().setTitle(Q.OTHER_DESC)
      .setHelpText('Registration, printing, shipping, business calls. Not alcohol, entertainment, ' +
                   'fines, companion costs or room upgrades.').setRequired(false);
  numberItem_(form, Q.OTHER_AMT, '', false);
  numberItem_(form, Q.ADVANCE, 'Anything already advanced to you or charged to a CAFOP card. ' +
                               'This is subtracted from your total.', false);
  form.addParagraphTextItem().setTitle(Q.NOTES)
      .setHelpText('Explain a missing receipt, or why driving was the right call on a long trip.')
      .setRequired(false);

  // File upload requires a Google Workspace form and signed-in respondents. If your
  // officers submit from personal accounts, delete this item and have them email receipts.
  try {
    form.addFileUploadItem().setTitle(Q.RECEIPTS)
        .setHelpText('Hotel folio and every non-meal receipt.')
        .setRequired(false);
  } catch (err) {
    Logger.log('File upload not available on this account; skipped. Officers should email receipts. (' + err + ')');
  }

  form.addCheckboxItem().setTitle(Q.CERTIFY).setRequired(true)
      .setChoiceValues(['I certify these expenses were incurred on official CAFOP business, ' +
                        'are accurate, and have not been reimbursed from any other source.']);

  var ss = SpreadsheetApp.create(FORM_TITLE + ' — submissions');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  ledger_(ss);

  var props = PropertiesService.getScriptProperties();
  props.setProperty(PROP_FORM, form.getId());
  props.setProperty(PROP_SHEET, ss.getId());
  props.setProperty(PROP_EMAIL, treasurer_());

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onFormSubmit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();

  Logger.log('Send officers this link:  ' + form.getPublishedUrl());
  Logger.log('Edit the form here:       ' + form.getEditUrl());
  Logger.log('Submissions land here:    ' + ss.getUrl());
  Logger.log('Claims are emailed to:    ' + treasurer_());
}

function textItem_(form, title, help, required) {
  return form.addTextItem().setTitle(title).setHelpText(help || '').setRequired(!!required);
}

function numberItem_(form, title, help, required) {
  var item = form.addTextItem().setTitle(title).setHelpText(help || '').setRequired(!!required);
  item.setValidation(FormApp.createTextValidation()
      .setHelpText('Enter a number — digits only, no dollar sign.')
      .requireNumber().build());
  return item;
}

function ledger_(ss) {
  var sheet = ss.getSheetByName(LEDGER) || ss.insertSheet(LEDGER);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted', 'Officer', 'Email', 'Role', 'Purpose', 'Destination',
                     'Depart', 'Return', 'Days', 'Lodging', 'Mileage payable', 'Miles',
                     'Rate', 'Other transport', 'Per diem', 'Other', 'Advance',
                     'DUE TO OFFICER', 'Certified', 'Flags']);
    sheet.getRange(1, 1, 1, 20).setFontWeight('bold').setBackground('#0A2A57').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ------------------------------------------------------------------ on submit

function onFormSubmit(e) {
  var answers = {};
  e.response.getItemResponses().forEach(function (r) {
    answers[r.getItem().getTitle()] = r.getResponse();
  });

  var email = e.response.getRespondentEmail() || '';
  var claim = calculate_(answers);

  record_(answers, claim, email);
  notify_(answers, claim, email);
}

/**
 * All of the arithmetic. Serves the Google Form and the web app alike.
 * `mileage` is optional: the web app prices each leg at the rate for its own drive date
 * and passes the result in, so a trip spanning a rate change is not blended.
 */
function calculate_(a, mileage) {
  var c = { flags: [] };

  var depart = parseDate_(a[Q.DEPART]);
  var ret    = parseDate_(a[Q.RETURN]);
  c.days = 0;
  if (depart && ret) {
    var span = Math.round((ret - depart) / 86400000) + 1;
    if (span < 1) {
      c.flags.push('Return date is before the departure date — no per diem could be calculated.');
    } else if (span > 366) {
      c.flags.push('Travel dates span more than a year. Treated as ' + span + ' days; check them.');
      c.days = span;
    } else {
      c.days = span;
    }
  }

  // Meals: first and last day pay 75%; a single-day trip is both.
  var perDiem = 0;
  for (var i = 0; i < c.days; i++) {
    perDiem += (i === 0 || i === c.days - 1) ? MIE_PARTIAL : MIE;
  }
  var provided = num_(a[Q.BREAKFASTS]) * MEAL.breakfast +
                 num_(a[Q.LUNCHES])    * MEAL.lunch +
                 num_(a[Q.DINNERS])    * MEAL.dinner;
  c.perDiemGross = perDiem;
  c.provided = provided;
  c.perDiem = Math.max(0, perDiem - provided);
  if (provided > perDiem) {
    c.flags.push('More meals were reported as provided than the trip pays for. Per diem floored at $0.00.');
  }

  // Lodging: actual cost, no ceiling.
  c.nights  = num_(a[Q.NIGHTS]);
  c.roomRate = num_(a[Q.ROOM_RATE]);
  c.lodging = c.nights * c.roomRate + num_(a[Q.ROOM_TAX]);
  if (c.nights > 0 && c.days > 0 && c.nights > c.days - 1) {
    c.flags.push('Nights claimed (' + c.nights + ') exceeds the nights the travel dates cover (' +
                 Math.max(0, c.days - 1) + ').');
  }

  // Mileage: the IRS national rate for the date driven, capped at what flying would have cost.
  if (mileage) {
    c.miles = mileage.miles;
    c.mileageRate = mileage.rate;
    c.mileageFull = mileage.mileageFull;
  } else {
    c.miles = num_(a[Q.MILES]);
    c.mileageRate = rateFor_(parseDate_(a[Q.DRIVE_DATE]) || depart);
    c.mileageFull = c.miles * c.mileageRate;
  }
  c.mileage = c.mileageFull;
  c.constructive = num_(a[Q.AIRFARE]);

  if (c.constructive > 0 && c.constructive < c.mileageFull) {
    c.mileage = c.constructive;
    c.mileageNote = 'Capped at the comparable air itinerary (' + money_(c.constructive) +
                    ') instead of ' + money_(c.mileageFull) + ' of mileage.';
  } else if (c.constructive > 0) {
    c.mileageNote = 'Mileage of ' + money_(c.mileageFull) + ' is at or below the comparable air ' +
                    'itinerary (' + money_(c.constructive) + '), so it is payable in full.';
  }

  c.otherTransport = num_(a[Q.AIR]) + num_(a[Q.BAG]) + num_(a[Q.GROUND]) +
                     num_(a[Q.PARKING]) + num_(a[Q.RENTAL]);
  c.transport = c.mileage + c.otherTransport;
  c.other     = num_(a[Q.OTHER_AMT]);
  c.advance   = num_(a[Q.ADVANCE]);
  c.due = c.lodging + c.transport + c.perDiem + c.other - c.advance;

  var NUMERIC = [Q.NIGHTS, Q.ROOM_RATE, Q.ROOM_TAX, Q.BREAKFASTS, Q.LUNCHES, Q.DINNERS,
                 Q.MILES, Q.AIRFARE, Q.AIR, Q.BAG, Q.GROUND, Q.PARKING, Q.RENTAL,
                 Q.OTHER_AMT, Q.ADVANCE];
  NUMERIC.forEach(function (key) {
    if (!looksNumeric_(a[key])) {
      c.flags.push('REVIEW: "' + key + '" was entered as "' + a[key] +
                   '", which is not a number. It was counted as $0.00.');
    }
  });

  c.certified = Array.isArray(a[Q.CERTIFY]) ? a[Q.CERTIFY].length > 0 : !!a[Q.CERTIFY];
  if (!c.certified) c.flags.push('REVIEW: the certification was not checked.');

  if (c.other > 0 && !String(a[Q.OTHER_DESC] || '').trim()) {
    c.flags.push('Other expenses claimed with no description.');
  }
  if (c.due < 0) {
    c.flags.push('Advance exceeds the claim — the officer owes CAFOP ' + money_(-c.due) + '.');
  }
  return c;
}

/** Google's DateItem hands back yyyy-MM-dd. Build a local Date, never through UTC. */
function parseDate_(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  var parts = String(value).split('-');
  if (parts.length !== 3) return null;
  var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(d.getTime()) ? null : d;
}

function rateFor_(date) {
  if (date) {
    var iso = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    for (var i = 0; i < MILEAGE.length; i++) {
      if (iso >= MILEAGE[i].from) return MILEAGE[i].rate;
    }
  }
  return MILEAGE[0].rate;
}

/** Blank and unparseable both read as 0. Use looksNumeric_ to tell them apart. */
function num_(v) {
  var raw = String(v == null ? '' : v).trim().replace(/[$,\s]/g, '');
  var n = parseFloat(raw);
  return looksNumeric_(v) && isFinite(n) && n > 0 ? n : 0;
}

/** True when the value is empty or a clean number. False means the officer typed something
 *  parseFloat would silently truncate — "1-2-3" reads as 1, which on a money claim is wrong. */
function looksNumeric_(v) {
  var raw = String(v == null ? '' : v).trim().replace(/[$,\s]/g, '');
  return raw === '' || /^-?(\d+\.?\d*|\.\d+)$/.test(raw);
}

function money_(n) {
  return '$' + Utilities.formatString('%.2f', n).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function fmtDate_(d) {
  return d ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'EEE, MMM d, yyyy') : '—';
}

// --------------------------------------------------------------- record & send

function record_(a, c, email) {
  var id = PropertiesService.getScriptProperties().getProperty(PROP_SHEET);
  if (!id) return;
  var sheet = ledger_(SpreadsheetApp.openById(id));
  sheet.appendRow([
    new Date(), nameOf_(a, email), email, a[Q.ROLE] || '', a[Q.PURPOSE] || '', a[Q.DEST] || '',
    a[Q.DEPART] || '', a[Q.RETURN] || '', c.days, c.lodging, c.mileage, c.miles,
    c.mileageRate, c.otherTransport, c.perDiem, c.other, c.advance, c.due,
    c.certified ? 'yes' : 'NO', c.flags.join(' | ')
  ]);
  var row = sheet.getLastRow();
  sheet.getRange(row, 10, 1, 9).setNumberFormat('$#,##0.00');
  sheet.getRange(row, 12).setNumberFormat('#,##0.0');   // miles, not dollars
  sheet.getRange(row, 13).setNumberFormat('0.000');     // rate per mile
  sheet.getRange(row, 18).setFontWeight('bold');
  if (c.flags.length) sheet.getRange(row, 1, 1, 20).setBackground('#FBEDED');
}

function nameOf_(a, email) {
  var given = String(a[Q.NAME] || '').trim();
  if (given) return given + (a[Q.ROLE] ? ' — ' + a[Q.ROLE] : '');
  return (a[Q.ROLE] ? a[Q.ROLE] + ' — ' : '') + (email || 'unknown');
}

/** The account claims go to: the configured address, else whoever owns the script. */
function treasurer_() {
  return TREASURER_EMAIL ||
         PropertiesService.getScriptProperties().getProperty(PROP_EMAIL) ||
         Session.getEffectiveUser().getEmail();
}

function notify_(a, c, email) {
  var subject = 'CAFOP reimbursement — ' + (a[Q.ROLE] || 'officer') + ' — ' +
                money_(c.due) + (c.flags.length ? ' — NEEDS REVIEW' : '');
  var html = emailBody_(a, c, email);

  MailApp.sendEmail({ to: treasurer_(), subject: subject, htmlBody: html, name: 'CAFOP Reimbursement Form' });

  if (COPY_TO_OFFICER && email) {
    MailApp.sendEmail({
      to: email,
      subject: 'Your CAFOP reimbursement claim — ' + money_(c.due),
      htmlBody: html,
      name: 'CAFOP Reimbursement Form'
    });
  }
}

function emailBody_(a, c, email) {
  var navy = '#0A2A57', gold = '#C9A227', rule = '#D5DFEB', muted = '#4B5D75';
  var rows = [
    ['Lodging', c.lodging, c.nights ? c.nights + ' night(s) at ' + money_(c.roomRate) + ' plus tax' : ''],
    ['Mileage', c.mileage, c.miles ? c.miles + ' mi at ' + (c.mileageRate * 100).toFixed(1) + '¢' : ''],
    ['Other transportation', c.otherTransport, ''],
    ['Meals & incidentals', c.perDiem,
      c.days ? c.days + ' day(s), ' + money_(c.perDiemGross) + ' less ' + money_(c.provided) + ' provided' : ''],
    ['Other expenses', c.other, String(a[Q.OTHER_DESC] || '')],
    ['Less advance', -c.advance, '']
  ];

  var body = '<div style="font-family:Helvetica,Arial,sans-serif;color:#0D1A2D;max-width:640px">' +
    '<div style="background:' + navy + ';color:#fff;padding:16px 20px;border-bottom:3px solid ' + gold + '">' +
      '<div style="font-size:18px;font-weight:bold">California Fraternal Order of Police</div>' +
      '<div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:' + gold + '">' +
      'Executive travel reimbursement claim</div>' +
    '</div>' +
    '<div style="padding:20px">' +
      '<p style="margin:0 0 4px"><b>' + esc_(nameOf_(a, email)) + '</b>' +
        (email ? ' &middot; ' + esc_(email) : '') + '</p>' +
      '<p style="margin:0 0 16px;color:' + muted + ';font-size:14px">' +
        esc_(a[Q.PURPOSE] || '') + (a[Q.DEST] ? ' &middot; ' + esc_(a[Q.DEST]) : '') + '<br>' +
        fmtDate_(parseDate_(a[Q.DEPART])) + ' &ndash; ' + fmtDate_(parseDate_(a[Q.RETURN])) +
        (c.days ? ' (' + c.days + ' day' + (c.days === 1 ? '' : 's') + ')' : '') +
      '</p>' +
      '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">';

  rows.forEach(function (r) {
    body += '<tr>' +
      '<td style="padding:7px 0;border-bottom:1px solid ' + rule + '">' + esc_(r[0]) +
        (r[2] ? '<div style="color:' + muted + ';font-size:12px">' + esc_(r[2]) + '</div>' : '') + '</td>' +
      '<td style="padding:7px 0;border-bottom:1px solid ' + rule + ';text-align:right;white-space:nowrap">' +
        (r[1] < 0 ? '&minus; ' + money_(-r[1]) : money_(r[1])) + '</td></tr>';
  });

  body += '<tr><td style="padding:12px 0;border-top:2px solid ' + gold + ';font-weight:bold;font-size:16px">' +
            'Due to officer</td>' +
          '<td style="padding:12px 0;border-top:2px solid ' + gold + ';text-align:right;font-weight:bold;' +
            'font-size:16px;color:' + navy + '">' + money_(c.due) + '</td></tr></table>';

  if (c.mileageNote) {
    body += '<p style="margin:16px 0 0;padding:10px 12px;background:#E7EDF7;border-left:3px solid ' + navy +
            ';font-size:13px;color:' + muted + '">' + esc_(c.mileageNote) + '</p>';
  }
  if (c.flags.length) {
    body += '<div style="margin:16px 0 0;padding:10px 12px;background:#FBEDED;border-left:3px solid #9B2C2C;' +
            'font-size:13px"><b style="color:#9B2C2C">Before paying this claim</b><ul style="margin:6px 0 0;' +
            'padding-left:18px;color:' + muted + '">';
    c.flags.forEach(function (f) { body += '<li>' + esc_(f) + '</li>'; });
    body += '</ul></div>';
  }
  if (String(a[Q.NOTES] || '').trim()) {
    body += '<p style="margin:16px 0 0;font-size:13px;color:' + muted + '"><b>Officer notes:</b> ' +
            esc_(a[Q.NOTES]) + '</p>';
  }

  body += '<p style="margin:20px 0 0;font-size:11px;color:#77879E;border-top:1px solid ' + rule + ';padding-top:12px">' +
    'Meals paid at the GSA standard CONUS rate (' + money_(MIE) + '/day, ' + money_(MIE_PARTIAL) +
    ' on travel days). Lodging at actual cost, no ceiling. Mileage at the IRS rate for the date driven. ' +
    'Where flying was an option and cost less, mileage is capped at that figure.' +
    '</p></div></div>';

  return body;
}

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
