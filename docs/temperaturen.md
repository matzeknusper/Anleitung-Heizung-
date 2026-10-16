# Temperaturen

## Raumtemperatur einstellen

Es gibt keinen Raumfühler. Die Knöpfe verschieben die Heizkennlinie, der Effekt stellt
sich **verzögert** ein (je nach Haus mehrere Stunden bis einen Tag). Immer nur in kleinen
Schritten verstellen und abwarten.

### Tagsüber (Normalbetrieb)

- Stellung `N` entspricht etwa **20 °C** Raumtemperatur bei richtig eingestellter
  Heizkennlinie.
- Jeder Teilstrich ≈ **1 °C**. Richtung `+` wärmer, Richtung `−` kälter.
- Wenn die Räume **immer** zu kalt oder zu warm sind, egal wie das Wetter ist, ist
  der <img class="sym" src="../bilder/symbole/sonne.png" alt="Sonne" title="Normalbetrieb (Tag)" height="20">-Knopf der richtige Hebel. Wenn es nur bei bestimmtem Wetter nicht passt,
  siehe Heizkennlinie ([Heizkennlinie (Neigung und Niveau)](temperaturen.md#heizkennlinie-neigung-und-niveau)).

### Nachts / Absenkung (reduzierter Betrieb)

- Stellung `N` entspricht etwa **14 °C**.
- Jeder Teilstrich ≈ **1 °C**.
- Wirkt nur, wenn die „blaue“ Betriebsart <img class="sym" src="../bilder/symbole/mond.png" alt="Mond" title="Reduzierter Betrieb (Nacht)" height="20"> ist, also bei Programm <img class="sym col" src="../bilder/symbole/sonne_rot.png" alt="Sonne" title="Normalbetrieb (Tag) – „rot“, in den Heizzeiten" height="20">/<img class="sym col" src="../bilder/symbole/mond_blau.png" alt="Mond" title="Reduzierter Betrieb (Nacht) – „blau“, außerhalb der Heizzeiten" height="20"> oder <img class="sym col" src="../bilder/symbole/mond_rot.png" alt="Mond" title="Reduzierter Betrieb (Nacht) – „rot“, in den Heizzeiten" height="20">/<img class="sym col" src="../bilder/symbole/mond_blau.png" alt="Mond" title="Reduzierter Betrieb (Nacht) – „blau“, außerhalb der Heizzeiten" height="20">.
  Bei <img class="sym col" src="../bilder/symbole/sonne_rot.png" alt="Sonne" title="Normalbetrieb (Tag) – „rot“, in den Heizzeiten" height="20">/<img class="sym col" src="../bilder/symbole/schnee_blau.png" alt="Schneeflocke" title="Abschaltbetrieb mit Frostschutz – „blau“, außerhalb der Heizzeiten" height="20"> ist die Heizung nachts ganz aus, der <img class="sym" src="../bilder/symbole/mond.png" alt="Mond" title="Reduzierter Betrieb (Nacht)" height="20">-Knopf wirkt dann nur beim Frostschutz.
- Bleibt es nachts trotzdem warm, liegt das meist an der Speichermasse des Hauses,
  nicht an der Regelung. Dann <img class="sym" src="../bilder/symbole/mond.png" alt="Mond" title="Reduzierter Betrieb (Nacht)" height="20"> niedriger stellen oder die Heizzeit früher enden lassen.

### Thermostatventile

Die Heizkörperthermostate begrenzen zusätzlich. Die Regelung liefert nur die Vorlauf-
temperatur. Ist ein Raum zu kalt, erst prüfen, ob das Ventil ganz offen ist, bevor an
der Regelung gedreht wird. Umgekehrt: Räume, die zu warm werden, am Thermostat
drosseln statt die ganze Anlage kälter zu stellen.


## Warmwasser

- Drehknopf <img class="sym" src="../bilder/symbole/hahn.png" alt="Wasserhahn" title="Trinkwassererwärmung" height="20">: Bereich **32 – 60 °C**, Normalstellung **50 °C**, ein Teilstrich ≈ 2 °C.
- Stellung `0` = Warmwasserbereitung aus.
- Der Speicher wird nur innerhalb der `SU2`-Zeiten nachgeheizt und nur in den
  Betriebsprogrammen mit Warmwasser (siehe Tabelle in [Betriebsprogramm wählen (Programmwahlschalter)](bedienung.md#betriebsprogramm-wahlen-programmwahlschalter)).
- Während der Speicherladung leuchtet die rote LED, die Heizkörper bekommen so lange
  keine Wärme (Speichervorrang).
- Empfehlung: 50 – 55 °C. Darunter steigt das Legionellenrisiko, darüber wird
  es unnötig teuer und der Speicher verkalkt schneller.


## Heizkennlinie (Neigung und Niveau)

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
| **Immer** zu kalt / zu warm, bei jedem Wetter                         | nicht die Kennlinie, sondern den **<img class="sym" src="../bilder/symbole/sonne.png" alt="Sonne" title="Normalbetrieb (Tag)" height="20">-Knopf** verstellen ([Raumtemperatur einstellen](temperaturen.md#raumtemperatur-einstellen)) |

Immer nur einen Schritt ändern und ein bis zwei Tage beobachten.

**Obergrenze:** Die Kesselwassertemperatur ist auf 75 °C begrenzt (Temperaturregler
hinter der Klappe und elektronische Begrenzung). Diese Einstellung nicht verändern.
