'use strict';
/* ==========================================================================
   FINN MUELLER — der Held, der mit nichts beginnt.
   Mensch -> (Buch) Halbling -> Vampir -> Vampiradliger -> Vampirlord ->
   Himmlischer Vampirlord -> Reiner Himmlischer -> Gottbezwinger.
   Jede Evolution veraendert Aussehen, Werte und Faehigkeiten.
   Fan-Figur (angelehnt an "My Vampire System") — nur fuer den privaten Gebrauch.
   ========================================================================== */

/* ------------------------------------------------------------- Evolutionen */
const FINN_TIERS = [
  { id: 'mensch', name: 'Mensch', hp: 80, speed: 150, armor: 0, might: 1, req: null, slots: 0, rim: '#b8b8c8', col: '#c8c8d8',
    grants: [], unlocks: [], desc: 'Keine Kräfte. Finde das Buch!' },
  { id: 'halbling', name: 'Halbling', hp: 100, speed: 158, armor: 0, might: 1, req: { text: 'Finde das Buch (erster Lauf).' }, slots: 4, rim: '#ff4a5a', col: '#ff4a5a',
    grants: ['blutwisch', 'blutspray'], unlocks: ['blutwisch', 'blutspray', 'lebensraub', 'vampirblut', 'nebelgang', 'grabesmacht', 'seelenmagnet'],
    desc: 'Das Buch erwacht. Blutwisch und Blutspray.' },
  { id: 'vampir', name: 'Vampir', hp: 125, speed: 168, armor: 1, might: 1.1, req: { essence: 600, text: 'Überlebe 5 Minuten', check: (r) => r.t >= 300 }, slots: 6, rim: '#ff2a40', col: '#ff2a40',
    grants: ['hammerschlag', 'blitzschritt'], unlocks: ['hammerschlag', 'blitzschritt', 'kettenreaktion'],
    desc: 'Hammerschlag und Blitzschritt. Ausweichen wird zum Blitz-Teleport.' },
  { id: 'adliger', name: 'Vampiradliger', hp: 150, speed: 175, armor: 1, might: 1.22, req: { essence: 2500, text: 'Erreiche Stufe 22 in einem Lauf', check: (r) => r.level >= 22 }, slots: 7, rim: '#b07bff', col: '#a77bff',
    grants: ['schattenflammen'], unlocks: [],
    desc: 'Oberhaupt der zehnten Familie: Adelsmantel, mehr Kraft, Schattenflammen von Beginn an.' },
  { id: 'lord', name: 'Vampirlord', hp: 180, speed: 180, armor: 2, might: 1.38, req: { essence: 6000, text: 'Besiege Hauptmann Kharn', check: (r) => r.miniKilled }, slots: 8, rim: '#ff3a4e', col: '#4ff0cc',
    grants: ['qihand', 'blutnova'], unlocks: [],
    desc: 'Der Sonnenmalus ist herausgewachsen: Qi-Hand und Blutnova von Beginn an.' },
  { id: 'himmelslord', name: 'Himmlischer Vampirlord', hp: 210, speed: 186, armor: 2, might: 1.55, req: { essence: 11000, text: 'Besiege Vaelgor, den Gruftkoloss', check: (r) => r.won }, slots: 9, rim: '#ffd27a', col: '#ffd27a',
    grants: ['himmelsstrahl'], unlocks: [],
    desc: 'Himmelslicht: Lichtsäulen strafen die Toten. Blut, Schatten und Qi verschmelzen.' },
  { id: 'rein', name: 'Reiner Himmlischer', hp: 245, speed: 192, armor: 3, might: 1.75, req: { essence: 18000, text: 'Besiege Vaelgor — insgesamt 3 Siege mit Finn', check: (r) => r.won && r.wins >= 3 }, slots: 9, rim: '#fff4d0', col: '#fff4d0',
    grants: ['siegel'], unlocks: [],
    desc: 'Alle Kräfte vereint: das Dreifaltige Siegel.' },
  { id: 'gott', name: 'Gottbezwinger', hp: 300, speed: 200, armor: 4, might: 2.05, req: { essence: 28000, text: 'Besiege Vaelgor in der Form des Reinen Himmlischen mit über 50 % Leben', check: (r) => r.won && r.hpFrac > 0.5 }, slots: 10, rim: '#ffb040', col: '#ffb040',
    grants: ['goetterfall'], unlocks: [],
    desc: 'Götterfall: Speere aus Gold und Blut regnen vom Himmel.' }
];

/* ------------------------------------------------------------- Held */
HEROES.finn = {
  name: 'Finn Müller', title: 'Vom Nichts zum Gottbezwinger', school: 'blood', diff: 2,
  role: 'Evolution · beginnt ohne Kräfte · wird immer stärker',
  hp: 80, speed: 150, armor: 0, dodgeCd: 2.6, dodge: 'roll',
  start: null, slots: 0, evo: true,
  mech: { name: 'Evolution', desc: 'Im allerersten Lauf ist Finn ein Mensch ohne jede Fähigkeit und muss das Buch finden — danach ist er dauerhaft Halbling. Jede weitere Evolution ist dauerhaft und muss über viele Läufe verdient werden: Jeder Lauf bringt Blutessenz (Kills, Zeit, Stufe, Sieg). Hat Finn genug Essenz UND besteht im Lauf die Prüfung seiner Form, entwickelt er sich nach dem Lauf weiter. Im Lauf selbst kämpft er nur mit den Kräften seiner aktuellen Form und verbessert sie über Karten.' },
  ult: { id: 'erwachen', name: 'Erwachen', cd: 17, desc: 'Entfesselt alles, was Finn bisher gelernt hat: Blut, ab Adliger Schatten, ab Lord Qi, ab Himmlischer Licht — und als Gottbezwinger alles zugleich.' },
  strengths: ['Wächst am stärksten von allen', 'Lernt Blut, Schatten, Qi und Licht', 'Späte Formen sind übermächtig'],
  weaknesses: ['Anfangs völlig wehrlos', 'Früher Abschnitt ist gefährlich', 'Muss die Stufen schnell erreichen'],
  builds: [
    { name: 'Blutkämpfer', desc: 'Blutwisch + Hammerschlag + Lebensraub: nah ran, zuschlagen, heilen.' },
    { name: 'Schattenadliger', desc: 'Blitzschritt + Schattenflammen + Nachbilder: schnell, unberührbar.' },
    { name: 'Gottbezwinger', desc: 'Alles sammeln — ab Reiner Himmlischer kombiniert das Siegel jede Kraft.' }
  ],
  pool: [],
  unlock: { desc: 'Von Anfang an verfügbar.', cost: 0, check: () => true },
  baseStats(p) { return FINN_TIERS[p.tier || 0]; },
  poolOf(p) { const s = new Set(); for (let i = 0; i <= (p.tier || 0); i++) FINN_TIERS[i].unlocks.forEach((c) => s.add(c)); if ((p.tier || 0) >= 1 && typeof finnSkills === 'function') finnSkills().forEach((k) => FINN_SKILLS[k].cards.forEach((c) => s.add(c))); return [...s]; },
  slotsOf(p) { return FINN_TIERS[p.tier || 0].slots; }
};
HERO_ORDER.push('finn');
FUSIONS.siegel.heroes.push('finn');
FUSIONS.finsternis.heroes.push('finn');
FUSIONS.drachenherz.heroes.push('finn');
FUSIONS.spiegel.heroes.push('finn');
FUSIONS.blutmond.heroes.push('finn');

/* ------------------------------------------------------------- neue Karten */
CARDS.blutspray = {
  name: 'Blutspray', school: 'blood', kind: 'ability', max: 5, tags: ['Fernkampf', 'Streuung'],
  lv: [
    'Verspritzt alle 1,4 s einen Fächer aus 5 Blutgeschossen: je 8 Schaden.',
    '+2 Geschosse.',
    '+35 % Schaden, Geschosse durchbohren einen Gegner.',
    '+2 Geschosse, Abklingzeit 1,1 s.',
    'Platzen: jedes Geschoss zerplatzt beim Treffer in einer kleinen Blutexplosion.'
  ]
};
CARDS.hammerschlag = {
  name: 'Hammerschlag', school: 'none', kind: 'ability', max: 5, tags: ['Wucht', 'Betäubung'],
  lv: [
    'Alle 3 s ein vernichtender Faustschlag in den Boden vor dir: 40 Schaden, Rückstoß, 0,6 s Betäubung.',
    '+40 % Schaden.',
    'Größerer Einschlag und eine Schockwelle rollt nach außen.',
    'Abklingzeit 2,3 s.',
    'Erdspalt: der Boden reißt auf und verletzt weiter.'
  ]
};
CARDS.blitzschritt = {
  name: 'Blitzschritt', school: 'none', kind: 'ability', max: 5, tags: ['Tempo', 'Kette'],
  lv: [
    'Alle 3,5 s blitzt ein Abbild von dir durch bis zu 3 Gegner: je 22 Schaden.',
    '+40 % Schaden.',
    '+2 Ziele.',
    'Abklingzeit 2,6 s.',
    'Nachbrennen: jeder Treffer explodiert kurz darauf in rotem Blitz.'
  ]
};
ABILITY_SCHOOL.blutspray = 'blood';
Object.assign(SRC_NAMES, { blutspray: 'Blutspray', hammerschlag: 'Hammerschlag', blitzschritt: 'Blitzschritt', himmelsstrahl: 'Himmelsstrahl', goetterfall: 'Götterfall', erwachen: 'Erwachen' });

/* ------------------------------------------------------------- Faehigkeiten */
function tickBlutspray(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 1.1 : 1.4);
  const n = 5 + (L >= 2 ? 2 : 0) + (L >= 4 ? 2 : 0);
  const dmg = 8 * (L >= 3 ? 1.35 : 1);
  const ang = aimDir(p, 300);
  castAnim(p, ang, 0.22);
  sfx('whip', 0, 0.05); sfx('splat', 0, 0.05);
  const spread = 0.95;
  for (let i = 0; i < n; i++) {
    const a = ang + (i / (n - 1) - 0.5) * spread + rand(-0.05, 0.05);
    bloodBolt(p.x + Math.cos(ang) * 12, p.y - 2 + Math.sin(ang) * 8, a, rand(360, 430), dmg, L >= 3 ? 1 : 0, L >= 5);
  }
  burstBlood(p.x + Math.cos(ang) * 16, p.y + Math.sin(ang) * 10, 6, 0.8, ang);
}
function bloodBolt(x, y, a, sp, dmg, pierce, pop) {
  const hit = new Set();
  let left = pierce;
  addEffect({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dur: 0.7, layer: 2, update(e, dt) {
    e.x += e.vx * dt; e.y += e.vy * dt;
    let done = false;
    forEnemiesInRadius(e.x, e.y, 8, (en) => {
      if (done || hit.has(en.id)) return;
      hit.add(en.id);
      dealDamage(en, dmg, 'blood', 'blutspray', { kb: 50, kx: e.vx, ky: e.vy });
      splat(en.x, en.y, 12);
      if (pop) bloodBurstAt(en.x, en.y, 30 * GAME.p.st.area, dmg * 0.6, 'blutspray');
      if (--left < 0) done = true;
    });
    if (done) e.dead = true;
    if (Math.random() < 0.35 * FXQ) spawnPart({ x: e.x, y: e.y, z: 12, vx: e.vx * 0.1, vy: e.vy * 0.1, vz: 10, g: 400, life: 0.4, size: 2, size1: 1, spr: PART.drop, splat: Math.random() < 0.2 ? 1 : 0 });
  }, draw(g, e, k) {
    const ang = Math.atan2(e.vy, e.vx);
    g.save(); g.translate(e.x, e.y - 14); g.rotate(ang);
    g.globalAlpha = 1 - k * k;
    g.drawImage(PART.drop, -12, -4, 20, 8);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * (1 - k);
    g.drawImage(glowSprite('#ff2a40'), -14, -8, 22, 16);
    g.restore();
  } });
}
function tickHammerschlag(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  const L = ab.lvl;
  const tgt = nearestEnemy(p.x, p.y, 170);
  if (!tgt) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 2.3 : 3);
  const ang = Math.atan2(tgt.y - p.y, tgt.x - p.x);
  const reach = 46;
  const x = p.x + Math.cos(ang) * reach, y = p.y + Math.sin(ang) * reach * 0.8;
  const r = (L >= 3 ? 88 : 70) * p.st.area;
  const dmg = 40 * (L >= 2 ? 1.4 : 1);
  castAnim(p, ang + 0.6, 0.35);
  // kurzes Ausholen, dann Einschlag
  GAME.later(0.1, () => {
    sfx('stomp'); shake(6); hitstop(0.05);
    forEnemiesInRadius(x, y, r, (en) => dealDamage(en, dmg, 'none', 'hammerschlag', { kb: 300, kx: en.x - p.x, ky: en.y - p.y, norm: true, stun: 0.6 }));
    addDecal(x, y, ASPR.crack, r * 1.6, 0.9, 6, 0);
    fxRing(x, y, 10, r * 1.1, 0.3, '#ffd0a0', 7); fxFlash(x, y - 6, r * 0.6, '#ffb070', 0.18);
    burstAsh(x, y, 10, '#6a6064');
    for (let i = 0; i < 12; i++) { const a = Math.random() * TAU; spawnPart({ x, y, z: 4, vx: Math.cos(a) * rand(60, 180), vy: Math.sin(a) * rand(40, 120), vz: rand(120, 240), g: 600, life: 0.9, size: rand(2.5, 5), size1: 2.5, spr: tinted('ash', '#7a7074') }); }
    if (L >= 3) {
      const hit = new Set();
      addEffect({ x, y, dur: 0.45, layer: 0, update(e) { const cr = r + e.t / 0.45 * r * 1.3; forEnemiesInRadius(x, y, cr, (en) => { if (hit.has(en.id) || dist2(en.x, en.y, x, y) < (cr - 25) ** 2) return; hit.add(en.id); dealDamage(en, dmg * 0.45, 'none', 'hammerschlag', { kb: 160, kx: en.x - x, ky: en.y - y, norm: true, quiet: true }); }); },
        draw(g, e, k) { const cr = r + k * r * 1.3; g.globalAlpha = 1 - k; g.strokeStyle = '#8a7a6a'; g.lineWidth = 8 * (1 - k) + 1; g.beginPath(); g.ellipse(x, y, cr, cr * 0.62, 0, 0, TAU); g.stroke(); g.globalAlpha = 1; } });
    }
    if (L >= 5) {
      let tick = 0;
      addEffect({ x, y, dur: 2.2, layer: 0, update(e, dt) { tick -= dt; if (tick > 0) return; tick = 0.35; forEnemiesInRadius(x, y, r * 0.8, (en) => dealDamage(en, 8, 'none', 'hammerschlag', { quiet: true })); if (Math.random() < 0.5) burstSparks(x + rand(-r * 0.5, r * 0.5), y + rand(-r * 0.3, r * 0.3), 2, '#ff8a3a', 0.4); addLight(x, y, r * 1.5, '#ff6a2a', 0.5); },
        draw(g, e, k) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - k) * 0.6; g.drawImage(glowSprite('#ff5a1a'), x - r * 0.7, y - r * 0.4, r * 1.4, r * 0.8); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; } });
    }
  });
}
function tickBlitzschritt(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  const L = ab.lvl;
  const n = 3 + (L >= 3 ? 2 : 0);
  const tg = nearestEnemies(p.x, p.y, 280, n);
  if (!tg.length) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 2.6 : 3.5);
  const dmg = 22 * (L >= 2 ? 1.4 : 1);
  sfx('shadowstep');
  const pts = [[p.x, p.y]];
  tg.forEach((en, i) => {
    GAME.later(i * 0.06, () => {
      if (en.dead) return;
      pts.push([en.x, en.y]);
      dealDamage(en, dmg, 'none', 'blitzschritt', { kb: 90, kx: en.x - p.x, ky: en.y - p.y, norm: true });
      burstSparks(en.x, en.y - 14, 5, '#ff6a7a', 0.8);
      if (L >= 5) { const ex = en.x, ey = en.y; GAME.later(0.25, () => { forEnemiesInRadius(ex, ey, 40, (o) => dealDamage(o, dmg * 0.5, 'none', 'blitzschritt', { quiet: true })); fxFlash(ex, ey - 10, 30, '#ff3a5a', 0.15); sfx('chain', 0, 0.05); }); }
    });
  });
  addEffect({ x: p.x, y: p.y, dur: n * 0.06 + 0.3, layer: 1, draw(g, e) {
    g.globalCompositeOperation = 'lighter';
    for (let i = 1; i < pts.length; i++) {
      const age = e.t - (i - 1) * 0.06, a = clamp(1 - age / 0.3, 0, 1);
      if (a <= 0) continue;
      g.globalAlpha = a;
      g.strokeStyle = '#ff3a5a'; g.lineWidth = 7 * a + 1;
      g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1] - 18); g.lineTo(pts[i][0], pts[i][1] - 18); g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 1.8 * a; g.stroke();
      // Abbild am Ziel
      if (GAME.p.spr) { g.globalAlpha = a * 0.5; const s = GAME.p.spr, sc = 1 / s.px; g.save(); g.translate(pts[i][0], pts[i][1]); g.scale(sc, sc); g.drawImage(s.out, -s.S / 2, -s.anchorY); g.restore(); }
    }
  } });
}
// Himmlisch: Lichtsaeulen vom Himmel
function tickHimmelsstrahl(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  ab.t = cdOf(1.6);
  const n = 2 + Math.max(0, (p.tier || 0) - 5) * 2;
  for (let i = 0; i < n; i++) {
    const en = randomEnemyNear(p.x, p.y, 300);
    if (!en) break;
    GAME.later(i * 0.12, () => lightPillar(en.x + rand(-6, 6), en.y + rand(-4, 4), 44, 55, 'himmelsstrahl', '#ffe6a0'));
  }
}
function lightPillar(x, y, r, dmg, src, col) {
  fxTelegraphCircle(x, y, r, 0.22, '#ffe6a0');
  GAME.later(0.22, () => {
    sfx('palm', 0, 0.06);
    forEnemiesInRadius(x, y, r, (en) => dealDamage(en, dmg, 'none', src, { kb: 60, kx: en.x - x, ky: en.y - y, norm: true, extraMarks: ['b', 's', 'q'] }));
    burstSparks(x, y, 8, col, 1);
    addEffect({ x, y, dur: 0.45, layer: 1, update() { addLight(x, y, 160, col, 1 - this.t / 0.45); }, draw(g, e, k) {
      g.globalCompositeOperation = 'lighter';
      const w = r * (1 - k * 0.6);
      g.globalAlpha = (1 - k);
      g.fillStyle = lg(g, x - w, 0, x + w, 0, [0, rgba(col, 0), 0.35, rgba(col, 0.7), 0.5, 'rgba(255,255,255,0.95)', 0.65, rgba(col, 0.7), 1, rgba(col, 0)]);
      g.fillRect(x - w, y - 420, w * 2, 420);
      g.drawImage(glowSprite(col, true), x - r * 1.4, y - r * 0.9, r * 2.8, r * 1.8);
    } });
  });
}
// Gottbezwinger: Speerregen
function tickGoetterfall(p, ab, dt) {
  ab.t -= dt;
  if (ab.t > 0) return;
  ab.t = cdOf(2.4);
  sfx('bigNova', 0, 0.3);
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + Math.random() * 0.5, d = rand(60, 200);
    const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d * 0.7;
    GAME.later(i * 0.05, () => spear(x, y));
  }
}
function spear(x, y) {
  const r = 46 * GAME.p.st.area;
  addEffect({ x, y, dur: 0.25, layer: 2, draw(g, e, k) {
    const yy = lerp(y - 360, y - 10, easeIn(k));
    g.save(); g.translate(x, yy); g.rotate(0.15);
    g.fillStyle = lg(g, 0, -60, 0, 10, [0, 'rgba(255,220,140,0)', 0.3, '#ffd27a', 0.8, '#fff6d8', 1, '#c01030']);
    g.beginPath(); g.moveTo(-3, -60); g.lineTo(3, -60); g.lineTo(4, 0); g.lineTo(0, 12); g.lineTo(-4, 0); g.closePath(); g.fill();
    g.restore();
  }, update(e) { if (e.t + 1 / 60 >= e.dur && !e.done) {
    e.done = true;
    forEnemiesInRadius(x, y, r, (en) => dealDamage(en, 60, 'none', 'goetterfall', { kb: 150, kx: en.x - x, ky: en.y - y, norm: true, extraMarks: ['b', 's', 'q'] }));
    fxRing(x, y, 6, r, 0.3, '#ffd27a', 5); fxFlash(x, y - 8, 40, '#ffb040', 0.2); burstBlood(x, y, 4, 0.8); shake(1.5);
  } } });
}
Object.assign(TICKS, { blutspray: tickBlutspray, hammerschlag: tickHammerschlag, blitzschritt: tickBlitzschritt, himmelsstrahl: tickHimmelsstrahl, goetterfall: tickGoetterfall });

/* ------------------------------------------------------------- Ultimate: Erwachen */
ULTS.erwachen = function (p) {
  const T = p.tier || 0;
  sfx('ult'); shake(6 + T); hitstop(0.06);
  castAnim(p, -Math.PI / 2, 0.7);
  const r = (130 + T * 14) * p.st.area;
  novaBurst(p.x, p.y, r, 30 + T * 10, 'erwachen', { big: true, kb: 240, col: T >= 5 ? '#ffd27a' : '#ff2a40' });
  if (T >= 3) { const tg = nearestEnemies(p.x, p.y, 420, 6 + T); tg.forEach((en, i) => GAME.later(0.05 * i, () => shadowFlame(GAME.p.x, GAME.p.y - 30, en, 20 + T * 4, 2, 'erwachen'))); }
  if (T >= 4) GAME.later(0.25, () => { const q = GAME.p, rr = r * 1.15; forEnemiesInRadius(q.x, q.y, rr, (en) => dealDamage(en, 20 + T * 5, 'qi', 'erwachen', { kb: 320, kx: en.x - q.x, ky: en.y - q.y, norm: true })); fxRing(q.x, q.y, 20, rr, 0.45, '#4ff0cc', 9); });
  if (T >= 5) for (let i = 0; i < 4 + (T - 5) * 4; i++) GAME.later(0.3 + i * 0.07, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 360); if (en) lightPillar(en.x, en.y, 50, 70, 'erwachen', '#ffe6a0'); });
  if (T >= 7) { GAME.slowmo = 2; for (let i = 0; i < 3; i++) GAME.later(0.5 + i * 0.25, () => { const q = GAME.p; for (let k = 0; k < 8; k++) { const a = Math.random() * TAU, d = rand(40, 260); spear(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d * 0.7); } }); }
  fxFlash(p.x, p.y - 40, 120 + T * 20, T >= 5 ? '#ffe6a0' : '#ff2a40', 0.35);
};

/* ------------------------------------------------------------- Buch & Evolution
   Die Form ist DAUERHAFT (Speicherstand). Im Lauf kaempft Finn nur mit den
   Kraeften seiner Form; die naechste Form wird nach dem Lauf verdient. */
function finnSave() {
  if (!SAVE.finn) SAVE.finn = { tier: 0, essence: 0, wins: 0, runs: 0 };
  return SAVE.finn;
}
function finnGrant(p, tier) {
  for (const c of FINN_TIERS[tier].grants) {
    if (p.ab[c]) continue;
    if (!CARDS[c]) { p.ab[c] = { lvl: 1, t: 0.5, fusion: c === 'siegel' }; continue; }
    if (Object.keys(FUSIONS).some((f) => p.ab[f] && FUSIONS[f].consumes.includes(c))) continue;
    p.ab[c] = { lvl: 1, t: 0.4 }; p.order.push(c);
  }
}
function finnDodge(tier) {
  if (tier >= 2 && typeof finnSkills === 'function' && finnSkills().has('schatten')) return 'shadowstep';
  return tier >= 3 ? 'shadowstep' : tier >= 2 ? 'blink' : undefined;
}
function finnStart() {
  const G = GAME, p = G.p, F = finnSave();
  const tier = clamp(G.finnTier !== undefined ? G.finnTier : F.tier, 0, FINN_TIERS.length - 1);
  p.tier = tier;
  G.finnStartTier = tier;
  for (let t = 1; t <= tier; t++) finnGrant(p, t);
  p.dodgeKind = finnDodge(tier);
  recomputeStats(); p.hp = p.st.maxHp;
  if (tier === 0) {
    const a = Math.random() * TAU;
    G.pickups.push({ kind: 'book', x: Math.cos(a) * 150, y: Math.sin(a) * 120, v: 1, magnet: false, vx: 0, vy: 0, t: 0, z: 0, vz: 0 });
    GAME.later(0.8, () => UI.announce('Finde das Buch!', ''));
  } else GAME.later(0.8, () => UI.announce(FINN_TIERS[tier].name.toUpperCase(), ''));
}
// nur fuer das Buch: die Verwandlung Mensch -> Halbling passiert im Lauf
function finnEvolve(tier) {
  const G = GAME, p = G.p, T = FINN_TIERS[tier];
  p.tier = tier;
  finnGrant(p, tier);
  p.dodgeKind = finnDodge(tier);
  recomputeStats();
  p.hp = p.st.maxHp;
  p.iframes = Math.max(p.iframes, 1.5);
  const F = finnSave();
  if (tier === 1 && F.tier < 1 && !G.finnTest) { F.tier = 1; writeSave(); }
  sfx('fusion'); shake(10); hitstop(0.2); G.slowmo = Math.max(G.slowmo, 1.2);
  const col = T.col;
  addEffect({ x: p.x, y: p.y, dur: 1.2, layer: 1, draw(g, e, k) {
    const q = GAME.p;
    g.globalCompositeOperation = 'lighter';
    const w = 50 * (1 - k * 0.5);
    g.globalAlpha = 1 - k;
    g.fillStyle = lg(g, q.x - w, 0, q.x + w, 0, [0, rgba(col, 0), 0.4, rgba(col, 0.8), 0.5, 'rgba(255,255,255,1)', 0.6, rgba(col, 0.8), 1, rgba(col, 0)]);
    g.fillRect(q.x - w, q.y - 600, w * 2, 600);
  }, update() { addLight(GAME.p.x, GAME.p.y, 400, col, 1); } });
  fxRing(p.x, p.y, 10, 280, 0.7, col, 12); fxRing(p.x, p.y, 10, 200, 0.6, '#ffffff', 4);
  forEnemiesInRadius(p.x, p.y, 240, (en) => { if (!en.boss) { const a = Math.atan2(en.y - p.y, en.x - p.x); en.kvx += Math.cos(a) * 500 / Math.sqrt(en.mass); en.kvy += Math.sin(a) * 500 / Math.sqrt(en.mass); } });
  burstBlood(p.x, p.y, 24, 1.5);
  UI.evolution(T, FINN_TIERS[tier + 1]);
}
// Essenz dieses Laufs (wird laufend im HUD gezeigt)
function finnRunEssence(G, won) {
  return Math.round(G.kills * 0.25 + G.t * 0.9 + G.level * 12 + (G.miniKilled ? 150 : 0) + (won ? 500 : 0));
}
// nach dem Lauf: Essenz gutschreiben, Pruefung auswerten, evtl. dauerhaft entwickeln
function finnEndRun(won) {
  const G = GAME, p = G.p, F = finnSave();
  const res = { gain: finnRunEssence(G, won), evolved: null, test: !!G.finnTest };
  if (G.finnTest) { res.note = 'Testform gewählt — dieser Lauf zählt nicht für die Evolution.'; return res; }
  F.runs++; F.essence += res.gain; if (won) F.wins++;
  const N = FINN_TIERS[F.tier + 1];
  res.next = N;
  if (N && F.tier >= 1) {
    const r = { t: G.t, level: G.level, won, miniKilled: !!G.miniKilled, wins: F.wins, hpFrac: p.hp / p.st.maxHp, tier: G.finnStartTier };
    const formOk = G.finnStartTier === F.tier;          // Pruefung muss in der aktuellen Form bestanden werden
    res.trial = formOk && N.req.check(r);
    res.enough = F.essence >= N.req.essence;
    if (res.trial && res.enough) { F.tier++; res.evolved = N; res.next = FINN_TIERS[F.tier + 1]; }
  }
  return res;
}
SAVE.unlocked.finn = true;
HEROES.finn.onStart = finnStart;
HEROES.finn.onEnd = finnEndRun;

/* ============================================================ FINN (Figur)
   Aussehen haengt von der Evolutionsstufe ab: Kapuzenpulli & Brille ->
   Lederjacke -> Adelsmantel -> Umhang & Krone -> Heiligenschein & Lichtfluegel
   -> weisses Gewand -> schwarz-goldene Ruestung eines Gottbezwingers. */
const SPEC_FINN = { hipY: -26, torso: 20, headOff: 8.5, shoulderW: 11, legL: 13, legL2: 13, armL: 10.5, armL2: 10.5, stride: 8.5, lift: 4.6, lean: 0.05, shoulderDrop: 3, armRest: 0.1 };
const FINN_LOOK = [
  { top: '#5c5e6c', topL: '#8a8c9a', topD: '#2c2e38', leg: '#34405a', legD: '#1a2030', shoe: '#e8e8ea', skin: '#e8c6ac', skinD: '#b08a74', hair: '#2a1c16', eye: '#6a4a2a', glasses: true, trim: null },
  { top: '#4c4e5c', topL: '#7a7c8a', topD: '#24262e', leg: '#2c3448', legD: '#161a26', shoe: '#d8d8da', skin: '#e4d4d4', skinD: '#a89098', hair: '#221612', eye: '#ff3a4a', glasses: true, trim: '#8a1020' },
  { top: '#1e1c22', topL: '#46424e', topD: '#0c0a0e', leg: '#1a1a20', legD: '#0a0a0e', shoe: '#221a1a', skin: '#ddd0d6', skinD: '#9c8a96', hair: '#1a1210', eye: '#ff2a3a', shirt: '#8a0a1a', trim: '#b01830' },
  { top: '#16121a', topL: '#3a3044', topD: '#060408', leg: '#16141a', legD: '#08070a', shoe: '#1a1418', skin: '#d8ccd4', skinD: '#968898', hair: '#140e0e', eye: '#ff2a3a', shirt: '#6a0816', trim: '#c9c0d8', coat: true, lining: '#7a0a1a' },
  { top: '#18121a', topL: '#3e3246', topD: '#060408', leg: '#16141a', legD: '#08070a', shoe: '#1a1418', skin: '#d8ccd4', skinD: '#968898', hair: '#140e0e', eye: '#ff3a4a', shirt: '#6a0816', trim: '#d8d0e8', coat: true, lining: '#8a0a1c', cape: '#7a0a1a', capeD: '#2a0208', crown: '#d0c8dc', tattoo: '#5ff0d0' },
  { top: '#1e1620', topL: '#4a3a4a', topD: '#080508', leg: '#1a1616', legD: '#0a0808', shoe: '#2a1e14', skin: '#e0d2d4', skinD: '#9a8a8e', hair: '#1a1210', eye: '#ffd27a', shirt: '#7a0a16', trim: '#e6c070', coat: true, lining: '#8a0a1c', cape: '#8a0a1c', capeD: '#3a0408', crown: '#f0d080', tattoo: '#5ff0d0', halo: '#ffe6a0', wings: 0.7, wingCol: '#ffe6a0' },
  { top: '#e8e2d6', topL: '#ffffff', topD: '#a8a092', leg: '#d8d0c2', legD: '#8a8272', shoe: '#e6c070', skin: '#f0e4e0', skinD: '#b0a0a0', hair: '#e8e8f0', eye: '#ffd27a', shirt: '#f4eee4', trim: '#e6c070', coat: true, lining: '#e6c070', cape: '#f4eee4', capeD: '#b0a898', crown: '#fff0b0', tattoo: '#ffe6a0', halo: '#fff4d0', wings: 1, wingCol: '#fff4d0' },
  { top: '#1a1410', topL: '#4a3a24', topD: '#050302', leg: '#161210', legD: '#060403', shoe: '#c9a24c', skin: '#e0d0d0', skinD: '#9a8686', hair: '#0e0a0a', eye: '#ffb040', shirt: '#8a0a14', trim: '#e6b050', coat: true, lining: '#9a0a1a', cape: '#120c08', capeD: '#000000', crown: '#e6b050', tattoo: '#ff5a3a', halo: '#ffb040', broken: true, wings: 1.25, wingCol: '#e6a040', armor: true }
];
function drawFinn(g, P, H) {
  const tier = H.tier || 0, L = FINN_LOOK[tier], t = P.t, flow = clamp(P.run * 1.1 + P.dodge, 0, 1.3);
  // --- Fluegel (hinter allem)
  if (L.wings) {
    const beat = Math.sin(t * (3 + flow * 4)) * 0.18;
    for (const side of [-1, 1]) {
      g.save(); g.translate(P.neckX - 2 + side * 1.5, P.neckY + 4); g.rotate(-0.25 + side * 0.08 + beat * side);
      const S2 = 20 * L.wings;
      for (let f = 0; f < 5; f++) {
        const a = -Math.PI * (0.55 + f * 0.1), len = S2 * (1.25 - f * 0.12);
        g.save(); g.rotate(a + Math.PI / 2 + side * 0.9 * (side < 0 ? 1 : -0.2));
        g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.35, -4, len, -1.5); g.quadraticCurveTo(len * 0.5, 4, 0, 2.5); g.closePath();
        const dark = L.armor ? '#6a3a10' : shade(L.wingCol, -0.35);
        paint(g, lg(g, 0, 0, len, 0, [0, rgba(dark, 0.85), 0.6, rgba(L.wingCol, 0.75), 1, 'rgba(255,255,255,0.9)']), rgba(L.armor ? '#2a1004' : '#a08040', 0.6), 0.5);
        g.restore();
      }
      g.restore();
    }
  }
  // --- Heiligenschein (hinter dem Kopf)
  if (L.halo) {
    g.save(); g.translate(P.headX - 2, P.headY - 5); g.rotate(-0.25);
    g.strokeStyle = L.halo; g.lineWidth = 1.6;
    g.beginPath();
    if (L.broken) { g.ellipse(0, 0, 8, 3, 0, 0.3, Math.PI - 0.1); g.moveTo(-6, -2.5); g.ellipse(0, 0, 8, 3, 0, Math.PI + 0.3, TAU - 0.6); }
    else g.ellipse(0, 0, 8, 3, 0, 0, TAU);
    g.stroke();
    glowDot(g, 0, 0, 10, L.halo, 0.45);
    g.restore();
  }
  // --- Umhang
  if (L.cape) {
    const cpA = flowCurve(P.neckX - 3, P.neckY + 1, 36, 6, flow, t, 0.2, 0.18, 0.1);
    const cpB = flowCurve(P.neckX + 2, P.neckY + 2, 34, 6, flow * 0.85, t, 1.4, 0.05, -0.1);
    const poly = cpA.map((q, i) => [q[0] - 2 - i * 0.8, q[1]]).concat(cpB.reverse().map((q, i) => [q[0] + 2, q[1]]));
    blobPath(g, poly, 0.3); paint(g, lg(g, P.neckX, P.neckY, P.neckX - 16, 0, [0, L.cape, 1, L.capeD]), 'rgba(0,0,0,0.5)', 0.7);
    if (L.trim) { g.strokeStyle = rgba(L.trim, 0.7); g.lineWidth = 0.8; curvePath(g, cpA.map((q, i) => [q[0] - 2 - i * 0.8, q[1]])); g.stroke(); }
  }
  // --- Mantelschoesse (ab Adliger)
  if (L.coat) {
    for (let k = 0; k < 2; k++) {
      const ax = P.hipX - 3 + k * 3, ay = P.hipY - 3;
      const cp = flowCurve(ax, ay, 19 - k * 2, 5, flow, t, k * 1.7, 0.14, -0.2);
      ribbon(g, cp, (s) => (4 - k) * (1 - s * 0.45));
      paint(g, lg(g, ax, ay, ax - 8, ay + 18, [0, k ? L.topD : L.top, 1, L.topD]), 'rgba(0,0,0,0.6)', 0.6);
      if (!k && L.lining) { g.strokeStyle = L.lining; g.lineWidth = 1; curvePath(g, cp.map((q) => [q[0] + 1.5, q[1]])); g.stroke(); }
    }
  }
  // --- Beine & Arme (hinten)
  const leg = (Lg, dk) => {
    limb(g, Lg.hx, Lg.hy, Lg.kx, Lg.ky, 2.9, 2.4); paint(g, lg(g, Lg.hx, Lg.hy, Lg.kx + 3, Lg.ky, [0, shade(L.leg, dk + 0.05), 1, shade(L.legD, dk)]), 'rgba(0,0,0,0.6)', 0.6);
    limb(g, Lg.kx, Lg.ky, Lg.fx, Lg.fy - 1.8, 2.4, 2); paint(g, shade(L.leg, dk - 0.05), 'rgba(0,0,0,0.6)', 0.6);
    if (L.armor) { g.beginPath(); g.ellipse(Lg.kx + 0.6, Lg.ky, 2.6, 3, 0, 0, TAU); paint(g, shade(L.trim, dk), 'rgba(0,0,0,0.7)', 0.5); }
    g.beginPath(); g.moveTo(Lg.fx - 2.6, Lg.fy - 3); g.lineTo(Lg.fx + 2, Lg.fy - 3.2); g.quadraticCurveTo(Lg.fx + 5, Lg.fy - 1.4, Lg.fx + 5.4, Lg.fy + 0.2); g.lineTo(Lg.fx - 2.8, Lg.fy + 0.2); g.closePath();
    paint(g, shade(L.shoe, dk), 'rgba(0,0,0,0.75)', 0.5);
    if (tier <= 1) { g.fillStyle = shade('#c02030', dk); g.fillRect(Lg.fx - 2.6, Lg.fy - 1, 7.5, 0.9); }
  };
  const arm = (A, dk, front) => {
    limb(g, A.sx, A.sy, A.ex, A.ey, 2.6, 2.1); paint(g, lg(g, A.sx, A.sy, A.ex, A.ey, [0, shade(L.topL, dk - 0.1), 1, shade(L.top, dk)]), 'rgba(0,0,0,0.6)', 0.6);
    limb(g, A.ex, A.ey, A.hx, A.hy, 2.1, 1.8); paint(g, shade(L.top, dk - 0.05), 'rgba(0,0,0,0.6)', 0.6);
    if (L.trim && tier >= 2) { const a0 = Math.atan2(A.hy - A.ey, A.hx - A.ex), mx = lerp(A.ex, A.hx, 0.78), my = lerp(A.ey, A.hy, 0.78), nx = -Math.sin(a0) * 2.1, ny = Math.cos(a0) * 2.1; g.strokeStyle = shade(L.trim, dk); g.lineWidth = 1.1; g.beginPath(); g.moveTo(mx - nx, my - ny); g.lineTo(mx + nx, my + ny); g.stroke(); }
    g.beginPath(); g.arc(A.hx, A.hy, 1.9, 0, TAU); paint(g, shade(L.skin, dk), 'rgba(40,20,20,0.7)', 0.5);
    if (L.tattoo && front) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(L.tattoo, 0.8); g.lineWidth = 0.6; g.beginPath(); g.moveTo(lerp(A.ex, A.hx, 0.2), lerp(A.ey, A.hy, 0.2)); g.lineTo(A.hx, A.hy); g.stroke(); g.restore(); }
    if (front && P.cast > 0.05 && tier >= 1) { const a = Math.atan2(A.hy - A.ey, A.hx - A.ex); const hx = A.hx + Math.cos(a) * 4, hy = A.hy + Math.sin(a) * 4; glowDot(g, hx, hy, 5 + P.cast * 5, FINN_TIERS[tier].col, 0.7 * P.cast); }
  };
  leg(P.legB, -0.38); arm(P.armB, -0.38, false);
  // --- Rumpf
  g.save(); g.translate(P.hipX, P.hipY); g.rotate(P.lean);
  const T = SPEC_FINN.torso;
  g.beginPath();
  g.moveTo(-5.5, 2); g.bezierCurveTo(-7.5, -T * 0.4, -7.2, -T * 0.8, -5.5, -T - 0.5);
  g.lineTo(5.5, -T - 0.5); g.bezierCurveTo(7.6, -T * 0.7, 6.4, -T * 0.4, 5.5, 2); g.closePath();
  paint(g, lg(g, -6, -T, 6, 2, [0, L.topL, 0.45, L.top, 1, L.topD]), 'rgba(0,0,0,0.6)', 0.7);
  if (tier <= 1) { // Kapuzenpulli: Bauchtasche & Kordeln
    g.strokeStyle = 'rgba(0,0,0,0.4)'; g.lineWidth = 0.7;
    g.beginPath(); g.moveTo(-3.5, -2); g.lineTo(-2.5, -7); g.lineTo(4.5, -7); g.lineTo(5, -2); g.stroke();
    g.strokeStyle = '#d8d8e0'; g.lineWidth = 0.5; g.beginPath(); g.moveTo(1.5, -T + 1); g.lineTo(1.2, -T + 6); g.moveTo(3.5, -T + 1); g.lineTo(3.8, -T + 5.5); g.stroke();
    if (tier === 1) { g.fillStyle = 'rgba(160,10,30,0.7)'; g.beginPath(); g.arc(2.5, -T * 0.45, 1.6, 0, TAU); g.arc(-1, -T * 0.3, 1, 0, TAU); g.fill(); }
  } else {
    // Hemd / Brustplatte
    g.beginPath(); g.moveTo(-1, -T); g.lineTo(3.5, -T); g.lineTo(3, -T * 0.35); g.lineTo(0, -T * 0.35); g.closePath();
    paint(g, L.shirt || '#6a0816', 'rgba(0,0,0,0.5)', 0.5);
    g.strokeStyle = L.trim; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(-1, -T); g.lineTo(0, -T * 0.35); g.moveTo(3.5, -T); g.lineTo(3, -T * 0.35); g.stroke();
    if (L.armor) {
      for (let k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(-5.5, -k * 4.5); g.quadraticCurveTo(0, -k * 4.5 + 2, 6.5, -k * 4.5 - 0.5); g.strokeStyle = rgba(L.trim, 0.8); g.lineWidth = 0.8; g.stroke(); }
      glowDot(g, 1.5, -T * 0.55, 5, '#ff3a1a', 0.7);
    }
    // Guertel
    g.fillStyle = '#100a0c'; g.fillRect(-5.5, -1.5, 11.5, 2.4);
    g.fillStyle = L.trim; g.fillRect(1.2, -1.4, 2, 2.2);
  }
  g.restore();
  leg(P.legF, 0);
  // --- Kopf
  g.save(); g.translate(P.headX, P.headY); g.rotate(P.headA);
  // Gesicht
  g.beginPath();
  g.moveTo(-4, -5.2); g.quadraticCurveTo(-0.5, -7.8, 3, -5.8); g.quadraticCurveTo(4.4, -3.6, 4, -1.8);
  g.lineTo(5.6, 0); g.lineTo(4.1, 0.6); g.quadraticCurveTo(4.5, 1.8, 3.8, 2.6); g.quadraticCurveTo(3, 5, 0.8, 5.4);
  g.quadraticCurveTo(-3, 5, -4.4, 1.8); g.closePath();
  paint(g, lg(g, 2, -6, -3, 5, [0, shade(L.skin, 0.3), 0.6, L.skin, 1, L.skinD]), 'rgba(50,30,30,0.7)', 0.55);
  g.beginPath(); g.moveTo(-1.8, -1.4); g.lineTo(-4.2, -3.6); g.lineTo(-2.2, 1.2); g.closePath(); paint(g, L.skinD, 'rgba(50,30,30,0.6)', 0.4);
  // Augen
  if (tier === 0) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(2.5, -1.6, 0.9, 0.7, 0, 0, TAU); g.fill(); g.fillStyle = L.eye; g.beginPath(); g.arc(2.8, -1.6, 0.5, 0, TAU); g.fill(); }
  else eye(g, 2.6, -1.6, 0.9 + tier * 0.05, L.eye);
  g.strokeStyle = shade(L.hair, 0.1); g.lineWidth = 0.8; g.beginPath(); g.moveTo(1, -3); g.lineTo(4, -2.6); g.stroke();
  if (tier >= 2) { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(3.4, 2.3); g.lineTo(3.9, 3.8); g.lineTo(4.2, 2.2); g.fill(); }
  // Brille (Mensch & Halbling)
  if (L.glasses) {
    g.strokeStyle = '#1a1a1e'; g.lineWidth = 0.7;
    g.beginPath(); g.rect(1.2, -2.8, 3.4, 2.4); g.moveTo(1.2, -1.8); g.lineTo(-2, -2.4); g.stroke();
    g.fillStyle = 'rgba(200,220,255,0.25)'; g.fillRect(1.2, -2.8, 3.4, 2.4);
  }
  // Haar (strubbelig, ab Reiner Himmlischer silberweiss)
  g.beginPath();
  g.moveTo(-5, 0); g.quadraticCurveTo(-6.5, -5, -3.5, -7.6); g.lineTo(-2, -9); g.lineTo(-0.5, -7.8); g.lineTo(1.5, -9.2); g.lineTo(2.6, -7.6);
  g.quadraticCurveTo(5.4, -7.2, 4.8, -4); g.quadraticCurveTo(3, -5.6, 0.5, -5.2); g.quadraticCurveTo(-1.5, -4, -2.5, -1); g.closePath();
  paint(g, lg(g, 0, -9, 0, 0, [0, shade(L.hair, 0.25), 1, L.hair]), 'rgba(0,0,0,0.5)', 0.5);
  // Krone
  if (L.crown) {
    g.save(); g.translate(-0.3, -7.4);
    g.fillStyle = lg(g, 0, -4, 0, 1, [0, '#ffffff', 1, L.crown]);
    g.beginPath(); g.moveTo(-4.5, 0.8); g.lineTo(4.5, 0.2); g.lineTo(4.2, -1.4); g.lineTo(2.6, -0.4); g.lineTo(1.4, -3.4 - (tier >= 7 ? 2.5 : 0)); g.lineTo(0, -0.6); g.lineTo(-1.6, -3 - (tier >= 7 ? 2.2 : 0)); g.lineTo(-2.8, -0.2); g.lineTo(-4.6, -1.2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 0.35; g.stroke();
    g.fillStyle = tier >= 5 ? '#ffe070' : '#e0102c'; g.beginPath(); g.arc(0, -0.2, 0.8, 0, TAU); g.fill();
    g.restore();
  }
  g.restore();
  // Kragen (ab Adliger, hoch)
  if (L.coat) {
    g.save(); g.translate(P.neckX, P.neckY); g.rotate(P.lean);
    g.beginPath(); g.moveTo(-4, 1.5); g.quadraticCurveTo(-7, -4, -5.5, -8.5); g.lineTo(-2.5, -3); g.lineTo(0.5, 1.5); g.closePath();
    paint(g, lg(g, -6, -8, -1, 1, [0, L.lining || L.topL, 1, L.topD]), 'rgba(0,0,0,0.6)', 0.6);
    g.restore();
  } else if (tier <= 1) { // Kapuze im Nacken
    g.save(); g.translate(P.neckX, P.neckY); g.rotate(P.lean);
    g.beginPath(); g.moveTo(-5, 2); g.quadraticCurveTo(-8, -2, -5, -5); g.quadraticCurveTo(-2, -3, 0, 1.5); g.closePath();
    paint(g, L.topD, 'rgba(0,0,0,0.5)', 0.5);
    g.restore();
  }
  arm(P.armF, 0, true);
}
HERO_ART.finn = { spec: SPEC_FINN, draw: drawFinn, rim: '#ff4a5a', h: 64 };
HERO_PAL.finn = {};
