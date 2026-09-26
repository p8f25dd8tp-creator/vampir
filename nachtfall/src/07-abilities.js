'use strict';
/* ==========================================================================
   FAEHIGKEITEN — Logik und Optik aller Karten, Fusionen und Ultimates.
   Blut: wuchtig, koerperlich, spritzt.  Schatten: fliessend, unheimlich,
   verschluckt Licht.  Qi: kontrolliert, klare Formen, Jade & Gold.
   ========================================================================== */

const ASPR = {};
function buildAbilitySprites() {
  const mk = (w, h, fn) => { const c = mkCanvas(w, h); const g = c.getContext('2d'); g.lineCap = 'round'; g.lineJoin = 'round'; fn(g, w, h); return c; };
  // Blutsichel (Bluternte) — Klinge zeigt nach +x
  ASPR.sickle = mk(96, 96, (g) => {
    g.translate(48, 48);
    g.beginPath(); g.moveTo(-6, 10); g.bezierCurveTo(10, 16, 34, 4, 38, -22); g.bezierCurveTo(26, -4, 8, 2, -8, 2); g.closePath();
    g.fillStyle = lg(g, -6, 8, 38, -22, [0, '#4a0010', 0.4, '#c0102a', 0.8, '#ff5064', 1, '#ffd0d6']); g.fill();
    g.strokeStyle = '#1a0006'; g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = 'rgba(255,220,220,0.9)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-4, 9); g.bezierCurveTo(12, 14, 33, 3, 37, -20); g.stroke();
    g.fillStyle = '#2a0a10'; g.beginPath(); g.arc(-8, 6, 6, 0, TAU); g.fill();
    g.fillStyle = '#ff3a50'; g.beginPath(); g.arc(-8, 6, 3, 0, TAU); g.fill();
  });
  // Blutmond (Fusion) — gewaltige Mondsichel
  ASPR.moon = mk(160, 160, (g) => {
    g.translate(80, 80);
    g.beginPath(); g.arc(0, 0, 62, -1.2, 1.2 + Math.PI * 0.4); g.arc(18, -4, 50, 1.2 + Math.PI * 0.35, -1.25, true); g.closePath();
    g.fillStyle = rg(g, -10, 0, 10, 70, [0, '#ffb0b8', 0.3, '#ff2a44', 0.75, '#8a0018', 1, '#300006']); g.fill();
    g.strokeStyle = '#1a0006'; g.lineWidth = 3; g.stroke();
    g.strokeStyle = 'rgba(255,230,230,0.9)'; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, 60, -1.1, 1.1 + Math.PI * 0.38); g.stroke();
  });
  // Qi-Handflaeche — geisterhafte offene Hand, Finger nach +x
  ASPR.palm = mk(160, 128, (g, w, h) => {
    g.translate(56, 64);
    const hand = () => {
      g.beginPath();
      g.moveTo(-40, -18); g.quadraticCurveTo(-10, -30, 8, -26);
      const fingers = [[-26, 46, 7], [-10, 58, 7.5], [6, 54, 7], [20, 42, 6]];
      g.lineTo(10, -30);
      for (const f of fingers) { g.lineTo(f[1] - 4, f[0] - f[2]); g.arc(f[1], f[0], f[2], -Math.PI / 2, Math.PI / 2); g.lineTo(12, f[0] + f[2]); }
      g.quadraticCurveTo(26, 36, 4, 44); g.quadraticCurveTo(-14, 50, -24, 30); g.lineTo(-40, 18); g.closePath();
    };
    hand();
    g.fillStyle = lg(g, -40, 0, 70, 0, [0, 'rgba(40,200,170,0.0)', 0.25, 'rgba(60,230,200,0.55)', 0.7, 'rgba(150,255,230,0.8)', 1, 'rgba(255,240,190,0.95)']);
    g.fill();
    g.strokeStyle = 'rgba(210,255,240,0.95)'; g.lineWidth = 2.5; g.stroke();
    // Handlinien / Meridiane
    g.strokeStyle = 'rgba(255,230,150,0.9)'; g.lineWidth = 1.6;
    g.beginPath(); g.arc(8, 6, 12, 0, TAU); g.stroke();
    g.beginPath(); g.moveTo(-20, 0); g.quadraticCurveTo(0, -10, 20, -6); g.moveTo(-18, 16); g.quadraticCurveTo(4, 20, 22, 8); g.stroke();
  });
  // Drachenkopf (Fusion Drachenherz) — Blick nach +x
  ASPR.dragon = mk(140, 100, (g) => {
    g.translate(60, 50);
    g.beginPath();
    g.moveTo(-40, -14); g.quadraticCurveTo(-10, -30, 20, -18); g.lineTo(52, -8); g.lineTo(58, 0); g.lineTo(40, 4); g.lineTo(54, 14); g.lineTo(18, 16); g.quadraticCurveTo(-10, 26, -40, 14); g.closePath();
    g.fillStyle = lg(g, -40, -20, 50, 20, [0, '#6a0018', 0.4, '#e0203a', 0.75, '#ff8a70', 1, '#9affe6']); g.fill();
    g.strokeStyle = '#1a0008'; g.lineWidth = 2.5; g.stroke();
    // Hoerner & Maehne
    g.fillStyle = '#ffe0a0';
    g.beginPath(); g.moveTo(-6, -22); g.quadraticCurveTo(-26, -44, -46, -40); g.quadraticCurveTo(-26, -34, -16, -16); g.fill();
    g.beginPath(); g.moveTo(4, -20); g.quadraticCurveTo(-8, -40, -22, -46); g.quadraticCurveTo(-6, -32, -4, -16); g.fill();
    g.fillStyle = '#4ff0cc';
    for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-36 + k * 6, 10); g.lineTo(-48 + k * 5, 26 + k); g.lineTo(-30 + k * 6, 14); g.fill(); }
    // Auge
    g.fillStyle = '#fff6c0'; g.beginPath(); g.ellipse(18, -9, 5, 3, -0.2, 0, TAU); g.fill();
    g.fillStyle = '#1a0008'; g.beginPath(); g.ellipse(19, -9, 1.4, 2.6, 0, 0, TAU); g.fill();
    // Zaehne
    g.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(26 + k * 7, 1); g.lineTo(29 + k * 7, 7); g.lineTo(32 + k * 7, 1); g.fill(); }
  });
  // Siegelring (Dreifaltiges Siegel)
  ASPR.sigil = mk(256, 256, (g) => {
    g.translate(128, 128);
    const cols = ['#ff3a4e', '#a77bff', '#4ff0cc'];
    g.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = cols[i];
      g.beginPath(); g.arc(0, 0, 118 - i * 16, 0, TAU); g.stroke();
    }
    g.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + i * TAU / 3;
      g.strokeStyle = cols[i];
      g.beginPath(); g.moveTo(Math.cos(a) * 110, Math.sin(a) * 110); g.lineTo(Math.cos(a + TAU / 3) * 110, Math.sin(a + TAU / 3) * 110); g.stroke();
      g.beginPath(); g.arc(Math.cos(a) * 60, Math.sin(a) * 60, 18, 0, TAU); g.stroke();
    }
    g.fillStyle = '#ffffff'; g.font = '700 20px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const runes = 'ᚱᛟᛞᚨᛉᚷᛁᛋᚦᛗᛚᚾ';
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.save(); g.rotate(a); g.fillText(runes[i], 0, -100); g.restore(); }
  });
  // Lotus (Spiegel-Moench / Wurzelstand)
  ASPR.lotus = mk(128, 128, (g) => {
    g.translate(64, 64);
    for (let i = 0; i < 8; i++) {
      g.save(); g.rotate(i * TAU / 8);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(14, -26, 0, -56); g.quadraticCurveTo(-14, -26, 0, 0);
      g.fillStyle = 'rgba(80,240,210,0.35)'; g.fill(); g.strokeStyle = 'rgba(180,255,240,0.85)'; g.lineWidth = 2; g.stroke();
      g.restore();
    }
    g.beginPath(); g.arc(0, 0, 60, 0, TAU); g.strokeStyle = 'rgba(255,220,140,0.7)'; g.lineWidth = 2; g.stroke();
  });
  // Schattenflamme (Kern)
  ASPR.sflame = mk(64, 64, (g) => {
    g.translate(32, 32);
    g.fillStyle = rg(g, 0, 0, 0, 30, [0, 'rgba(255,240,255,1)', 0.15, 'rgba(190,140,255,1)', 0.4, 'rgba(90,40,180,0.8)', 0.7, 'rgba(30,5,60,0.6)', 1, 'rgba(10,0,30,0)']);
    g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.fill();
  });
  // Blut-Klingenwelle (Blutwisch L5)
  ASPR.crescent = mk(120, 120, (g) => {
    g.translate(60, 60);
    g.beginPath(); g.arc(-20, 0, 50, -1.1, 1.1); g.arc(-34, 0, 44, 1.0, -1.0, true); g.closePath();
    g.fillStyle = lg(g, -10, -40, 30, 40, [0, '#ffd0d6', 0.3, '#ff3a50', 0.7, '#a00018', 1, '#300006']); g.fill();
    g.strokeStyle = '#1a0006'; g.lineWidth = 2; g.stroke();
  });
}

/* -------------------------------------------------------- Hilfsfunktionen */
function abLvl(id) { const a = GAME.p.ab[id]; return a ? a.lvl : 0; }
function cdOf(base) { return base * GAME.p.st.cd; }
function areaOf(school) { const p = GAME.p; return p.st.area * (school === 'blood' && p.hero === 'vorian' ? 1.15 : 1); }
function aimDir(p, range) {
  const e = nearestEnemy(p.x, p.y, range || 260);
  if (e) return Math.atan2(e.y - p.y, e.x - p.x);
  if (Math.abs(p.lastMoveX) + Math.abs(p.lastMoveY) > 0.1) return Math.atan2(p.lastMoveY, p.lastMoveX);
  return p.face > 0 ? 0 : Math.PI;
}
function castAnim(p, ang, dur) {
  p.castT = dur || 0.28; p.castMax = p.castT;
  if (ang !== undefined) { p.castAim = ang; if (Math.abs(Math.cos(ang)) > 0.2) p.face = Math.cos(ang) >= 0 ? 1 : -1; }
}
// Sektor-Pruefung
function inArc(ex, ey, x, y, ang, half) { return Math.abs(angDiff(ang, Math.atan2(ey - y, ex - x))) <= half; }

/* ======================================================== BLUTNOVA */
function novaBurst(x, y, r, dmg, src, opts) {
  opts = opts || {};
  const hit = new Set();
  const dur = opts.dur || 0.3;
  sfx(opts.big ? 'bigNova' : 'nova');
  shake(opts.big ? 7 : 2.4);
  burstBlood(x, y, (opts.big ? 40 : 18), opts.big ? 1.6 : 1.1);
  for (let i = 0; i < (opts.big ? 12 : 6); i++) { const a = Math.random() * TAU, d = r * rand(0.4, 1); splat(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.62, rand(14, 30)); }
  const col = opts.col || '#ff2a40';
  addEffect({
    x, y, dur, layer: 0, school: 'blood',
    update(e) {
      const k = clamp(e.t / dur, 0, 1), cr = lerp(r * 0.15, r, easeOut(k));
      forEnemiesInRadius(x, y, cr + 6, (en) => {
        if (hit.has(en.id)) return;
        hit.add(en.id);
        const a = Math.atan2(en.y - y, en.x - x);
        dealDamage(en, dmg, opts.school || 'blood', src, { kb: opts.kb || 70, kx: Math.cos(a), ky: Math.sin(a), extraMarks: opts.extraMarks });
      });
      addLight(x, y, r * 1.8, col, (1 - k) * 1.2);
    },
    draw(g, e, k) {
      const cr = lerp(r * 0.15, r, easeOut(k));
      // dicke Blutwelle mit unregelmaessigem Rand
      g.save(); g.translate(x, y); g.scale(1, 0.62);
      g.globalAlpha = (1 - k * k) * 0.6;
      g.fillStyle = rg(g, 0, 0, cr * 0.55, cr, [0, 'rgba(120,0,20,0)', 0.6, 'rgba(160,0,24,0.55)', 0.88, 'rgba(90,0,14,0.95)', 1, 'rgba(40,0,6,0)']);
      g.beginPath();
      const N = 28;
      for (let i = 0; i <= N; i++) {
        const a = i / N * TAU, wob = 1 + Math.sin(a * 5 + e.t * 20) * 0.04 + Math.sin(a * 11 - e.t * 13) * 0.03;
        const px = Math.cos(a) * cr * wob, py = Math.sin(a) * cr * wob;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.fill();
      g.restore();
    }
  });
  // die eigentliche Blutwelle: dicker, zackiger Ring UEBER den Figuren
  const seed = Math.random() * 10;
  addEffect({ x, y, dur: dur * 1.25, layer: 2, draw(g, e, k) {
    const kk = clamp(k * 1.25, 0, 1);
    const cr = lerp(r * 0.2, r * 1.02, easeOut(kk));
    const th = (1 - kk) * 15 + 3;
    const N = 36;
    const ringPath = (rr, jag) => {
      g.beginPath();
      for (let i = 0; i <= N; i++) {
        const a = i / N * TAU, w = 1 + Math.sin(a * 7 + seed) * 0.05 * jag + Math.sin(a * 13 - seed * 2) * 0.035 * jag;
        const px = x + Math.cos(a) * rr * w, py = y - 10 + Math.sin(a) * rr * w * 0.62;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
    };
    g.globalAlpha = (1 - kk * kk) * 0.95;
    g.lineJoin = 'round';
    ringPath(cr, 1); g.strokeStyle = '#3a0008'; g.lineWidth = th + 4; g.stroke();
    ringPath(cr, 1); g.strokeStyle = '#a0081e'; g.lineWidth = th; g.stroke();
    ringPath(cr - th * 0.25, 1); g.strokeStyle = '#ff3a50'; g.lineWidth = th * 0.35; g.stroke();
    ringPath(cr - th * 0.45, 1); g.strokeStyle = 'rgba(255,200,205,0.8)'; g.lineWidth = 1.5; g.stroke();
    // Blutstacheln an der Wellenfront
    g.fillStyle = '#b0102a';
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * TAU + seed, len = (10 + (i * 7 % 9)) * (1 - kk);
      const bx = x + Math.cos(a) * cr, by = y - 10 + Math.sin(a) * cr * 0.62;
      const nx = Math.cos(a), ny = Math.sin(a) * 0.62;
      g.beginPath(); g.moveTo(bx - ny * 3, by + nx * 3); g.lineTo(bx + nx * len, by + ny * len); g.lineTo(bx + ny * 3, by - nx * 3); g.fill();
    }
    g.globalAlpha = 1;
  } });
  addEffect({ x, y, dur: dur * 1.3, layer: 1, draw(g, e, k) {
    const cr = lerp(r * 0.2, r * 1.02, easeOut(clamp(k * 1.25, 0, 1)));
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = (1 - k) * 0.5;
    g.strokeStyle = col; g.lineWidth = 10 * (1 - k) + 2;
    g.beginPath(); g.ellipse(x, y - 10, cr, cr * 0.62, 0, 0, TAU); g.stroke();
    if (k < 0.35) { const s = glowSprite(col, true), rr = r * 0.55 * (1 - k * 2.5); g.globalAlpha = 1 - k * 2.8; g.drawImage(s, x - rr, y - rr * 0.8 - 14, rr * 2, rr * 1.6); }
  } });
}
function tickBlutnova(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 1.8 : 2.2);
  const dmg = 16 * (1 + (L >= 2 ? 0.3 : 0) + (L >= 4 ? 0.3 : 0));
  const r = 88 * (1 + (L >= 2 ? 0.15 : 0) + (L >= 4 ? 0.2 : 0)) * areaOf('blood');
  castAnim(p, -Math.PI / 2, 0.3);
  novaBurst(p.x, p.y, r, dmg, 'blutnova');
  if (L >= 3) GAME.later(0.3, () => novaBurst(GAME.p.x, GAME.p.y, r * 0.7, dmg * 0.6, 'blutnova', { dur: 0.22 }));
  if (L >= 5) bloodPool(p.x, p.y, r * 0.6, 2.6, 6 * (1 + 0.6), 'blutnova');
}
function bloodPool(x, y, r, dur, dmg, src) {
  let tick = 0;
  addEffect({ x, y, dur, layer: 0, update(e, dt) {
    tick -= dt;
    forEnemiesInRadius(x, y, r, (en) => { en.slowT = Math.max(en.slowT, 0.3); en.slowF = Math.min(en.slowF || 1, 0.6); });
    if (tick <= 0) { tick = 0.4; forEnemiesInRadius(x, y, r, (en) => dealDamage(en, dmg, 'blood', src, { quiet: true })); }
  }, draw(g, e, k) {
    const a = Math.min(1, (1 - k) * 3) * 0.8;
    g.save(); g.translate(x, y); g.scale(1, 0.6);
    g.globalAlpha = a;
    g.fillStyle = rg(g, -r * 0.2, -r * 0.2, 0, r, [0, '#a0102a', 0.6, '#6a0012', 0.92, '#3a0008', 1, 'rgba(30,0,5,0)']);
    g.beginPath(); for (let i = 0; i <= 20; i++) { const an = i / 20 * TAU, w = 1 + Math.sin(an * 4 + x) * 0.08; i ? g.lineTo(Math.cos(an) * r * w, Math.sin(an) * r * w) : g.moveTo(Math.cos(an) * r * w, Math.sin(an) * r * w); } g.fill();
    g.fillStyle = 'rgba(255,160,170,0.25)'; g.beginPath(); g.ellipse(-r * 0.25, -r * 0.3, r * 0.3, r * 0.12, -0.3, 0, TAU); g.fill();
    // Blasen
    g.fillStyle = 'rgba(255,90,110,0.5)';
    for (let i = 0; i < 3; i++) { const bb = (e.t * 1.7 + i * 0.33) % 1; g.beginPath(); g.arc(Math.cos(i * 2.1 + x) * r * 0.5, Math.sin(i * 2.1 + y) * r * 0.5, bb * 4, 0, TAU); g.fill(); }
    g.restore();
  } });
}

/* ======================================================== BLUTWISCH */
function swipe(p, ang, range, arc, dmg, src, opts) {
  opts = opts || {};
  const hit = new Set();
  const dur = 0.16;
  sfx('whip');
  const dir = opts.dir || 1;
  const x0 = p.x, y0 = p.y - 14;
  addEffect({ x: x0, y: y0, dur: dur + 0.14, layer: 2, update(e) {
    const k = clamp(e.t / dur, 0, 1);
    if (k < 1) {
      const px = GAME.p.x, py = GAME.p.y;
      forEnemiesInRadius(px, py, range + 14, (en) => {
        if (hit.has(en.id)) return;
        if (!inArc(en.x, en.y, px, py, ang, arc / 2 + 0.2)) return;
        const rel = angDiff(ang - dir * arc / 2, Math.atan2(en.y - py, en.x - px)) * dir;
        if (rel > arc * k + 0.25) return; // erst treffen, wenn die Klinge vorbeizieht
        hit.add(en.id);
        const a = Math.atan2(en.y - py, en.x - px);
        dealDamage(en, dmg, 'blood', src, { kb: 110, kx: Math.cos(a), ky: Math.sin(a), bleed: opts.bleed });
        burstBlood(en.x, en.y, 3, 0.8, a);
      });
    }
  }, draw(g, e, k0) {
    const k = clamp(e.t / dur, 0, 1), fade = clamp((e.t - dur) / 0.14, 0, 1);
    const px = GAME.p.x, py = GAME.p.y - 14;
    const a0 = ang - dir * arc / 2, a1 = a0 + dir * arc * easeOut(k);
    const tail = Math.max(a0, a1 - dir * arc * 0.7);
    g.save(); g.translate(px, py); g.scale(1, 0.7);
    g.globalAlpha = 1 - fade;
    // gefuellter Halbmond mit Verlauf (Blut)
    const segs = 16;
    g.beginPath();
    for (let i = 0; i <= segs; i++) { const a = lerp(dir > 0 ? tail : a1, dir > 0 ? a1 : tail, i / segs); const rr = range * (0.55 + 0.45 * (i / segs)); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    for (let i = segs; i >= 0; i--) { const a = lerp(dir > 0 ? tail : a1, dir > 0 ? a1 : tail, i / segs); const rr = range * (0.45 + 0.3 * (i / segs)); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath();
    g.fillStyle = rg(g, 0, 0, range * 0.4, range, [0, 'rgba(90,0,16,0.2)', 0.6, 'rgba(180,10,36,0.9)', 1, 'rgba(255,90,110,0.95)']);
    g.fill();
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(255,200,205,0.9)'; g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, range * 0.98, dir > 0 ? tail : a1, dir > 0 ? a1 : tail); g.stroke();
    g.restore();
    if (k < 1 && Math.random() < 0.8) {
      const a = a1, rr = range * rand(0.7, 1);
      spawnPart({ x: GAME.p.x + Math.cos(a) * rr, y: GAME.p.y + Math.sin(a) * rr * 0.7, z: 14, vx: -Math.sin(a) * dir * 160, vy: Math.cos(a) * dir * 110, vz: rand(30, 90), g: 500, drag: 1, life: 0.6, size: rand(2, 4), size1: 1.5, spr: PART.drop, stretch: 1, splat: Math.random() < 0.3 ? 1 : 0 });
    }
    addLight(GAME.p.x, GAME.p.y, range * 1.6, '#ff3048', 0.6 * (1 - fade));
  } });
}
function tickBlutwisch(p, ab, dt) {
  ab.t -= dt * p.rageSpeed;
  if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(1.15);
  const dmg = 20 * (L >= 2 ? 1.35 : 1);
  const range = 92 * (L >= 4 ? 1.25 : 1) * areaOf('blood');
  const ang = aimDir(p, 220);
  const bleed = L >= 4 ? 4 : 0;
  castAnim(p, ang, 0.22);
  ab.n = (ab.n || 0) + 1;
  swipe(p, ang, range, 2.6, dmg, 'blutwisch', { bleed, dir: ab.n % 2 ? 1 : -1 });
  if (L >= 3) GAME.later(0.13, () => swipe(GAME.p, ang + Math.PI, range * 0.9, 2.4, dmg * 0.8, 'blutwisch', { bleed, dir: -1 }));
  if (p.buffAder > 0) GAME.later(0.22, () => swipe(GAME.p, ang + 0.3, range * 1.1, 2.8, dmg, 'blutwisch', { bleed, dir: 1 }));
  if (L >= 5 && ab.n % 3 === 0) bloodCrescent(p.x, p.y, ang, dmg * 0.9, 'blutwisch');
}
function bloodCrescent(x, y, ang, dmg, src) {
  const hit = new Set(), sp = 430;
  addEffect({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, dur: 1.0, layer: 2, update(e, dt) {
    e.x += e.vx * dt; e.y += e.vy * dt;
    forEnemiesInRadius(e.x, e.y, 34, (en) => { if (hit.has(en.id)) return; hit.add(en.id); dealDamage(en, dmg, 'blood', src, { kb: 90, kx: Math.cos(ang), ky: Math.sin(ang) }); burstBlood(en.x, en.y, 4, 0.8, ang); });
    addLight(e.x, e.y, 90, '#ff3048', 0.8);
    if (Math.random() < 0.6) spawnPart({ x: e.x, y: e.y, z: 12, vx: rand(-30, 30), vy: rand(-30, 30), vz: 20, g: 400, life: 0.5, size: 3, size1: 1, spr: PART.drop, splat: Math.random() < 0.2 ? 1 : 0 });
  }, draw(g, e, k) {
    g.save(); g.translate(e.x, e.y - 12); g.rotate(ang); g.globalAlpha = 1 - k * k;
    g.drawImage(ASPR.crescent, -40, -40, 80, 80);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * (1 - k);
    g.drawImage(glowSprite('#ff3048'), -50, -50, 100, 100);
    g.restore();
  } });
}

/* ======================================================== BLUTERNTE & BLUTMONDSICHELN */
function tickBluternte(p, ab, dt, moon) {
  const L = ab.lvl;
  const n = moon ? 3 : 2 + (L >= 2 ? 1 : 0) + (L >= 4 ? 1 : 0);
  const spd = moon ? 2.4 : (L >= 4 ? 4.3 : 3.3);
  ab.rot = (ab.rot || 0) + spd * dt;
  const baseR = (moon ? 95 + Math.sin(GAME.t * 2.2) * 38 : (L >= 3 ? 84 : 72)) * areaOf('blood');
  const dmg = moon ? 24 : 9 * (L >= 3 ? 1.4 : 1);
  const hr = moon ? 30 : 16;
  ab.pos = ab.pos || [];
  ab.pos.length = n;
  ab.sndT = (ab.sndT || 0) - dt;
  for (let i = 0; i < n; i++) {
    const a = ab.rot + i * TAU / n;
    const x = p.x + Math.cos(a) * baseR, y = p.y + Math.sin(a) * baseR * 0.7;
    ab.pos[i] = { x, y, a };
    forEnemiesInRadius(x, y, hr, (en) => {
      const key = moon ? 'hitMoon' : 'hitErnte';
      if ((en[key] || 0) > GAME.t) return;
      en[key] = GAME.t + (moon ? 0.35 : 0.42);
      const ka = Math.atan2(en.y - p.y, en.x - p.x);
      const killed = dealDamage(en, dmg, 'blood', moon ? 'blutmond' : 'bluternte', { kb: moon ? 120 : 60, kx: Math.cos(ka), ky: Math.sin(ka), bleed: moon ? 6 : 0 });
      burstBlood(en.x, en.y, moon ? 5 : 2, 0.7, a + Math.PI / 2);
      if (ab.sndT <= 0) { sfx('sickle'); ab.sndT = 0.12; }
      if (killed && (moon || L >= 5)) healPlayer(moon ? 1.2 : 1, true);
      else if (moon) healPlayer(0.25, true);
    });
    addLight(x, y, moon ? 110 : 60, '#ff3048', moon ? 0.9 : 0.5);
  }
}
function drawBluternte(g, p, ab, moon) {
  if (!ab.pos) return;
  const spr = moon ? ASPR.moon : ASPR.sickle;
  const s = moon ? 78 : 30;
  for (const q of ab.pos) {
    if (!q) continue;
    const ta = q.a + Math.PI / 2;
    // Bewegungsschlieren
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let k = 1; k <= 3; k++) {
      const a2 = q.a - k * 0.14;
      const rr = Math.hypot(q.x - p.x, (q.y - p.y) / 0.7);
      g.globalAlpha = 0.22 / k;
      g.save(); g.translate(p.x + Math.cos(a2) * rr, p.y + Math.sin(a2) * rr * 0.7 - 12); g.rotate(a2 + Math.PI / 2 + GAME.t * 8);
      g.drawImage(spr, -s / 2, -s / 2, s, s); g.restore();
    }
    g.restore();
    g.save(); g.translate(q.x, q.y - 12); g.rotate(moon ? ta : ta + GAME.t * 8);
    g.drawImage(spr, -s / 2, -s / 2, s, s);
    g.restore();
  }
}

/* ======================================================== SCHATTENFLAMMEN */
function shadowFlame(x, y, target, dmg, pierce, src, opts) {
  opts = opts || {};
  const ang0 = target ? Math.atan2(target.y - y, target.x - x) + rand(-0.6, 0.6) : rand(0, TAU);
  const hit = new Set();
  let left = pierce;
  let tgt = target;
  const sp = opts.speed || 260;
  addEffect({ x, y, vx: Math.cos(ang0) * sp, vy: Math.sin(ang0) * sp, dur: 2.4, layer: 1, update(e, dt) {
    if (!tgt || tgt.dead) tgt = nearestEnemy(e.x, e.y, 320, hit);
    if (tgt) {
      const want = Math.atan2(tgt.y - e.y, tgt.x - e.x), cur = Math.atan2(e.vy, e.vx);
      const na = cur + clamp(angDiff(cur, want), -6 * dt, 6 * dt);
      e.vx = Math.cos(na) * sp; e.vy = Math.sin(na) * sp;
    }
    e.x += e.vx * dt; e.y += e.vy * dt;
    let done = false;
    forEnemiesInRadius(e.x, e.y, 14, (en) => {
      if (done || hit.has(en.id)) return;
      hit.add(en.id);
      dealDamage(en, dmg, 'shadow', src, { kb: 40, kx: e.vx / sp, ky: e.vy / sp, extraMarks: opts.extraMarks });
      burstShadow(en.x, en.y, 3, 0.7);
      if (opts.spread) { const n2 = nearestEnemy(en.x, en.y, 120, hit); if (n2) GAME.later(0.05, () => shadowFlame(en.x, en.y, n2, dmg * 0.5, 0, src, { speed: 320 })); }
      if (--left < 0) done = true;
    });
    if (done) { e.dead = true; fxFlash(e.x, e.y - 10, 26, '#a77bff', 0.15); }
    // Rauchspur: dunkle Fetzen + violette Funken
    if (Math.random() < 0.9 * FXQ) spawnPart({ x: e.x, y: e.y, z: 12, vx: rand(-15, 15), vy: rand(-15, 15), vz: rand(10, 30), g: -20, drag: 2, life: rand(0.3, 0.6), size: rand(5, 8), size1: 12, spr: PART.shadowwisp, alpha: 0.75, alpha1: 0 });
    if (Math.random() < 0.5 * FXQ) spawnPart({ x: e.x, y: e.y, z: 12, vx: rand(-25, 25), vy: rand(-25, 25), vz: rand(10, 40), drag: 2, life: 0.4, size: 2.5, size1: 0, spr: tinted('spark', '#c7a6ff'), layer: 1 });
    addLight(e.x, e.y, 70, '#8a5cff', 0.8);
  }, draw(g, e) {
    const fl = 1 + Math.sin(e.t * 40) * 0.12;
    const ang = Math.atan2(e.vy, e.vx);
    g.save(); g.translate(e.x, e.y - 12); g.rotate(ang);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.9;
    g.drawImage(PART.shadowwisp, -18, -10, 30, 20); // schwarzer Kern schluckt Licht
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1;
    g.drawImage(ASPR.sflame, -12 * fl, -9 * fl, 24 * fl, 18 * fl);
    g.globalAlpha = 0.6; g.drawImage(ASPR.sflame, -26, -6, 22, 12);
    g.restore();
  } });
}
function tickSchattenflammen(p, ab, dt) {
  ab.t -= dt * (p.ultT > 0 && p.hero === 'nyx' ? 2 : 1);
  if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 1.05 : 1.3);
  const n = 2 + (L >= 2 ? 1 : 0) + (L >= 4 ? 1 : 0);
  const dmg = 13 * (L >= 3 ? 1.3 : 1);
  const targets = nearestEnemies(p.x, p.y, 380, n);
  if (!targets.length) { ab.t = 0.2; return; }
  sfx('flame');
  castAnim(p, Math.atan2(targets[0].y - p.y, targets[0].x - p.x), 0.2);
  for (let i = 0; i < n; i++) {
    const tg = targets[i % targets.length];
    GAME.later(i * 0.06, () => shadowFlame(GAME.p.x, GAME.p.y - 4, tg, dmg, L >= 3 ? 2 : 1, 'schattenflammen', { spread: L >= 5 }));
  }
}

/* ======================================================== NACHBILDER */
function spawnAfterimage(p, dur, kind, opts) {
  opts = opts || {};
  if (!p.spr) { const px = heroPx(); p.spr = renderHero(p.hero, playerPoseState(p), heroLook(p), px, null, { glow: true }); p.spr.px = px; }
  const snap = mkCanvas(p.spr.out.width, p.spr.out.height);
  const sg = snap.getContext('2d');
  sg.drawImage(p.spr.out, 0, 0);
  sg.globalCompositeOperation = 'source-atop';
  sg.fillStyle = kind === 'mirror' ? 'rgba(80,220,200,0.55)' : 'rgba(70,30,140,0.72)';
  sg.fillRect(0, 0, snap.width, snap.height);
  const img = { x: p.x, y: p.y, t: 0, dur, kind, snap, face: p.face, sw: p.spr.S, anchorY: p.spr.anchorY, slashT: 0.2, castT: 0.3, taunt: true, opts, pxs: p.spr.px };
  GAME.images.push(img);
  burstShadow(p.x, p.y, 6, 0.5);
  return img;
}
function tickNachbilder(p, ab, dt) {
  const L = ab.lvl;
  ab.t -= dt;
  const maxN = L >= 3 ? 2 : 1;
  if (ab.t <= 0) {
    const mine = GAME.images.filter((i) => i.kind === 'after');
    if (mine.length < maxN) { spawnAfterimage(p, L >= 3 ? 3.5 : 2.6, 'after'); sfx('shadowstep', 0, 0.2); }
    ab.t = cdOf(3.5);
  }
}
function updateImages(dt) {
  const imgs = GAME.images;
  const p = GAME.p;
  const L = abLvl('nachbilder');
  for (const im of imgs) {
    im.t += dt;
    if (im.kind === 'after' || (im.kind === 'decoy' && L > 0)) {
      im.slashT -= dt;
      if (im.slashT <= 0) {
        im.slashT = L >= 4 ? 0.38 : 0.5;
        const r = (L >= 4 ? 72 : 56) * p.st.area;
        const dmg = 10 * (L >= 2 ? 1.4 : 1);
        let any = false;
        forEnemiesInRadius(im.x, im.y, r, (en) => { any = true; dealDamage(en, dmg, 'shadow', 'nachbilder', { kb: 30, kx: en.x - im.x, ky: en.y - im.y, norm: true }); });
        if (any) daggerSpin(im.x, im.y, r);
      }
    }
    if (im.kind === 'mirror') {
      im.castT -= dt; im.slashT -= dt;
      if (im.castT <= 0) { im.castT = 0.9; qiChain(im.x, im.y - 20, 5, 16, 'spiegel', { col: '#7ae0ff', extraMarks: ['s'] }); }
      if (im.slashT <= 0) {
        im.slashT = 0.6;
        const r = 56 * p.st.area;
        let any = false;
        forEnemiesInRadius(im.x, im.y, r, (en) => { any = true; dealDamage(en, 14, 'shadow', 'spiegel', { kb: 40, kx: en.x - im.x, ky: en.y - im.y, norm: true }); });
        if (any) daggerSpin(im.x, im.y, r);
      }
    }
    addLight(im.x, im.y - 20, 80, im.kind === 'mirror' ? '#5ff0d0' : '#8a5cff', 0.5);
  }
  for (let i = imgs.length - 1; i >= 0; i--) {
    const im = imgs[i];
    if (im.t >= im.dur) {
      if (im.kind === 'after' && L >= 5) {
        const r = 84 * p.st.area;
        forEnemiesInRadius(im.x, im.y, r, (en) => dealDamage(en, 32, 'shadow', 'nachbilder', { kb: 120, kx: en.x - im.x, ky: en.y - im.y, norm: true }));
        burstShadow(im.x, im.y, 16, 1.4); fxRing(im.x, im.y, 10, r, 0.35, '#a77bff', 6); sfx('rift', 0, 0.1);
      } else burstShadow(im.x, im.y, 5, 0.6);
      imgs.splice(i, 1);
    }
  }
}
function daggerSpin(x, y, r) {
  sfx('whip', 0, 0.08);
  addEffect({ x, y, dur: 0.22, layer: 1, draw(g, e, k) {
    g.save(); g.translate(x, y - 16); g.scale(1, 0.65);
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 1 - k;
    g.strokeStyle = '#c7a6ff'; g.lineWidth = 4 * (1 - k) + 1;
    const a0 = k * TAU * 1.3;
    g.beginPath(); g.arc(0, 0, r * 0.9, a0, a0 + 2.2); g.stroke();
    g.beginPath(); g.arc(0, 0, r * 0.7, a0 + Math.PI, a0 + Math.PI + 1.8); g.stroke();
    g.restore();
  } });
}
function drawImages(g) {
  for (const im of GAME.images) {
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
  }
  g.globalAlpha = 1;
}

/* ======================================================== NACHTSCHLUND */
function openRift(x, y, r, dur, dmg, pull, src, collapse) {
  sfx('rift', 0, 0.15);
  let tick = 0;
  addEffect({ x, y, dur, layer: 0, update(e, dt) {
    tick -= dt;
    forEnemiesInRadius(x, y, r, (en) => {
      const dx = x - en.x, dy = y - en.y, d = Math.hypot(dx, dy) || 1;
      const m = en.boss ? 0.05 : en.mini ? 0.2 : 1;
      en.x += dx / d * pull * m * dt; en.y += dy / d * pull * m * dt;
      en.slowT = Math.max(en.slowT, 0.25); en.slowF = Math.min(en.slowF || 1, 0.55);
    });
    if (tick <= 0) { tick = 0.3; forEnemiesInRadius(x, y, r, (en) => dealDamage(en, dmg, 'shadow', src, { quiet: true })); }
    if (Math.random() < 0.5 * FXQ) { const a = Math.random() * TAU; spawnPart({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.6, z: 2, vx: -Math.cos(a) * r * 1.4, vy: -Math.sin(a) * r * 0.9, vz: rand(20, 50), drag: 1, life: 0.6, size: rand(5, 9), size1: 2, spr: PART.shadowwisp, alpha: 0.8, alpha1: 0 }); }
    addLight(x, y, r * 1.6, '#7a4aff', 0.5);
    if (collapse && e.t + dt >= dur) {
      forEnemiesInRadius(x, y, r * 1.1, (en) => dealDamage(en, 30, 'shadow', src, { kb: 140, kx: en.x - x, ky: en.y - y, norm: true }));
      burstShadow(x, y, 14, 1.3); fxRing(x, y, r * 0.3, r * 1.2, 0.3, '#a77bff', 6); shake(2);
    }
  }, draw(g, e, k) {
    const open = Math.min(1, e.t * 5) * Math.min(1, (dur - e.t) * 4);
    const rr = r * open;
    g.save(); g.translate(x, y); g.scale(1, 0.6);
    g.fillStyle = rg(g, 0, 0, 0, rr, [0, 'rgba(0,0,0,1)', 0.55, 'rgba(8,0,20,0.95)', 0.85, 'rgba(40,10,90,0.6)', 1, 'rgba(60,20,120,0)']);
    g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.fill();
    g.globalCompositeOperation = 'lighter';
    g.lineWidth = 2.2;
    for (let i = 0; i < 5; i++) {
      const a = e.t * (2.6 + i * 0.3) + i * 1.3;
      g.strokeStyle = rgba('#a77bff', 0.55 - i * 0.07);
      g.beginPath(); g.arc(0, 0, rr * (0.35 + i * 0.13), a, a + 1.6 + i * 0.2); g.stroke();
    }
    g.restore();
  } });
}
function tickNachtschlund(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(3);
  const n = 1 + (L >= 2 ? 1 : 0) + (L >= 4 ? 1 : 0);
  const r = (L >= 3 ? 74 : 56) * p.st.area;
  const dmg = 5 * (L >= 4 ? 1.4 : 1);
  const pull = L >= 3 ? 95 : 60;
  const used = [];
  for (let i = 0; i < n; i++) {
    // Ziel: Gegner mit den meisten Nachbarn (Rudel)
    let best = null, bs = -1;
    for (let k = 0; k < 7; k++) {
      const en = randomEnemyNear(p.x, p.y, 280);
      if (!en) break;
      if (used.some((u) => dist2(u.x, u.y, en.x, en.y) < r * r * 1.5)) continue;
      let c = 0; forEnemiesInRadius(en.x, en.y, r, () => c++);
      if (c > bs) { bs = c; best = en; }
    }
    if (!best) break;
    used.push(best);
    GAME.later(i * 0.12, () => openRift(best.x, best.y, r, 2.4, dmg, pull, 'nachtschlund', L >= 5));
  }
}

/* ======================================================== QI-HANDFLAECHE */
function palmStrike(x, y, ang, range, width, dmg, src, opts) {
  opts = opts || {};
  const hit = new Set();
  const dur = 0.26;
  sfx('palm');
  shake(1.8);
  const kb = 260 * GAME.p.st.kb * (opts.kbMul || 1);
  addEffect({ x, y, dur: dur + 0.25, layer: 1, update(e) {
    const k = clamp(e.t / dur, 0, 1);
    const reach = range * easeOut(k);
    const cx = Math.cos(ang), cy = Math.sin(ang);
    forEnemiesInRadius(x + cx * reach * 0.5, y + cy * reach * 0.5, reach * 0.5 + width, (en) => {
      if (hit.has(en.id)) return;
      const dx = en.x - x, dy = en.y - y;
      const along = dx * cx + dy * cy, side = Math.abs(-dx * cy + dy * cx);
      if (along < -10 || along > reach + 10 || side > width * (0.6 + 0.5 * along / range) + en.r) return;
      hit.add(en.id);
      dealDamage(en, dmg, 'qi', src, { kb, kx: cx, ky: cy, stun: opts.stun, extraMarks: opts.extraMarks });
      burstQi(en.x, en.y, 3, 0.6);
    });
    if (k < 1) addLight(x + Math.cos(ang) * reach, y + Math.sin(ang) * reach, 130, '#5ff0d0', 1);
  }, draw(g, e) {
    const k = clamp(e.t / dur, 0, 1), fade = clamp((e.t - dur) / 0.25, 0, 1);
    const reach = range * easeOut(k);
    g.save(); g.translate(x, y - 16); g.rotate(ang); g.scale(1, 0.85);
    g.globalCompositeOperation = 'lighter';
    // Ringe (Wellen)
    for (let i = 0; i < 3; i++) {
      const kk = clamp(k * 1.2 - i * 0.12, 0, 1);
      g.globalAlpha = (1 - kk) * (1 - fade) * 0.6;
      g.strokeStyle = i === 1 ? '#ffe6a0' : '#5ff0d0'; g.lineWidth = 3;
      g.beginPath(); g.ellipse(reach * kk * 0.9, 0, 8 + kk * 10, width * (0.5 + kk * 0.6), 0, 0, TAU); g.stroke();
    }
    // die Hand
    const s = width / 54 * (0.7 + k * 0.5);
    g.globalAlpha = (1 - fade) * 0.95;
    g.drawImage(ASPR.palm, reach - 110 * s, -64 * s, 160 * s, 128 * s);
    g.restore();
    // Staub am Boden
    if (k < 1 && Math.random() < 0.7 * FXQ) spawnPart({ x: x + Math.cos(ang) * reach + rand(-10, 10), y: y + Math.sin(ang) * reach + rand(-10, 10), z: 2, vx: Math.cos(ang) * 60 + rand(-30, 30), vy: Math.sin(ang) * 60 + rand(-30, 30), vz: rand(10, 30), drag: 2, life: 0.7, size: 8, size1: 18, spr: tinted('smoke', '#7a7890'), alpha: 0.4, alpha1: 0 });
  } });
}
function tickQihand(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(L >= 3 ? 2.0 : 2.4);
  const e = nearestEnemy(p.x, p.y, 230);
  if (!e) { ab.t = 0.25; return; }
  const ang = Math.atan2(e.y - p.y, e.x - p.x);
  const dmg = 24 * (L >= 2 ? 1.3 : 1) * shenQiMult(p);
  const range = 150 * (L >= 3 ? 1.25 : 1) * p.st.area;
  castAnim(p, ang, 0.35);
  const stun = L >= 5 ? 0.8 : 0;
  palmStrike(p.x, p.y, ang, range, 54 * p.st.area, dmg, 'qihand', { stun });
  if (L >= 4) GAME.later(0.08, () => { palmStrike(GAME.p.x, GAME.p.y, ang + 0.45, range * 0.9, 46 * p.st.area, dmg * 0.8, 'qihand', { stun }); palmStrike(GAME.p.x, GAME.p.y, ang - 0.45, range * 0.9, 46 * p.st.area, dmg * 0.8, 'qihand', { stun }); });
}
function shenQiMult(p) { return p.hero === 'shen' ? 1 : 1; }

/* ======================================================== QI-KETTE */
function qiChain(x, y, jumps, dmg, src, opts) {
  opts = opts || {};
  const hit = new Set();
  const pts = [[x, y]];
  let cx = x, cy = y;
  const chain = [];
  for (let i = 0; i < jumps; i++) {
    const e = nearestEnemy(cx, cy, i === 0 ? 300 : 150, hit);
    if (!e) break;
    hit.add(e.id); chain.push(e); cx = e.x; cy = e.y;
  }
  if (!chain.length) return false;
  sfx('chain');
  const col = opts.col || '#5ff0d0';
  let idx = 0, acc = 0;
  const segs = [];
  addEffect({ x, y, dur: chain.length * 0.055 + 0.3, layer: 1, update(e, dt) {
    acc += dt;
    while (idx < chain.length && acc >= idx * 0.055) {
      const en = chain[idx];
      const from = idx === 0 ? [x, y] : [chain[idx - 1].x, chain[idx - 1].y - 16];
      segs.push({ a: from, b: [en.x, en.y - 16], t: e.t, jag: [rand(-12, 12), rand(-12, 12), rand(-8, 8)] });
      if (!en.dead) {
        dealDamage(en, dmg, 'qi', src, { kb: 50, kx: en.x - from[0], ky: en.y - from[1], norm: true, extraMarks: opts.extraMarks });
        burstQi(en.x, en.y - 12, 4, 0.5, col);
        if (opts.ring) { const ex = en.x, ey = en.y; forEnemiesInRadius(ex, ey, 44 * GAME.p.st.area, (o) => { if (o !== en) dealDamage(o, 8, 'qi', src, { kb: 90, kx: o.x - ex, ky: o.y - ey, norm: true, quiet: true }); }); fxRing(ex, ey, 6, 44 * GAME.p.st.area, 0.25, col, 3); }
      }
      addLight(en.x, en.y, 90, col, 1);
      idx++;
    }
  }, draw(g, e) {
    g.globalCompositeOperation = 'lighter';
    for (const s of segs) {
      const age = e.t - s.t;
      const a = Math.max(0, 1 - age / 0.28);
      if (a <= 0) continue;
      const mx = (s.a[0] + s.b[0]) / 2 + s.jag[0], my = (s.a[1] + s.b[1]) / 2 + s.jag[1];
      g.globalAlpha = a;
      g.strokeStyle = col; g.lineWidth = 5 * a + 1;
      g.beginPath(); g.moveTo(s.a[0], s.a[1]); g.lineTo(mx, my); g.lineTo(s.b[0], s.b[1]); g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.6 * a;
      g.beginPath(); g.moveTo(s.a[0], s.a[1]); g.lineTo(mx, my); g.lineTo(s.b[0], s.b[1]); g.stroke();
      g.drawImage(glowSprite(col, true), s.b[0] - 16, s.b[1] - 16, 32, 32);
    }
  } });
  return true;
}
function tickQikette(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 1.4 : 1.8);
  const jumps = 3 + (L >= 2 ? 1 : 0) + (L >= 4 ? 2 : 0);
  const dmg = 14 * (L >= 3 ? 1.35 : 1);
  const ok = qiChain(p.x, p.y - 20, jumps, dmg, 'qikette', { ring: L >= 5 });
  if (!ok) ab.t = 0.25; else castAnim(p, p.castAim, 0.18);
}

/* ======================================================== FUSION: KARMESINFINSTERNIS */
function tickFinsternis(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  ab.t = cdOf(2.7);
  const r = 155 * areaOf('blood');
  const dmg = 62;
  castAnim(p, -Math.PI / 2, 0.7);
  sfx('rift');
  const imp = 0.6;
  addEffect({ x: p.x, y: p.y, dur: imp + 0.05, layer: 0, update(e, dt) {
    e.x = GAME.p.x; e.y = GAME.p.y;
    forEnemiesInRadius(e.x, e.y, r, (en) => {
      const dx = e.x - en.x, dy = e.y - en.y, d = Math.hypot(dx, dy) || 1;
      if (d < 30) return;
      const m = en.boss ? 0.05 : en.mini ? 0.25 : 1;
      const sw = 0.6; // Wirbel
      en.x += (dx / d + (-dy / d) * sw) * 230 * m * dt; en.y += (dy / d + (dx / d) * sw) * 230 * m * dt;
    });
    if (Math.random() < FXQ) { const a = Math.random() * TAU; spawnPart({ x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r * 0.62, z: 10, vx: -Math.cos(a) * r * 1.6, vy: -Math.sin(a) * r, vz: 30, drag: 0.5, life: 0.5, size: rand(4, 8), size1: 2, spr: Math.random() < 0.5 ? PART.shadowwisp : PART.drop, alpha: 0.9, alpha1: 0.2, stretch: 1 }); }
    addLight(e.x, e.y, r, '#6a0020', 0.6);
  }, draw(g, e, k) {
    const sr = 10 + 26 * easeIn(k);
    const cx = GAME.p.x, cy = GAME.p.y - 60;
    // Korona
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.9;
    g.drawImage(glowSprite('#ff1a3a', true), cx - sr * 2.4, cy - sr * 2.4, sr * 4.8, sr * 4.8);
    g.globalCompositeOperation = 'source-over';
    // schwarze Sonne
    g.fillStyle = rg(g, cx, cy, 0, sr, [0, '#000', 0.8, '#0a0006', 1, 'rgba(60,0,20,0)']);
    g.beginPath(); g.arc(cx, cy, sr, 0, TAU); g.fill();
    // Sogring am Boden
    g.save(); g.translate(GAME.p.x, GAME.p.y); g.scale(1, 0.62);
    g.globalAlpha = 0.6 * k; g.strokeStyle = '#3a0010'; g.lineWidth = 10;
    g.beginPath(); g.arc(0, 0, r * (1 - k * 0.7), 0, TAU); g.stroke();
    g.restore();
    g.globalAlpha = 1;
  } });
  GAME.later(imp, () => {
    const q = GAME.p;
    novaBurst(q.x, q.y, r, dmg, 'finsternis', { big: true, kb: 200, col: '#ff1a3a', dur: 0.32, extraMarks: ['s'] });
    burstShadow(q.x, q.y, 22, 1.8);
    fxFlash(q.x, q.y - 40, 120, '#ff2a4a', 0.25);
    const tg = nearestEnemies(q.x, q.y, 420, 6);
    for (let i = 0; i < 6; i++) GAME.later(0.05 * i, () => shadowFlame(q.x, q.y - 40, tg[i % Math.max(1, tg.length)] || null, 22, 2, 'finsternis', { speed: 300, extraMarks: ['b'] }));
  });
}

/* ======================================================== FUSION: DRACHENHERZ */
function tickDrachenherz(p, ab, dt) {
  ab.t -= dt * p.rageSpeed;
  if (ab.t > 0) return;
  ab.t = cdOf(1.55);
  ab.side = -(ab.side || 1);
  const ang = aimDir(p, 300);
  castAnim(p, ang, 0.35);
  sfx('palm'); sfx('whip', 0, 0);
  shake(2.5);
  const len = 360 * p.st.area, width = 46 * p.st.area, dmg = 44;
  const x0 = p.x, y0 = p.y, cx = Math.cos(ang), cy = Math.sin(ang), side = ab.side;
  const hit = new Set();
  let healed = 0;
  const dur = 0.75;
  const pathAt = (s, t) => { // Schlangenlinie
    const d = s * len, wv = Math.sin(s * 9 - t * 16) * 22 * side * Math.min(1, s * 3);
    return [x0 + cx * d - cy * wv, y0 + cy * d + cx * wv];
  };
  addEffect({ x: x0, y: y0, dur: dur + 0.3, layer: 1, update(e) {
    const k = clamp(e.t / dur, 0, 1);
    const head = pathAt(k, e.t);
    forEnemiesInRadius(head[0], head[1], width + 10, (en) => {
      if (hit.has(en.id)) return;
      hit.add(en.id);
      dealDamage(en, dmg, hit.size % 2 ? 'blood' : 'qi', 'drachenherz', { kb: 240 * GAME.p.st.kb, kx: cx * 0.6 - cy * side * 0.8, ky: cy * 0.6 + cx * side * 0.8, extraMarks: ['b', 'q'] });
      burstBlood(en.x, en.y, 3, 0.8); burstQi(en.x, en.y, 2, 0.5);
      if (healed < 6) { healed += 0.6; healPlayer(0.6, true); }
    });
    if (k < 1) { addLight(head[0], head[1], 150, '#ff6a50', 1); if (Math.random() < FXQ) burstQi(head[0], head[1], 1, 0.3, '#ffb070'); if (Math.random() < 0.5) spawnPart({ x: head[0], y: head[1], z: 20, vx: rand(-40, 40), vy: rand(-40, 40), vz: 40, g: 400, life: 0.6, size: 3, size1: 1.5, spr: PART.drop, splat: 1 }); }
  }, draw(g, e) {
    const k = clamp(e.t / dur, 0, 1), fade = clamp((e.t - dur) / 0.3, 0, 1);
    g.globalCompositeOperation = 'lighter';
    const N = 16;
    for (let i = N; i >= 1; i--) {
      const s = k - i * 0.035;
      if (s < 0) continue;
      const q = pathAt(s, e.t);
      const w = width * (1 - i / N * 0.7);
      g.globalAlpha = (1 - fade) * (0.85 - i / N * 0.5);
      g.drawImage(glowSprite(i % 3 === 0 ? '#5ff0d0' : '#ff2a40', true), q[0] - w, q[1] - 18 - w * 0.8, w * 2, w * 1.6);
    }
    const hq = pathAt(k, e.t), hq2 = pathAt(Math.max(0, k - 0.02), e.t);
    const ha = Math.atan2(hq[1] - hq2[1], hq[0] - hq2[0]);
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1 - fade;
    g.save(); g.translate(hq[0], hq[1] - 18); g.rotate(ha);
    if (Math.cos(ha) < 0) g.scale(1, -1);
    const s = width / 38;
    g.drawImage(ASPR.dragon, -70 * s, -50 * s, 140 * s, 100 * s);
    g.restore();
  } });
}

/* ======================================================== FUSION: LEERER SPIEGEL */
function tickSpiegel(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  ab.t = cdOf(2.5);
  const mine = GAME.images.filter((i) => i.kind === 'mirror');
  if (mine.length >= 3) { mine[0].t = mine[0].dur; }
  spawnAfterimage(p, 5.5, 'mirror');
  sfx('shadowstep', 0, 0.2);
}

/* ======================================================== FUSION: DREIFALTIGES SIEGEL */
function tickSiegel(p, ab, dt) {
  ab.rot = (ab.rot || 0) + dt * 0.9;
  ab.t -= dt;
  addLight(p.x, p.y, 150, '#ffffff', 0.35);
  if (ab.t > 0) return;
  ab.t = cdOf(2.8);
  castAnim(p, -Math.PI / 2, 0.5);
  const all = ['b', 's', 'q'];
  novaBurst(p.x, p.y, 118 * p.st.area, 30, 'siegel', { extraMarks: all });
  const tg = nearestEnemies(p.x, p.y, 380, 3);
  for (let i = 0; i < 3; i++) GAME.later(0.15 + i * 0.07, () => shadowFlame(GAME.p.x, GAME.p.y - 20, tg[i] || null, 22, 1, 'siegel', { extraMarks: all }));
  GAME.later(0.35, () => {
    const q = GAME.p, r = 165 * q.st.area;
    sfx('palm');
    forEnemiesInRadius(q.x, q.y, r, (en) => dealDamage(en, 22, 'qi', 'siegel', { kb: 200 * q.st.kb, kx: en.x - q.x, ky: en.y - q.y, norm: true, extraMarks: all }));
    fxRing(q.x, q.y, 20, r, 0.4, '#5ff0d0', 7); fxRing(q.x, q.y, 10, r * 0.8, 0.35, '#ffe6a0', 3);
  });
}
function drawSiegel(g, p, ab) {
  g.save(); g.translate(p.x, p.y); g.scale(1, 0.6); g.rotate(ab.rot || 0);
  g.globalCompositeOperation = 'lighter';
  const pulse = 0.5 + 0.5 * Math.max(0, 1 - (ab.t || 0) / 0.4);
  g.globalAlpha = 0.45 + pulse * 0.4;
  const s = 150 * p.st.area;
  g.drawImage(ASPR.sigil, -s / 2, -s / 2, s, s);
  g.restore();
}

/* ======================================================== ULTIMATES */
function castUlt(p) {
  const H = HEROES[p.hero];
  if (p.ultCd > 0 || !p.alive) return false;
  if (p.hero === 'shen' && p.qi < 1) { UI.toast('Kein Qi — steh still, um Qi zu sammeln'); return false; }
  p.ultCd = H.ult.cd * (p.hero === 'shen' ? 1 : p.st.cd);
  GAME.stats.ults++;
  const fn = ULTS[H.ult.id];
  fn(p);
  return true;
}
const ULTS = {
  karminsturm(p) {
    sfx('ult'); hitstop(0.08); shake(9);
    castAnim(p, -Math.PI / 2, 0.8);
    fxFlash(p.x, p.y - 40, 260, '#ff1a3a', 0.4);
    novaBurst(p.x, p.y, 180 * areaOf('blood'), 46, 'karminsturm', { big: true, kb: 220, dur: 0.4 });
    // alle Blutmale auf dem Feld zuenden
    const list = [];
    for (const e of GAME.enemies) if (!e.dead && e.bstack > 0 && Math.abs(e.x - p.x) < VIEW.w * 0.6 && Math.abs(e.y - p.y) < VIEW.h * 0.6) list.push(e);
    list.sort((a, b) => dist2(a.x, a.y, p.x, p.y) - dist2(b.x, b.y, p.x, p.y));
    list.forEach((e, i) => {
      const st = e.bstack;
      GAME.later(0.1 + i * 0.012, () => { if (e.dead) return; bloodBurstAt(e.x, e.y, 30 + st * 7, 14 * st, 'karminsturm'); e.bstack = 0; });
    });
    if (list.length) UI.toast(list.length + ' Blutmale gezündet!');
  },
  aderlass(p) {
    sfx('ult'); shake(4);
    const cost = Math.max(0, Math.min(p.hp - 1, p.hp * 0.2));
    p.hp -= cost;
    addText(p.x, p.y - 70, '-' + Math.round(cost), '#ff4a5a', 15, { always: true });
    p.buffAder = 6;
    burstBlood(p.x, p.y, 30, 1.4);
    fxRing(p.x, p.y, 10, 120, 0.4, '#ff2a40', 8);
    castAnim(p, -Math.PI / 2, 0.5);
  },
  mitternacht(p) {
    sfx('ult'); sfx('shadowstep');
    p.ultT = 4; p.iframes = Math.max(p.iframes, 4);
    burstShadow(p.x, p.y, 30, 1.5);
    fxFlash(p.x, p.y - 30, 150, '#6a3aff', 0.3);
  },
  harmonie(p) {
    const pips = Math.floor(p.qi);
    p.qi -= pips;
    sfx('ult'); sfx('palm'); shake(3 + pips);
    hitstop(0.04 * pips);
    castAnim(p, -Math.PI / 2, 0.6);
    const r = (90 + 28 * pips) * p.st.area, dmg = 20 * pips;
    forEnemiesInRadius(p.x, p.y, r, (en) => dealDamage(en, dmg, 'qi', 'harmonie', { kb: 320 * p.st.kb, kx: en.x - p.x, ky: en.y - p.y, norm: true, extraMarks: pips >= 3 ? ['b', 's'] : null }));
    healPlayer(3 * pips);
    fxRing(p.x, p.y, 16, r, 0.45, '#5ff0d0', 10); fxRing(p.x, p.y, 10, r * 0.85, 0.4, '#ffe6a0', 4);
    fxFlash(p.x, p.y - 20, 60 + pips * 20, '#9affe6', 0.3);
    addEffect({ x: p.x, y: p.y, dur: 0.7, layer: 1, draw(g, e, k) {
      g.save(); g.translate(e.x, e.y); g.scale(1, 0.62); g.rotate(k * 2);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k;
      const s = r * 1.1 * easeOut(k) + 30; g.drawImage(ASPR.lotus, -s, -s, s * 2, s * 2); g.restore();
    } });
    if (pips >= 3) { // Schatten-Klone schneiden durch die naechsten Gegner
      const tg = nearestEnemies(p.x, p.y, 320, 3);
      tg.forEach((en, i) => GAME.later(0.1 + i * 0.1, () => {
        const q = GAME.p;
        addEffect({ x: q.x, y: q.y, dur: 0.25, layer: 1, draw(g, e, k) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k; g.strokeStyle = '#a77bff'; g.lineWidth = 6 * (1 - k) + 1; g.beginPath(); g.moveTo(e.x, e.y - 20); g.lineTo(en.x, en.y - 20); g.stroke(); } });
        if (!en.dead) dealDamage(en, 14 * pips, 'shadow', 'harmonie', { kb: 80, kx: en.x - q.x, ky: en.y - q.y, norm: true });
        burstShadow(en.x, en.y, 8, 1);
      }));
    }
    if (pips >= 5) {
      GAME.slowmo = 3;
      for (const id in p.ab) p.ab[id].t = 0;
      UI.toast('VOLLKOMMENE HARMONIE', 'qi');
    }
  }
};

/* ======================================================== Ausweichen */
function doDodge(p) {
  if (p.dodgeCd > 0 || p.dodgeT > 0 || !p.alive) return false;
  const H = HEROES[p.hero];
  let dx = INPUT.moveX, dy = INPUT.moveY;
  if (Math.hypot(dx, dy) < 0.2) { dx = p.lastMoveX || p.face; dy = p.lastMoveY || 0; }
  const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  p.dodgeDir = [dx, dy];
  p.dodgeCd = H.dodgeCd * p.st.dodgeCdMul;
  if (Math.abs(dx) > 0.15) p.face = dx > 0 ? 1 : -1;
  const trail = abLvl('nebelgang') >= 3 || (p.passives.nebelgang || 0) >= 3;
  if (H.dodge === 'shadowstep') {
    // Teleport-Sprint: sofort, schneidet alles auf dem Weg
    const len = 135;
    const x0 = p.x, y0 = p.y;
    spawnAfterimage(p, 1.6, 'decoy');
    p.x += dx * len; p.y += dy * len;
    p.iframes = Math.max(p.iframes, 0.35);
    p.dodgeT = 0.12; p.dodgeMax = 0.12;
    sfx('shadowstep');
    const hit = new Set();
    for (let s = 0; s <= 1; s += 0.1) forEnemiesInRadius(x0 + dx * len * s, y0 + dy * len * s, 26, (en) => { if (hit.has(en.id)) return; hit.add(en.id); dealDamage(en, 20, 'shadow', 'schattenschritt', { kb: 60, kx: -dy, ky: dx }); });
    addEffect({ x: x0, y: y0, dur: 0.35, layer: 1, draw(g, e, k) {
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k;
      g.strokeStyle = '#a77bff'; g.lineWidth = 10 * (1 - k) + 1;
      g.beginPath(); g.moveTo(x0, y0 - 20); g.lineTo(x0 + dx * len, y0 + dy * len - 20); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 2 * (1 - k);
      g.beginPath(); g.moveTo(x0, y0 - 20); g.lineTo(x0 + dx * len, y0 + dy * len - 20); g.stroke();
    } });
    burstShadow(x0, y0, 10, 1); burstShadow(p.x, p.y, 10, 1);
    if (abLvl('spiegel')) spawnAfterimage(p, 5.5, 'mirror');
  } else {
    p.dodgeT = H.dodge === 'mist' ? 0.32 : 0.3; p.dodgeMax = p.dodgeT;
    p.iframes = Math.max(p.iframes, p.dodgeT + 0.08);
    sfx('dodge');
    if (H.dodge === 'mist') burstBlood(p.x, p.y, 8, 0.6);
  }
  if (trail) {
    const x0 = p.x - dx * 60, y0 = p.y - dy * 60, slowT = (p.passives.nebelgang || 0) >= 5;
    let tick = 0;
    addEffect({ x: x0, y: y0, dur: 1.6, layer: 0, update(e, dt) {
      tick -= dt; if (tick > 0) return; tick = 0.3;
      forEnemiesInRadius(e.x, e.y, 60, (en) => { dealDamage(en, 7, 'shadow', 'nebelgang', { quiet: true }); if (slowT) { en.slowT = 0.6; en.slowF = 0.5; } });
    }, draw(g, e, k) {
      g.globalAlpha = (1 - k) * 0.6; g.drawImage(PART.shadowwisp, e.x - 60, e.y - 40, 120, 70); g.globalAlpha = 1;
    } });
  }
  return true;
}
