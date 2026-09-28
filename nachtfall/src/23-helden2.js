'use strict';
/* ==========================================================================
   WEITERE ARCADE-HELDEN aus dem Vampirsystem (eigene Umsetzung)
   Lena Grimm · Fabian Schneider · Fex Sanguini · Leo · Leander Lothringen ·
   Agathon · Sam · Mia Müller
   Jede Figur: Evolution im Lauf, eigenes Faehigkeiten-Set, Ultis.
   Die vier Figuren ohne Bezug zum Vampirsystem (Vorian, Liora, Nyx, Shen)
   sind nicht mehr in der Arcade-Heldenwahl.
   ========================================================================== */

/* ============================================================ Gemeinsames */
// Schutz (Blutbarriere, Himmelsschild) und Parade (Leos Aurensicht)
const _dmgPlayerH2 = damagePlayer;
damagePlayer = function (amount, src, heavy) {
  const G = GAME, p = G.p;
  if (p.alive && p.iframes <= 0 && G.state === 'play') {
    if (p.parryReady) { p.parryReady = false; p.iframes = 0.4; sfx('crit', 0, 0.1); fxFlash(p.x, p.y - 20, 40, '#ffffff', 0.15); arcSweep(p, 0, 110 * p.st.area, TAU, 30 * (p.parryDmg || 1), 'qi', 'aurensicht', '#e8fff8', { kb: 200 }); return false; }
    if ((p.barrierT || 0) > G.t) { amount *= 0.35; burstSparks(p.x, p.y - 20, 4, p.barrierCol || '#ff3a4e', 0.6); }
  }
  return _dmgPlayerH2(amount, src, heavy);
};
function shieldFx(p, dur, col) {
  p.barrierT = GAME.t + dur; p.barrierCol = col;
  addEffect({ x: p.x, y: p.y, dur, layer: 2, draw(g, e, k) { const q = GAME.p; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35 * (1 - k * 0.5); g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.ellipse(q.x, q.y - 20, 26, 34, 0, 0, TAU); g.stroke(); g.globalAlpha = 0.12; g.fillStyle = col; g.fill(); g.restore(); } });
}
// Strahl: sofortiger Treffer entlang einer Linie
function beam(x, y, ang, len, w, dmg, school, src, col, o) {
  o = o || {};
  if (dmg > 0) forEnemiesInRadius(x, y, len, (en) => { const dx = en.x - x, dy = en.y - y, along = dx * Math.cos(ang) + dy * Math.sin(ang), perp = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang)); if (along > 0 && along < len && perp < w + en.r) { dealDamage(en, dmg, school, src, { kb: o.kb || 60, kx: Math.cos(ang), ky: Math.sin(ang), stun: o.stun }); if (o.onHit) o.onHit(en); } });
  addEffect({ x, y, dur: 0.3, layer: 2, draw(g, e, k) { g.save(); g.translate(x, y - 16); g.rotate(ang); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k; g.fillStyle = lg(g, 0, -w, 0, w, [0, rgba(col, 0), 0.5, col, 1, rgba(col, 0)]); g.fillRect(0, -w * (1 - k * 0.5), len, w * 2 * (1 - k * 0.5)); g.fillStyle = '#ffffff'; g.fillRect(0, -w * 0.2, len, w * 0.4); g.restore(); addLight(x + Math.cos(ang) * len / 2, y + Math.sin(ang) * len / 2, len * 0.6, col, 0.6 * (1 - k)); } });
  sfx(o.sfx || 'palm', 0, 0.08);
}
// Zone mit Schaden ueber Zeit
function zone(x, y, r, dur, dps, school, src, col, o) {
  o = o || {}; let tick = 0;
  addEffect({ x, y, dur, layer: 0, update(e, dt) { tick -= dt; forEnemiesInRadius(x, y, r, (en) => { if (o.slow) { en.slowT = Math.max(en.slowT, 0.4); en.slowF = Math.min(en.slowF || 1, o.slow); } if (o.pull) { const dx = x - en.x, dy = y - en.y, d = Math.hypot(dx, dy) || 1, m = en.boss ? 0.05 : 1; en.x += dx / d * o.pull * m * dt; en.y += dy / d * o.pull * m * dt; } if (o.root && !en.boss) en.stunT = Math.max(en.stunT, 0.2); }); if (tick <= 0) { tick = 0.3; forEnemiesInRadius(x, y, r, (en) => dealDamage(en, dps * 0.3, school, src, { quiet: true })); } addLight(x, y, r * 1.4, col, 0.4); },
    draw(g, e, k) { const a = Math.min(1, (1 - k) * 4) * (o.alpha || 0.45); g.save(); g.translate(x, y); g.scale(1, 0.6); g.globalAlpha = a; g.fillStyle = rg(g, 0, 0, r * 0.2, r, [0, rgba(col, 0.2), 0.8, rgba(col, 0.6), 1, rgba(col, 0)]); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); if (o.swirl) { g.strokeStyle = rgba('#ffffff', 0.5); g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, 0, r * (0.3 + i * 0.25), e.t * 4 + i, e.t * 4 + i + 2); g.stroke(); } } g.restore(); } });
}
// Symbole aus einfachen Formen
function symIcon(sym, col) {
  return function (g, glow) {
    glow(col, 30); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 4;
    const W = '#ffffff';
    if (sym === 'arrow') { g.rotate(-0.7); g.fillRect(-30, -2, 52, 4); g.beginPath(); g.moveTo(22, -8); g.lineTo(36, 0); g.lineTo(22, 8); g.fill(); g.fillStyle = W; g.fillRect(-34, -6, 8, 3); g.fillRect(-34, 3, 8, 3); }
    else if (sym === 'arrows') { for (let i = -1; i <= 1; i++) { g.save(); g.translate(i * 16, -10 + Math.abs(i) * 8); g.rotate(Math.PI / 2); g.fillRect(-20, -1.5, 36, 3); g.beginPath(); g.moveTo(16, -6); g.lineTo(26, 0); g.lineTo(16, 6); g.fill(); g.restore(); } }
    else if (sym === 'chain') { g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-30 + i * 12, 20 - i * 9, 7, 4, -0.6, 0, TAU); g.stroke(); } }
    else if (sym === 'blade') { g.rotate(-0.8); g.fillStyle = lg(g, 0, -44, 0, 20, [0, W, 1, col]); g.beginPath(); g.moveTo(-4, 20); g.lineTo(0, -44); g.lineTo(4, 20); g.fill(); g.fillStyle = '#c9a24c'; g.fillRect(-12, 20, 24, 4); g.fillRect(-2, 24, 4, 14); }
    else if (sym === 'crescent') { g.lineWidth = 8; g.beginPath(); g.arc(-10, 0, 30, -1.1, 1.1); g.stroke(); g.strokeStyle = W; g.lineWidth = 2; g.stroke(); }
    else if (sym === 'orb') { g.fillStyle = rg(g, -6, -6, 2, 24, [0, W, 0.4, col, 1, shade(col, -0.5)]); g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.fill(); }
    else if (sym === 'orbs') { for (const [x, y] of [[-16, 10], [0, -10], [16, 10]]) { g.fillStyle = rg(g, x - 3, y - 3, 1, 11, [0, W, 1, col]); g.beginPath(); g.arc(x, y, 11, 0, TAU); g.fill(); } }
    else if (sym === 'ring') { for (let i = 1; i <= 3; i++) { g.lineWidth = 5 - i; g.beginPath(); g.ellipse(0, 0, i * 12, i * 8, 0, 0, TAU); g.stroke(); } }
    else if (sym === 'spikes') { for (let i = 0; i < 4; i++) { const x = -27 + i * 18, h = 26 + (i % 2) * 14; g.fillStyle = lg(g, x, 30 - h, x, 30, [0, W, 1, col]); g.beginPath(); g.moveTo(x - 7, 30); g.lineTo(x, 30 - h); g.lineTo(x + 7, 30); g.fill(); } }
    else if (sym === 'wind') { g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-34, -14 + i * 14); g.bezierCurveTo(-10, -26 + i * 14, 10, -2 + i * 14, 34, -14 + i * 14); g.stroke(); } }
    else if (sym === 'tornado') { g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(i * 1.5, -28 + i * 11, 26 - i * 4, 5, 0, 0, TAU); g.stroke(); } }
    else if (sym === 'shield') { g.beginPath(); g.moveTo(0, -34); g.lineTo(26, -22); g.quadraticCurveTo(24, 16, 0, 34); g.quadraticCurveTo(-24, 16, -26, -22); g.closePath(); g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; g.strokeStyle = W; g.lineWidth = 2.5; g.stroke(); }
    else if (sym === 'drone') { g.fillRect(-14, -6, 28, 12); g.lineWidth = 2.5; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 14, 0); g.lineTo(s * 26, -10); g.stroke(); g.beginPath(); g.ellipse(s * 26, -12, 10, 3, 0, 0, TAU); g.stroke(); } g.fillStyle = '#ff3a3a'; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill(); }
    else if (sym === 'beam') { g.fillStyle = lg(g, 0, -10, 0, 10, [0, rgba(col, 0), 0.5, col, 1, rgba(col, 0)]); g.fillRect(-40, -10, 80, 20); g.fillStyle = W; g.fillRect(-40, -2, 80, 4); }
    else if (sym === 'swarm') { for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 6 + i * 1.5; g.fillRect(Math.cos(a) * r - 2, Math.sin(a) * r - 2, 4, 4); } }
    else if (sym === 'pillar') { g.fillStyle = lg(g, -12, 0, 12, 0, [0, rgba(col, 0), 0.5, W, 1, rgba(col, 0)]); g.fillRect(-12, -46, 24, 80); }
    else if (sym === 'star') { for (let i = 0; i < 3; i++) { g.save(); g.translate(-18 + i * 18, -10 + (i % 2) * 18); g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 10, a = k / 10 * TAU - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = W; g.fill(); g.restore(); } }
    else if (sym === 'needle') { g.rotate(-0.8); g.fillStyle = lg(g, 0, -44, 0, 44, [0, '#ffffff', 0.3, '#1a1a22', 1, '#000000']); g.beginPath(); g.moveTo(-5, 40); g.lineTo(0, -46); g.lineTo(5, 40); g.fill(); }
    else if (sym === 'fist') { g.beginPath(); g.ellipse(0, 0, 20, 16, 0, 0, TAU); g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-10 + i * 8, -12); g.lineTo(-10 + i * 8, 4); g.stroke(); } }
    else if (sym === 'hands') { for (let i = -1; i <= 1; i++) { g.save(); g.translate(i * 18, 10); g.fillStyle = '#1a0a2a'; g.beginPath(); g.moveTo(-6, 24); g.lineTo(-6, -10); g.lineTo(-10, -26); g.lineTo(-2, -14); g.lineTo(0, -30); g.lineTo(3, -14); g.lineTo(10, -24); g.lineTo(6, -8); g.lineTo(6, 24); g.fill(); g.strokeStyle = col; g.lineWidth = 1.5; g.stroke(); g.restore(); } }
    else if (sym === 'clone') { for (let i = 2; i >= 0; i--) { g.globalAlpha = 1 - i * 0.3; g.fillStyle = i ? shade(col, -0.4) : col; g.beginPath(); g.arc(-12 + i * 12, -18, 8, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-24 + i * 12, 28); g.quadraticCurveTo(-12 + i * 12, -14, i * 12, 28); g.fill(); } g.globalAlpha = 1; }
    else if (sym === 'pool') { g.scale(1, 0.6); g.fillStyle = rg(g, 0, 0, 4, 40, [0, W, 0.3, col, 1, rgba(col, 0)]); g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill(); }
    else if (sym === 'web') { g.lineWidth = 1.5; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 38, Math.sin(a) * 38); g.stroke(); } for (let r = 10; r <= 34; r += 12) { g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); } }
    else if (sym === 'eye') { g.beginPath(); g.ellipse(0, 0, 32, 16, 0, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill(); }
    else if (sym === 'plan') { g.strokeStyle = W; g.lineWidth = 2; g.strokeRect(-26, -30, 52, 60); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-18, -18 + i * 12); g.lineTo(18, -18 + i * 12); g.stroke(); } g.fillStyle = col; g.beginPath(); g.moveTo(10, 14); g.lineTo(24, 28); g.lineTo(28, 24); g.fill(); }
    else { g.beginPath(); g.arc(0, 0, 20, 0, TAU); g.fill(); }
  };
}
function evoCards(list) { for (const [id, name, school, tags, lv, sym, col] of list) { CARDS[id] = cardDef(name, school, tags, lv); ICON_EXTRA[id] = symIcon(sym, col); SRC_NAMES[id] = name; ABILITY_SCHOOL[id] = school; } }
function tier(name, txt, lv, hp, speed, armor, might, slots, col, grants, unlocks, desc, ev) { return { name, txt, lv, hp, speed, armor, might, slots, col, grants, unlocks, desc, ev }; }
const KHARN = (G) => G.miniKilled;

/* ============================================================ LENA GRIMM */
evoCards([
  ['bestienbogen', 'Bestienbogen', 'none', ['Fernkampf', 'Durchbohrend'], ['Pfeile auf den nächsten Gegner: 18 Schaden, +30 % gegen weit entfernte Gegner.', '+1 Pfeil.', '+35 % Schaden, durchbohren 2 Gegner.', 'Abklingzeit 0,65 s.', 'Splitterpfeil: jeder Treffer teilt sich in 3 kleine Pfeile.'], 'arrow', '#c8a0ff'],
  ['telestoss', 'Telekinese-Stoß', 'shadow', ['Rückstoß', 'Schutz'], ['Alle 3 s stößt Lena alles in der Nähe telekinetisch zurück: 14 Schaden.', '+35 % Schaden.', 'Größerer Umkreis.', 'Abklingzeit 2,2 s.', 'Gegner werden danach kurz festgehalten.'], 'ring', '#c8a0ff'],
  ['pfeilhagel', 'Pfeilhagel', 'none', ['Fläche', 'Fernkampf'], ['Alle 3,5 s regnen 8 Pfeile auf eine Gruppe: je 14 Schaden.', '+4 Pfeile.', '+35 % Schaden.', 'Abklingzeit 2,6 s.', 'Brandpfeile: der Boden brennt kurz.'], 'arrows', '#c8a0ff'],
  ['geisterketten', 'Geisterketten', 'shadow', ['Kontrolle', 'Kette'], ['Geisterketten fesseln 3 Gegner 1,5 s: 12 Schaden pro Sekunde.', '+2 Ketten.', '+50 % Schaden.', 'Abklingzeit 2,4 s.', 'Gefesselte Gegner nehmen +25 % Schaden.'], 'chain', '#e8e0ff'],
  ['honnariflamme', 'Honnari-Flammen', 'none', ['Fernkampf', 'Heilung'], ['Flammenkugeln im Wechsel: rote explodieren (26 Schaden), grüne heilen dich um 3.', '+35 % Schaden.', '+1 Flammenkugel.', 'Abklingzeit 1,2 s.', 'Grüne Flammen heilen 6 und hinterlassen einen heilenden Kreis.'], 'orb', '#ff7a3a'],
  ['flammenfalke', 'Flammenvogel', 'none', ['Zielsuchend', 'Explosion'], ['Alle 3 s jagt ein Vogel aus Honnari-Feuer einen Gegner: 45 Schaden, explodiert.', '+1 Vogel.', '+35 % Schaden.', 'Abklingzeit 2,2 s.', 'Der Vogel fliegt nach der Explosion weiter zum nächsten Ziel.'], 'orb', '#ffb040']
]);
function tickBestienbogen(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 380, 1 + (L >= 2 ? 1 : 0)); if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 0.65 : 0.9); const base = 18 * (L >= 3 ? 1.35 : 1);
  tg.forEach((e) => { const a = Math.atan2(e.y - p.y, e.x - p.x), far = Math.hypot(e.x - p.x, e.y - p.y) > 160 ? 1.3 : 1; castAnim(p, a, 0.18);
    shot(p.x, p.y - 4, a, 640, base * far, 'none', 'bestienbogen', { col: '#e8e0ff', size: 8, pierce: L >= 3 ? 2 : 0, onHit: L >= 5 ? (en, pr) => { if (pr.split) return; pr.split = 1; for (let k = -1; k <= 1; k++) shot(en.x, en.y, a + k * 0.5, 480, base * 0.4, 'none', 'bestienbogen', { col: '#e8e0ff', size: 5, life: 0.4 }); } : null }); });
  sfx('whip', 0, 0.04);
}
function tickTelestoss(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 110)) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 2.2 : 3); const r = (L >= 3 ? 150 : 115) * p.st.area;
  blast(p.x, p.y, r, 14 * (L >= 2 ? 1.35 : 1), 'shadow', 'telestoss', { col: '#c8a0ff', kb: 420, stun: L >= 5 ? 0.8 : 0, shake: 2, sfx: 'palm' });
}
function arrowRain(x, y, n, r, dmg, src, fire) {
  for (let i = 0; i < n; i++) GAME.later(i * 0.04, () => { const ax = x + rand(-r, r), ay = y + rand(-r, r) * 0.6;
    addEffect({ x: ax, y: ay, dur: 0.22, layer: 2, draw(g, e, k) { const yy = lerp(ay - 260, ay - 8, easeIn(k)); g.strokeStyle = '#e8e0ff'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax - 4, yy - 26); g.lineTo(ax, yy); g.stroke(); },
      update(e) { if (e.t + 1 / 60 >= e.dur && !e.done) { e.done = true; forEnemiesInRadius(ax, ay, 26, (en) => dealDamage(en, dmg, 'none', src, { kb: 30, kx: 0, ky: 1, quiet: true })); burstSparks(ax, ay, 3, '#e8e0ff', 0.4); if (fire) zone(ax, ay, 24, 1.2, 8, 'none', src, '#ff7a3a'); } } }); });
}
function tickPfeilhagel(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = randomEnemyNear(p.x, p.y, 320); if (!e) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 2.6 : 3.5); castAnim(p, -Math.PI / 2, 0.3); sfx('whip');
  arrowRain(e.x, e.y, 8 + (L >= 2 ? 4 : 0), 60, 14 * (L >= 3 ? 1.35 : 1), 'pfeilhagel', L >= 5);
}
function tickGeisterketten(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 280, 3 + (L >= 2 ? 2 : 0)); if (!tg.length) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.4 : 3.2); const dps = 12 * (L >= 3 ? 1.5 : 1);
  sfx('chain', 0, 0.08);
  tg.forEach((en) => { if (!en.boss) en.stunT = Math.max(en.stunT, 1.5 * (en.mini ? 0.3 : 1)); if (L >= 5) { en.vulnT = GAME.t + 1.5; en.vulnM = 1.25; } tetherFx(en, 1.5, '#e8e0ff', 12); let tick = 0; addEffect({ x: 0, y: 0, dur: 1.5, update(e, d) { tick -= d; if (tick <= 0 && !en.dead) { tick = 0.3; dealDamage(en, dps * 0.3, 'shadow', 'geisterketten', { quiet: true }); } } }); });
}
function tickHonnariflamme(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 320, 1 + (L >= 3 ? 1 : 0)); if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.2 : 1.6); const dmg = 26 * (L >= 2 ? 1.35 : 1);
  tg.forEach((e) => { ab.n = (ab.n || 0) + 1; const green = ab.n % 3 === 0, a = Math.atan2(e.y - p.y, e.x - p.x); castAnim(p, a, 0.2);
    shot(p.x, p.y - 4, a, 380, green ? 0 : dmg * 0.3, 'none', 'honnariflamme', { col: green ? '#6aff8a' : '#ff5a2a', shape: 'ball', size: 9, home: true, onEnd: (x, y) => { if (green) { healPlayer(L >= 5 ? 6 : 3); fxRing(x, y, 10, 60, 0.3, '#6aff8a', 4); if (L >= 5) zone(x, y, 50, 2, 0, 'none', 'honnariflamme', '#6aff8a'); } else blast(x, y, 55 * p.st.area, dmg, 'none', 'honnariflamme', { col: '#ff7a3a', kb: 120, shake: 1 }); } }); });
  sfx('flame', 0, 0.05);
}
function firebird(x, y, target, dmg, hops) {
  let tg = target; const hit = new Set();
  addEffect({ x, y, vx: 0, vy: -200, dur: 3, layer: 2, update(e, dt) { if (!tg || tg.dead) tg = nearestEnemy(e.x, e.y, 320, hit); if (!tg) { e.dead = true; return; } const a = Math.atan2(tg.y - e.y, tg.x - e.x), cur = Math.atan2(e.vy, e.vx), na = cur + clamp(angDiff(cur, a), -7 * dt, 7 * dt); e.vx = Math.cos(na) * 360; e.vy = Math.sin(na) * 360; e.x += e.vx * dt; e.y += e.vy * dt;
      if (dist2(e.x, e.y, tg.x, tg.y) < 400) { hit.add(tg.id); blast(e.x, e.y, 70, dmg, 'none', 'flammenfalke', { col: '#ffb040', kb: 180, shake: 2 }); if (hops-- > 0) tg = null; else e.dead = true; }
      if (Math.random() < 0.8) spawnPart({ x: e.x, y: e.y, z: 14, vx: rand(-20, 20), vy: rand(-20, 20), vz: 20, g: -30, life: 0.4, size: 5, size1: 1, spr: glowSprite('#ff8a2a'), alpha: 0.9, alpha1: 0 }); addLight(e.x, e.y, 80, '#ff8a2a', 0.8); },
    draw(g, e) { const a = Math.atan2(e.vy, e.vx), fl = Math.sin(e.t * 30) * 0.5; g.save(); g.translate(e.x, e.y - 14); g.rotate(a); g.globalCompositeOperation = 'lighter'; g.fillStyle = '#ffb040'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-6, s * (14 + fl * 6), -16, s * (10 + fl * 4)); g.lineTo(-6, 0); g.fill(); } g.fillStyle = '#fff0c0'; g.beginPath(); g.ellipse(0, 0, 8, 3.5, 0, 0, TAU); g.fill(); g.drawImage(glowSprite('#ff8a2a'), -20, -20, 40, 40); g.restore(); } });
}
function tickFlammenfalke(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 360, 1 + (L >= 2 ? 1 : 0)); if (!tg.length) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.2 : 3); sfx('flame');
  tg.forEach((e) => firebird(p.x, p.y - 20, e, 45 * (L >= 3 ? 1.35 : 1), L >= 5 ? 2 : 0));
}
Object.assign(TICKS, { bestienbogen: tickBestienbogen, telestoss: tickTelestoss, pfeilhagel: tickPfeilhagel, geisterketten: tickGeisterketten, honnariflamme: tickHonnariflamme, flammenfalke: tickFlammenfalke });
ULTS.honnarierwachen = function (p) { sfx('ult'); shake(8); castAnim(p, -Math.PI / 2, 0.6); radial(12, (a, i) => GAME.later(i * 0.03, () => fireball(GAME.p.x, GAME.p.y - 4, a, 35, 5))); healPlayer(p.st.maxHp * 0.25); fxRing(p.x, p.y, 10, 200, 0.6, '#6aff8a', 10); };
ICON_EXTRA.honnarierwachen = symIcon('orb', '#6aff8a');
defineEvoHero('lena', {
  name: 'Lena Grimm', title: 'Bogen, Geisterketten und Honnari-Feuer', school: 'none', diff: 2,
  role: 'Fernkampf · Kontrolle · Heilung', dodgeCd: 2.2, dodge: 'roll',
  mech: { name: 'Scharfes Auge', desc: 'Lena beginnt mit ihrem Bestienbogen und schwacher Telekinese. Im Lauf wächst ihre Telekinese, sie wird zur Agentin mit Geisterketten und verwandelt sich schließlich in eine Honnari: Flammen, die je nach Farbe explodieren oder heilen. Pfeile machen 30 % mehr Schaden gegen weit entfernte Gegner.' },
  ult: { id: 'honnarierwachen', name: 'Honnari-Erwachen', cd: 18, desc: 'Ein Kranz aus zwölf Feuerbällen und grüne Flammen, die ein Viertel deines Lebens heilen.' },
  strengths: ['Starker Fernkampf', 'Hält Gegner auf Abstand', 'Heilt sich später'], weaknesses: ['Wenig Leben', 'Schwach im Gedränge', 'Nahkampf fehlt'],
  builds: [{ name: 'Scharfschützin', desc: 'Bestienbogen + Pfeilhagel: aus der Ferne alles durchbohren.' }, { name: 'Honnari', desc: 'Honnari-Flammen + Flammenvogel: Feuer, das heilt und explodiert.' }, { name: 'Kettenwächterin', desc: 'Geisterketten + Telekinese-Stoß: niemand kommt nah heran.' }],
  tiers: [
    tier('Bogenschützin', '', 0, 95, 172, 0, 1, 2, '#c8a0ff', ['bestienbogen'], ['bestienbogen', 'pfeilhagel'], 'Bestienbogen und eine schwache Telekinese.'),
    tier('Telekinetin', 'Stufe 6', 6, 115, 178, 0, 1.15, 3, '#d8b8ff', ['telestoss'], ['telestoss'], 'Ihre Telekinese wird stärker.'),
    tier('Agentin 84', 'Stufe 13', 13, 140, 184, 1, 1.35, 4, '#e8e0ff', ['geisterketten'], ['geisterketten'], 'Die geheime Agentin zeigt, was sie kann: Geisterketten.'),
    tier('Honnari', 'Stufe 21', 21, 170, 190, 1, 1.55, 5, '#ff7a3a', ['honnariflamme'], ['honnariflamme'], 'Die Verwandlung: Flammen, deren Farbe ihrem Gefühl folgt.'),
    tier('Flammenherz', 'Stufe 29 oder einen Zwischenboss besiegen', 29, 200, 198, 2, 1.8, 6, '#ffb040', ['flammenfalke'], ['flammenfalke'], 'Sie formt ihre Flammen zu Gestalten.', KHARN)
  ],
  passives: ['lebensraub'],
  art: { base: 'liora', fn: drawLiora, spec: SPEC_LIORA, h: 64, look: { weapon: 'bow', rage: 0 }, pals: [
    { coat: '#3a2a5a', coatL: '#6a4a9a', coatD: '#1a1028', hair: '#2a1a3a', hairL: '#8a5aba', eye: '#c8a0ff', rim: '#c8a0ff' },
    { coat: '#3a2a5a', coatL: '#7a5aaa', coatD: '#1a1028', hair: '#2a1a3a', hairL: '#8a5aba', eye: '#d8b8ff', rim: '#d8b8ff' },
    { coat: '#1a1a24', coatL: '#4a4a5a', coatD: '#08080c', hair: '#2a1a3a', hairL: '#8a5aba', eye: '#e8e0ff', rim: '#e8e0ff' },
    { coat: '#5a1a0a', coatL: '#aa4a1a', coatD: '#2a0a04', hair: '#8a2a0a', hairL: '#ff7a3a', eye: '#ffb040', rim: '#ff7a3a' },
    { coat: '#6a2a0a', coatL: '#d86a1a', coatD: '#2a0a04', hair: '#ff8a3a', hairL: '#ffd080', eye: '#fff0c0', rim: '#ffb040' }
  ] }
});

/* ============================================================ FABIAN SCHNEIDER */
evoCards([
  ['kopieeis', 'Kopiertes Eis', 'none', ['Fläche', 'Eis'], ['Per Handschlag kopiertes Eis: alle 2,6 s eine Frostwelle um Fabian, 20 Schaden, Gegner erstarren kurz.', '+35 % Schaden.', 'Größere Welle.', 'Abklingzeit 1,9 s.', 'Eisspitzen brechen danach aus dem Boden.'], 'ring', '#9ad8ff'],
  ['ratenschlag', 'Ratens Schlagfolge', 'none', ['Nahkampf', 'Schnell'], ['Raten bricht durch: drei blitzschnelle Schläge, je 14 Schaden.', '+2 Schläge.', '+35 % Schaden.', 'Abklingzeit 0,8 s.', 'Der letzte Schlag schleudert Gegner weit weg.'], 'fist', '#ff5a5a'],
  ['geisterspeer', 'Geisterspeer', 'shadow', ['Fernkampf', 'Durchbohrend'], ['Ein Geisterspeer durchbohrt alles in einer Linie: 36 Schaden.', '+35 % Schaden.', 'Zwei Speere.', 'Abklingzeit 1,6 s.', 'Verstärkt: der Speer ist doppelt so breit und betäubt.'], 'needle', '#c8d0ff'],
  ['kopiefeuer', 'Kopiertes Feuer', 'none', ['Bewegung', 'Feuer'], ['Flammenantrieb: Fabian schießt durch die Gegner und hinterlässt eine Feuerspur, 30 Schaden.', '+35 % Schaden.', 'Längerer Sprint.', 'Abklingzeit 2,4 s.', 'Die Feuerspur brennt weiter.'], 'wind', '#ff8a3a'],
  ['kopieregeneration', 'Kopierte Regeneration', 'none', ['Heilung', 'Überleben'], ['Alle 4 s heilt Fabian 4 % seines Lebens.', 'Heilt 5 %.', 'Heilt 6 %, dazu 1 s halber Schaden.', 'Abklingzeit 3 s.', 'Heilt 8 %.'], 'shield', '#6aff8a'],
  ['bladeschwur', 'Blade-Schwur', 'none', ['Fläche', 'Kombo'], ['Als Oberhaupt der Blades: alle 5 s entlädt er Feuer, Eis und Geisterspeere gleichzeitig um sich.', '+35 % Schaden.', 'Größerer Radius.', 'Abklingzeit 3,8 s.', 'Doppelt: der Schwur wird sofort wiederholt.'], 'star', '#ffd27a']
]);
function tickKopieeis(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 120)) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.9 : 2.6); const r = (L >= 3 ? 130 : 100) * p.st.area;
  blast(p.x, p.y, r, 20 * (L >= 2 ? 1.35 : 1), 'none', 'kopieeis', { col: '#bfe8ff', freeze: 0.6, kb: 80, shake: 1 });
  if (L >= 5) for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; spikeFx(p.x + Math.cos(a) * r * 0.8, p.y + Math.sin(a) * r * 0.55, 14, '#9ad8ff', 40); forEnemiesInRadius(p.x + Math.cos(a) * r * 0.8, p.y + Math.sin(a) * r * 0.55, 26, (o) => dealDamage(o, 12, 'none', 'kopieeis', { quiet: true })); }
}
function tickRatenschlag(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 100); if (!e) { ab.t = 0.15; return; }
  ab.t = cdOf(L >= 4 ? 0.8 : 1.1); const n = 3 + (L >= 2 ? 2 : 0), a = Math.atan2(e.y - p.y, e.x - p.x), dmg = 14 * (L >= 3 ? 1.35 : 1);
  for (let i = 0; i < n; i++) GAME.later(i * 0.06, () => arcSweep(GAME.p, a + rand(-0.4, 0.4), 70 * GAME.p.st.area, 1.2, dmg, 'none', 'ratenschlag', '#ff7a7a', { kb: i === n - 1 && L >= 5 ? 420 : 60, dir: i % 2 ? 1 : -1, sfx: 'hit' }));
}
function tickGeisterspeer(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 330); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.6 : 2.2); const a = Math.atan2(e.y - p.y, e.x - p.x), dmg = 36 * (L >= 2 ? 1.35 : 1), w = L >= 5 ? 22 : 11;
  castAnim(p, a, 0.25);
  beam(p.x, p.y, a, 330, w, dmg, 'shadow', 'geisterspeer', '#c8d0ff', { stun: L >= 5 ? 0.5 : 0 });
  if (L >= 3) GAME.later(0.12, () => beam(GAME.p.x, GAME.p.y, a + 0.25, 300, w, dmg * 0.8, 'shadow', 'geisterspeer', '#c8d0ff'));
}
function tickKopiefeuer(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 220); if (!e) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.4 : 3.2); const a = Math.atan2(e.y - p.y, e.x - p.x), len = (L >= 3 ? 190 : 140), dmg = 30 * (L >= 2 ? 1.35 : 1);
  const x0 = p.x, y0 = p.y;
  beam(x0, y0, a, len, 20, dmg, 'none', 'kopiefeuer', '#ff8a3a', { kb: 180, sfx: 'flame' });
  p.kvx += Math.cos(a) * len * 4.5; p.kvy += Math.sin(a) * len * 4.5; p.iframes = Math.max(p.iframes, 0.3);
  for (let i = 1; i <= 4; i++) zone(x0 + Math.cos(a) * len * i / 4, y0 + Math.sin(a) * len * i / 4 * 0.9, 26, L >= 5 ? 2.5 : 0.8, 10, 'none', 'kopiefeuer', '#ff6a1a');
}
function tickKopieregeneration(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 3 : 4);
  healPlayer(p.st.maxHp * [0.04, 0.05, 0.06, 0.06, 0.08][L - 1]); fxRing(p.x, p.y, 8, 50, 0.3, '#6aff8a', 3);
  if (L >= 3) shieldFx(p, 1, '#6aff8a');
}
function tickBladeschwur(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 200)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 3.8 : 5); const r = (L >= 3 ? 190 : 150) * p.st.area, dmg = 34 * (L >= 2 ? 1.35 : 1);
  const vow = () => { const q = GAME.p; blast(q.x, q.y, r, dmg, 'none', 'bladeschwur', { col: '#ffd27a', freeze: 0.5, kb: 220, shake: 4 }); radial(6, (a) => beam(q.x, q.y, a, r * 1.3, 10, dmg * 0.6, 'shadow', 'bladeschwur', '#c8d0ff')); };
  vow(); if (L >= 5) GAME.later(0.5, vow);
}
Object.assign(TICKS, { kopieeis: tickKopieeis, ratenschlag: tickRatenschlag, geisterspeer: tickGeisterspeer, kopiefeuer: tickKopiefeuer, kopieregeneration: tickKopieregeneration, bladeschwur: tickBladeschwur });
ULTS.rollentausch = function (p) { sfx('ult'); shake(7); p.frenzyT = GAME.t + 6; p.ultT = 6; blast(p.x, p.y, 160, 30, 'none', 'rollentausch', { col: '#ff5a5a', kb: 260 }); UI.toast('Raten übernimmt: alle Fähigkeiten doppelt so schnell'); };
ICON_EXTRA.rollentausch = symIcon('clone', '#ff5a5a');
defineEvoHero('fabian', {
  name: 'Fabian Schneider', title: 'Der Kopierer — und Raten', school: 'none', diff: 2,
  role: 'Kopierte Kräfte · Nahkampf · Heilung', dodgeCd: 2.4, dodge: 'roll',
  mech: { name: 'Drei in einem Körper', desc: 'Fabian kopiert Fähigkeiten per Berührung — zuerst Eis. Im Lauf bricht Raten durch (blitzschnelle Schläge, Geisterspeere), Fabian kopiert Feuer und Regeneration und wird zum Oberhaupt der Blades. Spezial: Raten übernimmt, alle Fähigkeiten laufen doppelt so schnell.' },
  ult: { id: 'rollentausch', name: 'Raten übernimmt', cd: 20, desc: '6 s lang laufen alle Fähigkeiten doppelt so schnell.' },
  strengths: ['Vielseitig', 'Heilt sich', 'Stark im Nahkampf'], weaknesses: ['Wenig Reichweite am Anfang', 'Mittleres Leben', 'Spezial braucht lange'],
  builds: [{ name: 'Raten', desc: 'Ratens Schlagfolge + Kopiertes Feuer: mitten hinein.' }, { name: 'Kopierer', desc: 'Kopiertes Eis + Geisterspeer + Blade-Schwur.' }, { name: 'Unkaputtbar', desc: 'Kopierte Regeneration + Vampirblut.' }],
  tiers: [
    tier('Fabian', '', 0, 110, 170, 1, 1, 2, '#ffd27a', ['kopieeis'], ['kopieeis', 'kopieregeneration'], 'Eine kopierte Fähigkeit: Eis.'),
    tier('Raten bricht durch', 'Stufe 6', 6, 130, 178, 1, 1.15, 3, '#ff5a5a', ['ratenschlag'], ['ratenschlag'], 'Die zweite Persönlichkeit übernimmt die Fäuste.'),
    tier('Geisterspeere', 'Stufe 13', 13, 155, 184, 1, 1.35, 4, '#c8d0ff', ['geisterspeer'], ['geisterspeer'], 'Raten wirft Geisterspeere.'),
    tier('Drei Kopien', 'Stufe 21', 21, 180, 190, 2, 1.55, 5, '#ff8a3a', ['kopiefeuer'], ['kopiefeuer'], 'Feuer, Eis und Regeneration zugleich.'),
    tier('Blade-Oberhaupt', 'Stufe 29 oder einen Zwischenboss besiegen', 29, 210, 196, 2, 1.8, 6, '#ffd27a', ['bladeschwur'], ['bladeschwur'], 'Er steht für seine Familie ein.', KHARN)
  ],
  passives: ['lebensraub'],
  art: { base: 'vorian', fn: drawVorian, spec: SPEC_VORIAN, h: 66, look: { glow: 0, plain: true }, pals: [
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#1a2436', armorL: '#3a4a6a', armorD: '#080c14', red: '#2a3a6a', redL: '#ffd27a', redD: '#10182a', hair: '#e8cf7a', eye: '#ffd27a', rim: '#ffd27a' },
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#2a1418', armorL: '#5a2a30', armorD: '#10060a', red: '#8a1a1a', redL: '#ff5a5a', redD: '#2a0808', hair: '#e8cf7a', eye: '#ff5a5a', rim: '#ff5a5a' },
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#1a2030', armorL: '#3a4a6a', armorD: '#080c14', red: '#5a6a9a', redL: '#c8d0ff', redD: '#1a2030', hair: '#e8cf7a', eye: '#c8d0ff', rim: '#c8d0ff' },
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#2a1a10', armorL: '#6a3a1a', armorD: '#100804', red: '#aa4a1a', redL: '#ff8a3a', redD: '#2a1006', hair: '#e8cf7a', eye: '#ff8a3a', rim: '#ff8a3a' },
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#14141c', armorL: '#3a3a4a', armorD: '#060608', red: '#8a6a2a', redL: '#ffd27a', redD: '#2a2008', hair: '#f4e0a0', eye: '#ffd27a', rim: '#ffd27a' }
  ] }
});

/* ============================================================ FEX SANGUINI */
evoCards([
  ['faeden', 'Unsichtbare Fäden', 'blood', ['Kette', 'Verlangsamung'], ['Fast unsichtbare Fäden schneiden durch 3 Gegner: 14 Schaden, verlangsamen.', '+2 Fäden.', '+35 % Schaden.', 'Abklingzeit 0,8 s.', 'Die Fäden springen weiter zum nächsten Gegner.'], 'web', '#ff9aaa'],
  ['blutbarriere', 'Blutbarriere', 'blood', ['Schutz'], ['Alle 7 s eine Blutbarriere: 2 s lang nur 35 % Schaden.', 'Hält 2,5 s.', 'Beim Aufbau werden Gegner weggestoßen (20 Schaden).', 'Abklingzeit 5 s.', 'Hält 3,5 s.'], 'shield', '#ff3a4e'],
  ['marionette', 'Marionette', 'blood', ['Kontrolle', 'Fläche'], ['Fex hängt einen Gegner an seine Fäden: 3 s lang schlägt er um sich und verletzt seine Nachbarn (16 Schaden pro Schlag).', '+1 Marionette.', '+40 % Schaden.', 'Abklingzeit 3 s.', 'Am Ende reißen die Fäden die Marionette entzwei.'], 'chain', '#ff6a7a'],
  ['blutfaeden', 'Blutfäden', 'blood', ['Fläche', 'Dauer'], ['Ein Netz aus blutverstärkten Fäden spannt sich zwischen Gegnern: 3 s lang 12 Schaden pro Sekunde.', '+35 % Schaden.', 'Größeres Netz.', 'Abklingzeit 2,6 s.', 'Das Netz hält Gegner fest.'], 'web', '#ff3a4e'],
  ['fadenfalle', 'Fadenfalle', 'blood', ['Falle', 'Kontrolle'], ['Alle 4 s spannt Fex eine Falle: wer hineinläuft, wird festgehalten und nimmt 20 Schaden pro Sekunde.', '+1 Falle.', 'Größere Fallen.', 'Abklingzeit 3 s.', 'Fallen ziehen Gegner an.'], 'web', '#c8203a'],
  ['blutnadel', 'Blutnadel', 'blood', ['Fernkampf', 'Durchbohrend'], ['Seine Blutwaffe: eine riesige schwarze Glasnadel durchbohrt alles, 70 Schaden.', '+35 % Schaden.', 'Zwei Nadeln.', 'Abklingzeit 2,0 s.', 'Die Nadel zerspringt am Ende in Splitter.'], 'needle', '#ff3a4e']
]);
function tickFaeden(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 280, 3 + (L >= 2 ? 2 : 0)); if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 0.8 : 1.1); const dmg = 14 * (L >= 3 ? 1.35 : 1);
  tg.forEach((en) => { tetherFx(en, 0.18, '#ffc8d0', 4); dealDamage(en, dmg, 'blood', 'faeden', { kb: 20, kx: en.x - p.x, ky: en.y - p.y, norm: true }); en.slowT = Math.max(en.slowT, 1.2); en.slowF = Math.min(en.slowF || 1, 0.6);
    if (L >= 5) { const n2 = nearestEnemy(en.x, en.y, 120, new Set(tg.map((t) => t.id))); if (n2) { lightningLine([[en.x, en.y], [n2.x, n2.y]], '#ffc8d0'); dealDamage(n2, dmg * 0.6, 'blood', 'faeden', { quiet: true }); } } });
  sfx('whip', 0, 0.03);
}
function tickBlutbarriere(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 5 : 7); shieldFx(p, L >= 5 ? 3.5 : L >= 2 ? 2.5 : 2, '#ff3a4e'); sfx('nova', 0, 0.08);
  if (L >= 3) blast(p.x, p.y, 90 * p.st.area, 20, 'blood', 'blutbarriere', { col: '#ff3a4e', kb: 300, shake: 1 });
}
function tickMarionette(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 260, 1 + (L >= 2 ? 1 : 0)).filter((e) => !e.boss); if (!tg.length) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 3 : 4.5); const dmg = 16 * (L >= 3 ? 1.4 : 1);
  tg.forEach((en) => { en.stunT = Math.max(en.stunT, 3); tetherFx(en, 3, '#ff6a7a', 8); let tick = 0;
    addEffect({ x: 0, y: 0, dur: 3, update(e, d) { if (en.dead) { e.dead = true; return; } tick -= d; if (tick <= 0) { tick = 0.45; en.face = -en.face || 1; forEnemiesInRadius(en.x, en.y, 60, (o) => { if (o !== en) dealDamage(o, dmg, 'blood', 'marionette', { kb: 120, kx: o.x - en.x, ky: o.y - en.y, norm: true }); }); burstSparks(en.x, en.y - 14, 4, '#ff6a7a', 0.6); } if (e.t + d >= e.dur && L >= 5) dealDamage(en, dmg * 4, 'blood', 'marionette', {}); } }); });
}
function tickBlutfaeden(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, L >= 3 ? 260 : 200, 8); if (tg.length < 2) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 2.6 : 3.4); const dps = 12 * (L >= 2 ? 1.35 : 1); let tick = 0;
  addEffect({ x: 0, y: 0, dur: 3, layer: 2, update(e, d) { tick -= d; if (tick <= 0) { tick = 0.3; for (const en of tg) if (!en.dead) { dealDamage(en, dps * 0.3, 'blood', 'blutfaeden', { quiet: true }); if (L >= 5 && !en.boss) en.stunT = Math.max(en.stunT, 0.35); } } },
    draw(g, e, k) { const live = tg.filter((t) => !t.dead); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7 * (1 - k); g.strokeStyle = '#ff3a4e'; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length && j < i + 3; j++) { g.moveTo(live[i].x, live[i].y - 12); g.lineTo(live[j].x, live[j].y - 12); } g.stroke(); g.restore(); } });
  sfx('chain', 0, 0.06);
}
function tickFadenfalle(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 3 : 4); const n = 1 + (L >= 2 ? 1 : 0), r = (L >= 3 ? 70 : 52) * p.st.area;
  for (let i = 0; i < n; i++) { const e = randomEnemyNear(p.x, p.y, 240); const x = e ? e.x : p.x + rand(-100, 100), y = e ? e.y : p.y + rand(-80, 80); zone(x, y, r, 4, 20, 'blood', 'fadenfalle', '#c8203a', { root: true, pull: L >= 5 ? 90 : 0, alpha: 0.35, swirl: true }); }
}
function tickBlutnadel(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 340); if (!e) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.0 : 2.8); const a = Math.atan2(e.y - p.y, e.x - p.x), dmg = 70 * (L >= 2 ? 1.35 : 1);
  const fire = (aa) => shot(p.x, p.y - 4, aa, 620, dmg, 'blood', 'blutnadel', { col: '#1a1a22', size: 16, pierce: 99, life: 0.8, onEnd: L >= 5 ? (x, y) => radial(8, (b) => shot(x, y, b, 420, dmg * 0.25, 'blood', 'blutnadel', { col: '#ff3a4e', size: 5, life: 0.4 })) : null });
  castAnim(p, a, 0.3); fire(a); if (L >= 3) GAME.later(0.12, () => fire(a + 0.2)); sfx('whip');
}
Object.assign(TICKS, { faeden: tickFaeden, blutbarriere: tickBlutbarriere, marionette: tickMarionette, blutfaeden: tickBlutfaeden, fadenfalle: tickFadenfalle, blutnadel: tickBlutnadel });
ULTS.fadenkaefig = function (p) { sfx('ult'); shake(8); const tg = nearestEnemies(p.x, p.y, 300, 30); tg.forEach((en) => { tetherFx(en, 1, '#ff3a4e', 10); if (!en.boss) { en.stunT = Math.max(en.stunT, 1.2); en.kvx += (p.x - en.x) * 4; en.kvy += (p.y - en.y) * 4; } }); GAME.later(1, () => blast(GAME.p.x, GAME.p.y, 150, 70, 'blood', 'fadenkaefig', { col: '#ff3a4e', kb: 300, shake: 7 })); };
ICON_EXTRA.fadenkaefig = symIcon('web', '#ff3a4e');
defineEvoHero('fex', {
  name: 'Fex Sanguini', title: 'Der Fadenspieler', school: 'blood', diff: 2,
  role: 'Fäden · Kontrolle · Blutbarriere', dodgeCd: 2.0, dodge: 'shadowstep',
  mech: { name: 'Familie Sanguini', desc: 'Fex ist ein Vampir der dreizehnten Familie und kämpft mit fast unsichtbaren Fäden. Im Lauf lernt er die Blutbarriere, macht Gegner zu Marionetten, verstärkt seine Fäden mit Blut und erweckt schließlich seine Blutwaffe, eine riesige schwarze Nadel.' },
  ult: { id: 'fadenkaefig', name: 'Fadenkäfig', cd: 18, desc: 'Fäden packen jeden Gegner in der Nähe, zerren alle zu Fex und zerquetschen sie.' },
  strengths: ['Viel Kontrolle', 'Blutbarriere schützt', 'Gegner kämpfen gegeneinander'], weaknesses: ['Wenig Einzelschaden am Anfang', 'Mittleres Leben', 'Blutwaffe kommt spät'],
  builds: [{ name: 'Puppenspieler', desc: 'Marionette + Blutfäden: die Horde zerfleischt sich selbst.' }, { name: 'Fallensteller', desc: 'Fadenfalle + Unsichtbare Fäden.' }, { name: 'Blutwaffe', desc: 'Blutnadel + Blutbarriere + Lebensraub.' }],
  tiers: [
    tier('Fex', '', 0, 105, 176, 0, 1, 2, '#ff9aaa', ['faeden'], ['faeden', 'fadenfalle'], 'Fast unsichtbare Fäden.'),
    tier('Blutbarriere', 'Stufe 6', 6, 125, 182, 1, 1.15, 3, '#ff3a4e', ['blutbarriere'], ['blutbarriere'], 'Eine Wand aus Blut.'),
    tier('Puppenspieler', 'Stufe 13', 13, 150, 188, 1, 1.35, 4, '#ff6a7a', ['marionette'], ['marionette'], 'Wen seine Fäden halten, der tanzt für ihn.'),
    tier('Blutfäden', 'Stufe 21', 21, 175, 194, 2, 1.55, 5, '#ff3a4e', ['blutfaeden'], ['blutfaeden'], 'Blutverstärkte Fäden, rot wie seine Familie.'),
    tier('Blutwaffe', 'Stufe 29 oder einen Zwischenboss besiegen', 29, 205, 200, 2, 1.8, 6, '#c8203a', ['blutnadel'], ['blutnadel'], 'Aus seinem eigenen Kristall entsteht eine Waffe.', KHARN)
  ],
  passives: ['lebensraub', 'kettenreaktion'],
  art: { base: 'nyx', fn: drawNyx, spec: SPEC_NYX, h: 58, look: { flow: 0.4 }, pals: [
    { cloak: '#2a0a14', cloakL: '#6a1a2a', cloakD: '#10040a', scarf: '#8a0a1e', scarfL: '#ff9aaa', eye: '#ff4a6a', rim: '#ff9aaa' },
    { cloak: '#2a0a14', cloakL: '#6a1a2a', cloakD: '#10040a', scarf: '#8a0a1e', scarfL: '#ff3a4e', eye: '#ff4a6a', rim: '#ff3a4e' },
    { cloak: '#3a0a18', cloakL: '#7a1a30', cloakD: '#14040a', scarf: '#aa1a2e', scarfL: '#ff6a7a', eye: '#ff6a7a', rim: '#ff6a7a' },
    { cloak: '#4a0a14', cloakL: '#9a1a2a', cloakD: '#1a0408', scarf: '#c01a2e', scarfL: '#ff3a4e', eye: '#ff3a4e', rim: '#ff3a4e' },
    { cloak: '#0a0a0e', cloakL: '#2a2a34', cloakD: '#000000', scarf: '#c8203a', scarfL: '#ff3a4e', eye: '#ff2a3a', rim: '#c8203a' }
  ] }
});

/* ============================================================ LEO */
evoCards([
  ['katana', 'Bestienkatana', 'none', ['Nahkampf', 'Präzise'], ['Blitzschnelle, genaue Schnitte: 26 Schaden in einem langen, schmalen Bogen.', '+35 % Schaden.', 'Doppelschnitt.', 'Abklingzeit 0,75 s.', 'Kritische Schnitte: jeder dritte Schnitt trifft doppelt.'], 'blade', '#e8e8f0'],
  ['iaido', 'Iai-Schnitt', 'none', ['Linie', 'Einschlag'], ['Alle 3 s zieht Leo blank: ein Schnitt durch alle Gegner in einer Linie, 45 Schaden.', '+35 % Schaden.', 'Längere Linie.', 'Abklingzeit 2,2 s.', 'Zwei Schnitte im Kreuz.'], 'beam', '#ffffff'],
  ['aurensicht', 'Aurensicht', 'qi', ['Schutz', 'Konter'], ['Leo sieht Auren statt Augen: alle 7 s wehrt er den nächsten Treffer ab und kontert im Kreis (30 Schaden).', 'Konter +50 %.', 'Abklingzeit 5 s.', 'Konter +100 %.', 'Abklingzeit 3,5 s.'], 'eye', '#9affe6'],
  ['qiklinge', 'Qi-Klinge', 'qi', ['Fernkampf', 'Durchbohrend'], ['Qi in der Klinge: eine Schnittwelle fliegt weit nach vorn, 34 Schaden.', '+35 % Schaden.', 'Zwei Wellen.', 'Abklingzeit 1,4 s.', 'Die Wellen kehren zurück.'], 'crescent', '#4ff0cc'],
  ['qiblutschnitt', 'Qi-Blutschnitt', 'blood', ['Fächer', 'Blut'], ['Als Vampir-Ritter: Blutschnitt mit Qi, drei Sicheln im Fächer, je 28 Schaden, lassen bluten.', '+35 % Schaden.', 'Fünf Sicheln.', 'Abklingzeit 1,6 s.', 'Heilt 1 Leben pro Treffer.'], 'crescent', '#ff3a4e'],
  ['seelenschwert', 'Seelenschwert', 'qi', ['Schutz', 'Fläche'], ['Seine Seelenwaffe lenkt ab: alle 3 s zerschneidet sie feindliche Geschosse und alles in der Nähe (24 Schaden).', '+35 % Schaden.', 'Größerer Kreis.', 'Abklingzeit 2,2 s.', 'Schnittsturm: drei Kreise hintereinander.'], 'ring', '#e8fff8']
]);
function tickKatana(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 150); if (!e) { ab.t = 0.15; return; }
  ab.t = cdOf(L >= 4 ? 0.75 : 1.0); ab.n = (ab.n || 0) + 1; const a = Math.atan2(e.y - p.y, e.x - p.x), crit = L >= 5 && ab.n % 3 === 0 ? 2 : 1, dmg = 26 * (L >= 2 ? 1.35 : 1) * crit;
  castAnim(p, a, 0.18);
  arcSweep(p, a, 125 * p.st.area, 1.3, dmg, 'none', 'katana', '#ffffff', { kb: 70, dir: ab.n % 2 ? 1 : -1 });
  if (L >= 3) GAME.later(0.1, () => arcSweep(GAME.p, a, 125 * GAME.p.st.area, 1.3, dmg * 0.8, 'none', 'katana', '#e8e8f0', { kb: 70, dir: ab.n % 2 ? -1 : 1 }));
}
function tickIaido(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 280); if (!e) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.2 : 3); const a = Math.atan2(e.y - p.y, e.x - p.x), len = (L >= 3 ? 340 : 260), dmg = 45 * (L >= 2 ? 1.35 : 1);
  castAnim(p, a, 0.2); hitstop(0.04);
  beam(p.x, p.y, a, len, 12, dmg, 'none', 'iaido', '#ffffff', { sfx: 'whip' }); if (L >= 5) beam(p.x, p.y, a + Math.PI / 2, len * 0.7, 12, dmg * 0.8, 'none', 'iaido', '#ffffff');
}
function tickAurensicht(p, ab, dt) {
  const L = ab.lvl; p.parryDmg = L >= 4 ? 2 : L >= 2 ? 1.5 : 1;
  if (p.parryReady) { if (Math.random() < 0.05) addLight(p.x, p.y - 20, 90, '#9affe6', 0.5); return; }
  ab.t -= dt; if (ab.t > 0) return;
  ab.t = cdOf(L >= 5 ? 3.5 : L >= 3 ? 5 : 7); p.parryReady = true; fxRing(p.x, p.y, 10, 40, 0.3, '#9affe6', 3);
}
function tickQiklinge(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 320); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.4 : 1.9); const a = Math.atan2(e.y - p.y, e.x - p.x), dmg = 34 * (L >= 2 ? 1.35 : 1);
  const wave = (aa) => shot(p.x, p.y, aa, 480, dmg, 'qi', 'qiklinge', { col: '#4ff0cc', shape: 'crescent', size: 16, pierce: 99, life: 0.8, onEnd: L >= 5 ? (x, y) => shot(x, y, aa + Math.PI, 480, dmg * 0.7, 'qi', 'qiklinge', { col: '#4ff0cc', shape: 'crescent', size: 16, pierce: 99, life: 0.7 }) : null });
  castAnim(p, a, 0.22); wave(a); if (L >= 3) GAME.later(0.1, () => wave(a + 0.25)); sfx('whip');
}
function tickQiblutschnitt(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 280); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.6 : 2.2); const a = Math.atan2(e.y - p.y, e.x - p.x), n = L >= 3 ? 5 : 3, dmg = 28 * (L >= 2 ? 1.35 : 1);
  castAnim(p, a, 0.24);
  for (let i = 0; i < n; i++) shot(p.x, p.y, a + (i / (n - 1) - 0.5) * 0.8, 440, dmg, 'blood', 'qiblutschnitt', { col: '#ff3a4e', shape: 'crescent', size: 13, pierce: 3, onHit: (en) => { en.bleedT = 3; en.bleedDps = Math.max(en.bleedDps, 4); if (L >= 5) healPlayer(1); } });
}
function tickSeelenschwert(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 2.2 : 3); const r = (L >= 3 ? 120 : 95) * p.st.area, dmg = 24 * (L >= 2 ? 1.35 : 1);
  const G = GAME; let w = 0; for (const s of G.eproj) { if (dist2(s.x, s.y, p.x, p.y) < r * r * 1.4) { burstSparks(s.x, s.y, 3, '#ffffff', 0.5); continue; } G.eproj[w++] = s; } G.eproj.length = w;
  const cut = () => arcSweep(GAME.p, rand(0, TAU), r, TAU, dmg, 'qi', 'seelenschwert', '#e8fff8', { kb: 80 });
  if (!nearestEnemy(p.x, p.y, r) ) return; cut(); if (L >= 5) { GAME.later(0.15, cut); GAME.later(0.3, cut); }
}
Object.assign(TICKS, { katana: tickKatana, iaido: tickIaido, aurensicht: tickAurensicht, qiklinge: tickQiklinge, qiblutschnitt: tickQiblutschnitt, seelenschwert: tickSeelenschwert });
ULTS.tausendschnitte = function (p) { sfx('ult'); GAME.slowmo = Math.max(GAME.slowmo, 1.5); castAnim(p, 0, 0.6); const tg = nearestEnemies(p.x, p.y, 380, 24); tg.forEach((en, i) => GAME.later(i * 0.05, () => { if (en.dead) return; dealDamage(en, 60, 'qi', 'tausendschnitte', { kb: 100, kx: en.x - GAME.p.x, ky: en.y - GAME.p.y, norm: true }); beam(en.x - 40, en.y + 20, -0.5, 80, 3, 0, 'qi', 'tausendschnitte', '#ffffff'); })); };
ICON_EXTRA.tausendschnitte = symIcon('blade', '#ffffff');
defineEvoHero('leo', {
  name: 'Leo', title: 'Der blinde Schwertmeister', school: 'qi', diff: 2,
  role: 'Schwert · Qi · Konter', dodgeCd: 2.0, dodge: 'slide',
  mech: { name: 'Aurensicht', desc: 'Leo sieht nichts und nimmt doch alles wahr. Er beginnt mit seinem Bestienkatana und dem Iai-Schnitt, lernt die Aurensicht (Treffer abwehren und kontern), legt Qi in die Klinge, wird zum Vampir-Ritter mit dem Qi-Blutschnitt und kämpft am Ende mit seiner Seelenwaffe.' },
  ult: { id: 'tausendschnitte', name: 'Tausend Schnitte', cd: 18, desc: 'Die Zeit verlangsamt sich — Leo schneidet durch bis zu 24 Gegner.' },
  strengths: ['Sehr hoher Einzelschaden', 'Wehrt Treffer ab', 'Löscht Geschosse'], weaknesses: ['Wenig Fläche am Anfang', 'Nahkampf', 'Mittleres Leben'],
  builds: [{ name: 'Schwertkunst', desc: 'Bestienkatana + Iai-Schnitt + Aurensicht.' }, { name: 'Qi-Meister', desc: 'Qi-Klinge + Seelenschwert.' }, { name: 'Vampir-Ritter', desc: 'Qi-Blutschnitt + Lebensraub.' }],
  tiers: [
    tier('Schwertmeister', '', 0, 115, 172, 1, 1, 2, '#e8e8f0', ['katana'], ['katana', 'iaido'], 'Blind, mit Bestienkatana.'),
    tier('Aurensicht', 'Stufe 7', 7, 135, 178, 1, 1.15, 3, '#9affe6', ['aurensicht'], ['aurensicht'], 'Er liest Auren und weicht allem aus.'),
    tier('Qi-Klinge', 'Stufe 14', 14, 160, 184, 2, 1.35, 4, '#4ff0cc', ['qiklinge'], ['qiklinge'], 'Qi fließt in die Klinge.'),
    tier('Vampir-Ritter', 'Stufe 21', 21, 190, 190, 2, 1.6, 5, '#ff3a4e', ['qiblutschnitt'], ['qiblutschnitt'], 'Als Vampir wird er Ritter seiner Familie.'),
    tier('Großmeister', 'Stufe 29 oder einen Zwischenboss besiegen', 29, 220, 196, 3, 1.85, 6, '#ffffff', ['seelenschwert'], ['seelenschwert'], 'Seine Seelenwaffe erwacht vollständig.', KHARN)
  ],
  passives: ['lebensraub', 'eisenmeridiane'],
  art: { base: 'shen', fn: drawShen, spec: SPEC_SHEN, h: 66, look: { qi: 0 }, pals: [
    { robe: '#e0dcd0', robeL: '#ffffff', robeD: '#8a867a', sash: '#2a2a3a', sashL: '#e8e8f0', hat: '#5a4a3a', hatL: '#8a7a5a', hatD: '#2a2014', beard: '#2a2420', rim: '#e8e8f0' },
    { robe: '#e0dcd0', robeL: '#ffffff', robeD: '#8a867a', sash: '#2a6a5a', sashL: '#9affe6', hat: '#5a4a3a', hatL: '#8a7a5a', hatD: '#2a2014', beard: '#2a2420', rim: '#9affe6' },
    { robe: '#d0e8e0', robeL: '#ffffff', robeD: '#7a948a', sash: '#1a6a5a', sashL: '#4ff0cc', hat: '#5a4a3a', hatL: '#8a7a5a', hatD: '#2a2014', beard: '#2a2420', rim: '#4ff0cc' },
    { robe: '#1a1014', robeL: '#3a1a22', robeD: '#080406', sash: '#c01a2a', sashL: '#ff3a4e', hat: '#1a1014', hatL: '#3a1a22', hatD: '#080406', beard: '#2a2420', rim: '#ff3a4e' },
    { robe: '#f4f0e8', robeL: '#ffffff', robeD: '#a8a092', sash: '#c9a24c', sashL: '#ffffff', hat: '#e8e0d0', hatL: '#ffffff', hatD: '#8a8272', beard: '#2a2420', rim: '#ffffff' }
  ] }
});

/* ============================================================ LEANDER LOTHRINGEN */
evoCards([
  ['kampfdrohne', 'Kampfdrohne', 'none', ['Begleiter', 'Fernkampf'], ['Eine Drohne kreist um Leander und feuert Laser auf den nächsten Gegner: 12 Schaden.', '+1 Drohne.', '+35 % Schaden.', 'Feuert schneller.', 'Drohnen schießen durchbohrende Laser.'], 'drone', '#8ad8ff'],
  ['nanoschwarm', 'Nanobots', 'none', ['Fläche', 'Dauer'], ['Metall-Nanobots schwärmen über eine Gruppe: 3 s lang 16 Schaden pro Sekunde.', '+1 Schwarm.', '+35 % Schaden.', 'Abklingzeit 2,6 s.', 'Die Schwärme folgen den Gegnern.'], 'swarm', '#c8d0d8'],
  ['energiekanone', 'Energiekanone', 'none', ['Linie', 'Durchbohrend'], ['Die Energiewaffe des Angriffsanzugs: ein Strahl durch alles, 45 Schaden.', '+35 % Schaden.', 'Breiterer Strahl.', 'Abklingzeit 1,8 s.', 'Der Strahl schwenkt in einem Bogen.'], 'beam', '#6affd8'],
  ['lichtkugeln', 'Lichtkugeln', 'none', ['Kontrolle', 'Fläche'], ['Alle 4 s schweben 2 Lichtkugeln zu den Gegnern und blenden sie: 20 Schaden, 1 s betäubt.', '+1 Kugel.', 'Größere Blendung.', 'Abklingzeit 3 s.', 'Die Kugeln pulsieren dreimal.'], 'orbs', '#fff4c0'],
  ['laufmech', 'Laufmaschine', 'none', ['Diener', 'Dauer'], ['Leander baut eine kleine Laufmaschine mit Hundebeinen, die 10 s mitkämpft (14 Schaden pro Schlag).', '+1 Maschine.', '+40 % Schaden.', 'Halten 15 s.', 'Beim Zerfall explodieren sie.'], 'drone', '#c8d0d8'],
  ['satellit', 'Satellitenlaser', 'none', ['Einschlag', 'Fläche'], ['Alle 2,5 s schlägt ein Laser aus dem Orbit auf 2 Gegner ein: 50 Schaden.', '+1 Laser.', '+35 % Schaden.', 'Abklingzeit 1,8 s.', 'Der Laser hinterlässt eine brennende Zone.'], 'pillar', '#6ab8ff']
]);
function tickKampfdrohne(p, ab, dt) {
  const L = ab.lvl, n = 1 + (L >= 2 ? 1 : 0); ab.a = (ab.a || 0) + dt * 2; ab.t -= dt;
  if (ab.t <= 0) { const tg = nearestEnemies(p.x, p.y, 300, n); if (!tg.length) ab.t = 0.2; else { ab.t = cdOf(L >= 4 ? 0.5 : 0.8); tg.forEach((e, i) => { const a = ab.a + i * Math.PI, dx = p.x + Math.cos(a) * 40, dy = p.y - 30 + Math.sin(a) * 20; shot(dx, dy + 16, Math.atan2(e.y - dy, e.x - dx), 700, 12 * (L >= 3 ? 1.35 : 1), 'none', 'kampfdrohne', { col: '#8ad8ff', size: 5, pierce: L >= 5 ? 3 : 0, life: 0.5 }); }); sfx('whip', 0, 0.03); } }
  orbitFx(p, 'kampfdrohne', ab, '#8ad8ff', (g, q, A) => { const nn = 1 + (A.lvl >= 2 ? 1 : 0); for (let i = 0; i < nn; i++) { const a = (A.a || 0) + i * Math.PI, x = q.x + Math.cos(a) * 40, y = q.y - 44 + Math.sin(a) * 20 + Math.sin(GAME.t * 5 + i) * 3; g.save(); g.translate(x, y); g.fillStyle = '#3a4250'; g.fillRect(-8, -3, 16, 6); g.strokeStyle = '#c8d0d8'; g.lineWidth = 1.2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 8, 0); g.lineTo(s * 13, -4); g.stroke(); g.beginPath(); g.ellipse(s * 13, -5, 6, 1.5, 0, 0, TAU); g.stroke(); } g.fillStyle = '#8ad8ff'; g.beginPath(); g.arc(0, 1, 2, 0, TAU); g.fill(); glowDot(g, 0, 1, 6, '#8ad8ff', 0.7); g.restore(); } });
}
function tickNanoschwarm(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const n = 1 + (L >= 2 ? 1 : 0); if (!nearestEnemy(p.x, p.y, 280)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 2.6 : 3.5); const dps = 16 * (L >= 3 ? 1.35 : 1);
  for (let i = 0; i < n; i++) { const e = randomEnemyNear(p.x, p.y, 280); if (!e) break; const sw = { x: e.x, y: e.y, tg: e }; let tick = 0;
    addEffect({ x: sw.x, y: sw.y, dur: 3, layer: 2, update(fx, d) { if (L >= 5 && sw.tg && !sw.tg.dead) { sw.x = lerp(sw.x, sw.tg.x, d * 3); sw.y = lerp(sw.y, sw.tg.y, d * 3); } tick -= d; if (tick <= 0) { tick = 0.3; forEnemiesInRadius(sw.x, sw.y, 55, (en) => dealDamage(en, dps * 0.3, 'none', 'nanoschwarm', { quiet: true })); } },
      draw(g, fx) { g.fillStyle = '#c8d0d8'; for (let k = 0; k < 30; k++) { const a = k * 2.4 + fx.t * (2 + k % 3), r = 10 + (k * 7) % 45; g.fillRect(sw.x + Math.cos(a) * r, sw.y - 14 + Math.sin(a) * r * 0.6, 2, 2); } } }); }
}
function tickEnergiekanone(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 340); if (!e) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 1.8 : 2.5); const a = Math.atan2(e.y - p.y, e.x - p.x), dmg = 45 * (L >= 2 ? 1.35 : 1), w = L >= 3 ? 18 : 11;
  castAnim(p, a, 0.3);
  if (L >= 5) for (let i = 0; i < 5; i++) GAME.later(i * 0.06, () => beam(GAME.p.x, GAME.p.y, a - 0.4 + i * 0.2, 360, w, dmg * 0.6, 'none', 'energiekanone', '#6affd8'));
  else beam(p.x, p.y, a, 360, w, dmg, 'none', 'energiekanone', '#6affd8');
}
function tickLichtkugeln(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 300, 2 + (L >= 2 ? 1 : 0)); if (!tg.length) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 3 : 4); const r = (L >= 3 ? 80 : 60) * p.st.area;
  tg.forEach((e) => shot(p.x, p.y - 20, Math.atan2(e.y - p.y, e.x - p.x), 300, 0, 'none', 'lichtkugeln', { col: '#fff4c0', shape: 'ball', size: 7, home: true, life: 1.2, onEnd: (x, y) => { const pulses = L >= 5 ? 3 : 1; for (let k = 0; k < pulses; k++) GAME.later(k * 0.4, () => blast(x, y, r, 20, 'none', 'lichtkugeln', { col: '#fff4c0', stun: 1, kb: 20, shake: 0 })); } }));
}
function tickLaufmech(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 15 : 10); const n = 1 + (L >= 2 ? 1 : 0);
  for (let i = 0; i < n; i++) spawnMinion(p, { dur: L >= 4 ? 15 : 10, speed: 170, rate: 0.5, dmg: 14 * (L >= 3 ? 1.4 : 1), school: 'none', src: 'laufmech', col: '#8ad8ff', body: '#5a6270', eye: '#8ad8ff', onEnd: L >= 5 ? (x, y) => blast(x, y, 70, 40, 'none', 'laufmech', { col: '#ffb040', shake: 1 }) : null });
  sfx('chain', 0, 0.06);
}
function tickSatellit(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const n = 2 + (L >= 2 ? 1 : 0); if (!nearestEnemy(p.x, p.y, 320)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 1.8 : 2.5);
  for (let i = 0; i < n; i++) GAME.later(i * 0.1, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 320); if (!en) return; lightPillar(en.x, en.y, 40, 50 * (L >= 3 ? 1.35 : 1), 'satellit', '#6ab8ff'); if (L >= 5) GAME.later(0.25, () => zone(en.x, en.y, 36, 2, 12, 'none', 'satellit', '#6ab8ff')); });
}
Object.assign(TICKS, { kampfdrohne: tickKampfdrohne, nanoschwarm: tickNanoschwarm, energiekanone: tickEnergiekanone, lichtkugeln: tickLichtkugeln, laufmech: tickLaufmech, satellit: tickSatellit });
ULTS.ueberladung = function (p) { sfx('ult'); shake(8); castAnim(p, 0, 0.6); for (let i = 0; i < 12; i++) GAME.later(i * 0.05, () => beam(GAME.p.x, GAME.p.y, i / 12 * TAU, 360, 14, 45, 'none', 'ueberladung', '#6affd8')); for (let i = 0; i < 6; i++) GAME.later(0.4 + i * 0.1, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 360); if (en) lightPillar(en.x, en.y, 50, 70, 'ueberladung', '#6ab8ff'); }); };
ICON_EXTRA.ueberladung = symIcon('beam', '#6affd8');
defineEvoHero('leander', {
  name: 'Leander Lothringen', title: 'Das Technik-Genie', school: 'none', diff: 2,
  role: 'Technik · Drohnen · Strahlen', dodgeCd: 2.4, dodge: 'slide',
  mech: { name: 'Erfinder', desc: 'Leander steuert Metall bis hinunter zu Nanobots und baut sich alles selbst. Er beginnt mit einer Kampfdrohne, schickt dann Nanobot-Schwärme, trägt einen Angriffsanzug mit Energiekanone, setzt Lichtkugeln und ruft am Ende Laser aus dem Orbit. Seine Drohnen und Maschinen kämpfen für ihn.' },
  ult: { id: 'ueberladung', name: 'Überladung', cd: 18, desc: 'Zwölf Energiestrahlen in alle Richtungen, dann sechs Satellitenlaser.' },
  strengths: ['Viel Schaden aus der Ferne', 'Begleiter kämpfen mit', 'Starke späte Laser'], weaknesses: ['Wenig Leben', 'Kaum Nahkampf', 'Braucht Aufbau'],
  builds: [{ name: 'Drohnenmeister', desc: 'Kampfdrohne + Laufmaschine.' }, { name: 'Artillerie', desc: 'Energiekanone + Satellitenlaser.' }, { name: 'Kontrolle', desc: 'Lichtkugeln + Nanobots.' }],
  tiers: [
    tier('Tüftler', '', 0, 95, 168, 0, 1, 2, '#8ad8ff', ['kampfdrohne'], ['kampfdrohne', 'laufmech'], 'Eine selbstgebaute Kampfdrohne.'),
    tier('Nanobots', 'Stufe 6', 6, 115, 174, 1, 1.15, 3, '#c8d0d8', ['nanoschwarm'], ['nanoschwarm'], 'Seine Metall-Fähigkeit reicht bis zu Nanobots.'),
    tier('Angriffsanzug', 'Stufe 13', 13, 145, 180, 2, 1.35, 4, '#6affd8', ['energiekanone'], ['energiekanone'], 'Silber-grüner Anzug mit Energiewaffe.'),
    tier('Lichtkugeln', 'Stufe 21', 21, 170, 186, 2, 1.55, 5, '#fff4c0', ['lichtkugeln'], ['lichtkugeln'], 'Schwebende Lichtkugeln blenden die Nacht.'),
    tier('Genie', 'Stufe 29 oder einen Zwischenboss besiegen', 29, 200, 192, 3, 1.8, 6, '#6ab8ff', ['satellit'], ['satellit'], 'Laser aus dem Orbit.', KHARN)
  ],
  passives: [],
  art: { base: 'vorian', fn: drawVorian, spec: SPEC_VORIAN, h: 66, look: { glow: 0, plain: true }, pals: [
    { skin: '#e8c6ac', skinD: '#a8866c', armor: '#3a4250', armorL: '#6a7488', armorD: '#161a22', red: '#3a6a8a', redL: '#8ad8ff', redD: '#10202a', hair: '#1a1410', eye: '#8ad8ff', rim: '#8ad8ff' },
    { skin: '#e8c6ac', skinD: '#a8866c', armor: '#4a5260', armorL: '#8a94a8', armorD: '#1a1e26', red: '#6a7488', redL: '#c8d0d8', redD: '#20242c', hair: '#1a1410', eye: '#c8d0d8', rim: '#c8d0d8' },
    { skin: '#e8c6ac', skinD: '#a8866c', armor: '#6a7a78', armorL: '#b8c8c4', armorD: '#2a3432', red: '#2a8a6a', redL: '#6affd8', redD: '#0a2a20', hair: '#1a1410', eye: '#6affd8', rim: '#6affd8' },
    { skin: '#e8c6ac', skinD: '#a8866c', armor: '#6a7a78', armorL: '#b8c8c4', armorD: '#2a3432', red: '#8a8a4a', redL: '#fff4c0', redD: '#2a2a10', hair: '#1a1410', eye: '#fff4c0', rim: '#fff4c0' },
    { skin: '#e8c6ac', skinD: '#a8866c', armor: '#2a3a5a', armorL: '#5a7aaa', armorD: '#0a1428', red: '#3a6aaa', redL: '#6ab8ff', redD: '#0a1a3a', hair: '#1a1410', eye: '#6ab8ff', rim: '#6ab8ff' }
  ] }
});

/* ============================================================ AGATHON */
evoCards([
  ['schattenschwert', 'Schattenschwert', 'shadow', ['Nahkampf', 'Welle'], ['Ein Schwert aus Schatten: breiter Hieb und eine Schattenwelle, 28 Schaden.', '+35 % Schaden.', 'Die Welle fliegt weiter.', 'Abklingzeit 1,0 s.', 'Zwei Wellen im V.'], 'blade', '#6a4aaa'],
  ['schattenklon', 'Schattenklon', 'shadow', ['Klon', 'Ablenkung'], ['Alle 5 s tritt ein Schattenklon aus Agathons Schatten und kämpft 4 s mit.', '+1 Klon.', 'Klone halten 6 s.', 'Abklingzeit 3,5 s.', 'Klone explodieren am Ende in Schatten.'], 'clone', '#6a4aaa'],
  ['schattensprung', 'Schattensprung', 'shadow', ['Bewegung', 'Einschlag'], ['Von Schatten zu Schatten: Agathon springt in die dichteste Gruppe, 40 Schaden im Umkreis.', '+35 % Schaden.', 'Größerer Einschlag.', 'Abklingzeit 2,6 s.', 'Nach dem Sprung bleibt ein Schattenloch, das Gegner anzieht.'], 'hands', '#8a6aff'],
  ['schattengriff', 'Schattengriff', 'shadow', ['Kontrolle', 'Fläche'], ['Hände aus Schatten greifen unter 3 Gegnern hervor: 30 Schaden, 1 s festgehalten.', '+2 Griffe.', '+35 % Schaden.', 'Abklingzeit 2,2 s.', 'Die Hände ziehen Gegner in den Boden (doppelter Schaden bei schwachen).'], 'hands', '#4a2a8a'],
  ['schattenflut', 'Schattenflut', 'shadow', ['Fläche', 'Dauer'], ['Alle 5 s breitet sich Schatten um Agathon aus: verlangsamt, 14 Schaden pro Sekunde.', '+35 % Schaden.', 'Größere Flut.', 'Abklingzeit 3,6 s.', 'Die Flut zieht Gegner zu ihm.'], 'pool', '#4a2a8a'],
  ['schattenheer', 'Schattenheer', 'shadow', ['Diener', 'Dauer'], ['Alle 8 s erheben sich 3 Schattensoldaten und kämpfen 10 s lang (16 Schaden pro Schlag).', '+1 Soldat.', '+40 % Schaden.', '+1 Soldat, halten 14 s.', 'Soldaten zerfallen in Schattenexplosionen.'], 'clone', '#8a6aff']
]);
function tickSchattenschwert(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 200); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.0 : 1.4); const a = Math.atan2(e.y - p.y, e.x - p.x), dmg = 28 * (L >= 2 ? 1.35 : 1);
  castAnim(p, a, 0.22); arcSweep(p, a, 100 * p.st.area, 2.2, dmg, 'shadow', 'schattenschwert', '#8a6aff', { kb: 110 });
  const wave = (aa) => shot(p.x, p.y, aa, 420, dmg * 0.7, 'shadow', 'schattenschwert', { col: '#8a6aff', shape: 'crescent', size: 15, pierce: 99, life: L >= 3 ? 0.8 : 0.5 });
  if (L >= 5) { wave(a - 0.2); wave(a + 0.2); } else wave(a);
}
function tickSchattenklon(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 3.5 : 5); const n = 1 + (L >= 2 ? 1 : 0), dur = L >= 3 ? 6 : 4;
  for (let i = 0; i < n; i++) { const img = spawnAfterimage(p, dur, 'after'); img.x = p.x + rand(-60, 60); img.y = p.y + rand(-40, 40); if (L >= 5) GAME.later(dur - 0.05, () => blast(img.x, img.y, 80, 40, 'shadow', 'schattenklon', { col: '#8a6aff', kb: 200, shake: 1 })); }
  sfx('shadowstep', 0, 0.1);
}
function tickSchattensprung(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  let best = null, bs = 2; for (let k = 0; k < 8; k++) { const en = randomEnemyNear(p.x, p.y, 260); if (!en) break; let c = 0; forEnemiesInRadius(en.x, en.y, 80, () => c++); if (c > bs) { bs = c; best = en; } }
  if (!best) { ab.t = 0.4; return; }
  ab.t = cdOf(L >= 4 ? 2.6 : 3.6); const dmg = 40 * (L >= 2 ? 1.35 : 1), r = (L >= 3 ? 110 : 85) * p.st.area;
  burstShadow(p.x, p.y, 12, 1); const tx = best.x, ty = best.y + 10; p.x = tx; p.y = ty; p.iframes = Math.max(p.iframes, 0.4);
  blast(tx, ty, r, dmg, 'shadow', 'schattensprung', { col: '#8a6aff', kb: 260, shake: 3, sfx: 'shadowstep' });
  if (L >= 5) openRift(tx, ty, r * 0.8, 2, 6, 120, 'schattensprung', false);
}
function tickSchattengriff(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 280, 3 + (L >= 2 ? 2 : 0)); if (!tg.length) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.2 : 3); const dmg = 30 * (L >= 3 ? 1.35 : 1);
  tg.forEach((en, i) => GAME.later(i * 0.05, () => { if (en.dead) return; const weak = L >= 5 && !en.boss && !en.mini && en.hp < en.maxHp * 0.5; dealDamage(en, dmg * (weak ? 2 : 1), 'shadow', 'schattengriff', { stun: 1 }); spikeFx(en.x, en.y, 12, '#2a1450', 36); burstShadow(en.x, en.y, 5, 0.6); }));
  sfx('rift', 0, 0.08);
}
function tickSchattenflut(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 180)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 3.6 : 5); zone(p.x, p.y, (L >= 3 ? 170 : 130) * p.st.area, 3, 14 * (L >= 2 ? 1.35 : 1), 'shadow', 'schattenflut', '#4a2a8a', { slow: 0.5, pull: L >= 5 ? 70 : 0, swirl: true, alpha: 0.55 });
}
function tickSchattenheer(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(8); const n = 3 + (L >= 2 ? 1 : 0) + (L >= 4 ? 1 : 0);
  for (let i = 0; i < n; i++) spawnMinion(p, { dur: L >= 4 ? 14 : 10, speed: 160, rate: 0.6, dmg: 16 * (L >= 3 ? 1.4 : 1), school: 'shadow', src: 'schattenheer', col: '#8a6aff', body: '#1a1028', eye: '#c8a0ff', onEnd: L >= 5 ? (x, y) => blast(x, y, 60, 30, 'shadow', 'schattenheer', { col: '#8a6aff', shake: 0 }) : null });
  burstShadow(p.x, p.y, 16, 1.2); sfx('rift', 0, 0.1);
}
Object.assign(TICKS, { schattenschwert: tickSchattenschwert, schattenklon: tickSchattenklon, schattensprung: tickSchattensprung, schattengriff: tickSchattengriff, schattenflut: tickSchattenflut, schattenheer: tickSchattenheer });
ULTS.herrderschatten = function (p) { sfx('ult'); shake(9); GAME.slowmo = Math.max(GAME.slowmo, 1); forEnemiesInRadius(p.x, p.y, 420, (en) => { dealDamage(en, 60, 'shadow', 'herrderschatten', { stun: 2 }); burstShadow(en.x, en.y, 3, 0.5); }); addEffect({ x: p.x, y: p.y, dur: 1.2, layer: 2, draw(g, e, k) { g.save(); g.globalAlpha = 0.6 * Math.sin(k * Math.PI); g.fillStyle = '#0a0412'; g.fillRect(GAME.p.x - 800, GAME.p.y - 800, 1600, 1600); g.restore(); } }); };
ICON_EXTRA.herrderschatten = symIcon('hands', '#8a6aff');
defineEvoHero('agathon', {
  name: 'Agathon', title: 'Der erste Anführer', school: 'shadow', diff: 3,
  role: 'Schatten · Klone · Sprünge', dodgeCd: 1.8, dodge: 'shadowstep',
  mech: { name: 'Herr der Schatten', desc: 'Agathon ist der erste Anführer und stärker als alle anderen. Er kämpft mit einem Schwert aus Schatten, ruft Schattenklone, reist von Schatten zu Schatten mitten in die Gegner, packt sie mit Schattenhänden und führt am Ende ein ganzes Heer aus Schatten.' },
  ult: { id: 'herrderschatten', name: 'Herr der Schatten', cd: 19, desc: 'Die Welt wird dunkel: jeder Gegner im weiten Umkreis nimmt 60 Schaden und erstarrt 2 s.' },
  strengths: ['Sehr stark und beweglich', 'Viele Klone und Diener', 'Kontrolle'], weaknesses: ['Anspruchsvoll', 'Sprünge bringen ihn ins Gedränge', 'Spezial braucht lange'],
  builds: [{ name: 'Schattenkämpfer', desc: 'Schattenschwert + Schattensprung.' }, { name: 'Heerführer', desc: 'Schattenklon + Schattenheer.' }, { name: 'Dunkelheit', desc: 'Schattenflut + Schattengriff.' }],
  tiers: [
    tier('Schattenträger', '', 0, 120, 176, 1, 1.05, 2, '#6a4aaa', ['schattenschwert'], ['schattenschwert', 'schattengriff'], 'Ein Schwert aus Schatten.'),
    tier('Schattenklon', 'Stufe 7', 7, 145, 182, 1, 1.2, 3, '#8a6aff', ['schattenklon'], ['schattenklon'], 'Sein Schatten kämpft als Klon mit.'),
    tier('Schattenreise', 'Stufe 14', 14, 170, 188, 2, 1.4, 4, '#a88aff', ['schattensprung'], ['schattensprung', 'schattenflut'], 'Er reist von Schatten zu Schatten.'),
    tier('Erster Anführer', 'Stufe 22', 22, 200, 194, 2, 1.65, 5, '#c8a0ff', ['schattenflut'], [], 'Stärker als jeder andere Anführer.'),
    tier('Schattenheer', 'Stufe 30 oder einen Zwischenboss besiegen', 30, 235, 200, 3, 1.9, 6, '#e8d8ff', ['schattenheer'], ['schattenheer'], 'Ein Heer aus Schatten gehorcht ihm.', KHARN)
  ],
  passives: [],
  art: { base: 'nyx', fn: drawNyx, spec: SPEC_NYX, h: 58, look: { flow: 0.6 }, pals: [
    { cloak: '#14101c', cloakL: '#3a2e4a', cloakD: '#06040a', scarf: '#2a1a4a', scarfL: '#6a4aaa', mask: '#c8c0d8', maskD: '#6a6478', eye: '#8a6aff', rim: '#6a4aaa' },
    { cloak: '#14101c', cloakL: '#3a2e4a', cloakD: '#06040a', scarf: '#3a2a6a', scarfL: '#8a6aff', mask: '#c8c0d8', maskD: '#6a6478', eye: '#a88aff', rim: '#8a6aff' },
    { cloak: '#100c18', cloakL: '#342a48', cloakD: '#040208', scarf: '#4a3a8a', scarfL: '#a88aff', mask: '#d8d0e8', maskD: '#6a6478', eye: '#c8a0ff', rim: '#a88aff' },
    { cloak: '#0c0814', cloakL: '#2e2440', cloakD: '#020104', scarf: '#6a4aaa', scarfL: '#c8a0ff', mask: '#e8e0f8', maskD: '#7a7488', eye: '#e8d8ff', rim: '#c8a0ff' },
    { cloak: '#06040a', cloakL: '#1e1830', cloakD: '#000000', scarf: '#8a6aff', scarfL: '#e8d8ff', mask: '#f4f0ff', maskD: '#8a8498', eye: '#ffffff', rim: '#e8d8ff' }
  ] }
});

/* ============================================================ SAM */
evoCards([
  ['windklinge2', 'Windklinge', 'none', ['Fernkampf', 'Durchbohrend'], ['Klingen aus Wind schneiden durch die Reihen: 16 Schaden.', '+1 Klinge.', '+35 % Schaden.', 'Abklingzeit 0,7 s.', 'Die Klingen werden größer und stoßen zurück.'], 'wind', '#bff0d8'],
  ['windstoss', 'Windstoß', 'none', ['Rückstoß', 'Kegel'], ['Ein Windstoß fegt alles vor Sam weg: 18 Schaden, starker Rückstoß.', '+35 % Schaden.', 'Breiterer Stoß.', 'Abklingzeit 1,6 s.', 'Gegner werden danach kurz verlangsamt.'], 'wind', '#9ae8c8'],
  ['wirbelsturm', 'Wirbelsturm', 'none', ['Fläche', 'Sog'], ['Alle 4 s wandert ein Wirbelsturm durch die Gegner: zieht an, 18 Schaden pro Sekunde.', '+1 Wirbel.', '+35 % Schaden.', 'Abklingzeit 3 s.', 'Wirbel halten länger und werden größer.'], 'tornado', '#bff0d8'],
  ['windmantel', 'Windmantel', 'none', ['Schutz', 'Bewegung'], ['Alle 6 s hüllt ihn Wind ein: 2 s lang +25 % Tempo und feindliche Geschosse werden weggeweht.', 'Hält 3 s.', 'Der Mantel schneidet Gegner in der Nähe.', 'Abklingzeit 4,5 s.', 'Nimmt in der Zeit nur halben Schaden.'], 'shield', '#bff0d8'],
  ['blutwind', 'Blutwind', 'blood', ['Fläche', 'Blut'], ['Als Vampir der Familie: Windschnitte voller Blut rund um Sam, 24 Schaden, lassen bluten.', '+35 % Schaden.', 'Mehr Schnitte.', 'Abklingzeit 1,8 s.', 'Treffer heilen 1 Leben.'], 'ring', '#ff5a6a'],
  ['schlachtplan', 'Schlachtplan', 'none', ['Taktik'], ['Der Stratege: alle 12 s sind alle anderen Fähigkeiten sofort wieder bereit.', 'Abklingzeit 10 s.', 'Dazu 2 s +30 % Schaden.', 'Abklingzeit 8 s.', 'Dazu wird Sam 1 s unverwundbar.'], 'plan', '#ffe6a0']
]);
function tickWindklinge2(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 320, 1 + (L >= 2 ? 1 : 0)); if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 0.7 : 1.0); const dmg = 16 * (L >= 3 ? 1.35 : 1);
  tg.forEach((e) => { const a = Math.atan2(e.y - p.y, e.x - p.x); castAnim(p, a, 0.16); shot(p.x, p.y, a, 520, dmg, 'none', 'windklinge2', { col: '#bff0d8', shape: 'crescent', size: L >= 5 ? 16 : 11, pierce: 4, kb: L >= 5 ? 160 : 40 }); });
  sfx('whip', 0, 0.04);
}
function tickWindstoss(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 150); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.6 : 2.2); const a = Math.atan2(e.y - p.y, e.x - p.x);
  arcSweep(p, a, 150 * p.st.area, L >= 3 ? 1.8 : 1.2, 18 * (L >= 2 ? 1.35 : 1), 'none', 'windstoss', '#bff0d8', { kb: 520, sfx: 'palm', onHit: L >= 5 ? (en) => { en.slowT = Math.max(en.slowT, 2); en.slowF = Math.min(en.slowF || 1, 0.5); } : null });
}
function tornado(x, y, ang, dur, r, dps, src) {
  let tick = 0;
  addEffect({ x, y, vx: Math.cos(ang) * 70, vy: Math.sin(ang) * 70, dur, layer: 2, update(e, dt) { const t = nearestEnemy(e.x, e.y, 200); if (t) { e.vx = lerp(e.vx, (t.x - e.x), dt); e.vy = lerp(e.vy, (t.y - e.y), dt); } e.x += e.vx * dt; e.y += e.vy * dt; forEnemiesInRadius(e.x, e.y, r, (en) => { const dx = e.x - en.x, dy = e.y - en.y, d = Math.hypot(dx, dy) || 1, m = en.boss ? 0.05 : 1; en.x += dx / d * 110 * m * dt; en.y += dy / d * 110 * m * dt; }); tick -= dt; if (tick <= 0) { tick = 0.3; forEnemiesInRadius(e.x, e.y, r, (en) => dealDamage(en, dps * 0.3, 'none', src, { quiet: true })); } },
    draw(g, e) { g.save(); g.globalAlpha = 0.6; g.strokeStyle = '#d8fff0'; g.lineWidth = 2; for (let i = 0; i < 7; i++) { const w = r * (0.25 + i * 0.12), yy = e.y - i * 9, off = Math.sin(e.t * 8 + i) * 4; g.beginPath(); g.ellipse(e.x + off, yy, w, w * 0.25, 0, e.t * 6 + i, e.t * 6 + i + 4.5); g.stroke(); } g.restore(); } });
}
function tickWirbelsturm(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 260)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 3 : 4); const n = 1 + (L >= 2 ? 1 : 0);
  for (let i = 0; i < n; i++) tornado(p.x, p.y, rand(0, TAU), L >= 5 ? 5 : 3.5, (L >= 5 ? 70 : 52) * p.st.area, 18 * (L >= 3 ? 1.35 : 1), 'wirbelsturm');
  sfx('rift', 0, 0.08);
}
function tickWindmantel(p, ab, dt) {
  if (p.sbOn && (p.speedBuffT || 0) <= GAME.t) { p.sbOn = false; recomputeStats(); }
  if ((p.mantelT || 0) > GAME.t) { const G = GAME; let w = 0; for (const s of G.eproj) { if (dist2(s.x, s.y, p.x, p.y) < 90 * 90) { burstSparks(s.x, s.y, 2, '#bff0d8', 0.4); continue; } G.eproj[w++] = s; } G.eproj.length = w;
    if (ab.lvl >= 3 && Math.random() < dt * 4) forEnemiesInRadius(p.x, p.y, 60, (en) => dealDamage(en, 8, 'none', 'windmantel', { quiet: true, kb: 80, kx: en.x - p.x, ky: en.y - p.y, norm: true })); }
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 4.5 : 6); const d = L >= 2 ? 3 : 2; p.mantelT = GAME.t + d; p.speedBuffT = GAME.t + d; p.sbOn = true;
  if (L >= 5) shieldFx(p, d, '#bff0d8'); else addEffect({ x: 0, y: 0, dur: d, layer: 2, draw(g, e, k) { const q = GAME.p; g.save(); g.globalAlpha = 0.5 * (1 - k); g.strokeStyle = '#d8fff0'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(q.x, q.y - 20, 30, 12, 0, e.t * 8 + i * 2, e.t * 8 + i * 2 + 2.5); g.stroke(); } g.restore(); } });
  recomputeStats();
}
function tickBlutwind(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 130)) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.8 : 2.4); const n = L >= 3 ? 6 : 4, dmg = 24 * (L >= 2 ? 1.35 : 1);
  for (let i = 0; i < n; i++) GAME.later(i * 0.05, () => arcSweep(GAME.p, i / n * TAU, 110 * GAME.p.st.area, 1.6, dmg, 'blood', 'blutwind', '#ff5a6a', { bleed: 4, kb: 90, onHit: L >= 5 ? () => healPlayer(1) : null }));
}
function tickSchlachtplan(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 8 : L >= 2 ? 10 : 12);
  for (const k in p.ab) if (k !== 'schlachtplan') p.ab[k].t = 0;
  if (L >= 3) { p.planT = GAME.t + 2; } if (L >= 5) p.iframes = Math.max(p.iframes, 1);
  UI.toast('Schlachtplan: alle Fähigkeiten bereit'); fxRing(p.x, p.y, 10, 90, 0.4, '#ffe6a0', 4);
}
Object.assign(TICKS, { windklinge2: tickWindklinge2, windstoss: tickWindstoss, wirbelsturm: tickWirbelsturm, windmantel: tickWindmantel, blutwind: tickBlutwind, schlachtplan: tickSchlachtplan });
const _rcSam = recomputeStats;
recomputeStats = function () { _rcSam(); const p = GAME.p; if ((p.speedBuffT || 0) > GAME.t) p.st.speed *= 1.25; };
const _hdmSam = heroDamageMult;
heroDamageMult = function (p, school) { let m = _hdmSam(p, school); if ((p.planT || 0) > GAME.t) m *= 1.3; return m; };
ULTS.orkan = function (p) { sfx('ult'); shake(8); castAnim(p, -Math.PI / 2, 0.6); for (let i = 0; i < 4; i++) tornado(p.x, p.y, i / 4 * TAU, 6, 90 * p.st.area, 30, 'orkan'); blast(p.x, p.y, 180, 30, 'none', 'orkan', { col: '#bff0d8', kb: 500 }); };
ICON_EXTRA.orkan = symIcon('tornado', '#bff0d8');
defineEvoHero('sam', {
  name: 'Sam', title: 'Wind und Strategie', school: 'none', diff: 2,
  role: 'Wind · Kontrolle · Taktik', dodgeCd: 2.0, dodge: 'roll',
  mech: { name: 'Stratege', desc: 'Sam hat eine Wind-Fähigkeit, deren Grenze eigentlich bei Stufe 5 liegt. Im Lauf lernt er Windstoß und Wirbelsturm, hüllt sich in einen Windmantel, wird Vampir in Finns Familie (Blutwind) und zeigt am Ende, warum er der Stratege ist: sein Schlachtplan macht alle Fähigkeiten sofort wieder bereit.' },
  ult: { id: 'orkan', name: 'Orkan', cd: 18, desc: 'Vier Wirbelstürme brechen gleichzeitig los und ein Windstoß fegt alles weg.' },
  strengths: ['Viel Kontrolle', 'Schnell', 'Schlachtplan verstärkt alles'], weaknesses: ['Mittleres Leben', 'Wenig Einzelschaden', 'Braucht mehrere Fähigkeiten'],
  builds: [{ name: 'Sturm', desc: 'Windklinge + Wirbelsturm.' }, { name: 'Stratege', desc: 'Schlachtplan + viele Fähigkeiten auf hoher Stufe.' }, { name: 'Blutwind', desc: 'Blutwind + Windmantel + Lebensraub.' }],
  tiers: [
    tier('Windnutzer', '', 0, 100, 176, 0, 1, 2, '#bff0d8', ['windklinge2'], ['windklinge2', 'windstoss'], 'Eine Wind-Fähigkeit.'),
    tier('Stufe 5', 'Stufe 6', 6, 120, 182, 0, 1.15, 3, '#9ae8c8', ['wirbelsturm'], ['wirbelsturm'], 'Er erreicht die Grenze seiner Fähigkeit.'),
    tier('Windmantel', 'Stufe 13', 13, 145, 190, 1, 1.35, 4, '#d8fff0', ['windmantel'], ['windmantel'], 'Der Wind schützt ihn.'),
    tier('Vampir', 'Stufe 21', 21, 175, 196, 1, 1.6, 5, '#ff5a6a', ['blutwind'], ['blutwind'], 'Er wird Vampir in Finns Familie.'),
    tier('Stratege', 'Stufe 29 oder einen Zwischenboss besiegen', 29, 205, 204, 2, 1.8, 6, '#ffe6a0', ['schlachtplan'], ['schlachtplan'], 'Er plant jeden Kampf.', KHARN)
  ],
  passives: ['lebensraub'],
  art: { base: 'finnlook', fn: drawFinn, spec: SPEC_FINN, h: 64, look: { tier: 0 }, pals: [
    { top: '#3a5a4a', topL: '#6a8a7a', topD: '#1a2a22', leg: '#2a3040', legD: '#141820', hair: '#6a4a2a', eye: '#4a8a6a', glasses: false },
    { top: '#2a6a5a', topL: '#5a9a8a', topD: '#10302a', leg: '#2a3040', legD: '#141820', hair: '#6a4a2a', eye: '#6ac8a8', glasses: false },
    { top: '#d8e8e0', topL: '#ffffff', topD: '#8a9a92', leg: '#2a3040', legD: '#141820', hair: '#6a4a2a', eye: '#9ae8c8', glasses: false },
    { top: '#2a1418', topL: '#5a2a30', topD: '#10060a', leg: '#1a1418', legD: '#0a080a', skin: '#e4d4d4', skinD: '#a89098', hair: '#6a4a2a', eye: '#ff5a6a', glasses: false },
    { top: '#1a1418', topL: '#4a3a3a', topD: '#060404', leg: '#1a1418', legD: '#0a080a', skin: '#e4d4d4', skinD: '#a89098', hair: '#6a4a2a', eye: '#ffe6a0', glasses: false, trim: '#c9a24c' }
  ] }
});
HERO_PAL.finnlook = FINN_LOOK[0];

/* ============================================================ MIA MÜLLER */
evoCards([
  ['lichtfunken', 'Lichtfunken', 'none', ['Zielsuchend', 'Fernkampf'], ['Weiße Funken jagen die nächsten Gegner: 3 Funken, je 10 Schaden.', '+2 Funken.', '+35 % Schaden.', 'Abklingzeit 0,8 s.', 'Funken springen nach dem Treffer weiter.'], 'star', '#f4f0ff'],
  ['lichtsaeule2', 'Himmelssäule', 'none', ['Einschlag', 'Fläche'], ['Weiße Himmelsenergie schlägt als Säule auf 2 Gegner ein: 40 Schaden.', '+1 Säule.', '+35 % Schaden.', 'Abklingzeit 1,8 s.', 'Säulen verlangsamen und markieren Gegner.'], 'pillar', '#f4f0ff'],
  ['himmelsschild', 'Himmelsschild', 'none', ['Schutz', 'Heilung'], ['Alle 7 s ein Schild aus Himmelslicht: 2 s lang nur 35 % Schaden, heilt 3.', 'Hält 3 s.', 'Heilt 6.', 'Abklingzeit 5 s.', 'Beim Aufbau blendet das Licht alle Gegner in der Nähe.'], 'shield', '#fff4c0'],
  ['lichtwelle', 'Lichtwelle', 'none', ['Fläche', 'Rückstoß'], ['Alle 3 s eine Welle aus weißem Licht: 26 Schaden, stößt zurück.', '+35 % Schaden.', 'Größere Welle.', 'Abklingzeit 2,2 s.', 'Die Welle heilt dich um 2.'], 'ring', '#f4f0ff'],
  ['sternenregen', 'Sternenregen', 'none', ['Fläche', 'Einschlag'], ['Alle 4 s fallen 8 Sterne um Mia herab: je 30 Schaden.', '+4 Sterne.', '+35 % Schaden.', 'Abklingzeit 3 s.', 'Jeder Stern hinterlässt einen Lichtkreis, der Gegner verlangsamt.'], 'star', '#fff4c0'],
  ['vatererbe', 'Erbe des Vaters', 'blood', ['Blut', 'Fächer'], ['Das Blut ihres Vaters: rot-weiße Sicheln fliegen im Kreis, je 32 Schaden.', '+35 % Schaden.', 'Mehr Sicheln.', 'Abklingzeit 2,4 s.', 'Die Sicheln lassen bluten und heilen dich.'], 'crescent', '#ff5a6a']
]);
function tickLichtfunken(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 320)) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 0.8 : 1.1); const n = 3 + (L >= 2 ? 2 : 0), dmg = 10 * (L >= 3 ? 1.35 : 1);
  for (let i = 0; i < n; i++) shot(p.x, p.y - 20, rand(0, TAU), 300, dmg, 'none', 'lichtfunken', { col: '#f4f0ff', size: 5, shape: 'ball', home: true, life: 1.4, pierce: L >= 5 ? 1 : 0 });
  sfx('gem', 20, 0.03);
}
function tickLichtsaeule2(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 320)) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 1.8 : 2.5); const n = 2 + (L >= 2 ? 1 : 0);
  for (let i = 0; i < n; i++) GAME.later(i * 0.1, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 320); if (!en) return; lightPillar(en.x, en.y, 44, 40 * (L >= 3 ? 1.35 : 1), 'lichtsaeule2', '#f4f0ff'); if (L >= 5) { en.slowT = 2; en.slowF = 0.5; en.vulnT = GAME.t + 3; en.vulnM = 1.2; } });
}
function tickHimmelsschild(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 5 : 7); shieldFx(p, L >= 2 ? 3 : 2, '#fff4c0'); healPlayer(L >= 3 ? 6 : 3);
  if (L >= 5) forEnemiesInRadius(p.x, p.y, 150, (en) => { if (!en.boss) en.stunT = Math.max(en.stunT, 1); });
}
function tickLichtwelle(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 150)) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.2 : 3); blast(p.x, p.y, (L >= 3 ? 160 : 125) * p.st.area, 26 * (L >= 2 ? 1.35 : 1), 'none', 'lichtwelle', { col: '#f4f0ff', kb: 300, shake: 1 }); if (L >= 5) healPlayer(2);
}
function tickSternenregen(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 250)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 3 : 4); const n = 8 + (L >= 2 ? 4 : 0), dmg = 30 * (L >= 3 ? 1.35 : 1);
  for (let i = 0; i < n; i++) GAME.later(i * 0.05, () => { const q = GAME.p, a = rand(0, TAU), d = rand(40, 220), x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d * 0.7;
    addEffect({ x, y, dur: 0.25, layer: 2, draw(g, e, k) { const yy = lerp(y - 320, y - 8, easeIn(k)); g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(glowSprite('#fff4c0'), x - 12, yy - 12, 24, 24); g.strokeStyle = 'rgba(255,244,192,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, yy - 40); g.lineTo(x, yy); g.stroke(); g.restore(); },
      update(e) { if (e.t + 1 / 60 >= e.dur && !e.done) { e.done = true; blast(x, y, 36, dmg, 'none', 'sternenregen', { col: '#fff4c0', kb: 60, shake: 0, sparks: 4 }); if (L >= 5) zone(x, y, 34, 1.5, 0, 'none', 'sternenregen', '#fff4c0', { slow: 0.5 }); } } }); });
}
function tickVatererbe(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 220)) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.4 : 3.2); const n = L >= 3 ? 8 : 5, dmg = 32 * (L >= 2 ? 1.35 : 1), a0 = rand(0, TAU);
  for (let i = 0; i < n; i++) shot(p.x, p.y, a0 + i / n * TAU, 420, dmg, 'blood', 'vatererbe', { col: i % 2 ? '#ffffff' : '#ff3a4e', shape: 'crescent', size: 13, pierce: 3, onHit: L >= 5 ? (en) => { en.bleedT = 3; en.bleedDps = Math.max(en.bleedDps, 5); healPlayer(0.5); } : null });
}
Object.assign(TICKS, { lichtfunken: tickLichtfunken, lichtsaeule2: tickLichtsaeule2, himmelsschild: tickHimmelsschild, lichtwelle: tickLichtwelle, sternenregen: tickSternenregen, vatererbe: tickVatererbe });
ULTS.himmelstor = function (p) { sfx('ult'); shake(8); castAnim(p, -Math.PI / 2, 0.7); for (let i = 0; i < 12; i++) GAME.later(i * 0.08, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 380); if (en) lightPillar(en.x, en.y, 55, 70, 'himmelstor', '#f4f0ff'); }); shieldFx(p, 3, '#fff4c0'); };
ICON_EXTRA.himmelstor = symIcon('pillar', '#f4f0ff');
defineEvoHero('mia', {
  name: 'Mia Müller', title: 'Finns Tochter', school: 'none', diff: 1,
  role: 'Himmelsenergie · Fläche · Schutz', dodgeCd: 2.2, dodge: 'roll',
  mech: { name: 'Himmelsenergie', desc: 'Mia ist Finns Tochter: frech, stärker als jeder in ihrem Alter und die Einzige, die ihn nie vergessen hat. Ihre weiße Himmelsenergie wächst im Lauf von Funken zu Himmelssäulen, einem Schild aus Licht, Lichtwellen und einem Sternenregen. Am Ende erwacht das Blut ihres Vaters in ihr.' },
  ult: { id: 'himmelstor', name: 'Himmelstor', cd: 17, desc: 'Zwölf Himmelssäulen schlagen ein, und ein Lichtschild schützt Mia.' },
  strengths: ['Viel Fläche', 'Schutz und Heilung', 'Einfach zu spielen'], weaknesses: ['Wenig Leben am Anfang', 'Kaum Nahkampf', 'Funken streuen'],
  builds: [{ name: 'Himmelslicht', desc: 'Himmelssäule + Sternenregen.' }, { name: 'Unantastbar', desc: 'Himmelsschild + Lichtwelle.' }, { name: 'Erbin', desc: 'Erbe des Vaters + Lebensraub.' }],
  tiers: [
    tier('Mia', '', 0, 100, 176, 0, 1, 2, '#f4f0ff', ['lichtfunken'], ['lichtfunken', 'lichtwelle'], 'Weiße Funken aus Himmelsenergie.'),
    tier('Himmelsenergie', 'Stufe 6', 6, 120, 182, 0, 1.15, 3, '#fff4c0', ['lichtsaeule2'], ['lichtsaeule2'], 'Das Licht schlägt als Säule ein.'),
    tier('Lichtschild', 'Stufe 13', 13, 145, 188, 1, 1.35, 4, '#fffadc', ['himmelsschild'], ['himmelsschild'], 'Licht schützt sie.'),
    tier('Sternenkind', 'Stufe 21', 21, 175, 194, 1, 1.55, 5, '#fff4c0', ['sternenregen'], ['sternenregen'], 'Sterne fallen für sie.'),
    tier('Erbin des letzten Vampirs', 'Stufe 29 oder einen Zwischenboss besiegen', 29, 205, 200, 2, 1.8, 6, '#ff5a6a', ['vatererbe'], ['vatererbe'], 'Das Blut ihres Vaters erwacht.', KHARN)
  ],
  passives: ['lebensraub'],
  art: { base: 'liora', fn: drawLiora, spec: SPEC_LIORA, h: 60, look: { rage: 0, weapon: 'none' }, pals: [
    { skin: '#8a5a40', coat: '#1a1420', coatL: '#4a3a5a', coatD: '#08060c', hair: '#1a100c', hairL: '#4a3024', eye: '#f4f0ff', rim: '#f4f0ff' },
    { skin: '#8a5a40', coat: '#2a2438', coatL: '#6a5a8a', coatD: '#0c0a14', hair: '#1a100c', hairL: '#4a3024', eye: '#fff4c0', rim: '#fff4c0' },
    { skin: '#8a5a40', coat: '#e8e4f0', coatL: '#ffffff', coatD: '#8a869a', hair: '#1a100c', hairL: '#4a3024', eye: '#fffadc', rim: '#fffadc' },
    { skin: '#8a5a40', coat: '#e8e4f0', coatL: '#ffffff', coatD: '#8a869a', hair: '#1a100c', hairL: '#6a4a34', eye: '#fff4c0', rim: '#fff4c0' },
    { skin: '#8a5a40', coat: '#2a0a14', coatL: '#8a1a2a', coatD: '#10040a', hair: '#1a100c', hairL: '#6a4a34', eye: '#ff5a6a', rim: '#ff5a6a' }
  ] }
});
if (typeof COMPANIONS !== 'undefined' && COMPANIONS.minny) COMPANIONS.minny.name = 'Mia Müller';

/* ============================================================ Ultis der neuen Faehigkeiten */
Object.assign(ULTI, {
  bestienbogen: { name: 'Pfeilsturm', cd: 3.5, desc: 'Alle 3,5 s ein Ring aus 16 durchbohrenden Pfeilen.', fx(p) { radial(16, (a) => shot(p.x, p.y - 4, a, 640, 24, 'none', 'bestienbogen', { col: '#e8e0ff', size: 8, pierce: 4 })); } },
  telestoss: { name: 'Telekinetischer Sturm', cd: 5, desc: 'Alle 5 s schleudert Lena alles im weiten Umkreis fort und hält es fest.', fx(p) { blast(p.x, p.y, 240 * p.st.area, 40, 'shadow', 'telestoss', { col: '#c8a0ff', kb: 600, stun: 1.2, shake: 5 }); } },
  pfeilhagel: { name: 'Pfeilgewitter', cd: 4, desc: 'Alle 4 s regnen 30 Pfeile rund um Lena.', fx(p) { arrowRain(p.x, p.y, 30, 200, 20, 'pfeilhagel', true); } },
  geisterketten: { name: 'Geisterkerker', cd: 6, desc: 'Alle 6 s fesseln Geisterketten bis zu 15 Gegner.', fx(p) { const tg = nearestEnemies(p.x, p.y, 320, 15); if (!tg.length) return false; tg.forEach((en) => { if (!en.boss) en.stunT = Math.max(en.stunT, 2); tetherFx(en, 2, '#e8e0ff', 10); dealDamage(en, 30, 'shadow', 'geisterketten', {}); }); } },
  honnariflamme: { name: 'Flammenkranz', cd: 4, desc: 'Alle 4 s acht Flammenkugeln im Kreis — rote explodieren, grüne heilen.', fx(p) { radial(8, (a, i) => { if (i % 2) fireball(p.x, p.y - 4, a, 35, 5); else shot(p.x, p.y - 4, a, 300, 0, 'none', 'honnariflamme', { col: '#6aff8a', shape: 'ball', size: 9, life: 0.4, onEnd: () => healPlayer(2) }); }); } },
  flammenfalke: { name: 'Phönixschwarm', cd: 5, desc: 'Alle 5 s fünf Flammenvögel, die jeweils dreimal zuschlagen.', fx(p) { const tg = nearestEnemies(p.x, p.y, 380, 5); if (!tg.length) return false; tg.forEach((e) => firebird(p.x, p.y - 20, e, 50, 2)); } },
  kopieeis: { name: 'Eiszeit', cd: 5, desc: 'Alle 5 s erstarrt alles im weiten Umkreis 1,5 s.', fx(p) { blast(p.x, p.y, 240 * p.st.area, 40, 'none', 'kopieeis', { col: '#bfe8ff', freeze: 1.5, kb: 0, shake: 4 }); } },
  ratenschlag: { name: 'Ratens Raserei', cd: 4, desc: 'Alle 4 s zwölf Schläge in alle Richtungen.', fx(p) { if (!nearestEnemy(p.x, p.y, 130)) return false; for (let i = 0; i < 12; i++) GAME.later(i * 0.04, () => arcSweep(GAME.p, i / 12 * TAU * 2, 100, 1.2, 22, 'none', 'ratenschlag', '#ff7a7a', { kb: 120, sfx: 'hit' })); } },
  geisterspeer: { name: 'Speerhagel', cd: 4, desc: 'Alle 4 s acht Geisterspeere in alle Richtungen.', fx(p) { radial(8, (a) => beam(p.x, p.y, a, 340, 14, 45, 'shadow', 'geisterspeer', '#c8d0ff', { stun: 0.4 })); } },
  kopiefeuer: { name: 'Feuerkomet', cd: 5, desc: 'Alle 5 s ein Flammensprint in drei Richtungen hintereinander.', fx(p) { const e = nearestEnemy(p.x, p.y, 260); if (!e) return false; const a = Math.atan2(e.y - p.y, e.x - p.x); for (let i = 0; i < 3; i++) GAME.later(i * 0.25, () => { const q = GAME.p, aa = a + (i - 1) * 0.8; beam(q.x, q.y, aa, 200, 24, 45, 'none', 'kopiefeuer', '#ff8a3a', { kb: 200, sfx: 'flame' }); zone(q.x + Math.cos(aa) * 100, q.y + Math.sin(aa) * 90, 60, 2, 14, 'none', 'kopiefeuer', '#ff6a1a'); }); } },
  kopieregeneration: { name: 'Unsterblichkeit', cd: 8, desc: 'Alle 8 s heilt Fabian 20 % und nimmt 2 s kaum Schaden.', fx(p) { healPlayer(p.st.maxHp * 0.2); shieldFx(p, 2, '#6aff8a'); } },
  bladeschwur: { name: 'Blade-Vermächtnis', cd: 6, desc: 'Alle 6 s ein gewaltiger Schwur aller kopierten Kräfte.', fx(p) { blast(p.x, p.y, 280 * p.st.area, 60, 'none', 'bladeschwur', { col: '#ffd27a', freeze: 1, kb: 400, shake: 8, w: 12 }); radial(12, (a) => beam(p.x, p.y, a, 320, 12, 40, 'shadow', 'bladeschwur', '#c8d0ff')); } },
  faeden: { name: 'Fadensturm', cd: 3.5, desc: 'Alle 3,5 s schneiden Fäden durch bis zu 15 Gegner.', fx(p) { const tg = nearestEnemies(p.x, p.y, 320, 15); if (!tg.length) return false; tg.forEach((en) => { tetherFx(en, 0.25, '#ffc8d0', 4); dealDamage(en, 26, 'blood', 'faeden', { bleed: 4 }); }); } },
  blutbarriere: { name: 'Blutfestung', cd: 8, desc: 'Alle 8 s eine Barriere für 4 s, die Gegner beim Aufbau zurückwirft.', fx(p) { shieldFx(p, 4, '#ff3a4e'); blast(p.x, p.y, 160, 40, 'blood', 'blutbarriere', { col: '#ff3a4e', kb: 500, shake: 4 }); } },
  marionette: { name: 'Puppentheater', cd: 6, desc: 'Alle 6 s werden bis zu 6 Gegner zu Marionetten.', fx(p) { const tg = nearestEnemies(p.x, p.y, 300, 6).filter((e) => !e.boss); if (!tg.length) return false; tg.forEach((en) => { en.stunT = Math.max(en.stunT, 3); tetherFx(en, 3, '#ff6a7a', 8); let t = 0; addEffect({ x: 0, y: 0, dur: 3, update(e, d) { if (en.dead) { e.dead = true; return; } t -= d; if (t <= 0) { t = 0.4; forEnemiesInRadius(en.x, en.y, 60, (o) => { if (o !== en) dealDamage(o, 22, 'blood', 'marionette', { kb: 120, kx: o.x - en.x, ky: o.y - en.y, norm: true }); }); } } }); }); } },
  blutfaeden: { name: 'Blutnetz', cd: 5, desc: 'Alle 5 s ein riesiges Netz, das alle darin festhält.', fx(p) { zone(p.x, p.y, 240 * p.st.area, 3, 26, 'blood', 'blutfaeden', '#ff3a4e', { root: true, swirl: true, alpha: 0.3 }); } },
  fadenfalle: { name: 'Fadenlabyrinth', cd: 6, desc: 'Alle 6 s sechs Fallen rings um Fex.', fx(p) { radial(6, (a) => zone(p.x + Math.cos(a) * 130, p.y + Math.sin(a) * 90, 60, 4, 26, 'blood', 'fadenfalle', '#c8203a', { root: true, pull: 60, swirl: true, alpha: 0.35 })); } },
  blutnadel: { name: 'Nadelregen', cd: 4, desc: 'Alle 4 s acht riesige Blutnadeln in alle Richtungen.', fx(p) { radial(8, (a) => shot(p.x, p.y - 4, a, 620, 60, 'blood', 'blutnadel', { col: '#1a1a22', size: 14, pierce: 99, life: 0.8 })); } },
  katana: { name: 'Mondschnitt', cd: 3.5, desc: 'Alle 3,5 s ein vollkommener Rundschnitt.', fx(p) { if (!nearestEnemy(p.x, p.y, 170)) return false; arcSweep(p, 0, 170 * p.st.area, TAU, 60, 'none', 'katana', '#ffffff', { kb: 180 }); } },
  iaido: { name: 'Stern der Schnitte', cd: 5, desc: 'Alle 5 s acht Iai-Schnitte gleichzeitig.', fx(p) { radial(8, (a) => beam(p.x, p.y, a, 320, 12, 55, 'none', 'iaido', '#ffffff')); hitstop(0.06); } },
  aurensicht: { name: 'Vollkommene Wahrnehmung', cd: 8, desc: 'Alle 8 s ist Leo 2 s unverwundbar und schneidet alles in der Nähe.', fx(p) { p.iframes = Math.max(p.iframes, 2); arcSweep(p, 0, 150, TAU, 50, 'qi', 'aurensicht', '#9affe6', { kb: 250 }); } },
  qiklinge: { name: 'Qi-Sturmklinge', cd: 4, desc: 'Alle 4 s zehn Qi-Schnittwellen in alle Richtungen.', fx(p) { radial(10, (a) => shot(p.x, p.y, a, 480, 40, 'qi', 'qiklinge', { col: '#4ff0cc', shape: 'crescent', size: 16, pierce: 99, life: 0.8 })); } },
  qiblutschnitt: { name: 'Blutmond', cd: 4, desc: 'Alle 4 s zwölf Qi-Blutsicheln im Kreis, die heilen.', fx(p) { radial(12, (a) => shot(p.x, p.y, a, 440, 36, 'blood', 'qiblutschnitt', { col: '#ff3a4e', shape: 'crescent', size: 14, pierce: 4, onHit: () => healPlayer(0.5) })); } },
  seelenschwert: { name: 'Seelensturm', cd: 5, desc: 'Alle 5 s löscht die Seelenwaffe alle feindlichen Geschosse und schneidet fünfmal im Kreis.', fx(p) { GAME.eproj.length = 0; for (let i = 0; i < 5; i++) GAME.later(i * 0.12, () => arcSweep(GAME.p, rand(0, TAU), 180 * GAME.p.st.area, TAU, 35, 'qi', 'seelenschwert', '#e8fff8', { kb: 100 })); } },
  kampfdrohne: { name: 'Drohnenschwarm', cd: 5, desc: 'Alle 5 s feuern acht Drohnen gleichzeitig.', fx(p) { const tg = nearestEnemies(p.x, p.y, 360, 8); if (!tg.length) return false; tg.forEach((e, i) => { const a = i / 8 * TAU, x = p.x + Math.cos(a) * 60, y = p.y - 30 + Math.sin(a) * 30; for (let k = 0; k < 3; k++) GAME.later(k * 0.1, () => shot(x, y + 16, Math.atan2(e.y - y, e.x - x), 700, 16, 'none', 'kampfdrohne', { col: '#8ad8ff', size: 5, pierce: 2, life: 0.5 })); }); } },
  nanoschwarm: { name: 'Graue Flut', cd: 6, desc: 'Alle 6 s bedecken Nanobots den ganzen Umkreis.', fx(p) { zone(p.x, p.y, 230 * p.st.area, 3, 30, 'none', 'nanoschwarm', '#c8d0d8', { slow: 0.6, alpha: 0.3 }); } },
  energiekanone: { name: 'Vernichtungsstrahl', cd: 5, desc: 'Alle 5 s ein Strahl, der einmal im Kreis schwenkt.', fx(p) { for (let i = 0; i < 16; i++) GAME.later(i * 0.04, () => beam(GAME.p.x, GAME.p.y, i / 16 * TAU, 360, 16, 40, 'none', 'energiekanone', '#6affd8')); } },
  lichtkugeln: { name: 'Blendgranate', cd: 6, desc: 'Alle 6 s blendet ein gewaltiger Lichtblitz jeden Gegner in der Nähe 2 s.', fx(p) { blast(p.x, p.y, 280 * p.st.area, 40, 'none', 'lichtkugeln', { col: '#fff4c0', stun: 2, kb: 60, shake: 3 }); } },
  laufmech: { name: 'Mechkompanie', cd: 10, desc: 'Alle 10 s fünf Laufmaschinen auf einmal.', fx(p) { for (let i = 0; i < 5; i++) spawnMinion(p, { dur: 12, speed: 180, rate: 0.45, dmg: 20, school: 'none', src: 'laufmech', col: '#8ad8ff', body: '#6a7488', eye: '#8ad8ff' }); } },
  satellit: { name: 'Orbitalschlag', cd: 5, desc: 'Alle 5 s zehn Laser aus dem Orbit.', fx(p) { if (!nearestEnemy(p.x, p.y, 380)) return false; for (let i = 0; i < 10; i++) GAME.later(i * 0.07, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 380); if (en) lightPillar(en.x, en.y, 50, 65, 'satellit', '#6ab8ff'); }); } },
  schattenschwert: { name: 'Schattenkreuz', cd: 4, desc: 'Alle 4 s acht Schattenwellen in alle Richtungen.', fx(p) { radial(8, (a) => shot(p.x, p.y, a, 440, 40, 'shadow', 'schattenschwert', { col: '#8a6aff', shape: 'crescent', size: 16, pierce: 99, life: 0.8 })); } },
  schattenklon: { name: 'Spiegelschatten', cd: 7, desc: 'Alle 7 s vier Klone um Agathon.', fx(p) { radial(4, (a) => { const img = spawnAfterimage(p, 5, 'after'); img.x = p.x + Math.cos(a) * 80; img.y = p.y + Math.sin(a) * 55; }); } },
  schattensprung: { name: 'Schattenwandel', cd: 5, desc: 'Alle 5 s springt Agathon dreimal durch die Horde.', fx(p) { for (let i = 0; i < 3; i++) GAME.later(i * 0.3, () => { const q = GAME.p, en = randomEnemyNear(q.x, q.y, 300); if (!en) return; burstShadow(q.x, q.y, 8, 0.8); q.x = en.x; q.y = en.y + 10; q.iframes = Math.max(q.iframes, 0.4); blast(q.x, q.y, 110, 50, 'shadow', 'schattensprung', { col: '#8a6aff', kb: 260, shake: 3 }); }); } },
  schattengriff: { name: 'Griff der Unterwelt', cd: 5, desc: 'Alle 5 s greifen Schattenhände nach bis zu 12 Gegnern.', fx(p) { const tg = nearestEnemies(p.x, p.y, 320, 12); if (!tg.length) return false; tg.forEach((en) => { dealDamage(en, 45, 'shadow', 'schattengriff', { stun: 1.5 }); spikeFx(en.x, en.y, 12, '#2a1450', 40); }); } },
  schattenflut: { name: 'Ewige Nacht', cd: 7, desc: 'Alle 7 s ein riesiges Schattenmeer, das Gegner zu Agathon zieht.', fx(p) { zone(p.x, p.y, 280 * p.st.area, 4, 26, 'shadow', 'schattenflut', '#4a2a8a', { slow: 0.4, pull: 90, swirl: true, alpha: 0.5 }); } },
  schattenheer: { name: 'Legion', cd: 10, desc: 'Alle 10 s acht Schattensoldaten.', fx(p) { for (let i = 0; i < 8; i++) spawnMinion(p, { dur: 12, speed: 170, rate: 0.5, dmg: 22, school: 'shadow', src: 'schattenheer', col: '#8a6aff', body: '#1a1028', eye: '#e8d8ff' }); } },
  windklinge2: { name: 'Klingenwind', cd: 3.5, desc: 'Alle 3,5 s zwölf Windklingen im Kreis.', fx(p) { radial(12, (a) => shot(p.x, p.y, a, 520, 26, 'none', 'windklinge2', { col: '#bff0d8', shape: 'crescent', size: 14, pierce: 6, kb: 120 })); } },
  windstoss: { name: 'Sturmfront', cd: 4, desc: 'Alle 4 s fegt ein Sturm im Kreis alles weg.', fx(p) { arcSweep(p, 0, 220 * p.st.area, TAU, 30, 'none', 'windstoss', '#bff0d8', { kb: 700, sfx: 'palm' }); } },
  wirbelsturm: { name: 'Mahlstrom', cd: 6, desc: 'Alle 6 s ein riesiger Wirbelsturm, der die Horde verschlingt.', fx(p) { tornado(p.x, p.y, 0, 5, 120 * p.st.area, 40, 'wirbelsturm'); } },
  windmantel: { name: 'Auge des Sturms', cd: 7, desc: 'Alle 7 s ist Sam 2 s unberührbar im Auge des Sturms.', fx(p) { p.iframes = Math.max(p.iframes, 2); GAME.eproj.length = 0; blast(p.x, p.y, 150, 30, 'none', 'windmantel', { col: '#bff0d8', kb: 500 }); } },
  blutwind: { name: 'Blutsturm', cd: 4, desc: 'Alle 4 s zehn blutige Windschnitte.', fx(p) { if (!nearestEnemy(p.x, p.y, 160)) return false; for (let i = 0; i < 10; i++) GAME.later(i * 0.04, () => arcSweep(GAME.p, i / 10 * TAU, 150, 1.4, 34, 'blood', 'blutwind', '#ff5a6a', { bleed: 5, onHit: () => healPlayer(0.5) })); } },
  schlachtplan: { name: 'Meisterplan', cd: 8, desc: 'Alle 8 s: alle Fähigkeiten bereit und 3 s lang doppelt so schnell.', fx(p) { for (const k in p.ab) if (k !== 'schlachtplan') p.ab[k].t = 0; p.frenzyT = GAME.t + 3; } },
  lichtfunken: { name: 'Funkenmeer', cd: 3.5, desc: 'Alle 3,5 s 20 zielsuchende Funken.', fx(p) { for (let i = 0; i < 20; i++) shot(p.x, p.y - 20, i / 20 * TAU, 300, 16, 'none', 'lichtfunken', { col: '#f4f0ff', size: 5, shape: 'ball', home: true, life: 1.6, pierce: 1 }); } },
  lichtsaeule2: { name: 'Himmelsgericht', cd: 5, desc: 'Alle 5 s acht Himmelssäulen.', fx(p) { if (!nearestEnemy(p.x, p.y, 380)) return false; for (let i = 0; i < 8; i++) GAME.later(i * 0.08, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 380); if (en) lightPillar(en.x, en.y, 55, 60, 'lichtsaeule2', '#f4f0ff'); }); } },
  himmelsschild: { name: 'Heiliger Schutz', cd: 9, desc: 'Alle 9 s: 3 s unverwundbar und 15 % Heilung.', fx(p) { p.iframes = Math.max(p.iframes, 3); healPlayer(p.st.maxHp * 0.15); fxRing(p.x, p.y, 10, 120, 0.5, '#fff4c0', 8); } },
  lichtwelle: { name: 'Lichtflut', cd: 5, desc: 'Alle 5 s drei Lichtwellen hintereinander.', fx(p) { for (let i = 0; i < 3; i++) GAME.later(i * 0.2, () => blast(GAME.p.x, GAME.p.y, (160 + i * 50) * GAME.p.st.area, 30, 'none', 'lichtwelle', { col: '#f4f0ff', kb: 300, shake: 1 })); } },
  sternenregen: { name: 'Meteorschauer', cd: 5, desc: 'Alle 5 s fallen 30 Sterne.', fx(p) { for (let i = 0; i < 30; i++) GAME.later(i * 0.03, () => { const q = GAME.p, a = rand(0, TAU), d = rand(30, 280); blast(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * 0.7, 36, 30, 'none', 'sternenregen', { col: '#fff4c0', shake: 0, sparks: 3 }); }); } },
  vatererbe: { name: 'Blut und Licht', cd: 5, desc: 'Alle 5 s ein Kreis aus 16 rot-weißen Sicheln, die heilen.', fx(p) { radial(16, (a, i) => shot(p.x, p.y, a, 440, 40, 'blood', 'vatererbe', { col: i % 2 ? '#ffffff' : '#ff3a4e', shape: 'crescent', size: 14, pierce: 4, onHit: () => healPlayer(0.4) })); } }
});

/* ============================================================ Heldenwahl: nur Figuren aus dem Vampirsystem */
(function () {
  const keep = ['finn', 'peter', 'emma', 'lena', 'fabian', 'fex', 'leo', 'sil', 'chris', 'leander', 'agathon', 'sam', 'mia', 'draco'];
  HERO_ORDER.length = 0; for (const h of keep) if (HEROES[h]) HERO_ORDER.push(h);
})();

/* ============================================================ Menschliche Figuren (Finns Koerperbau)
   Fabian und Sil sind derselbe blonde Junge (ein Koerper, verschiedene
   Persoenlichkeiten), nur Augen und Akzente wechseln. Leander ist klein
   und dunkelhaarig. */
function humanArt(id, pals, scale) {
  HERO_ART[id].spec = SPEC_FINN; HERO_ART[id].h = Math.round(64 * (scale || 1));
  HERO_ART[id].draw = (g, P, L) => { if (scale) g.scale(scale, scale); return withPal([[FINN_LOOK[0], pals[Math.min(L.tier || 0, pals.length - 1)]]], () => drawFinn(g, P, Object.assign({}, L, { tier: 0 }))); };
}
const BLADE_BASE = { top: '#2a3a5a', topL: '#4a5a8a', topD: '#141c2e', leg: '#1e2434', legD: '#0e1018', shoe: '#1a1a20', skin: '#ecd8c8', skinD: '#a88878', hair: '#e8cf7a', glasses: false, shirt: '#e8e4dc' };
const bladeLook = (eye, trim, extra) => Object.assign({}, BLADE_BASE, { eye, trim }, extra || {});
humanArt('fabian', [
  bladeLook('#5a8ac8', '#ffd27a'), bladeLook('#ff5a5a', '#ff5a5a'), bladeLook('#c8d0ff', '#c8d0ff'),
  bladeLook('#ff8a3a', '#ff8a3a', { coat: true, lining: '#8a3a1a' }),
  bladeLook('#ffd27a', '#ffd27a', { top: '#16161c', topL: '#3a3a4a', topD: '#060608', coat: true, lining: '#8a6a2a' })
]);
humanArt('sil', [
  bladeLook('#c8a0ff', '#c8a0ff'), bladeLook('#c8a0ff', '#ffb040'), bladeLook('#c8a0ff', '#e8e8ff'),
  bladeLook('#c8a0ff', '#d8e0f0', { coat: true, lining: '#4a3a6a' }),
  bladeLook('#ffffff', '#c8a0ff', { top: '#e8e8f0', topL: '#ffffff', topD: '#8a8a98', coat: true, lining: '#c8a0ff' })
]);
const LEANDER_BASE = { top: '#4a5260', topL: '#7a8498', topD: '#1e222a', leg: '#2a2e38', legD: '#12141a', shoe: '#3a3e48', skin: '#e8c6ac', skinD: '#a8866c', hair: '#3a2a1e', glasses: false, shirt: '#2a2e38' };
humanArt('leander', [
  Object.assign({}, LEANDER_BASE, { eye: '#8ad8ff', trim: '#8ad8ff' }),
  Object.assign({}, LEANDER_BASE, { eye: '#c8d0d8', trim: '#c8d0d8' }),
  Object.assign({}, LEANDER_BASE, { top: '#6a7a78', topL: '#b8c8c4', topD: '#2a3432', eye: '#6affd8', trim: '#6affd8' }),
  Object.assign({}, LEANDER_BASE, { top: '#6a7a78', topL: '#b8c8c4', topD: '#2a3432', eye: '#fff4c0', trim: '#fff4c0' }),
  Object.assign({}, LEANDER_BASE, { top: '#2a3a5a', topL: '#5a7aaa', topD: '#0a1428', eye: '#6ab8ff', trim: '#6ab8ff', coat: true, lining: '#3a6aaa' })
], 0.8);
ICON_EXTRA.kristallsplitter = symIcon('star', '#8ad8ff');
