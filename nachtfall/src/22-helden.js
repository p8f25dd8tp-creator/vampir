'use strict';
/* ==========================================================================
   NEUE ARCADE-HELDEN mit Evolution im Lauf und eigenem Faehigkeiten-Set
   Peter Kraus · Sil Skala · Chris · Emma Wagner
   Jede Figur bekommt NUR ihre eigenen Faehigkeiten (keine geteilten Karten),
   dazu allgemeine Passive. Die Formen folgen dem Weg der Figur im Roman
   (eigene Zusammenfassung, eigene Gestaltung, keine Originaltexte).
   ========================================================================== */

/* ============================================================ Bausteine */
const EVO_PASSIVES = ['vampirblut', 'grabesmacht', 'seelenmagnet', 'nebelgang'];
function freezeEnemy(en, t) {
  if (en.dead) return;
  if (!en.boss) en.stunT = Math.max(en.stunT, t * (en.mini ? 0.35 : 1));
  en.slowT = Math.max(en.slowT, t + 1); en.slowF = Math.min(en.slowF || 1, 0.4);
  const was = en.frozenT && en.frozenT > GAME.t; en.frozenT = Math.max(en.frozenT || 0, GAME.t + t);
  if (was) return;
  addEffect({ x: en.x, y: en.y, dur: 30, layer: 2, update(e) { if (en.dead || GAME.t > en.frozenT) e.dead = true; }, draw(g) {
    const r = en.r + 5; g.save(); g.globalAlpha = 0.55;
    g.fillStyle = lg(g, en.x - r, en.y - r * 2, en.x + r, en.y, [0, 'rgba(230,248,255,0.9)', 1, 'rgba(120,190,240,0.5)']);
    g.beginPath(); g.moveTo(en.x - r, en.y); g.lineTo(en.x - r * 0.7, en.y - r * 2.1); g.lineTo(en.x, en.y - r * 2.5); g.lineTo(en.x + r * 0.8, en.y - r * 1.9); g.lineTo(en.x + r, en.y); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1; g.stroke(); g.restore();
  } });
}
const isFrozen = (en) => en.frozenT && en.frozenT > GAME.t;
// farbiger Bogenhieb um die Figur
function arcSweep(p, ang, range, arc, dmg, school, src, col, o) {
  o = o || {};
  const hit = new Set(), dur = 0.14, dir = o.dir || 1;
  sfx(o.sfx || 'whip', 0, 0.04);
  addEffect({ x: p.x, y: p.y, dur: dur + 0.12, layer: 2, update(e) {
    const k = clamp(e.t / dur, 0, 1); if (k >= 1) return;
    const px = GAME.p.x, py = GAME.p.y;
    forEnemiesInRadius(px, py, range + 12, (en) => {
      if (hit.has(en.id) || !inArc(en.x, en.y, px, py, ang, arc / 2 + 0.2)) return;
      hit.add(en.id);
      const a = Math.atan2(en.y - py, en.x - px);
      let d = dmg; if (o.frozenBonus && isFrozen(en)) d *= o.frozenBonus;
      dealDamage(en, d, school, src, { kb: o.kb || 100, kx: Math.cos(a), ky: Math.sin(a), stun: o.stun, bleed: o.bleed });
      if (o.freeze) freezeEnemy(en, o.freeze);
      if (o.onHit) o.onHit(en);
      burstSparks(en.x, en.y - 12, 3, col, 0.6);
    });
  }, draw(g, e) {
    const k = clamp(e.t / dur, 0, 1), fade = clamp((e.t - dur) / 0.12, 0, 1), px = GAME.p.x, py = GAME.p.y - 14;
    const a0 = ang - dir * arc / 2, a1 = a0 + dir * arc * easeOut(k), lo = Math.min(a0, a1), hi = Math.max(a0, a1);
    g.save(); g.translate(px, py); g.scale(1, 0.7); g.globalAlpha = (1 - fade) * 0.9;
    g.beginPath(); g.arc(0, 0, range, lo, hi); g.arc(0, 0, range * 0.55, hi, lo, true); g.closePath();
    g.fillStyle = rg(g, 0, 0, range * 0.5, range, [0, rgba(col, 0.1), 0.7, rgba(col, 0.7), 1, rgba('#ffffff', 0.9)]); g.fill();
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba('#ffffff', 0.8); g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, range * 0.97, lo, hi); g.stroke();
    g.restore(); addLight(GAME.p.x, GAME.p.y, range * 1.4, col, 0.5 * (1 - fade));
  } });
}
// Geschoss mit Form und Farbe
function shot(x, y, ang, sp, dmg, school, src, o) {
  o = o || {};
  const hit = new Set(); let left = o.pierce || 0; const col = o.col || '#ffffff', size = o.size || 8;
  addEffect({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, dur: o.life || 0.9, layer: 2, update(e, dt) {
    if (o.home) { const t = nearestEnemy(e.x, e.y, 220, hit); if (t) { const cur = Math.atan2(e.vy, e.vx), na = cur + clamp(angDiff(cur, Math.atan2(t.y - e.y, t.x - e.x)), -5 * dt, 5 * dt); e.vx = Math.cos(na) * sp; e.vy = Math.sin(na) * sp; } }
    e.x += e.vx * dt; e.y += e.vy * dt;
    let done = false;
    forEnemiesInRadius(e.x, e.y, size + 6, (en) => {
      if (done || hit.has(en.id)) return; hit.add(en.id);
      if (dmg > 0) dealDamage(en, dmg, school, src, { kb: o.kb || 60, kx: e.vx, ky: e.vy, norm: true, stun: o.stun });
      if (o.freeze) freezeEnemy(en, o.freeze);
      if (o.slow) { en.slowT = Math.max(en.slowT, 1.5); en.slowF = Math.min(en.slowF || 1, 0.5); }
      if (o.onHit) o.onHit(en, e);
      burstSparks(en.x, en.y - 12, 3, col, 0.6);
      if (--left < 0) done = true;
    });
    if (done) { e.dead = true; if (o.onEnd) o.onEnd(e.x, e.y); }
    else if (e.t + dt >= e.dur && o.onEnd && !e.ended) { e.ended = true; o.onEnd(e.x, e.y); }
    addLight(e.x, e.y, 60, col, 0.7);
  }, draw(g, e) {
    const a = Math.atan2(e.vy, e.vx);
    g.save(); g.translate(e.x, e.y - 12); g.rotate(a);
    if (o.shape === 'ball') { g.fillStyle = rg(g, -size * 0.3, -size * 0.3, 1, size, [0, '#ffffff', 0.4, col, 1, shade(col, -0.5)]); g.beginPath(); g.arc(0, 0, size, 0, TAU); g.fill(); }
    else if (o.shape === 'crescent') { g.globalCompositeOperation = 'lighter'; g.strokeStyle = col; g.lineWidth = size * 0.5; g.beginPath(); g.arc(-size, 0, size * 2, -1.1, 1.1); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.stroke(); }
    else { g.fillStyle = lg(g, -size * 2, 0, size, 0, [0, rgba(col, 0), 0.5, col, 1, '#ffffff']); g.beginPath(); g.moveTo(size * 1.3, 0); g.lineTo(-size * 1.6, -size * 0.45); g.lineTo(-size * 1.1, 0); g.lineTo(-size * 1.6, size * 0.45); g.closePath(); g.fill(); }
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(glowSprite(col), -size * 2, -size * 2, size * 4, size * 4);
    g.restore();
  } });
}
// Flaechenschlag mit Ring und Aufblitzen
function blast(x, y, r, dmg, school, src, o) {
  o = o || {};
  const col = o.col || '#ffffff';
  forEnemiesInRadius(x, y, r, (en) => { dealDamage(en, dmg, school, src, { kb: o.kb || 140, kx: en.x - x, ky: en.y - y, norm: true, stun: o.stun }); if (o.freeze) freezeEnemy(en, o.freeze); if (o.slow) { en.slowT = Math.max(en.slowT, 2); en.slowF = Math.min(en.slowF || 1, 0.5); } if (o.onHit) o.onHit(en); });
  fxRing(x, y, r * 0.15, r, 0.35, col, o.w || 7); fxFlash(x, y - 8, r * 0.7, col, 0.18);
  burstSparks(x, y - 10, o.sparks || 8, col, 1); if (o.shake !== 0) shake(o.shake || 2); sfx(o.sfx || 'nova', 0, 0.1);
  if (o.decal) addDecal(x, y, ASPR.crack, r * 1.4, 0.8, 5, Math.random() * TAU);
}
// Stacheln (Erde, Eis) steigen entlang einer Linie auf
function spikeLine(x, y, ang, len, dmg, school, src, col, o) {
  o = o || {};
  const n = Math.max(3, Math.round(len / 34));
  for (let i = 1; i <= n; i++) GAME.later(i * 0.05, () => {
    const sx = x + Math.cos(ang) * i * len / n, sy = y + Math.sin(ang) * i * len / n * 0.8, r = o.r || 26;
    forEnemiesInRadius(sx, sy, r, (en) => { dealDamage(en, dmg, school, src, { kb: 40, kx: 0, ky: -1, stun: o.stun, quiet: i > 1 }); if (o.freeze) freezeEnemy(en, o.freeze); });
    spikeFx(sx, sy, r, col, o.tall || 34);
  });
}
function spikeFx(x, y, r, col, tall) {
  const sp = Array.from({ length: 4 }, (_, i) => ({ dx: rand(-r * 0.6, r * 0.6), dy: rand(-r * 0.3, r * 0.3), h: rand(tall * 0.6, tall), w: rand(4, 7) }));
  addEffect({ x, y, dur: 0.55, layer: 2, draw(g, e, k) {
    const grow = k < 0.2 ? easeOut(k / 0.2) : k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    for (const s of sp) { const sx = x + s.dx, sy = y + s.dy, h = s.h * grow; g.fillStyle = lg(g, sx, sy - h, sx, sy, [0, '#ffffff', 0.3, col, 1, shade(col, -0.55)]); g.beginPath(); g.moveTo(sx - s.w, sy); g.lineTo(sx, sy - h); g.lineTo(sx + s.w, sy); g.closePath(); g.fill(); }
  } });
  burstAsh(x, y, 3, shade(col, -0.3));
}
// Kette / Fessel zwischen Figur und Gegner (fuer die Dauer sichtbar)
function tetherFx(en, dur, col, links) {
  addEffect({ x: en.x, y: en.y, dur, layer: 2, draw(g, e, k) {
    if (en.dead) return; const q = GAME.p, x0 = q.x, y0 = q.y - 18, x1 = en.x, y1 = en.y - 12, n = links || 10;
    g.save(); g.globalAlpha = 1 - k * k; g.strokeStyle = shade(col, -0.6); g.lineWidth = 4; g.beginPath();
    for (let i = 0; i <= n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * 10 * (1 - k); const x = lerp(x0, x1, t), y = lerp(y0, y1, t) + sag; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = col; g.lineWidth = 1.8; g.stroke(); g.restore();
  } });
}
// dauerhaft umkreisende Klingen (neu gezeichnet solange die Faehigkeit existiert)
function orbitFx(p, id, ab, col, draw) {
  if (ab.orb) return; ab.orb = true;
  addEffect({ x: 0, y: 0, dur: 1e9, layer: 2, update(e) { if (GAME.p.ab[id] !== ab) e.dead = true; }, draw(g) { draw(g, GAME.p, ab); } });
}
// kleine Diener (Lesser Wights), die Gegner jagen
function spawnMinion(p, o) {
  const m = { x: p.x + rand(-30, 30), y: p.y + rand(-20, 20), t: 0, hitT: 0, face: 1 };
  addEffect({ x: m.x, y: m.y, dur: o.dur, layer: 1, update(e, dt) {
    m.t += dt; m.hitT -= dt;
    const tg = nearestEnemy(m.x, m.y, 320);
    const q = GAME.p; let tx = q.x + 30, ty = q.y;
    if (tg) { tx = tg.x; ty = tg.y; }
    const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1;
    if (d > 16) { m.x += dx / d * o.speed * dt; m.y += dy / d * o.speed * dt; m.face = dx >= 0 ? 1 : -1; }
    if (tg && d < 26 && m.hitT <= 0) { m.hitT = o.rate; dealDamage(tg, o.dmg, o.school, o.src, { kb: 90, kx: dx, ky: dy, norm: true }); burstSparks(tg.x, tg.y - 12, 3, o.col, 0.5); }
    e.x = m.x; e.y = m.y;
    if (e.t + dt >= e.dur && o.onEnd) o.onEnd(m.x, m.y);
  }, draw(g, e, k) {
    const bob = Math.sin(m.t * 12) * 1.5, a = k > 0.9 ? (1 - k) * 10 : 1;
    g.save(); g.globalAlpha = a; g.translate(m.x, m.y); g.scale(m.face, 1);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(0, 1, 8, 3, 0, 0, TAU); g.fill();
    g.fillStyle = o.body; g.beginPath(); g.ellipse(0, -12 + bob, 6, 9, 0.3, 0, TAU); g.fill();
    g.beginPath(); g.arc(3, -23 + bob, 4.5, 0, TAU); g.fill();
    g.strokeStyle = o.body; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-2, -4 + bob); g.lineTo(-4 + Math.sin(m.t * 12) * 3, 0); g.moveTo(2, -4 + bob); g.lineTo(4 - Math.sin(m.t * 12) * 3, 0); g.moveTo(3, -16 + bob); g.lineTo(10, -12 + bob); g.stroke();
    g.fillStyle = o.eye; g.beginPath(); g.arc(5, -24 + bob, 1.2, 0, TAU); g.fill(); glowDot(g, 5, -24 + bob, 4, o.eye, 0.6);
    g.restore();
  } });
}
function cardDef(name, school, tags, lv) { return { name, school, kind: 'ability', max: 5, tags, lv }; }

/* ============================================================ Rahmen: Helden mit Formen */
function defineEvoHero(id, def) {
  const T = def.tiers;
  HEROES[id] = Object.assign({
    hp: T[0].hp, speed: T[0].speed, armor: T[0].armor, slots: T[0].slots, start: T[0].grants[0], pool: [], evoHero: true,
    unlock: { desc: 'Von Anfang an verfügbar.', cost: 0, check: () => true }
  }, def);
  const H = HEROES[id];
  H.baseStats = (p) => T[p.tier || 0];
  H.slotsOf = (p) => T[p.tier || 0].slots;
  H.poolOf = (p) => { const s = new Set(EVO_PASSIVES.concat(def.passives || [])); for (let i = 0; i <= (p.tier || 0); i++) T[i].unlocks.forEach((c) => s.add(c)); return [...s].filter((c) => CARDS[c]); };
  H.evoPath = () => `<div class="blk"><b class="lbl">EVOLUTION IM LAUF</b><p>${T.map((t, i) => `<span style="color:${t.col}">${t.name}</span>${i ? ` <span style="opacity:.7">(${t.txt})</span>` : ''}`).join(' → ')}</p></div>`;
  H.onStart = () => { const p = GAME.p; p.tier = 0; evoGrant(p, T[0]); recomputeStats(); p.hp = p.st.maxHp; GAME.later(0.8, () => UI.announce(T[0].name.toUpperCase(), '')); if (def.start2) def.start2(p); };
  H.onUpdate = (dt) => {
    const G = GAME, p = G.p; if (def.tick) def.tick(p, dt);
    if (G.state !== 'play' || !p.alive) return;
    const N = T[(p.tier || 0) + 1];
    if (N && (G.evoLock || 0) < G.t && (G.level >= N.lv || (N.ev && N.ev(G)))) { G.evoLock = G.t + 2; evoEvolve(p, (p.tier || 0) + 1); }
  };
  const base = def.art.base;
  HERO_ART[id] = { spec: def.art.spec, rim: T[0].col, h: def.art.h, draw: (g, P, L) => withPal([[HERO_PAL[base], def.art.pals[Math.min(L.tier || 0, def.art.pals.length - 1)]]], () => def.art.fn(g, P, Object.assign({}, L, def.art.look))) };
  const i = HERO_ORDER.indexOf('draco'); HERO_ORDER.splice(i >= 0 ? i : HERO_ORDER.length, 0, id);
  SAVE.unlocked[id] = true;
}
function evoGrant(p, T) {
  for (const c of T.grants) { if (p.ab[c]) continue; p.ab[c] = { lvl: 1, t: 0.4 }; p.order.push(c); }
}
function evoEvolve(p, tier) {
  const H = HEROES[p.hero], T = H.tiers[tier];
  p.tier = tier; evoGrant(p, T); recomputeStats(); p.hp = p.st.maxHp; p.iframes = Math.max(p.iframes, 1.5);
  sfx('fusion'); shake(10); hitstop(0.2); GAME.slowmo = Math.max(GAME.slowmo, 1.2);
  const col = T.col;
  addEffect({ x: p.x, y: p.y, dur: 1.2, layer: 1, draw(g, e, k) { const q = GAME.p, w = 50 * (1 - k * 0.5); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k; g.fillStyle = lg(g, q.x - w, 0, q.x + w, 0, [0, rgba(col, 0), 0.4, rgba(col, 0.8), 0.5, 'rgba(255,255,255,1)', 0.6, rgba(col, 0.8), 1, rgba(col, 0)]); g.fillRect(q.x - w, q.y - 600, w * 2, 600); }, update() { addLight(GAME.p.x, GAME.p.y, 400, col, 1); } });
  fxRing(p.x, p.y, 10, 280, 0.7, col, 12); fxRing(p.x, p.y, 10, 200, 0.6, '#ffffff', 4);
  forEnemiesInRadius(p.x, p.y, 240, (en) => { if (!en.boss) { const a = Math.atan2(en.y - p.y, en.x - p.x); en.kvx += Math.cos(a) * 500 / Math.sqrt(en.mass); en.kvy += Math.sin(a) * 500 / Math.sqrt(en.mass); } });
  const N = H.tiers[tier + 1];
  UI.evolution(Object.assign({ id: 'evo' }, T), N ? Object.assign({}, N, { level: N.lv + (N.ev ? ' (' + N.txt.replace(/^Stufe \d+ oder /, 'oder ') + ')' : '') }) : null);
}
// Staerke der Form fliesst in jeden Schaden
const _hdmEvo = heroDamageMult;
heroDamageMult = function (p, school) {
  let m = _hdmEvo(p, school); const H = HEROES[p.hero];
  if (H.evoHero) m *= H.tiers[p.tier || 0].might;
  if (p.hero === 'emma' && (p.iqT || 0) > GAME.t) m *= 1.4;
  return m;
};
// Verwundbar (Drachenaugen)
const _ddEvo = dealDamage;
dealDamage = function (e, base, school, src, o) { if (e && e.vulnT > GAME.t) base *= e.vulnM || 1.3; return _ddEvo(e, base, school, src, o); };
const _heroLookEvo = heroLook;
heroLook = function (p) { const L = _heroLookEvo(p), H = HEROES[p.hero]; if (H.evoHero) { L.tier = p.tier || 0; L.rim = H.tiers[L.tier].col; } return L; };

/* ============================================================ PETER KRAUS */
Object.assign(CARDS, {
  erdstab: cardDef('Lehmstab', 'none', ['Nahkampf', 'Erde'], ['Peter schwingt seinen geformten Lehmstab: 22 Schaden im Bogen.', '+35 % Schaden.', 'Rückschwung: ein zweiter Hieb nach hinten.', '+25 % Reichweite, Treffer betäuben kurz.', 'Erdbrecher: jeder Hieb lässt Erdstacheln aufsteigen.']),
  erdstoss: cardDef('Erdstoß', 'none', ['Linie', 'Erde'], ['Alle 2,8 s bricht eine Reihe Erdstacheln nach vorn: 28 Schaden.', 'Zwei Reihen im V.', '+35 % Schaden.', 'Abklingzeit 2,1 s.', 'Drei Reihen, getroffene Gegner sind betäubt.']),
  ghulbiss: cardDef('Ghulbiss', 'blood', ['Nahkampf', 'Heilung'], ['Der Hunger treibt Peter zum nächsten Gegner: Biss für 30 Schaden, heilt 2 Leben.', '+40 % Schaden.', 'Heilt 4 Leben, Bisse lassen bluten.', 'Abklingzeit 1,6 s.', 'Fressrausch: der Biss springt auf einen zweiten Gegner über.']),
  wightfaust: cardDef('Wightfaust', 'none', ['Wucht', 'Kegel'], ['Untote Kraft: ein Faustschlag schleudert alles vor Peter weg: 55 Schaden.', '+35 % Schaden.', 'Breiterer Schlagkegel.', 'Abklingzeit 2,0 s.', 'Doppelschlag: eine zweite Faust folgt sofort.']),
  doppelklingen: cardDef('Doppelklingen', 'none', ['Nahkampf', 'Schnell'], ['Wirbel mit zwei Klingen: 4 schnelle Schnitte um Peter, je 12 Schaden.', '+2 Schnitte.', '+35 % Schaden.', 'Abklingzeit 1,0 s.', 'Treffer lassen bluten.']),
  maske: cardDef('Seelenmaske', 'shadow', ['Ablenkung', 'Explosion'], ['Peters Seelenwaffe: alle 6 s zwei Maskendoppelgänger, die Gegner anlocken und nach 3 s zerplatzen (40 Schaden).', '+1 Doppelgänger.', '+40 % Explosion.', 'Abklingzeit 4,5 s.', 'Doppelgänger schlagen selbst zu.']),
  kleinewights: cardDef('Kleine Wights', 'none', ['Diener', 'Dauer'], ['Alle 8 s erheben sich 2 kleine Wights und kämpfen 10 s für Peter (je 9 Schaden pro Schlag).', '+1 Wight.', '+40 % Schaden, schneller.', '+1 Wight, halten 14 s.', 'Beim Zerfall zerplatzen sie in Leichengift.'])
});
function tickErdstab(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 150); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(1.3); const ang = Math.atan2(e.y - p.y, e.x - p.x), dmg = 22 * (L >= 2 ? 1.35 : 1), rng = 88 * (L >= 4 ? 1.25 : 1) * p.st.area;
  castAnim(p, ang, 0.24);
  const o = { stun: L >= 4 ? 0.3 : 0, kb: 140, onHit: L >= 5 ? (en) => spikeFx(en.x, en.y, 16, '#a8845a', 26) : null };
  arcSweep(p, ang, rng, 2.2, dmg, 'none', 'erdstab', '#c8a070', o);
  if (L >= 3) GAME.later(0.14, () => arcSweep(GAME.p, ang + Math.PI, rng * 0.9, 2.0, dmg * 0.8, 'none', 'erdstab', '#c8a070', Object.assign({ dir: -1 }, o)));
}
function tickErdstoss(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 260); if (!e) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.1 : 2.8); const ang = Math.atan2(e.y - p.y, e.x - p.x), dmg = 28 * (L >= 3 ? 1.35 : 1);
  castAnim(p, ang, 0.3); sfx('stomp', 0, 0.1);
  const lines = L >= 5 ? [-0.35, 0, 0.35] : L >= 2 ? [-0.22, 0.22] : [0];
  for (const o of lines) spikeLine(p.x, p.y, ang + o, 230 * p.st.area, dmg, 'none', 'erdstoss', '#a8845a', { stun: L >= 5 ? 0.6 : 0.2 });
}
function tickGhulbiss(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 150); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.6 : 2.2);
  const bite = (en, k) => { const dmg = 30 * (L >= 2 ? 1.4 : 1) * k; castAnim(GAME.p, Math.atan2(en.y - GAME.p.y, en.x - GAME.p.x), 0.2); dealDamage(en, dmg, 'blood', 'ghulbiss', { kb: 60, kx: en.x - GAME.p.x, ky: en.y - GAME.p.y, norm: true, bleed: L >= 3 ? 4 : 0 }); healPlayer(L >= 3 ? 4 : 2); burstBlood(en.x, en.y, 8, 1); sfx('splat', 0, 0.06);
    addEffect({ x: en.x, y: en.y, dur: 0.25, layer: 2, draw(g, fx, k2) { g.save(); g.globalAlpha = 1 - k2; g.strokeStyle = '#f0f0e0'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(en.x - 10 + i * 5, en.y - 26); g.lineTo(en.x - 8 + i * 5, en.y - 18 + k2 * 4); g.stroke(); } g.restore(); } }); };
  bite(e, 1);
  if (L >= 5) { const n2 = nearestEnemy(e.x, e.y, 120, new Set([e.id])); if (n2) GAME.later(0.15, () => bite(n2, 0.7)); }
}
function tickWightfaust(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 170); if (!e) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.0 : 2.6); const ang = Math.atan2(e.y - p.y, e.x - p.x), dmg = 55 * (L >= 2 ? 1.35 : 1), half = L >= 3 ? 0.75 : 0.5, rng = 140 * p.st.area;
  const punch = (k) => { const q = GAME.p; castAnim(q, ang, 0.3); sfx('stomp', 0, 0.1); shake(4); hitstop(0.04);
    forEnemiesInRadius(q.x, q.y, rng, (en) => { if (inArc(en.x, en.y, q.x, q.y, ang, half)) dealDamage(en, dmg * k, 'none', 'wightfaust', { kb: 420, kx: en.x - q.x, ky: en.y - q.y, norm: true, stun: 0.3 }); });
    const fx = q.x + Math.cos(ang) * 40, fy = q.y + Math.sin(ang) * 30; fxFlash(fx, fy - 14, 50, '#e8e4d8', 0.15); fxRing(fx, fy, 10, rng * 0.6, 0.25, '#d8d4c8', 6); burstAsh(fx, fy, 8, '#8a8680'); };
  punch(1); if (L >= 5) GAME.later(0.18, () => punch(0.7));
}
function tickDoppelklingen(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 110)) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.0 : 1.4); const n = 4 + (L >= 2 ? 2 : 0), dmg = 12 * (L >= 3 ? 1.35 : 1);
  for (let i = 0; i < n; i++) GAME.later(i * 0.05, () => arcSweep(GAME.p, i / n * TAU + rand(-0.3, 0.3), 78 * GAME.p.st.area, 1.3, dmg, 'none', 'doppelklingen', '#d8e0e8', { kb: 50, bleed: L >= 5 ? 3 : 0, dir: i % 2 ? 1 : -1 }));
}
function tickMaske(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 4.5 : 6); const n = 2 + (L >= 2 ? 1 : 0), dmg = 40 * (L >= 3 ? 1.4 : 1);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + Math.random(), img = spawnAfterimage(p, 3, 'decoy'); img.x = p.x + Math.cos(a) * 80; img.y = p.y + Math.sin(a) * 55;
    if (L >= 5) img.kind = 'after';
    GAME.later(3, () => blast(img.x, img.y, 70 * GAME.p.st.area, dmg, 'shadow', 'maske', { col: '#9aff9a', kb: 200 }));
  }
}
function tickKleinewights(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(8); const n = 2 + (L >= 2 ? 1 : 0) + (L >= 4 ? 1 : 0);
  sfx('rift', 0, 0.1); burstAsh(p.x, p.y, 10, '#8a8680');
  for (let i = 0; i < n; i++) spawnMinion(p, { dur: L >= 4 ? 14 : 10, speed: L >= 3 ? 150 : 120, rate: L >= 3 ? 0.55 : 0.75, dmg: 9 * (L >= 3 ? 1.4 : 1), school: 'none', src: 'kleinewights', col: '#d8d4c8', body: '#c8c4b8', eye: '#9aff9a',
    onEnd: L >= 5 ? (x, y) => { blast(x, y, 60, 20, 'blood', 'kleinewights', { col: '#9aff9a', shake: 0 }); } : null });
}
Object.assign(TICKS, { erdstab: tickErdstab, erdstoss: tickErdstoss, ghulbiss: tickGhulbiss, wightfaust: tickWightfaust, doppelklingen: tickDoppelklingen, maske: tickMaske, kleinewights: tickKleinewights });
ULTS.ghulrausch = function (p) {
  sfx('ult'); shake(8); p.ultT = 6; p.rausch = GAME.t + 6; castAnim(p, -Math.PI / 2, 0.5);
  blast(p.x, p.y, 180 * p.st.area, 40, 'blood', 'ghulrausch', { col: '#9aff9a', kb: 300, sparks: 20 });
  for (let i = 0; i < 12; i++) GAME.later(0.4 + i * 0.45, () => { const q = GAME.p, e = nearestEnemy(q.x, q.y, 160); if (e) { dealDamage(e, 45, 'blood', 'ghulrausch', { kb: 80, kx: e.x - q.x, ky: e.y - q.y, norm: true }); healPlayer(5); burstBlood(e.x, e.y, 10, 1.2); } });
};
defineEvoHero('peter', {
  name: 'Peter Kraus', title: 'Vom Opfer zum Wight', school: 'none', diff: 2,
  role: 'Nahkampf · zäh · Hunger heilt', dodgeCd: 2.6, dodge: 'roll',
  mech: { name: 'Untoter Hunger', desc: 'Peter beginnt als ängstlicher Schüler mit einer Erd-Fähigkeit und einem Lehmstab. Im Lauf wird er zum Ghul (Hunger: Bisse heilen), dann zum Wight — untot, mit vielfacher Menschenkraft und schneller Heilung. Später erwacht seine Seelenwaffe, die Maske, und als Anführer erhebt er kleine Wights. Ab dem Ghul heilt jeder Kill ein wenig.' },
  ult: { id: 'ghulrausch', name: 'Ghulrausch', cd: 18, desc: 'Der Hunger bricht durch: Druckwelle, dann 6 s lang reißt Peter immer wieder den nächsten Gegner und heilt sich dabei.' },
  strengths: ['Sehr zäh, heilt durch Kills und Bisse', 'Wucht im Nahkampf', 'Diener lenken ab'], weaknesses: ['Kaum Fernkampf', 'Schwacher Beginn als Erdschüler', 'Muss nah heran'],
  builds: [{ name: 'Wight', desc: 'Wightfaust + Ghulbiss + Vampirblut: mitten hinein und nicht sterben.' }, { name: 'Maskenspiel', desc: 'Seelenmaske + Doppelklingen: Doppelgänger ziehen Gegner, Peter schneidet sie auf.' }, { name: 'Anführer', desc: 'Kleine Wights + Erdstoß: eine eigene kleine Armee.' }],
  tiers: [
    { name: 'Erdschüler', txt: '', lv: 0, hp: 95, speed: 150, armor: 1, might: 1, slots: 2, col: '#c8a070', rim: '#c8a070', grants: ['erdstab'], unlocks: ['erdstab', 'erdstoss'], desc: 'Ein Lehmstab und die Erd-Fähigkeit aus dem Buch.' },
    { name: 'Ghul', txt: 'Stufe 6', lv: 6, hp: 125, speed: 160, armor: 1, might: 1.15, slots: 3, col: '#9aff9a', rim: '#9aff9a', grants: ['ghulbiss'], unlocks: ['ghulbiss'], desc: 'Das Blutritual rettet ihn — der Hunger bleibt. Bisse heilen.' },
    { name: 'Wight', txt: 'Stufe 13', lv: 13, hp: 170, speed: 168, armor: 2, might: 1.35, slots: 4, col: '#e8e4d8', rim: '#e8e4d8', grants: ['wightfaust'], unlocks: ['wightfaust', 'doppelklingen'], desc: 'Untot, kein Herzschlag, vielfache Menschenkraft.' },
    { name: 'Maskenträger', txt: 'Stufe 21', lv: 21, hp: 200, speed: 175, armor: 2, might: 1.55, slots: 5, col: '#b8a0ff', rim: '#b8a0ff', grants: ['maske'], unlocks: ['maske'], desc: 'Seine Seelenwaffe erwacht: eine Maske, die Gestalten formt.' },
    { name: 'Wight-Anführer', txt: 'Stufe 29 oder Hauptmann Kharn besiegen', lv: 29, ev: (G) => G.miniKilled, hp: 245, speed: 182, armor: 3, might: 1.8, slots: 6, col: '#6aff8a', rim: '#6aff8a', grants: ['kleinewights'], unlocks: ['kleinewights'], desc: 'Er führt eigene kleine Wights in den Kampf.' }
  ],
  passives: ['lebensraub'],
  tick(p) { if ((p.tier || 0) >= 1 && GAME.kills > (p.lastK || 0)) { healPlayer((GAME.kills - (p.lastK || 0)) * 0.4); } p.lastK = GAME.kills; },
  art: { base: 'vorian', fn: drawVorian, spec: SPEC_VORIAN, h: 66, look: { glow: 0, plain: true }, pals: [
    { skin: '#e8c6ac', skinD: '#a8866c', armor: '#5a4a30', armorL: '#8a7650', armorD: '#2a2012', red: '#6a5030', redL: '#c8a070', redD: '#2a1e10', hair: '#3a2a1a', eye: '#6a4a2a', rim: '#c8a070' },
    { skin: '#b8c8b0', skinD: '#6a7a62', armor: '#3a4a36', armorL: '#6a7a60', armorD: '#141a12', red: '#3a5a3a', redL: '#9aff9a', redD: '#142014', hair: '#1a1a14', eye: '#9aff9a', rim: '#9aff9a' },
    { skin: '#e8e4dc', skinD: '#9a968e', armor: '#2e2e34', armorL: '#5e5e68', armorD: '#101014', red: '#7a7a82', redL: '#e8e4d8', redD: '#2a2a30', hair: '#e8e4dc', eye: '#c8ffc8', rim: '#e8e4d8' },
    { skin: '#e8e4dc', skinD: '#9a968e', armor: '#2a2436', armorL: '#5a4a7a', armorD: '#0e0a16', red: '#6a4a9a', redL: '#b8a0ff', redD: '#20143a', hair: '#e8e4dc', eye: '#b8a0ff', rim: '#b8a0ff' },
    { skin: '#e8e4dc', skinD: '#9a968e', armor: '#1a2a1e', armorL: '#3a6a44', armorD: '#08100a', red: '#2a8a4a', redL: '#6aff8a', redD: '#0a2a14', hair: '#e8e4dc', eye: '#6aff8a', rim: '#6aff8a' }
  ] }
});

/* ============================================================ EMMA WAGNER */
Object.assign(CARDS, {
  eislanze: cardDef('Eislanze', 'none', ['Fernkampf', 'Eis'], ['Eisspeere fliegen auf den nächsten Gegner: 16 Schaden, verlangsamen.', '+1 Speer.', '+35 % Schaden, durchbohren 1 Gegner.', 'Abklingzeit 0,9 s.', 'Zerspringen: Treffer lassen Gegner kurz erstarren.']),
  eissaeule: cardDef('Eissäule', 'none', ['Fläche', 'Eis'], ['Alle 3 s schießt unter einer Gruppe eine Eissäule empor: 26 Schaden, Gegner erstarren 1 s.', '+1 Säule.', 'Größere Säulen.', 'Abklingzeit 2,3 s.', 'Splitter: jede Säule zerbirst in Eissplitter.']),
  eisschwert: cardDef('Eisschwert', 'none', ['Nahkampf', 'Eis'], ['Schwertkunst mit Eisklinge: 24 Schaden, erstarrte Gegner nehmen +50 %.', '+35 % Schaden.', 'Dritter, weiter Hieb.', '+25 % Reichweite.', 'Klingenwelle: jeder dritte Hieb schickt eine Eiswelle nach vorn.']),
  dhampirklinge: cardDef('Dhampirklinge', 'qi', ['Fernkampf', 'Durchbohrend'], ['Gelbe Dhampir-Energie in der Klinge: ein Sichelschnitt fliegt nach vorn, 34 Schaden, +50 % gegen starke Gegner.', '+35 % Schaden.', 'Zwei Sicheln.', 'Abklingzeit 1,6 s.', 'Treffer heilen 1 Leben.']),
  frostkette: cardDef('Frostkette', 'none', ['Kette', 'Kontrolle'], ['Eine Kette schnellt zu 3 Gegnern, zieht sie heran und lässt sie erstarren: 18 Schaden.', '+2 Ziele.', '+40 % Schaden.', 'Abklingzeit 2,0 s.', 'Kettenwirbel: danach ein eisiger Rundumschlag.']),
  drachenblick: cardDef('Drachenaugen', 'qi', ['Schwächung', 'Fläche'], ['Alle 5 s durchschauen Emmas Drachenaugen alle Gegner in der Nähe: 4 s lang +30 % Schaden gegen sie.', 'Größerer Umkreis.', '+45 % Schaden gegen sie.', 'Abklingzeit 3,8 s.', 'Durchschaut: markierte Gegner werden zusätzlich verlangsamt.'])
});
function tickEislanze(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 340, 1 + (L >= 2 ? 1 : 0)); if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 0.9 : 1.2); const dmg = 16 * (L >= 3 ? 1.35 : 1);
  tg.forEach((e) => { const a = Math.atan2(e.y - p.y, e.x - p.x); castAnim(p, a, 0.16); shot(p.x, p.y - 4, a, 520, dmg, 'none', 'eislanze', { col: '#9ad8ff', size: 9, pierce: L >= 3 ? 1 : 0, slow: true, freeze: L >= 5 ? 0.6 : 0 }); });
  sfx('whip', 0, 0.04);
}
function tickEissaeule(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 300)) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 2.3 : 3); const n = 1 + (L >= 2 ? 1 : 0), r = (L >= 3 ? 64 : 48) * p.st.area, dmg = 26;
  for (let i = 0; i < n; i++) GAME.later(i * 0.15, () => { const en = randomEnemyNear(GAME.p.x, GAME.p.y, 300); if (!en) return; const x = en.x, y = en.y;
    fxTelegraphCircle(x, y, r, 0.2, '#9ad8ff');
    GAME.later(0.2, () => { blast(x, y, r, dmg, 'none', 'eissaeule', { col: '#bfe8ff', freeze: 1, kb: 30 }); spikeFx(x, y, r * 0.6, '#9ad8ff', 60);
      if (L >= 5) for (let k = 0; k < 6; k++) shot(x, y, k / 6 * TAU, 380, 10, 'none', 'eissaeule', { col: '#bfe8ff', size: 6, slow: true, life: 0.5 }); }); });
}
function tickEisschwert(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 140); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(1.0); ab.n = (ab.n || 0) + 1;
  const ang = Math.atan2(e.y - p.y, e.x - p.x), dmg = 24 * (L >= 2 ? 1.35 : 1), rng = 92 * (L >= 4 ? 1.25 : 1) * p.st.area;
  castAnim(p, ang, 0.2);
  const o = { frozenBonus: 1.5, kb: 90, dir: ab.n % 2 ? 1 : -1 };
  arcSweep(p, ang, rng, 2.4, dmg, 'none', 'eisschwert', '#bfe8ff', o);
  if (L >= 3) GAME.later(0.12, () => arcSweep(GAME.p, ang, rng * 1.2, 3.4, dmg * 0.8, 'none', 'eisschwert', '#9ad8ff', Object.assign({}, o, { dir: -o.dir })));
  if (L >= 5 && ab.n % 3 === 0) shot(p.x, p.y, ang, 460, dmg, 'none', 'eisschwert', { col: '#bfe8ff', shape: 'crescent', size: 16, pierce: 99, slow: true });
}
function tickDhampirklinge(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 320); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.6 : 2.2); const ang = Math.atan2(e.y - p.y, e.x - p.x), dmg = 34 * (L >= 2 ? 1.35 : 1);
  castAnim(p, ang, 0.24); sfx('whip');
  const fire = (a) => shot(p.x, p.y, a, 480, dmg, 'qi', 'dhampirklinge', { col: '#ffd84a', shape: 'crescent', size: 16, pierce: 99, onHit: (en) => { if (en.boss || en.mini || en.def.miniboss || (en.def.armor || 0) >= 2) dealDamage(en, dmg * 0.5, 'qi', 'dhampirklinge', { quiet: true }); if (L >= 5) healPlayer(1); } });
  fire(ang); if (L >= 3) GAME.later(0.1, () => fire(ang + 0.25));
}
function tickFrostkette(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 250, 3 + (L >= 2 ? 2 : 0)); if (!tg.length) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.0 : 2.6); const dmg = 18 * (L >= 3 ? 1.4 : 1);
  sfx('chain', 0, 0.08);
  tg.forEach((en, i) => GAME.later(i * 0.05, () => { if (en.dead) return; const q = GAME.p; tetherFx(en, 0.35, '#bfe8ff', 12); dealDamage(en, dmg, 'none', 'frostkette', { kb: -260, kx: en.x - q.x, ky: en.y - q.y, norm: true }); freezeEnemy(en, 0.9); }));
  if (L >= 5) GAME.later(0.4, () => arcSweep(GAME.p, 0, 110 * GAME.p.st.area, TAU, dmg, 'none', 'frostkette', '#bfe8ff', { frozenBonus: 1.5 }));
}
function tickDrachenblick(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 3.8 : 5); const r = (L >= 2 ? 300 : 230) * p.st.area;
  let n = 0;
  forEnemiesInRadius(p.x, p.y, r, (en) => { n++; en.vulnT = GAME.t + 4; en.vulnM = L >= 3 ? 1.45 : 1.3; if (L >= 5) { en.slowT = Math.max(en.slowT, 4); en.slowF = Math.min(en.slowF || 1, 0.6); }
    addEffect({ x: en.x, y: en.y, dur: 4, layer: 2, draw(g, e, k) { if (en.dead) return; g.save(); g.globalAlpha = 0.7 * (1 - k * 0.5); g.strokeStyle = '#ffb020'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(en.x, en.y - en.r * 2 - 10, 6, 3, 0, 0, TAU); g.stroke(); g.fillStyle = '#ffb020'; g.beginPath(); g.ellipse(en.x, en.y - en.r * 2 - 10, 1.2, 3, 0, 0, TAU); g.fill(); g.restore(); } }); });
  if (!n) { ab.t = 0.5; return; }
  fxRing(p.x, p.y, 20, r, 0.5, '#ffb020', 4); sfx('palm', 0, 0.1);
}
Object.assign(TICKS, { eislanze: tickEislanze, eissaeule: tickEissaeule, eisschwert: tickEisschwert, dhampirklinge: tickDhampirklinge, frostkette: tickFrostkette, drachenblick: tickDrachenblick });
ULTS.eisgrab = function (p) {
  sfx('ult'); shake(8); hitstop(0.08); castAnim(p, -Math.PI / 2, 0.6);
  const r = 300 * p.st.area;
  blast(p.x, p.y, r, 40, 'none', 'eisgrab', { col: '#bfe8ff', freeze: 2.5, kb: 0, sparks: 30, w: 12 });
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; spikeFx(p.x + Math.cos(a) * r * 0.6, p.y + Math.sin(a) * r * 0.4, 30, '#9ad8ff', 70); }
};
const _dodgeEvo = doDodge;
doDodge = function (p) { const r = _dodgeEvo(p); if (p.hero === 'emma' && p.dodgeT > 0) { p.iqT = GAME.t + 2; } return r; };
defineEvoHero('emma', {
  name: 'Emma Wagner', title: 'Eis, Schwert und Dhampir', school: 'none', diff: 2,
  role: 'Eis · Schwertkunst · Kontrolle', dodgeCd: 2.2, dodge: 'roll',
  mech: { name: 'Kampf-IQ', desc: 'Emma beginnt mit ihrer Eis-Fähigkeit (Eisspeer, Eissäule). Im Lauf lernt sie die Schwertkunst, wird zum Dhampir mit gelber Energie, die besonders starke Gegner verletzt, meistert die Kette und öffnet schließlich die Drachenaugen. Kampf-IQ: nach jedem Ausweichen 2 s lang +40 % Schaden. Erstarrte Gegner nehmen mehr Schaden durch ihr Schwert.' },
  ult: { id: 'eisgrab', name: 'Eisgrab', cd: 17, desc: 'Ein Ring aus Eis: jeder Gegner im weiten Umkreis erstarrt 2,5 s und bekommt 40 Schaden.' },
  strengths: ['Starke Kontrolle durch Erstarren', 'Guter Fern- und Nahkampf', 'Ausweichen belohnt'], weaknesses: ['Wenig Leben', 'Kaum Heilung', 'Braucht Timing'],
  builds: [{ name: 'Frostklinge', desc: 'Eissäule + Eisschwert: erst erstarren lassen, dann zerschneiden.' }, { name: 'Dhampir', desc: 'Dhampirklinge + Drachenaugen: Bosse und Elite schnell fällen.' }, { name: 'Kettenmeisterin', desc: 'Frostkette + Eisschwert: heranziehen, einfrieren, Rundumschlag.' }],
  tiers: [
    { name: 'Eisnutzerin', txt: '', lv: 0, hp: 100, speed: 170, armor: 0, might: 1, slots: 2, col: '#9ad8ff', grants: ['eislanze'], unlocks: ['eislanze', 'eissaeule'], desc: 'Stufe 5 von Beginn an: Eisspeer und Eissäule.' },
    { name: 'Schwertschülerin', txt: 'Stufe 7', lv: 7, hp: 120, speed: 176, armor: 1, might: 1.15, slots: 3, col: '#bfe8ff', grants: ['eisschwert'], unlocks: ['eisschwert'], desc: 'Beim blinden Schwertmeister lernt sie, Kraft in die Klinge zu legen.' },
    { name: 'Dhampir', txt: 'Stufe 14', lv: 14, hp: 150, speed: 184, armor: 1, might: 1.35, slots: 4, col: '#ffd84a', grants: ['dhampirklinge'], unlocks: ['dhampirklinge'], desc: 'Sie wird verwandelt — und das System erkennt eine Dhampir. Gelbe Energie.' },
    { name: 'Kettenklinge', txt: 'Stufe 21', lv: 21, hp: 175, speed: 190, armor: 2, might: 1.55, slots: 5, col: '#e8f4ff', grants: ['frostkette'], unlocks: ['frostkette'], desc: 'Ketten- und Schwerttechnik: sie zieht Gegner heran.' },
    { name: 'Drachenaugen', txt: 'Stufe 29 oder Hauptmann Kharn besiegen', lv: 29, ev: (G) => G.miniKilled, hp: 205, speed: 198, armor: 2, might: 1.8, slots: 6, col: '#ffb020', grants: ['drachenblick'], unlocks: ['drachenblick'], desc: 'Ihre Augen durchschauen jede Schwäche.' }
  ],
  passives: ['lebensraub'],
  art: { base: 'liora', fn: drawLiora, spec: SPEC_LIORA, h: 64, look: { weapon: 'sword', rage: 0 }, pals: [
    { coat: '#2a3a5a', coatL: '#5a7aaa', coatD: '#101828', hair: '#e8e8f0', hairL: '#ffffff', eye: '#9ad8ff', rim: '#9ad8ff', band: '#c8d8e8' },
    { coat: '#2a3a5a', coatL: '#6a8aba', coatD: '#101828', hair: '#e8e8f0', hairL: '#ffffff', eye: '#bfe8ff', rim: '#bfe8ff', band: '#e8f0f8' },
    { coat: '#3a2e1a', coatL: '#8a6a2a', coatD: '#1a1408', hair: '#4a2e1a', hairL: '#7a5030', eye: '#ffd84a', rim: '#ffd84a', band: '#ffd84a' },
    { coat: '#1a2a3a', coatL: '#4a6a8a', coatD: '#0a1018', hair: '#4a2e1a', hairL: '#7a5030', eye: '#e8f4ff', rim: '#e8f4ff', band: '#c8d8e8' },
    { coat: '#2a1a0a', coatL: '#8a5a1a', coatD: '#120a04', hair: '#4a2e1a', hairL: '#7a5030', eye: '#ffb020', rim: '#ffb020', band: '#ffb020' }
  ] }
});

/* ============================================================ CHRIS */
Object.assign(CARDS, {
  kettenklingen: cardDef('Zahnkettenklinge', 'qi', ['Kette', 'Fernkampf'], ['Die gezahnte Kettenklinge schnellt zum Gegner, beißt sich fest und reißt ihn heran: 20 Schaden, Blutung.', '+35 % Schaden.', 'Eine zweite Kette.', '+30 % Reichweite, Abklingzeit 1,0 s.', 'Die Ketten springen auf 2 weitere Gegner.']),
  qifaust: cardDef('Qi-Faust', 'qi', ['Nahkampf', 'Schnell'], ['Kampfkunst ohne Fähigkeit: zwei schnelle Qi-Schläge, je 18 Schaden.', '+35 % Schaden.', 'Dritter Schlag mit Rückstoß.', 'Abklingzeit 0,8 s.', 'Durchschlag: Schläge treffen auch Gegner dahinter.']),
  qiwelle: cardDef('Qi-Welle', 'qi', ['Fläche', 'Rückstoß'], ['Qi außerhalb des Körpers: eine Welle breitet sich aus, 24 Schaden, stößt zurück.', '+35 % Schaden.', 'Größere Welle.', 'Abklingzeit 2,0 s.', 'Doppelwelle.']),
  klingensturm: cardDef('Klingensturm', 'qi', ['Schutz', 'Dauer'], ['Die erwachten Halbgott-Klingen kreisen um Chris: 10 Schaden pro Treffer.', '+1 Klinge.', '+40 % Schaden.', '+1 Klinge, schneller.', 'Alle 3 s schnellen die Klingen nach außen.']),
  qireinigung: cardDef('Qi-Reinigung', 'qi', ['Schutz', 'Heilung'], ['Alle 4 s stößt Chris fremde Energie aus: löscht feindliche Geschosse nahebei, heilt 3, 30 Schaden im Umkreis.', '+35 % Schaden.', 'Größerer Umkreis.', 'Abklingzeit 3,0 s, heilt 5.', 'Reinheit: 1 s unverwundbar danach.']),
  schnitter: cardDef('Roter Schnitter', 'qi', ['Fläche', 'Einschlag'], ['Alle 3,5 s ein roter Rundschnitt mit beiden Ketten: 50 Schaden.', '+35 % Schaden.', 'Größerer Radius.', 'Abklingzeit 2,6 s.', 'Nachhall: ein zweiter Schnitt folgt.'])
});
function tickKettenklingen(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const rng = 230 * (L >= 4 ? 1.3 : 1);
  const tg = nearestEnemies(p.x, p.y, rng, L >= 3 ? 2 : 1); if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.0 : 1.3); const dmg = 20 * (L >= 2 ? 1.35 : 1);
  sfx('chain', 0, 0.06);
  const hitOne = (en, from) => { tetherFx(en, 0.3, '#ff3a3a', 14); dealDamage(en, dmg, 'qi', 'kettenklingen', { kb: -180, kx: en.x - GAME.p.x, ky: en.y - GAME.p.y, norm: true, bleed: 4 }); burstSparks(en.x, en.y - 12, 5, '#ff5a3a', 0.8); };
  tg.forEach((en) => { castAnim(p, Math.atan2(en.y - p.y, en.x - p.x), 0.2); hitOne(en); if (L >= 5) { const ex = new Set([en.id]); let cur = en; for (let k = 0; k < 2; k++) { const n2 = nearestEnemy(cur.x, cur.y, 140, ex); if (!n2) break; ex.add(n2.id); const c2 = cur; GAME.later(0.08 * (k + 1), () => { if (!n2.dead) { dealDamage(n2, dmg * 0.7, 'qi', 'kettenklingen', { bleed: 3 }); lightningLine([[c2.x, c2.y], [n2.x, n2.y]], '#ff3a3a'); } }); cur = n2; } } });
}
function tickQifaust(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 110); if (!e) { ab.t = 0.15; return; }
  ab.t = cdOf(L >= 4 ? 0.8 : 1.1); const ang = Math.atan2(e.y - p.y, e.x - p.x), dmg = 18 * (L >= 2 ? 1.35 : 1), n = L >= 3 ? 3 : 2;
  for (let i = 0; i < n; i++) GAME.later(i * 0.1, () => { const q = GAME.p; castAnim(q, ang, 0.12); palmStrike(q.x, q.y, ang + rand(-0.15, 0.15), (L >= 5 ? 130 : 80) * q.st.area, 34, dmg, 'qifaust', { kbMul: i === 2 ? 1.5 : 0.4 }); });
}
function qiWave(x, y, r, dmg, src) {
  const hit = new Set();
  addEffect({ x, y, dur: 0.45, layer: 1, update(e) { const cr = r * easeOut(clamp(e.t / 0.4, 0, 1)); forEnemiesInRadius(x, y, cr, (en) => { if (hit.has(en.id)) return; hit.add(en.id); dealDamage(en, dmg, 'qi', src, { kb: 260 * GAME.p.st.kb, kx: en.x - x, ky: en.y - y, norm: true }); }); },
    draw(g, e, k) { const cr = r * easeOut(clamp(k * 1.15, 0, 1)); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 1 - k; g.strokeStyle = '#4ff0cc'; g.lineWidth = 12 * (1 - k) + 2; g.beginPath(); g.ellipse(x, y - 8, cr, cr * 0.62, 0, 0, TAU); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke(); g.restore(); } });
  sfx('palm', 0, 0.08); burstQi(x, y, 10, 1);
}
function tickQiwelle(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 180)) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.0 : 2.6); const r = (L >= 3 ? 170 : 130) * p.st.area, dmg = 24 * (L >= 2 ? 1.35 : 1);
  castAnim(p, -Math.PI / 2, 0.3); qiWave(p.x, p.y, r, dmg, 'qiwelle'); if (L >= 5) GAME.later(0.3, () => qiWave(GAME.p.x, GAME.p.y, r * 1.25, dmg * 0.8, 'qiwelle'));
}
function tickKlingensturm(p, ab, dt) {
  const L = ab.lvl, n = 2 + (L >= 2 ? 1 : 0) + (L >= 4 ? 1 : 0), spd = L >= 4 ? 4.2 : 3.2, R = 64 * p.st.area, dmg = 10 * (L >= 3 ? 1.4 : 1);
  ab.a = (ab.a || 0) + dt * spd; ab.hitT = ab.hitT || {};
  for (let i = 0; i < n; i++) { const a = ab.a + i / n * TAU, bx = p.x + Math.cos(a) * R, by = p.y + Math.sin(a) * R * 0.62;
    forEnemiesInRadius(bx, by, 18, (en) => { const k = en.id + ':' + i; if ((ab.hitT[k] || 0) > GAME.t) return; ab.hitT[k] = GAME.t + 0.45; dealDamage(en, dmg, 'qi', 'klingensturm', { kb: 70, kx: en.x - p.x, ky: en.y - p.y, norm: true, quiet: true }); burstSparks(en.x, en.y - 10, 2, '#ff5a3a', 0.4); }); }
  if (Math.random() < 0.02) ab.hitT = {};
  ab.t = (ab.t || 0) - dt;
  if (L >= 5 && ab.t <= 0) { ab.t = cdOf(3); for (let i = 0; i < n; i++) shot(p.x, p.y, ab.a + i / n * TAU, 420, dmg * 2, 'qi', 'klingensturm', { col: '#ff5a3a', size: 10, pierce: 3, life: 0.6 }); }
  orbitFx(p, 'klingensturm', ab, '#ff5a3a', (g, q, A) => {
    const nn = 2 + (A.lvl >= 2 ? 1 : 0) + (A.lvl >= 4 ? 1 : 0);
    for (let i = 0; i < nn; i++) { const a = (A.a || 0) + i / nn * TAU, bx = q.x + Math.cos(a) * R, by = q.y - 14 + Math.sin(a) * R * 0.62;
      g.save(); g.translate(bx, by); g.rotate(a + Math.PI / 2 + GAME.t * 10);
      g.fillStyle = lg(g, -12, 0, 12, 0, [0, '#3a0a0a', 0.5, '#ff5a3a', 1, '#ffffff']); g.beginPath(); g.moveTo(-12, 0); g.lineTo(0, -3); g.lineTo(12, 0); g.lineTo(0, 3); g.closePath(); g.fill();
      for (let t = -8; t <= 8; t += 4) { g.beginPath(); g.moveTo(t, -2.5); g.lineTo(t + 1.5, -5.5); g.lineTo(t + 3, -2.5); g.fill(); }
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5; g.drawImage(glowSprite('#ff5a3a'), -16, -16, 32, 32); g.restore(); }
  });
}
function tickQireinigung(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  ab.t = cdOf(L >= 4 ? 3.0 : 4); const r = (L >= 3 ? 210 : 160) * p.st.area, dmg = 30 * (L >= 2 ? 1.35 : 1);
  const G = GAME; let w = 0; for (const s of G.eproj) { if (dist2(s.x, s.y, p.x, p.y) < r * r) { burstSparks(s.x, s.y, 3, '#9affe6', 0.5); continue; } G.eproj[w++] = s; } G.eproj.length = w;
  blast(p.x, p.y, r, dmg, 'qi', 'qireinigung', { col: '#9affe6', kb: 180, shake: 1 });
  healPlayer(L >= 4 ? 5 : 3); if (L >= 5) p.iframes = Math.max(p.iframes, 1);
}
function tickSchnitter(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  if (!nearestEnemy(p.x, p.y, 170)) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 2.6 : 3.5); const r = (L >= 3 ? 170 : 135) * p.st.area, dmg = 50 * (L >= 2 ? 1.35 : 1);
  const reap = (k) => { castAnim(GAME.p, 0, 0.3); arcSweep(GAME.p, rand(0, TAU), r, TAU, dmg * k, 'qi', 'schnitter', '#ff2a2a', { kb: 160, bleed: 5, sfx: 'whip' }); shake(3); };
  reap(1); if (L >= 5) GAME.later(0.25, () => reap(0.6));
}
Object.assign(TICKS, { kettenklingen: tickKettenklingen, qifaust: tickQifaust, qiwelle: tickQiwelle, klingensturm: tickKlingensturm, qireinigung: tickQireinigung, schnitter: tickSchnitter });
ULTS.schnitterernte = function (p) {
  sfx('ult'); shake(8); p.ultT = 5; castAnim(p, 0, 0.5);
  qiWave(p.x, p.y, 240 * p.st.area, 40, 'schnitterernte');
  for (let i = 0; i < 10; i++) GAME.later(0.3 + i * 0.45, () => { const q = GAME.p, tg = nearestEnemies(q.x, q.y, 300, 5); tg.forEach((en) => { tetherFx(en, 0.3, '#ff2a2a', 14); dealDamage(en, 30, 'qi', 'schnitterernte', { kb: -200, kx: en.x - q.x, ky: en.y - q.y, norm: true, bleed: 5 }); }); if (tg.length) sfx('chain', 0, 0.05); });
};
defineEvoHero('chris', {
  name: 'Chris', title: 'Der Rote Schnitter', school: 'qi', diff: 3,
  role: 'Qi-Meister · Kettenklingen · ohne Fähigkeit', dodgeCd: 2.0, dodge: 'slide',
  mech: { name: 'Qi-Stufen', desc: 'Chris hat keine Fähigkeit — nur Qi und seine gezahnten Kettenklingen. Im Lauf steigt er durch die Qi-Stufen: Stufe 2 bringt Qi außerhalb des Körpers, dann erwachen die Halbgott-Klingen, Stufe 3 reinigt fremde Energie, und am Ende ist er der Rote Schnitter. Jede Qi-Stufe regeneriert Leben (+0,5/s je Form).' },
  ult: { id: 'schnitterernte', name: 'Schnitterernte', cd: 18, desc: 'Qi-Explosion, dann reißen seine Ketten 5 s lang immer wieder bis zu 5 Gegner heran.' },
  strengths: ['Starke Reichweite durch Ketten', 'Regeneriert', 'Löscht Geschosse'], weaknesses: ['Anfangs wenig Fläche', 'Mittleres Leben', 'Braucht Qi-Stufen'],
  builds: [{ name: 'Kettenmeister', desc: 'Zahnkettenklinge + Klingensturm: alles heranziehen und zerschneiden.' }, { name: 'Reiner Kämpfer', desc: 'Qi-Faust + Qi-Welle + Qi-Reinigung: Kampfkunst pur.' }, { name: 'Schnitter', desc: 'Roter Schnitter + Klingensturm: rote Rundschnitte ohne Pause.' }],
  tiers: [
    { name: 'Qi-Stufe 1', txt: '', lv: 0, hp: 115, speed: 176, armor: 1, might: 1, slots: 2, col: '#4ff0cc', grants: ['kettenklingen'], unlocks: ['kettenklingen', 'qifaust'], desc: 'Qi im eigenen Körper, dazu die gezahnten Kettenklingen.' },
    { name: 'Qi-Stufe 2', txt: 'Stufe 8', lv: 8, hp: 135, speed: 182, armor: 1, might: 1.18, slots: 3, col: '#6affd8', grants: ['qiwelle'], unlocks: ['qiwelle'], desc: 'Qi verlässt den Körper und wird blitzschnell umgelenkt.' },
    { name: 'Halbgott-Klingen', txt: 'Stufe 15', lv: 15, hp: 160, speed: 188, armor: 2, might: 1.4, slots: 4, col: '#ff5a3a', grants: ['klingensturm'], unlocks: ['klingensturm'], desc: 'Die Klingen auf seinem Rücken erwachen und stärken ihn.' },
    { name: 'Qi-Stufe 3', txt: 'Stufe 23', lv: 23, hp: 185, speed: 194, armor: 2, might: 1.6, slots: 5, col: '#9affe6', grants: ['qireinigung'], unlocks: ['qireinigung'], desc: 'Er stößt fremde Energie einfach wieder aus.' },
    { name: 'Roter Schnitter', txt: 'Stufe 31 oder Hauptmann Kharn besiegen', lv: 31, ev: (G) => G.miniKilled, hp: 215, speed: 202, armor: 3, might: 1.85, slots: 6, col: '#ff2a2a', grants: ['schnitter'], unlocks: ['schnitter'], desc: 'Die Nummer eins — gefürchtet als Roter Schnitter.' }
  ],
  passives: ['eisenmeridiane'],
  tick(p, dt) { if (p.alive) healPlayer(0.5 * ((p.tier || 0) + 1) * dt, true); },
  art: { base: 'nyx', fn: drawNyx, spec: SPEC_NYX, h: 58, look: { flow: 0.2 }, pals: [
    { cloak: '#1a2a28', cloakL: '#3a5a54', cloakD: '#0a1210', scarf: '#1a6a5a', scarfL: '#4ff0cc', mask: '#d8d0c0', maskD: '#8a8474', steel: '#6a6a74', steelL: '#d8d8e8', eye: '#4ff0cc', rim: '#4ff0cc', wrap: '#2a3a38' },
    { cloak: '#1a2a28', cloakL: '#3a5a54', cloakD: '#0a1210', scarf: '#2a8a74', scarfL: '#6affd8', mask: '#d8d0c0', maskD: '#8a8474', steel: '#6a6a74', steelL: '#d8d8e8', eye: '#6affd8', rim: '#6affd8', wrap: '#2a3a38' },
    { cloak: '#2a1414', cloakL: '#5a2a2a', cloakD: '#120606', scarf: '#8a1a1a', scarfL: '#ff5a3a', mask: '#d8d0c0', maskD: '#8a8474', steel: '#8a4a3a', steelL: '#ffb09a', eye: '#ff5a3a', rim: '#ff5a3a', wrap: '#3a2020' },
    { cloak: '#e8ece8', cloakL: '#ffffff', cloakD: '#8a948e', scarf: '#2a8a74', scarfL: '#9affe6', mask: '#d8d0c0', maskD: '#8a8474', steel: '#6a6a74', steelL: '#d8d8e8', eye: '#9affe6', rim: '#9affe6', wrap: '#b8c0bc' },
    { cloak: '#200808', cloakL: '#5a1010', cloakD: '#0a0202', scarf: '#c01a1a', scarfL: '#ff2a2a', mask: '#e8e0d0', maskD: '#8a8474', steel: '#8a1a1a', steelL: '#ff8a7a', eye: '#ff2a2a', rim: '#ff2a2a', wrap: '#3a1010' }
  ] }
});

/* ============================================================ SIL SKALA */
Object.assign(CARDS, {
  telekinese: cardDef('Telekinese', 'shadow', ['Kontrolle', 'Wurf'], ['Sil hebt 2 Gegner an und schmettert sie zu Boden: 24 Schaden im Umkreis des Aufpralls.', '+1 Gegner.', '+35 % Schaden.', 'Abklingzeit 1,6 s.', 'Einschlag: der Aufprall explodiert in einer Druckwelle.']),
  feuerstoss: cardDef('Feuerstoß', 'none', ['Fernkampf', 'Explosion'], ['Ein Feuerball fliegt zum nächsten Gegner und explodiert: 22 Schaden.', '+35 % Schaden.', '+1 Feuerball.', 'Abklingzeit 1,2 s.', 'Brand: die Explosion hinterlässt brennenden Boden.']),
  eissplitter: cardDef('Eissplitter', 'none', ['Fernkampf', 'Streuung'], ['Ein Fächer aus 5 Eissplittern: je 10 Schaden, verlangsamt.', '+2 Splitter.', '+35 % Schaden.', 'Abklingzeit 1,0 s.', 'Treffer lassen kurz erstarren.']),
  erdspeer: cardDef('Erdspeer', 'none', ['Einschlag', 'Erde'], ['Ein riesiger Erdspeer bricht unter dem Gegner hervor: 45 Schaden, schleudert hoch.', '+1 Speer.', '+35 % Schaden.', 'Abklingzeit 1,8 s.', 'Speerwald: um jeden Speer brechen kleinere hervor.']),
  elementfusion: cardDef('Elementfusion', 'none', ['Fläche', 'Kombo'], ['Sil verbindet kopierte Kräfte: Feuer und Eis prallen auf die dichteste Gruppe — Dampfexplosion, 40 Schaden, betäubt.', '+35 % Schaden.', 'Größere Explosion.', 'Abklingzeit 3,0 s.', 'Dreifach: Erde schließt sich an, Stacheln im Kreis.']),
  metallkugeln: cardDef('Metallkugeln', 'none', ['Fernkampf', 'Durchbohrend'], ['Kopierte Metallkraft: 3 Stahlkugeln schießen durch die Reihen, je 18 Schaden.', '+2 Kugeln.', '+35 % Schaden.', 'Abklingzeit 1,1 s.', 'Kugeln kehren zurück und treffen erneut.'])
});
function tickTelekinese(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 260, 2 + (L >= 2 ? 1 : 0)).filter((e) => !e.boss); if (!tg.length) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 1.6 : 2.2); const dmg = 24 * (L >= 3 ? 1.35 : 1);
  castAnim(p, Math.atan2(tg[0].y - p.y, tg[0].x - p.x), 0.3); sfx('rift', 0, 0.08);
  tg.forEach((en) => { en.stunT = Math.max(en.stunT, 0.5);
    addEffect({ x: en.x, y: en.y, dur: 0.45, layer: 2, draw(g, e, k) { if (en.dead) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7; g.strokeStyle = '#c8a0ff'; g.lineWidth = 2; g.beginPath(); g.ellipse(en.x, en.y - 14 - Math.sin(k * Math.PI) * 30, en.r + 6, (en.r + 6) * 0.5, 0, 0, TAU); g.stroke(); g.restore(); } });
    GAME.later(0.45, () => { const x = en.x, y = en.y; blast(x, y, 55 * p.st.area, dmg, 'shadow', 'telekinese', { col: '#c8a0ff', kb: 160, stun: 0.3, shake: 2, decal: true, sfx: 'stomp' }); if (L >= 5) GAME.later(0.1, () => qiWave(x, y, 110, dmg * 0.5, 'telekinese')); }); });
}
function fireball(x, y, a, dmg, L) {
  shot(x, y, a, 380, dmg * 0.4, 'none', 'feuerstoss', { col: '#ff8a3a', shape: 'ball', size: 8, home: true, life: 1, onEnd: (fx, fy) => {
    blast(fx, fy, 55 * GAME.p.st.area, dmg, 'none', 'feuerstoss', { col: '#ffb040', kb: 120, shake: 1.5 }); burstSparks(fx, fy - 10, 10, '#ff6a1a', 1.2);
    if (L >= 5) { let tick = 0; addEffect({ x: fx, y: fy, dur: 2, layer: 0, update(e, dt) { tick -= dt; if (tick <= 0) { tick = 0.35; forEnemiesInRadius(fx, fy, 45, (en) => dealDamage(en, 5, 'none', 'feuerstoss', { quiet: true })); } if (Math.random() < 0.5) spawnPart({ x: fx + rand(-30, 30), y: fy + rand(-15, 15), z: 2, vx: 0, vy: 0, vz: rand(30, 60), g: -30, life: 0.5, size: 4, size1: 8, spr: glowSprite('#ff8a2a'), alpha: 0.8, alpha1: 0 }); addLight(fx, fy, 90, '#ff6a1a', 0.6); } }); }
  } });
}
function tickFeuerstoss(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 320, L >= 3 ? 2 : 1); if (!tg.length) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.2 : 1.6); const dmg = 22 * (L >= 2 ? 1.35 : 1);
  sfx('flame', 0, 0.06);
  tg.forEach((e) => { const a = Math.atan2(e.y - p.y, e.x - p.x); castAnim(p, a, 0.2); fireball(p.x, p.y - 4, a, dmg, L); });
}
function tickEissplitter(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 280); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.0 : 1.4); const n = 5 + (L >= 2 ? 2 : 0), dmg = 10 * (L >= 3 ? 1.35 : 1), a0 = Math.atan2(e.y - p.y, e.x - p.x);
  castAnim(p, a0, 0.2); sfx('whip', 0, 0.04);
  for (let i = 0; i < n; i++) shot(p.x, p.y - 4, a0 + (i / (n - 1) - 0.5) * 0.9, 440, dmg, 'none', 'eissplitter', { col: '#bfe8ff', size: 6, slow: true, freeze: L >= 5 ? 0.5 : 0, life: 0.6 });
}
function tickErdspeer(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const tg = nearestEnemies(p.x, p.y, 300, L >= 2 ? 2 : 1); if (!tg.length) { ab.t = 0.25; return; }
  ab.t = cdOf(L >= 4 ? 1.8 : 2.5); const dmg = 45 * (L >= 3 ? 1.35 : 1);
  tg.forEach((en, i) => { const x = en.x, y = en.y; fxTelegraphCircle(x, y, 30, 0.2, '#c8a070');
    GAME.later(0.2 + i * 0.1, () => { forEnemiesInRadius(x, y, 34, (o) => dealDamage(o, dmg, 'none', 'erdspeer', { kb: 120, kx: o.x - x, ky: o.y - y, norm: true, stun: 0.5 })); spikeFx(x, y, 14, '#a8845a', 80); sfx('stomp', 0, 0.1); shake(2);
      if (L >= 5) for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; GAME.later(0.08, () => { const sx = x + Math.cos(a) * 45, sy = y + Math.sin(a) * 30; forEnemiesInRadius(sx, sy, 24, (o) => dealDamage(o, dmg * 0.4, 'none', 'erdspeer', { quiet: true })); spikeFx(sx, sy, 10, '#a8845a', 40); }); } }); });
}
function tickElementfusion(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  let best = null, bs = -1; for (let k = 0; k < 8; k++) { const en = randomEnemyNear(p.x, p.y, 300); if (!en) break; let c = 0; forEnemiesInRadius(en.x, en.y, 90, () => c++); if (c > bs) { bs = c; best = en; } }
  if (!best) { ab.t = 0.3; return; }
  ab.t = cdOf(L >= 4 ? 3.0 : 4); const x = best.x, y = best.y, r = (L >= 3 ? 115 : 90) * p.st.area, dmg = 40 * (L >= 2 ? 1.35 : 1);
  castAnim(p, Math.atan2(y - p.y, x - p.x), 0.3);
  shot(p.x - 10, p.y, Math.atan2(y - p.y, x - p.x - 10), 460, 0, 'none', 'elementfusion', { col: '#ff8a3a', shape: 'ball', size: 7, life: Math.hypot(x - p.x, y - p.y) / 460 });
  shot(p.x + 10, p.y, Math.atan2(y - p.y, x - p.x + 10), 460, 0, 'none', 'elementfusion', { col: '#9ad8ff', shape: 'ball', size: 7, life: Math.hypot(x - p.x, y - p.y) / 460 });
  GAME.later(Math.hypot(x - p.x, y - p.y) / 460, () => { blast(x, y, r, dmg, 'none', 'elementfusion', { col: '#e8e8ff', stun: 0.6, kb: 240, sparks: 20, shake: 4, sfx: 'bigNova' }); for (let i = 0; i < 10; i++) spawnPart({ x: x + rand(-r * 0.5, r * 0.5), y: y + rand(-r * 0.3, r * 0.3), z: 4, vx: rand(-20, 20), vy: rand(-20, 20), vz: rand(40, 90), g: -20, drag: 1.5, life: 1.2, size: 10, size1: 26, spr: tinted('smoke', '#e8f0ff'), alpha: 0.6, alpha1: 0 });
    if (L >= 5) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; spikeFx(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.5, 14, '#a8845a', 40); forEnemiesInRadius(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.5, 26, (o) => dealDamage(o, dmg * 0.3, 'none', 'elementfusion', { quiet: true })); } });
}
function tickMetallkugeln(p, ab, dt) {
  ab.t -= dt; if (ab.t > 0) return; const L = ab.lvl;
  const e = nearestEnemy(p.x, p.y, 320); if (!e) { ab.t = 0.2; return; }
  ab.t = cdOf(L >= 4 ? 1.1 : 1.5); const n = 3 + (L >= 2 ? 2 : 0), dmg = 18 * (L >= 3 ? 1.35 : 1), a0 = Math.atan2(e.y - p.y, e.x - p.x);
  castAnim(p, a0, 0.2); sfx('chain', 0, 0.04);
  for (let i = 0; i < n; i++) GAME.later(i * 0.05, () => { const q = GAME.p, a = a0 + (i - (n - 1) / 2) * 0.12; shot(q.x, q.y - 4, a, 560, dmg, 'none', 'metallkugeln', { col: '#d8e0f0', shape: 'ball', size: 6, pierce: 3, life: 0.6, onEnd: L >= 5 ? (x, y) => shot(x, y, a + Math.PI, 560, dmg * 0.7, 'none', 'metallkugeln', { col: '#d8e0f0', shape: 'ball', size: 6, pierce: 3, life: 0.5 }) : null }); });
}
Object.assign(TICKS, { telekinese: tickTelekinese, feuerstoss: tickFeuerstoss, eissplitter: tickEissplitter, erdspeer: tickErdspeer, elementfusion: tickElementfusion, metallkugeln: tickMetallkugeln });
ULTS.elementarsturm = function (p) {
  sfx('ult'); shake(9); hitstop(0.06); castAnim(p, -Math.PI / 2, 0.7);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; GAME.later(i * 0.04, () => fireball(GAME.p.x, GAME.p.y - 4, a, 30, 5)); }
  GAME.later(0.3, () => blast(GAME.p.x, GAME.p.y, 200 * p.st.area, 30, 'none', 'elementarsturm', { col: '#bfe8ff', freeze: 1.5, kb: 0, sparks: 20 }));
  GAME.later(0.6, () => { const q = GAME.p; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, sx = q.x + Math.cos(a) * 150, sy = q.y + Math.sin(a) * 100; spikeFx(sx, sy, 18, '#a8845a', 70); forEnemiesInRadius(sx, sy, 40, (o) => dealDamage(o, 40, 'none', 'elementarsturm', { stun: 0.5 })); } shake(6); });
  GAME.later(0.9, () => { const q = GAME.p; for (let i = 0; i < 16; i++) shot(q.x, q.y - 4, i / 16 * TAU, 560, 20, 'none', 'elementarsturm', { col: '#d8e0f0', shape: 'ball', size: 6, pierce: 5, life: 0.7 }); });
};
defineEvoHero('sil', {
  name: 'Sil Skala', title: 'Der mit den vielen Kräften', school: 'none', diff: 3,
  role: 'Kopierte Kräfte · Feuer, Eis, Erde, Metall', dodgeCd: 2.4, dodge: 'shadowstep',
  mech: { name: 'Kopie', desc: 'Sil ist die kindliche dritte Persönlichkeit in Fabians Körper und kann kopierte Kräfte frei nutzen. Er beginnt nur mit Telekinese, hält im Lauf drei Kräfte zugleich (Feuer, Eis, Erde), verschmilzt sie später miteinander, trägt am Ende sechs Kräfte — und als Sil allein, ohne die anderen beiden im Körper, wirken all seine Fähigkeiten 20 % schneller. Sil schlägt nie Schwächere zuerst: er beginnt mit wenig Leben.' },
  ult: { id: 'elementarsturm', name: 'Elementarsturm', cd: 19, desc: 'Alle Kräfte auf einmal: ein Ring aus Feuerbällen, ein Eisring, der erstarren lässt, Erdspeere im Kreis und ein Sturm aus Stahlkugeln.' },
  strengths: ['Größte Vielfalt an Kräften', 'Starke Flächenkontrolle', 'Späte Form sehr schnell'], weaknesses: ['Wenig Leben am Anfang', 'Braucht viele Plätze', 'Anspruchsvoll'],
  builds: [{ name: 'Drei Kräfte', desc: 'Feuerstoß + Eissplitter + Erdspeer: für jede Lage das Richtige.' }, { name: 'Fusion', desc: 'Elementfusion + Telekinese: Gruppen zusammenwerfen und sprengen.' }, { name: 'Stahlsturm', desc: 'Metallkugeln + Eissplitter: durchbohrender Fernkampf.' }],
  tiers: [
    { name: 'Sil', txt: '', lv: 0, hp: 85, speed: 166, armor: 0, might: 1, slots: 2, col: '#c8a0ff', grants: ['telekinese'], unlocks: ['telekinese', 'feuerstoss'], desc: 'Nur eine kopierte Kraft: Telekinese.' },
    { name: 'Drei Kräfte', txt: 'Stufe 6', lv: 6, hp: 105, speed: 172, armor: 0, might: 1.15, slots: 3, col: '#ffb040', grants: ['feuerstoss'], unlocks: ['eissplitter', 'erdspeer'], desc: 'Feuer, Eis und Erde zugleich.' },
    { name: 'Verschmelzung', txt: 'Stufe 13', lv: 13, hp: 130, speed: 178, armor: 1, might: 1.35, slots: 4, col: '#e8e8ff', grants: ['elementfusion'], unlocks: ['elementfusion'], desc: 'Er verbindet Kräfte zu etwas Neuem.' },
    { name: 'Sechs Kräfte', txt: 'Stufe 21', lv: 21, hp: 155, speed: 184, armor: 1, might: 1.55, slots: 6, col: '#d8e0f0', grants: ['metallkugeln'], unlocks: ['metallkugeln'], desc: 'Sechs Kräfte gleichzeitig.' },
    { name: 'Sil allein', txt: 'Stufe 29 oder Hauptmann Kharn besiegen', lv: 29, ev: (G) => G.miniKilled, hp: 190, speed: 192, armor: 2, might: 1.85, slots: 6, col: '#ffffff', grants: [], unlocks: [], desc: 'Die anderen beiden haben ihren Platz aufgegeben: Sils volle Kraft. Alle Fähigkeiten 20 % schneller.' }
  ],
  passives: [],
  art: { base: 'vorian', fn: drawVorian, spec: SPEC_VORIAN, h: 66, look: { glow: 0, plain: true }, pals: [
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#2a2436', armorL: '#4a3a6a', armorD: '#0e0a16', red: '#3a2a6a', redL: '#c8a0ff', redD: '#140a2a', hair: '#e8cf7a', eye: '#c8a0ff', rim: '#c8a0ff' },
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#2a2436', armorL: '#4a3a6a', armorD: '#0e0a16', red: '#8a4a1a', redL: '#ffb040', redD: '#2a1406', hair: '#e8cf7a', eye: '#ffb040', rim: '#ffb040' },
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#262a3a', armorL: '#4a5270', armorD: '#0c0e16', red: '#6a6a9a', redL: '#e8e8ff', redD: '#20203a', hair: '#e8cf7a', eye: '#e8e8ff', rim: '#e8e8ff' },
    { skin: '#ecd8c8', skinD: '#a88878', armor: '#303640', armorL: '#6a7488', armorD: '#10141a', red: '#8a92a8', redL: '#d8e0f0', redD: '#2a2e3a', hair: '#e8cf7a', eye: '#d8e0f0', rim: '#d8e0f0' },
    { skin: '#f0e0d4', skinD: '#b09080', armor: '#e8e8f0', armorL: '#ffffff', armorD: '#8a8a98', red: '#c8a0ff', redL: '#ffffff', redD: '#6a4a9a', hair: '#f4e0a0', eye: '#ffffff', rim: '#ffffff' }
  ] }
});
// Sil allein: Faehigkeiten 20 % schneller
const _rcEvo = recomputeStats;
recomputeStats = function () { _rcEvo(); const p = GAME.p; if (p.hero === 'sil' && (p.tier || 0) >= 4) p.st.cd *= 0.8; };

/* ============================================================ Ultis der neuen Faehigkeiten */
Object.assign(ULTI, {
  erdstab: { name: 'Bergbrecher', cd: 4, desc: 'Alle 4 s ein Rundumschlag mit dem Stab, der einen Ring aus Erdstacheln aufwirft.', fx(p) { arcSweep(p, 0, 130 * p.st.area, TAU, 40, 'none', 'erdstab', '#c8a070', { kb: 220, stun: 0.5 }); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; spikeFx(p.x + Math.cos(a) * 110, p.y + Math.sin(a) * 75, 16, '#a8845a', 40); } } },
  erdstoss: { name: 'Erdbeben-Stern', cd: 5, desc: 'Alle 5 s brechen Erdstacheln in acht Richtungen aus.', fx(p) { radial(8, (a) => spikeLine(p.x, p.y, a, 260, 30, 'none', 'erdstoss', '#a8845a', { stun: 0.5 })); shake(5); } },
  ghulbiss: { name: 'Fressorgie', cd: 5, desc: 'Alle 5 s beißt Peter blitzschnell fünf Gegner nacheinander und heilt sich an jedem.', fx(p) { const tg = nearestEnemies(p.x, p.y, 220, 5); if (!tg.length) return false; tg.forEach((en, i) => GAME.later(i * 0.1, () => { if (en.dead) return; dealDamage(en, 45, 'blood', 'ghulbiss', { bleed: 5 }); healPlayer(3); burstBlood(en.x, en.y, 10, 1.2); })); } },
  wightfaust: { name: 'Titanenfaust', cd: 6, desc: 'Alle 6 s schlägt Peter auf den Boden: riesige Schockwelle, alles fliegt.', fx(p) { blast(p.x, p.y, 230 * p.st.area, 80, 'none', 'wightfaust', { col: '#e8e4d8', kb: 500, stun: 0.8, shake: 9, decal: true, sfx: 'stomp', w: 12 }); } },
  doppelklingen: { name: 'Klingentanz', cd: 4, desc: 'Alle 4 s ein Wirbel aus zwölf Klingenschnitten.', fx(p) { if (!nearestEnemy(p.x, p.y, 150)) return false; for (let i = 0; i < 12; i++) GAME.later(i * 0.04, () => arcSweep(GAME.p, i / 12 * TAU * 2, 110 * GAME.p.st.area, 1.4, 20, 'none', 'doppelklingen', '#ffffff', { bleed: 4, kb: 40 })); } },
  maske: { name: 'Tausend Gesichter', cd: 8, desc: 'Alle 8 s erscheinen sechs Maskendoppelgänger, die gleichzeitig explodieren.', fx(p) { radial(6, (a) => { const img = spawnAfterimage(p, 2.5, 'decoy'); img.x = p.x + Math.cos(a) * 110; img.y = p.y + Math.sin(a) * 75; GAME.later(2.5, () => blast(img.x, img.y, 90, 60, 'shadow', 'maske', { col: '#b8a0ff', kb: 260 })); }); } },
  kleinewights: { name: 'Wight-Heer', cd: 10, desc: 'Alle 10 s erheben sich sechs Wights auf einmal.', fx(p) { for (let i = 0; i < 6; i++) spawnMinion(p, { dur: 12, speed: 160, rate: 0.5, dmg: 14, school: 'none', src: 'kleinewights', col: '#d8d4c8', body: '#e8e4d8', eye: '#6aff8a' }); burstAsh(p.x, p.y, 20, '#8a8680'); } },
  eislanze: { name: 'Eishagel', cd: 3.5, desc: 'Alle 3,5 s regnen 12 Eisspeere auf die Gegner herab.', fx(p) { const tg = nearestEnemies(p.x, p.y, 360, 12); if (!tg.length) return false; tg.forEach((e, i) => GAME.later(i * 0.04, () => shot(GAME.p.x, GAME.p.y - 4, Math.atan2(e.y - GAME.p.y, e.x - GAME.p.x), 560, 22, 'none', 'eislanze', { col: '#9ad8ff', size: 9, pierce: 1, freeze: 0.6 }))); } },
  eissaeule: { name: 'Gletscher', cd: 6, desc: 'Alle 6 s ein Wald aus Eissäulen rings um Emma.', fx(p) { for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, x = p.x + Math.cos(a) * 140, y = p.y + Math.sin(a) * 95; GAME.later(k * 0.05, () => { blast(x, y, 60, 35, 'none', 'eissaeule', { col: '#bfe8ff', freeze: 1.5, kb: 30, shake: 0 }); spikeFx(x, y, 30, '#9ad8ff', 70); }); } shake(4); } },
  eisschwert: { name: 'Frostmondschnitt', cd: 4, desc: 'Alle 4 s ein riesiger Rundschnitt, der alles erstarren lässt.', fx(p) { arcSweep(p, 0, 160 * p.st.area, TAU, 45, 'none', 'eisschwert', '#bfe8ff', { freeze: 1.2, frozenBonus: 1.5, kb: 120 }); } },
  dhampirklinge: { name: 'Sonnenklinge', cd: 4, desc: 'Alle 4 s schießen acht gelbe Dhampirsicheln in alle Richtungen.', fx(p) { radial(8, (a) => shot(p.x, p.y, a, 480, 40, 'qi', 'dhampirklinge', { col: '#ffd84a', shape: 'crescent', size: 18, pierce: 99 })); } },
  frostkette: { name: 'Eisige Fessel', cd: 6, desc: 'Alle 6 s schnellen Ketten zu bis zu 12 Gegnern und frieren sie ein.', fx(p) { const tg = nearestEnemies(p.x, p.y, 300, 12); if (!tg.length) return false; tg.forEach((en) => { tetherFx(en, 0.4, '#bfe8ff', 12); dealDamage(en, 25, 'none', 'frostkette', { kb: -300, kx: en.x - p.x, ky: en.y - p.y, norm: true }); freezeEnemy(en, 1.8); }); } },
  drachenblick: { name: 'Drachenzorn', cd: 7, desc: 'Alle 7 s: alle Gegner im weiten Umkreis nehmen 5 s lang +60 % Schaden und brennen.', fx(p) { let n = 0; forEnemiesInRadius(p.x, p.y, 380, (en) => { n++; en.vulnT = GAME.t + 5; en.vulnM = 1.6; en.bleedT = 5; en.bleedDps = Math.max(en.bleedDps, 6); }); if (!n) return false; fxRing(p.x, p.y, 20, 380, 0.6, '#ffb020', 10); } },
  kettenklingen: { name: 'Kettengewitter', cd: 4, desc: 'Alle 4 s schnellen die Ketten zu acht Gegnern zugleich.', fx(p) { const tg = nearestEnemies(p.x, p.y, 320, 8); if (!tg.length) return false; tg.forEach((en) => { tetherFx(en, 0.3, '#ff3a3a', 14); dealDamage(en, 30, 'qi', 'kettenklingen', { kb: -220, kx: en.x - p.x, ky: en.y - p.y, norm: true, bleed: 5 }); }); sfx('chain'); } },
  qifaust: { name: 'Hundert Fäuste', cd: 4, desc: 'Alle 4 s eine Serie aus zehn Qi-Schlägen.', fx(p) { const e = nearestEnemy(p.x, p.y, 160); if (!e) return false; const a = Math.atan2(e.y - p.y, e.x - p.x); for (let i = 0; i < 10; i++) GAME.later(i * 0.05, () => palmStrike(GAME.p.x, GAME.p.y, a + rand(-0.4, 0.4), 150 * GAME.p.st.area, 40, 24, 'qifaust', { kbMul: 0.5 })); } },
  qiwelle: { name: 'Qi-Flut', cd: 5, desc: 'Alle 5 s drei riesige Qi-Wellen nacheinander.', fx(p) { for (let i = 0; i < 3; i++) GAME.later(i * 0.25, () => qiWave(GAME.p.x, GAME.p.y, (180 + i * 50) * GAME.p.st.area, 35, 'qiwelle')); } },
  klingensturm: { name: 'Klingenorkan', cd: 4, desc: 'Alle 4 s schnellen zwölf Klingen aus dem Sturm heraus.', fx(p) { radial(12, (a) => shot(p.x, p.y, a, 460, 30, 'qi', 'klingensturm', { col: '#ff5a3a', size: 10, pierce: 5, life: 0.7 })); } },
  qireinigung: { name: 'Reines Qi', cd: 6, desc: 'Alle 6 s: alle feindlichen Geschosse verschwinden, Chris heilt 10 % und ist 2 s unverwundbar.', fx(p) { GAME.eproj.length = 0; healPlayer(p.st.maxHp * 0.1); p.iframes = Math.max(p.iframes, 2); blast(p.x, p.y, 260 * p.st.area, 45, 'qi', 'qireinigung', { col: '#ffffff', kb: 260 }); } },
  schnitter: { name: 'Blutmond-Ernte', cd: 5, desc: 'Alle 5 s drei rote Rundschnitte hintereinander.', fx(p) { if (!nearestEnemy(p.x, p.y, 200)) return false; for (let i = 0; i < 3; i++) GAME.later(i * 0.2, () => arcSweep(GAME.p, rand(0, TAU), (180 + i * 30) * GAME.p.st.area, TAU, 50, 'qi', 'schnitter', '#ff2a2a', { bleed: 6, kb: 150 })); } },
  telekinese: { name: 'Schwerkraftbruch', cd: 6, desc: 'Alle 6 s hebt Sil alle Gegner ringsum hoch und schmettert sie zusammen.', fx(p) { const tg = nearestEnemies(p.x, p.y, 240, 20).filter((e) => !e.boss); if (!tg.length) return false; tg.forEach((en) => { en.stunT = Math.max(en.stunT, 0.8); en.kvx += (p.x - en.x) * 3; en.kvy += (p.y - en.y) * 3; }); GAME.later(0.5, () => blast(GAME.p.x, GAME.p.y, 150, 55, 'shadow', 'telekinese', { col: '#c8a0ff', kb: 300, shake: 6, decal: true })); } },
  feuerstoss: { name: 'Feuersturm', cd: 4, desc: 'Alle 4 s acht Feuerbälle in alle Richtungen.', fx(p) { radial(8, (a) => fireball(p.x, p.y - 4, a, 28, 5)); } },
  eissplitter: { name: 'Diamantstaub', cd: 3.5, desc: 'Alle 3,5 s ein Ring aus 24 Eissplittern, die erstarren lassen.', fx(p) { radial(24, (a) => shot(p.x, p.y - 4, a, 440, 14, 'none', 'eissplitter', { col: '#bfe8ff', size: 6, freeze: 0.6, life: 0.7 })); } },
  erdspeer: { name: 'Speerwald', cd: 5, desc: 'Alle 5 s brechen unter bis zu acht Gegnern riesige Erdspeere hervor.', fx(p) { const tg = nearestEnemies(p.x, p.y, 320, 8); if (!tg.length) return false; tg.forEach((en, i) => GAME.later(i * 0.05, () => { forEnemiesInRadius(en.x, en.y, 36, (o) => dealDamage(o, 60, 'none', 'erdspeer', { stun: 0.6 })); spikeFx(en.x, en.y, 16, '#a8845a', 90); })); shake(5); } },
  elementfusion: { name: 'Urknall', cd: 7, desc: 'Alle 7 s eine gewaltige Explosion aller Elemente um Sil.', fx(p) { blast(p.x, p.y, 260 * p.st.area, 90, 'none', 'elementfusion', { col: '#ffffff', stun: 0.8, kb: 360, shake: 10, sfx: 'bigNova', w: 14, sparks: 30 }); } },
  metallkugeln: { name: 'Stahlgewitter', cd: 4, desc: 'Alle 4 s ein Ring aus 20 durchbohrenden Stahlkugeln.', fx(p) { radial(20, (a) => shot(p.x, p.y - 4, a, 560, 24, 'none', 'metallkugeln', { col: '#d8e0f0', shape: 'ball', size: 6, pierce: 6, life: 0.7 })); } }
});

/* ============================================================ Symbole */
Object.assign(ICON_EXTRA, {
  erdstab(g, glow) { glow('#c8a070', 24); g.rotate(-0.7); g.fillStyle = lg(g, -4, -40, 4, 40, [0, '#c8a070', 1, '#5a4020']); g.fillRect(-4, -40, 8, 80); },
  erdstoss(g, glow) { glow('#c8a070', 24); for (let i = 0; i < 4; i++) { const x = -30 + i * 18, h = 20 + i * 8; g.fillStyle = lg(g, x, 30 - h, x, 30, [0, '#e8d0a0', 1, '#5a4020']); g.beginPath(); g.moveTo(x - 7, 30); g.lineTo(x, 30 - h); g.lineTo(x + 7, 30); g.fill(); } },
  ghulbiss(g, glow) { glow('#9aff9a', 28); g.fillStyle = '#2a0a0a'; g.beginPath(); g.ellipse(0, 4, 30, 18, 0, 0, TAU); g.fill(); g.fillStyle = '#f0f0e0'; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-25 + i * 10, -10); g.lineTo(-20 + i * 10, 4); g.lineTo(-15 + i * 10, -10); g.fill(); g.beginPath(); g.moveTo(-25 + i * 10, 18); g.lineTo(-20 + i * 10, 6); g.lineTo(-15 + i * 10, 18); g.fill(); } },
  wightfaust(g, glow) { glow('#e8e4d8', 32); g.fillStyle = '#e8e4d8'; g.beginPath(); g.ellipse(0, 0, 20, 16, 0, 0, TAU); g.fill(); g.strokeStyle = '#6a6660'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-10 + i * 8, -12); g.lineTo(-10 + i * 8, 4); g.stroke(); } },
  doppelklingen(g, glow) { glow('#d8e0e8', 24); for (const s of [-1, 1]) { g.save(); g.rotate(s * 0.6); g.fillStyle = lg(g, 0, -40, 0, 20, [0, '#ffffff', 1, '#6a7a88']); g.beginPath(); g.moveTo(-3, 20); g.lineTo(0, -40); g.lineTo(3, 20); g.fill(); g.restore(); } },
  maske(g, glow) { glow('#b8a0ff', 30); g.fillStyle = '#e8e4f0'; g.beginPath(); g.ellipse(0, 0, 24, 30, 0, 0, TAU); g.fill(); g.fillStyle = '#1a1024'; g.beginPath(); g.ellipse(-9, -4, 6, 4, -0.2, 0, TAU); g.ellipse(9, -4, 6, 4, 0.2, 0, TAU); g.fill(); g.strokeStyle = '#1a1024'; g.lineWidth = 2; g.beginPath(); g.arc(0, 12, 8, 0.2, Math.PI - 0.2); g.stroke(); },
  kleinewights(g, glow) { glow('#6aff8a', 26); g.fillStyle = '#e8e4d8'; for (const [x, s] of [[-18, 0.8], [0, 1], [18, 0.8]]) { g.beginPath(); g.arc(x, -10 * s, 7 * s, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x, 12 * s, 8 * s, 14 * s, 0, 0, TAU); g.fill(); } },
  eislanze(g, glow) { glow('#9ad8ff', 26); for (let i = -1; i <= 1; i++) { g.save(); g.rotate(-0.7 + i * 0.25); g.fillStyle = lg(g, 0, -40, 0, 20, [0, '#ffffff', 1, '#4a8ac8']); g.beginPath(); g.moveTo(-4, 26); g.lineTo(0, -40); g.lineTo(4, 26); g.fill(); g.restore(); } },
  eissaeule(g, glow) { glow('#bfe8ff', 30); g.fillStyle = lg(g, 0, -40, 0, 36, [0, '#ffffff', 1, '#4a8ac8']); g.beginPath(); g.moveTo(-18, 36); g.lineTo(-10, -30); g.lineTo(0, -42); g.lineTo(12, -28); g.lineTo(18, 36); g.fill(); },
  eisschwert(g, glow) { glow('#bfe8ff', 26); g.rotate(-0.8); g.fillStyle = lg(g, 0, -44, 0, 20, [0, '#ffffff', 1, '#6a9ac8']); g.beginPath(); g.moveTo(-5, 20); g.lineTo(0, -44); g.lineTo(5, 20); g.fill(); g.fillStyle = '#c9a24c'; g.fillRect(-12, 20, 24, 4); g.fillRect(-2, 24, 4, 14); },
  dhampirklinge(g, glow) { glow('#ffd84a', 34); g.strokeStyle = '#ffd84a'; g.lineWidth = 8; g.beginPath(); g.arc(-10, 0, 32, -1.1, 1.1); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke(); },
  frostkette(g, glow) { glow('#bfe8ff', 24); g.strokeStyle = '#bfe8ff'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(-30 + i * 12, 20 - i * 9, 7, 4, -0.6, 0, TAU); g.stroke(); } },
  drachenblick(g, glow) { glow('#ffb020', 34); g.fillStyle = '#ffb020'; g.beginPath(); g.ellipse(0, 0, 34, 18, 0, 0, TAU); g.fill(); g.fillStyle = '#1a0a00'; g.beginPath(); g.ellipse(0, 0, 5, 16, 0, 0, TAU); g.fill(); },
  kettenklingen(g, glow) { glow('#ff3a3a', 26); g.strokeStyle = '#8a8a94'; g.lineWidth = 3; g.beginPath(); g.moveTo(-34, 30); g.quadraticCurveTo(-10, -10, 26, -24); g.stroke(); g.fillStyle = '#ff5a3a'; for (let i = 0; i < 6; i++) { const x = -30 + i * 10, y = 24 - i * 9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 7); g.lineTo(x + 6, y); g.fill(); } },
  qifaust(g, glow) { glow('#4ff0cc', 34); g.drawImage(ASPR.palm, -40, -30, 80, 64); },
  qiwelle(g, glow) { glow('#4ff0cc', 30); g.strokeStyle = '#9affe6'; for (let i = 1; i <= 3; i++) { g.lineWidth = 5 - i; g.beginPath(); g.ellipse(0, 0, i * 12, i * 8, 0, 0, TAU); g.stroke(); } },
  klingensturm(g, glow) { glow('#ff5a3a', 30); for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * TAU / 4); g.translate(0, -24); g.fillStyle = '#ff5a3a'; g.beginPath(); g.moveTo(-12, 0); g.lineTo(0, -4); g.lineTo(12, 0); g.lineTo(0, 4); g.fill(); g.restore(); } },
  qireinigung(g, glow) { glow('#9affe6', 38); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.moveTo(0, -12); g.lineTo(0, 12); g.stroke(); },
  schnitter(g, glow) { glow('#ff2a2a', 36); g.strokeStyle = '#ff2a2a'; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 28, 0.3, TAU - 0.3); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.5; g.stroke(); },
  telekinese(g, glow) { glow('#c8a0ff', 30); g.fillStyle = '#6a5a7a'; g.beginPath(); g.arc(0, -8, 12, 0, TAU); g.fill(); g.strokeStyle = '#c8a0ff'; g.lineWidth = 2.5; for (let i = 1; i <= 2; i++) { g.beginPath(); g.ellipse(0, 18, 10 + i * 8, 4 + i * 2, 0, 0, TAU); g.stroke(); } },
  feuerstoss(g, glow) { glow('#ff8a3a', 36); g.fillStyle = rg(g, 0, 0, 2, 22, [0, '#ffffff', 0.4, '#ffb040', 1, '#c02a0a']); g.beginPath(); g.arc(0, 0, 22, 0, TAU); g.fill(); },
  eissplitter(g, glow) { glow('#bfe8ff', 26); for (let i = -2; i <= 2; i++) { g.save(); g.rotate(-Math.PI / 2 + i * 0.3); g.fillStyle = '#bfe8ff'; g.beginPath(); g.moveTo(8, -3); g.lineTo(38, 0); g.lineTo(8, 3); g.fill(); g.restore(); } },
  erdspeer(g, glow) { glow('#c8a070', 26); g.fillStyle = lg(g, 0, -44, 0, 36, [0, '#e8d0a0', 1, '#5a4020']); g.beginPath(); g.moveTo(-12, 36); g.lineTo(0, -44); g.lineTo(12, 36); g.fill(); },
  elementfusion(g, glow) { glow('#ff8a3a', 20); g.save(); g.translate(-12, 0); glow('#ff8a3a', 20); g.restore(); g.save(); g.translate(12, 0); glow('#9ad8ff', 20); g.restore(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fill(); },
  metallkugeln(g, glow) { glow('#d8e0f0', 20); for (const [x, y] of [[-16, 10], [0, -8], [16, 10]]) { g.fillStyle = rg(g, x - 3, y - 3, 1, 10, [0, '#ffffff', 1, '#5a6270']); g.beginPath(); g.arc(x, y, 10, 0, TAU); g.fill(); } },
  ghulrausch(g, glow) { ICON_EXTRA.ghulbiss(g, glow); },
  eisgrab(g, glow) { ICON_EXTRA.eissaeule(g, glow); },
  schnitterernte(g, glow) { ICON_EXTRA.schnitter(g, glow); },
  elementarsturm(g, glow) { ICON_EXTRA.elementfusion(g, glow); }
});
Object.assign(SRC_NAMES, Object.fromEntries(Object.keys(CARDS).map((k) => [k, SRC_NAMES[k] || CARDS[k].name])), { ghulrausch: 'Ghulrausch', eisgrab: 'Eisgrab', schnitterernte: 'Schnitterernte', elementarsturm: 'Elementarsturm' });
for (const k of Object.keys(CARDS)) if (!ABILITY_SCHOOL[k] && CARDS[k].kind === 'ability') ABILITY_SCHOOL[k] = CARDS[k].school;
