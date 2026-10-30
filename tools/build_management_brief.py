#!/usr/bin/env python3
"""Build drafts/MANAGEMENT_BRIEF.md from drafts/management-brief.json.

The brief is the short view of the register written for managers rather than for
an auditor: where the exposure is, how the liability runs, and what is blocked on
a decision. It carries no findings of its own. Every exposure item names the
register rows it rests on, and the guard below fails the build if one of those
rows does not exist or no longer carries the status the item is written around.

That guard is the point of building it this way. The register moves every time a
document is produced. A brief that still describes a cured conflict as live is
the kind of error that gets noticed in the room, by the person who fixed it.
"""

import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
SRC = os.path.join(ROOT, 'drafts', 'management-brief.json')
REG = os.path.join(ROOT, 'prea-register.csv')
OUT = os.path.join(ROOT, 'drafts', 'MANAGEMENT_BRIEF.md')

# Order the status table is rendered in. Conflict sits at the top because it is
# the row the brief tells managers to read first.
STATUS_ORDER = ['Conflict', 'Not Addressed', 'Partial', 'Addressed', 'Not Evidenced']
PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low']


def load_register():
    with open(REG, encoding='utf-8') as fh:
        return list(csv.DictReader(fh))


def counts(rows, key, order):
    seen = {}
    for r in rows:
        seen[r[key]] = seen.get(r[key], 0) + 1
    unknown = sorted(set(seen) - set(order))
    if unknown:
        print('ABORTED, nothing written. The register has %s values this brief does not '
              'know how to order: %s' % (key, ', '.join(unknown)))
        print('              Add them to %s in tools/build_management_brief.py.'
              % ('STATUS_ORDER' if key == 'status' else 'PRIORITY_ORDER'))
        sys.exit(1)
    return [(k, seen[k]) for k in order if k in seen]


def check_rows(data, rows):
    """Every exposure item must name live register rows that still support it."""
    by_id = {r['id']: r for r in rows}
    errs = []
    for item in data['exposure']['items']:
        for rid in item['rows']:
            r = by_id.get(rid)
            if r is None:
                errs.append('item %d (%s) cites register row %s, which does not exist'
                            % (item['n'], item['head'], rid))
                continue
            # The brief is built around rows that state a wrong rule or state
            # nothing. A row that has since been scored Addressed has been cured,
            # and an item written around it is telling managers something stale.
            if r['status'] == 'Addressed':
                errs.append('item %d (%s) cites register row %s, which is now scored '
                            'Addressed. The finding it rests on has been cured.'
                            % (item['n'], item['head'], rid))
    if errs:
        print('ABORTED, nothing written. The brief and the register disagree:')
        for e in errs:
            print('  ' + e)
        print('              Rewrite the item against the register, or drop it. '
              'prea-register.csv is the source.')
        sys.exit(1)


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
    rows = load_register()

    bad = [(p, s) for p, s in walk(data) if '—' in s or '–' in s]
    if bad:
        print('ABORTED. Em or en dash found, which CLAUDE.md section 1 forbids:')
        for p, s in bad:
            print('  %s: %s' % (p, s[:90]))
        return 1

    nums = [i['n'] for i in data['exposure']['items']]
    if nums != list(range(1, len(nums) + 1)):
        print('ABORTED. The exposure items are out of sequence, or do not start at 1: %s'
              % ', '.join(str(n) for n in nums))
        print('              This section renders in literal order, not sorted by n, so an '
              'item spliced into the middle prints out of sequence.')
        return 1

    check_rows(data, rows)
    counted, unchecked = check_counted_lists(
        [('asks[%d]' % i, t) for i, t in enumerate(data['asks']['items'], 1)]
        + [('bottom_line[%d]' % i, t)
           for i, t in enumerate(data['bottom_line']['items'], 1)])
    if counted:
        print('ABORTED, nothing written. A written-out count does not match its own list:')
        for e in counted:
            print('  ' + e)
        sys.exit(1)
    for u in unchecked:
        print('  note: count not checked, %s' % u)


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
        'Drawn from gap register Revision %d, %d requirements against %d documents.'
        % (data['register_revision'], len(rows), 17))
    add('')
    add('Generated from `drafts/management-brief.json` by `npm run brief`. '
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
        for i, it in enumerate(s['items'], 1):
            add('%s %s' % ('%d.' % i if numbered else '-', it))
            add('')

    section('bottom_line', numbered=True)
    section('applies')

    s = data['standing']
    add('---')
    add('')
    add('## %s' % s['head'])
    add('')
    add(s['body'])
    add('')
    add('| Status | Rows | | Priority | Rows |')
    add('|---|---|---|---|---|')
    for i in range(max(len(by_status), len(by_priority))):
        a = ('**%s**' % by_status[i][0], str(by_status[i][1])) if i < len(by_status) else ('', '')
        b = ('**%s**' % by_priority[i][0], str(by_priority[i][1])) if i < len(by_priority) else ('', '')
        add('| %s | %s | | %s | %s |' % (a[0], a[1], b[0], b[1]))
    add('')
    add(s['note'])
    add('')

    e = data['exposure']
    add('---')
    add('')
    add('## %s' % e['head'])
    add('')
    add(e['body'])
    add('')
    for it in e['items']:
        add('### %d. %s' % (it['n'], it['head']))
        add('')
        add('*Register row%s %s*' % ('s' if len(it['rows']) > 1 else '', ', '.join(it['rows'])))
        add('')
        add('**What our policy says.** %s' % it['policy'])
        add('')
        add('**What the rule says.** %s' % it['rule'])
        add('')
        add('**Why it costs us.** %s' % it['why'])
        add('')
        add('**The fix.** %s' % it['fix'])
        add('')
        add('**What I need.** %s' % it['ask'])
        add('')

    section('unknown')
    section('liability')
    section('credit')

    w = data['waves']
    add('---')
    add('')
    add('## %s' % w['head'])
    add('')
    add(w['body'])
    add('')
    for wave in w['items']:
        add('### %s' % wave['head'])
        add('')
        add(wave['body'])
        add('')
        for it in wave['items']:
            add('- %s' % it)
        add('')

    section('asks', numbered=True)

    add('---')
    add('')
    add('*%s*' % data['caveat'])
    add('')

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(L))

    print('wrote %s, %d exposure items, %d lines, register has %d rows'
          % (os.path.relpath(OUT, ROOT), len(e['items']), len(L), len(rows)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
