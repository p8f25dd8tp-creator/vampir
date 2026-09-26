const SHOT_COL = { soul: '#7dff9a', bell: '#ffa040', acid: '#b8ff3a', spike: '#d8dce8', blood: '#ff3a4e', light: '#ffe6a0', void: '#c08aff' };
'use strict';
/* ==========================================================================
   GEGNER — Raster fuer schnelle Abfragen, Nachschub & Wellen, KI,
   Hauptmann Kharn (Zwischenboss) und Vaelgor (Endboss).
   ========================================================================== */

/* -------------------------------------------------------- Raumraster */
const GRID = { cell: 56, map: new Map(), pool: [] };
function gkey(cx, cy) { return (cx + 32768) * 65536 + (cy + 32768); }
function gridBuild() {
  for (const a of GRID.map.values()) { a.length = 0; GRID.pool.push(a); }
  GRID.map.clear();
  const C = GRID.cell;
  for (const e of GAME.enemies) {
    if (e.dead) continue;
    const k = gkey(Math.floor(e.x / C), Math.floor(e.y / C));
    let a = GRID.map.get(k);
    if (!a) { a = GRID.pool.pop() || []; GRID.map.set(k, a); }
    a.push(e);
  }
}
function forEnemiesInRadius(x, y, r, cb) {
  const C = GRID.cell;
  const x0 = Math.floor((x - r - 48) / C), x1 = Math.floor((x + r + 48) / C);
  const y0 = Math.floor((y - r - 48) / C), y1 = Math.floor((y + r + 48) / C);
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
    const a = GRID.map.get(gkey(cx, cy));
    if (!a) continue;
    for (let i = 0; i < a.length; i++) {
      const e = a[i];
      if (e.dead) continue;
      const rr = r + e.r;
      if (dist2(x, y, e.x, e.y) <= rr * rr) cb(e);
    }
  }
}
function nearestEnemy(x, y, maxR, exclude) {
  let best = null, bd = maxR * maxR;
  for (const e of GAME.enemies) {
    if (e.dead || (exclude && exclude.has(e.id))) continue;
    const d = dist2(x, y, e.x, e.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function nearestEnemies(x, y, maxR, n) {
  const out = [];
  const m2 = maxR * maxR;
  for (const e of GAME.enemies) {
    if (e.dead) continue;
    const d = dist2(x, y, e.x, e.y);
    if (d > m2) continue;
    if (out.length < n) { out.push([d, e]); out.sort((a, b) => a[0] - b[0]); }
    else if (d < out[n - 1][0]) { out[n - 1] = [d, e]; out.sort((a, b) => a[0] - b[0]); }
  }
  return out.map((o) => o[1]);
}
function randomEnemyNear(x, y, r) {
  const list = GAME.enemies;
  if (!list.length) return null;
  for (let k = 0; k < 12; k++) {
    const e = list[(Math.random() * list.length) | 0];
    if (!e.dead && dist2(x, y, e.x, e.y) < r * r) return e;
  }
  return nearestEnemy(x, y, r);
}

/* -------------------------------------------------------- Erzeugen */
let _eid = 1;
function makeEnemy(type, x, y, opts) {
  const role = type;
  if (GAME.roles && GAME.roles[type]) type = GAME.roles[type];
  const D = ENEMIES[type];
  opts = opts || {};
  const hs = hpScale(GAME.t) * (GAME.diffHp || 1);
  const elite = !!opts.elite;
  const e = {
    id: _eid++, type, role: D.role || role, def: D, x, y, kvx: 0, kvy: 0,
    hp: 0, maxHp: 0,
    spd: D.spd * rand(0.9, 1.1) * (1 + Math.min(0.25, GAME.t / 2400)),
    r: D.r * (elite ? 1.45 : 1), dmg: D.dmg * (1 + GAME.t / 540) * (elite ? 1.5 : 1) * (GAME.diffDmg || 1),
    mass: D.mass * (elite ? 6 : 1), armor: (D.armor || 0) * (1 + GAME.t / 600),
    scale: D.scale * (elite ? 1.5 : 1), elite,
    face: 1, animT: Math.random() * 10, flash: 0, dead: false, deathT: 0,
    slowT: 0, slowF: 1, stunT: 0, bleedT: 0, bleedDps: 0, corruptT: 0, bstack: 0,
    mk: { b: -9, s: -9, q: -9 }, rcd: 0, touchT: 0, shootT: rand(1.5, 3),
    boss: !!D.boss, mini: !!D.miniboss, state: 'walk', stT: 0, wob: Math.random() * TAU
  };
  let hp = D.hp;
  if (e.boss) hp = D.hp * (GAME.diffBoss || 1);
  else if (e.mini) hp = D.hp * (1 + GAME.t / 600);
  else hp = D.hp * hs * (elite ? 14 : 1);
  e.hp = e.maxHp = hp;
  GAME.enemies.push(e);
  return e;
}
function spawnPosAround(px, py, bias) {
  const rx = VIEW.w / 2 + 50, ry = VIEW.h / 2 + 70;
  let a = Math.random() * TAU;
  if (bias !== undefined && Math.random() < 0.55) a = bias + rand(-1.3, 1.3);
  const c = Math.cos(a), s = Math.sin(a);
  // Punkt auf dem Rechteckrand statt Ellipse (Ecken sind sonst leer)
  const k = Math.min(rx / Math.abs(c || 1e-6), ry / Math.abs(s || 1e-6));
  return [px + c * k + rand(-20, 20), py + s * k + rand(-20, 20)];
}
function pickMix(mix) {
  let tot = 0; for (const k in mix) tot += mix[k];
  let r = Math.random() * tot;
  for (const k in mix) { r -= mix[k]; if (r <= 0) return k; }
  return 'ghoul';
}

/* -------------------------------------------------------- Nachschub & Ereignisse */
function updateSpawns(dt) {
  const G = GAME, p = G.p;
  while (G.waveIdx + 1 < WAVES.length && WAVES[G.waveIdx + 1].t <= G.t) G.waveIdx++;
  const W = WAVES[G.waveIdx];
  let alive = 0;
  for (const e of G.enemies) if (!e.dead && !e.boss && !e.mini) alive++;
  G.alive = alive;
  const target = W.target * (G.diffCount || 1) * (G.bossAlive ? 0.6 : 1);
  if (alive < target) {
    G.spawnAcc += W.rate * (alive < target * 0.5 ? 2.2 : 1) * dt;
    const bias = Math.hypot(p.vx, p.vy) > 20 ? Math.atan2(p.vy, p.vx) : undefined;
    while (G.spawnAcc >= 1) {
      G.spawnAcc -= 1;
      const pos = spawnPosAround(p.x, p.y, bias);
      makeEnemy(pickMix(W.mix), pos[0], pos[1]);
    }
  }
  const EV = G.events || EVENTS;
  while (G.eventIdx < EV.length && EV[G.eventIdx].t <= G.t) runEvent(EV[G.eventIdx++]);
}
function runEvent(ev) {
  const G = GAME, p = G.p;
  if (ev.text) UI.announce(ev.text, ev.kind === 'boss' || ev.kind === 'miniboss' ? 'boss' : '');
  if (ev.kind === 'swarm') {
    const a = Math.random() * TAU;
    const pos = spawnPosAround(p.x, p.y, a);
    for (let i = 0; i < ev.n; i++) {
      const e = makeEnemy(ev.type, pos[0] + rand(-70, 70), pos[1] + rand(-70, 70));
      e.spd *= 1.25; e.swarm = 3;
    }
    sfx('flame');
  } else if (ev.kind === 'ring') {
    const rx = VIEW.w * 0.62, ry = VIEW.h * 0.52;
    for (let i = 0; i < ev.n; i++) {
      const a = i / ev.n * TAU;
      makeEnemy(ev.type, p.x + Math.cos(a) * rx, p.y + Math.sin(a) * ry);
    }
  } else if (ev.kind === 'elite') {
    const pos = spawnPosAround(p.x, p.y);
    makeEnemy(ev.type, pos[0], pos[1], { elite: true });
    UI.announce('Ein Elite-Gegner naht!', '');
  } else if (ev.kind === 'miniboss') {
    const pos = spawnPosAround(p.x, p.y);
    const e = makeEnemy('captain', pos[0], pos[1]);
    if (!ev.text) UI.announce(e.def.name + ' erscheint!', 'boss');
    e.stT = 3; G.mini = e;
    sfx('roar');
  } else if (ev.kind === 'boss') {
    const e = makeEnemy('boss', p.x, p.y - VIEW.h * 0.55);
    if (!ev.text) UI.announce(e.def.name + ' erscheint!', 'boss');
    e.stT = 2.5; e.state = 'intro';
    G.boss = e; G.bossAlive = true;
    sfx('bell'); sfx('roar'); shake(6);
    // Schwaechere Gegner weichen dem Boss (lesbarer Kampf)
    for (const o of G.enemies) if (!o.boss && !o.mini && !o.elite && Math.random() < 0.5 && dist2(o.x, o.y, p.x, p.y) > 200 * 200) { o.dead = true; o.deathT = 0.3; o.silent = true; }
  }
}

/* -------------------------------------------------------- KI & Bewegung */
function updateEnemies(dt) {
  const G = GAME, p = G.p;
  const ts = G.slowmo > 0 ? 0.4 : 1;
  const edt = dt * ts;
  const farX = VIEW.w * 0.85, farY = VIEW.h * 0.8;
  const decoys = G.images.filter((i) => i.taunt).concat((G.comps || []).filter((c) => c.id === 'peter'));
  for (const e of G.enemies) {
    if (e.dead) { e.deathT += dt; continue; }
    e.animT += edt;
    e.flash = Math.max(0, e.flash - dt);
    e.touchT -= edt;
    if (e.boss) { updateBoss(e, edt, dt); continue; }
    if (e.mini) { updateCaptain(e, edt); }
    // Statuseffekte
    if (e.bleedT > 0) { e.bleedT -= dt; e.bleedAcc = (e.bleedAcc || 0) + dt; if (e.bleedAcc >= 0.5) { e.bleedAcc = 0; dealDamage(e, e.bleedDps * 0.5, 'none', 'blutung', { quiet: true, noMark: true }); if (e.dead) continue; if (Math.random() < 0.5) spawnPart({ x: e.x, y: e.y - 10, z: 10, vx: rand(-20, 20), vy: 0, vz: 20, g: 400, life: 0.5, size: 2, spr: PART.drop, splat: 1 }); } }
    if (e.corruptT > 0) { e.corruptT -= dt; e.corAcc = (e.corAcc || 0) + dt; if (e.corAcc >= 0.5) { e.corAcc = 0; dealDamage(e, e.corDps * 0.5, 'none', 'verderbnis', { quiet: true, noMark: true }); if (e.dead) continue; } }
    if (e.slowT > 0) e.slowT -= dt; else e.slowF = 1;
    if (e.stunT > 0) { e.stunT -= edt; }
    // Ziel: Spieler oder Koeder (Nachbild)
    let tx = p.x, ty = p.y;
    if (decoys.length && !e.mini) {
      let bd = 190 * 190;
      for (const d of decoys) { const dd = dist2(e.x, e.y, d.x, d.y); if (dd < bd) { bd = dd; tx = d.x; ty = d.y; } }
    }
    let dx = tx - e.x, dy = ty - e.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    let sp = e.spd * e.slowF;
    if (e.stunT > 0 || e.state === 'wind') sp = 0;
    if (e.role === 'witch') {
      // haelt Abstand und schiesst Seelenfeuer
      if (d < 170) sp *= -0.7; else if (d < 240) sp *= 0.15;
      e.shootT -= edt;
      if (e.shootT <= 0 && d < 360 && e.stunT <= 0) {
        e.shootT = e.elite ? 1.6 : rand(3.4, 4.4);
        e.atkT = 0.4;
        const lead = 0.35;
        const ax = p.x + p.vx * lead - e.x, ay = p.y + p.vy * lead - e.y, ad = Math.hypot(ax, ay) || 1;
        const n = e.elite ? 5 : 1;
        for (let i = 0; i < n; i++) {
          const a = Math.atan2(ay, ax) + (i - (n - 1) / 2) * 0.22;
          enemyShot(e.x + e.face * 12, e.y - 26, Math.cos(a) * 128, Math.sin(a) * 128, e.dmg * 0.85, e.def.shot || 'soul');
        }
        sfx('enemyShot', 0, 0.1);
      }
      if (e.atkT > 0) e.atkT -= edt;
    }
    if (e.def.flier && e.role === 'bat') {
      const w = Math.sin(e.animT * 3 + e.wob) * 0.6;
      const ndx = dx - dy * w, ndy = dy + dx * w; dx = ndx; dy = ndy;
    }
    if (e.swarm > 0) { e.swarm -= edt; sp *= 1.2; }
    e.x += (dx * sp + e.kvx) * edt;
    e.y += (dy * sp + e.kvy) * edt;
    const kd = Math.exp(-edt * 9);
    e.kvx *= kd; e.kvy *= kd;
    if (Math.abs(dx) > 0.2 && sp !== 0) e.face = dx * Math.sign(sp) > 0 ? 1 : -1;
    // Kontakt mit dem Spieler
    const pr = e.r + 11;
    if (e.touchT <= 0 && e.stunT <= 0 && dist2(e.x, e.y, p.x, p.y) < pr * pr) {
      if (p.ultT > 0 && p.hero === 'nyx') { /* Mitternacht: unberuehrbar */ }
      else if (damagePlayer(e.dmg, e)) e.touchT = 0.7;
    }
    // Mitternacht: Beruehrung schneidet
    if (p.ultT > 0 && p.hero === 'nyx' && (e.nyxT || 0) < G.t && dist2(e.x, e.y, p.x, p.y) < (e.r + 24) * (e.r + 24)) {
      e.nyxT = G.t + 0.25; dealDamage(e, 12, 'shadow', 'mitternacht', { kb: 60, kx: e.x - p.x, ky: e.y - p.y, norm: true }); e.slowT = 1; e.slowF = 0.5;
    }
    // zu weit weg -> wieder am Rand einsetzen (keine "verlorenen" Gegner)
    if (!e.mini && !e.elite && (Math.abs(e.x - p.x) > farX || Math.abs(e.y - p.y) > farY)) {
      const bias = Math.hypot(p.vx, p.vy) > 20 ? Math.atan2(p.vy, p.vx) : undefined;
      const pos = spawnPosAround(p.x, p.y, bias); e.x = pos[0]; e.y = pos[1];
    }
  }
  // Abstossung (damit Horden als Masse wirken, nicht als Punkt)
  const C = GRID.cell;
  for (const a of GRID.map.values()) {
    const n = Math.min(a.length, 14);
    for (let i = 0; i < n; i++) {
      const e = a[i]; if (e.dead) continue;
      for (let j = i + 1; j < n; j++) {
        const o = a[j]; if (o.dead) continue;
        const dx = o.x - e.x, dy = o.y - e.y, rr = (e.r + o.r) * 0.85;
        const d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr || d2 < 0.01) continue;
        const d = Math.sqrt(d2), push = (rr - d) / d * 0.5;
        const mt = e.mass + o.mass, we = o.mass / mt, wo = e.mass / mt;
        e.x -= dx * push * we; e.y -= dy * push * we;
        o.x += dx * push * wo; o.y += dy * push * wo;
      }
    }
  }
  // Leichen entfernen
  let w = 0;
  const E = G.enemies;
  for (let i = 0; i < E.length; i++) { const e = E[i]; if (!(e.dead && e.deathT > (e.boss ? 3 : 0.55))) E[w++] = e; }
  E.length = w;
}

/* -------------------------------------------------------- Gegnergeschosse */
function enemyShot(x, y, vx, vy, dmg, kind) {
  GAME.eproj.push({ x, y, vx, vy, dmg, kind, r: kind === 'bell' ? 9 : 7, life: 5, t: 0 });
}
function updateEnemyShots(dt) {
  const G = GAME, p = G.p;
  const ts = G.slowmo > 0 ? 0.4 : 1;
  let w = 0;
  for (const s of G.eproj) {
    s.t += dt; s.life -= dt;
    s.x += s.vx * dt * ts; s.y += s.vy * dt * ts;
    if (s.life <= 0) continue;
    if (dist2(s.x, s.y, p.x, p.y - 14) < (s.r + 9) * (s.r + 9) && p.alive) {
      if (damagePlayer(s.dmg, s)) { burstSparks(s.x, s.y, 6, SHOT_COL[s.kind] || '#7dff9a'); continue; }
    }
    addLight(s.x, s.y, 60, SHOT_COL[s.kind] || '#7dff9a', 0.8);
    G.eproj[w++] = s;
  }
  G.eproj.length = w;
}

/* -------------------------------------------------------- Hauptmann Kharn */
function updateCaptain(e, dt) {
  const p = GAME.p;
  e.stT -= dt;
  if (e.state === 'walk' && e.stT <= 0 && dist2(e.x, e.y, p.x, p.y) < 420 * 420) {
    e.state = 'wind'; e.stT = 0.85;
    e.chA = Math.atan2(p.y - e.y, p.x - e.x);
    fxTelegraphLine(e.x, e.y, e.chA, 380, 56, 0.85);
    sfx('roar', 0, 0.5);
  } else if (e.state === 'wind' && e.stT <= 0) {
    e.state = 'charge'; e.stT = 0.55;
    e.kvx = Math.cos(e.chA) * 700; e.kvy = Math.sin(e.chA) * 700;
  } else if (e.state === 'charge') {
    if (Math.random() < 0.6) burstAsh(e.x, e.y, 1, '#5a4a44');
    if (e.stT <= 0) { e.state = 'walk'; e.stT = rand(3.5, 5); }
  }
}

/* -------------------------------------------------------- Vaelgor, der Gruftkoloss */
function updateBoss(e, dt, rdt) {
  const G = GAME, p = G.p;
  e.stT -= dt;
  e.slam = e.slam || 0;
  e.bell = Math.max(0, (e.bell || 0) - rdt);
  e.roar = Math.max(0, (e.roar || 0) - rdt * 1.5);
  const enr = e.hp < e.maxHp * 0.5;
  if (enr && !e.enrage) { e.enrage = true; UI.announce(e.def.name.split(',')[0] + ' rast!', 'boss'); sfx('roar'); e.roar = 1; shake(6); }
  const spd = e.def.spd * (enr ? 1.35 : 1);
  const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
  if (e.stunT > 0) e.stunT -= dt;
  e.run = 0;
  switch (e.state) {
    case 'intro':
      e.y += 40 * dt; e.run = 0.5; e.roar = 1;
      if (e.stT <= 0) { e.state = 'walk'; e.stT = 1.5; }
      break;
    case 'walk': {
      if (d > 90) { e.x += dx / d * spd * dt; e.y += dy / d * spd * dt; e.run = 1; }
      e.face = dx > 0 ? 1 : -1;
      if (e.stT <= 0) {
        const opts = ['slam', 'slam', 'charge', 'bell', 'summon'];
        let pick0 = pick(opts);
        if (pick0 === e.last && Math.random() < 0.7) pick0 = pick(opts);
        e.last = pick0;
        if (pick0 === 'slam') { e.state = 'slamWind'; e.stT = enr ? 0.85 : 1.1; e.tx = p.x; e.ty = p.y; fxTelegraphCircle(p.x, p.y, 118, e.stT, '#ff2a2a'); }
        else if (pick0 === 'charge') { e.state = 'chargeWind'; e.stT = enr ? 0.8 : 1.0; e.chA = Math.atan2(dy, dx); fxTelegraphLine(e.x, e.y, e.chA, 520, 90, e.stT); e.roar = 1; sfx('roar'); }
        else if (pick0 === 'bell') { e.state = 'bell'; e.stT = 0.6; e.bells = enr ? 3 : 2; e.bellT = 0; }
        else { e.state = 'summon'; e.stT = 0.8; e.roar = 1; sfx('roar'); }
      }
      break;
    }
    case 'slamWind': {
      e.slam = Math.min(1, e.slam + dt / 0.6);
      const ddx = e.tx - e.x, ddy = e.ty - e.y, dd = Math.hypot(ddx, ddy) || 1;
      if (dd > 70) { e.x += ddx / dd * spd * 1.8 * dt; e.y += ddy / dd * spd * 1.8 * dt; e.run = 1; }
      e.face = ddx > 0 ? 1 : -1;
      if (e.stT <= 0) {
        e.state = 'slamHit'; e.stT = 0.6; e.slam = 1.001;
        sfx('stomp'); shake(10); hitstop(0.05);
        if (dist2(p.x, p.y, e.tx, e.ty) < 118 * 118) damagePlayer(e.dmg * 1.2, e, true);
        fxRing(e.tx, e.ty, 20, 150, 0.45, '#ff8a4a', 10); fxRing(e.tx, e.ty, 10, 118, 0.35, '#ffd0a0', 4, 1);
        burstAsh(e.tx, e.ty, 16, '#5a4a44');
        for (let i = 0; i < 10; i++) { const a = Math.random() * TAU; spawnPart({ x: e.tx, y: e.ty, z: 5, vx: Math.cos(a) * rand(60, 200), vy: Math.sin(a) * rand(40, 140), vz: rand(100, 220), g: 500, life: 1, size: rand(3, 6), size1: 3, spr: tinted('ash', '#6a6064') }); }
        addDecal(e.tx, e.ty, PART.splat, 60, 0.35, 20);
        if (enr) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; enemyShot(e.tx, e.ty - 10, Math.cos(a) * 170, Math.sin(a) * 170, 12 * (GAME.diffDmg || 1), e.def.bellShot || 'bell'); }
      }
      break;
    }
    case 'slamHit':
      e.slam = 1 + (1 - e.stT / 0.6) * 0.25 + 0.001;
      if (e.stT <= 0) { e.state = 'walk'; e.slam = 0; e.stT = enr ? rand(1.2, 1.8) : rand(1.8, 2.6); }
      break;
    case 'chargeWind':
      e.face = Math.cos(e.chA) > 0 ? 1 : -1;
      if (e.stT <= 0) { e.state = 'charge'; e.stT = 0.75; e.hitDone = false; }
      break;
    case 'charge':
      e.x += Math.cos(e.chA) * 690 * dt; e.y += Math.sin(e.chA) * 690 * dt; e.run = 1.6;
      if (Math.random() < 0.9) burstAsh(e.x, e.y, 2, '#5a4a44');
      shake(2);
      if (!e.hitDone && dist2(p.x, p.y, e.x, e.y) < (e.r + 16) * (e.r + 16)) { if (damagePlayer(e.dmg * 1.3, e, true)) { e.hitDone = true; p.kvx = Math.cos(e.chA) * 500; p.kvy = Math.sin(e.chA) * 500; } }
      if (e.stT <= 0) { e.state = 'walk'; e.stT = enr ? 1.2 : 2; }
      break;
    case 'bell':
      e.bellT -= dt;
      if (e.bellT <= 0 && e.bells > 0) {
        e.bells--; e.bellT = 0.7; e.bell = 0.6;
        sfx('bell'); shake(3);
        const n = enr ? 18 : 14, off = Math.random() * TAU;
        for (let i = 0; i < n; i++) { const a = off + i / n * TAU; enemyShot(e.x + Math.cos(a) * 40, e.y - 60 + Math.sin(a) * 20, Math.cos(a) * 135, Math.sin(a) * 135, 13 * (GAME.diffDmg || 1), e.def.bellShot || 'bell'); }
        fxRing(e.x, e.y - 40, 20, 200, 0.6, '#ffc060', 5);
      }
      if (e.bells <= 0 && e.bellT <= 0) { e.state = 'walk'; e.stT = rand(1.4, 2.2); }
      break;
    case 'summon':
      if (e.stT <= 0) {
        for (let i = 0; i < (enr ? 16 : 10); i++) { const a = Math.random() * TAU; makeEnemy(i % 3 ? 'bat' : 'ghoul', e.x + Math.cos(a) * 90, e.y + Math.sin(a) * 60); }
        burstAsh(e.x, e.y, 12, '#3a2a30');
        e.state = 'walk'; e.stT = 2.2;
      }
      break;
  }
  e.x += e.kvx * dt; e.y += e.kvy * dt; e.kvx *= 0.85; e.kvy *= 0.85;
  e.phase = (e.phase || 0) + dt * (e.run > 0 ? 3.2 * e.run : 0);
  if (dist2(e.x, e.y, p.x, p.y) < (e.r + 8) * (e.r + 8) && e.touchT <= 0 && damagePlayer(e.dmg * 0.7, e)) e.touchT = 0.8;
  addLight(e.x, e.y - 60, 170, e.enrage ? '#ff3a1a' : '#ff7a2a', 0.9);
}
