'use strict';
/* ==========================================================================
   BLUTMOND — Vampir Tower Defense
   Ein Spiel fuer den Hochformat-Touchscreen. Alles wird auf ein virtuelles
   720x1280-Feld gezeichnet und anschliessend passend skaliert.
   ========================================================================== */

/* ---------------------------------------------------------------- Konstanten */
const VW = 720, VH = 1280;
const HUD_H = 150;
const FIELD_Y = 150, TILE = 80, COLS = 9, ROWS = 12;
const FIELD_H = TILE * ROWS;              // 960
const PANEL_Y = FIELD_Y + FIELD_H;        // 1110
const PANEL_H = VH - PANEL_Y;             // 170

const SCHOOLS = {
  blood:  { name: 'Blut',     col: '#e0304f', dim: '#6d1226', glow: '#ff5c7a', sign: '🩸' },
  shadow: { name: 'Schatten', col: '#9b6bff', dim: '#2f1d5c', glow: '#c7a6ff', sign: '🌑' },
  qi:     { name: 'Qi',       col: '#2fe3bd', dim: '#0d4d43', glow: '#8affe0', sign: '☯' }
};

/* ------------------------------------------------------------------- Karten */
const MAPS = [
  { name: 'Friedhof von Varna',  theme: 'grave',  goal: 20, unlockAt: 0,
    path: [[-1,1],[6,1],[6,4],[2,4],[2,7],[7,7],[7,10],[4,10],[4,11]] },
  { name: 'Kathedrale im Nebel', theme: 'church', goal: 25, unlockAt: 1,
    path: [[4,-1],[4,2],[1,2],[1,6],[7,6],[7,9],[3,9],[3,11]] },
  { name: 'Bergkloster Qi-Lin',  theme: 'mount',  goal: 30, unlockAt: 2,
    path: [[-1,2],[3,2],[3,0],[6,0],[6,5],[1,5],[1,8],[5,8],[5,11]] }
];

/* ------------------------------------------------------------------- Türme */
const TOWERS = {
  dorn: {
    name: 'Blutdorn', short: 'Blutdorn', school: 'blood', cost: 60, dmg: 15, rate: 0.85, range: 158,
    kind: 'shot', drain: 0.12,
    desc: 'Verschießt Knochendornen und saugt bei jedem Treffer etwas Blut ab.'
  },
  altar: {
    name: 'Aderlass-Altar', short: 'Altar', school: 'blood', cost: 120, dmg: 7, rate: 1.15, range: 132,
    kind: 'aura', bleed: 9,
    desc: 'Lässt Gegner in der Nähe ausbluten — Schaden über Zeit, ignoriert Rüstung.'
  },
  klinge: {
    name: 'Schattenklinge', short: 'Klinge', school: 'shadow', cost: 90, dmg: 10, rate: 0.34, range: 138,
    kind: 'shot', crit: 0.18,
    desc: 'Sehr schnelle Schattenhiebe mit hoher Kritischer-Treffer-Chance.'
  },
  nebel: {
    name: 'Nebelgrube', short: 'Nebel', school: 'shadow', cost: 95, dmg: 4, rate: 0.9, range: 142,
    kind: 'aura', slow: 0.38,
    desc: 'Zäher Nebel verlangsamt alle Feinde im Umkreis deutlich.'
  },
  stele: {
    name: 'Qi-Stele', short: 'Qi-Stele', school: 'qi', cost: 140, dmg: 26, rate: 1.55, range: 150,
    kind: 'pulse',
    desc: 'Entlädt eine Druckwelle: trifft alles im Umkreis gleichzeitig.'
  },
  meridian: {
    name: 'Meridian-Tor', short: 'Meridian', school: 'qi', cost: 165, dmg: 0, rate: 1, range: 178,
    kind: 'buff', buffDmg: 0.28, buffRate: 0.14,
    desc: 'Kein eigener Schaden — verstärkt dafür alle Türme in Reichweite.'
  }
};
const TOWER_ORDER = ['dorn', 'altar', 'klinge', 'nebel', 'stele', 'meridian'];

function towerStats(key, lvl, run) {
  const b = TOWERS[key];
  const s = Math.pow(1.46, lvl - 1);
  const st = {
    dmg:   b.dmg * s,
    rate:  b.rate * Math.pow(0.93, lvl - 1),
    range: b.range * Math.pow(1.07, lvl - 1),
    bleed: (b.bleed || 0) * s,
    slow:  b.slow ? Math.min(0.72, b.slow + (lvl - 1) * 0.06) : 0,
    crit:  (b.crit || 0),
    buffDmg:  (b.buffDmg || 0) * (1 + (lvl - 1) * 0.3),
    buffRate: (b.buffRate || 0) * (1 + (lvl - 1) * 0.3)
  };
  if (run) {
    st.dmg   *= run.mul.dmg * run.mul.school[b.school];
    st.bleed *= run.mul.dmg * run.mul.school[b.school];
    st.range *= run.mul.range;
    st.rate  /= run.mul.rate;
    st.crit  += run.mul.crit;
  }
  return st;
}
function upgradeCost(key, lvl) { return Math.round(TOWERS[key].cost * 0.85 * Math.pow(1.75, lvl - 1)); }
const MAX_LVL = 4;

/* ------------------------------------------------------------------ Gegner */
const ENEMIES = {
  landvolk: { name: 'Landvolk', hp: 40, spd: 52, gold: 9, xp: 4, r: 15, armor: 0,
              res: { blood: 1, shadow: 1, qi: 1 }, c1: '#c2a883', c2: '#7a6247' },
  jaeger:   { name: 'Vampirjäger', hp: 58, spd: 80, gold: 12, xp: 6, r: 15, armor: 1,
              res: { blood: 0.8, shadow: 1.15, qi: 1 }, c1: '#8fc6dd', c2: '#3f6d80' },
  priester: { name: 'Priester', hp: 95, spd: 46, gold: 18, xp: 10, r: 17, armor: 2,
              res: { blood: 0.5, shadow: 1, qi: 1.25 }, c1: '#f3e6c4', c2: '#b39a55', aura: 'heal' },
  ritter:   { name: 'Ordensritter', hp: 175, spd: 42, gold: 21, xp: 12, r: 19, armor: 8,
              res: { blood: 0.8, shadow: 0.8, qi: 1.45 }, c1: '#b7becb', c2: '#5d6675' },
  geist:    { name: 'Weihgeist', hp: 78, spd: 74, gold: 16, xp: 9, r: 16, armor: 0,
              res: { blood: 1.35, shadow: 0.45, qi: 1.1 }, c1: '#dff3ff', c2: '#6f9fc0', ghost: true },
  werwolf:  { name: 'Werwolf', hp: 260, spd: 96, gold: 28, xp: 16, r: 20, armor: 3,
              res: { blood: 1.2, shadow: 0.7, qi: 1 }, c1: '#8a6b4e', c2: '#4b382a', rage: true },
  inquisitor:{ name: 'Inquisitor', hp: 1100, spd: 36, gold: 130, xp: 80, r: 27, armor: 12, boss: true,
              res: { blood: 0.7, shadow: 0.85, qi: 0.9 }, c1: '#e7d7b6', c2: '#8d2230', aura: 'heal' }
};

/* Welche Gegner ab welcher Welle auftauchen duerfen (Kosten = Wellenbudget) */
const POOL = [
  { k: 'landvolk',  from: 1,  cost: 1 },
  { k: 'jaeger',    from: 2,  cost: 1.5 },
  { k: 'priester',  from: 4,  cost: 2.6 },
  { k: 'ritter',    from: 6,  cost: 3.4 },
  { k: 'geist',     from: 8,  cost: 2.4 },
  { k: 'werwolf',   from: 11, cost: 4.6 }
];

function waveScale(w) { return 1 + 0.185 * (w - 1) + 0.0135 * (w - 1) * (w - 1); }

function buildWave(w) {
  const list = [];
  let budget = 3 + w * 1.85 + Math.pow(w, 1.35) * 0.35;
  const avail = POOL.filter((p) => w >= p.from);
  // Boss alle 5 Wellen
  if (w % 5 === 0) {
    const n = 1 + Math.floor(w / 15);
    for (let i = 0; i < n; i++) list.push({ k: 'inquisitor', delay: 0.6 + i * 2.2 });
    budget *= 0.55;
  }
  let t = 0;
  let guard = 0;
  while (budget > 0 && guard++ < 400) {
    const p = avail[Math.floor(Math.random() * avail.length)];
    if (p.cost > budget && p.k !== 'landvolk' && budget < 1) break;
    budget -= p.cost;
    list.push({ k: p.k, delay: t });
    t += Math.max(0.28, 0.95 - w * 0.022);
  }
  list.sort((a, b) => a.delay - b.delay);
  return list;
}

/* -------------------------------------------------- Fähigkeiten des Fuersten */
const ABILITIES = {
  blutregen: {
    name: 'Blutregen', short: 'Blutregen', school: 'blood', cd: 44, node: 'b4',
    desc: 'Blutiger Regen schädigt alle Feinde und heilt deine Burg.'
  },
  schattennebel: {
    name: 'Schattennebel', short: 'Nebel', school: 'shadow', cd: 38, node: 's4',
    desc: 'Verlangsamt jeden Feind auf dem Feld für 7 Sekunden massiv.'
  },
  qiwelle: {
    name: 'Qi-Welle', short: 'Qi-Welle', school: 'qi', cd: 56, node: 'q4',
    desc: 'Eine Schockwelle betäubt alle Feinde und richtet schweren Schaden an.'
  }
};
const ABILITY_ORDER = ['blutregen', 'schattennebel', 'qiwelle'];

/* --------------------------------------------- Gaben beim Stufenaufstieg (Run) */
const BOONS = [
  { id: 'bl1', s: 'blood',  n: 'Blutdurst',      d: '+20% Schaden aller Blut-Türme',      f: (r) => r.mul.school.blood *= 1.2 },
  { id: 'sh1', s: 'shadow', n: 'Nachtschnitt',   d: '+20% Schaden aller Schatten-Türme',  f: (r) => r.mul.school.shadow *= 1.2 },
  { id: 'qi1', s: 'qi',     n: 'Qi-Fluss',       d: '+20% Schaden aller Qi-Türme',        f: (r) => r.mul.school.qi *= 1.2 },
  { id: 'a1',  s: 'shadow', n: 'Weitblick',      d: '+12% Reichweite aller Türme',        f: (r) => r.mul.range *= 1.12 },
  { id: 'a2',  s: 'qi',     n: 'Hast',           d: '+12% Angriffstempo aller Türme',     f: (r) => r.mul.rate *= 1.12 },
  { id: 'a3',  s: 'blood',  n: 'Reichtum',       d: '+25% Blut aus getöteten Feinden',    f: (r) => r.mul.gold *= 1.25 },
  { id: 'a4',  s: 'blood',  n: 'Aderlass',       d: 'Sofort +300 Blut',                    f: (r) => r.gold += 300 },
  { id: 'a5',  s: 'blood',  n: 'Nachtmahl',      d: '+25 Burgleben und volle Heilung',     f: (r) => { r.maxLives += 25; r.lives = r.maxLives; } },
  { id: 'a6',  s: 'shadow', n: 'Meuchelmord',    d: '+12% Kritchance, +40% Kritschaden',   f: (r) => { r.mul.crit += 0.12; r.mul.critDmg += 0.4; } },
  { id: 'a7',  s: 'qi',     n: 'Durchschlag',    d: 'Angriffe ignorieren 8 Rüstung',      f: (r) => r.mul.pierce += 8 },
  { id: 'a8',  s: 'shadow', n: 'Klebeschatten',  d: 'Jeder Treffer verlangsamt um 12%',    f: (r) => r.mul.hitSlow += 0.12 },
  { id: 'a9',  s: 'qi',     n: 'Kühler Kopf',   d: 'Fähigkeiten laden 25% schneller',    f: (r) => r.mul.cd *= 0.75 },
  { id: 'a10', s: 'shadow', n: 'Seelendieb',     d: '+20% Erfahrung',                      f: (r) => r.mul.xp *= 1.2 },
  { id: 'a11', s: 'qi',     n: 'Eisenherz',      d: '+45 Burgleben',                       f: (r) => { r.maxLives += 45; r.lives += 45; } },
  { id: 'a12', s: 'blood',  n: 'Blutmond',       d: '+12% Schaden auf ALLES',              f: (r) => r.mul.dmg *= 1.12 },
  { id: 'a13', s: 'blood',  n: 'Zweiter Biss',   d: '18% Chance auf doppelten Schaden',    f: (r) => r.mul.dbl += 0.18 },
  { id: 'a14', s: 'qi',     n: 'Ruhiger Atem',   d: '+10% Reichweite und +8% Tempo',       f: (r) => { r.mul.range *= 1.1; r.mul.rate *= 1.08; } }
];

/* ------------------------------------------------- Dauerhafter Fähigkeitsbaum */
const TREE = [
  /* Blut */
  { id: 'b1', br: 0, row: 0, cost: 0,  n: 'Blutdorn',        d: 'Schaltet den Turm „Blutdorn" frei.',        req: [],     unlock: 'dorn' },
  { id: 'b2', br: 0, row: 1, cost: 3,  n: 'Dicker Saft',     d: '+12% Schaden aller Blut-Türme.',           req: ['b1'] },
  { id: 'b3', br: 0, row: 2, cost: 7,  n: 'Aderlass-Altar',  d: 'Schaltet den Turm „Aderlass-Altar" frei.',  req: ['b2'], unlock: 'altar' },
  { id: 'b4', br: 0, row: 3, cost: 10, n: 'Blutregen',       d: 'Schaltet die Fähigkeit „Blutregen" frei.', req: ['b3'] },
  { id: 'b5', br: 0, row: 4, cost: 9,  n: 'Lebensquell',     d: '+25 Burgleben in jedem Kampf.',             req: ['b3'] },
  { id: 'b6', br: 0, row: 5, cost: 14, n: 'Blutrausch',      d: '+10% Angriffstempo aller Türme.',          req: ['b4', 'b5'] },
  { id: 'b7', br: 0, row: 6, cost: 22, n: 'Karmesinfürst',  d: '+30% Schaden aller Blut-Türme.',           req: ['b6'] },
  /* Schatten */
  { id: 's1', br: 1, row: 0, cost: 4,  n: 'Schattenklinge',  d: 'Schaltet den Turm „Schattenklinge" frei.',  req: [],     unlock: 'klinge' },
  { id: 's2', br: 1, row: 1, cost: 5,  n: 'Nachtsicht',      d: '+10% Reichweite aller Türme.',             req: ['s1'] },
  { id: 's3', br: 1, row: 2, cost: 8,  n: 'Nebelgrube',      d: 'Schaltet den Turm „Nebelgrube" frei.',      req: ['s2'], unlock: 'nebel' },
  { id: 's4', br: 1, row: 3, cost: 11, n: 'Schattennebel',   d: 'Schaltet die Fähigkeit „Schattennebel" frei.', req: ['s3'] },
  { id: 's5', br: 1, row: 4, cost: 10, n: 'Leises Messer',   d: '+10% Kritchance aller Türme.',             req: ['s3'] },
  { id: 's6', br: 1, row: 5, cost: 13, n: 'Schattenkasse',   d: '+18% Blut aus getöteten Feinden.',         req: ['s4', 's5'] },
  { id: 's7', br: 1, row: 6, cost: 22, n: 'Ewige Nacht',     d: '+30% Schaden aller Schatten-Türme.',       req: ['s6'] },
  /* Qi */
  { id: 'q1', br: 2, row: 0, cost: 6,  n: 'Qi-Stele',        d: 'Schaltet den Turm „Qi-Stele" frei.',        req: [],     unlock: 'stele' },
  { id: 'q2', br: 2, row: 1, cost: 5,  n: 'Innere Mitte',    d: '+80 Startblut in jedem Kampf.',             req: ['q1'] },
  { id: 'q3', br: 2, row: 2, cost: 9,  n: 'Meridian-Tor',    d: 'Schaltet den Turm „Meridian-Tor" frei.',    req: ['q2'], unlock: 'meridian' },
  { id: 'q4', br: 2, row: 3, cost: 12, n: 'Qi-Welle',        d: 'Schaltet die Fähigkeit „Qi-Welle" frei.',  req: ['q3'] },
  { id: 'q5', br: 2, row: 4, cost: 9,  n: 'Erleuchtung',     d: '+20% Erfahrung im Kampf.',                  req: ['q3'] },
  { id: 'q6', br: 2, row: 5, cost: 13, n: 'Seelenfänger',   d: '+25% Seelen nach jedem Kampf.',             req: ['q4', 'q5'] },
  { id: 'q7', br: 2, row: 6, cost: 22, n: 'Drachenodem',     d: '+30% Schaden aller Qi-Türme.',             req: ['q6'] }
];
const BRANCH_KEY = ['blood', 'shadow', 'qi'];

/* --------------------------------------------------------- Speicherstand */
const SAVE_KEY = 'blutmond.save.v1';
let meta = null;

function freshMeta() {
  return { souls: 0, earned: 0, nodes: ['b1'], best: [0, 0, 0], won: [0, 0, 0], kills: 0, runs: 0, sound: true };
}
function loadMeta() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshMeta();
    const m = Object.assign(freshMeta(), JSON.parse(raw));
    if (!Array.isArray(m.nodes) || !m.nodes.length) m.nodes = ['b1'];
    if (!Array.isArray(m.best) || m.best.length < 3) m.best = [0, 0, 0];
    if (!Array.isArray(m.won) || m.won.length < 3) m.won = [0, 0, 0];
    return m;
  } catch (e) { return freshMeta(); }
}
function saveMeta() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(meta)); } catch (e) {}
}
function hasNode(id) { return meta.nodes.indexOf(id) >= 0; }
function nodeById(id) { return TREE.find((n) => n.id === id); }
function nodeAvailable(n) {
  if (hasNode(n.id)) return false;
  return n.req.every((r) => hasNode(r));
}
/* Rang = wie viele Seelen insgesamt verdient wurden */
function rank() { return 1 + Math.floor(Math.pow(meta.earned / 12, 0.72)); }
function mapUnlocked(i) { return i === 0 || meta.won[i - 1] > 0; }

/* Dauerhafte Boni aus dem Baum */
function metaBonus() {
  const b = {
    school: { blood: 1, shadow: 1, qi: 1 },
    range: 1, rate: 1, crit: 0, gold: 1, xp: 1, soul: 1,
    lives: 0, gold0: 0
  };
  if (hasNode('b2')) b.school.blood *= 1.12;
  if (hasNode('b5')) b.lives += 25;
  if (hasNode('b6')) b.rate *= 1.10;
  if (hasNode('b7')) b.school.blood *= 1.30;
  if (hasNode('s2')) b.range *= 1.10;
  if (hasNode('s5')) b.crit += 0.10;
  if (hasNode('s6')) b.gold *= 1.18;
  if (hasNode('s7')) b.school.shadow *= 1.30;
  if (hasNode('q2')) b.gold0 += 80;
  if (hasNode('q5')) b.xp *= 1.20;
  if (hasNode('q6')) b.soul *= 1.25;
  if (hasNode('q7')) b.school.qi *= 1.30;
  /* Rang gibt einen kleinen Dauerbonus */
  const r = rank() - 1;
  b.lives += r * 4;
  b.school.blood *= 1 + r * 0.02;
  b.school.shadow *= 1 + r * 0.02;
  b.school.qi *= 1 + r * 0.02;
  return b;
}
function towerUnlocked(key) {
  return TREE.some((n) => n.unlock === key && hasNode(n.id));
}
function abilityUnlocked(key) { return hasNode(ABILITIES[key].node); }

/* ==========================================================================
   Laufender Kampf (Run)
   ========================================================================== */
let run = null;

function buildPath(map) {
  const pts = map.path.map((p) => ({ x: p[0] * TILE + TILE / 2, y: FIELD_Y + p[1] * TILE + TILE / 2 }));
  const segLen = [], cum = [0];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const L = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    segLen.push(L); total += L; cum.push(total);
  }
  /* Zellen, auf denen kein Turm stehen darf */
  const cells = new Set();
  for (let i = 0; i < map.path.length - 1; i++) {
    const a = map.path[i], b = map.path[i + 1];
    const dc = Math.sign(b[0] - a[0]), dr = Math.sign(b[1] - a[1]);
    let c = a[0], r = a[1], guard = 0;
    while (guard++ < 60) {
      cells.add(c + ',' + r);
      if (c === b[0] && r === b[1]) break;
      c += dc; r += dr;
    }
  }
  const last = map.path[map.path.length - 1];
  return { pts, segLen, cum, total, cells, castle: { c: last[0], r: last[1] } };
}

function posAt(path, d) {
  if (d <= 0) return { x: path.pts[0].x, y: path.pts[0].y, a: 0 };
  for (let i = 0; i < path.segLen.length; i++) {
    if (d <= path.cum[i + 1] || i === path.segLen.length - 1) {
      const t = Math.min(1, (d - path.cum[i]) / (path.segLen[i] || 1));
      const a = path.pts[i], b = path.pts[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t,
               a: Math.atan2(b.y - a.y, b.x - a.x) };
    }
  }
  const p = path.pts[path.pts.length - 1];
  return { x: p.x, y: p.y, a: 0 };
}

function startRun(mapIndex) {
  const map = MAPS[mapIndex];
  const mb = metaBonus();
  run = {
    mapIndex: mapIndex, map: map, path: buildPath(map),
    lives: 60 + mb.lives, maxLives: 60 + mb.lives,
    gold: 200 + mb.gold0,
    wave: 0, waveActive: false, queue: [], prep: 12, endless: false, won: false,
    level: 1, xp: 0, xpNeed: 45,
    enemies: [], towers: [], shots: [], fx: [], texts: [],
    kills: 0, leaked: 0, time: 0, speed: 1, paused: false,
    sel: null, selTower: null, place: null,
    cool: { blutregen: 0, schattennebel: 0, qiwelle: 0 },
    shake: 0, flash: 0, flashCol: '#e0304f',
    mul: {
      dmg: 1, school: { blood: mb.school.blood, shadow: mb.school.shadow, qi: mb.school.qi },
      range: mb.range, rate: mb.rate, crit: mb.crit, critDmg: 0,
      gold: mb.gold, xp: mb.xp, soul: mb.soul,
      pierce: 0, hitSlow: 0, cd: 1, dbl: 0
    },
    boons: [], offer: null
  };
  meta.runs++;
  saveMeta();
}

/* ------------------------------------------------------------------ Wellen */
function startWave() {
  if (run.waveActive) return;
  /* Blut-Bonus, wenn du die Welle frueh rufst */
  if (run.prep > 0) run.gold += Math.round(run.prep * 4);
  run.wave++;
  run.queue = buildWave(run.wave);
  run.waveActive = true;
  run.prep = 0;
  sfx('wave');
}

function spawnEnemy(key) {
  const t = ENEMIES[key];
  const scale = waveScale(run.wave);
  const hp = t.hp * scale * (t.boss ? 1.15 : 1);
  run.enemies.push({
    k: key, t: t, hp: hp, max: hp, d: 0,
    spd: t.spd * (1 + Math.min(0.35, run.wave * 0.008)),
    slowT: 0, slowA: 0, stun: 0, bleed: 0, bleedT: 0,
    x: run.path.pts[0].x, y: run.path.pts[0].y, a: 0,
    hitT: 0, wob: Math.random() * 6.28
  });
}

/* ------------------------------------------------------------- Schadensmodell */
function hurt(e, raw, school, opt) {
  opt = opt || {};
  if (e.hp <= 0) return 0;
  let dmg = raw * run.mul.dmg;
  if (opt.crit) dmg *= 1.6 + run.mul.critDmg;
  if (run.mul.dbl > 0 && Math.random() < run.mul.dbl) dmg *= 2;
  if (!opt.trueDmg) {
    const armor = Math.max(0, (e.t.armor || 0) - run.mul.pierce - (opt.pierce || 0));
    dmg = Math.max(1, dmg - armor);
  }
  dmg *= (e.t.res[school] || 1);
  e.hp -= dmg;
  e.hitT = 0.12;
  if (run.mul.hitSlow > 0 && !e.t.ghost) applySlow(e, run.mul.hitSlow, 1.2);
  if (opt.crit) floatText(e.x, e.y - e.t.r - 6, Math.round(dmg) + '!', SCHOOLS[school].glow, 20);
  if (e.hp <= 0) killEnemy(e, school);
  return dmg;
}

function applySlow(e, amt, dur) {
  if (e.t.ghost) return;
  if (amt >= e.slowA || e.slowT < 0.1) { e.slowA = Math.max(e.slowA, amt); }
  e.slowT = Math.max(e.slowT, dur);
}

function killEnemy(e, school) {
  e.hp = 0; e.dead = true;
  run.kills++; meta.kills++;
  const g = Math.round(e.t.gold * run.mul.gold * (1 + run.wave * 0.02));
  run.gold += g;
  gainXP(e.t.xp * run.mul.xp);
  floatText(e.x, e.y - 12, '+' + g, '#ffd27a', 18);
  burst(e.x, e.y, e.t.boss ? 34 : 12, SCHOOLS[school] ? SCHOOLS[school].col : '#e0304f', e.t.boss ? 4 : 2.4);
  if (e.t.boss) { run.shake = 0.5; flash('#e0304f', 0.35); }
  sfx(e.t.boss ? 'boom' : 'kill');
}

function gainXP(n) {
  run.xp += n;
  while (run.xp >= run.xpNeed) {
    run.xp -= run.xpNeed;
    run.level++;
    run.xpNeed = Math.round(45 * Math.pow(1.32, run.level - 1));
    offerBoons();
  }
}

function offerBoons() {
  const pool = BOONS.slice();
  const pick = [];
  while (pick.length < 3 && pool.length) {
    pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  run.pendingBoons = (run.pendingBoons || []);
  run.pendingBoons.push(pick);
  if (!run.offer) run.offer = run.pendingBoons.shift();
}

function takeBoon(b) {
  b.f(run);
  run.boons.push(b.id);
  run.offer = (run.pendingBoons && run.pendingBoons.length) ? run.pendingBoons.shift() : null;
  sfx('ui');
}

/* ------------------------------------------------------------ Turm-Verwaltung */
function cellFree(c, r) {
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return false;
  if (run.path.cells.has(c + ',' + r)) return false;
  return !run.towers.some((t) => t.c === c && t.r === r);
}
function towerAt(c, r) { return run.towers.find((t) => t.c === c && t.r === r) || null; }

function placeTower(key, c, r) {
  const cost = TOWERS[key].cost;
  if (run.gold < cost || !cellFree(c, r)) { sfx('nope'); return false; }
  run.gold -= cost;
  run.towers.push({
    key: key, c: c, r: r, lvl: 1, cd: 0, ang: -Math.PI / 2,
    x: c * TILE + TILE / 2, y: FIELD_Y + r * TILE + TILE / 2,
    buffD: 0, buffR: 0, pulse: 0, spent: cost, kills: 0, born: run.time
  });
  sfx('build');
  return true;
}
function upgradeTower(t) {
  if (t.lvl >= MAX_LVL) return;
  const c = upgradeCost(t.key, t.lvl);
  if (run.gold < c) { sfx('nope'); return; }
  run.gold -= c; t.spent += c; t.lvl++;
  t.pulse = 0.5;
  sfx('build');
}
function sellTower(t) {
  run.gold += Math.round(t.spent * 0.6);
  run.towers.splice(run.towers.indexOf(t), 1);
  run.selTower = null;
  burst(t.x, t.y, 10, '#ffd27a', 2);
  sfx('ui');
}

/* ------------------------------------------------------------- Fähigkeiten */
function castAbility(key) {
  if (!abilityUnlocked(key) || run.cool[key] > 0) { sfx('nope'); return; }
  const A = ABILITIES[key];
  run.cool[key] = A.cd * run.mul.cd;
  const alive = run.enemies.filter((e) => !e.dead);
  if (key === 'blutregen') {
    const dmg = 55 + run.level * 9;
    alive.forEach((e) => hurt(e, dmg, 'blood', { trueDmg: true }));
    run.lives = Math.min(run.maxLives, run.lives + 12);
    for (let i = 0; i < 70; i++) {
      run.fx.push({ t: 'rain', x: Math.random() * VW, y: FIELD_Y + Math.random() * FIELD_H,
                    life: 0.8 + Math.random() * 0.5, max: 1.3, col: '#e0304f' });
    }
    flash('#e0304f', 0.5);
  } else if (key === 'schattennebel') {
    alive.forEach((e) => { e.slowA = Math.max(e.slowA, 0.62); e.slowT = Math.max(e.slowT, 7); });
    run.fx.push({ t: 'veil', life: 7, max: 7 });
    flash('#9b6bff', 0.4);
  } else if (key === 'qiwelle') {
    const dmg = 110 + run.level * 16;
    alive.forEach((e) => { hurt(e, dmg, 'qi', { pierce: 99 }); e.stun = Math.max(e.stun, 1.6); });
    run.fx.push({ t: 'shock', x: VW / 2, y: FIELD_Y + FIELD_H / 2, life: 0.7, max: 0.7, col: '#2fe3bd' });
    run.shake = 0.5;
    flash('#2fe3bd', 0.5);
  }
  sfx('cast');
}

/* --------------------------------------------------------------- Effekte */
function burst(x, y, n, col, sp) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.2832, v = (0.4 + Math.random()) * 46 * (sp || 2);
    run.fx.push({ t: 'p', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                  life: 0.35 + Math.random() * 0.45, max: 0.8, col: col, r: 1.6 + Math.random() * 2.4 });
  }
}
function floatText(x, y, txt, col, size) {
  run.texts.push({ x: x, y: y, txt: txt, col: col, size: size || 16, life: 0.9, max: 0.9 });
}
function flash(col, amt) { run.flashCol = col; run.flash = Math.max(run.flash, amt); }

/* ==========================================================================
   Simulation
   ========================================================================== */
function tick(dt) {
  run.time += dt;
  if (run.shake > 0) run.shake = Math.max(0, run.shake - dt * 1.6);
  if (run.flash > 0) run.flash = Math.max(0, run.flash - dt * 1.4);

  for (const k in run.cool) if (run.cool[k] > 0) run.cool[k] = Math.max(0, run.cool[k] - dt);

  /* Vorbereitungszeit zwischen den Wellen */
  if (!run.waveActive) {
    run.prep -= dt;
    if (run.prep <= 0) startWave();
  } else {
    /* Nachschub aus der Warteschlange */
    let i = 0;
    while (i < run.queue.length) {
      run.queue[i].delay -= dt;
      if (run.queue[i].delay <= 0) { spawnEnemy(run.queue[i].k); run.queue.splice(i, 1); }
      else i++;
    }
    if (!run.queue.length && !run.enemies.length) {
      run.waveActive = false;
      run.prep = 16;
      run.gold += 30 + run.wave * 6;
      floatText(VW / 2, FIELD_Y + FIELD_H / 2, 'Welle ' + run.wave + ' überstanden', '#ffd27a', 26);
      if (!run.won && run.wave >= run.map.goal) winRun();
      if (run.wave > meta.best[run.mapIndex]) { meta.best[run.mapIndex] = run.wave; saveMeta(); }
    }
  }

  updateEnemies(dt);
  updateTowers(dt);
  updateShots(dt);
  updateFx(dt);
}

function updateEnemies(dt) {
  const P = run.path;
  for (const e of run.enemies) {
    if (e.dead) continue;
    if (e.hitT > 0) e.hitT -= dt;

    /* Bluten */
    if (e.bleedT > 0) {
      e.bleedT -= dt;
      e.hp -= e.bleed * dt;
      if (e.hp <= 0) { killEnemy(e, 'blood'); continue; }
    }
    /* Verlangsamung */
    let f = 1;
    if (e.slowT > 0) { e.slowT -= dt; f *= (1 - e.slowA); }
    else e.slowA = 0;
    if (e.stun > 0) { e.stun -= dt; f = 0; }
    /* Werwoelfe werden im Todeskampf schneller */
    if (e.t.rage && e.hp < e.max * 0.5) f *= 1.4;

    e.d += e.spd * f * dt;
    const p = posAt(P, e.d);
    e.x = p.x; e.y = p.y; e.a = p.a;
    e.wob += dt * (6 + e.spd * 0.04);

    if (e.d >= P.total) {
      e.dead = true; e.leaked = true;
      run.leaked++;
      const dmg = e.t.boss ? 15 : (e.t.armor >= 8 ? 4 : 2);
      run.lives -= dmg;
      flash('#ff2244', 0.55);
      run.shake = 0.35;
      sfx('leak');
      const cp = P.pts[P.pts.length - 1];
      burst(cp.x, cp.y, 14, '#ff2244', 2.5);
    }
  }

  /* Priester und Inquisitoren heilen ihre Umgebung */
  for (const h of run.enemies) {
    if (h.dead || h.t.aura !== 'heal') continue;
    for (const e of run.enemies) {
      if (e.dead || e === h) continue;
      if (Math.hypot(e.x - h.x, e.y - h.y) < 96) {
        e.hp = Math.min(e.max, e.hp + e.max * 0.045 * dt);
      }
    }
  }

  run.enemies = run.enemies.filter((e) => !e.dead);
  if (run.lives <= 0 && scene === 'game') loseRun();
}

function updateTowers(dt) {
  /* Verstärkung durch Meridian-Tore einmal pro Frame bestimmen */
  const buffs = run.towers.filter((t) => TOWERS[t.key].kind === 'buff');
  for (const t of run.towers) {
    t.buffD = 0; t.buffR = 0;
    if (TOWERS[t.key].kind === 'buff') continue;
    for (const b of buffs) {
      const st = towerStats(b.key, b.lvl, run);
      if (Math.hypot(t.x - b.x, t.y - b.y) <= st.range) {
        t.buffD += st.buffDmg; t.buffR += st.buffRate;
      }
    }
  }

  for (const t of run.towers) {
    const base = TOWERS[t.key];
    const st = towerStats(t.key, t.lvl, run);
    const dmg = st.dmg * (1 + t.buffD);
    const rate = st.rate / (1 + t.buffR);
    if (t.pulse > 0) t.pulse = Math.max(0, t.pulse - dt * 2);
    if (base.kind === 'buff') { t.ang += dt * 0.7; continue; }

    if (base.kind === 'aura') {
      /* Dauerwirkung ohne Abklingzeit */
      t.cd -= dt;
      const hits = run.enemies.filter((e) => !e.dead && Math.hypot(e.x - t.x, e.y - t.y) <= st.range);
      if (st.slow) hits.forEach((e) => applySlow(e, st.slow, 0.4));
      if (t.cd <= 0 && hits.length) {
        t.cd = rate;
        t.pulse = 1;
        hits.forEach((e) => {
          hurt(e, dmg, base.school, { pierce: 99 });
          if (st.bleed && !e.dead) { e.bleed = Math.max(e.bleed, st.bleed); e.bleedT = 3; }
        });
        sfx('aura');
      }
      continue;
    }

    /* Ziel suchen: der Feind, der am weitesten gelaufen ist */
    let target = null, bestD = -1;
    for (const e of run.enemies) {
      if (e.dead) continue;
      if (Math.hypot(e.x - t.x, e.y - t.y) > st.range) continue;
      if (e.d > bestD) { bestD = e.d; target = e; }
    }
    if (target) {
      const want = Math.atan2(target.y - t.y, target.x - t.x);
      let diff = ((want - t.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      t.ang += diff * Math.min(1, dt * 12);
    }
    t.cd -= dt;
    if (!target || t.cd > 0) continue;
    t.cd = rate;
    t.pulse = 1;

    if (base.kind === 'pulse') {
      const hits = run.enemies.filter((e) => !e.dead && Math.hypot(e.x - t.x, e.y - t.y) <= st.range);
      hits.forEach((e) => hurt(e, dmg, base.school, {}));
      run.fx.push({ t: 'ring', x: t.x, y: t.y, r: st.range, life: 0.42, max: 0.42, col: SCHOOLS[base.school].col });
      sfx('pulse');
    } else {
      const crit = Math.random() < st.crit;
      run.shots.push({
        x: t.x + Math.cos(t.ang) * 18, y: t.y + Math.sin(t.ang) * 18,
        tgt: target, dmg: dmg, school: base.school, crit: crit,
        sp: 640, life: 1.4, drain: base.drain || 0, col: SCHOOLS[base.school].col,
        r: crit ? 6 : 4, src: t
      });
      sfx(base.school === 'shadow' ? 'slash' : 'shoot');
    }
  }
}

function updateShots(dt) {
  for (const s of run.shots) {
    if (s.done) continue;
    s.life -= dt;
    const tg = s.tgt;
    if (s.life <= 0 || !tg || tg.dead) { s.done = true; continue; }
    const dx = tg.x - s.x, dy = tg.y - s.y;
    const d = Math.hypot(dx, dy);
    const step = s.sp * dt;
    if (d <= step + tg.t.r) {
      s.done = true;
      const dealt = hurt(tg, s.dmg, s.school, { crit: s.crit });
      if (s.drain) run.gold += Math.max(0, Math.round(dealt * s.drain * 0.14));
      burst(tg.x, tg.y, s.crit ? 8 : 4, s.col, 1.4);
      if (s.src) s.src.kills += tg.dead ? 1 : 0;
      sfx('hit');
    } else {
      s.x += dx / d * step; s.y += dy / d * step;
      s.a = Math.atan2(dy, dx);
    }
  }
  run.shots = run.shots.filter((s) => !s.done);
}

function updateFx(dt) {
  for (const f of run.fx) {
    f.life -= dt;
    if (f.t === 'p') { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 120 * dt; f.vx *= 0.96; }
    if (f.t === 'rain') { f.y += 420 * dt; }
  }
  run.fx = run.fx.filter((f) => f.life > 0);
  for (const t of run.texts) { t.life -= dt; t.y -= 26 * dt; }
  run.texts = run.texts.filter((t) => t.life > 0);
}

/* ------------------------------------------------------------ Ende des Runs */
function soulsEarned() {
  const base = run.wave * 3 + Math.floor(run.kills / 8) + (run.won ? 25 : 0);
  return Math.max(1, Math.round(base * run.mul.soul));
}
/* Seelen gutschreiben — nur der noch nicht verbuchte Teil */
function bankSouls() {
  const total = soulsEarned();
  const gain = Math.max(0, total - (run.banked || 0));
  run.banked = total;
  meta.souls += gain;
  meta.earned += gain;
  saveMeta();
  run.finalSouls = gain;
}
function winRun() {
  run.won = true;
  meta.won[run.mapIndex] = Math.max(meta.won[run.mapIndex], run.wave);
  bankSouls();
  scene = 'over';
  sfx('cast');
}
function loseRun() {
  bankSouls();
  scene = 'over';
  sfx('lose');
}
function retireRun() {
  run.retired = true;
  bankSouls();
  scene = 'over';
}

/* ==========================================================================
   Leinwand, Eingabe, Klang
   ========================================================================== */
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let scale = 1, scene = 'menu', prevScene = 'menu';
let treeScroll = 0, treeDrag = null;

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  scale = Math.min(w / VW, h / VH);
  const cw = Math.round(VW * scale), ch = Math.round(VH * scale);
  canvas.style.width = cw + 'px';
  canvas.style.height = ch + 'px';
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));

/* --- Klang: kleine Synthesizer-Töne, damit keine Dateien nötig sind --- */
let AC = null;
function audio() {
  if (!AC) {
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = false; }
  }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}
const SFX = {
  shoot: { f: 420, t: 'square', d: 0.06, v: 0.05, s: -180 },
  slash: { f: 900, t: 'sawtooth', d: 0.05, v: 0.035, s: -500 },
  hit:   { f: 220, t: 'triangle', d: 0.05, v: 0.04, s: -80 },
  kill:  { f: 160, t: 'sine', d: 0.14, v: 0.09, s: -90 },
  boom:  { f: 90,  t: 'sawtooth', d: 0.45, v: 0.16, s: -60 },
  pulse: { f: 520, t: 'sine', d: 0.18, v: 0.07, s: 260 },
  aura:  { f: 180, t: 'sine', d: 0.12, v: 0.035, s: 40 },
  build: { f: 300, t: 'square', d: 0.12, v: 0.08, s: 380 },
  ui:    { f: 620, t: 'sine', d: 0.06, v: 0.06, s: 120 },
  nope:  { f: 150, t: 'square', d: 0.1, v: 0.06, s: -60 },
  cast:  { f: 240, t: 'sawtooth', d: 0.4, v: 0.12, s: 420 },
  wave:  { f: 140, t: 'sawtooth', d: 0.5, v: 0.1, s: 90 },
  leak:  { f: 110, t: 'square', d: 0.25, v: 0.12, s: -50 },
  lose:  { f: 200, t: 'sawtooth', d: 1.1, v: 0.16, s: -170 }
};
let sfxBudget = 0;
function sfx(name) {
  if (!meta || !meta.sound) return;
  const a = audio(); if (!a) return;
  const S = SFX[name]; if (!S) return;
  if (sfxBudget > 14) return;
  sfxBudget++;
  try {
    const o = a.createOscillator(), g = a.createGain();
    o.type = S.t;
    o.frequency.setValueAtTime(S.f, a.currentTime);
    o.frequency.linearRampToValueAtTime(Math.max(40, S.f + S.s), a.currentTime + S.d);
    g.gain.setValueAtTime(S.v, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + S.d);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + S.d + 0.02);
  } catch (e) {}
}

/* --------------------------------------------------------------- Eingabe */
let uiHit = [];
function hitBox(x, y, w, h, fn, off) { uiHit.push({ x: x, y: y, w: w, h: h, fn: fn, off: !!off }); }

function toVirtual(ev) {
  const r = canvas.getBoundingClientRect();
  return { x: (ev.clientX - r.left) / scale, y: (ev.clientY - r.top) / scale };
}

canvas.addEventListener('pointerdown', (ev) => {
  ev.preventDefault();
  audio();
  const p = toVirtual(ev);
  if (scene === 'tree') treeDrag = { y: p.y, start: treeScroll, moved: 0 };
  for (let i = uiHit.length - 1; i >= 0; i--) {
    const b = uiHit[i];
    if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      if (b.off) { sfx('nope'); return; }
      b.fn(p); return;
    }
  }
  if (scene === 'game' && !run.offer && !run.paused) fieldTap(p);
}, { passive: false });

canvas.addEventListener('pointermove', (ev) => {
  if (!treeDrag) return;
  ev.preventDefault();
  const p = toVirtual(ev);
  treeDrag.moved += Math.abs(p.y - treeDrag.y);
  treeScroll = clamp(treeDrag.start + (p.y - treeDrag.y), -TREE_MAXSCROLL, 0);
}, { passive: false });

function endDrag() { treeDrag = null; }
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });

function fieldTap(p) {
  if (p.y < FIELD_Y || p.y > PANEL_Y) { run.selTower = null; return; }
  const c = Math.floor(p.x / TILE), r = Math.floor((p.y - FIELD_Y) / TILE);
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return;
  const t = towerAt(c, r);
  if (t) { run.selTower = (run.selTower === t) ? null : t; run.sel = null; return; }
  if (run.sel) {
    if (placeTower(run.sel, c, r)) {
      if (run.gold < TOWERS[run.sel].cost) run.sel = null;
    }
    return;
  }
  run.selTower = null;
}

/* ------------------------------------------------------------ Zeichenhilfen */
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function rr(x, y, w, h, r) {
  const k = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}
function txt(s, x, y, size, col, align, font, weight) {
  ctx.fillStyle = col;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.font = (weight || '600') + ' ' + size + 'px ' + (font || '-apple-system, "Segoe UI", Roboto, sans-serif');
  ctx.fillText(s, x, y);
}
const SERIF = 'Georgia, "Times New Roman", serif';

function panel(x, y, w, h, r, fill, stroke, alpha) {
  ctx.save();
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  rr(x, y, w, h, r);
  ctx.fillStyle = fill || 'rgba(20,9,28,0.92)';
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
}

function button(x, y, w, h, label, opts) {
  opts = opts || {};
  const on = !opts.off;
  const col = opts.col || '#e0304f';
  ctx.save();
  rr(x, y, w, h, opts.r === undefined ? 12 : opts.r);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  if (on) { g.addColorStop(0, shade(col, 0.34)); g.addColorStop(1, shade(col, -0.34)); }
  else { g.addColorStop(0, '#2a2233'); g.addColorStop(1, '#171220'); }
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = on ? shade(col, 0.55) : '#3a3247';
  ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  txt(label, x + w / 2, y + h / 2 + (opts.sub ? -9 : 0), opts.size || 20,
      on ? '#fff6fb' : '#6c6480', 'center', opts.font, opts.weight);
  if (opts.sub) txt(opts.sub, x + w / 2, y + h / 2 + 13, opts.subSize || 14,
                    on ? 'rgba(255,240,250,0.78)' : '#57506a', 'center');
  if (opts.fn) hitBox(x, y, w, h, opts.fn, !on);
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt > 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt); }
  return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
}
function wrapText(s, x, y, maxW, size, col, lh, align) {
  ctx.font = '500 ' + size + 'px -apple-system, "Segoe UI", Roboto, sans-serif';
  const words = s.split(' ');
  let line = '', yy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line) {
      txt(line, x, yy, size, col, align || 'left');
      line = words[i]; yy += lh || size + 6;
    } else line = test;
  }
  if (line) txt(line, x, yy, size, col, align || 'left');
  return yy + (lh || size + 6);
}

/* ==========================================================================
   Zeichnen des Spielfelds
   ========================================================================== */
function hash(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

const THEME = {
  grave:  { a: '#231032', b: '#120720', road: '#3b2a1e', roadEdge: '#584033', tint: '#6d3a8f' },
  church: { a: '#141d3a', b: '#080d1e', road: '#2f3350', roadEdge: '#4a4f76', tint: '#4f6ccf' },
  mount:  { a: '#0f2b2a', b: '#061513', road: '#2c3a33', roadEdge: '#46584b', tint: '#2fa88f' }
};

function drawField() {
  const th = THEME[run.map.theme];
  ctx.save();
  ctx.beginPath(); ctx.rect(0, FIELD_Y, VW, FIELD_H); ctx.clip();

  const g = ctx.createLinearGradient(0, FIELD_Y, 0, PANEL_Y);
  g.addColorStop(0, th.a); g.addColorStop(1, th.b);
  ctx.fillStyle = g; ctx.fillRect(0, FIELD_Y, VW, FIELD_H);

  /* Blutmond am Himmel */
  ctx.save();
  ctx.globalAlpha = 0.28;
  const mg = ctx.createRadialGradient(560, FIELD_Y + 120, 10, 560, FIELD_Y + 120, 150);
  mg.addColorStop(0, '#ff6a7f'); mg.addColorStop(1, 'rgba(255,60,90,0)');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(560, FIELD_Y + 120, 150, 0, 6.2832); ctx.fill();
  ctx.restore();

  /* Deko auf freien Feldern */
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (run.path.cells.has(c + ',' + r)) continue;
      const i = r * COLS + c;
      const h = hash(i);
      if (h > 0.62) {
        const x = c * TILE + 14 + hash(i + 99) * 52;
        const y = FIELD_Y + r * TILE + 20 + hash(i + 7) * 46;
        drawDecor(run.map.theme, x, y, 0.7 + hash(i + 3) * 0.6, th);
      }
    }
  }

  /* Der Pfad */
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(run.path.pts[0].x, run.path.pts[0].y);
  for (let i = 1; i < run.path.pts.length; i++) ctx.lineTo(run.path.pts[i].x, run.path.pts[i].y);
  ctx.strokeStyle = th.roadEdge; ctx.lineWidth = TILE * 0.78; ctx.stroke();
  ctx.strokeStyle = th.road; ctx.lineWidth = TILE * 0.64; ctx.stroke();
  ctx.save();
  ctx.globalAlpha = 0.25; ctx.setLineDash([10, 22]);
  ctx.strokeStyle = '#000'; ctx.lineWidth = TILE * 0.5; ctx.stroke();
  ctx.restore();

  /* Raster auf freien Feldern */
  ctx.save();
  ctx.globalAlpha = run.sel ? 0.5 : 0.085;
  ctx.strokeStyle = run.sel ? '#ffd27a' : '#ffffff';
  ctx.lineWidth = 1;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!cellFree(c, r)) continue;
    rr(c * TILE + 4, FIELD_Y + r * TILE + 4, TILE - 8, TILE - 8, 8);
    ctx.stroke();
  }
  ctx.restore();

  drawCastle();

  /* Reichweite anzeigen */
  const showT = run.selTower;
  if (showT) drawRange(showT.x, showT.y, towerStats(showT.key, showT.lvl, run).range, SCHOOLS[TOWERS[showT.key].school].col);

  for (const t of run.towers) drawTower(t);
  for (const e of run.enemies) drawEnemy(e);
  for (const s of run.shots) drawShot(s);
  drawFx();

  for (const t of run.texts) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, t.life / t.max * 1.6);
    txt(t.txt, t.x, t.y, t.size, t.col, 'center', SERIF, '700');
    ctx.restore();
  }
  ctx.restore();
}

function drawRange(x, y, r, col) {
  ctx.save();
  ctx.globalAlpha = 0.14; ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  ctx.globalAlpha = 0.55; ctx.strokeStyle = col; ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]); ctx.stroke();
  ctx.restore();
}

function drawDecor(theme, x, y, s, th) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.globalAlpha = 0.5;
  if (theme === 'grave') {
    ctx.fillStyle = '#4a3f57';
    rr(-9, -16, 18, 22, 3); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -16, 9, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#2b2436'; ctx.fillRect(-2, -14, 4, 12); ctx.fillRect(-6, -10, 12, 4);
  } else if (theme === 'church') {
    ctx.fillStyle = '#39406b';
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(11, 4); ctx.lineTo(-11, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5b6499'; ctx.fillRect(-2, -12, 4, 10);
  } else {
    ctx.fillStyle = '#2b4a3f';
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(13, 6); ctx.lineTo(-13, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7fd6b8'; ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.arc(0, -4, 4, 0, 6.2832); ctx.fill();
  }
  ctx.restore();
}

function drawCastle() {
  const cp = run.path.pts[run.path.pts.length - 1];
  const x = cp.x, y = cp.y;
  const hurtPulse = 1 + Math.sin(run.time * 3) * 0.04;
  ctx.save();
  ctx.translate(x, y); ctx.scale(hurtPulse, hurtPulse);
  const gl = ctx.createRadialGradient(0, 0, 4, 0, 0, 62);
  gl.addColorStop(0, 'rgba(224,48,79,0.5)'); gl.addColorStop(1, 'rgba(224,48,79,0)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 62, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#2a1826';
  rr(-32, -22, 64, 44, 5); ctx.fill();
  ctx.fillStyle = '#3b2334';
  ctx.fillRect(-32, -36, 15, 16); ctx.fillRect(-7, -42, 14, 22); ctx.fillRect(17, -36, 15, 16);
  ctx.fillStyle = '#e0304f';
  ctx.fillRect(-4, -4, 8, 22);
  ctx.fillStyle = '#ffb3c2';
  ctx.beginPath(); ctx.arc(-18, -6, 3.5, 0, 6.2832); ctx.arc(18, -6, 3.5, 0, 6.2832); ctx.fill();
  ctx.restore();

  /* Lebensbalken der Burg */
  const w = 76, p = clamp(run.lives / run.maxLives, 0, 1);
  panel(x - w / 2, y + 28, w, 9, 4, 'rgba(0,0,0,0.6)', null);
  ctx.fillStyle = p > 0.5 ? '#3ddc84' : (p > 0.22 ? '#ffc24b' : '#ff4d63');
  rr(x - w / 2 + 1.5, y + 29.5, (w - 3) * p, 6, 3); ctx.fill();
}

/* -------------------------------------------------------------- Türme */
function drawTower(t) {
  const base = TOWERS[t.key];
  const S = SCHOOLS[base.school];
  const x = t.x, y = t.y;
  const pulse = t.pulse;
  ctx.save();
  ctx.translate(x, y);

  /* Sockel */
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(0, 14, 26, 11, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#231a2c';
  rr(-25, -12, 50, 28, 8); ctx.fill();
  ctx.strokeStyle = shade(S.col, -0.2); ctx.lineWidth = 2; ctx.stroke();

  if (base.kind === 'shot') {
    ctx.save(); ctx.rotate(t.ang);
    ctx.fillStyle = shade(S.col, -0.35);
    rr(-6, -7, 30, 14, 5); ctx.fill();
    ctx.fillStyle = S.col;
    rr(14 - pulse * 6, -4, 16, 8, 3); ctx.fill();
    ctx.restore();
    ctx.fillStyle = shade(S.col, -0.1);
    ctx.beginPath(); ctx.arc(0, -4, 12, 0, 6.2832); ctx.fill();
    ctx.fillStyle = S.glow;
    ctx.beginPath(); ctx.arc(0, -4, 5 + pulse * 2, 0, 6.2832); ctx.fill();
  } else if (base.kind === 'aura') {
    ctx.save(); ctx.globalAlpha = 0.5 + pulse * 0.4;
    ctx.fillStyle = S.col;
    ctx.beginPath(); ctx.arc(0, -6, 14 + pulse * 5, 0, 6.2832); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = S.glow; ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) {
      const a = run.time * 1.4 + i * 2.094;
      ctx.beginPath();
      ctx.arc(0, -6, 18, a, a + 1.1); ctx.stroke();
    }
    ctx.fillStyle = shade(S.col, 0.4);
    ctx.beginPath(); ctx.arc(0, -6, 6, 0, 6.2832); ctx.fill();
  } else if (base.kind === 'pulse') {
    ctx.fillStyle = shade(S.col, -0.4);
    ctx.beginPath();
    ctx.moveTo(-11, 8); ctx.lineTo(-7, -26); ctx.lineTo(7, -26); ctx.lineTo(11, 8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = S.col; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = S.glow;
    ctx.globalAlpha = 0.6 + pulse * 0.4;
    ctx.beginPath(); ctx.arc(0, -14, 5 + pulse * 4, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  } else { /* buff */
    ctx.strokeStyle = shade(S.col, -0.1); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-16, 10); ctx.lineTo(-16, -18);
    ctx.moveTo(16, 10); ctx.lineTo(16, -18); ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-22, -20); ctx.lineTo(22, -20); ctx.stroke();
    ctx.save(); ctx.translate(0, -4); ctx.rotate(t.ang);
    ctx.fillStyle = S.glow;
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI); ctx.fill();
    ctx.fillStyle = shade(S.col, -0.5);
    ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI, 6.2832); ctx.fill();
    ctx.fillStyle = S.glow; ctx.beginPath(); ctx.arc(-4, 0, 4, 0, 6.2832); ctx.fill();
    ctx.fillStyle = shade(S.col, -0.5); ctx.beginPath(); ctx.arc(4, 0, 4, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  /* Stufen-Punkte */
  for (let i = 0; i < t.lvl; i++) {
    ctx.fillStyle = '#ffd27a';
    ctx.beginPath(); ctx.arc(-13 + i * 9, 20, 3, 0, 6.2832); ctx.fill();
  }
  ctx.restore();
}

/* -------------------------------------------------------------- Gegner */
function drawEnemy(e) {
  const t = e.t, x = e.x, y = e.y;
  const bob = Math.sin(e.wob) * 2;
  ctx.save();
  ctx.translate(x, y + bob);
  if (t.ghost) ctx.globalAlpha = 0.72;

  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath(); ctx.ellipse(0, t.r * 0.82, t.r * 0.85, t.r * 0.3, 0, 0, 6.2832); ctx.fill();

  if (e.slowT > 0 && !t.ghost) {
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#9b6bff';
    ctx.beginPath(); ctx.arc(0, 0, t.r + 6, 0, 6.2832); ctx.fill(); ctx.restore();
  }

  /* Koerper */
  const g = ctx.createLinearGradient(0, -t.r, 0, t.r);
  g.addColorStop(0, e.hitT > 0 ? '#ffffff' : t.c1);
  g.addColorStop(1, e.hitT > 0 ? '#ffd2d2' : t.c2);
  ctx.fillStyle = g;
  rr(-t.r * 0.72, -t.r * 0.25, t.r * 1.44, t.r * 1.15, t.r * 0.35); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -t.r * 0.5, t.r * 0.52, 0, 6.2832); ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath();
  ctx.arc(-t.r * 0.2, -t.r * 0.55, 1.9, 0, 6.2832);
  ctx.arc(t.r * 0.2, -t.r * 0.55, 1.9, 0, 6.2832);
  ctx.fill();

  /* Merkmale je Typ */
  if (e.k === 'landvolk') {
    ctx.strokeStyle = '#8a7350'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(t.r * 0.7, -t.r * 0.9); ctx.lineTo(t.r * 0.7, t.r * 0.7); ctx.stroke();
  } else if (e.k === 'jaeger') {
    ctx.strokeStyle = '#4b2f22'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-t.r * 0.9, 0); ctx.lineTo(t.r * 0.9, 0); ctx.stroke();
    ctx.strokeStyle = '#d8e9f2'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(t.r * 0.5, 0, t.r * 0.6, -1.2, 1.2); ctx.stroke();
  } else if (e.k === 'priester') {
    ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, -t.r * 1.15, t.r * 0.48, 0, 6.2832); ctx.stroke();
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(-1.6, -t.r * 0.1, 3.2, t.r * 0.8);
    ctx.fillRect(-t.r * 0.3, t.r * 0.12, t.r * 0.6, 3);
  } else if (e.k === 'ritter') {
    ctx.fillStyle = '#8f99a8';
    rr(-t.r * 1.05, -t.r * 0.25, t.r * 0.42, t.r * 0.95, 4); ctx.fill();
    ctx.fillStyle = '#c9313f';
    ctx.fillRect(-t.r * 0.95, -t.r * 0.05, t.r * 0.22, t.r * 0.5);
    ctx.fillStyle = '#5d6675';
    rr(-t.r * 0.5, -t.r * 0.8, t.r, t.r * 0.4, 3); ctx.fill();
  } else if (e.k === 'geist') {
    ctx.strokeStyle = 'rgba(223,243,255,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -2; i <= 2; i++) ctx.lineTo(i * t.r * 0.35, t.r * 0.9 + Math.sin(e.wob + i) * 3);
    ctx.stroke();
  } else if (e.k === 'werwolf') {
    ctx.fillStyle = t.c2;
    ctx.beginPath();
    ctx.moveTo(-t.r * 0.5, -t.r * 0.8); ctx.lineTo(-t.r * 0.25, -t.r * 1.3); ctx.lineTo(-t.r * 0.1, -t.r * 0.75);
    ctx.moveTo(t.r * 0.5, -t.r * 0.8); ctx.lineTo(t.r * 0.25, -t.r * 1.3); ctx.lineTo(t.r * 0.1, -t.r * 0.75);
    ctx.fill();
    ctx.fillStyle = '#ffdf6b';
    ctx.beginPath();
    ctx.arc(-t.r * 0.2, -t.r * 0.55, 2.4, 0, 6.2832);
    ctx.arc(t.r * 0.2, -t.r * 0.55, 2.4, 0, 6.2832); ctx.fill();
  } else if (e.k === 'inquisitor') {
    ctx.fillStyle = '#8d2230';
    ctx.beginPath();
    ctx.moveTo(0, -t.r * 1.75); ctx.lineTo(t.r * 0.5, -t.r * 0.85); ctx.lineTo(-t.r * 0.5, -t.r * 0.85);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd27a';
    ctx.fillRect(-2, -t.r * 1.5, 4, t.r * 0.5);
    ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, t.r + 5, 0, 6.2832); ctx.stroke();
  }
  ctx.restore();

  /* Lebensbalken */
  if (e.hp < e.max - 0.01) {
    const w = t.r * 2.2, p = clamp(e.hp / e.max, 0, 1);
    const by = y + bob - t.r - 12;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    rr(x - w / 2, by, w, 5, 2.5); ctx.fill();
    ctx.fillStyle = t.boss ? '#ff7a45' : (p > 0.4 ? '#7ce87c' : '#ff6a6a');
    rr(x - w / 2 + 0.7, by + 0.7, (w - 1.4) * p, 3.6, 2); ctx.fill();
  }
  if (e.bleedT > 0) {
    ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#e0304f';
    ctx.beginPath(); ctx.arc(x + t.r * 0.8, y - t.r * 0.8, 3, 0, 6.2832); ctx.fill(); ctx.restore();
  }
}

function drawShot(s) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.a || 0);
  ctx.shadowColor = s.col; ctx.shadowBlur = 10;
  ctx.fillStyle = s.crit ? '#ffffff' : s.col;
  if (s.school === 'shadow') { rr(-9, -2, 18, 4, 2); ctx.fill(); }
  else { ctx.beginPath(); ctx.ellipse(0, 0, s.r + 3, s.r, 0, 0, 6.2832); ctx.fill(); }
  ctx.restore();
}

function drawFx() {
  for (const f of run.fx) {
    const k = f.life / f.max;
    ctx.save();
    if (f.t === 'p') {
      ctx.globalAlpha = k; ctx.fillStyle = f.col;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * k + 0.5, 0, 6.2832); ctx.fill();
    } else if (f.t === 'ring') {
      ctx.globalAlpha = k * 0.75; ctx.strokeStyle = f.col; ctx.lineWidth = 4 * k + 1;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 - k) + 6, 0, 6.2832); ctx.stroke();
    } else if (f.t === 'rain') {
      ctx.globalAlpha = k * 0.85; ctx.strokeStyle = f.col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - 3, f.y - 16); ctx.stroke();
    } else if (f.t === 'veil') {
      ctx.globalAlpha = Math.min(0.32, k * 0.45); ctx.fillStyle = '#9b6bff';
      ctx.fillRect(0, FIELD_Y, VW, FIELD_H);
    } else if (f.t === 'shock') {
      ctx.globalAlpha = k; ctx.strokeStyle = f.col; ctx.lineWidth = 10 * k;
      ctx.beginPath(); ctx.arc(f.x, f.y, (1 - k) * 700, 0, 6.2832); ctx.stroke();
    }
    ctx.restore();
  }
}

/* ==========================================================================
   Kopfleiste und Bedienleiste
   ========================================================================== */
function chip(x, y, w, h, icon, value, col) {
  panel(x, y, w, h, 12, 'rgba(15,7,22,0.85)', 'rgba(255,255,255,0.09)');
  txt(icon, x + 14, y + h / 2, 22, col, 'left');
  txt(value, x + 44, y + h / 2, 22, '#f6ecff', 'left', null, '700');
}

function drawHUD() {
  const g = ctx.createLinearGradient(0, 0, 0, HUD_H);
  g.addColorStop(0, '#160a1f'); g.addColorStop(1, '#0d0516');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, HUD_H);

  chip(14, 16, 168, 46, '🩸', Math.floor(run.gold), '#e0304f');
  chip(190, 16, 168, 46, '🏰', Math.max(0, Math.ceil(run.lives)) + '/' + run.maxLives, '#ff8aa0');
  const waveTxt = run.wave + (run.endless || run.won ? '' : '/' + run.map.goal);
  chip(366, 16, 150, 46, '⚔️', waveTxt, '#ffd27a');

  button(524, 16, 84, 46, run.speed + '×', { col: '#4b3a63', size: 20, r: 12, fn: () => {
    run.speed = run.speed === 1 ? 2 : (run.speed === 2 ? 3 : 1); sfx('ui');
  } });
  button(616, 16, 90, 46, '❚❚', { col: '#4b3a63', size: 20, r: 12, fn: () => {
    run.paused = true; sfx('ui');
  } });

  /* Erfahrungsbalken des Fuersten */
  const bx = 14, by = 74, bw = VW - 28, bh = 24;
  panel(bx, by, bw, bh, 12, 'rgba(0,0,0,0.5)', 'rgba(255,255,255,0.08)');
  const p = clamp(run.xp / run.xpNeed, 0, 1);
  const xg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  xg.addColorStop(0, '#8b2140'); xg.addColorStop(1, '#ff5c7a');
  ctx.fillStyle = xg;
  rr(bx + 2, by + 2, Math.max(0, (bw - 4) * p), bh - 4, 10); ctx.fill();
  txt('VAMPIRFÜRST · STUFE ' + run.level, bx + 12, by + bh / 2, 14, '#ffe3ec', 'left', null, '700');
  txt(Math.floor(run.xp) + ' / ' + run.xpNeed, bx + bw - 12, by + bh / 2, 13, 'rgba(255,225,238,0.75)', 'right');

  /* Schulen-Uebersicht */
  const keys = ['blood', 'shadow', 'qi'];
  for (let i = 0; i < 3; i++) {
    const S = SCHOOLS[keys[i]];
    const x = 14 + i * 232, y = 108, w = 220, h = 30;
    panel(x, y, w, h, 10, 'rgba(255,255,255,0.045)', null);
    txt(S.sign + ' ' + S.name, x + 10, y + h / 2, 15, S.col, 'left', null, '700');
    txt('×' + (run.mul.dmg * run.mul.school[keys[i]]).toFixed(2), x + w - 10, y + h / 2, 15, '#e9dff5', 'right');
  }
}

function drawPanel() {
  const g = ctx.createLinearGradient(0, PANEL_Y, 0, VH);
  g.addColorStop(0, '#150a1e'); g.addColorStop(1, '#0a0412');
  ctx.fillStyle = g; ctx.fillRect(0, PANEL_Y, VW, PANEL_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, PANEL_Y + 0.5); ctx.lineTo(VW, PANEL_Y + 0.5); ctx.stroke();

  /* Turmauswahl */
  for (let i = 0; i < TOWER_ORDER.length; i++) {
    const key = TOWER_ORDER[i], T = TOWERS[key], S = SCHOOLS[T.school];
    const x = i * 120 + 6, y = PANEL_Y + 8, w = 108, h = 82;
    const unlocked = towerUnlocked(key);
    const afford = run.gold >= T.cost;
    const isSel = run.sel === key;

    panel(x, y, w, h, 12,
      isSel ? shade(S.col, -0.45) : 'rgba(255,255,255,0.05)',
      isSel ? S.glow : 'rgba(255,255,255,0.09)');
    ctx.save();
    ctx.globalAlpha = unlocked ? (afford ? 1 : 0.45) : 0.3;
    /* Symbol */
    ctx.translate(x + w / 2, y + 28);
    ctx.fillStyle = unlocked ? S.col : '#5a5270';
    if (T.kind === 'shot') { rr(-14, -8, 28, 16, 5); ctx.fill(); ctx.fillStyle = S.glow; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 6.2832); ctx.fill(); }
    else if (T.kind === 'aura') { ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.2832); ctx.fill(); ctx.strokeStyle = unlocked ? S.glow : '#5a5270'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 16, 0.4, 4.2); ctx.stroke(); }
    else if (T.kind === 'pulse') { ctx.beginPath(); ctx.moveTo(-8, 12); ctx.lineTo(-5, -14); ctx.lineTo(5, -14); ctx.lineTo(8, 12); ctx.closePath(); ctx.fill(); }
    else { ctx.fillRect(-15, -12, 5, 26); ctx.fillRect(10, -12, 5, 26); ctx.fillRect(-19, -16, 38, 5); }
    ctx.restore();

    txt(unlocked ? T.short : 'Gesperrt', x + w / 2, y + 54, 13,
        unlocked ? '#efe4fa' : '#6a6280', 'center', null, '700');
    txt(unlocked ? ('🩸' + T.cost) : '🔒', x + w / 2, y + 70, 14,
        unlocked ? (afford ? '#ffd27a' : '#a0708a') : '#6a6280', 'center');

    hitBox(x, y, w, h, () => {
      if (!unlocked) { toast('Im Fähigkeitsbaum freischalten'); sfx('nope'); return; }
      run.sel = (run.sel === key) ? null : key;
      run.selTower = null;
      sfx('ui');
    });
  }

  /* Fähigkeiten */
  for (let i = 0; i < 3; i++) {
    const key = ABILITY_ORDER[i], A = ABILITIES[key], S = SCHOOLS[A.school];
    const x = 6 + i * 104, y = PANEL_Y + 98, w = 98, h = 62;
    const un = abilityUnlocked(key);
    const cd = run.cool[key];
    const ready = un && cd <= 0;
    panel(x, y, w, h, 12, ready ? shade(S.col, -0.45) : 'rgba(255,255,255,0.05)',
          ready ? S.glow : 'rgba(255,255,255,0.08)');
    if (cd > 0) {
      const f = cd / (A.cd * run.mul.cd);
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#000';
      rr(x, y + h * (1 - f), w, h * f, 12); ctx.fill(); ctx.restore();
    }
    txt(S.sign, x + w / 2, y + 20, 22, un ? S.col : '#5a5270', 'center');
    txt(un ? A.short : 'Gesperrt', x + w / 2, y + 44, 12,
        un ? '#efe4fa' : '#6a6280', 'center', null, '700');
    if (cd > 0) txt(Math.ceil(cd) + 's', x + w / 2, y + 58, 12, '#ffd27a', 'center');
    hitBox(x, y, w, h, () => {
      if (!un) { toast('Im Fähigkeitsbaum freischalten'); sfx('nope'); return; }
      castAbility(key);
    });
  }

  /* Wellenknopf */
  const bx = 318, by = PANEL_Y + 98, bw = 396, bh = 62;
  if (run.waveActive) {
    const left = run.queue.length + run.enemies.length;
    panel(bx, by, bw, bh, 12, 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.08)');
    txt('WELLE ' + run.wave + ' LÄUFT', bx + bw / 2, by + 22, 18, '#ffd27a', 'center', SERIF, '700');
    txt(left + ' Feinde übrig', bx + bw / 2, by + 44, 14, '#cbbcdd', 'center');
  } else {
    button(bx, by, bw, bh, 'NÄCHSTE WELLE ▶', {
      col: '#a11e3c', size: 18, font: SERIF,
      sub: 'in ' + Math.ceil(Math.max(0, run.prep)) + 's  ·  Bonus 🩸' + Math.round(Math.max(0, run.prep) * 4),
      fn: () => startWave()
    });
  }
}

/* Kurznachricht */
let toastMsg = '', toastT = 0;
function toast(s) { toastMsg = s; toastT = 2; }
function drawToast(dt) {
  if (toastT <= 0) return;
  toastT -= dt;
  ctx.save();
  ctx.globalAlpha = clamp(toastT, 0, 1);
  const w = Math.max(240, ctx.measureText(toastMsg).width + 60);
  panel(VW / 2 - w / 2, PANEL_Y - 70, w, 46, 14, 'rgba(10,4,16,0.94)', '#e0304f');
  txt(toastMsg, VW / 2, PANEL_Y - 47, 17, '#ffd7e2', 'center');
  ctx.restore();
}

/* -------------------------------------------------- Turm-Detailfenster */
function drawTowerInfo() {
  const t = run.selTower;
  if (!t) return;
  const T = TOWERS[t.key], S = SCHOOLS[T.school];
  const st = towerStats(t.key, t.lvl, run);
  const h = 196, w = 680, x = 20;
  const y = (t.y > FIELD_Y + FIELD_H / 2) ? FIELD_Y + 16 : PANEL_Y - h - 16;

  panel(x, y, w, h, 16, 'rgba(12,5,19,0.96)', S.col);
  txt(T.name + '  ·  Stufe ' + t.lvl, x + 20, y + 28, 22, S.col, 'left', SERIF, '700');
  txt(SCHOOLS[T.school].name, x + w - 20, y + 28, 15, '#b9a8cc', 'right');

  const dps = T.kind === 'buff' ? 0 : (st.dmg * (1 + t.buffD)) / (st.rate / (1 + t.buffR));
  let line = '';
  if (T.kind === 'buff') line = 'Verstärkt: +' + Math.round(st.buffDmg * 100) + '% Schaden, +' + Math.round(st.buffRate * 100) + '% Tempo';
  else line = 'Schaden ' + Math.round(st.dmg * (1 + t.buffD)) + '  ·  ~' + Math.round(dps) + ' Schaden/s  ·  Reichweite ' + Math.round(st.range);
  txt(line, x + 20, y + 56, 15, '#d9cbe8', 'left');
  let extra = [];
  if (st.slow) extra.push('Verlangsamung ' + Math.round(st.slow * 100) + '%');
  if (st.bleed) extra.push('Bluten ' + Math.round(st.bleed) + '/s');
  if (st.crit) extra.push('Kritchance ' + Math.round(st.crit * 100) + '%');
  if (T.drain) extra.push('Blutraub');
  if (t.buffD) extra.push('verstärkt ×' + (1 + t.buffD).toFixed(2));
  txt(extra.join('  ·  ') || ' ', x + 20, y + 78, 14, '#9d8fb4', 'left');

  const uy = y + 100, bh = 52;
  if (t.lvl < MAX_LVL) {
    const c = upgradeCost(t.key, t.lvl);
    button(x + 20, uy, 330, bh, 'AUFWERTEN', {
      col: run.gold >= c ? '#2f8f5b' : '#3a3247', size: 18, font: SERIF,
      sub: '🩸' + c + ' → Stufe ' + (t.lvl + 1),
      off: run.gold < c, fn: () => upgradeTower(t)
    });
  } else {
    panel(x + 20, uy, 330, bh, 12, 'rgba(255,255,255,0.05)', 'rgba(255,210,122,0.4)');
    txt('HÖCHSTE STUFE', x + 185, uy + bh / 2, 17, '#ffd27a', 'center', SERIF, '700');
  }
  button(x + 366, uy, 160, bh, 'VERKAUFEN', {
    col: '#7a3050', size: 15, sub: '+🩸' + Math.round(t.spent * 0.6), fn: () => sellTower(t)
  });
  button(x + 542, uy, 118, bh, 'SCHLIESSEN', { col: '#4b3a63', size: 13, fn: () => { run.selTower = null; sfx('ui'); } });
  wrapText(T.desc, x + 20, y + 176, w - 40, 13, '#7d7190', 16);
}

/* ==========================================================================
   Bildschirme ausserhalb des Kampfes
   ========================================================================== */
const TREE_MAXSCROLL = 0;
let treeTab = 0;

function bgArt(t) {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#1b0a26'); g.addColorStop(0.55, '#0c0416'); g.addColorStop(1, '#07030c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  /* Blutmond */
  const mx = 540, my = 250;
  const mg = ctx.createRadialGradient(mx, my, 20, mx, my, 210);
  mg.addColorStop(0, 'rgba(255,90,120,0.45)'); mg.addColorStop(1, 'rgba(255,60,90,0)');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 210, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#c73a52';
  ctx.beginPath(); ctx.arc(mx, my, 78, 0, 6.2832); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.beginPath(); ctx.arc(mx - 26, my - 18, 15, 0, 6.2832); ctx.arc(mx + 22, my + 24, 21, 0, 6.2832); ctx.fill();
  /* Fledermaeuse */
  for (let i = 0; i < 9; i++) {
    const p = (t * 0.06 + i * 0.13) % 1;
    const x = p * VW * 1.2 - 60, y = 150 + Math.sin(t * 1.4 + i * 2) * 40 + i * 26;
    const w = 7 + (i % 3) * 3, f = Math.sin(t * 8 + i) * 0.5 + 0.7;
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(20,6,26,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.quadraticCurveTo(-w, -w * f, -w * 2, 0);
    ctx.quadraticCurveTo(-w, w * 0.4, 0, 0);
    ctx.moveTo(0, 0); ctx.quadraticCurveTo(w, -w * f, w * 2, 0);
    ctx.quadraticCurveTo(w, w * 0.4, 0, 0);
    ctx.fill(); ctx.restore();
  }
  /* Nebelband ueber der Burgsilhouette */
  const fog = ctx.createLinearGradient(0, 760, 0, 1010);
  fog.addColorStop(0, 'rgba(120,50,90,0)');
  fog.addColorStop(1, 'rgba(120,50,90,0.22)');
  ctx.fillStyle = fog; ctx.fillRect(0, 760, VW, 250);
  /* Burgsilhouette */
  ctx.fillStyle = '#150a22';
  ctx.beginPath();
  ctx.moveTo(0, VH);
  ctx.lineTo(0, 980); ctx.lineTo(70, 980); ctx.lineTo(70, 900); ctx.lineTo(110, 900);
  ctx.lineTo(110, 980); ctx.lineTo(210, 980); ctx.lineTo(210, 840); ctx.lineTo(250, 800);
  ctx.lineTo(290, 840); ctx.lineTo(290, 980); ctx.lineTo(430, 980); ctx.lineTo(430, 870);
  ctx.lineTo(470, 830); ctx.lineTo(510, 870); ctx.lineTo(510, 980); ctx.lineTo(620, 980);
  ctx.lineTo(620, 920); ctx.lineTo(660, 920); ctx.lineTo(660, 980); ctx.lineTo(VW, 980);
  ctx.lineTo(VW, VH); ctx.closePath(); ctx.fill();
  /* Zaun und Grabsteine davor */
  ctx.fillStyle = '#0c0514';
  for (let i = 0; i < 10; i++) {
    const x = 20 + i * 74, h = 40 + ((i * 37) % 26);
    ctx.fillRect(x, VH - h - 130, 26, h);
    ctx.beginPath(); ctx.arc(x + 13, VH - h - 130, 13, Math.PI, 0); ctx.fill();
  }
  ctx.fillStyle = '#080310';
  ctx.fillRect(0, VH - 130, VW, 130);
  ctx.fillStyle = 'rgba(255,190,90,0.55)';
  ctx.fillRect(243, 862, 12, 18); ctx.fillRect(463, 892, 12, 18); ctx.fillRect(83, 930, 10, 16);
  ctx.fillRect(637, 940, 10, 14);
}

/* Abdunkelung, damit Menuetexte ueber dem Hintergrund lesbar bleiben */
function scrim(a) {
  ctx.fillStyle = 'rgba(6,2,10,' + a + ')';
  ctx.fillRect(0, 0, VW, VH);
}

function drawMenu(t) {
  bgArt(t);
  ctx.save();
  ctx.shadowColor = '#e0304f'; ctx.shadowBlur = 28;
  txt('BLUTMOND', VW / 2, 150, 68, '#f5dfe8', 'center', SERIF, '700');
  ctx.restore();
  txt('VAMPIR · TOWER DEFENSE', VW / 2, 202, 17, '#b58aa0', 'center', null, '600');

  panel(60, 470, 600, 92, 16, 'rgba(10,4,16,0.75)', 'rgba(224,48,79,0.35)');
  txt('RANG ' + rank(), 90, 500, 22, '#ffd27a', 'left', SERIF, '700');
  txt('🩸 ' + meta.souls + ' Seelen', 90, 532, 18, '#ff8aa0', 'left');
  txt(meta.kills + ' Feinde vernichtet', 630, 500, 15, '#b9a8cc', 'right');
  txt(meta.nodes.length + '/' + TREE.length + ' Fähigkeiten', 630, 530, 15, '#b9a8cc', 'right');

  button(90, 600, 540, 96, 'KAMPF BEGINNEN', {
    col: '#b81f3e', size: 28, font: SERIF, sub: 'Wähle deine Jagdgründe', subSize: 15,
    fn: () => { scene = 'maps'; sfx('ui'); }
  });
  button(90, 716, 540, 80, 'FÄHIGKEITEN', {
    col: '#5b3aa0', size: 24, font: SERIF, sub: meta.souls + ' Seelen verfügbar', subSize: 14,
    fn: () => { prevScene = 'menu'; scene = 'tree'; sfx('ui'); }
  });
  button(90, 816, 258, 62, meta.sound ? 'TON AN' : 'TON AUS', {
    col: '#3d3352', size: 17, fn: () => { meta.sound = !meta.sound; saveMeta(); sfx('ui'); }
  });
  button(372, 816, 258, 62, 'ZURÜCKSETZEN', {
    col: '#3d3352', size: 17, fn: () => { scene = 'reset'; sfx('ui'); }
  });
  txt('Tipp: Zum Home-Bildschirm hinzufügen — dann läuft das Spiel offline.',
      VW / 2, 1215, 14, 'rgba(190,170,210,0.7)', 'center');
}

function drawResetConfirm(t) {
  bgArt(t);
  scrim(0.5);
  panel(60, 480, 600, 300, 18, 'rgba(10,4,16,0.96)', '#e0304f');
  txt('WIRKLICH LÖSCHEN?', VW / 2, 540, 30, '#f5dfe8', 'center', SERIF, '700');
  wrapText('Alle Seelen, Ränge und freigeschalteten Fähigkeiten gehen unwiderruflich verloren.',
           VW / 2, 600, 520, 16, '#b9a8cc', 22, 'center');
  button(100, 680, 240, 64, 'ABBRECHEN', { col: '#3d3352', size: 18, fn: () => { scene = 'menu'; sfx('ui'); } });
  button(380, 680, 240, 64, 'LÖSCHEN', {
    col: '#b81f3e', size: 18,
    fn: () => { meta = freshMeta(); saveMeta(); scene = 'menu'; sfx('nope'); }
  });
}

function drawMaps(t) {
  bgArt(t);
  scrim(0.45);
  txt('JAGDGRÜNDE', VW / 2, 110, 40, '#f5dfe8', 'center', SERIF, '700');
  for (let i = 0; i < MAPS.length; i++) {
    const m = MAPS[i], y = 220 + i * 210;
    const open = mapUnlocked(i);
    const th = THEME[m.theme];
    panel(40, y, 640, 178, 18, open ? 'rgba(12,5,19,0.9)' : 'rgba(12,5,19,0.55)',
          open ? th.tint : 'rgba(255,255,255,0.08)');
    /* Vorschau des Weges */
    ctx.save();
    ctx.translate(58, y + 22); ctx.scale(0.155, 0.135);
    ctx.fillStyle = th.b; ctx.fillRect(0, 0, COLS * TILE, ROWS * TILE);
    ctx.globalAlpha = open ? 1 : 0.4;
    ctx.strokeStyle = th.roadEdge; ctx.lineWidth = 46; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    m.path.forEach((p, j) => {
      const px = p[0] * TILE + TILE / 2, py = p[1] * TILE + TILE / 2;
      j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    txt(open ? m.name : 'VERSIEGELT', 250, y + 44, 24, open ? '#f0e2f7' : '#6a6280', 'left', SERIF, '700');
    if (open) {
      txt('Ziel: Welle ' + m.goal + ' überstehen', 250, y + 78, 16, '#b9a8cc', 'left');
      txt('Beste Welle: ' + meta.best[i] + (meta.won[i] ? '  ·  ✔ bezwungen' : ''), 250, y + 104, 15,
          meta.won[i] ? '#7ce8a0' : '#9d8fb4', 'left');
      button(250, y + 122, 400, 44, 'ANGREIFEN', {
        col: '#b81f3e', size: 17, font: SERIF, r: 10,
        fn: () => { startRun(i); scene = 'game'; sfx('wave'); }
      });
    } else {
      txt('Bezwinge zuerst „' + MAPS[i - 1].name + '"', 250, y + 84, 16, '#8a7fa0', 'left');
    }
  }
  button(240, 1042, 240, 64, 'ZURÜCK', { col: '#3d3352', size: 18, fn: () => { scene = 'menu'; sfx('ui'); } });
}

function drawTree(t) {
  bgArt(t);
  scrim(0.55);
  txt('FÄHIGKEITEN', VW / 2, 74, 36, '#f5dfe8', 'center', SERIF, '700');
  txt('🩸 ' + meta.souls + ' Seelen  ·  Rang ' + rank(), VW / 2, 116, 18, '#ffd27a', 'center');

  /* Reiter je Schule */
  for (let i = 0; i < 3; i++) {
    const S = SCHOOLS[BRANCH_KEY[i]];
    const x = 16 + i * 232, y = 146, w = 220, h = 56;
    const act = treeTab === i;
    panel(x, y, w, h, 12, act ? shade(S.col, -0.4) : 'rgba(255,255,255,0.05)',
          act ? S.glow : 'rgba(255,255,255,0.08)');
    txt(S.sign + ' ' + S.name, x + w / 2, y + h / 2, 19, act ? '#fff' : '#9d8fb4', 'center', SERIF, '700');
    hitBox(x, y, w, h, () => { treeTab = i; sfx('ui'); });
  }

  const nodes = TREE.filter((n) => n.br === treeTab);
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const y = 224 + i * 116, x = 16, w = 688, h = 104;
    const owned = hasNode(n.id);
    const open = nodeAvailable(n);
    const afford = meta.souls >= n.cost;
    const S = SCHOOLS[BRANCH_KEY[n.br]];

    panel(x, y, w, h, 14,
      owned ? 'rgba(40,20,52,0.9)' : 'rgba(12,5,19,0.82)',
      owned ? S.col : (open ? 'rgba(255,210,122,0.5)' : 'rgba(255,255,255,0.07)'));

    /* Verbindungslinie */
    if (i > 0) {
      ctx.strokeStyle = owned ? S.col : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + 44, y - 12); ctx.lineTo(x + 44, y); ctx.stroke();
    }

    ctx.save();
    ctx.globalAlpha = owned ? 1 : (open ? 0.85 : 0.35);
    ctx.fillStyle = owned ? S.col : '#4a4160';
    ctx.beginPath(); ctx.arc(x + 44, y + 38, 18, 0, 6.2832); ctx.fill();
    ctx.restore();
    txt(owned ? '✔' : (open ? '＋' : '🔒'), x + 44, y + 38, owned ? 20 : 17, owned ? '#10060f' : '#cbbcdd', 'center');

    txt(n.n, x + 78, y + 28, 21, owned ? '#f2e6fa' : (open ? '#f2e6fa' : '#7a7090'), 'left', SERIF, '700');
    wrapText(n.d, x + 78, y + 56, w - 190, 14, owned ? '#b9a8cc' : '#8a7fa0', 18);

    if (owned) {
      txt('ERLERNT', x + w - 20, y + 38, 15, S.col, 'right', null, '700');
    } else {
      txt('🩸 ' + n.cost, x + w - 20, y + 30, 19, afford && open ? '#ffd27a' : '#7a7090', 'right', null, '700');
      if (open) {
        button(x + w - 128, y + 52, 110, 38, afford ? 'LERNEN' : 'ZU TEUER', {
          col: afford ? '#2f8f5b' : '#3a3247', size: 13, r: 10, off: !afford,
          fn: () => {
            meta.souls -= n.cost; meta.nodes.push(n.id); saveMeta(); sfx('build');
            toast(n.n + ' erlernt!');
          }
        });
      } else {
        txt('benötigt Vorstufe', x + w - 20, y + 62, 13, '#6a6280', 'right');
      }
    }
  }
  button(240, 1046, 240, 64, 'ZURÜCK', {
    col: '#3d3352', size: 18,
    fn: () => { scene = (prevScene === 'over') ? 'over' : 'menu'; sfx('ui'); }
  });
  txt('Seelen verdienst du in jedem Kampf — auch wenn du verlierst.',
      VW / 2, 1160, 14, 'rgba(180,160,200,0.6)', 'center');
}

/* ------------------------------------------------------ Stufenaufstieg */
function drawBoonOffer() {
  ctx.fillStyle = 'rgba(5,2,9,0.88)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.save();
  ctx.shadowColor = '#e0304f'; ctx.shadowBlur = 24;
  txt('STUFE ' + run.level, VW / 2, 270, 52, '#f5dfe8', 'center', SERIF, '700');
  ctx.restore();
  txt('Der Blutmond schenkt dir neue Macht — wähle eine Gabe.',
      VW / 2, 330, 17, '#b58aa0', 'center');

  for (let i = 0; i < run.offer.length; i++) {
    const b = run.offer[i], S = SCHOOLS[b.s];
    const x = 50, y = 400 + i * 190, w = 620, h = 160;
    panel(x, y, w, h, 18, shade(S.col, -0.62), S.col);
    ctx.save();
    ctx.globalAlpha = 0.25;
    txt(S.sign, x + w - 70, y + h / 2, 72, S.col, 'center');
    ctx.restore();
    txt(S.name.toUpperCase(), x + 30, y + 34, 14, S.glow, 'left', null, '700');
    txt(b.n, x + 30, y + 72, 30, '#fbf1ff', 'left', SERIF, '700');
    wrapText(b.d, x + 30, y + 112, w - 130, 17, '#d6c8e6', 22);
    hitBox(x, y, w, h, () => takeBoon(b));
  }
}

/* ---------------------------------------------------------- Pause / Ende */
function drawPause() {
  ctx.fillStyle = 'rgba(5,2,9,0.86)'; ctx.fillRect(0, 0, VW, VH);
  txt('PAUSE', VW / 2, 380, 54, '#f5dfe8', 'center', SERIF, '700');
  txt('Welle ' + run.wave + '  ·  Stufe ' + run.level + '  ·  ' + run.kills + ' Abschüsse',
      VW / 2, 440, 18, '#b58aa0', 'center');
  button(140, 520, 440, 84, 'WEITER', { col: '#b81f3e', size: 24, font: SERIF, fn: () => { run.paused = false; sfx('ui'); } });
  button(140, 620, 440, 70, meta.sound ? 'TON AN' : 'TON AUS', {
    col: '#3d3352', size: 19, fn: () => { meta.sound = !meta.sound; saveMeta(); sfx('ui'); }
  });
  button(140, 706, 440, 70, 'KAMPF BEENDEN', {
    col: '#6b2440', size: 19, sub: 'sichert ' + soulsEarned() + ' Seelen',
    fn: () => { run.paused = false; retireRun(); }
  });
}

function drawOver(t) {
  bgArt(t);
  scrim(0.4);
  const won = run.won;
  ctx.save(); ctx.shadowColor = won ? '#ffd27a' : '#e0304f'; ctx.shadowBlur = 24;
  txt(won ? 'TRIUMPH' : (run.retired ? 'RÜCKZUG' : 'DIE SONNE GEHT AUF'),
      VW / 2, 300, won ? 60 : 44, won ? '#ffe6ab' : '#f5dfe8', 'center', SERIF, '700');
  ctx.restore();
  txt(won ? 'Die Jagdgründe gehören dir.' : 'Deine Burg ist gefallen — doch die Nacht kehrt wieder.',
      VW / 2, 360, 17, '#b58aa0', 'center');

  panel(70, 420, 580, 250, 18, 'rgba(10,4,16,0.9)', 'rgba(224,48,79,0.35)');
  const rows = [
    ['Erreichte Welle', String(run.wave)],
    ['Vernichtete Feinde', String(run.kills)],
    ['Stufe des Fürsten', String(run.level)],
    ['Errichtete Türme', String(run.towers.length)]
  ];
  rows.forEach((r, i) => {
    txt(r[0], 104, 464 + i * 42, 17, '#b9a8cc', 'left');
    txt(r[1], 616, 464 + i * 42, 19, '#f2e6fa', 'right', null, '700');
  });
  txt('SEELEN ERHALTEN', 104, 636, 17, '#ffd27a', 'left', null, '700');
  txt('🩸 ' + (run.finalSouls || 0), 616, 636, 24, '#ffd27a', 'right', SERIF, '700');

  button(90, 710, 540, 84, 'NOCHMAL ANGREIFEN', {
    col: '#b81f3e', size: 23, font: SERIF,
    fn: () => { startRun(run.mapIndex); scene = 'game'; sfx('wave'); }
  });
  button(90, 810, 258, 70, 'FÄHIGKEITEN', {
    col: '#5b3aa0', size: 17, sub: meta.souls + ' Seelen',
    fn: () => { prevScene = 'over'; scene = 'tree'; sfx('ui'); }
  });
  button(372, 810, 258, 70, 'HAUPTMENÜ', {
    col: '#3d3352', size: 17, fn: () => { scene = 'menu'; sfx('ui'); }
  });
  if (won) {
    button(90, 900, 540, 62, 'ENDLOS WEITERKÄMPFEN', {
      col: '#2f8f5b', size: 17, font: SERIF,
      fn: () => { run.endless = true; run.retired = false; scene = 'game'; sfx('wave'); }
    });
  }
}

/* ==========================================================================
   Hauptschleife
   ========================================================================== */
let last = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000) || 0;
  last = now;
  sfxBudget = 0;
  uiHit.length = 0;
  const t = now / 1000;

  ctx.clearRect(0, 0, VW, VH);
  ctx.fillStyle = '#07030c'; ctx.fillRect(0, 0, VW, VH);

  if (scene === 'menu') drawMenu(t);
  else if (scene === 'reset') drawResetConfirm(t);
  else if (scene === 'maps') drawMaps(t);
  else if (scene === 'tree') drawTree(t);
  else if (scene === 'over') drawOver(t);
  else if (scene === 'game') {
    const frozen = run.paused || !!run.offer;
    if (!frozen) {
      const steps = run.speed;
      for (let i = 0; i < steps; i++) tick(dt);
    }
    ctx.save();
    if (run.shake > 0) {
      ctx.translate((Math.random() - 0.5) * run.shake * 16, (Math.random() - 0.5) * run.shake * 16);
    }
    drawField();
    ctx.restore();
    drawHUD();
    drawPanel();
    drawTowerInfo();
    /* Roter Schleier bei Treffern auf die Burg */
    if (run.flash > 0) {
      ctx.save();
      ctx.globalAlpha = run.flash * 0.45;
      ctx.fillStyle = run.flashCol;
      ctx.fillRect(0, FIELD_Y, VW, FIELD_H);
      ctx.restore();
    }
    if (run.sel) {
      const T = TOWERS[run.sel];
      txt('Tippe auf ein freies Feld — ' + T.name + ' (🩸' + T.cost + ')',
          VW / 2, PANEL_Y - 24, 16, '#ffd27a', 'center', null, '700');
    }
    drawToast(dt);
    if (run.offer) drawBoonOffer();
    else if (run.paused) drawPause();
  }

  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ Start */
function init() {
  meta = loadMeta();
  resize();
  const boot = document.getElementById('boot');
  if (boot) boot.classList.add('hide');
  last = performance.now();
  requestAnimationFrame(frame);
}
init();
