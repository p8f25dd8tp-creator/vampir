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

## Stand: Etappe 1

* Prolog „Das schwarze Buch“ (Kap. 1–3): das System erwacht, Statusfenster, Tagesquests, Sonne.
* „Der erste Kampf“ (Kap. 10–11): Kyle mit den Tigerkrallen, Verwandlung ab halber Kraft,
  Tutorial im Kampf. Belohnung: 50 EP und Inspect.

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
