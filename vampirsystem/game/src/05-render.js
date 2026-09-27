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
  const z = VIEW.zoom * VIEW.dpr, sh = G.shake * (SAVE.settings.shake || 1);
  const ox = -G.cam.x + VIEW.w / 2 + rand(-sh, sh) / VIEW.zoom, oy = -G.cam.y + VIEW.h / 2 + rand(-sh, sh) / VIEW.zoom;
  g.setTransform(z, 0, 0, z, ox * z, oy * z);
  const A = G.arena;
  if (!A.bg) A.bg = ARENA_ART[A.art](A);
  g.drawImage(A.bg, 0, 0, A.w, A.h);
  // Angriffsmarkierungen auf dem Boden
  for (const T of G.tele) drawTele(g, T);
  // Schatten unter allen Figuren
  for (const e of G.ents) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(e.x, e.y + 1, 13, 4.5, 0, 0, TAU); g.fill(); }
  // Tische und Figuren nach Tiefe sortiert
  const list = [];
  for (const b of A.blocks || []) list.push({ y: b.y + b.h, draw: () => drawTable(g, b) });
  for (const e of G.ents) list.push({ y: e.y, draw: () => drawEnt(g, e) });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) it.draw();
  // Effekte
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const f of G.fx) {
    const k = f.t / f.life;
    if (f.k === 'spark') { g.globalAlpha = 1 - k; g.drawImage(glowSprite(f.col), f.x - f.size * 2, f.y - f.size * 2, f.size * 4, f.size * 4); }
    else if (f.k === 'slash') {
      g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = f.col; g.lineWidth = 5 * (1 - k) + 1;
      g.beginPath(); g.arc(f.x, f.y + 20, f.r * 0.85, f.a - f.arc, f.a + f.arc); g.stroke();
    }
  }
  g.restore();
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
  const slow = clamp((1 - G.scale) / 0.7, 0, 1);
  if (slow > 0.01) { g.fillStyle = rg(g, W / 2, H / 2, Math.min(W, H) * 0.3, Math.max(W, H) * 0.75, [0, 'rgba(20,60,120,0)', 1, `rgba(20,60,140,${0.45 * slow})`]); g.fillRect(0, 0, W, H); }
  const p = G.player;
  if (p && p.hp / p.maxHp < 0.35 && p.state !== 'down') { const a = 0.25 + Math.sin(G.t * 6) * 0.08; g.fillStyle = rg(g, W / 2, H / 2, Math.min(W, H) * 0.35, Math.max(W, H) * 0.8, [0, 'rgba(120,0,20,0)', 1, `rgba(140,0,20,${a})`]); g.fillRect(0, 0, W, H); }
}

function drawTele(g, T) {
  const k = clamp(T.t / T.dur, 0, 1), done = T.t >= T.dur;
  g.save(); g.translate(T.x, T.y);
  const col = done ? 'rgba(255,255,255,0.55)' : `rgba(255,60,40,${0.18 + k * 0.22})`;
  if (T.type === 'lunge') {
    g.rotate(T.a);
    g.fillStyle = col; g.fillRect(0, -9, T.r, 18);
    g.fillStyle = 'rgba(255,90,60,0.55)'; g.fillRect(0, -9, T.r * k, 18);
    g.strokeStyle = 'rgba(255,120,90,0.8)'; g.lineWidth = 1.2; g.strokeRect(0, -9, T.r, 18);
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
  e.spr = renderFigure(e.look, st, px, e.spr, e.extra);
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
