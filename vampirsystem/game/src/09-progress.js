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
  while (Q.exp >= expNeed(Q.level)) { Q.exp -= expNeed(Q.level); Q.level++; Q.points += Q.race === 'Vampir' ? 2 : 1; ups++; } // als Vampir 2 Punkte pro Stufe (Kap. 114)
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
  const H = SAVE.quinn.gear.hands, gear = H === 'gauntlets' ? 3 : H === 'standard' ? 6 : 0; // Schwarzhorn-Handschuhe +3, Beste Standard-Handschuhe +6
  const feet = SAVE.quinn.gear.feet === 'wolf' ? 4 : 0; // Schwarzhorn-Wolfsstiefel: Agilitaet +4
  // HP nach Roman: Stufe 1 = 10, Stufe 2 = 15, Stufe 4 = 25, Vampir Stufe 10 mit Ausdauer 15 = 60 (Kap. 17, 54, 86)
  const lv = SAVE.quinn.level;
  return { maxHp: 5 + 5 * lv + (S.sta - 10), maxStam: 100 + (S.sta - 10) * 6, str: S.str + gear, agi: S.agi + feet };
}
// spuerbare Wirkung der Werte (fuer Kampf und Statusvorschau)
function statFx(str, agi, sta) {
  return {
    dmg: str / 10,                                   // +10 % Schaden je Punkt
    poise: 1 + Math.max(0, str - 10) * 0.06,         // Gegner taumeln frueher
    kb: Math.sqrt(str / 10),                         // mehr Rueckstoss
    move: Math.max(0.6, 1 + (agi - 10) * 0.03),      // +3 % Lauftempo
    atk: clamp(1 + (agi - 10) * 0.022, 0.8, 1.7),    // +2,2 % Angriffstempo
    dodge: Math.max(0.7, 1 + (agi - 10) * 0.03),     // weiter ausweichen
    perfect: clamp((agi - 10) * 0.006, 0, 0.1),      // groesseres Perfekt-Fenster
    regen: 1 + Math.max(0, sta - 10) * 0.04          // schnellere Ausdauer-Erholung
  };
}
const STAT_INFO = {
  str: { name: 'Stärke', desc: '+10 % Schaden, mehr Wucht, Gegner taumeln früher' },
  agi: { name: 'Agilität', desc: '+3 % Tempo, +2 % Angriffstempo, weiter und genauer ausweichen' },
  sta: { name: 'Ausdauer', desc: '+1 HP, +6 Ausdauer, schnellere Erholung' }
};
// Vorschau: was bringt der naechste Punkt?
function statPreview(k) {
  const Q = SAVE.quinn, D = quinnStats(), F = statFx(D.str, D.agi, Q.stats.sta);
  const pct = (v) => Math.round((v - 1) * 100);
  if (k === 'str') { const N = statFx(D.str + 1, D.agi, Q.stats.sta); return `Schaden ×${F.dmg.toFixed(2)} → ×${N.dmg.toFixed(2)} · Taumeln +${pct(F.poise)} % → +${pct(N.poise)} %`; }
  if (k === 'agi') { const N = statFx(D.str, D.agi + 1, Q.stats.sta); return `Tempo ${pct(F.move) >= 0 ? '+' : ''}${pct(F.move)} % → +${pct(N.move)} % · Angriffe +${pct(F.atk)} % → +${pct(N.atk)} %`; }
  return `HP ${D.maxHp} → ${D.maxHp + 1} · Ausdauer ${D.maxStam} → ${D.maxStam + 6}`;
}

/* ------------------------------------------------------------ Status-Fenster */
function statusHtml() {
  const Q = SAVE.quinn, S = Q.stats, D = quinnStats();
  const rows = Object.keys(STAT_INFO).map((k) => `<div class="strow"><span>${STAT_INFO[k].name}<small>${STAT_INFO[k].desc}</small><small style="color:#9ad8ff">${statPreview(k)}</small></span><b>${S[k]}</b>
    <button class="plus" data-stat="${k}" ${Q.points ? '' : 'disabled'}>+</button></div>`).join('');
  return `<div class="sys statuswin"><div class="head">[ STATUS ]</div>
    <div class="kv"><span>Name</span><span>Quinn Talen</span><span>Rasse</span><span>${Q.race || 'Mensch'}</span>
      <span>Stufe</span><span>${Q.level}</span><span>HP</span><span>${D.maxHp}</span></div>
    <div class="expbar"><i style="width:${(Q.exp / expNeed(Q.level) * 100).toFixed(0)}%"></i></div>
    <div class="expnum">EP ${Q.exp} / ${expNeed(Q.level)}</div>
    <div class="line" style="margin-top:4px;font-size:15px">Credits: <b>${SAVE.credits}</b>${Q.thirst ? ` · <span style="color:#ff8a8a">Blutdurst: −${Q.thirst} HP</span>` : ''}</div>
    <div class="line" style="margin-top:6px">Freie Wertepunkte: <b style="color:#ffe6a0">${Q.points}</b></div>
    ${rows}
    ${Q.skills.includes('bloodbank') ? `<div class="line" style="font-size:15px">Blutbank: <b style="color:#ff8a9a">${Q.bank} / 100 ml</b></div>` : ''}
    ${Q.gear.hands === 'gauntlets' ? '<div class="line" style="font-size:15px">Ausrüstung: Schwarzhorn-Handschuhe (Stärke +3, Verteidigung +2)</div>' : ''}
    ${Q.gear.hands === 'standard' ? '<div class="line" style="font-size:15px">Ausrüstung: Beste Standard-Handschuhe (Stärke +6, Verteidigung +4, Blutskills +5 %)</div>' : ''}
    ${Q.gear.feet === 'wolf' ? '<div class="line" style="font-size:15px">Ausrüstung: Schwarzhorn-Wolfsstiefel (Agilität +4, Verteidigung +2)</div>' : ''}
    ${Q.skills.includes('schatten') ? '<div class="line" style="font-size:15px">MC: <b style="color:#c8a0ff">100 / 100</b> · Schatten Stufe 6</div>' : ''}
    <div class="line" style="margin-top:8px;font-size:15px;color:#9ab">Fähigkeiten: ${Q.skills.length ? Q.skills.map((s) => SKILL_NAMES[s] || s).join(', ') : '—'}</div></div>`;
}
const SKILL_NAMES = { inspect: 'Analyse', bloodswipe: 'Blutschnitt', bloodbank: 'Blutbank', flashstep: 'Blitzschritt', hammer: 'Hammerschlag', bloodspray: 'Blutspray', daze: 'Betäubung', schatten: 'Schattenkontrolle', lager: 'Dimensionslager', mantel: 'Schattenmantel', hammerspray: 'Hammerspray', leere: 'Schattenleere', beeinflussung: 'Beeinflussung', sense: 'Schattensense', ritual: 'Blutritual (1/2)' };
// Blut trinken: jede Person gibt nur beim ersten Mal einen Wert (Roman: A Staerke, B Agilitaet, AB Ausdauer, 0 freier Punkt)
function drinkBlood(person, type) {
  const Q = SAVE.quinn;
  if (Q.bloodFrom[person]) return null;
  Q.bloodFrom[person] = type; Q.blood[type] = (Q.blood[type] || 0) + 1;
  const base = type.replace(/[+-]/, '');
  let gain;
  if (base === 'A') { Q.stats.str++; gain = 'Stärke +1'; }
  else if (base === 'B') { Q.stats.agi++; gain = 'Agilität +1'; }
  else if (base === 'AB') { Q.stats.sta++; gain = 'Ausdauer +1'; }
  else { Q.points++; gain = '1 freier Wertepunkt'; }
  if (Q.skills.includes('bloodbank')) Q.bank = Math.min(100, Q.bank + 30);
  writeSave();
  return gain;
}
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
