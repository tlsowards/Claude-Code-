#!/usr/bin/env python3
"""Build drafts/REDLINES.md from drafts/redlines.json.

The JSON is the source of truth for the amendment language. The Markdown here
and the Word file built by tools/build_redlines_docx.js are both views of it,
regenerated rather than hand edited, the same arrangement the register and the
crosswalk use.

Also enforces the no-em-dash rule from CLAUDE.md section 1 across the source,
because the amendment language is meant to be pasted into departmental orders.
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'drafts', 'redlines.json')
OUT = os.path.join(ROOT, 'drafts', 'REDLINES.md')

CAVEAT = (
    "This is not legal advice. It is proposed amendment language prepared for "
    "internal remediation planning. Statutory questions, and every item in a "
    "*Before adoption* block, route to County Counsel."
)


def walk(node, path='$'):
    """Yield every string in the JSON with the path that reached it."""
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

    bad = [(p, s) for p, s in walk(data) if '—' in s or '–' in s]
    if bad:
        print('ABORTED. Em or en dash found, which CLAUDE.md section 1 forbids:')
        for p, s in bad:
            print('  %s: %s' % (p, s[:90]))
        return 1

    items = data['items']
    seen = [i['n'] for i in items]
    if seen != sorted(seen) or len(set(seen)) != len(seen):
        print('ABORTED. Item numbers are not unique and ascending: %s' % seen)
        return 1

    L = []
    add = L.append

    add('# Redlines: %s' % data['set'])
    add('')
    add('%s' % data['subtitle'])
    add('')
    add('Sacramento County Probation Department, Youth Detention Facility. '
        'Drawn from gap register Revision %d.' % data['register_revision'])
    add('')
    add('> %s' % CAVEAT)
    add('')
    add('Generated from `drafts/redlines.json` by `npm run redlines`. '
        'Edit the JSON, not this file.')
    add('')

    add('## How to read a redline')
    add('')
    add('Each change gives the provision to strike, the language to insert in its place, '
        'the conforming edits the amendment needs to be complete, and a *Before adoption* '
        'block. Read that block first.')
    add('')
    add('Struck text is shown ~~with a line through it~~. Where the source order has not '
        'been produced to this review, the struck text is a reconstruction of what the '
        'register describes, not a quotation, and each item says which it is. Inserted '
        'language is written to be pasted into the order with its own numbering.')
    add('')

    add('### Source documents')
    add('')
    add('Produced and read directly:')
    add('')
    for d in data['produced']:
        add('- %s' % d)
    add('')
    add('Not produced. Every provision cited in these documents traces to the register, '
        'which traces to the earlier review that read them. Confirm each section number '
        'and its wording against the PDF before any of this is circulated:')
    add('')
    for d in data['not_produced']:
        add('- %s' % d)
    add('')

    add('### The seven changes')
    add('')
    add('| # | Change | Priority | Document |')
    add('|---|---|---|---|')
    for it in items:
        add('| %d | %s | %s | %s |'
            % (it['n'], it['title'], it['priority'], it['targets'][0]))
    add('')

    for it in items:
        add('---')
        add('')
        add('## %d. %s' % (it['n'], it['title']))
        add('')
        add('| | |')
        add('|---|---|')
        add('| **Priority** | %s |' % it['priority'])
        add('| **Document** | %s |' % '<br>'.join(it['targets']))
        add('| **Authority** | %s |' % '<br>'.join(it['authority']))
        add('| **Register rows** | %s |'
            % ', '.join(str(r) for r in it['rows']))
        add('')
        add('### The defect')
        add('')
        add(it['problem'])
        add('')
        add('### Strike')
        add('')
        for s in it['strike']:
            add('**%s**' % s['cite'])
            add('')
            add('> ~~%s~~' % s['text'])
            add('')
            # status is stored ready to print, so this view and the Word view
            # cannot drift. Do not re-case it here.
            add('*%s*' % s['status'])
            add('')
        add('### Insert')
        add('')
        for ins in it['insert']:
            add('**%s**' % ins['cite'])
            add('')
            add('> **%s**' % ins['heading'])
            add('>')
            for para in ins['text']:
                add('> %s' % para)
                add('>')
            L.pop()
            add('')
        add('### Conforming changes')
        add('')
        for c in it['conforming']:
            add('- %s' % c)
        add('')
        add('### Why')
        add('')
        add(it['why'])
        add('')
        add('### Before adoption')
        add('')
        for b in it['before_adoption']:
            add('- %s' % b)
        add('')

    add('---')
    add('')
    add('*%s*' % CAVEAT)
    add('')

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(L))

    print('wrote %s, %d items, %d lines'
          % (os.path.relpath(OUT, ROOT), len(items), len(L)))
    print('no em dashes in %d strings' % sum(1 for _ in walk(data)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
