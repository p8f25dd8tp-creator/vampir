# Bild-Prompts für Nachtfall (für ChatGPT / GPT-Bildgenerator)

So gehst du vor:

1. Kopiere **immer zuerst den Stil-Baustein** und direkt dahinter den Prompt des Bildes.
   So sehen alle Bilder gleich aus.
2. Bitte GPT um **PNG mit transparentem Hintergrund** (bei Icons). Wenn der Hintergrund nicht
   transparent wird, schreib hinterher: „Bitte dasselbe Bild mit transparentem Hintergrund“.
3. Schick mir die Bilder hier im Chat und nenn den **Dateinamen** (steht bei jedem Prompt).
   Ich verkleinere und baue sie ein.
4. Ein Bild gefällt dir nicht? Einfach neu erzeugen lassen – nur die, die dir gefallen, schicken.

Die Prompts sind auf Englisch, weil der Bildgenerator damit am zuverlässigsten arbeitet.

---

## Stil-Baustein (immer davor kopieren)

```
Style: polished stylized 3D mobile game art, cute chibi proportions, dark fantasy but colorful
("dark-colorful"): deep violet and indigo base tones with glowing crimson, gold and cyan accents.
Soft toon shading, thick dark outline, glossy highlights, slight rim light. Clean readable
silhouette, centered, fills about 80% of the image. No text, no letters, no numbers, no watermark,
no frame, no border.
```

---

## 1. Ausrüstung (Schmiede)

Format für alle: `square 1024x1024, transparent background, single object, game item icon, 3/4 view`

Die Ausrüstung hat 6 Stufen. Mach zuerst **nur die Basis-Version** jedes Teils. Wenn dir der Stil
gefällt, kannst du die anderen Stufen erzeugen: den Prompt nehmen und den passenden Stufen-Satz
aus der Tabelle anhängen.

| Stufe | Dateiname-Endung | Satz zum Anhängen |
|---|---|---|
| Basis | `_1` | `Material: plain dark iron and rough beast bone, no glow.` |
| Mittel | `_2` | `Material: polished steel with green crystal inlays, faint green glow.` |
| Hoch | `_3` | `Material: bright silver with blue crystal inlays, blue glow.` |
| König | `_4` | `Material: black metal with purple crystals and ornate royal trim, purple glow.` |
| Halbgott | `_5` | `Material: radiant gold with white-gold crystals, golden halo glow.` |
| Dämon | `_6` | `Material: obsidian and crimson crystal, dark red flames and smoke, menacing red glow.` |

**Bestienwaffe** → `waffe_1.png` … `waffe_6.png`
```
A short fantasy sword forged from a monster's bone blade and a glowing beast crystal in the hilt,
jagged edge, wrapped leather grip.
```

**Bestienhandschuhe** → `handschuhe_1.png` … `handschuhe_6.png`
```
A single armored fighting gauntlet made from beast plates, clawed fingertips, a crystal set in the
back of the hand.
```

**Bestienrüstung** → `ruestung_1.png` … `ruestung_6.png`
```
A chest armor piece made of overlapping beast scales and plates, high collar, a crystal core in the
center of the chest.
```

**Bestienstiefel** → `stiefel_1.png` … `stiefel_6.png`
```
A pair of armored boots made of beast hide and plates, small claw spikes at the toes, light and fast
looking.
```

**Kristallamulett** → `amulett_1.png` … `amulett_6.png`
```
A pendant amulet on a short chain, a large faceted beast crystal in a clawed metal setting, glowing
from within.
```

---

## 2. Währungen

Format: `square 1024x1024, transparent background, single icon`

**Seelen** (✦, wie Gold) → `seelen.png`
```
A glowing violet soul orb with a wispy pale flame inside and tiny sparkles around it, magical
currency icon.
```

**Bestienkristalle** (◆) → `kristall.png`
```
A cluster of three sharp cyan-blue beast crystals, faceted, glowing inner light, magical currency
icon.
```

---

## 3. Tab-Leiste unten (Hauptmenü)

Format: `square 1024x1024, transparent background, bold chunky icon, readable at very small size`

| Tab | Dateiname | Prompt |
|---|---|---|
| Kampagne | `tab_kampagne.png` | `Two crossed swords over a round dark shield with a crimson gem, golden trim.` |
| Helden | `tab_helden.png` | `A cute chibi hero bust with dark hair and round glasses, a faint red glow in the eyes, black coat collar.` |
| Schmiede | `tab_schmiede.png` | `A blacksmith anvil with a hammer resting on it, glowing orange hot metal and sparks.` |
| Familie | `tab_familie.png` | `A small dark gothic castle with a single tall tower and a crimson banner, windows glowing warm.` |
| System | `tab_system.png` | `A floating translucent blue holographic window panel with a glowing eye symbol, sci-fi fantasy.` |
| Herausforderungen | `tab_events.png` | `A golden trophy cup with a purple gem, small stars around it.` |

---

## 4. Seitenknöpfe auf der Kampagnenkarte

Format: `square 1024x1024, transparent background, bold chunky icon`

| Knopf | Dateiname | Prompt |
|---|---|---|
| Aufgaben | `btn_aufgaben.png` | `A rolled-open parchment scroll with three glowing checkmarks.` |
| Boss-Turm | `btn_turm.png` | `A tall dark spiked tower with a glowing red window at the top and a small skull emblem.` |
| Endlos | `btn_endlos.png` | `A full pale moon above three small gravestones, violet mist.` |
| Chronik | `btn_chronik.png` | `An old thick leather book with a crimson blood-drop emblem on the cover, slightly open, glowing pages.` |
| Einstellungen | `btn_settings.png` | `A metallic gear cog with a small violet gem in the center.` |

---

## 5. Helden-Porträts (für die Heldenkarten)

Format: `square 1024x1024, transparent background, chibi character bust portrait (head and shoulders),
facing slightly to the side, friendly but cool expression`

Beschreibungen sind bewusst allgemein gehalten (eigene Gestaltung, keine Vorlage aus Film oder Comic).

| Held | Dateiname | Prompt |
|---|---|---|
| Finn Müller | `held_finn.png` | `Young man, short dark brown hair, round black glasses, grey hoodie under a dark jacket, subtle red glow in his brown eyes.` |
| Peter Kraus | `held_peter.png` | `Young man, short brown hair, earthy olive-brown clothes, holding a clay staff, calm pale-green glow.` |
| Emma Wagner | `held_emma.png` | `Young woman, long white-silver hair, ice-blue eyes, dark navy military coat, a thin ice sword on her shoulder, frost sparkles.` |
| Lena Grimm | `held_lena.png` | `Young woman, long dark purple-black hair, violet eyes, dark purple outfit, a bow on her back, floating small stones (telekinesis).` |
| Fabian Schneider | `held_fabian.png` | `Young man, spiky blond hair, blue eyes, dark blue uniform, confident grin.` |
| Sil Skala | `held_sil.png` | `Young man, spiky blond hair, violet eyes, dark blue uniform with purple trim, quiet serious look.` |
| Fex Sanguini | `held_fex.png` | `Pale young vampire, short black hair, glowing red eyes, dark crimson coat with high collar, small fangs.` |
| Leo | `held_leo.png` | `Older calm swordsman, shaved head, eyes closed (blind), wide straw hat, white robe, a katana hilt at his shoulder.` |
| Chris | `held_chris.png` | `Young man, short black hair, dark teal outfit, a cloth mask over the lower face, glowing teal eyes, chains around his arm.` |
| Leander Lothringen | `held_leander.png` | `Small boy (child), short dark brown hair, grey-blue jacket, blue goggles on his forehead, curious look.` |
| Agathon | `held_agathon.png` | `Tall dark knight, long black hair, pale skin, violet glowing eyes, black armor, dark purple cape, royal sword.` |
| Sam | `held_sam.png` | `Young man, short brown hair, green jacket, friendly smile, a gentle wind swirl around him.` |
| Mia Müller | `held_mia.png` | `Young girl, dark skin, black hair in a ponytail, pale glowing eyes, dark purple outfit, shadowy aura.` |
| Draco | `held_draco.png` | `Young man, spiky dark red hair, golden eyes, two small ivory horns, dark brown and gold outfit, gold-orange cape, dragon-like aura.` |

---

## 6. Menü-Grafiken

**Logo** → `logo.png`
Format: `wide 1536x1024, transparent background`
```
Game logo with the word "NACHTFALL" in bold gothic fantasy letters, dark metal letters with crimson
glowing cracks, a small bat and a crescent moon integrated into the letters, glossy mobile game logo
style. The text must read exactly: NACHTFALL
```
(Hier ist Text erlaubt – den Stil-Baustein trotzdem davor, aber den Satz „No text, no letters“
darin weglassen.)

**Titelbild / Startbildschirm** → `titel.png`
Format: `portrait 1024x1536, full background, no transparency`
```
Epic night scene: a young man with dark hair and round glasses stands on a floating rock island,
blood-red energy swirling around his hand, a huge pale moon behind him, a gothic castle silhouette
and other small floating islands in a violet-indigo night sky with stars. Leave the top quarter and
bottom quarter calmer for menu buttons.
```

**Hintergrund für Menüseiten** (Helden, Schmiede, Familie …) → `menue_hg.png`
Format: `portrait 1024x1536, full background, no transparency`
```
Soft blurred background: dark violet and indigo gradient night sky, faint stars, a few soft glowing
crimson and cyan light particles, very calm, no objects in the center, suitable as a UI background
behind menus.
```

**Schmiede-Hintergrund** → `schmiede_hg.png`
Format: `portrait 1024x1536, full background, no transparency`
```
A cozy dark fantasy forge interior: stone walls, a glowing forge fire on the left, an anvil in the
center bottom, weapons hanging on the wall, warm orange light mixing with violet shadows, calm
center area for UI.
```

---

## 7. Referenzbilder für die Boss-Modelle

Diese Bilder kommen **nicht direkt ins Spiel**. Ich schaue sie mir an und baue danach das bewegliche
3D-Modell. So bestimmst du, wie die Bosse aussehen.

Format für alle: `wide 1536x1024, plain light grey background`

Vor jede Boss-Beschreibung diesen Satz setzen (statt des normalen Stil-Bausteins):
```
Character model reference sheet for a stylized 3D chibi mobile game: the same character shown four
times side by side in a neutral standing pose — front view, 3/4 view, side view, back view. Big head,
short body, clear simple shapes, flat readable colors, thick dark outline, soft toon shading.
Plain light grey background, no text, no labels.
```

| Etappe | Boss | Dateiname | Beschreibung |
|---|---|---|---|
| 1 | Mono | `ref_boss_1.png` | `A cold, arrogant top student: dark spiky hair, icy blue eyes, navy academy uniform with a silver trim, holding a straight sword.` |
| 2 | Ian, der Reisende | `ref_boss_2.png` | `A calm wanderer: brown hair, weathered brown long coat, wide traveling hat, a long wooden staff with a small crystal.` |
| 3 | Dalki | `ref_boss_3.png` | `A large muscular humanoid alien warrior with grey-blue stone-like skin, one bony spike growing from the forehead, glowing orange eyes, simple dark loincloth armor.` |
| 4 | Duke | `ref_boss_4.png` | `A strict middle-aged commander: short silver hair, grey armored military suit, dark cape, a heavy sword.` |
| 5 | Vollstrecker des Vampirrats | `ref_boss_5.png` | `A pale vampire enforcer: short black hair, glowing red eyes, small fangs, black and crimson uniform, long crimson cape, a thin sword.` |
| 6 | Hilston Blade | `ref_boss_6.png` | `An elegant swordsman leader: long white hair, dark coat, dark red cape, a katana at his side, confident look.` |
| 7 | Diamantkrabbe | `ref_boss_7.png` | `A giant crab monster with a dark blue shell covered in large glowing cyan diamond crystals, two huge claws, six legs, eyes on stalks.` |
| 8 | Cindy Cha | `ref_boss_8.png` | `A pale vampire lady: long pink hair, glowing red eyes, small fangs, elegant crimson and black coat-dress with a high collar.` |
| 9 | Laxmus | `ref_boss_9.png` | `An ancient vampire lord: long silver hair, glowing red eyes, fangs, dark red royal robes, large bat wings, a red crown.` |
| 10 | Graham | `ref_boss_10.png` | `A huge alien general of the same species as the grey stone-skinned warriors: a crown of ten golden bony spikes on his head, glowing orange eyes, heavy dark armor pieces.` |
| 11 | Emma Wagner (Dhampir-Königin) | `ref_boss_11.png` | `A young queen: long white-silver hair, ice-blue eyes, dark navy royal coat, a crown of ice crystals, a thin ice sword, frost around her.` |
| 12 | Jim Eno | `ref_boss_12.png` | `A vampire scientist: spiky dark hair, round glasses, glowing red eyes, fangs, dark lab coat over black clothes, a metal staff.` |
| 13 | Sen Draco | `ref_boss_13.png` | `A young man with spiky dark red hair, golden eyes, two small ivory horns, dark brown and gold outfit, gold-orange cape, dragon scales on his arms.` |
| 14 | Kronker | `ref_boss_14.png` | `A demon king with red skin and four muscular arms, big black curved horns, a glowing orange core in his chest, dark armor plates.` |
| 15 | Immortui | `ref_boss_15.png` | `A tall shadow demon made of darkness: a robe that fades into smoke, a crown of violet flames, pale glowing eyes, glowing violet hands.` |

---

## 8. Bodentexturen für die Kampf-Arenen

Diese Bilder kommen direkt als Boden ins Spiel. Wichtig ist, dass sie **nahtlos kachelbar** sind:
Die Ränder müssen links/rechts und oben/unten zusammenpassen.

Format für alle: `square 1024x1024, full image, no transparency`

Vor jede Beschreibung diesen Satz setzen (statt des normalen Stil-Baustein):
```
Seamless tileable ground texture for a top-down game, viewed straight from above, no perspective, no
horizon, even soft lighting without strong shadows, medium-low contrast so characters stay readable,
stylized painted look with slightly dark colorful tones. The left/right and top/bottom edges must tile
seamlessly. No objects taller than the ground, no characters, no text.
```

| Etappe(n) | Arena | Dateiname | Beschreibung |
|---|---|---|---|
| 1 | Akademie-Übungsgelände | `boden_akademie.png` | `Grey stone paving slabs with thin grass in the gaps, a few painted white training lines, small cracks.` |
| 2 | Rote Zone hinter dem Portal | `boden_rotezone.png` | `Dusty red alien soil with dark cracks, small reddish pebbles, a few glowing red mineral veins.` |
| 3 | Planet Caladi | `boden_caladi.png` | `Warm sandy desert ground with small rocks, dry cracks and scattered orange-tinted pebbles.` |
| 4 | Militärbasis bei Nacht | `boden_basisnacht.png` | `Dark blue-grey concrete with metal plates, painted yellow markings, a few bolts and oil stains.` |
| 5, 8 | Vampirsiedlung / zehnte Burg | `boden_siedlung.png` | `Dark purple-grey cobblestones with moss between the stones and a few dried dark red stains.` |
| 6, 9 | Ruinen | `boden_ruinen.png` | `Broken ancient sandstone tiles with rubble, cracks, sand and small patches of dry grass.` |
| 7 | Schlachtfeld | `boden_schlachtfeld.png` | `Churned muddy battlefield earth with trampled grass, footprints, small stones and scorch marks.` |
| 10, 15 | Roter Himmel | `boden_roterhimmel.png` | `Dark scorched rock ground with glowing orange-red lava cracks and ash.` |
| 11 | Himmelsebene | `boden_himmel.png` | `White and pale gold marble floor tiles with soft light, a few thin golden ornament lines, wisps of cloud.` |
| 12 | Dschungel | `boden_dschungel.png` | `Dense jungle floor with dark green moss, roots, fallen leaves and small glowing turquoise mushrooms.` |
| 13 | Götterwelten | `boden_goetter.png` | `Ancient blue-violet stone tiles with golden inlaid runes that glow faintly.` |
| 14 | Red Space | `boden_redspace.png` | `Black obsidian-like ground with deep crimson glowing fissures and tiny floating red sparks.` |

---

## 9. Boss-Intro-Karten

Ein großes Bild, das kurz eingeblendet wird, wenn der Boss erscheint (wie in vielen Mobile-Games).
Hier darf es statisch sein.

Format für alle: `wide 1536x1024, full background, no transparency`

Normalen Stil-Baustein davor und dann:
```
Dramatic boss introduction splash art: [BESCHREIBUNG], dynamic heroic pose, seen from slightly below,
strong rim light, dark dramatic background with colored energy matching the character, the character
on the right two thirds, empty darker area on the left third for a title.
```
Für **[BESCHREIBUNG]** nimmst du die Beschreibung desselben Bosses aus Abschnitt 7.
Die Dateinamen sind `intro_boss_1.png` bis `intro_boss_15.png`.
