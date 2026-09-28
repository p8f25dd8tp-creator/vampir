# Bild-Prompts: Menü und Bedienelemente (Nachtfall)

Damit Knöpfe, Leisten und Fenster nicht mehr „wie Paint“ aussehen, bekommen sie gemalte Rahmen.
Die Beschriftung setze ich im Spiel selbst darauf. Deshalb ist **nirgends Text im Bild**.

So gehst du vor:

1. Zuerst den **UI-Stil-Baustein** kopieren, direkt dahinter den Prompt des Elements.
2. **Transparenter Hintergrund** ist hier Pflicht.
3. Bilder **direkt aus ChatGPT speichern** (nicht über ZIP) und nach `nachtfall/art/ui` hochladen.
   Dateiname steht jeweils dabei.
4. Wichtig bei Leisten, Knöpfen und Fenstern: **Verzierung nur an den Rändern und Ecken, die Mitte
   ruhig und gleichmäßig.** Dann kann ich sie auf jede Breite strecken, ohne dass es verzerrt.

---

## UI-Stil-Baustein (immer davor kopieren)

```
Mobile game UI element, polished glossy fantasy style like a premium mobile RPG, dark gothic vampire
theme: deep violet and indigo base, crimson and gold metal accents, ornate but clean, soft bevel,
subtle inner glow, front view without perspective, crisp edges. Transparent background.
No text, no letters, no numbers, no icons unless stated. Decorations only at the edges and corners;
the center area stays plain and even so the element can be stretched (9-slice friendly).
```

---

## 1. Leisten

| Datei | Format | Prompt |
|---|---|---|
| `ui_topbar.png` | wide 1536x256 | `A horizontal top bar frame for the main menu: dark violet glossy panel with a thin gold rim, small crimson gems in the two corners, gothic filigree along the bottom edge.` |
| `ui_tabbar.png` | wide 1536x320 | `A horizontal bottom navigation bar background: dark indigo glossy panel with a gold top rim and subtle gothic arches, darker at the bottom.` |
| `ui_tab_active.png` | square 512x512 | `A highlighted tab button plate: a raised golden shield-shaped plate with glowing warm light, beveled gold edges, slightly taller than wide.` |
| `ui_sheet.png` | wide 1536x768 | `A large bottom sheet panel for a level selection screen: dark violet glossy panel with an ornate gold top border and a crimson gem in the middle of the top edge.` |

## 2. Knöpfe

| Datei | Format | Prompt |
|---|---|---|
| `ui_btn_gold.png` | wide 1024x384 | `A large glossy golden play button, rounded rectangle, bright gold with orange gradient, thick dark bronze outline, shiny highlight on top, ornate corner tips.` |
| `ui_btn_purple.png` | wide 1024x384 | `A glossy violet button, rounded rectangle, purple gradient with gold rim, shiny top highlight.` |
| `ui_btn_red.png` | wide 1024x384 | `A glossy crimson button, rounded rectangle, blood red gradient with gold rim, shiny top highlight, slightly menacing gothic corner tips.` |
| `ui_btn_grey.png` | wide 1024x384 | `A disabled button, rounded rectangle, dull grey-violet stone look, dark rim, no shine.` |
| `ui_btn_round.png` | square 512x512 | `A round icon button frame: violet glossy disc with a thick gold ring and small gothic spikes, empty center for an icon.` |
| `ui_btn_square.png` | square 512x512 | `A square icon button frame with rounded corners: violet glossy plate, gold rim, small crimson gem at the top, empty center for an icon.` |

## 3. Stufen-Knöpfe (Kampagne)

Alle im Format `square 512x512`, einheitlicher Stil, leere Mitte für die Zahl.

| Datei | Prompt |
|---|---|
| `ui_lv_open.png` | `A level node tile: violet glossy rounded square with a silver-gold rim, empty center.` |
| `ui_lv_sel.png` | `A selected level node tile: bright golden glossy rounded square with a glowing aura, empty center.` |
| `ui_lv_locked.png` | `A locked level node tile: dark desaturated violet stone rounded square with cracked rim, empty center.` |
| `ui_lv_boss.png` | `A boss level node tile: crimson glossy rounded square with small horns on the top corners and a gold rim, empty center.` |

## 4. Fenster und Plaketten

| Datei | Format | Prompt |
|---|---|---|
| `ui_panel.png` | square 1024x1024 | `A dialog window frame: dark translucent violet panel with an ornate gold gothic frame, crimson gems in the four corners, plain even center.` |
| `ui_card.png` | wide 1024x512 | `A card frame for an upgrade choice: dark indigo glossy card with a gold rim, small ornament on the left side for an icon slot, plain center.` |
| `ui_nameplate.png` | wide 1024x256 | `A ribbon banner nameplate for a location title: dark violet ribbon with gold edges and folded ends, plain center.` |
| `ui_badge.png` | square 512x512 | `A number badge: small golden shield emblem with a dark center plate, gothic spikes at the top.` |
| `ui_pill.png` | wide 768x192 | `A currency counter pill: dark rounded capsule with a thin gold rim and a round slot on the left for a coin icon, plain center.` |

## 5. Kleine Symbole

Format `square 512x512`.

| Datei | Prompt |
|---|---|
| `ui_star_on.png` | `A glossy golden star icon with a soft glow and a dark outline.` |
| `ui_star_off.png` | `An empty star icon, dark grey-violet with a faint outline, no glow.` |
| `ui_lock.png` | `A small ornate golden padlock icon with a crimson gem, dark outline.` |

## 6. Kampf-Bedienung

| Datei | Format | Prompt |
|---|---|---|
| `ui_skill_ring.png` | square 512x512 | `A round skill button frame for a combat HUD: thick ornate gold ring with small crimson gems, dark violet inner disc, empty center for an icon.` |
| `ui_hpbar.png` | wide 1024x128 | `An empty health bar frame: dark rounded bar with an ornate gold rim and a small skull emblem on the left end, empty inside.` |
| `ui_xpbar.png` | wide 1536x96 | `A thin experience bar frame across the top of a screen: dark violet bar with a thin gold rim, small gems at both ends, empty inside.` |

---

Insgesamt sind es 29 Bilder. Die wichtigsten zuerst: `ui_btn_gold`, `ui_lv_*` (4 Stück), `ui_sheet`,
`ui_tabbar`, `ui_tab_active`, `ui_topbar`, `ui_btn_round`.
