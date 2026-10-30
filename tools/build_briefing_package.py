#!/usr/bin/env python3
"""Build drafts/BRIEFING_PACKAGE.md from drafts/briefing-package.json.

This is the cover document for the whole package: what it is, what the
department is being asked to decide, and a tab by tab schedule of what is
attached. It is a transmittal, not a second brief. The reasoning lives in the
Management Brief at Attachment A and is not restated here.

Two guards, and they are the reason the cover is generated rather than typed.

The attachment schedule is checked against the deliverables directory in both
directions. A schedule listing a document that is not in the package, or a
document in the package that the schedule does not mention, is the exact error
that makes a reader distrust everything else in the binder.

The What we need list is read out of drafts/management-brief.json rather than
restated, so the cover and the brief cannot come to disagree about what is being
asked for.
"""

import csv
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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


def main():
    with open(SRC, encoding='utf-8') as fh:
        data = json.load(fh)
    with open(REG, encoding='utf-8') as fh:
        rows = list(csv.DictReader(fh))

    bad = [(p, s) for p, s in walk(data) if '—' in s or '–' in s]
    if bad:
        print('ABORTED. Em or en dash found, which CLAUDE.md section 1 forbids:')
        for p, s in bad:
            print('  %s: %s' % (p, s[:90]))
        return 1

    listed = check_attachments(data)
    starts = load_pagination(listed)
    asks = load_asks()
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
