#!/usr/bin/env python3
"""Build the supervisor field card, Markdown view, from drafts/supervisor-guide.json.

This is the SHORT view of the same source the full Supervisor Decision Guide is
built from. It carries no findings of its own: every answer on it traces to a
tier or a section in the guide, and the guide carries the authority.

The guard below is the point of building it this way. A field card that says a
different thing from the guide is worse than no field card, so the build fails
if the two disagree about how many tiers there are, what they are numbered, or
what the PREA and CPS answers are.
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'drafts', 'supervisor-guide.json')
OUT = os.path.join(ROOT, 'drafts', 'FIELD_CARD.md')


def check(data):
    """Fail the build if the card and the guide disagree about the tiers."""
    g, f = data['tiers'], data['field']['tiers']
    errs = []
    if len(g) != len(f):
        errs.append('the guide has %d tiers and the card has %d' % (len(g), len(f)))
    for a, b in zip(g, f):
        if a['n'] != b['n']:
            errs.append('tier order differs: guide %s, card %s' % (a['n'], b['n']))
            continue
        # The card abbreviates, so it must be a prefix-free summary rather than a
        # contradiction. Checking the strong words is enough to catch a real flip.
        abuse_g = 'SEXUAL ABUSE' in a['prea_flag']
        abuse_f = 'SEXUAL ABUSE' in b['prea']
        if abuse_g != abuse_f:
            errs.append('tier %s: guide and card disagree on whether it is sexual abuse' % a['n'])
        yes_g = a['cps_flag'].strip().upper().startswith('YES')
        yes_f = b['cps'].strip().upper().startswith('YES')
        if yes_g != yes_f:
            errs.append('tier %s: guide says CPS "%s", card says "%s"'
                        % (a['n'], a['cps_flag'], b['cps']))
    if errs:
        print('ABORTED, nothing written. The field card contradicts the Decision Guide:')
        for e in errs:
            print('  ' + e)
        print('              Both are built from drafts/supervisor-guide.json. Fix the card '
              'to match the tier it summarises, or fix the tier.')
        sys.exit(1)


CARD_STEPS = 5


def check_length(f):
    """Fail the build if the card grows back past one double sided page.

    It was cut to five steps on 10/29 after it had reached six steps plus a ten
    role matrix and an eight phase response sequence. Those now live in the
    Supervisor Decision Guide. Length is the whole point of this view, so it is
    enforced here rather than left to whoever next reads the output.
    """
    errs = []
    if len(f['steps']) != CARD_STEPS:
        errs.append('the card has %d steps and is built for %d. Added detail goes in the '
                    'Supervisor Decision Guide, not here.' % (len(f['steps']), CARD_STEPS))
    for key, what in (('after', 'response sequence'), ('roles', 'role matrix')):
        if key in f:
            errs.append('the %s is back under "field". It belongs at the top level of the '
                        'JSON, where the Decision Guide renders it.' % what)
    if errs:
        print('ABORTED, nothing written. The field card is over length:')
        for e in errs:
            print('  ' + e)
        sys.exit(1)


def check_actions(f):
    """Fail the build if the card's compact action rows drift from the full list.

    The card carries one line per block; the Decision Guide carries the blocks in
    full. Same arrangement as the tier chart, and for the same reason: a card that
    tells a supervisor something the guide does not is worse than no card.
    """
    full = [b['head'] for b in f['actions']]
    short = [r['head'] for r in f.get('actnow', [])]
    if full != short:
        print('ABORTED, nothing written. The card\'s action rows do not match the full '
              'action blocks the Decision Guide renders:')
        print('  guide blocks: %s' % ' | '.join(full))
        print('  card rows:    %s' % ' | '.join(short))
        print('              Both are field.actions and field.actnow in '
              'drafts/supervisor-guide.json. One row per block, same heads, same order.')
        sys.exit(1)


def main():
    with open(SRC, encoding='utf-8') as fh:
        data = json.load(fh)
    if 'field' not in data:
        print('ABORTED: drafts/supervisor-guide.json has no "field" block.')
        return 1
    check(data)
    f = data['field']
    check_length(f)
    check_actions(f)
    L = []
    add = L.append

    add('# %s' % f['title'])
    add('')
    add('**%s**' % f['subtitle'])
    add('')
    add('> %s' % data['status'])
    add('')
    add(f['intro'])
    add('')
    add('---')
    add('')

    steps = {s['n']: s for s in f['steps']}

    s = steps[1]
    add('## Step %d. %s' % (s['n'], s['head']))
    add('')
    add(s['why'])
    add('')
    add('| %s |' % ' | '.join(s['columns']))
    add('|%s' % ('---|' * len(s['columns'])))
    for row in s['rows']:
        add('| %s |' % ' | '.join(row))
    add('')

    s = steps[2]
    add('## Step %d. %s' % (s['n'], s['head']))
    add('')
    add(s['why'])
    add('')
    add('| Tier | What happened | Is it PREA? | CPS report? |')
    add('|---|---|---|---|')
    for t in f['tiers']:
        add('| **%d** | %s | %s | **%s** |' % (t['n'], t['what'], t['prea'], t['cps']))
    add('')

    s = steps[3]
    add('## Step %d. %s' % (s['n'], s['head']))
    add('')
    add(s['why'])
    add('')
    for it in f['flips']:
        add('- %s' % it)
    add('')

    s = steps[4]
    add('## Step %d. %s' % (s['n'], s['head']))
    add('')
    add(s['why'])
    add('')
    add('| When | Do |')
    add('|---|---|')
    for r in f['actnow']:
        add('| **%s** | %s |' % (r['head'], r['line']))
    add('')

    s = steps[5]
    add('## Step %d. %s' % (s['n'], s['head']))
    add('')
    add(s['why'])
    add('')
    add('```')
    for line in f['record']['lines']:
        add(line)
    add('```')
    add('')
    add('---')
    add('')
    add(f['doubt'])
    add('')
    add('*%s*' % f['caveat'])
    add('')
    add('*Generated from `drafts/supervisor-guide.json` by `npm run field-card`. '
        'Do not hand-edit this file or the Word version; the next build overwrites them. '
        'Drawn from gap register Revision %d.*' % data['register_revision'])
    add('')

    text = '\n'.join(L)
    if '—' in text:
        print('ABORTED, nothing written: em dash in the field card.')
        return 1
    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(text)
    print('wrote %s, %d tiers, %d lines'
          % (os.path.relpath(OUT, ROOT), len(f['tiers']), len(L)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
