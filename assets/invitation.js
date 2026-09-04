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

  var FLIGHT = 'I DO';
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

  /* Postage stamp, drawn rather than photographed so it prints sharp. The
     perforations are paper-coloured circles laid over the stamp's edge. */
  function stampSvg(initials, dateLine) {
    var w = 84, h = 100, step = 12, holes = '';
    for (var x = step / 2; x < w; x += step) {
      holes += '<circle cx="' + x + '" cy="0" r="3.1"/><circle cx="' + x + '" cy="' + h + '" r="3.1"/>';
    }
    for (var y = step / 2; y < h; y += step) {
      holes += '<circle cx="0" cy="' + y + '" r="3.1"/><circle cx="' + w + '" cy="' + y + '" r="3.1"/>';
    }
    return '' +
      '<svg class="stamp" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-hidden="true">' +
        '<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="#f3ead6"/>' +
        '<rect x="6" y="6" width="' + (w - 12) + '" height="' + (h - 12) + '" fill="none" stroke="#a83f2a" stroke-width="1.1"/>' +
        '<path d="M14 62 C 26 34, 58 34, 70 62" fill="none" stroke="#123a4d" stroke-width="1.2"/>' +
        '<path d="M20 46 l 44 0 M42 30 l 0 12" stroke="#123a4d" stroke-width="1" opacity=".5"/>' +
        '<text x="' + (w / 2) + '" y="52" text-anchor="middle" font-family="Cormorant Garamond, Garamond, serif" font-size="26" fill="#123a4d">' + esc(initials) + '</text>' +
        '<text x="' + (w / 2) + '" y="78" text-anchor="middle" font-family="Courier Prime, Courier New, monospace" font-size="8.5" letter-spacing="1" fill="#a83f2a">' + esc(dateLine) + '</text>' +
        '<g fill="#efe6d3">' + holes + '</g>' +
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
        /* fuselage */
        '<path d="M32 11 c2.6 5 3 14 3 21 v9 c0 4 -1 8 -3 11 c-2 -3 -3 -7 -3 -11 v-9 c0 -7 .4 -16 3 -21 z" fill="currentColor"/>' +
        /* swept wings */
        '<path d="M32 27 L11 39 v3.4 L32 35.6 L53 42.4 V39 z" fill="currentColor"/>' +
        /* tailplane */
        '<path d="M32 45 L22.5 50.5 v2.2 L32 49.4 l9.5 3.3 v-2.2 z" fill="currentColor"/>' +
      '</svg>';
  }

  function postmarkSvg() {
    return '' +
      '<svg class="postmark" viewBox="0 0 120 120" width="120" height="120" role="img" aria-hidden="true">' +
        '<circle cx="60" cy="60" r="46" fill="none" stroke="#a83f2a" stroke-width="2" opacity=".55"/>' +
        '<circle cx="60" cy="60" r="38" fill="none" stroke="#a83f2a" stroke-width="1" opacity=".45"/>' +
        '<path d="M18 44 h84 M18 76 h84" stroke="#a83f2a" stroke-width="1" opacity=".35"/>' +
        '<text x="60" y="56" text-anchor="middle" font-family="Courier Prime, Courier New, monospace" font-size="11" letter-spacing="1.5" fill="#a83f2a" opacity=".6">AMS · WDH</text>' +
        '<text x="60" y="72" text-anchor="middle" font-family="Courier Prime, Courier New, monospace" font-size="11" letter-spacing="1.5" fill="#a83f2a" opacity=".6">BFA MAIL</text>' +
      '</svg>';
  }

  return {
    COUPLE: COUPLE,
    FLIGHT: FLIGHT,
    CLASS: CLASS,
    LEGS: LEGS,
    COPY: COPY,
    esc: esc,
    nameForms: nameForms,
    slugify: slugify,
    barcode: barcode,
    paperGrain: paperGrain,
    stampSvg: stampSvg,
    roundelSvg: roundelSvg,
    postmarkSvg: postmarkSvg
  };
})();
