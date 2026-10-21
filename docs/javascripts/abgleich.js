/*
 * Abgleich-Rechner (vereinfachtes Verfahren nach Raumfläche)
 *   Heizlast Raum   = Fläche · spez. Heizlast · Raumfaktor
 *   Volumenstrom    = Heizlast / (1,163 · Spreizung)          [l/h]
 *   kv-Wert         = Volumenstrom[m³/h] / √(Δp[bar])
 *   Heizkörper      = Normleistung(75/65/20) · (ΔT_log / 49,83)^1,3
 *   Heizlast Haus   ≈ Heizöl Liter pro Jahr / 250              [kW]  (Faustformel)
 */
(function () {
  "use strict";

  var STORE = "ab-rechner-v1", HK_STORE = "hk-rechner-v1";
  var STANDARDS = [
    ["alt", "vor 1977, unsaniert", 120],
    ["altsan", "vor 1977, Fenster/Dach erneuert", 90],
    ["wsv77", "1977 – 1994", 80],
    ["wsv95", "1995 – 2001", 60],
    ["enev", "ab 2002", 45],
    ["eigen", "eigener Wert", null]
  ];
  var LAGEN = [
    ["normal", "normal", 1.0, 20],
    ["eck", "Eckraum", 1.2, 20],
    ["viel", "3 Außenwände", 1.4, 20],
    ["dach", "unterm Dach", 1.2, 20],
    ["bad", "Bad (24 °C)", 1.3, 24],
    ["schlaf", "Schlafen (18 °C)", 0.85, 18],
    ["innen", "Flur / innen", 0.6, 18]
  ];
  function lage(k) { for (var i = 0; i < LAGEN.length; i++) if (LAGEN[i][0] === k) return LAGEN[i]; return LAGEN[0]; }
  function std(k) { for (var i = 0; i < STANDARDS.length; i++) if (STANDARDS[i][0] === k) return STANDARDS[i]; return STANDARDS[2]; }

  // Heizkurve der Trimatik (wie im Heizkurven-Rechner)
  var G1 = 1.6905, G2 = -0.017993, DMAX = -G1 / (2 * G2);
  function hkCurve(at, rt, n, niv) {
    var d = Math.max(0, Math.min(rt - at, DMAX));
    return Math.min(75, Math.max(35, rt + niv + n * (G1 * d + G2 * d * d)));
  }
  function seq(a, step, n) { var r = []; for (var i = 0; i < n; i++) r.push(a + i * step); return r; }
  var KV = {
    sonne: seq(-7, 1, 16), neigung: [0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6], niveau: seq(-12, 3, 16)
  };
  function kval(arr, p) { var i = Math.min(Math.floor(p), 14), f = p - i; return arr[i] + f * (arr[i + 1] - arr[i]); }
  function curveFromHk(normAt) {
    try {
      var o = JSON.parse(window.localStorage.getItem(HK_STORE) || "null");
      if (!o || !o.pos) return null;
      var rt = 20 + kval(KV.sonne, o.pos.sonne), n = kval(KV.neigung, o.pos.neigung), niv = kval(KV.niveau, o.pos.niveau);
      return { vl: Math.round(hkCurve(normAt, rt, n, niv)), n: n, niv: niv, rt: rt };
    } catch (e) { return null; }
  }

  function num(x, dec) {
    return x.toLocaleString("de-DE", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }).replace("-", "−");
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  var uid = 0;
  function room(name, area, lageKey, qn, count) {
    return { id: ++uid, name: name, area: area, lage: lageKey, qn: qn, count: count || 1 };
  }
  function defaults() {
    return {
      haus: { std: "wsv77", wpm2: 80, oel: null, spreizung: 15, vl: 65, normAt: -12, dp: 100 },
      rooms: [
        room("Wohnzimmer", 28, "eck", null, 2),
        room("Küche", 12, "normal", null, 1),
        room("Bad", 7, "bad", null, 1),
        room("Schlafzimmer", 15, "schlaf", null, 1)
      ]
    };
  }
  function load() {
    var s = defaults();
    try {
      var o = JSON.parse(window.localStorage.getItem(STORE) || "null");
      if (o && o.haus && Array.isArray(o.rooms)) {
        for (var k in s.haus) if (o.haus[k] !== undefined) s.haus[k] = o.haus[k];
        s.rooms = o.rooms.map(function (r) {
          return room(String(r.name || ""), +r.area || 0, lage(r.lage)[0], r.qn == null ? null : +r.qn, +r.count || 1);
        });
      }
    } catch (e) { /* Standard */ }
    return s;
  }
  function save(s) {
    try {
      window.localStorage.setItem(STORE, JSON.stringify({
        haus: s.haus,
        rooms: s.rooms.map(function (r) { return { name: r.name, area: r.area, lage: r.lage, qn: r.qn, count: r.count }; })
      }));
    } catch (e) { /* ignorieren */ }
  }

  function el(tag, attrs, parent, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  // ---------------------------------------------------------------- Rechnen
  function calc(s) {
    var h = s.haus, rl = h.vl - h.spreizung, res = [], total = 0, area = 0, areaF = 0, flowSum = 0, kvMax = 0;
    s.rooms.forEach(function (r) {
      var L = lage(r.lage), q = (r.area || 0) * h.wpm2 * L[2], count = Math.max(1, r.count || 1);
      var perRad = q / count, flow = perRad / (1.163 * h.spreizung);
      var kv = (flow / 1000) / Math.sqrt(h.dp / 1000);
      var o = { r: r, q: q, perRad: perRad, flow: flow, kv: kv, ti: L[3], check: null, reserve: null, qact: null };
      if (r.qn && r.qn > 0) {
        if (rl > L[3] + 0.5 && h.vl > rl) {
          var dtl = (h.vl - rl) / Math.log((h.vl - L[3]) / (rl - L[3]));
          o.qact = r.qn * Math.pow(dtl / 49.83, 1.3);
          o.reserve = q > 0 ? o.qact * count / q : null;
          o.check = o.reserve == null ? null : o.reserve >= 1.1 ? "ok" : o.reserve >= 0.95 ? "knapp" : "klein";
        } else o.check = "temp";
      }
      total += q; area += r.area || 0; areaF += (r.area || 0) * L[2]; flowSum += flow * count; kvMax = Math.max(kvMax, kv);
      res.push(o);
    });
    res.forEach(function (o) {
      var ratio = kvMax > 0 ? o.kv / kvMax : 0;
      o.ratio = ratio;
      o.rel = ratio > 0.75 ? "hoch" : ratio >= 0.4 ? "mittel" : "niedrig";
    });
    var oelKw = h.oel ? h.oel / 250 : null;
    var limiting = null;
    res.forEach(function (o) { if (o.reserve != null && (limiting == null || o.reserve < limiting.reserve)) limiting = o; });
    return { rows: res, total: total, area: area, areaF: areaF, flow: flowSum, oelKw: oelKw, rl: rl, limiting: limiting };
  }

  // ---------------------------------------------------------------- App
  function mount(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = "1";
    root.textContent = "";
    var s = load();
    var app = el("div", { class: "hk ab" }, root);

    // ---- Karte 1: Haus
    var c1 = el("section", { class: "hk-card" }, app);
    el("h3", { class: "hk-card__title" }, c1, "1 · Dein Haus und deine Anlage");
    var g1 = el("div", { class: "ab-grid" }, c1);

    function field(parent, label, help) {
      var w = el("div", { class: "hk-field ab-field" }, parent);
      var id = "ab-f" + (++uid);
      el("label", { for: id }, w, label);
      var row = el("div", { class: "hk-ist__row" }, w);
      var hint = help ? el("div", { class: "hk-hint" }, w, help) : null;
      return { w: w, id: id, row: row, hint: hint };
    }
    function select(f, options, value, onChange) {
      var sel = el("select", { id: f.id, class: "hk-input ab-select" }, f.row);
      options.forEach(function (o) { var op = el("option", { value: o[0] }, sel, o[1]); if (o[0] === value) op.selected = true; });
      sel.addEventListener("change", function () { onChange(sel.value); });
      return sel;
    }
    function number(f, value, unit, min, max, step, onChange, placeholder) {
      var inp = el("input", { id: f.id, type: "number", min: String(min), max: String(max), step: String(step || 1), inputmode: "decimal", class: "hk-input" }, f.row);
      if (placeholder) inp.placeholder = placeholder;
      if (value != null) inp.value = String(value);
      if (unit) el("span", { class: "hk-unit" }, f.row, unit);
      inp.addEventListener("input", function () { var v = parseFloat(inp.value); onChange(isNaN(v) ? null : v); });
      return inp;
    }

    var fStd = field(g1, "Baujahr / Zustand des Hauses", "Bestimmt die Heizlast pro m² (Faustwerte).");
    var selStd = select(fStd, STANDARDS.map(function (x) { return [x[0], x[1] + (x[2] ? " · " + x[2] + " W/m²" : "")]; }), s.haus.std, function (v) {
      s.haus.std = v; var w = std(v)[2]; if (w) { s.haus.wpm2 = w; inWpm2.value = String(w); } update();
    });
    var fW = field(g1, "Heizlast pro m²", "Wird aus dem Baujahr vorgeschlagen, du kannst ihn anpassen.");
    var inWpm2 = number(fW, s.haus.wpm2, "W/m²", 20, 250, 5, function (v) {
      if (v != null) { s.haus.wpm2 = v; s.haus.std = "eigen"; selStd.value = "eigen"; } update();
    });
    var fOel = field(g1, "Heizölverbrauch pro Jahr (optional)", "Zur Kontrolle: Heizlast in kW ≈ Liter ÷ 250.");
    number(fOel, s.haus.oel, "Liter", 0, 20000, 50, function (v) { s.haus.oel = v; update(); }, "z. B. 2500");
    var oelOut = el("div", { class: "ab-note" }, fOel.w);
    var bOel = el("button", { type: "button", class: "hk-btn" }, fOel.w, "W/m² aus Verbrauch übernehmen");
    bOel.hidden = true;

    var fSp = field(g1, "Spreizung (Vorlauf − Rücklauf)", "15 K ist für alte Heizkörper-Anlagen ein guter Wert.");
    select(fSp, [["10", "10 K"], ["15", "15 K"], ["20", "20 K"]], String(s.haus.spreizung), function (v) { s.haus.spreizung = +v; update(); });
    var fNorm = field(g1, "Norm-Außentemperatur deiner Region", "In Deutschland meist −10 bis −16 °C.");
    select(fNorm, [["-10", "−10 °C"], ["-12", "−12 °C"], ["-14", "−14 °C"], ["-16", "−16 °C"]], String(s.haus.normAt), function (v) { s.haus.normAt = +v; update(); });
    var fVl = field(g1, "Vorlauf bei Norm-Außentemperatur", "So heiß wird das Wasser am kältesten Auslegungstag.");
    var inVl = number(fVl, s.haus.vl, "°C", 35, 75, 1, function (v) { if (v != null) s.haus.vl = v; update(); });
    var hkInfo = el("div", { class: "ab-note" }, fVl.w);
    var bHk = el("button", { type: "button", class: "hk-btn" }, fVl.w, "Aus meiner Heizkurve übernehmen");
    var fDp = field(g1, "Differenzdruck am Ventil", "Annahme für die Ventilberechnung. 100 mbar passt für die meisten Anlagen.");
    select(fDp, [["50", "50 mbar"], ["100", "100 mbar"], ["150", "150 mbar"]], String(s.haus.dp), function (v) { s.haus.dp = +v; update(); });

    // ---- Karte 2: Räume
    var c2 = el("section", { class: "hk-card" }, app);
    el("h3", { class: "hk-card__title" }, c2, "2 · Räume und Heizkörper");
    el("p", { class: "hk-hint" }, c2,
      "Ein Eintrag pro Raum. Lage: normal = eine Außenwand, Eckraum = zwei, unterm Dach = Dachschräge oder kalter Dachboden darüber. " +
      "Die Normleistung je Heizkörper (HK) steht im Datenblatt (Wert bei 75/65/20 °C), grobe Werte stehen oben in Schritt 2. Ohne sie fehlt nur der Heizkörper-Check.");
    var list = el("div", { class: "ab-rooms" }, c2);
    var addRow = el("div", { class: "hk-row" }, c2);
    var bAdd = el("button", { type: "button", class: "hk-btn" }, addRow, "+ Raum hinzufügen");
    var bClear = el("button", { type: "button", class: "hk-btn hk-btn--ghost" }, addRow, "Alle Räume löschen");
    var bExample = el("button", { type: "button", class: "hk-btn hk-btn--ghost" }, addRow, "Beispiel laden");

    // ---- Karte 3: Ergebnis
    var c3 = el("section", { class: "hk-card" }, app);
    el("h3", { class: "hk-card__title" }, c3, "3 · Ergebnis");
    var stats = el("div", { class: "ab-stats" }, c3);
    var tWrap = el("div", { class: "hk-tablewrap" }, c3);
    var table = el("table", { class: "hk-table ab-table" }, tWrap);
    var notes = el("div", { class: "ab-notes" }, c3);
    var pRow = el("div", { class: "hk-row" }, c3);
    var bPrint = el("button", { type: "button", class: "hk-btn" }, pRow, "Ergebnis drucken");

    // ---- Räume rendern
    function renderRooms() {
      list.textContent = "";
      s.rooms.forEach(function (r, idx) {
        var card = el("div", { class: "ab-room" }, list);
        var head = el("div", { class: "ab-room__head" }, card);
        var nameIn = el("input", { type: "text", class: "hk-input ab-room__name", "aria-label": "Raumname", value: r.name, placeholder: "Raum " + (idx + 1) }, head);
        nameIn.addEventListener("input", function () { r.name = nameIn.value; update(false); });
        var del = el("button", { type: "button", class: "hk-btn hk-btn--ghost hk-btn--icon", "aria-label": "Raum entfernen", title: "Raum entfernen" }, head, "×");
        del.addEventListener("click", function () { s.rooms.splice(idx, 1); renderRooms(); update(); });
        var g = el("div", { class: "ab-room__grid" }, card);
        var fA = field(g, "Fläche");
        number(fA, r.area, "m²", 0, 200, 0.5, function (v) { r.area = v || 0; update(false); });
        var fL = field(g, "Lage");
        select(fL, LAGEN.map(function (x) { return [x[0], x[1]]; }), r.lage, function (v) { r.lage = v; update(false); });
        var fC = field(g, "Heizkörper");
        number(fC, r.count, "Stück", 1, 6, 1, function (v) { r.count = Math.max(1, Math.round(v || 1)); update(false); });
        var fQ = field(g, "Normleistung je HK");
        number(fQ, r.qn, "W", 0, 6000, 10, function (v) { r.qn = v; update(false); }, "opt.");
        r._out = el("div", { class: "ab-room__out", "aria-live": "polite" }, card);
      });
    }

    function badge(parent, kind, text) {
      var b = el("span", { class: "ab-badge ab-badge--" + kind }, parent);
      el("span", { "aria-hidden": "true" }, b, kind === "ok" ? "✓" : kind === "knapp" ? "!" : kind === "klein" ? "✗" : "?");
      el("span", {}, b, text);
      return b;
    }

    function update(rebuild) {
      var h = s.haus, R = calc(s);
      // Heizkurven-Übernahme
      var hk = curveFromHk(h.normAt);
      if (hk) {
        hkInfo.textContent = "Deine Heizkurve (Neigung " + num(hk.n, 1) + ", Niveau " + num(hk.niv) + ") liefert bei " + num(h.normAt) + " °C etwa " + hk.vl + " °C.";
        bHk.hidden = h.vl === hk.vl;
      } else {
        var w = Math.round(hkCurve(h.normAt, 20, 1.2, 0));
        hkInfo.textContent = "Werkseinstellung der Trimatik: bei " + num(h.normAt) + " °C etwa " + w + " °C. Mit deinen Werten im Heizkurven-Rechner wird es genauer.";
        bHk.hidden = h.vl === w;
      }
      // Öl
      if (R.oelKw) {
        var wFromOel = R.areaF > 0 ? R.oelKw * 1000 / R.areaF : null;
        oelOut.textContent = "≈ " + num(R.oelKw, 1) + " kW Heizlast" +
          (wFromOel ? ". Verteilt auf die eingetragenen " + num(R.area) + " m² (mit Raumfaktoren) wären das " + num(wFromOel) + " W/m²." : ".") +
          " Nur sinnvoll, wenn alle beheizten Räume eingetragen sind.";
        bOel.hidden = !wFromOel || Math.abs(wFromOel - h.wpm2) < 3;
        bOel._w = wFromOel ? Math.round(wFromOel) : null;
      } else { oelOut.textContent = ""; bOel.hidden = true; }

      // Raumkarten-Ergebnisse
      R.rows.forEach(function (o) {
        var out = o.r._out; if (!out) return;
        out.textContent = "";
        function kv(label, value) { var d = el("div", { class: "ab-kv" }, out); el("span", {}, d, label); el("strong", {}, d, value); }
        kv("Heizlast", num(o.q) + " W");
        kv(o.r.count > 1 ? "je Heizkörper" : "Volumenstrom", (o.r.count > 1 ? num(o.perRad) + " W · " : "") + num(o.flow) + " l/h");
        kv("kv-Wert", num(o.kv, 2));
        kv("Voreinstellung", o.rel);
        var bWrap = el("div", { class: "ab-kv ab-kv--wide" }, out);
        if (o.check === "ok") badge(bWrap, "ok", "Heizkörper reicht (" + num(o.qact * o.r.count) + " W bei " + num(h.vl) + "/" + num(R.rl) + " °C)");
        else if (o.check === "knapp") badge(bWrap, "knapp", "knapp (" + num(o.qact * o.r.count) + " W) – bleibt voll offen");
        else if (o.check === "klein") badge(bWrap, "klein", "zu klein (" + num(o.qact * o.r.count) + " W von " + num(o.q) + " W)");
        else if (o.check === "temp") badge(bWrap, "temp", "Rücklauf zu kalt für diesen Raum – Spreizung kleiner wählen");
      });

      // Kennzahlen
      stats.textContent = "";
      function stat(label, value, sub) {
        var d = el("div", { class: "ab-stat" }, stats);
        el("div", { class: "ab-stat__label" }, d, label);
        el("div", { class: "ab-stat__value" }, d, value);
        if (sub) el("div", { class: "ab-stat__sub" }, d, sub);
      }
      stat("Heizlast gesamt", num(R.total / 1000, 1) + " kW", num(R.area) + " m² · " + num(h.wpm2) + " W/m²");
      stat("Volumenstrom gesamt", num(R.flow) + " l/h", "bei " + num(h.spreizung) + " K Spreizung");
      var ratio = R.total > 0 ? 22000 / R.total : null;
      stat("Kessel (Typenschild)", "22 – 27 kW",
        ratio == null ? "" : ratio > 1.15 ? "≈ " + num(ratio, 1) + "-mal so groß wie nötig" : ratio < 0.9 ? "kleiner als die Heizlast – Werte prüfen" : "passt zur Heizlast");

      // Tabelle
      table.textContent = "";
      var thead = el("thead", {}, table), tr = el("tr", {}, thead);
      ["Raum", "Heizlast", "Heizkörper", "l/h je HK", "kv je HK", "Voreinstellung", "Check"].forEach(function (x) { el("th", { scope: "col" }, tr, x); });
      var tb = el("tbody", {}, table);
      R.rows.slice().sort(function (a, b) { return b.kv - a.kv; }).forEach(function (o) {
        var r = el("tr", {}, tb);
        el("th", { scope: "row" }, r, o.r.name || "–");
        el("td", {}, r, num(o.q) + " W");
        el("td", {}, r, String(o.r.count));
        el("td", {}, r, num(o.flow));
        el("td", {}, r, num(o.kv, 2));
        var td = el("td", {}, r);
        var bar = el("span", { class: "ab-bar", "aria-hidden": "true" }, td);
        el("span", { class: "ab-bar__fill", style: "width:" + Math.round(o.ratio * 100) + "%" }, bar);
        el("span", {}, td, " " + o.rel);
        el("td", {}, r, o.check === "ok" ? "✓ reicht" : o.check === "knapp" ? "! knapp" : o.check === "klein" ? "✗ zu klein" : o.check === "temp" ? "?" : "–");
      });

      // Hinweise
      notes.textContent = "";
      function note(text, strong) {
        var p = el("p", { class: "ab-note" }, notes);
        if (strong) el("strong", {}, p, strong + " ");
        p.appendChild(document.createTextNode(text));
      }
      note("Sortiert nach benötigtem kv-Wert. Oben stehen die Heizkörper, die am weitesten offen sein müssen.", "Lesart:");
      note("Im Datenblatt deines Ventils (Voreinstelltabelle) die Stufe suchen, deren kv-Wert am nächsten am berechneten Wert liegt. Im Zweifel die nächstgrößere nehmen.", "Ventil einstellen:");
      if (R.limiting && R.limiting.check !== "ok")
        note("„" + (R.limiting.r.name || "Raum") + "“ hat die kleinste Heizkörper-Reserve. Dieser Raum bestimmt, wie tief die Heizkurve sinken darf. Seine Ventile bleiben voll offen.", "Engpass:");
      else if (R.limiting)
        note("Alle Heizkörper mit Normleistung reichen. Den kleinsten Spielraum hat „" + (R.limiting.r.name || "Raum") + "“ (" + num(R.limiting.reserve * 100) + " % der Heizlast). Die Heizkurve kann vermutlich tiefer.", "Gut:");
      if (R.oelKw && R.total > 0 && Math.abs(R.oelKw * 1000 / R.total - 1) > 0.25)
        note("Die Heizlast aus der Raumfläche weicht um mehr als 25 % vom Ölverbrauch ab. Prüfe, ob alle Räume eingetragen sind, oder übernimm den W/m²-Wert aus dem Verbrauch.", "Abgleich mit Verbrauch:");
      note("Die Pumpe muss nur etwa " + num(R.flow) + " l/h fördern. Alte ungeregelte Pumpen schaffen ein Vielfaches: nach dem Abgleich die kleinste Stufe probieren.", "Pumpe:");

      save(s);
    }

    // ---- Events
    bOel.addEventListener("click", function () {
      if (bOel._w) { s.haus.wpm2 = bOel._w; s.haus.std = "eigen"; inWpm2.value = String(bOel._w); selStd.value = "eigen"; update(); }
    });
    bHk.addEventListener("click", function () {
      var hk = curveFromHk(s.haus.normAt);
      s.haus.vl = hk ? hk.vl : Math.round(hkCurve(s.haus.normAt, 20, 1.2, 0));
      inVl.value = String(s.haus.vl); update();
    });
    bAdd.addEventListener("click", function () {
      s.rooms.push(room("", 12, "normal", null, 1)); renderRooms(); update();
      var names = list.querySelectorAll(".ab-room__name"); if (names.length) names[names.length - 1].focus();
    });
    bClear.addEventListener("click", function () {
      if (!s.rooms.length || window.confirm("Alle Räume löschen?")) { s.rooms = []; renderRooms(); update(); }
    });
    bExample.addEventListener("click", function () {
      s.rooms = defaults().rooms; renderRooms(); update();
    });
    bPrint.addEventListener("click", function () { window.print(); });

    renderRooms();
    update();
  }

  function init() { var r = document.getElementById("ab-rechner"); if (r) mount(r); }
  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(init);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
