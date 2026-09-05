#!/usr/bin/env python3
"""Paint the watercolour flowers into assets/flowers.js.

    python3 tools/build-flowers.py

The floral reference is a painted border -- forget-me-nots, cream blossoms with
orange hearts, soft yellow blooms, gypsophila and sage stems -- laid around the
edge of a white card. Vector flowers cannot do that: watercolour reads as
watercolour because of what happens at the *edge* of a wash, where the pigment
creeps outward and then settles in a darker rim as the water dries, and because
the paper's tooth granulates the colour unevenly inside it.

So every petal here is painted rather than drawn:

  * a soft body that fades toward the middle, plus a rim of settled pigment
    just inside the boundary;
  * the boundary itself pushed around by a smooth noise field, so no two petals
    are the same shape and none of them is a perfect ellipse;
  * granulation over the whole wash, so flat colour never happens;
  * washes composited by multiplication, the way real layers of transparent
    paint darken where they overlap.

Everything is painted on white and shown with `mix-blend-mode: multiply`, which
is also how the real thing works: white is where no pigment landed, so the
paper -- with its own texture and colour -- shows through untouched. That also
means these can be JPEGs. An alpha PNG of the same art costs several times as
much for a picture that is nine-tenths white.
"""
import base64
import io
import json
import math
import pathlib

import numpy as np
from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
SS = 2                      # supersampling; the washes are soft, 2x is plenty

CREAM = (0.985, 0.935, 0.885)
BLUSH = (0.96, 0.74, 0.70)
ROSE = (0.91, 0.60, 0.58)
HEART = (0.92, 0.56, 0.12)
BLUE = (0.67, 0.78, 0.96)
BLUE_DEEP = (0.36, 0.51, 0.84)
YELLOW = (0.98, 0.84, 0.47)
YELLOW_DEEP = (0.93, 0.69, 0.26)
SAGE = (0.66, 0.72, 0.56)
SAGE_DEEP = (0.44, 0.53, 0.38)
GYP = (0.99, 0.975, 0.94)


def smooth(rng, h, w, cells):
    """Low-frequency noise: a small random grid blown up smoothly."""
    lo = rng.normal(size=(cells, cells)).astype(np.float32)
    img = Image.fromarray(lo, mode='F').resize((w, h), Image.BICUBIC)
    out = np.asarray(img, dtype=np.float64)
    return out / (np.abs(out).max() + 1e-9)


class Paper:
    """A sheet of white to paint on, and the fields that make paint behave.

    Every wash is computed inside its own bounding box rather than over the
    whole sheet: an arrangement is a few thousand small strokes, and painting
    each of them across the full canvas is thousands of times the work.
    """

    def __init__(self, w, h, seed):
        rng = np.random.default_rng(seed)
        self.rng = rng
        self.w, self.h = w, h
        self.rgb = np.ones((h, w, 3))
        # where the edge of a wash wanders, and how the tooth holds pigment
        self.warp_x = smooth(rng, h, w, 13)
        self.warp_y = smooth(rng, h, w, 13)
        self.grain = smooth(rng, h, w, max(h, w) // 5)

    def wash(self, cx, cy, rx, ry, rot=0.0, color=CREAM, opacity=0.5,
             rim=0.7, warp=None, fill=0.55, cover=0.0):
        """One stroke of transparent paint: body, settled rim, granulation."""
        if warp is None:
            warp = 0.10 * min(rx, ry) + 1.2
        reach = 1.12 * max(rx, ry) + warp + 2
        x0 = max(0, int(cx - reach)); x1 = min(self.w, int(cx + reach) + 1)
        y0 = max(0, int(cy - reach)); y1 = min(self.h, int(cy + reach) + 1)
        if x0 >= x1 or y0 >= y1:
            return

        ct, st = math.cos(rot), math.sin(rot)
        dx = (np.arange(x0, x1) - cx)[None, :] + warp * self.warp_x[y0:y1, x0:x1]
        dy = (np.arange(y0, y1) - cy)[:, None] + warp * self.warp_y[y0:y1, x0:x1]
        u = (dx * ct + dy * st) / max(rx, 1e-6)
        v = (-dx * st + dy * ct) / max(ry, 1e-6)
        d = np.sqrt(u * u + v * v)

        inside = d < 1.10
        body = np.clip(1.0 - d, 0, 1) ** 0.62
        edge = np.exp(-((d - 0.90) / 0.15) ** 2)
        a = opacity * (fill * body + rim * edge) * inside
        a *= 0.78 + 0.34 * (0.5 + 0.5 * self.grain[y0:y1, x0:x1])
        a = np.clip(a, 0, 1)[..., None]
        tile = self.rgb[y0:y1, x0:x1]
        if cover:
            # a petal painted over a stem hides the stem. Multiplying alone can
            # only ever darken, so the covering pigment first lifts what is
            # underneath back toward the white of the paper, then dyes it.
            lift = np.clip((fill * body + rim * edge)[..., None] * cover, 0, 1)
            tile *= 1 - lift
            tile += lift
        tile *= 1 - a * (1 - np.asarray(color, dtype=np.float64))

    def petal(self, cx, cy, rot, length, width, color, opacity=0.7,
              tip=0.55, base=0.32, rim=1.0, fill=0.75, warp=None, cover=0.0):
        """A petal, not an ellipse.

        Width runs as u**base * (1-u)**tip along the petal, so it narrows to a
        point where it joins the flower and again at its tip, and carries its
        widest part wherever those two exponents put it. Leaves are the same
        shape with the two exponents equal.
        """
        if warp is None:
            warp = 0.10 * width + 1.2
        reach = 1.15 * length + warp + 2
        x0 = max(0, int(cx - reach)); x1 = min(self.w, int(cx + reach) + 1)
        y0 = max(0, int(cy - reach)); y1 = min(self.h, int(cy + reach) + 1)
        if x0 >= x1 or y0 >= y1:
            return

        ct, st = math.cos(rot), math.sin(rot)
        dx = (np.arange(x0, x1) - cx)[None, :] + warp * self.warp_x[y0:y1, x0:x1]
        dy = (np.arange(y0, y1) - cy)[:, None] + warp * self.warp_y[y0:y1, x0:x1]
        along = (dx * ct + dy * st) / length          # 0 at the base, 1 at the tip
        across = (-dx * st + dy * ct)

        u = np.clip(along, 1e-4, 1 - 1e-4)
        peak = base / (base + tip)                    # where the petal is widest
        half = width * (u ** base) * ((1 - u) ** tip) \
            / ((peak ** base) * ((1 - peak) ** tip))
        d = np.abs(across) / np.maximum(half, 1e-6)
        d = np.maximum(d, np.abs(2 * along - 1) ** 6)  # square off nothing, but
        d[(along < 0) | (along > 1)] = 9               # stop at the two ends

        inside = d < 1.10
        body = np.clip(1.0 - d, 0, 1) ** 0.62
        edge = np.exp(-((d - 0.90) / 0.17) ** 2)
        a = opacity * (fill * body + rim * edge) * inside
        a *= 0.78 + 0.34 * (0.5 + 0.5 * self.grain[y0:y1, x0:x1])
        a = np.clip(a, 0, 1)[..., None]
        tile = self.rgb[y0:y1, x0:x1]
        if cover:
            # a petal painted over a stem hides the stem. Multiplying alone can
            # only ever darken, so the covering pigment first lifts what is
            # underneath back toward the white of the paper, then dyes it.
            lift = np.clip((fill * body + rim * edge)[..., None] * cover, 0, 1)
            tile *= 1 - lift
            tile += lift
        tile *= 1 - a * (1 - np.asarray(color, dtype=np.float64))



# ---------------------------------------------------------------- the flowers

def blossom(p, cx, cy, r, rot, petals=5, tint=BLUSH):
    """A cream cosmos with a warm heart -- the big blooms in the reference."""
    step = 2 * math.pi / petals
    for i in range(petals):
        a = rot + i * step + p.rng.uniform(-0.12, 0.12)
        sc = p.rng.uniform(0.88, 1.12)
        p.petal(cx, cy, a, r * sc, r * 0.42 * sc, CREAM, 0.9, tip=0.42, base=0.36,
                rim=0.9, fill=0.9, cover=0.75)
        # the edge, where the pigment dries darkest: rim only, no body
        p.petal(cx, cy, a, r * sc, r * 0.42 * sc, tint, 0.5, tip=0.42, base=0.36,
                rim=1.0, fill=0.0)
        # the pink the petal carries at its base, and a few veins over it
        p.petal(cx, cy, a, r * 0.58 * sc, r * 0.28 * sc, tint, 0.5,
                tip=0.5, base=0.3, rim=0.4, fill=1.0)
        for k in (-0.5, 0.5):
            p.petal(cx, cy, a + k * 0.15, r * 0.82 * sc, r * 0.012 * sc,
                    tint, 0.16, tip=0.5, base=0.5, rim=0.15, fill=1.0)
    p.wash(cx, cy, r * 0.21, r * 0.21, 0, HEART, 0.95, rim=0.6, fill=1.0, cover=0.9)
    for i in range(10):                     # stamens flicked out of the centre
        a = p.rng.uniform(0, 2 * math.pi)
        d = r * p.rng.uniform(0.17, 0.28)
        p.wash(cx + math.cos(a) * d, cy + math.sin(a) * d,
               r * 0.04, r * 0.04, 0, HEART, 0.7, rim=0.4, fill=1.0)


def forget_me_not(p, cx, cy, r, rot):
    for i in range(5):
        a = rot + i * 2 * math.pi / 5 + p.rng.uniform(-0.12, 0.12)
        p.petal(cx, cy, a, r, r * 0.66, BLUE, 0.9, tip=0.30, base=0.42,
                rim=0.8, fill=0.95, cover=0.8)
        p.petal(cx, cy, a, r, r * 0.66, BLUE_DEEP, 0.4, tip=0.30, base=0.42,
                rim=1.0, fill=0.0)
        p.petal(cx, cy, a, r * 0.5, r * 0.3, BLUE_DEEP, 0.22,
                tip=0.5, base=0.4, rim=0.3, fill=1.0)
    p.wash(cx, cy, r * 0.22, r * 0.22, 0, (1, 1, 1), 0.95, rim=0.0, fill=1.0, cover=0.95)
    p.wash(cx, cy, r * 0.13, r * 0.13, 0, YELLOW_DEEP, 0.85, rim=0.4, fill=1.0)


def forget_me_not_cluster(p, cx, cy, r, rot=0.0, n=6, spread=3.4):
    """A head of them on a short branching stalk, the way they actually grow."""
    for i in range(n):
        a = rot + p.rng.uniform(-1.2, 1.2)
        d = r * spread * math.sqrt(p.rng.uniform(0.12, 1))
        fx, fy = cx + math.cos(a) * d, cy + math.sin(a) * d
        stem(p, [(cx, cy), ((cx + fx) / 2, (cy + fy) / 2), (fx, fy)],
             width=0.9 * SS, color=SAGE, opacity=0.7)
        forget_me_not(p, fx, fy, r * p.rng.uniform(0.72, 1.1), p.rng.uniform(0, 2))


def yellow_bloom(p, cx, cy, r, rot):
    """The loose yellow flower: long, soft, slightly cupped petals."""
    for i in range(6):
        a = rot + i * 2 * math.pi / 6 + p.rng.uniform(-0.18, 0.18)
        sc = p.rng.uniform(0.85, 1.15)
        p.petal(cx, cy, a, r * 1.15 * sc, r * 0.34 * sc, YELLOW, 0.92,
                tip=0.5, base=0.4, rim=0.8, fill=0.9, cover=0.75)
        p.petal(cx, cy, a, r * 1.15 * sc, r * 0.34 * sc, YELLOW_DEEP, 0.4,
                tip=0.5, base=0.4, rim=1.0, fill=0.0)
        p.petal(cx, cy, a, r * 0.7 * sc, r * 0.22 * sc, YELLOW_DEEP, 0.4,
                tip=0.5, base=0.4, rim=0.3, fill=1.0)
    p.wash(cx, cy, r * 0.15, r * 0.15, 0, YELLOW_DEEP, 0.8, rim=0.5, fill=1.0)


def gypsophila(p, cx, cy, r, rot=0.0, spread=0.7, depth=3):
    """Baby's breath: a stem that forks forward and forward again, buds at the tips.

    Radiating it from a point the way a starburst does was the giveaway that it
    was drawn rather than grown; it forks, and each fork keeps going roughly
    the way its parent was heading.
    """
    def branch(x, y, angle, length, level):
        for _ in range(2 if level else 3):
            a = angle + p.rng.uniform(-spread, spread) * (0.6 if level else 1.0)
            nx, ny = x + math.cos(a) * length, y + math.sin(a) * length
            mx = (x + nx) / 2 - math.sin(a) * length * p.rng.uniform(-0.22, 0.22)
            my = (y + ny) / 2 + math.cos(a) * length * p.rng.uniform(-0.22, 0.22)
            stem(p, [(x, y), (mx, my), (nx, ny)],
                 width=(1.0 if level else 1.4) * SS, color=SAGE, opacity=0.75)
            if level < depth:
                branch(nx, ny, a, length * 0.55, level + 1)
            else:
                s = r * p.rng.uniform(0.085, 0.12)
                p.wash(nx, ny, s, s * 0.95, 0, GYP, 0.95, rim=0.55, fill=1.0,
                       warp=0.35, cover=0.9)
                p.wash(nx - s * 0.3, ny - s * 0.3, s * 0.4, s * 0.4, 0,
                       (1, 1, 1), 0.4, rim=0.0, fill=1.0)
    branch(cx, cy, rot, r * 0.42, 0)


def leaf(p, cx, cy, length, rot):
    # a leaf is a petal with its two ends the same: a lens, not a blob
    p.petal(cx, cy, rot, length, length * 0.30, SAGE, 0.85, tip=0.5, base=0.5,
            cover=0.55)
    p.petal(cx, cy, rot, length, length * 0.30, SAGE_DEEP, 0.3, tip=0.5, base=0.5,
            rim=1.0, fill=0.0)
    p.petal(cx, cy, rot, length * 0.96, length * 0.035, SAGE_DEEP, 0.55,
            tip=0.5, base=0.5, rim=0.3, fill=1.0)


def stem(p, pts, width=1.6, color=SAGE_DEEP, opacity=0.9):
    """A quadratic sweep, stamped rather than stroked so it dries unevenly.

    The stamps are spaced by the width of the line, not split into a fixed
    count: a fixed count draws a dotted line when the stem is long and stacks
    a hundred washes into black where it is short.
    """
    (x0, y0), (x1, y1), (x2, y2) = pts
    span = math.hypot(x1 - x0, y1 - y0) + math.hypot(x2 - x1, y2 - y1)
    steps = max(4, int(span / max(width * 0.5, 0.5)))
    for t in np.linspace(0, 1, steps):
        m = 1 - t
        x = m * m * x0 + 2 * m * t * x1 + t * t * x2
        y = m * m * y0 + 2 * m * t * y1 + t * t * y2
        w = width * (1.15 - 0.45 * t)
        p.wash(x, y, w, w, 0, color, opacity * 0.30, rim=0.25, fill=1.0, warp=0.5)


def sprig(p, x0, y0, x1, y1, x2, y2, leaves=6, scale=1.0):
    stem(p, [(x0, y0), (x1, y1), (x2, y2)], width=1.8 * SS * scale)
    for t in np.linspace(0.18, 0.95, leaves):
        m = 1 - t
        x = m * m * x0 + 2 * m * t * x1 + t * t * x2
        y = m * m * y0 + 2 * m * t * y1 + t * t * y2
        dx = 2 * m * (x1 - x0) + 2 * t * (x2 - x1)
        dy = 2 * m * (y1 - y0) + 2 * t * (y2 - y1)
        a = math.atan2(dy, dx)
        for side in (-1, 1):
            off = a + side * p.rng.uniform(0.6, 1.0)
            ln = 21 * SS * scale * p.rng.uniform(0.7, 1.3)
            leaf(p, x, y, ln, off)


# ------------------------------------------------------------ the arrangements

def corner(size, seed, mirror=False):
    """A spray that hugs one corner and reaches along both of its edges."""
    n = size * SS
    p = Paper(n, n, seed)
    u = n / 100.0                                     # 1u = 1% of the square

    # three stems out of the corner: along the top, down the side, diagonal
    sprig(p, 2 * u, 26 * u, 30 * u, 4 * u, 86 * u, 14 * u, leaves=6)
    sprig(p, 6 * u, 18 * u, 12 * u, 52 * u, 24 * u, 88 * u, leaves=6)
    sprig(p, 10 * u, 10 * u, 38 * u, 30 * u, 58 * u, 48 * u, leaves=4, scale=0.8)

    gypsophila(p, 52 * u, 8 * u, 19 * u, rot=0.9)
    gypsophila(p, 8 * u, 54 * u, 17 * u, rot=1.1)

    yellow_bloom(p, 76 * u, 22 * u, 11 * u, p.rng.uniform(0, 2))
    forget_me_not_cluster(p, 33 * u, 7 * u, 4.2 * u, rot=1.5, n=7, spread=3.8)
    forget_me_not_cluster(p, 5 * u, 38 * u, 4.0 * u, rot=0.2, n=6, spread=3.6)
    forget_me_not_cluster(p, 21 * u, 76 * u, 3.7 * u, rot=0.9, n=5, spread=3.4)
    blossom(p, 13 * u, 13 * u, 14 * u, p.rng.uniform(0, 2))
    blossom(p, 45 * u, 42 * u, 11 * u, p.rng.uniform(0, 2), tint=ROSE)

    return finish(p, size, mirror)


def spray(width, height, seed):
    """A small horizontal spray for a letterhead."""
    w, h = width * SS, height * SS
    p = Paper(w, h, seed)
    ux, uy = w / 100.0, h / 100.0

    for side in (-1, 1):
        x2 = 50 * ux + side * 46 * ux
        sprig(p, 50 * ux, 56 * uy, 50 * ux + side * 22 * ux, 30 * uy, x2, 50 * uy,
              leaves=5, scale=0.72)
        gypsophila(p, 50 * ux + side * 30 * ux, 48 * uy, 11 * ux,
                   rot=0 if side > 0 else math.pi, spread=0.7, depth=1)
        forget_me_not_cluster(p, 50 * ux + side * 19 * ux, 44 * uy, 3.0 * ux,
                              rot=0 if side > 0 else math.pi, n=4, spread=2.6)
    blossom(p, 50 * ux, 50 * uy, 10 * ux, p.rng.uniform(0, 2))
    return finish(p, width, None, height)


def finish(p, width, mirror, height=None):
    rgb = np.clip(p.rgb, 0, 1) * 255
    img = Image.fromarray(rgb.astype(np.uint8))
    img = img.resize((width, height or width), Image.LANCZOS)
    img = img.filter(ImageFilter.GaussianBlur(0.35))
    if mirror:
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    return img


def main():
    art = {
        'cornerA': (corner(560, 4471), 88),
        'cornerB': (corner(560, 90210, mirror=True), 88),
        'spray': (spray(520, 190, 7788), 90),
    }
    out = {}
    for name, (img, quality) in art.items():
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=quality, optimize=True, subsampling=0)
        data = buf.getvalue()
        out[name] = 'data:image/jpeg;base64,' + base64.b64encode(data).decode('ascii')
        print(f'{name}: {img.size[0]}x{img.size[1]}, {len(data) // 1024} KB')

    dest = ROOT / 'assets' / 'flowers.js'
    dest.write_text(
        '/* Watercolour flowers, painted by tools/build-flowers.py.\n'
        ' *\n'
        ' * Painted on white and shown with mix-blend-mode:multiply, so the white is\n'
        ' * transparent and the paper underneath keeps its own texture.\n'
        ' *\n'
        ' * GENERATED FILE -- do not hand-edit.\n'
        ' */\n'
        'window.FLOWERS = ' + json.dumps(out, indent=0) + ';\n',
        encoding='utf-8')
    print('wrote', dest.relative_to(ROOT), f'({dest.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
