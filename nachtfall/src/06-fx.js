'use strict';
/* ==========================================================================
   EFFEKTE — Partikel (mit Hoehe/Schwerkraft), Boden-Decals, Lichter,
   Schadenszahlen und frei programmierbare Effekt-Objekte.
   ========================================================================== */

const FX = {
  parts: [], decals: [], lights: [], texts: [], effects: [],
  maxParts: 900, maxDecals: 110
};
let FXQ = 1; // Qualitaetsfaktor (wird bei schwacher Leistung reduziert)

/* layer 0 = normal (wird vom Licht beeinflusst), 1 = additiv (leuchtet) */
function spawnPart(o) {
  if (FX.parts.length >= FX.maxParts) { if (o.layer === 1 && Math.random() < 0.5) return; FX.parts.shift(); }
  const p = {
    x: o.x, y: o.y, z: o.z || 0, vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0,
    g: o.g === undefined ? 0 : o.g, drag: o.drag === undefined ? 1.5 : o.drag,
    life: o.life || 0.6, max: o.life || 0.6, s0: o.size || 4, s1: o.size1 === undefined ? (o.size || 4) : o.size1,
    spr: o.spr, a0: o.alpha === undefined ? 1 : o.alpha, a1: o.alpha1 === undefined ? 0 : o.alpha1,
    rot: o.rot || 0, vr: o.vr || 0, layer: o.layer || 0, splat: o.splat || 0, stretch: o.stretch || 0
  };
  FX.parts.push(p);
  return p;
}
function addDecal(x, y, spr, size, alpha, life, rot) {
  if (FX.decals.length >= FX.maxDecals) FX.decals.shift();
  FX.decals.push({ x, y, spr, size, alpha: alpha || 1, life: life || 18, max: life || 18, rot: rot === undefined ? Math.random() * TAU : rot });
}
function addLight(x, y, r, col, a) {
  if (FX.lights.length > 90) return;
  FX.lights.push({ x, y, r, col, a: a === undefined ? 1 : a });
}
const _labelT = {};
function addText(x, y, txt, col, size, opts) {
  if (!SAVE.settings.dmgNumbers && !(opts && opts.always)) return;
  if (opts && opts.label) { const now = performance.now(); if (_labelT[txt] && now - _labelT[txt] < 450) return; _labelT[txt] = now; }
  if (FX.texts.length > 70) FX.texts.shift();
  FX.texts.push({ x: x + rand(-5, 5), y, vy: -46, txt, col, size: size || 13, life: (opts && opts.life) || 0.75, max: (opts && opts.life) || 0.75, crit: opts && opts.crit, label: opts && opts.label });
}
/* Effekt-Objekt: { x, y, t, dur, layer, update?(e,dt), draw(g,e,k) } */
function addEffect(e) { e.t = 0; FX.effects.push(e); return e; }

/* -------------------------------------------------- vorgefertigte Ausbrueche */
function burstBlood(x, y, n, power, dir) {
  n = Math.ceil(n * FXQ);
  for (let i = 0; i < n; i++) {
    const a = dir === undefined ? Math.random() * TAU : dir + rand(-0.9, 0.9);
    const sp = rand(40, 170) * (power || 1);
    spawnPart({ x, y, z: rand(6, 20), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, vz: rand(40, 170) * (power || 1), g: 520, drag: 0.6, life: rand(0.5, 1), size: rand(2, 5), size1: rand(1.5, 3), spr: PART.drop, alpha: 1, alpha1: 0.9, splat: Math.random() < 0.35 ? 1 : 0, stretch: 1 });
  }
}
function burstShadow(x, y, n, power) {
  n = Math.ceil(n * FXQ);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = rand(20, 110) * (power || 1);
    spawnPart({ x, y, z: rand(4, 26), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, vz: rand(10, 60), g: -30, drag: 2, life: rand(0.5, 1.1), size: rand(8, 16), size1: rand(18, 26), spr: PART.shadowwisp, alpha: 0.85, alpha1: 0 });
    if (i % 2 === 0) spawnPart({ x, y, z: rand(4, 26), vx: Math.cos(a) * sp * 1.4, vy: Math.sin(a) * sp, vz: rand(20, 80), g: -20, drag: 2, life: rand(0.4, 0.9), size: rand(3, 5), size1: 0, spr: tinted('spark', '#b58cff'), alpha: 1, alpha1: 0, layer: 1 });
  }
}
function burstQi(x, y, n, power, col) {
  n = Math.ceil(n * FXQ);
  const c = col || '#5ff0d0';
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = rand(60, 220) * (power || 1);
    spawnPart({ x, y, z: rand(4, 24), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, vz: rand(-10, 40), g: 0, drag: 4, life: rand(0.3, 0.7), size: rand(3, 6), size1: 0, spr: tinted('spark', c), alpha: 1, alpha1: 0, layer: 1, stretch: 1 });
  }
}
function burstSparks(x, y, n, col, power) {
  n = Math.ceil(n * FXQ);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = rand(80, 260) * (power || 1);
    spawnPart({ x, y, z: rand(10, 30), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, vz: rand(40, 160), g: 400, drag: 1.5, life: rand(0.2, 0.5), size: rand(2, 3.5), size1: 0.5, spr: tinted('spark', col), alpha: 1, alpha1: 0.2, layer: 1, stretch: 1 });
  }
}
function burstAsh(x, y, n, col) {
  n = Math.ceil(n * FXQ);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = rand(10, 60);
    spawnPart({ x: x + rand(-6, 6), y: y + rand(-4, 4), z: rand(5, 30), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.5, vz: rand(20, 60), g: -10, drag: 1.2, life: rand(0.6, 1.3), size: rand(6, 12), size1: rand(12, 20), spr: tinted('smoke', col || '#3a3238'), alpha: 0.6, alpha1: 0 });
  }
}
function splat(x, y, size, alpha) { addDecal(x + rand(-4, 4), y + rand(-3, 3), PART.splat, size || rand(16, 30), alpha || rand(0.55, 0.85), rand(14, 24)); }

function shake(a) { if (GAME) GAME.shake = Math.min(18, Math.max(GAME.shake, a * SAVE.settings.shake)); }
function hitstop(t) { if (GAME) GAME.hitstop = Math.max(GAME.hitstop, t); }

/* -------------------------------------------------- Update */
function updateFX(dt) {
  const P = FX.parts;
  let w = 0;
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    p.life -= dt;
    if (p.life <= 0) continue;
    const d = Math.max(0, 1 - p.drag * dt);
    p.vx *= d; p.vy *= d;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.g) {
      p.vz -= p.g * dt; p.z += p.vz * dt;
      if (p.z <= 0 && p.g > 0) {
        p.z = 0;
        if (p.splat && p.splat > 0) { addDecal(p.x, p.y, PART.splat, p.s0 * 3.2, 0.7, rand(10, 18)); p.life = 0; continue; }
        p.vz *= -0.25; p.vx *= 0.5; p.vy *= 0.5;
      }
    } else p.z += p.vz * dt;
    p.rot += p.vr * dt;
    P[w++] = p;
  }
  P.length = w;
  const D = FX.decals;
  w = 0;
  for (let i = 0; i < D.length; i++) { const d = D[i]; d.life -= dt; if (d.life > 0) D[w++] = d; }
  D.length = w;
  const T = FX.texts;
  w = 0;
  for (let i = 0; i < T.length; i++) { const t = T[i]; t.life -= dt; t.y += t.vy * dt; t.vy *= 0.92; if (t.life > 0) T[w++] = t; }
  T.length = w;
  const E = FX.effects;
  w = 0;
  for (let i = 0; i < E.length; i++) {
    const e = E[i]; e.t += dt;
    if (e.update) e.update(e, dt);
    if (e.t < e.dur && !e.dead) E[w++] = e;
  }
  E.length = w;
}
function clearFX() { FX.parts.length = 0; FX.decals.length = 0; FX.texts.length = 0; FX.effects.length = 0; FX.lights.length = 0; }

/* -------------------------------------------------- Zeichnen */
function drawParts(g, layer, cam) {
  const P = FX.parts;
  const x0 = cam.x - cam.w / 2 - 40, x1 = cam.x + cam.w / 2 + 40, y0 = cam.y - cam.h / 2 - 60, y1 = cam.y + cam.h / 2 + 60;
  if (layer === 1) g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    if (p.layer !== layer || p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue;
    const k = 1 - p.life / p.max;
    const s = lerp(p.s0, p.s1, k);
    const a = lerp(p.a0, p.a1, k);
    if (a <= 0.01 || s <= 0.1) continue;
    g.globalAlpha = a;
    const sx = p.x, sy = p.y - p.z;
    if (p.stretch) {
      const sp = Math.hypot(p.vx, p.vy - p.vz * 0.5);
      const st = clamp(sp / 120, 1, 3);
      const ang = Math.atan2(p.vy - p.vz * 0.6, p.vx);
      g.save(); g.translate(sx, sy); g.rotate(ang);
      g.drawImage(p.spr, -s * st, -s, s * 2 * st, s * 2);
      g.restore();
    } else if (p.rot) {
      g.save(); g.translate(sx, sy); g.rotate(p.rot);
      g.drawImage(p.spr, -s, -s, s * 2, s * 2);
      g.restore();
    } else g.drawImage(p.spr, sx - s, sy - s, s * 2, s * 2);
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
}
function drawDecals(g, cam) {
  const D = FX.decals;
  for (let i = 0; i < D.length; i++) {
    const d = D[i];
    if (Math.abs(d.x - cam.x) > cam.w / 2 + 60 || Math.abs(d.y - cam.y) > cam.h / 2 + 60) continue;
    const k = d.life / d.max;
    g.globalAlpha = d.alpha * Math.min(1, k * 3);
    // Spritzer sind rund-chaotisch: gespiegelt statt gedreht (billiger)
    const w = d.size, h = d.size * 0.62;
    g.drawImage(d.spr, d.x - w / 2, d.y - h / 2, w, h);
  }
  g.globalAlpha = 1;
}
function drawEffects(g, layer) {
  const E = FX.effects;
  for (let i = 0; i < E.length; i++) {
    const e = E[i];
    if ((e.layer || 0) !== layer) continue;
    e.draw(g, e, clamp(e.t / e.dur, 0, 1));
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawTexts(g) {
  const T = FX.texts;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < T.length; i++) {
    const t = T[i];
    const k = t.life / t.max;
    const pop = t.crit ? 1 + Math.max(0, (k - 0.75)) * 3 : 1;
    g.globalAlpha = Math.min(1, k * 3);
    const size = t.size * pop;
    g.font = `${t.label ? 800 : 700} ${size}px ${t.label ? 'Cinzel, serif' : '"Cormorant Garamond", Georgia, serif'}`;
    g.lineWidth = t.label ? 4 : 3.2; g.strokeStyle = 'rgba(8,2,10,0.9)';
    g.strokeText(t.txt, t.x, t.y);
    g.fillStyle = t.col; g.fillText(t.txt, t.x, t.y);
  }
  g.globalAlpha = 1;
}

/* -------------------------------------------------- Standard-Effekte */
// sich ausbreitender Ring (z. B. Schockwellen)
function fxRing(x, y, r0, r1, dur, col, width, layer) {
  return addEffect({ x, y, dur, layer: layer === undefined ? 1 : layer, draw(g, e, k) {
    const r = lerp(r0, r1, easeOut(k));
    g.globalCompositeOperation = e.layer === 1 ? 'lighter' : 'source-over';
    g.globalAlpha = (1 - k) * 0.9;
    g.strokeStyle = col; g.lineWidth = width * (1 - k * 0.6);
    g.beginPath(); g.ellipse(e.x, e.y, r, r * 0.62, 0, 0, TAU); g.stroke();
  } });
}
// kurzer Lichtblitz (additiv)
function fxFlash(x, y, r, col, dur) {
  return addEffect({ x, y, dur: dur || 0.18, layer: 1, draw(g, e, k) {
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = (1 - k);
    const s = glowSprite(col, true), rr = r * (0.8 + k * 0.5);
    g.drawImage(s, e.x - rr, e.y - rr * 0.8, rr * 2, rr * 1.6);
  }, update(e) { addLight(e.x, e.y, r * 2.2, col, 1 - e.t / e.dur); } });
}
// Warnmarkierung am Boden (Boss-Angriffe): gut lesbar, pulsierend
function fxTelegraphCircle(x, y, r, dur, col) {
  return addEffect({ x, y, dur, layer: 0, draw(g, e, k) {
    const pulse = 0.5 + 0.5 * Math.sin(e.t * 18);
    g.globalAlpha = 0.25 + k * 0.25;
    g.fillStyle = col || '#ff2a2a';
    g.beginPath(); g.ellipse(e.x, e.y, r, r * 0.62, 0, 0, TAU); g.fill();
    g.globalAlpha = 0.7 + pulse * 0.3;
    g.strokeStyle = '#ffd0c0'; g.lineWidth = 2.5; g.setLineDash([10, 6]);
    g.beginPath(); g.ellipse(e.x, e.y, r, r * 0.62, 0, 0, TAU); g.stroke(); g.setLineDash([]);
    g.globalAlpha = 0.55;
    g.fillStyle = col || '#ff2a2a';
    g.beginPath(); g.ellipse(e.x, e.y, r * k, r * 0.62 * k, 0, 0, TAU); g.fill();
  } });
}
function fxTelegraphLine(x, y, ang, len, w, dur) {
  return addEffect({ x, y, dur, layer: 0, draw(g, e, k) {
    const pulse = 0.5 + 0.5 * Math.sin(e.t * 18);
    g.save(); g.translate(e.x, e.y); g.rotate(ang);
    g.globalAlpha = 0.25 + k * 0.2; g.fillStyle = '#ff2a2a';
    g.fillRect(0, -w / 2, len, w);
    g.globalAlpha = 0.5; g.fillRect(0, -w / 2, len * k, w);
    g.globalAlpha = 0.6 + pulse * 0.4; g.strokeStyle = '#ffd0c0'; g.lineWidth = 2; g.setLineDash([12, 8]);
    g.strokeRect(0, -w / 2, len, w); g.setLineDash([]);
    g.restore();
  } });
}
