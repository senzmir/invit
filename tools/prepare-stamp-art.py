#!/usr/bin/env python3
"""Turn a round stamp illustration into the artwork the stamp frame expects.

    python3 tools/prepare-stamp-art.py <image>
    python3 tools/build-stamp-art.py

The frame already draws its own perforations and red border, so a design that
comes with its own scalloped rim ends up with two sets of teeth. This finds that
rim, crops just inside it, maps the drawing onto the stamp's own paper and ink so
the artwork's ground and the stamp stock are the same colour with no seam, and
floods everything outside the circle with that paper.
"""
import pathlib
import sys

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
INK = (91, 53, 36)
PAPER = (246, 238, 218)      # the stamp's stock, from stampSvg
SIZE = 420


def dark_runs(px, width, y, threshold=170):
    runs, start = [], None
    for x in range(width):
        dark = sum(px[x, y]) / 3 < threshold
        if dark and start is None:
            start = x
        elif not dark and start is not None:
            runs.append((start, x - 1))
            start = None
    return runs


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src = Image.open(sys.argv[1]).convert('RGB')
    w, h = src.size
    px = src.load()

    runs = dark_runs(px, w, h // 2)
    if len(runs) < 4:
        raise SystemExit('could not find the rings — is this a round stamp design?')

    # outermost run is the scalloped rim; the one inside it is the ruled circle
    rule_left = runs[1][0]
    rule_right = runs[-2][1]
    cx = (rule_left + rule_right) / 2
    radius = (rule_right - rule_left) / 2
    margin = radius * 0.035
    box = (round(cx - radius - margin), round(cx - radius - margin),
           round(cx + radius + margin), round(cx + radius + margin))
    print(f'rim at {runs[0]}, ruled circle {rule_left}..{rule_right} -> crop {box}')

    art = src.crop(box).resize((SIZE, SIZE), Image.LANCZOS)

    # the drawing's own white, so the ground maps exactly onto the stamp stock
    corner = art.convert('L').load()[3, 3]
    white = max(200, corner)

    grey = art.convert('L').load()
    out = Image.new('RGB', art.size)
    op = out.load()
    for y in range(SIZE):
        for x in range(SIZE):
            t = min(1.0, grey[x, y] / white)
            op[x, y] = tuple(round(INK[i] + (PAPER[i] - INK[i]) * t) for i in range(3))

    mask = Image.new('L', art.size, 0)
    r = SIZE / 2 - 2
    ImageDraw.Draw(mask).ellipse((SIZE / 2 - r, SIZE / 2 - r, SIZE / 2 + r, SIZE / 2 + r), fill=255)
    out = Image.composite(out, Image.new('RGB', art.size, PAPER), mask)

    # no dithering: everything sits on one ink->paper ramp, and the flat ground
    # has to stay genuinely flat or the join with the stamp stock shows as noise
    dest = ROOT / 'assets' / 'stamp' / 'couple.png'
    out.quantize(colors=128, method=Image.MEDIANCUT, dither=Image.NONE).save(dest, optimize=True)
    print(f'wrote {dest.relative_to(ROOT)} ({dest.stat().st_size // 1024} KB) — '
          f'now run: python3 tools/build-stamp-art.py')


if __name__ == '__main__':
    main()
