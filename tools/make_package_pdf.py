#!/usr/bin/env python3
"""Render the briefing package to one PDF: the cover, then every attachment.

The point of this file is that the department gets a single document rather than
eight files and an instruction to read them in a particular order. Tab order is
read from drafts/briefing-package.json, which the Markdown builder has already
checked against the deliverables directory, so the PDF cannot be assembled in a
different order from the schedule printed inside it.

It runs more than once on purpose. A page number cannot be printed in the
schedule until the attachments have been rendered, and rebuilding the cover to
carry those numbers can change the cover's own length, which moves every number
it just printed. So each pass writes the pagination it measured, rebuilds the
cover from it, and renders again, until a pass measures what the cover already
says. Converging is checked rather than assumed: if it has not settled by the
last pass, nothing is written and the mismatch is printed.

Needs LibreOffice for the conversion and pypdf for the merge. Both are present
in this container; the conversion is slow, about a second a page.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'drafts', 'briefing-package.json')
DELIV = os.path.join(ROOT, 'deliverables')
COVER = 'PREA_Briefing_Package.docx'
OUT = os.path.join(DELIV, 'PREA_Briefing_Package_Complete.pdf')
PAGINATION = os.path.join(ROOT, 'drafts', 'package-pagination.json')
MAX_PASSES = 4


def soffice():
    for name in ('soffice', 'libreoffice'):
        found = shutil.which(name)
        if found:
            return found
    print('ABORTED, nothing written. LibreOffice is not on PATH, so the attachments cannot '
          'be rendered. The Word files are unaffected; only the combined PDF needs this.')
    sys.exit(1)


def to_pdf(exe, docx, outdir):
    subprocess.run([exe, '--headless', '--convert-to', 'pdf', '--outdir', outdir, docx],
                   check=True, capture_output=True, timeout=600)
    pdf = os.path.join(outdir, os.path.splitext(os.path.basename(docx))[0] + '.pdf')
    if not os.path.exists(pdf):
        print('ABORTED, nothing written. LibreOffice reported success but produced no PDF '
              'for %s.' % os.path.basename(docx))
        sys.exit(1)
    return pdf


def render(exe, order, tmp, writer_cls, reader_cls):
    """One pass. Returns the writer plus the measured start page of each file."""
    writer = writer_cls()
    starts, rows = {}, []
    for tab, name in order:
        pdf = to_pdf(exe, os.path.join(DELIV, name), tmp)
        reader = reader_cls(pdf)
        start = len(writer.pages) + 1
        for page in reader.pages:
            writer.add_page(page)
        starts[name] = start
        label = 'Cover' if tab is None else 'Attachment %s' % tab
        rows.append((label, name, start, len(reader.pages)))
        # A bookmark per document, so the merged file is navigable rather than
        # being a hundred and sixty pages of undifferentiated scroll.
        writer.add_outline_item('%s. %s' % (label, os.path.splitext(name)[0]), start - 1)
    return writer, starts, rows


def rebuild_cover(files, starts):
    """Write the measured pagination, then rebuild the cover from it."""
    with open(PAGINATION, 'w', encoding='utf-8') as fh:
        json.dump({'files': files, 'starts': starts}, fh, indent=1)
        fh.write('\n')
    for cmd in (['python3', os.path.join(ROOT, 'tools', 'build_briefing_package.py')],
                ['node', os.path.join(ROOT, 'tools', 'build_briefing_package_docx.js')]):
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        if r.returncode != 0:
            print('ABORTED, nothing written. Rebuilding the cover failed:')
            print((r.stdout + r.stderr).strip())
            sys.exit(1)


def main():
    try:
        from pypdf import PdfWriter, PdfReader
    except ImportError:
        print('ABORTED, nothing written. pypdf is not installed, so the rendered attachments '
              'cannot be merged. Run: python3 -m pip install pypdf')
        return 1

    with open(SRC, encoding='utf-8') as fh:
        data = json.load(fh)

    attachments = [(it['tab'], it['file']) for it in data['attachments']['items']]
    order = [(None, COVER)] + attachments
    missing = [f for _, f in order if not os.path.exists(os.path.join(DELIV, f))]
    if missing:
        print('ABORTED, nothing written. These are in the schedule and not on disk: %s'
              % ', '.join(missing))
        print('              Run the builds first: npm run package, and the build for each '
              'attachment.')
        return 1

    exe = soffice()
    files = [f for _, f in attachments]
    printed = None   # what the cover currently claims, from the previous pass

    for attempt in range(1, MAX_PASSES + 1):
        with tempfile.TemporaryDirectory() as tmp:
            writer, starts, rows = render(exe, order, tmp, PdfWriter, PdfReader)
            measured = {f: starts[f] for f in files}

            if printed == measured:
                with open(OUT, 'wb') as fh:
                    writer.write(fh)
                print('wrote %s, %d pages, settled on pass %d'
                      % (os.path.relpath(OUT, ROOT), len(writer.pages), attempt))
                for label, name, start, pages in rows:
                    print('  %-14s p%-4d %2d pages  %s' % (label, start, pages, name))
                return 0

            if attempt == MAX_PASSES:
                print('ABORTED, nothing written. The schedule page numbers did not settle in '
                      '%d passes.' % MAX_PASSES)
                print('  the cover prints %s' % (printed or 'nothing yet'))
                print('  the render measured %s' % measured)
                print('              Each pass changed the cover length, which moved the '
                      'numbers it had just printed. Shorten the cover, or drop the page '
                      'column by deleting %s.' % os.path.relpath(PAGINATION, ROOT))
                return 1

        rebuild_cover(files, measured)
        printed = measured

    return 1


if __name__ == '__main__':
    raise SystemExit(main())
