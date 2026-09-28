'use strict';
/* ==========================================================================
   ULTIS UND NEUE FAEHIGKEITEN
   · Jede Faehigkeit, die Stufe 5 erreicht, kann sich zur ULTI weiterentwickeln
     (eigene goldene Karte): sie feuert 30 % schneller und bekommt einen
     eigenen, gewaltigen Zusatzangriff.
   · Neue Faehigkeiten, angelehnt an Finns Systemfaehigkeiten aus dem Roman
     (eigene Umsetzung): Blutsicheltritt, Blutkugeln, Schattenfesseln, Blutwald
     — dazu der Jadelotus (Qi).
   ========================================================================== */

/* ------------------------------------------------------------- neue Karten */
Object.assign(CARDS, {
  blutsicheltritt: {
    name: 'Blutsicheltritt', school: 'blood', kind: 'ability', max: 5, tags: ['Fernkampf', 'Durchbohrend'],
    lv: [
      'Alle 2,6 s ein Tritt, der eine Blutsichel nach vorn schleudert: 26 Schaden, durchbohrt alles.',
      '+35 % Schaden.',
      'Fächer: drei Sicheln auf einmal.',
      '+25 % Schaden, Abklingzeit 2,0 s.',
      'Blutwelle: jeder Tritt stößt zusätzlich einen Blutring um dich aus.'
    ]
  },
  blutkugeln: {
    name: 'Blutkugeln', school: 'blood', kind: 'ability', max: 5, tags: ['Fernkampf', 'Schnell'],
    lv: [
      'Alle 0,9 s eine Blutkugel auf den nächsten Gegner: 14 Schaden.',
      '+1 Kugel auf ein zweites Ziel.',
      '+40 % Schaden, Kugeln durchbohren 2 Gegner.',
      'Abklingzeit 0,65 s.',
      '+1 Kugel, jede Kugel zerplatzt in einer kleinen Blutexplosion.'
    ]
  },
  schattenfesseln: {
    name: 'Schattenfesseln', school: 'shadow', kind: 'ability', max: 5, tags: ['Kontrolle', 'Dauer'],
    lv: [
      'Alle 3,2 s packen Schattenketten 2 Gegner: 1,2 s gefesselt, 6 Schaden pro Puls.',
      '+1 Kette.',
      '+50 % Schaden, Fesseln halten 1,6 s.',
      '+2 Ketten, Abklingzeit 2,6 s.',
      'Seelenfraß: stirbt ein Gefesselter, springt eine Schattenflamme zum nächsten Gegner.'
    ]
  },
  blutwald: {
    name: 'Blutwald', school: 'blood', kind: 'ability', max: 5, tags: ['Fläche', 'Einschlag'],
    lv: [
      'Alle 3,5 s brechen unter 3 Gegnern Blutdornen aus dem Boden: 30 Schaden.',
      '+2 Dornenfelder.',
      '+35 % Schaden, größere Felder.',
      '+2 Dornenfelder, Abklingzeit 2,8 s.',
      'Blutboden: die Dornen hinterlassen ätzende Blutlachen.'
    ]
  },
  jadelotus: {
    name: 'Jadelotus', school: 'qi', kind: 'ability', max: 5, tags: ['Fläche', 'Heilung', 'Rückstoß'],
    lv: [
      'Alle 2,8 s erblüht ein Qi-Lotus um dich: 18 Schaden, Rückstoß, heilt 1 Leben.',
      '+30 % Schaden.',
      'Größere Blüte, getroffene Gegner werden verlangsamt.',
      'Abklingzeit 2,1 s.',
      'Doppelblüte: eine zweite Blüte folgt, Heilung 3 Leben.'
    ]
  }
});
Object.assign(ABILITY_SCHOOL, { blutsicheltritt: 'blood', blutkugeln: 'blood', schattenfesseln: 'shadow', blutwald: 'blood', jadelotus: 'qi', hammerschlag: 'none', blitzschritt: 'none' });
Object.assign(SRC_NAMES, { blutsicheltritt: 'Blutsicheltritt', blutkugeln: 'Blutkugeln', schattenfesseln: 'Schattenfesseln', blutwald: 'Blutwald', jadelotus: 'Jadelotus' });
// in die Karten-Pools der Helden
for (const [h, add] of [['vorian', ['blutwald', 'blutsicheltritt']], ['liora', ['blutkugeln', 'blutsicheltritt', 'blutwald']], ['nyx', ['schattenfesseln', 'blutkugeln']], ['shen', ['jadelotus', 'schattenfesseln', 'blutwald']], ['draco', ['jadelotus', 'blutsicheltritt']]])
  if (HEROES[h]) for (const c of add) if (!HEROES[h].pool.includes(c)) HEROES[h].pool.splice(Math.min(4, HEROES[h].pool.length), 0, c);

/* ------------------------------------------------------------- Umsetzung */
function tickBlutsicheltritt(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 2.0 : 2.6);
  const dmg = 26 * (L >= 2 ? 1.35 : 1) * (L >= 4 ? 1.25 : 1);
  const ang = aimDir(p, 320);
  castAnim(p, ang, 0.26); sfx('whip');
  const fan = L >= 3 ? [-0.32, 0, 0.32] : [0];
  fan.forEach((o, i) => GAME.later(i * 0.04, () => bloodCrescent(GAME.p.x, GAME.p.y, ang + o, dmg, 'blutsicheltritt')));
  if (L >= 5) novaBurst(p.x, p.y, 70 * areaOf('blood'), dmg * 0.5, 'blutsicheltritt', { dur: 0.22 });
}
function tickBlutkugeln(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return;
  const L = ab.lvl;
  const n = 1 + (L >= 2 ? 1 : 0) + (L >= 5 ? 1 : 0);
  const tg = nearestEnemies(p.x, p.y, 360, n);
  if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 0.65 : 0.9);
  const dmg = 14 * (L >= 3 ? 1.4 : 1);
  sfx('whip', 0, 0.04);
  for (let i = 0; i < n; i++) {
    const e = tg[i % tg.length], a = Math.atan2(e.y - p.y, e.x - p.x);
    castAnim(p, a, 0.14);
    bloodBolt(p.x + Math.cos(a) * 12, p.y - 4 + Math.sin(a) * 8, a + rand(-0.03, 0.03), 620, dmg, L >= 3 ? 2 : 0, L >= 5);
  }
}
function shadowChain(p, en, dur, dmg, src, eat) {
  if (!en.boss) en.stunT = Math.max(en.stunT, dur * (en.mini ? 0.3 : 1));
  let tick = 0;
  addEffect({ x: en.x, y: en.y, dur, layer: 2, update(e, dt) {
    if (en.dead) {
      if (eat && !e.ate) { e.ate = true; const n2 = nearestEnemy(en.x, en.y, 260); if (n2) shadowFlame(en.x, en.y, n2, dmg * 3, 1, src); }
      e.dead = true; return;
    }
    tick -= dt; if (tick <= 0) { tick = 0.3; dealDamage(en, dmg, 'shadow', src, { quiet: true }); }
    addLight(en.x, en.y, 60, '#8a5cff', 0.5);
  }, draw(g, e, k) {
    if (en.dead) return;
    const q = GAME.p, x0 = q.x, y0 = q.y - 18, x1 = en.x, y1 = en.y - 12, n = 9;
    g.save(); g.globalAlpha = 1 - k * k;
    g.strokeStyle = '#1a0a30'; g.lineWidth = 5; g.beginPath();
    for (let i = 0; i <= n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * 14 * (1 - k); const x = lerp(x0, x1, t), y = lerp(y0, y1, t) + sag; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#a77bff'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#c7a6ff';
    for (let i = 1; i < n; i++) { const t = i / n, x = lerp(x0, x1, t), y = lerp(y0, y1, t) + Math.sin(t * Math.PI) * 14 * (1 - k); g.beginPath(); g.ellipse(x, y, 3, 2, i, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(199,166,255,0.8)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x1, en.y - 4, en.r + 4, (en.r + 4) * 0.45, 0, 0, TAU); g.stroke();
    g.restore();
  } });
}
function tickSchattenfesseln(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return;
  const L = ab.lvl;
  const n = 2 + (L >= 2 ? 1 : 0) + (L >= 4 ? 2 : 0);
  const tg = nearestEnemies(p.x, p.y, 280, n);
  if (!tg.length) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.6 : 3.2);
  const dur = L >= 3 ? 1.6 : 1.2, dmg = 6 * (L >= 3 ? 1.5 : 1);
  sfx('rift', 0, 0.1); castAnim(p, Math.atan2(tg[0].y - p.y, tg[0].x - p.x), 0.2);
  tg.forEach((en, i) => GAME.later(i * 0.05, () => { if (!en.dead) { shadowChain(GAME.p, en, dur, dmg, 'schattenfesseln', L >= 5); burstShadow(en.x, en.y, 4, 0.6); } }));
}
function bloodThorns(x, y, r, dmg, src, pool) {
  fxTelegraphCircle(x, y, r, 0.2, '#ff2a40');
  GAME.later(0.2, () => {
    sfx('stomp', 0, 0.12); shake(1.2);
    forEnemiesInRadius(x, y, r, (en) => dealDamage(en, dmg, 'blood', src, { kb: 40, kx: en.x - x, ky: en.y - y, norm: true, stun: 0.25 }));
    burstBlood(x, y, 8, 1);
    if (pool) bloodPool(x, y, r * 0.8, 2.2, 5, src);
    const spikes = Array.from({ length: 7 }, (_, i) => ({ a: i / 7 * TAU + Math.random(), d: Math.random() * r * 0.75, h: rand(24, 44), w: rand(4, 7) }));
    addEffect({ x, y, dur: 0.7, layer: 2, draw(g, e, k) {
      const grow = k < 0.2 ? easeOut(k / 0.2) : k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      for (const s of spikes.slice().sort((a, b) => Math.sin(a.a) - Math.sin(b.a))) {
        const sx = x + Math.cos(s.a) * s.d, sy = y + Math.sin(s.a) * s.d * 0.6, h = s.h * grow;
        g.fillStyle = lg(g, sx, sy - h, sx, sy, [0, '#ffd0d6', 0.25, '#e0203a', 1, '#5a0010']);
        g.beginPath(); g.moveTo(sx - s.w, sy); g.lineTo(sx + rand(-1, 1), sy - h); g.lineTo(sx + s.w, sy); g.closePath(); g.fill();
      }
      addLight(x, y, r * 2, '#ff2a40', 0.6 * (1 - k));
    } });
  });
}
function tickBlutwald(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return;
  const L = ab.lvl;
  const n = 3 + (L >= 2 ? 2 : 0) + (L >= 4 ? 2 : 0);
  if (!nearestEnemy(p.x, p.y, 320)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 2.8 : 3.5);
  const r = (L >= 3 ? 48 : 38) * areaOf('blood'), dmg = 30 * (L >= 3 ? 1.35 : 1);
  castAnim(p, -Math.PI / 2, 0.25);
  for (let i = 0; i < n; i++) GAME.later(i * 0.07, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 320); if (en) bloodThorns(en.x, en.y, r, dmg, 'blutwald', L >= 5); });
}
function lotusBloom(x, y, r, dmg, heal, slow, src) {
  sfx('palm', 0, 0.1);
  const hit = new Set();
  addEffect({ x, y, dur: 0.5, layer: 1, update(e) {
    const cr = r * easeOut(clamp(e.t / 0.35, 0, 1));
    const q = GAME.p;
    forEnemiesInRadius(q.x, q.y, cr, (en) => { if (hit.has(en.id)) return; hit.add(en.id); dealDamage(en, dmg, 'qi', src, { kb: 220 * q.st.kb, kx: en.x - q.x, ky: en.y - q.y, norm: true }); if (slow) { en.slowT = Math.max(en.slowT, 1.5); en.slowF = Math.min(en.slowF || 1, 0.55); } });
    addLight(q.x, q.y, r * 1.5, '#4ff0cc', 0.8 * (1 - e.t / 0.5));
  }, draw(g, e, k) {
    const q = GAME.p, cr = r * easeOut(clamp(k * 1.4, 0, 1));
    g.save(); g.translate(q.x, q.y - 6); g.scale(1, 0.62); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k;
    for (let i = 0; i < 8; i++) { g.save(); g.rotate(i / 8 * TAU + k * 0.8); g.drawImage(ASPR.lotus, -cr * 0.35, -cr * 1.05, cr * 0.7, cr * 0.8); g.restore(); }
    g.strokeStyle = '#9affe6'; g.lineWidth = 6 * (1 - k) + 1; g.beginPath(); g.arc(0, 0, cr, 0, TAU); g.stroke();
    g.restore();
  } });
  burstQi(x, y, 10, 1);
  if (heal) healPlayer(heal);
}
function tickJadelotus(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return;
  const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 200)) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.1 : 2.8);
  const r = (L >= 3 ? 120 : 96) * p.st.area, dmg = 18 * (L >= 2 ? 1.3 : 1);
  castAnim(p, -Math.PI / 2, 0.3);
  lotusBloom(p.x, p.y, r, dmg, L >= 5 ? 3 : 1, L >= 3, 'jadelotus');
  if (L >= 5) GAME.later(0.35, () => lotusBloom(GAME.p.x, GAME.p.y, r * 1.2, dmg * 0.8, 0, true, 'jadelotus'));
}
Object.assign(TICKS, { blutsicheltritt: tickBlutsicheltritt, blutkugeln: tickBlutkugeln, schattenfesseln: tickSchattenfesseln, blutwald: tickBlutwald, jadelotus: tickJadelotus });

/* ------------------------------------------------------------- ULTIS */
function lightningLine(pts, col) {
  addEffect({ x: pts[0][0], y: pts[0][1], dur: 0.35, layer: 1, draw(g, e, k) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      g.strokeStyle = col; g.lineWidth = 7 * (1 - k) + 1; g.beginPath(); g.moveTo(ax, ay - 18);
      for (let s = 1; s < 5; s++) g.lineTo(lerp(ax, bx, s / 5) + rand(-8, 8), lerp(ay, by, s / 5) - 18 + rand(-8, 8));
      g.lineTo(bx, by - 18); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.6; g.stroke();
    }
    g.restore();
  } });
}
const radial = (n, f) => { for (let i = 0; i < n; i++) f(i / n * TAU, i); };
const ULTI = {
  blutnova: { name: 'Blutsupernova', cd: 7, desc: 'Alle 7 s explodiert eine gewaltige Blutsonne um dich und hinterlässt ein riesiges Blutmeer.', fx(p) {
    novaBurst(p.x, p.y, 230 * areaOf('blood'), 60, 'blutnova', { big: true, kb: 260 }); bloodPool(p.x, p.y, 120 * areaOf('blood'), 4, 9, 'blutnova'); } },
  blutwisch: { name: 'Scharlachsturm', cd: 4.5, desc: 'Alle 4,5 s wirbelst du im Kreis: vier Blutwische und ein Ring aus Blutsicheln.', fx(p) {
    radial(4, (a, i) => GAME.later(i * 0.07, () => swipe(GAME.p, a, 120 * areaOf('blood'), 2.2, 32, 'blutwisch', { bleed: 5, dir: 1 })));
    GAME.later(0.3, () => radial(6, (a) => bloodCrescent(GAME.p.x, GAME.p.y, a, 30, 'blutwisch'))); } },
  bluternte: { name: 'Sichelmahlstrom', cd: 5, desc: 'Alle 5 s schleudern die Sicheln acht Blutsicheln in alle Richtungen.', fx(p) { radial(8, (a) => bloodCrescent(p.x, p.y, a, 28, 'bluternte')); } },
  schattenflammen: { name: 'Höllenschwarm', cd: 4, desc: 'Alle 4 s bricht ein Schwarm aus 12 Schattenflammen los, die überspringen.', fx(p) {
    const tg = nearestEnemies(p.x, p.y, 420, 12); if (!tg.length) return false; tg.forEach((en, i) => GAME.later(i * 0.04, () => shadowFlame(GAME.p.x, GAME.p.y - 20, en, 22, 2, 'schattenflammen', { spread: true }))); } },
  nachbilder: { name: 'Schattenlegion', cd: 8, desc: 'Alle 8 s treten drei Schattendoppelgänger um dich herum in den Kampf.', fx(p) {
    radial(3, (a) => { const img = spawnAfterimage(p, 4.5, 'after'); img.x = p.x + Math.cos(a) * 70; img.y = p.y + Math.sin(a) * 50; }); } },
  nachtschlund: { name: 'Schwarzes Loch', cd: 9, desc: 'Alle 9 s öffnet sich ein gewaltiger Schlund, der die Horde verschlingt und zerbricht.', fx(p) {
    let best = null, bs = -1; for (let k = 0; k < 10; k++) { const en = randomEnemyNear(p.x, p.y, 320); if (!en) break; let c = 0; forEnemiesInRadius(en.x, en.y, 140, () => c++); if (c > bs) { bs = c; best = en; } }
    if (!best) return false; openRift(best.x, best.y, 150 * p.st.area, 3.5, 10, 190, 'nachtschlund', true); } },
  qihand: { name: 'Tausend Hände', cd: 5, desc: 'Alle 5 s stoßen acht Geisterhände gleichzeitig in alle Richtungen.', fx(p) {
    radial(8, (a) => palmStrike(p.x, p.y, a, 170 * p.st.area, 50 * p.st.area, 34, 'qihand', { stun: 0.6 })); } },
  qikette: { name: 'Jadegewitter', cd: 3.5, desc: 'Alle 3,5 s entladen sich drei Qi-Ketten mit je 8 Sprüngen und Qi-Ringen.', fx(p) {
    let ok = false; for (let i = 0; i < 3; i++) GAME.later(i * 0.1, () => qiChain(GAME.p.x, GAME.p.y - 20, 8, 20, 'qikette', { ring: true })); ok = !!nearestEnemy(p.x, p.y, 300); return ok; } },
  blutspray: { name: 'Blutregen', cd: 4.5, desc: 'Alle 4,5 s verspritzt du 24 platzende Blutgeschosse im ganzen Kreis.', fx(p) {
    radial(24, (a) => bloodBolt(p.x, p.y - 4, a, rand(380, 460), 12, 1, true)); sfx('splat'); } },
  hammerschlag: { name: 'Erdbeben', cd: 6, desc: 'Alle 6 s schlägt Finn so hart zu, dass die Erde ringsum bebt: Schockwelle, Betäubung, Risse.', fx(p) {
    const r = 220 * p.st.area; sfx('stomp'); shake(9); hitstop(0.06);
    forEnemiesInRadius(p.x, p.y, r, (en) => dealDamage(en, 70, 'none', 'hammerschlag', { kb: 320, kx: en.x - p.x, ky: en.y - p.y, norm: true, stun: 1.0 }));
    radial(6, (a) => addDecal(p.x + Math.cos(a) * r * 0.5, p.y + Math.sin(a) * r * 0.32, ASPR.crack, r * 0.7, 0.9, 6, a));
    fxRing(p.x, p.y, 20, r, 0.5, '#ffd0a0', 12); fxRing(p.x, p.y, 10, r * 0.7, 0.4, '#ff8a3a', 6); burstAsh(p.x, p.y, 24, '#6a6064'); } },
  blitzschritt: { name: 'Tausend Blitze', cd: 5, desc: 'Alle 5 s zuckt Finn als roter Blitz durch bis zu 10 Gegner.', fx(p) {
    const tg = nearestEnemies(p.x, p.y, 420, 10); if (!tg.length) return false; const pts = [[p.x, p.y]];
    tg.forEach((en) => { pts.push([en.x, en.y]); dealDamage(en, 40, 'none', 'blitzschritt', { kb: 120, kx: en.x - p.x, ky: en.y - p.y, norm: true, stun: 0.4 }); burstSparks(en.x, en.y - 14, 6, '#ff6a7a', 0.9); });
    lightningLine(pts, '#ff3a5a'); sfx('shadowstep'); shake(3); } },
  blutsicheltritt: { name: 'Sichelwirbel', cd: 4, desc: 'Alle 4 s ein Drehtritt: zehn Blutsicheln fliegen in alle Richtungen.', fx(p) { radial(10, (a) => bloodCrescent(p.x, p.y, a, 34, 'blutsicheltritt')); } },
  blutkugeln: { name: 'Blutgewehr', cd: 3, desc: 'Alle 3 s eine Salve aus 20 durchschlagenden Blutkugeln.', fx(p) {
    if (!nearestEnemy(p.x, p.y, 380)) return false;
    for (let i = 0; i < 20; i++) GAME.later(i * 0.045, () => { const q = GAME.p, e = nearestEnemies(q.x, q.y, 380, 4); if (!e.length) return; const t = e[i % e.length], a = Math.atan2(t.y - q.y, t.x - q.x); bloodBolt(q.x, q.y - 4, a + rand(-0.08, 0.08), 680, 16, 3, i % 4 === 0); }); } },
  schattenfesseln: { name: 'Kerker der Nacht', cd: 7, desc: 'Alle 7 s fesseln Schattenketten jeden Gegner im weiten Umkreis 2 s lang.', fx(p) {
    const tg = nearestEnemies(p.x, p.y, 260, 30); if (!tg.length) return false; tg.forEach((en) => shadowChain(p, en, 2, 10, 'schattenfesseln', true)); burstShadow(p.x, p.y, 20, 1.4); fxRing(p.x, p.y, 20, 260, 0.5, '#a77bff', 8); } },
  blutwald: { name: 'Blutforst', cd: 6, desc: 'Alle 6 s wächst ein ganzer Wald aus Blutdornen um dich herum.', fx(p) {
    for (let i = 0; i < 14; i++) GAME.later(i * 0.04, () => { const a = i / 14 * TAU * 2, d = 60 + (i / 14) * 180; bloodThorns(GAME.p.x + Math.cos(a) * d, GAME.p.y + Math.sin(a) * d * 0.7, 50 * areaOf('blood'), 36, 'blutwald', i % 3 === 0); }); } },
  jadelotus: { name: 'Tausendblättriger Lotus', cd: 6, desc: 'Alle 6 s erblüht ein riesiger Lotus: schleudert alles fort und heilt 8 % Leben.', fx(p) {
    lotusBloom(p.x, p.y, 260 * p.st.area, 50, p.st.maxHp * 0.08, true, 'jadelotus'); shake(4); } }
};
function ultiReady(p) { return Object.keys(p.ab).filter((id) => ULTI[id] && CARDS[id] && !p.ab[id].ulti && p.ab[id].lvl >= CARDS[id].max); }
function tickUlti(p, id, ab, dt) {
  ab.ut = (ab.ut === undefined ? 1.5 : ab.ut) - dt;
  if (ab.ut > 0) return;
  const U = ULTI[id];
  const r = U.fx(p, ab);
  ab.ut = r === false ? 0.4 : cdOf(U.cd);
  if (r !== false) addLight(p.x, p.y, 220, '#ffe6a0', 0.6);
}
// Karten: eine bereite Ulti ersetzt die schwaechste Karte im Angebot
const _makeOffersU = makeOffers;
makeOffers = function () {
  const out = _makeOffersU(), p = GAME.p, ready = ultiReady(p);
  if (ready.length) {
    const id = ready[Math.floor(Math.random() * ready.length)];
    const i = out.findIndex((o) => o.filler); out[i >= 0 ? i : out.length - 1] = { id: 'ulti:' + id, ulti: id };
  }
  return out;
};
const _giveCardU = giveCard;
giveCard = function (id, silent) {
  if (typeof id === 'string' && id.startsWith('ulti:')) {
    const k = id.slice(5), p = GAME.p, ab = p.ab[k]; if (!ab) return;
    ab.ulti = true; ab.ut = 0.8;
    sfx('fusion'); shake(8); hitstop(0.15); GAME.slowmo = Math.max(GAME.slowmo, 0.8);
    fxRing(p.x, p.y, 10, 260, 0.8, '#ffe6a0', 10); fxRing(p.x, p.y, 10, 180, 0.6, SCHOOL[CARDS[k].school].col, 6);
    const s = CARDS[k].school; if (s === 'blood') burstBlood(p.x, p.y, 30, 1.6); else if (s === 'shadow') burstShadow(p.x, p.y, 24, 1.6); else if (s === 'qi') burstQi(p.x, p.y, 30, 1.6); else burstSparks(p.x, p.y - 20, 20, '#ffe6a0', 1.4);
    UI.announce('ULTI: ' + ULTI[k].name, 'fusion');
    (GAME.stats.ultis || (GAME.stats.ultis = [])).push(k);
    return;
  }
  return _giveCardU(id, silent);
};
Object.assign(SRC_NAMES, Object.fromEntries(Object.keys(ULTI).map((k) => ['ulti_' + k, ULTI[k].name])));

/* ------------------------------------------------------------- Symbole */
Object.assign(ICON_EXTRA, {
  blutsicheltritt(g, glow) { glow('#ff2a40', 30); g.fillStyle = '#2a0a10'; g.beginPath(); g.moveTo(-30, 26); g.lineTo(-10, -4); g.lineTo(-2, 0); g.lineTo(-18, 30); g.closePath(); g.fill(); g.rotate(-0.3); g.drawImage(ASPR.crescent, -6, -40, 56, 56); },
  blutkugeln(g, glow) { glow('#ff2a40', 24); for (let i = 0; i < 3; i++) { g.save(); g.translate(-22 + i * 20, 10 - i * 10); g.rotate(-0.45); g.drawImage(PART.drop, -14, -6, 28, 12); g.restore(); } g.strokeStyle = '#ffd0d6'; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, 26); g.lineTo(-24, 18); g.stroke(); },
  schattenfesseln(g, glow) { g.drawImage(PART.shadowwisp, -40, -30, 80, 60); g.strokeStyle = '#c7a6ff'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-30 + i * 12, -24 + i * 10, 7, 4, 0.7, 0, TAU); g.stroke(); } glow('#a77bff', 18); },
  blutwald(g, glow) { glow('#ff2a40', 28); for (const [x, h] of [[-24, 34], [-8, 46], [8, 38], [24, 28]]) { g.fillStyle = lg(g, x, 26 - h, x, 26, [0, '#ffd0d6', 0.3, '#e0203a', 1, '#5a0010']); g.beginPath(); g.moveTo(x - 7, 26); g.lineTo(x, 26 - h); g.lineTo(x + 7, 26); g.fill(); } },
  jadelotus(g, glow) { glow('#4ff0cc', 34); g.globalCompositeOperation = 'lighter'; g.drawImage(ASPR.lotus, -40, -36, 80, 80); }
});

/* ------------------------------------------------------------- Karten-Oberflaeche und Plaetze */
const _showLevelUpU = UI.showLevelUp;
UI.showLevelUp = function (offers) {
  const d = _showLevelUpU.call(this, offers.map((o) => (o.ulti ? { id: o.ulti } : o)));
  offers.forEach((o, i) => {
    if (!o.ulti) return;
    const b = document.querySelector(`#levelup .card[data-i="${i}"]`); if (!b) return;
    const C = CARDS[o.ulti], U = ULTI[o.ulti];
    b.className = 'card fusion';
    b.innerHTML = `<div class="ci"><img src="${icon(o.ulti)}"></div><div class="cb"><div class="cn">✦ ULTI: ${U.name}</div><div class="cm"><span class="tag" style="color:#ffe6a0">ULTI</span><span class="tag t-${C.school}">${SCHOOL[C.school].name.toUpperCase()}</span><span class="tag" style="color:#c8b8a8">${C.name.toUpperCase()} STUFE 5</span></div><div class="cd">${U.desc}</div><div class="next">${C.name} entwickelt sich weiter und feuert 30 % schneller.</div></div>`;
  });
  return d;
};
