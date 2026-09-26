// Test-Bot: wird per page.addScriptTag eingebunden
window.BOT = { log: [], pick: 'greedy' };
readMove = function () {
  const G = GAME, p = G.p;
  let fx = 0, fy = 0, near = 0, close = 0;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = p.x - e.x, dy = p.y - e.y, d2 = dx * dx + dy * dy;
    const R = e.boss ? 170 : 230;
    if (d2 < R * R) { const w = (e.boss ? 6 : 1) / (d2 + 200); fx += dx * w; fy += dy * w; near++; if (d2 < 45 * 45) close++; }
  }
  for (const s of G.eproj) { const dx = p.x - s.x, dy = p.y - s.y, d2 = dx * dx + dy * dy; if (d2 < 150 * 150) { const w = 3 / (d2 + 100); fx += dx * w; fy += dy * w; } }
  // leichte Anziehung zu Beute
  let best = null, bd = 260 * 260;
  for (const q of G.pickups) { const d2 = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (d2 < bd) { bd = d2; best = q; } }
  let mx = fx, my = fy;
  const m = Math.hypot(fx, fy);
  if (m > 0) { mx /= m; my /= m; const tx = -my, ty = mx; mx = mx * 0.8 + tx * 0.5; my = my * 0.8 + ty * 0.5; }
  if (best && close === 0) { const d = Math.sqrt(bd) || 1; mx += (best.x - p.x) / d * 0.8; my += (best.y - p.y) / d * 0.8; }
  // Boss: auf Nahkampf-/Mitteldistanz umkreisen
  const B = G.boss && !G.boss.dead ? G.boss : null;
  if (B) { const dx = B.x - p.x, dy = B.y - p.y, d = Math.hypot(dx, dy) || 1; const want = p.hero === 'vorian' || p.hero === 'liora' ? 110 : 190; const k = (d - want) / 100; mx += dx / d * k * 1.5 - dy / d * 0.6; my += dy / d * k * 1.5 + dx / d * 0.6; }
  const book = G.pickups.find((q) => q.kind === 'book');
  if (book) { const dx = book.x - p.x, dy = book.y - p.y, d = Math.hypot(dx, dy) || 1; mx += dx / d * 3; my += dy / d * 3; }
  // zurueck Richtung Ursprung, damit er nicht endlos wegrennt
  mx += -p.x / 4000; my += -p.y / 4000;
  let mm = Math.hypot(mx, my);
  if (p.hero === 'shen' && close === 0 && near < 6) { mx = 0; my = 0; mm = 0; }
  if (mm > 0.05) { INPUT.moveX = mx / mm; INPUT.moveY = my / mm; } else { INPUT.moveX = 0; INPUT.moveY = 0; }
  if (close >= 2 && p.dodgeCd <= 0) INPUT.dodgePressed = true;
  if (p.ultCd <= 0 && (near > 25 || (G.boss && !G.boss.dead) || p.hero === 'shen' && p.qi >= 3)) INPUT.ultPressed = true;
};
window.botPick = function () {
  const o = GAME.offers;
  let i = o.findIndex((x) => x.fusion);
  if (i < 0 && BOT.pick === 'greedy') {
    const p = GAME.p;
    let bestS = -1;
    o.forEach((x, k) => { let s = Math.random(); if (!x.filler) { const C = CARDS[x.id]; if (C.kind === 'ability') s += p.ab[x.id] ? 3 : 2; else s += 1.5; } if (s > bestS) { bestS = s; i = k; } });
  }
  if (i < 0) i = (Math.random() * o.length) | 0;
  BOT.log.push(GAME.offers[i].id);
  chooseCard(i);
};
window.simRun = function (hero, maxT) {
  UI.showLevelUp = function () {}; UI.hideLevelUp = function () {}; UI.showEnd = function () {}; UI.announce = function () {}; UI.toast = function () {}; UI.hurtFlash = function () {};
  startGame(hero);
  AudioSys.stopMusic();
  BOT.log = [];
  let steps = 0;
  while (GAME.state !== 'over' && GAME.t < maxT && steps < 60 * 900) {
    if (GAME.state === 'levelup') botPick();
    if (GAME.state === 'play') updateGame(1 / 30);
    steps++;
    if (steps % 900 === 0) BOT.log.push('@' + Math.round(GAME.t) + ' hp' + Math.round(GAME.p.hp) + '/' + Math.round(GAME.p.st.maxHp) + ' L' + GAME.level + ' en' + GAME.enemies.length + ' k' + GAME.kills);
  }
  const G = GAME;
  const dmg = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ':' + Math.round(v)).slice(0, 8).join(' ');
  return { hero, t: Math.round(G.t), won: G.won, lvl: G.level, kills: G.kills, hp: Math.round(G.p.hp), boss: G.boss ? Math.round(G.boss.hp) + '/' + Math.round(G.boss.maxHp) : '-', fus: G.stats.fusions.join(','), reac: G.stats.reactions, dmg, ab: Object.keys(G.p.ab).map((k) => k + G.p.ab[k].lvl).join(' '), pas: Object.keys(G.p.passives).map((k) => k + G.p.passives[k]).join(' '), taken: JSON.stringify(Object.fromEntries(Object.entries(G.stats.takenBy||{}).map(([k,v])=>[k,Math.round(v)]))), healed: Math.round(G.stats.healed), log: BOT.log.filter((x) => x[0] === '@').join(' | ') };
};
