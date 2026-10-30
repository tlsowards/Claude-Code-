#!/usr/bin/env python3
"""Checks over counted claims in prose, shared by the brief and the package cover.

This lived twice, once in each builder, and needed the same fix five times. Four
of those were applied to both copies by hand; the fifth was the one that made
clear the arrangement was a liability rather than the usual per-builder
independence this project prefers. They were verified identical before being
pulled out here, so nothing silently diverged in the meantime.

The history is in the docstrings below and is worth reading before editing
either function. Both have been wrong in ways that let the bug they were written
for pass, which is why they now report what they could not check instead of
staying quiet about it.
"""

NUMBERS = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6,
    'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'eleven': 11, 'twelve': 12,
}


def check_counted_lists(strings):
    """Check a written-out count against the list it introduces, and never skip silently.

    Three attempts before this one, each failing differently, and the failures
    are the useful part. A lookbehind of (?<![A-Z]) under re.IGNORECASE matches
    any letter rather than any capital, so the first version never fired at all.
    The second split the list on a bare "and", which cannot tell a separator from
    a conjunction inside one item, so it counted a four-item list as five and
    passed the bug it was written for. The third required the colon to sit
    immediately after the count, which held for one file's phrasing and not the
    other's, so five of six count claims went unchecked and a real contradiction
    hid in the gap: one page said five documents and another said six.

    What this version does differently is report what it could not check. A
    guard that is silently partial is how all three earlier versions survived,
    so claims with no enumeration to compare against are returned as notes
    rather than dropped. Proportions ("three of the thirteen") and locators
    ("wrong in two documents") are not enumerations and are excluded by shape.
    """
    import re
    nums = '|'.join(NUMBERS)
    claim = re.compile(r'\b(%s)\s+(?:(\w+)\s+)?(documents?|items?|things?)\b' % nums, re.I)
    errs, unchecked = [], []
    for where, text in strings:
        for m in claim.finditer(text):
            lead = text[max(0, m.start() - 4):m.start()].lower()
            tail = text[m.end():m.end() + 10].lower()
            if lead.endswith('in ') or tail.startswith(' of '):
                continue                      # a proportion or a locator, not a list
            # Take the first colon that actually introduces a list, not simply
            # the first colon. A count and its list can sit two sentences apart,
            # so the search cannot be scoped to one sentence, but an unrelated
            # colon arriving first would otherwise be parsed as the list: review
            # found "Note: these matter." being read as a one-item list. A list
            # introducing colon is followed by a span containing a comma, which
            # separates it from an explanatory one. A genuine single item list
            # has no comma and is reported as unchecked rather than guessed at.
            body, colon = None, m.end()
            while True:
                colon = text.find(':', colon)
                if colon == -1:
                    break
                rest = text[colon + 1:].lstrip('* ')
                stop = rest.find('. ')
                span = rest if stop == -1 else rest[:stop]
                if ',' in span:
                    body = span
                    break
                colon += 1
            if body is None:
                unchecked.append('%s: "%s" introduces no list in this string'
                                 % (where, m.group(0)))
                continue
            parts = [re.sub(r'^and\s+', '', x.strip())
                     for x in body.split(',') if x.strip()]
            claimed = NUMBERS[m.group(1).lower()]
            if len(parts) != claimed:
                errs.append('%s says %s and then lists %d: %s'
                            % (where, m.group(0), len(parts), ' | '.join(parts)))
    return errs, unchecked
