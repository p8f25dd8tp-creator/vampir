'use strict';
/* ==========================================================================
   KAMPAGNE — ein einziger Modus statt Story + Arcade.
   Etappen nach dem Buch (die 15 Kapitel), je 8 Level, die schwerer werden;
   Level 8 ist der Boss der Etappe. Sterne, erste Belohnungen, Helden werden
   ueber die Kampagne freigeschaltet.
   Hauptmenue mit Tab-Leiste: Kampagne · Helden · Ausruestung · Familie ·
   System (Talente) · Herausforderungen (Endlos-Nacht, Boss-Turm, taeglich).
   ========================================================================== */

/* ============================================================ Speicherstand */
function campSave() {
  if (!SAVE.camp) {
    const st = SAVE.story || {};
    SAVE.settings.testUnlock = false; // Kampagne: Helden und Etappen werden erspielt (im Menue wieder einschaltbar)
    SAVE.camp = { stars: {}, crystals: st.crystals || 0, hero: 'finn', etappe: 1, gear: {}, castle: 0, party: [], tower: 0, endless: 0, daily: null };
  }
  const C = SAVE.camp;
  if (C.v !== 2) { C.v = 2; C.stars = {}; C.etappe = 1; C.tower = 0; } // neue Etappen nach dem Buch
  C.stars = C.stars || {}; C.gear = C.gear || {}; C.party = C.party || [];
  if (C.crystals === undefined) C.crystals = 0;
  return C;
}
function lvKey(e, l) { return e + '-' + l; }
function lvStars(e, l) { return campSave().stars[lvKey(e, l)] || 0; }
function etappeCleared(e) { return e >= 1 && e <= ETAPPEN.length && lvStars(e, lvCount(e)) > 0; }
function lvOpen(e, l) {
  if (SAVE.settings.testUnlock) return true;
  if (l === 1) return e === 1 || etappeCleared(e - 1);
  return lvStars(e, l - 1) > 0;
}
function etappeOpen(e) { return lvOpen(e, 1); }
function starsOf(e) { let s = 0; for (let l = 1; l <= lvCount(e); l++) s += lvStars(e, l); return s; }
function chapterCleared(n) { return etappeCleared(ET_OF_CH[n] || 99); }
// Levelaufbau: jedes Level beginnt bei null; mit jedem Level mehr und staerkere Gegner und laengere Dauer.
// Level 8 ist die volle Nacht bis zum Boss der Etappe.
const LV_DUR = [150, 180, 210, 240, 270, 300, 330, 0];
const CAMP_DIFF = { hp: 1.6, dmg: 1.5, count: 1.15 };
const LV_PACE = [1.3, 1.45, 1.6, 1.75, 1.8, 1.85, 1.9];
function lvDiff(l) { const k = l - 1; return { hp: 1 + 0.14 * k, count: 1 + 0.05 * k, dmg: 1 + 0.05 * k }; }

/* ============================================================ Helden ueber die Kampagne */
const HERO_UNLOCK = { finn: 0, lena: '1-5', leo: '1-7', emma: '1-8', leander: '1-9', fabian: '1-10', sil: '1-14', peter: '1-15', fex: '2-2', agathon: '2-9', sam: '2-10', chris: 5, mia: 10, draco: 11 };
function unlockDone(u) { if (!u) return true; if (typeof u === 'number') return etappeCleared(u); const [e, l] = u.split('-').map(Number); return lvStars(e, l) > 0; }
function unlockText(u) { if (typeof u === 'number') return `Etappe ${u} „${ET(u).title}“ abschließen`; const [e, l] = u.split('-').map(Number); return `Etappe ${e}, Stufe ${l} „${lvDef(e, l).name}“ schaffen`; }
const HERO_UNLOCK_ETAPPE = {}; for (const id in HERO_UNLOCK) { const u = HERO_UNLOCK[id]; HERO_UNLOCK_ETAPPE[id] = typeof u === 'number' ? u : +u.split('-')[0]; }
for (const id in HERO_UNLOCK) {
  const u = HERO_UNLOCK[id]; if (!HEROES[id]) continue;
  HEROES[id].unlock = u ? { camp: u, cost: 0, desc: `Schalte ${HEROES[id].name} frei: ${unlockText(u)}.`, check: () => unlockDone(u) } : { cost: 0, desc: 'Von Anfang an verfügbar.', check: () => true };
}
isUnlocked = function (id) { if (SAVE.settings.testUnlock) return true; const u = HERO_UNLOCK[id]; return u === undefined ? !!SAVE.unlocked[id] : unlockDone(u); };

/* ============================================================ Ausruestung (Bestienwaffen) */
const RARITY = [
  { name: 'Basis', col: '#b8b8c0' }, { name: 'Mittel', col: '#6ad86a' }, { name: 'Hoch', col: '#5aa8ff' },
  { name: 'König', col: '#c87aff' }, { name: 'Halbgott', col: '#ffc040' }, { name: 'Dämon', col: '#ff3a4e' }
];
const RARITY_NEEDS = [0, 1, 2, 5, 8, 11]; // Etappe, die fuer diese Stufe geschafft sein muss
const GEAR2 = {
  waffe: { name: 'Bestienwaffe', stat: '+3 % Schaden', icon: 'blade', apply: (st, P) => { st.might *= 1 + 0.03 * P; } },
  handschuhe: { name: 'Bestienhandschuhe', stat: '−1 % Abklingzeit', icon: 'fist', apply: (st, P) => { st.cd *= Math.max(0.5, 1 - 0.01 * P); } },
  ruestung: { name: 'Bestienrüstung', stat: '+4 % Leben', icon: 'shield', apply: (st, P) => { st.maxHp *= 1 + 0.04 * P; } },
  stiefel: { name: 'Bestienstiefel', stat: '+1,5 % Tempo', icon: 'wind', apply: (st, P) => { st.speed *= 1 + 0.015 * P; st.dodgeCdMul *= Math.pow(0.992, P); } },
  amulett: { name: 'Kristallamulett', stat: '+3 % Erfahrung und Sammelradius', icon: 'orb', apply: (st, P) => { st.xpMul *= 1 + 0.03 * P; st.pickup *= 1 + 0.03 * P; } }
};
function gearOf(id) { const g = campSave().gear[id]; return g || { r: 0, l: 0 }; }
function gearPower(id) { const g = gearOf(id); return g.r * 10 + g.l; }
function gearCost(id) { const g = gearOf(id); return g.l >= 10 ? Math.round(80 * Math.pow(g.r + 1, 2)) : Math.round((5 + g.l * 3) * Math.pow(g.r + 1, 1.5)); }
function gearCan(id) { const g = gearOf(id), C = campSave(); if (g.r >= RARITY.length - 1 && g.l >= 10) return false; if (g.l >= 10 && !SAVE.settings.testUnlock && !etappeCleared(RARITY_NEEDS[g.r + 1])) return false; return C.crystals >= gearCost(id); }
function gearUp(id) { const C = campSave(); if (!gearCan(id)) return; const g = Object.assign({}, gearOf(id)); C.crystals -= gearCost(id); if (g.l >= 10) { g.r++; g.l = 1; } else g.l++; C.gear[id] = g; writeSave(); sfx(g.l === 1 ? 'fusion' : 'level'); }

/* ============================================================ Familie (Die Verfluchten) */
const CASTLE_MAX = 10;
function castleCost() { return Math.round(150 * Math.pow(campSave().castle + 1, 1.6)); }
function partySlots() { const c = campSave().castle; return c >= 7 ? 3 : c >= 3 ? 2 : 1; }
const COMP_HERO = { peter: 'peter', lena: 'lena', fabian: 'fabian', leo: 'leo', emma: 'emma', fex: 'fex', sendraco: 'draco', minny: 'mia' };
companionOpen = function (id) { return isUnlocked(COMP_HERO[id] || id); };
companionFits = function () { return true; };
compName = function (id) { return COMPANIONS[id].name; };
companionParty = function () {
  const C = campSave(), hero = GAME ? GAME.hero : C.hero;
  C.party = C.party.filter((id) => COMPANIONS[id] && companionOpen(id)).slice(0, partySlots());
  const forced = (GAME && GAME.lv && GAME.lv.comp) || [];
  return [...new Set(forced.concat(C.party))].filter((id) => COMPANIONS[id] && COMP_HERO[id] !== hero).slice(0, 3);
};

/* ============================================================ System-Talente (ersetzt den Altar) */
Object.assign(META, {
  regen: { name: 'Blutkreislauf', desc: '+0,3 Leben pro Sekunde', max: 5 },
  panzer: { name: 'Panzerhaut', desc: '+1 Rüstung', max: 3 },
  fokus: { name: 'Fokus', desc: '−4 % Abklingzeit', max: 5 },
  kristall: { name: 'Kristallsinn', desc: '+15 % Bestienkristalle', max: 5 }
});
const TALENT_ORDER = ['vitae', 'macht', 'eile', 'magnet', 'gier', 'wurf', 'wiedergeburt', 'regen', 'panzer', 'fokus', 'kristall'];
const TALENT_ICON = { vitae: ['shield', '#ff3a4e'], macht: ['fist', '#ff8a3a'], eile: ['wind', '#bff0d8'], magnet: ['ring', '#b58cff'], gier: ['orbs', '#e0c890'], wurf: ['star', '#ffe6a0'], wiedergeburt: ['pillar', '#ffffff'], regen: ['pool', '#ff5a6a'], panzer: ['shield', '#b8c0c8'], fokus: ['eye', '#4ff0cc'], kristall: ['orbs', '#8ad8ff'] };
function talentStars() { let s = 0; for (const k of TALENT_ORDER) s += SAVE.meta[k] || 0; return s; }
function talentCost() { return 150 + talentStars() * 60; }
function talentDraw() {
  const open = TALENT_ORDER.filter((k) => (SAVE.meta[k] || 0) < META[k].max);
  if (!open.length || SAVE.souls < talentCost()) return null;
  SAVE.souls -= talentCost();
  const k = open[Math.floor(Math.random() * open.length)];
  SAVE.meta[k] = (SAVE.meta[k] || 0) + 1; writeSave(); sfx('fusion');
  return k;
}
const _rcCamp = recomputeStats;
recomputeStats = function () {
  _rcCamp();
  const p = GAME.p, st = p.st, M = SAVE.meta;
  st.regen += 0.3 * (M.regen || 0); st.armor += (M.panzer || 0); st.cd *= Math.pow(0.96, M.fokus || 0);
};

/* ============================================================ Taegliche Aufgaben */
function todayKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function dailySave() {
  const C = campSave();
  if (!C.daily || C.daily.day !== todayKey()) C.daily = { day: todayKey(), prog: { levels: 0, kills: 0, level: 0 }, got: {} };
  return C.daily;
}
const DAILY = [
  { id: 'levels', text: 'Schaffe 2 Kampagnen-Level', goal: 2, reward: { souls: 120, crystals: 20 } },
  { id: 'kills', text: 'Besiege 600 Gegner', goal: 600, reward: { souls: 100, crystals: 15 } },
  { id: 'level', text: 'Erreiche Stufe 20 in einem Lauf', goal: 20, reward: { souls: 150, crystals: 25 } }
];

/* ============================================================ Lauf starten */
function campStart(mode, e, l) {
  const C = campSave(), hero = isUnlocked(C.hero) ? C.hero : 'finn';
  const ch = mode === 'endless' ? CHAPTERS[0] : mode === 'tower' ? CHAPTERS[e - 1] : lvChapter(e, l);
  const camp = { mode, e, l, ch, lv: mode === 'level' ? lvDef(e, l) : null };
  AudioSys.init(); MENU = null; UI.clear(); applyQuality();
  PENDING_FINN = hero === 'finn' ? 0 : undefined;
  newRun(hero, { camp });
  UI.showHud();
}
const _newRunCamp = newRun;
newRun = function (heroId, opts) {
  _newRunCamp(heroId, opts);
  const cp = opts && opts.camp; if (!cp || !GAME) return;
  const G = GAME; G.camp = cp;
  if (cp.mode === 'endless') { G.campGoal = Infinity; return; }
  const ch = cp.ch; G.lv = cp.lv; setTheme(cp.lv && cp.lv.theme || ch.theme); storySetup(G, ch);
  if (cp.lv && cp.lv.roles) G.roles = Object.assign({}, ch.roles, cp.lv.roles);
  const ek = cp.mode === 'endless' ? 0 : cp.e - 1; G.diffHp *= CAMP_DIFF.hp * (1 + 0.25 * ek); G.diffDmg *= CAMP_DIFF.dmg * (1 + 0.12 * ek); G.diffCount *= CAMP_DIFF.count * (1 + 0.02 * ek); // Kampagne haerter als die alte Story (Ausruestung, Burg, Talente)
  const C = campSave(), M = SAVE.meta, fam = C.castle;
  G.statMod = (st) => { for (const id in GEAR2) GEAR2[id].apply(st, gearPower(id)); st.might *= 1 + 0.02 * fam; st.maxHp *= 1 + 0.03 * fam; };
  G.crystalMul = 1 + 0.15 * (M.kristall || 0);
  if (cp.mode === 'tower') { // Boss frueh, aber staerker
    G.campGoal = Infinity; G.diffBoss = 1 + cp.e * 0.15; G.diffDmg *= 1 + cp.e * 0.04;
    G.events = [{ t: 150, kind: 'boss', type: 'boss', text: ch.texts.boss }]; G.pendingLevels += 3; G.quests = [];
  } else campLevelSetup(G, cp);
  if (G.berserk) { const sm = G.statMod; G.statMod = (st) => { sm(st); st.might *= 2; st.maxHp *= 0.5; st.speed *= 1.2; }; }
  recomputeStats(); G.p.hp = G.p.st.maxHp;
};
// Stufe nach ihrer Art aufbauen
function campLevelSetup(G, cp) {
  const L = cp.lv, n = lvCount(cp.e), frac = n > 1 ? (cp.l - 1) / (n - 1) : 1, ch = cp.ch;
  G.diffHp *= 1 + 0.9 * frac; G.diffCount *= 1 + 0.3 * frac; G.diffDmg *= 1 + 0.3 * frac;
  G.quests = [];
  const pace = L.pace || 1.3, foe = L.foe || ch.roles.boss;
  const base = G.events.filter((ev) => ev.kind !== 'boss');
  const scaled = (until) => base.map((ev) => Object.assign({}, ev, { t: ev.t / pace })).filter((ev) => ev.t < until - 12);
  const withBoss = (t) => { G.roles = Object.assign({}, G.roles, { boss: foe }); return [{ t, kind: 'boss', type: 'boss' }]; };
  switch (L.type) {
    case 'duel': case 'endure':
      G.campGoal = L.type === 'endure' ? L.dur : Infinity; G.diffCount *= L.crowd == null ? 0.3 : Math.max(0.01, L.crowd);
      G.diffDmg *= 0.5 + 0.35 * frac; G.diffBoss = 0.85 + 0.3 * frac;
      G.events = withBoss(2.5); G.pendingLevels = (G.pendingLevels || 0) + Math.round(3 + frac * 9); break; // Duell: Startstufen, weil kaum Erfahrung faellt
    case 'waveboss':
      G.pace = pace; G.campGoal = Infinity; G.events = scaled(L.at).concat(withBoss(L.at)); break;
    case 'boss':
      G.campGoal = Infinity; G.diffBoss = (G.diffBoss || 1) * (1 + 0.06 * cp.e);
      if (L.full) G.roles = Object.assign({}, G.roles, { boss: foe });
      else { G.pace = pace; G.events = scaled(L.at).concat(withBoss(L.at)); }
      break;
    case 'hunt': {
      G.pace = pace; G.campGoal = Infinity; G.events = scaled(9999).filter((ev) => ev.kind !== 'miniboss');
      const nm = ENEMIES[G.roles[L.role]].name;
      G.hunt = { role: L.role, n: L.n, k: 0 }; G.quests = [{ q: { type: 'hunt', text: nm + ' erlegen', n: L.n }, prog: 0, done: false }];
      break; }
    default: // survive, berserk
      G.pace = pace; G.campGoal = L.dur; G.events = scaled(L.dur);
  }
  if (L.elites) for (let i = 0; i < L.elites; i++) G.events.push({ t: (i + 1) * G.campGoal / (L.elites + 1), kind: 'elite', type: 'knight' });
  G.events.sort((a, b) => a.t - b.t);
  if (L.type === 'berserk') G.berserk = { cd: 0 };
}
// Bloodsucker: wilde Klauenhiebe gegen alles in Reichweite (zusaetzlich zu den Faehigkeiten)
function bloodsuckerClaws(G, dt) {
  const B = G.berserk, p = G.p; B.cd -= dt; if (B.cd > 0) return;
  const tgt = nearestEnemy(p.x, p.y, 95); if (!tgt) return;
  B.cd = 0.34; const a = Math.atan2(tgt.y - p.y, tgt.x - p.x);
  forEnemiesInRadius(p.x + Math.cos(a) * 36, p.y + Math.sin(a) * 36, 58, (o) => dealDamage(o, 14 * p.st.might, 'blood', 'klauen', { kb: 140, kx: o.x - p.x, ky: o.y - p.y }));
  healPlayer(1.2, true); burstBlood(tgt.x, tgt.y - 14, 5, 0.8); p.castT = 0.25; p.castMax = 0.25; p.castAim = a;
}
if (typeof SRC_NAMES !== 'undefined') SRC_NAMES.klauen = 'Bloodsucker-Klauen';
// Ziel erreicht: Level geschafft
const _updCamp = updateGame;
updateGame = function (dt) {
  _updCamp(dt);
  const G = GAME;
  if (G && G.berserk && G.state === 'play' && G.p.alive) bloodsuckerClaws(G, dt);
  // Finn hat das Buch ab Etappe 1, Stufe 2 schon (nur die erste Stufe erzaehlt, wie er es findet)
  if (G && G.camp && G.hero === 'finn' && G.state === 'play' && !G.bookGiven && G.p.alive && !(G.camp.mode === 'level' && G.camp.e === 1 && G.camp.l === 1)) {
    G.bookGiven = true; if (!(G.p.tier > 0)) { G.pickups = G.pickups.filter((q) => q.kind !== 'book'); finnEvolve(1); }
  }
  if (G && G.camp && G.p && G.state === 'play') G.minHpF = Math.min(G.minHpF == null ? 1 : G.minHpF, G.p.hp / G.p.st.maxHp);
  if (G && G.camp && G.state === 'play' && !G.won && G.p.alive && G.t >= G.campGoal) {
    G.won = true; sfx('win'); UI.announce('LEVEL GESCHAFFT', 'fusion'); GAME.later(1.6, () => endRun(true));
  }
};
// Kristalle aus Kills, verstaerkt durch Kristallsinn
const _onKillCamp = storyOnKill;
storyOnKill = function (e) { const G = GAME, c0 = G.crystals || 0; _onKillCamp(e);
  if (G.hunt && e.role === G.hunt.role && !G.won) { const H = G.hunt; H.k++; const Q = G.quests[0]; if (Q) { Q.prog = H.k; Q.done = H.k >= H.n; } if (H.k >= H.n) { G.won = true; sfx('win'); UI.announce('JAGD ERFOLGREICH', 'fusion'); GAME.later(1.6, () => endRun(true)); } } if (G.crystalMul && (G.crystals || 0) > c0) G.crystals = c0 + Math.round(((G.crystals || 0) - c0) * G.crystalMul); };

/* ============================================================ Laufende: Sterne und Belohnungen */
function campResult(won) {
  const G = GAME, cp = G.camp, C = campSave(), D = dailySave(), p = G.p;
  const res = { won, crystals: G.crystals || 0, stars: 0, first: false, bonus: null, unlocked: [] };
  D.prog.kills += G.kills; D.prog.level = Math.max(D.prog.level, G.level);
  if (cp.mode === 'endless') { C.endless = Math.max(C.endless || 0, Math.floor(G.t)); }
  else if (cp.mode === 'tower') { if (won && cp.e > (C.tower || 0)) { C.tower = cp.e; res.first = true; res.bonus = { souls: 80 * cp.e, crystals: 15 * cp.e }; } }
  else if (won) {
    D.prog.levels++;
    const hp = G.minHpF == null ? p.hp / p.st.maxHp : G.minHpF; res.stars = 1 + (hp >= 0.3 ? 1 : 0) + (hp >= 0.6 ? 1 : 0); // Sterne nach dem tiefsten Lebensstand
    const key = lvKey(cp.e, cp.l), old = C.stars[key] || 0;
    if (!old) { res.first = true; const last = cp.l === lvCount(cp.e); res.bonus = { souls: 30 * cp.e + (last ? 150 * cp.e : 0), crystals: 6 * cp.e + (last ? 25 * cp.e : 0) }; }
    C.stars[key] = Math.max(old, res.stars);
    if (!old) { const k = cp.e + '-' + cp.l; for (const id in HERO_UNLOCK) { const u = HERO_UNLOCK[id]; if (u === k || (u === cp.e && cp.l === lvCount(cp.e))) res.unlocked.push(id); } if (cp.l === lvCount(cp.e) && cp.e < ETAPPEN.length) C.etappe = cp.e + 1; }
  }
  C.crystals += res.crystals;
  if (res.bonus) { C.crystals += res.bonus.crystals; SAVE.souls += res.bonus.souls; }
  writeSave();
  return res;
}
const _showEndCamp = UI.showEnd;
UI.showEnd = function (won, souls, newly, extra) {
  const G = GAME;
  if (!G || !G.camp) return _showEndCamp.call(this, won, souls, newly, extra);
  this.hideHud();
  const R = campResult(won), cp = G.camp, C = campSave();
  const title = cp.mode === 'endless' ? 'ASCHEFRIEDHOF' : cp.mode === 'tower' ? `BOSS-TURM · STOCK ${cp.e}` : `ETAPPE ${cp.e} · STUFE ${cp.l}`;
  const stars = cp.mode === 'level' ? `<div class="bigstars">${[1, 2, 3].map((i) => `<span class="${i <= R.stars ? 'on' : ''}">★</span>`).join('')}</div>` : '';
  const tot = Object.values(G.stats.dmg).reduce((a, b) => a + b, 0) || 1;
  const top = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 5), max = top.length ? top[0][1] : 1;
  const dm = top.map(([k, v]) => `<div class="dmgrow"><span>${SRC_NAMES[k] || k}</span><div class="bar"><i style="width:${(v / max * 100).toFixed(0)}%;background:#6ac8ff"></i></div><span class="n">${Math.round(v / tot * 100)}%</span></div>`).join('');
  const nextOk = cp.mode === 'level' && won && (cp.l < lvCount(cp.e) ? true : cp.e < ETAPPEN.length);
  const form = HEROES[G.hero].evoHero || G.hero === 'finn' ? `<span>Erreichte Form</span><span>${(HEROES[G.hero].tiers || FINN_TIERS)[G.p.tier || 0].name}</span>` : '';
  this.show(`<div class="syswin big" style="width:min(520px,100%);margin:auto 0">
    <div class="syshead">[ SYSTEM ] · ${title}</div>
    <div class="bigres ${won ? 'win' : 'lose'}" style="font-size:clamp(26px,8vw,40px)">${cp.mode === 'endless' ? fmtTime(G.t) : won ? 'GESCHAFFT' : 'GESCHEITERT'}</div>
    ${stars}
    <div class="sysplace" style="text-align:center">${cp.mode === 'endless' ? 'Beste Nacht: ' + fmtTime(C.endless) : cp.lv ? cp.lv.name : cp.ch.title} · Stufe ${G.level} · ${G.kills} besiegt</div>
    ${won && cp.lv && cp.lv.evo ? `<div style="text-align:center;margin:8px 0"><div class="syshead">[ SYSTEM ] · EVOLUTION</div><div class="cinzel" style="font-size:22px;font-weight:800;color:#ff5a6a">${cp.lv.evo}</div></div>` : ''}
    ${R.unlocked.length ? `<div style="text-align:center;margin:10px 0"><div class="syshead">[ SYSTEM ] · NEUE HELDEN</div>${R.unlocked.map((id) => `<div class="cinzel" style="font-size:20px;font-weight:800;color:#ffe6a0">${HEROES[id].name}</div>`).join('')}</div>` : ''}
    <div class="kv"><span>Bestienkristalle</span><span style="color:#8ad8ff">+${R.crystals}${R.bonus ? ' +' + R.bonus.crystals + ' (erstes Mal)' : ''} ◆</span>
      <span>Seelen</span><span style="color:#d8c0ff">+${souls}${R.bonus ? ' +' + R.bonus.souls + ' (erstes Mal)' : ''}</span>${form}</div>
    <div class="syshead" style="margin-top:6px">SCHADEN</div>${dm}
    <div class="btns">${nextOk ? '<button class="btn primary" data-act="campnext">Nächstes Level</button>' : ''}
      <button class="btn ${nextOk ? '' : 'primary'}" data-act="campagain">${won ? 'Wiederholen' : 'Nochmal'}</button>
      <button class="btn ghost" data-act="home" data-tab="kampagne">Zum Menü</button></div></div>`, 'end', 'dim');
};
const _pauseCamp = UI.showPause;
UI.showPause = function () { if (GAME && GAME.camp) return _ui.showPause.call(this); return _pauseCamp.call(this); };
const _hudCamp = UI.showHud;
UI.showHud = function () {
  _hudCamp.call(this);
  const G = GAME; if (!G || !G.camp || !this.hud) return;
  const cp = G.camp;
  const later = (f) => { const go = () => { if (document.getElementById('evo')) return setTimeout(go, 500); f(); }; setTimeout(go, 1200); };
  if (cp.mode === 'level') later(() => this.sysWindow(`ETAPPE ${cp.e} · STUFE ${cp.l}`, cp.lv.name, lvGoal(cp.e, cp.l)));
  if (cp.mode === 'tower') later(() => this.sysWindow('BOSS-TURM · STOCK ' + cp.e, 'Besiege ' + ENEMIES[cp.ch.roles.boss].name, 'Stärker als in der Kampagne'));
};

/* ============================================================ Hauptmenue mit Tab-Leiste */
const TABS = [['kampagne', 'Kampagne', 'star', '#ffe6a0'], ['helden', 'Helden', 'clone', '#ff9aaa'], ['ausruestung', 'Schmiede', 'blade', '#8ad8ff'], ['familie', 'Familie', 'shield', '#ff3a4e'], ['system', 'System', 'eye', '#c8a0ff'], ['events', 'Herausf.', 'tornado', '#6affd8']];
const TAB_ICONS = {};
function tabIcon(sym, col) { const k = sym + col; if (!TAB_ICONS[k]) { const S = 72, c = mkCanvas(S, S), g = c.getContext('2d'); g.translate(S / 2, S / 2); g.scale(0.7, 0.7); symIcon(sym, col)(g, (cc, r) => { g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(glowSprite(cc, true), -r, -r, r * 2, r * 2); g.restore(); }); TAB_ICONS[k] = c.toDataURL(); } return TAB_ICONS[k]; }
function iconImg(k) { if (!ICON_EXTRA[k] && TALENT_ICON[k]) ICON_EXTRA[k] = symIcon(TALENT_ICON[k][0], TALENT_ICON[k][1]); return icon(k); }
UI.tab = UI.tab || 'kampagne';
UI.showTitle = function () { return this.showHome(this.tab); };
UI.showHome = function (tab) {
  if (GAME && GAME.state !== 'menu') GAME.state = 'menu';
  this.hideHud(); this.tab = tab || this.tab || 'kampagne';
  const C = campSave(); dailySave();
  if (!isUnlocked(C.hero)) C.hero = 'finn';
  MENU = null; setTheme(this.tab === 'kampagne' ? ET(this.selEtappe || C.etappe || 1).theme : 'friedhof'); menuScene();
  const head = `<div class="hometop"><div class="hprof"><canvas id="homehero"></canvas><div><b>${HEROES[C.hero].name}</b><small>${starsTotal()} ★</small></div></div>
    <div class="hcur"><span style="color:#d8c0ff">✦ ${SAVE.souls}</span><span style="color:#8ad8ff">◆ ${C.crystals}</span></div>
    <div class="hbtns"><button class="ibtn" data-act="codex">📖</button><button class="ibtn" data-act="settings">⚙</button></div></div>`;
  const body = ({ kampagne: () => this.homeKampagne(), helden: () => this.homeHelden(), ausruestung: () => this.homeGear(), familie: () => this.homeFamilie(), system: () => this.homeSystem(), events: () => this.homeEvents() })[this.tab]();
  const bar = `<div class="tabbar">${TABS.map(([id, nm, sym, col]) => `<button class="tabb ${id === this.tab ? 'on' : ''}" data-act="home" data-tab="${id}"><img src="${tabIcon(sym, col)}"><span>${nm}</span></button>`).join('')}</div>`;
  const d = this.show(`<div class="home">${head}<div class="hbody">${body}</div>${bar}</div>`, 'home');
  const hc = $('#homehero'); if (hc) { const r = hc.getBoundingClientRect(); hc.width = Math.round(r.width * VIEW.dpr); hc.height = Math.round(r.height * VIEW.dpr); this.previews.push({ c: hc, id: C.hero, t: 0 }); }
  d.querySelectorAll('canvas[data-prev]').forEach((c) => { const r = c.getBoundingClientRect(); c.width = Math.round(r.width * VIEW.dpr); c.height = Math.round(r.height * VIEW.dpr); this.previews.push({ c, id: c.dataset.prev, t: Math.random() * 5 }); });
  d.querySelectorAll('canvas[data-boss]').forEach((c) => drawBossThumb(c, +c.dataset.boss));
  return d;
};
function starsTotal() { let s = 0; for (const k in campSave().stars) s += campSave().stars[k]; return s; }
function drawBossThumb(c, n) {
  const C2 = CHAPTERS[ET(n).ch - 1], r = c.getBoundingClientRect(); c.width = Math.round(r.width * VIEW.dpr); c.height = Math.round(r.height * VIEW.dpr);
  const g = c.getContext('2d'), th = THEMES[C2.theme];
  g.fillStyle = rg(g, c.width / 2, c.height * 0.7, 2, c.width, [0, th.ambient.replace('rgb', 'rgba').replace(')', ',0.9)'), 1, 'rgba(0,0,0,0)']); g.fillRect(0, 0, c.width, c.height);
  g.setTransform(c.height / 330, 0, 0, c.height / 330, c.width / 2, c.height * 0.94); g.lineCap = 'round'; g.lineJoin = 'round';
  try { BOSS_ART[ENEMIES[C2.roles.boss].bossDraw](g, { t: 1.2, run: 0 }); } catch (err) { /* egal */ }
  if (!etappeOpen(n)) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(0,0,0,0.9)'; g.fillRect(0, 0, c.width, c.height); }
}
UI.homeKampagne = function () {
  const C = campSave(), e = this.selEtappe || C.etappe || 1, ch = ET(e), open = etappeOpen(e), N = lvCount(e);
  if (!this.selLevel || !lvOpen(e, this.selLevel)) { this.selLevel = 1; for (let l = 1; l <= N; l++) if (lvOpen(e, l)) this.selLevel = l; }
  const nodes = Array.from({ length: N }, (_, i) => { const l = i + 1, s = lvStars(e, l), o = lvOpen(e, l), boss = l === N;
    return `<button class="lvnode ${boss ? 'boss' : ''} ${o ? '' : 'locked'} ${l === this.selLevel ? 'sel' : ''}" data-act="lvsel" data-l="${l}" ${o ? '' : 'disabled'}><b>${boss ? '☠' : l}</b><i>${o ? '★'.repeat(s) + '☆'.repeat(3 - s) : '🔒'}</i></button>`; }).join('');
  const l = this.selLevel, boss = l === N, goal = lvGoal(e, l);
  return `<div class="etnav"><button class="btn small ghost" data-act="etappe" data-d="-1" ${e > 1 ? '' : 'disabled'}>‹</button>
      <div class="ettitle"><div class="etnum">ETAPPE ${e}</div><div class="etname">${ch.title}</div><div class="etsub">${ch.place} · ${starsOf(e)}/${N * 3} ★</div></div>
      <button class="btn small ghost" data-act="etappe" data-d="1" ${e < ETAPPEN.length ? '' : 'disabled'}>›</button></div>
    <div class="etcard"><canvas data-boss="${e}"></canvas>${open ? '' : `<div class="etlock">🔒 Schließe Etappe ${e - 1} ab</div>`}</div>
    <div class="lvgrid">${nodes}</div>
    <div class="lvinfo">${open ? `<b>Stufe ${l}: ${lvDef(e, l).name}</b> — ${goal}<br><small>${lvDef(e, l).text}</small>` : ''}</div>
    <button class="btn primary startbtn" data-act="campgo" ${open && lvOpen(e, l) ? '' : 'disabled'}>STARTEN<small>mit ${HEROES[C.hero].name}</small></button>`;
};
UI.homeHelden = function () {
  const C = campSave();
  if (!this.selHero || !HERO_ORDER.includes(this.selHero)) this.selHero = C.hero;
  const cards = HERO_ORDER.map((id) => `<div class="hcard ${id === this.selHero ? 'sel' : ''} ${isUnlocked(id) ? '' : 'locked'}" data-act="hsel" data-id="${id}"><canvas data-prev="${id}"></canvas>${isUnlocked(id) ? '' : '<div class="lock">🔒</div>'}${id === C.hero ? '<div class="hmark">✔</div>' : ''}<div class="nm"${HEROES[id].name.length > 16 ? ' style="font-size:0.66em"' : ''}>${HEROES[id].name}</div></div>`).join('');
  const H = HEROES[this.selHero], un = isUnlocked(this.selHero);
  return `<div class="heroes">${cards}</div>
    <div class="hmini panel"><div class="ht"><h3>${H.name}</h3><span class="title2">${H.title}</span></div>
      <div class="role">${H.role}</div>
      ${H.evoPath ? H.evoPath() : H.evo ? finnSelectHtml() : ''}
      <div class="blk"><b class="lbl">MECHANIK: ${H.mech.name.toUpperCase()}</b><p>${H.mech.desc}</p></div>
      <div class="blk"><b class="lbl">SPEZIAL: ${H.ult.name.toUpperCase()}</b><p>${H.ult.desc}</p></div>
      ${un ? `<button class="btn primary" data-act="hpick" ${this.selHero === C.hero ? 'disabled' : ''}>${this.selHero === C.hero ? 'Ausgewählt' : 'Auswählen'}</button>` : `<div class="blk" style="color:#ffb0b0">🔒 ${H.unlock.desc}</div>`}</div>`;
};
UI.homeGear = function () {
  const C = campSave();
  const rows = Object.keys(GEAR2).map((id) => {
    const G0 = GEAR2[id], g = gearOf(id), R = RARITY[g.r], P = gearPower(id), cost = gearCost(id), maxed = g.r >= RARITY.length - 1 && g.l >= 10;
    const locked = g.l >= 10 && !maxed && !SAVE.settings.testUnlock && !etappeCleared(RARITY_NEEDS[g.r + 1]);
    const btn = maxed ? 'Max' : g.l >= 10 ? `Aufwerten → ${RARITY[g.r + 1].name}` : g.l === 0 ? 'Schmieden' : 'Verbessern';
    return `<div class="gearrow" style="--rc:${R.col}"><div class="gicon"><img src="${iconImg('gear_' + id)}"><span>${g.l ? 'Lv ' + g.l : '—'}</span></div>
      <div class="gtxt"><b>${G0.name}</b><small style="color:${R.col}">${g.l ? R.name + '-Stufe' : 'noch nicht geschmiedet'}</small><small>${G0.stat} je Punkt · jetzt ${P} Punkte</small>${locked ? `<small style="color:#ffb0b0">Nächste Stufe (${RARITY[g.r + 1].name}) nach Etappe ${RARITY_NEEDS[g.r + 1]}</small>` : ''}</div>
      <button class="btn small" data-act="gearup" data-id="${id}" ${gearCan(id) ? '' : 'disabled'}>${btn}${maxed ? '' : `<br><small>${cost} ◆</small>`}</button></div>`;
  }).join('');
  return `<div class="syswin"><div class="syshead">[ SYSTEM ] · SCHMIEDE</div><p class="sysp">Aus den Kristallen besiegter Bestien schmiedest du Ausrüstung. Die Stufen folgen den Bestien des Buchs: ${RARITY.map((r) => `<b style="color:${r.col}">${r.name}</b>`).join(' · ')}. Höhere Stufen brauchen Kristalle stärkerer Bestien, also spätere Etappen.</p></div><div class="gearlist">${rows}</div>`;
};
for (const id in GEAR2) ICON_EXTRA['gear_' + id] = symIcon(GEAR2[id].icon, '#8ad8ff');
UI.homeFamilie = function () {
  const C = campSave(), slots = partySlots(), members = COMP_ORDER.filter((id) => COMPANIONS[id]);
  const list = members.map((id) => { const o = companionOpen(id), inP = C.party.includes(id), cp = COMPANIONS[id];
    return `<div class="famrow ${o ? '' : 'locked'}"><div class="famdot" style="background:${cp.col}"></div><div class="gtxt"><b>${cp.name}</b><small>${cp.role}</small></div>
      <button class="btn small ${inP ? 'primary' : ''}" data-act="famtoggle" data-id="${id}" ${o ? '' : 'disabled'}>${o ? (inP ? 'Im Kampf' : 'Mitnehmen') : '🔒'}</button></div>`; }).join('');
  const cost = castleCost(), maxC = C.castle >= CASTLE_MAX;
  return `<div class="syswin"><div class="syshead">[ SYSTEM ] · DIE VERFLUCHTEN</div>
      <p class="sysp">Deine Familie. Freigeschaltete Helden werden Mitglieder und können als Begleiter mitkämpfen (sie sind unverwundbar und unterstützen dich).</p>
      <div class="kv"><span>Burgstufe</span><span>${C.castle} / ${CASTLE_MAX}</span><span>Bonus</span><span>+${2 * C.castle} % Schaden · +${3 * C.castle} % Leben</span><span>Begleiter-Plätze</span><span>${slots} (mehr ab Burgstufe 3 und 7)</span></div>
      <button class="btn" data-act="castle" ${!maxC && SAVE.souls >= cost ? '' : 'disabled'}>${maxC ? 'Burg voll ausgebaut' : `Burg ausbauen · ${cost} ✦`}</button></div>
    <div class="syshead" style="margin:8px 4px">MITGLIEDER · ${C.party.length}/${slots} im Kampf</div><div class="gearlist">${list}</div>`;
};
UI.homeSystem = function () {
  const cost = talentCost(), all = TALENT_ORDER.every((k) => (SAVE.meta[k] || 0) >= META[k].max);
  const cards = TALENT_ORDER.map((k) => { const lv = SAVE.meta[k] || 0, M = META[k];
    return `<div class="tcard ${lv ? '' : 'dim'}"><div class="tstars">${'★'.repeat(lv)}<i>${'★'.repeat(M.max - lv)}</i></div><img src="${iconImg(k)}"><b>${M.name}</b><small>${M.desc}${M.max > 1 ? ' je Stern' : ''}</small></div>`; }).join('');
  return `<div class="syswin"><div class="syshead">[ SYSTEM ] · TALENTE</div><p class="sysp">Das System verleiht dir dauerhafte Talente. Jeder Zug gibt einem zufälligen Talent einen Stern.</p>
      <button class="btn primary" data-act="tdraw" ${!all && SAVE.souls >= cost ? '' : 'disabled'}>${all ? 'Alle Talente voll' : `Talent ziehen · ${cost} ✦`}</button></div>
    <div class="tgrid">${cards}</div>`;
};
UI.homeEvents = function () {
  const C = campSave(), D = dailySave(), towerNext = Math.min(CHAPTERS.length, (C.tower || 0) + 1), towerOpen = chapterCleared(towerNext) || SAVE.settings.testUnlock;
  const daily = DAILY.map((q) => { const pr = Math.min(q.goal, D.prog[q.id] || 0), done = pr >= q.goal, got = D.got[q.id];
    return `<div class="famrow"><div class="gtxt"><b>${q.text}</b><small>${pr} / ${q.goal} · Belohnung ${q.reward.souls} ✦ ${q.reward.crystals} ◆</small></div><button class="btn small ${done && !got ? 'primary' : ''}" data-act="dailyget" data-id="${q.id}" ${done && !got ? '' : 'disabled'}>${got ? '✔' : 'Abholen'}</button></div>`; }).join('');
  return `<div class="evcard" style="--ec:#6a2a4a"><div><b>Nacht auf dem Aschefriedhof</b><small>Die klassische Nacht: zehn Minuten Horden, dann Vaelgor. Längste Nacht: ${fmtTime(C.endless || 0)}</small></div><button class="btn primary" data-act="endless">Starten</button></div>
    <div class="evcard" style="--ec:#4a2a6a"><div><b>Boss-Turm · Stock ${towerNext}</b><small>${towerOpen ? `Die Bosse der Kampagne, stärker als zuvor. Nächster: ${ENEMIES[CHAPTERS[towerNext - 1].roles.boss].name}` : `Stock ${towerNext} öffnet nach Etappe ${ET_OF_CH[towerNext] || '?'}.`} · Höchster Stock: ${C.tower || 0}</small></div><button class="btn primary" data-act="tower" ${towerOpen ? '' : 'disabled'}>Starten</button></div>
    <div class="syshead" style="margin:10px 4px 6px">TÄGLICHE AUFGABEN</div><div class="gearlist">${daily}</div>`;
};
const _actCamp = UI.act;
UI.act = function (a, ds, e) {
  const C = campSave();
  switch (a) {
    case 'home': return this.showHome(ds.tab || this.tab);
    case 'title': return this.showHome(this.tab);
    case 'story': case 'play': return this.showHome('kampagne');
    case 'etappe': { const cur = this.selEtappe || C.etappe || 1; this.selEtappe = clamp(cur + (+ds.d), 1, ETAPPEN.length); this.selLevel = 0; return this.showHome('kampagne'); }
    case 'lvsel': this.selLevel = +ds.l; return this.showHome('kampagne');
    case 'campgo': return campStart('level', this.selEtappe || C.etappe || 1, this.selLevel || 1);
    case 'hsel': this.selHero = ds.id; return this.showHome('helden');
    case 'hpick': C.hero = this.selHero; writeSave(); sfx('level'); return this.showHome('helden');
    case 'gearup': gearUp(ds.id); return this.showHome('ausruestung');
    case 'famtoggle': { const i = C.party.indexOf(ds.id); if (i >= 0) C.party.splice(i, 1); else { if (C.party.length >= partySlots()) C.party.shift(); C.party.push(ds.id); } writeSave(); return this.showHome('familie'); }
    case 'castle': { const cost = castleCost(); if (C.castle < CASTLE_MAX && SAVE.souls >= cost) { SAVE.souls -= cost; C.castle++; writeSave(); sfx('fusion'); } return this.showHome('familie'); }
    case 'tdraw': { const k = talentDraw(); if (k) this.toast(`Talent: ${META[k].name} ★${SAVE.meta[k]}`); return this.showHome('system'); }
    case 'endless': return campStart('endless', 1, 1);
    case 'tower': return campStart('tower', Math.min(CHAPTERS.length, (C.tower || 0) + 1), 1);
    case 'dailyget': { const D = dailySave(), q = DAILY.find((x) => x.id === ds.id); if (q && !D.got[q.id] && (D.prog[q.id] || 0) >= q.goal) { D.got[q.id] = true; SAVE.souls += q.reward.souls; C.crystals += q.reward.crystals; writeSave(); sfx('level'); } return this.showHome('events'); }
    case 'campagain': { const cp = GAME && GAME.camp; if (cp) return campStart(cp.mode, cp.e, cp.l); break; }
    case 'campnext': { const cp = GAME.camp; if (cp.l < lvCount(cp.e)) { this.selEtappe = cp.e; this.selLevel = cp.l + 1; } else { this.selEtappe = cp.e + 1; this.selLevel = 1; } return this.showHome('kampagne'); }
    case 'again': if (GAME && GAME.camp) { const cp = GAME.camp; return campStart(cp.mode, cp.e, cp.l); } break;
    case 'giveup': if (GAME && GAME.camp) { giveUp(); return; } break;
  }
  return _actCamp.call(this, a, ds, e);
};
// Finn: das Buch zaehlt im Arcade-Sinn (Evolution im Lauf) fuer alle Kampagnen-Laeufe
(function () { const i = HERO_ORDER.indexOf('finn'); if (i < 0) HERO_ORDER.unshift('finn'); })();
// Hinweis "Finde das Buch!" nur, wenn Finn es in dieser Stufe wirklich noch suchen muss
const _annCamp = UI.announce;
UI.announce = function (txt, kind) { if (GAME && GAME.bookGiven && /Finde das Buch/.test(txt)) return; return _annCamp.call(this, txt, kind); };
