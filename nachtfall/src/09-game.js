'use strict';
/* ==========================================================================
   SPIELKERN — Lauf, Spieler, Werte, Schaden & Reaktionen, Beute,
   Stufenaufstieg mit Kartenangebot, Sieg & Niederlage.
   ========================================================================== */

const TICKS = {
  blutnova: tickBlutnova, blutwisch: tickBlutwisch,
  bluternte: (p, ab, dt) => tickBluternte(p, ab, dt, false),
  schattenflammen: tickSchattenflammen, nachbilder: tickNachbilder, nachtschlund: tickNachtschlund,
  qihand: tickQihand, qikette: tickQikette,
  finsternis: tickFinsternis, drachenherz: tickDrachenherz, spiegel: tickSpiegel,
  blutmond: (p, ab, dt) => tickBluternte(p, ab, dt, true), siegel: tickSiegel
};
const ABILITY_SCHOOL = { blutnova: 'blood', blutwisch: 'blood', bluternte: 'blood', schattenflammen: 'shadow', nachbilder: 'shadow', nachtschlund: 'shadow', qihand: 'qi', qikette: 'qi' };
const SRC_NAMES = {
  blutnova: 'Blutnova', blutwisch: 'Blutwisch', bluternte: 'Bluternte', schattenflammen: 'Schattenflammen', nachbilder: 'Nachbilder', nachtschlund: 'Nachtschlund',
  qihand: 'Qi-Handfläche', qikette: 'Qi-Kette', finsternis: 'Karmesinfinsternis', drachenherz: 'Drachenherz', spiegel: 'Leerer Spiegel', blutmond: 'Blutmondsicheln', siegel: 'Dreifaltiges Siegel',
  karminsturm: 'Karminsturm', aderlass: 'Aderlass', mitternacht: 'Mitternacht', harmonie: 'Harmonie', schattenschritt: 'Schattenschritt',
  blutsaat: 'Blutsaat-Explosion', kettenreaktion: 'Kettenreaktion', blutung: 'Blutung', verderbnis: 'Verderbnis', reaktion: 'Reaktionen', nebelgang: 'Nebelspur'
};

function newRun(heroId, opts) {
  const H = HEROES[heroId];
  opts = opts || {};
  clearFX();
  setTheme(opts.story ? opts.story.theme : 'friedhof');
  GAME = {
    state: 'play', t: 0, realT: 0, hero: heroId,
    enemies: [], eproj: [], pickups: [], images: [], timers: [],
    cam: { x: 0, y: 0, w: VIEW.w, h: VIEW.h },
    shake: 0, hitstop: 0, slowmo: 0,
    kills: 0, souls: 0, level: 1, xp: 0, xpNext: xpNeed(1), pendingLevels: 0,
    waveIdx: 0, spawnAcc: 0, eventIdx: 0, alive: 0,
    boss: null, bossAlive: false, mini: null, won: false, overT: 0,
    rerolls: 1 + (SAVE.meta.wurf || 0), revive: (SAVE.meta.wiedergeburt || 0) > 0,
    stats: { dmg: {}, taken: 0, healed: 0, reactions: 0, ults: 0, fusions: [] },
    diffHp: 1, diffCount: 1, diffBoss: 1, diffDmg: 1, crystals: 0,
    later(t, fn) { this.timers.push({ t, fn }); }
  };
  if (opts.story && typeof storySetup === 'function') storySetup(GAME, opts.story);
  GAME.p = makePlayer(heroId);
  GAME.cam.x = 0; GAME.cam.y = 0;
  if (H.start) giveCard(H.start, true);
  recomputeStats();
  GAME.p.hp = GAME.p.st.maxHp;
  if (heroId === 'finn' && typeof PENDING_FINN === 'number') { GAME.finnTier = PENDING_FINN; GAME.finnTest = PENDING_FINN !== finnSave().tier; }
  if (H.onStart) H.onStart();
  AudioSys.startMusic();
  sfx('bell');
}
function makePlayer(heroId) {
  return {
    hero: heroId, x: 0, y: 0, vx: 0, vy: 0, kvx: 0, kvy: 0, face: 1, lastMoveX: 1, lastMoveY: 0,
    hp: 100, alive: true, deadT: 0, iframes: 1, hurtT: 0, castT: 0, castMax: 0.3, castAim: 0,
    dodgeT: 0, dodgeMax: 0.3, dodgeCd: 0, dodgeDir: [1, 0], ultCd: 0, ultT: 0, buffAder: 0,
    phase: 0, animT: 0, runAmt: 0, stillT: 0, rooted: 0, qi: 0, flow: 0, rageSpeed: 1,
    ab: {}, passives: {}, order: [], healWindow: 0, healAcc: 0,
    st: {}, spr: null, regenAcc: 0
  };
}

/* -------------------------------------------------------- Werte */
function recomputeStats() {
  const p = GAME.p, H0 = HEROES[p.hero], H = H0.baseStats ? Object.assign({}, H0, H0.baseStats(p)) : H0, ps = p.passives, M = SAVE.meta;
  const st = {
    maxHp: H.hp * (1 + 0.08 * (M.vitae || 0)) + (ps.vampirblut || 0) * 20 + ((ps.vampirblut || 0) >= 5 ? 10 : 0),
    regen: (ps.vampirblut || 0) * 0.4 + ((ps.vampirblut || 0) >= 5 ? 0.2 : 0),
    might: 1 * (1 + 0.05 * (M.macht || 0)) + (ps.grabesmacht || 0) * 0.1 + ((ps.grabesmacht || 0) >= 5 ? 0.05 : 0),
    area: 1 + (ps.grabesmacht || 0) * 0.06 + ((ps.grabesmacht || 0) >= 5 ? 0.04 : 0),
    speed: H.speed * (1 + 0.04 * (M.eile || 0)) * (1 + Math.min(4, ps.nebelgang || 0) * 0.08 - ((ps.nebelgang || 0) >= 3 ? 0.08 : 0) + ((ps.nebelgang || 0) >= 5 ? 0.1 : 0)),
    dodgeCdMul: Math.pow(0.88, Math.min(4, ps.nebelgang || 0) - ((ps.nebelgang || 0) >= 3 ? 1 : 0)),
    pickup: 92 * (1 + 0.15 * (M.magnet || 0)) * (1 + (ps.seelenmagnet || 0) * 0.35 + ((ps.seelenmagnet || 0) >= 4 ? 0.15 : 0)),
    xpMul: 1 + (ps.seelenmagnet || 0) * 0.08 + ((ps.seelenmagnet || 0) >= 4 ? 0.04 : 0),
    armor: H.armor,
    dmgTaken: 1 - Math.min(0.45, (ps.eisenmeridiane || 0) * 0.07 + ((ps.eisenmeridiane || 0) >= 5 ? 0.03 : 0)),
    qiRate: 1 + (ps.eisenmeridiane || 0) * 0.2 + ((ps.eisenmeridiane || 0) >= 5 ? 0.1 : 0),
    kb: 1 + (ps.eisenmeridiane || 0) * 0.1,
    lifesteal: (ps.lebensraub || 0) * 0.02 + (p.hero === 'liora' ? 0.03 : 0),
    cd: 1
  };
  if (GAME.statMod) GAME.statMod(st);
  const old = p.st.maxHp;
  p.st = st;
  if (old && st.maxHp > old) p.hp += st.maxHp - old;
  p.hp = Math.min(p.hp, st.maxHp);
}
function heroDamageMult(p, school) {
  let m = p.st.might;
  if (p.hero === 'shen') { if (school === 'blood' || school === 'shadow') m *= 0.85; m *= 1 + Math.floor(p.qi) * 0.05; }
  if (p.hero === 'liora') { const miss = 1 - p.hp / p.st.maxHp; m *= 1 + clamp(miss * 1.25, 0, 0.9); if (p.buffAder > 0) m *= 1.6; }
  if (p.hero === 'nyx') m *= 1 + p.flow * 0.45;
  if (p.hero === 'finn') m *= FINN_TIERS[p.tier || 0].might;
  if (GAME.schoolMul && GAME.schoolMul[school]) m *= GAME.schoolMul[school];
  return m;
}

/* -------------------------------------------------------- Schaden an Gegnern */
function dealDamage(e, base, school, src, o) {
  if (!e || e.dead) return false;
  o = o || {};
  const G = GAME, p = G.p;
  let dmg = base * heroDamageMult(p, school);
  let crit = false;
  const critC = 0.05 + (p.hero === 'nyx' ? p.flow * 0.15 : 0);
  if (!o.noCrit && Math.random() < critC) { dmg *= 2; crit = true; }
  if (e.armor) dmg = Math.max(dmg * 0.35, dmg - e.armor);
  e.hp -= dmg;
  if (!o.quiet) e.flash = 0.09;
  G.stats.dmg[src] = (G.stats.dmg[src] || 0) + dmg;
  // Rueckstoss
  if (o.kb && !e.boss) {
    let kx = o.kx || 0, ky = o.ky || 0;
    if (o.norm || true) { const d = Math.hypot(kx, ky) || 1; kx /= d; ky /= d; }
    const k = o.kb / Math.sqrt(e.mass);
    e.kvx += kx * k; e.kvy += ky * k;
  }
  if (o.stun && !e.boss) e.stunT = Math.max(e.stunT, o.stun * (e.mini ? 0.3 : 1));
  if (o.bleed) { e.bleedT = 3; e.bleedDps = Math.max(e.bleedDps, o.bleed * heroDamageMult(p, 'blood')); }
  // Lebensraub
  if (p.st.lifesteal > 0 && school !== 'none') {
    const ls = p.st.lifesteal * (p.buffAder > 0 ? 3 : 1);
    p.healAcc += dmg * ls;
  }
  // Blutsaat (Vorian)
  if (school === 'blood' && p.hero === 'vorian') e.bstack = Math.min(5, e.bstack + 1);
  // Male & Reaktionen
  if (school !== 'none' && !o.noMark) applyMarks(e, school, dmg, o.extraMarks);
  if ((!o.quiet || crit) && (crit || G.realT - (e.numT || -1) > 0.22)) {
    e.numT = G.realT;
    const col = crit ? '#ffe070' : school === 'blood' ? '#ffd0d4' : school === 'shadow' ? '#e0d0ff' : school === 'qi' ? '#d0fff4' : '#ffffff';
    addText(e.x, e.y - 20 - e.r, Math.round(dmg).toString(), col, crit ? 15 : 10.5, { crit });
  }
  if (crit) sfx('crit', 0, 0.05); else sfx('hit', 0, 0.045);
  if (e.hp <= 0) { killEnemy(e, src, school); return true; }
  return false;
}
function applyMarks(e, school, dmg, extra) {
  const G = GAME, t = G.t;
  const key = school === 'blood' ? 'b' : school === 'shadow' ? 's' : 'q';
  e.mk[key] = t;
  if (extra) for (const k of extra) e.mk[k] = t;
  if (e.rcd > t) return;
  const win = 3;
  const hb = t - e.mk.b < win, hs = t - e.mk.s < win, hq = t - e.mk.q < win;
  const n = (hb ? 1 : 0) + (hs ? 1 : 0) + (hq ? 1 : 0);
  if (n < 2) return;
  e.rcd = t + 1.1;
  e.mk.b = e.mk.s = e.mk.q = -9;
  G.stats.reactions++;
  const p = G.p;
  const m = p.st.might;
  if (n === 3) { // Dreiklang
    const r = 76 * p.st.area;
    addText(e.x, e.y - 44, 'DREIKLANG', '#ffffff', 13, { label: true, life: 0.9 });
    sfx('reaction', 't', 0.08);
    GAME.later(0.02, () => {
      forEnemiesInRadius(e.x, e.y, r, (o) => dealDamage(o, 26, 'none', 'reaktion', { kb: 160, kx: o.x - e.x, ky: o.y - e.y, norm: true, quiet: true }));
    });
    fxRing(e.x, e.y, 10, r, 0.35, '#ff3a4e', 6); fxRing(e.x, e.y, 10, r * 0.85, 0.35, '#a77bff', 5); fxRing(e.x, e.y, 10, r * 0.7, 0.35, '#4ff0cc', 4);
    fxFlash(e.x, e.y - 14, 50, '#ffffff', 0.2);
    burstBlood(e.x, e.y, 5, 0.9); burstShadow(e.x, e.y, 4, 0.8); burstQi(e.x, e.y, 6, 0.8);
  } else if (hb && hs) { // Verderbnis
    e.corruptT = 3; e.corDps = 8 * m; e.corrupt = true;
    addText(e.x, e.y - 44, 'VERDERBNIS', REACTIONS.bs.col, 12, { label: true, life: 0.8 });
    sfx('reaction', 'b', 0.08);
    burstShadow(e.x, e.y, 5, 0.6); burstBlood(e.x, e.y, 4, 0.6);
  } else if (hb && hq) { // Aderbruch
    addText(e.x, e.y - 44, 'ADERBRUCH', REACTIONS.bq.col, 12, { label: true, life: 0.8 });
    sfx('reaction', 'q', 0.08);
    healPlayer(1.5, true);
    GAME.later(0.03, () => dealDamage(e, dmg * 0.9 / Math.max(0.5, heroDamageMult(p, 'none')), 'none', 'reaktion', { quiet: false, noCrit: true }));
    fxFlash(e.x, e.y - 14, 34, '#ff9a6a', 0.18); burstBlood(e.x, e.y, 8, 1.1);
  } else { // Leere
    addText(e.x, e.y - 44, 'LEERE', REACTIONS.sq.col, 12, { label: true, life: 0.8 });
    sfx('reaction', 's', 0.08);
    if (!e.boss) e.stunT = Math.max(e.stunT, e.mini ? 0.3 : 1.2);
    const r = 70 * p.st.area;
    forEnemiesInRadius(e.x, e.y, r, (o) => { if (o === e || o.boss) return; const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1; o.kvx += dx / d * 180 / Math.sqrt(o.mass); o.kvy += dy / d * 180 / Math.sqrt(o.mass); });
    fxRing(e.x, e.y, r, 6, 0.3, '#6ab0ff', 4);
  }
}

function killEnemy(e, src, school) {
  const G = GAME, p = G.p;
  e.dead = true; e.deathT = 0;
  G.kills++;
  e.killDir = Math.atan2(e.y - p.y, e.x - p.x);
  if (e.boss) return bossDefeated(e);
  const D = e.def;
  // Beute
  let xp = D.xp * (e.elite ? 12 : 1);
  dropGem(e.x, e.y, xp);
  if (Math.random() < (e.elite ? 1 : e.mini ? 1 : 0.035)) dropPickup(e.x + rand(-8, 8), e.y + rand(-8, 8), 'soul', e.elite || e.mini ? 25 : 1);
  if (Math.random() < 0.012 || e.elite) dropPickup(e.x + 10, e.y, 'heal', 1);
  if (Math.random() < 0.0025) dropPickup(e.x, e.y + 10, 'magnet', 1);
  if (G.onKill) G.onKill(e);
  if (e.mini) { G.miniKilled = true; dropPickup(e.x, e.y, 'chest', 1); G.mini = null; UI.announce(e.def.name + ' ist gefallen!', ''); sfx('roar'); shake(6); hitstop(0.08); }
  // Todes-Effekte je nach Art
  const gore = D.gore;
  if (gore === 'light') { burstSparks(e.x, e.y - 20, 10, '#ffe6a0', 0.9); burstQi(e.x, e.y - 20, 6, 0.6, '#fff4d0'); }
  else if (gore === 'void') { burstShadow(e.x, e.y, 6, 0.8); burstQi(e.x, e.y - 20, 6, 0.6, '#c08aff'); }
  else if (e.role === 'bat') { burstBlood(e.x, e.y - 20, 6, 0.7); splat(e.x, e.y, 14); }
  else if (e.role === 'knight' || e.role === 'captain') { burstSparks(e.x, e.y - 20, 6, '#e8dcc0', 0.8); burstAsh(e.x, e.y - 10, 5, '#6a6258'); }
  else if (e.role === 'witch') { burstQi(e.x, e.y - 24, 10, 0.8, '#7dff9a'); burstAsh(e.x, e.y - 10, 5, '#3a4a3a'); }
  else if (e.role === 'brute') { burstBlood(e.x, e.y - 20, 22, 1.3); splat(e.x, e.y, 40); sfx('splat'); shake(2);
    for (let i = 0; i < (D.splits || 0); i++) { const a = i / D.splits * TAU; const s = makeEnemy('ghoul', e.x + Math.cos(a) * 20, e.y + Math.sin(a) * 14); s.kvx = Math.cos(a) * 200; s.kvy = Math.sin(a) * 200; } }
  else { burstBlood(e.x, e.y - 16, 7, 0.9); if (Math.random() < 0.5) splat(e.x, e.y, 18); }
  if (school === 'shadow') burstShadow(e.x, e.y, 3, 0.6);
  sfx('kill', 0, 0.05);
  // Verderbnis: Schattenfeuer aus dem Opfer
  if (e.corrupt) { const n2 = nearestEnemy(e.x, e.y, 200); if (n2) GAME.later(0.05, () => shadowFlame(e.x, e.y - 10, n2, 12, 0, 'verderbnis')); }
  // Blutsaat / Kettenreaktion
  const kr = p.passives.kettenreaktion || 0;
  const bloodHit = G.t - e.mk.b < 3 || e.bstack > 0;
  let burstR = 0, burstD = 0;
  if (p.hero === 'vorian' && e.bstack >= (kr > 0 ? 1 : 3)) { burstR = 26 + e.bstack * 7; burstD = 5 * e.bstack; }
  if (kr > 0 && bloodHit && Math.random() < [0, 0.35, 0.5, 0.65, 0.8, 0.95][kr]) { burstR = Math.max(burstR, 34 + kr * 6 + (kr >= 2 ? 6 : 0)); burstD += 8 + kr * 4; }
  if (burstR > 0 && (e.chainDepth || 0) < (kr >= 5 ? 3 : 1)) {
    const depth = (e.chainDepth || 0) + 1;
    GAME.later(0.07, () => bloodBurstAt(e.x, e.y, burstR * p.st.area, burstD, kr > 0 ? 'kettenreaktion' : 'blutsaat', depth));
  }
}
function bloodBurstAt(x, y, r, dmg, src, depth) {
  burstBlood(x, y - 10, 8, 1); splat(x, y, r * 0.9);
  if (GAME.p.hero === 'vorian' && (src === 'blutsaat' || src === 'kettenreaktion' || src === 'karminsturm')) GAME.p.healAcc += 0.7;
  sfx('splat', 0, 0.06);
  addEffect({ x, y, dur: 0.22, layer: 1, draw(g, e, k) {
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k;
    const s = glowSprite('#ff2a40', true), rr = r * (0.6 + k * 0.6);
    g.drawImage(s, x - rr, y - rr * 0.7 - 8, rr * 2, rr * 1.4);
  }, update() { addLight(x, y, r * 2, '#ff3048', 0.8); } });
  forEnemiesInRadius(x, y, r, (o) => { o.chainDepth = depth || 0; dealDamage(o, dmg, 'blood', src, { kb: 80, kx: o.x - x, ky: o.y - y, norm: true, quiet: true }); });
}
function bossDefeated(e) {
  const G = GAME;
  if (G.onKill) G.onKill(e);
  G.bossAlive = false; G.won = true;
  SAVE.stats.bossKills++;
  UI.announce(e.def.name.split(',')[0].toUpperCase() + ' IST GEFALLEN', 'boss');
  sfx('roar'); sfx('bell'); shake(14); hitstop(0.25);
  G.slowmo = 2.5;
  for (let i = 0; i < 14; i++) GAME.later(i * 0.12, () => { const x = e.x + rand(-50, 50), y = e.y + rand(-100, 0); bloodBurstAt(x, y, 60, 0, 'reaktion'); fxFlash(x, y, 80, '#ff8a3a', 0.3); sfx('nova', 0, 0); });
  for (const o of G.enemies) if (!o.boss && !o.dead) { o.dead = true; o.deathT = 0; burstAsh(o.x, o.y, 3); }
  for (let i = 0; i < 30; i++) dropPickup(e.x + rand(-80, 80), e.y + rand(-60, 60), 'soul', 5);
  GAME.later(3.2, () => endRun(true));
}

/* -------------------------------------------------------- Spieler nimmt Schaden */
function damagePlayer(amount, src, heavy) {
  const G = GAME, p = G.p;
  if (!p.alive || p.iframes > 0 || G.state !== 'play') return false;
  let dmg = amount * p.st.dmgTaken;
  if (p.hero === 'shen' && p.rooted > 0.5) dmg *= 0.7;
  dmg = Math.max(1, dmg - p.st.armor);
  p.hp -= dmg;
  G.stats.taken += dmg;
  const sk = src ? (src.type || src.kind || '?') : '?'; G.stats.takenBy = G.stats.takenBy || {}; G.stats.takenBy[sk] = (G.stats.takenBy[sk] || 0) + dmg;
  p.iframes = heavy ? 0.9 : 0.42;
  p.hurtT = 0.3;
  shake(heavy ? 9 : 4);
  hitstop(heavy ? 0.08 : 0.035);
  sfx('hurt', 0, 0.1);
  haptic(heavy ? 60 : 25);
  UI.hurtFlash(heavy ? 1 : 0.6);
  burstBlood(p.x, p.y - 20, 6, 0.8);
  addText(p.x, p.y - 64, '-' + Math.round(dmg), '#ff5a5a', 16, { always: true });
  if (src && src.x !== undefined) { const a = Math.atan2(p.y - src.y, p.x - src.x); p.kvx += Math.cos(a) * (heavy ? 260 : 120); p.kvy += Math.sin(a) * (heavy ? 260 : 120); }
  if (p.hp <= 0) {
    if (G.revive) {
      G.revive = false; p.hp = p.st.maxHp * 0.5; p.iframes = 2.5;
      UI.announce('Zweite Nacht — du erhebst dich erneut!', 'boss');
      for (const e of G.enemies) if (!e.boss && dist2(e.x, e.y, p.x, p.y) < 220 * 220) { const a = Math.atan2(e.y - p.y, e.x - p.x); e.kvx += Math.cos(a) * 600; e.kvy += Math.sin(a) * 600; }
      fxRing(p.x, p.y, 10, 240, 0.5, '#ffe6a0', 8); sfx('ult');
    } else {
      p.hp = 0; p.alive = false; p.deadT = 0;
      sfx('lose'); shake(10); G.slowmo = 1.5;
      AudioSys.stopMusic();
      GAME.later(2.4, () => endRun(false));
    }
  }
  return true;
}
function healPlayer(v, fromSteal) {
  const p = GAME.p;
  if (!p.alive) return;
  const before = p.hp;
  p.hp = Math.min(p.st.maxHp, p.hp + v);
  const d = p.hp - before;
  GAME.stats.healed += d;
  if (!fromSteal && d > 0.5) { addText(p.x, p.y - 66, '+' + Math.round(d), '#7dff9a', 14, { always: true }); sfx('heal'); }
}

/* -------------------------------------------------------- Beute */
function dropGem(x, y, v) {
  const G = GAME;
  if (G.pickups.length > 420) { // zusammenfassen, damit es fluessig bleibt
    for (const q of G.pickups) if (q.kind === 'xp' && !q.magnet && dist2(q.x, q.y, x, y) < 200 * 200) { q.v += v; q.size = gemSize(q.v); return; }
  }
  G.pickups.push({ kind: 'xp', x: x + rand(-4, 4), y: y + rand(-4, 4), v, size: gemSize(v), magnet: false, vx: 0, vy: 0, t: rand(0, 3), z: 8, vz: 80 });
}
function gemSize(v) { return v >= 20 ? 3 : v >= 5 ? 2 : v >= 2 ? 1 : 0; }
function dropPickup(x, y, kind, v) { GAME.pickups.push({ kind, x, y, v, magnet: false, vx: 0, vy: 0, t: 0, z: 10, vz: 120 }); }
function updatePickups(dt) {
  const G = GAME, p = G.p;
  const pr = p.st.pickup, pr2 = pr * pr;
  let w = 0;
  let gemSnd = 0;
  for (const q of G.pickups) {
    q.t += dt;
    if (q.vz || q.z > 0) { q.vz -= 400 * dt; q.z = Math.max(0, q.z + q.vz * dt); if (q.z === 0) q.vz = 0; }
    const d2 = dist2(q.x, q.y, p.x, p.y);
    if (!q.magnet && (d2 < pr2 || (q.kind === 'xp' && G.magnetAll))) q.magnet = true;
    if ((q.kind === 'chest' || q.kind === 'book') && d2 < 40 * 40) q.magnet = true;
    if (q.kind === 'book' && !q.magnet) { G.pickups[w++] = q; continue; }
    if (q.magnet && p.alive) {
      const d = Math.sqrt(d2) || 1;
      const sp = 260 + q.t * 200;
      q.vx = lerp(q.vx, (p.x - q.x) / d * sp, 1 - Math.exp(-dt * 10));
      q.vy = lerp(q.vy, (p.y - q.y) / d * sp, 1 - Math.exp(-dt * 10));
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (d < 16) { collect(q); gemSnd++; continue; }
    }
    G.pickups[w++] = q;
  }
  G.pickups.length = w;
  G.magnetAll = false;
}
function collect(q) {
  const G = GAME, p = G.p;
  if (q.kind === 'xp') {
    G.xp += q.v * p.st.xpMul;
    G.gemCombo = (G.gemCombo || 0) + 1; G.gemComboT = 0.4;
    sfx('gem', Math.min(12, G.gemCombo), 0.03);
    while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpNeed(G.level); G.pendingLevels++; }
  } else if (q.kind === 'book') { finnEvolve(1); }
  else if (q.kind === 'crystal') { G.crystals = (G.crystals || 0) + q.v; sfx('gem', 18, 0.03); }
  else if (q.kind === 'soul') { G.souls += q.v; sfx('gem', 14, 0.03); }
  else if (q.kind === 'heal') { healPlayer(p.st.maxHp * 0.3 * (p.hero === 'liora' ? 1.5 : 1)); burstBlood(p.x, p.y - 20, 6, 0.5); }
  else if (q.kind === 'magnet') { G.magnetAll = true; for (const o of G.pickups) if (o.kind === 'xp') o.magnet = true; sfx('heal'); UI.toast(GAME.story ? 'Mondstein: alle Kristalle und Splitter fliegen zu dir' : 'Mondstein: alle Seelensplitter fliegen zu dir'); }
  else if (q.kind === 'chest') {
    healPlayer(p.st.maxHp * 0.5); G.souls += 40;
    G.pendingLevels += 1; fxRing(p.x, p.y, 10, 140, 0.5, '#ffe6a0', 6); sfx('fusion');
    UI.toast('Truhe des Hauptmanns: Heilung, 40 Seelen, Stufenaufstieg');
  }
}

/* -------------------------------------------------------- Karten */
function ownedAbilities() { return Object.keys(GAME.p.ab); }
function abilityCount() { return Object.keys(GAME.p.ab).filter((k) => CARDS[k]).length; }
function passiveCount() { return Object.keys(GAME.p.passives).length; }
function hasSchool(school) {
  const p = GAME.p;
  for (const id in p.ab) { if (ABILITY_SCHOOL[id] === school) return true; if (FUSIONS[id] && FUSIONS[id].schools.includes(school)) return true; }
  return false;
}
function schoolLevel(school) {
  let m = 0; const p = GAME.p;
  for (const id in p.ab) if (ABILITY_SCHOOL[id] === school) m = Math.max(m, p.ab[id].lvl);
  for (const id in p.ab) if (FUSIONS[id] && FUSIONS[id].schools.includes(school)) m = Math.max(m, 5);
  return m;
}
function fusionReady(fid) {
  const F = FUSIONS[fid], p = GAME.p;
  if (!F.heroes.includes(p.hero) || p.ab[fid]) return false;
  for (const k in F.req) {
    if (k === 'anyBlood') { if (schoolLevel('blood') < F.req[k]) return false; continue; }
    if (k === 'anyShadow') { if (schoolLevel('shadow') < F.req[k]) return false; continue; }
    if (k === 'anyQi') { if (schoolLevel('qi') < F.req[k]) return false; continue; }
    const lv = CARDS[k].kind === 'passive' ? (p.passives[k] || 0) : (p.ab[k] ? p.ab[k].lvl : 0);
    if (lv < F.req[k]) return false;
  }
  return true;
}
function makeOffers() {
  const G = GAME, p = G.p, H = HEROES[p.hero];
  const cands = [];
  // Fusionen haben Vorrang (goldene Karte)
  for (const fid in FUSIONS) if (fusionReady(fid)) cands.push({ id: fid, fusion: true, w: 1000 });
  const heroSlots = H.slotsOf ? H.slotsOf(p) : H.slots;
  const slotsA = abilityCount() < heroSlots, slotsP = passiveCount() < 4;
  for (const id of (H.poolOf ? H.poolOf(p) : H.pool)) {
    const C = CARDS[id];
    if (C.kind === 'ability') {
      // bereits in einer Fusion aufgegangen?
      if (Object.keys(FUSIONS).some((f) => p.ab[f] && FUSIONS[f].consumes.includes(id))) continue;
      const own = p.ab[id];
      if (own) { if (own.lvl < C.max) cands.push({ id, w: 3.2 + own.lvl * 0.3 }); }
      else if (slotsA) cands.push({ id, w: (ABILITY_SCHOOL[id] === H.school ? 1.6 : 1.1) });
    } else {
      const lv = p.passives[id] || 0;
      if (lv >= C.max) continue;
      if (!lv && !slotsP) continue;
      // nutzlose Angebote vermeiden
      if (C.needsSchool && !hasSchool(C.needsSchool) && !(C.needsSchool === 'qi' && p.hero === 'shen') && !(C.needsSchool === 'blood' && p.hero === 'vorian')) continue;
      if (id === 'lebensraub' && p.hero === 'liora' && lv === 0 && G.level < 3) continue;
      let w = lv ? 2.2 : 1.1;
      if (id === 'vampirblut' && p.hp < p.st.maxHp * 0.5) w *= 1.8;
      if (id === 'kettenreaktion' && p.hero === 'vorian') w *= 1.6;
      if (id === 'eisenmeridiane' && p.hero === 'shen') w *= 1.5;
      cands.push({ id, w });
    }
  }
  const out = [];
  const pool = cands.slice();
  while (out.length < 3 && pool.length) {
    let tot = 0; for (const c of pool) tot += c.w;
    let r = Math.random() * tot, idx = 0;
    for (let i = 0; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) { idx = i; break; } }
    out.push(pool.splice(idx, 1)[0]);
  }
  // Mindestens eine Bewegungs- oder Ueberlebenskarte, wenn moeglich nicht nur Schaden
  while (out.length < 3) out.push({ id: out.length % 2 ? 'soulgift' : 'bloodcup', filler: true });
  return out;
}
function giveCard(id, silent) {
  const G = GAME, p = G.p;
  if (id === 'bloodcup') { healPlayer(p.st.maxHp * 0.35); return; }
  if (id === 'soulgift') { G.souls += 25; return; }
  if (FUSIONS[id]) {
    const F = FUSIONS[id];
    for (const c of F.consumes) delete p.ab[c];
    p.ab[id] = { lvl: 1, t: 0.3, fusion: true };
    G.stats.fusions.push(id);
    SAVE.stats.fusions++;
    SAVE.seenFusions[id] = true;
    sfx('fusion'); shake(8); hitstop(0.15);
    fxRing(p.x, p.y, 10, 260, 0.8, '#ffe6a0', 10);
    for (const s of F.schools) { if (s === 'blood') burstBlood(p.x, p.y, 30, 1.6); if (s === 'shadow') burstShadow(p.x, p.y, 24, 1.6); if (s === 'qi') burstQi(p.x, p.y, 30, 1.6); }
    UI.announce('FUSION: ' + F.name, 'fusion');
    recomputeStats();
    return;
  }
  const C = CARDS[id];
  if (C.kind === 'ability') {
    if (p.ab[id]) p.ab[id].lvl++;
    else { p.ab[id] = { lvl: 1, t: 0.4 }; p.order.push(id); }
  } else {
    p.passives[id] = (p.passives[id] || 0) + 1;
  }
  recomputeStats();
  if (!silent) sfx('card');
}

/* -------------------------------------------------------- Update */
function updatePlayer(dt) {
  const G = GAME, p = G.p, H = HEROES[p.hero];
  readMove();
  if (!p.alive) { p.deadT += dt; p.vx *= 0.9; p.vy *= 0.9; return; }
  p.iframes = Math.max(0, p.iframes - dt);
  p.hurtT = Math.max(0, p.hurtT - dt);
  p.castT = Math.max(0, p.castT - dt);
  p.dodgeCd = Math.max(0, p.dodgeCd - dt);
  p.ultCd = Math.max(0, p.ultCd - dt);
  p.ultT = Math.max(0, p.ultT - dt);
  p.buffAder = Math.max(0, p.buffAder - dt);
  // Eingaben fuer Ausweichen / Ultimate
  if (INPUT.dodgePressed) { INPUT.dodgePressed = false; doDodge(p); }
  if (INPUT.ultPressed) { INPUT.ultPressed = false; castUlt(p); }
  let mx = INPUT.moveX, my = INPUT.moveY;
  const mag = Math.hypot(mx, my);
  if (mag > 0.1) { p.lastMoveX = mx / mag; p.lastMoveY = my / mag; }
  let speed = p.st.speed * (p.ultT > 0 && p.hero === 'nyx' ? 1.45 : 1) * (p.rageSpeedMove || 1);
  let tvx = mx * speed, tvy = my * speed;
  if (p.dodgeT > 0) {
    p.dodgeT -= dt;
    const dk = dodgeKind(p);
    if (dk !== 'shadowstep' && dk !== 'blink') { const ds = speed * (dk === 'mist' ? 2.6 : 2.9); tvx = p.dodgeDir[0] * ds; tvy = p.dodgeDir[1] * ds; }
    if (dk === 'mist' && Math.random() < 0.8) spawnPart({ x: p.x + rand(-10, 10), y: p.y + rand(-6, 6), z: rand(10, 40), vx: rand(-30, 30), vy: rand(-30, 30), vz: 20, drag: 2, life: 0.5, size: 8, size1: 16, spr: tinted('smoke', '#8a0a20'), alpha: 0.7, alpha1: 0 });
    if (p.dodgeT <= 0 && dk === 'slide') { // Meister: Gleitschritt endet in einem kleinen Qi-Stoss
      forEnemiesInRadius(p.x, p.y, 60, (en) => dealDamage(en, 10, 'qi', 'harmonie', { kb: 200 * p.st.kb, kx: en.x - p.x, ky: en.y - p.y, norm: true, quiet: true }));
      fxRing(p.x, p.y, 10, 60, 0.25, '#5ff0d0', 4); p.qi = Math.min(5, p.qi + 0.25);
    }
  }
  const acc = p.dodgeT > 0 ? 30 : 16;
  p.vx = lerp(p.vx, tvx, 1 - Math.exp(-dt * acc));
  p.vy = lerp(p.vy, tvy, 1 - Math.exp(-dt * acc));
  p.x += (p.vx + p.kvx) * dt; p.y += (p.vy + p.kvy) * dt;
  p.kvx *= Math.exp(-dt * 10); p.kvy *= Math.exp(-dt * 10);
  const sp = Math.hypot(p.vx, p.vy);
  p.runAmt = lerp(p.runAmt, clamp(sp / p.st.speed, 0, 1.2), 1 - Math.exp(-dt * 12));
  p.phase += sp * dt / (HERO_ART[p.hero].spec.stride * 2.3 + 4) ;
  if (Math.abs(p.vx) > 15 && p.castT <= 0) p.face = p.vx > 0 ? 1 : -1;
  p.animT += dt;
  // Heldenmechaniken
  if (sp < 12 && p.dodgeT <= 0) p.stillT += dt; else p.stillT = 0;
  if (p.hero === 'shen') {
    const root = p.stillT > 0.35;
    p.rooted = lerp(p.rooted, root ? 1 : 0, 1 - Math.exp(-dt * 8));
    const rate = (root ? 1 / 1.05 : 1 / 7) * p.st.qiRate;
    const before = Math.floor(p.qi);
    p.qi = Math.min(5, p.qi + rate * dt);
    if (Math.floor(p.qi) > before) { sfx('gem', 16, 0); burstQi(p.x, p.y - 30, 6, 0.4); }
    if (root && (p.passives.eisenmeridiane || 0) >= 5) healPlayer(0.8 * dt, true);
    if (root) addLight(p.x, p.y, 120, '#5ff0d0', 0.5);
  }
  if (p.hero === 'nyx') {
    if (sp > 40) p.flow = Math.min(1, p.flow + dt / 1.6); else p.flow = Math.max(0, p.flow - dt / 0.9);
    if (p.flow > 0.3 && Math.random() < p.flow * 0.6 * FXQ) spawnPart({ x: p.x + rand(-8, 8), y: p.y, z: rand(0, 12), vx: -p.vx * 0.2, vy: -p.vy * 0.2, vz: rand(10, 30), g: -10, drag: 2, life: 0.6, size: 6, size1: 12, spr: PART.shadowwisp, alpha: 0.6, alpha1: 0 });
  }
  if (p.hero === 'liora') {
    const miss = 1 - p.hp / p.st.maxHp;
    p.rageSpeed = 1 + clamp(miss * 0.55, 0, 0.4) + (p.buffAder > 0 ? 0.3 : 0);
    if (p.buffAder > 0 && Math.random() < 0.5 * FXQ) spawnPart({ x: p.x + rand(-14, 14), y: p.y, z: rand(0, 40), vx: 0, vy: 0, vz: rand(30, 70), g: -20, drag: 1, life: 0.6, size: 3, size1: 1, spr: tinted('spark', '#ff3a4e'), layer: 1 });
  }
  if (p.hero === 'nyx' && p.ultT > 0 && Math.random() < 0.9) spawnPart({ x: p.x + rand(-10, 10), y: p.y + rand(-4, 4), z: rand(0, 40), vx: rand(-20, 20), vy: rand(-20, 20), vz: 30, g: -20, drag: 2, life: 0.8, size: 10, size1: 18, spr: PART.shadowwisp, alpha: 0.8, alpha1: 0 });
  // Regeneration & gesammelter Lebensraub (Heil-Limit pro Sekunde)
  p.regenAcc += p.st.regen * dt;
  if (p.regenAcc >= 1) { healPlayer(Math.floor(p.regenAcc), true); p.regenAcc -= Math.floor(p.regenAcc); }
  if (p.healAcc > 0) {
    const cap = (1.5 + (p.passives.lebensraub || 0) * 0.8 + ((p.passives.lebensraub || 0) >= 5 ? 2 : 0)) * (p.buffAder > 0 ? 2.5 : 1) * dt;
    const h = Math.min(p.healAcc, cap);
    healPlayer(h, true); p.healAcc = Math.min(p.healAcc - h, 30);
  }
  // Faehigkeiten
  for (const id in p.ab) { const f = TICKS[id], ab = p.ab[id]; if (f) f(p, ab, (ab.ulti ? dt * 1.3 : dt) * ((p.frenzyT || 0) > GAME.t ? 2 : 1)); if (ab.ulti && typeof ULTI !== 'undefined' && ULTI[id] && p.ab[id]) tickUlti(p, id, ab, dt); }
  // Licht der Figur (Lesbarkeit: der Held ist immer gut ausgeleuchtet)
  addLight(p.x, p.y - 20, 340, '#ffeedd', 1);
  addLight(p.x, p.y - 20, 150, '#ffffff', 0.6);
  addLight(p.x, p.y - 10, 110, heroRim(p), 0.55);
}
function updateCamera(dt) {
  const G = GAME, p = G.p, c = G.cam;
  const lead = 0.28;
  const tx = p.x + p.vx * lead, ty = p.y - 18 + p.vy * lead;
  c.x = lerp(c.x, tx, 1 - Math.exp(-dt * 5));
  c.y = lerp(c.y, ty, 1 - Math.exp(-dt * 5));
  c.w = VIEW.w; c.h = VIEW.h;
}
function updateGame(rdt) {
  const G = GAME;
  if (G.state !== 'play') return;
  if (G.hitstop > 0) { G.hitstop -= rdt; return; }
  let dt = rdt;
  if (G.slowmo > 0) { G.slowmo -= rdt; }
  if (!G.p.alive || G.won) dt = rdt * 0.5;
  G.realT += rdt;
  if (G.p.alive && !G.won) G.t += dt;
  // Timer
  for (let i = G.timers.length - 1; i >= 0; i--) { const tm = G.timers[i]; tm.t -= dt; if (tm.t <= 0) { G.timers.splice(i, 1); tm.fn(); } }
  FX.lights.length = 0;
  gridBuild();
  updatePlayer(dt);
  if (G.p.alive && !G.won) updateSpawns(dt);
  gridBuild();
  updateEnemies(dt);
  updateEnemyShots(dt);
  updateImages(dt);
  if (G.comps) updateCompanions(dt);
  updatePickups(dt);
  updateFX(dt);
  updateCamera(rdt);
  G.shake = Math.max(0, G.shake - rdt * 30);
  if (G.gemComboT > 0) { G.gemComboT -= rdt; if (G.gemComboT <= 0) G.gemCombo = 0; }
  AudioSys.musicTick(rdt, clamp(G.alive / 150, 0, 1) * 0.7 + (G.bossAlive ? 0.3 : 0));
  const HH = HEROES[G.hero]; if (HH.onUpdate) HH.onUpdate(dt);
  if (G.quests && G.p.alive && !G.won) storyQuestTick();
  if (G.pendingLevels > 0 && G.p.alive && !G.won && G.state === 'play') { G.pendingLevels--; openLevelUp(); }
}
function openLevelUp() {
  const G = GAME;
  G.state = 'levelup';
  G.offers = makeOffers();
  sfx('level');
  UI.showLevelUp(G.offers);
}
function chooseCard(i) {
  const G = GAME;
  if (G.state !== 'levelup') return;
  const o = G.offers[i];
  giveCard(o.id);
  G.state = 'play';
  G.p.iframes = Math.max(G.p.iframes, 0.6);
  UI.hideLevelUp();
  fxRing(G.p.x, G.p.y, 10, 90, 0.4, o.fusion ? '#ffe6a0' : SCHOOL[(CARDS[o.id] || { school: 'none' }).school || 'none'].col, 5);
}
function rerollCards() {
  const G = GAME;
  if (G.state !== 'levelup' || G.rerolls <= 0) return;
  G.rerolls--;
  G.offers = makeOffers();
  sfx('card');
  UI.showLevelUp(G.offers);
}
function endRun(won) {
  const G = GAME;
  if (G.state === 'over') return;
  G.state = 'over';
  AudioSys.stopMusic();
  const gier = 1 + 0.12 * (SAVE.meta.gier || 0);
  const soulsEarned = Math.round((G.souls + G.kills * 0.05 + Math.floor(G.t / 60) * 12 + (won ? 250 : 0)) * gier);
  SAVE.souls += soulsEarned; SAVE.totalSouls += soulsEarned;
  const S = SAVE.stats;
  S.runs++; S.kills += G.kills; S.bestTime = Math.max(S.bestTime, G.t); S.maxLevel = Math.max(S.maxLevel, G.level);
  const hs = SAVE.heroStats[G.hero] || (SAVE.heroStats[G.hero] = { runs: 0, best: 0, wins: 0 });
  hs.runs++; hs.best = Math.max(hs.best, G.t); if (won) hs.wins++;
  // neue Freischaltungen pruefen
  const newly = [];
  for (const id of HERO_ORDER) if (!SAVE.unlocked[id] && HEROES[id].unlock.check(SAVE)) { SAVE.unlocked[id] = true; newly.push(id); }
  const HE = HEROES[G.hero];
  const extra = HE.onEnd ? HE.onEnd(won) : null;
  writeSave();
  if (won) sfx('win');
  UI.showEnd(won, soulsEarned, newly, extra);
}

function dodgeKind(p) { return p.dodgeKind || HEROES[p.hero].dodge; }
function heroRim(p) { return p.hero === 'finn' ? FINN_TIERS[p.tier || 0].rim : HERO_ART[p.hero].rim; }
