# Bild-Prompts: Bosse und Kampf-Arenen (Nachtfall)

So gehst du vor:

1. Jeder Abschnitt hat einen **eigenen Einleitungssatz**. Den kopierst du zuerst, direkt dahinter die
   Beschreibung aus der Tabelle.
2. Schick mir die Bilder hier im Chat und nenn den **Dateinamen** aus der Tabelle.
3. Gefällt dir ein Bild nicht, lass es einfach neu erzeugen.

Die Prompts sind auf Englisch, weil der Bildgenerator damit am zuverlässigsten arbeitet.

**Stil-Baustein** (nur für Abschnitt 3, die Boss-Intro-Karten):

```
Style: polished stylized 3D mobile game art, cute chibi proportions, dark fantasy but colorful
("dark-colorful"): deep violet and indigo base tones with glowing crimson, gold and cyan accents.
Soft toon shading, thick dark outline, glossy highlights, slight rim light. Clean readable
silhouette, centered, fills about 80% of the image. No text, no letters, no numbers, no watermark,
no frame, no border.
```

---

## 1. Referenzbilder für die Boss-Modelle

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

## 2. Bodentexturen für die Kampf-Arenen

Diese Bilder kommen direkt als Boden ins Spiel. Wichtig ist, dass sie **nahtlos kachelbar** sind:
Die Ränder müssen links/rechts und oben/unten zusammenpassen.

Format für alle: `square 1024x1024, full image, no transparency`

Vor jede Beschreibung diesen Satz setzen (statt des normalen Stil-Bausteins):
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

## 3. Boss-Intro-Karten

Ein großes Bild, das kurz eingeblendet wird, wenn der Boss erscheint (wie in vielen Mobile-Games).
Hier darf es statisch sein.

Format für alle: `wide 1536x1024, full background, no transparency`

Normalen Stil-Baustein davor und dann:
```
Dramatic boss introduction splash art: [BESCHREIBUNG], dynamic heroic pose, seen from slightly below,
strong rim light, dark dramatic background with colored energy matching the character, the character
on the right two thirds, empty darker area on the left third for a title.
```
Für **[BESCHREIBUNG]** nimmst du die Beschreibung desselben Bosses aus Abschnitt 1.
Die Dateinamen sind `intro_boss_1.png` bis `intro_boss_15.png`.
