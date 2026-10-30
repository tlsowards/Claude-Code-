#!/usr/bin/env python3
"""Fail if any deliverable leaks the names of the machinery that built it.

These documents go to administrators, County Counsel, and potentially into
litigation. A reader who finds a build command or a source filename in one of
them learns something true and irrelevant about how it was made, and the
document stops reading as a departmental work product. It had leaked into nine
of nine deliverables before anyone looked: footers naming the source JSON and
the build command, a project memory filename inside a citation note, and the
register's own path in the crosswalk prose.

Deliberately a sweep over the finished .docx files rather than a check inside
each builder. A builder added later cannot forget to call this, and the thing
it checks is the thing that actually ships.
"""

import glob
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DELIV = os.path.join(ROOT, 'deliverables')

# Each entry is (compiled pattern, what to say about it). Word splits a run at
# arbitrary points, so the text is stripped of tags before matching and the
# patterns stay short enough to survive that.
BANNED = [
    (re.compile(r'\bnpm run\b'), 'a build command'),
    (re.compile(r'\bdrafts/'), 'a source directory'),
    (re.compile(r'\btools/'), 'a source directory'),
    (re.compile(r'\bCLAUDE\.md\b'), 'the project memory file'),
    (re.compile(r'\bprea-register\b'), 'the register filename'),
    (re.compile(r'\.json\b'), 'a source filename'),
    (re.compile(r'\.csv\b'), 'a source filename'),
    (re.compile(r'\bgit\b(?!\w)'), 'version control'),
    (re.compile(r'\bREADME\b'), 'a source filename'),
    (re.compile(r'claude\.ai|anthropic', re.I), 'the tooling vendor'),
    (re.compile(r'\bhand-edit\b'), 'build jargon'),
]


def text_of(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml').decode('utf-8')
    return re.sub(r'<[^>]+>', '', xml)


def main():
    files = sorted(glob.glob(os.path.join(DELIV, '*.docx')))
    if not files:
        print('ABORTED. No deliverables found to check.')
        return 1
    bad = []
    for f in files:
        body = text_of(f)
        for pat, why in BANNED:
            for m in pat.finditer(body):
                start = max(0, m.start() - 60)
                bad.append((os.path.basename(f), why, m.group(0),
                            body[start:m.end() + 60].replace('\n', ' ')))
    if bad:
        print('ABORTED. Deliverables name the machinery that built them:')
        for name, why, hit, ctx in bad:
            print('  %s: %r, %s' % (name, hit, why))
            print('      ...%s...' % ctx.strip())
        print('              These documents go outside the department. Rewrite the text so it '
              'describes the work rather than the toolchain.')
        return 1
    print('checked %d deliverables, no build machinery named' % len(files))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
