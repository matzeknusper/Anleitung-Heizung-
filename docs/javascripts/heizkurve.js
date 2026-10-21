/*
 * Heizkurven-Rechner für Viessmann Trimatik (Vitola-biferral-RN)
 *
 * Modell: aus Abb. 17 der Betriebsanleitung (5581 083) digitalisiert.
 *   Vorlauf = Raumsoll + Niveau + Neigung · g(Raumsoll − Außentemperatur)
 *   g(d)    = 1,6905·d − 0,017993·d²   (alle 13 Kennlinien 0,2 … 2,6, Abweichung < 1 K)
 * Knopfskalen: aus der Zeichnung des Bedienfelds (16 Rastpositionen, je 20°).
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------- Modell
  var G1 = 1.6905, G2 = -0.017993, DMAX = -G1 / (2 * G2);
  function shape(d) {
    if (d <= 0) return 0;
    var x = Math.min(d, DMAX);
    return G1 * x + G2 * x * x;
  }
  function curve(at, c) { return c.rt + c.niveau + c.neigung * shape(c.rt - at); }

  // ---------------------------------------------------------------- Knöpfe
  function seq(a, step, n) { var r = []; for (var i = 0; i < n; i++) r.push(a + i * step); return r; }
  var KNOBS = {
    sonne: {
      title: "Tag", aria: "Raumtemperatur Tag", sym: "☀︎", where: "Raumtemperatur",
      values: seq(-7, 1, 16), labels: { 0: "−7", 3: "4", 7: "N", 12: "5", 15: "8+" }, def: 7
    },
    mond: {
      title: "Nacht", aria: "Raumtemperatur Nacht", sym: "☽", where: "Raumtemperatur",
      values: seq(-9, 1, 16), labels: { 0: "−9", 3: "6", 9: "N", 12: "3", 15: "6+" }, def: 9
    },
    neigung: {
      title: "Neigung", aria: "Neigung der Heizkurve", sym: "∡", where: "hinter der Klappe",
      values: [0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6],
      labels: { 0: "0,2", 2: "0,6", 4: "0,8", 6: "1,0", 8: "1,2", 11: "1,8", 13: "2,2", 15: "2,6" }, def: 8
    },
    niveau: {
      title: "Niveau", aria: "Niveau der Heizkurve", sym: "⫽", where: "hinter der Klappe",
      values: seq(-12, 3, 16), labels: { 0: "−12", 4: "0", 8: "12", 11: "21", 15: "33+" }, def: 4
    }
  };
  var ORDER = ["sonne", "mond", "neigung", "niveau"];
  function knobValue(k, p) {
    var v = KNOBS[k].values, i = Math.min(Math.floor(p), 14), f = p - i;
    return v[i] + f * (v[i + 1] - v[i]);
  }
  function angleOf(p) { return -150 + 20 * p; }

  // ---------------------------------------------------------------- Format
  function num(x, maxDec) {
    var s = x.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: maxDec == null ? 1 : maxDec });
    return s.replace("-", "−");
  }
  function signed(x, maxDec) { return (x > 0 ? "+" : "") + num(x, maxDec); }
  function deg(x) { return num(Math.round(x)) + " °C"; }

  // ---------------------------------------------------------------- Zustand
  var STORE = "hk-rechner-v1";
  var DEFAULTS = {
    pos: { sonne: 7, mond: 9, neigung: 8, niveau: 4 },
    at: 0, mode: "tag", tmax: 75, tmin: 35, showNight: true, showWerk: true,
    compare: null, ist: null,
    feel: { mild: null, kalt: null, nacht: null }, undo: null, autoCmp: false, applied: false, last: null
  };
  function load() {
    var s = JSON.parse(JSON.stringify(DEFAULTS));
    try {
      var raw = window.localStorage.getItem(STORE);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.pos) ORDER.forEach(function (k) { if (typeof o.pos[k] === "number") s.pos[k] = clamp(o.pos[k], 0, 15); });
        ["at", "tmax", "tmin"].forEach(function (k) { if (typeof o[k] === "number") s[k] = o[k]; });
        if (["tag", "nacht", "frost"].indexOf(o.mode) >= 0) s.mode = o.mode;
        if (typeof o.showNight === "boolean") s.showNight = o.showNight;
        if (typeof o.showWerk === "boolean") s.showWerk = o.showWerk;
        if (o.compare && typeof o.compare.neigung === "number") s.compare = o.compare;
        if (o.feel) ["mild", "kalt", "nacht"].forEach(function (k) { if (typeof o.feel[k] === "string") s.feel[k] = o.feel[k]; });
        if (o.undo && typeof o.undo.neigung === "number") s.undo = o.undo;
        s.autoCmp = !!o.autoCmp; s.applied = !!o.applied;
        if (Array.isArray(o.last)) s.last = o.last.filter(function (c) { return c && KNOBS[c.k] && typeof c.from === "number" && typeof c.to === "number"; });
      }
    } catch (e) { /* Speicher nicht verfügbar: Standardwerte */ }
    return s;
  }
  function save(s) {
    try {
      window.localStorage.setItem(STORE, JSON.stringify({
        pos: s.pos, at: s.at, mode: s.mode, tmax: s.tmax, tmin: s.tmin,
        showNight: s.showNight, showWerk: s.showWerk, compare: s.compare,
        feel: s.feel, undo: s.undo, autoCmp: s.autoCmp, applied: s.applied, last: s.last
      }));
    } catch (e) { /* ignorieren */ }
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  function derivedPos(pos) {
    var neigung = knobValue("neigung", pos.neigung), niveau = knobValue("niveau", pos.niveau);
    return {
      neigung: neigung, niveau: niveau,
      sonne: knobValue("sonne", pos.sonne), mond: knobValue("mond", pos.mond),
      day: { rt: 20 + knobValue("sonne", pos.sonne), neigung: neigung, niveau: niveau },
      night: { rt: 14 + knobValue("mond", pos.mond), neigung: neigung, niveau: niveau }
    };
  }
  function derived(s) { return derivedPos(s.pos); }
  var WERK = { rt: 20, neigung: 1.2, niveau: 0 };

  // Was der Kessel bei Außentemperatur `at` tut
  function evaluate(s, d, at, mode) {
    var c = mode === "tag" ? d.day : d.night;
    var raw = curve(at, c);
    var r = { raw: raw, curve: c, pump: true, band: false, low: false, high: false, temp: null };
    if (mode === "frost") {
      if (at > 3) r.pump = false;
      else if (at >= 1) r.band = true;
    } else {
      if (at > c.rt + 1) r.pump = false;
      else if (at >= c.rt - 1) r.band = true;
    }
    if (r.pump) {
      r.temp = clamp(raw, s.tmin, s.tmax);
      r.low = raw < s.tmin;
      r.high = raw > s.tmax;
    }
    return r;
  }
  function effCurve(s, c, at) {
    if (at > c.rt + 1) return null;
    return clamp(curve(at, c), s.tmin, s.tmax);
  }

  // ---------------------------------------------------------------- Empfehlungen
  var KLABEL = { sonne: "Raumtemperatur Tag", mond: "Raumtemperatur Nacht", neigung: "Neigung", niveau: "Niveau" };
  var KSYM = { sonne: "☀︎", mond: "☽", neigung: "∡", niveau: "⫽" };
  function knobText(k, p) {
    var v = knobValue(k, p);
    if (k === "sonne" || k === "mond") return v === 0 ? "N" : "N " + signed(v);
    if (k === "neigung") return num(v, 2);
    return v === 0 ? "0" : signed(v);
  }
  function normAt() {
    try {
      var o = JSON.parse(window.localStorage.getItem("ab-rechner-v1") || "null");
      if (o && o.haus && typeof o.haus.normAt === "number") return o.haus.normAt;
    } catch (e) { /* Standard */ }
    return -12;
  }
  function crossAt(c, t) {
    for (var at = c.rt; at >= -30; at -= 0.5) if (curve(at, c) >= t) return at;
    return null;
  }
  function atText(a) { return (a > 0 ? "+" : "") + num(a) + " °C"; }

  // Prüft die Einstellung gegen übliche Werte für eine Heizkörper-Anlage
  function checks(s, d) {
    var out = [], na = normAt(), vn = curve(na, d.day), vm = curve(10, d.day);
    function add(kind, text) { out.push({ kind: kind, text: text }); }
    if (vn > s.tmax) {
      var x = crossAt(d.day, s.tmax);
      add("warn", "Sehr steil: Die Tageskurve stößt schon bei " + atText(x) + " außen an die " + num(s.tmax) +
        "-°C-Grenze. Für Heizkörper reichen meist 55 bis 70 °C bei " + atText(na) + ". Wird es bei Frost gut warm, Neigung einen Strich runter probieren.");
    } else if (vn >= 70) {
      add("info", "Eher hoch: " + deg(vn) + " Vorlauf bei " + atText(na) + ". Das passt zu kleinen Heizkörpern oder einem wenig gedämmten Haus. Werden alle Räume bei Frost gut warm, geht es vermutlich tiefer.");
    } else if (vn >= 55) {
      add("ok", "Bei " + atText(na) + " liefert die Tageskurve " + deg(vn) + ". Das ist für Heizkörper üblich.");
    } else if (vn >= 45) {
      add("ok", "Eher flach: " + deg(vn) + " bei " + atText(na) + ". Gut, wenn alle Räume warm werden, etwa bei guter Dämmung oder großen Heizkörpern. Bleibt es bei Frost kühl, Neigung einen Strich höher.");
    } else {
      add("warn", "Sehr flach für Heizkörper: nur " + deg(vn) + " bei " + atText(na) + ". Bei Frost reicht das selten. Neigung erhöhen, sobald es kalt wird.");
    }
    if (vm > 45) add("warn", "An milden Tagen recht heiß: " + deg(vm) + " bei +10 °C. Üblich sind 35 bis 42 °C. Meist stehen Niveau oder Tag-Knopf zu hoch.");
    if (d.neigung > 1.6) add("info", "Neigung " + num(d.neigung, 2) + " ist für Heizkörper ungewöhnlich steil. Üblich sind 1,0 bis 1,4.");
    else if (d.neigung < 0.8) add("info", "Neigung " + num(d.neigung, 2) + " ist eher ein Wert für Fußbodenheizungen. Für Heizkörper ist das ungewöhnlich flach.");
    if (Math.abs(d.niveau) >= 9) add("info", "Das Niveau ist weit verstellt (" + signed(d.niveau) + " K). Üblich ist, mit Neigung und Tag-Knopf zu arbeiten und das Niveau nur zur Feinkorrektur zu nutzen.");
    if (d.day.rt >= 23) add("info", "Tag-Knopf auf " + knobText("sonne", s.pos.sonne) + ", also etwa " + num(d.day.rt) + " °C Raum. Jedes Grad weniger spart etwa 6 % Heizenergie. Außerdem heizt die Anlage bis " + num(d.day.rt + 1) + " °C außen.");
    else if (d.day.rt <= 17) add("info", "Tag-Knopf sehr niedrig, etwa " + num(d.day.rt) + " °C Raum. Sparsam, aber nur sinnvoll, wenn es dir warm genug ist.");
    if (d.night.rt >= d.day.rt - 1) add("warn", "Keine echte Nachtabsenkung: Nacht etwa " + num(d.night.rt) + " °C, Tag etwa " + num(d.day.rt) + " °C. Üblich sind 3 bis 6 K weniger.");
    else if (d.day.rt - d.night.rt > 8) add("info", "Sehr tiefe Nachtabsenkung, etwa " + num(d.night.rt) + " °C. Das spart, aber morgens dauert das Aufheizen länger.");
    var order = { warn: 0, info: 1, ok: 2 };
    out.sort(function (a, b) { return order[a.kind] - order[b.kind]; });
    return out.slice(0, 5);
  }

  // Empfehlung aus der Rückmeldung (folgt der Korrekturtabelle der Original-Anleitung)
  function recommend(s) {
    var f = s.feel, M = f.mild, K = f.kalt === "?" ? null : f.kalt, N = f.nacht;
    var r = { answered: !!(f.mild || f.kalt || f.nacht), title: null, kind: "change", stages: false, acts: [], notes: [], info: null };
    function act(k, delta, why) { r.acts.push({ k: k, delta: delta, why: why }); }
    if (M === "kalt" && K === "kalt") { r.title = "Überall zu kalt"; act("sonne", 1, "hebt die ganze Kurve an, an milden Tagen etwas stärker"); }
    else if (M === "warm" && K === "warm") { r.title = "Überall zu warm"; act("sonne", -1, "senkt die ganze Kurve, an milden Tagen etwas stärker"); }
    else if (M === "ok" && K === "kalt") { r.title = "Bei Frost zu kalt"; act("neigung", 1, "macht die Kurve steiler, wirkt vor allem bei Kälte"); }
    else if (M === "ok" && K === "warm") { r.title = "Bei Frost zu warm"; act("neigung", -1, "macht die Kurve flacher, wirkt vor allem bei Kälte"); }
    else if (M === "kalt" && K === "ok") { r.title = "An milden Tagen zu kalt"; r.stages = true; act("niveau", 1, "hebt die Kurve überall um 3 K"); act("neigung", -1, "nimmt bei Frost wieder etwas zurück"); }
    else if (M === "warm" && K === "ok") { r.title = "An milden Tagen zu warm"; r.stages = true; act("niveau", -1, "senkt die Kurve überall um 3 K"); act("neigung", 1, "gibt bei Frost wieder etwas dazu"); }
    else if (M === "kalt" && K === "warm") { r.title = "Kurve zu steil"; act("niveau", 1, "mehr Wärme an milden Tagen"); act("neigung", -1, "weniger Wärme bei Frost"); }
    else if (M === "warm" && K === "kalt") { r.title = "Kurve zu flach"; act("neigung", 1, "mehr Wärme bei Frost"); act("niveau", -1, "weniger Wärme an milden Tagen"); }
    else if (M === "ok" && K === "ok") { r.title = "Passt. Sparversuch?"; r.kind = "save"; act("niveau", -1, "die Kurve probeweise 3 K tiefer. Wird es zu kühl, einfach zurück"); }
    else if (M === "kalt") { r.title = "An milden Tagen zu kalt"; act("sonne", 1, "der Tag-Knopf ist für die Wohlfühltemperatur gedacht. Die Neigung prüfst du, wenn es friert"); }
    else if (M === "warm") { r.title = "An milden Tagen zu warm"; act("sonne", -1, "der Tag-Knopf ist für die Wohlfühltemperatur gedacht. Die Neigung prüfst du, wenn es friert"); }
    else if (K === "kalt") { r.title = "Bei Frost zu kalt"; act("neigung", 1, "macht die Kurve steiler, wirkt vor allem bei Kälte"); }
    else if (K === "warm") { r.title = "Bei Frost zu warm"; act("neigung", -1, "macht die Kurve flacher, wirkt vor allem bei Kälte"); }
    else if (M === "ok") r.info = "An milden Tagen passt es. Die Neigung prüfst du, sobald es friert.";
    else if (K === "ok") r.info = "Bei Frost passt es. Prüfe an einem milden Tag, ob es dann auch passt.";
    if (N === "kalt") { act("mond", 1, "weniger Absenkung, die Räume kühlen nachts weniger aus"); if (!r.title) r.title = "Morgens zu kalt"; }
    else if (N === "warm") { act("mond", -1, "stärkere Absenkung in der Nacht"); if (!r.title) r.title = "Nachts zu warm"; }

    var pos = { sonne: s.pos.sonne, mond: s.pos.mond, neigung: s.pos.neigung, niveau: s.pos.niveau };
    var FALLBACK = { neigung: "niveau", sonne: "niveau", niveau: "sonne" };
    var used = {};
    r.acts.forEach(function (a) { used[a.k] = true; });
    r.acts = r.acts.filter(function (a) {
      var np = clamp(pos[a.k] + a.delta, 0, 15);
      if (np === pos[a.k]) {
        var alt = FALLBACK[a.k];
        var ap = alt ? clamp(pos[alt] + a.delta, 0, 15) : null;
        if (alt && !used[alt] && ap !== pos[alt]) {
          r.notes.push(KLABEL[a.k] + " steht schon am Anschlag. Darum stattdessen " + KLABEL[alt] + ", das hebt bzw. senkt die Kurve ebenfalls.");
          used[alt] = true;
          a.k = alt; a.why = a.delta > 0 ? "hebt die Kurve an" : "senkt die Kurve";
          a.from = pos[alt]; a.to = ap; pos[alt] = ap; return true;
        }
        r.notes.push(KLABEL[a.k] + " steht schon am Anschlag. Weiter geht es hier nicht, frag im Zweifel den Fachbetrieb.");
        return false;
      }
      a.from = pos[a.k]; a.to = np; pos[a.k] = np; return true;
    });
    r.pos = pos;
    // Kurve hängt schon an der Obergrenze bzw. liefert schon viel: mehr Kurve hilft nicht
    var cur = derivedPos(s.pos);
    function dropWarming(note) {
      var had = r.acts.length;
      r.acts = r.acts.filter(function (a) {
        if (a.k === "mond" || a.to < a.from) return true;
        pos[a.k] = a.from; return false;
      });
      if (r.acts.length !== had) r.notes.push(note);
    }
    var vCold = effCurve(s, cur.day, -10), vMild = effCurve(s, cur.day, 10);
    if (K === "kalt" && vCold != null && vCold >= s.tmax - 0.5)
      dropWarming("Bei Frost liefert der Kessel schon die Obergrenze von " + num(s.tmax) + " °C. Über die Kurve geht nicht mehr. " +
        "Die Ursache liegt eher bei Luft in den Heizkörpern, klemmenden Thermostatventilen, fehlendem Abgleich oder zu kleinen Heizkörpern.");
    if (M === "kalt" && vMild != null && vMild >= 55)
      dropWarming("An milden Tagen liefert der Kessel schon " + deg(vMild) + ". Wenn es trotzdem zu kalt ist, liegt es kaum an der Kurve. " +
        "Prüfe Entlüftung, Thermostatventile und den hydraulischen Abgleich.");
    if (r.acts.length) {
      var before = derivedPos(s.pos), after = derivedPos(pos);
      r.before = before; r.after = after;
      var na = normAt();
      if (curve(na, after.day) > s.tmax && curve(na, before.day) <= s.tmax)
        r.notes.push("Mit dem Vorschlag stößt die Kurve bei " + atText(crossAt(after.day, s.tmax)) + " an die " + num(s.tmax) + "-°C-Grenze.");
    }
    return r;
  }

  // Rückführungsplan: stark verstellte Kurven in Etappen auf einen Startwert bringen
  var START = { neigung: 8, niveau: 4, sonne: 7 };   // Neigung 1,2 · Niveau 0 · Tag N = Werkseinstellung
  function copyPos(p) { return { sonne: p.sonne, mond: p.mond, neigung: p.neigung, niveau: p.niveau }; }
  function plan(s) {
    var d = derivedPos(s.pos), na = normAt();
    var vm = curve(10, d.day), vn = curve(na, d.day);
    var high = vm > 45 || vn > s.tmax + 5 || d.niveau >= 9 || d.neigung >= 1.8;
    var low = !high && (vn < 45 || d.niveau <= -9 || d.neigung <= 0.6);
    if (!high && !low) return null;
    var pos = copyPos(s.pos), stages = [];
    function walk(k, maxStep) {
      var guard = 0;
      while (Math.abs(START[k] - pos[k]) > 0.01 && guard++ < 20) {
        var diff = START[k] - pos[k], step = (diff > 0 ? 1 : -1) * Math.min(maxStep, Math.abs(diff));
        var from = copyPos(pos);
        pos[k] = pos[k] + step;
        stages.push({ k: k, from: from[k], to: pos[k], fromPos: from, toPos: copyPos(pos) });
      }
    }
    walk("niveau", 4);
    walk("neigung", 2);
    if (high && d.sonne >= 3) walk("sonne", 2);
    if (!stages.length) return null;
    stages.forEach(function (st) { st.before = derivedPos(st.fromPos); st.after = derivedPos(st.toPos); });
    return { dir: high ? "down" : "up", stages: stages, cur: d, vm: vm, vn: vn, na: na,
      capAt: crossAt(d.day, s.tmax), finalPos: pos };
  }
  function strokes(from, to) {
    var n = Math.abs(to - from);
    return (n === 1 ? "1 Strich " : num(n) + " Striche ") + (to > from ? "im Uhrzeigersinn" : "gegen den Uhrzeigersinn");
  }

  // ---------------------------------------------------------------- DOM-Helfer
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function sv(tag, attrs, parent, text) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  // ---------------------------------------------------------------- Knopf-Widget
  function buildKnob(root, key, s, onChange) {
    var K = KNOBS[key];
    var box = el("div", { class: "hk-knob hk-knob--" + key }, root);
    var head = el("div", { class: "hk-knob__head" }, box);
    el("span", { class: "hk-knob__sym", "aria-hidden": "true" }, head, K.sym);
    el("span", { class: "hk-knob__title" }, head, K.title);
    el("div", { class: "hk-knob__where" }, box, K.where);

    var svg = sv("svg", {
      viewBox: "0 0 140 128", class: "hk-knob__svg", role: "slider", tabindex: "0",
      "aria-label": K.aria, "aria-valuemin": "0", "aria-valuemax": "15"
    }, box);
    var cx = 70, cy = 66;
    // Skala
    for (var i = 0; i < 16; i++) {
      var a = angleOf(i) * Math.PI / 180, labeled = K.labels[i] != null;
      var r1 = 34, r2 = labeled ? 44 : 41;
      sv("line", {
        x1: cx + r1 * Math.sin(a), y1: cy - r1 * Math.cos(a),
        x2: cx + r2 * Math.sin(a), y2: cy - r2 * Math.cos(a),
        class: "hk-knob__tick" + (labeled ? " is-major" : "")
      }, svg);
      if (labeled) {
        var rl = 56;
        sv("text", {
          x: cx + rl * Math.sin(a), y: cy - rl * Math.cos(a) + 4,
          "text-anchor": "middle", class: "hk-knob__label"
        }, svg, K.labels[i]);
      }
    }
    // Knopfkörper mit Schlitz und Zeigermarke wie am Gerät
    sv("circle", { cx: cx, cy: cy, r: 30, class: "hk-knob__body" }, svg);
    var rot = sv("g", {}, svg);
    sv("rect", { x: cx - 7, y: cy - 25, width: 14, height: 50, rx: 3, class: "hk-knob__slot" }, rot);
    sv("rect", { x: cx - 3.5, y: cy - 21, width: 7, height: 10, rx: 1.5, class: "hk-knob__mark" }, rot);

    var ctrl = el("div", { class: "hk-knob__ctrl" }, box);
    var minus = el("button", { type: "button", class: "hk-btn hk-btn--icon", "aria-label": K.aria + " einen Strich weniger" }, ctrl, "−");
    var out = el("output", { class: "hk-knob__value" }, ctrl);
    var plus = el("button", { type: "button", class: "hk-btn hk-btn--icon", "aria-label": K.aria + " einen Strich mehr" }, ctrl, "+");
    var sub = el("div", { class: "hk-knob__sub" }, box);

    function text(p) {
      var v = knobValue(key, p);
      if (key === "sonne") return [v === 0 ? "N" : "N " + signed(v), "≈ " + num(20 + v) + " °C Raum"];
      if (key === "mond") return [v === 0 ? "N" : "N " + signed(v), "≈ " + num(14 + v) + " °C Raum"];
      if (key === "neigung") return [num(v, 2), "Strich " + num(p) + " von 15"];
      return [v === 0 ? "0" : signed(v), "Kurve " + signed(v) + " K"];
    }
    function render() {
      var p = s.pos[key];
      rot.setAttribute("transform", "rotate(" + angleOf(p) + " " + cx + " " + cy + ")");
      var t = text(p);
      out.textContent = t[0];
      sub.textContent = t[1];
      svg.setAttribute("aria-valuenow", String(p));
      svg.setAttribute("aria-valuetext", t[0] + ", " + t[1]);
      minus.disabled = p <= 0;
      plus.disabled = p >= 15;
    }
    function set(p) {
      p = clamp(Math.round(p * 2) / 2, 0, 15);
      if (p !== s.pos[key]) { s.pos[key] = p; render(); onChange(); }
    }
    function fromPointer(ev) {
      var r = svg.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width * 140 - cx;
      var y = (ev.clientY - r.top) / r.height * 128 - cy;
      var a = Math.atan2(x, -y) * 180 / Math.PI;
      if (a > 150) a = 150; else if (a < -150) a = -150;
      set((a + 150) / 20);
    }
    var dragging = false;
    svg.addEventListener("pointerdown", function (ev) {
      dragging = true; svg.setPointerCapture(ev.pointerId); fromPointer(ev); ev.preventDefault();
    });
    svg.addEventListener("pointermove", function (ev) { if (dragging) fromPointer(ev); });
    svg.addEventListener("pointerup", function () { dragging = false; });
    svg.addEventListener("pointercancel", function () { dragging = false; });
    svg.addEventListener("keydown", function (ev) {
      var p = s.pos[key], k = ev.key;
      if (k === "ArrowRight" || k === "ArrowUp") set(p + 0.5);
      else if (k === "ArrowLeft" || k === "ArrowDown") set(p - 0.5);
      else if (k === "PageUp") set(p + 1);
      else if (k === "PageDown") set(p - 1);
      else if (k === "Home") set(0);
      else if (k === "End") set(15);
      else return;
      ev.preventDefault();
    });
    minus.addEventListener("click", function () { set(Math.ceil(s.pos[key]) - 1); });
    plus.addEventListener("click", function () { set(Math.floor(s.pos[key]) + 1); });
    render();
    return { render: render };
  }

  // ---------------------------------------------------------------- Diagramm
  var W = 760, H = 440, ML = 54, MR = 64, MT = 18, MB = 50, NARROW = false;
  var PW = W - ML - MR, PH = H - MT - MB;
  // Diagramm in echter Pixelbreite zeichnen, damit Schrift auf dem Handy lesbar bleibt
  function layout(width) {
    W = Math.round(clamp(width || 760, 300, 980));
    NARROW = W < 560;
    H = Math.round(NARROW ? W * 0.82 : Math.max(380, W * 0.56));
    ML = NARROW ? 40 : 54; MR = NARROW ? 50 : 64; MT = 16; MB = NARROW ? 46 : 50;
    PW = W - ML - MR; PH = H - MT - MB;
  }
  var XMAX = 25, XMIN = -20, YMIN = 10, YMAX = 100;
  function X(at) { return ML + (XMAX - at) / (XMAX - XMIN) * PW; }
  function Y(t) { return MT + (YMAX - t) / (YMAX - YMIN) * PH; }
  function atFromX(px) { return XMAX - (px - ML) / PW * (XMAX - XMIN); }

  function pathOf(fn) {
    var dstr = "", pen = false;
    for (var at = XMAX; at >= XMIN - 1e-9; at -= 0.25) {
      var t = fn(at);
      if (t == null) { pen = false; continue; }
      dstr += (pen ? "L" : "M") + X(at).toFixed(1) + " " + Y(t).toFixed(1);
      pen = true;
    }
    return dstr;
  }

  // ---------------------------------------------------------------- App
  function mount(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = "1";
    root.textContent = "";
    var s = load();
    var weather = null;

    var app = el("div", { class: "hk" }, root);

    // Karte 1: Knöpfe (volle Breite)
    var cKnobs = el("section", { class: "hk-card hk-card--knobs" }, app);
    el("h3", { class: "hk-card__title" }, cKnobs, "1 · So ist dein Kessel eingestellt");
    el("p", { class: "hk-hint" }, cKnobs,
      "Dreh die Knöpfe so, dass die dunkle Zeigermarke wie an deinem Gerät steht. Ziehen, tippen oder Pfeiltasten.");
    var kGrid = el("div", { class: "hk-knobs" }, cKnobs);
    var knobs = ORDER.map(function (k) { return buildKnob(kGrid, k, s, function () { s.applied = false; update(); }); });
    var kBtns = el("div", { class: "hk-row" }, cKnobs);
    var bReset = el("button", { type: "button", class: "hk-btn" }, kBtns, "Werkseinstellung");

    // Karte 2: Außentemperatur und Betriebsart | Ergebnis
    var top = el("div", { class: "hk-top" }, app);
    var cAt = el("section", { class: "hk-card hk-card--at" }, top);
    el("h3", { class: "hk-card__title" }, cAt, "2 · Außentemperatur und Betriebsart");
    var atWrap = el("div", { class: "hk-at" }, cAt);
    var atHead = el("div", { class: "hk-at__head" }, atWrap);
    el("label", { for: "hk-at-range", class: "hk-at__label" }, atHead, "Außentemperatur");
    var atOut = el("output", { class: "hk-at__value", for: "hk-at-range" }, atHead);
    var atRange = el("input", {
      id: "hk-at-range", type: "range", min: String(XMIN), max: String(XMAX), step: "0.5",
      dir: "rtl", class: "hk-range", "aria-describedby": "hk-at-scale"
    }, atWrap);
    var atScale = el("div", { class: "hk-at__scale", id: "hk-at-scale" }, atWrap);
    el("span", {}, atScale, "+25 °C warm");
    el("span", {}, atScale, "kalt −20 °C");
    var wRow = el("div", { class: "hk-row" }, atWrap);
    var bWeather = el("button", { type: "button", class: "hk-btn" }, wRow, "📍 Aktuelles Wetter laden");
    var wInfo = el("span", { class: "hk-weather", "aria-live": "polite" }, wRow);

    var modes = el("div", { class: "hk-seg", role: "radiogroup", "aria-label": "Betriebsart" }, cAt);
    el("p", { class: "hk-hint" }, cAt,
      "Welche Betriebsart gerade läuft, bestimmen Programmwahlschalter und Schaltuhr: in den Heizzeiten die obere, sonst die untere Reihe.");
    var cRes = el("section", { class: "hk-card hk-card--result" }, top);
    el("h3", { class: "hk-card__title" }, cRes, "Ergebnis");
    var MODES = [
      ["tag", "☀︎", "Tag", "Normalbetrieb"],
      ["nacht", "☽", "Nacht", "reduziert"],
      ["frost", "❄︎", "Aus", "Frostschutz"]
    ];
    var modeBtns = {};
    MODES.forEach(function (m) {
      var b = el("button", { type: "button", role: "radio", class: "hk-seg__btn" }, modes);
      el("span", { class: "hk-seg__sym", "aria-hidden": "true" }, b, m[1]);
      el("span", { class: "hk-seg__main" }, b, m[2]);
      el("span", { class: "hk-seg__sub" }, b, m[3]);
      b.addEventListener("click", function () { s.mode = m[0]; update(); });
      modeBtns[m[0]] = b;
    });

    var hero = el("div", { class: "hk-hero", "aria-live": "polite" }, cRes);
    var heroLabel = el("div", { class: "hk-hero__label" }, hero);
    var heroValue = el("div", { class: "hk-hero__value" }, hero);
    var heroSub = el("div", { class: "hk-hero__sub" }, hero);
    var chips = el("div", { class: "hk-chips" }, hero);

    var istWrap = el("div", { class: "hk-ist" }, cRes);
    el("label", { for: "hk-ist", class: "hk-ist__label" }, istWrap, "Optional: abgelesene Kesseltemperatur");
    var istRow = el("div", { class: "hk-ist__row" }, istWrap);
    var istIn = el("input", { id: "hk-ist", type: "number", min: "10", max: "100", step: "1", inputmode: "numeric", placeholder: "z. B. 52", class: "hk-input" }, istRow);
    el("span", { class: "hk-unit" }, istRow, "°C");
    var istOut = el("span", { class: "hk-ist__out" }, istRow);

    // Karte 3: Empfehlung
    var cRec = el("section", { class: "hk-card hk-card--rec" }, app);
    el("h3", { class: "hk-card__title" }, cRec, "3 · Empfehlung");
    var recGrid = el("div", { class: "hk-rec" }, cRec);
    var recColA = el("div", { class: "hk-rec__col" }, recGrid);
    el("h4", { class: "hk-rec__h" }, recColA, "Check deiner Einstellung");
    var recChecks = el("ul", { class: "hk-rec__list" }, recColA);
    el("p", { class: "hk-hint" }, recColA, "Verglichen mit üblichen Werten für eine Heizkörper-Anlage. Entscheidend ist, wie warm es bei dir wirklich wird.");
    var recColB = el("div", { class: "hk-rec__col" }, recGrid);
    el("h4", { class: "hk-rec__h" }, recColB, "Wie ist es bei dir?");
    el("p", { class: "hk-hint" }, recColB, "Bewerte den Referenzraum bei offenem Thermostat, nachdem die Heizung einige Stunden lief.");
    var QUESTIONS = [
      ["mild", "An milden Tagen", "+5 bis +15 °C außen", [["kalt", "zu kalt"], ["ok", "passt"], ["warm", "zu warm"]]],
      ["kalt", "An kalten Tagen", "unter 0 °C außen", [["kalt", "zu kalt"], ["ok", "passt"], ["warm", "zu warm"], ["?", "noch nicht erlebt"]]],
      ["nacht", "Morgens nach der Nacht", "nach der Absenkung", [["kalt", "zu kalt"], ["ok", "passt"], ["warm", "nachts zu warm"]]]
    ];
    var qBtns = {};
    QUESTIONS.forEach(function (q) {
      var row = el("div", { class: "hk-q" }, recColB);
      var lab = el("div", { class: "hk-q__label" }, row);
      el("strong", {}, lab, q[1]);
      el("span", {}, lab, q[2]);
      var seg = el("div", { class: "hk-q__seg", role: "radiogroup", "aria-label": q[1] }, row);
      qBtns[q[0]] = {};
      q[3].forEach(function (o) {
        var b = el("button", { type: "button", role: "radio", class: "hk-q__btn hk-q__btn--" + (o[0] === "?" ? "x" : o[0]) }, seg, o[1]);
        b.addEventListener("click", function () {
          s.feel[q[0]] = s.feel[q[0]] === o[0] ? null : o[0];
          s.applied = false;
          update();
        });
        qBtns[q[0]][o[0]] = b;
      });
    });
    var recOut = el("div", { class: "hk-rec__out", "aria-live": "polite" }, cRec);
    var sug = null;

    // Karte 4: Diagramm
    var cChart = el("section", { class: "hk-card hk-card--chart" }, app);
    el("h3", { class: "hk-card__title" }, cChart, "4 · Deine Heizkurve");
    var legend = el("div", { class: "hk-legend" }, cChart);
    function legendItem(cls, label, checkKey) {
      var item = el(checkKey ? "label" : "span", { class: "hk-legend__item" }, legend);
      var cb = null;
      if (checkKey) {
        cb = el("input", { type: "checkbox" }, item);
        cb.addEventListener("change", function () { s[checkKey] = cb.checked; update(); });
      }
      el("span", { class: "hk-key " + cls, "aria-hidden": "true" }, item);
      var t = el("span", {}, item, label);
      return { item: item, cb: cb, text: t };
    }
    var lgDay = legendItem("hk-key--day", "Tag");
    var lgNight = legendItem("hk-key--night", "Nacht", "showNight");
    var lgWerk = legendItem("hk-key--werk", "Werkseinstellung", "showWerk");
    var lgCmp = legendItem("hk-key--cmp", "Vergleich");
    var lgSug = legendItem("hk-key--sug", "Vorschlag");

    var chartBox = el("div", { class: "hk-chart" }, cChart);
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, class: "hk-svg", role: "img" }, chartBox);
    var tip = el("div", { class: "hk-tip", hidden: "" }, chartBox);
    var cRow = el("div", { class: "hk-row" }, cChart);
    var bCmp = el("button", { type: "button", class: "hk-btn" }, cRow, "Aktuelle Kurve als Vergleich merken");
    var bCmpDel = el("button", { type: "button", class: "hk-btn hk-btn--ghost" }, cRow, "Vergleich löschen");
    el("p", { class: "hk-hint" }, cChart,
      "Ins Diagramm tippen oder ziehen setzt die Außentemperatur. Der Kessel fährt die kräftige Linie; " +
      "die dünne gestrichelte zeigt die Kurve ohne Ober- und Untergrenze.");

    // Karte 5: Tabelle
    var cTab = el("section", { class: "hk-card hk-card--table" }, app);
    el("h3", { class: "hk-card__title" }, cTab, "5 · Vorlauftemperaturen auf einen Blick");
    var tWrap = el("div", { class: "hk-tablewrap" }, cTab);
    var table = el("table", { class: "hk-table" }, tWrap);
    var tNote = el("p", { class: "hk-hint" }, cTab);

    // Erweitert
    var adv = el("details", { class: "hk-card hk-adv" }, app);
    el("summary", {}, adv, "Erweitert: Grenzen des Kessels");
    var advGrid = el("div", { class: "hk-adv__grid" }, adv);
    function numField(label, key, min, max, help) {
      var w = el("div", { class: "hk-field" }, advGrid);
      var id = "hk-" + key;
      el("label", { for: id }, w, label);
      var r = el("div", { class: "hk-ist__row" }, w);
      var inp = el("input", { id: id, type: "number", min: String(min), max: String(max), step: "1", class: "hk-input" }, r);
      el("span", { class: "hk-unit" }, r, "°C");
      el("div", { class: "hk-hint" }, w, help);
      inp.addEventListener("change", function () {
        var v = parseFloat(inp.value);
        if (!isNaN(v)) s[key] = clamp(v, min, max);
        update();
      });
      return inp;
    }
    var inMax = numField("Maximale Kesseltemperatur", "tmax", 50, 90,
      "Werk 75 °C (elektronische Begrenzung und Temperaturregler hinter der Klappe). Nicht am Kessel verstellen.");
    var inMin = numField("Untere Kesseltemperatur", "tmin", 0, 50,
      "Laut Anleitung ca. 35 °C, abhängig vom Kesseltyp. Nicht einstellbar, der Kessel hält sie zum Schutz.");

    // ------------------------------------------------------------ Events
    atRange.addEventListener("input", function () { s.at = parseFloat(atRange.value); update(); });
    bReset.addEventListener("click", function () {
      s.pos = { sonne: 7, mond: 9, neigung: 8, niveau: 4 };
      s.applied = false;
      knobs.forEach(function (k) { k.render(); });
      update();
    });
    bCmp.addEventListener("click", function () {
      var d = derived(s);
      s.autoCmp = false;
      s.compare = { rt: d.day.rt, neigung: d.neigung, niveau: d.niveau,
        label: "Neigung " + num(d.neigung, 2) + " · Niveau " + signed(d.niveau) + " · ☀︎ " + (d.sonne === 0 ? "N" : "N " + signed(d.sonne)) };
      update();
    });
    bCmpDel.addEventListener("click", function () { s.compare = null; s.autoCmp = false; update(); });
    istIn.addEventListener("input", function () {
      var v = parseFloat(istIn.value);
      s.ist = isNaN(v) ? null : v;
      update();
    });
    bWeather.addEventListener("click", function () {
      if (!navigator.geolocation) { wInfo.textContent = "Standortabfrage wird vom Browser nicht unterstützt."; return; }
      wInfo.textContent = "Standort wird abgefragt …";
      bWeather.disabled = true;
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude.toFixed(2), lon = pos.coords.longitude.toFixed(2);
        wInfo.textContent = "Wetter wird geladen …";
        var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
          "&current=temperature_2m&daily=temperature_2m_min,temperature_2m_max&timezone=auto&forecast_days=1";
        fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
          var now = j.current.temperature_2m, mn = j.daily.temperature_2m_min[0], mx = j.daily.temperature_2m_max[0];
          weather = { now: now, min: mn, max: mx };
          s.at = clamp(Math.round(now * 2) / 2, XMIN, XMAX);
          wInfo.textContent = "Jetzt " + num(now) + " °C, heute " + num(mn) + " bis " + num(mx) + " °C (Open-Meteo)";
          bWeather.disabled = false;
          update();
        }).catch(function () {
          wInfo.textContent = "Wetter konnte nicht geladen werden. Bitte von Hand einstellen.";
          bWeather.disabled = false;
        });
      }, function () {
        wInfo.textContent = "Standort nicht freigegeben. Bitte die Temperatur von Hand einstellen.";
        bWeather.disabled = false;
      }, { timeout: 15000, maximumAge: 600000 });
    });

    // Diagramm-Interaktion
    var hoverAt = null, chartDrag = false;
    function svgPoint(ev) {
      var r = svg.getBoundingClientRect();
      return { x: (ev.clientX - r.left) / r.width * W, y: (ev.clientY - r.top) / r.height * H, r: r };
    }
    function atAt(ev) { return clamp(Math.round(atFromX(svgPoint(ev).x) * 2) / 2, XMIN, XMAX); }
    svg.addEventListener("pointerdown", function (ev) {
      var p = svgPoint(ev);
      if (p.x < ML || p.x > ML + PW || p.y < MT || p.y > MT + PH) return;
      chartDrag = true; svg.setPointerCapture(ev.pointerId);
      s.at = atAt(ev); update();
    });
    svg.addEventListener("pointermove", function (ev) {
      var p = svgPoint(ev);
      if (chartDrag) { s.at = atAt(ev); update(); }
      if (ev.pointerType === "mouse" && p.x >= ML && p.x <= ML + PW && p.y >= MT && p.y <= MT + PH) {
        hoverAt = atAt(ev); drawHover(p);
      } else if (!chartDrag) { hoverAt = null; drawHover(null); }
    });
    svg.addEventListener("pointerup", function () { chartDrag = false; });
    svg.addEventListener("pointerleave", function () { hoverAt = null; drawHover(null); });

    // ------------------------------------------------------------ Zeichnen
    var hoverLayer = null;
    function drawChart(d) {
      layout(chartBox.clientWidth);
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var defs = sv("defs", {}, svg);
      var cp = sv("clipPath", { id: "hk-clip" }, defs);
      sv("rect", { x: ML, y: MT, width: PW, height: PH }, cp);

      var active = s.mode === "tag" ? d.day : d.night;
      var g0 = sv("g", { "clip-path": "url(#hk-clip)" }, svg);

      // Zonen
      sv("rect", { x: ML, y: MT, width: PW, height: Math.max(0, Y(s.tmax) - MT), class: "hk-zone" }, g0);
      sv("rect", { x: ML, y: Y(s.tmin), width: PW, height: Math.max(0, MT + PH - Y(s.tmin)), class: "hk-zone" }, g0);
      var offAt = s.mode === "frost" ? 3 : active.rt + 1;
      if (offAt < XMAX) {
        sv("rect", { x: ML, y: MT, width: X(offAt) - ML, height: PH, class: "hk-zone hk-zone--off" }, g0);
        if (X(offAt) - ML > 58) {
          sv("text", { x: ML + (X(offAt) - ML) / 2, y: MT + 18, "text-anchor": "middle", class: "hk-zone__label" }, g0, "Heizung aus");
          sv("text", { x: ML + (X(offAt) - ML) / 2, y: MT + 32, "text-anchor": "middle", class: "hk-zone__label hk-zone__label--sub" }, g0,
            s.mode === "frost" ? "über +3 °C" : "Sommerabschaltung");
        }
      }
      if (weather) {
        var x1 = X(clamp(weather.max, XMIN, XMAX)), x2 = X(clamp(weather.min, XMIN, XMAX));
        sv("rect", { x: x1, y: MT, width: Math.max(2, x2 - x1), height: PH, class: "hk-zone hk-zone--weather" }, g0);
        sv("text", { x: (x1 + x2) / 2, y: MT + PH - 8, "text-anchor": "middle", class: "hk-zone__label" }, g0, "heute");
      }

      // Raster und Achsen
      var grid = sv("g", { class: "hk-grid" }, svg);
      for (var t = 10; t <= YMAX; t += 10) {
        sv("line", { x1: ML, x2: ML + PW, y1: Y(t), y2: Y(t) }, grid);
        sv("text", { x: ML - 8, y: Y(t) + 4, "text-anchor": "end", class: "hk-axis" }, svg, String(t));
      }
      for (var a = 25; a >= -20; a -= 5) {
        sv("line", { x1: X(a), x2: X(a), y1: MT, y2: MT + PH }, grid);
        if (!NARROW || a % 10 === 0)
          sv("text", { x: X(a), y: MT + PH + 18, "text-anchor": "middle", class: "hk-axis" }, svg, a > 0 ? "+" + a : num(a));
      }
      sv("line", { x1: ML, x2: ML + PW, y1: MT + PH, y2: MT + PH, class: "hk-baseline" }, svg);
      sv("text", { x: ML + PW / 2, y: H - 8, "text-anchor": "middle", class: "hk-axis hk-axis--title" }, svg, "Außentemperatur in °C");
      sv("text", { x: 13, y: MT + PH / 2, "text-anchor": "middle", class: "hk-axis hk-axis--title",
        transform: "rotate(-90 13 " + (MT + PH / 2) + ")" }, svg, NARROW ? "Vorlauf °C" : "Vorlauf = Kessel in °C");

      // Grenzlinien
      var lim = sv("g", { "clip-path": "url(#hk-clip)" }, svg);
      sv("line", { x1: ML, x2: ML + PW, y1: Y(s.tmax), y2: Y(s.tmax), class: "hk-limit" }, lim);
      sv("line", { x1: ML, x2: ML + PW, y1: Y(s.tmin), y2: Y(s.tmin), class: "hk-limit" }, lim);
      sv("text", { x: ML + PW - 6, y: Y(s.tmax) - 6, "text-anchor": "end", class: "hk-limit__label" }, lim, "max. " + num(s.tmax) + " °C");
      if (s.tmin > YMIN + 3)
        sv("text", { x: ML + PW - 6, y: Y(s.tmin) + 15, "text-anchor": "end", class: "hk-limit__label" }, lim, (NARROW ? "min. " : "Untergrenze ") + num(s.tmin) + " °C");

      // Kurven
      var gc = sv("g", { "clip-path": "url(#hk-clip)", fill: "none" }, svg);
      if (s.showWerk) sv("path", { d: pathOf(function (at) { return effCurve(s, WERK, at); }), class: "hk-line hk-line--werk" }, gc);
      if (s.compare) sv("path", { d: pathOf(function (at) { return effCurve(s, s.compare, at); }), class: "hk-line hk-line--cmp" }, gc);
      function series(c, cls, cutoff) {
        sv("path", { d: pathOf(function (at) { return at > cutoff ? null : curve(at, c); }), class: "hk-line hk-line--raw " + cls }, gc);
        sv("path", { d: pathOf(function (at) { return at > cutoff ? null : effCurve(s, c, at); }), class: "hk-line " + cls }, gc);
      }
      if (s.showNight || s.mode !== "tag") series(d.night, "hk-line--night", s.mode === "frost" ? 3 : d.night.rt + 1);
      series(d.day, "hk-line--day", d.day.rt + 1);
      var ySug = null;
      if (sug) {
        sv("path", { d: pathOf(function (at) { return effCurve(s, sug.after.day, at); }), class: "hk-line hk-line--sug" }, gc);
        if (sug.after.night.rt !== d.night.rt && (s.showNight || s.mode !== "tag"))
          sv("path", { d: pathOf(function (at) { return effCurve(s, sug.after.night, at); }), class: "hk-line hk-line--sug hk-line--sug-night" }, gc);
        ySug = Y(effCurve(s, sug.after.day, XMIN));
      }

      // Endbeschriftungen rechts
      var yD = Y(effCurve(s, d.day, XMIN)), yN = Y(effCurve(s, d.night, XMIN));
      sv("text", { x: ML + PW + 8, y: yD + 4, class: "hk-endlabel" }, svg, "Tag");
      if ((s.showNight || s.mode !== "tag") && Math.abs(yD - yN) > 14)
        sv("text", { x: ML + PW + 8, y: yN + 4, class: "hk-endlabel" }, svg, "Nacht");
      if (ySug != null && Math.abs(ySug - yD) > 14 && Math.abs(ySug - yN) > 14)
        sv("text", { x: ML + PW + 8, y: ySug + 4, class: "hk-endlabel" }, svg, NARROW ? "Neu" : "Vorschlag");

      // Ausgewählter Punkt
      var ev = evaluate(s, d, s.at, s.mode);
      var px = X(s.at);
      var gp = sv("g", {}, svg);
      sv("line", { x1: px, x2: px, y1: MT, y2: MT + PH, class: "hk-cross" }, gp);
      if (ev.temp != null) {
        var py = Y(ev.temp);
        sv("line", { x1: ML, x2: px, y1: py, y2: py, class: "hk-cross" }, gp);
        sv("circle", { cx: px, cy: py, r: 8, class: "hk-dot-ring" }, gp);
        sv("circle", { cx: px, cy: py, r: 6, class: "hk-dot " + (s.mode === "tag" ? "hk-dot--day" : "hk-dot--night") }, gp);
        var lbl = deg(ev.temp), right = px < ML + PW - 70, above = py > MT + 30;
        var lx = right ? px + 12 : px - 12, ly = above ? py - 12 : py + 24;
        var tb = sv("text", { x: lx, y: ly, "text-anchor": right ? "start" : "end", class: "hk-pointlabel" }, gp, lbl);
        tb.setAttribute("paint-order", "stroke");
      }
      if (s.ist != null && s.ist >= YMIN && s.ist <= YMAX) {
        sv("circle", { cx: px, cy: Y(s.ist), r: 6, class: "hk-ist-dot" }, gp);
      }
      hoverLayer = sv("g", { class: "hk-hover" }, svg);

      svg.setAttribute("aria-label",
        "Heizkurve: bei " + num(s.at) + " °C außen " +
        (ev.temp != null ? "Vorlauf etwa " + deg(ev.temp) : "Heizung aus") +
        ". Werte stehen auch in der Tabelle darunter.");
    }

    function drawHover(p) {
      if (!hoverLayer) return;
      while (hoverLayer.firstChild) hoverLayer.removeChild(hoverLayer.firstChild);
      if (!p || hoverAt == null) { tip.hidden = true; return; }
      var d = derived(s), x = X(hoverAt);
      sv("line", { x1: x, x2: x, y1: MT, y2: MT + PH, class: "hk-hairline" }, hoverLayer);
      tip.textContent = "";
      el("div", { class: "hk-tip__head" }, tip, "bei " + (hoverAt > 0 ? "+" : "") + num(hoverAt) + " °C außen");
      function row(cls, label, c) {
        var v = effCurve(s, c, hoverAt);
        var r = el("div", { class: "hk-tip__row" }, tip);
        el("span", { class: "hk-key " + cls, "aria-hidden": "true" }, r);
        el("strong", {}, r, v == null ? "aus" : deg(v));
        el("span", {}, r, label);
      }
      row("hk-key--day", "Tag", d.day);
      if (s.showNight || s.mode !== "tag") row("hk-key--night", "Nacht", d.night);
      if (s.showWerk) row("hk-key--werk", "Werk", WERK);
      if (s.compare) row("hk-key--cmp", "Vergleich", s.compare);
      if (sug) row("hk-key--sug", "Vorschlag", sug.after.day);
      tip.hidden = false;
      var box = chartBox.getBoundingClientRect(), r = p.r;
      var left = (x / W) * r.width + (r.left - box.left);
      var tw = tip.offsetWidth;
      tip.style.left = (left + 14 + tw > box.width ? left - 14 - tw : left + 14) + "px";
      tip.style.top = Math.max(4, (p.y / H) * r.height + (r.top - box.top) - 40) + "px";
    }

    function drawTable(d) {
      table.textContent = "";
      var ats = [15, 10, 5, 0, -5, -10, -15, -20];
      var thead = el("thead", {}, table), tr = el("tr", {}, thead);
      el("th", { scope: "col" }, tr, "Außen");
      ats.forEach(function (a) { el("th", { scope: "col" }, tr, (a > 0 ? "+" : "") + num(a) + " °C"); });
      var tb = el("tbody", {}, table), marks = false;
      function line(label, c) {
        var r = el("tr", {}, tb);
        el("th", { scope: "row" }, r, label);
        ats.forEach(function (a) {
          var v = effCurve(s, c, a), raw = curve(a, c), txt;
          if (v == null) txt = "aus";
          else { txt = num(Math.round(v)); if (raw < s.tmin || raw > s.tmax) { txt += "*"; marks = true; } }
          el("td", {}, r, txt);
        });
      }
      line("☀︎ Tag", d.day);
      line("☽ Nacht", d.night);
      line("Werk (Tag)", WERK);
      if (s.compare) line("Vergleich", s.compare);
      if (sug) line("Vorschlag (Tag)", sug.after.day);
      tNote.textContent = "Werte in °C, gerundet. „aus“ = Sommerabschaltung (Heizkreispumpe aus)." +
        (marks ? " * = Kessel an Unter- oder Obergrenze, die Kurve allein läge niedriger bzw. höher." : "");
    }

    function renderRec(d) {
      // Check
      recChecks.textContent = "";
      checks(s, d).forEach(function (c) {
        var li = el("li", { class: "hk-rec__item is-" + c.kind }, recChecks);
        el("span", { class: "hk-rec__icon", "aria-hidden": "true" }, li, c.kind === "ok" ? "✓" : c.kind === "warn" ? "!" : "i");
        el("span", {}, li, c.text);
      });
      // Fragen
      Object.keys(qBtns).forEach(function (q) {
        Object.keys(qBtns[q]).forEach(function (o) { qBtns[q][o].setAttribute("aria-checked", String(s.feel[q] === o)); });
      });
      // Ergebnis
      recOut.textContent = "";
      var r = recommend(s), P = plan(s), f = s.feel;
      var cold = f.mild === "kalt" || f.kalt === "kalt";
      var showPlan = P && !s.applied && ((P.dir === "down" && !cold) || (P.dir === "up" && cold));
      sug = showPlan ? P.stages[0] : (!s.applied && r.acts.length && !(P && P.dir === "down" && cold)) ? r : null;
      if (s.applied) {
        recOut.className = "hk-rec__out is-done";
        el("strong", {}, recOut, "✓ Übernommen. Stell am Kessel ein:");
        var ul = el("ul", { class: "hk-rec__todo" }, recOut);
        (s.last || []).forEach(function (c) {
          var li = el("li", {}, ul);
          el("span", { class: "hk-rec__sym", "aria-hidden": "true" }, li, KSYM[c.k]);
          el("strong", {}, li, KLABEL[c.k] + " auf " + knobText(c.k, c.to));
          li.appendChild(document.createTextNode(" (" + strokes(c.from, c.to) + ", vorher " + knobText(c.k, c.from) + ")"));
        });
        el("p", {}, recOut, "Dann zwei bis drei Tage beobachten und hier wieder bewerten. Die alte Kurve siehst du als Vergleich im Diagramm.");
        var rowD = el("div", { class: "hk-row" }, recOut);
        if (s.undo) {
          var bu = el("button", { type: "button", class: "hk-btn" }, rowD, "Rückgängig");
          bu.addEventListener("click", undo);
        }
        if (P && P.dir === "down") {
          var nx = P.stages[0];
          el("p", { class: "hk-rec__note" }, recOut, "Nächste Etappe in zwei bis drei Tagen, wenn es warm genug bleibt: " +
            KLABEL[nx.k] + " " + knobText(nx.k, nx.from) + " → " + knobText(nx.k, nx.to) + " (" + strokes(nx.from, nx.to) + ").");
          var bn = el("button", { type: "button", class: "hk-btn" }, rowD, "Nächste Etappe anzeigen");
          bn.addEventListener("click", function () { s.applied = false; update(); });
        }
        return;
      }
      if (P && P.dir === "down" && cold) {
        recOut.className = "hk-rec__out is-warn";
        el("h4", { class: "hk-rec__title" }, recOut, "Zu kalt, obwohl die Kurve sehr hoch steht");
        el("p", {}, recOut, "Der Kessel liefert schon " + deg(effCurve(s, P.cur.day, 10)) + " bei +10 °C" +
          (P.capAt != null ? " und ab " + atText(P.capAt) + " außen die Obergrenze von " + num(s.tmax) + " °C" : "") +
          ". Wenn es trotzdem zu kalt ist, liegt es fast nie an der Kurve. Die Kurve deshalb nicht weiter anheben.");
        var olD = el("ol", { class: "hk-rec__acts" }, recOut);
        [["Heizkörper entlüften", "../entlueften/", "Luft im Heizkörper sieht aus wie eine zu niedrige Kurve."],
         ["Thermostatventile prüfen", "../entlueften/#wenn-es-klemmt", "Ein klemmender Stift hält den Heizkörper kalt."],
         ["Hydraulischen Abgleich machen", "../abgleich/", "Wenn einzelne Räume kalt bleiben und andere überheizen."]].forEach(function (x) {
          var li = el("li", {}, olD);
          el("a", { href: x[1] }, li, x[0]);
          el("div", { class: "hk-rec__why" }, li, x[2]);
        });
        el("p", { class: "hk-rec__note" }, recOut, "Erst wenn das erledigt ist und es warm genug wird, die Kurve in Etappen absenken. Der Plan dafür erscheint hier, sobald du nicht mehr „zu kalt“ angibst.");
        return;
      }
      if (showPlan) { renderPlan(P); return; }
      if (!r.answered) {
        recOut.className = "hk-rec__out is-empty";
        el("p", {}, recOut, "Beantworte eine oder mehrere Fragen. Dann bekommst du eine konkrete Empfehlung, welchen Knopf du um wie viel drehst.");
        return;
      }
      if (!r.acts.length) {
        recOut.className = "hk-rec__out is-empty";
        el("p", {}, recOut, r.info || (r.notes.length ? "An der Kurve solltest du hier nichts ändern." : "Für diese Antworten gibt es keine Änderung."));
        r.notes.forEach(function (n) { el("p", { class: "hk-rec__note" }, recOut, n); });
        return;
      }
      recOut.className = "hk-rec__out" + (r.kind === "save" ? " is-save" : "");
      el("h4", { class: "hk-rec__title" }, recOut, r.title);
      var ol = el("ol", { class: "hk-rec__acts" }, recOut);
      r.acts.forEach(function (a, i) {
        var li = el("li", {}, ol);
        var head = el("div", { class: "hk-rec__act" }, li);
        el("span", { class: "hk-rec__sym", "aria-hidden": "true" }, head, KSYM[a.k]);
        el("strong", {}, head, KLABEL[a.k] + ": ");
        el("span", { class: "hk-rec__from" }, head, knobText(a.k, a.from));
        el("span", { "aria-hidden": "true" }, head, " → ");
        el("strong", { class: "hk-rec__to" }, head, knobText(a.k, a.to));
        el("div", { class: "hk-rec__why" }, li,
          (Math.abs(a.to - a.from) === 1 ? "Ein Strich " : num(Math.abs(a.to - a.from)) + " Striche ") +
          (a.to > a.from ? "im Uhrzeigersinn (Richtung +)" : "gegen den Uhrzeigersinn (Richtung −)") + ". Das " + a.why + "." +
          (r.stages && i === 1 ? " Diesen Schritt erst nach zwei, drei Tagen machen." : ""));
      });
      if (r.stages) el("p", { class: "hk-rec__note" }, recOut, "Die Original-Anleitung empfiehlt hier zwei Etappen: erst das Niveau, nach ein paar Tagen die Neigung.");
      // Wirkung
      var eff = el("div", { class: "hk-rec__eff" }, recOut);
      function effRow(label, cb, ca, at) {
        var vb = effCurve(s, cb, at), va = effCurve(s, ca, at);
        var row = el("div", {}, eff);
        el("span", {}, row, label + " bei " + atText(at) + ": ");
        el("span", {}, row, vb == null ? "aus" : deg(vb));
        el("span", { "aria-hidden": "true" }, row, " → ");
        el("strong", {}, row, va == null ? "aus" : deg(va));
      }
      if (r.after.day.rt !== r.before.day.rt || r.after.neigung !== r.before.neigung || r.after.niveau !== r.before.niveau) {
        effRow("Vorlauf", r.before.day, r.after.day, 10);
        effRow("Vorlauf", r.before.day, r.after.day, -10);
      }
      if (r.after.night.rt !== r.before.night.rt) effRow("Nachts", r.before.night, r.after.night, 0);
      r.notes.forEach(function (n) { el("p", { class: "hk-rec__note" }, recOut, n); });
      var row = el("div", { class: "hk-row" }, recOut);
      var ba = el("button", { type: "button", class: "hk-btn hk-btn--primary" }, row, "Vorschlag übernehmen");
      ba.addEventListener("click", function () { apply(r); });
      el("span", { class: "hk-hint" }, row, "Im Diagramm grün gestrichelt.");
      var gen = el("p", { class: "hk-rec__note" }, recOut);
      gen.appendChild(document.createTextNode("Am Kessel nur diese Änderung machen, dann 24 bis 48 Stunden warten und bei ähnlichem Wetter neu bewerten. Ist nur ein einzelner Raum zu kalt, liegt es meist nicht an der Kurve, sondern am "));
      var a = el("a", { href: "../abgleich/" }, gen, "hydraulischen Abgleich");
      gen.appendChild(document.createTextNode("."));
    }
    function renderPlan(P) {
      var d = P.cur;
      recOut.className = "hk-rec__out is-plan";
      el("h4", { class: "hk-rec__title" }, recOut, P.dir === "down"
        ? "Deine Kurve steht sehr hoch. So kommst du in Etappen auf einen Startwert"
        : "Deine Kurve ist sehr flach. So kommst du in Etappen auf einen Startwert");
      var vm = effCurve(s, d.day, 10), vc = effCurve(s, d.day, -10);
      el("p", {}, recOut, P.dir === "down"
        ? "Mit Neigung " + num(d.neigung, 2) + " und Niveau " + signed(d.niveau) + " regelt der Kessel bei +10 °C auf " + deg(vm) +
          (P.capAt != null && P.capAt > -20 ? " und ab " + atText(P.capAt) + " außen dauerhaft auf die Obergrenze von " + num(s.tmax) + " °C" : ", bei −10 °C auf " + deg(vc)) +
          ". Für Heizkörper üblich sind etwa 38 °C bei +10 °C und 60 bis 65 °C bei −10 °C. So begrenzen nur noch die Thermostatventile die Raumtemperatur, und der Kessel verliert mehr Wärme als nötig."
        : "Mit Neigung " + num(d.neigung, 2) + " und Niveau " + signed(d.niveau) + " kommt bei −10 °C nur " + deg(vc) + " Vorlauf. Für Heizkörper ist das sehr wenig.");
      el("p", {}, recOut, "Ziel ist der übliche Startwert für Heizkörper: Neigung 1,2 und Niveau 0" +
        (P.stages.some(function (st) { return st.k === "sonne"; }) ? ", Tag-Knopf auf N" : "") +
        ". Das ist die Werkseinstellung, im Diagramm die graue Linie. Von dort stellst du mit den Fragen fein ein.");
      var ol = el("ol", { class: "hk-rec__acts hk-rec__stages" }, recOut);
      P.stages.forEach(function (st, i) {
        var li = el("li", {}, ol);
        var head = el("div", { class: "hk-rec__act" }, li);
        el("span", { class: "hk-rec__stage" }, head, "Etappe " + (i + 1) + ": ");
        el("span", { class: "hk-rec__sym", "aria-hidden": "true" }, head, KSYM[st.k]);
        el("strong", {}, head, KLABEL[st.k] + " ");
        el("span", { class: "hk-rec__from" }, head, knobText(st.k, st.from));
        el("span", { "aria-hidden": "true" }, head, " → ");
        el("strong", { class: "hk-rec__to" }, head, knobText(st.k, st.to));
        function v(c, at) { var x = effCurve(s, c, at); return x == null ? "aus" : num(Math.round(x)); }
        el("div", { class: "hk-rec__why" }, li, strokes(st.from, st.to) + ". Vorlauf bei +10 °C: " + v(st.before.day, 10) + " → " + v(st.after.day, 10) +
          " °C · bei 0 °C: " + v(st.before.day, 0) + " → " + v(st.after.day, 0) + " °C · bei −10 °C: " + v(st.before.day, -10) + " → " + v(st.after.day, -10) + " °C");
      });
      el("p", { class: "hk-rec__note" }, recOut,
        "Pro Etappe zwei bis drei Tage warten. Die Thermostate in dieser Zeit eher offen lassen, im Referenzraum auf 5, sonst auf 3 bis 4, damit du merkst, was die Kurve liefert. " +
        "Wird es nach einer Etappe zu kalt, geh eine Etappe zurück: Das ist ungefähr die Kurve, die dein Haus braucht. Danach mit den Fragen fein einstellen.");
      if (P.dir === "up") el("p", { class: "hk-rec__note" }, recOut, "Nur nötig, wenn es dir zu kalt ist. Ist es warm genug, spart die flache Kurve Energie.");
      var row = el("div", { class: "hk-row" }, recOut);
      var b1 = el("button", { type: "button", class: "hk-btn hk-btn--primary" }, row, "Etappe 1 übernehmen");
      b1.addEventListener("click", function () { applyPos(P.stages[0].toPos); });
      if (P.stages.length > 1) {
        var b2 = el("button", { type: "button", class: "hk-btn" }, row, "Direkt auf den Startwert");
        b2.addEventListener("click", function () { applyPos(P.finalPos); });
      }
      el("span", { class: "hk-hint" }, row, "Etappe 1 im Diagramm grün gestrichelt.");
      if (P.stages.length > 1)
        el("p", { class: "hk-rec__note" }, recOut, "Direkt auf den Startwert geht schneller. Du merkst dann aber nicht, ab welcher Stufe es knapp wird, und musst bei Bedarf wieder hochgehen.");
    }
    function apply(r) { applyPos(r.pos); }
    function applyPos(newPos) {
      var d = derived(s);
      s.last = ORDER.filter(function (k) { return newPos[k] !== s.pos[k]; })
        .map(function (k) { return { k: k, from: s.pos[k], to: newPos[k] }; });
      s.undo = { sonne: s.pos.sonne, mond: s.pos.mond, neigung: s.pos.neigung, niveau: s.pos.niveau };
      s.compare = { rt: d.day.rt, neigung: d.neigung, niveau: d.niveau,
        label: "vorher (Neigung " + num(d.neigung, 2) + " · Niveau " + signed(d.niveau) + " · ☀︎ " + knobText("sonne", s.pos.sonne) + ")" };
      s.autoCmp = true;
      s.pos = copyPos(newPos);
      s.feel = { mild: null, kalt: null, nacht: null };
      s.applied = true;
      knobs.forEach(function (k) { k.render(); });
      update();
    }
    function undo() {
      if (!s.undo) return;
      s.pos = s.undo; s.undo = null;
      if (s.autoCmp) { s.compare = null; s.autoCmp = false; }
      s.applied = false;
      knobs.forEach(function (k) { k.render(); });
      update();
    }

    function update() {
      var d = derived(s);
      renderRec(d);
      atRange.value = String(s.at);
      atOut.textContent = (s.at > 0 ? "+" : "") + num(s.at) + " °C";
      Object.keys(modeBtns).forEach(function (k) { modeBtns[k].setAttribute("aria-checked", String(k === s.mode)); });
      lgNight.cb.checked = s.showNight;
      lgWerk.cb.checked = s.showWerk;
      lgCmp.item.hidden = !s.compare;
      if (s.compare) lgCmp.text.textContent = "Vergleich: " + s.compare.label;
      lgSug.item.hidden = !sug;
      bCmpDel.hidden = !s.compare;
      inMax.value = String(s.tmax);
      inMin.value = String(s.tmin);

      var ev = evaluate(s, d, s.at, s.mode);
      var modeName = s.mode === "tag" ? "Normalbetrieb ☀︎" : s.mode === "nacht" ? "Reduzierter Betrieb ☽" : "Abschaltbetrieb ❄︎";
      heroLabel.textContent = "Der Kessel regelt auf";
      heroValue.textContent = ev.temp != null ? deg(ev.temp) : "aus";
      heroSub.textContent = "bei " + (s.at > 0 ? "+" : "") + num(s.at) + " °C außen · " + modeName;
      chips.textContent = "";
      function chip(icon, text, cls) {
        var c = el("span", { class: "hk-chip" + (cls ? " " + cls : "") }, chips);
        el("span", { "aria-hidden": "true" }, c, icon);
        el("span", {}, c, text);
      }
      if (!ev.pump) {
        chip("⏻", s.mode === "frost" ? "Frostschutz ruht: Kessel und Pumpe aus" : "Heizkreispumpe aus: draußen wärmer als " + num(ev.curve.rt + 1) + " °C", "is-off");
      } else {
        if (s.mode === "frost") chip("❄︎", "Frostschutz aktiv: Kessel fährt die Nachtkurve");
        if (ev.high) chip("⬆", "Auf " + num(s.tmax) + " °C begrenzt, Kurve läge bei " + deg(ev.raw), "is-warn");
        if (ev.low) chip("⬇", "Untergrenze: Kurve läge bei " + deg(ev.raw) + ", Kessel hält " + num(s.tmin) + " °C");
        if (ev.band) chip("↔", s.mode === "frost" ? "Zwischen +1 und +3 °C bleibt der letzte Zustand" : "Grenzbereich: Pumpe schaltet hier je nach Vorgeschichte");
        chip("〰", "Brenner taktet, Kessel schwankt um einige Grad");
        if (s.mode === "tag" && s.showNight) {
          var en = evaluate(s, d, s.at, "nacht");
          chip("☽", "Nachts: " + (en.temp != null ? deg(en.temp) : "aus"));
        }
      }
      if (s.ist != null && ev.temp != null) {
        var diff = s.ist - ev.temp;
        istOut.textContent = "Abweichung " + signed(Math.round(diff)) + " K" +
          (Math.abs(diff) <= 3 ? " – passt (Schaltdifferenz)" : diff > 0 ? " – evtl. Warmwasserbereitung läuft" : " – Brenner evtl. gerade aus");
      } else istOut.textContent = "";

      drawChart(d);
      drawTable(d);
      if (hoverAt != null) hoverAt = null, tip.hidden = true;
      save(s);
    }
    update();
    if (window.ResizeObserver) {
      var lastW = chartBox.clientWidth, rt = null;
      new ResizeObserver(function () {
        if (Math.abs(chartBox.clientWidth - lastW) < 8) return;
        lastW = chartBox.clientWidth;
        clearTimeout(rt); rt = setTimeout(function () { drawChart(derived(s)); }, 80);
      }).observe(chartBox);
    }
  }

  function init() {
    var root = document.getElementById("hk-rechner");
    if (root) mount(root);
  }
  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(init);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
