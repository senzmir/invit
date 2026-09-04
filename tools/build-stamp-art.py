#!/usr/bin/env python3
"""Regenerate assets/stamp-art.js from the artwork in assets/stamp/.

The picture in the stamp travels inside every invitation as a base64 data URL,
because a minted invitation is one self-contained file with no network access.
This turns whatever is sitting at assets/stamp/couple.(jpg|png) into that string.

    python3 tools/build-stamp-art.py

To swap the photograph for a drawing later, drop the new artwork in as
assets/stamp/couple.jpg or couple.png and run this again -- nothing else changes.
Portrait, roughly 4:5, and a few hundred pixels wide is plenty; the stamp is
about 88 CSS pixels across.
"""
import base64
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ART_DIR = ROOT / "assets" / "stamp"
TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png"}

HEADER = """/* The picture in the stamp, base64'd so a minted invitation stays a single
 * self-contained file.
 *
 * GENERATED FILE -- do not hand-edit. Replace assets/stamp/couple.jpg (or .png)
 * and run: python3 tools/build-stamp-art.py
 */
"""


def main():
    art = next((p for p in sorted(ART_DIR.iterdir())
                if p.stem == "couple" and p.suffix.lower() in TYPES), None)
    if art is None:
        # nothing to embed: the stamp falls back to its drawn posy
        out = ROOT / "assets" / "stamp-art.js"
        out.write_text(HEADER + "window.STAMP_ART = \"\";\n", encoding="utf-8")
        print("no assets/stamp/couple.{jpg,png}; stamp keeps its drawn flowers")
        return

    mime = TYPES[art.suffix.lower()]
    data = base64.b64encode(art.read_bytes()).decode("ascii")
    out = ROOT / "assets" / "stamp-art.js"
    out.write_text(
        HEADER + "window.STAMP_ART = " + json.dumps("data:" + mime + ";base64," + data) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {out.relative_to(ROOT)} from {art.name} "
          f"({out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
