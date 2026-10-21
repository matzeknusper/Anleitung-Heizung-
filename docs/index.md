# Ölheizung – Kurzanleitung

Vereinfachte Anleitung für die Heizungsregelung **Viessmann Trimatik** am Ölkessel
**Viessmann Vitola-biferral-RN**. Sie enthält nur das, was man im Alltag braucht:
Heizzeiten, Raumtemperatur, Betriebsprogramme, Warmwasser und die wichtigsten
Hintergründe. Die vollständige Original-Anleitung liegt unter
[`original/`](original/Viessmann_Trimatik-MC_Betriebsanleitung_5581083.pdf).

> 🌐 **Als Website lesen:** <https://matzeknusper.github.io/Anleitung-Heizung-/>
> (GitHub Pages, gebaut mit Material for MkDocs aus dem Ordner `docs/`).

!!! info "Hinweis zur Quelle"

    Die Original-Anleitung beschreibt die **Trimatik-MC**.
    Das eingebaute Gerät ist die etwas ältere **Trimatik** (Tasten `CL`, `UHR`, `WT`,
    Kanäle `SU1` / `SU2`). Funktion und Logik sind gleich, nur die Beschriftung weicht ab.
    Die Zuordnung steht in [Bedienelemente](bedienung.md#bedienelemente). Wo ich vom Foto auf die
    Funktion schließe, ist das als *(vermutlich)* markiert – bitte einmal am Gerät prüfen.


!!! tip "Optimieren: drei Anleitungen mit Rechnern"

    1. **[Heizkörper entlüften](entlueften.md)**
    2. **[Hydraulischer Abgleich](abgleich.md)** mit Abgleich-Rechner
    3. **[Heizkurve einstellen](heizkurve.md)** mit Heizkurven-Rechner für deine Trimatik

## Das Wichtigste in 30 Sekunden

| Ich will …                                   | Dann …                                                                                   |
|----------------------------------------------|------------------------------------------------------------------------------------------|
| normal heizen (Tag warm, Nacht abgesenkt)     | Programmwahlschalter auf **☀︎/☽**, Heizzeiten über Kanal `SU1` einstellen                  |
| es tagsüber wärmer / kälter haben             | Drehknopf **☀︎** ein bis zwei Teilstriche Richtung **+** / **−** (1 Teilstrich ≈ 1 °C)      |
| nachts wärmer / kälter                        | Drehknopf **☽** verstellen (1 Teilstrich ≈ 1 °C)                                          |
| nur Warmwasser, keine Heizung (Sommer)        | Programmwahlschalter auf **<img class="sym" src="bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20">/❄︎**                                                          |
| in den Urlaub fahren                          | Programmwahlschalter auf **❄︎/❄︎** (Frostschutz bleibt aktiv), Anlage **nicht** ausschalten |
| ganztägig heizen (Feiertag, Besuch)           | Programmwahlschalter auf **☀︎/☀︎**, danach zurückstellen                                   |
| die Uhr stellen                               | Taste `UHR` gedrückt halten und am Drehknopf drehen                                       |


## Die Anlage

| Angabe                      | Wert                                                   |
|-----------------------------|--------------------------------------------------------|
| Kessel                      | Viessmann Vitola-biferral-RN, Typ BRN22                |
| Art                         | Öl/Gas-Kessel nach DIN 4702 (hier mit Ölbrenner)       |
| Leistung                    | 22 – 27 kW                                             |
| Kesselwasserinhalt          | 90 l                                                   |
| Max. Betriebsdruck          | 3 bar                                                  |
| Max. Vorlauftemperatur      | 110 °C                                                 |
| Regelung                    | Viessmann Trimatik (witterungsgeführt, mit Schaltuhr)  |
| Original-Anleitung          | Viessmann Trimatik-MC, Best.-Nr. 7450 263, Druck 3/95  |

**Was die Regelung macht:** Sie misst die **Außentemperatur** (Sensor an der Hauswand)
und stellt danach die **Kesselwassertemperatur** ein: je kälter draußen, desto heißer
das Heizungswasser. Den Zusammenhang legt die **Heizkennlinie** fest ([Heizkurve einstellen](heizkurve.md)).
Es gibt **keinen Raumfühler**. Die Drehknöpfe ☀︎ und ☽ verschieben nur die Kennlinie,
die tatsächliche Raumtemperatur ergibt sich aus Kennlinie, Außentemperatur und den
Thermostatventilen an den Heizkörpern.

**Warmwasser hat Vorrang:** Wenn der Speicher aufgeheizt wird, stehen die Heizkörper
so lange still. Das ist normal und dauert meist nur einige Minuten.

**Sicherheit:** Arbeiten am Kessel, Brenner oder an der Elektrik nur durch den
Fachbetrieb. Wartung einmal jährlich. Bei Brennerstörung (rote Störlampe) maximal
einen Neustart über den Entstörknopf am Brenner versuchen, danach Fachbetrieb rufen.

---

*Quelle: Viessmann Betriebsanleitung Trimatik-MC, Best.-Nr. 7450 263, 5581 083 (3/95),
gekürzt und auf das eingebaute Gerät bezogen. Foto des Bedienfelds und Symbole siehe `bilder/`.*
