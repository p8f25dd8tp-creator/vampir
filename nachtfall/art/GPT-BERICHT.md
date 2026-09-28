# My Vampire System – vollständiger Game- und Art-Director-Bericht

## 1. Ziel und Gesamturteil

Dieser Bericht fasst die Analyse der 13 bereitgestellten Screens und die bisher festgelegte Spielrichtung zusammen. Er soll als verbindliche Grundlage für den weiteren Umbau des bestehenden Prototyps dienen.

Das Zielbild ist:

> Ein düsteres 2.5D-Echtzeit-Action-Roguelite für Mobile und PC, in dem eine kanonische Storywelt mit festen Gegnerstärken auf heldenspezifische permanente Entwicklung und kurzfristig variable Runs trifft.

Der Prototyp ist nicht grundsätzlich falsch. Er besitzt bereits:

- eine erkennbare Farb- und Rahmenwelt,
- einen funktionierenden Survivor-Grundloop,
- eine nachvollziehbare Kampagnenstruktur,
- Finn und weitere Charaktere,
- Evolutionen,
- Schmiede,
- System,
- Aufgaben,
- Boss-Turm,
- Endlos,
- und eine brauchbare Grundlage für Fraktion und Prüfungen.

Das Hauptproblem ist, dass diese Teile noch nicht zu einem einheitlichen Spiel verbunden sind. Die UI ist teilweise weiter als die Gameplay-Präsentation, das System ist zu klein für seine Bedeutung, die Progression ist nicht sauber getrennt und einige Menüs überschneiden sich.

Der nächste Schritt ist deshalb nicht, möglichst viele neue Screens zu produzieren. Zuerst müssen Daten, Progression, Lore-Zeitlinie, Navigation und Verantwortlichkeiten der Systeme geklärt werden. Danach werden die Screens gezielt neu gebaut.

---

## 2. Die wichtigsten Designentscheidungen

### 2.1 Mobile-first, aber PC-ready

Das Spiel soll auf Mobile und PC funktionieren. Mobile ist die erste Zielplattform, weil der Echtzeit-Survivor-Loop mit Bewegung und automatischen Angriffen hervorragend zu Touch passt. Die Architektur darf aber nicht so gebaut werden, dass die PC-Version nur eine vergrößerte Handyansicht wird.

Gemeinsame Elemente:

- Story,
- Gegnerwerte,
- Helden,
- Fähigkeiten,
- Progression,
- Saves,
- Belohnungen,
- Modi.

Plattformabhängige Elemente:

- Eingabe,
- Layout,
- Informationsdichte,
- Grafikqualität,
- Navigation,
- Tooltips.

Mobile:

- Landscape als primäre Ausrichtung,
- große Touch-Flächen,
- virtueller Joystick oder Drag-Bewegung,
- wichtige Informationen in klaren Tabs,
- wenig Kleinsttext.

PC:

- WASD, Maus und optional Controller,
- Hover-Tooltips,
- mehr Panels nebeneinander,
- höhere Partikel- und Schattenqualität,
- kompaktere Navigation,
- größere Charakter- und Systemdarstellung.

Die Oberfläche benötigt responsive Layout-Modi für Mobile Compact, Tablet und Desktop. Keine festen Einauflösungs-Layouts und keine hart codierten Einzelpositionen.

### 2.2 Vier Ebenen der Progression

Run-Progression:

- temporäres Level,
- temporäre Skills,
- Skillstufen,
- Buffs,
- Synergien,
- Fusionen,
- Run-Gegenstände.

Helden-Progression:

- eigene Fähigkeiten,
- Formen,
- Meisterschaft,
- heldenspezifische Ausrüstung,
- Titel,
- Story-Meilensteine,
- individuelle Entwicklung.

Story-Progression:

- Formen,
- Fähigkeiten,
- Orte,
- Gegner,
- Beziehungen,
- Fraktionen,
- Ereignisse,
- erreichbare Macht.

Account- oder Meta-Progression:

- neue Modi,
- Schmiede,
- Codex,
- Bestiarium,
- Fraktion,
- Komfortfunktionen,
- zusätzliche Systembereiche,
- kosmetische Inhalte.

Finns Entwicklung darf Peter nicht automatisch stark machen. Peter muss unabhängig von Finn starten und seine eigene kanonische Entwicklung durchlaufen.

### 2.3 Keine dynamische Anpassung der Storygegner

Gegner und Bosse bekommen feste Werte:

- Leben,
- Schaden,
- Geschwindigkeit,
- Resistenzen,
- Verhalten,
- Power Tier,
- Belohnung,
- Storyzeitpunkt,
- empfohlene Heldenstufe.

Ein Gegner der Militärakademie bleibt ein Gegner der Militärakademie. Finn darf ihn später dominieren. Peter darf beim ersten Spiel mit ihm Schwierigkeiten haben. Genau dadurch fühlt sich die Entwicklung echt an.

### 2.4 Kanon vor Erfindung

Das vollständige Buchwissen und die Story-Bible bilden die Grundlage. Kanon, Interpretation und Gameplay-Vorschlag müssen getrennt werden.

Jede lorebezogene Entität erhält einen Status:

- VERIFIED,
- PARTIALLY_VERIFIED,
- UNVERIFIED,
- GAMEPLAY_PROPOSAL.

Nicht verifizierte Inhalte dürfen nicht als kanonische Release-Inhalte ausgegeben werden. Technische Spielmechanik darf ergänzt werden, muss aber als Spielmechanik erkennbar sein.

---

## 3. Fundament: Lore- und Spieldaten

Vor dem weiteren Ausbau muss eine zentrale Datenbasis entstehen.

Benötigte Bereiche:

- characters,
- forms,
- abilities,
- skills,
- evolutions,
- factions,
- locations,
- story_arcs,
- story_events,
- stages,
- enemies,
- bosses,
- items,
- equipment,
- beast_crystals,
- titles,
- system_features,
- relationships,
- power_tiers,
- canonical_limits,
- verification_sources.

Technik und Inhalt werden getrennt. Das Combat-System kennt beispielsweise projectile, melee_arc, aura, summon, dash, status_effect und evolution_trigger. Die Lore-Daten sagen, welche dieser technischen Bausteine Blutwisch, Blutspray, Schattenflammen oder Qi-Handfläche darstellen.

Für jeden spielbaren Charakter wird eine Power-Timeline benötigt:

| Storypunkt | Form | Fähigkeiten | Machtbereich | sinnvolle Gegnerklasse |
|---|---|---|---|---|
| Anfang | Mensch | kanonisch bestätigte Startfähigkeiten | sehr niedrig | Schüler / schwache Akademiegegner |
| Buch erwacht | Halbling | erste bestätigte Fähigkeiten | niedrig | frühe Akademiegegner |
| spätere Storyphase | Vampir | bestätigte Blut-, Schatten- oder Qi-Fähigkeiten | mittel | stärkere Elitegegner |
| spätere Storyphase | höhere bestätigte Form | bestätigte Kombinationen | hoch | Bosse der jeweiligen Phase |

Die konkreten Inhalte müssen aus dem Buchwissen kommen. Fehlende Daten dürfen nicht einfach durch Fantasie ersetzt werden.

### Datenvalidierung

Die Anwendung benötigt automatisierte Prüfungen für:

- fehlende Namen,
- fehlende IDs,
- fehlende Icons,
- nicht existierende Referenzen,
- widersprüchliche Storyzeitpunkte,
- ungültige Freischaltbedingungen,
- Formen vor ihrer Storyfreischaltung,
- Skills ohne Daten,
- undefined,
- null in sichtbaren Texten.

Bei Fehlern soll der Entwicklungsmodus verständliche Meldungen ausgeben. In der Spieleroberfläche darf niemals undefined erscheinen.

---

## 4. Screen-Analyse

## 4.1 Kampagne und Hauptmenü

### Ist-Zustand

Der Kampagnenscreen hat bereits:

- eine obere Profil- und Ressourcenleiste,
- Schnellzugänge,
- schwebende Orte,
- einen unteren Etappenbereich,
- Startschaltfläche,
- Stufen 1 bis 14,
- Storytitel und kurze Beschreibung.

Die Grundidee ist brauchbar. Die Rahmen und Farben tragen die Welt. Die Kampagne wirkt allerdings wie eine Mischung aus Weltkarte und separater Stufenliste.

### Probleme

- zu viel freie Fläche ohne erzählerische Funktion,
- die Low-Poly-Orte sind einfacher als die UI,
- die 14 Etappen wirken wie ein Grid statt wie eine Reise,
- Storyziel und aktueller Ort sind nicht dominant genug,
- verschlossene Inhalte erklären zu wenig,
- die Hauptnavigation ist auf Desktop zu groß,
- Familie ist als zentraler Bereich nicht mehr passend.

### Ziel

Die Kampagne wird zu einer Storyreise:

- Storybogen,
- aktueller Ort,
- aktuelles Ziel,
- sichtbarer Weg,
- unterschiedliche Ereignis-Nodes,
- klare Belohnungen,
- Boss- und Eliteknoten,
- Dialog- und Entdeckungsknoten.

Beispiel:

~~~text
ETAPPE I – DIE MILITÄRAKADEMIE

01 Buch der Eltern
→ 02 Erste Nacht
→ Dialog
→ Elite
→ Entdeckung
→ Boss
~~~

Die Kampagne soll nicht nur sagen, welches Level als Nächstes startet. Sie soll zeigen, wohin Finn reist und warum.

## 4.2 Aufgaben

Der Aufgabenbereich ist verständlich, aber zu leer und vermischt verschiedene Zwecke.

Fehlend oder zu schwach:

- eindeutiger Zurück-Button,
- Alle-abholen-Funktion,
- Reset-Timer,
- Wochenaufgaben,
- sichtbare Belohnungspriorität,
- klare Trennung zwischen Aufgabe und Modus.

Aufgaben sollten kein eigener gleichwertiger Hauptbereich sein, sondern ein Overlay, Panel oder Kontextzugang.

Kategorien:

- täglich,
- wöchentlich,
- Story,
- Held,
- Fraktion,
- System.

Jede Aufgabe zeigt Fortschritt, Belohnung, Status, Restzeit und Abholaktion.

Globale UI-Regel:

> Jede Unterseite besitzt oben links einen sichtbaren Zurückweg. Kein Screen darf eine Sackgasse sein.

## 4.3 Boss-Turm

Der Boss-Turm wirkt aktuell wie eine Startkarte neben Endlos. Er braucht eine eigene Identität und echte Stockwerke.

Anzeigen:

- aktuelles Stockwerk,
- Boss-Portrait,
- Name,
- feste Werte,
- Modifikatoren,
- empfohlene Stärke,
- Belohnung,
- Bestleistung,
- sichtbarer Weg nach oben.

Beispiel:

~~~text
BOSS-TURM
STOCKWERK 17

Boss: Bestie XY
Modifikator: Blutheilung reduziert
Belohnung: Königskristall + Seelen
Bestleistung: 16
~~~

Alle fünf oder zehn Stockwerke können besondere Bossmeilensteine enthalten. Der Modus darf nicht nur wie eine verlängerte Kampagnenetappe wirken.

## 4.4 Endlos

Die aktuelle klassische Nacht ist ein guter Prototyp. Langfristig braucht Endlos aber eine eigene Entscheidungsschleife.

Vorschlag:

- alle paar Minuten wird die Nacht gefährlicher,
- Eliten und zusätzliche Bosswellen erscheinen,
- Spieler wählen Modifikatoren,
- höheres Risiko erhöht den Belohnungsmultiplikator,
- Rekorde werden separat gespeichert,
- Endlos erhält eigene Belohnungen.

Beispiele:

- Gegner erhalten mehr Leben,
- Eliten erscheinen früher,
- Gegner explodieren beim Tod,
- Heilung ist reduziert,
- doppelte Bosswellen,
- Sichtweite ist eingeschränkt,
- bestimmte Skillfamilien sind geschwächt.

Das ist eine Regel des Endlosmodus, kein globales Scaling der Storywelt.

## 4.5 Pausenmenü

Der Pausenscreen ist optisch bereits gut. Die Informationshierarchie muss sich ändern. Aktuell nehmen mögliche Fusionen zu viel Raum ein.

Neue Reihenfolge:

1. Dein Build,
2. Run-Stats,
3. mögliche Fusionen,
4. Weiter,
5. Lauf aufgeben.

Anzeigen:

- sechs Skill-Slots,
- Skillname,
- Level,
- wichtige Werte,
- passive Effekte,
- freie Slots,
- aktuelle Form,
- temporäre Modifikatoren.

„Lauf aufgeben“ bleibt klar getrennt und erhält eine Bestätigung.

## 4.6 Helden

### Ist-Zustand

Das Charakterraster funktioniert. Finn ist klar ausgewählt, andere Figuren sind abgedunkelt und erzeugen Interesse. Die Namen sind als Grundlage gut.

### Probleme

- Finns Identität steckt zu sehr in einem Textblock,
- die Seite ist vertikal zu lang,
- aktuelle Form und Kampfstil werden nicht schnell genug sichtbar,
- gesperrte Charaktere erklären ihre Freischaltung nicht genug,
- Formenliste, Storystatus und Run-Regel vermischen sich,
- undefined wird angezeigt.

### Ziel

Oben:

- großes Artwork oder Modell,
- Name,
- Spezies,
- aktuelle Form,
- Storystatus,
- Rolle,
- Kampfstil.

Tabs:

- Übersicht,
- Formen,
- Fähigkeiten,
- Meisterschaft,
- Ausrüstung,
- Lore.

Der Screen muss sich wie ein Charakterraum anfühlen, nicht wie eine lange Tabelle.

## 4.7 Evolution

Die Formkette ist einer der stärksten Inhalte:

Mensch → Halbling → Vampir → Vampiradliger → Vampirlord → Himmlischer Vampirlord → weitere bestätigte Formen.

Die aktuelle Textliste ist dafür nicht geeignet. Sie wirkt wie eine Checkliste und zeigt zu wenig visuelle Entwicklung.

Ziel:

- großer vertikaler oder horizontaler Evolutionspfad,
- klare aktuelle Position,
- sichtbare Sperren,
- Storyfreischaltung,
- neue Skills,
- passive Veränderungen,
- Modell- oder Aura-Vorschau,
- kanonische Grenzen.

Kampagne und Roguelite-Modi werden getrennt:

- Kampagne startet in der Storyform des Zeitpunkts.
- Endlos, Boss-Turm und Prüfungen können bereits freigeschaltete Formen erlauben.
- Ein Run darf die Story nicht rückwirkend ändern.

## 4.8 Schmiede

Der Schmiede-Hintergrund ist einer der besten aktuellen Screens. Feuer, Amboss und warme Beleuchtung geben dem Bereich sofort eine eigene Identität.

Die Interaktion soll sich trotzdem von einer Liste zu einer echten Item-Ansicht entwickeln.

Links:

- Waffe,
- Handschuhe,
- Rüstung,
- Schuhe,
- Amulett.

Mitte:

- großes Item,
- Name,
- Stufe,
- Seltenheit,
- Herkunft,
- Illustration oder Modell.

Rechts:

- vorheriger Wert,
- neuer Wert,
- Materialien,
- Schmiedeschaltfläche.

Beispiel:

~~~text
BESTIENWAFFE +2 → +3
Schaden: 12 → 16

Benötigt:
3 × Mittel-Kristall
1 × Hoch-Kristall

[SCHMIEDEN]
~~~

Affixe, Seteffekte und Bestienherkunft werden nur eingesetzt, wenn sie verifiziert oder ausdrücklich als Spielvorschlag gekennzeichnet sind.

## 4.9 Familie wird Fraktion

„Familie“ ist für das gewünschte System zu eng. Der Bereich wird zu **Fraktion**.

Die Fraktion kann später:

- gegründet oder betreten werden,
- Mitglieder rekrutieren,
- Beziehungen verwalten,
- eine Festung ausbauen,
- forschen,
- Territorium kontrollieren,
- angegriffen werden,
- selbst angreifen,
- Ressourcen erzeugen,
- Bündnisse und Feindschaften bilden.

Tabs:

- Übersicht,
- Mitglieder,
- Festung,
- Rekrutierung,
- Forschung,
- Territorium,
- Krieg,
- Chronik.

Ein freigeschalteter Held wird nicht automatisch Mitglied. Rekrutierung darf Story, Beziehung, Quest und Ressourcen benötigen.

Gebäude können sein:

- Trainingshalle,
- Schmiede,
- Krankenstation,
- Lager,
- Forschungsraum,
- Verteidigung,
- Quartiere,
- Wachposten.

Zuerst werden Übersicht, Mitglieder und Basisdaten gebaut. Territorium und Krieg kommen später.

## 4.10 System

Das System ist der größte konzeptionelle Umbaukandidat. „Talent ziehen“ ist keine ausreichende Hauptfunktion.

Das System braucht eine deutlich andere Sprache als die Fantasy-Menüs:

- Blau und Schwarz,
- leuchtende Linien,
- digitale Leere,
- dezente Glitches,
- klare Informationsfenster,
- weniger Goldornament.

Das System soll sich anfühlen, als stehe es über der Welt.

Bereiche:

- Status,
- Fähigkeiten,
- Evolution,
- Quests,
- Titel,
- Inventar,
- Meisterschaft,
- Codex,
- Bestiarium,
- Systemkern,
- Talente,
- System-Level.

Permanente Entwicklung kann enthalten:

- Fähigkeitensmeisterschaft,
- Formmeisterschaft,
- Titel,
- zusätzliche Skill-Slots,
- Analyse,
- neue Systembereiche,
- neue Upgradeoptionen,
- Codex- und Bestiariumfortschritt.

Nicht alles muss ein roher Schadensbonus sein. Reichweite, Kontrolle, Timing, neue Varianten und mehr Information fühlen sich oft stärker nach echter Entwicklung an.

Nach einem Run muss der Spieler denken:

> Mein Finn kann jetzt etwas, das vorher nicht möglich war.

## 4.11 Herausforderungen werden Prüfungen

Der aktuelle Bereich überschneidet sich mit Aufgaben, Boss-Turm und Endlos. Er soll als **Prüfungen** neu definiert werden.

Beispiele:

- Blutlose Nacht: Blutheilung deaktiviert.
- Der Schwächste: nur eine Form erlaubt.
- Eine Fähigkeit: nur ein aktiver Skill.
- Bossrausch: mehrere Bosse hintereinander.
- Keine Flucht: Arena schrumpft.
- Lore-Prüfung: ikonische Begegnung unter kanonischen Bedingungen.

Jede Prüfung braucht:

- Regel,
- erlaubte Helden,
- Einschränkungen,
- Ziel,
- Rekord,
- Belohnung,
- Schwierigkeit,
- Kennzeichnung als Story- oder Gameplay-Prüfung.

## 4.12 Gameplay

Der aktuelle Survivor-Loop funktioniert:

- Figur in der Mitte,
- Gegner von außen,
- automatische Angriffe,
- Bewegung per Touch,
- Erfahrung,
- Drops,
- Stufenaufstieg,
- Evolution.

### Raster entfernen

Das sichtbare Raster lässt das Gameplay wie einen frühen Prototypen wirken. Im normalen Lauf muss es verschwinden.

Der Boden braucht:

- organische Texturen,
- Gras,
- Erde,
- Blut,
- Steine,
- Risse,
- Fußspuren,
- Lichtinseln,
- Schatten,
- lokale Farbvariation,
- zerstörbare Details.

### Art Direction

Empfohlener Stil:

> Dark Fantasy 2.5D Stylized

Nicht realistisch und nicht beliebig superdeformed. Finn, Gegner und Umwelt müssen dieselbe Material-, Licht- und Konturlogik teilen.

### Formen sichtbar machen

Mensch:

- normale Silhouette,
- keine übernatürliche Aura.

Halbling:

- erste Blutenergie,
- subtile Aura,
- erkennbare Machtzeichen.

Vampir:

- aggressivere Silhouette,
- Blut- und Schattenakzente.

Höhere Formen:

- stärkere Aura,
- eigene Farb- und Bewegungslogik,
- sichtbar höhere Präsenz.

### VFX-Sprachen

Blut:

- tiefrot,
- flüssig,
- Sichelformen,
- Tropfen,
- Nebel.

Schatten:

- Schwarz und Violett,
- Rauch,
- verzerrte Raumkanten,
- Flächen und Schleier.

Qi:

- hell,
- kontrolliert,
- Linien,
- Druckwellen,
- präzise Impulse.

Ein wichtiger Angriff wie Blutwisch braucht:

1. Körperbewegung,
2. Energieaufbau,
3. sichtbare Sichel,
4. Projektil,
5. Trefferreaktion,
6. kurzer Hitstop,
7. passende Partikel,
8. sichtbare Gegnerreaktion.

Die erste Evolution muss ein Höhepunkt sein:

- Spiel pausiert,
- Hintergrund wird dunkler,
- Systemklang,
- „Evolution verfügbar“,
- sichtbare Formveränderung,
- Partikel und Aura,
- kurzer Zoom,
- neuer Formname,
- neue Fähigkeiten,
- Spiel geht weiter.

## 4.13 Level-Up-Karten und Fusionen

Level-Up-Karten zeigen:

- Skillname,
- Icon,
- Seltenheit,
- aktuelles Level,
- nächstes Level,
- konkrete Werteänderung,
- mögliche Fusion,
- kurzer Build-Hinweis.

Beispiel:

~~~text
BLUTSPRAY III → IV
Schaden: 32 → 39
Projektile: 5 → 6
Abklingzeit: 1,4 s → 1,3 s
Fusion möglich mit: Schattenflammen
~~~

Fusionen sollen sich wie legendäre Buildmomente anfühlen:

- eigenes Artwork,
- eigene Farbe,
- eigene Animation,
- klare Ausgangsfähigkeiten,
- eigener Name,
- sichtbare Wirkung.

---

## 5. Navigation und visuelle Gesamtrichtung

Hauptnavigation:

- Kampagne,
- Helden,
- Schmiede,
- Fraktion,
- System,
- Prüfungen.

Aufgaben werden Overlay oder Panel. Boss-Turm und Endlos sind eigene Modi.

Der aktive Navigationspunkt darf auf Desktop nicht mehr als riesige gelbe Fläche erscheinen. Besser:

- goldener Glow,
- aktiver Rahmen,
- größeres Icon,
- kleiner Unterstrich,
- klarer Kontrast.

Die Grundfarbe Violett bleibt verbindend, aber jeder Kernbereich erhält eine eigene Welt:

| Bereich | Hintergrundidentität |
|---|---|
| Kampagne | Storywelt und Karte |
| Helden | dunkler Charakterraum |
| Schmiede | Feuer und Werkstatt |
| Fraktion | Burg, Banner, Kriegsraum |
| System | digitale Leere |
| Prüfungen | Arena oder Nexus |

Serifenschrift für Namen, Story und Überschriften. Lesbare UI-Schrift für Zahlen, Kosten, Fortschritt und Tooltips.

---

## 6. Behalten, ändern, neu bauen, später

| Bereich | Entscheidung |
|---|---|
| Farbwelt | Behalten |
| Ornamentrahmen | Behalten, gezielter einsetzen |
| Schmiede-Hintergrund | Behalten |
| Heldenportraits | Behalten und erweitern |
| Survivor-Loop | Behalten |
| sichtbares Gameplay-Raster | Entfernen |
| Kampagnenkacheln | In Storyreise umbauen |
| Aufgaben als Hauptbereich | In Panel/Overlay umwandeln |
| Familie | Zu Fraktion umbauen |
| Talent ziehen | Als Unterfunktion einordnen |
| System | Neu strukturieren |
| Heldenscreen | Neu strukturieren |
| Evolution | Visuellen Pfad bauen |
| Boss-Turm | Eigenen Modus-Hub bauen |
| Endlos | Risk/Reward ausbauen |
| Herausforderungen | In Prüfungen umwandeln |
| Fraktionskrieg | Später vertiefen |
| Enemy Scaling | Entfernen |
| globale Schadensinflation | Vermeiden |
| undefined | Sofort beseitigen |
| letzte Kampagnenetappen | Als Content fertigstellen |

---

## 7. Umsetzungsreihenfolge

### Phase 0 – Architektur

1. Projektstruktur analysieren.
2. Run, Held, Story und Account trennen.
3. Lore-Datenmodell definieren.
4. Verifizierungsstatus einführen.
5. Heldensaves einführen.
6. feste Gegnerwerte einführen.
7. undefined und null in sichtbaren Texten verhindern.
8. responsive Layout-Grundlagen festlegen.
9. Validierung und Testdaten einrichten.

### Phase 1 – System und Navigation

1. Hauptnavigation anpassen.
2. Familie zu Fraktion umbenennen.
3. Aufgaben herauslösen.
4. System-Hub neu strukturieren.
5. Status, Skills, Evolution, Meisterschaft, Codex und Systemkern anlegen.
6. permanente und temporäre Fortschritte sichtbar trennen.

### Phase 2 – Helden und Evolution

1. Heldenscreen neu bauen.
2. Finn als Referenzhelden sauber darstellen.
3. Formpfad implementieren.
4. Fähigkeiten je Form und Storypunkt zuordnen.
5. Peter unabhängig und schwach startbar machen.
6. Story-Snapshots an Etappen binden.

### Phase 3 – Kampagne

1. Storyreise statt isolierter Kacheln.
2. Node-Typen definieren.
3. Etappen aus Daten laden.
4. Storyziel, Gegner und Belohnungen verbinden.
5. Boss- und Storymomente hervorheben.
6. letzte bereits geplante Etappen fertigstellen.

### Phase 4 – Schmiede und Fraktion

1. Item-Detail und Upgradevorschau.
2. Materialanzeige.
3. Seltenheit und Herkunft.
4. Fraktionsübersicht.
5. Mitglieder und Rekrutierung.
6. Festungsbasis.
7. Territorium und Krieg später.

### Phase 5 – Gameplayqualität

1. Raster entfernen.
2. Boden und Umgebung aufwerten.
3. Gegner und Figuren stilistisch vereinheitlichen.
4. Formen sichtbar unterscheiden.
5. Blut-, Schatten- und Qi-VFX.
6. Trefferfeedback.
7. Evolution inszenieren.
8. Karten und Fusionen verbessern.

### Phase 6 – Endgame

1. Boss-Turm.
2. Endlos.
3. Prüfungen.
4. Tages- und Wochenaufgaben.
5. Rekorde und Belohnungen.
6. Fraktionsangriffe und weitere Meta-Systeme.

---

## 8. Definition of Done

### Daten

- Jeder Held besitzt eigene Progression.
- Story-Snapshots existieren.
- Formen und Fähigkeiten sind zeitlich zugeordnet.
- Gegner besitzen feste Werte.
- Lore-Status und Quellen sind gespeichert.
- Keine ungültigen Referenzen existieren.

### UI

- Jede Unterseite besitzt einen Zurückweg.
- Kein undefined erscheint.
- Mobile und Desktop sind benutzbar.
- Die aktive Navigation ist nicht überdimensioniert.
- Kernbereiche besitzen unterschiedliche Identitäten.

### System

- Das System ist mehr als Talent-Ziehen.
- Permanente und Run-Progression sind getrennt sichtbar.
- Meisterschaft und Freischaltungen sind verständlich.
- Das System fühlt sich wie die langfristige Entwicklung an.

### Helden

- Finns Formpfad ist innerhalb weniger Sekunden verständlich.
- Peter startet unabhängig von Finn.
- Formen und Fähigkeiten sind kanonisch begrenzt.
- Die Heldenauswahl vermittelt Charakter statt nur Tabelle.

### Gameplay

- Kein Debug-Raster im normalen Lauf.
- Gegner und Held gehören stilistisch zusammen.
- Formen sind visuell unterscheidbar.
- Fähigkeiten besitzen lesbares Trefferfeedback.
- Evolutionen fühlen sich wie Höhepunkte an.

---

# Direkt kopierbarer Prompt für Claude

~~~text
Du bist ab jetzt Lead Game Director, Systems Designer, Technical Game Designer und Art Director für unser bestehendes Spielprojekt „My Vampire System“.

Das vorhandene Projekt ist ein funktionierender Prototyp mit Kampagne, Survivor-Gameplay, Heldenauswahl, Evolutionen, Schmiede, Familie/Fraktion, System, Aufgaben, Boss-Turm, Endlos und Herausforderungen. Schreibe nicht blind alles neu. Untersuche zuerst Code, Daten und aktuelle UI und baue anschließend kontrolliert um.

Das vollständige Buch-/Storywissen steht dir bereits zur Verfügung. Nutze es als Lore-Grundlage. Erfinde keine kanonischen Charaktere, Fähigkeiten, Formen, Ereignisse, Ortsbeziehungen oder Evolutionsstufen. Wenn etwas nicht eindeutig verifiziert ist, markiere es als UNVERIFIED oder GAMEPLAY_PROPOSAL. Nicht verifizierte Inhalte dürfen nicht als kanonischer Release-Content in der sichtbaren Oberfläche erscheinen.

## PRODUKTZIEL

Das Spiel soll ein düsteres 2.5D-Echtzeit-Action-Roguelite für Mobile und PC werden:

- Mobile-first im Bedienungsmodell,
- PC-ready in Architektur und Layout,
- Landscape als primäre Ausrichtung,
- Touch, Maus, WASD und möglichst Controller,
- gemeinsame Daten und Regeln auf allen Plattformen,
- responsive Darstellung statt hart codierter Einauflösungs-UI.

Der Kern:

Eine kanonische Storywelt mit fest definierten Gegnerstärken trifft auf heldenspezifische permanente Entwicklung und kurzfristige Roguelite-Runs. Die Welt skaliert nicht künstlich mit dem Spieler. Der Held wächst in eine feste Welt hinein.

## PROGRESSIONSREGEL

Trenne zwingend:

1. Run-Progression: temporäre Skills, Skillstufen, Buffs, Synergien, Fusionen und Run-Werte.
2. Helden-Progression: für jeden Helden separat gespeicherte Fähigkeiten, Formen, Meisterschaft, Ausrüstung, Titel und Story-Meilensteine.
3. Story-Progression: bestimmt, welche Formen, Fähigkeiten, Gegner, Orte und Ereignisse zu einem Storyzeitpunkt existieren.
4. Account-/Meta-Progression: globale Freischaltungen wie Systembereiche, Codex, Bestiarium, Schmiede, Fraktion, Komfortfunktionen und Modi.

Finns Fortschritt darf Peter nicht automatisch stark machen. Finn und Peter besitzen getrennte kanonische Progressionen und getrennte Heldensaves. Wenn Peter neu beginnt, ist Peter schwach, auch wenn Finn bereits weit entwickelt ist.

## KEIN DYNAMISCHES ENEMY SCALING

Gegner und Bosse bekommen feste Daten:

- Leben,
- Schaden,
- Geschwindigkeit,
- Resistenzen,
- Verhalten,
- Belohnung,
- Power Tier,
- Storyzeitpunkt,
- empfohlene beziehungsweise maximal sinnvolle Heldenklasse.

Ein früher Gegner bleibt ein früher Gegner. Er darf für einen neuen Peter gefährlich und für einen weit entwickelten Finn später leicht sein.

## PHASE 1 – ERST ANALYSIEREN, DANN ÄNDERN

Bevor du größere Codeänderungen machst:

1. Untersuche die komplette Projektstruktur.
2. Identifiziere Routing, Screens, Komponenten, Zustände, Saves, Datenquellen und Gameplay-Loop.
3. Liste auf, wo Lore, UI, Balancing und Technik vermischt sind.
4. Identifiziere hart codierte Werte.
5. Suche nach undefined, null, fehlenden IDs und ungesicherten Referenzen.
6. Erstelle einen Ist-Bericht mit konkreten Dateipfaden.
7. Lege eine Migrationsstrategie fest, die den funktionierenden Prototyp schrittweise erhält.

Gib danach eine Liste aus:

- Behalten,
- Ändern,
- Neu bauen,
- Entfernen,
- Später.

Setze eindeutige Entscheidungen aus diesem Prompt direkt um. Wenn eine Lore-Angabe nicht verifiziert ist, erfinde nichts, sondern markiere sie sauber.

## PHASE 2 – DATEN- UND LORE-FUNDAMENT

Erstelle oder verbessere eine datengetriebene Struktur für:

- characters,
- forms,
- abilities,
- skills,
- evolutions,
- factions,
- locations,
- story_arcs,
- story_events,
- stages,
- enemies,
- bosses,
- items,
- equipment,
- beast_crystals,
- titles,
- system_features,
- relationships,
- power_tiers,
- canonical_limits,
- verification_sources.

Jede Entität braucht stabile ID, Anzeigename, Beschreibung, Verifizierungsstatus, Storyzeitpunkt, Freischaltbedingung und Referenzen.

Führe VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED und GAMEPLAY_PROPOSAL ein.

Erstelle für jeden spielbaren Helden eine Power-Timeline mit Storypunkt, Form, bestätigten Fähigkeiten, Machtbereich, maximaler Gegnerklasse, verfügbaren Modi und kanonischen Grenzen.

## PHASE 3 – SAVE- UND PROGRESSIONSARCHITEKTUR

Trenne:

- runState,
- heroProgression,
- storyProgression,
- accountProgression.

Ein Run-Reset darf keine permanenten Werte löschen. Finns Fortschritt darf Peter nicht automatisch verstärken.

Baue Validierung ein:

- keine undefined-Werte in Spielertext,
- keine null-Namen,
- keine fehlenden Skill-IDs,
- keine nicht existierenden Form-Referenzen,
- keine Storyinhalte vor ihrer Freischaltung,
- keine unzulässigen Fähigkeiten in einer Etappe.

Bei Datenfehlern gibt es im Entwicklungsmodus eine verständliche Fehlermeldung. Die Release-UI zeigt niemals undefined.

## PHASE 4 – NAVIGATION

Hauptnavigation:

- Kampagne,
- Helden,
- Schmiede,
- Fraktion,
- System,
- Prüfungen.

Benenne Familie zu Fraktion um.

Aufgaben werden Panel, Overlay oder Kontextzugang. Boss-Turm und Endlos erhalten eigene Modusidentitäten.

Jede Unterseite braucht oben links einen klaren Zurückweg.

Mobile, Tablet und Desktop werden über responsive Layouts unterstützt. Keine reine Fixed-Pixel-Lösung.

## PHASE 5 – SYSTEM ALS ZENTRALES HERZ

Baue den Systembereich konzeptionell neu. Talent ziehen ist nur eine Unterfunktion.

Der System-Hub braucht:

- Status,
- Fähigkeiten,
- Evolution,
- Quests,
- Titel,
- Inventar,
- Meisterschaft,
- Codex,
- Bestiarium,
- Systemkern,
- Talente,
- System-Level,
- permanente Freischaltungen.

Visuell soll das System stärker blau/schwarz, digital und fremdartig wirken als die Fantasy-Welt. Weniger Goldornament als in der Schmiede.

Zeige permanente Entwicklung:

- Fähigkeitensmeisterschaft,
- Formmeisterschaft,
- Titel,
- neue Skill-Slots,
- Analyse,
- neue Systembereiche,
- neue Upgradeoptionen,
- Codex- und Bestiariumfortschritt.

Vermeide einen globalen Schadensbaum, der neue Helden zerstört. Permanente Entwicklung soll Identität, Möglichkeiten und gezielte Entwicklung erzeugen.

## PHASE 6 – HELDEN UND EVOLUTIONEN

Baue den Heldenscreen zu einem Charakterraum um.

Zeige:

- großes Artwork oder Modell,
- Name,
- Spezies,
- aktuelle Form,
- Storystatus,
- Rolle,
- Kampfstil.

Tabs:

- Übersicht,
- Formen,
- Fähigkeiten,
- Meisterschaft,
- Ausrüstung,
- Lore.

Die Evolution ist ein visueller Pfad statt einer langen Textwand. Beim Auswählen einer Form zeigst du Status, Freischaltbedingung, neue Fähigkeiten, passive Änderungen, Formvorschau, Verfügbarkeit und kanonische Grenzen.

Kampagne startet in der Storyform des jeweiligen Zeitpunkts. Endlos, Boss-Turm und Prüfungen dürfen freigeschaltete Formen verwenden, wenn der Modus es erlaubt.

## PHASE 7 – KAMPAGNE

Entwickle die Kampagne als Storyreise.

Jede Etappe braucht Daten für Kapitel/Storybogen, Location, Storyziel, Gegnertypen, feste Werte, Node-Typ, Dauer oder Ziel, Belohnung, Freischaltungen, Dialogereignisse und Einschränkungen.

Unterstütze normale Gefechte, Elite, Boss, Überleben, Eskorte, Verteidigung, Jagd, Duell, Dialog, Entscheidung, Entdeckung, Training, Charakterbegegnung, Lore-Ereignis, Schatz sowie Form- und Fähigkeitsfreischaltung.

Die letzten bereits geplanten Kampagnenetappen dürfen als Content fertiggestellt werden. Baue dabei keine neue große Meta-Architektur auf dem alten Fundament.

## PHASE 8 – SCHMIEDE

Behalte den starken Schmiede-Hintergrund, baue die Interaktion als Item-Ansicht:

- Ausrüstungsslots links,
- aktuelles Item in der Mitte,
- Upgradevorschau rechts,
- alte und neue Werte,
- Materialien,
- Seltenheit,
- Herkunft,
- Affixe oder Seteffekte nur verifiziert oder klar als Gameplay-Vorschlag markiert.

## PHASE 9 – FRAKTION

Benenne Familie zu Fraktion um und plane Übersicht, Mitglieder, Festung, Rekrutierung, Forschung, Territorium, Krieg und Chronik.

Ein freigeschalteter Held wird nicht automatisch Mitglied. Rekrutierung kann Story, Beziehung, Quest und Ressourcen benötigen.

Baue zuerst Übersicht, Mitglieder und Grunddaten. Territorium, Angriffe und vollständige Kriegslogik kommen erst nach dem Kernfundament.

## PHASE 10 – GAMEPLAY UND ART DIRECTION

Der Stil ist Dark Fantasy 2.5D Stylized:

- kein sichtbares Debug-Raster,
- organische Böden,
- Gras, Steine, Risse, Blut und Licht,
- konsistente Figurenmaterialien,
- klare Silhouetten,
- bessere Gegneridentität,
- sichtbar unterschiedliche Formen.

Definiere drei VFX-Sprachen:

Blut: tiefrot, flüssig, Sichelformen, Tropfen, Nebel.
Schatten: schwarz/violett, Rauch, verzerrte Raumkanten, Flächen.
Qi: hell, kontrolliert, Linien, Druckwellen, präzise Impulse.

Wichtige Fähigkeiten brauchen Vorbereitung, Wirkung, Trefferreaktion und angemessenes Hitstop.

Die erste Evolution muss pausieren, eine Systemmeldung zeigen, die Form sichtbar verändern, Partikel und Aura einsetzen und den neuen Formnamen präsentieren.

## PHASE 11 – RUN-SYSTEM

Level-Up-Karten zeigen aktuelles Level, nächstes Level, konkrete Werteänderung, Seltenheit, Icon, mögliche Fusion und Build-Hinweis.

Fusionen brauchen eigene Präsentation, eigenes Artwork und einen starken Moment.

## PHASE 12 – MODI

Boss-Turm: echte Stockwerke, feste Bosse, Modifikatoren, Bestleistung, eigene Belohnungen und sichtbarer Weg nach oben.

Endlos: Zeit-/Wellenprogression, Modifikatoren, Risk/Reward, eigene Rekorde und eigene Belohnungen.

Prüfungen: handgebaute Spezialregeln, klare Einschränkungen, eigene Rekorde und Belohnungen.

Aufgaben: täglich, wöchentlich, Story, heldenspezifisch, Fraktion und System.

Diese Bereiche dürfen nicht dieselben Ziele unter verschiedenen Namen wiederholen.

## ARBEITSWEISE

Arbeite in überprüfbaren Phasen. Nach jeder Phase:

1. Liste geänderte Dateien.
2. Erkläre kurz die Änderungen.
3. Führe Tests, Typechecks und Builds aus.
4. Behebe Fehler, bevor du weitergehst.
5. Zeige, welche Bereiche noch Platzhalter sind.
6. Erfinde keine Lore, um fehlende Daten zu füllen.

Priorität:

1. Architektur und Datenvalidierung.
2. Progressionstrennung.
3. System.
4. Helden und Evolution.
5. Kampagne und Etappen.
6. Schmiede und Fraktion.
7. Gameplay-Art, VFX und Feedback.
8. Endgame-Modi.

Bewahre funktionierende Teile, wenn sie dem neuen Fundament nicht widersprechen. Keine globalen Werte, die Peter automatisch stark machen. Keine UI-Ausgabe von undefined. Keine erfundenen kanonischen Details. Keine reine Desktop-Hochskalierung der Mobile-UI. Keine dynamische Anpassung der festen Storygegner.

Beginne jetzt mit PHASE 1:

1. Analysiere die Projektstruktur.
2. Erstelle den Ist-Bericht.
3. Nenne konkrete Dateien und Risiken.
4. Erstelle einen Migrationsplan.
5. Implementiere noch keine großen neuen Screens, bevor Architektur und Plan dokumentiert sind.
~~~

---

## Schlussfolgerung

Der Prototyp braucht keinen kompletten Neustart. Er braucht eine klare Hierarchie:

> Daten und Kanon sichern → Progression trennen → System zum Herzen machen → Helden und Evolutionen verständlich machen → Kampagne als Reise bauen → Fraktion und Schmiede vertiefen → Gameplay visuell auf das Niveau der Menüs bringen → Modi ausbauen.

Der wichtigste Maßstab ist nicht die Anzahl der Screens. Entscheidend ist, ob Finn nach längerer Spielzeit tatsächlich anders aussieht, anders spielt, andere Fähigkeiten besitzt, neue Grenzen überschreitet und andere Gegner beherrscht, während Peter trotzdem als eigener schwacher Charakter beginnen kann.

