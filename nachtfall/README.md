# 🌑 Nachtfall — Blut · Schatten · Qi

Ein Dark-Fantasy-**Survivors**-Spiel fürs Handy (iPhone & Android), inspiriert vom
Spielprinzip von *Vampire Survivors* — aber mit eigener Welt, eigenen Figuren,
eigenen Fähigkeiten und eigener, vollständig selbst erzeugter Grafik.

* **Offline spielbar**, keine Käufe, keine Werbung, kein Konto.
* Alles (Figuren, Gegner, Welt, Effekte, Icons, Klänge) wird im Spiel selbst
  erzeugt — es gibt **keine fremden Grafik- oder Audiodateien**, also keine
  Lizenzfragen. Einzige externe Dateien: die Schriften *Cinzel* und *Cormorant
  Garamond* (SIL Open Font License, frei nutzbar).

---

## Aufs Handy holen

### A) Als App-Icon (empfohlen, iPhone & Android)

Die Seite ist eine installierbare Web-App (PWA). Nach dem ersten Öffnen läuft sie
auch im Flugmodus.

1. Adresse öffnen: **https://p8f25dd8tp-creator.github.io/vampir/nachtfall/**
   *(wird automatisch per GitHub Pages veröffentlicht, siehe unten)*
2. **iPhone:** in **Safari** öffnen → *Teilen* (Quadrat mit Pfeil) → **„Zum Home-Bildschirm“**.
   **Android:** in **Chrome** öffnen → Menü ⋮ → **„App installieren“** bzw. „Zum Startbildschirm“.
3. Über das neue Icon starten → Vollbild, ohne Browserleiste.

### B) Als einzelne Datei

`nachtfall-standalone.html` ist das komplette Spiel in einer Datei (~550 KB).
Aufs Handy laden (z. B. per AirDrop / Dateien-App / Google Drive) und öffnen.

### C) Lokal am Rechner

```bash
cd nachtfall
npx http-server -p 8080 .
# dann http://<IP-des-Rechners>:8080 am Handy (gleiches WLAN) öffnen
```
Am Rechner spielbar mit **WASD/Pfeiltasten**, **Leertaste** = Ausweichen,
**E** = Ultimative Fähigkeit, **Esc** = Pause.

---

## Bedienung

| Geste | Wirkung |
|---|---|
| Daumen **irgendwo** aufsetzen und ziehen | schwebender Joystick — laufen (analog) |
| Knopf unten rechts (klein) | **Ausweichen** (kurz unverwundbar) |
| Knopf unten rechts (groß) | **Ultimative Fähigkeit** des Helden |
| ❚❚ oben rechts | Pause mit Build-Übersicht |

Angriffe laufen **automatisch**. Bei jedem Stufenaufstieg wählst du **eine von drei Karten**.

---

## Ein Lauf

* **10 Minuten** auf dem Aschefriedhof von Varn, Gegnerwellen werden dichter.
* Ereignisse: Fledermausschwärme, Ringe aus Untoten, Elite-Gegner.
* **5:00 — Hauptmann Kharn** (Zwischenboss, stürmt auf roten Linien los, lässt eine Truhe fallen).
* **9:00 — Vaelgor, der Gruftkoloss** (Endboss): rote Kreise = Hammerschlag,
  rote Bahn = Ansturm, Glockenschlag = Ring aus Feuerkugeln, ruft Diener,
  ab 50 % Leben rasend.
* **Sieg**, wenn Vaelgor fällt. **Niederlage**, wenn dein Leben auf 0 fällt.
* In jedem Lauf gibt es **Seelen** (auch bei Niederlage) → dauerhafte Gaben im **Altar der Nacht**.

---

## Die vier Helden

| | Graf Vorian | Liora | Nyx | Meister Shen |
|---|---|---|---|---|
| Titel | Der Blutgraf | Die Aderlasserin | Der Schattenläufer | Hüter der drei Kräfte |
| Silhouette | massig, Stachelkrone, Stehkragen-Umhang | schlank, langer Gehrock, Knochensichel | geduckt, Spitzkapuze, endloser Schal | breiter Strohhut, weite Ärmel, Bart |
| Start | Blutnova | Blutwisch | Schattenflammen | Qi-Handfläche |
| Mechanik | **Blutsaat**: Blut-Treffer setzen Blutmale (bis 5). Gegner mit 3+ Malen platzen beim Tod, Explosionen heilen ihn | **Blutrausch**: je weniger Leben, desto mehr Schaden (bis +90 %) und Tempo; 3 % Lebensraub ab Start | **Schattenfluss**: Bewegung lädt bis +45 % Schaden / +15 % Krit; Stillstand verliert ihn. Ausweichen = **Schattenschritt** (Teleport, schneidet, hinterlässt Köder) | **Qi-Kreislauf**: Stillstehen = Wurzelstand, sammelt Qi-Perlen (bis 5, je +5 % Schaden, −30 % erlittener Schaden) |
| Ultimativ | **Karminsturm**: zündet alle Blutmale gleichzeitig + Riesennova | **Aderlass**: 20 % Leben opfern → 6 s +60 % Schaden, 3× Lebensraub, doppelte Wische | **Mitternacht**: 4 s unverwundbare Schattengestalt, schneidet bei Berührung | **Harmonie**: verbraucht alle Perlen; Druckwelle + Heilung, ab 3 Perlen Schatten-Klone, bei 5 **Vollkommene Harmonie** (Zeitlupe + alle Fähigkeiten sofort bereit) |
| Stärken | Horden, zäh, Kettenreaktionen | Einzelschaden, heilt sich | schnellster Held, kurzes Ausweichen | alle drei Schulen, höchstes Kombo-Potenzial |
| Schwächen | langsam, kurze Reichweite | wenig Leben, keine Regeneration | zerbrechlich, schwach im Stillstand | langsamer Start, muss stillstehen; Blut/Schatten nur 85 % |


### Fünfter Held: Finn Müller (Evolutions-Held)

*Fan-Figur, angelehnt an „My Vampire System“ — nur für den privaten Gebrauch. Vor einer
Veröffentlichung (App Store, öffentliche Seite) Namen und Anlehnung ändern.*

Finns Evolutionen sind **dauerhaft** und werden **über viele Läufe** verdient. Im Lauf selbst
kämpft er nur mit den Kräften seiner aktuellen Form und verbessert sie über Karten.

* **Erster Lauf:** Mensch ohne jede Fähigkeit. Das Buch leuchtet in der Nähe (Pfeil am Rand) —
  wer es erreicht, wird Halbling, und zwar dauerhaft.
* Jeder Finn-Lauf bringt **Blutessenz** (Kills, Zeit, Stufe, Hauptmann, Sieg).
* Die nächste Form braucht genug Essenz **und** eine bestandene **Prüfung** in der aktuellen
  Form. Die Evolution passiert am Ende des Laufs (höchstens eine Stufe pro Lauf).

| Form | Bedingung | Kräfte (fest im Lauf) | Aussehen |
|---|---|---|---|
| Mensch | Start | keine | Kapuzenpulli, Brille |
| Halbling | Buch finden | Blutwisch, Blutspray | rote Augen, Blutflecken |
| Vampir | 600 Essenz + 5 Min. überleben | + Hammerschlag, Blitzschritt, Blitz-Teleport | Lederjacke, Fangzähne |
| Vampiradliger | 2 500 + Stufe 22 | + Schattenflammen; Nachtschlund/Nachbilder als Karten | Adelsmantel, Stehkragen |
| Vampirlord | 6 000 + Hauptmann Kharn besiegen | + Qi-Handfläche, Blutnova; Qi-Kette/Bluternte als Karten | Umhang, Krone, Qi-Tattoos |
| Himmlischer Vampirlord | 11 000 + Vaelgor besiegen | + Himmelsstrahl | Heiligenschein, Lichtflügel |
| Reiner Himmlischer | 18 000 + insgesamt 3 Siege | + Dreifaltiges Siegel | weißes Gewand, silbernes Haar |
| Gottbezwinger | 28 000 + Sieg mit über 50 % Leben | + Götterfall | schwarz-goldene Rüstung, große Flügel |

Ein guter Lauf bringt etwa 1 000–3 000 Essenz — bis zum Gottbezwinger sind es rund ein Dutzend
starke Läufe. Im **Testmodus** lässt sich jede Form in der Heldenauswahl direkt wählen; solche
Läufe zählen nicht für Essenz und Evolution.

**Freischaltung** (alles durch Spielen, keine Käufe):
Vorian von Anfang an · Liora: Stufe 12 in einem Lauf (oder 400 Seelen) ·
Nyx: 6 Minuten überleben (oder 700 Seelen) · Shen: Vaelgor besiegen (oder 1500 Seelen).
Für die Probeversion ist der **Testmodus „alle Helden frei“** eingeschaltet
(Einstellungen → ausschalten, um das Freispielen zu erleben).

---

## Kartenpool (15 Karten)

Bei jedem Stufenaufstieg: **genau 3 Karten**. Jede Karte zeigt, was **diese Stufe**
bewirkt, und was die nächste Stufe bringt. Pro Held gibt es **4 Fähigkeiten- und
4 Passiv-Plätze**.

**Fähigkeiten** (je 5 Stufen, jede Stufe verändert etwas Konkretes):

| Karte | Schule | Kern | Besondere Stufen |
|---|---|---|---|
| Blutnova | Blut | Explosion um dich | St. 3 Doppelschlag · St. 5 Blutlache (verlangsamt, verätzt) |
| Blutwisch | Blut | Sichelbogen vor dir | St. 3 Rückhand · St. 4 Blutung · St. 5 fliegende Blutklinge |
| Bluternte | Blut | kreisende Blutsicheln | mehr Sicheln · St. 5 Kills heilen |
| Schattenflammen | Schatten | zielsuchende dunkle Flammen | Durchbohren · St. 5 Flächenbrand |
| Nachbilder | Schatten | Köder-Nachbilder, die schneiden | St. 3 zwei gleichzeitig · St. 5 Zerfall-Explosion |
| Nachtschlund | Schatten | Risse, die Rudel ansaugen | mehr Risse · St. 5 Kollaps |
| Qi-Handfläche | Qi | Geisterhand, starker Rückstoß | St. 4 Zwillingshand · St. 5 Betäubung |
| Qi-Kette | Qi | springende Jadekugel | mehr Sprünge · St. 5 Resonanz-Ringe |

**Passive:** Lebensraub · Kettenreaktion · Vampirblut (Leben/Regeneration) ·
Nebelgang (Tempo, Ausweichen, ab St. 3 Nebelspur) · Grabesmacht (Schaden/Fläche) ·
Seelenmagnet (Sammelradius/Erfahrung) · Eiserne Meridiane (Rüstung, Qi, Rückstoß).

**Keine nutzlosen Angebote:** Jeder Held bekommt nur Karten aus seinem Pool;
Passive, die eine Schule brauchen (Kettenreaktion, Eiserne Meridiane), erscheinen
erst, wenn der Build sie nutzen kann; volle Plätze → keine neuen Fähigkeiten mehr,
nur Verbesserungen. Bereits besessene Karten werden bevorzugt, damit Builds
zielgerichtet wachsen. Wenn alles ausgebaut ist, gibt es Blutkelch/Seelenbeutel.
Einmal pro Lauf (mehr über den Altar) kann man **neu würfeln**.

### Element-Reaktionen (Blut × Schatten × Qi)

Jeder Treffer hinterlässt ein Mal seiner Schule (3 s). Ein Treffer einer **anderen**
Schule löst eine Reaktion aus:

* **Verderbnis** (Blut + Schatten): Gegner verrottet, speit beim Tod Schattenfeuer.
* **Aderbruch** (Blut + Qi): Zusatzschaden und ein Schluck Leben.
* **Leere** (Schatten + Qi): Betäubung, zieht Nachbarn ein.
* **Dreiklang** (alle drei): dreifarbige Explosion.

### Fusionen (goldene Karten)

Erscheinen automatisch als Karte, sobald die Voraussetzungen erfüllt sind — und
ändern Form, Animation und Spielweise, nicht nur den Schaden:

| Fusion | Voraussetzung | Wirkung | Helden |
|---|---|---|---|
| **Karmesinfinsternis** | Blutnova 4 + Schattenflammen 3 | schwarze Sonne saugt Gegner ein, detoniert, speit Schattenfeuer | Vorian, Nyx, Shen |
| **Drachenherz** | Blutwisch 4 + Qi-Handfläche 3 | Blut-Qi-Drache schlängelt sich durch die Horde, heilt | Liora, Shen |
| **Leerer Spiegel** | Nachbilder 3 + Qi-Kette 3 | Nachbilder werden meditierende Spiegel-Mönche mit Qi-Blitzen | Nyx, Shen |
| **Blutmondsicheln** | Bluternte 4 + Lebensraub 2 | drei gewaltige, pulsierende Blutmonde | Vorian, Liora, Shen |
| **Dreifaltiges Siegel** | je eine Blut-, Schatten-, Qi-Fähigkeit auf 3 | rotierendes Siegel feuert alle drei Kräfte, setzt alle Male | nur Shen |

**Sichtbare Aufwertungen:** Vorians Rüstungsadern glühen mit jeder Blutstufe, seine
Krone wächst mit Fusionen; Lioras Augen und Aura brennen mit dem Blutrausch; Nyx'
Schal wird länger und leuchtet im Schattenfluss; Shens Tattoos und Augen leuchten
mit jeder Qi-Perle, beim Wurzelstand erscheint eine Lotusblüte.

---

## Technik

* **HTML5 Canvas + JavaScript, ohne Bibliotheken.** Läuft in jedem modernen
  Handy-Browser, als installierbare Web-App und später unverändert in einer
  nativen Hülle (siehe unten).
* Figuren werden **als Skelett gemalt** (Pose → Gelenke per inverser Kinematik →
  gemalte Teile mit Verläufen), dann mit Kontur, Elementfarben-Randlicht und
  Mondlicht veredelt. Gegner werden beim Start in Animationsframes vorgerendert
  (schnell bei hunderten Gegnern), Held und Boss werden jeden Frame live gemalt
  (Umhang, Haare, Schal, Aufwertungs-Leuchten reagieren live).
* **Beleuchtung:** Lichtkarte (Umgebungslicht der Nacht + Lichtquellen von Held,
  Laternen, Kerzen, Pilzen, Geschossen, Effekten), multiplikativ über die Szene;
  leuchtende Effekte werden danach additiv gezeichnet. Dazu Nebelschichten, Vignette,
  Tiefensortierung, Schatten, Blutspritzer am Boden.
* **Lesbarkeit:** Held immer obenauf, mit farbigem Halo, Bodenring und Lebensbalken;
  Gegnergeschosse hell mit dunklem Rand; Boss-Angriffe mit roten Warnflächen;
  Pfeile am Rand zeigen Boss/Truhe außerhalb des Bildes.
* **Leistung:** Raumraster für Kollisionen, automatische Qualitätsanpassung
  (Auflösung/Partikel sinken, wenn die Bildrate fällt), manuell in den Einstellungen.
* Klänge & Musik: synthetisch per Web Audio (Ton startet nach der ersten Berührung — iOS-Regel).
* Speicherstand: `localStorage` (`nachtfall.save.v1`).

| Datei | Inhalt |
|---|---|
| `src/00-core.js` | Mathe, Speicherstand, Audio, Eingabe/Joystick, Canvas |
| `src/01-artkit.js` | Mal-Werkzeuge: Formen, Kontur, Randlicht, Lichter, Rauschen |
| `src/02-heroes.js` | die vier Helden (Skelett + Malerei) |
| `src/03-enemies-art.js` | Gegner, Hauptmann, Boss |
| `src/04-world-art.js` | Boden, Requisiten, Nebel, unendliche Welt |
| `src/05-data.js` | Helden, Karten, Fusionen, Reaktionen, Gegner, Wellen, Altar |
| `src/06-fx.js` | Partikel, Decals, Lichter, Schadenszahlen |
| `src/07-abilities.js` | alle Fähigkeiten, Fusionen, Ultimates, Ausweichen |
| `src/08-enemies.js` | Gegner-KI, Wellen, Boss-Verhalten |
| `src/09-game.js` | Lauf, Werte, Schaden, Reaktionen, Beute, Kartenangebot |
| `src/10-render.js` | Render-Pipeline |
| `src/11-ui.js` | Menüs, HUD, Karten, Pause, Ende, Altar, Chronik |
| `src/12-main.js` | Start, Hauptschleife, Qualität |
| `src/13-finn.js` | Finn Müller: Evolutionen, Figur, eigene Fähigkeiten, Buch |
| `build.js` | baut `nachtfall-standalone.html` und setzt die Offline-Cache-Version |
| `dev/` | Test-Werkzeuge (Bot, Balance-Simulation, Screenshots) |

### Nach Änderungen

```bash
node build.js        # Einzeldatei + Service-Worker-Version aktualisieren
```

### Tests (für Entwickler)

```bash
npx http-server -p 8765 -c-1 -s .      # im Ordner nachtfall
node dev/sim.js vorian,liora,nyx,shen 4  # Balance: komplette Läufe mit Bot
node dev/touch.js                        # Touch-Steuerung
node dev/scene.js nyx 552 /tmp/boss      # Screenshots zu einem Zeitpunkt
```

### Weg in die App-Stores (optional, später)

Das Spiel kann ohne Umbau mit **Capacitor** in eine native iOS-/Android-App verpackt
werden (`npx cap init`, `npx cap add ios/android`, Web-Ordner = `nachtfall/`).
Dafür braucht es einen Mac mit Xcode (iOS) bzw. Android Studio und Entwicklerkonten.
Für das Spielen und Testen ist das **nicht nötig** — die Web-App reicht.
