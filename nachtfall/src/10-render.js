'use strict';
/* ==========================================================================
   RENDERN — Boden, Requisiten, tiefensortierte Figuren, Lichtkarte
   (multiplikativ: Nacht mit Lichtinseln), leuchtende Effekte, Nebel.
   ========================================================================== */

const LM = { c: mkCanvas(8, 8), scale: 0.25 };
let VIGNETTE = null;
const AMBIENT = 'rgb(116,110,150)';
const _drawList = [];

function onResize() { VIGNETTE = null; }
function buildVignette(w, h) {
  const c = mkCanvas(w, h), g = c.getContext('2d');
  const r = Math.hypot(w, h) / 2;
  g.fillStyle = rg(g, w / 2, h / 2, r * 0.45, r, [0, 'rgba(0,0,0,0)', 0.7, 'rgba(4,0,10,0.35)', 1, 'rgba(4,0,10,0.8)']);
  g.fillRect(0, 0, w, h);
  // kuehler Mondschimmer oben, Blutrot unten
  g.fillStyle = lg(g, 0, 0, 0, h, [0, 'rgba(60,70,140,0.12)', 0.4, 'rgba(0,0,0,0)', 1, 'rgba(80,0,20,0.18)']);
  g.fillRect(0, 0, w, h);
  return c;
}

function heroPx() { return clamp(VIEW.scale * 1.3, 2, 3.4); }

function renderWorld(G, time) {
  const S = VIEW.scale, cam = G.cam;
  _curCam = cam;
  const W = cv.width, H = cv.height;
  let sx = 0, sy = 0;
  if (G.shake > 0) { sx = (Math.random() - 0.5) * G.shake; sy = (Math.random() - 0.5) * G.shake; }
  const x0 = cam.x - VIEW.w / 2 + sx, y0 = cam.y - VIEW.h / 2 + sy;
  _camX0 = x0; _camY0 = y0;
  const camv = { x: cam.x, y: cam.y, w: VIEW.w, h: VIEW.h };
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = true;
  ctx.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);

  /* 1) Boden */
  const T = WORLD.tileSize;
  const tx0 = Math.floor(x0 / T), ty0 = Math.floor(y0 / T);
  const tx1 = Math.floor((x0 + VIEW.w) / T), ty1 = Math.floor((y0 + VIEW.h) / T);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) ctx.drawImage(WORLD.groundTile, tx * T, ty * T, T + 0.6, T + 0.6);
  // Chunks
  const cx0 = Math.floor((x0 - 160) / CHUNK), cx1 = Math.floor((x0 + VIEW.w + 160) / CHUNK);
  const cy0 = Math.floor((y0 - 200) / CHUNK), cy1 = Math.floor((y0 + VIEW.h + 200) / CHUNK);
  const props = [];
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
    const list = chunkProps(cx, cy);
    for (const pa of list.patches) {
      ctx.save(); ctx.translate(pa.x, pa.y); ctx.rotate(pa.rot); ctx.globalAlpha = 0.9;
      ctx.drawImage(pa.c, -pa.c.width / 2, -pa.c.height / 2); ctx.restore();
    }
    for (const pr of list) props.push(pr);
  }
  ctx.globalAlpha = 1;
  /* 2) Boden-Decals & Bodeneffekte */
  drawDecals(ctx, camv);
  drawEffects(ctx, 0);
  if (G.p && G.p.ab.siegel) drawSiegel(ctx, G.p, G.p.ab.siegel);
  if (G.p && G.p.hero === 'shen' && G.p.rooted > 0.05) drawRootCircle(ctx, G.p);
  drawPlayerRing(ctx, G.p, time);

  /* 3) Schatten */
  for (const e of G.enemies) {
    if (!inView(e.x, e.y, 80)) continue;
    const s = e.boss ? 90 : e.r * 2.3 * (e.def.flier ? 0.8 : 1);
    ctx.globalAlpha = e.dead ? Math.max(0, 1 - e.deathT / 0.5) : (e.def.flier ? 0.55 : 0.85);
    ctx.drawImage(SHADOW_SPR, e.x - s / 2, e.y - s * 0.22, s, s * 0.44);
  }
  ctx.globalAlpha = 1;
  if (G.p) { const s = 40; ctx.drawImage(SHADOW_SPR, G.p.x - s / 2, G.p.y - s * 0.22, s, s * 0.44); }

  /* 4) Beute (am Boden, glitzert) */
  drawPickups(ctx, G, time);

  /* 5) Tiefensortierte Szene */
  _drawList.length = 0;
  for (const pr of props) if (pr.x > x0 - 120 && pr.x < x0 + VIEW.w + 120 && pr.y > y0 - 30 && pr.y < y0 + VIEW.h + 200) _drawList.push({ y: pr.y, k: 0, o: pr });
  for (const e of G.enemies) if (inView(e.x, e.y, 120)) _drawList.push({ y: e.y, k: 1, o: e });
  for (const im of G.images) _drawList.push({ y: im.y - 0.5, k: 3, o: im });
  _drawList.sort((a, b) => a.y - b.y);
  for (const d of _drawList) {
    if (d.k === 0) drawProp(ctx, d.o, G, time);
    else if (d.k === 1) drawEnemy(ctx, d.o, time);
    else if (d.k === 2) drawPlayer(ctx, d.o, time);
    else drawImagesOne(ctx, d.o);
  }
  if (G.p) drawPlayer(ctx, G.p, time); // Held immer obenauf: nie in der Horde verloren
  /* 6) Effekte ueber den Figuren (Klingen, Sicheln) */
  if (G.p && G.p.ab.bluternte) drawBluternte(ctx, G.p, G.p.ab.bluternte, false);
  if (G.p && G.p.ab.blutmond) drawBluternte(ctx, G.p, G.p.ab.blutmond, true);
  drawEffects(ctx, 2);
  drawParts(ctx, 0, camv);

  /* 7) Lichtkarte (multiplizieren) */
  renderLightmap(x0, y0, time, props);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(LM.c, 0, 0, LM.c.width / LM.scale * S, LM.c.height / LM.scale * S);
  ctx.globalCompositeOperation = 'source-over';

  /* 8) Leuchtendes (additiv, nach dem Licht) */
  ctx.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
  drawPropGlows(ctx, props, time);
  drawEnemyGlows(ctx, G, time);
  drawPlayerGlow(ctx, G.p, time);
  drawEffects(ctx, 1);
  drawParts(ctx, 1, camv);
  drawEnemyShots(ctx, G, time);
  if (G.p && G.p.hero === 'shen') drawQiPips(ctx, G.p, time);

  /* 9) Nebel & Stimmung */
  drawFog(ctx, x0, y0, time);
  drawTexts(ctx);
  drawPlayerHp(ctx, G.p);

  /* 10) Bildschirmraum */
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!VIGNETTE || VIGNETTE.width !== W || VIGNETTE.height !== H) VIGNETTE = buildVignette(W, H);
  ctx.drawImage(VIGNETTE, 0, 0);
  if (G.slowmo > 0) { ctx.fillStyle = 'rgba(60,200,180,' + Math.min(0.12, G.slowmo * 0.05) + ')'; ctx.fillRect(0, 0, W, H); }
  drawOffscreenMarkers(ctx, G, x0, y0);
  drawJoystick(ctx);
}
let _curCam = { x: 0, y: 0 }, _camX0 = 0, _camY0 = 0;
function inView(x, y, m) {
  const c = _curCam;
  return Math.abs(x - c.x) < VIEW.w / 2 + m && Math.abs(y - c.y) < VIEW.h / 2 + m + 60;
}

/* ------------------------------------------------------------ Licht */
function renderLightmap(x0, y0, time, props) {
  const s = LM.scale;
  const w = Math.ceil(VIEW.w * s) + 2, h = Math.ceil(VIEW.h * s) + 2;
  if (LM.c.width !== w || LM.c.height !== h) { LM.c.width = w; LM.c.height = h; }
  const g = LM.c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 1;
  g.fillStyle = WORLD.ambient || AMBIENT; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'lighter';
  const L = FX.lights;
  for (let i = 0; i < L.length; i++) {
    const l = L[i];
    const r = l.r * s;
    const lx = (l.x - x0) * s, ly = (l.y - y0) * s;
    if (lx + r < 0 || ly + r < 0 || lx - r > w || ly - r > h) continue;
    g.globalAlpha = clamp(l.a, 0, 1);
    g.drawImage(lightSprite(l.col), lx - r, ly - r * 0.8, r * 2, r * 1.6);
  }
  for (const pr of props) {
    const L2 = pr.v.light;
    if (!L2) continue;
    const fl = L2.flicker ? 0.82 + Math.sin(time * 9 + pr.seed) * 0.08 + Math.sin(time * 23 + pr.seed * 3) * 0.06 : 1;
    const lx = (pr.x + (pr.flip ? -L2.x : L2.x) - x0) * s, ly = (pr.y + L2.y - y0) * s, r = L2.r * s * fl;
    if (lx + r < 0 || ly + r < 0 || lx - r > w || ly - r > h) continue;
    g.globalAlpha = 0.95;
    g.drawImage(lightSprite(L2.col), lx - r, ly - r * 0.8, r * 2, r * 1.6);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ------------------------------------------------------------ Requisiten */
function drawProp(g, pr, G, time) {
  const v = pr.v, sc = 1 / v.px;
  let alpha = 1;
  if (pr.type === 'tree' && G.p) { // Spieler hinter dem Baum: Baum wird durchsichtig
    const p = G.p;
    if (p.y < pr.y && p.y > pr.y - 150 && Math.abs(p.x - pr.x) < 60) alpha = 0.4;
    for (const e of G.enemies) if (e.boss && e.y < pr.y && e.y > pr.y - 170 && Math.abs(e.x - pr.x) < 80) alpha = 0.4;
  }
  g.save(); g.translate(pr.x, pr.y);
  if (pr.type === 'tree') g.rotate(Math.sin(time * 0.7 + pr.seed) * 0.01);
  g.scale(pr.flip ? -sc : sc, sc);
  g.globalAlpha = alpha;
  g.drawImage(v.c, -v.ax, -v.ay);
  g.restore();
  g.globalAlpha = 1;
}
function drawPropGlows(g, props, time) {
  g.globalCompositeOperation = 'lighter';
  for (const pr of props) {
    const v = pr.v;
    if (!v.glowCol) continue;
    const fl = 0.85 + Math.sin(time * 11 + pr.seed) * 0.1;
    const pts = v.flames || [[v.light.x, v.light.y]];
    for (const f of pts) {
      const x = pr.x + (pr.flip ? -f[0] : f[0]), y = pr.y + f[1];
      const r = (v.flames ? 6 : 12) * fl;
      g.globalAlpha = 0.9;
      g.drawImage(glowSprite(v.glowCol, true), x - r, y - r, r * 2, r * 2);
    }
    if (pr.type === 'candles' || pr.type === 'lantern') {
      if (Math.random() < 0.04 * FXQ) spawnPart({ x: pr.x + rand(-6, 6), y: pr.y, z: 14, vx: rand(-5, 5), vy: 0, vz: rand(15, 30), g: -5, drag: 0.5, life: 1.2, size: 1.5, size1: 0, spr: tinted('spark', '#ffb45a'), layer: 1 });
    }
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ------------------------------------------------------------ Gegner */
function drawEnemy(g, e, time) {
  if (e.boss) return drawBossEntity(g, e, time);
  const spr = ensureArt(e.def.art);
  const A = ENEMY_ART[e.def.art];
  const fps = e.role === 'bat' ? 12 : e.role === 'witch' ? 7 : 9 * (e.spd / e.def.spd);
  const frames = spr.frames;
  const fi = Math.floor(e.animT * fps) % frames.length;
  let img = frames[fi];
  if ((e.atkT > 0 || e.state === 'wind') && spr.atk.length) img = spr.atk[Math.floor(e.animT * 8) % spr.atk.length];
  const S = VIEW.scale, cx = _camX0, cy = _camY0;
  const sc = e.scale / spr.px;
  let sx = sc * e.face, sy = sc, rot = 0, oy = 0, alpha = 1;
  if (e.dead) {
    const k = clamp(e.deathT / 0.55, 0, 1);
    alpha = 1 - k * k;
    if (e.def.flier) { oy = k * 20; rot = k * 1.2 * e.face; }
    else { rot = easeOut(clamp(k * 1.6, 0, 1)) * 1.35 * (Math.cos(e.killDir || 0) >= 0 ? 1 : -1); sy *= 1 - k * 0.3; }
  } else if (e.flash > 0) {
    const q = 1 + e.flash * 1.8; sx /= q; sy *= q * 0.96;
  }
  if (e.elite && !e.dead) {
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.4 + Math.sin(time * 5) * 0.15;
    const s2 = e.r * 5;
    g.drawImage(glowSprite('#ffb040'), e.x - s2 / 2, e.y - s2 * 0.75, s2, s2);
    g.globalCompositeOperation = 'source-over';
  }
  const px = (e.x - cx) * S, py = (e.y + oy - cy) * S;
  if (rot) { const c = Math.cos(rot), s2 = Math.sin(rot); g.setTransform(c * sx * S, s2 * sx * S, -s2 * sy * S, c * sy * S, px, py); }
  else g.setTransform(sx * S, 0, 0, sy * S, px, py);
  g.globalAlpha = alpha;
  g.drawImage(img, -spr.ax, -spr.ay);
  if (e.flash > 0 && !e.dead) {
    g.globalAlpha = clamp(e.flash / 0.09, 0, 1) * 0.5;
    g.drawImage(spr.flashes[fi], -spr.ax, -spr.ay);
  }
  g.setTransform(S, 0, 0, S, -cx * S, -cy * S);
  g.globalAlpha = 1;
  // Lebensbalken fuer starke Gegner
  if (!e.dead && (e.elite || e.mini) && e.hp < e.maxHp) {
    const w = e.mini ? 70 : 40, y = e.y - A.h * e.scale - 10;
    g.fillStyle = 'rgba(10,0,6,0.8)'; g.fillRect(e.x - w / 2 - 1, y - 1, w + 2, 6);
    g.fillStyle = e.mini ? '#ff5a3a' : '#ffb040'; g.fillRect(e.x - w / 2, y, w * clamp(e.hp / e.maxHp, 0, 1), 4);
  }
}
function drawEnemyGlows(g, G, time) {
  g.globalCompositeOperation = 'lighter';
  const gl = glowSprite('#ff2a40');
  for (const e of G.enemies) {
    if (e.dead || !inView(e.x, e.y, 40)) continue;
    // Blutmale (Vorian): pulsierendes Rot unter dem Gegner, waechst mit den Stapeln
    if (e.bstack > 0) {
      const s = 12 + e.bstack * 4 + Math.sin(time * 8 + e.id) * 2;
      g.globalAlpha = 0.14 + e.bstack * 0.06;
      g.drawImage(gl, e.x - s / 2, e.y - 4 - s * 0.3, s, s * 0.6);
    }
    if (e.stunT > 0) { // Betaeubung: kreisende Qi-Funken
      for (let i = 0; i < 3; i++) {
        const a = time * 6 + i * TAU / 3, hh = ENEMY_ART[e.def.art] ? ENEMY_ART[e.def.art].h * e.scale : 40;
        g.globalAlpha = 0.9;
        g.drawImage(glowSprite('#9affe6', true), e.x + Math.cos(a) * 10 - 4, e.y - hh - 4 + Math.sin(a) * 3 - 4, 8, 8);
      }
    }
    if (e.corruptT > 0 && Math.random() < 0.15 * FXQ) spawnPart({ x: e.x + rand(-6, 6), y: e.y, z: rand(10, 30), vx: 0, vy: 0, vz: 30, g: -10, drag: 1, life: 0.5, size: 5, size1: 9, spr: tinted('spark', '#c0306a'), layer: 1, alpha: 0.7 });
    if (e.role === 'witch') { g.globalAlpha = 0.8; const s = 22; g.drawImage(glowSprite(SHOT_COL[e.def.shot] || '#7dff9a'), e.x + e.face * 12 - s / 2, e.y - 22 - s / 2, s, s); }
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawEnemyShots(g, G, time) {
  for (const s of G.eproj) {
    const col = SHOT_COL[s.kind] || '#7dff9a';
    const pulse = 1 + Math.sin(time * 20 + s.t * 10) * 0.12;
    const r = s.r * pulse;
    // dunkler Rand = auf jedem Untergrund erkennbar
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(10,0,6,0.9)'; g.beginPath(); g.arc(s.x, s.y, r + 2.5, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter';
    g.drawImage(glowSprite(col, true), s.x - r * 2.4, s.y - r * 2.4, r * 4.8, r * 4.8);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(s.x, s.y, r * 0.45, 0, TAU); g.fill();
    // Schweif
    const sp = Math.hypot(s.vx, s.vy) || 1;
    g.globalAlpha = 0.5;
    g.drawImage(glowSprite(col), s.x - s.vx / sp * r * 2 - r, s.y - s.vy / sp * r * 2 - r, r * 2, r * 2);
    g.globalAlpha = 1;
  }
  g.globalCompositeOperation = 'source-over';
}

/* ------------------------------------------------------------ Boss */
const BOSS_CANVAS = { raw: null, out: null };
function drawBossEntity(g, e, time) {
  const px = clamp(VIEW.scale * 1.05, 1.2, 2.2);
  const box = 300, S = Math.ceil(box * px);
  if (!BOSS_CANVAS.raw || BOSS_CANVAS.raw.width !== S) { BOSS_CANVAS.raw = mkCanvas(S, S); BOSS_CANVAS.out = mkCanvas(S, S); }
  const rg0 = BOSS_CANVAS.raw.getContext('2d');
  rg0.setTransform(1, 0, 0, 1, 0, 0); rg0.clearRect(0, 0, S, S);
  rg0.setTransform(px, 0, 0, px, S / 2, S * 0.86);
  rg0.lineCap = 'round'; rg0.lineJoin = 'round';
  const dk = e.dead ? clamp(e.deathT / 2.5, 0, 1) : 0;
  (e.def.bossDraw ? BOSS_ART[e.def.bossDraw] : drawBoss)(rg0, { t: time, run: e.run || 0, phase: e.phase || 0, slam: e.slam || 0, bell: e.bell || 0, roar: e.roar || 0, enrage: e.enrage, hurt: e.flash > 0 ? 0.3 : 0, dead: dk });
  rg0.setTransform(1, 0, 0, 1, 0, 0);
  finishSprite(BOSS_CANVAS.raw, { outline: 2.5, rim: e.enrage ? '#ff3a1a' : '#ff8a4a', rimW: 2.5, rimA: 0.7, moonW: 2 }, BOSS_CANVAS.out);
  g.save(); g.translate(e.x, e.y);
  g.scale(e.face / px, 1 / px);
  g.globalAlpha = 1 - dk * 0.7;
  if (e.dead) g.translate(Math.sin(time * 40) * 6 * (1 - dk), 0);
  g.drawImage(BOSS_CANVAS.out, -S / 2, -S * 0.86);
  if (e.flash > 0 && !e.dead) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.drawImage(BOSS_CANVAS.out, -S / 2, -S * 0.86); }
  g.restore();
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ------------------------------------------------------------ Spieler */
function playerPoseState(p) {
  const aimLocal = p.face > 0 ? p.castAim : Math.PI - p.castAim;
  const castK = p.castT > 0 ? Math.sin(Math.PI * clamp(1 - p.castT / p.castMax, 0, 1)) : 0;
  const dodgeK = p.dodgeT > 0 ? Math.sin(Math.PI * clamp(1 - p.dodgeT / p.dodgeMax, 0, 1)) : 0;
  return {
    t: p.animT, run: clamp(p.runAmt, 0, 1), phase: p.phase, cast: castK, aim: aimLocal,
    dodge: dodgeKind(p) === 'roll' ? dodgeK * 0.6 : dodgeK, hurt: p.hurtT / 0.3,
    dead: p.alive ? 0 : clamp(p.deadT / 1.1, 0, 1), rooted: p.rooted || 0
  };
}
function heroLook(p) {
  const H = {};
  if (p.hero === 'vorian') { H.glow = clamp((abLvl('blutnova') + abLvl('finsternis') * 5 + abLvl('bluternte') + abLvl('blutmond') * 5) / 7, 0, 1); H.crown = abLvl('finsternis') ? 2 : abLvl('blutnova') >= 4 ? 1 : 0; }
  if (p.hero === 'liora') H.rage = clamp(1 - p.hp / p.st.maxHp + (p.buffAder > 0 ? 0.6 : 0), 0, 1);
  if (p.hero === 'nyx') H.flow = p.flow + (p.ultT > 0 ? 1 : 0);
  if (p.hero === 'shen') H.qi = clamp(p.qi / 5, 0, 1);
  if (p.hero === 'finn') { H.tier = p.tier || 0; H.rim = FINN_TIERS[H.tier].rim; }
  return H;
}
function drawPlayer(g, p, time) {
  const px = heroPx();
  const st = playerPoseState(p);
  p.spr = renderHero(p.hero, st, heroLook(p), px, p.spr, { glow: true });
  p.spr.px = px;
  const S = p.spr.S;
  g.save();
  g.translate(p.x, p.y);
  let alpha = 1;
  const DK = dodgeKind(p);
  if (p.dodgeT > 0 && DK === 'mist') alpha = 0.35;
  if (p.dodgeT > 0 && (DK === 'shadowstep' || DK === 'blink')) alpha = 0.15;
  if (p.iframes > 0 && p.hurtT <= 0 && p.dodgeT <= 0 && !(p.ultT > 0)) alpha *= 0.65 + 0.35 * Math.sin(time * 40);
  if (!p.alive) alpha = 1 - clamp((p.deadT - 1.1) / 1.2, 0, 1);
  if (p.dodgeT > 0 && DK === 'roll') {
    const k = 1 - p.dodgeT / p.dodgeMax;
    g.translate(0, -18); g.rotate(k * TAU * p.face); g.translate(0, 18);
  }
  if (p.hero === 'shen' && p.rooted > 0.3) g.translate(0, -3 * p.rooted - Math.sin(time * 2) * 1.5 * p.rooted);
  g.scale(p.face / px, 1 / px);
  g.globalAlpha = alpha;
  if (p.ultT > 0 && p.hero === 'nyx') { // Mitternacht: Schattengestalt mit Nachzieh-Bildern
    g.globalAlpha = 0.35;
    for (let i = 1; i <= 3; i++) g.drawImage(p.spr.out, -S / 2 - p.vx * 0.03 * i * px * p.face, -p.spr.anchorY - p.vy * 0.03 * i * px);
    g.globalAlpha = 0.85;
  }
  g.drawImage(p.spr.out, -S / 2, -p.spr.anchorY);
  if (p.hurtT > 0) { // roter Treffer-Blitz
    g.globalCompositeOperation = 'source-atop';
  }
  g.restore();
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (p.hurtT > 0.15) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (p.hurtT - 0.15) / 0.15 * 0.6;
    g.drawImage(glowSprite('#ff2020'), p.x - 30, p.y - 60, 60, 60); g.restore();
  }
}
function drawPlayerGlow(g, p, time) {
  if (!p) return;
  g.globalCompositeOperation = 'lighter';
  if (p.hero === 'liora') {
    const r = clamp(1 - p.hp / p.st.maxHp, 0, 1) + (p.buffAder > 0 ? 0.7 : 0);
    if (r > 0.25) { g.globalAlpha = (r - 0.25) * 0.5 + Math.sin(time * 6) * 0.08; g.drawImage(glowSprite('#ff2a40'), p.x - 45, p.y - 70, 90, 90); }
  }
  if (p.hero === 'vorian' && p.dodgeT > 0) { g.globalAlpha = 0.6; g.drawImage(glowSprite('#ff2a40'), p.x - 40, p.y - 60, 80, 70); }
  if (p.hero === 'nyx' && p.ultT > 0) { g.globalAlpha = 0.5; g.drawImage(glowSprite('#7a4aff'), p.x - 50, p.y - 70, 100, 90); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawPlayerRing(g, p, time) {
  if (!p || !p.alive) return;
  const col = heroRim(p);
  g.save(); g.translate(p.x, p.y); g.scale(1, 0.55);
  g.globalAlpha = 0.55;
  g.strokeStyle = col; g.lineWidth = 2;
  g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.stroke();
  g.globalAlpha = 0.9;
  const a = time * 1.5;
  g.lineWidth = 3;
  g.beginPath(); g.arc(0, 0, 22, a, a + 0.7); g.stroke();
  g.beginPath(); g.arc(0, 0, 22, a + Math.PI, a + Math.PI + 0.7); g.stroke();
  // Blickrichtungs-Pfeil
  const dir = Math.atan2(p.lastMoveY / 0.55, p.lastMoveX);
  g.fillStyle = col; g.globalAlpha = 0.8;
  g.beginPath(); g.moveTo(Math.cos(dir) * 32, Math.sin(dir) * 32); g.lineTo(Math.cos(dir + 0.25) * 25, Math.sin(dir + 0.25) * 25); g.lineTo(Math.cos(dir - 0.25) * 25, Math.sin(dir - 0.25) * 25); g.fill();
  g.restore();
  g.globalAlpha = 1;
}
function drawRootCircle(g, p) {
  g.save(); g.translate(p.x, p.y); g.scale(1, 0.55); g.rotate(p.animT * 0.5);
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = p.rooted * 0.55;
  g.drawImage(ASPR.lotus, -48, -48, 96, 96);
  g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawQiPips(g, p, time) {
  const n = 5, full = Math.floor(p.qi), part = p.qi - full;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = time * 1.6 + i * TAU / n;
    const x = p.x + Math.cos(a) * 26, y = p.y - 52 + Math.sin(a) * 8;
    const on = i < full, fill = i === full ? part : on ? 1 : 0;
    g.globalAlpha = on ? 1 : 0.18 + fill * 0.4;
    const s = on ? 12 : 8;
    g.drawImage(glowSprite(on ? '#5ff0d0' : '#2a7a6a', true), x - s / 2, y - s / 2, s, s);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawPlayerHp(g, p) {
  if (!p || !p.alive) return;
  const w = 38, x = p.x - w / 2, y = p.y + 9;
  const k = clamp(p.hp / p.st.maxHp, 0, 1);
  g.fillStyle = 'rgba(8,0,6,0.85)'; g.fillRect(x - 1.5, y - 1.5, w + 3, 7);
  g.fillStyle = k < 0.3 ? '#ff2a2a' : '#d0183a'; g.fillRect(x, y, w * k, 4);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, y, w * k, 1.3);
}
function drawImagesOne(g, im) {
  const k = im.t / im.dur;
  const fadeIn = Math.min(1, im.t * 8), fadeOut = Math.min(1, (im.dur - im.t) * 3);
  const flick = 0.75 + Math.sin(im.t * 30) * 0.1;
  const sc = 1 / im.pxs;
  g.save(); g.translate(im.x, im.y);
  if (im.kind === 'mirror') {
    g.save(); g.scale(1, 0.62); g.rotate(im.t * 0.8); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6 * fadeOut;
    g.drawImage(ASPR.lotus, -40, -40, 80, 80); g.restore();
  }
  g.scale(im.face * sc, sc);
  g.globalAlpha = fadeIn * fadeOut * flick * (im.kind === 'decoy' ? 0.7 : 0.8);
  g.drawImage(im.snap, -im.sw / 2, -im.anchorY);
  g.restore();
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ------------------------------------------------------------ Beute */
const GEM_COL = ['#ff4a5a', '#ff7a3a', '#c070ff', '#ffe070'];
function drawPickups(g, G, time) {
  for (const q of G.pickups) {
    if (!inView(q.x, q.y, 30)) continue;
    const bob = Math.sin(time * 4 + q.x) * 1.5;
    const y = q.y - 6 - q.z + bob;
    if (q.kind === 'xp') {
      const s = 3.5 + q.size * 1.6;
      const col = GEM_COL[q.size];
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(q.x, q.y, s, s * 0.35, 0, 0, TAU); g.fill();
      g.beginPath(); g.moveTo(q.x, y - s * 1.4); g.lineTo(q.x + s, y); g.lineTo(q.x, y + s * 1.1); g.lineTo(q.x - s, y); g.closePath();
      g.fillStyle = lg(g, q.x - s, y - s, q.x + s, y + s, [0, '#ffffff', 0.3, col, 1, shade(col, -0.6)]); g.fill();
      g.strokeStyle = 'rgba(20,0,10,0.8)'; g.lineWidth = 1; g.stroke();
      addLight(q.x, q.y, 26 + q.size * 10, col, 0.5);
    } else if (q.kind === 'soul') {
      g.save(); g.globalCompositeOperation = 'lighter';
      g.drawImage(glowSprite('#b58cff', true), q.x - 10, y - 10, 20, 20);
      g.restore();
      addLight(q.x, q.y, 40, '#b58cff', 0.6);
    } else if (q.kind === 'heal') { // Blutkelch
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.ellipse(q.x, q.y, 8, 3, 0, 0, TAU); g.fill();
      g.fillStyle = lg(g, q.x - 6, 0, q.x + 6, 0, [0, '#e8c070', 1, '#7a5a20']);
      g.beginPath(); g.moveTo(q.x - 7, y - 10); g.quadraticCurveTo(q.x, y + 2, q.x + 7, y - 10); g.closePath(); g.fill();
      g.fillRect(q.x - 1, y - 3, 2, 6); g.fillRect(q.x - 4, y + 3, 8, 2);
      g.fillStyle = '#c0102a'; g.beginPath(); g.ellipse(q.x, y - 9.5, 6, 1.8, 0, 0, TAU); g.fill();
      addLight(q.x, q.y, 50, '#ff3a4a', 0.8);
    } else if (q.kind === 'magnet') {
      g.fillStyle = rg(g, q.x - 2, y - 2, 0, 8, [0, '#ffffff', 0.4, '#a8c8ff', 1, '#3a4a8a']);
      g.beginPath(); g.arc(q.x, y - 4, 7, 0, TAU); g.fill();
      addLight(q.x, q.y, 70, '#a8c8ff', 0.9);
    } else if (q.kind === 'crystal') { // Bestienkristall
      g.save(); g.translate(q.x, y - 2); g.rotate(0.2);
      g.fillStyle = lg(g, -4, -8, 4, 4, [0, '#ffffff', 0.4, '#6ac8ff', 1, '#1a4a8a']);
      g.beginPath(); g.moveTo(0, -9); g.lineTo(4, -2); g.lineTo(0, 5); g.lineTo(-4, -2); g.closePath(); g.fill();
      g.strokeStyle = '#0a1a3a'; g.lineWidth = 1; g.stroke(); g.restore();
      addLight(q.x, q.y, 50, '#6ac8ff', 0.8);
    } else if (q.kind === 'book') { // das Buch: schwebender Foliant mit Blutrunen und Lichtsaeule
      const by = y - 10 + Math.sin(time * 2) * 3;
      g.save(); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.35 + Math.sin(time * 3) * 0.1;
      g.fillStyle = lg(g, q.x - 14, 0, q.x + 14, 0, [0, 'rgba(255,40,60,0)', 0.5, 'rgba(255,90,110,0.8)', 1, 'rgba(255,40,60,0)']);
      g.fillRect(q.x - 14, by - 220, 28, 220);
      g.globalAlpha = 1; g.drawImage(glowSprite('#ff3048', true), q.x - 26, by - 26, 52, 52);
      g.restore();
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(q.x, q.y, 14, 4, 0, 0, TAU); g.fill();
      g.save(); g.translate(q.x, by); g.rotate(Math.sin(time * 1.5) * 0.08);
      g.fillStyle = '#2a0a10'; g.fillRect(-12, -9, 24, 17);
      g.fillStyle = lg(g, -11, -8, 11, 8, [0, '#6a1020', 1, '#3a0610']); g.fillRect(-11, -8, 22, 15);
      g.strokeStyle = '#c9a24c'; g.lineWidth = 1; g.strokeRect(-9, -6, 18, 11);
      g.fillStyle = '#e8d8c0'; g.fillRect(-11, 6, 22, 2);
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = '#ff5a6a'; g.font = '700 9px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ᛟ', 0, -0.5); g.restore();
      g.restore();
      addLight(q.x, q.y, 180, '#ff3048', 1);
    } else if (q.kind === 'chest') {
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(q.x, q.y, 16, 5, 0, 0, TAU); g.fill();
      g.fillStyle = lg(g, 0, y - 16, 0, y + 4, [0, '#8a5a2a', 1, '#3a200a']); g.fillRect(q.x - 14, y - 14, 28, 18);
      g.fillStyle = '#c9a24c'; g.fillRect(q.x - 14, y - 8, 28, 3); g.fillRect(q.x - 2, y - 10, 4, 6);
      g.strokeStyle = '#1a0a04'; g.lineWidth = 1.5; g.strokeRect(q.x - 14, y - 14, 28, 18);
      addLight(q.x, q.y, 110, '#ffd070', 1);
    }
  }
}

/* ------------------------------------------------------------ Nebel */
function drawFog(g, x0, y0, time) {
  if (!WORLD.fog || FXQ < 0.6) return;
  const T = 700;
  g.globalCompositeOperation = 'screen';
  for (let layer = 0; layer < 2; layer++) {
    const par = layer ? 1.15 : 1.35;
    const ox = (x0 * (par - 1) + time * (layer ? 9 : -6)) % T, oy = (y0 * (par - 1) + time * (layer ? 3 : 5)) % T;
    g.globalAlpha = layer ? 0.1 : 0.14;
    const bx = Math.floor((x0 - ox) / T) * T + ox, by = Math.floor((y0 - oy) / T) * T + oy;
    for (let y = by - T; y < y0 + VIEW.h + T; y += T) for (let x = bx - T; x < x0 + VIEW.w + T; x += T) {
      if (x + T < x0 || y + T < y0 || x > x0 + VIEW.w || y > y0 + VIEW.h) continue;
      g.drawImage(WORLD.fog, x, y, T + 1, T + 1);
    }
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ------------------------------------------------------------ Bildschirm-Overlays */
function drawOffscreenMarkers(g, G, x0, y0) {
  const S = VIEW.scale;
  const list = [];
  if (G.boss && !G.boss.dead) list.push([G.boss, '#ff5a2a', 16]);
  if (G.mini && !G.mini.dead) list.push([G.mini, '#ffb040', 12]);
  for (const q of G.pickups) if (q.kind === 'chest' || q.kind === 'book') list.push([q, q.kind === 'book' ? '#ff4a5a' : '#ffe070', 14]);
  for (const [o, col, sz] of list) {
    const sx = (o.x - x0) * S, sy = (o.y - 40 - y0) * S;
    const m = 30 * VIEW.dpr;
    if (sx > m && sx < cv.width - m && sy > m && sy < cv.height - m) continue;
    const cx = cv.width / 2, cy = cv.height / 2;
    const a = Math.atan2(sy - cy, sx - cx);
    const k = Math.min((cv.width / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (cv.height / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
    const x = cx + Math.cos(a) * k, y = cy + Math.sin(a) * k;
    const s = sz * VIEW.dpr;
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = col; g.strokeStyle = '#1a0006'; g.lineWidth = 2 * VIEW.dpr;
    g.beginPath(); g.moveTo(s, 0); g.lineTo(-s * 0.7, s * 0.7); g.lineTo(-s * 0.3, 0); g.lineTo(-s * 0.7, -s * 0.7); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
}
function drawJoystick(g) {
  const j = INPUT.joy;
  if (!j.active) return;
  const d = VIEW.dpr;
  g.save();
  g.globalAlpha = 0.35;
  g.fillStyle = 'rgba(20,6,20,0.6)'; g.strokeStyle = 'rgba(255,220,230,0.6)'; g.lineWidth = 2 * d;
  g.beginPath(); g.arc(j.ox * d, j.oy * d, JOY_R * d, 0, TAU); g.fill(); g.stroke();
  g.globalAlpha = 0.75;
  const kx = j.ox + (j.x - j.ox), ky = j.oy + (j.y - j.oy);
  g.fillStyle = rg(g, kx * d, ky * d, 0, 24 * d, [0, 'rgba(255,220,230,0.9)', 1, 'rgba(160,40,70,0.7)']);
  g.beginPath(); g.arc(kx * d, ky * d, 24 * d, 0, TAU); g.fill();
  g.restore();
}
