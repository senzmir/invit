#!/usr/bin/env python3
"""Regenerate assets/fonts.js from the woff2 files in assets/fonts/.

The invitations guests receive are single self-contained .html files, opened
straight out of an email attachment with no network available, so the webfonts
have to travel inside them as base64 data URLs. This script turns the woff2
files into the @font-face block the builder injects into every minted file.

    python3 tools/build-fonts.py

Both families are SIL Open Font Licence 1.1; the licences ship alongside the
fonts in assets/fonts/.
"""
import base64
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "assets" / "fonts"

# family, style, weight (a range for the variable faces), filename
FACES = [
    ("Cormorant Garamond", "normal", "300 700", "CormorantGaramond-var.woff2"),
    ("Cormorant Garamond", "italic", "300 700", "CormorantGaramond-var-italic.woff2"),
    ("Courier Prime", "normal", "400", "CourierPrime-400.woff2"),
    ("Courier Prime", "normal", "700", "CourierPrime-700.woff2"),
]

HEADER = """/* Embedded webfonts for Briotto Family Airline invitations.
 *
 * Cormorant Garamond and Courier Prime (latin subsets), both under the SIL Open
 * Font Licence 1.1 -- see assets/fonts/OFL-*.txt. They are base64'd in here so a
 * minted invitation is one self-contained file that looks right with no network.
 *
 * GENERATED FILE -- do not hand-edit. Run: python3 tools/build-fonts.py
 */
"""


def main():
    blocks = []
    for family, style, weight, filename in FACES:
        path = FONT_DIR / filename
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        blocks.append(
            "@font-face{"
            f"font-family:'{family}';font-style:{style};font-weight:{weight};"
            "font-display:block;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2')"
            "}"
        )
    css = "\n".join(blocks)
    out = ROOT / "assets" / "fonts.js"
    out.write_text(
        HEADER + "window.INVITATION_FONT_CSS = " + json.dumps(css) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
