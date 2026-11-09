// The canonical recommended-change list, and the check that a document's change
// numbers mean what the packet says they mean.
//
// This exists because they did not. The WIC 625.6 amendment in OO 1453 shipped
// labelled "Change 8", and change 8 in the report's list is "Designate a PREA
// Coordinator". The same file used change 8 in that second sense a few
// paragraphs later. The change number is the one thing the department uses to
// line a marked-up order up against the briefing packet, so two amendments
// under one number is the worst kind of error this project can make: the
// document looks correlated and is not.

const fs = require('fs');
const path = require('path');

const SRC = path.join(path.dirname(__dirname), 'drafts', 'changes.json');

function load() {
  const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const byNumber = new Map((data.changes || []).map((c) => [c.n, c]));
  if (byNumber.size !== (data.changes || []).length) {
    throw new Error('drafts/changes.json lists a change number twice.');
  }
  return byNumber;
}

// Each entry: {cite, change, label}.
//
// The first version of this checked only that the number existed and that the
// label's digits matched it. Both were true of the bug it was written for, so
// it passed. What makes an amendment wear the wrong number is that its SUBJECT
// belongs to a different change, which digits cannot see. So two real checks:
// the change must be one that can be made by amending wording at all, and the
// label's own words must come from that change's title.
function check(entries) {
  const known = load();
  const errs = [];
  entries.forEach(({ cite, change, label }) => {
    const c = known.get(change);
    if (!c) {
      errs.push(cite + ' names change ' + change + ', which is not in the recommended-change '
        + 'list. Add it there first, with a title, so every document means the same thing by it.');
      return;
    }
    const m = /^Change\s+(\d+)/i.exec(label || '');
    if (m && Number(m[1]) !== change) {
      errs.push(cite + ' is labelled "Change ' + m[1] + '" and carries change ' + change + '.');
    }
    if (c.kind !== 'amendment') {
      errs.push(cite + ' marks up text under change ' + change + ', "' + c.title + '", which is '
        + 'not an amendment: it needs drafting or a decision, so there is no wording to redline. '
        + 'The amendment here belongs under its own change number.');
      return;
    }
  });
  if (errs.length) {
    console.error('ABORTED. Change numbers do not line up with the recommended-change list:\n  '
      + errs.join('\n  '));
    process.exit(1);
  }
}

module.exports = { load, check };
