# Auftrag: „My Vampire System“ weiterentwickeln (Handy, 3D, Anime)

## Rolle und Ziel
Du bist Game Director und Entwickler eines privaten Fan-Spiels zu „My Vampire System“.
Ziel: ein Story-Action-Spiel fürs Handy, das sich anfühlt wie Solo Leveling: ARISE –
schnell, wuchtig, stylisch –, aber treu zur Romanhandlung. Der Spieler soll spüren,
wie Quinn vom verlachten „Stufe 1“ zu etwas wird, vor dem sich alle fürchten.

## Stand (Repo p8f25dd8tp-creator/vampir, Branch claude/survivors-mobile-game-m3ke30)
- Code: vampirsystem/game/src (Vanilla JS, Three.js aus dem CDN, eigene Anime-Figuren).
  Build: `node build.js` → mvs-artifact.html → als Artifact veröffentlichen
  (Link bleibt: https://claude.ai/artifact/NzED6xC5rsZRrvr6DNwRip).
- Story: Etappe 1–7 spielbar (Kap. 1–138). Kapitelnotizen: vampirsystem/story/kapitel-notizen.md.
- 3D: Etappe 1–5 inkl. Orte, Porträts, Animationen (Schlüsselposen), begehbarer Hof
  mit Räumen. Etappe 6–7 laufen noch in 2D.
- Offen: Etappe 6–7 in 3D, Etappe 8–12 (Kap. 139–400), Szenen-Hintergründe 3D,
  Werte-System spürbar machen (siehe unten), Raten-vs-Mono-Siegbedingung prüfen.

## Feste Regeln
- Keine Romantexte, keine Zitate: nur eigene deutsche Zusammenfassungen.
  Nichts erfinden, was der Roman nicht hergibt; bei Unklarheit Notizen prüfen.
- Alles auf Deutsch; Namen im englischen Original, Fähigkeiten und Bestien auf Deutsch.
- Alle Figuren und Orte eigene Gestaltung.
- Handy zuerst: Hochformat, Daumensteuerung, flüssig auf Mittelklasse-Handys.
  Automatische Qualitätsstufe und 2D-Rückfall beibehalten.
- Jede Etappe: bauen → Screenshots prüfen → Bot spielt komplett durch →
  commit + push → Artifact aktualisieren → kurzer Bericht auf Deutsch.
- Kein Pull Request ohne Rückfrage.

## Spielgefühl (Maßstab: Solo Leveling ARISE)
- Jeder Treffer hat Gewicht: Hitstop, Kamera-Punch, Einschlagstern, Knockback,
  Gegner-Reaktion je Richtung. Schwere Treffer schleudern, Finisher mit Zeitlupe.
- Kamera flach hinter der Figur, Zielerfassung, Zoom bei Skills und Kontern.
- Perfektes Ausweichen belohnt stark (Zeitlupe, goldener Konter, doppelter Schaden).
- Combo-Zähler, große Schadenszahlen, Skill-Knöpfe mit Abklingring.
- Jeder Gegner hat einen eigenen, lesbaren Stil (Tiger, Speer, Schwert, Voraussicht,
  Härtung …) und angekündigte Angriffe. Bosse haben Phasen.
- Look: dunkle, dramatische Orte, Neon-Effekte, Anime-Figuren mit Randlicht.

## Machtsystem nach Roman – und so muss es sich anfühlen
Kanon:
- „Stufe“ (1–8) misst aktivierbare Mutantenzellen, nicht Kampfkraft.
- Quinns „Stufe 1“ kommt aus dem Test in der Sonne (halbe Werte).
  Ohne Sonne gelten seine vollen Systemwerte.
- Früh schlägt er Kyle, Rylee (Stufe 2, mit Finte) und Brandon (Stufe 3).
  Mono (Stufe 6) trifft er nicht, gegen Leo reicht es nur zum Unentschieden.
- Halbling (Kap. 17): 15 HP. Stufe 4 im System: 25 HP (Kap. 54).
  Vampir (Kap. 86): Werte 15/15/15, HP 60.
- Blutgruppen: A → Stärke, B → Agilität, AB → Ausdauer, 0 → freier Punkt.
  Jede Person gibt nur einmal einen Punkt.
- Schwellen: Stärke 15 → Hammerschlag, Agilität 15 → Blitzschritt.
- Sonne: −50 % (Halbling), auf Caladi −70 bis −80 %; Schirm, Schatten und
  Schattenmantel heben das auf.

Zielgefühl (Richtwerte für das Balancing):
- Nachts gegen Stufe 1–2: Quinn ist ebenbürtig bis überlegen, mit sauberem Spiel
  klar gewinnbar. Stufe 3: fordernd, mit Taktik gewinnbar.
  Stufe 5–6 früh: kaum zu treffen, es geht ums Überleben.
- In der Sonne: schon Stufe 2 ist gefährlich, man fühlt sich deutlich schwächer.
  Die HUD-Warnung und ein sichtbar trägerer Quinn machen das klar.
- Nach der Evolution zum Vampir: die meisten Schüler sind klar unterlegen;
  echte Gegner sind Bestien, Dalki, Offiziere.

Werte spürbar machen (jeder Punkt merkbar):
- Stärke: +8–10 % Schaden pro Punkt über 10, mehr Rückstoß, mehr Haltungsschaden
  (Gegner taumeln früher). Ab 15 Hammerschlag.
- Agilität: +3 % Laufgeschwindigkeit, +2 % Angriffstempo, längerer Ausweichweg und
  größeres Perfekt-Fenster pro Punkt. Ab 15 Blitzschritt.
- Ausdauer: HP nach Kanon (Mensch 10, Halbling 15, Vampir 60 als Basis),
  mehr Ausdauerleiste, schnellere Erholung.
- Beim Verteilen im Status sofort eine Vorschau zeigen („Schaden 12 → 13“).
- EP bleiben frei verdienbar, Evolutionen bleiben an die Story gebunden.

## Welt und Erkunden
- Hof groß und lebendig: Schüler laufen umher, Tag/Nacht, Wetter und Licht.
- Gebäude sind betretbar. Innen: Story-Punkte, Dinge zum Erkunden (einmalig kleine EP)
  und später auch Nebenquests aus dem Roman. Beim Verlassen steht man vor der Tür.
- Verdeckende Objekte werden durchsichtig.

## Nächste Schritte (Reihenfolge)
1. Test von Etappe 5 und den Räumen abschließen, dann veröffentlichen.
2. Werte-System nach dem Abschnitt oben umbauen, alle Kämpfe neu balancieren
   (Bot-Tests je Etappe).
3. Etappe 6 in 3D: Ruinenstadt mit zwei Monden, Hangar, Trainings-Dom,
   Bestien Rattenkralle, Scordana, Blutsauger.
4. Etappe 7 in 3D: Wüste und Oase, Brunnenhaus, Zahnwurm, Flügelechse, Dalki.
5. Szenen-Hintergründe in 3D.
6. Etappe 8–12 nach den Kapitelnotizen, direkt in 3D.
7. Danach die Akademie-Etappen grafisch und spielerisch nachschärfen.
