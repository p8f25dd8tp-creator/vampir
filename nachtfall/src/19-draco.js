'use strict';
/* ==========================================================================
   SEN DRACO — spielbarer Held im Arcade-Modus.
   Ein Mensch, der sich in einen Drachen verwandeln kann. Eigene Gestaltung.
   Passiv: Meteoritenfaust (schlaegt regelmaessig von oben ein), Drachenschuppen.
   Spezial: Drachengestalt — einige Sekunden lang ein Drache, der Feuer speit.
   ========================================================================== */

HERO_PAL.draco = { skin: '#d8c0b0', skinD: '#8a6a58', armor: '#14100c', armorL: '#4a3a24', armorD: '#060402', red: '#8a5a10', redL: '#ffc040', redD: '#3a2204', hair: '#8a1a14', eye: '#ffc040', rim: '#ffb02a', gold: '#d0a040' };
HERO_ART.draco = {
  spec: SPEC_VORIAN, rim: '#ffb02a', h: 66,
  draw: (g, P, H) => withPal([[HERO_PAL.vorian, HERO_PAL.draco]], () => drawVorian(g, P, Object.assign({ glow: 0.8 }, H)))
};

HEROES.draco = {
  name: 'Sen Draco', title: 'Der Drachenmensch', school: 'none', diff: 2,
  role: 'rohe Kraft · Drachengestalt · zäh',
  hp: 190, speed: 160, armor: 3, dodgeCd: 2.8, dodge: 'roll',
  start: 'hammerschlag', slots: 4,
  mech: { name: 'Drachenblut', desc: 'Alle 2,2 s schlägt eine Meteoritenfaust aus Drachenenergie beim nächsten Gegner ein (Flächenschaden, Rückstoß). Drachenschuppen: Sen Draco nimmt 15 % weniger Schaden.' },
  ult: { id: 'drachengestalt', name: 'Drachengestalt', cd: 20, desc: '7 s lang wird Sen Draco zum Drachen: +40 % Schaden, halber erlittener Schaden, und er speit ununterbrochen Feuer auf die nächsten Gegner.' },
  strengths: ['Stärkster Einzelkämpfer', 'Viel Leben, Schuppen', 'Drachengestalt räumt alles leer'],
  weaknesses: ['Lange Abklingzeit der Drachengestalt', 'Wenig Fernkampf ohne Karten', 'Kein Lebensraub von Haus aus'],
  builds: [
    { name: 'Meteor', desc: 'Hammerschlag + Kettenreaktion + Grabesmacht: jeder Einschlag reißt ganze Gruppen mit.' },
    { name: 'Drachenfaust', desc: 'Hammerschlag + Qi-Handfläche + Eiserne Meridiane: stehen und alles zurückschlagen.' },
    { name: 'Himmelssturz', desc: 'Blitzschritt + Qi-Kette: durch die Horde blitzen, bis die Drachengestalt bereit ist.' }
  ],
  pool: ['hammerschlag', 'blitzschritt', 'qihand', 'qikette', 'eisenmeridiane', 'blutnova', 'kettenreaktion', 'lebensraub', 'vampirblut', 'grabesmacht', 'seelenmagnet'],
  unlock: { desc: 'Besiege Sen Draco im Story-Modus (Kapitel 13) — oder opfere 2500 Seelen.', cost: 2500, check: (s) => !!(s.story && s.story.cleared && s.story.cleared[13]) },
  onStart() { const p = GAME.p; p.dracoT = 1.5; p.breathT = 0; },
  onUpdate(dt) {
    const G = GAME, p = G.p;
    if (!p.alive) return;
    p.dracoT -= dt;
    if (p.dracoT <= 0) {
      const tgt = nearestEnemy(p.x, p.y, 320);
      if (tgt) { p.dracoT = 2.2 * p.st.cd; dracoMeteor(tgt.x, tgt.y); } else p.dracoT = 0.3;
    }
    if (p.ultT > 0) {
      p.breathT -= dt;
      if (p.breathT <= 0) { p.breathT = 0.22; dracoBreath(p); }
      if (Math.random() < 0.5) spawnPart({ x: p.x + rand(-16, 16), y: p.y + rand(-4, 4), z: rand(10, 60), vx: rand(-20, 20), vy: rand(-20, 20), vz: 40, g: -20, drag: 2, life: 0.6, size: 6, size1: 14, spr: glowSprite('#ff8a2a'), alpha: 0.8, alpha1: 0 });
    }
  }
};
HERO_ORDER.push('draco');

function dracoMeteor(tx, ty) {
  const r = 84 * GAME.p.st.area;
  addEffect({ x: tx, y: ty, dur: 0.26, layer: 2, draw(g, e, k) {
    const yy = ty - 240 * (1 - k);
    g.save(); g.globalCompositeOperation = 'lighter';
    g.drawImage(glowSprite('#ffb02a'), tx - 30, yy - 30, 60, 60);
    g.strokeStyle = 'rgba(255,200,90,0.6)'; g.lineWidth = 6; g.beginPath(); g.moveTo(tx, yy - 56); g.lineTo(tx, yy); g.stroke();
    g.restore();
  } });
  GAME.later(0.26, () => {
    forEnemiesInRadius(tx, ty, r, (en) => dealDamage(en, 55, 'none', 'meteoritenfaust', { kb: 240, kx: en.x - tx, ky: en.y - ty, norm: true }));
    fxRing(tx, ty, 10, r, 0.35, '#ffb02a', 7); fxRing(tx, ty, 6, r * 0.6, 0.3, '#fff0c0', 3); burstSparks(tx, ty - 10, 8, '#ffc040'); sfx('stomp', 0, 0.2); shake(2);
  });
}
function dracoBreath(p) {
  const tgt = nearestEnemy(p.x, p.y, 260);
  const a = tgt ? Math.atan2(tgt.y - p.y, tgt.x - p.x) : (p.face > 0 ? 0 : Math.PI);
  p.breathFace = Math.cos(a) >= 0 ? 1 : -1;
  const R = 210 * p.st.area, ox = p.x + p.breathFace * 28, oy = p.y - 62;
  forEnemiesInRadius(p.x, p.y, R, (en) => { if (!inArc(en.x, en.y, p.x, p.y, a, 0.55)) return; dealDamage(en, 18, 'none', 'drachenfeuer', { kb: 40, kx: Math.cos(a), ky: Math.sin(a), quiet: true }); });
  addEffect({ x: ox, y: oy, dur: 0.3, layer: 2, draw(g, e, k) {
    g.save(); g.translate(ox, oy); g.rotate(a); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.75 * (1 - k);
    const L = R * (0.4 + k * 0.6);
    g.fillStyle = lg(g, 0, 0, L, 0, [0, 'rgba(255,240,170,0.95)', 0.5, 'rgba(255,140,40,0.7)', 1, 'rgba(200,40,10,0)']);
    g.beginPath(); g.moveTo(0, -6); g.lineTo(L, -L * 0.5); g.lineTo(L, L * 0.5); g.lineTo(0, 6); g.closePath(); g.fill();
    g.restore();
  } });
}
ULTS.drachengestalt = function (p) {
  sfx('ult'); sfx('roar'); shake(8); hitstop(0.08);
  p.ultT = 7; p.breathT = 0; p.breathFace = 0; p.spr = null;
  fxFlash(p.x, p.y - 40, 170, '#ff8a2a', 0.35);
  fxRing(p.x, p.y, 20, 200, 0.5, '#ffb02a', 10);
  forEnemiesInRadius(p.x, p.y, 200, (en) => dealDamage(en, 40, 'none', 'drachengestalt', { kb: 360, kx: en.x - p.x, ky: en.y - p.y, norm: true }));
  UI.announce('DRACHENGESTALT', 'boss');
};
Object.assign(SRC_NAMES, { meteoritenfaust: 'Meteoritenfaust', drachenfeuer: 'Drachenfeuer', drachengestalt: 'Drachengestalt' });

// Schaden: +40 % in Drachengestalt; Schuppen daempfen erlittenen Schaden
const _hdmDraco = heroDamageMult;
heroDamageMult = function (p, school) { const m = _hdmDraco(p, school); return p.hero === 'draco' && p.ultT > 0 ? m * 1.4 : m; };
const _dpDraco = damagePlayer;
damagePlayer = function (amount, src, heavy) { const p = GAME.p; if (p.hero === 'draco') amount *= p.ultT > 0 ? 0.5 : 0.85; return _dpDraco(amount, src, heavy); };

// Darstellung: in der Drachengestalt wird statt des Menschen der Drache gezeichnet
const _drawPlayerDraco = drawPlayer;
drawPlayer = function (g, p, time) {
  if (p.hero !== 'draco' || !(p.ultT > 0) || !p.alive) return _drawPlayerDraco(g, p, time);
  const moving = Math.hypot(p.vx || 0, p.vy || 0) > 20;
  g.save(); g.translate(p.x, p.y); g.scale((p.breathFace || p.face || 1) * 0.36, 0.36);
  g.lineCap = 'round'; g.lineJoin = 'round';
  drawDrache(g, { t: time, run: moving ? 1 : 0, slam: p.breathT > 0.12 ? 1 : 0, hurt: p.hurtT > 0 ? 0.3 : 0 });
  g.restore();
  addLight(p.x, p.y - 30, 200, '#ff8a2a', 0.8);
};

// Symbol der Drachengestalt
const ICON_EXTRA = {
  drachengestalt(g, glow) {
    glow('#ff8a2a', 40);
    g.fillStyle = '#1a1210'; g.beginPath(); g.moveTo(-30, 10); g.quadraticCurveTo(-6, -30, 26, -18); g.lineTo(32, -10); g.quadraticCurveTo(0, -8, -20, 22); g.closePath(); g.fill();
    g.fillStyle = '#e8d8b0'; g.beginPath(); g.moveTo(-2, -24); g.quadraticCurveTo(-14, -40, -24, -38); g.quadraticCurveTo(-10, -30, 4, -20); g.fill();
    g.fillStyle = '#ffc040'; g.beginPath(); g.arc(12, -18, 3, 0, TAU); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = lg(g, 30, -12, 46, 20, [0, 'rgba(255,230,140,0.95)', 1, 'rgba(255,90,20,0)']); g.beginPath(); g.moveTo(30, -12); g.lineTo(46, 4); g.lineTo(40, 24); g.closePath(); g.fill(); g.restore();
  }
};
