#!/usr/bin/env python3
"""Build drafts/SUPERVISOR_GUIDE.md from drafts/supervisor-guide.json.

The JSON is the source of truth. This Markdown and the Word file built by
tools/build_supervisor_guide_docx.js are both views of it, the same arrangement
the register and the redlines use.

Enforces the no-em-dash rule from CLAUDE.md section 1, because this text is
headed for a job aid that supervisors will read on shift.
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'drafts', 'supervisor-guide.json')
OUT = os.path.join(ROOT, 'drafts', 'SUPERVISOR_GUIDE.md')

CAVEAT = ("This is not legal advice. It is a policy and standards analysis prepared for "
          "internal use. The CANRA determinations in particular route to County Counsel "
          "before this issues to anyone.")


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

    bad = [(p, s) for p, s in walk(data) if '—' in s or '–' in s]
    if bad:
        print('ABORTED. Em or en dash found, which CLAUDE.md section 1 forbids:')
        for p, s in bad:
            print('  %s: %s' % (p, s[:90]))
        return 1

    tiers = [t['n'] for t in data['tiers']]
    if tiers != sorted(tiers) or len(set(tiers)) != len(tiers):
        print('ABORTED. Tier numbers are not unique and ascending: %s' % tiers)
        return 1

    L = []
    add = L.append

    add('# %s' % data['title'])
    add('')
    add(data['subtitle'])
    add('')
    add('> **%s**' % data['status'])
    add('')
    add('Sacramento County Probation Department, Youth Detention Facility. '
        'Drawn from gap register Revision %d.' % data['register_revision'])
    add('')
    add('> %s' % CAVEAT)
    add('')
    add('Generated from `drafts/supervisor-guide.json` by `npm run supervisor-guide`. '
        'Edit the JSON, not this file.')
    add('')

    add('## Why this exists')
    add('')
    add(data['why'])
    add('')

    add('## Four rules that apply to every incident')
    add('')
    for i, pr in enumerate(data['principles'], 1):
        add('**%d. %s**' % (i, pr['head']))
        add('')
        add(pr['body'])
        add('')

    add('## The tiers at a glance')
    add('')
    add('| Tier | Conduct | PREA | CPS report |')
    add('|---|---|---|---|')
    for t in data['tiers']:
        short = t['conduct'].split('.')[0]
        add('| %d | %s | **%s** | **%s** |'
            % (t['n'], short, t['prea_flag'], t['cps_flag']))
    add('')

    for t in data['tiers']:
        add('---')
        add('')
        add('## Tier %d' % t['n'])
        add('')
        add('**The conduct.** %s' % t['conduct'])
        add('')
        add('**PREA: %s.** %s' % (t['prea_flag'], t['prea']))
        add('')
        add('**CPS: %s.** %s' % (t['cps_flag'], t['cps']))
        add('')
        add('**Required steps**')
        add('')
        for s in t['steps']:
            add('- %s' % s)
        add('')

    add('---')
    add('')
    add('## %s' % data['flips']['head'])
    add('')
    for it in data['flips']['items']:
        add('- %s' % it)
    add('')

    add('## %s' % data['doubt']['head'])
    add('')
    add(data['doubt']['body'])
    add('')

    add('## %s' % data['defects']['head'])
    add('')
    add(data['defects']['body'])
    add('')
    for d in data['defects']['items']:
        add('**%s**' % d['head'])
        add('')
        add(d['body'])
        add('')

    add('## %s' % data['counsel']['head'])
    add('')
    for it in data['counsel']['items']:
        add('- %s' % it)
    add('')
    add('---')
    add('')
    add('*%s*' % CAVEAT)
    add('')

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(L))

    print('wrote %s, %d tiers, %d lines'
          % (os.path.relpath(OUT, ROOT), len(data['tiers']), len(L)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
