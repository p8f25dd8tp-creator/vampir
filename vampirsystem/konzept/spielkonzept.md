# My Vampire System – Spielkonzept (Entwurf 1)

*Game-Direction-Dokument. Grundlage sind die Notizen zu allen 2545 Romankapiteln
(`vampirsystem/story/kapitel-notizen.md`) und die Auswertung des Volltexts
(`nachtfall/story/analyse-roman.md`). Kapitelangaben in Klammern verweisen auf den englischen
Webroman. Alle Figuren tragen ihre englischen Originalnamen. Es wird keine neue Lore erfunden.*

---

## Kurzfassung – die Entscheidung

**Das Spiel wird ein Hybrid mit einem Echtzeit-Action-Kern.**

Gesteuert wird immer direkt, von oben in einer 3/4-Ansicht, ähnlich wie in *Hades*. Alle Kämpfe
nutzen **dieselbe Steuerung**. Je nach Missionsart ändern sich nur die **Regeln** darüber:

1. **Gefecht:** der normale Storykampf in kleinen Arenen.
2. **Duell:** Eins gegen eins mit Lesen, Kontern und Ausdauer.
3. **Bosskampf:** mehrere Phasen und Mechaniken aus der Geschichte.
4. **Schlacht:** Horden auf großen Karten. Erst ab der Mitte der Geschichte, wenn sie im Roman
   tatsächlich passiert.

Dazu kommen **Tag-Teams mit bis zu drei Figuren**. Du steuerst eine Figur und wechselst auf
Knopfdruck. Wer im Team sein darf, entscheidet die Geschichte.

Die Story läuft über Szenen, System-Fenster, Quests und begehbare Hubs.

**Rundenbasiert habe ich verworfen.** Es würde genau das wegnehmen, worum sich die Kämpfe im
Roman drehen: Tempo, Ausweichen, das Lesen des Gegners und Tricks mit Schatten.

**Deine Idee „1 spielbarer Charakter in normalen Kämpfen“ ändere ich** zu einem Tag-Team, wenn die
Figuren in der Szene tatsächlich zusammen kämpfen. Die Begründung steht in Teil 4.

---

## Teil 1 – Was die Vorlage verlangt

Bevor man Systeme vergleicht, muss klar sein, was im Roman tatsächlich passiert.

### 1.1 Wie wird gekämpft?

| Befund (Auswertung des Volltexts) | Folge für das Spiel |
|---|---|
| Rund **34 %** der Kapitel enthalten deutlich Kampf | Die Story besteht zu etwa zwei Dritteln nicht aus Kampf. Szenen, Hubs, Quests und Politik brauchen ein eigenes, gutes System. |
| Von den Kampfkapiteln sind rund **89 % Duelle oder Kämpfe kleiner Gruppen** | Der Kern muss Eins gegen eins und Kämpfe gegen wenige Gegner tragen. |
| Nur rund **11 % sind Massenschlachten** | Horden sind ein Sondermodus, nicht die Grundlage. |
| Kämpfe werden oft durch **Lesen des Gegners** entschieden: Inspect, Finten, Schwächen | Information muss eine Kampfressource sein. |

Beispiele aus dem Roman, die zeigen, wie diese Kämpfe funktionieren:

- **Rylee (17):** Er kann immer nur eine Körperstelle verhärten. Quinn gewinnt mit einer Finte.
- **Mono (14, 45–46):** Er sieht zwei Sekunden in die Zukunft und weicht deshalb allem aus.
- **Ronkin (2016):** Quinn kämpft auf exakt demselben Kraftniveau und gewinnt nur durch Technik.
- **Ray (2286–2291):** Ein Faustduell, in dem jeder Treffer beide stärker macht.

### 1.2 Das System im Roman ist bereits ein Spiel

Quinns System hat von Anfang an Spielmechaniken:

- **Statusfenster und Werte (2):** Stufe, HP, Stärke, Agilität und Ausdauer. Später kommt
  Charme dazu. Daze scheitert zum Beispiel an zu wenig Charme (107).
- **Quests:** eine Hauptquest („Erreiche Stufe 10“) und Tagesquests wie „Trink 2 Liter Wasser“
  oder „Meide 8 Stunden die Sonne“ (2–3).
- **Inspect (11):** Es zeigt Name, Rasse, Fähigkeitstyp, HP und Blutgruppe.
- **Blutgruppen geben Werte:** A+ gibt Stärke (20), Blutgruppe 0 gibt einen freien Wertepunkt (36).
- **Blutbank (30–31):** Getrunkenes Blut wird gespeichert und heilt später.
- **Kosten:** Blood Swipe hat keine Abklingzeit, kostet aber 1 HP pro Einsatz (26).
- **Schatten:** Sie kosten **MC** (100/100, regeneriert sich, 90). Der Schattenmantel verbraucht
  1 MC alle 10 Sekunden (91).
- **Sonne halbiert alle Werte (3).**
- **Shop (90):** Dort werden Skills mit Punkten gekauft. Es gibt Kombinationsskills (90) und
  Evolutionsquests.

Deshalb ist dieses Spiel an einer Stelle einmalig: **Die Spiel-UI ist Teil der Lore.** Jedes
Menü, jede Quest und jeder Stufenaufstieg darf wie Quinns System aussehen und sich so anfühlen.

### 1.3 Der Machtverlauf ist extrem

Quinn beginnt mit **10 HP**, ohne Fähigkeit, und wird in der Sonne schwächer. Am Ende zerstört er
einen Planetenkern (2540). Seine Stufen:

| Stufe | Kapitel |
|---|---|
| Mensch | 1 |
| Halbling | 17 |
| Vampir | 86 |
| Vampiradliger | 428 |
| Vampirlord | 805 |
| Vampirkönig (Titel) | 1371 |
| Himmlischer Vampirlord | 1565 |
| God-Slayer-Kräfte | 1688 / 1992 |
| Dämonenform | 2388 |
| Das Blut aller 13 Familien | 2537 |

Ein System muss also funktionieren, wenn der Held schwach ist, und genauso, wenn er gottgleich ist.

### 1.4 Quinns Werkzeugkasten wächst in Schichten

Quinn bekommt keine einzelne Kraft, sondern mehrere Schulen nacheinander. Die Kapitel zeigen das
erste Auftreten:

- **Kampfkunst:** Hammer Strike und Flash Step (bis ca. 54). Später Muay Boran und das
  Unterrichten anderer.
- **Blut:** Blood Swipe (17), Blutbank (30), Blood Crescent Kick (191), Blood Bullet (472),
  Blutwaffen, Absolute Blutkontrolle, Blood Forest (1756).
- **Schatten:** Schattenkontrolle (89), Shadow Equip (103), Shadow Void (119), Shadow Cloak (130),
  Shadow Eater, Shadow Sink (759), Shadow Lock (867), Absolute Shadow und Shadow Overload (928),
  Shadow On (1205), Shadow Infect (1993), Shadow Mist als Seelenwaffe (2164).
- **Qi:** Stufe 1 bei Leo (333–351), Stufe 2 bei Chris (782–789), Nitro Accelerate (1049).
- **Geist:** Influence (125) und Daze (86).
- **Celestial:** Celestial-Energie, Anhänger und Statuen (1588), Celestial Drain (1804).
- **God Slayer:** die Rüstung mit „Limitless“ (2257), Wolkenklone, Sunfire Burn, Asura's Rage
  und Asura's Blood Form (2289–2294), der Blutschatten mit verzögertem Doppeltreffer (2192).
- **Dämonenform (2388)** und **das Blut der 13 Familien (2537)**.

**Konsequenz:** Das Kampfsystem muss zeigen können, dass Quinn später **anders** kämpft und nicht
nur **stärker** ist.

### 1.5 Sehr viele Figuren mit echten eigenen Kampfstilen

Die Vorlage liefert von sich aus unterschiedliche Spielweisen:

- **Vorden** kopiert Fähigkeiten. **Raten** und **Sil** leben im selben Körper. Sil kopiert
  später viele Fähigkeiten und kann sogar Zeit zurückdrehen.
- **Peter** hat anfangs eine Erd-Fähigkeit, wird dann Ghoul und schließlich Wight.
- **Layla** kämpft mit dem Bestienbogen, später mit Telekinese und einem Schwert mit geliehener
  Kraft.
- **Erin** nutzt Eis und Schwert, dann Qi, dann als Dhampir gelbe Energie.
- **Fex** kämpft mit Blutfäden und Influence (13. Familie).
- **Logan** hat Technik, Spinnen-Drohnen und Androiden.
- **Leo** ist ein blinder Schwertmeister mit Qi.
- **Chris** ist ein Qi-Meister mit Werwolf-DNA.
- **Arthur** kämpft mit Schatten und Blutrüstung.
- **Hikel** hat explodierendes Blut, **Edvard** Glück (Fortuna) und später die Drachenrüstung.
- **Russ** kopiert und trägt eine Negationsklinge.
- **Minny** nutzt Celestial-Energie, **Galen** Schatten.
- Dazu kommen **Borden** (Dalki-Verwandlung), **Oscar** (Erde), **Owen** (Blitz), **Nate**
  (Verhärtung), **Linda**, **Sam** und viele mehr.

**Konsequenz:** Viele spielbare Figuren sind machbar und nötig. Das System muss es billig machen,
eine neue Figur hinzuzufügen.

---

## Teil 2 – Vergleich der Spielsysteme

**Bewertung:** 5 = passt sehr gut, 1 = passt schlecht.

| Kriterium | A Rundenbasiertes Team-RPG | B Echtzeit-Action-RPG | C Arena/Duell | D Survivors/Horde | E Hybrid (Action-Kern) |
|---|---|---|---|---|---|
| Quinns Fähigkeiten (Tempo, Schatten, Combos) | 2 | 5 | 5 | 2 | 5 |
| Duelle und Kämpfe kleiner Gruppen (89 %) | 3 | 4 | 5 | 1 | 5 |
| Große Schlachten (11 %) | 2 | 2 | 1 | 5 | 4 |
| Bosse mit Story-Mechaniken | 3 | 5 | 5 | 2 | 5 |
| Viele spielbare Figuren | 5 | 2 | 3 | 3 | 4 |
| Machtverlauf bis zur Gottstufe | 2 | 3 | 3 | 4 | 5 |
| Story einbinden | 4 | 3 | 2 | 1 | 4 |
| Mobile-Steuerung | 5 | 3 | 3 | 5 | 3–4 |
| Aufwand für ein kleines Team | 4 | 2 | 3 | 5 | 2–3 |
| Erweiterbarkeit | 5 | 3 | 3 | 3 | 4 |

### A) Rundenbasiertes Team-RPG

**So sähe das Gameplay aus.** Ein Team aus 3 bis 5 Figuren kämpft gegen Gegnergruppen. Jede
Figur hat 2 bis 3 aktive Fähigkeiten, eine passive und eine Ultimative. Es gibt eine Zugleiste
nach Tempo sowie Buffs und Debuffs.

**Passung zur Lore.** Sie ist nur teilweise gegeben. Werte, Level, Quests und Inspect passen
perfekt, das System im Roman *ist* ja ein RPG-Menü. Die Kämpfe selbst passen schlecht, weil sie
davon leben, dass jemand schneller ist, ausweicht, sich teleportiert oder täuscht.

**Das passt gut:**
- Politik und Planung, etwa der Rat der Familien oder die Anführer am Tisch (723–760).
- Gruppenkämpfe der Cursed Faction.
- Teamkämpfe gegen viele Figuren im Red Space.

**Das passt schlecht:**
- Shadow Travel und Flash Step werden zu „+Initiative“.
- Monos Voraussicht wird zu „+Ausweichchance“.
- Die Finte gegen Rylee lässt sich nicht spielen.
- Ausweichen wird zur Würfelchance.
- Das Faustduell mit Ray, in dem jeder Treffer beide steigert, wäre nur ein Balken.

**Quinn** wäre ein Schadensträger mit vielen Knöpfen. Der Unterschied zwischen dem frühen und dem
späten Quinn läge nur in den Zahlen.

**Andere Figuren** sind der größte Vorteil dieses Systems. Mit Werten und 3 bis 4 Fähigkeiten
lassen sich 40 und mehr Figuren schnell spielbar machen.

**Duelle** werden zu einem Schlagabtausch von Zahlen. **Schlachten** lassen sich nur abstrakt
darstellen, als Wellen oder Zählwerte. **Bosse** sind gut über Phasen und Zustände machbar.

**Progression** über Level, Skills und Ausrüstung ist sehr gut umsetzbar. **Mobile** ist
hervorragend. Der **Aufwand** ist niedrig bis mittel.

**Langfristige Probleme:**
- Bei extremer Macht werden Rundenkämpfe schnell zu Zahlenwüsten.
- Das Genre ist stark mit Gacha-Spielen verbunden, und die Erwartung an Pay-to-Win ist hoch.
- Das Spiel würde sich wie *irgendein* Anime-Gacha mit MVS-Aufdruck anfühlen, also genau das,
  was du nicht willst.

### B) Echtzeit-Action-RPG, ein Charakter

**So sähe das Gameplay aus.**
- Stick zum Laufen, dazu Grundangriffe mit Combo.
- Dash bzw. Ausweichen, 3 bis 4 Fähigkeiten und eine Ultimative.
- Ressourcen: HP, MC und Qi.

**Passung zur Lore.** Sie ist sehr hoch für Quinn und für alle Duelle. Blood Swipe kostet echte
HP, Schatten kosten MC, und die Sonne halbiert die Werte. All das wird direkt spürbar.

**Das passt gut:**
- Alle Duelle, die Akademie, die Nachtdämon-Einsätze (352–375).
- Portalplaneten und Bestienjagden.
- Die God-Slayer-Prüfungen bei Mundus (2108–2186).

**Das passt schlecht:**
- Große Kriege, etwa gegen die Dalki (1144–1572), Jims Armeen (2202–2212) oder die Divine
  Brigade.
- Momente, in denen mehrere Figuren gleichzeitig wichtig sind.

**Quinn** spielt sich hervorragend, und jede neue Kraft verändert die Bewegung spürbar.

**Andere Figuren** sind teuer, weil jede einen eigenen, ausbalancierten Kampfsatz braucht.
**Duelle** sind stark, **Schlachten** schwach, **Bosse** stark. **Mobile** ist gut machbar,
braucht aber eine sorgfältige Steuerung. Der **Aufwand** ist hoch.

**Langfristige Probleme:**
- Wenn es nur den einen Modus gibt, sind Kriege nicht darstellbar.
- Nebenfiguren bleiben Zuschauer.

### C) Arena- und Duell-System

**So sähe das Gameplay aus.** Kämpfe Eins gegen eins oder zwei gegen zwei in kleinen Arenen, mit
Fokus auf Timing, Konter und das Lesen des Gegners, ähnlich einem Fighting Game von oben.

**Passung zur Lore.** Sie ist sehr hoch für den Großteil der Kampfkapitel, denn 89 % sind Duelle
oder Kämpfe kleiner Gruppen.

**Das passt gut:**
- Mono, Rylee, Kyle, die Prüfungen und Turniere.
- Die God-Slayer-Prüfkämpfe, der Penswi-Turm (2197) und der Grand Meet Up (2446).
- Quinn gegen Erin und Quinn gegen Ray.

**Das passt schlecht:**
- Erkundung, Portalplaneten, Horden und Kriege.

**Quinn und andere Figuren** passen jeweils gut, weil jede Figur einen klaren Duellstil hat.
**Duelle und Bosse** sind exzellent, **Schlachten** gibt es nicht. **Mobile** ist mittel, denn
präzises Timing auf dem Touchscreen ist schwer. Der **Aufwand** ist mittel.

**Langfristiges Problem:** Als *einziges* System ermüdet es schnell, und die Geschichte zerfällt
in eine Kette von Kämpfen.

### D) Survivors- und Horde-System

**So sähe das Gameplay aus.** Automatische Angriffe, Hunderte Gegner und Karten beim
Stufenaufstieg. Das ist Nachtfall.

**Passung zur Lore.** Sie ist sehr hoch für Kriege und Horden:
- die Dalki-Schiffe (1198–1264) und die Front bei Graham,
- die Hordenwellen auf dem Daisy-Planeten (2038–2042),
- Jims Kapsel-Vampire (2207–2212),
- die Divine Brigade (2530er).

Für alles andere ist sie sehr niedrig.

**Das passt gut:** Große Schlachten und späte Machtfantasie, etwa wenn Quinn mit Blood Forest
ganze Armeen auslöscht.

**Das passt schlecht:**
- Jedes Duell, jeder Boss mit einer Mechanik aus der Geschichte, jede Technik.
- Ein Quinn mit 10 HP, der mit Tricks gewinnt, ist mit automatischen Angriffen nicht darstellbar.

**Quinn** fühlt sich erst ab dem Vampirlord richtig an. **Andere Figuren** sind leicht umzusetzen,
fühlen sich aber alle ähnlich an. **Duelle** gibt es praktisch nicht. **Schlachten** sind
exzellent. **Bosse** bleiben HP-Säcke mit Mustern. **Mobile** ist hervorragend. Der **Aufwand**
ist niedrig, weil der Code aus Nachtfall existiert.

**Langfristiges Problem:** Als Hauptsystem würde es die Vorlage verfälschen und aus einer
Duell-Geschichte ein Hordenspiel machen.

### E) Hybrid mit Echtzeit-Action-Kern

**So sähe das Gameplay aus.** Eine Steuerung für alles. Vier Kampfregeln (Gefecht, Duell, Boss,
Schlacht) werden eingesetzt, wenn die Szene im Roman sie verlangt. Dazu kommen ein Tag-Team und
eine Story-Ebene.

**Passung zur Lore.** Sie ist die höchste. Jede Szenenart bekommt die Regel, die zu ihr passt,
ohne dass der Spieler ein neues Spiel lernen muss.

**Probleme:**
- Der Aufwand ist höher als bei A oder D.
- Es besteht die Gefahr, dass der Hybrid zerfasert, wenn die Modi *verschiedene* Steuerungen
  haben.

Die Lösung dafür: **eine Steuerung und ein Kampfsatz pro Figur, dazu Regeln, die darübergelegt
werden.** Die Schlacht ist keine „Survivors-Kopie“. Sie ist derselbe Kampf mit mehr Gegnern,
eigenen Regeln und einer stärkeren Schadenskurve.

---

## Teil 3 – Drei konkrete Konzepte

### Konzept 1: „Chronik der Familien“ (rundenbasiert, Team)

- **Ablauf:** Team aus 4 Figuren, Zugleiste und Stellungen. Die Story läuft über Szenen.
- **Stark:** Sehr viele Figuren sind leicht spielbar, gut für Politik und Fraktionen. Die
  Mobile-Steuerung ist ideal.
- **Schwach:** Quinns Identität als schneller Schattenkämpfer und Trickser geht verloren. Duelle
  wirken flach.

### Konzept 2: „Der Schatten der Akademie“ (reines Action-RPG, nur Quinn)

- **Ablauf:** Du spielst ausschließlich Quinn. Es gibt Arenen, Gebiete und Bosse.
- **Stark:** Maximales Kampfgefühl und ein sehr klarer Machtverlauf.
- **Schwach:** Kriege, Teamkämpfe und Nebenfiguren fallen weg. Nach 1000 Kapiteln wird es
  eintönig.

### Konzept 3: „Das System“ (Hybrid, empfohlen)

- **Ablauf:** Ein Action-Kern mit vier Kampfregeln, Tag-Team, Hubs und System-Story.
- **Stark:** Es deckt den Roman vollständig ab. Das Gameplay entwickelt sich mit der Geschichte.
  Viele Figuren sind spielbar.
- **Schwach:** Die höchste Anforderung an Disziplin im Design. Das Kampfsystem muss von Anfang an
  modular gebaut sein.

---

## Teil 4 – Entscheidung und wo ich deine Idee ändere

**Gewählt wird Konzept 3, „Das System“.** Dein Hybrid-Vorschlag war die richtige Richtung. Vier
Punkte ändere ich bewusst.

### 1. Kein reiner Solo-Kampf in normalen Gefechten, sondern ein Tag-Team

Im Roman kämpft Quinn oft **mit** seiner Gruppe:
- in der Aula mit Raten, Erin und Layla,
- auf Caladi mit Peter und Vorden,
- im Red Space mit Peter, Sil, Chris, Russ, Edvard und Hikel.

Wenn nur Quinn spielbar ist, werden alle anderen zu Zuschauern.

**Lösung:** Bis zu **3 Figuren pro Mission**. Du steuerst eine, die anderen kämpfen mit einer
einfachen KI oder warten. Wechseln geht jederzeit, mit einem kurzen Wechselangriff.

**Wer mitkommen darf, legt die Geschichte fest.** Waren in der Szene nur Quinn und Layla dabei,
spielst du nur die beiden. So bleibt die Lore sauber, und trotzdem sind viele Figuren spielbar.

### 2. Duelle bekommen keine eigene Steuerung, nur eigene Regeln

Wer für Duelle ein zweites Steuerungssystem lernen muss, hat zwei halbe Spiele. Deshalb sind es
dieselben Knöpfe, aber im Duell gilt:
- **Ausdauer** wird wichtig.
- Ein **perfektes Ausweichen** öffnet ein Konterfenster.
- **Inspect** wird zur Information im Kampf.
- Der Gegner hat **Lesbarkeit**: Er verrät seine Angriffe und reagiert auf Muster.

### 3. Schlachten erst, wenn der Roman sie hat

Keine Horden im ersten Akt, denn dort gibt es keine. Die ersten echten Schlachten kommen mit dem
Bürgerkrieg und den Dalki-Kriegen. Dadurch fühlt sich das Freischalten des Schlachtmodus selbst
wie ein Machtsprung an.

### 4. Die Karten beim Stufenaufstieg bleiben, aber streng im Kanon

Die Karten beim Stufenaufstieg aus deinem Vorschlag bleiben, und zwar **nur in Schlachten**. Sie
bieten ausschließlich Verbesserungen von Kräften, die die Figur an diesem Punkt der Geschichte
**schon besitzt**, zum Beispiel „Blood Swipe +1 Stufe für diese Mission“. Nie Kräfte aus der
Zukunft oder erfundene Kräfte.

Das passt auch zur Lore: Quinn steigt im Roman mitten im Kampf auf, weil Gegner EP geben
(zum Beispiel 10: „erster Kampf“ mit 50 EP).

---

## Teil 5 – Das System im Detail

### 1. Core Gameplay Loop

```
Hub (Akademie / Schiff / Siedlung / Burg …)
  → System-Fenster: Hauptquest, Tagesquests, Nebenquests
  → Storymission
      Szene (Dialog-Panels, System-Meldungen)
      → Kampf nach passender Regel (Gefecht / Duell / Boss / Schlacht)
      → Szene, Entscheidung, Folgen
  → Belohnung: EP, Wertepunkte, Blut (Blutgruppen), Kristalle, neue Skills zum Kanonpunkt
  → zurück in den Hub: Training, Ausrüstung bei Alex, Gespräche, Tagesquests
```

- **Kurze Schleife (3–8 Minuten):** eine Mission, handyfreundlich.
- **Mittlere Schleife:** ein Handlungsbogen mit 5 bis 15 Missionen und einem Boss.
- **Lange Schleife:** ein Akt mit einer Evolution von Quinn.

### 2. Kampfsystem

Ansicht von oben in 3/4-Perspektive, Echtzeit.

**Ressourcen pro Figur, direkt aus dem Roman:**

- **Quinn**
  - **HP:** Blutskills kosten HP, anfangs 1 HP für Blood Swipe (26).
  - **Blutbank:** gespeichertes Blut, heilt auf Knopfdruck oder automatisch (30–31, 45).
  - **MC:** Schattenenergie für alle Schattenskills. Der Schattenmantel kostet dauerhaft MC
    (90–91). Shadow Lock bindet dauerhaft MC (736).
  - **Qi:** ab Leo (333–351).
  - **Hunger:** Ein hungriger Vampir hat höhere Werte, aber schlechtere Heilung und Fähigkeiten
    (711). Das ist ein bewusster Risikomodus.
- **Andere Figuren:**
  - Fähigkeitsnutzer haben die Ressource ihrer Fähigkeit.
  - Bei ihnen stehen Stufen im Roman für die Zahl der Mutantenzellen, nicht für Stärke (89).
    Die Stufe bestimmt also die **Anzahl oder Stärke der aktiven Skills**, nicht die HP.
- **Umwelt:** Direktes Sonnenlicht halbiert Quinns Werte, solange er Halbling ist (3). Kämpfe
  finden deshalb oft nachts, drinnen oder im Schatten statt, denn Schattenzonen auf der Karte
  schützen ihn. Mit dem Vampirlord ist dieser Malus herausgewachsen.

**Aktionen:**
- Grundangriff mit Combo aus bis zu 4 Treffern. Die Kampfkunst bestimmt die Combo.
- Dash bzw. Ausweichen mit Unverwundbarkeitsfenstern.
- 4 aktive Skill-Plätze und eine Ultimative. Die Plätze werden aus den bereits freigeschalteten
  Kanon-Skills bestückt.
- Tag-Wechsel.

**Perfektes Ausweichen:** Wer im letzten Moment ausweicht, bekommt ein Konterfenster von 0,4
Sekunden. Das ersetzt eine eigene Parier-Taste und bleibt auf dem Touchscreen spielbar.

**Kombinationsskills:** Das System kennt sie seit Kapitel 90. Bestimmte Skills in Folge lösen
eine Kombination aus, etwa Flash Step direkt nach Hammer Strike. Welche Kombinationen es gibt,
ergibt sich aus den Skills, die tatsächlich zusammen vorkommen.

**Gegnerlesbarkeit:**
- Jeder Angriff wird durch Farbe, Haltung und Geräusch angekündigt.
- Mit Inspect sieht man mehr: Rasse, Fähigkeitstyp, HP und Blutgruppe (11), später auch Stufe
  und Schwächen.

### 3. Steuerung auf dem Smartphone

**Links:** ein dynamischer Stick. Der Daumen setzt irgendwo auf.

**Rechts, im Bogen:**
- [Angriff] groß: tippen für die Combo, halten für einen aufgeladenen Schlag.
- [Ausweichen]
- [Skill 1–4]. Tippen löst den Skill auf das automatische Ziel aus. Ziehen zielt manuell, zum
  Beispiel für Shadow Travel, Blood Swipe in eine bestimmte Richtung oder Flächen-Skills.
- [Ultimative] im Ring über dem Angriffsknopf.

**Oben links:** die Porträts des Teams. Antippen wechselt die Figur.

**Oben rechts:** [Inspect] als Kreis, der die Zeit verlangsamt, und [Pause/System].

**Zielhilfe:** Das Ziel wird weich automatisch gewählt. Wer auf einen Gegner tippt, fixiert ihn.

**Barrierefreiheit:**
- Eine Option „einfache Combos“, bei der Halten automatisch die Combo ausführt.
- Eine Option, das Timing-Fenster für perfektes Ausweichen zu vergrößern.
- Unterstützung für Controller.

### 4. Normale Kämpfe (Gefecht)

- **Arenen:** kleine bis mittlere Arenen mit 3 bis 15 Gegnern.
- **Ziele:** besiegen, überleben, jemanden schützen, entkommen, einen Kristall sichern oder
  unerkannt bleiben.
- **Umgebung:** Schatten, Licht, Wände und Deckung spielen eine Rolle.
- **Beispiele aus dem Roman:**
  - Die Aula (41–47): Zweitjährige und Wachen, Raten gegen Mono im Hintergrund.
  - Die Rattaclaws auf dem roten Portalplaneten (65–91).
  - Die Bloodsucker an der zehnten Burg (712).

### 5. Duelle

**Eigene Regeln:**
1. **Ausdauer:** Angriffe und Dashes verbrauchen sie, und wer leer ist, taumelt.
2. **Lesen:** Der Gegner hat ein **Muster**, das Inspect und Beobachtung aufdecken, zum Beispiel
   Rylee, der nur eine Stelle verhärtet.
3. **Konter:** Perfektes Ausweichen öffnet ein Fenster, und Treffer daraus zählen doppelt.
4. **Finten:** Ein kurz angetippter und sofort abgebrochener Skill täuscht Gegner, die auf
   Ankündigungen reagieren.

**Beispiele, alle aus dem Roman:**
- **Mono (45–46):** Er sieht zwei Sekunden in die Zukunft und weicht allem Angekündigten aus.
  Man kann ihn nur mit **Finten**, Flächen oder Angriffen treffen, denen er nicht ausweichen kann.
- **Ronkin (2016):** Das Training „gleiche Kraft, nur Technik“ ist ein Duell mit gesperrten
  Werten, bei dem nur Timing und Konter zählen.
- **Erin (1937–1978):** Ihre gelbe Dhampir-Energie schwächt Vampire in markierten Zonen.
- **Ray (2286–2291):**
  - Das Faustduell mit **Asura's Rage** macht jeden Treffer am selben Gegner stärker. Nach 10
    Sekunden ohne Treffer setzt es sich zurück.
  - Er wird auch besser, also gewinnt man durch Tempo und den Blutschatten.

### 6. Bosskämpfe

Eigene Arenen, **3 Phasen**, jede mit einer Mechanik aus der Geschichte statt nur mehr HP.

| Boss | Mechanik (Kanon) |
|---|---|
| **Jack Truedream** | Nimmt Menschen Fähigkeiten. Im Kampf *versiegelt* er nacheinander einen deiner Skill-Plätze. |
| **Hilston Blade** | Fünf vorbereitete Fähigkeiten, die er durchwechselt. Später Dämonenrüstung, die Blitze schluckt (797). |
| **Die Diamantkrabbe (803–805)** | Gräbt sich ein. Nur ihre Gelenke sind verwundbar. Am Ende hat Quinn 0 MC. |
| **Graham** | Acht Stacheln. Mitten im Kampf die **Evolution zum Himmlischen Vampirlord (1565)**, als geskriptete Wende mit neuem Skill-Satz. |
| **Kronker** | Kristallstacheln aus der Brust, Glitzer-Tornados. Wolkenklone müssen ihn ablenken (2381–2386). |
| **Immortui** | Das farblose Feld entzieht jeder Energie die Kraft (2436). Erst die Blutschatten-Rüstung (2537) schützt davor, und dann wird er selbst geschwächt. |

Dazu gibt es **Boss-Intros als System-Fenster**. Inspect zeigt dort nur, was Quinn in diesem
Moment wissen kann.

### 7. Schlacht-System (Horde)

**Wann:** erst ab dem Bürgerkrieg und den Dalki-Kriegen. Danach in jedem Akt, in dem der Roman
Kriege zeigt: die Dalki-Schiffe, Grahams Front, Hordenwellen, Jims Armeen, der Red Space und die
Divine Brigade.

**Karten:** groß, 60 bis 400 Gegner gleichzeitig. Ziele sind Stellungen halten, Verbündete
retten, Offiziere ausschalten und Schiffe infiltrieren.

**Steuerung wie immer.** Neu ist nur:
- Der **Grundangriff** kann automatisch laufen, das ist einstellbar.
- **Flächen-Skills** machen deutlich mehr Schaden gegen Massen.
- **EP-Stufen in der Mission** bieten jeweils 3 Karten mit Verbesserungen *vorhandener* Skills.
- **Verbündete** sind KI-Trupps im Feld, zum Beispiel die Cursed Faction, Alleinkämpfer wie
  Oscar oder Amra-Truppen.

**Befehle:** Später, als Anführer (ab dem Vampirkönig), gibt es einfache Befehle: „halten“,
„folgen“ und „Ziel angreifen“. Nur als Knopf, ohne Echtzeitstrategie.

**Das Machtgefühl:** Hier spürt man, wie absurd stark Quinn wird. Blood Forest (1756) oder die
Dämonenform räumen ganze Wellen ab.

### 8. Story-System

- **Szenen als animierte Panels** mit Porträts, Mimik, Kameraschwenks und Soundeffekten. Keine
  teuren Zwischensequenzen.
- **System-Fenster als Stilmittel**, genau wie im Roman: Quest angenommen, Evolution, Inspect,
  Tagesquest erfüllt.
- **Funk während der Missionen:** Gespräche im Kampf, zum Beispiel über Logans Kommunikator
  oder Laylas Hinweise.
- **Entscheidungen:** nur dort, wo der Roman sie offenlässt oder wo die Folgen gleich bleiben,
  etwa wen Quinn zuerst rettet oder welche Tagesquest er erfüllt. Keine Verzweigungen, die den
  Kanon brechen.
- **Rückblicke** als spielbare Kurzmissionen, zum Beispiel über Quinns Eltern oder Arthurs
  Vergangenheit, sofern der Roman sie zeigt.
- **Chronik:** Figuren, Orte, Rassen und Fähigkeiten werden beim ersten Auftreten eingetragen.

### 9. Hubs und Gebiete

Die Hubs sind begehbar, klein, mit Figuren zum Ansprechen und Aktivitäten.

| Hub | Akt | Aktivitäten |
|---|---|---|
| Militärakademie Basis 2 | I–II | Schlafsaal, Kantine, Trainingshalle, Bibliothek, Waffensaal |
| Die zehnte Burg / Vampirsiedlung | III–V | Thronsaal, Schmiede, Rat, Schule |
| Cursed-Schiff | IV–V | Alex' Schmiede, Besprechung, Hangar |
| Die Siedlung nach 1000 Jahren | VII | — |
| Green City / Mermerial-Welt | VIII | — |

**Gebiete:** Portalplaneten und Jagdgebiete, zum Beispiel Rattaclaw-Planet, Caladi,
Daisy-Dschungel und Red Space. Sie sind kompakt, bestehen aus Missionsknoten und haben einige
freie Ecken mit Kristallen und Nebenquests.

### 10. Charakter-System

Jede spielbare Figur hat:
- einen Grundangriff mit eigener Waffe,
- ihre Ressource,
- 4 bis 8 Kanon-Skills, von denen 4 ausgerüstet werden,
- eine Ultimative,
- eine passive Fähigkeit,
- und eine Kanon-Entwicklung.

**Kampfrollen,** jede nur mit Figuren, deren Kräfte der Roman belegt:

- **Kopierer:** Vorden, Raten, Sil und Russ.
  - Sie *übernehmen einen Skill des letzten Gegners*, den sie berührt oder beobachtet haben.
  - Das ist einzigartig und sehr gut wiederspielbar.
- **Tank/Brawler:** Peter.
  - Ghoul und später Wight: Er regeneriert und wird mit Hunger stärker.
  - Borden: als Dalki-Verwandlung.
- **Fernkampf:** Layla, zuerst mit Bogen, dann mit Telekinese.
- **Präzisionsklinge:** Erin mit Eis, Qi und später gelber Dhampir-Energie, Leo mit Qi und
  Konterschwert.
- **Kontrolle:** Fex mit Blutfäden als Fallen und Netzen und mit Influence.
- **Beschwörer und Support:** Logan mit Spinnen-Drohnen und Androiden.
- **Qi-Brawler:** Chris mit Qi-Stufen und Werwolf-DNA.
- **Zerstörer:** Hikel mit explodierendem Blut.
- **Glückskämpfer:** Edvard mit Fortuna-Ausweichen und Drachenrüstung.
- **Elementar:** Oscar (Erde), Owen (Blitz) und Nate (Verhärtung).
- **Celestial:** Minny mit weißer Himmelsenergie.
- **Schatten der nächsten Generation:** Galen.

**Nicht jede Figur braucht denselben Tiefgang:**
- **Kernfiguren** bekommen einen vollen Kampfsatz: Quinn, Layla, Vorden/Raten/Sil, Peter, Erin,
  Fex und Logan.
- **Andere Figuren** bekommen einen schlanken Satz mit 2 Skills und einer Ultimativen. Sie sind
  günstig in der Herstellung und trotzdem eigen.

### 11. Charakter-Progression

Es gibt vier Schichten. Die Storylogik steht über allem.

1. **Story-Progression, fest:**
   - Evolutionen, Skills, Waffen und Titel kommen genau an ihren Kanonpunkten.
   - Kein Kauf und kein Grind bringt sie früher.
   - Beispiel: Blood Swipe ab 17, der Schatten ab 89, Shadow Lock ab 867.
2. **Charakter-Progression:**
   - **Level und EP** aus Kämpfen und Quests.
   - **Wertepunkte** auf Stärke, Agilität, Ausdauer und Charme. **Charme** bestimmt, wie gut
     Influence und Daze wirken, und öffnet Dialogoptionen.
   - **Blutgruppen:** Blut trinken gibt Werte (20, 36). Es ist ein Sammelsystem: Welche
     Blutgruppe gibt welchen Wert?
   - **Skill-Stufen** steigen durch Benutzung und über den System-Shop (90) mit Punkten.
3. **Missions-Progression:** nur in Schlachten, siehe Punkt 7.
4. **Meta-Progression:**
   - Die Chronik, gesammelte Blutgruppen, Ausrüstungsrezepte und Herausforderungen.
   - **Deckel pro Akt:** Werte und Ausrüstung sind pro Akt nach oben begrenzt, sodass alte
     Missionen nicht trivial werden und neue fair bleiben.
   - **Pegel beim Wiederholen:** Wer eine Mission erneut spielt, wird auf das Niveau der Szene
     gesetzt.

### 12. Fähigkeiten – wie sich das Spiel mit Quinn verändert

| Epoche (Kanon) | Spielgefühl | Neue Mechanik |
|---|---|---|
| **Mensch / Halbling (1–85)** | Verletzlich, 10 HP, die Sonne schwächt. Er gewinnt mit Kampfkunst und Finten. | Blood Swipe kostet HP, Blutbank, Inspect, Tagesquests |
| **Vampir (86–427)** | Schnell und unheimlich | Schatten und MC: Shadow Equip, Shadow Void, Shadow Cloak mit Tarnung, Influence. Tag-Team mit der Gruppe. |
| **Adliger (428–804)** | Taktisch | Blood Bullet, Shadow Eater, Qi Stufe 1. Die zehnte Familie als Verbündete. |
| **Lord / König (805–1564)** | Mächtig | Qi Stufe 2, Shadow Lock, Absolute Shadow, Nitro. **Schlachten schalten sich frei.** Blutwaffen, Königsrüstung, Befehle. |
| **Himmlischer Vampirlord (1565–1687)** | Übermächtig | Celestial-Energie, Anhänger und Statuen als Hub-System (1588), Blood Forest in Schlachten |
| **God Slayer (1688–2387)** | Göttliche Duelle | Rüstungsteile als ausrüstbare Module, Wolkenklone, Asura's Rage mit Stapeln, Blutschatten mit Doppeltreffer |
| **Dämonenform und 13 Familien (2388–2545)** | Reine Machtfantasie | Die Dämonenform als zweite Kampfhaltung. Am Ende sind alle 13 Familienfähigkeiten kurzzeitig verfügbar (2537). |

**Wie der späte Quinn spannend bleibt:** Die Gegner werden nicht einfach dicker, sondern bringen
**neue Regeln** mit:
- Immortuis farbloses Feld,
- Tenbris' Schwere-Wirbel (2511),
- Unzokus Verschlingen,
- Energieentzug.

Die Macht wird damit zum Werkzeug, um Rätsel zu lösen, und nicht nur zu einer großen Zahl.

### 13. Ausrüstung

Alles stammt aus der Lore:

- **Bestienausrüstung:** Sie wird aus **Bestienkristallen** in den Stufen der Waffen- und
  Kristallklassen (29) gefertigt, bis hin zu Legendary- und Dämonenkristallen. Beispiel: die
  Black Horned Gauntlets (29).
- **Alex als Schmied:** Neue Stufen schalten sich frei, wenn Alex sie im Roman kann.
- **Seelenwaffen:** entstehen an Kanonpunkten, zum Beispiel Quinns Shadow Mist (2164) oder die
  Seelenwaffen anderer Figuren.
- **Blutkristall-Rüstungen:** die Königsrüstung (728) und Arthurs Rüstung (804).
- **God-Slayer-Rüstung:** Teile mit Modulen wie Limitless oder der Maske mit Blutbank, als
  letzte Ausrüstungsstufe.

**Keine zufälligen Werte-Würfel und kein Loot-Slot-Automat.** Wenige, klare Teile mit festen
Eigenschaften und Verbesserungsstufen.

### 14. Team-System

- **Bis zu 3 Figuren pro Mission.** Die Geschichte legt fest, wer dabei ist, mit ein paar
  Wahlmöglichkeiten (entschieden):
  - Waren im Roman mehr Figuren in der Szene als Plätze frei sind, wählst du aus genau diesen
    Figuren aus. Beispiel: In der Aula sind Raten, Erin und Layla dabei, du nimmst zwei davon mit.
  - Bei Aufgaben, die im Roman aufgeteilt werden, entscheidest du, welchen Teil du spielst. Der
    Rest läuft wie im Roman. Beispiel: Beim Befreiungskommando kämpfen mehrere Gruppen an
    verschiedenen Orten.
  - Frei wählbar sind Teams nur in Nebenmissionen, in Logans Simulationskammer und im Endgame.
- **Wechselangriff:** Die Figur, die hereinkommt, führt einen eigenen Einstiegsangriff aus.
- **Kanon-Synergien:** Quinn und Layla haben eine Blutbank-Verbindung, die Quinn-Arthur-Schatten
  ergänzen sich, und Fex und Peter haben eine Hunger-Verbindung. Sie werden nur verwendet, wo der
  Roman sie zeigt.
- **Die Cursed Faction** ist später ein Fraktions-Hub mit Mitgliedern, Schiffen und Aufträgen.
  Die Aufträge sind kurze Missionen mit Nebenfiguren.

### 15. Missionstypen

- **Szene**, ohne Kampf.
- **Gefecht**, **Duell**, **Boss** und **Schlacht**.
- **Training:** Qi bei Leo oder Chris, Kampfkunst, Rüstung testen.
- **Prüfung:** der Fähigkeitstest (4–14), Turniere, der Penswi-Turm (2197).
- **Infiltration:** Nachtdämon-Einsätze (352–375), Unterricht an der Vampirschule unter
  Decknamen, Quinn als Wachmann.
  - Mit Shadow Cloak und leichter Schleich-Mechanik: gesehen werden = Alarm.
- **Jagd:** Bestien auf Portalplaneten, Kristalle.
- **Schutz und Flucht:** jemanden sichern, entkommen.
- **Rückblick.**

### 16. Kampagnenstruktur

Acht Akte, entsprechend den Phasen des Romans, jeweils mit vielen Missionen. Kleine Ereignisse
bekommen **eigene** Missionen.

- **Akt I, Der schwächste Schüler (1–138):** rund 30 Missionen, zum Beispiel:
  - Das schwarze Buch (1–3).
  - Der Fähigkeitstest (4–9).
  - Tigerkrallen-Kyle, als erster Kampf mit Inspect (10–11).
  - Tagesquests (2–10).
  - Rylee im Park, als Finten-Duell (17).
  - Blood Swipe mit Layla (26).
  - Das Dach mit Fei und Loop, erste Blutgruppen (36).
  - Waffensaal und Black Horned Gauntlets (29).
  - Die Aula (41–47) mit dem Boss Mono.
  - Das rote Portal (65–91), mit der Evolution zum Vampir (86).
  - Caladi (111–138).
- **Akt II, Geheimnisse der Vampire (139–400).**
- **Akt III, Der zehnte Familienleiter (401–553).**
- **Akt IV, Bürgerkrieg und Cursed Faction (554–858).** Hier kommen die ersten Schlachten.
- **Akt V, Kampf um den Thron (859–1143).**
- **Akt VI, Dalki-Krieg (1144–1700).**
- **Akt VII, Celestials, Dhampirs und Red Space (1701–2056).**
- **Akt VIII, Der letzte Vampir (2057–2545).**

Die 80 Dossier-Missionen aus `nachtfall/story/story-bible.json` sind das Grundgerüst. Jede davon
wird zu einem Bogen mit 3 bis 10 spielbaren Missionen. **Ziel sind langfristig 300 bis 500
Missionen.**

### 17. Wiederspielbarkeit

- **Missionsbewertung** mit Zeit, Treffern und Konter, dazu 3 Zusatzziele pro Mission.
- **Verschiedene Ausrüstungen:** Mit 4 Plätzen aus vielen Kanon-Skills und Kombinationsskills
  entstehen verschiedene Builds.
- **Anderes Team:** in Missionen, die mehrere Figuren zulassen.
- **Herausforderungsstufen:** mit Hunger, ohne Blutbank, nur Kampfkunst, Sonne, oder Duell ohne
  Inspect.

### 18. Endgame

Das Endgame ist ebenfalls vollständig im Roman verankert:

- **Logans Simulationskammer:** Der Roman hat eine VR-Scan-Kammer, in der die Anführer
  gegeneinander kämpfen (1415–1421).
  - Dort darf man **jede Figur gegen jeden früheren Boss** spielen.
  - Das ist die einzige Stelle mit freien Paarungen, und sie ist in der Lore begründet.
- **Der Turm der Penswi:** Der Roman hat einen Prüfturm mit Stockwerken (2197). Daraus wird ein
  Turm mit 50 und mehr Stockwerken als steigende Herausforderung.
- **Grand Meet Up:** Das Sportfest der Vampire (2446) wird zum Event-Modus mit Parcours,
  Zielschießen und Duellen.
- **Mundus' Prüfungen:** die Kämpfe gegen die Stärksten ferner Welten (2108–2186) als harte
  Bossreihe.

### 19. Monetarisierung – nicht Pay-to-Win

**Zuerst eine wichtige Einschränkung:** *My Vampire System* ist ein fremdes Werk. Solange es keine
**Lizenz** der Rechteinhaber gibt, bleibt das Projekt eine private Fan-Umsetzung ohne Einnahmen.

**Falls es später eine Lizenz gibt:**
- **Einmal kaufen**, und jeder Akt ist ein bezahlbarer Kapitel-Nachschub. Akt I könnte kostenlos
  als Einstieg dienen.
- **Kosmetik aus dem Kanon:** Quinns Maske, das „BB“-Auftreten, die Uniformen der Akademie, die
  Kleidung der Familien.
- **Keine Gacha, keine Energie-Timer, keine kaufbaren Werte.** Figuren kommen durch die
  Geschichte. Eine Gacha widerspricht der Storylogik.

### 20. Technische Umsetzbarkeit

**Empfehlung: die Engine aus Nachtfall weiterentwickeln** (HTML5, Canvas, JavaScript), als PWA
fürs Handy und später mit Capacitor für den App Store und Google Play.

**Vorteile:**
- Renderer, Partikel, Licht, Audio, Horden-Logik, UI und Speicherstände existieren bereits.
- Man kann am iPhone sofort testen.
- Die KI-gestützte Entwicklung ist dort am schnellsten.

**Nachteile:**
- Hunderte Gegner mit Echtzeitkampf erfordern Optimierung, etwa Sprite-Caches und
  Objekt-Pools. Nachtfall macht das bereits.
- Wirklich hochwertige Animationen brauchen später ein Grafik-Werkzeug. Der prozedurale
  Zeichenstil von Nachtfall ist ein guter, konsistenter Start.

**Unity oder Godot** lohnen sich erst, wenn 3D oder ein großes Team dazukommt. Ein Wechsel später
ist möglich, weil Daten wie Figuren, Skills, Missionen und Dialoge von Anfang an **als Daten**
angelegt werden, zum Beispiel als JSON, und nicht als Code.

**Datengetriebener Kern:**
- Skills bestehen aus Bausteinen: Projektil, Fläche, Dash, Buff, Beschwörung, Kosten und
  Kanon-Freischaltung.
- Neue Figuren entstehen hauptsächlich aus Daten und etwas Zeichnung.

### 21. Entwicklungsaufwand

Grobe Schätzung, ein Entwickler mit starker KI-Unterstützung:

| Paket | Aufwand |
|---|---|
| Kampfkern (Steuerung, Combo, Ausweichen, Konter, Skills als Daten, Tag-Wechsel) | 3–4 Wochen |
| Story-Ebene (Panels, System-Fenster, Quests, Speicherstand, Hub) | 2–3 Wochen |
| Duell-Regeln und Boss-Framework (Phasen, Ankündigungen) | 2 Wochen |
| Schlacht-Regeln (aus dem Nachtfall-Code) | 1–2 Wochen |
| **Vertical Slice insgesamt** | **ca. 8–11 Wochen** |
| Danach pro Akt (Inhalt, Figuren, Bosse, Balance) | 1–3 Monate |

Das größte Risiko ist nicht die Technik, sondern die **Menge an Inhalt**. Deshalb gilt: Datenformat
zuerst, Werkzeuge für Szenen und Missionen früh.

### 22. Was zuerst gebaut wird – der Vertical Slice

**Vertical Slice 1: „Das schwarze Buch“ (Akt I, Kapitel 1–47).** Er beweist Kampfkern, Duell,
Boss, Story und Hub.

1. **Das schwarze Buch (1–3):** Szene mit dem System, das erwacht, und dem Statusfenster mit
   10 HP. Tagesquest „2 Liter Wasser“.
2. **Die Akademie als Hub (4–14):** Schlafsaal, Kantine und der Fähigkeitstest als Mission vom
   Typ Prüfung.
3. **Der erste Kampf, Kyle (10–11):** ein Gefecht ohne Kräfte, nur Kampfkunst. Danach erhält
   Quinn Inspect.
4. **Die Sonne (3, 17):** Tagesquest „Meide die Sonne“. Schattenzonen schützen, im Licht werden
   die Werte halbiert.
5. **Rylee (17), das erste Duell:** Er verhärtet immer nur eine Stelle, also muss man mit Inspect
   und Finten gewinnen. Danach die **Evolution zum Halbling** und **Blood Swipe**.
6. **Blood Swipe mit Layla (26):** ein Tag-Team aus Quinn und Layla. Blood Swipe kostet 1 HP,
   und die Blutbank ist eingeführt.
7. **Das Dach (36):** Blutgruppen. Ein Biss gibt einen Wertepunkt.
8. **Die Aula (41–47):**
   - Ein Gefecht gegen die Zweitjährigen.
   - Tag-Team mit Raten, Erin und Layla.
   - **Bosskampf gegen Mono**, der zwei Sekunden in die Zukunft sieht.

**Vertical Slice 2, danach:** eine **Schlacht** aus Akt IV, zum Beispiel der Kampf um die zehnte
Burg gegen Bloodsucker. Damit wird der Schlachtmodus an einem Quinn im mittleren Machtbereich
geprüft.

---

## Entscheidungen

1. **Tag-Team:** Die Geschichte bestimmt, wer dabei ist, mit ein paar Wahlmöglichkeiten
   (siehe Abschnitt 14).
2. **Namen:** englische Originalnamen. Ray heißt im neuen Spiel **Ray** (in Nachtfall bleibt er
   Sen Draco).
3. **Ansicht:** keine Seitenansicht. Offen ist noch, ob es die schräge Ansicht von oben wird oder
   eine Kamera hinter der Figur.
