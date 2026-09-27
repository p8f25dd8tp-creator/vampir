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

function newFight(opt) {
  G = {
    t: 0, scale: 1, slowT: 0, hitstop: 0, shake: 0, state: 'play',
    arena: opt.arena, ents: [], tele: [], fx: [], texts: [], later: [],
    cam: { x: 0, y: 0 }, hint: null, counterFlash: 0, opt, stats: { hits: 0, perfect: 0, taken: 0 }
  };
  const Q = SAVE.quinn;
  const p = mkEnt('quinn', LOOKS.quinn, opt.playerAt[0], opt.playerAt[1]);
  p.team = 0; p.maxHp = 10 + (Q.stats.sta - 10); p.hp = p.maxHp;
  p.str = Q.stats.str; p.agi = Q.stats.agi;
  p.stam = 100; p.maxStam = 100; p.stamDelay = 0; p.counterT = 0; p.combo = 0; p.buffer = 0; p.holdT = 0; p.dodgeStart = -9;
  G.player = p;
  for (const f of opt.foes) {
    const e = mkEnt(f.id, LOOKS[f.look || f.id], f.at[0], f.at[1]);
    Object.assign(e, { team: 1, name: f.name, maxHp: f.hp, hp: f.hp, ai: f.ai, poise: f.poise || 3, maxPoise: f.poise || 3, poiseT: 0, phase: 1, cd: 0.8 });
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
  handleInput(dt);
  updatePlayer(dt);
  for (const e of G.ents) if (e.team === 1) updateFoe(e, dt);
  for (const e of G.ents) if (e.npc) updateNpc(e, dt);
  for (const e of G.ents) {
    e.x += e.vx * dt; e.y += e.vy * dt;
    collideArena(e);
    e.iframes = Math.max(0, e.iframes - dt); e.flash = Math.max(0, e.flash - dt);
    e.anim.t += dt;
    const sp = Math.hypot(e.vx, e.vy);
    e.anim.run = lerp(e.anim.run, clamp(sp / 150, 0, 1), 1 - Math.exp(-dt * 12));
    e.anim.phase += sp * dt / 20;
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
    if (ev === 'atkDown') { p.holdT = 0; tryAttack(p); }
    else if (ev === 'atkUp') { if (p.state === 'charge') releaseCharge(p); p.holdT = -1; }
    else if (ev === 'dodge') tryDodge(p);
  }
  if (INPUT.atkHeld && p.holdT >= 0) p.holdT += dt;
  // lange gehalten und gerade frei -> aufladen
  if (INPUT.atkHeld && p.holdT > 0.3 && (p.state === 'idle' || (p.state === 'attack' && p.stateT > p.atk.win + p.atk.act)) && p.stam >= CHARGED.cost * 0.5) setState(p, 'charge');
  if (!INPUT.atkHeld && p.state === 'charge') releaseCharge(p);
}

function spendStam(p, n, delay) { p.stam = Math.max(0, p.stam - n); p.stamDelay = Math.max(p.stamDelay, delay || 0.25); }
function tryAttack(p) {
  if (p.state === 'hurt' || p.state === 'down' || p.state === 'dodge') { if (p.state === 'dodge') p.buffer = 0.25; return; }
  if (p.state === 'attack') { if (p.stateT > p.atk.win) p.buffer = 0.3; return; }
  if (p.state === 'charge') return;
  startAttack(p, 0);
}
function startAttack(p, step, charged) {
  const A = charged ? CHARGED : COMBO[step];
  if (p.stam < A.cost * 0.4) { tired(p); return; }
  spendStam(p, A.cost);
  p.atk = A; p.combo = step; p.hitDone = false; p.charged = !!charged;
  setState(p, 'attack');
  // Zielhilfe: zum naechsten Gegner in Reichweite drehen
  const f = nearestFoe(p, 110);
  if (f) { p.aim = Math.atan2(f.y - p.y, f.x - p.x); p.face = Math.cos(p.aim) >= 0 ? 1 : -1; }
  else { const [mx, my] = readMove(); p.aim = (mx || my) ? Math.atan2(my, mx) : (p.face > 0 ? 0 : Math.PI); if (mx) p.face = mx > 0 ? 1 : -1; }
  sfx('whip', 0, 0.04);
}
function releaseCharge(p) {
  const power = p.stateT;
  setState(p, 'idle');
  if (power >= 0.45) { startAttack(p, 0, true); p.anim.cast = 1; }
  else startAttack(p, 0);
}
function tired(p) { floatText(p.x, p.y - 70, 'Keine Ausdauer', '#ffd04a'); p.stamDelay = 0.8; }
function tryDodge(p) {
  if (p.state === 'down' || p.state === 'dodge') return;
  if (p.state === 'hurt' && p.stateT < 0.12) return;
  if (p.stam < 18) { tired(p); return; }
  spendStam(p, 22, 0.5);
  const [mx, my] = readMove();
  let a = (mx || my) ? Math.atan2(my, mx) : (p.face > 0 ? Math.PI : 0);
  p.dodgeA = a; p.dodgeStart = G.t; p.iframes = SAVE.settings.wideDodge ? 0.34 : 0.26;
  setState(p, 'dodge'); sfx('dodge');
  if (Math.cos(a) !== 0 && (mx || my)) p.face = Math.cos(a) > 0 ? 1 : -1;
}

function updatePlayer(dt) {
  const p = G.player;
  p.stateT += dt;
  p.counterT = Math.max(0, p.counterT - dt);
  p.buffer = Math.max(0, p.buffer - dt);
  p.stamDelay -= dt;
  if (p.stamDelay <= 0 && p.state !== 'charge') p.stam = Math.min(p.maxStam, p.stam + 42 * dt);
  const spd = 120 * Math.pow(p.agi / 10, 0.35);
  const [mx, my] = readMove();
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
      if (p.buffer > 0 && !p.charged && next < COMBO.length) { p.buffer = 0; startAttack(p, next); }
      else { setState(p, 'idle'); if (p.buffer > 0) { p.buffer = 0; startAttack(p, 0); } }
    }
  } else if (p.state === 'charge') {
    tvx = mx * spd * 0.3; tvy = my * spd * 0.3;
    p.anim.cast = 0.4 + Math.min(0.6, p.stateT);
    p.stamDelay = 0.3;
    if (p.stateT > 0.45 && !p.chargeReady) { p.chargeReady = true; sfx('card'); burst(p.x + p.face * 10, p.y - 36, 6, '#ffd070'); }
  } else if (p.state === 'dodge') {
    const k = p.stateT / 0.3;
    const v = 330 * Math.pow(p.agi / 10, 0.3) * (1 - k * 0.7);
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

function playerHit(p, A) {
  let hitAny = false;
  for (const e of G.ents) {
    if (e.team !== 1 || e.state === 'down' || e.state === 'transform') continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > A.reach + e.r || !inArc(e.x, e.y, p.x, p.y, p.aim, A.arc)) continue;
    let dmg = A.dmg * (p.str / 10);
    const counter = p.counterT > 0;
    if (counter) { dmg *= 2; p.counterT = 0; }
    hitAny = true;
    damageFoe(e, dmg, { kb: A.kb * (counter ? 1.6 : 1), ang: p.aim, poise: (A.poise || 1) + (counter ? 3 : 0), heavy: A.kick || p.charged || counter, counter });
  }
  if (!hitAny) sfx('whip', 0, 0.05);
}

function damageFoe(e, dmg, o) {
  e.hp = Math.max(0, e.hp - dmg);
  e.flash = 0.1; e.anim.hurt = o.heavy ? 1 : 0.6;
  e.vx += Math.cos(o.ang) * o.kb; e.vy += Math.sin(o.ang) * o.kb * 0.7;
  G.stats.hits++;
  e.poise -= o.poise || 1; e.poiseT = 2;
  G.hitstop = o.heavy ? 0.075 : 0.035; G.shake = Math.max(G.shake, o.heavy ? 6 : 2.5);
  sfx(o.heavy ? 'crit' : 'hit', 0, 0.02); haptic(o.heavy ? 20 : 8);
  burst(e.x - Math.cos(o.ang) * 6, e.y - 30, o.heavy ? 12 : 6, o.counter ? '#ffd070' : '#ffffff');
  floatText(e.x + rand(-6, 6), e.y - 72, (Number.isInteger(dmg) ? dmg : dmg.toFixed(1)) + (o.counter ? ' KONTER' : ''), o.counter ? '#ffd070' : '#ffffff');
  if (e.hp <= 0) { foeDown(e); return; }
  if (e.poise <= 0 && e.state !== 'transform') { e.poise = e.maxPoise; setState(e, 'stagger'); G.tele = G.tele.filter((T) => T.owner !== e); floatText(e.x, e.y - 90, 'TAUMELT', '#8ad8ff'); }
  if (e.ai && e.ai.onHurt) e.ai.onHurt(e);
}
function foeDown(e) {
  setState(e, 'down'); e.anim.hurt = 1; G.tele = G.tele.filter((T) => T.owner !== e);
  G.hitstop = 0.18; G.slowT = 0.8; G.shake = 10; sfx('kill'); sfx('crit');
  if (G.ents.every((x) => x.team !== 1 || x.state === 'down')) {
    G.state = 'won';
    later(1.4, () => G.opt.onWin && G.opt.onWin(G));
  }
}

function damagePlayer(src, dmg, ang, kb) {
  const p = G.player;
  if (G.state !== 'play' || p.state === 'down') return false;
  if (p.iframes > 0) {
    // perfektes Ausweichen: der Treffer kam kurz nach Beginn des Ausweichens
    const win = SAVE.settings.wideDodge ? 0.3 : 0.2;
    if (p.state === 'dodge' && G.t - p.dodgeStart <= win && !p.perfectUsed) perfectDodge(p, src);
    return 'dodged';
  }
  p.hp = Math.max(0, p.hp - dmg);
  G.stats.taken += dmg;
  p.iframes = 0.6; p.flash = 0.12; p.anim.hurt = 1;
  p.vx = Math.cos(ang) * kb; p.vy = Math.sin(ang) * kb * 0.7;
  setState(p, 'hurt');
  G.hitstop = 0.06; G.shake = 7; sfx('hurt'); haptic(40);
  floatText(p.x, p.y - 72, '-' + dmg, '#ff5a6a');
  burst(p.x, p.y - 30, 8, '#ff3a4e');
  if (p.hp <= 0) {
    setState(p, 'down'); G.state = 'lost'; G.slowT = 1;
    later(1.6, () => G.opt.onLose && G.opt.onLose(G));
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
  const p = G.player, AI = e.ai;
  const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
  let tvx = 0, tvy = 0;
  if (e.state === 'down') { e.vx *= Math.exp(-dt * 5); e.vy *= Math.exp(-dt * 5); e.anim.hurt = 1; return; }
  if (G.state !== 'play') { e.vx *= Math.exp(-dt * 8); e.vy *= Math.exp(-dt * 8); return; }
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
    if (A.type === 'lunge') {
      tvx = Math.cos(e.aim) * A.speed; tvy = Math.sin(e.aim) * A.speed;
      if (!e.hitDone && Math.hypot(p.x - e.x, p.y - e.y) < e.r + p.r + 10) { e.hitDone = true; damagePlayer(e, A.dmg, e.aim, 220); }
      if (e.stateT >= A.act) { setState(e, 'recover'); }
    } else {
      if (!e.hitDone) {
        e.hitDone = true;
        const pd = Math.hypot(p.x - e.x, p.y - e.y);
        if (pd <= A.reach + p.r && inArc(p.x, p.y, e.x, e.y, e.aim, A.arc)) damagePlayer(e, A.dmg, e.aim, 180);
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
  } else if (e.state === 'transform') {
    e.anim.cast = 0.5 + Math.sin(e.stateT * 30) * 0.2;
    if (e.stateT >= 1.5) { setState(e, 'idle'); e.cd = 0.5; }
  }
  const k = e.state === 'active' && e.atk && e.atk.type === 'lunge' ? 40 : 10;
  e.vx = lerp(e.vx, tvx, 1 - Math.exp(-dt * k)); e.vy = lerp(e.vy, tvy, 1 - Math.exp(-dt * k));
}
function startFoeAttack(e, A) {
  e.atk = A; e.aim = Math.atan2(G.player.y - e.y, G.player.x - e.x);
  setState(e, 'wind');
  e.tele = addTele(e, A);
  if (A.shout) floatText(e.x, e.y - 80, A.shout, '#ffb040');
}
function addTele(e, A) {
  const T = { owner: e, type: A.type, x: e.x, y: e.y, a: e.aim, r: A.type === 'lunge' ? A.speed * A.act + 20 : A.reach, arc: A.arc || 0.2, t: 0, dur: A.wind };
  G.tele.push(T);
  return T;
}
function updateNpc(e, dt) {
  e.vx *= Math.exp(-dt * 8); e.vy *= Math.exp(-dt * 8);
  if (e.npc.pose === 'cower') { e.anim.hurt = 0.55 + Math.sin(e.anim.t * 6) * 0.08; }
  const p = G.player; e.face = p.x > e.x ? 1 : -1;
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
  tx = A.w > VIEW.w ? clamp(tx, hw - 20, A.w - hw + 20) : A.w / 2;
  ty = A.h > VIEW.h - 60 ? clamp(ty, hh - 90, A.h - hh + 70) : A.h / 2;
  G.cam.x = lerp(G.cam.x, tx, 1 - Math.exp(-rdt * 6)); G.cam.y = lerp(G.cam.y, ty, 1 - Math.exp(-rdt * 6));
  G.shake = Math.max(0, G.shake - rdt * 30);
}

/* ------------------------------------------------------------ Effekte */
function burst(x, y, n, col) {
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), s = rand(60, 220); G.fx.push({ k: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: rand(0.18, 0.4), t: 0, col, size: rand(2, 4.5) }); }
}
function slash(x, y, a, r, arc, col) { G.fx.push({ k: 'slash', x, y, a, r, arc, col, life: 0.18, t: 0 }); }
function floatText(x, y, txt, col) { G.texts.push({ x, y, txt, col, t: 0, life: 0.9 }); }
function updateFx(dt) {
  for (let i = G.fx.length - 1; i >= 0; i--) { const f = G.fx[i]; f.t += dt; if (f.k === 'spark') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt; f.vx *= Math.exp(-dt * 4); } if (f.t >= f.life) G.fx.splice(i, 1); }
  for (let i = G.texts.length - 1; i >= 0; i--) { const T = G.texts[i]; T.t += dt; T.y -= 34 * dt; if (T.t >= T.life) G.texts.splice(i, 1); }
}
