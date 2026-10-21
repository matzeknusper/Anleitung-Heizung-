# Heizkörper entlüften

Luft im Heizkörper kostet Wärme und macht Geräusche. Entlüften dauert pro Heizkörper eine
Minute und ist der erste Schritt, bevor du an
[Abgleich](abgleich.md) oder [Heizkurve](heizkurve.md) gehst. Diese Anleitung ist auf
deine Anlage mit **Trimatik** abgestimmt.

!!! tip "Die richtige Reihenfolge"

    **1. Entlüften** → **2. [Hydraulischer Abgleich](abgleich.md)** →
    **3. [Heizkurve einstellen](heizkurve.md)**. Jeder Schritt baut auf dem vorherigen auf.

---

## Wann entlüften?

- **Es gluckert oder plätschert** im Heizkörper.
- **Oben kalt, unten warm**, obwohl das Thermostat offen ist.
- **Ein Heizkörper bleibt kalt**, die anderen werden warm.
- **Zu Beginn jeder Heizperiode**, also jetzt im Herbst.
- **Nachdem Wasser nachgefüllt** oder an der Anlage gearbeitet wurde.

Musst du **mehrmals im Monat** entlüften oder ständig Wasser nachfüllen, steckt eine
Ursache dahinter: ein Leck, ein defektes Ausdehnungsgefäß oder ein falscher Druck. Dann
gehört die Anlage zum Fachbetrieb.

---

## Wo sitzt was?

<figure class="hz-fig">
<svg class="hz-svg" viewBox="0 0 760 320" role="img" aria-labelledby="hz-title hz-desc">
  <title id="hz-title">Heizkörper mit Entlüftungsventil, Thermostatventil und Rücklaufverschraubung</title>
  <desc id="hz-desc">Das Entlüftungsventil sitzt oben an der Seite gegenüber dem Thermostatventil. Das Thermostatventil sitzt oben, die Rücklaufverschraubung unten. Luft sammelt sich oben im Heizkörper.</desc>
  <rect class="hz-body" x="200" y="70" width="320" height="166" rx="8"/>
  <g class="hz-ribs">
    <line x1="230" y1="80" x2="230" y2="226"/><line x1="260" y1="80" x2="260" y2="226"/>
    <line x1="290" y1="80" x2="290" y2="226"/><line x1="320" y1="80" x2="320" y2="226"/>
    <line x1="350" y1="80" x2="350" y2="226"/><line x1="380" y1="80" x2="380" y2="226"/>
    <line x1="410" y1="80" x2="410" y2="226"/><line x1="440" y1="80" x2="440" y2="226"/>
    <line x1="470" y1="80" x2="470" y2="226"/><line x1="500" y1="80" x2="500" y2="226"/>
  </g>
  <g class="hz-air">
    <circle cx="222" cy="88" r="5"/><circle cx="238" cy="84" r="3.5"/><circle cx="252" cy="90" r="4"/>
    <circle cx="270" cy="86" r="3"/><circle cx="286" cy="89" r="2.5"/>
  </g>
  <path class="hz-pipe hz-pipe--vl" d="M546 90 H572 V312"/>
  <path class="hz-pipe hz-pipe--rl" d="M546 221 H550 V312"/>
  <rect class="hz-head" x="522" y="40" width="22" height="38" rx="6"/>
  <rect class="hz-part" x="520" y="78" width="26" height="22" rx="3"/>
  <rect class="hz-part" x="520" y="211" width="26" height="20" rx="3"/>
  <rect class="hz-part" x="182" y="78" width="18" height="16" rx="2"/>
  <rect class="hz-key" x="160" y="82" width="22" height="8" rx="2"/>
  <text class="hz-label" x="20" y="44">Entlüftungsventil</text>
  <text class="hz-sub" x="20" y="61">oben, Gegenseite zum Thermostat</text>
  <line class="hz-lead" x1="118" y1="67" x2="168" y2="82"/>
  <text class="hz-label" x="230" y="124">Luft sammelt sich oben</text>
  <text class="hz-label" x="600" y="52">Thermostatventil</text>
  <text class="hz-sub" x="600" y="69">mit Kopf, Vorlauf</text>
  <line class="hz-lead" x1="596" y1="56" x2="548" y2="56"/>
  <text class="hz-label" x="600" y="206">Rücklauf-</text>
  <text class="hz-label" x="600" y="223">verschraubung</text>
  <text class="hz-sub" x="600" y="240">unten, unter der Kappe</text>
  <line class="hz-lead" x1="596" y1="214" x2="550" y2="221"/>
  <text class="hz-sub" x="542" y="304" text-anchor="end">Rücklauf</text>
  <text class="hz-sub" x="580" y="304">Vorlauf</text>
</svg>
<figcaption>Typische Anordnung. Bei manchen Heizkörpern sitzt alles spiegelverkehrt oder
der Anschluss ist unten in der Mitte. Das Entlüftungsventil ist immer oben.</figcaption>
</figure>

---

## Werkzeug

- **Entlüftungsschlüssel** (Vierkant, gibt es für wenige Euro im Baumarkt). Bei neueren
  Ventilen reicht manchmal ein Schlitzschraubendreher.
- **Lappen** und ein **kleiner Becher** für das Wasser
- Eine **Taschenlampe**, um das Manometer abzulesen

Heizungswasser ist kein Trinkwasser. Es kann dunkel gefärbt sein, das ist bei älteren
Anlagen normal.

---

## Schritt für Schritt

### 1 · Heizung warm machen

Alle **Thermostatköpfe auf 5** drehen und die Heizung etwa **eine Stunde** laufen lassen.
Warmes Wasser gibt gelöste Luft ab, und die Luft steigt nach oben in die Heizkörper.

### 2 · Pumpe ausschalten und Luft sammeln lassen

Läuft die Pumpe, wirbelt sie die Luft durch die Rohre, und an manchen Stellen kann beim
Öffnen sogar Luft angesaugt werden. Darum vor dem Entlüften die Pumpe ausschalten.

An deiner Trimatik geht das am sichersten mit dem **Anlagenschalter auf `O`** (großer
Wippschalter rechts). Das schaltet Regelung, Brenner und Pumpe aus. Die Uhr läuft weiter,
alle Einstellungen bleiben gespeichert.

Dann **30 bis 60 Minuten warten**, damit sich die Luft oben sammelt.

!!! note "Warum nicht einfach Programm ❄︎/❄︎?"

    Im Abschaltbetrieb springt unter +3 °C Außentemperatur der Frostschutz an, und dann
    läuft die Pumpe doch. Der Anlagenschalter ist eindeutig.

### 3 · Druck notieren

Lies am **Manometer** den Druck ab und schreib ihn auf. Das Manometer sitzt meist am Kessel,
an der Sicherheitsgruppe über dem Kessel oder neben dem Ausdehnungsgefäß (rote oder graue
Kugel oder Tonne an der Wand).

### 4 · Jeden Heizkörper entlüften

Beginne im **untersten Stockwerk** beim Heizkörper, der dem Kessel **am nächsten** ist.
Arbeite dich dann zu den weiter entfernten und nach oben vor. Der höchste Heizkörper kommt
zuletzt.

1. **Thermostatkopf auf 5** (offen).
2. **Lappen und Becher** unter das Entlüftungsventil halten.
3. **Schlüssel aufstecken und langsam gegen den Uhrzeigersinn drehen**, eine viertel bis
   halbe Umdrehung reicht. Es zischt, solange Luft entweicht.
4. **Warten, bis Wasser ohne Blasen und ohne Spucken** kommt.
5. **Im Uhrzeigersinn schließen**, fest, aber ohne Gewalt.
6. Nächster Heizkörper.

### 5 · Druck prüfen

Nach dem Entlüften ist der Druck meist etwas gesunken. Vergleiche mit der Tabelle:

| Heizkörper bis ins … (Kessel im Keller) | Druck bei kalter Anlage |
|-----------------------------------------|-------------------------|
| Erdgeschoss | 1,0 – 1,5 bar |
| 1. Obergeschoss | 1,2 – 1,8 bar |
| 2. Obergeschoss oder Dachgeschoss | 1,5 – 2,0 bar |

- **Markierungen am Manometer** (roter und grüner Zeiger) hat der Fachbetrieb passend für
  deine Anlage gesetzt. Sie haben Vorrang vor der Tabelle.
- **Warm steigt der Druck** um einige Zehntel bar. Das ist normal.
- **Höchstens 3 bar.** Das steht auf dem Typenschild deines Kessels, und spätestens dann
  öffnet das Sicherheitsventil.
- Ist der Druck **unter dem Sollwert**, muss Wasser nachgefüllt werden, siehe unten.

### 6 · Heizung wieder an

**Anlagenschalter zurück auf `I`.** Die Anzeige kommt wieder, die Regelung arbeitet wie
vorher. Thermostatköpfe auf die gewohnte Stufe.

### 7 · Nach ein bis zwei Tagen nachsehen

Druck noch einmal prüfen. Gluckert es noch, die betroffenen Heizkörper ein zweites Mal
entlüften. Nach dem Nachfüllen von Wasser ist das fast immer nötig.

---

## Wasser nachfüllen

Ist der Druck zu niedrig, wird über den **Kessel-Füll- und Entleerhahn** (KFE-Hahn) unten
am Kessel oder über eine fest eingebaute Füllstation nachgefüllt.

!!! warning "Nur mit Rückflussverhinderer"

    Heizungswasser darf nicht ins Trinkwasser zurückfließen. Vorgeschrieben ist deshalb ein
    **Systemtrenner** zwischen Wasserhahn und Heizung (DIN EN 1717). Ist an deiner Anlage
    keine Füllstation mit Systemtrenner vorhanden und hast du keinen passenden
    Füllschlauch, lass das den Fachbetrieb machen, zum Beispiel bei der jährlichen Wartung.

**Ablauf mit Füllstation oder Füllschlauch mit Systemtrenner:**

1. Heizung kalt, Anlagenschalter auf `O`.
2. **Schlauch vorher mit Wasser füllen**, damit keine Luft in die Anlage kommt.
3. Schlauch am KFE-Hahn anschließen, Wasserhahn öffnen.
4. **KFE-Hahn langsam öffnen** und dabei das Manometer beobachten.
5. Beim **Sollwert schließen**: erst den KFE-Hahn, dann den Wasserhahn.
6. Schlauch abnehmen, Tropfwasser auffangen.
7. Heizung an, nach einer Stunde **noch einmal entlüften**, dann Druck erneut prüfen.

Kleine Mengen Leitungswasser sind unproblematisch. Muss oft oder viel nachgefüllt werden,
ist das ein Fall für den Fachbetrieb: Dann stimmt etwas am Ausdehnungsgefäß oder es gibt ein
Leck.

---

## Wenn es klemmt

| Problem | Ursache und Abhilfe |
|---------|---------------------|
| Ventil lässt sich nicht drehen | Nicht mit Gewalt. Schlüssel richtig aufstecken, notfalls Fachbetrieb, bevor etwas abbricht. |
| Es kommt weder Luft noch Wasser | Druck zu niedrig oder Ventil verstopft. Erst den Druck am Manometer prüfen. |
| Ventil tropft nach dem Schließen | Etwas fester schließen. Tropft es weiter, Dichtung oder Ventil tauschen lassen. |
| Heizkörper bleibt nach dem Entlüften kalt | Oft klemmt der Stift im Thermostatventil. Kopf abnehmen, den Stift mit einer Zange ein paarmal vorsichtig hineindrücken, bis er wieder von selbst herauskommt. Hilft das nicht: [Abgleich](abgleich.md) oder Fachbetrieb. |
| Druck steigt beim Heizen fast auf 3 bar | Das Ausdehnungsgefäß arbeitet nicht mehr richtig. Fachbetrieb. |
| Der automatische Entlüfter am Kessel tropft | Der kleine Messingzylinder mit Kappe ist verkalkt. Fachbetrieb. |

---

## Checkliste

- [ ] Thermostatköpfe auf 5, Heizung eine Stunde warm laufen lassen
- [ ] Anlagenschalter an der Trimatik auf `O`, 30 bis 60 Minuten warten
- [ ] Druck am Manometer notieren
- [ ] Heizkörper entlüften: unten und nah am Kessel beginnen, oben und weit weg zuletzt
- [ ] Druck prüfen, bei Bedarf Wasser nachfüllen
- [ ] Anlagenschalter auf `I`, Thermostatköpfe zurück
- [ ] Nach ein bis zwei Tagen Druck prüfen und bei Bedarf nachentlüften
