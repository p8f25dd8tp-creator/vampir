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

Weitere Prompts für Bosse und Kampf-Arenen stehen in `BOSSE-ARENEN-PROMPTS.md`.
