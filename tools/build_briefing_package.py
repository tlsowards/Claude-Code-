#!/usr/bin/env python3
"""Build drafts/BRIEFING_PACKAGE.md from drafts/briefing-package.json.

This is the cover document for the whole package: what it is, what the
department is being asked to decide, and a tab by tab schedule of what is
attached. It is a transmittal, not a second brief. The reasoning lives in the
Management Brief at Attachment A and is not restated here.

Three guards, and they are the reason the cover is generated rather than typed.

The attachment schedule is checked against the deliverables directory in both
directions. A schedule listing a document that is not in the package, or a
document in the package that the schedule does not mention, is the exact error
that makes a reader distrust everything else in the binder.

The What we need list is read out of drafts/management-brief.json rather than
restated, so the cover and the brief cannot come to disagree about what is being
asked for.

The no-dash rule covers that borrowed list as well as this file's own text. It
did not at first, so a dash in an ask passed this builder and aborted the Word
one, leaving the two views of the cover saying different things. A guard that
checks only the file it lives in is not checking the document it produces.
"""

import csv
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
SRC = os.path.join(ROOT, 'drafts', 'briefing-package.json')
BRIEF = os.path.join(ROOT, 'drafts', 'management-brief.json')
REG = os.path.join(ROOT, 'prea-register.csv')
DELIV = os.path.join(ROOT, 'deliverables')
OUT = os.path.join(ROOT, 'drafts', 'BRIEFING_PACKAGE.md')
# Written by tools/make_package_pdf.py after a render pass, so the schedule can
# print the page each attachment starts on. Absent on a first build, and the
# schedule simply omits the column until the PDF has been assembled once.
PAGINATION = os.path.join(ROOT, 'drafts', 'package-pagination.json')

STATUS_ORDER = ['Conflict', 'Not Addressed', 'Partial', 'Addressed', 'Not Evidenced']
PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low']

# The cover is Attachment 0 and is not itself an attachment, so it is excluded
# from the directory comparison below.
COVER = 'PREA_Briefing_Package.docx'


def check_phrase_counts(strings):
    """Fail where the same counted phrase carries two different numbers.

    The contradiction that started this, five documents on one page and six on
    another about the same list, sat in a sentence with no list after it, so
    nothing that parses a list could ever have caught it. What it did have was a
    twin elsewhere in the same file saying something different. Comparing claims
    against each other catches that without either one needing to be checkable
    on its own.
    """
    seen, errs = {}, []
    pat = re.compile(r'\b(%s)\s+(documents?|items?|things?)\s+((?:\w+\s+){0,5}\w+)'
                     % '|'.join(NUMBERS), re.I)
    for where, text in strings:
        for m in pat.finditer(text):
            key = (m.group(2).lower().rstrip('s'), m.group(3).lower())
            n = NUMBERS[m.group(1).lower()]
            if key in seen and seen[key][0] != n:
                errs.append('"%s" at %s contradicts "%s" at %s'
                            % (m.group(0), where, seen[key][2], seen[key][1]))
            else:
                seen.setdefault(key, (n, where, m.group(0)))
    return errs


def check_schedule_counts(data):
    """Check the counts the attachments paragraph states against the schedule.

    These two numbers are computable, so they should never be taken on trust
    from prose. The paragraph said "Eight documents" and "The one exception is
    Attachment H" after a ninth attachment was added and a second tracked
    changes document with it, and the schedule guard did not look at the prose
    while the prose guard did not look at this block.
    """
    body = data['attachments'].get('body', '')
    items = data['attachments']['items']
    tracked = [it['tab'] for it in items if 'Tracked' in it['file']]
    errs = []
    said = re.search(r'\b(%s)\s+documents?\b' % '|'.join(NUMBERS), body, re.I)
    if not said:
        errs.append('the attachments paragraph states no document count, so the schedule '
                    'length is unchecked')
    elif NUMBERS[said.group(1).lower()] != len(items):
        errs.append('the attachments paragraph says %s documents and the schedule has %d'
                    % (said.group(1), len(items)))
    exc = re.search(r'\b(%s)\s+(?:of them\s+)?(?:is|are)?\s*exceptions?\b'
                    % '|'.join(NUMBERS), body, re.I)
    if tracked and not exc:
        errs.append('the schedule carries %d tracked changes documents (%s) and the '
                    'attachments paragraph counts no exceptions'
                    % (len(tracked), ', '.join(tracked)))
    elif exc and NUMBERS[exc.group(1).lower()] != len(tracked):
        errs.append('the attachments paragraph counts %s exception(s) and the schedule has '
                    '%d tracked changes documents (%s)'
                    % (exc.group(1), len(tracked), ', '.join(tracked)))
    for tab in tracked:
        if ('Attachment ' + tab) not in body and (' ' + tab + ',') not in body \
                and not re.search(r'\b%s\b(?=[^a-zA-Z])' % tab, body):
            errs.append('Attachment %s is a tracked changes document and the attachments '
                        'paragraph does not name it' % tab)
    if errs:
        print('ABORTED, nothing written. The attachments paragraph and the schedule disagree:')
        for e in errs:
            print('  ' + e)
        sys.exit(1)


def check_attachments(data):
    """The schedule and the directory have to agree, both ways."""
    listed = [it['file'] for it in data['attachments']['items']]
    on_disk = sorted(f for f in os.listdir(DELIV)
                     if f.endswith('.docx') and f != COVER)
    errs = []

    dupes = [f for f in set(listed) if listed.count(f) > 1]
    for f in sorted(dupes):
        errs.append('%s is listed twice in the schedule' % f)
    for f in listed:
        if f not in on_disk:
            errs.append('the schedule lists %s, which is not in deliverables/. The package '
                        'would be handed over with a tab that has nothing behind it.' % f)
    for f in on_disk:
        if f not in listed:
            errs.append('deliverables/%s is in the package and the schedule does not mention '
                        'it. A reader finding an unlisted document stops trusting the '
                        'schedule.' % f)

    tabs = [it['tab'] for it in data['attachments']['items']]
    expected = [chr(ord('A') + i) for i in range(len(tabs))]
    if tabs != expected:
        errs.append('the tabs run %s and should run %s. The cover refers to attachments by '
                    'letter in several places, so a gap or a repeat breaks those references.'
                    % (', '.join(tabs), ', '.join(expected)))

    if errs:
        print('ABORTED, nothing written. The attachment schedule and the package disagree:')
        for e in errs:
            print('  ' + e)
        sys.exit(1)
    return listed


def load_pagination(listed):
    """Start pages from the last render, if they still describe this schedule."""
    if not os.path.exists(PAGINATION):
        return {}
    with open(PAGINATION, encoding='utf-8') as fh:
        pg = json.load(fh)
    # Stale pagination is worse than none: a contents page pointing at the wrong
    # document is the error a reader cannot recover from. If the schedule has
    # changed since the render, drop it and let the next render rewrite it.
    if pg.get('files') != listed:
        return {}
    return pg.get('starts', {})


def load_asks():
    """The What we need list belongs to the brief. Read it, do not restate it."""
    if not os.path.exists(BRIEF):
        print('ABORTED, nothing written. drafts/management-brief.json is missing, and the '
              'cover reads its What we need list out of it rather than carrying its own.')
        sys.exit(1)
    with open(BRIEF, encoding='utf-8') as fh:
        brief = json.load(fh)
    asks = brief.get('asks', {}).get('items')
    if not asks:
        print('ABORTED, nothing written. drafts/management-brief.json has no "asks" items, so '
              'the cover has nothing to put under What we need.')
        sys.exit(1)
    return asks


def counts(rows, key, order):
    seen = {}
    for r in rows:
        seen[r[key]] = seen.get(r[key], 0) + 1
    unknown = sorted(set(seen) - set(order))
    if unknown:
        print('ABORTED, nothing written. The register has %s values this cover does not know '
              'how to order: %s' % (key, ', '.join(unknown)))
        sys.exit(1)
    return [(k, seen[k]) for k in order if k in seen]


def walk(node, path='$'):
    if isinstance(node, str):
        yield path, node
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk(v, '%s[%d]' % (path, i))
    elif isinstance(node, dict):
        for k, v in node.items():
            yield from walk(v, '%s.%s' % (path, k))


from prose_counts import NUMBERS, check_counted_lists  # noqa: E402


def main():
    with open(SRC, encoding='utf-8') as fh:
        data = json.load(fh)
    with open(REG, encoding='utf-8') as fh:
        rows = list(csv.DictReader(fh))

    # Load the asks before the dash check rather than after it. They come from
    # another file and are written straight into the cover, so leaving them out
    # of the guard let a dash pass this builder while aborting the Word one.
    asks = load_asks()
    # Scan every prose block, not a chosen two. The sentence that caused the
    # five-versus-six contradiction lived in "purpose", which the first version
    # of this call never looked at, so the fix for it was by hand and could
    # drift again. If a block holds prose, it gets checked.
    # attachments.body is deliberately absent: check_schedule_counts computes
    # its two numbers from the schedule itself. Where a count can be computed it
    # is checked exactly and not parsed out of prose, and running both only
    # produces noise. Parsing it flagged "Do not edit them in Word: the next
    # build overwrites the edit, and in the meantime..." as a two item list.
    prose = []
    for key in ('purpose', 'notincluded', 'howto', 'standing'):
        block = data.get(key) or {}
        if isinstance(block.get('body'), str):
            prose.append(('%s.body' % key, block['body']))
        for i, t in enumerate(block.get('items', []), 1):
            if isinstance(t, str):
                prose.append(('%s[%d]' % (key, i), t))
    prose += [('asks_from_brief[%d]' % i, t) for i, t in enumerate(asks, 1)]
    counted, unchecked = check_counted_lists(prose)
    contradictions = check_phrase_counts(prose)
    if contradictions:
        print('ABORTED, nothing written. The same counted phrase carries two numbers:')
        for c in contradictions:
            print('  ' + c)
        sys.exit(1)
    if counted:
        print('ABORTED, nothing written. A written-out count does not match its own list:')
        for e in counted:
            print('  ' + e)
        sys.exit(1)
    for u in unchecked:
        print('  note: count not checked, %s' % u)

    bad = [(p, s) for p, s in walk({'package': data, 'asks_from_brief': asks})
           if '—' in s or '–' in s]
    if bad:
        print('ABORTED. Em or en dash found, which CLAUDE.md section 1 forbids:')
        for p, s in bad:
            print('  %s: %s' % (p, s[:90]))
        if any(p.startswith('$.asks_from_brief') for p, _ in bad):
            print('              A path under $.asks_from_brief is in '
                  'drafts/management-brief.json, not in this file.')
        return 1

    listed = check_attachments(data)
    check_schedule_counts(data)
    starts = load_pagination(listed)
    by_status = counts(rows, 'status', STATUS_ORDER)
    by_priority = counts(rows, 'priority', PRIORITY_ORDER)

    L = []
    add = L.append

    add('# %s' % data['title'])
    add('')
    add('**%s**' % data['subtitle'])
    add('')
    add('> %s' % data['status'])
    add('')
    add('Sacramento County Probation Department, Youth Detention Facility. '
        'Gap register Revision %d, %d requirements against 17 departmental documents.'
        % (data['register_revision'], len(rows)))
    add('')
    add('Generated from `drafts/briefing-package.json` by `npm run package`. '
        'Edit the JSON, not this file.')
    add('')

    def section(key, numbered=False):
        s = data[key]
        add('---')
        add('')
        add('## %s' % s['head'])
        add('')
        if s.get('body'):
            add(s['body'])
            add('')
        for i, it in enumerate(s.get('items', []), 1):
            add('%s %s' % ('%d.' % i if numbered else '-', it))
            add('')

    section('purpose')

    s = data['ask']
    add('---')
    add('')
    add('## %s' % s['head'])
    add('')
    add(s['body'])
    add('')
    for i, it in enumerate(asks, 1):
        add('%d. %s' % (i, it))
        add('')

    s = data['standing']
    add('---')
    add('')
    add('## %s' % s['head'])
    add('')
    add(s['body'])
    add('')
    add('| Status | Requirements | | Priority | Requirements |')
    add('|---|---|---|---|---|')
    for i in range(max(len(by_status), len(by_priority))):
        a = ('**%s**' % by_status[i][0], str(by_status[i][1])) if i < len(by_status) else ('', '')
        b = ('**%s**' % by_priority[i][0], str(by_priority[i][1])) if i < len(by_priority) else ('', '')
        add('| %s | %s | | %s | %s |' % (a[0], a[1], b[0], b[1]))
    add('')
    add(s['note'])
    add('')

    a = data['attachments']
    add('---')
    add('')
    add('## %s' % a['head'])
    add('')
    add(a['body'])
    add('')
    if starts:
        add('| Tab | Document | Page | Who it is for |')
        add('|---|---|---|---|')
        for it in a['items']:
            add('| **%s** | %s | %s | %s |'
                % (it['tab'], it['name'], starts.get(it['file'], ''), it['who']))
    else:
        add('| Tab | Document | Who it is for |')
        add('|---|---|---|')
        for it in a['items']:
            add('| **%s** | %s | %s |' % (it['tab'], it['name'], it['who']))
    add('')
    for it in a['items']:
        add('### Attachment %s. %s' % (it['tab'], it['name']))
        add('')
        add(it['what'])
        add('')
        add('*%s*' % it['note'])
        add('')

    section('howto')
    section('notincluded')

    add('---')
    add('')
    add('*%s*' % data['caveat'])
    add('')

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(L))

    print('wrote %s, %d attachments, %d asks, %d lines%s'
          % (os.path.relpath(OUT, ROOT), len(a['items']), len(asks), len(L),
             ', with page numbers' if starts else ', no page numbers yet'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
