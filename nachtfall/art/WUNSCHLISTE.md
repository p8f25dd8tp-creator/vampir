# Wunschliste: schöner aussehen, besser spielen

Hier sammle ich beim Bauen der Etappen alles, was das Spiel noch besser machen würde.
**Du besorgst** = das brauche ich von dir. **Ich baue** = mache ich selbst, sobald wir in der Verschönerungsphase sind.

---

## GESAMTLISTE (Stand: alle 15 Etappen fertig)

### Du besorgst
1. **Musik, 7 Stücke** (CC0, .ogg oder .mp3, je unter 3 MB) nach `art/musik/`: `menue`, `kampf_1`, `kampf_2`, `boss`, `siedlung`, `sieg`, `niederlage` (Stimmungen siehe unten).
2. **Musik, 2 Zusatzstücke:** `redspace.ogg` (roter Raum, bedrohlich und dröhnend, für Etappe 14 und 15) und `finale.ogg` (episch mit Chor, für Immortuis Endform).
3. **Soundeffekte** als ein CC0-Paket (z. B. Kenney „Impact Sounds“ plus ein RPG-Paket) nach `art/sfx/`: Treffer, Blut, Explosion, Blitz, Feuer, Eis, Boss-Brüllen, Level-up, Münze, Klick.
4. **GPT: Etappenbilder 6 bis 15** (10 Bilder, Hochformat). Die Prompts schreibe ich dir.
5. **GPT: Boss-Intro-Karten.** Es gibt 143 Bosse. Vorschlag: zuerst die rund 30 wichtigsten (Endbosse jeder Etappe und Schlüsselfiguren), danach in Paketen zu je 10. Die Prompts schreibe ich dir paketweise.
6. **GPT: Bodentexturen.** Die 90 Szenen aus `SZENEN-LISTE.md` fasse ich auf etwa 20 kachelbare Texturen zusammen (z. B. „roter Kristallboden“ für den ganzen roten Raum). Den Prompt-Block bekommst du von mir.
7. **GPT: UI für die Tabs Helden, Familie und System** (Rahmen, Karten, Reiter im Stil der 25 vorhandenen UI-Bilder). Die Prompts schreibe ich dir.
8. **GPT: Epilog-Bild** – Finn legt sich in der Gruft der Siedlung schlafen (für den Abschluss nach Etappe 15).
9. **Lizenz prüfen** für das Quaternius-Bestiary-Paket (Imp, Puglin): Nur mit klarer Lizenz kommt es ins öffentliche Repo.

### Ich baue
10. **Quaternius-Monster** statt der einfachen Gegnerformen, dunkler eingefärbt.
11. **Neue UI in den Tabs Helden, Familie und System** mit den GPT-Rahmen.
12. **Boss-Intro-Karte** mit Bild und Name, wenn ein Boss erscheint.
13. **Eigene Angriffe für wichtige Bosse:**
    - Boneclaw teleportiert sich.
    - Jin lässt Blut regnen.
    - Vadeen legt Fallen.
    - Der King-Hund rollt als Stachelkugel.
    - Kronker schießt Kristallstacheln.
    - Luce zieht Lichtspuren.
    - Tenbris erzeugt Sogwirbel.
    - Immortui erzeugt eine Farblos-Zone, die Geschosse auflöst.
14. **Durchhalte-Stufen** (z. B. Unzoku, Immortui, Mundus) mit sichtbarem Countdown und einem Satz vom System.
15. **Musik und Sounds einbauen**, sobald sie da sind, mit getrennten Lautstärkereglern.
16. **Bodentexturen je Szene einbauen.**
17. **Deko am Arenarand:** Wasser, Lava, Abgründe, Brücken.
18. **Bloodsucker-Optik** für Stufen wie „Kronkers wahre Form“: Flügel und Blutbomben.
19. **Seelenwaffe „Twin Tail Chain“** sichtbar machen.
20. **Kleinigkeiten:**
    - Vibration bei starken Treffern (abschaltbar).
    - Begleiternamen zum Stufenstart.
    - Kurzes Tutorial in Etappe 1.

---

## Du besorgst

### 1. Musik (wichtigster Punkt, bisher läuft nur erzeugter Klang)
Lizenz **CC0** oder „frei nutzbar ohne Namensnennung“, Format **.ogg oder .mp3**, je Stück unter 3 MB.
Gute Quellen am PC: *OpenGameArt.org* (Filter: CC0), *Pixabay Music*, *Incompetech*-Alternativen mit CC0.
Hochladen nach `nachtfall/art/musik/`.

| Datei | Stimmung |
|---|---|
| `menue.ogg` | ruhig, düster, gotisch (Orgel oder Chor, langsam) |
| `kampf_1.ogg` | treibend, mittleres Tempo (normale Stufen) |
| `kampf_2.ogg` | schneller, härter (späte Etappen) |
| `boss.ogg` | episch, Trommeln, Chor |
| `siedlung.ogg` | Vampirstadt: elegant, unheimlich, Streicher |
| `sieg.ogg` | kurzer Sieges-Jingle (5–10 s) |
| `niederlage.ogg` | kurzer trauriger Jingle |

### 2. Soundeffekte
Auch CC0, **.ogg oder .wav**, kurz (unter 1 s). Ein fertiges Paket wie
*„Kenney Impact Sounds“* oder *„RPG Sound Pack“* (OpenGameArt, CC0) reicht völlig.
Hochladen nach `nachtfall/art/sfx/`.
Wichtig: Treffer (Faust, Klinge), Blutspritzer, Explosion, Blitz, Feuer, Eis, Boss-Brüllen, Level-Up, Münze/Kristall, Knopf-Klick.

### 3. GPT-Bilder
- **UI-Elemente** aus `UI-PROMPTS.md` (29 Stück), steht schon bereit.
- **Boss-Karten** für die neuen Bosse aus Etappe 3 und 4. Die Prompts schreibe ich dir gesammelt,
  sobald alle Etappen stehen (Boneclaw, Horn-Kaninchen, Clark, Jin, Edward, Borden, Vadeen, Paul,
  Linda, Hypolord, King-Hunde, Lemon, Gox, Kiln und Tupple, Chrimeta, Vicky und Pai, Sand Ruler,
  Feuer-Stein-Bestie, Mantis, Rowa, Helen, Tulk, Lucy, Diamant-Krabbe, Hilston, Bryce, Amber,
  Ovinnik, Remus, Cindy in der Königsrüstung, Sach, Martial Art God, Weiße Motte, rosa Baum, Dred,
  schwarzer Drache, Longblade, Agent 2, Demi-God aus Erde, Graham, Slicer, Eno, Sechs-Stachel-Dalki,
  galaktischer Wurm, Dullahan, Laxmus, Samantha, Agent 3, Genbu, Vorti Ape, Doppelgänger, One Horn,
  Doppelellenbogen-Dalki, Dalki-Helen, Blob, zweite Drachenhälfte, Green Horn, Graham mit acht Stacheln,
  Tikker, Hybrid-Werwolf, Derik, Andy, Lock, Russ, Chris mit Werwolf-DNA, Sedi-Riese, Athos, Laser-Dalki,
  Yanny, Zero, roter Werwolf, Hinto, Kipo, Gorgath, Emma als Königin der Dhampire, Escam, Edvard, Nell,
  Rankenmensch, graue Eule, Grenlet, Spinnenfels, Prophet, Magnus, Ray als roter Drache, Jim mit X-Blut,
  H, Stark, Mundus, Affenkönig, Phönix, Behemoth, Asura, Pine, Sera, Ray in der Drachenrüstung,
  Magnus in Albtraumform, Demon General, Lexor, Kronker, Kronkers wahre Form, Unzoku, Immortui, Yak-General,
  Cia als Banshee, Bisha, Luce, Calva, Tenbris, Luces Dämonenform, Immortuis Endform).
- **Bodentexturen**: Liste wächst in `SZENEN-LISTE.md`.

---

## Ich baue (Verschönerungsphase)

### Aussehen
- Quaternius-Monster (liegen schon in `art/glTF`) statt der einfachen Gegnerformen, dunkler eingefärbt.
- Neue UI mit den GPT-Rahmen: Kampagne, Helden, Familie, System.
- Boss-Intro-Karte mit Bild und Name, wenn ein Boss erscheint.
- Seelenwaffe „Twin Tail Chain“ als sichtbare Knochenketten an Finns Armen.
- Wasser, Lava und Abgründe als Deko am Arenarand (Brücke über dem Abgrund, Lavabrücke im Vulkan).

### Spielgefühl
- **Eigene Angriffe für wichtige Bosse** statt immer derselben Salve:
  Boneclaw teleportiert sich hinter Finn, Jin lässt Blut regnen, Vadeen legt Fallen,
  der schwarze King-Hund rollt als Stachelkugel, Chrimeta spuckt Feuer aus drei Schwänzen,
  die Blade-Zwillinge tauschen per Teleport die Plätze.
- **Durchhalte-Stufen** (Leo, Boneclaw, Jin, Linda, Borden, Zwillinge) mit sichtbarem Countdown und
  einem Satz vom System, warum man nicht gewinnen kann.
- Vibration am Handy bei starken Treffern (abschaltbar).
- Namen der Begleiter kurz über ihnen einblenden, wenn eine Stufe startet.
- Kurzes Tutorial in Etappe 1, Stufe 1 (Bewegen, Ausweichen, Karten wählen).
