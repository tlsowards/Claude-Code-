#!/usr/bin/env python3
"""Build the PREA incident memo template, Markdown view.

Third view of drafts/supervisor-guide.json, alongside the full Decision Guide
and the short Field Card. The memo is what a supervisor actually produces, so
its classification block has to offer exactly the categories the tier chart
uses. The guard below enforces that: a memo that lets a supervisor tick a box
the chart does not recognise would quietly reintroduce the misclassification
the chart exists to prevent.
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'drafts', 'supervisor-guide.json')
OUT = os.path.join(ROOT, 'drafts', 'MEMO_TEMPLATE.md')


def check(data):
    """The memo's PREA classification options must match the tier chart."""
    errs = []
    line = ''
    for s in data['memo']['sections']:
        for f in s['fields']:
            if 'PREA classification:' in f:
                line = f
    if not line:
        errs.append('the memo has no "PREA classification:" line to check')
    else:
        offered = set(x.strip().lower() for x in re.findall(r'\[ \]\s*([^\[]+)', line))
        wanted = {'not prea', 'sexual harassment', 'sexual abuse'}
        got = set()
        for o in offered:
            for w in wanted:
                if w in o:
                    got.add(w)
        missing = wanted - got
        if missing:
            errs.append('the memo classification line is missing: %s'
                        % ', '.join(sorted(missing)))
        # And the chart must actually use those three categories.
        flags = ' '.join(t['prea_flag'] for t in data['tiers']).lower()
        for w in ('sexual harassment', 'sexual abuse'):
            if w not in flags:
                errs.append('the tier chart no longer uses the category "%s", '
                            'but the memo still offers it' % w)
    if errs:
        print('ABORTED, nothing written. The memo template and the tier chart disagree:')
        for e in errs:
            print('  ' + e)
        sys.exit(1)


def main():
    with open(SRC, encoding='utf-8') as fh:
        data = json.load(fh)
    if 'memo' not in data:
        print('ABORTED: drafts/supervisor-guide.json has no "memo" block.')
        return 1
    check(data)
    m = data['memo']
    L = []
    add = L.append

    add('# %s' % m['title'])
    add('')
    add('**%s**' % m['subtitle'])
    add('')
    add('> %s' % data['status'])
    add('')
    add(m['intro'])
    add('')
    add('---')
    add('')

    for s in m['sections']:
        add('## %s' % s['head'])
        add('')
        add('```')
        for f in s['fields']:
            add(f)
        add('```')
        add('')
        if s.get('note'):
            add('> %s' % s['note'])
            add('')

    add('---')
    add('')
    add('## %s' % m['avoid_head'])
    add('')
    for it in m['avoid']:
        add('- %s' % it)
    add('')
    add('## %s' % m['keep_head'])
    add('')
    for it in m['keep']:
        add('- %s' % it)
    add('')
    add('---')
    add('')
    add('*%s*' % m['caveat'])
    add('')
    add('*Generated from `drafts/supervisor-guide.json` by `npm run memo-template`. '
        'Do not hand-edit this file or the Word version. Drawn from gap register '
        'Revision %d.*' % data['register_revision'])
    add('')

    text = '\n'.join(L)
    if '—' in text or '–' in text:
        print('ABORTED, nothing written: em or en dash in the memo template.')
        return 1
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(text)
    print('wrote %s, %d sections, %d lines'
          % (os.path.relpath(OUT, ROOT), len(m['sections']), len(L)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
