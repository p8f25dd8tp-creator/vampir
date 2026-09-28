'use strict';
/* ==========================================================================
   BEGLEITER — Finns Freunde kämpfen im Story-Modus an seiner Seite.
   Namen nach der deutschen Hörspielfassung „Das Vampirsystem“.
   Begleiter sind unverwundbar (Unterstützer) und werden mit dem Kapitel stärker.
   ========================================================================== */

const COMPANIONS = {
  peter: {
    name: 'Peter Kraus', role: 'Erd-Fähigkeit · später Ghoul und Wight', unlock: 2, col: '#9aff9a',
    desc: 'Erpresst, schuldig, und dann der loyalste von allen. Zieht Gegner auf sich und schlägt die Erde auf; wird auf Caladi zum Ghoul, danach zum Wight.',
    hero: 'vorian', pal: [[HERO_PAL.vorian, { skin: '#9ab09a', skinD: '#5a6a5a', armor: '#2a3028', armorL: '#5a6a58', armorD: '#101410', red: '#3a5a3a', redL: '#8aff8a', redD: '#142014', hair: '#1a1a14', eye: '#9aff9a', rim: '#9aff9a' }]],
    look: { glow: 0.3 }, speed: 150, range: 60, cd: 1.6
  },
  lena: {
    name: 'Lena Grimm', role: 'Bogen & Telekinese · Pure-Agentin 84', unlock: 1, col: '#c8a0ff',
    desc: 'Sie hütet Finns Geheimnis, obwohl es niemandem nützt außer ihm. Trifft aus großer Entfernung, ihre Pfeile durchschlagen mehrere Gegner.',
    hero: 'liora', pal: [[HERO_PAL.liora, { coat: '#3a2a5a', coatL: '#6a4a9a', coatD: '#1a1028', hair: '#2a1a3a', hairL: '#8a5aba', eye: '#c8a0ff', rim: '#c8a0ff' }]],
    look: { weapon: 'bow' }, speed: 165, range: 320, cd: 1.1
  },
  leo: {
    name: 'Leo Suiyan', role: 'Blinder Schwert- und Qi-Meister', unlock: 4, until: 10, col: '#5ff0d0',
    desc: 'Er sieht nichts und merkt alles. Finns Lehrmeister im Qi — seine Qi-Wellen schleudern ganze Horden zurück.',
    hero: 'shen', pal: [[HERO_PAL.shen, { robe: '#e0dcd0', robeL: '#ffffff', robeD: '#8a867a', sash: '#2a6a5a', sashL: '#5ff0d0', hat: '#5a4a3a', hatL: '#8a7a5a', hatD: '#2a2014', beard: '#2a2420', rim: '#5ff0d0' }]],
    look: { qi: 0 }, speed: 150, range: 100, cd: 2.4
  },
  fex: {
    name: 'Fex Sanguini', role: 'Vampir · Blutfäden', unlock: 4, col: '#ff4a6a',
    desc: 'Finns Blutsbruder aus der dreizehnten Familie. Seine fast unsichtbaren Fäden springen von Gegner zu Gegner.',
    hero: 'nyx', pal: [[HERO_PAL.nyx, { cloak: '#2a0a14', cloakL: '#6a1a2a', cloakD: '#10040a', scarf: '#8a0a1e', scarfL: '#ff4a6a', eye: '#ff4a6a', rim: '#ff4a6a' }]],
    look: { flow: 0.4 }, speed: 180, range: 260, cd: 1.3
  },
  emma: {
    name: 'Emma Wagner', role: 'Eis und Schwert · später Dhampir', unlock: 1, until: 10, col: '#9ad8ff',
    desc: 'Diszipliniert seit dem Verlust durch die Dalki. Erst Eis und Schwert (Gegner erstarren), nach Truedream Qi und Schwert, als Dhampir gelbe Energie.',
    hero: 'liora', pal: [[HERO_PAL.liora, { coat: '#2a3a5a', coatL: '#5a7aaa', coatD: '#101828', hair: '#e8e8f0', hairL: '#ffffff', eye: '#9ad8ff', rim: '#9ad8ff', band: '#c8d8e8' }]],
    look: { weapon: 'sword' }, speed: 175, range: 90, cd: 1.2
  }
};
COMPANIONS.fabian = {
  name: 'Fabian Schneider', role: 'Kopiert Fähigkeiten · teilt den Körper mit Raten und Sil', unlock: 1, col: '#ffd27a',
  desc: 'Stellt sich offen vor die Schwachen. Im selben Körper leben Raten und Sil — wenn es ernst wird, übernimmt Raten: schnelle Schlagfolgen mitten in die Gegner. Ab Kapitel 7 kämpft Sil.',
  hero: 'vorian', pal: [[HERO_PAL.vorian, { skin: '#ecd8c8', skinD: '#a88878', armor: '#1a2436', armorL: '#3a4a6a', armorD: '#080c14', red: '#2a3a6a', redL: '#ffd27a', redD: '#10182a', hair: '#e8cf7a', eye: '#ffd27a', rim: '#ffd27a' }]],
  look: { glow: 0, plain: true }, speed: 190, range: 70, cd: 1.0
};
COMPANIONS.minny = {
  name: 'Minny Talen', role: 'Tochter · Himmelsenergie', unlock: 12, col: '#f4f0ff',
  desc: 'Finns Tochter: frech, stärker als jeder in ihrem Alter und die Einzige, die ihn nie vergessen hat. Ihre weiße Himmelsenergie schlägt als Lichtsäule ein.',
  hero: 'liora', pal: [[HERO_PAL.liora, { skin: '#8a5a40', coat: '#1a1420', coatL: '#4a3a5a', coatD: '#08060c', hair: '#1a100c', hairL: '#4a3024', eye: '#f4f0ff', rim: '#f4f0ff' }]],
  look: {}, speed: 185, range: 200, cd: 1.5
};
COMPANIONS.sendraco = {
  name: 'Sen Draco', role: 'Stimme aus der Steintafel · Drachenmensch', unlock: 9, until: 11, col: '#ffb02a',
  desc: 'Ein uraltes Wesen, das in der Steintafel in Finns System lebt: laut, spöttisch und ein Mensch, der zum Drachen werden kann. Er leiht Finn seine Kraft; seine Meteoritenfaust zerschmettert ganze Gruppen.',
  hero: 'vorian', pal: [[HERO_PAL.vorian, { skin: '#d8c0b0', skinD: '#8a6a58', armor: '#14100c', armorL: '#4a3a24', armorD: '#060402', red: '#8a5a10', redL: '#ffc040', redD: '#3a2204', hair: '#8a1a14', eye: '#ffc040', rim: '#ffb02a' }]],
  look: { glow: 0.8 }, speed: 175, range: 150, cd: 2.2
};
COMPANIONS.agathon = {
  name: 'Agathon', role: 'Großrichter der Punisher · Schatten', unlock: 99, col: '#8a6aff',
  desc: 'Der erste Punisher. Sein Schattenschwert schneidet in weitem Bogen, und wo er steht, erstarren die Kämpfe.',
  hero: 'nyx', pal: [[HERO_PAL.nyx, { cloak: '#1a1424', cloakL: '#3a2a5a', cloakD: '#06040a', scarf: '#2a1a4a', scarfL: '#8a6aff', eye: '#8a6aff', rim: '#8a6aff' }]],
  look: { flow: 0.6 }, speed: 180, range: 110, cd: 1.6
};
COMPANIONS.sam = {
  name: 'Sam', role: 'Wind · Stratege', unlock: 99, col: '#8affc8',
  desc: 'Sieht das Schlachtfeld wie eine Karte. Seine Windstöße fegen ganze Reihen zurück.',
  hero: 'liora', pal: [[HERO_PAL.liora, { coat: '#3a5a4a', coatL: '#6a9a7a', coatD: '#142018', hair: '#6a4a2a', hairL: '#9a7a4a', eye: '#8affc8', rim: '#8affc8' }]],
  look: {}, speed: 170, range: 220, cd: 1.4
};
COMPANIONS.sil = {
  name: 'Sil Skala', role: 'Kopiert Fähigkeiten · Elemente', unlock: 99, col: '#c8a0ff',
  desc: 'Das jüngste der drei Ichs. Hält mehrere kopierte Kräfte zugleich und lässt Feuer, Eis und Erde auf einmal einschlagen.',
  hero: 'vorian', pal: [[HERO_PAL.vorian, { skin: '#ecd8c8', skinD: '#a88878', armor: '#1a1e3a', armorL: '#3a3a6a', armorD: '#080a14', red: '#2a2a6a', redL: '#c8a0ff', redD: '#10102a', hair: '#e8cf7a', eye: '#c8a0ff', rim: '#c8a0ff' }]],
  look: { glow: 0.4, plain: true }, speed: 175, range: 200, cd: 1.5
};
COMPANIONS.leander = {
  name: 'Leander', role: 'Metall und Nanobots · Erfinder', unlock: 99, col: '#6ab8e8',
  desc: 'Steuert jede Maschine im Raum. Seine Drohnen feuern Laser auf die nächsten Gegner.',
  hero: 'liora', pal: [[HERO_PAL.liora, { coat: '#4a5260', coatL: '#7a8698', coatD: '#1a1e26', hair: '#3a2a1e', hairL: '#6a4a30', eye: '#6ab8e8', rim: '#6ab8e8' }]],
  look: {}, speed: 160, range: 260, cd: 1.2
};
COMPANIONS.chris = {
  name: 'Chris', role: 'Qi-Meister · Kettenklingen', unlock: 99, col: '#ff5a3a',
  desc: 'Kein Fähigkeitsnutzer, nur Qi und zwei Gliederklingen, die wie Peitschen auf das Vierfache ausfahren.',
  hero: 'shen', pal: [[HERO_PAL.shen, { robe: '#1a2a28', robeL: '#3a5a54', robeD: '#0a1210', sash: '#8a1a14', sashL: '#ff5a3a', hat: '#8a1a14', hatL: '#c83a2a', hatD: '#3a0a08', beard: '#8a1a14', rim: '#ff5a3a' }]],
  look: { qi: 1 }, speed: 180, range: 180, cd: 1.2
};
const COMP_ORDER = ['peter', 'lena', 'fabian', 'leo', 'emma', 'fex', 'leander', 'sam', 'sil', 'chris', 'agathon', 'sendraco', 'minny'];
function partyMax() { return typeof finnSkills === 'function' && finnSkills().has('fraktion') ? 3 : 2; }
function companionOpen(id) { const S = storySave(); return SAVE.settings.testUnlock || !!S.cleared[COMPANIONS[id].unlock]; }
// Figuren, die in spaeteren Kapiteln nicht mehr an Finns Seite stehen (Leo stirbt, Emma wird zur Gegnerin)
function companionFits(id, chN) { const u = COMPANIONS[id].until; return !u || !chN || chN <= u; }
function compName(id) { return id === 'fabian' && storySave().cleared[6] ? 'Sil' : COMPANIONS[id].name; }
function companionParty() {
  const S = storySave();
  if (!S.party) S.party = [];
  S.party = S.party.filter((id) => COMPANIONS[id] && companionOpen(id)).slice(0, partyMax());
  return S.party;
}

/* ---------------------------------------------------------------- im Lauf */
function spawnCompanions(G) {
  G.comps = companionParty().filter((id) => companionFits(id, G.story && G.story.n)).map((id, i) => ({ id, def: COMPANIONS[id], x: [-40, 40, 0][i], y: [20, 20, 44][i], vx: 0, vy: 0, face: 1, t: rand(0, 1), cd: 1 + i * 0.5, castT: 0, aim: 0, phase: 0, run: 0, spr: null, slot: i }));
}
function compPower(G) { return Math.pow(G.story ? G.story.diff.hp : 1, 0.85) * (1 + G.level * 0.035); }
function peterPower() { const S = storySave(); return S.cleared[10] ? 2.2 : S.cleared[4] ? 1.7 : S.cleared[3] ? 1.3 : 1; }
function updateCompanions(dt) {
  const G = GAME;
  if (!G.comps) return;
  const p = G.p, pw = compPower(G);
  for (const c of G.comps) {
    const D = c.def;
    c.t += dt; c.cd -= dt; c.castT = Math.max(0, c.castT - dt);
    // Ziel: naechster Gegner in Reichweite um Finn, sonst bei Finn bleiben
    const tgt = nearestEnemy(c.x, c.y, Math.max(D.range + 120, 240));
    let tx = p.x + (c.slot ? 46 : -46), ty = p.y + 18;
    if (tgt && dist2(tgt.x, tgt.y, p.x, p.y) < 380 * 380) {
      const want = D.range * 0.75;
      const dx = tgt.x - c.x, dy = tgt.y - c.y, d = Math.hypot(dx, dy) || 1;
      if (d > want) { tx = c.x + dx / d * 60; ty = c.y + dy / d * 60; } else if (d < want * 0.5 && D.range > 150) { tx = c.x - dx / d * 60; ty = c.y - dy / d * 60; } else { tx = c.x; ty = c.y; }
      if (c.cd <= 0 && d < D.range + tgt.r) { c.cd = D.cd; c.castT = 0.3; c.aim = Math.atan2(dy, dx); compAttack(c, tgt, pw); }
    }
    // nie zu weit von Finn weg
    if (dist2(c.x, c.y, p.x, p.y) > 300 * 300) { tx = p.x; ty = p.y; }
    if (dist2(c.x, c.y, p.x, p.y) > 700 * 700) { c.x = p.x - 40; c.y = p.y + 20; burstShadow(c.x, c.y, 6, 0.5); }
    const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy);
    const sp = d > 8 ? Math.min(D.speed * 1.1, d * 4) : 0;
    c.vx = lerp(c.vx, d > 0 ? dx / d * sp : 0, 1 - Math.exp(-dt * 10));
    c.vy = lerp(c.vy, d > 0 ? dy / d * sp : 0, 1 - Math.exp(-dt * 10));
    c.x += c.vx * dt; c.y += c.vy * dt;
    const v = Math.hypot(c.vx, c.vy);
    c.run = lerp(c.run, clamp(v / D.speed, 0, 1), 1 - Math.exp(-dt * 10));
    c.phase += v * dt / 22;
    if (c.castT > 0) c.face = Math.cos(c.aim) >= 0 ? 1 : -1; else if (Math.abs(c.vx) > 12) c.face = c.vx > 0 ? 1 : -1;
    addLight(c.x, c.y - 20, 120, D.col, 0.5);
  }
}
function compAttack(c, tgt, pw) {
  const id = c.id, x = c.x, y = c.y;
  if (id === 'peter') { // Faustschlag mit Flaeche
    GAME.later(0.12, () => {
      const r = 58;
      forEnemiesInRadius(tgt.x, tgt.y, r, (en) => dealDamage(en, 20 * pw * peterPower(), 'none', 'peter', { kb: 180, kx: en.x - c.x, ky: en.y - c.y, norm: true, noMark: true }));
      fxRing(tgt.x, tgt.y, 8, r, 0.25, '#9aff9a', 5); burstAsh(tgt.x, tgt.y, 4, '#5a6a5a'); sfx('stomp', 0, 0.2); shake(1);
    });
  } else if (id === 'lena') { // durchschlagender Pfeil
    sfx('whip', 0, 0.1);
    const a = c.aim, sp = 560, hit = new Set();
    addEffect({ x: x, y: y - 24, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dur: 0.7, layer: 2, update(e, dt) {
      e.x += e.vx * dt; e.y += e.vy * dt;
      forEnemiesInRadius(e.x, e.y + 16, 12, (en) => { if (hit.has(en.id) || hit.size >= 4) return; hit.add(en.id); dealDamage(en, 16 * pw, 'none', 'lena', { kb: 60, kx: e.vx, ky: e.vy, noMark: true }); });
      if (hit.size >= 4) e.dead = true;
    }, draw(g, e) {
      g.save(); g.translate(e.x, e.y); g.rotate(a);
      g.strokeStyle = '#e8e0d0'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-10, 0); g.lineTo(6, 0); g.stroke();
      g.fillStyle = '#c8a0ff'; g.beginPath(); g.moveTo(6, -2.2); g.lineTo(11, 0); g.lineTo(6, 2.2); g.fill();
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6; g.drawImage(glowSprite('#c8a0ff'), -14, -6, 20, 12);
      g.restore();
    } });
  } else if (id === 'leo') { // Qi-Welle um sich
    const r = 110;
    sfx('palm', 0, 0.15);
    forEnemiesInRadius(x, y, r, (en) => dealDamage(en, 14 * pw, 'qi', 'leo', { kb: 280, kx: en.x - x, ky: en.y - y, norm: true }));
    fxRing(x, y, 10, r, 0.4, '#5ff0d0', 6); fxRing(x, y, 6, r * 0.7, 0.35, '#ffe6a0', 3);
  } else if (id === 'fex') { // Blutfaeden springen
    qiChain(x, y - 20, 4, 13 * pw, 'fex', { col: '#ff3a5a' });
  } else if (id === 'fabian') { // Ratan: Sprung ins Ziel, drei schnelle Schlaege
    const a = c.aim;
    c.x = tgt.x - Math.cos(a) * 26; c.y = tgt.y - Math.sin(a) * 18;
    burstShadow(c.x, c.y, 4, 0.4);
    for (let k = 0; k < 3; k++) GAME.later(0.08 * k, () => {
      forEnemiesInRadius(c.x + Math.cos(a) * 26, c.y + Math.sin(a) * 18, 44, (en) => dealDamage(en, 11 * pw, 'none', 'fabian', { kb: 70, kx: Math.cos(a), ky: Math.sin(a), norm: true, noMark: true }));
      burstSparks(c.x + Math.cos(a) * 26, c.y - 12 + Math.sin(a) * 18, 3, '#ffd27a'); sfx('whip', 0, 0.06);
    });
  } else if (id === 'agathon') { // Schattenschwert: weiter Bogen
    const a = c.aim, R = 120;
    forEnemiesInRadius(x, y, R, (en) => { if (!inArc(en.x, en.y, x, y, a, 1.6)) return; dealDamage(en, 30 * pw, 'shadow', 'agathon', { kb: 160, kx: en.x - x, ky: en.y - y, norm: true, noMark: true }); });
    fxRing(x, y, 12, R, 0.3, '#8a6aff', 6); burstShadow(x + Math.cos(a) * 60, y + Math.sin(a) * 40, 6, 0.5); sfx('whip', 0, 0.12);
  } else if (id === 'sam') { // Windstoss in einer Linie
    const a = c.aim;
    for (let k = 1; k <= 5; k++) GAME.later(k * 0.03, () => { const px = x + Math.cos(a) * k * 42, py = y + Math.sin(a) * k * 30;
      forEnemiesInRadius(px, py, 38, (en) => dealDamage(en, 7 * pw, 'none', 'sam', { kb: 320, kx: Math.cos(a), ky: Math.sin(a), norm: true, noMark: true }));
      fxRing(px, py, 4, 34, 0.25, '#8affc8', 3); });
    sfx('whip', 0, 0.08);
  } else if (id === 'sil') { // Elemente zugleich
    const tx = tgt.x, ty = tgt.y, r = 70;
    GAME.later(0.12, () => { forEnemiesInRadius(tx, ty, r, (en) => { dealDamage(en, 24 * pw, 'none', 'sil', { kb: 150, kx: en.x - tx, ky: en.y - ty, norm: true, noMark: true }); if (Math.random() < 0.3) freezeEnemy(en, 0.6); });
      fxRing(tx, ty, 6, r, 0.3, '#ff8a3a', 4); fxRing(tx, ty, 4, r * 0.7, 0.3, '#bfe8ff', 3); spikeFx(tx, ty, 14, '#a8845a', 40); sfx('stomp', 0, 0.15); });
  } else if (id === 'leander') { // Drohnenlaser
    sfx('whip', 0, 0.06);
    nearestEnemies(x, y, 300, 2).forEach((en) => { dealDamage(en, 15 * pw, 'none', 'leander', { kb: 40, kx: en.x - x, ky: en.y - y, norm: true, noMark: true }); tetherFx(en, 0.15, '#6ab8e8', 3); });
  } else if (id === 'chris') { // Kettenklingen peitschen drei Gegner
    nearestEnemies(x, y, 220, 3).forEach((en) => { tetherFx(en, 0.25, '#ff5a3a', 10); dealDamage(en, 20 * pw, 'qi', 'chris', { kb: -160, kx: en.x - x, ky: en.y - y, norm: true, noMark: true, bleed: 4 }); });
    sfx('chain', 0, 0.1);
  } else if (id === 'sendraco') { // Meteoritenfaust: Drachenenergie schlaegt von oben ein
    const tx = tgt.x, ty = tgt.y, r = 92;
    addEffect({ x: tx, y: ty, dur: 0.28, layer: 2, draw(g, e, k) {
      const yy = ty - 220 * (1 - k);
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.9;
      g.drawImage(glowSprite('#ffb02a'), tx - 30, yy - 30, 60, 60);
      g.strokeStyle = 'rgba(255,200,90,0.6)'; g.lineWidth = 6; g.beginPath(); g.moveTo(tx, yy - 50); g.lineTo(tx, yy); g.stroke();
      g.restore();
    } });
    GAME.later(0.28, () => {
      forEnemiesInRadius(tx, ty, r, (en) => dealDamage(en, 48 * pw, 'none', 'sendraco', { kb: 260, kx: en.x - tx, ky: en.y - ty, norm: true, noMark: true }));
      fxRing(tx, ty, 10, r, 0.35, '#ffb02a', 7); fxRing(tx, ty, 6, r * 0.6, 0.3, '#fff0c0', 3); burstSparks(tx, ty - 10, 8, '#ffc040'); sfx('stomp', 0, 0.25); shake(2);
    });
  } else if (id === 'minny') { // Lichtsaeule aus Himmelsenergie
    const tx = tgt.x, ty = tgt.y, r = 64;
    sfx('palm', 0, 0.12);
    GAME.later(0.15, () => {
      forEnemiesInRadius(tx, ty, r, (en) => dealDamage(en, 30 * pw, 'none', 'minny', { kb: 120, kx: en.x - tx, ky: en.y - ty, norm: true, noMark: true }));
      fxRing(tx, ty, 6, r, 0.3, '#f4f0ff', 5); burstSparks(tx, ty - 20, 6, '#ffffff');
    });
    addEffect({ x: tx, y: ty, dur: 0.45, layer: 2, draw(g, e, k) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - k) * 0.85;
      g.fillStyle = lg(g, tx - 14, 0, tx + 14, 0, [0, 'rgba(255,255,255,0)', 0.5, '#ffffff', 1, 'rgba(255,255,255,0)']);
      g.fillRect(tx - 14 * (1 - k * 0.5), ty - 260, 28 * (1 - k * 0.5), 260);
      g.restore();
    } });
  } else if (id === 'emma') { // weiter Schwertbogen
    sfx('whip', 0, 0.1);
    const a = c.aim, R = 95, hit = new Set();
    forEnemiesInRadius(x, y, R, (en) => { if (!inArc(en.x, en.y, x, y, a, 1.4) || hit.has(en.id)) return; hit.add(en.id); dealDamage(en, 26 * pw * [1, 1.15, 1.4][emmaStage()], emmaStage() === 1 ? 'qi' : 'none', 'emma', { kb: 140, kx: en.x - x, ky: en.y - y, norm: true, noMark: true }); if (emmaStage() === 0) { en.slowT = Math.max(en.slowT, 1.2); en.slowF = Math.min(en.slowF || 1, 0.5); } burstSparks(en.x, en.y - 10, 2, EMMA_COL[emmaStage()]); });
    addEffect({ x, y, dur: 0.22, layer: 1, draw(g, e, k) {
      g.save(); g.translate(x, y - 16); g.scale(1, 0.7); g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 1 - k; g.strokeStyle = EMMA_COL[emmaStage()]; g.lineWidth = 8 * (1 - k) + 1;
      g.beginPath(); g.arc(0, 0, R * 0.85, a - 1.3 + k * 0.4, a + 1.3); g.stroke();
      g.strokeStyle = '#ffffff'; g.lineWidth = 2 * (1 - k); g.stroke();
      g.restore();
    } });
  }
}
const EMMA_COL = ['#cfe8ff', '#5ff0d0', '#ffd23a'];
function emmaStage() { const S = storySave(); return S.cleared[5] ? 2 : S.cleared[4] ? 1 : 0; }
function drawCompanion(g, c, time) {
  const D = c.def, px = heroPx();
  const castK = c.castT > 0 ? Math.sin(Math.PI * (1 - c.castT / 0.3)) : 0;
  const aimLocal = c.face > 0 ? c.aim : Math.PI - c.aim;
  c.spr = withPal(D.pal, () => renderHero(D.hero, { t: c.t, run: c.run, phase: c.phase, cast: castK, aim: aimLocal }, Object.assign({ rim: D.col }, D.look), px, c.spr, {}));
  const S = c.spr.S;
  g.save(); g.translate(c.x, c.y); g.scale(c.face / px * 0.94, 1 / px * 0.94);
  g.drawImage(c.spr.out, -S / 2, -c.spr.anchorY);
  g.restore();
  // Namensschild
  g.font = '700 9px Cinzel, serif'; g.textAlign = 'center';
  const nm = compName(c.id);
  g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,0.8)'; g.strokeText(nm, c.x, c.y + 14);
  g.fillStyle = D.col; g.fillText(nm, c.x, c.y + 14);
}
Object.assign(SRC_NAMES, { fabian: 'Fabian Schneider', peter: 'Peter Kraus', lena: 'Lena Grimm', leo: 'Leo', fex: 'Fex Sanguini', emma: 'Emma Wagner', minny: 'Minny Talen', sendraco: 'Sen Draco' });
