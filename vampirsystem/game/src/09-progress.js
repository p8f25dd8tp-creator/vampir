'use strict';
/* ==========================================================================
   FORTSCHRITT — EP, Stufen und Wertepunkte (frei, nicht an die Story gebunden)
   Jede Stufe gibt einen Wertepunkt (wie im Roman) fuer Staerke, Agilitaet
   oder Ausdauer. Evolutionen bleiben an die Story gebunden.
   ========================================================================== */

function expNeed(level) { return 100 + (level - 1) * 40; }
// EP gutschreiben; liefert die Zahl der Stufenaufstiege
function gainExp(n) {
  const Q = SAVE.quinn;
  n = Math.max(0, Math.round(n));
  Q.exp += n;
  let ups = 0;
  while (Q.exp >= expNeed(Q.level)) { Q.exp -= expNeed(Q.level); Q.level++; Q.points++; ups++; }
  writeSave();
  return ups;
}
function addExp(n) {
  const ups = gainExp(n);
  if (ups && G && UI.hud) { banner('STUFE ' + SAVE.quinn.level); sfx('level'); sysMsg({ head: 'STUFENAUFSTIEG', lines: [`Stufe ${SAVE.quinn.level}`, `+${ups} Wertepunkt${ups > 1 ? 'e' : ''} – verteilen im Status`] }, 3200); }
  return ups;
}
// abgeleitete Werte
function quinnStats() {
  const S = SAVE.quinn.stats;
  const race = SAVE.quinn.race === 'Halbling' ? 5 : 0;
  return { maxHp: 10 + race + (S.sta - 10), maxStam: 100 + (S.sta - 10) * 4, str: S.str, agi: S.agi };
}
const STAT_INFO = {
  str: { name: 'Stärke', desc: 'mehr Schaden pro Schlag' },
  agi: { name: 'Agilität', desc: 'schneller laufen und ausweichen' },
  sta: { name: 'Ausdauer', desc: '+1 HP und mehr Ausdauer' }
};

/* ------------------------------------------------------------ Status-Fenster */
function statusHtml() {
  const Q = SAVE.quinn, S = Q.stats, D = quinnStats();
  const rows = Object.keys(STAT_INFO).map((k) => `<div class="strow"><span>${STAT_INFO[k].name}<small>${STAT_INFO[k].desc}</small></span><b>${S[k]}</b>
    <button class="plus" data-stat="${k}" ${Q.points ? '' : 'disabled'}>+</button></div>`).join('');
  return `<div class="sys statuswin"><div class="head">[ STATUS ]</div>
    <div class="kv"><span>Name</span><span>Quinn Talen</span><span>Rasse</span><span>${Q.race || 'Mensch'}</span>
      <span>Stufe</span><span>${Q.level}</span><span>HP</span><span>${D.maxHp}</span></div>
    <div class="expbar"><i style="width:${(Q.exp / expNeed(Q.level) * 100).toFixed(0)}%"></i></div>
    <div class="expnum">EP ${Q.exp} / ${expNeed(Q.level)}</div>
    <div class="line" style="margin-top:4px;font-size:15px">Credits: <b>${SAVE.credits}</b>${Q.thirst ? ` · <span style="color:#ff8a8a">Blutdurst: −${Q.thirst} HP</span>` : ''}</div>
    <div class="line" style="margin-top:6px">Freie Wertepunkte: <b style="color:#ffe6a0">${Q.points}</b></div>
    ${rows}
    <div class="line" style="margin-top:8px;font-size:15px;color:#9ab">Fähigkeiten: ${Q.skills.length ? Q.skills.map((s) => SKILL_NAMES[s] || s).join(', ') : '—'}</div></div>`;
}
const SKILL_NAMES = { inspect: 'Inspect', bloodswipe: 'Blood Swipe' };
function showStatus(back) {
  const el = document.createElement('div');
  el.className = 'screen dim'; el.style.pointerEvents = 'auto'; el.style.zIndex = 20;
  const draw = () => {
    el.innerHTML = statusHtml() + '<button class="btn" id="stBack">Zurück</button>';
    el.querySelectorAll('.plus').forEach((b) => b.addEventListener('click', () => {
      const Q = SAVE.quinn; if (!Q.points) return;
      Q.points--; Q.stats[b.dataset.stat]++; writeSave(); sfx('card');
      if (G && G.player) applyStats(G.player);
      draw();
    }));
    el.querySelector('#stBack').onclick = () => { el.remove(); back && back(); };
  };
  draw();
  UI.root.appendChild(el);
}
function applyStats(p) {
  const D = quinnStats();
  const gain = D.maxHp - (p.maxHp || D.maxHp);
  p.maxHp = D.maxHp; p.hp = Math.min(D.maxHp, p.hp + Math.max(0, gain));
  p.maxStam = D.maxStam; p.str = D.str; p.agi = D.agi;
}

/* ------------------------------------------------------------ Kampfbericht */
function fightReport(G, won) {
  const lines = [], kv = [];
  let ep = Math.round(G.expGain || 0);
  if (G.opt.expBonus) ep += G.opt.expBonus(G, won);
  kv.push(['EP aus dem Kampf', '+' + ep]);
  if (G.stats.perfect) kv.push(['Perfekt ausgewichen', G.stats.perfect]);
  const lvl0 = SAVE.quinn.level;
  gainExp(ep);
  if (SAVE.quinn.level > lvl0) lines.push(`Stufenaufstieg! Stufe ${SAVE.quinn.level} · freie Wertepunkte: ${SAVE.quinn.points}`);
  return { head: won ? 'KAMPFBERICHT' : 'KAMPFBERICHT · NIEDERLAGE', lines, kv, up: SAVE.quinn.level > lvl0 };
}
