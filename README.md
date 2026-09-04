# Briotto Family Airline

The wedding invitation for **Filippo Briotto** and **Victoria Vanity Pamwenatse Akuunda**,
built as mail rather than a web page: a sealed airmail envelope you click open, with a letter
and three boarding passes sitting inside it. You pull out whichever you want — the passes can
be printed.

Three legs, one marriage:

| | Route | When | |
|---|---|---|---|
| 1 | `HOM → AMS` Amsterdam | 28 December 2026 | The vows — intimate ceremony, no reception |
| 2 | `AMS → WDH` Windhoek, Namibia | September 2027 | The traditional ceremony |
| 3 | `WDH → ITA` Italy | To be announced | The dinner |

Every leg flies **1D0**.

## Minting an invitation

Open **`minter.html`** in any browser — double-click it, no server and no install needed. It is
one self-contained file, so it works anywhere, including a machine that has never seen this
repo. (`index.html` is the same desk but loads its scripts from `assets/`; work on that one and
run `node tools/build-minter.js` to rebuild `minter.html`.)

1. Type the guest's name. The three printed forms (full on the passes, first name in the
   letter, initial + surname on the stub) fill in automatically; overtype any of them if a
   name needs a hand.
2. Write a personal note, or leave it empty and the note block disappears.
3. Pick English or Italiano.
4. **Download invitation** saves `invitation-<name>.html`. That single file is the whole
   invitation — fonts and artwork travel inside it, it makes no network requests, and it works
   as an email attachment on a plane. Roughly 170 KB.

If your browser blocks the download (Safari sometimes does from `file://`), use **Open in a new
tab** and save from there, or **Copy the HTML** and paste it into a file yourself.

## Changing the wedding details

Everything factual lives in one place: the `LEGS` array at the top of
[`assets/invitation.js`](assets/invitation.js).

```js
{
  id: 'ams',
  from: 'HOM', to: 'AMS',
  seat: '1A', gate: '28', tkt: '2812-2026',
  time: '',   // e.g. '15:00'
  venue: ''   // e.g. 'Stadhuis, Amstel 1'
}
```

Leave `time` and `venue` empty and the pass prints *“full details to follow”*. Fill either in
and it prints instead — so when the Amsterdam venue is booked, one line here updates every
invitation minted from then on. Dates, city names and everything else visible are in `COPY`
just below, in both languages.

## What's in the repo

| | |
|---|---|
| `minter.html` | **the minting desk, one self-contained file** — this is the one to use |
| `index.html` | the same desk, loading its scripts from `assets/` — work on this one |
| `assets/invitation.js` | **the wedding facts**, both languages of copy, the drawn marks |
| `assets/template.js` | the invitation document itself: markup, styles, the envelope |
| `assets/fonts.js` | Cormorant Garamond + Courier Prime, base64'd (generated) |
| `assets/stamp/couple.jpg` | **the picture in the stamp** — swap this for the drawing |
| `assets/stamp-art.js` | that picture, base64'd (generated) |
| `assets/fonts/` | the source `.woff2` files and their SIL Open Font Licences |
| `example-invitation.html` | a minted sample, for looking at and test-printing |
| `tools/build-fonts.py` | regenerates `assets/fonts.js` from `assets/fonts/` |
| `tools/build-stamp-art.py` | regenerates `assets/stamp-art.js` from `assets/stamp/` |
| `tools/build-example.js` | regenerates `example-invitation.html` |
| `tools/build-minter.js` | regenerates `minter.html` from `index.html` + `assets/` |

The invitation is deliberately plain JavaScript with no build step and no dependencies: open a
file, edit it, reload. The only generated file is `assets/fonts.js`.

## Notes on the invitation

- **The stamp holds a picture of you two**, with the date on the band underneath. It is a
  photograph for now. When the artist delivers a drawing, save it as
  `assets/stamp/couple.jpg` (or `.png`) and run `python3 tools/build-stamp-art.py` — portrait,
  roughly 4:5, a few hundred pixels wide is plenty. Nothing else changes.
- **Two envelopes.** `ENVELOPE` at the top of [`assets/invitation.js`](assets/invitation.js) is
  `'quiet'`: plain ivory with a hairline plate rule, a drawn flap and a red wax seal with the
  monogram pressed into it. Set it to `'airmail'` for the striped par avion border and its
  little blue label instead. Everything else is identical.
- **Interaction is physical, not chrome.** There is no navigation bar. Click the envelope to
  break the seal, then pull out the letter or the stack of passes by clicking the paper itself.
  Click the shrunken envelope at the top to put things back; `Esc` does the same, and the paper
  slides back in behind the envelope as it grows.
- **The letter arrives folded and opens on its crease.** The fold is real: two clipped copies of
  the letter, hinged along the middle, with the bottom half folded back behind the top one. It
  swings down, the shadow along the crease lifts, and then the scaffold is thrown away and the
  actual letter takes its place — so print, text selection and screen readers only ever see one
  letter. The faint crease line across the middle stays, the way paper remembers a fold.
- **It is meant to read as paper on a table, not as cards on a page.** Everything lies on a
  lit surface with the corners falling away; light falls across each sheet, the cut edge
  catches it, the far edge curves off, and every sheet carries a fine grain. The letter has
  a second page showing a sliver of its edge behind the first.
- **The passes are dealt out** of the envelope one after another, landing overlapped and each
  at its own angle, the way tickets fall. They have punched perforations and notched corners
  along the tear line. On paper they straighten up and separate again.
- **Print** gives you the three passes on A4 and nothing else — no envelope, no letter, no
  buttons, no grain.
- Works with JavaScript off (the letter and passes are simply laid out down the page), respects
  `prefers-reduced-motion` — which skips the fold and the deal entirely — and reads down to
  340px wide.
