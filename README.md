# Bedienungsanleitung Ölheizung – Kurzfassung

Vereinfachte Anleitung für die Heizungsregelung **Viessmann Trimatik** am Ölkessel
**Viessmann Vitola-biferral-RN**. Sie enthält nur das, was man im Alltag braucht:
Heizzeiten, Raumtemperatur, Betriebsprogramme, Warmwasser und die wichtigsten
Hintergründe. Die vollständige Original-Anleitung liegt unter
[`docs/original/`](docs/original/Viessmann_Trimatik-MC_Betriebsanleitung_5581083.pdf).

> 🌐 **Als Website lesen:** <https://matzeknusper.github.io/Anleitung-Heizung-/>
> (GitHub Pages, gebaut mit Material for MkDocs aus dem Ordner `docs/`).
>
> Dort gibt es außerdem drei ausführliche Anleitungen zum Optimieren:
> [Heizkörper entlüften](https://matzeknusper.github.io/Anleitung-Heizung-/entlueften/) ·
> [Hydraulischer Abgleich mit Rechner](https://matzeknusper.github.io/Anleitung-Heizung-/abgleich/) ·
> [Heizkurve einstellen mit Rechner](https://matzeknusper.github.io/Anleitung-Heizung-/heizkurve/)

> **Hinweis zur Quelle:** Die Original-Anleitung beschreibt die **Trimatik-MC**.
> Das eingebaute Gerät ist die etwas ältere **Trimatik** (Tasten `CL`, `UHR`, `WT`,
> Kanäle `SU1` / `SU2`). Funktion und Logik sind gleich, nur die Beschriftung weicht ab.
> Die Zuordnung steht in [Abschnitt 2](#2-bedienelemente). Wo ich vom Foto auf die
> Funktion schließe, ist das als *(vermutlich)* markiert – bitte einmal am Gerät prüfen.

---

## Inhalt

1. [Die Anlage](#1-die-anlage)
2. [Bedienelemente](#2-bedienelemente)
3. [Wie alles zusammenhängt](#3-wie-alles-zusammenhängt)
4. [Betriebsprogramm wählen (Programmwahlschalter)](#4-betriebsprogramm-wählen-programmwahlschalter)
5. [Uhrzeit und Wochentag](#5-uhrzeit-und-wochentag)
6. [Heizzeiten einstellen (Schaltuhr)](#6-heizzeiten-einstellen-schaltuhr)
7. [Raumtemperatur einstellen](#7-raumtemperatur-einstellen)
8. [Warmwasser](#8-warmwasser)
9. [Heizkennlinie (Neigung und Niveau)](#9-heizkennlinie-neigung-und-niveau)
10. [Urlaub, Sommer, Abschalten](#10-urlaub-sommer-abschalten)
11. [Was tun, wenn …](#11-was-tun-wenn-)
12. [Energiespartipps](#12-energiespartipps)
13. [Meine Einstellungen (zum Eintragen)](#13-meine-einstellungen-zum-eintragen)

---

## Das Wichtigste in 30 Sekunden

| Ich will …                                   | Dann …                                                                                   |
|----------------------------------------------|------------------------------------------------------------------------------------------|
| normal heizen (Tag warm, Nacht abgesenkt)     | Programmwahlschalter auf **☀︎/☽**, Heizzeiten über Kanal `SU1` einstellen                  |
| es tagsüber wärmer / kälter haben             | Drehknopf **☀︎** ein bis zwei Teilstriche Richtung **+** / **−** (1 Teilstrich ≈ 1 °C)      |
| nachts wärmer / kälter                        | Drehknopf **☽** verstellen (1 Teilstrich ≈ 1 °C)                                          |
| nur Warmwasser, keine Heizung (Sommer)        | Programmwahlschalter auf **<picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>/❄︎**                                                          |
| in den Urlaub fahren                          | Programmwahlschalter auf **❄︎/❄︎** (Frostschutz bleibt aktiv), Anlage **nicht** ausschalten |
| ganztägig heizen (Feiertag, Besuch)           | Programmwahlschalter auf **☀︎/☀︎**, danach zurückstellen                                   |
| die Uhr stellen                               | Taste `UHR` gedrückt halten und am Drehknopf drehen                                       |

---

## 1. Die Anlage

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
das Heizungswasser. Den Zusammenhang legt die **Heizkennlinie** fest (Abschnitt 9).
Es gibt **keinen Raumfühler**. Die Drehknöpfe ☀︎ und ☽ verschieben nur die Kennlinie,
die tatsächliche Raumtemperatur ergibt sich aus Kennlinie, Außentemperatur und den
Thermostatventilen an den Heizkörpern.

**Warmwasser hat Vorrang:** Wenn der Speicher aufgeheizt wird, stehen die Heizkörper
so lange still. Das ist normal und dauert meist nur einige Minuten.

**Sicherheit:** Arbeiten am Kessel, Brenner oder an der Elektrik nur durch den
Fachbetrieb. Wartung einmal jährlich. Bei Brennerstörung (rote Störlampe) maximal
einen Neustart über den Entstörknopf am Brenner versuchen, danach Fachbetrieb rufen.

---

## 2. Bedienelemente

![Schaltuhr](docs/bilder/schaltuhr.jpg)

![Bedienfeld der Trimatik-MC aus der Original-Anleitung](docs/bilder/bedienfeld_zeichnung.png)

*Zeichnung des Bedienfelds aus der Original-Anleitung (Trimatik-MC). Das eingebaute Gerät ist gleich aufgebaut, nur die Schaltuhr-Tasten sind anders beschriftet.*

### Symbole auf einen Blick

Links das Symbol aus der Original-Anleitung, daneben das Textzeichen, das in dieser Anleitung dafür steht.
Wo es kein passendes Zeichen gibt, wird der Bildausschnitt verwendet.

| Original | Zeichen | Bedeutung | Wo |
|----------|---------|-----------|----|
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/sonne_hell.png"><img class="sym" src="docs/bilder/symbole/sonne.png" alt="Sonne" title="Normalbetrieb" height="20"></picture> | ☀︎ | **Normalbetrieb** (Tag) | Drehknopf Raumtemperatur Tag, Programmwahlschalter |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/mond_hell.png"><img class="sym" src="docs/bilder/symbole/mond.png" alt="Mond" title="Reduzierter Betrieb" height="20"></picture> | ☽ | **Reduzierter Betrieb** (Nacht, Absenkung) | Drehknopf Raumtemperatur Nacht, Programmwahlschalter, grüne LED |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/schnee_hell.png"><img class="sym" src="docs/bilder/symbole/schnee.png" alt="Schneeflocke" title="Abschaltbetrieb mit Frostschutz" height="20"></picture> | ❄︎ | **Abschaltbetrieb mit Frostschutz** (Heizung aus) | Programmwahlschalter |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture> *(kein Zeichen, Bild)* | **Trinkwassererwärmung** (Warmwasser) | Drehknopf Warmwasser, Programmwahlschalter, rote LED, Kanal `SU2` |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/kanal1_hell.png"><img class="sym" src="docs/bilder/symbole/kanal1.png" alt="Kanal 1" title="Schaltuhrkanal Heizkreis" height="20"></picture> | ▥ | Schaltuhr-Kanal **Heizkreis** | an deinem Gerät `SU1` |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/kanal2_hell.png"><img class="sym" src="docs/bilder/symbole/kanal2.png" alt="Kanal 2" title="Schaltuhrkanal Heizkreis mit Mischer" height="20"></picture> | ✠ | Schaltuhr-Kanal Heizkreis mit Mischer | nur Trimatik-MC, hier nicht vorhanden |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/drehknopf_hell.png"><img class="sym" src="docs/bilder/symbole/drehknopf.png" alt="Drehknopf" title="Einstell-Drehknopf" height="20"></picture> | − / + | Einstell-Drehknopf der Schaltuhr | Werte ändern |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/uhrzeit_hell.png"><img class="sym" src="docs/bilder/symbole/uhrzeit.png" alt="Uhr" title="Uhrzeit" height="20"></picture> | ⏲︎ *(ähnlich)* | Uhrzeit anzeigen / stellen | an deinem Gerät Taste `UHR` |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/wochentag_hell.png"><img class="sym" src="docs/bilder/symbole/wochentag.png" alt="1-7" title="Wochentag" height="20"></picture> | 1-7 | Wochentag anzeigen / stellen | an deinem Gerät Taste `WT` |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/grundeinstellung_hell.png"><img class="sym" src="docs/bilder/symbole/grundeinstellung.png" alt="Grundeinstellung" title="Grundeinstellungstaste – alles zurücksetzen" height="20"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/grundeinstellung_hell.png"><img class="sym" src="docs/bilder/symbole/grundeinstellung.png" alt="Grundeinstellung" title="Grundeinstellungstaste – alles zurücksetzen" height="20"></picture> *(kein Zeichen, Bild)* | Grundeinstellung – **löscht alle Schaltzeiten** | an deinem Gerät Taste `CL` (versenkt) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/abfrage_hell.png"><img class="sym" src="docs/bilder/symbole/abfrage.png" alt="Fragezeichen" title="Abfrage Ist-Temperaturen" height="20"></picture> | ? | Abfrage der Ist-Temperaturen | nur Trimatik-MC, hier nicht vorhanden |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/programmwahlschalter_hell.png"><img class="sym" src="docs/bilder/symbole/programmwahlschalter.png" alt="Programmwahlschalter" title="Programmwahlschalter" height="20"></picture> | ⊏ | Programmwahlschalter (Betriebsprogramm) | unten links neben der Schaltuhr |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/neigung_hell.png"><img class="sym" src="docs/bilder/symbole/neigung.png" alt="Neigung" title="Neigung der Heizkennlinie" height="20"></picture> | ∡ *(ähnlich)* | Neigung der Heizkennlinie | hinter der Abdeckklappe |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/niveau_hell.png"><img class="sym" src="docs/bilder/symbole/niveau.png" alt="Niveau" title="Niveau der Heizkennlinie" height="20"></picture> | ⫽ *(ähnlich)* | Niveau der Heizkennlinie | hinter der Abdeckklappe |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/temperaturregler_hell.png"><img class="sym" src="docs/bilder/symbole/temperaturregler.png" alt="Temperaturregler" title="Temperaturregler (maximale Kesselwassertemperatur)" height="20"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/temperaturregler_hell.png"><img class="sym" src="docs/bilder/symbole/temperaturregler.png" alt="Temperaturregler" title="Temperaturregler (maximale Kesselwassertemperatur)" height="20"></picture> *(kein Zeichen, Bild)* | Temperaturregler, max. Kesselwassertemperatur | hinter der Abdeckklappe, nicht verstellen |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/entsperrung_hell.png"><img class="sym" src="docs/bilder/symbole/entsperrung.png" alt="Entsperrung" title="Entsperrung Übertemperatur" height="20"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/entsperrung_hell.png"><img class="sym" src="docs/bilder/symbole/entsperrung.png" alt="Entsperrung" title="Entsperrung Übertemperatur" height="20"></picture> *(kein Zeichen, Bild)* | Entsperrung Übertemperatur | hinter der Abdeckklappe, nur Fachbetrieb |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/schornsteinfeger_hell.png"><img class="sym" src="docs/bilder/symbole/schornsteinfeger.png" alt="Schornsteinfeger" title="Schornsteinfeger-Prüfschalter" height="20"></picture> | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/schornsteinfeger_hell.png"><img class="sym" src="docs/bilder/symbole/schornsteinfeger.png" alt="Schornsteinfeger" title="Schornsteinfeger-Prüfschalter" height="20"></picture> *(kein Zeichen, Bild)* | Schornsteinfeger-Prüfschalter | rechts, nach der Messung zurückstellen |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/anlagenschalter_hell.png"><img class="sym" src="docs/bilder/symbole/anlagenschalter.png" alt="Anlagenschalter" title="Anlagenschalter" height="20"></picture> | ⏻ | Anlagenschalter `I` ein / `O` aus | rechts oben |

### Schaltuhr (linker Block)

| Am Gerät                       | In der Anleitung (Trimatik-MC) | Funktion                                                                 |
|--------------------------------|--------------------------------|--------------------------------------------------------------------------|
| Anzeige `1 2 3 4 5 6 7` mit ▲   | 1–7                            | Wochentag, ▲ zeigt den aktuellen Tag (1 = Montag … 7 = Sonntag)          |
| Zifferanzeige `18:53`           | –                              | Uhrzeit, beim Programmieren die Schaltzeit, sonst auch Kesseltemperatur  |
| Symbole unten `−  =  ≡  ≣`      | Schaltzeitraum 1 bis 4         | zeigen, welche Schaltzeiträume belegt sind (↑ Beginn, ↓ Ende)             |
| Drehknopf `− ↶↷ +`              | Einstell-Drehknopf             | Werte verändern (Uhrzeit, Schaltzeiten, Wochentag)                        |
| **rote Tasten** (4 Stück)       | rote Taste                     | **Beginn** der Heizzeit („rot“) = Ende der Absenkung („blau“)             |
| **blaue Tasten** (4 Stück)      | blaue Taste                    | **Ende** der Heizzeit („rot“) = Beginn der Absenkung („blau“)             |
| `SU1`                           | Kanal ▥ (Heizkreis)            | Schaltuhr-Kanal 1 = **Heizkreis** *(vermutlich die linken 2 Tastenspalten)* |
| `SU2`                           | Kanal <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture> (Trinkwasser)          | Schaltuhr-Kanal 2 = **Warmwasser** *(vermutlich die rechten 2 Tastenspalten)* |
| `UHR`                           | ⏲︎                              | Uhrzeit anzeigen / stellen                                                |
| `WT`                            | 1-7                            | Wochentag anzeigen / stellen, einzelnen Tag programmieren                 |
| `CL`                            | <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/grundeinstellung_hell.png"><img class="sym" src="docs/bilder/symbole/grundeinstellung.png" alt="Grundeinstellung" title="Grundeinstellungstaste – alles zurücksetzen" height="20"></picture> Grundeinstellungstaste       | **Alles löschen** – setzt alle Schaltzeiten auf Werk (6–22 Uhr) zurück    |

> *(vermutlich)* Die Beschriftung `SU1 | SU2` sitzt mittig unter den vier Tastenspalten.
> Ich lese das so: Spalte 1 + 2 (Symbole `−` und `=`) = zwei Zeiträume für den
> **Heizkreis**, Spalte 3 + 4 (Symbole `≡` und `≣`) = zwei Zeiträume fürs **Warmwasser**.
> Das passt zu „ein oder zwei Zeiträume“. **Prüfen:** Rote Taste der Spalte 1 kurz
> drücken. Erscheint die Einschaltzeit der Heizung (ab Werk `6:00`), stimmt die Zuordnung.

### Drehknöpfe und Schalter (rechter Block)

| Symbol | Name                              | Funktion                                                        | Werk       |
|--------|-----------------------------------|-----------------------------------------------------------------|------------|
| ☀︎      | Normalbetrieb (Tag)               | gewünschte Raumtemperatur tagsüber, 1 Teilstrich ≈ 1 °C          | `N` ≈ 20 °C |
| ☽      | Reduzierter Betrieb (Nacht)       | gewünschte Raumtemperatur bei Absenkung, 1 Teilstrich ≈ 1 °C     | `N` ≈ 14 °C |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>     | Trinkwasser                       | Warmwassertemperatur 32 – 60 °C, `0` = Warmwasser aus            | 50 °C      |
| ⊏ | **Programmwahlschalter**        | Betriebsprogramm, siehe Abschnitt 4                              | ☀︎/❄︎        |
| ∡ (hinter der Klappe) | Neigung Heizkennlinie | 0,2 – 2,6, siehe Abschnitt 9                                     | 1,2        |
| ⫽ (hinter der Klappe) | Niveau Heizkennlinie  | −12 … +33, siehe Abschnitt 9                                     | 0          |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/temperaturregler_hell.png"><img class="sym" src="docs/bilder/symbole/temperaturregler.png" alt="Temperaturregler" title="Temperaturregler (maximale Kesselwassertemperatur)" height="20"></picture> (hinter der Klappe) | Temperaturregler      | maximale Kesselwassertemperatur – **nicht verstellen**           | 75 °C      |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/schornsteinfeger_hell.png"><img class="sym" src="docs/bilder/symbole/schornsteinfeger.png" alt="Schornsteinfeger" title="Schornsteinfeger-Prüfschalter" height="20"></picture> | Schornsteinfeger-Prüfschalter | nur für die Abgasmessung, danach zurückstellen                   | –          |
| ⏻ | Anlagenschalter `I` / `O` | Regelung ein / aus                                               | `I`        |

**Leuchtdioden:** rote LED am <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>-Knopf leuchtet, wenn der Speicher aufgeheizt wird.
Grüne LED am ☽-Knopf leuchtet bei reduziertem Betrieb, Abschaltbetrieb oder
Nur-Warmwasser. Blinken beide zugleich: Programmwahlschalter steht zwischen zwei Rasten.

---

## 3. Wie alles zusammenhängt

Die Regelung kennt vier **Betriebsarten**. Welche gerade aktiv ist, bestimmen zwei Dinge
zusammen: das **Betriebsprogramm** (Programmwahlschalter) und die **Schaltuhr**.

```
                       Programmwahlschalter
                 wählt ein Paar  „rot“ / „blau“
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                           │
   Betriebsart „rot“                          Betriebsart „blau“
   (oberes Symbol)                            (unteres Symbol)
   gilt in den Heizzeiten                     gilt außerhalb der Heizzeiten
   z. B. 6:00 – 22:00                         z. B. 22:00 – 6:00
         │                                           │
         └──────────────┬────────────────────────────┘
                        │
              Schaltuhr `SU1` legt fest,
              WANN „rot“ und WANN „blau“ gilt
                        │
          ┌─────────────┴──────────────┐
    Drehknopf ☀                  Drehknopf ☽
    Raumtemperatur bei           Raumtemperatur bei
    Normalbetrieb                reduziertem Betrieb
          └─────────────┬──────────────┘
                        │
                 Heizkennlinie (Neigung / Niveau)
                 + Außentemperatur
                        │
              Kesselwassertemperatur → Heizkörper
```

### Die vier Betriebsarten

| Symbol | Betriebsart                                  | Was passiert                                                                                                  |
|--------|----------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| ☀︎      | **Normalbetrieb**                            | Heizen auf die Temperatur am ☀︎-Knopf. Warmwasser nach Zeitprogramm `SU2`.                                     |
| ☽      | **Reduzierter Betrieb**                      | Heizen auf die niedrigere Temperatur am ☽-Knopf (Nachtabsenkung). Kein Warmwasser.                            |
| ❄︎      | **Abschaltbetrieb mit Frostschutz**          | Kessel aus. Unter +1 °C außen heizt er im reduzierten Betrieb, über +3 °C wieder aus. Pumpe läuft alle 24 h kurz. Kein Warmwasser. |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>     | **Nur Trinkwassererwärmung**                 | Kessel heizt nur für den Warmwasserspeicher (nach Zeitprogramm `SU2`), Heizkörper bleiben kalt (Frostschutz aktiv). |

**Automatik, die man kennen sollte:**

- **Sommerabschaltung:** Steigt die Außentemperatur um 1 °C über die eingestellte
  Raumtemperatur, schaltet die Heizkreispumpe ab. Sinkt sie wieder 1 °C darunter, geht
  sie an. Im Frühjahr/Herbst schaltet die Heizung dadurch selbstständig zwischendurch ab.
- **Trägheit:** Heizbeginn 6:00 heißt nicht, dass es um 6:00 warm ist. Zeiten so legen,
  dass die Anlage Zeit zum Aufheizen und Abkühlen hat (je nach Haus 1 – 2 Stunden).
- **Untere Kesseltemperatur:** Der Kessel hält im Normalbetrieb eine Mindesttemperatur
  (Korrosionsschutz). Das ist gewollt und nicht einstellbar.

---

## 4. Betriebsprogramm wählen (Programmwahlschalter)

Der Programmwahlschalter hat sechs Rasten. Jede Raste ist ein **Paar**: oberes Symbol =
Betriebsart „rot“ (in den Heizzeiten), unteres Symbol = Betriebsart „blau“ (außerhalb).

![Stellungen des Programmwahlschalters](docs/bilder/programmwahlschalter.png)

*Die sechs Stellungen, Zeichnung aus der Original-Anleitung. Am Gerät ist die obere Reihe rot, die untere blau gedruckt.*

| Stellung (oben/unten) | Bedeutung                                                        | Wann sinnvoll                                                               | Warmwasser |
|-----------------------|------------------------------------------------------------------|-----------------------------------------------------------------------------|------------|
| **❄︎ / ❄︎**             | Dauernd aus, nur Frostschutz. Schaltuhr ohne Wirkung.            | Urlaub im Winter                                                            | nein       |
| **☀︎ / ❄︎**             | Tags Normalbetrieb, nachts **ganz aus** mit Frostschutz. *(Werk)* | Massive Häuser, die nachts kaum auskühlen                                   | ja, nach `SU2` |
| **☀︎ / ☽**             | Tags Normalbetrieb, nachts **abgesenkt**.                         | **Normalfall** – wenn die Räume bei ☀︎/❄︎ morgens zu kalt sind                | ja, nach `SU2` |
| **☀︎ / ☀︎**             | Dauernd Normalbetrieb. Schaltuhr ohne Wirkung.                   | Feiertag, Besuch, Krankheit – danach zurückstellen                          | ja, nach `SU2` |
| **☽ / ☽**             | Dauernd reduziert. Schaltuhr ohne Wirkung.                       | Längere Abwesenheit im Winter, wenn Haus nicht auskühlen soll               | nein       |
| **<picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture> / ❄︎**            | Nur Warmwasser, Heizung aus mit Frostschutz.                     | **Sommer**                                                                  | ja, nach `SU2` |

Einstellen: Schalter einfach auf die gewünschte Raste drehen, wirkt sofort.

---

## 5. Uhrzeit und Wochentag

Uhr und Wochentag laufen mit Gangreserve (Batterie) weiter, auch bei Stromausfall.
Die Anzeige geht bei Stromausfall nur zum Stromsparen aus.

**Uhrzeit anzeigen:** Taste `UHR` kurz drücken.

**Uhrzeit stellen:**

1. Taste `UHR` gedrückt halten.
2. Gleichzeitig am Drehknopf drehen, bis die richtige Zeit steht (`−` zurück, `+` vor).
3. Taste loslassen.

**Wochentag stellen:**

1. Taste `WT` gedrückt halten.
2. Am Drehknopf drehen, bis ▲ unter der richtigen Ziffer steht (1 = Mo … 7 = So).
3. Taste loslassen.

**Sommer-/Winterzeit:** Laut Anleitung stellt die Uhr automatisch um. Das Gerät ist von
etwa 1995. Damals endete die Sommerzeit noch Ende **September**, seit 1996 Ende Oktober.
**Nach jeder Zeitumstellung die Uhrzeit kontrollieren** und bei Bedarf von Hand stellen.

---

## 6. Heizzeiten einstellen (Schaltuhr)

### Grundprinzip

- Pro Kanal (`SU1` Heizkreis, `SU2` Warmwasser) und Tag gibt es **Schaltzeiträume**.
  Ein Schaltzeitraum ist eine Heizphase: **rote Taste = Beginn**, **blaue Taste = Ende**.
- Innerhalb eines Schaltzeitraums gilt die Betriebsart „rot“ (oberes Symbol am
  Programmwahlschalter), außerhalb die Betriebsart „blau“ (unteres Symbol).
- Die Trimatik-MC kann bis zu 4 Zeiträume pro Kanal. Am eingebauten Gerät sind es
  *(vermutlich)* **2 Zeiträume pro Kanal**, jeder mit eigener roter und blauer Taste.
- Eine Änderung gilt **für alle Wochentage**, solange alle sieben ▲-Pfeile angezeigt
  werden. Einzelne Tage siehe unten.

**Werkseinstellung:** ein Zeitraum täglich **6:00 – 22:00** auf jedem Kanal.

### Einen Zeitraum einstellen (z. B. 5:30 – 22:30)

1. Prüfen, dass alle sieben Wochentagspfeile ▲ angezeigt werden
   (sonst gilt die Änderung nur für einen Tag).
2. **Rote Taste** des Zeitraums 1 (Spalte `−`) gedrückt halten und am Drehknopf drehen,
   bis `5:30` erscheint. Loslassen.
3. **Blaue Taste** des Zeitraums 1 gedrückt halten und drehen, bis `22:30` erscheint.
   Loslassen.

Fertig. Die Heizung läuft jetzt täglich 5:30 – 22:30 in Betriebsart „rot“, sonst „blau“.

### Zwei Zeiträume (z. B. 5:30 – 8:30 und 16:00 – 22:30)

Sinnvoll, wenn tagsüber niemand zu Hause ist.

1. Zeitraum 1 wie oben: rot `5:30`, blau `8:30`.
2. Zeitraum 2 (Spalte `=`): **rote Taste** halten, drehen bis `16:00`.
   **Blaue Taste** halten, drehen bis `22:30`.

Ergebnis: 0:00 – 5:30 „blau“, 5:30 – 8:30 „rot“, 8:30 – 16:00 „blau“,
16:00 – 22:30 „rot“, 22:30 – 24:00 „blau“.

> Trimatik-MC (laut Original-Anleitung): Dort gibt es pro Kanal nur ein Tastenpaar.
> Den zweiten Zeitraum erreicht man, indem man rote **und** blaue Taste gleichzeitig
> drückt (Anzeige `1`), innerhalb von 5 Sekunden am Drehknopf nach rechts auf `2` dreht
> und dann wie oben rot/blau einstellt. Für den 3. und 4. Zeitraum entsprechend.

### Einen Zeitraum wieder loswerden

Rote und blaue Zeit des Zeitraums auf dieselbe Uhrzeit stellen (Länge null), oder den
Zeitraum in den anderen hineinlegen. Alternativ alles zurücksetzen mit `CL`
(siehe unten) und neu einstellen.

### Einzelne Wochentage anders (z. B. Wochenende länger schlafen)

1. Taste `WT` gedrückt halten und am Drehknopf drehen, bis der **blinkende** Pfeil ▲ auf
   dem gewünschten Tag steht (z. B. `6` = Samstag). Loslassen.
2. Jetzt wie oben mit roter/blauer Taste die Zeiten einstellen. Sie gelten nur für
   diesen Tag.
3. Für Sonntag wiederholen (`7`).
4. Nach 1 – 2 Minuten ohne Eingabe springt der Pfeil auf den aktuellen Tag zurück.

Sobald ein Tag abweicht, werden nicht mehr alle sieben Pfeile dauerhaft angezeigt.
Soll wieder **jeder Tag gleich** laufen, hilft nur `CL` und komplettes Neueinstellen.

### Warmwasser-Zeiten (`SU2`)

Genauso wie beim Heizkreis, nur mit den Tasten des Kanals `SU2`. Innerhalb der
Zeiträume wird der Speicher auf die Temperatur am <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>-Knopf nachgeheizt, außerhalb nicht.
Beispiel sparsam: 5:30 – 8:00 und 17:00 – 21:00. Wer jederzeit Warmwasser will, lässt
die Werkseinstellung 6:00 – 22:00 oder stellt 0:00 – 24:00.

### Alles zurücksetzen (`CL`)

Die Taste `CL` ist versenkt eingebaut, damit man sie nicht aus Versehen drückt.
Sie löscht **alle Schaltzeiten auf allen Kanälen und allen Tagen** und setzt sie auf
6:00 – 22:00 zurück. Uhrzeit und Wochentag bleiben erhalten. Danach sind wieder alle
sieben Pfeile sichtbar. Vorher die eigenen Zeiten notieren (Abschnitt 13).

---

## 7. Raumtemperatur einstellen

Es gibt keinen Raumfühler. Die Knöpfe verschieben die Heizkennlinie, der Effekt stellt
sich **verzögert** ein (je nach Haus mehrere Stunden bis einen Tag). Immer nur in kleinen
Schritten verstellen und abwarten.

### Tagsüber (Normalbetrieb ☀︎)

- Stellung `N` entspricht etwa **20 °C** Raumtemperatur bei richtig eingestellter
  Heizkennlinie.
- Jeder Teilstrich ≈ **1 °C**. Richtung `+` wärmer, Richtung `−` kälter.
- Wenn die Räume **immer** zu kalt oder zu warm sind, egal wie das Wetter ist, ist
  der ☀︎-Knopf der richtige Hebel. Wenn es nur bei bestimmtem Wetter nicht passt,
  siehe Heizkennlinie (Abschnitt 9).

### Nachts / Absenkung (reduzierter Betrieb ☽)

- Stellung `N` entspricht etwa **14 °C**.
- Jeder Teilstrich ≈ **1 °C**.
- Wirkt nur, wenn die „blaue“ Betriebsart ☽ ist, also bei Programm ☀︎/☽ oder ☽/☽.
  Bei ☀︎/❄︎ ist die Heizung nachts ganz aus, der ☽-Knopf wirkt dann nur beim Frostschutz.
- Bleibt es nachts trotzdem warm, liegt das meist an der Speichermasse des Hauses,
  nicht an der Regelung. Dann ☽ niedriger stellen oder die Heizzeit früher enden lassen.

### Thermostatventile

Die Heizkörperthermostate begrenzen zusätzlich. Die Regelung liefert nur die Vorlauf-
temperatur. Ist ein Raum zu kalt, erst prüfen, ob das Ventil ganz offen ist, bevor an
der Regelung gedreht wird. Umgekehrt: Räume, die zu warm werden, am Thermostat
drosseln statt die ganze Anlage kälter zu stellen.

---

## 8. Warmwasser

- Drehknopf <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>: Bereich **32 – 60 °C**, Normalstellung **50 °C**, ein Teilstrich ≈ 2 °C.
- Stellung `0` = Warmwasserbereitung aus.
- Der Speicher wird nur innerhalb der `SU2`-Zeiten nachgeheizt und nur in den
  Betriebsprogrammen mit Warmwasser (siehe Tabelle in Abschnitt 4).
- Während der Speicherladung leuchtet die rote LED, die Heizkörper bekommen so lange
  keine Wärme (Speichervorrang).
- Empfehlung: 50 – 55 °C. Darunter steigt das Legionellenrisiko, darüber wird
  es unnötig teuer und der Speicher verkalkt schneller.

---

## 9. Heizkennlinie (Neigung und Niveau)

> 📈 **Ausführliche Anleitung zur Heizkurve mit interaktivem Rechner:**
> <https://matzeknusper.github.io/Anleitung-Heizung-/heizkurve/>

Die Heizkennlinie bestimmt, wie heiß das Heizungswasser bei welcher Außentemperatur
wird. Sie wird bei der Inbetriebnahme vom Fachbetrieb eingestellt und muss danach
normalerweise nicht mehr verändert werden. Die Knöpfe sitzen hinter der Abdeckklappe.

| Knopf   | Bereich     | Werk | Wirkung                                                                 |
|---------|-------------|------|-------------------------------------------------------------------------|
| Neigung | 0,2 – 2,6   | 1,2  | Wie **steil** die Kurve ist: wie stark das Wasser bei Kälte heißer wird |
| Niveau  | −12 … +33   | 0    | Verschiebt die ganze Kurve **parallel** nach oben / unten (in °C)       |

Richtwerte für die Neigung: gut gedämmtes Haus in geschützter Lage ≈ 1,0, freie Lage
oder ältere Anlage mit Heizkörpern ≈ 1,2. Niedertemperaturheizungen liegen im Bereich
0,8 – 1,4. Fußbodenheizung 0,2 – 0,8.

### Wann was verstellen

| Problem                                                              | Abhilfe                                                               |
|----------------------------------------------------------------------|-----------------------------------------------------------------------|
| Im **tiefen Winter** zu kalt, in der Übergangszeit in Ordnung         | **Neigung** einen Schritt **höher**                                   |
| Im **tiefen Winter** zu warm, in der Übergangszeit in Ordnung         | **Neigung** einen Schritt **niedriger**                               |
| In der **Übergangszeit** zu kalt, im tiefen Winter in Ordnung         | **Niveau** etwas **höher**, dann **Neigung** einen Schritt niedriger  |
| In der **Übergangszeit** zu warm, im tiefen Winter in Ordnung         | **Niveau** etwas **niedriger**, dann **Neigung** einen Schritt höher  |
| **Immer** zu kalt / zu warm, bei jedem Wetter                         | nicht die Kennlinie, sondern den **☀︎-Knopf** verstellen (Abschnitt 7) |

Immer nur einen Schritt ändern und ein bis zwei Tage beobachten.

**Obergrenze:** Die Kesselwassertemperatur ist auf 75 °C begrenzt (Temperaturregler
hinter der Klappe und elektronische Begrenzung). Diese Einstellung nicht verändern.

---

## 10. Urlaub, Sommer, Abschalten

**Sommer:** Programmwahlschalter auf **<picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>/❄︎**. Kessel läuft nur noch für Warmwasser.
Im Herbst zurück auf ☀︎/☽ (oder ☀︎/❄︎).

**Urlaub im Winter:** Programmwahlschalter auf **❄︎/❄︎**. Anlage **eingeschaltet lassen**.
Der Frostschutz schaltet den Kessel bei Außentemperaturen unter +1 °C selbstständig ein,
alle Schaltzeiten bleiben gespeichert. Bei Rückkehr einfach zurückdrehen.

**Urlaub im Sommer:** Programmwahlschalter auf **❄︎/❄︎**, dann wird auch kein Warmwasser
bereitet. Nach der Rückkehr dauert es etwa eine Stunde, bis der Speicher warm ist.

**Ganz abschalten (nur für Servicearbeiten):**

1. Anlagenschalter an der Regelung auf `O`.
2. Hauptschalter (Not-Aus außerhalb des Heizraums) ausschalten.

Dann gibt es **keinen Frostschutz** mehr. Die Uhr läuft dank Gangreserve weiter,
die Anzeige ist dunkel.

**Schornsteinfeger:** Der Prüfschalter hinter der Klappe zwingt den Brenner für die
Messung auf Dauerbetrieb mit hoher Temperatur. Nach der Messung **unbedingt
zurückstellen**, sonst läuft der Kessel dauerhaft heiß.

---

## 11. Was tun, wenn …

| Beobachtung                                              | Mögliche Ursache                                  | Abhilfe                                                                                   |
|----------------------------------------------------------|---------------------------------------------------|-------------------------------------------------------------------------------------------|
| Anlage tut gar nichts, Anzeige dunkel                     | Anlagenschalter auf `O`, Hauptschalter aus, Sicherung | Anlagenschalter auf `I`, Hauptschalter prüfen, Sicherung prüfen, sonst Fachbetrieb       |
| Heizkörper kalt, obwohl Heizzeit                          | Programmwahlschalter falsch (❄︎/❄︎, <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>/❄︎), Schaltzeit falsch, Uhr falsch | Programm, Uhrzeit, Wochentag und Schaltzeiten kontrollieren                  |
| Heizkörper kalt, rote LED <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture> leuchtet                     | Speicher wird gerade geladen (Vorrang)            | Abwarten, nach einigen Minuten läuft die Heizung weiter                                   |
| Heizkörper kalt, draußen mild                             | Sommerabschaltung (Außentemperatur über Raumsoll) | Normal. Bei Bedarf ☀︎-Knopf höher                                                         |
| Rote Störlampe am Brenner / an der Regelung               | Brenner hat nicht gezündet                        | Einmal Entstörknopf am Brenner drücken. Erneut Störung: Fachbetrieb. Ölstand prüfen       |
| Grüne LED ☽ und rote LED <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture> **blinken**                    | Programmwahlschalter steht zwischen zwei Rasten   | Schalter sauber auf eine Raste drehen                                                     |
| Morgens zu kalt, abends passt es                          | Heizbeginn zu spät                                | Rote Zeit von `SU1` früher stellen                                                        |
| Nachts zu warm                                            | Absenkung wirkt nicht (Programm ☀︎/☀︎?) oder träges Haus | Programm ☀︎/☽ oder ☀︎/❄︎, ☽-Knopf niedriger, Heizende früher                            |
| Kein Warmwasser                                           | Programm ❄︎/❄︎ oder ☽/☽, `SU2`-Zeit vorbei, <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>-Knopf auf `0` | Programm prüfen, `SU2`-Zeiten prüfen, <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>-Knopf auf 50                                |
| Uhrzeit stimmt nach Zeitumstellung nicht                   | Alte Sommerzeitregel im Gerät                      | Uhrzeit von Hand stellen (Abschnitt 5)                                                    |

Bei allem anderen: Fachbetrieb anrufen. Nichts am Brenner, an der Elektrik oder an
den Begrenzern hinter der Klappe verändern.

---

## 12. Energiespartipps

- **Heizzeiten eng fassen.** Nur heizen, wenn jemand da ist. Zwei Zeiträume nutzen,
  wenn tagsüber niemand zu Hause ist.
- **Nicht überheizen.** Jedes Grad weniger Raumtemperatur spart etwa 6 % Heizkosten.
  20 °C Wohnräume, 17 – 18 °C Schlafzimmer reichen meist.
- **Nachtabsenkung nutzen** (Programm ☀︎/☽) statt nachts durchzuheizen. Bei massiven
  Häusern kann ☀︎/❄︎ (nachts aus) noch sparsamer sein, wenn es morgens nicht zu kalt wird.
- **Sommer: auf <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture>/❄︎.** Dann läuft der Kessel nur für Warmwasser.
- **Warmwasser-Zeiten begrenzen** und 50 – 55 °C einstellen.
- **Stoßlüften** mit ganz geöffnetem Fenster, dabei Thermostate zudrehen.
  Keine Dauerkippstellung.
- **Heizkörper freihalten**, Rollläden bei Dunkelheit schließen.
- **Heizkennlinie so flach wie möglich** (Abschnitt 9). Jede Senkung der Vorlauf-
  temperatur spart Brennstoff, solange es noch warm genug wird.
- **Jährliche Wartung** durch den Fachbetrieb (Brennereinstellung, Reinigung).

---

## 13. Meine Einstellungen (zum Eintragen)

### Drehknöpfe

| Knopf                 | Eingestellt am | Wert |
|-----------------------|----------------|------|
| Programmwahlschalter  |                |      |
| ☀︎ Tag                 |                |      |
| ☽ Nacht               |                |      |
| <picture><source media="(prefers-color-scheme: dark)" srcset="docs/bilder/symbole/hahn_hell.png"><img class="sym" src="docs/bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung (Warmwasser)" height="20"></picture> Warmwasser         |                |      |
| Neigung               |                |      |
| Niveau                |                |      |

### Schaltzeiten Heizkreis `SU1`

| Tag      | Zeitraum 1 rot (Beginn) | Zeitraum 1 blau (Ende) | Zeitraum 2 rot (Beginn) | Zeitraum 2 blau (Ende) |
|----------|-------------------------|------------------------|-------------------------|------------------------|
| alle Tage |                        |                        |                         |                        |
| 1 Mo     |                         |                        |                         |                        |
| 2 Di     |                         |                        |                         |                        |
| 3 Mi     |                         |                        |                         |                        |
| 4 Do     |                         |                        |                         |                        |
| 5 Fr     |                         |                        |                         |                        |
| 6 Sa     |                         |                        |                         |                        |
| 7 So     |                         |                        |                         |                        |

### Schaltzeiten Warmwasser `SU2`

| Tag      | Zeitraum 1 rot (Beginn) | Zeitraum 1 blau (Ende) | Zeitraum 2 rot (Beginn) | Zeitraum 2 blau (Ende) |
|----------|-------------------------|------------------------|-------------------------|------------------------|
| alle Tage |                        |                        |                         |                        |
| 1 Mo     |                         |                        |                         |                        |
| 2 Di     |                         |                        |                         |                        |
| 3 Mi     |                         |                        |                         |                        |
| 4 Do     |                         |                        |                         |                        |
| 5 Fr     |                         |                        |                         |                        |
| 6 Sa     |                         |                        |                         |                        |
| 7 So     |                         |                        |                         |                        |

---

*Quelle: Viessmann Betriebsanleitung Trimatik-MC, Best.-Nr. 7450 263, 5581 083 (3/95),
gekürzt und auf das eingebaute Gerät bezogen. Foto des Bedienfelds und Symbole siehe `docs/bilder/`.*
