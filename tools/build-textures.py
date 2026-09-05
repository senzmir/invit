#!/usr/bin/env python3
"""Render the paper and linen textures as real images.

    python3 tools/build-textures.py

The piece used to lean on a single SVG fractal-noise overlay for its paper,
which is why it read as flat and vectorial: one frequency, no fibre, no
mottling, no colour life. These are built in the frequency domain instead --
a random field shaped by a 1/f falloff and inverse-transformed -- which gives
several things at once:

  * layered scales, so there is coarse mottling under fine grain rather than
    one uniform fizz;
  * fibre, by stretching the falloff along an axis so the noise smears into
    strands the way pulp actually lies;
  * seamless tiles for free, because an inverse FFT is periodic by
    construction, so no edge blending is needed.

Written out as small JPEGs: they are lossy, but the artefacts land inside noise
that is already random, and a tile costs tens of kilobytes instead of hundreds.
"""
import base64
import io
import json
import pathlib

import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
RNG = np.random.default_rng(20261228)


def field(size, exponent, stretch=(1.0, 1.0)):
    """A periodic random field whose energy falls off as 1/f**exponent.

    stretch squashes the frequency axes, which smears the noise into strands
    along the stretched direction -- fibres in paper, threads in cloth.
    """
    fy = np.fft.fftfreq(size)[:, None] * stretch[0]
    fx = np.fft.fftfreq(size)[None, :] * stretch[1]
    radius = np.sqrt(fy ** 2 + fx ** 2)
    radius[0, 0] = 1e-6
    spectrum = np.fft.fft2(RNG.normal(size=(size, size))) / radius ** exponent
    spectrum[0, 0] = 0
    out = np.real(np.fft.ifft2(spectrum))
    return out / (np.abs(out).max() + 1e-9)


def to_png_or_jpeg(img, quality):
    buf = io.BytesIO()
    img.save(buf, 'JPEG', quality=quality, optimize=True, subsampling=0)
    return buf.getvalue()


def paper(size=320):
    """Writing stock: mottled, fibrous, faintly uneven in colour."""
    mottle = field(size, 2.4)
    grain = field(size, 0.35)                      # near-white noise: the tooth
    tooth = field(size, 0.9)
    fibre = field(size, 1.7, stretch=(1.0, 0.14))

    # weighted towards the high frequencies -- low-frequency mottling alone just
    # looks like clouds, and it was the grain that was missing
    light = 1.0 + 0.032 * mottle + 0.055 * grain + 0.035 * tooth + 0.045 * fibre

    # paper is not neutral: the thin places run warm, the thick ones cool
    warmth = 0.5 + 0.5 * mottle
    base = np.stack([
        np.full((size, size), 247.0) * light + 5 * warmth,
        np.full((size, size), 240.0) * light + 2 * warmth,
        np.full((size, size), 224.0) * light - 3 * warmth,
    ], axis=-1)

    # a few flecks of pulp that did not break down
    specks = field(size, 0.4)
    base -= 26 * np.clip(specks - 0.72, 0, None)[..., None] * np.array([1.0, 1.05, 1.2])

    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))


def linen(size=400):
    """The surface everything lies on: a woven cloth, warp and weft."""
    warp = field(size, 1.15, stretch=(1.0, 0.07))
    weft = field(size, 1.15, stretch=(0.07, 1.0))
    thread_a = field(size, 0.55, stretch=(1.0, 0.05))     # the individual threads
    thread_b = field(size, 0.55, stretch=(0.05, 1.0))
    slub = field(size, 2.6)
    grain = field(size, 0.4)

    light = (1.0 + 0.075 * warp + 0.075 * weft
             + 0.05 * thread_a + 0.05 * thread_b
             + 0.05 * slub + 0.035 * grain)
    base = np.stack([
        np.full((size, size), 214.0) * light,
        np.full((size, size), 196.0) * light,
        np.full((size, size), 176.0) * light,
    ], axis=-1)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))


def main():
    tiles = {
        'paper': (paper(), 93),
        'linen': (linen(), 90),
    }
    out = {}
    for name, (img, quality) in tiles.items():
        data = to_png_or_jpeg(img, quality)
        out[name] = 'data:image/jpeg;base64,' + base64.b64encode(data).decode('ascii')
        print(f'{name}: {img.size[0]}x{img.size[1]}, {len(data) // 1024} KB')

    dest = ROOT / 'assets' / 'textures.js'
    dest.write_text(
        '/* Paper and linen, rendered by tools/build-textures.py.\n'
        ' *\n'
        ' * Seamless tiles: they are built in the frequency domain, and an inverse FFT\n'
        ' * is periodic, so they repeat without a join.\n'
        ' *\n'
        ' * GENERATED FILE -- do not hand-edit.\n'
        ' */\n'
        'window.TEXTURES = ' + json.dumps(out, indent=0) + ';\n',
        encoding='utf-8')
    print('wrote', dest.relative_to(ROOT), f'({dest.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
