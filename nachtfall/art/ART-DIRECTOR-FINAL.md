# Nachtfall / My Vampire System: Finale Analyse (Claude + GPT zusammengeführt)

Grundlage: die 13 Screenshots, GPTs Bericht „MVS Game Design und Art Director“ und zusätzlich
eine Prüfung des echten Codes (`nachtfall/src/*.js`), die GPT nicht machen konnte.
Die Etappen 1–15 sind fertig gebaut. Dieser Bericht betrifft alles, was danach kommt.

---

## 0. Mein interner Auftrag (so habe ich gearbeitet)

> Du bist Art Director und Game Director. Schau jeden Screen an, als ob ein Spieler ihn zum ersten Mal sieht:
> Was sieht er zuerst? Was versteht er nicht? Wo ist er in einer Sackgasse? Was widerspricht dem Buch?
> Prüfe dann im Code, **warum** es so aussieht, statt zu raten. Gleiche danach mit GPT ab:
> Was ist gleich, was fehlt bei GPT, wo ist GPT für dieses Projekt falsch oder zu schwer?
> Ergebnis: **Was wollen wir haben → was brauchen wir dafür → wie sieht es am Ende aus**, in einer
> Reihenfolge, die man wirklich bauen kann.

---

## 1. Gesamturteil in fünf Sätzen

1. Die **Menü-Optik ist schon gut** (Rahmen, Violett-Gold, Schmiede-Hintergrund, Heldenportraits). **Das Spielfeld hinkt deutlich hinterher.**
2. Das **größte Problem ist nicht die Grafik, sondern die Progression**:
   - Alle dauerhaften Verbesserungen gelten für alle Helden (Schmiede, Burg, Talente).
   - Finn fängt **in jeder Stufe, auch in Etappe 14, wieder als Mensch an**, der das Buch suchen muss.
   - Beides widerspricht dem Buch und deinem Wunsch.
3. Das **System** ist im Moment ein Glücksrad für Talente. Im Buch ist es das Herz der Geschichte: Status, Quests, Stufen, Fähigkeiten, Evolution.
4. Mehrere Bereiche **zeigen dasselbe unter anderem Namen**:
   - Aufgaben, Boss-Turm und Endlos führen alle auf den Tab „Herausforderungen“.
   - Die Seitenknöpfe Helden und Schmiede doppeln die untere Leiste.
5. Es gibt **sichtbare Fehler**, die sofort weg müssen: „Stufe undefined“, doppelte Level-up-Karten und alte Namen aus dem Prototyp (Vaelgor, Kharn).

---

## 2. Was GPT und ich gleich sehen (übernommen)

- Farbwelt, Ornamentrahmen, Schmiede-Hintergrund und Heldenportraits **bleiben**.
- **Familie wird Fraktion.**
- **Aufgaben** werden ein Overlay mit Zurück-Knopf, kein eigener Hauptbereich.
- **Jede Unterseite hat oben links einen Zurückweg.** Keine Sackgassen.
- Das **System** wird der große Hub, und Talente sind darin nur noch ein Unterpunkt.
- Das **System sieht anders aus als die Fantasy-Menüs**: Blau-Schwarz, leuchtende Linien, wenig Gold. Das passt zum Buch, dort sind die Systemfenster blau.
- Der **Heldenscreen** wird ein Charakterraum mit Tabs statt einer langen Textwand.
- Die **Evolution** wird ein sichtbarer Pfad.
- Der **Boss-Turm** bekommt echte Stockwerke.
- **Endlos** bekommt Risiko und Belohnung.
- Die **Herausforderungen** werden zu **Prüfungen** mit Sonderregeln.
- Der **aktive Tab** ist keine riesige gelbe Fläche mehr.
- **Pause**: zuerst dein Build, dann die Werte, dann Fusionen. „Lauf aufgeben“ bekommt eine Bestätigung.
- **Level-up-Karten** zeigen alte und neue Werte (z. B. „Blutspray III → IV, Schaden 32 → 39“).
- **Fusionen** werden als großer Moment inszeniert.
- **Gameplay-Stil**: kein Raster, organischer Boden, drei klare Effektsprachen (Blut / Schatten / Qi), Trefferstopp.
- Die **erste Evolution** ist ein Höhepunkt: Das Spiel pausiert, das System meldet sich, Aura, Zoom, neuer Formname.
- **Kanon vor Erfindung.** Was nicht im Buch steht, wird als Spielmechanik gekennzeichnet.

---

## 3. Was GPT nicht sehen konnte: Befunde aus dem Code

| # | Befund | Ursache im Code | Folge |
|---|---|---|---|
| C1 | „im Lauf: Stufe undefined“ im Heldenscreen | `27-evo.js:61` liest `t.lv` aus den Formdaten, die Stufen stehen aber in `FINN_ARC` (`21-finn-arcade.js`) | sichtbarer Fehler |
| C2 | Level-up bietet 2× „Blutkelch“ | `09-game.js:413` füllt fehlende Karten abwechselnd auf; als Mensch gibt es gar keine Fähigkeiten | wirkt kaputt, die ersten Level-ups sind langweilig |
| C3 | Finn startet **jede** Kampagnenstufe als Mensch | `24-kampagne.js:132` setzt `PENDING_FINN = 0`, und `21-finn-arcade.js` lässt jeden Lauf bei null beginnen | in Etappe 14 muss Finn wieder „das Buch finden“, das widerspricht der Geschichte |
| C4 | Dauerhafte Boni gelten für **alle** Helden | Schmiede (`GEAR2`), Burg (`C.castle`) und Talente (`SAVE.meta`) liegen im gemeinsamen Spielstand, siehe `24-kampagne.js:146` | Peter ist sofort stark, wenn Finn gefarmt hat, genau dein Kritikpunkt |
| C5 | Die Gegnerstärke ist **schon fest pro Stufe** (nicht dynamisch) | `24-kampagne.js:144` und `campLevelSetup`: Stärke kommt nur aus Etappe und Stufe | GPTs Forderung „kein dynamisches Scaling“ ist schon erfüllt; es fehlt nur die **Machtgrenze pro Held** |
| C6 | „Vaelgor“, „Kharn“ und „Aschefriedhof“ im Finn-Text und im Endlosmodus | Reste des ersten Prototyps (`05-data.js`, `21-finn-arcade.js:53`) | nicht aus dem Buch, verwirrt |
| C7 | Seitenknöpfe Aufgaben / Boss-Turm / Endlos | `26-karte.js:222`: alle öffnen denselben Tab | doppelt, ohne Zurück |
| C8 | Das „Raster“ im Spiel | kein Debug-Gitter, sondern das Bodenmuster `detail: 'tiles'` (Steinplatten) in `04-world-art.js` | wirkt wie ein Gitter, muss ein organischer Boden werden |
| C9 | „Reaktionen 0“ in der Pause | interner Zähler für Element-Reaktionen (`05-data.js:244`), nirgends erklärt | unverständlich |
| C10 | Namen uneinheitlich | „Sil Skala“ (Helden) gegenüber „Sil“ (Familie); Beschreibung von Fabian verweist auf „Raten · Sil“ | wirkt unfertig |

---

## 4. Meine eigenen Screen-Befunde (zusätzlich zu GPT)

### Bild 1 und 13: Kampagne / Hauptmenü
- **Etappen-Banner** („Die zweite Basis“, „Die Verfluchten“): Die Schrift liegt auf dem Ornament und ist **kaum lesbar**.
- Das rote Etikett **„ETAPPE 1“** wird von der Goldlinie durchgestrichen.
- **„Zur aktuellen Etappe v“** ist ungestylter Text mitten auf der Insel.
- Die **Inseln sind graue Klötze** mit Schloss darauf. Die oberste wird von der Kopfleiste abgeschnitten.
- **Alle 15 Stufenkacheln sehen gleich aus.** Man sieht nicht, ob Duell, Überleben, Jagd, Boss oder Bloodsucker, welcher Begleiter dabei ist und wer der Boss ist. Diese Daten gibt es aber schon (`type`, `comp`, `foe`), sie werden nur nicht gezeigt.
- **„0 ★“ unter dem Namen** oben links hat keine Bedeutung für den Spieler.
- **Der Fortschritt fehlt**: keine Anzeige wie „Etappe 1: 4/15 Stufen, 9/45 Sterne“.

### Bild 2, 3, 4 und 11: Aufgaben / Boss-Turm / Endlos / Herausforderungen
- **Vier Wege führen auf denselben Screen**, und keiner hat einen Zurück-Knopf.
- **Gesperrte Knöpfe** (Boss-Turm „Starten“, „Abholen“) sehen fast aus wie aktive.
- Die Belohnungen stehen als **winzige ✦ und ◆ ohne Beschriftung** da.
- **Zwei Drittel des Screens sind leer.**
- Endlos heißt noch **„Nacht auf dem Aschefriedhof“ mit Vaelgor**. Das ist kein Buchinhalt.

### Bild 5: Pause
- Es werden **alle Fusionen** gezeigt, auch solche, für die dir jede Fähigkeit fehlt. Besser: nur Fusionen, die zu deinem Build passen, mit Fortschrittsbalken („Blutwisch 2/4“).
- Es fehlen **Einstellungen** in der Pause: Lautstärke, Joystick links/rechts, Vibration.

### Bild 6 und 7: Helden
- **Gesperrte Helden verraten nicht, wie man sie bekommt.** Die Freischaltbedingung existiert (`HERO_UNLOCK`), steht aber nicht auf der Karte.
- **Keine Werte, keine Stufe, keine Kraftanzeige pro Held.** Man kann Finn und Peter nicht vergleichen.
- **Die Textwand** erklärt die Mechanik mit Prototyp-Namen (siehe C6).
- **„Ausgewählt“** ist dunkel auf dunkel und kaum lesbar.

### Bild 8: Schmiede
- **Der schönste Screen.** Der Inhalt ist aber eine schmale Liste mitten im Bild, und links und rechts wird die tolle Kulisse verschenkt.
- Die Gegenstände sind **allgemeine „Bestien…“-Items**. Die Ausrüstung aus dem Buch (Twin Tail Chain, God-Slayer-Rüstung, Asura-Handschuhe, Drachenrüstung usw.) fehlt, obwohl sie in den Etappen als Evolution auftaucht.

### Bild 9: Familie
- Ein gesperrter Eintrag unter dem anderen, und die Burgstufe liefert nur Prozente.
- Laut Text sind Begleiter **„unverwundbar“**. Das nimmt Spannung.

### Bild 10: System
- Ein **Glücksrad** („Talent ziehen · 150“) mit 11 Talenten. Keine Quests, kein Status, keine Stufe, keine Freischaltungen.
- Im Buch spricht das System mit Finn, gibt Quests mit Belohnung und zeigt ein Statusfenster. **Davon ist nichts da.**

### Bild 12: Gameplay
- **Man erkennt Finn nicht.** In Etappe 1 sind die Gegner Schüler mit **demselben Modell und derselben Größe** wie Finn: braune Haare, blaue Uniform.
- **Das Ziel-Fenster** („Finde das Buch!“ / „Etappe 1 · Stufe 1“) liegt mitten auf den Gegnern.
- Der **Tutorial-Text** („Daumen irgendwo aufsetzen …“) ist blass und liegt hinter dem Ziel-Fenster.
- Die **Deko** besteht aus braunen Kisten, einer grauen Platte und Lollipop-Bäumen. Das ist deutlich schwächer als die Grabkreuze, Kerzen und Pilze, die schon gut aussehen.
- **Die HUD-Zahlen sind winzig**: Kills, Seelen, Kristalle und „STUFE 1“.
- **Der Knopf „Erwachen“ ist schon als Mensch sichtbar.**
- Die **Treffer** sind nur kleine rote Punkte: kein Aufblitzen, kein Rückstoß, keine Schadenszahlen in Stufen.

---

## 5. Wo ich GPT widerspreche oder es anpasse

| GPT sagt | Mein Urteil | Begründung |
|---|---|---|
| **Landscape als Hauptausrichtung** | ❌ **Hochformat bleibt auf dem Handy.** Querformat und Desktop bekommen ein eigenes Layout. | Das ganze Spiel (Bottom-Sheet, Tab-Leiste, Karte) ist für dein iPhone im Hochformat gebaut. Querformat hieße alles neu. Survivor-Spiele wie Vampire Survivors mobile laufen auch hochkant. **→ Entscheidung von dir nötig (E1).** |
| **21 Datentabellen + VERIFIED-Status für alles** | ⚠️ **Schlanker umsetzen** | Das Projekt ist Vanilla-JS ohne Datenbank. Ich ergänze die vorhandenen Definitionen um ein Feld `kanon` (buch / spiel) und `kapitel`, und `build.js` prüft beim Bauen automatisch auf undefined, fehlende IDs und kaputte Verweise. Gleiche Wirkung, ein Zehntel Aufwand. |
| **„Kein dynamisches Enemy Scaling einführen“** | ✅ ist schon so (C5) | Was wirklich fehlt, ist die **Machtgrenze pro Held** (Kapitel 6). |
| **Fraktion: gründen, beitreten, angegriffen werden, Krieg** | ⚠️ **Zuerst Einzelspieler** | Echtes Beitreten und Angreifen zwischen Spielern braucht einen Server mit Konten. Das Spiel ist eine einzelne HTML-Datei. Vorschlag: Die Fraktionen aus dem Buch sind die Gegner und Partner (siehe Kapitel 8). Online später als eigenes Projekt. **→ Entscheidung E2.** |
| **System für alle Helden gleich** | ⚠️ **Das System gehört Finn** | Im Buch hat nur Quinn/Finn das System. Für Finn wird es voll kanonisch (Quests, Status, Stufen). Andere Helden bekommen im System-Tab eine **„Analyse“-Akte** (Finn prüft sie mit „Inspect“) mit ihrer eigenen Meisterschaft. Das ist buchtreu und trotzdem für alle nutzbar. |
| **Neue Knotentypen: Dialog, Entscheidung, Entdeckung, Schatz** | ✅, aber später | Erst zeigen, was schon da ist (Typ, Begleiter, Boss), dann neue Arten bauen. |
| **Alles in 12 Phasen nacheinander** | ⚠️ **Sofort-Fixes zuerst** | Die Fehler aus C1, C2, C6 und C7 sind in Stunden erledigt und machen das Spiel sofort besser. Das kommt vor jeder Architektur. |

---

## 6. Das Herzstück: Progression (was du wolltest: „permanenter Fortschritt, Peter darf nicht alles schaffen“)

### Was wir haben wollen
- **Jeder Held hat seinen eigenen Fortschritt.** Finn auf Etappe 10 macht Peter nicht stärker.
- **Die Welt ist fest.** Ein Akademie-Schüler bleibt ein Akademie-Schüler. Finn zerlegt ihn später, ein neuer Peter kämpft mit ihm.
- **Die Macht ist durch das Buch begrenzt.** Ein Held kann Gegner deutlich über seiner Buch-Stärke nicht schlagen. Der Screen sagt dann klar, warum: „Peter ist zu diesem Zeitpunkt zu schwach. Im Buch stellt sich ihm …“.
- **Die Kampagne startet in der Form des Storyzeitpunkts.** In Etappe 10 ist Finn Vampirlord, statt jedes Mal als Mensch zu starten (C3). Evolution im Lauf gibt es nur noch in Endlos und Prüfungen („Vom Nichts zum Gott“ als eigener Modus).

### Was wir dafür brauchen
1. **Machtstufen aus dem Buch** (eine Skala für alle):
   - Mensch mit Fähigkeitsstufe 1–7.
   - Vampir: Thrall → Ritter → Adliger → Lord → Anführer.
   - Dalki nach Stacheln.
   - Bestien: Basis → Mittel → Hoch → König → Halbgott → Dämon.
   - Dämonen: Demon → General → König.
   - Celestial und God Slayer.

   Jeder Gegner und jede Stufe bekommt eine **Machtstufe**. Das kann ich aus den Kapitelnotizen und den Etappen ableiten.
2. **Eine Machtkurve pro Held**: Welche Form und welche Fähigkeiten hat er bei welchem Kapitel, und bis wohin reicht seine Kraft maximal? (Peter: Mensch → Ghoul → Wight → Celestial-Schweif. Chris: Mensch → Werwolf → roter Werwolf. Und so weiter.)
3. **Ein Spielstand pro Held** mit Heldenstufe, Meisterschaft, eigener Ausrüstung, Titeln und Meilensteinen.
4. **Umzug der bisherigen globalen Boni**:
   - Die Schmiede wird **pro Held** geführt, mit eigener Ausrüstung aus dem Buch.
   - Die Burg wird zur **Fraktion** (Komfort und Ressourcen, kaum Schaden).
   - Die Talente werden zu Finns **Systemkern** und gelten nur für Finn.
   - Global bleiben nur Komfort, Codex, Bestiarium und Modi.
5. **Regel für die Machtgrenze**:
   - Liegt eine Stufe mehr als eine Machtstufe über der Grenze des Helden, ist sie **gesperrt**, mit Buchbegründung.
   - Liegt sie genau eine Stufe darüber, ist sie **spielbar, aber brutal**.
   - Alles darunter wird mit wachsender Heldenstufe leichter.

### Wie es am Ende aussieht
- Heldenkarte Peter: **„Wight · Stufe 23 · Macht: Vampirritter-Niveau · Grenze bis Etappe 9“**.
- Auf der Karte zeigt eine rote Stufe beim Antippen: **„Zu stark für Peter (Demon General). Im Buch kämpft hier Finn.“**
- Nach einem Lauf zeigt das System: **„+1 Meisterschaft Blutwisch: Reichweite +10 %. Neuer Titel: Bestienjäger.“** Nicht nur „+3 % Schaden“.

---

## 7. Das System (Tab „System“), Zielbild

**Aussehen:**
- Blau-schwarze Leere, feine Leuchtlinien, eckige Fenster, eine leichte Glitch-Animation beim Öffnen und ein Systemton.
- Kein Gold.
- Überschriften immer in der Form `[ SYSTEM ] · …` (wie jetzt schon).

**Bereiche (oben als Reiter, auf dem Handy als Kacheln):**
1. **Status**: Name, Form, Stufe und EP-Balken, Werte (Stärke, Beweglichkeit, Ausdauer, Qi, Blutpunkte), Titel. Wie das Statusfenster im Buch.
2. **Quests**: Story-Quests aus den Etappen („Finde das Buch“, „Trinke das Blut von 5 Dämonenkönigen“), dazu Tages- und Wochenquests. Ersetzt die heutigen „Aufgaben“.
3. **Fähigkeiten**: alle freigeschalteten Fähigkeiten mit Stufe, Meisterschaft und nächster Belohnung.
4. **Evolution**: der Formpfad als Leiter von Mensch bis „Der letzte Vampir“, mit aktueller Position, Sperre und Buchkapitel.
5. **Analyse**: die Akten der anderen Helden und der Bosse (Codex und Bestiarium in einem, „Inspect“ aus dem Buch). Hier sieht man Machtstufen.
6. **Systemkern**: die heutigen Talente, aber **gezielt verbessert statt gezogen**. Jede Stufe verlangt eine Quest oder einen Meilenstein, nicht nur Seelen.

**Nach jedem Lauf** meldet sich das System mit 1–3 Zeilen: „Quest erfüllt · Meisterschaft gestiegen · neue Analyse“.

---

## 8. Fraktion (Tab „Fraktion“, ersetzt „Familie“)

**Aus dem Buch:** Finn gründet die **Cursed Faction** („Die Verfluchten“, so heißt der Bereich heute schon). Später wird daraus die **10. Vampirfamilie** mit eigener Burg und Territorium, im Bündnis oder Streit mit den anderen Familien, Graylash, Pure und dem Militär.

**Stufe 1 (Einzelspieler, baue ich zuerst):**
- **Übersicht**: Wappen, Rang (Gruppe → Fraktion → Vampirfamilie → Bündnis), Ressourcen.
- **Mitglieder**: Figuren aus dem Buch werden **angeworben**, nicht automatisch freigeschaltet: über eine Story-Quest, eine Beziehung oder Ressourcen. Jedes Mitglied hat eine Aufgabe (Wache, Schmied, Forschung, Begleiter).
- **Festung**: Gebäude (Trainingshalle, Schmiede, Krankenstation, Forschung, Wachtürme). Die Gebäude geben Komfort, Ressourcen und Begleiter-Plätze, **aber keine pauschalen Schadensprozente**.
- **Angriffe**: Feindliche Fraktionen aus dem Buch (Pure, Dalki, Familiars, Divines) greifen zu bestimmten Zeiten an. Das ist ein **Verteidigungslauf** auf der eigenen Burg. Gewonnen gibt es Ressourcen, verloren wird ein Gebäude beschädigt.
- **Chronik**: Was deine Fraktion erlebt hat, mit Buchbezug.

**Stufe 2 (später, braucht einen Server):** echten Spieler-Fraktionen beitreten und sich gegenseitig angreifen. **→ Entscheidung E2.**

**Begleiter sind nicht mehr unverwundbar.** Sie können ausfallen und stehen nach dem Lauf wieder bereit.

---

## 9. Navigation, Zielbild

**Untere Leiste:** Kampagne · Helden · Schmiede · Fraktion · System · **Modi**

- **Modi** ist ein eigener Hub mit drei großen Karten:
  - **Boss-Turm** mit echten Stockwerken, Boss-Portrait, Modifikator und Bestleistung.
  - **Endlos** mit Risiko-Modifikatoren und eigenem Rekord. Der Name kommt aus dem Buch, z. B. „Die endlose Nacht im roten Raum“, statt „Aschefriedhof/Vaelgor“.
  - **Prüfungen** mit Sonderregeln, zum Beispiel:
    - Blutlose Nacht.
    - Nur eine Fähigkeit.
    - Bossrausch.
    - „Vom Nichts zum Gott“: jeder Lauf ab Mensch, also der heutige Finn-Modus.
- **Quests** sind ein Knopf mit Zähler oben in der Kopfleiste und öffnen ein Overlay mit Zurück.
- **Die Seitenknöpfe auf der Karte fallen weg** (sie doppeln die Leiste).
- **Aktiver Tab**: Das Icon wird größer, bekommt einen goldenen Schein und einen kleinen Unterstrich. Keine gelbe Fläche.
- **Jede Unterseite**: Zurück-Pfeil oben links.
- **Kopfleiste**: Portrait, Heldenname und **Heldenstufe** (statt „0 ★“), Seelen, Kristalle, Quests, Einstellungen.

---

## 10. Kampagne als Reise, Zielbild

- **Pfad statt Kachelgitter**: Die Stufen liegen als Knoten auf einem geschwungenen Weg über die Insel der Etappe.
- **Jeder Knoten zeigt seinen Typ** als Symbol:
  - ⚔ Duell
  - ⏳ Durchhalten
  - 🎯 Jagd
  - 🌊 Überleben
  - 👑 Wellenboss
  - 🩸 Bloodsucker
  - ☠ Boss

  Dazu das Mini-Portrait des Bosses und die Begleiter-Avatare.
- **Beim Antippen** erscheinen die Boss-Karte (GPT-Bild), die Machtstufe, deine Chance („leicht / fair / hart / zu stark“), die Belohnung und der Storytext.
- **Etappenkopf**: großer lesbarer Titel, Ort, Buchkapitel, Fortschritt (Stufen und Sterne).
- **Inseln**: Das GPT-Etappenbild wird die Insel, statt der grauen Klötze.
- **Später**: neue Knotenarten wie Dialog, Entscheidung, Entdeckung und Training.

---

## 11. Helden, Zielbild („Charakterraum“)

- **Oben**: großes Portrait (bereits vorhanden) oder das 3D-Modell, das sich dreht. Name, Spezies, Form, Heldenstufe, Machtstufe, Rolle.
- **Reiter**:
  - Übersicht
  - Formen (Evolutionspfad)
  - Fähigkeiten
  - Meisterschaft
  - Ausrüstung
  - Lore (Buchzitat-Zusammenfassung, eigene Worte)
- **Gesperrte Helden** zeigen auf der Karte, wie man sie bekommt: „Etappe 5 abschließen“ oder „in der Fraktion anwerben“.
- **Vergleich**: Wer gerade einen anderen Helden ausgewählt hat, sieht die Werte nebeneinander.

---

## 12. Schmiede, Zielbild

- Die Kulisse bleibt. **Links** fünf Slots, **Mitte** ein großes Item mit Illustration, **rechts** der Vergleich (alt → neu) und die Kristalle.
- **Ausrüstung pro Held**, mit Buchgegenständen, die über die Story freigeschaltet werden:
  - Twin Tail Chain
  - God-Slayer-Rüstung
  - Asura-Handschuhe
  - Drachenrüstung
  - die Stiefel für lautlosen Flug

  Dazu schmiedbare Bestienausrüstung in den Kristallstufen des Buchs: Basis → Mittel → Hoch → König → Halbgott → Dämon, mit Farbrahmen je Stufe.

---

## 13. Gameplay-Optik, Zielbild

**Stil:** dunkle, stilisierte Fantasy in 2.5D. Die Chibi-Figuren bleiben (sie passen zu den Portraits), aber **Boden, Deko und Gegner kommen auf dasselbe Niveau**.

1. **Der Spieler ist immer erkennbar**:
   - leuchtender Ring am Boden in der Formfarbe,
   - leichter Rand-Schein,
   - Gegner in Etappe 1 bekommen **andere Uniformfarben und sind etwas kleiner**,
   - Finn trägt ab Halbling sichtbare Blutakzente.
2. **Boden**: GPT-Texturen je Szene (Liste: `SZENEN-LISTE.md`, auf etwa 20 Texturen zusammengefasst), dazu Flecken, Blut, Lichtinseln. Das Steinplattenmuster verschwindet (C8).
3. **Deko**:
   - Die Kisten und Platten fliegen raus.
   - Pro Szene 6–10 passende Objekte (Quaternius/KayKit, dunkel eingefärbt).
   - Arenarand mit Wasser, Lava und Abgründen.
4. **Gegner**: Quaternius-Monster für Bestien, klare Silhouette pro Rolle, Elite mit Aura und Namensschild.
5. **Effekte**, drei Sprachen:
   - **Blut**: tiefrot, flüssig, Sicheln.
   - **Schatten**: schwarz-violett, Rauch.
   - **Qi**: hell, Linien, Druckwellen.
6. **Treffergefühl**:
   - Gegner blitzen weiß auf, mit kurzem Rückstoß.
   - Kurzer Trefferstopp bei großen Schlägen.
   - Schadenszahlen in Stufen (normal / kritisch / Fusion).
   - Bildschirmwackeln abschaltbar.
7. **Evolution als Szene**: Pause, Abdunkeln, Systemton, „[ SYSTEM ] Evolution“, Aura, Zoom, neues Aussehen, neue Fähigkeiten.
8. **HUD**:
   - Größere Zahlen.
   - Das Ziel steht oben als schmales Band, nicht als Fenster in der Mitte.
   - Der Tutorial-Text erscheint unten und gut lesbar.
   - „Erwachen“ erst, wenn es verfügbar ist.
9. **Level-up-Karten**:
   - Keine Duplikate (C2).
   - Als Mensch gibt es kleine eigene Karten (Sprint, Faustschlag, Ausweichen), keine Füllkarten.
   - Werte alt → neu.
   - Fusionshinweis.

---

## 14. Umsetzungsreihenfolge (final)

| Phase | Inhalt | Wer |
|---|---|---|
| **A: Sofort-Fixes** | C1 undefined, C2 doppelte Karten, C6 Prototyp-Namen, C7 Seitenknöpfe raus, Zurück-Pfeile, aktiver Tab, Etappen-Banner lesbar, „ETAPPE 1“-Etikett, gesperrte Knöpfe erkennbar, Belohnungs-Symbole beschriftet, Pause mit Bestätigung und Einstellungen, Freischaltbedingung auf Heldenkarten, Namen vereinheitlichen | ich |
| **B: Progressions-Fundament** | Machtstufen, Machtkurve pro Held, Spielstand pro Held, Kampagne startet in Storyform (C3), Boni umziehen (C4), Machtgrenze mit Buchbegründung, Prüfung beim Bauen (keine undefined, keine kaputten Verweise) | ich |
| **C: System + Helden** | System-Hub (Status, Quests, Fähigkeiten, Evolution, Analyse, Systemkern), Charakterraum, Evolutionspfad | ich, GPT: Hintergründe |
| **D: Navigation + Modi** | Modi-Hub, Quests als Overlay, Boss-Turm-Stockwerke, Endlos mit Modifikatoren, Prüfungen, „Vom Nichts zum Gott“ als Prüfung | ich |
| **E: Kampagne als Reise** | Pfad, Typ-Symbole, Boss-Portraits, Chancenanzeige, Etappenbilder als Inseln | ich, GPT: Etappenbilder und Boss-Karten |
| **F: Schmiede + Fraktion (Stufe 1)** | Item-Ansicht, Buchausrüstung pro Held, Fraktion mit Übersicht, Mitgliedern, Festung, Anwerben, Verteidigungsläufen | ich, GPT: Item- und Burgbilder |
| **G: Gameplay-Optik** | Boden, Deko, Quaternius-Gegner, Spielerkennung, Effektsprachen, Treffergefühl, Evolutionsszene, HUD | ich, GPT: Bodentexturen |
| **H: Klang** | Musik und Soundeffekte einbauen, Lautstärkeregler, Vibration | du besorgst, ich baue ein |
| **I: Später** | neue Kampagnenknoten (Dialog, Entscheidung), Online-Fraktionen (Server), Controller-Steuerung, Querformat-Layout | offen |

---

## 15. Was du besorgst (ergänzt die Liste in `WUNSCHLISTE.md`)

**Neu durch diesen Bericht:**
1. **GPT: Hintergrund System-Hub** (blau-schwarze digitale Leere, Linien, Hochformat).
2. **GPT: Hintergrund Charakterraum** (dunkler Raum, Lichtkegel von oben).
3. **GPT: Hintergrund Fraktion** (Burgsaal mit Bannern, Kriegstisch).
4. **GPT: Hintergrund Modi-Hub**, dazu drei Kartenbilder (Boss-Turm, endlose Nacht, Prüfungsarena).
5. **GPT: Evolutionsbilder Finn**: acht Formen von Mensch bis „Der letzte Vampir“, gleicher Bildausschnitt.
6. **GPT: Knoten-Symbole der Kampagne** (7 Stück, siehe Kapitel 10).
7. **GPT: Illustrationen der Buchausrüstung** (Twin Tail Chain, God-Slayer-Rüstung, Asura-Handschuhe, Drachenrüstung, Stiefel) und sechs Rahmen für die Kristallstufen.
8. **GPT: Fraktionswappen der Verfluchten** und fünf Wappen feindlicher Fraktionen.

**Bleibt aus der alten Liste:** Musik, Soundeffekte, Etappenbilder 6–15, Boss-Karten, Bodentexturen, Epilog-Bild, Lizenzprüfung des Bestiary-Pakets.

Die Prompts zu allen GPT-Punkten schreibe ich dir, sobald du „los“ sagst.

---

## 16. Entscheidungen, die nur du treffen kannst

- **E1 Ausrichtung:** Handy bleibt **Hochformat** (meine Empfehlung), oder alles auf Querformat umbauen (GPT)?
- **E2 Fraktion:** zuerst **Einzelspieler** mit Buch-Fraktionen als Gegnern (meine Empfehlung), oder direkt online mit echten Spielern (braucht Server und Konten, großes eigenes Projekt)?
- **E3 Kampagne für andere Helden:** Spielen Peter und die anderen **Finns Etappen mit Machtgrenze** (meine Empfehlung, sofort machbar), oder bekommt jeder Held **eigene Story-Etappen** aus seiner Buchperspektive (sehr viel Inhalt)?
- **E4 Alter Finn-Modus:** „Jeder Lauf ab Mensch“ bleibt als **Prüfung „Vom Nichts zum Gott“** erhalten (meine Empfehlung), oder er fällt ganz weg?

---

## 17. Definition of Done (gemeinsam mit GPT)

- Im ganzen Spiel steht nirgends mehr „undefined“ oder ein Prototyp-Name. `build.js` bricht bei Datenfehlern ab.
- Jede Seite hat einen Zurückweg, und kein Bereich doppelt einen anderen.
- Peter startet schwach. Finns Fortschritt hilft ihm nicht. Zu starke Stufen sind mit Buchgrund gesperrt.
- Finn startet in Etappe 10 als Vampirlord, nicht als Mensch.
- Das System zeigt Status, Quests und Meisterschaft, und nach jedem Lauf gibt es eine Systemmeldung.
- Im Kampf erkennt man Finn in unter einer Sekunde, der Boden hat kein Gitter, und Treffer fühlen sich an.
- Die erste Evolution ist eine Szene, keine Einblendung am Rand.
