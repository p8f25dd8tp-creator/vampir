'use strict';
/* ==========================================================================
   DARSTELLUNG — schräg von oben (3/4), 2D. Boden, Requisiten, Figuren,
   Angriffsmarkierungen, Effekte.
   ========================================================================== */

/* ------------------------------------------------------------ Arenen */
const ARENA_ART = {};
// Kantine der Militaerschule: helle Fliesen, lange Tische an den Seiten
ARENA_ART.kantine = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  g.fillStyle = '#b8bcc4'; g.fillRect(0, 0, A.w, A.h);
  const T = 30, rnd = mulberry(11);
  for (let y = 0; y < A.h; y += T) for (let x = 0; x < A.w; x += T) {
    const v = rnd() * 0.06 - 0.03;
    g.fillStyle = shade((((x + y) / T) % 2 ? '#c4c8d0' : '#aeb2bc'), v);
    g.fillRect(x + 0.5, y + 0.5, T - 1, T - 1);
  }
  // Rueckwand
  g.fillStyle = lg(g, 0, 0, 0, 40, [0, '#39404e', 1, '#5a6272']); g.fillRect(0, 0, A.w, 40);
  g.fillStyle = '#2a303c'; g.fillRect(0, 38, A.w, 4);
  // Fenster in der Rueckwand
  for (let x = 24; x < A.w - 40; x += 70) { g.fillStyle = lg(g, 0, 6, 0, 30, [0, '#9ec8e8', 1, '#5a7a98']); g.fillRect(x, 6, 44, 24); g.strokeStyle = '#2a303c'; g.lineWidth = 2; g.strokeRect(x, 6, 44, 24); g.beginPath(); g.moveTo(x + 22, 6); g.lineTo(x + 22, 30); g.stroke(); }
  // Lichtflecken aus den Fenstern
  g.globalCompositeOperation = 'lighter';
  for (let x = 24; x < A.w - 40; x += 70) { g.fillStyle = 'rgba(255,245,220,0.07)'; g.beginPath(); g.moveTo(x, 42); g.lineTo(x + 44, 42); g.lineTo(x + 70, 150); g.lineTo(x + 20, 150); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  // Rand
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, A.w - 3, A.h - 3);
  return c;
};
// Schulhof: Kaserne oben (wirft Schatten), Wege, Rasen, Sonnenflaechen
ARENA_ART.hof = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  const rnd = mulberry(5);
  g.fillStyle = '#6a8a4a'; g.fillRect(0, 0, A.w, A.h);
  for (let i = 0; i < 900; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(40,70,30,0.35)' : 'rgba(140,180,90,0.25)'; g.fillRect(rnd() * A.w, rnd() * A.h, 2, 2); }
  // Wege
  for (const r of A.paths || []) {
    g.fillStyle = '#b8b2a4'; g.fillRect(r.x, r.y, r.w, r.h);
    g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 1;
    for (let x = r.x; x < r.x + r.w; x += 16) { g.beginPath(); g.moveTo(x, r.y); g.lineTo(x, r.y + r.h); g.stroke(); }
    for (let y = r.y; y < r.y + r.h; y += 16) { g.beginPath(); g.moveTo(r.x, y); g.lineTo(r.x + r.w, y); g.stroke(); }
  }
  // Baenke
  for (const [x, y] of A.benches || []) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x - 16, y + 2, 34, 6); g.fillStyle = '#7a5a3a'; g.fillRect(x - 17, y - 6, 34, 8); g.fillStyle = '#5a3e28'; g.fillRect(x - 15, y + 2, 3, 5); g.fillRect(x + 12, y + 2, 3, 5); }
  // Gebaeude
  for (const b of A.buildings || []) {
    g.fillStyle = lg(g, 0, b.y, 0, b.y + b.h, [0, '#8a94a8', 1, '#5a6478']); g.fillRect(b.x, b.y, b.w, b.h);
    g.fillStyle = '#3a4252'; g.fillRect(b.x, b.y + b.h - 6, b.w, 6);
    for (let x = b.x + 10; x < b.x + b.w - 16; x += 22) for (let y = b.y + 8; y < b.y + b.h - 26; y += 20) { g.fillStyle = '#a8c8e0'; g.fillRect(x, y, 12, 10); }
    if (b.door) { g.fillStyle = '#2a2018'; g.fillRect(b.door - 11, b.y + b.h - 26, 22, 20); g.fillStyle = '#c8a060'; g.fillRect(b.door + 6, b.y + b.h - 17, 2, 2); }
    g.font = '700 9px Cinzel, serif'; g.textAlign = 'center'; g.fillStyle = '#eef'; g.fillText(b.label || '', b.x + b.w / 2, b.y + 12);
  }
  return c;
};
// Pruefhalle im Freien: Sand, Messsaeule
ARENA_ART.pruefplatz = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  const rnd = mulberry(9);
  g.fillStyle = '#c8b48a'; g.fillRect(0, 0, A.w, A.h);
  for (let i = 0; i < 1200; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(120,100,60,0.25)' : 'rgba(255,240,200,0.25)'; g.fillRect(rnd() * A.w, rnd() * A.h, 2, 2); }
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; g.strokeRect(20, 60, A.w - 40, A.h - 90);
  g.beginPath(); g.arc(A.w / 2, A.h / 2 + 15, 50, 0, TAU); g.stroke();
  g.fillStyle = lg(g, 0, 0, 0, 44, [0, '#5a6272', 1, '#8a94a8']); g.fillRect(0, 0, A.w, 44);
  g.fillStyle = '#3a4252'; g.fillRect(0, 42, A.w, 4);
  return c;
};
// Trainingshalle bei Nacht
ARENA_ART.halle = function (A) {
  const S = 2, c = mkCanvas(A.w * S, A.h * S), g = c.getContext('2d');
  g.scale(S, S);
  g.fillStyle = '#3a3040'; g.fillRect(0, 0, A.w, A.h);
  for (let y = 44; y < A.h; y += 22) { g.fillStyle = y / 22 % 2 ? '#40364a' : '#382e42'; g.fillRect(0, y, A.w, 22); }
  g.strokeStyle = 'rgba(0,0,0,0.3)'; for (let x = 0; x < A.w; x += 44) { g.beginPath(); g.moveTo(x, 44); g.lineTo(x, A.h); g.stroke(); }
  g.fillStyle = '#1e1a26'; g.fillRect(0, 0, A.w, 44);
  for (let x = 30; x < A.w - 30; x += 80) { g.fillStyle = '#10141e'; g.fillRect(x, 8, 40, 24); g.fillStyle = 'rgba(160,190,255,0.4)'; g.fillRect(x + 2, 10, 36, 20); }
  g.fillStyle = 'rgba(200,210,255,0.08)'; g.beginPath(); g.ellipse(A.w / 2, A.h / 2, A.w * 0.4, A.h * 0.3, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,220,150,0.35)'; g.lineWidth = 2; g.strokeRect(24, 64, A.w - 48, A.h - 96);
  return c;
};
// Nicht-menschliche Ziele (Messsaeule, Trainingsgeraet)
const OBJ_ART = {
  saeule(g, e) {
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(e.x, e.y + 2, 18, 6, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, e.x - 12, 0, e.x + 12, 0, [0, '#5a6272', 0.5, '#c8d0dc', 1, '#4a5262']); g.fillRect(e.x - 12, e.y - 64, 24, 64);
    g.fillStyle = '#2a303c'; g.fillRect(e.x - 14, e.y - 68, 28, 6); g.fillRect(e.x - 14, e.y - 4, 28, 6);
    const k = e.meter || 0;
    g.fillStyle = '#10141e'; g.fillRect(e.x - 5, e.y - 58, 10, 48);
    g.fillStyle = lg(g, 0, e.y - 10, 0, e.y - 58, [0, '#4affa0', 0.6, '#ffe04a', 1, '#ff4a4a']); g.fillRect(e.x - 5, e.y - 10 - 48 * k, 10, 48 * k);
    if (e.flash > 0) { g.fillStyle = `rgba(255,255,255,${e.flash * 6})`; g.fillRect(e.x - 12, e.y - 64, 24, 64); }
  },
  geraet(g, e) {
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(e.x, e.y + 2, 20, 7, 0, 0, TAU); g.fill();
    g.fillStyle = lg(g, 0, e.y - 36, 0, e.y, [0, '#8a94a8', 1, '#3a4252']); g.beginPath(); g.moveTo(e.x - 18, e.y); g.lineTo(e.x - 12, e.y - 30); g.lineTo(e.x + 12, e.y - 30); g.lineTo(e.x + 18, e.y); g.closePath(); g.fill();
    g.save(); g.translate(e.x, e.y - 32); g.rotate(e.aim || 0);
    g.fillStyle = '#2a303c'; g.fillRect(-8, -7, 26, 14); g.fillStyle = e.state === 'wind' ? '#ff5a4a' : '#8ad8ff'; g.fillRect(16, -4, 5, 8);
    g.restore();
    glowDot(g, e.x, e.y - 32, 16, e.state === 'wind' ? '#ff5a4a' : '#8ad8ff', 0.35);
  }
};
function drawTable(g, b) {
  // Tischplatte mit Beinen, von schraeg oben
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(b.x + 3, b.y + 6, b.w, b.h);
  g.fillStyle = '#5a4030'; g.fillRect(b.x + 3, b.y + b.h - 2, 4, 10); g.fillRect(b.x + b.w - 7, b.y + b.h - 2, 4, 10);
  g.fillStyle = lg(g, b.x, b.y - 8, b.x, b.y + b.h, [0, '#b08a60', 1, '#7a5a3a']); g.fillRect(b.x, b.y - 8, b.w, b.h);
  g.fillStyle = '#5a3e28'; g.fillRect(b.x, b.y + b.h - 8, b.w, 5);
  // Tabletts
  for (let x = b.x + 8; x < b.x + b.w - 14; x += 26) { g.fillStyle = '#d8dce4'; g.fillRect(x, b.y - 4, 14, 9); g.fillStyle = '#c86a3a'; g.beginPath(); g.arc(x + 7, b.y, 2.4, 0, TAU); g.fill(); }
}

/* ------------------------------------------------------------ Hauptzeichnung */
function renderFight() {
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#0a0c12'; g.fillRect(0, 0, cv.width, cv.height);
  if (!G) return;
  G.punch = Math.max(0, (G.punch || 0) - 1 / 60 * 5);
  const z = VIEW.zoom * VIEW.dpr * (1 + (G.punch || 0) * 0.05 * (SAVE.settings.shake || 0)), sh = G.shake * (SAVE.settings.shake || 1);
  const cx = cv.width / 2 + rand(-sh, sh) * VIEW.dpr, cy = cv.height / 2 + rand(-sh, sh) * VIEW.dpr;
  g.setTransform(z, 0, 0, z, cx - G.cam.x * z, cy - G.cam.y * z);
  const A = G.arena;
  if (!A.bg) A.bg = ARENA_ART[A.art](A);
  g.drawImage(A.bg, 0, 0, A.w, A.h);
  // Sonnenflaechen
  for (const r of A.sun || []) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,230,160,0.18)'; g.fillRect(r.x, r.y, r.w, r.h); g.restore(); }
  for (const r of A.shade || []) { g.fillStyle = 'rgba(20,30,60,0.28)'; g.fillRect(r.x, r.y, r.w, r.h); }
  // Interaktionspunkte
  for (const P of A.pois || []) {
    if (P.hidden && P.hidden()) continue;
    const on = G.poi === P, pulse = 0.5 + Math.sin(G.t * 4) * 0.5;
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = on ? 0.9 : 0.35 + pulse * 0.3;
    g.strokeStyle = P.col || '#8ad8ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(P.x, P.y, 20, 8, 0, 0, TAU); g.stroke();
    g.drawImage(glowSprite(P.col || '#8ad8ff'), P.x - 22, P.y - 30, 44, 40);
    g.restore();
    g.font = '800 10px Cinzel, serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.8)'; g.strokeText(P.label, P.x, P.y - 34); g.fillStyle = on ? '#ffffff' : (P.col || '#bfe6ff'); g.fillText(P.label, P.x, P.y - 34);
  }
  // Angriffsmarkierungen auf dem Boden
  for (const T of G.tele) drawTele(g, T);
  // Schatten unter allen Figuren
  for (const e of G.ents) { if (e.draw) continue; g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(e.x, e.y + 1, 13, 4.5, 0, 0, TAU); g.fill(); }
  for (const f of G.fx) if (f.k === 'dust') { const k = f.t / f.life; g.globalAlpha = 0.35 * (1 - k); g.fillStyle = A.night ? '#8a90a8' : '#e8e0d0'; g.beginPath(); g.ellipse(f.x, f.y, f.size * (1 + k), f.size * 0.45 * (1 + k), 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  for (const f of G.fx) if (f.k === 'ghost') { const k = f.t / f.life; g.save(); g.translate(f.x, f.y); g.scale(f.face / f.px, 1 / f.px); g.globalAlpha = 0.4 * (1 - k); g.drawImage(flashSprite(f.img, f.col), -f.S / 2, -f.ay); g.restore(); }
  // Tische und Figuren nach Tiefe sortiert
  const list = [];
  for (const b of A.blocks || []) if (!b.invisible) list.push({ y: b.y + b.h, draw: () => drawTable(g, b) });
  for (const e of G.ents) list.push({ y: e.y, draw: () => (e.draw ? OBJ_ART[e.draw](g, e) : drawEnt(g, e)) });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) it.draw();
  // Baumkronen
  for (const [x, y] of A.trees || []) {
    g.fillStyle = 'rgba(10,30,10,0.28)'; g.beginPath(); g.ellipse(x + 8, y + 6, 30, 12, 0, 0, TAU); g.fill();
    g.fillStyle = '#4a3020'; g.fillRect(x - 3, y - 22, 6, 24);
    const sway = Math.sin(G.t * 1.2 + x) * 1.5;
    for (const [dx, dy, r, c] of [[0, -40, 22, '#2e5a28'], [-12, -32, 15, '#3a6a30'], [12, -34, 16, '#3a6a30'], [4, -46, 13, '#4a7a3a']]) { g.fillStyle = A.night ? shade(c, -0.55) : c; g.beginPath(); g.arc(x + dx + sway, y + dy, r, 0, TAU); g.fill(); }
  }
  // Effekte
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const f of G.fx) {
    const k = f.t / f.life;
    if (f.k === 'spark') { g.globalAlpha = 1 - k; g.drawImage(glowSprite(f.col), f.x - f.size * 2, f.y - f.size * 2, f.size * 4, f.size * 4); }
    else if (f.k === 'swoosh') {
      const e0 = easeOut(k);
      g.globalAlpha = (1 - k) * 0.95; g.strokeStyle = f.col; g.lineCap = 'round';
      const a0 = f.a - f.arc * f.dir, a1 = f.a + f.arc * f.dir * (e0 * 2 - 1);
      g.save(); g.translate(f.x, f.y + 18); g.scale(1, 0.75);
      g.lineWidth = f.w * (1 - k * 0.6); g.beginPath(); g.arc(0, 0, f.r * 0.9, Math.min(a0, a1), Math.max(a0, a1)); g.stroke();
      g.globalAlpha *= 0.5; g.lineWidth = f.w * 2.2; g.beginPath(); g.arc(0, 0, f.r * 0.8, Math.min(a0, a1), Math.max(a0, a1)); g.stroke();
      g.restore();
    }
    else if (f.k === 'beam') { g.save(); g.translate(f.x, f.y); g.rotate(f.a); g.globalAlpha = 1 - k; g.fillStyle = f.col; g.fillRect(0, -f.w / 2 * (1 - k), f.len, f.w * (1 - k)); g.fillStyle = '#ffffff'; g.fillRect(0, -2, f.len, 4); g.restore(); }
    else if (f.k === 'slash') {
      g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = f.col; g.lineWidth = 5 * (1 - k) + 1;
      g.beginPath(); g.arc(f.x, f.y + 20, f.r * 0.85, f.a - f.arc, f.a + f.arc); g.stroke();
    }
  }
  g.restore();
  // Nacht: dunkel, nur um Quinn herum Licht (Nachtsicht)
  if (A.night) {
    const p0 = G.player;
    g.fillStyle = rg(g, p0.x, p0.y - 30, 40, 260, [0, 'rgba(8,10,30,0.15)', 1, 'rgba(4,6,20,0.72)']);
    g.fillRect(G.cam.x - VIEW.w, G.cam.y - VIEW.h, VIEW.w * 2, VIEW.h * 2);
  }
  // Zahlen und Texte
  g.textAlign = 'center';
  for (const T of G.texts) {
    const k = T.t / T.life;
    g.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    g.font = `800 ${T.txt.length > 4 ? 11 : 15}px Cinzel, serif`;
    g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.strokeText(T.txt, T.x, T.y);
    g.fillStyle = T.col; g.fillText(T.txt, T.x, T.y);
  }
  g.globalAlpha = 1;
  // Bildschirmeffekte
  g.setTransform(1, 0, 0, 1, 0, 0);
  const W = cv.width, H = cv.height;
  if (G.whiteFlash > 0) { G.whiteFlash -= 1 / 60; g.fillStyle = `rgba(255,245,220,${Math.max(0, G.whiteFlash) * 2})`; g.fillRect(0, 0, W, H); }
  const slow = clamp((1 - G.scale) / 0.7, 0, 1);
  if (slow > 0.01) { g.fillStyle = rg(g, W / 2, H / 2, Math.min(W, H) * 0.3, Math.max(W, H) * 0.75, [0, 'rgba(20,60,120,0)', 1, `rgba(20,60,140,${0.45 * slow})`]); g.fillRect(0, 0, W, H); }
  const p = G.player;
  if (p && p.hp / p.maxHp < 0.35 && p.state !== 'down') { const a = 0.25 + Math.sin(G.t * 6) * 0.08; g.fillStyle = rg(g, W / 2, H / 2, Math.min(W, H) * 0.35, Math.max(W, H) * 0.8, [0, 'rgba(120,0,20,0)', 1, `rgba(140,0,20,${a})`]); g.fillRect(0, 0, W, H); }
}

function drawTele(g, T) {
  const k = clamp(T.t / T.dur, 0, 1), done = T.t >= T.dur;
  g.save(); g.translate(T.x, T.y);
  const col = done ? 'rgba(255,255,255,0.55)' : `rgba(255,60,40,${0.18 + k * 0.22})`;
  if (T.type === 'lunge' || T.type === 'beam') {
    const w = T.type === 'beam' ? T.w : 18;
    g.rotate(T.a);
    g.fillStyle = col; g.fillRect(0, -w / 2, T.r, w);
    g.fillStyle = 'rgba(255,90,60,0.55)'; g.fillRect(0, -w / 2, T.r * k, w);
    g.strokeStyle = 'rgba(255,120,90,0.8)'; g.lineWidth = 1.2; g.strokeRect(0, -w / 2, T.r, w);
  } else {
    g.scale(1, 0.72);
    g.fillStyle = col;
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, T.r, T.a - T.arc, T.a + T.arc); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,90,60,0.5)';
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, T.r * k, T.a - T.arc, T.a + T.arc); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,140,110,0.85)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, T.r, T.a - T.arc, T.a + T.arc); g.closePath(); g.stroke();
  }
  g.restore();
}

function figPx() { return Math.max(1.5, Math.min(4, VIEW.zoom * VIEW.dpr)); }
function drawEnt(g, e) {
  const px = figPx();
  const st = { t: e.anim.t, run: e.anim.run, phase: e.anim.phase, cast: e.anim.cast, hurt: e.anim.hurt, dodge: e.anim.dodge, aim: e.anim.aim, dead: e.state === 'down' ? Math.min(1, e.stateT * 1.5) : 0 };
  // Nebenfiguren seltener neu zeichnen (spart am Handy viel Rechenzeit)
  const main = e.team === 0 || e.team === 1;
  if (!e.spr || main || e.spr.px !== px || G.t - (e.sprT || -9) > (Math.hypot(e.vx, e.vy) > 10 ? 0.06 : 0.16)) { e.spr = renderFigure(e.look, st, px, e.spr, e.extra); e.spr.px = px; e.sprT = G.t; }
  const S = e.spr.S;
  g.save();
  g.translate(e.x, e.y);
  if (e.team === 0 && e.iframes > 0 && e.state === 'dodge') g.globalAlpha = 0.55;
  else if (e.team === 0 && e.iframes > 0 && e.state !== 'down') g.globalAlpha = 0.6 + 0.4 * Math.sin(G.t * 40);
  g.scale(e.face / px, 1 / px);
  g.drawImage(e.spr.out, -S / 2, -e.spr.anchorY);
  if (e.flash > 0) { g.globalAlpha = Math.min(1, e.flash * 10) * 0.8; g.drawImage(flashSprite(e.spr.out, '#ffffff'), -S / 2, -e.spr.anchorY); }
  g.restore();
  // Konterfenster: goldener Schimmer an Quinn
  if (e.team === 0 && e.counterT > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 + Math.sin(G.t * 20) * 0.2; g.drawImage(glowSprite('#ffd070'), e.x - 26, e.y - 62, 52, 60); g.restore(); }
  if (e.team === 0 && e.state === 'charge') { const k = Math.min(1, e.stateT / 0.45); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.4 + k * 0.5; g.drawImage(glowSprite(k >= 1 ? '#ffd070' : '#8ad8ff'), e.x + e.face * 6 - 16, e.y - 50, 32, 32); g.restore(); }
  if (e.state === 'stagger') { g.fillStyle = '#8ad8ff'; for (let k = 0; k < 3; k++) { const a = G.t * 6 + k * TAU / 3; g.beginPath(); g.arc(e.x + Math.cos(a) * 10, e.y - 76 + Math.sin(a) * 3, 1.8, 0, TAU); g.fill(); } }
}
