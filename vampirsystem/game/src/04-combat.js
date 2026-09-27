'use strict';
/* ==========================================================================
   KAMPF — Echtzeit-Kern (Gefecht / Duell)
   Quinn: Combo (tippen), aufgeladener Schlag (halten), Ausweichen mit
   Unverwundbarkeit, perfektes Ausweichen -> Konterfenster, Ausdauer.
   Gegner: angekuendigte Angriffe (Bodenmarkierung), Haltung (Poise), Phasen.
   ========================================================================== */

let G = null; // laufender Kampf

const COMBO = [
  { dmg: 1, win: 0.06, act: 0.07, rec: 0.17, reach: 30, arc: 0.95, kb: 50, cost: 9, lunge: 40 },
  { dmg: 1, win: 0.06, act: 0.07, rec: 0.19, reach: 30, arc: 0.95, kb: 60, cost: 9, lunge: 50 },
  { dmg: 2, win: 0.11, act: 0.08, rec: 0.32, reach: 36, arc: 1.1, kb: 190, cost: 14, lunge: 90, kick: true }
];
const CHARGED = { dmg: 3, win: 0.05, act: 0.09, rec: 0.36, reach: 38, arc: 1.0, kb: 280, cost: 22, lunge: 140, poise: 3 };
// Kampfsaetze der spielbaren Figuren (Tag-Team)
const KITS = {
  fist: { combo: COMBO, charged: CHARGED },
  bow: { // Layla: Bestienbogen
    combo: [{ dmg: 1.5, win: 0.14, act: 0.05, rec: 0.3, cost: 8, lunge: -30, proj: { sp: 430, max: 230, col: '#c8a0ff', kind: 'arrow' } }],
    charged: { dmg: 3.5, win: 0.1, act: 0.05, rec: 0.42, cost: 20, lunge: -50, poise: 2, proj: { sp: 560, max: 320, col: '#f0e0ff', kind: 'arrow', pierce: true } }
  },
  sword: { // Erin: Schwert und Eis
    combo: [
      { dmg: 1.5, win: 0.08, act: 0.08, rec: 0.2, reach: 44, arc: 1.2, kb: 60, cost: 10, lunge: 50 },
      { dmg: 1.5, win: 0.08, act: 0.08, rec: 0.22, reach: 44, arc: 1.2, kb: 70, cost: 10, lunge: 50 },
      { dmg: 2.5, win: 0.12, act: 0.1, rec: 0.34, reach: 50, arc: 1.3, kb: 180, cost: 14, lunge: 90, kick: true }
    ],
    charged: { dmg: 3, win: 0.06, act: 0.1, rec: 0.4, reach: 64, arc: 1.6, kb: 120, cost: 22, lunge: 40, poise: 3, ice: true }
  },
  raten: { // Raten: schnelle Schlaege; aufgeladen Telekinese + Wasser zugleich
    combo: [
      { dmg: 1, win: 0.05, act: 0.06, rec: 0.12, reach: 30, arc: 1.0, kb: 40, cost: 7, lunge: 60 },
      { dmg: 1, win: 0.05, act: 0.06, rec: 0.12, reach: 30, arc: 1.0, kb: 40, cost: 7, lunge: 60 },
      { dmg: 1, win: 0.05, act: 0.06, rec: 0.12, reach: 30, arc: 1.0, kb: 40, cost: 7, lunge: 60 },
      { dmg: 2, win: 0.09, act: 0.08, rec: 0.3, reach: 36, arc: 1.1, kb: 200, cost: 12, lunge: 90, kick: true }
    ],
    charged: { dmg: 4, win: 0.12, act: 0.06, rec: 0.45, cost: 26, lunge: 0, poise: 4, double: true, proj: { sp: 380, max: 180, col: '#6ec8ff', kind: 'water' } }
  }
};
const CHARS = {
  quinn: { name: 'Quinn', look: 'quinn', kit: 'fist' },
  layla: { name: 'Layla', look: 'layla', kit: 'bow', hp: 12, str: 10, agi: 12, range: 150 },
  erin: { name: 'Erin', look: 'erin', kit: 'sword', hp: 16, str: 12, agi: 12 },
  raten: { name: 'Raten', look: 'raten', kit: 'raten', hp: 18, str: 12, agi: 13 }
};
const HAMMER = { dmg: 4, win: 0.14, act: 0.08, rec: 0.38, reach: 38, arc: 1.0, kb: 340, cost: 30, lunge: 60, poise: 4, kick: true, hammer: true };

function newFight(opt) {
  G = {
    t: 0, scale: 1, slowT: 0, hitstop: 0, shake: 0, state: 'play',
    arena: opt.arena, ents: [], tele: [], fx: [], texts: [], later: [],
    cam: { x: 0, y: 0 }, hint: null, proj: [], counterFlash: 0, opt, stats: { hits: 0, perfect: 0, taken: 0 }
  };
  G.party = [];
  (opt.party || ['quinn']).forEach((cid, i) => {
    const C = CHARS[cid], e = mkEnt(cid, LOOKS[C.look], opt.playerAt[0] + (i ? (i % 2 ? -34 : 34) : 0), opt.playerAt[1] + (i ? 22 : 0));
    e.team = 0; e.char = cid; e.kit = C.kit; e.range = C.range || 30;
    if (cid === 'quinn') { applyStats(e); if (opt.vr) e.look = LOOKS.bloodevolver; else if (SAVE.quinn.race === 'Vampir' && LOOKS.quinnvamp) e.look = LOOKS.quinnvamp; if (hasSkill('schatten')) { e.maxMc = 100; e.mc = 100; } e.hp = Math.max(1, e.maxHp - (SAVE.quinn.thirst || 0)); if (opt.mask) e.extra = { mask: true }; if (SAVE.quinn.gear.hands) e.extra = Object.assign({}, e.extra, { gauntlets: true }); }
    else { e.maxHp = e.hp = C.hp; e.str = C.str; e.agi = C.agi; e.maxStam = 100; }
    e.stam = e.maxStam; e.stamDelay = 0; e.counterT = 0; e.combo = 0; e.buffer = 0; e.holdT = 0; e.dodgeStart = -9; e.aiCd = rand(0.3, 0.8);
    G.party.push(e);
  });
  const p = G.party[opt.lead || 0];
  G.player = p; G.swapCd = 0;
  for (const f of opt.foes) {
    const e = mkEnt(f.id, LOOKS[f.look || f.id], f.at[0], f.at[1]);
    Object.assign(e, { team: 1, name: f.name, maxHp: f.hp, hp: f.hp, ai: f.ai, poise: f.poise || 3, maxPoise: f.poise || 3, poiseT: 0, phase: 1, cd: f.cd || 0.8, info: f.info, draw: f.draw, fixed: f.fixed, r: f.r || 11, expRate: f.expRate || 0, expKill: f.expKill || 0 });
    e.face = -1;
    G.foe = G.foe || e;
  }
  for (const n of opt.npcs || []) { const e = mkEnt(n.id, LOOKS[n.id], n.at[0], n.at[1]); e.npc = n; e.face = n.face || 1; }
  G.cam.x = p.x; G.cam.y = p.y;
  return G;
}
let _eid = 1;
function mkEnt(kind, look, x, y) {
  const e = { id: _eid++, kind, look, x, y, vx: 0, vy: 0, face: 1, r: 11, hp: 1, maxHp: 1, iframes: 0, flash: 0,
    state: 'idle', stateT: 0, anim: { t: rand(0, 3), run: 0, phase: 0, cast: 0, hurt: 0, dodge: 0, aim: 0, guard: undefined }, spr: null, extra: null };
  G.ents.push(e);
  return e;
}
function later(dt, fn) { G.later.push({ t: dt, fn }); }
function setState(e, s) { e.state = s; e.stateT = 0; }

/* ------------------------------------------------------------ Update */
function updateFight(rdt) {
  if (!G) return;
  // Hitstop friert kurz ein, Zeitlupe nach perfektem Ausweichen
  if (G.hitstop > 0) { G.hitstop -= rdt; updateCamera(rdt); return; }
  if (G.slowT > 0) { G.slowT -= rdt; G.scale = lerp(G.scale, 0.3, 1 - Math.exp(-rdt * 20)); } else G.scale = lerp(G.scale, 1, 1 - Math.exp(-rdt * 8));
  const dt = rdt * G.scale;
  G.t += dt;
  for (let i = G.later.length - 1; i >= 0; i--) { const L = G.later[i]; L.t -= dt; if (L.t <= 0) { G.later.splice(i, 1); L.fn(); if (!G) return; } }
  if (G.arena.pois) updatePois();
  handleInput(dt);
  if (!G) return;
  for (const m of G.party) { if (m === G.player) { const [mx, my] = readMove(); updateFighter(m, dt, mx, my); } else updateAlly(m, dt); }
  G.swapCd = Math.max(0, G.swapCd - dt);
  for (const e of G.ents) if (e.team === 1) updateFoe(e, dt);
  for (const e of G.ents) if (e.npc) updateNpc(e, dt);
  for (const e of G.ents) {
    e.x += e.vx * dt; e.y += e.vy * dt;
    collideArena(e);
    e.iframes = Math.max(0, e.iframes - dt); e.flash = Math.max(0, e.flash - dt);
    e.anim.t += dt;
    const sp = Math.hypot(e.vx, e.vy);
    e.anim.run = lerp(e.anim.run, clamp(sp / 150, 0, 1), 1 - Math.exp(-dt * 12));
    const ph0 = e.anim.phase;
    e.anim.phase += sp * dt / 20;
    if (sp > 60 && Math.floor(ph0 / Math.PI) !== Math.floor(e.anim.phase / Math.PI) && !e.draw) dust(e.x - e.vx * 0.02, e.y, 2, 0.5);
    e.anim.cast = Math.max(0, e.anim.cast - dt * 3.5);
    e.anim.hurt = Math.max(0, e.anim.hurt - dt * 4);
  }
  // Koerper schieben sich auseinander
  const A = G.ents;
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
    const a = A[i], b = A[j]; if (a.npc || b.npc) continue;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
    if (d > 0 && d < m) { const k = (m - d) / 2; a.x -= dx / d * k; a.y -= dy / d * k; b.x += dx / d * k; b.y += dy / d * k; }
  }
  for (let i = G.tele.length - 1; i >= 0; i--) { const T = G.tele[i]; T.t += dt; if (T.t >= T.dur + 0.12) G.tele.splice(i, 1); }
  updateProj(dt);
  updateFx(dt);
  updateCamera(rdt);
  G.counterFlash = Math.max(0, G.counterFlash - rdt);
  if (G.hint && G.hint.until && G.t > G.hint.until) G.hint = null;
  if (G.opt.onTick) G.opt.onTick(G, dt);
}

function handleInput(dt) {
  const p = G.player;
  while (INPUT.events.length) {
    const ev = INPUT.events.shift();
    if (G.state !== 'play') continue;
    if (ev === 'atkDown' && G.poi) { const P = G.poi; G.poi = null; P.action(P); if (!G) return; continue; }
    if (ev === 'atkDown') { p.holdT = 0; tryAttack(p); }
    else if (ev === 'inspect') doInspect(p);
    else if (ev === 'skill1') castBloodSwipe(p);
    else if (ev === 'skill2') castFlashStep(p);
    else if (ev === 'skill3') castHammer(p);
    else if (ev === 'skill4') castBloodSpray(p);
    else if (ev === 'skill5') castShadow(p);
    else if (ev.startsWith && ev.startsWith('swap')) swapTo(+ev.slice(4));
    else if (ev === 'atkUp') { if (p.state === 'charge') releaseCharge(p); p.holdT = -1; }
    else if (ev === 'dodge') tryDodge(p);
  }
  if (INPUT.atkHeld && p.holdT >= 0) p.holdT += dt;
  // lange gehalten und gerade frei -> aufladen
  if (INPUT.atkHeld && p.holdT > 0.3 && (p.state === 'idle' || (p.state === 'attack' && p.stateT > p.atk.win + p.atk.act)) && p.stam >= KITS[p.kit].charged.cost * 0.5) setState(p, 'charge');
  if (!INPUT.atkHeld && p.state === 'charge') releaseCharge(p);
}

function spendStam(p, n, delay) { p.stam = Math.max(0, p.stam - n); p.stamDelay = Math.max(p.stamDelay, delay || 0.25); }
function tryAttack(p) {
  if (p.state === 'hurt' || p.state === 'down' || p.state === 'dodge') { if (p.state === 'dodge') p.buffer = 0.25; return; }
  if (p.state === 'attack') { if (p.stateT > p.atk.win) p.buffer = 0.3; return; }
  if (p.state === 'charge') return;
  startAttack(p, 0);
}
function startAttack(p, step, charged, special) {
  const K = KITS[p.kit || 'fist'];
  const A = special || (charged ? K.charged : K.combo[step]);
  if (p.stam < A.cost * 0.4) { tired(p); return; }
  spendStam(p, A.cost);
  p.atk = A; p.combo = step; p.hitDone = false; p.charged = !!charged;
  setState(p, 'attack');
  // Zielhilfe: zum naechsten Gegner in Reichweite drehen
  const f = nearestFoe(p, A.proj ? 320 : 110);
  if (f) { p.aim = Math.atan2(f.y - p.y, f.x - p.x); p.face = Math.cos(p.aim) >= 0 ? 1 : -1; }
  else { const [mx, my] = p === G.player ? readMove() : [0, 0]; p.aim = (mx || my) ? Math.atan2(my, mx) : (p.face > 0 ? 0 : Math.PI); if (mx) p.face = mx > 0 ? 1 : -1; }
  sfx('whip', 0, 0.04);
}
function releaseCharge(p) {
  const power = p.stateT;
  setState(p, 'idle');
  if (power >= 0.3) { startAttack(p, 0, true); p.anim.cast = 1; }
  else startAttack(p, 0);
}
function tired(p) { floatText(p.x, p.y - 70, 'Keine Ausdauer', '#ffd04a'); p.stamDelay = 0.8; }
function tryDodge(p, dir) {
  if (p.state === 'down' || p.state === 'dodge') return;
  if (p.state === 'hurt' && p.stateT < 0.12) return;
  if (p.stam < 18) { if (p === G.player) tired(p); return; }
  spendStam(p, 22, 0.5);
  const [mx, my] = dir || readMove();
  let a = (mx || my) ? Math.atan2(my, mx) : (p.face > 0 ? Math.PI : 0);
  p.dodgeA = a; p.dodgeStart = G.t; p.iframes = SAVE.settings.wideDodge ? 0.34 : 0.26;
  setState(p, 'dodge'); sfx('dodge'); dust(p.x, p.y, 5, 1);
  if (Math.cos(a) !== 0 && (mx || my)) p.face = Math.cos(a) > 0 ? 1 : -1;
}

function updateFighter(p, dt, mx, my) {
  if (p.state === 'down') { p.vx *= Math.exp(-dt * 6); p.vy *= Math.exp(-dt * 6); return; }
  p.stateT += p.state === 'attack' ? dt * fxOf(p).atk : dt; // Agilitaet: schnellere Angriffe
  p.counterT = Math.max(0, p.counterT - dt);
  p.buffer = Math.max(0, p.buffer - dt);
  p.stamDelay -= dt;
  if (p.stamDelay <= 0 && p.state !== 'charge') p.stam = Math.min(p.maxStam, p.stam + 42 * fxOf(p).regen * dt);
  if (p.maxMc && !G.opt.leere) p.mc = Math.min(p.maxMc, p.mc + 2.5 * dt); // in der Schattenleere laedt MC nicht // MC (Schatten) laedt im Spiel schneller als im Roman
  if (p === G.player) G.inSun = p.char === 'quinn' && inSun(p);
  const sunK = sunFactor(p);
  const spd = 120 * fxOf(p).move;
  // Blutbank: heilt Quinn automatisch unter 5 HP (10 ml = 5 HP)
  if (p.char === 'quinn' && !G.opt.vr && hasSkill('bloodbank') && p.hp < 5 && p.hp > 0 && SAVE.quinn.bank >= 10) {
    SAVE.quinn.bank -= 10; p.hp = Math.min(p.maxHp, p.hp + 5); floatText(p.x, p.y - 80, '+5 Blutbank', '#ff8a9a'); sfx('heal'); burst(p.x, p.y - 30, 8, '#ff3a4e');
  }
  let tvx = 0, tvy = 0;
  if (p.state === 'idle') {
    tvx = mx * spd; tvy = my * spd;
    if (Math.abs(mx) > 0.1) p.face = mx > 0 ? 1 : -1;
  } else if (p.state === 'attack') {
    const A = p.atk, t = p.stateT;
    // kleiner Ausfallschritt waehrend der Ausholbewegung
    const push = t < A.win + A.act ? A.lunge * (1 - t / (A.win + A.act)) : 0;
    tvx = Math.cos(p.aim) * push; tvy = Math.sin(p.aim) * push;
    p.anim.cast = Math.max(p.anim.cast, t < A.win + A.act ? 1 : 0.6);
    p.anim.aim = p.face > 0 ? p.aim : Math.PI - p.aim;
    if (!p.hitDone && t >= A.win) { p.hitDone = true; playerHit(p, A); }
    if (t >= A.win + A.act + A.rec) {
      const next = p.combo + 1;
      if (p.buffer > 0 && !p.charged && !A.hammer && next < KITS[p.kit].combo.length) { p.buffer = 0; startAttack(p, next); }
      else { setState(p, 'idle'); if (p.buffer > 0) { p.buffer = 0; startAttack(p, 0); } }
    }
  } else if (p.state === 'charge') {
    tvx = mx * spd * 0.3; tvy = my * spd * 0.3;
    p.anim.cast = 0.4 + Math.min(0.6, p.stateT);
    p.stamDelay = 0.3;
    if (p.stateT > 0.3 && !p.chargeReady) { p.chargeReady = true; sfx('card'); burst(p.x + p.face * 10, p.y - 36, 6, '#ffd070'); }
  } else if (p.state === 'dodge') {
    const k = p.stateT / 0.3;
    p.ghostT = (p.ghostT || 0) - dt;
    if (p.ghostT <= 0 && p.spr) { p.ghostT = 0.045; const c = mkCanvas(p.spr.out.width, p.spr.out.height); c.getContext('2d').drawImage(p.spr.out, 0, 0); G.fx.push({ k: 'ghost', x: p.x, y: p.y, face: p.face, img: c, S: p.spr.S, ay: p.spr.anchorY, px: figPx(), life: 0.28, t: 0, col: p.counterT > 0 ? '#ffd070' : '#8ad8ff' }); }
    const v = 330 * fxOf(p).dodge * (1 - k * 0.7);
    tvx = Math.cos(p.dodgeA) * v; tvy = Math.sin(p.dodgeA) * v;
    p.anim.dodge = Math.sin(Math.min(1, k) * Math.PI);
    if (p.stateT >= 0.3) { setState(p, 'idle'); p.anim.dodge = 0; if (p.buffer > 0) { p.buffer = 0; startAttack(p, 0); } }
  } else if (p.state === 'hurt') {
    if (p.stateT > 0.28) setState(p, 'idle');
  }
  if (p.state !== 'charge') p.chargeReady = false;
  if (p.state === 'dodge' || p.state === 'hurt') { p.vx = lerp(p.vx, tvx, 1 - Math.exp(-dt * 30)); p.vy = lerp(p.vy, tvy, 1 - Math.exp(-dt * 30)); if (p.state === 'hurt') { p.vx *= Math.exp(-dt * 6); p.vy *= Math.exp(-dt * 6); } }
  else { p.vx = lerp(p.vx, tvx, 1 - Math.exp(-dt * 16)); p.vy = lerp(p.vy, tvy, 1 - Math.exp(-dt * 16)); }
}

function nearestFoe(p, maxD) {
  let best = null, bd = maxD * maxD;
  for (const e of G.ents) if (e.team === 1 && e.state !== 'down') { const d = dist2(e.x, e.y, p.x, p.y); if (d < bd) { bd = d; best = e; } }
  return best;
}
function inArc(ex, ey, x, y, ang, half) { return Math.abs(angDiff(ang, Math.atan2(ey - y, ex - x))) <= half; }

function sunFactor(p) { return p.char === 'quinn' && inSun(p) ? (G.opt.sunMul || 0.5) : 1; }
function fxOf(p) { const k = sunFactor(p); return statFx(p.str * k, p.agi * k, p.char === 'quinn' ? SAVE.quinn.stats.sta : 10); }
function playerHit(p, A) {
  let hitAny = false;
  if (A.proj) { fireProj(p, A); return; }
  const heavy = A.kick || p.charged || p.counterT > 0;
  G.fx.push({ k: 'swoosh', x: p.x, y: p.y - 26, a: p.aim, r: A.reach + 4, arc: A.arc * 0.9, col: p.counterT > 0 ? '#ffd070' : heavy ? '#e8f4ff' : '#bfe0ff', w: heavy ? 7 : 4, life: 0.16, t: 0, dir: p.combo % 2 ? -1 : 1 });
  for (const e of G.ents) {
    if (e.team !== 1 || e.state === 'down' || e.state === 'transform') continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > A.reach + e.r || !inArc(e.x, e.y, p.x, p.y, p.aim, A.arc)) continue;
    if (e.ai && e.ai.foresight && e.state !== 'stagger' && !A.double) { foresee(e, p); continue; }
    let dmg = A.dmg * (p.str * sunFactor(p) / 10);
    const counter = p.counterT > 0;
    if (counter) { dmg *= 2; p.counterT = 0; }
    hitAny = true;
    const SF = fxOf(p);
    damageFoe(e, dmg, { kb: A.kb * (counter ? 1.6 : 1) * SF.kb, ang: p.aim, poise: ((A.poise || 1) + (counter ? 3 : 0)) * SF.poise, heavy: A.kick || p.charged || counter, counter, hammer: A.hammer });
    if (A.ice) { e.slowT = 2.5; burst(e.x, e.y - 30, 8, '#bfe8ff'); floatText(e.x, e.y - 88, 'EIS', '#bfe8ff'); }
    if (A.hammer) { setState(e, 'stagger'); G.shake = 10; dust(e.x, e.y, 10, 1.4); }
  }
  if (A.hammer && hitAny && hasSkill('hammerspray') && p.char === 'quinn') hammerSpray(p);
  if (!hitAny) sfx('whip', 0, 0.05);
}

function damageFoe(e, dmg, o) {
  // Metall-Verhaertung (Hardsteely): nur Hammerschlag (innerer Schlag) und Konter wirken voll
  if (e.ai && e.ai.steel && !o.hammer && !o.counter) { dmg *= 0.25; if (Math.random() < 0.5) floatText(e.x, e.y - 90, 'METALL', '#c8d0dc'); sfx('chain', 0, 0.05); }
  if (e.ai && e.ai.harden && e.state !== 'stagger') {
    const from = Math.atan2(-Math.sin(o.ang), -Math.cos(o.ang)); // Richtung, aus der der Treffer kommt
    if (Math.abs(angDiff(e.hardDir || 0, from)) < 1.05) {
      e.flash = 0.06; G.hitstop = 0.03; sfx('chain', 0, 0.03);
      burst(e.x + Math.cos(from) * 8, e.y - 30, 5, '#c8d0dc');
      floatText(e.x, e.y - 72, 'GEHÄRTET', '#c8d0dc');
      e.vx += Math.cos(o.ang) * o.kb * 0.3; e.vy += Math.sin(o.ang) * o.kb * 0.2;
      if (e.ai.onBlock) e.ai.onBlock(e);
      return;
    }
  }
  e.hp = Math.max(0, e.hp - dmg);
  e.flash = 0.1; e.anim.hurt = o.heavy ? 1 : 0.6;
  e.vx += Math.cos(o.ang) * o.kb; e.vy += Math.sin(o.ang) * o.kb * 0.7;
  G.stats.hits++;
  G.expGain = (G.expGain || 0) + dmg * (e.expRate || 0);
  e.poise -= o.poise || 1; e.poiseT = 2;
  G.hitstop = o.heavy ? 0.075 : 0.035; G.shake = Math.max(G.shake, o.heavy ? 6 : 2.5);
  if (o.heavy) G.punch = Math.max(G.punch || 0, o.counter ? 1 : 0.6);
  if (o.counter) G.whiteFlash = 0.18;
  sfx(o.heavy ? 'crit' : 'hit', 0, 0.02); haptic(o.heavy ? 20 : 8);
  burst(e.x - Math.cos(o.ang) * 6, e.y - 30, o.heavy ? 12 : 6, o.counter ? '#ffd070' : '#ffffff');
  floatText(e.x + rand(-6, 6), e.y - 72, (Number.isInteger(dmg) ? dmg : dmg.toFixed(1)) + (o.counter ? ' KONTER' : ''), o.counter ? '#ffd070' : '#ffffff');
  if (e.hp <= 0) { foeDown(e); return; }
  if (e.poise <= 0 && e.state !== 'transform') { e.poise = e.maxPoise; setState(e, 'stagger'); G.tele = G.tele.filter((T) => T.owner !== e); floatText(e.x, e.y - 90, 'TAUMELT', '#8ad8ff'); }
  if (e.ai && e.ai.onHurt) e.ai.onHurt(e);
}
function foeDown(e) {
  G.expGain = (G.expGain || 0) + (e.expKill || 0);
  setState(e, 'down'); e.anim.hurt = 1; G.tele = G.tele.filter((T) => T.owner !== e);
  G.hitstop = 0.18; G.slowT = 0.8; G.shake = 10; sfx('kill'); sfx('crit');
  if (G.ents.every((x) => x.team !== 1 || x.state === 'down')) {
    G.state = 'won';
    later(1.4, () => G.opt.onWin && G.opt.onWin(G));
  }
}

function damagePlayer(src, dmg, ang, kb) { return damageAlly(G.player, src, dmg, ang, kb); }
function damageAlly(p, src, dmg, ang, kb) {
  if (G.state !== 'play' || p.state === 'down') return false;
  if (p.iframes > 0) {
    if (p !== G.player) return 'dodged';
    // perfektes Ausweichen: der Treffer kam kurz nach Beginn des Ausweichens
    const win = (SAVE.settings.wideDodge ? 0.3 : 0.2) + fxOf(p).perfect;
    if (p.state === 'dodge' && G.t - p.dodgeStart <= win && !p.perfectUsed) perfectDodge(p, src);
    return 'dodged';
  }
  if (p.char === 'quinn' && src && src.team === 1) dmg *= foeDmgScale();
  if (p.char === 'quinn' && SAVE.quinn.gear.hands) dmg = Math.max(0.5, dmg * 0.8); // Verteidigung +2 der Handschuhe
  p.hp = Math.max(G.opt.noDeath ? 1 : 0, p.hp - dmg);
  G.stats.taken += dmg;
  p.iframes = 0.6; p.flash = 0.12; p.anim.hurt = 1;
  p.vx = Math.cos(ang) * kb; p.vy = Math.sin(ang) * kb * 0.7;
  setState(p, 'hurt');
  if (p === G.player) { G.hitstop = 0.06; G.shake = 7; sfx('hurt'); haptic(40); } else sfx('hit', 0, 0.05);
  floatText(p.x, p.y - 72, '-' + (Number.isInteger(dmg) ? dmg : dmg.toFixed(1)), '#ff5a6a');
  burst(p.x, p.y - 30, 8, '#ff3a4e');
  if (p.hp <= 0) {
    setState(p, 'down');
    const alive = G.party.filter((m) => m.state !== 'down');
    if (!alive.length) { G.state = 'lost'; G.slowT = 1; later(1.6, () => G.opt.onLose && G.opt.onLose(G)); }
    else if (p === G.player) later(0.5, () => { if (G && G.player === p) swapTo(G.party.indexOf(alive[0]), true); });
  }
  return true;
}
function perfectDodge(p, src) {
  p.perfectUsed = true; later(0.35, () => { p.perfectUsed = false; });
  p.counterT = 1.4; p.stam = Math.min(p.maxStam, p.stam + 20);
  G.slowT = 0.55; G.counterFlash = 0.6; G.stats.perfect++;
  sfx('shadowstep'); haptic(15);
  floatText(p.x, p.y - 84, 'PERFEKT!', '#8ad8ff');
  if (G.opt.onPerfect) G.opt.onPerfect(G);
}

/* ------------------------------------------------------------ Gegner */
function updateFoe(e, dt) {
  e.stateT += dt;
  e.poiseT -= dt; if (e.poiseT <= 0) e.poise = e.maxPoise;
  e.tgtT = (e.tgtT || 0) - dt;
  if (!e.target || e.target.state === 'down' || e.tgtT <= 0) { e.target = pickTarget(e); e.tgtT = 1.2; }
  const p = e.target || G.player, AI = e.ai;
  const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
  if (e.slowT > 0) { e.slowT -= dt; dt *= 0.55; }
  let tvx = 0, tvy = 0;
  if (e.state === 'down') { e.vx *= Math.exp(-dt * 5); e.vy *= Math.exp(-dt * 5); e.anim.hurt = 1; return; }
  if (G.state !== 'play') { e.vx *= Math.exp(-dt * 8); e.vy *= Math.exp(-dt * 8); return; }
  if (AI.onTick) AI.onTick(e, dt);
  const P = AI.params(e);
  if (e.state === 'idle' || e.state === 'approach') {
    e.cd -= dt;
    e.face = dx > 0 ? 1 : -1;
    const want = P.range;
    if (d > want) { tvx = dx / d * P.speed; tvy = dy / d * P.speed; }
    else { // seitlich kreisen
      const s = Math.sin(e.id * 3.1 + G.t * 0.8) > 0 ? 1 : -1;
      tvx = -dy / d * P.speed * 0.35 * s; tvy = dx / d * P.speed * 0.35 * s;
    }
    if (e.cd <= 0) { const atk = AI.choose(e, d); if (atk) startFoeAttack(e, atk); }
  } else if (e.state === 'wind') {
    const A = e.atk;
    // in der ersten Haelfte noch nachdrehen, dann festgelegt
    if (e.stateT < A.wind * 0.5) { e.aim = Math.atan2(dy, dx); e.face = dx > 0 ? 1 : -1; e.tele.a = e.aim; e.tele.x = e.x; e.tele.y = e.y; }
    e.anim.cast = Math.min(1, e.stateT / A.wind) * 0.8; e.anim.aim = e.face > 0 ? e.aim : Math.PI - e.aim;
    if (e.stateT >= A.wind) { setState(e, 'active'); e.hitDone = false; }
  } else if (e.state === 'active') {
    const A = e.atk;
    e.anim.cast = 1;
    if (A.type === 'beam') {
      if (!e.hitDone) {
        e.hitDone = true;
        const L = A.len, ax = Math.cos(e.aim), ay = Math.sin(e.aim);
        const rx = p.x - e.x, ry = p.y - e.y, along = rx * ax + ry * ay, across = Math.abs(-rx * ay + ry * ax);
        for (const m of G.party) { if (m.state === 'down') continue; const rx2 = m.x - e.x, ry2 = m.y - e.y, al = rx2 * ax + ry2 * ay, ac = Math.abs(-rx2 * ay + ry2 * ax); if (al > 0 && al < L && ac < A.width / 2 + m.r) damageAlly(m, e, A.dmg, e.aim, 140); }
        G.fx.push({ k: 'beam', x: e.x, y: e.y - 24, a: e.aim, len: L, w: A.width, col: A.col || '#ff6a4a', life: 0.2, t: 0 });
        sfx('enemyShot', 0, 0.02);
      }
      if (e.stateT >= A.act) setState(e, 'recover');
    } else if (A.type === 'lunge') {
      tvx = Math.cos(e.aim) * A.speed; tvy = Math.sin(e.aim) * A.speed;
      if (!e.hitDone) for (const m of G.party) if (m.state !== 'down' && Math.hypot(m.x - e.x, m.y - e.y) < e.r + m.r + 10) { e.hitDone = true; damageAlly(m, e, A.dmg, e.aim, 220); break; }
      if (e.stateT >= A.act) { setState(e, 'recover'); }
    } else {
      if (!e.hitDone) {
        e.hitDone = true;
        for (const m of G.party) if (m.state !== 'down' && Math.hypot(m.x - e.x, m.y - e.y) <= A.reach + m.r && inArc(m.x, m.y, e.x, e.y, e.aim, A.arc)) damageAlly(m, e, A.dmg, e.aim, 180);
        slash(e.x, e.y - 30, e.aim, A.reach, A.arc, A.col || '#ffb040');
        sfx('whip', 0, 0.02);
      }
      if (e.stateT >= A.act) {
        if (A.chain) { e.atk = A.chain; e.aim = Math.atan2(dy, dx); setState(e, 'wind'); e.tele = addTele(e, e.atk); }
        else setState(e, 'recover');
      }
    }
  } else if (e.state === 'recover') {
    if (e.stateT >= e.atk.rec) { setState(e, 'idle'); e.cd = P.cd; }
  } else if (e.state === 'stagger') {
    e.anim.hurt = 0.8;
    if (e.stateT >= 0.9) { setState(e, 'idle'); e.cd = 0.3; }
  } else if (e.state === 'evade') {
    if (e.stateT >= 0.25) setState(e, 'idle');
  } else if (e.state === 'transform') {
    e.anim.cast = 0.5 + Math.sin(e.stateT * 30) * 0.2;
    if (e.stateT >= 1.5) { setState(e, 'idle'); e.cd = 0.5; }
  }
  if (e.fixed) { tvx = 0; tvy = 0; }
  if (e.rootT > 0) { e.rootT -= dt; tvx = 0; tvy = 0; } // Schattengriff haelt die Beine fest
  const k = e.state === 'active' && e.atk && e.atk.type === 'lunge' ? 40 : 10;
  e.vx = lerp(e.vx, tvx, 1 - Math.exp(-dt * k)); e.vy = lerp(e.vy, tvy, 1 - Math.exp(-dt * k));
}
function pickTarget(e) {
  let best = null, bd = 1e12;
  for (const m of G.party || []) { if (m.state === 'down') continue; const d = dist2(m.x, m.y, e.x, e.y) * (m === G.player ? 0.6 : 1); if (d < bd) { bd = d; best = m; } }
  return best;
}
function startFoeAttack(e, A) {
  const t = e.target || G.player;
  e.atk = A; e.aim = Math.atan2(t.y - e.y, t.x - e.x);
  setState(e, 'wind');
  e.tele = addTele(e, A);
  if (A.shout) floatText(e.x, e.y - 80, A.shout, '#ffb040');
}
function addTele(e, A) {
  const T = { owner: e, type: A.type, x: e.x, y: e.y, a: e.aim, r: A.type === 'lunge' ? A.speed * A.act + 20 : A.type === 'beam' ? A.len : A.reach, w: A.width || 18, arc: A.arc || 0.2, t: 0, dur: A.wind };
  G.tele.push(T);
  return T;
}
function updateNpc(e, dt) {
  const n = e.npc, p = G.player;
  if (n.path) { // laeuft zwischen Punkten hin und her
    n.i = n.i || 0; n.wait = (n.wait || 0) - dt;
    const tg = n.path[n.i], dx = tg[0] - e.x, dy = tg[1] - e.y, d = Math.hypot(dx, dy);
    if (n.wait > 0 || d < 4) { e.vx *= Math.exp(-dt * 8); e.vy *= Math.exp(-dt * 8); if (d < 4 && n.wait <= 0) { n.wait = rand(1, 3); n.i = (n.i + 1) % n.path.length; } }
    else { const sp = n.speed || 55; e.vx = dx / d * sp; e.vy = dy / d * sp; e.face = dx > 0 ? 1 : -1; }
    return;
  }
  e.vx *= Math.exp(-dt * 8); e.vy *= Math.exp(-dt * 8);
  if (n.pose === 'cower') { e.anim.hurt = 0.55 + Math.sin(e.anim.t * 6) * 0.08; }
  if (n.pose === 'cheer') { e.anim.cast = G.stats.hits && Math.sin(e.anim.t * 5 + e.id) > 0.6 ? 0.7 : 0; }
  const f = G.foe && G.foe.state !== 'down' ? G.foe : null;
  const look = n.watch === 'foe' && f ? f : p;
  e.face = look.x > e.x ? 1 : -1;
}

/* ------------------------------------------------------------ Arena */
function collideArena(e) {
  const A = G.arena, m = e.r;
  e.x = clamp(e.x, m, A.w - m); e.y = clamp(e.y, m + 20, A.h - m);
  for (const b of A.blocks || []) {
    const cx = clamp(e.x, b.x, b.x + b.w), cy = clamp(e.y, b.y, b.y + b.h);
    const dx = e.x - cx, dy = e.y - cy, d = Math.hypot(dx, dy);
    if (d < m) { if (d > 0.01) { e.x = cx + dx / d * m; e.y = cy + dy / d * m; } else e.y = b.y - m; }
  }
}
function updateCamera(rdt) {
  const p = G.player, f = G.foe;
  let tx = p.x, ty = p.y - 20;
  if (f && f.state !== 'down') { tx = lerp(p.x, f.x, 0.3); ty = lerp(p.y, f.y, 0.3) - 20; }
  const A = G.arena, hw = VIEW.w / 2, hh = VIEW.h / 2;
  tx = A.w > VIEW.w ? clamp(tx, hw, A.w - hw) : A.w / 2;
  ty = A.h > VIEW.h ? clamp(ty, hh - 60, A.h - hh + 40) : A.h / 2;
  G.cam.x = lerp(G.cam.x, tx, 1 - Math.exp(-rdt * 6)); G.cam.y = lerp(G.cam.y, ty, 1 - Math.exp(-rdt * 6));
  G.shake = Math.max(0, G.shake - rdt * 30);
}

/* ------------------------------------------------------------ Effekte */
function burst(x, y, n, col) {
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), s = rand(60, 220); G.fx.push({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: rand(0.18, 0.4), t: 0, col, size: rand(2, 4.5) }); }
}
function dust(x, y, n, s) { for (let i = 0; i < n; i++) G.fx.push({ k: 'dust', x: x + rand(-4, 4), y: y + rand(-2, 2), vx: rand(-20, 20), vy: rand(-8, 4), life: rand(0.35, 0.6), t: 0, size: rand(4, 7) * (s || 1) }); }
function slash(x, y, a, r, arc, col) { G.fx.push({ k: 'slash', x, y, a, r, arc, col, life: 0.18, t: 0 }); }
function floatText(x, y, txt, col) { G.texts.push({ x, y, txt, col, t: 0, life: 0.9 }); }
function updateFx(dt) {
  for (let i = G.fx.length - 1; i >= 0; i--) { const f = G.fx[i]; f.t += dt; if (f.k === 'spark') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt; f.vx *= Math.exp(-dt * 4); } else if (f.k === 'dust') { f.x += f.vx * dt; f.y += f.vy * dt; } if (f.t >= f.life) G.fx.splice(i, 1); }
  for (let i = G.texts.length - 1; i >= 0; i--) { const T = G.texts[i]; T.t += dt; T.y -= 34 * dt; if (T.t >= T.life) G.texts.splice(i, 1); }
}

/* ------------------------------------------------------------ Sonne, Analyse, Voraussicht, Hub */
function inRects(e, list) { for (const r of list || []) if (e.x > r.x && e.x < r.x + r.w && e.y > r.y && e.y < r.y + r.h) return true; return false; }
function inSun(e) { return !inRects(e, G.arena.shade) && inRects(e, G.arena.sun); }
function doInspect(p) {
  if (!hasSkill('inspect')) return;
  const f = nearestFoe(p, 260) || G.ents.find((e) => e.npc && e.npc.info && dist2(e.x, e.y, p.x, p.y) < 260 * 260);
  if (!f) { sysMsg({ head: 'ANALYSE', lines: ['Kein Ziel in der Nähe.'] }, 1600); return; }
  sfx('card');
  if (G.inSun) { sysMsg({ head: 'ANALYSE', lines: ['Im direkten Sonnenlicht nicht lesbar.'] }, 2400); if (G.opt.onInspect) G.opt.onInspect(G, f, false); return; }
  const I = f.info || (f.npc && f.npc.info) || {};
  sysMsg({ head: 'ANALYSE', kv: [['Name', I.name || f.name || '?'], ['Rasse', I.race || 'Mensch'], ['Fähigkeit', I.ability || '?'], ['HP', f.team === 1 ? Math.ceil(f.hp) + ' / ' + f.maxHp : '—'], ['Blutgruppe', I.blood || '?']] }, 3400);
  if (G.opt.onInspect) G.opt.onInspect(G, f, true);
}
function foresee(e, p) {
  // weicht dem Angriff aus, bevor er trifft (sieht ihn kommen)
  const a = Math.atan2(e.y - p.y, e.x - p.x) + (Math.random() < 0.5 ? 1.2 : -1.2);
  e.vx = Math.cos(a) * 260; e.vy = Math.sin(a) * 260;
  setState(e, 'evade');
  G.stats.evaded = (G.stats.evaded || 0) + 1;
  floatText(e.x, e.y - 76, 'ausgewichen', '#8ad8ff');
  sfx('dodge', 0, 0.05);
  if (G.opt.onEvade) G.opt.onEvade(G, e);
}
function updatePois() {
  const p = G.player; let best = null, bd = 1e9;
  for (const P of G.arena.pois || []) {
    if (P.hidden && P.hidden()) continue;
    const d = Math.hypot(p.x - P.x, p.y - P.y);
    if (d < (P.r || 34) && d < bd) { bd = d; best = P; }
  }
  G.poi = best;
}

/* ------------------------------------------------------------ Blutschnitt (ab Halbling)
   Roman: keine Abklingzeit, kostet 1 HP pro Einsatz, Reichweite etwa 5 Meter. */
function castBloodSwipe(p) {
  if (p.char !== 'quinn' || !hasSkill('bloodswipe') || p.state === 'down' || p.state === 'hurt') return;
  if ((p.swipeCd || 0) > 0) return;
  if (p.hp <= 1) { floatText(p.x, p.y - 72, 'Zu wenig HP', '#ff8a8a'); return; }
  if (!G.opt.vr) p.hp -= 1; p.swipeCd = 0.35; G.stats.swipes = (G.stats.swipes || 0) + 1;
  const f = nearestFoe(p, 200);
  const [mx, my] = readMove();
  const a = f ? Math.atan2(f.y - p.y, f.x - p.x) : (mx || my) ? Math.atan2(my, mx) : (p.face > 0 ? 0 : Math.PI);
  p.face = Math.cos(a) >= 0 ? 1 : -1; p.anim.cast = 1; p.anim.aim = p.face > 0 ? a : Math.PI - a;
  G.proj.push({ x: p.x + Math.cos(a) * 12, y: p.y + Math.sin(a) * 12, a, sp: 300, dist: 0, max: 70, dmg: 2 * (SAVE.quinn.gear.hands ? 1.05 : 1) * (p.str * sunFactor(p) / 10), hit: new Set(), col: '#ff3a4e', kind: 'blood' });
  if (!G.opt.vr) floatText(p.x, p.y - 72, '-1 HP', '#ff5a6a');
  sfx('whip', 0, 0.03); sfx('splat', 0, 0.05);
}
function updateProj(dt) {
  const p = G.player;
  p.swipeCd = Math.max(0, (p.swipeCd || 0) - dt);
  for (let i = G.proj.length - 1; i >= 0; i--) {
    const P = G.proj[i];
    const step = P.sp * dt; P.x += Math.cos(P.a) * step; P.y += Math.sin(P.a) * step; P.dist += step;
    let gone = false;
    for (const e of G.ents) {
      if (e.team !== 1 || e.state === 'down' || P.hit.has(e.id)) continue;
      if (Math.hypot(e.x - P.x, e.y - P.y) < e.r + 12) {
        P.hit.add(e.id);
        if (e.ai && e.ai.foresight && !P.double && e.state !== 'stagger') { foresee(e, P); continue; }
        if (e.ai && e.ai.cloak && P.kind === 'blood') { floatText(e.x, e.y - 86, 'UMHANG', '#d0c0a0'); burst(e.x, e.y - 30, 6, '#d0c0a0'); gone = true; break; }
        let pd = P.dmg;
        if (e.ai && e.ai.skin && P.kind === 'blood') { pd *= 0.25; floatText(e.x, e.y - 94, 'PRALLT AB', '#9ad870'); } // Dalki-Haut
        damageFoe(e, pd, { kb: P.kb || 90, ang: P.a, poise: P.poise || 1, heavy: !!P.heavy });
        if (!P.pierce && (P.kind === 'arrow' || P.kind === 'spike')) { gone = true; break; }
      }
    }
    if (gone || P.dist >= P.max) { G.proj.splice(i, 1); burst(P.x, P.y - 20, 4, P.col || '#ff3a4e'); }
  }
}

/* ------------------------------------------------------------ Geschosse der Figuren */
function fireProj(p, A) {
  const P = A.proj;
  G.proj.push({ x: p.x + Math.cos(p.aim) * 12, y: p.y + Math.sin(p.aim) * 12, a: p.aim, sp: P.sp, dist: 0, max: P.max, dmg: A.dmg * (p.str * sunFactor(p) / 10), hit: new Set(), col: P.col, kind: P.kind, pierce: P.pierce, double: A.double, poise: A.poise || 1, heavy: !!A.double || !!A.poise, kb: A.double ? 200 : 90 });
  sfx(P.kind === 'water' ? 'splat' : 'whip', 0, 0.03);
  if (A.double) { // Telekinese + Wasser gleichzeitig: ein zweiter Stoss von der Seite
    const f = nearestFoe(p, 220);
    if (f) later(0.12, () => { if (f.state !== 'down') { damageFoe(f, A.dmg * 0.5 * (p.str / 10), { kb: 160, ang: p.aim + 1.2, poise: 2, heavy: true }); burst(f.x, f.y - 30, 10, '#c8a0ff'); floatText(f.x, f.y - 92, 'DOPPELT', '#c8a0ff'); } });
  }
}

/* ------------------------------------------------------------ Tag-Team */
function swapTo(i, forced) {
  const m = G.party[i];
  if (!m || m === G.player || m.state === 'down' || (!forced && G.swapCd > 0)) return;
  const old = G.player;
  if (old.state === 'charge') setState(old, 'idle');
  G.player = m; G.swapCd = 0.6; INPUT.atkHeld = false;
  burst(m.x, m.y - 30, 10, LOOKS[m.char].rim || '#8ad8ff'); sfx('dodge');
  floatText(m.x, m.y - 86, CHARS[m.char].name, LOOKS[m.char].rim || '#fff');
  if (UI.cache) UI.cache.party = null;
}
function updateAlly(e, dt) {
  if (e.state === 'down') { updateFighter(e, dt, 0, 0); return; }
  e.aiCd -= dt;
  const f = nearestFoe(e, 600);
  let mx = 0, my = 0;
  if (f) {
    const dx = f.x - e.x, dy = f.y - e.y, d = Math.hypot(dx, dy) || 1;
    // angekuendigten Angriffen ausweichen
    if (f.state === 'wind' && f.target === e && f.stateT > f.atk.wind - 0.16 && !e.aiDodged) { e.aiDodged = true; if (Math.random() < 0.65) tryDodge(e, [-dy / d, dx / d]); }
    if (f.state !== 'wind') e.aiDodged = false;
    const want = e.range;
    if (d > want + 8) { mx = dx / d; my = dy / d; } else if (d < want * 0.6 && want > 60) { mx = -dx / d; my = -dy / d; }
    else if (e.aiCd <= 0 && e.state === 'idle' && e.stam > 25) { e.aiCd = rand(0.5, 1.1); startAttack(e, e.aiStep = ((e.aiStep || 0) + 1) % KITS[e.kit].combo.length); }
  } else {
    const p = G.player, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy);
    if (d > 60) { mx = dx / d * 0.8; my = dy / d * 0.8; }
  }
  updateFighter(e, dt, mx * 0.85, my * 0.85);
  if (Math.abs(mx) > 0.1 && e.state === 'idle') e.face = mx > 0 ? 1 : -1;
}

/* ------------------------------------------------------------ Blitzschritt, Hammerschlag (Kap. 39–40) */
function castFlashStep(p) {
  const Q = SAVE.quinn;
  if (p.char !== 'quinn' || !hasSkill('flashstep') || p.state === 'down') return;
  if (Q.stats.agi < 15 && !G.opt.test) { floatText(p.x, p.y - 80, 'Braucht Agilität 15', '#ffd04a'); return; }
  if (p.stam < 35) { tired(p); return; }
  spendStam(p, 35, 0.6);
  const [mx, my] = readMove();
  const a = (mx || my) ? Math.atan2(my, mx) : (p.face > 0 ? 0 : Math.PI);
  for (let k = 0; k < 5; k++) G.fx.push({ k: 'spark', x: p.x + Math.cos(a) * k * 12, y: p.y - 30 + Math.sin(a) * k * 12, vx: 0, vy: 0, life: 0.25, t: 0, col: '#bfe0ff', size: 5 });
  p.x += Math.cos(a) * 62; p.y += Math.sin(a) * 62; collideArena(p);
  p.iframes = Math.max(p.iframes, 0.2); setState(p, 'idle');
  if (Math.cos(a)) p.face = Math.cos(a) > 0 ? 1 : -1;
  sfx('shadowstep'); dust(p.x, p.y, 6, 1);
}
function castHammer(p) {
  const Q = SAVE.quinn;
  if (p.char !== 'quinn' || !hasSkill('hammer') || p.state === 'down') return;
  if (Q.stats.str < 15 && !G.opt.test) { floatText(p.x, p.y - 80, 'Braucht Stärke 15', '#ffd04a'); return; }
  if ((p.hammerCd || 0) > G.t) return;
  if (p.stam < 30) { tired(p); return; }
  p.hammerCd = G.t + 2.5;
  startAttack(p, 0, false, HAMMER);
}

/* ------------------------------------------------------------ Kraftkurve: Gegner-Schaden je Etappe
   Quinns HP wachsen nach Roman mit der Stufe (5 je Stufe). Damit Kaempfe fordernd bleiben,
   waechst der Schaden der Gegner mit der Etappe – gemessen an der dort typischen Stufe.
   Wer weiter gelevelt hat, haelt spuerbar mehr aus. */
const ETAPPE_OF = {};
[['prolog', 'test', 'kyle', 'nacht', 'training', 'test3d'], ['mono', 'credits', 'rylee', 'dan', 'biss'], ['bande', 'waffen', 'brandon', 'leo', 'dach'], ['tutorial', 'aula', 'aula2'],
 ['vrintro', 'windklinge', 'nate', 'sonne', 'portalteam', 'logan', 'earl', 'vrfree'],
 ['portalsturz', 'rattaclaw', 'lagerhaus', 'scordana', 'dom', 'bloodsucker', 'evolution', 'schatten', 'rettung', 'kiefer', 'systemshop', 'hammerspray', 'vrerde', 'logan2'],
 ['caladi', 'zahnwurm', 'echsen', 'berg', 'schattenleere', 'absturz', 'dalki', 'ghul']].forEach((l, i) => l.forEach((id) => { ETAPPE_OF[id] = i + 1; }));
const FOE_DMG = { 1: 1.0, 2: 1.15, 3: 1.45, 4: 1.75, 5: 1.8, 6: 1.9, 7: 1.9 };
function foeDmgScale() {
  if (G.opt.test) return 1;
  const et = (typeof MISSION !== 'undefined' && MISSION && ETAPPE_OF[MISSION.id]) || 1;
  if (et === 6 && SAVE.quinn.race === 'Vampir') return 1.8;
  return FOE_DMG[et] || 1;
}
