# GPT-Paket 1: Hintergründe, Modus-Karten, Kampagnen-Symbole

Für die Schritte 3 (System), 4 (Helden), 5 (Modi), 6 (Kampagne) und 8 (Fraktion).
Es sind 15 Bilder. Sie sollen zum Schmiede-Hintergrund passen, der schon im Spiel ist (`schmiede_hg`).

## So gehst du vor
1. Zuerst den passenden **Stil-Baustein** kopieren, direkt dahinter den Prompt des Bildes.
2. Die Bilder **einzeln direkt aus ChatGPT speichern** (nicht als ZIP, da waren zuletzt zwei Dateien kaputt).
3. Hochladen nach `nachtfall/art/gpt/`, mit dem Dateinamen aus der Tabelle.
4. **Nirgends Text im Bild.** Beschriftungen setze ich im Spiel darauf.

---

## A. Hintergründe (Hochformat 1024x1536)

### Stil-Baustein Hintergrund (immer davor kopieren)
```
Vertical mobile game menu background, 1024x1536 portrait. Painted stylized dark fantasy like a premium
mobile RPG, same look as a glowing blacksmith forge background: rich lighting, soft painterly detail,
strong depth. Dark gothic vampire world. The middle area from 15% to 85% height stays calmer and darker
so UI panels can sit on top. No characters in the foreground, no text, no letters, no logos.
```

| Datei | Prompt (hinter den Baustein kopieren) |
|---|---|
| `bg_system.png` | `A digital void above the world: pure black and deep blue space, thin glowing cyan and ice-blue grid lines fading into the distance, floating translucent blue rectangular windows without any text, faint hexagon patterns, slight glitch streaks, cold sci-fi light. Almost no gold, no fantasy ornaments. It must feel like an alien system that watches over the fantasy world.` |
| `bg_helden.png` | `A dark gothic character chamber: black stone floor with a round engraved crimson circle in the lower middle like a stage, a single cold spotlight from above, tall gothic windows with violet night light at the back, dark red velvet banners on the sides, candles, floating dust in the light beam. Empty stage for a hero to stand on.` |
| `bg_modi.png` | `A mysterious nexus hall between worlds: a circular stone platform with three glowing portals in the background (left portal red with a dark tower silhouette inside, middle portal violet with an endless night and moon inside, right portal golden with an arena inside), mist on the floor, violet and crimson light.` |
| `bg_fraktion.png` | `A gothic vampire castle war room: a large dark wooden war table with a map and small figures in the lower part, tall stone pillars, hanging crimson banners with an empty coat of arms shape (no symbol), torches and warm fire light mixed with violet moonlight from high windows, weapon racks on the walls.` |

---

## B. Modus-Karten (Querformat 1536x1024)

### Stil-Baustein Karte
```
Mobile game mode selection card artwork, landscape 1536x1024, painted stylized dark fantasy like a
premium mobile RPG, dramatic lighting, strong silhouette in the center, dark edges (vignette) so a frame
can be placed around it. No text, no letters, no UI.
```

| Datei | Prompt |
|---|---|
| `karte_turm.png` | `A tall dark gothic tower reaching into a red night sky, many floors with glowing windows, lightning around the top, a huge monster silhouette on the top platform, stone stairs spiraling up.` |
| `karte_endlos.png` | `An endless night battlefield under a giant blood moon: countless glowing red eyes of monster hordes in the darkness, a lone hooded figure with a crimson aura standing in the middle, mist, no end in sight.` |
| `karte_pruefung.png` | `An ancient stone arena ring lit by golden and violet runes on the floor, broken pillars, floating runic seals in the air, a single spotlight on the center of the arena.` |

---

## C. Kampagnen-Symbole (quadratisch 512x512, transparenter Hintergrund)

### Stil-Baustein Symbol
```
Mobile game map node icon, 512x512, transparent background, glossy painted fantasy style, dark gothic
vampire theme, a round medallion with a thin gold rim and a dark violet center, the symbol in the
middle glowing, clean silhouette readable at 48 pixels, front view. No text, no letters, no numbers.
```

| Datei | Symbol in der Mitte |
|---|---|
| `node_duell.png` | `two crossed swords, crimson glow` |
| `node_durchhalten.png` | `an hourglass with red sand, cold blue glow` |
| `node_jagd.png` | `a target crosshair made of claw marks, orange glow` |
| `node_ueberleben.png` | `a shield surrounded by many small enemy eyes, green glow` |
| `node_wellenboss.png` | `a spiked crown above a wave of horns, gold glow` |
| `node_bloodsucker.png` | `bat wings with dripping blood fangs, deep red glow` |
| `node_boss.png` | `a horned skull, bright crimson glow, slightly bigger and more ornate medallion with spikes on the rim` |

---

## Reihenfolge, falls du nicht alles auf einmal schaffst
1. `bg_system.png` (brauche ich als Erstes, Schritt 3)
2. `bg_helden.png` (Schritt 4)
3. die 7 Kampagnen-Symbole (Schritt 6)
4. `bg_modi.png` und die 3 Modus-Karten (Schritt 5)
5. `bg_fraktion.png` (Schritt 8)

Fehlt ein Bild, wenn ich an dem Schritt bin, baue ich mit einem gezeichneten Platzhalter weiter
und tausche es später aus.
