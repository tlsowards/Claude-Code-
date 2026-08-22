# stamp_logo.py

Puts your logo on every slide of a PowerPoint deck, so a batch of decks can be
branded consistently before being published.

## Requirements

    pip install python-pptx pillow

## Usage

One deck:

    python3 tools/stamp_logo.py --logo logo.png --in deck.pptx --out branded/

A whole folder (searched recursively):

    python3 tools/stamp_logo.py --logo logo.png --in decks/ --out branded/

Originals are never modified — branded copies are written to `--out`, keeping
the folder structure of `--in`.

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `--position` | `bottom-right` | Which corner: `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| `--width-pct` | `12` | Logo width as a percentage of slide width |
| `--margin-pct` | `3` | Gap from the slide edge, as a percentage of slide width |
| `--opacity` | `1.0` | Below 1.0 gives a subtle watermark, e.g. `0.35` |
| `--skip-first` | off | Leave the title slide alone |
| `--trim` | off | Crop transparent padding so the logo sits tight in the corner |
| `--behind` | off | Put the logo behind slide text instead of on top |

A transparent PNG gives the best result. `--trim` matters when the logo file has
a lot of empty space around the artwork, which would otherwise make the logo
look small and float away from the corner.

## Re-running

Logos added by this script are named `BrandLogo`. A second run finds and
replaces them rather than stacking a second copy, so you can safely re-run with
different sizing until it looks right.

## Batch runs

A folder run is searched recursively and tolerates a messy folder: `.PPTX` is
matched as well as `.pptx`, Office lock files (`~$...`) are ignored, and a deck
that can't be opened is reported and skipped rather than aborting the batch
(the exit code is non-zero if any were skipped).

`--out` may sit inside `--in` — already-branded copies are excluded from the
search, so a second run re-brands the originals rather than double-stamping its
own output.

## Notes

Slide content is left untouched — shapes, text, and speaker notes all survive.
Very large decks (hundreds of MB of embedded video) are best processed locally,
since they are slow to move through cloud connectors.
