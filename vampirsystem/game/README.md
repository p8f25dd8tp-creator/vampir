# My Vampire System – Spiel (frühe Testversion)

Private Fan-Umsetzung von „My Vampire System“. Grundlage ist das Spielkonzept in
`../konzept/spielkonzept.md`: Story-Action-Spiel, schräg von oben (3/4, 2D), fürs Handy.
Alle Figuren sind eigene Zeichnungen, alle Texte eigene Nacherzählungen.

## Spielen

* **Am Handy ohne Server:** `mvs-standalone.html` in der *Dateien*-App öffnen.
* **Lokal:** `npx http-server -p 8080 .` und `http://<ip>:8080` am Handy öffnen.
* Nach Änderungen: `node build.js` erzeugt die Einzeldatei neu.

## Steuerung

| Handy | Tastatur | Wirkung |
|---|---|---|
| linke Bildschirmhälfte ziehen | WASD / Pfeile | laufen |
| ANGRIFF tippen | J | Combo aus drei Schlägen |
| ANGRIFF halten | J halten | aufgeladener Schlag, bricht die Deckung |
| AUSWEICHEN | K / Leertaste | Ausweichen mit kurzer Unverwundbarkeit |

Wer im letzten Moment ausweicht (die rote Bodenfläche ist gerade voll), löst ein
**perfektes Ausweichen** aus: kurze Zeitlupe und ein Konterfenster mit doppeltem Schaden.
Angriffe und Ausweichen kosten **Ausdauer**.

## Stand: Etappe 3

* Prolog „Das schwarze Buch“ (Kap. 1–3): das System erwacht, Statusfenster, Tagesquests, Sonne.
* Der Fähigkeitstest (Kap. 4–7): Vordens Handschlag, die Testgruppe, Messung in der Sonne mit
  halben Werten, die Ergebnisse der anderen.
* **Die Akademie als Hub** (Kap. 8–14): Schulhof mit Wohnheim, Bibliothek, Kantine und
  Trainingshalle. Tage und Nächte, Tagesquests „2 Liter Wasser“ und „Meide die Sonne“ (im Licht
  sind die Werte halbiert, der überdachte Hauptweg und die Gebäudeschatten schützen).
* „Der erste Kampf“ (Kap. 10–11): Kyle mit den Tigerkrallen. Belohnung: 50 EP und Inspect.
* „Training bei Nacht“ (Kap. 12): Ausweichtest gegen ein Trainingsgerät, Layla schaut zu.
* „Ungeschriebene Regeln“ (Kap. 13–14): Mono weicht jedem Angriff aus; Inspect ist in der
  Sonne nicht lesbar.
* **Etappe 3 (Kap. 15–23):** Credits (10 pro Tag), Vorden steckt Quinn Credits zu, die
  schwarze Maske aus dem Laden, nachts im Park **Rylee** (Verhärtung immer nur an einer Stelle –
  graue Platte; die Seite wechseln und dort treffen, wo er weich ist). Danach **Evolution zum
  Halbling** (+5 HP) und **Blood Swipe** (Knopf, kostet 1 HP, keine Abklingzeit), Blutdurst
  (weniger HP bis zum ersten Blut), Dan greift ein, der Biss in der Bibliothek (Blutgruppe A+,
  +1 Stärke) und die Abmachung mit Layla.
* INSPECT-Knopf: zeigt Name, Rasse, Fähigkeit, HP und Blutgruppe des nächsten Ziels.

## EP und Stufen (frei, nicht an die Story gebunden)

* EP gibt es für Schaden und Siege im Kampf, für Messwert, Ausweichen und Durchhalten, für
  Tagesquests, die Bibliothek und für freies **Training (EP)** in der Trainingshalle (ab Tag 2,
  beliebig oft). Auch Wiederholungen und Niederlagen geben die im Kampf verdienten EP.
* Jede Stufe gibt **einen Wertepunkt** (wie im Roman) für Stärke (Schaden), Agilität (Tempo,
  Ausweichen) oder Ausdauer (+1 HP, mehr Ausdauer). Verteilen im Status-Fenster (☰ im Hof,
  Pause-Menü oder nach dem Kampfbericht).
* Evolutionen (Halbling usw.) bleiben an die Story gebunden.

## Aufbau

| Datei | Inhalt |
|---|---|
| `src/00-core.js` | Mathe, Farben, Speicherstand, Klänge |
| `src/01-artkit.js` | Zeichenwerkzeuge (aus Nachtfall) |
| `src/02-figures.js` | Skelett-Posen und frei konfigurierbare Figuren |
| `src/03-platform.js` | Canvas, Ansicht, Handy-Steuerung |
| `src/04-combat.js` | Kampfkern: Combo, Ausdauer, Ausweichen, Konter, Gegner-KI |
| `src/05-render.js` | Arenen, Figuren, Angriffsmarkierungen, Effekte |
| `src/06-story.js` | Szenen, System-Fenster, Kampf-HUD |
| `src/07-missions.js` | Missionen als Daten |
| `src/08-main.js` | Titel, Ablauf, Hauptschleife |
