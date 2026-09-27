> **Neu:** [**Nachtfall**](nachtfall/) — ein Dark-Fantasy-Survivors-Spiel mit fünf Helden (Blut · Schatten · Qi). Details in [`nachtfall/README.md`](nachtfall/README.md).

# 🩸 Blutmond — Vampir Tower Defense

Ein Tower-Defense-Spiel fürs iPhone. Du bist ein Vampirfürst, verteidigst deine
Burg gegen Jägertrupps, Priester und Inquisitoren — und wirst dabei mit jedem
Kampf stärker: **Blut**, **Schatten** und **Qi**.

Läuft komplett im Browser, ohne App Store, ohne Konto, ohne Internet (nach der
ersten Installation). Alles ist in reinem HTML5/Canvas gebaut — keine Bibliotheken,
keine Grafik- oder Audiodateien.

---

## Aufs iPhone holen

### Variante A — als App-Kachel (empfohlen)

So bekommst du ein echtes Icon auf dem Home-Bildschirm, Vollbild ohne Safari-Leiste
und Offline-Betrieb.

1. Das Spiel muss unter einer `https://`-Adresse liegen. Am einfachsten über
   **GitHub Pages**: im Repository auf *Settings → Pages* gehen und als Quelle
   `Deploy from a branch` mit diesem Branch und dem Ordner `/ (root)` wählen.
   (Alternativ *Source: GitHub Actions* — der mitgelieferte Workflow erledigt den Rest.)
2. Die Adresse in **Safari** öffnen (nicht Chrome — nur Safari kann installieren).
3. Unten auf **Teilen** (Quadrat mit Pfeil) tippen.
4. **„Zum Home-Bildschirm"** wählen → *Hinzufügen*.

Fertig. Das Spiel liegt jetzt als Icon auf dem Home-Bildschirm und startet im
Vollbild. Nach dem ersten Start funktioniert es auch im Flugmodus.

### Variante B — als einzelne Datei

`blutmond-standalone.html` ist das komplette Spiel in **einer** Datei (~115 KB).
Herunterladen, in der *Dateien*-App speichern und antippen — läuft sofort, ganz
ohne Server. Kein Home-Bildschirm-Icon, dafür null Aufwand.

### Variante C — lokal testen

```bash
npx http-server -p 8080 .
# dann http://<deine-ip>:8080 am iPhone öffnen
```

---

## Wie es sich spielt

**Ziel:** Überlebe auf jeder Karte die geforderte Anzahl Wellen, ohne dass deine
Burg fällt.

### Grundschleife

* **Blut 🩸** ist die Währung im Kampf. Du bekommst es aus getöteten Feinden,
  am Ende jeder Welle und als Bonus, wenn du die nächste Welle früher rufst.
* **Türme setzen:** unten einen Turm antippen, dann auf ein freies Feld tippen.
* **Turm antippen** öffnet sein Fenster: aufwerten (bis Stufe 4) oder verkaufen
  (60 % zurück).
* **Fähigkeiten** unten links haben eine Abklingzeit und wirken auf das ganze Feld.
* **1× / 2× / 3×** oben beschleunigt das Spiel.

### Der Fürst wird stärker — auf zwei Ebenen

**Im Kampf:** Jeder getötete Feind gibt Erfahrung. Bei jedem Stufenaufstieg wählst
du eine von drei zufälligen **Gaben** — mehr Schaden, mehr Reichweite, Kritische
Treffer, doppelte Treffer, Burgleben und mehr. Kein Kampf spielt sich gleich.

**Dauerhaft:** Jeder Kampf bringt **Seelen** — auch wenn du verlierst. Die gibst du
im Fähigkeitsbaum aus. Was du dort lernst, gilt ab sofort in *jedem* Kampf. Dazu
steigt dein **Rang**, der zusätzlich Schaden und Burgleben schenkt.

### Die drei Schulen

| Schule | Türme | Charakter |
|---|---|---|
| 🩸 **Blut** | Blutdorn, Aderlass-Altar | Solider Einzelschaden, Blutraub, Blutungen die Rüstung ignorieren |
| 🌑 **Schatten** | Schattenklinge, Nebelgrube | Extrem schnelle Angriffe, kritische Treffer, Verlangsamung |
| ☯ **Qi** | Qi-Stele, Meridian-Tor | Flächenschaden und Verstärkung benachbarter Türme |

Die Gegner haben unterschiedliche Widerstände — darum lohnt sich eine Mischung:

* **Priester** widerstehen Blut (0,5×), sind aber anfällig für Qi und heilen ihre Umgebung.
* **Ordensritter** haben viel Rüstung und schlucken Blut/Schatten — Qi bricht sie (1,45×).
* **Weihgeister** stecken Schatten fast weg (0,45×), nehmen aber Blut besonders gut (1,35×) — und sie lassen sich von nichts verlangsamen.
* **Werwölfe** rennen unter 50 % Leben deutlich schneller.
* **Inquisitoren** (alle 5 Wellen) sind zäh, gepanzert und heilen andere.

### Karten

1. **Friedhof von Varna** — 20 Wellen
2. **Kathedrale im Nebel** — 25 Wellen *(nach Karte 1)*
3. **Bergkloster Qi-Lin** — 30 Wellen *(nach Karte 2)*

Nach dem Sieg kannst du **endlos** weiterkämpfen und Seelen farmen.

---

## Technisches

| Datei | Zweck |
|---|---|
| `index.html` | Gerüst, Styles, Meta-Tags für die iOS-Installation |
| `game.js` | Das komplette Spiel (Daten, Simulation, Rendering, UI) |
| `sw.js` | Service Worker — macht das Spiel offline-fähig |
| `manifest.webmanifest` | App-Name, Icon, Vollbildmodus |
| `icons/` | App-Icons (192, 512, 180 für Apple) |
| `build-standalone.js` | Baut `blutmond-standalone.html` (`node build-standalone.js`) |

* Alles wird auf eine virtuelle Fläche von 720 × 1280 gezeichnet und passend
  skaliert — sieht auf jedem iPhone gleich aus.
* Klänge sind kleine Oszillatoren (Web Audio), keine Dateien. Der Ton startet
  erst nach der ersten Berührung — so will es iOS.
* Der Spielstand liegt in `localStorage` unter `blutmond.save.v1`. Im Hauptmenü
  gibt es einen Knopf zum Zurücksetzen.

### Nach Änderungen an `game.js`

Die Einzeldatei-Version neu bauen und die Cache-Version hochzählen, damit
installierte Geräte das Update ziehen:

```bash
node build-standalone.js
# in sw.js:  const CACHE = 'blutmond-v2';
# in index.html und sw.js:  game.js?v=2
```
