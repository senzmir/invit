/* Briotto Family Airline -- the invitation itself.
 *
 * This file holds three things, in this order:
 *
 *   1. LEGS   - the hard facts of the three celebrations. THIS IS THE ONLY PLACE
 *               TO EDIT DATES, TIMES AND VENUES. Leave `time` or `venue` empty and
 *               the pass prints "full details to follow" instead.
 *   2. COPY   - every visible string, in English and Italian.
 *   3. buildDocument() - assembles a complete, self-contained invitation document.
 *
 * The builder (index.html) calls buildDocument() for each guest and hands you the
 * resulting file to email. Nothing here touches the network: fonts arrive
 * base64'd from assets/fonts.js and every mark is inline SVG or CSS.
 */
window.INVITATION = (function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. LEGS -- the wedding facts. Edit here.
   * ------------------------------------------------------------------ */

  var COUPLE = {
    one: 'Filippo Briotto',
    two: 'Victoria Vanity Pamwenatse Akuunda',
    shortOne: 'Filippo',
    shortTwo: 'Victoria',
    initials: 'F & V'
  };

  /* Which envelope the invitations go out in: 'quiet' is plain ivory with a
     hairline rule; 'airmail' adds the striped par avion border and its little
     blue label. Both are sealed with the same red wax. */
  var ENVELOPE = 'quiet';

  var FLIGHT = '1D0';
  var CLASS = 'First';

  var LEGS = [
    {
      id: 'ams',
      from: 'HOM',
      to: 'AMS',
      seat: '1A',
      gate: '28',
      tkt: '2812-2026',
      time: '',   // e.g. '15:00'  -- empty prints "full details to follow"
      venue: ''   // e.g. 'Stadhuis, Amstel 1'
    },
    {
      id: 'wdh',
      from: 'AMS',
      to: 'WDH',
      seat: '1B',
      gate: '09',
      tkt: 'SEPT-2027',
      time: '',
      venue: ''
    },
    {
      id: 'ita',
      from: 'WDH',
      to: 'ITA',
      seat: '1C',
      gate: '—',
      tkt: 'TBA',
      time: '',
      venue: ''
    }
  ];

  /* ------------------------------------------------------------------ *
   * 2. COPY -- every visible string, both languages.
   * ------------------------------------------------------------------ */

  var COPY = {
    en: {
      htmlLang: 'en',
      docTitle: 'Briotto Family Airline — Boarding Pass',
      brand: 'Briotto Family Airline',
      strapline: 'Wedding invitation · First class service',

      envelopeHint: 'Tap to open',
      envelopeVia: 'By air mail · Par avion',
      envelopeVia2: 'By air mail',
      envelopePassenger: 'Passenger',
      envelopeOpenLabel: 'Open the envelope',

      tabLetter: 'The letter',
      tabTickets: 'The boarding passes',
      backToEnvelope: 'Back to the envelope',
      printTickets: 'Print the tickets',

      bookingTitle: 'Booking confirmation',
      refLabel: 'Reference',
      greeting: function (name) { return 'Dear ' + name + ','; },
      letterBody: [
        'Your seat is reserved. We are getting married, and we would like you there — not once, but three times, on three legs of the same happy journey.',
        'The first leg lands in Amsterdam on the 28th of December. It is a small, quiet ceremony: the vows and nothing else, no reception. The second leg is the big one — the traditional celebration in Namibia, in September. And somewhere between the two, Italy, for a long dinner and a longer evening.',
        'Full details for each leg will follow in good time. For now, all you need to do is say yes.'
      ],
      itineraryTitle: 'Your itinerary',
      noteTitle: 'A note for you',
      signOff: 'With all our love,',
      smallPrint: 'This booking is non-transferable, infinitely refundable in love, and requires no luggage but yourselves. Changes to the itinerary will be communicated by the Briotto Family Airline in due course.',

      boardingPass: 'Boarding pass',
      lPassenger: 'Passenger',
      lClass: 'Class',
      lFlight: 'Flight',
      lDate: 'Date',
      lFrom: 'From',
      lTo: 'To',
      lSeat: 'Seat',
      lGate: 'Gate',
      lTkt: 'Tkt',
      lStatus: 'Status',
      lTime: 'Time',
      lVenue: 'Venue',
      confirmed: 'Confirmed',
      className: 'First',
      tagline: 'Join us as we say “I do”',
      detailsToFollow: 'Full details to follow',

      legs: {
        ams: {
          title: 'The vows',
          blurb: 'An intimate ceremony. No reception — just the two of us saying it out loud, and you there to hear it.',
          fromCity: 'Wherever you are',
          toCity: 'Amsterdam',
          date: '28 DEC 2026',
          dateLong: '28 December 2026'
        },
        wdh: {
          title: 'The traditional ceremony',
          blurb: 'The big one. Family, custom and celebration, the way it should be done, in Namibia.',
          fromCity: 'Amsterdam',
          toCity: 'Windhoek',
          date: 'SEPT 2027',
          dateLong: 'September 2027'
        },
        ita: {
          title: 'The dinner',
          blurb: 'A long table in Italy, and everything that comes with it. Date to be announced.',
          fromCity: 'Windhoek',
          toCity: 'Italy',
          date: 'DATE TBA',
          dateLong: 'To be announced'
        }
      }
    },

    it: {
      htmlLang: 'it',
      docTitle: 'Briotto Family Airline — Carta d’imbarco',
      brand: 'Briotto Family Airline',
      strapline: 'Invito di nozze · Servizio di prima classe',

      envelopeHint: 'Tocca per aprire',
      envelopeVia: 'Posta aerea · Par avion',
      envelopeVia2: 'Posta aerea',
      envelopePassenger: 'Passeggero',
      envelopeOpenLabel: 'Apri la busta',

      tabLetter: 'La lettera',
      tabTickets: 'Le carte d’imbarco',
      backToEnvelope: 'Torna alla busta',
      printTickets: 'Stampa i biglietti',

      bookingTitle: 'Conferma di prenotazione',
      refLabel: 'Riferimento',
      greeting: function (name) { return 'Ciao ' + name + ','; },
      letterBody: [
        'Il tuo posto è prenotato. Ci sposiamo, e ci farebbe piacere averti con noi — non una volta, ma tre, sulle tre tratte dello stesso viaggio felice.',
        'La prima tratta atterra ad Amsterdam il 28 dicembre. È una cerimonia piccola e raccolta: solo le promesse, senza ricevimento. La seconda è quella grande — la celebrazione tradizionale in Namibia, a settembre. E da qualche parte tra le due, l’Italia, per una cena lunga e una serata ancora più lunga.',
        'Tutti i dettagli di ogni tratta arriveranno a tempo debito. Per ora ti basta dire di sì.'
      ],
      itineraryTitle: 'Il tuo itinerario',
      noteTitle: 'Due righe per te',
      signOff: 'Con tutto il nostro affetto,',
      smallPrint: 'Questa prenotazione non è cedibile, è infinitamente rimborsabile in affetto e non richiede altro bagaglio che voi stessi. Eventuali modifiche all’itinerario saranno comunicate dalla Briotto Family Airline a tempo debito.',

      boardingPass: 'Carta d’imbarco',
      lPassenger: 'Passeggero',
      lClass: 'Classe',
      lFlight: 'Volo',
      lDate: 'Data',
      lFrom: 'Da',
      lTo: 'A',
      lSeat: 'Posto',
      lGate: 'Gate',
      lTkt: 'Bigl.',
      lStatus: 'Stato',
      lTime: 'Ora',
      lVenue: 'Luogo',
      confirmed: 'Confermato',
      className: 'Prima',
      tagline: 'Unisciti a noi quando diremo “sì”',
      detailsToFollow: 'Dettagli a seguire',

      legs: {
        ams: {
          title: 'Le promesse',
          blurb: 'Una cerimonia intima. Nessun ricevimento — solo noi due che lo diciamo ad alta voce, e tu lì ad ascoltare.',
          fromCity: 'Ovunque tu sia',
          toCity: 'Amsterdam',
          date: '28 DIC 2026',
          dateLong: '28 dicembre 2026'
        },
        wdh: {
          title: 'La cerimonia tradizionale',
          blurb: 'Quella grande. Famiglia, tradizione e festa, come si deve, in Namibia.',
          fromCity: 'Amsterdam',
          toCity: 'Windhoek',
          date: 'SETT 2027',
          dateLong: 'Settembre 2027'
        },
        ita: {
          title: 'La cena',
          blurb: 'Una tavolata lunga in Italia, e tutto quello che ne consegue. Data da annunciare.',
          fromCity: 'Windhoek',
          toCity: 'Italia',
          date: 'DATA TBA',
          dateLong: 'Da annunciare'
        }
      }
    }
  };

  /* ------------------------------------------------------------------ *
   * 3. Helpers
   * ------------------------------------------------------------------ */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* A guest name is typed once and printed three ways: in full and shouted on
     the passes, first-name-only in the letter, and initial + surname on the
     tear-off stub the way the reference pass did it ("R. PINEHAS"). Names with
     two guests ("Anna & Marco Rossi") keep both given names in the greeting. */
  function nameForms(raw) {
    var name = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!name) return { full: '', first: '', short: '' };

    var parts = name.split(' ');
    var surname = parts[parts.length - 1];
    var given = parts.slice(0, -1);

    var joined = name.replace(/\s*(&|\band\b|\be\b)\s*/gi, ' & ');
    var isPair = /&/.test(joined);

    var first;
    if (isPair) {
      first = joined
        .split('&')
        .map(function (chunk) { return chunk.trim().split(' ')[0]; })
        .filter(Boolean)
        .join(' & ');
    } else {
      first = parts[0];
    }

    var short;
    if (isPair) {
      short = joined
        .split('&')
        .map(function (chunk) { return chunk.trim().charAt(0).toUpperCase() + '.'; })
        .filter(function (i) { return i !== '.'; })
        .join(' & ') + ' ' + surname;
    } else {
      short = (given.length ? given[0].charAt(0).toUpperCase() + '. ' : '') + surname;
    }

    return { full: name.toUpperCase(), first: first, short: short.toUpperCase() };
  }

  function slugify(raw) {
    return String(raw || '')
      .replace(/\u00df/g, 'ss')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'guest';
  }

  /* A barcode that looks like a barcode. Deterministic per ticket number so the
     same pass always prints the same bars. */
  function barcode(seedText) {
    var seed = 0;
    for (var i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) % 100000;
    var bars = [];
    for (var b = 0; b < 46; b++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      var w = 1 + (seed % 3);
      var gap = 1 + ((seed >> 8) % 2);
      bars.push('<i style="width:' + w + 'px;margin-right:' + gap + 'px"></i>');
    }
    return '<div class="barcode" aria-hidden="true">' + bars.join('') + '</div>';
  }

  /* Postage stamp: the two of them in the picture panel, the date on the band
     underneath, perforations punched as paper-coloured circles over the edge.
     The picture comes in as a data URL from assets/stamp-art.js -- swap the file
     in assets/stamp/ and rebuild to put a drawing there instead. */
  function stampSvg(dateLine, art) {
    var w = 88, h = 108, step = 11, holes = '', x, y;
    for (x = step / 2; x < w; x += step) {
      holes += '<circle cx="' + x.toFixed(1) + '" cy="0" r="2.9"/>' +
               '<circle cx="' + x.toFixed(1) + '" cy="' + h + '" r="2.9"/>';
    }
    for (y = step / 2; y < h; y += step) {
      holes += '<circle cx="0" cy="' + y.toFixed(1) + '" r="2.9"/>' +
               '<circle cx="' + w + '" cy="' + y.toFixed(1) + '" r="2.9"/>';
    }

    var INK = '#123a4d', PAPER = '#f6eeda';

    /* the picture panel, or the airline's mark if no artwork is loaded */
    var panel = art
      ? '<image href="' + esc(art) + '" xlink:href="' + esc(art) + '" ' +
          'x="7" y="7" width="74" height="76" preserveAspectRatio="xMidYMin slice" ' +
          'clip-path="url(#bfa-stamp-clip)"/>'
      : '<g transform="translate(44 45) scale(.62) translate(-32 -32)" fill="' + INK + '">' +
          '<circle cx="32" cy="32" r="30" fill="none" stroke="' + INK + '" stroke-width="1.8"/>' +
          '<path d="M32 11 c2.6 5 3 14 3 21 v9 c0 4 -1 8 -3 11 c-2 -3 -3 -7 -3 -11 v-9 c0 -7 .4 -16 3 -21 z"/>' +
          '<path d="M32 27 L11 39 v3.4 L32 35.6 L53 42.4 V39 z"/>' +
          '<path d="M32 45 L22.5 50.5 v2.2 L32 49.4 l9.5 3.3 v-2.2 z"/>' +
        '</g>';

    return '' +
      '<svg class="stamp" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" ' +
        'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
        'role="img" aria-label="' + esc(COUPLE.shortOne + ' and ' + COUPLE.shortTwo) + '">' +
        '<defs><clipPath id="bfa-stamp-clip"><rect x="7" y="7" width="74" height="76" rx="1"/></clipPath></defs>' +
        '<rect width="' + w + '" height="' + h + '" fill="' + PAPER + '"/>' +
        panel +
        '<rect x="7" y="7" width="74" height="76" rx="1" fill="none" ' +
          'stroke="rgba(18,58,77,.35)" stroke-width=".7"/>' +
        '<rect x="5" y="5" width="' + (w - 10) + '" height="' + (h - 10) + '" fill="none" ' +
          'stroke="#a83f2a" stroke-width=".9"/>' +
        '<text x="' + (w / 2) + '" y="96.5" text-anchor="middle" ' +
          'font-family="Courier Prime, Courier New, monospace" font-size="7.2" letter-spacing=".9" ' +
          'fill="#a83f2a">' + esc(dateLine) + '</text>' +
        '<g fill="#f3ecdc">' + holes + '</g>' +
      '</svg>';
  }

  /* The cancellation: rings landing over the stamp with the wavy killer bars
     running off across the empty part of the envelope, the way a real one does. */
  function postmarkSvg() {
    return '' +
      '<svg class="postmark" viewBox="0 0 200 100" width="200" height="100" role="img" aria-hidden="true">' +
        '<g fill="none" stroke="#9c3d2a" stroke-linecap="round" opacity=".34">' +
          '<circle cx="155" cy="50" r="38" stroke-width="1.7"/>' +
          '<circle cx="155" cy="50" r="31" stroke-width=".8"/>' +
          '<path d="M6 33 q13 -6.5 26 0 t26 0 t26 0 t26 0" stroke-width="2.1"/>' +
          '<path d="M6 50 q13 -6.5 26 0 t26 0 t26 0 t26 0" stroke-width="2.1"/>' +
          '<path d="M6 67 q13 -6.5 26 0 t26 0 t26 0 t26 0" stroke-width="2.1"/>' +
        '</g>' +
      '</svg>';
  }

  /* Paper grain. A little fractal noise laid over the flat colour is the
     difference between "a cream rectangle" and "a sheet of paper". */
  function paperGrain(baseFrequency, octaves) {
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>" +
      "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='" + baseFrequency +
      "' numOctaves='" + octaves + "' stitchTiles='stitch'/>" +
      "<feColorMatrix type='saturate' values='0'/></filter>" +
      "<rect width='220' height='220' filter='url(%23g)'/></svg>";
    return "url(\"data:image/svg+xml," + svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23') + "\")";
  }

  function roundelSvg(size) {
    return '' +
      '<svg class="roundel" viewBox="0 0 64 64" width="' + size + '" height="' + size + '" role="img" aria-hidden="true">' +
        '<circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
        '<circle cx="32" cy="32" r="24.5" fill="none" stroke="currentColor" stroke-width=".7" opacity=".45"/>' +
        '<path d="M32 11 c2.6 5 3 14 3 21 v9 c0 4 -1 8 -3 11 c-2 -3 -3 -7 -3 -11 v-9 c0 -7 .4 -16 3 -21 z" fill="currentColor"/>' +
        '<path d="M32 27 L11 39 v3.4 L32 35.6 L53 42.4 V39 z" fill="currentColor"/>' +
        '<path d="M32 45 L22.5 50.5 v2.2 L32 49.4 l9.5 3.3 v-2.2 z" fill="currentColor"/>' +
      '</svg>';
  }

  /* The flap. Drawn rather than clip-path'd so it can have a softened tip, a
     gradient across the fold and a proper edge line -- a hard CSS triangle is
     what made the old envelope look like clip art. */
  function flapSvg() {
    return '' +
      '<svg class="env-flap" viewBox="0 0 620 250" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="bfa-flap" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#faf4e7"/>' +
            '<stop offset=".62" stop-color="#f1e8d5"/>' +
            '<stop offset="1" stop-color="#e6dabf"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<path d="M0 0 H620 V30 L327 236 Q310 247 293 236 L0 30 Z" fill="url(#bfa-flap)"/>' +
        '<path d="M620 30 L327 236 Q310 247 293 236 L0 30" fill="none" ' +
          'stroke="rgba(120,100,64,.34)" stroke-width="1.2" vector-effect="non-scaling-stroke"/>' +
      '</svg>';
  }

  /* Sealing wax: an irregular disc with the monogram pressed into it. Pass a
     palette to seal in a different colour. */
  function waxSealSvg(initials, palette) {
    var pts = [], i, n = 22, seed = 7;
    for (i = 0; i < n; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      var wobble = 43.5 + (seed % 1000) / 1000 * 5.5;
      var a = (i / n) * Math.PI * 2;
      pts.push([50 + Math.cos(a) * wobble, 50 + Math.sin(a) * wobble]);
    }
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (i = 1; i <= n; i++) {
      var prev = pts[(i - 1) % n], cur = pts[i % n];
      d += ' Q' + prev[0].toFixed(1) + ' ' + prev[1].toFixed(1) + ' ' +
        ((prev[0] + cur[0]) / 2).toFixed(1) + ' ' + ((prev[1] + cur[1]) / 2).toFixed(1);
    }
    d += ' Z';

    var wax = palette || { light: '#c05a41', mid: '#9d3524', dark: '#6d2016',
      deboss: 'rgba(46,10,4,.72)', emboss: 'rgba(255,214,192,.72)', edge: 'rgba(58,12,6,.45)' };

    return '' +
      '<svg class="seal" viewBox="0 0 100 100" role="img" aria-hidden="true">' +
        '<defs>' +
          '<radialGradient id="bfa-wax" cx="34%" cy="28%" r="78%">' +
            '<stop offset="0" stop-color="' + wax.light + '"/>' +
            '<stop offset=".5" stop-color="' + wax.mid + '"/>' +
            '<stop offset="1" stop-color="' + wax.dark + '"/>' +
          '</radialGradient>' +
        '</defs>' +
        '<path d="' + d + '" fill="url(#bfa-wax)"/>' +
        '<path d="' + d + '" fill="none" stroke="' + wax.edge + '" stroke-width="1.6" ' +
          'transform="translate(0 1.2)" opacity=".5"/>' +
        '<circle cx="50" cy="50" r="33" fill="none" stroke="rgba(52,12,6,.3)" stroke-width="1"/>' +
        '<circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255,190,165,.24)" stroke-width="1" ' +
          'transform="translate(0 -1)"/>' +
        '<text x="50" y="52.5" text-anchor="middle" dominant-baseline="middle" ' +
          'font-family="Cormorant Garamond, Garamond, serif" font-size="27" font-weight="600" ' +
          'fill="' + wax.deboss + '" transform="translate(0 1.3)">' + esc(initials) + '</text>' +
        '<text x="50" y="52.5" text-anchor="middle" dominant-baseline="middle" ' +
          'font-family="Cormorant Garamond, Garamond, serif" font-size="27" font-weight="600" ' +
          'fill="' + wax.emboss + '">' + esc(initials) + '</text>' +
      '</svg>';
  }

  return {
    COUPLE: COUPLE,
    FLIGHT: FLIGHT,
    ENVELOPE: ENVELOPE,
    CLASS: CLASS,
    LEGS: LEGS,
    COPY: COPY,
    esc: esc,
    nameForms: nameForms,
    slugify: slugify,
    barcode: barcode,
    paperGrain: paperGrain,
    stampSvg: stampSvg,
    flapSvg: flapSvg,
    waxSealSvg: waxSealSvg,
    roundelSvg: roundelSvg,
    postmarkSvg: postmarkSvg
  };
})();
