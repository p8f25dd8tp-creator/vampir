'use strict';
/* ==========================================================================
   SYSTEM-HUB: Status · Quests · Faehigkeiten (Meisterschaft) · Evolution ·
   Analyse · Systemkern. Nur Finn besitzt das System; andere Helden sehen
   hier ihre Inspektions-Akte. Nach jedem Lauf meldet sich das System.
   ========================================================================== */

const SYS_TABS = [['status', 'Status', 'clone', 'sys_status'], ['quests', 'Quests', 'star', 'sys_quests'], ['faehig', 'Fähigkeiten', 'fist', 'sys_faehigkeiten'], ['evo', 'Evolution', 'pillar', 'sys_evolution'], ['analyse', 'Inspektion', 'eye', 'sys_analyse'], ['kern', 'Systemkern', 'orbs', 'sys_kern']];
UI.sysTab = UI.sysTab || 'status';

/* ------------------------------------------------------------ Meisterschaft */
const MAST_MAX = 10;
function mastNeed(l) { return 300 * (l + 1); }
function mastStore(h) { const C = campSave(); C.mast = C.mast || {}; return C.mast[h] || (C.mast[h] = {}); }
function mastOf(h, id) { return mastStore(h)[id] || { lv: 0, xp: 0 }; }
function mastMul(h, id) { return 1 + 0.03 * mastOf(h, id).lv; }
function mastAdd(h, id, xp) {
  const S = mastStore(h), m = Object.assign({ lv: 0, xp: 0 }, S[id]), l0 = m.lv;
  m.xp += xp;
  while (m.lv < MAST_MAX && m.xp >= mastNeed(m.lv)) { m.xp -= mastNeed(m.lv); m.lv++; }
  if (m.lv >= MAST_MAX) m.xp = 0;
  S[id] = m; return m.lv - l0;
}
function srcName(k) { return FUSIONS[k] ? FUSIONS[k].name : CARDS[k] ? CARDS[k].name : (SRC_NAMES[k] || k); }
const _ddMast = dealDamage;
dealDamage = function (e, base, school, src, o) { const G = GAME; if (G && G.mastMul && src && G.mastMul[src]) base *= G.mastMul[src]; return _ddMast(e, base, school, src, o); };
const _newRunSys = newRun;
newRun = function (heroId, opts) {
  _newRunSys(heroId, opts);
  if (GAME && GAME.camp) { const S = mastStore(GAME.hero), mm = {}; for (const k in S) if (S[k].lv) mm[k] = 1 + 0.03 * S[k].lv; GAME.mastMul = mm; }
};

/* ------------------------------------------------------------ Analyse */
function seenStore() {
  const C = campSave(); C.seen = C.seen || {};
  if (!C.seenMig) { C.seenMig = 1; for (let e = 1; e <= ETAPPEN.length; e++) for (let l = 1; l <= lvCount(e); l++) { const L = lvDef(e, l); if (L.foe && lvStars(e, l)) C.seen[L.foe] = L.type === 'endure' ? 1 : 2; } }
  return C.seen;
}
function allBosses() {
  if (allBosses.cache) return allBosses.cache;
  const out = [], seen = {};
  for (let e = 1; e <= ETAPPEN.length; e++) for (let l = 1; l <= lvCount(e); l++) { const L = lvDef(e, l); if (L.foe && !seen[L.foe] && ENEMIES[L.foe]) { seen[L.foe] = 1; out.push({ id: L.foe, e, l, endure: L.type === 'endure' }); } }
  return (allBosses.cache = out);
}

/* ------------------------------------------------------------ Quests */
function weekKey() { const d = new Date(), day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function weekSave() {
  const C = campSave();
  if (!C.week || C.week.wk !== weekKey()) C.week = { wk: weekKey(), prog: { levels: 0, kills: 0, heroes: [] }, got: {} };
  return C.week;
}
const WEEKLY = [
  { id: 'levels', text: 'Schaffe 10 Kampagnen-Level', goal: 10, reward: { souls: 500, crystals: 80 } },
  { id: 'kills', text: 'Besiege 4000 Gegner', goal: 4000, reward: { souls: 400, crystals: 60 } },
  { id: 'heroes', text: 'Spiele mit 3 verschiedenen Helden', goal: 3, reward: { souls: 350, crystals: 50 } }
];
function maxHeroLv() { let m = 0; for (const id in HERO_MACHT) m = Math.max(m, heroSave(id).lv); return m; }
function heroesAt(lv) { let n = 0; for (const id in HERO_MACHT) if (heroSave(id).lv >= lv) n++; return n; }
function maxMast() { const C = campSave(); let m = 0; for (const h in (C.mast || {})) for (const k in C.mast[h]) m = Math.max(m, C.mast[h][k].lv); return m; }
function seenCount() { return Object.keys(seenStore()).length; }
function sqCleared(e) { return etappeCleared(e) ? 1 : 0; }
const SYSQ = [];
const sqAdd = (id, text, val, goal, souls, crystals) => SYSQ.push({ id, text, val, goal, reward: { souls, crystals } });
[[500, 150, 20], [3000, 400, 60], [15000, 1200, 180], [50000, 3000, 400]].forEach(([n, s, c]) => sqAdd('k' + n, `Besiege ${n.toLocaleString('de-DE')} Gegner`, () => SAVE.stats.kills, n, s, c));
[[15, 200, 30], [60, 500, 80], [150, 1200, 180], [300, 2500, 350]].forEach(([n, s, c]) => sqAdd('st' + n, `Sammle ${n} Sterne`, starsTotal, n, s, c));
[1, 3, 5, 8, 10, 12, 14, 15].forEach((e) => sqAdd('e' + e, `Schließe Etappe ${e} ab`, () => sqCleared(e), 1, 150 * e, 25 * e));
[[10, 300, 50], [30, 900, 150], [60, 2500, 400]].forEach(([n, s, c]) => sqAdd('hl' + n, `Bringe einen Helden auf Heldenstufe ${n}`, maxHeroLv, n, s, c));
[[3, 300, 40], [6, 700, 100]].forEach(([n, s, c]) => sqAdd('h5x' + n, `Bringe ${n} Helden auf Heldenstufe 5`, () => heroesAt(5), n, s, c));
[[3, 200, 30], [6, 600, 90], [10, 1500, 220]].forEach(([n, s, c]) => sqAdd('m' + n, `Erreiche Meisterschaft ${n} in einer Fähigkeit`, maxMast, n, s, c));
[[10, 200, 30], [40, 600, 90], [100, 1500, 220]].forEach(([n, s, c]) => sqAdd('an' + n, `Inspiziere ${n} Bosse`, seenCount, n, s, c));
function sysqGot() { const C = campSave(); return C.sysq || (C.sysq = {}); }
function sysClaimable() {
  const D = dailySave(), W = weekSave(), G0 = sysqGot();
  return DAILY.some((q) => !D.got[q.id] && (D.prog[q.id] || 0) >= q.goal)
    || WEEKLY.some((q) => !W.got[q.id] && weekProg(q) >= q.goal)
    || SYSQ.some((q) => !G0[q.id] && q.val() >= q.goal);
}
function weekProg(q) { const W = weekSave(); return q.id === 'heroes' ? W.prog.heroes.length : (W.prog[q.id] || 0); }
function nextStory() {
  for (let e = 1; e <= ETAPPEN.length; e++) for (let l = 1; l <= lvCount(e); l++) if (!lvStars(e, l)) return lvOpen(e, l) ? { e, l } : null;
  return null;
}

/* ------------------------------------------------------------ Systemkern (gezielt statt Zufall) */
function kernCost(k) { const lv = SAVE.meta[k] || 0, M = META[k]; return M.cost && M.cost[lv] ? Math.round(M.cost[lv] * 2) : 150 + 80 * lv; }
function kernNeed(k) { const lv = SAVE.meta[k] || 0; return Math.min(ETAPPEN.length, lv * 3); } // naechster Stern braucht Etappe
function kernCan(k) { const lv = SAVE.meta[k] || 0; return lv < META[k].max && SAVE.souls >= kernCost(k) && (kernNeed(k) === 0 || etappeCleared(kernNeed(k)) || SAVE.settings.testUnlock); }

/* ------------------------------------------------------------ Titel (Finn) */
const FINN_TITEL = [[0, 'Der schwächste Schüler'], [1, 'Besitzer des Buches'], [3, 'Vampir der Akademie'], [4, 'Anführer der Verfluchten'], [6, 'Herr der zehnten Familie'], [8, 'König der Vampire'], [10, 'Celestial-Vampir'], [12, 'Bezwinger der Namriks'], [13, 'Gottbezwinger'], [14, 'Schrecken der Dämonenkönige'], [15, 'Der letzte Vampir']];
function finnTitel() { let t = FINN_TITEL[0][1]; for (const [e, n] of FINN_TITEL) if (e === 0 || etappeCleared(e)) t = n; return t; }

/* ------------------------------------------------------------ Darstellung */
function sysIcon(sym, img) { const u = typeof imgUrl === 'function' ? imgUrl(img) : null; return u || tabIcon(sym, '#8ae8ff'); }
function sysBar(v, max, col) { return `<div class="sbar"><i style="width:${Math.max(0, Math.min(100, v / max * 100)).toFixed(1)}%;${col ? 'background:' + col : ''}"></i></div>`; }
function sysRw(r) { return `<span class="rw"><b style="color:#d8c0ff">${r.souls} ✦</b> · <b style="color:#8ad8ff">${r.crystals} ◆</b></span>`; }

UI.homeSystem = function () {
  const C = campSave(), h = C.hero, tab = this.sysTab;
  const tabs = SYS_TABS.map(([k, nm, sym, img]) => `<button class="systab ${k === tab ? 'on' : ''}" data-act="systab" data-t="${k}"><img src="${sysIcon(sym, img)}" alt=""><span>${nm}</span>${k === 'quests' && sysClaimable() ? '<i class="dot">!</i>' : ''}</button>`).join('');
  const body = ({ status: sysStatus, quests: sysQuests, faehig: sysFaehig, evo: sysEvo, analyse: sysAnalyse, kern: sysKern })[tab](h);
  return `<div class="syshub"><div class="syshubhead">[ SYSTEM ]</div><div class="systabs">${tabs}</div>${body}</div>`;
};
function sysStatus(h) {
  const H = HEROES[h], hs = heroSave(h), m = heroMacht(h), [a, b] = heroRange(h), need = hs.lv >= HERO_LV_MAX ? 0 : heroXpNeed(hs.lv);
  const T = evoTiersOf(h), form = T ? T[Math.min(T.length - 1, evoCap(h))] : null;
  const mul = Math.pow(1.09, m - 1), might = form ? form.might || 1 : 1;
  const hp = Math.round((form ? form.hp : H.hp) * mul), str = Math.round(10 * might * mul), spd = Math.round((form ? form.speed : H.speed) / 10);
  const S = SAVE.stats, isF = h === 'finn';
  return `<div class="swin"><div class="swhead">${isF ? 'STATUS' : 'INSPEKTION · HELDENAKTE'}</div>
    ${isF ? '' : '<p class="snote">Nur Finn besitzt das System. Es hat diesen Helden inspiziert.</p>'}
    <div class="skv"><span>Name</span><b>${H.name}</b>
      <span>${isF ? 'Rasse' : 'Form'}</span><b style="color:${form ? form.col : '#fff'}">${form ? form.name : H.title}</b>
      ${isF ? `<span>Titel</span><b>${finnTitel()}</b>` : `<span>Titel</span><b>${H.title}</b>`}
      <span>Heldenstufe</span><b>${hs.lv}${need ? ` <small>${hs.xp} / ${need} EP</small>` : ' <small>Maximum</small>'}</b></div>
    ${sysBar(hs.xp, need || 1, '#9affb0')}
    <div class="skv"><span>Macht</span><b>${m.toFixed(1)} · ${machtName(m)}</b><span>Höchstmacht</span><b>${b} · ${machtName(b)}</b></div>
    <div class="mscale2"><i style="left:${(a - 1) / 29 * 100}%;width:${(b - a) / 29 * 100}%"></i><u style="left:${(m - 1) / 29 * 100}%"></u></div>
    <div class="sgrid"><div><span>Stärke</span><b>${str}</b></div><div><span>Ausdauer</span><b>${hp}</b></div><div><span>Geschick</span><b>${spd}</b></div><div><span>${isF ? 'Qi' : 'Macht'}</span><b>${isF ? Math.round(m * 3) : Math.round(m)}</b></div></div></div>
  ${isF ? `<div class="swin"><div class="swhead">AUFZEICHNUNGEN</div><div class="skv"><span>Läufe</span><b>${S.runs}</b><span>Besiegte Gegner</span><b>${S.kills.toLocaleString('de-DE')}</b><span>Sterne</span><b>${starsTotal()} ★</b><span>Bosse inspiziert</span><b>${seenCount()} / ${allBosses().length}</b><span>Etappen</span><b>${Array.from({ length: ETAPPEN.length }, (_, i) => etappeCleared(i + 1) ? 1 : 0).reduce((x, y) => x + y, 0)} / ${ETAPPEN.length}</b></div></div>` : ''}`;
}
function sysQuests() {
  const D = dailySave(), W = weekSave(), G0 = sysqGot(), ns = nextStory();
  const story = ns ? (() => { const L = lvDef(ns.e, ns.l); return `<div class="sq story"><div><b>Etappe ${ns.e} · Stufe ${ns.l}: ${L.name}</b><small>${lvGoal(ns.e, ns.l)}</small></div><button class="btn small primary" data-act="sysgo" data-e="${ns.e}" data-l="${ns.l}">Hin</button></div>`; })() : '<p class="snote">Alle Story-Quests erfüllt.</p>';
  const row = (q, pr, got, act) => { const done = pr >= q.goal; return `<div class="sq ${got ? 'got' : done ? 'done' : ''}"><div><b>${q.text}</b><small>${Math.min(pr, q.goal).toLocaleString('de-DE')} / ${q.goal.toLocaleString('de-DE')} · Belohnung ${sysRw(q.reward)}</small>${sysBar(pr, q.goal)}</div><button class="btn small ${done && !got ? 'primary' : ''}" data-act="${act}" data-id="${q.id}" ${done && !got ? '' : 'disabled'}>${got ? '✔' : 'Abholen'}</button></div>`; };
  const daily = DAILY.map((q) => row(q, D.prog[q.id] || 0, D.got[q.id], 'dailyget')).join('');
  const weekly = WEEKLY.map((q) => row(q, weekProg(q), W.got[q.id], 'weekget')).join('');
  const fr = (q) => Math.min(1, q.val() / q.goal), open = SYSQ.filter((q) => !G0[q.id]).sort((x, y) => fr(y) - fr(x));
  const sys = open.slice(0, 8).map((q) => row(q, q.val(), false, 'sysqget')).join('');
  return `<div class="swin"><div class="swhead">STORY-QUEST</div>${story}</div>
    <div class="swin"><div class="swhead">TÄGLICH</div>${daily}</div>
    <div class="swin"><div class="swhead">WÖCHENTLICH</div>${weekly}</div>
    <div class="swin"><div class="swhead">SYSTEM-QUESTS · ${Object.keys(G0).length} / ${SYSQ.length} erfüllt</div>${sys || '<p class="snote">Alle System-Quests erfüllt.</p>'}</div>`;
}
function sysFaehig(h) {
  const S = mastStore(h), ids = Object.keys(S).sort((x, y) => S[y].lv - S[x].lv || S[y].xp - S[x].xp);
  const rows = ids.map((k) => { const m = S[k], need = m.lv >= MAST_MAX ? 0 : mastNeed(m.lv);
    return `<div class="sfa"><img src="${icon(k)}" alt=""><div><b>${srcName(k)}</b><small>Meisterschaft ${m.lv} / ${MAST_MAX} · +${m.lv * 3} % Schaden</small>${sysBar(m.xp, need || 1, m.lv >= MAST_MAX ? '#ffd070' : '')}</div><span class="lv">${m.lv}</span></div>`; }).join('');
  return `<div class="swin"><div class="swhead">MEISTERSCHAFT · ${HEROES[h].name}</div>
    <p class="snote">Jede Fähigkeit wird stärker, je mehr Schaden sie in Läufen macht: pro Meisterschaftsstufe +3 % Schaden (höchstens +30 %). Gilt dauerhaft, nur für diesen Helden.</p>
    ${rows || '<p class="snote">Noch keine Meisterschaft – spiel einen Lauf.</p>'}</div>`;
}
function sysEvo(h) {
  const html = UI.evoUnlockHtml ? UI.evoUnlockHtml(h) : '';
  return `<div class="swin"><div class="swhead">EVOLUTION · ${HEROES[h].name}</div>${html || '<p class="snote">Dieser Held hat keine Formen.</p>'}
    ${h === 'finn' ? '<p class="snote">Finn startet jeden Lauf in seiner höchsten freigeschalteten Form. Neue Formen öffnen sich mit der Geschichte und kosten Seelen und Kristalle.</p>' : ''}</div>`;
}
function sysAnalyse() {
  const seen = seenStore(), B = allBosses();
  const heroes = Object.keys(HERO_MACHT).filter((id) => isUnlocked(id)).map((id) => { const [a, b] = heroRange(id); return `<div class="san"><b>${HEROES[id].name}</b><small>Macht ${a} → ${b} · ${machtName(b)}</small></div>`; }).join('');
  let cur = 0, out = '';
  for (const x of B) {
    if (x.e !== cur) { cur = x.e; out += `<div class="sanet">Etappe ${cur} · ${ET(cur).title}${etappeOpen(cur) ? '' : ' · 🔒'}</div>`; }
    if (!etappeOpen(x.e)) continue;
    const s = seen[x.id], mm = x.endure ? ET_MACHT[x.e] : (BOSS_MACHT[x.id] || ET_MACHT[x.e]);
    out += s ? `<div class="san ${s === 2 ? 'win' : ''}"><b>${ENEMIES[x.id].name}</b><small>Macht ${mm} · ${machtName(mm)}${x.endure ? ' · nicht besiegbar' : ''}${s === 2 ? ' · besiegt' : ''}</small></div>` : '<div class="san unk"><b>???</b><small>noch nicht inspiziert</small></div>';
  }
  return `<div class="swin"><div class="swhead">HELDEN</div><div class="sangrid">${heroes}</div></div>
    <div class="swin"><div class="swhead">BOSSE · ${seenCount()} / ${B.length} inspiziert</div><div class="sangrid">${out}</div></div>`;
}
function sysKern(h) {
  if (h !== 'finn') return `<div class="swin"><div class="swhead">SYSTEMKERN</div><p class="snote">Nur Finn besitzt den Systemkern. Wähle Finn, um ihn zu verbessern. Andere Helden wachsen über ihre Heldenstufe und Meisterschaft.</p></div>`;
  const cards = TALENT_ORDER.map((k) => { const lv = SAVE.meta[k] || 0, M = META[k], max = lv >= M.max, nd = kernNeed(k), lock = !max && nd && !etappeCleared(nd) && !SAVE.settings.testUnlock;
    return `<div class="skern ${lv ? '' : 'dim'}"><img src="${iconImg(k)}" alt=""><div><b>${M.name}</b><small>${M.desc}${M.max > 1 ? ' je Stern' : ''}</small><div class="stars">${'★'.repeat(lv)}<u>${'★'.repeat(M.max - lv)}</u></div></div>
      <button class="btn small ${kernCan(k) ? 'primary' : ''}" data-act="kernup" data-id="${k}" ${kernCan(k) ? '' : 'disabled'}>${max ? 'Voll' : lock ? `ab Etappe ${nd}` : `+1 · ${kernCost(k)} ✦`}</button></div>`; }).join('');
  return `<div class="swin"><div class="swhead">SYSTEMKERN · nur Finn</div><p class="snote">Verbessere gezielt, was du brauchst. Höhere Sterne öffnen sich mit der Geschichte.</p>${cards}</div>`;
}

/* ------------------------------------------------------------ Aktionen */
const _actSys = UI.act;
UI.act = function (a, ds, e) {
  const C = campSave();
  if (a === 'systabgo') { this.sysTab = 'quests'; return this.showHome('system'); }
  if (a === 'systab') { this.sysTab = ds.t; return this.showHome('system'); }
  if (a === 'sysgo') { this.selEtappe = +ds.e; this.selLevel = +ds.l; if (typeof MAP3 !== 'undefined') MAP3.placed = false; return this.showHome('kampagne'); }
  if (a === 'weekget') { const W = weekSave(), q = WEEKLY.find((x) => x.id === ds.id); if (q && !W.got[q.id] && weekProg(q) >= q.goal) { W.got[q.id] = true; SAVE.souls += q.reward.souls; C.crystals += q.reward.crystals; writeSave(); sfx('level'); } return this.showHome('system'); }
  if (a === 'sysqget') { const G0 = sysqGot(), q = SYSQ.find((x) => x.id === ds.id); if (q && !G0[q.id] && q.val() >= q.goal) { G0[q.id] = true; SAVE.souls += q.reward.souls; C.crystals += q.reward.crystals; writeSave(); sfx('level'); } return this.showHome('system'); }
  if (a === 'kernup') { const k = ds.id; if (kernCan(k)) { SAVE.souls -= kernCost(k); SAVE.meta[k] = (SAVE.meta[k] || 0) + 1; writeSave(); sfx('fusion'); this.toast(`${META[k].name} ★${SAVE.meta[k]}`); } return this.showHome('system'); }
  if (a === 'dailyget') { const r = _actSys.call(this, a, ds, e); return this.tab === 'system' ? this.showHome('system') : r; }
  return _actSys.call(this, a, ds, e);
};

/* ------------------------------------------------------------ Nach dem Lauf */
const _campResultSys = campResult;
campResult = function (won) {
  const G = GAME, cp = G.camp, h = G.hero, lines = [];
  const claim0 = sysClaimable();
  // Meisterschaft
  if (cp) for (const k in G.stats.dmg) { const d = G.stats.dmg[k]; if (d > 0 && !(typeof REACTIONS !== 'undefined' && REACTIONS[k]) && (CARDS[k] || FUSIONS[k] || SRC_NAMES[k])) { const up = mastAdd(h, k, Math.round(Math.sqrt(d) * 2)); if (up) lines.push(`Meisterschaft gestiegen: <b>${srcName(k)}</b> → Stufe ${mastOf(h, k).lv}`); } }
  // Analyse
  if (cp && cp.lv && cp.lv.foe && ENEMIES[cp.lv.foe]) { const S = seenStore(), old = S[cp.lv.foe] || 0, nw = won && cp.lv.type !== 'endure' ? 2 : 1; if (nw > old) { S[cp.lv.foe] = nw; if (!old) lines.push(`Neue Inspektion: <b>${ENEMIES[cp.lv.foe].name}</b>`); } }
  // Woche
  const W = weekSave(); W.prog.kills += G.kills; if (won && cp && cp.mode === 'level') W.prog.levels++; if (!W.prog.heroes.includes(h)) W.prog.heroes.push(h);
  const res = _campResultSys(won);
  if (res.lvUp) lines.unshift(`Heldenstufe gestiegen: <b>${heroSave(h).lv}</b> · Macht ${heroMacht(h).toFixed(1)}`);
  if (!claim0 && sysClaimable()) lines.push('Eine Quest ist erfüllt – hol dir die Belohnung im System.');
  G.sysLines = lines; writeSave();
  return res;
};
const _showEndSys = UI.showEnd;
UI.showEnd = function (won, souls, newly, extra) {
  const r = _showEndSys.call(this, won, souls, newly, extra), G = GAME;
  if (G && G.camp && G.sysLines && G.sysLines.length) {
    const box = document.querySelector('.syswin.big'), btns = box && box.querySelector('.btns');
    if (btns) { const d = document.createElement('div'); d.className = 'sysend'; d.innerHTML = `<div class="syshead">[ SYSTEM ]</div>${G.sysLines.map((l) => `<p>${l}</p>`).join('')}`; btns.parentNode.insertBefore(d, btns); }
  }
  return r;
};

/* ------------------------------------------------------------ Aussehen */
(function sysCss() {
  const st = document.createElement('style'); st.id = 'syshubcss';
  st.textContent = `
.syshub { display: flex; flex-direction: column; gap: 10px; width: min(560px, 100%); margin: 0 auto; font-family: 'Cormorant Garamond', Georgia, serif; }
.syshubhead { text-align: center; font: 700 12px/1 ui-monospace, Menlo, monospace; letter-spacing: .5em; color: #8ae8ff; text-shadow: 0 0 10px #2ab8ff; padding-top: 4px; }
.systabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.systab { position: relative; display: flex; align-items: center; gap: 4px; padding: 6px 6px; min-width: 0; overflow: hidden; white-space: nowrap; border: 1px solid rgba(110,200,255,.35); border-radius: 4px; background: rgba(6,14,34,.78); color: #b8d8ff; font: 700 10.5px 'Cinzel', serif; cursor: pointer; clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px); }
.systab img { width: 24px; height: 24px; flex: none; object-fit: contain; }
.systab.on { background: linear-gradient(180deg, rgba(20,70,130,.85), rgba(8,24,60,.9)); border-color: #8ae8ff; color: #fff; box-shadow: inset 0 0 14px rgba(90,200,255,.45); }
.systab .dot { position: absolute; top: 2px; right: 4px; min-width: 15px; height: 15px; border-radius: 8px; background: #e0303a; color: #fff; font: 800 10px/15px sans-serif; font-style: normal; text-align: center; }
.swin { position: relative; padding: 10px 12px; background: rgba(4,10,26,.86); border: 1px solid rgba(110,200,255,.45); box-shadow: 0 0 18px rgba(40,140,255,.18), inset 0 0 24px rgba(40,140,255,.08); color: #dfeeff; clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px); }
.swin::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: linear-gradient(90deg, transparent, #8ae8ff, transparent); }
.swhead { font: 700 11.5px ui-monospace, Menlo, monospace; letter-spacing: .22em; color: #8ae8ff; margin-bottom: 8px; border-bottom: 1px solid rgba(110,200,255,.25); padding-bottom: 5px; }
.snote { color: #9fb8d8; font-size: 14px; margin: 4px 0 8px; }
.skv { display: grid; grid-template-columns: auto 1fr; gap: 3px 12px; font-size: 15px; margin: 4px 0; }
.skv span { color: #8fb0d8; } .skv b { text-align: right; font-weight: 700; } .skv small { color: #8fb0d8; font-weight: 400; }
.sbar { height: 5px; background: rgba(120,180,255,.15); border-radius: 3px; overflow: hidden; margin: 4px 0; }
.sbar i { display: block; height: 100%; background: linear-gradient(90deg, #2ab8ff, #8ae8ff); box-shadow: 0 0 8px #2ab8ff; }
.mscale2 { position: relative; height: 8px; border-radius: 4px; margin: 6px 0 10px; background: linear-gradient(90deg, #1a2a4a, #3a2a8a 50%, #c82a4e); }
.mscale2 i { position: absolute; top: -2px; height: 12px; border: 1.5px solid #8ae8ff; border-radius: 6px; }
.mscale2 u { position: absolute; top: -5px; width: 4px; height: 18px; margin-left: -2px; background: #fff; border-radius: 2px; box-shadow: 0 0 8px #8ae8ff; }
.sgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.sgrid div { border: 1px solid rgba(110,200,255,.3); padding: 6px 4px; text-align: center; background: rgba(20,40,80,.35); }
.sgrid span { display: block; font-size: 11px; color: #8fb0d8; letter-spacing: .05em; } .sgrid b { font: 700 18px ui-monospace, Menlo, monospace; color: #fff; }
.sq { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px dashed rgba(110,200,255,.18); }
.sq:last-child { border-bottom: 0; } .sq > div { flex: 1; min-width: 0; } .sq b { font-size: 15px; } .sq small { display: block; color: #9fb8d8; font-size: 12.5px; }
.sq.done b { color: #9affb0; } .sq.got { opacity: .55; } .sq.story b { color: #ffe6a0; }
.rw b { font-weight: 700; }
.sfa { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px dashed rgba(110,200,255,.18); }
.sfa img { width: 38px; height: 38px; } .sfa > div { flex: 1; min-width: 0; } .sfa small { display: block; color: #9fb8d8; font-size: 12.5px; }
.sfa .lv { font: 800 20px ui-monospace, Menlo, monospace; color: #8ae8ff; width: 30px; text-align: right; }
.sangrid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.sanet { grid-column: 1 / -1; font: 700 11px ui-monospace, Menlo, monospace; letter-spacing: .12em; color: #8ae8ff; margin-top: 6px; }
.san { border: 1px solid rgba(110,200,255,.25); padding: 5px 7px; background: rgba(20,40,80,.3); font-size: 13.5px; line-height: 1.2; }
.san small { display: block; color: #9fb8d8; font-size: 11.5px; } .san.win { border-color: rgba(154,255,176,.5); } .san.unk { opacity: .45; }
.skern { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px dashed rgba(110,200,255,.18); }
.skern img { width: 40px; height: 40px; } .skern > div { flex: 1; min-width: 0; } .skern small { display: block; color: #9fb8d8; font-size: 12.5px; }
.skern .stars { color: #8ae8ff; letter-spacing: 2px; font-size: 13px; } .skern .stars u { text-decoration: none; opacity: .25; } .skern.dim img { opacity: .5; }
.swin .btn { flex: none; }
.swin .evlist { margin-top: 4px; }
.sysend { margin: 8px 0; padding: 8px 10px; border: 1px solid rgba(110,200,255,.45); background: rgba(4,10,26,.7); }
.sysend p { margin: 3px 0; font-size: 14px; color: #dfeeff; } .sysend b { color: #8ae8ff; }
`;
  const f = imgUrl('sys_fenster'), k = imgUrl('sys_knopf');
  if (f) st.textContent += `.swin { clip-path: none; border-style: solid; border-width: 14px; border-image: url("${f}") 44 fill / 14px stretch; background: none; box-shadow: none; padding: 4px 6px; }
.swin::before { display: none; }
.systab { clip-path: none; border-style: solid; border-width: 8px; border-image: url("${f}") 44 fill / 8px stretch; background: none; padding: 2px 4px; }
.systab.on { border-image-source: url("${f}"); filter: brightness(1.45) saturate(1.2); box-shadow: 0 0 14px rgba(90,200,255,.45); background: none; }`;
  if (k) st.textContent += `.swin .btn { border-style: solid; border-width: 0 18px; border-image: url("${k}") 0 46 fill / 0 18px stretch !important; background: none; color: #dff4ff; text-shadow: 0 0 6px #2ab8ff; }
.swin .btn.primary { filter: brightness(1.35) saturate(1.3); color: #fff; }
.swin .btn:disabled { filter: grayscale(.7) brightness(.6); }`;
  document.head.appendChild(st);
})();
