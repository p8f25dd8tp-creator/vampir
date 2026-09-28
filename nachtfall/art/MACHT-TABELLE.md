# Machttabelle (30 Stufen, im Spiel eingebaut)

Die Stärken prüfen wir gemeinsam, sobald alle deutschen Namen feststehen. Jede Zahl lässt sich einzeln ändern
(`nachtfall/src/31-macht.js`).

## 1. Machtskala 1–30

| ab Stufe | Name | Beispiele aus dem Buch |
|---|---|---|
| 1 | Mensch | normaler Mensch, Schüler ohne Kraft |
| 4 | Erwachter | Fähigkeitsstufe 1–2, Basis-Bestien |
| 6 | Kämpfer | Fähigkeitsstufe 3–4, Mittel-Bestien, Ghoul, Vampir-Thrall |
| 9 | Elite | Fähigkeitsstufe 5, Hoch-Bestien, Vampirritter, 1–2 Stacheln |
| 12 | Adliger | Fähigkeitsstufe 6, Adlige, Advanced-Bestien, 3 Stacheln |
| 14 | Anführer | Fähigkeitsstufe 7, Familienanführer, Emperor-Bestien, 4 Stacheln |
| 17 | Original | Originals, Vampirlord, 5 Stacheln, Demi-God-Bestien |
| 20 | Halbgott | 6–8 Stacheln, erste Könige, niedere Celestials |
| 22 | Dämonenstufe | Demon-Tier-Bestien, Celestials, Demon General |
| 25 | Gottbezwinger | God Slayer, Dämonenkönige |
| 28 | Urgewalt | Immortui, Boten der Alten |
| 30 | Der letzte Vampir | nur Finn am Ende |

## 2. Regeln im Spiel

- **Heldenstufe 1–60.** Jeder Lauf bringt EP (Kills, Zeit, Sieg). Die Macht steigt dabei von der Start- zur Höchststufe.
- **Finn** hat die Macht seiner Etappe, plus bis zu +2 durch Training. Nach Etappe 15 hat er 30.
- **Werte:** Je Machtstufe über oder unter der Etappe ändern sich Schaden und Leben um 9 %.
- **Bewertung vor jeder Stufe:**
  - leicht: 4 oder mehr über der Etappe
  - fair: 1,5 darüber
  - hart: ab 1 darunter
  - sehr hart: bis 3 darunter
  - **gesperrt**: noch weiter darunter
- **Für immer gesperrt**, wenn der Gegner über der Höchststufe des Helden liegt.
- **⏳ Durchhalte-Kämpfe** zählen mit der Etappe.
- **Formen:** Jeder Held startet direkt in seiner höchsten freigeschalteten Form. Finn sucht das Buch nur beim allerersten Mal in Etappe 1, Stufe 1.
- **Dauerhafte Boni:**
  - Die Schmiede gilt pro Held.
  - Die Talente im System gelten nur für Finn.
  - Die Burg gibt nur noch Begleiter-Plätze, keinen Schaden mehr.

## 3. Helden (Start → Höchststufe)

| Held | im Buch | Start | Höchststufe |
|---|---|---|---|
| Finn Müller | Quinn | 1 | 30 |
| Peter Kraus | Peter | 1 | 22 |
| Lena Grimm | Layla | 4 | 20 |
| Emma Wagner | Erin | 4 | 22 |
| Fabian Schneider | Vorden | 6 | 17 |
| Fex Sanguini | Fex | 9 | 17 |
| Leo | Leo | 14 | 17 |
| Sil Skala | Sil | 6 | 25 |
| Chris | Chris | 6 | 22 |
| Leander Lothringen | Logan | 4 | 14 |
| Agathon | Arthur | 17 | 22 |
| Sam | Sam | 4 | 12 |
| Mia Müller | Minny | 4 | 20 |
| Sen Draco | Stimme in der Steintafel | 20 | 25 |

## 4. Etappen (normale Kämpfe)

| Etappe | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Macht | 3 | 6 | 8 | 10 | 12 | 13 | 15 | 16 | 17 | 19 | 20 | 21 | 22 | 23 | 25 |

## 5. Alle 143 Bosse (⏳ = Durchhalte-Kampf)

| Etappe | Bosse mit Machtstufe |
|---|---|
| 1 | Kyle Main (Tigerkrallen) **4** · Rylee (Verhärtung) **4** · Brandon Richardson (Speer) **4** · Leo, der blinde Schwertkämpfer **17** ⏳ · Nate „Hardsteely“ Snell **6** · Scordana (Mittelstufen-Bestie) **6** · Ben (Keule) **6** |
| 2 | Likmorn, König der Unterstadt **9** · Fex Sanguinis (Vampir) **9** · Emma, von Fex gelenkt **6** · Leander im Nanobot-Anzug **6** · Kenny (Giftnadeln) **6** · Rankenbestie (Hochstufe) **9** · Multiplier (Klone) **6** · Sil (Fabian) **9** · Sergeant Dillan Wyte (Erde) **9** |
| 3 | Borden, der Dalki-Klon **9** · Der Boneclaw **22** ⏳ · Schwarzes Horn-Kaninchen (Familiar) **9** · Clark Talon (Vampirritter) **9** · Jin Talon, vierter Anführer **14** ⏳ · Edward Eno (Nebel) **12** · Vadeen Muscat, sechster Anführer **14** · Hauptgeneral Paul Snealleart **12** |
| 4 | Borden (drei Stacheln) **12** ⏳ · Linda (Rang B) **17** ⏳ · Hypolord (Advanced) **12** · Roter King-Hund **12** · Schwarzer King-Hund **14** · Lemon (Graylash-Schüler) **6** · Gox, Kommandant der Sunshields **12** · Kiln und Tupple (Adlige) **12** · Chrimeta (Emperor-Tier) **14** · Vicky und Pai Blade **17** ⏳ · Vicky und Pai Blade **14** |
| 5 | Sand Ruler (Emperor) **14** · Feuer-Stein-Bestie (Emperor) **14** · Mantis (Gifthand) **12** · Rowa, gefallener Königsritter **17** ⏳ · Helen (Daisy) **12** · Tulk, Fareen und Kubo **12** · Lucy, Agent Fünf **14** · Diamant-Krabbe (Demon-Tier) **22** ⏳ · Chris, Meister des Qi **14** · Hilston Blade **19** ⏳ · Diamant-Krabbe (schwer verwundet) **17** |
| 6 | Bryce Cane, erster Leader **14** · Amber, Ritterin der 8. Familie **12** · Suzan, Kyle, Jin und Prima **17** ⏳ · Ovinnik, Herrin des Gebiets **17** · Remus Snacker, achter Original **17** · Cindy in der Königsrüstung **17** ⏳ · Cindy in der Königsrüstung **14** |
| 7 | Dred, Dalki-Kommandant **14** · Sach (Knochenstiefel) **14** · Der Boneclaw (Training) **17** · Martial Art God (Rang 50) **14** · Weiße Motte (Demi-God) **17** · Der rosa Baum **17** · Der schwarze Drache **22** ⏳ · Colonel Longblade **14** · Agent 2 (Pure) **14** · Demi-God aus Erde **17** |
| 8 | Zwei-Stachel-Dalki (markiert) **12** · Slicer **15** · Graham (fünf Stacheln) **19** ⏳ · Eno, der erste König **17** · Sechs-Stachel-Dalki **17** · Galaktischer Wurm (Demi-God) **17** · Der Dullahan **17** · Laxmus, der wahre erste König **22** ⏳ · Laxmus, der wahre erste König **19** |
| 9 | One Horn **20** ⏳ · Dalki mit Doppelellenbogen **17** · Samantha (neun Erdschwänze) **17** · Agent 3 (Pure) **17** · Genbu, König der Vertrauten **22** ⏳ · Vorti Ape (Emperor) **17** · Der Doppelgänger **17** · Dalki-Helen (fünf Stacheln) **17** · Blob (fünf Stacheln) **17** · Die zweite Drachenhälfte **19** · Green Horn (vier Stacheln) **17** · Graham (acht Stacheln) **19** |
| 10 | Tikker (Roter Vampir) **17** · Hybrid-Werwolf **19** · Derik, Vize der Roten **19** · Andy Sanguinis (Colossal Draugr) **19** · Lock (Schwerkraft) **19** · Russ, der God Slayer **25** ⏳ · Chris mit Werwolf-DNA **19** · Laxmus mit dem roten Herzen **25** ⏳ · Sedi-Riese im Vulkan **19** |
| 11 | Athos, Celestial des Turms **22** · Laxmus **25** ⏳ · Dalki mit Augenlaser **19** · Yanny, der falsche König **19** · Zero, Anführer von Pure **25** ⏳ · Chris als roter Werwolf **22** · Hinto aus dem roten Celestial-Raum **22** · Kipo (Celestial) **22** · Gorgath (Celestial) **22** · Emma, Königin der Dhampire **22** · Escam, General Immortuis **22** |
| 12 | Edvard Fortuna (Original) **22** · Nell Holland (Wachenturnier) **19** · Der Rankenmensch **19** · Die graue Eule **19** · Grenlet Toppy (Original) **22** · Der Spinnenfels (Demon-Tier) **22** · Der Prophet der Namriks **22** · Magnus Muscat (Original) **22** · Ray Talen, der rote Drache **27** ⏳ · Jim Eno mit dem X-Blut **22** |
| 13 | H (acht Stacheln) **27** ⏳ · Stark, der schnellste Penswi **22** · Mundus, Bote der Alten **27** ⏳ · Der Affenkönig (God Slayer) **25** · Der Phönix (God Slayer) **25** · King Behemoth (God Slayer) **25** · Asura, der erste God Slayer **25** · Pine (sieben Stacheln) **25** · Sera, Gott des Krieges **25** · Chris und Peter **22** · H (zehn Stacheln) **25** · Ray Talen in der Drachenrüstung **25** |
| 14 | Magnus in Albtraumform **22** · Demon General (die blaue Hand) **22** · Lexor, Durum-Dämonengeneral **22** · Kronker, Durum-Dämonenkönig **25** · Kronkers wahre Form **25** · Unzoku, der Allesverschlinger **27** ⏳ · Immortui **30** ⏳ · Yak-General der Werft **22** |
| 15 | Cia, die Banshee **19** · Bisha, König der Yaks **25** · Luce, der rechte Arm **25** · Calva, Champion der Skullys **22** · Tenbris, Dämonenkönig **25** · Luces Dämonenform **25** · Unzoku, satt von Tenbris **25** · Immortui mit Schlangenrüstung **27** · Immortuis Endform **27** |
