/* Briotto Family Airline -- the invitation document.
 *
 * buildDocument() returns one complete, standalone HTML file: an envelope you
 * click open, from which you can pop out either the letter or the three
 * boarding passes, with a print option for the passes. Everything travels
 * inside the file -- fonts as base64, marks as inline SVG -- so it works from
 * an email attachment with no network at all.
 *
 * Requires assets/invitation.js (facts + copy + drawing helpers) to be loaded first.
 */
(function () {
  'use strict';

  var I = window.INVITATION;
  var esc = I.esc;

  function fieldCell(label, value, extraClass) {
    return '' +
      '<div class="field' + (extraClass ? ' ' + extraClass : '') + '">' +
        '<span class="field__label">' + esc(label) + '</span>' +
        '<span class="field__value">' + esc(value) + '</span>' +
      '</div>';
  }

  function planeGlyph() {
    return '<svg class="plane" viewBox="0 0 56 20" width="56" height="20" aria-hidden="true">' +
      '<path d="M2 10 H50" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4" opacity=".55"/>' +
      '<path d="M50 10 L24 1.5 L29 10 L24 18.5 Z" fill="currentColor"/>' +
      '</svg>';
  }

  function pass(leg, t, names, index) {
    var legCopy = t.legs[leg.id];
    var detail = leg.venue || leg.time
      ? [leg.time, leg.venue].filter(Boolean).join(' · ')
      : t.detailsToFollow;

    return '' +
    '<article class="pass" tabindex="0" aria-label="' + esc(t.boardingPass + ' — ' + legCopy.toCity) + '">' +
      '<div class="pass__main">' +
        '<header class="pass__brand">' +
          '<span class="pass__mark">' + I.roundelSvg(30) + '</span>' +
          '<span class="pass__brandtext">' +
            '<span class="pass__brandname">' + esc(t.brand) + '</span>' +
            '<span class="pass__strap">' + esc(t.strapline) + '</span>' +
          '</span>' +
          '<span class="pass__no">' + esc(String(index + 1)) + ' / 3</span>' +
        '</header>' +

        '<h3 class="pass__title">' + esc(t.boardingPass) + '</h3>' +

        '<div class="pass__grid pass__grid--top">' +
          fieldCell(t.lPassenger, names.full, 'field--wide') +
          fieldCell(t.lClass, t.className) +
          fieldCell(t.lFlight, I.FLIGHT) +
          fieldCell(t.lDate, legCopy.date, 'field--nowrap') +
        '</div>' +

        '<div class="pass__route">' +
          '<div class="route__end">' +
            '<span class="route__code">' + esc(leg.from) + '</span>' +
            '<span class="route__city">' + esc(legCopy.fromCity) + '</span>' +
          '</div>' +
          '<div class="route__mid">' + planeGlyph() + '</div>' +
          '<div class="route__end route__end--to">' +
            '<span class="route__code">' + esc(leg.to) + '</span>' +
            '<span class="route__city">' + esc(legCopy.toCity) + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="pass__grid pass__grid--bottom">' +
          fieldCell(t.lSeat, leg.seat) +
          fieldCell(t.lGate, leg.gate) +
          fieldCell(t.lTkt, leg.tkt) +
          fieldCell(t.lStatus, t.confirmed) +
        '</div>' +

        '<div class="pass__occasion">' +
          '<h4>' + esc(legCopy.title) + '</h4>' +
          '<p>' + esc(legCopy.blurb) + '</p>' +
          '<p class="pass__follow">' + esc(detail) + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="pass__stub">' +
        '<span class="stub__brand">' + esc(t.brand) + '</span>' +
        '<div class="stub__rows">' +
          '<div class="stub__row"><span>' + esc(t.lPassenger) + '</span><b>' + esc(names.short) + '</b></div>' +
          '<div class="stub__row"><span>' + esc(t.lFlight) + '</span><b>' + esc(I.FLIGHT) + '</b></div>' +
          '<div class="stub__row"><span>' + esc(t.lDate) + '</span><b>' + esc(legCopy.date) + '</b></div>' +
          '<div class="stub__row"><span>' + esc(t.lFrom) + '</span><b>' + esc(leg.from) + '</b></div>' +
          '<div class="stub__row"><span>' + esc(t.lTo) + '</span><b>' + esc(leg.to) + '</b></div>' +
          '<div class="stub__row"><span>' + esc(t.lSeat) + '</span><b>' + esc(leg.seat) + '</b></div>' +
          '<div class="stub__row"><span>' + esc(t.lTkt) + '</span><b>' + esc(leg.tkt) + '</b></div>' +
        '</div>' +
        '<span class="stub__tag">' + esc(legCopy.title) + '</span>' +
        I.barcode(leg.tkt + names.short) +
      '</div>' +
    '</article>';
  }

  function letter(t, names, note) {
    var itinerary = I.LEGS.map(function (leg) {
      var legCopy = t.legs[leg.id];
      return '' +
        '<li class="itin__row">' +
          '<span class="itin__code">' + esc(leg.to) + '</span>' +
          '<span class="itin__what">' +
            '<b>' + esc(legCopy.title) + '</b>' +
            '<em>' + esc(legCopy.toCity) + '</em>' +
          '</span>' +
          '<span class="itin__when">' + esc(legCopy.dateLong) + '</span>' +
        '</li>';
    }).join('');

    var noteBlock = note
      ? '<div class="letter__note">' +
          '<h3>' + esc(t.noteTitle) + '</h3>' +
          '<p>' + esc(note).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>' +
        '</div>'
      : '';

    return '' +
    '<article class="letter">' +
      '<header class="letter__head">' +
        '<span class="letter__mark">' + I.roundelSvg(46) + '</span>' +
        '<span class="letter__brand">' + esc(t.brand) + '</span>' +
        '<span class="letter__strap">' + esc(t.strapline) + '</span>' +
      '</header>' +

      '<div class="letter__ref">' +
        '<span>' + esc(t.bookingTitle) + '</span>' +
        '<span>' + esc(t.refLabel) + ' · IDO-28122026</span>' +
      '</div>' +

      '<p class="letter__greeting">' + esc(t.greeting(names.first)) + '</p>' +
      t.letterBody.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +

      '<section class="letter__itin">' +
        '<h3>' + esc(t.itineraryTitle) + '</h3>' +
        '<ul class="itin">' + itinerary + '</ul>' +
      '</section>' +

      noteBlock +

      '<footer class="letter__sign">' +
        '<p class="signoff">' + esc(t.signOff) + '</p>' +
        '<p class="couple">' + esc(I.COUPLE.shortOne) + ' &amp; ' + esc(I.COUPLE.shortTwo) + '</p>' +
        '<p class="couple couple--full">' + esc(I.COUPLE.one) + ' &amp; ' + esc(I.COUPLE.two) + '</p>' +
      '</footer>' +

      '<p class="letter__small">' + esc(t.smallPrint) + '</p>' +
    '</article>';
  }


  /* The two things sitting inside the envelope. They are the interface: the
     letter's folded top edge and the edges of the three passes stick up out of
     the envelope mouth, and you pull the one you want. No navigation chrome. */
  function slips(t) {
    var ticketEdges = I.LEGS.map(function (leg, i) {
      var legCopy = t.legs[leg.id];
      return '<span class="tedge tedge--' + i + '">' +
        '<b>' + esc(leg.to) + '</b>' +
        '<i>' + esc(legCopy.date) + '</i>' +
      '</span>';
    }).join('');

    return '' +
    '<div class="chooser">' +
      '<button type="button" class="slip slip--letter" data-stage-to="letter" aria-label="' + esc(t.tabLetter) + '">' +
        '<span class="slip__inner">' +
          '<span class="slip__caption">' + esc(t.tabLetter) + '</span>' +
          '<span class="slip__head">' +
            '<span class="slip__mark">' + I.roundelSvg(24) + '</span>' +
            '<span class="slip__brand">' + esc(t.brand) + '</span>' +
          '</span>' +
          '<span class="slip__rule"></span>' +
        '</span>' +
      '</button>' +
      '<button type="button" class="slip slip--tickets" data-stage-to="tickets" aria-label="' + esc(t.tabTickets) + '">' +
        '<span class="slip__inner">' +
          '<span class="slip__caption">' + esc(t.tabTickets) + '</span>' +
          '<span class="tedges">' + ticketEdges + '</span>' +
        '</span>' +
      '</button>' +
    '</div>';
  }

  function styles(fontCss) {
    return fontCss + '\n' + [
'*,*::before,*::after{box-sizing:border-box}',
'html{-webkit-text-size-adjust:100%}',
'body{margin:0;padding:clamp(124px,16vh,170px) 16px 72px;min-height:100vh;',
'  font-family:"Cormorant Garamond",Garamond,"Hoefler Text","Times New Roman",serif;',
'  color:#201c17;background:#0d2f3a;',
'  background-image:radial-gradient(1100px 700px at 50% -12%,#1b5a68 0%,#103743 52%,#0a222b 100%);',
'  display:flex;flex-direction:column;align-items:center}',
':root{--paper:#f7f1e3;--paper-2:#efe6d3;--ink:#201c17;--ink-2:#6d6153;',
'  --line:#cbbca1;--blue:#123a4d;--red:#a83f2a;--gold:#b3893f;',
'  --mono:"Courier Prime","Courier New",monospace}',

/* ---------- the envelope ---------- */
'.env-wrap{position:relative;width:min(620px,100%);',
'  transition:height .75s cubic-bezier(.2,.7,.2,1),margin .75s cubic-bezier(.2,.7,.2,1)}',
'.envelope{position:absolute;left:0;top:0;width:100%;aspect-ratio:1.6;perspective:1700px;',
'  transform-origin:50% 0;transition:transform .8s cubic-bezier(.2,.7,.2,1),filter .5s}',
'.env-back{position:absolute;inset:0;border-radius:5px;background:#e3d7bd;',
'  box-shadow:0 34px 74px -32px rgba(0,0,0,.72)}',
'.env-front{position:absolute;inset:0;z-index:3;border-radius:5px;',
'  background:linear-gradient(180deg,#ddd2b8 0,#e8dec8 14%,var(--paper-2) 34%);',
'  box-shadow:0 8px 18px -14px rgba(0,0,0,.5) inset}',
'.env-front::before{content:"";position:absolute;inset:0;border-radius:5px;padding:9px;',
'  background:repeating-linear-gradient(45deg,var(--red) 0 11px,transparent 11px 22px,var(--blue) 22px 33px,transparent 33px 44px);',
'  -webkit-mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);',
'  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);opacity:.85}',
'.env-address{position:absolute;left:9%;top:56%;max-width:58%;display:flex;flex-direction:column;gap:5px}',
'.env-address .to{font-family:var(--mono);font-size:10px;letter-spacing:.24em;',
'  text-transform:uppercase;color:var(--ink-2)}',
'.env-address .who{font-size:clamp(21px,3.9vw,31px);font-weight:600;line-height:1.12;color:var(--blue);',
'  border-bottom:1px solid var(--line);padding-bottom:7px}',
'.env-address .via{font-family:var(--mono);font-size:9.5px;letter-spacing:.26em;',
'  text-transform:uppercase;color:var(--red)}',
'.env-stamp{position:absolute;right:7%;top:52%;transform:rotate(3.2deg);',
'  filter:drop-shadow(0 2px 3px rgba(0,0,0,.18))}',
'.postmark{position:absolute;right:20%;top:47%;pointer-events:none;transform:rotate(-11deg);opacity:.9}',
'.env-flap{position:absolute;left:0;top:0;width:100%;height:44%;z-index:6;transform-origin:50% 0;',
'  background:linear-gradient(180deg,#f4ecdb,#e7dbc2);clip-path:polygon(0 0,100% 0,50% 100%);',
'  transition:transform 1s cubic-bezier(.6,-.15,.3,1.15),z-index 0s .5s;',
'  filter:drop-shadow(0 4px 5px rgba(0,0,0,.15))}',
'.seal{position:absolute;left:50%;top:44%;width:62px;height:62px;margin:-31px 0 0 -31px;z-index:7;',
'  border-radius:50%;display:grid;place-items:center;color:#f7ecdf;font-size:18px;letter-spacing:.05em;',
'  background:radial-gradient(circle at 34% 30%,#c05038,#8a2d1a 72%);',
'  box-shadow:0 4px 12px -3px rgba(0,0,0,.5);transition:opacity .4s,transform .6s}',
'.env-open{position:absolute;inset:0;z-index:8;border:0;background:none;cursor:pointer;',
'  border-radius:5px;font:inherit;color:transparent}',
'.env-open:focus-visible{outline:2px solid #ffd9a0;outline-offset:5px}',
'.env-hint{position:absolute;left:0;right:0;bottom:-32px;margin:0;text-align:center;color:#d9e4e6;',
'  font-family:var(--mono);font-size:10.5px;letter-spacing:.28em;text-transform:uppercase;',
'  animation:breathe 3.4s ease-in-out infinite;transition:opacity .4s}',
'@keyframes breathe{0%,100%{opacity:.32}50%{opacity:.85}}',

/* ---------- the two things inside it ---------- */
'.chooser{position:absolute;left:5.5%;right:5.5%;top:0;z-index:2;display:flex;gap:14px;',
'  align-items:flex-start;justify-content:center}',
'.slip{flex:1 1 0;min-width:0;max-width:250px;border:0;padding:0;background:none;font:inherit;',
'  color:var(--ink);cursor:pointer;transform:translateY(34px);opacity:0;',
'  transition:transform .75s cubic-bezier(.2,.7,.2,1),opacity .4s;filter:drop-shadow(0 -6px 14px rgba(0,0,0,.35))}',
'.slip__inner{display:block;border:1px solid var(--line);border-bottom:0;border-radius:4px 4px 0 0;',
'  background:var(--paper);padding:11px 15px 70px;text-align:left}',
'.slip__head{display:flex;align-items:center;gap:9px;margin-top:9px}',
'.slip__mark{display:flex;flex:none;color:var(--blue);line-height:0}',
'.slip__brand{display:block;font-size:15px;font-weight:700;color:var(--blue);line-height:1.12}',
'.slip__rule{display:block;height:1px;background:var(--line);margin:11px 0 0}',
'.slip__caption{display:block;font-family:var(--mono);font-size:9.5px;',
'  letter-spacing:.2em;text-transform:uppercase;color:var(--ink-2)}',
'.slip--tickets .slip__inner{background:#f3ead7}',
'.tedges{display:block;margin-top:9px}',
'.tedge{display:flex;align-items:baseline;justify-content:space-between;gap:10px;',
'  padding:8px 11px;background:var(--paper);border:1px solid var(--line);border-top:0;',
'  border-radius:0 0 3px 3px;margin:0 0 3px;box-shadow:0 2px 4px -3px rgba(0,0,0,.4)}',
'.tedge--0{margin-top:0}.tedge--1{margin-left:5px;margin-right:5px}.tedge--2{margin-left:10px;margin-right:10px}',
'.tedge b{font-family:var(--mono);font-size:12px;letter-spacing:.12em;color:var(--blue)}',
'.tedge i{font-family:var(--mono);font-style:normal;font-size:9px;letter-spacing:.1em;color:var(--ink-2)}',

/* ---------- stages ---------- */
'body[data-stage="open"] .env-flap,body[data-stage="letter"] .env-flap,body[data-stage="tickets"] .env-flap{',
'  transform:rotateX(-171deg);z-index:1;transition:transform 1s cubic-bezier(.6,-.15,.3,1.15),z-index 0s .3s}',
'body[data-stage="open"] .seal,body[data-stage="letter"] .seal,body[data-stage="tickets"] .seal{opacity:0;transform:scale(.55) rotate(-28deg)}',
'body[data-stage="open"] .slip{opacity:1;transform:translateY(-92px)}',
'body[data-stage="open"] .slip--letter{transition-delay:.34s}',
'body[data-stage="open"] .slip--tickets{transition-delay:.46s}',
'body[data-stage="open"] .slip:hover,body[data-stage="open"] .slip:focus-visible{transform:translateY(-112px);outline:none}',
'body[data-stage="open"] .slip:focus-visible .slip__inner{outline:2px solid var(--blue);outline-offset:2px}',
'body[data-stage="open"] .slip:active{transform:translateY(-124px)}',
'body[data-stage="open"] .env-open,body[data-stage="letter"] .env-open,body[data-stage="tickets"] .env-open{display:none}',
'body:not([data-stage="sealed"]) .env-hint{opacity:0;animation:none}',
/* the pulled-out slip keeps travelling upward and hands over to the real thing */
'body[data-stage="letter"] .slip--letter,body[data-stage="tickets"] .slip--tickets{',
'  transform:translateY(-190px);opacity:0;transition:transform .55s ease-in,opacity .35s ease-in}',
'body[data-stage="letter"] .slip--tickets,body[data-stage="tickets"] .slip--letter{opacity:0;transform:translateY(20px)}',
'body[data-stage="letter"] .slip,body[data-stage="tickets"] .slip{pointer-events:none}',
/* ...while the envelope shrinks to a corner of the page, still clickable to put things back */
'body[data-stage="letter"] .envelope,body[data-stage="tickets"] .envelope{transform:scale(.26);cursor:pointer}',
'body[data-stage="letter"] .envelope:hover,body[data-stage="tickets"] .envelope:hover{filter:brightness(1.08)}',
'.env-back-btn{position:absolute;inset:0;z-index:9;border:0;background:none;cursor:pointer;color:transparent;',
'  display:none;font:inherit}',
'body[data-stage="letter"] .env-back-btn,body[data-stage="tickets"] .env-back-btn{display:block}',
'.putback{margin:2px 0 0;text-align:center;color:#cfdcde;font-family:var(--mono);font-size:9.5px;',
'  letter-spacing:.24em;text-transform:uppercase;opacity:0;transition:opacity .5s .5s;pointer-events:none}',
'body[data-stage="letter"] .putback,body[data-stage="tickets"] .putback{opacity:.45}',

/* ---------- what comes out ---------- */
'.panel{width:min(760px,100%);margin-top:clamp(16px,3vw,30px);',
'  animation:pullout .85s cubic-bezier(.2,.75,.2,1) both;transform-origin:50% 0}',
'@keyframes pullout{',
'  0%{opacity:0;transform:translateY(-46px) scaleY(.55) scaleX(.9)}',
'  55%{opacity:1}',
'  100%{opacity:1;transform:none}}',

/* ---------- letter ---------- */
'.letter{background:var(--paper);border-radius:3px;padding:clamp(26px,5vw,56px);',
'  box-shadow:0 40px 80px -40px rgba(0,0,0,.7);line-height:1.6;font-size:clamp(17px,2.1vw,19px)}',
'.letter__head{display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--blue);text-align:center}',
'.letter__brand{font-size:clamp(23px,3.6vw,30px);font-weight:700;letter-spacing:.02em}',
'.letter__strap{font-family:var(--mono);font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--ink-2)}',
'.letter__ref{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:22px 0 26px;',
'  padding:9px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);',
'  font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-2)}',
'.letter p{margin:0 0 16px}',
'.letter__greeting{font-size:1.18em;color:var(--blue)}',
'.letter__itin{margin:30px 0 6px}',
'.letter__itin h3,.letter__note h3{margin:0 0 12px;font-family:var(--mono);font-size:11px;',
'  letter-spacing:.24em;text-transform:uppercase;color:var(--ink-2);font-weight:400}',
'.itin{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}',
'.itin__row{display:grid;grid-template-columns:64px 1fr auto;gap:14px;align-items:baseline;',
'  padding:12px 0;border-bottom:1px solid var(--line)}',
'.itin__code{font-family:var(--mono);font-size:15px;letter-spacing:.1em;color:var(--red)}',
'.itin__what b{display:block;font-weight:600;color:var(--blue)}',
'.itin__what em{font-style:normal;font-size:.88em;color:var(--ink-2)}',
'.itin__when{font-family:var(--mono);font-size:12px;color:var(--ink-2);text-align:right}',
'.letter__note{margin:30px 0;padding:22px 24px;background:#fbf6ea;border-left:2px solid var(--gold)}',
'.letter__note p{font-style:italic;font-size:1.1em;margin:0 0 10px;color:#3a3128}',
'.letter__note p:last-child{margin-bottom:0}',
'.letter__sign{margin-top:34px}',
'.signoff{margin:0 0 4px!important;color:var(--ink-2)}',
'.couple{margin:0!important;font-size:1.5em;font-weight:600;color:var(--blue)}',
'.couple--full{font-size:.72em;font-weight:400;color:var(--ink-2);margin-top:6px!important}',
'.letter__small{margin-top:32px!important;padding-top:14px;border-top:1px solid var(--line);',
'  font-family:var(--mono);font-size:10.5px;line-height:1.7;color:var(--ink-2)}',

/* ---------- tickets ---------- */
'.tearline{display:flex;align-items:center;gap:14px;margin:0 0 18px;color:#cfdcde}',
'.tearline::before,.tearline::after{content:"";flex:1 1 auto;border-top:1px dashed rgba(207,220,222,.45)}',
'.tearoff{font:inherit;font-size:13px;font-family:var(--mono);letter-spacing:.18em;text-transform:uppercase;',
'  cursor:pointer;border:1px dashed rgba(207,220,222,.5);border-radius:2px;padding:7px 15px;',
'  background:transparent;color:#dfe9ea;transition:background .2s,color .2s,border-color .2s}',
'.tearoff:hover{background:var(--paper);color:var(--blue);border-color:transparent}',
'.tearoff:focus-visible{outline:2px solid #ffd9a0;outline-offset:3px}',
'.pass{display:flex;background:var(--paper);border-radius:4px;margin:0 0 22px;overflow:hidden;',
'  box-shadow:0 32px 60px -34px rgba(0,0,0,.75);transition:transform .35s,box-shadow .35s}',
'.pass:hover,.pass:focus-visible{transform:translateY(-4px);box-shadow:0 40px 70px -34px rgba(0,0,0,.85);outline:none}',
'.pass__main{flex:1 1 auto;padding:clamp(18px,3vw,26px);min-width:0}',
'.pass__brand{display:flex;align-items:center;gap:11px;color:var(--blue);padding-bottom:12px;border-bottom:1px solid var(--line)}',
'.pass__mark{display:flex;flex:none}',
'.pass__brandtext{display:flex;flex-direction:column;flex:1 1 auto;min-width:0}',
'.pass__brandname{font-size:18px;font-weight:700;line-height:1.15}',
'.pass__strap{font-family:var(--mono);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-2)}',
'.pass__no{font-family:var(--mono);font-size:11px;color:var(--ink-2);flex:none}',
'.pass__title{margin:14px 0 16px;font-family:var(--mono);font-weight:700;font-size:13px;',
'  letter-spacing:.34em;text-transform:uppercase;color:var(--red)}',
'.pass__grid{display:grid;gap:12px 18px;grid-template-columns:repeat(4,minmax(0,1fr))}',
'.pass__grid--top{grid-template-columns:minmax(0,1.9fr) minmax(0,.85fr) minmax(0,.85fr) minmax(0,1.1fr)}',
'.pass__grid--bottom{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}',
'.field{min-width:0}',
'.field__label{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.2em;',
'  text-transform:uppercase;color:var(--ink-2);margin-bottom:3px}',
'.field__value{display:block;font-family:var(--mono);font-size:14px;font-weight:700;',
'  letter-spacing:.04em;color:var(--ink);overflow-wrap:anywhere}',
'.field--nowrap .field__value{white-space:nowrap;overflow-wrap:normal}',
'.pass__route{display:flex;align-items:center;gap:14px;margin:20px 0 4px;padding:16px 0;',
'  border-top:1px solid var(--line);border-bottom:1px solid var(--line)}',
'.route__end{flex:1 1 0;min-width:0}',
'.route__end--to{text-align:right}',
'.route__code{display:block;font-size:clamp(30px,6vw,44px);font-weight:700;line-height:1;color:var(--blue)}',
'.route__city{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.18em;',
'  text-transform:uppercase;color:var(--ink-2);margin-top:5px}',
'.route__mid{color:var(--red);flex:none;display:flex}',
'.pass__occasion{margin-top:16px}',
'.pass__occasion h4{margin:0 0 4px;font-size:20px;font-weight:600;color:var(--blue)}',
'.pass__occasion p{margin:0;font-size:15.5px;line-height:1.5;color:#4a4137}',
'.pass__follow{margin-top:8px!important;font-family:var(--mono);font-size:10px;',
'  letter-spacing:.2em;text-transform:uppercase;color:var(--red)}',
'.pass__stub{flex:0 0 186px;padding:clamp(16px,2.4vw,20px);background:#f1e8d5;',
'  border-left:2px dashed rgba(120,105,80,.45);display:flex;flex-direction:column;gap:11px}',
'.stub__brand{font-size:13px;font-weight:700;color:var(--blue);line-height:1.15}',
'.stub__rows{display:flex;flex-direction:column;gap:6px}',
'.stub__row{display:flex;justify-content:space-between;gap:8px;align-items:baseline;font-family:var(--mono);',
'  font-size:9.5px;border-bottom:1px dotted rgba(120,105,80,.35);padding-bottom:3px}',
'.stub__row span{letter-spacing:.14em;text-transform:uppercase;color:var(--ink-2);flex:none}',
'.stub__row b{font-size:10px;text-align:right;white-space:nowrap}',
'.stub__tag{margin-top:auto;font-size:14px;font-weight:600;color:var(--blue);line-height:1.15}',
'.barcode{display:flex;align-items:flex-end;height:40px}',
'.barcode i{display:block;height:100%;background:var(--ink)}',

/* ---------- footer ---------- */
'.pagefoot{margin:58px 0 0;color:#cfdcde;opacity:.45;font-family:var(--mono);font-size:10px;',
'  letter-spacing:.24em;text-transform:uppercase;text-align:center}',

/* ---------- small screens ---------- */
'@media (max-width:640px){',
'  .pass{flex-direction:column}',
'  .pass__stub{flex:none;border-left:0;border-top:2px dashed rgba(120,105,80,.45)}',
'  .stub__rows{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}',
'  .stub__tag{margin-top:4px}',
'  .pass__grid--top,.pass__grid--bottom{grid-template-columns:1fr 1fr}',
/* the envelope has little room, so the stamp moves up out of the address's way
   and the cancellation mark steps aside altogether */
'  .env-address{top:53%;right:9%;max-width:none}',
'  .env-address .who{font-size:19px}',
'  .env-stamp{transform:rotate(3.2deg) scale(.46);transform-origin:100% 0;right:5%;top:25%}',
'  .postmark{display:none}',
'  .slip{gap:10px}',
'  .slip__inner{padding:9px 11px 54px}',
'  .slip__caption{font-size:8.5px;letter-spacing:.14em}',
'  .slip__brand{font-size:13px}',
'  .slip__head{gap:7px;margin-top:7px}',
'  .tedges{margin-top:7px}',
'  body[data-stage="open"] .slip{transform:translateY(-88px)}',
'  body[data-stage="open"] .slip:hover,body[data-stage="open"] .slip:focus-visible{transform:translateY(-98px)}',
'}',

/* ---------- reduced motion ---------- */
'@media (prefers-reduced-motion:reduce){',
'  *,*::before,*::after{transition-duration:.001ms!important;animation-duration:.001ms!important;',
'    animation-iteration-count:1!important}',
'}',

/* ---------- print: the passes, and nothing else ---------- */
'@media print{',
'  body{background:#fff!important;background-image:none!important;padding:0;display:block}',
'  .env-wrap,.putback,.pagefoot,.tearline,.tickets__intro,.panel--letter{display:none!important}',
'  .panel--tickets,.panel--tickets[hidden]{display:block!important;width:100%;margin:0;animation:none}',
'  .pass{break-inside:avoid;page-break-inside:avoid;box-shadow:none;border:1px solid #b9a888;',
'    margin:0 0 8mm;border-radius:0}',
'  .pass:hover{transform:none}',
'  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}',
'  @page{size:A4 portrait;margin:12mm}',
'}'
    ].join('\n');
  }

  function script() {
    return [
      '(function(){',
      '  var body=document.body;',
      '  var wrap=document.querySelector(".env-wrap");',
      '  var envelope=document.querySelector(".envelope");',
      '  var letterPanel=document.getElementById("panel-letter");',
      '  var ticketPanel=document.getElementById("panel-tickets");',
      '  var SHRUNK=0.26;',
      '',
      '  /* The envelope keeps its natural size in layout; when it shrinks we hand the',
      '     wrapper the reduced height so the page closes up around it. */',
      '  function sizeWrap(stage){',
      '    var natural=envelope.offsetHeight;',
      '    if(!natural){return;}',
      '    var out=stage==="letter"||stage==="tickets";',
      '    wrap.style.height=(out?Math.round(natural*SHRUNK):natural)+"px";',
      '  }',
      '',
      '  function setStage(stage){',
      '    body.setAttribute("data-stage",stage);',
      '    letterPanel.hidden=stage!=="letter";',
      '    ticketPanel.hidden=stage!=="tickets";',
      '    sizeWrap(stage);',
      '    if(stage==="letter"||stage==="tickets"){',
      '      var panel=stage==="letter"?letterPanel:ticketPanel;',
      '      panel.style.animation="none";void panel.offsetWidth;panel.style.animation="";',
      '      window.scrollTo({top:0,behavior:"smooth"});',
      '    }',
      '  }',
      '',
      '  Array.prototype.forEach.call(document.querySelectorAll("[data-stage-to]"),function(el){',
      '    el.addEventListener("click",function(){setStage(el.getAttribute("data-stage-to"));});',
      '  });',
      '',
      '  var printBtn=document.getElementById("btn-print");',
      '  if(printBtn){printBtn.addEventListener("click",function(){window.print();});}',
      '',
      '  document.addEventListener("keydown",function(e){',
      '    if(e.key!=="Escape")return;',
      '    var stage=body.getAttribute("data-stage");',
      '    if(stage==="letter"||stage==="tickets")setStage("open");',
      '  });',
      '',
      '  window.addEventListener("resize",function(){sizeWrap(body.getAttribute("data-stage"));});',
      '  if(document.fonts&&document.fonts.ready){',
      '    document.fonts.ready.then(function(){sizeWrap(body.getAttribute("data-stage"));});',
      '  }',
      '  setStage("sealed");',
      '})();'
    ].join('\n');
  }

  /* Assemble one complete invitation file. */
  function buildDocument(options) {
    var opts = options || {};
    var lang = opts.lang === 'it' ? 'it' : 'en';
    var t = I.COPY[lang];

    /* The builder shows the three printed forms of the name and lets you
       overtype any of them, so an unusual name is never mangled. */
    var names = I.nameForms(opts.passenger || '');
    var overrides = opts.nameOverrides || {};
    ['full', 'first', 'short'].forEach(function (key) {
      if (overrides[key]) names[key] = overrides[key];
    });

    var note = String(opts.note || '').trim();
    var fontCss = opts.fontCss || '';
    var passes = I.LEGS.map(function (leg, i) { return pass(leg, t, names, i); }).join('');

    return '<!doctype html>\n' +
'<html lang="' + t.htmlLang + '">\n' +
'<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>' + esc(t.docTitle) + (names.first ? ' · ' + esc(names.first) : '') + '</title>\n' +
'<meta name="description" content="' + esc(t.brand + ' — ' + t.strapline) + '">\n' +
'<style>\n' + styles(fontCss) + '\n</style>\n' +
'<noscript><style>.env-wrap{display:none}.panel[hidden]{display:block!important}</style></noscript>\n' +
'</head>\n' +
'<body data-stage="sealed">\n' +

'<div class="env-wrap">' +
  '<div class="envelope">' +
    '<div class="env-back"></div>' +
    slips(t) +
    '<div class="env-front">' +
      '<div class="env-address">' +
        '<span class="to">' + esc(t.envelopePassenger) + '</span>' +
        '<span class="who">' + esc(names.full || t.envelopePassenger) + '</span>' +
        '<span class="via">' + esc(t.envelopeVia) + '</span>' +
      '</div>' +
      '<span class="env-stamp">' + I.stampSvg(I.COUPLE.initials, '28.12.2026') + '</span>' +
      I.postmarkSvg() +
    '</div>' +
    '<div class="env-flap"></div>' +
    '<div class="seal">' + esc(I.COUPLE.initials) + '</div>' +
    '<button type="button" class="env-open" data-stage-to="open">' + esc(t.envelopeOpenLabel) + '</button>' +
    '<button type="button" class="env-back-btn" data-stage-to="open">' + esc(t.backToEnvelope) + '</button>' +
    '<p class="env-hint">' + esc(t.envelopeHint) + '</p>' +
  '</div>' +
'</div>\n' +
'<p class="putback">' + esc(t.backToEnvelope) + '</p>\n' +

'<section class="panel panel--letter" id="panel-letter" hidden>' + letter(t, names, note) + '</section>\n' +
'<section class="panel panel--tickets" id="panel-tickets" hidden>' +
  '<p class="tearline"><button type="button" class="tearoff" id="btn-print">' + esc(t.printTickets) + '</button></p>' +
  passes +
'</section>\n' +

'<p class="pagefoot">' + esc(t.tagline) + '</p>\n' +
'<script>\n' + script() + '\n<\/script>\n' +
'</body>\n</html>\n';
  }

  I.buildDocument = buildDocument;
})();
