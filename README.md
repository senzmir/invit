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

## Minting an invitation

Open **`index.html`** in any browser — double-click it, no server and no install needed.

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
| `index.html` | the minting desk — form, live preview, download |
| `assets/invitation.js` | **the wedding facts**, both languages of copy, the drawn marks |
| `assets/template.js` | the invitation document itself: markup, styles, the envelope |
| `assets/fonts.js` | Cormorant Garamond + Courier Prime, base64'd (generated) |
| `assets/fonts/` | the source `.woff2` files and their SIL Open Font Licences |
| `example-invitation.html` | a minted sample, for looking at and test-printing |
| `tools/build-fonts.py` | regenerates `assets/fonts.js` from `assets/fonts/` |
| `tools/build-example.js` | regenerates `example-invitation.html` |

The invitation is deliberately plain JavaScript with no build step and no dependencies: open a
file, edit it, reload. The only generated file is `assets/fonts.js`.

## Notes on the invitation

- **Interaction is physical, not chrome.** There is no navigation bar. Click the envelope to
  break the seal, then pull out the letter or the stack of passes by clicking the paper itself.
  Click the shrunken envelope at the top to put things back; `Esc` does the same.
- **Print** gives you the three passes on A4 and nothing else — no envelope, no letter, no
  buttons.
- Works with JavaScript off (the letter and passes are simply laid out down the page), respects
  `prefers-reduced-motion`, and reads down to 340px wide.
