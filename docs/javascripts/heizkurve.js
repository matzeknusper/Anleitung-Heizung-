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
    compare: null, ist: null
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
      }
    } catch (e) { /* Speicher nicht verfügbar: Standardwerte */ }
    return s;
  }
  function save(s) {
    try {
      window.localStorage.setItem(STORE, JSON.stringify({
        pos: s.pos, at: s.at, mode: s.mode, tmax: s.tmax, tmin: s.tmin,
        showNight: s.showNight, showWerk: s.showWerk, compare: s.compare
      }));
    } catch (e) { /* ignorieren */ }
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  function derived(s) {
    var neigung = knobValue("neigung", s.pos.neigung), niveau = knobValue("niveau", s.pos.niveau);
    return {
      neigung: neigung, niveau: niveau,
      sonne: knobValue("sonne", s.pos.sonne), mond: knobValue("mond", s.pos.mond),
      day: { rt: 20 + knobValue("sonne", s.pos.sonne), neigung: neigung, niveau: niveau },
      night: { rt: 14 + knobValue("mond", s.pos.mond), neigung: neigung, niveau: niveau }
    };
  }
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
    var knobs = ORDER.map(function (k) { return buildKnob(kGrid, k, s, update); });
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

    // Karte 3: Diagramm
    var cChart = el("section", { class: "hk-card hk-card--chart" }, app);
    el("h3", { class: "hk-card__title" }, cChart, "3 · Deine Heizkurve");
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

    var chartBox = el("div", { class: "hk-chart" }, cChart);
    var svg = sv("svg", { viewBox: "0 0 " + W + " " + H, class: "hk-svg", role: "img" }, chartBox);
    var tip = el("div", { class: "hk-tip", hidden: "" }, chartBox);
    var cRow = el("div", { class: "hk-row" }, cChart);
    var bCmp = el("button", { type: "button", class: "hk-btn" }, cRow, "Aktuelle Kurve als Vergleich merken");
    var bCmpDel = el("button", { type: "button", class: "hk-btn hk-btn--ghost" }, cRow, "Vergleich löschen");
    el("p", { class: "hk-hint" }, cChart,
      "Ins Diagramm tippen oder ziehen setzt die Außentemperatur. Der Kessel fährt die kräftige Linie; " +
      "die dünne gestrichelte zeigt die Kurve ohne Ober- und Untergrenze.");

    // Karte 4: Tabelle
    var cTab = el("section", { class: "hk-card hk-card--table" }, app);
    el("h3", { class: "hk-card__title" }, cTab, "4 · Vorlauftemperaturen auf einen Blick");
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
      knobs.forEach(function (k) { k.render(); });
      update();
    });
    bCmp.addEventListener("click", function () {
      var d = derived(s);
      s.compare = { rt: d.day.rt, neigung: d.neigung, niveau: d.niveau,
        label: "Neigung " + num(d.neigung, 2) + " · Niveau " + signed(d.niveau) + " · ☀︎ " + (d.sonne === 0 ? "N" : "N " + signed(d.sonne)) };
      update();
    });
    bCmpDel.addEventListener("click", function () { s.compare = null; update(); });
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

      // Endbeschriftungen rechts
      var yD = Y(effCurve(s, d.day, XMIN)), yN = Y(effCurve(s, d.night, XMIN));
      sv("text", { x: ML + PW + 8, y: yD + 4, class: "hk-endlabel" }, svg, "Tag");
      if ((s.showNight || s.mode !== "tag") && Math.abs(yD - yN) > 14)
        sv("text", { x: ML + PW + 8, y: yN + 4, class: "hk-endlabel" }, svg, "Nacht");

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
      tNote.textContent = "Werte in °C, gerundet. „aus“ = Sommerabschaltung (Heizkreispumpe aus)." +
        (marks ? " * = Kessel an Unter- oder Obergrenze, die Kurve allein läge niedriger bzw. höher." : "");
    }

    function update() {
      var d = derived(s);
      atRange.value = String(s.at);
      atOut.textContent = (s.at > 0 ? "+" : "") + num(s.at) + " °C";
      Object.keys(modeBtns).forEach(function (k) { modeBtns[k].setAttribute("aria-checked", String(k === s.mode)); });
      lgNight.cb.checked = s.showNight;
      lgWerk.cb.checked = s.showWerk;
      lgCmp.item.hidden = !s.compare;
      if (s.compare) lgCmp.text.textContent = "Vergleich: " + s.compare.label;
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
