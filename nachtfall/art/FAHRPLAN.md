# Fahrplan: Nachtfall vom Prototyp zum fertigen Spiel

Grundlage: `ART-DIRECTOR-FINAL.md` und deine vier Entscheidungen.

## Deine Entscheidungen

1. **Handy im Hochformat.** PC bekommt ein eigenes breites Layout.
2. **Einzelspieler-Fraktion.**
   - Du **gründest** deine eigene Fraktion mit Name und Wappen.
   - Du **wirbst Mitglieder an** (Preis je nach Stärke) und kannst sie **rauswerfen**.
   - Mitglieder kommen nur aus **echten Fraktionen des Buchs** (z. B. Graylash, Pure, Vampirfamilien, Militär).
3. **Macht ist fest, pro Figur und pro Zeitpunkt.**
   - Jeder Gegner hat eine feste Machtstufe, und jede Version zählt einzeln: „Sil an der Militärakademie“ ist schwach, „Sil mit voller Kraft“ ist sehr stark.
   - Jeder Held wächst durch Spielen bis zu **seiner Höchstmacht laut Buch**.
   - Ein voll entwickelter Peter besiegt den Akademie-Sil mühelos. Den vollen Sil schafft Peter nie, weil sein Maximum darunter liegt.
4. **Echte Progression.** Kein „jeder Lauf ab Mensch“ mehr. Was ein Held erreicht hat, behält er.

## Legende
- 🔧 = baue ich allein
- 🎨 = brauche ich von dir (GPT-Bilder, Dateien)
- ✅ = brauche ich von dir (kurzes OK oder eine Entscheidung)

---

## Schritt 1: Sofort-Fixes 🔧
Nichts von dir nötig.
- „Stufe undefined“, doppelte Level-up-Karten, alte Prototyp-Namen (Vaelgor, Kharn, Aschefriedhof).
- Doppelte Seitenknöpfe auf der Karte weg, Zurück-Pfeil auf jeder Unterseite.
- Aktiver Tab ohne gelbe Fläche, lesbare Etappen-Banner, „ETAPPE 1“-Etikett.
- Gesperrte Knöpfe erkennbar, Belohnungen beschriftet.
- Pause: Bestätigung beim Aufgeben, Einstellungen (Lautstärke, Joystick-Seite, Vibration), nur passende Fusionen.
- Heldenkarten zeigen die Freischaltbedingung, Namen vereinheitlichen.
- Ziel-Fenster und Tutorial im Kampf nicht mehr über den Gegnern.

**Parallel:** Sobald Schritt 1 fertig ist, bekommst du von mir das **GPT-Paket 1** (Hintergründe für System, Charakterraum, Modi und Fraktion sowie die Kampagnen-Symbole). GPT arbeitet dann, während ich Schritt 2 baue.

## Schritt 2: Macht und Progression, das Fundament 🔧 ✅
- **Machtskala** aus dem Buch, eine Leiter für alle Wesen (Mensch mit Fähigkeitsstufen, Vampirränge, Dalki-Stacheln, Bestienstufen, Dämonenränge, Celestial und God Slayer).
- **Machtwert für jeden Gegner und jeden Boss** (143 Bosse, alle Gegnertypen). Frühe Versionen und späte Versionen derselben Figur sind getrennt.
- **Machtkurve pro Held**: Start, Formen, **Höchstmacht laut Buch**.
- **Spielstand pro Held**: Heldenstufe, Erfahrung, Formen, Meisterschaft, Ausrüstung. Finns Fortschritt hilft Peter nicht.
- **Finn startet in seiner erreichten Form.** Formen werden über die Story freigeschaltet und bleiben.
- **Bisherige globale Boni umziehen**: Die Schmiede gilt pro Held, die Burg wird zur Fraktion, die Talente werden zu Finns Systemkern.
- **Anzeige vor jeder Stufe**: leicht / fair / hart / **unmöglich für diesen Helden** (mit Buchgrund).
- **Prüfung beim Bauen**: `build.js` bricht bei undefined, fehlenden IDs oder kaputten Verweisen ab.
- ✅ **Vorher zeige ich dir die Machttabelle** (Helden-Maxima und die wichtigsten Bosse), damit du Fehler aus Lesersicht korrigieren kannst.

## Schritt 3: Das System 🔧 🎨
- Blau-schwarzer Hub mit Status, Quests, Fähigkeiten, Evolution, Analyse (Codex und Bestiarium) und Systemkern.
- Tages- und Wochenquests ziehen hierher um.
- Nach jedem Lauf meldet sich das System (Quest erfüllt, Meisterschaft gestiegen, neue Analyse).
- Andere Helden sieht man als **Analyse-Akte**.
- 🎨 **System-Hintergrund** (aus GPT-Paket 1). Ohne ihn baue ich mit einem gezeichneten Platzhalter.

## Schritt 4: Helden-Charakterraum und Evolutionspfad 🔧 🎨
- Großes Portrait oder drehbares Modell, dazu Stufe, Machtstufe, Form, Rolle.
- Reiter: Übersicht, Formen, Fähigkeiten, Meisterschaft, Ausrüstung, Lore.
- Evolution als Leiter mit Buchkapitel, neuen Fähigkeiten und Sperren. Die Evolution im Kampf wird eine eigene Szene.
- 🎨 **Charakterraum-Hintergrund**, später **8 Formbilder Finn** (GPT-Paket 2).

## Schritt 5: Navigation und Modi 🔧 🎨
- Leiste: Kampagne · Helden · Schmiede · Fraktion · System · Modi.
- **Boss-Turm** mit echten Stockwerken, Boss-Portrait, Modifikator und Bestleistung.
- **Endlos** mit Risiko-Modifikatoren und neuem Namen aus dem Buch.
- **Prüfungen** mit Sonderregeln und eigenen Rekorden.
- 🎨 Modi-Hintergrund und 3 Kartenbilder (GPT-Paket 1).

## Schritt 6: Kampagne als Reise 🔧 🎨
- Stufen als Knoten auf einem Pfad, mit Typ-Symbol, Boss-Mini-Portrait, Begleitern und Chancenanzeige.
- Etappenkopf mit Fortschritt, Inseln als Etappenbilder.
- 🎨 **Etappenbilder 6–15**, **Boss-Karten** (zuerst die 30 wichtigsten), **Knoten-Symbole** (GPT-Paket 2 und 3).

## Schritt 7: Schmiede 🔧 🎨
- Item-Ansicht: Slots links, großes Item in der Mitte, Vergleich alt → neu rechts.
- Ausrüstung pro Held. Die Buchausrüstung wird über die Story freigeschaltet (Twin Tail Chain, God-Slayer-Rüstung, Asura-Handschuhe, Drachenrüstung, Stiefel).
- Dazu Bestienausrüstung in 6 Kristallstufen.
- 🎨 Item-Illustrationen und 6 Stufenrahmen (GPT-Paket 3).

## Schritt 8: Fraktion 🔧 🎨 ✅
- **Gründen**: Name, Wappen aus mehreren Vorlagen, Rang (Gruppe → Fraktion → Familie → Bündnis).
- **Anwerben** aus echten Buch-Fraktionen:
  - Der Preis richtet sich nach der Machtstufe.
  - Manche Figuren wollen zusätzlich eine erfüllte Quest oder einen Rang.
- **Rauswerfen**, mit Folge: Die Beziehung zu ihrer alten Fraktion sinkt.
- **Mitgliederaufgaben**: Begleiter, Wache, Schmied, Forschung.
- **Festung** mit Gebäuden: Trainingshalle, Krankenstation, Forschung, Wachtürme, Quartiere. Sie geben Plätze, Ressourcen und Komfort, keine pauschalen Schadensprozente.
- **Angriffe**: Buch-Fraktionen greifen deine Festung an, und du verteidigst sie in einem Lauf. Später kannst du auch selbst angreifen.
- **Beziehungen** zu jeder Buch-Fraktion (Bündnis bis Feindschaft).
- 🎨 Burgsaal-Hintergrund, Wappenvorlagen (GPT-Paket 3).
- ✅ Ich zeige dir die **Liste der anwerbbaren Figuren mit Preis** vorher.

## Schritt 9: Gameplay-Optik 🔧 🎨
- **Spieler immer erkennbar**: Ring in der Formfarbe, Rand-Schein, andere Uniformfarben für Gegner.
- **Boden**: Texturen statt Plattenmuster, Blut und Lichtinseln. **Deko** passend pro Szene, Rand mit Wasser, Lava und Abgründen.
- **Gegner**: Quaternius-Monster, Eliten mit Aura und Namensschild.
- **Effekte und Treffer**: Blut-, Schatten- und Qi-Effekte, Aufblitzen, Rückstoß, kurzer Trefferstopp, gestufte Schadenszahlen.
- **HUD** größer, **Level-up-Karten** mit Werten alt → neu, Fusionen als großer Moment.
- 🎨 **Bodentexturen** (etwa 20, GPT-Paket 4). Lizenz des Bestiary-Pakets klären.

## Schritt 10: Klang 🔧 🎨
- Musik, Soundeffekte, getrennte Lautstärkeregler, Vibration.
- 🎨 Musik (9 Stücke) und ein Soundeffekt-Paket (CC0), siehe `WUNSCHLISTE.md`.

## Schritt 11: Durchbalancieren und dein Durchlauf 🔧 ✅
- Der Bot spielt alle 15 Etappen mit der neuen Progression: mit Finn, mit einem frischen Peter und mit einem voll entwickelten Peter.
- Ich passe Machtwerte und Kurven an.
- ✅ **Du spielst alles komplett durch** und notierst, was dir auffällt. Danach kommt die letzte Runde.

---

## GPT-Pakete (du bekommst die Prompts rechtzeitig)

| Paket | Inhalt | kommt nach |
|---|---|---|
| 1 | System-Hintergrund, Charakterraum, Modi-Hub + 3 Karten, Burgsaal, 7 Knoten-Symbole | Schritt 1 |
| 2 | 8 Formbilder Finn, Etappenbilder 6–15, Epilog-Bild | Schritt 3 |
| 3 | Boss-Karten (30 wichtigste), Buchausrüstung, 6 Stufenrahmen, Wappenvorlagen | Schritt 5 |
| 4 | etwa 20 Bodentexturen, restliche Boss-Karten in Zehnerpaketen | Schritt 7 |
