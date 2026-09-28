'use strict';
/* ==========================================================================
   FINN MUELLER IM ARCADE-MODUS
   Finn beginnt jeden Lauf als Mensch ohne Kraefte und durchlaeuft seine
   Evolutionen IM LAUF, in der Reihenfolge des Romans:
   Buch -> Halbling -> Vampir -> Vampiradliger -> Vampirlord ->
   Himmlischer Vampirlord -> Gottbezwinger -> Der letzte Vampir.
   Mit jeder Form kommen die Faehigkeiten dazu, die er in dieser Zeit lernt.
   Arcade-Laeufe veraendern den Story-Fortschritt nicht.
   ========================================================================== */

// Meilensteine im Lauf (Stufe, oder ein Ereignis als Abkuerzung)
const FINN_ARC = [
  null,
  { lv: 1, txt: 'das Buch finden' },
  { lv: 6, txt: 'Stufe 6' },
  { lv: 12, txt: 'Stufe 12' },
  { lv: 19, txt: 'Stufe 19 oder einen Zwischenboss besiegen', ev: (G) => G.miniKilled },
  { lv: 26, txt: 'Stufe 26' },
  { lv: 33, txt: 'Stufe 33 oder wenn der Boss erscheint', ev: (G) => !!G.boss },
  { lv: 40, txt: 'Stufe 40 oder den Boss unter halbe Kraft bringen', ev: (G) => G.boss && G.boss.hp < G.boss.maxHp * 0.5 }
];
// Nur Finns eigene Faehigkeiten (angelehnt an seine Systemfaehigkeiten im Roman) und allgemeine Passive
const FINN_ARC_POOL = [
  [],
  ['blutspray', 'lebensraub', 'vampirblut', 'nebelgang', 'grabesmacht', 'seelenmagnet'],
  ['hammerschlag', 'blitzschritt', 'kettenreaktion', 'schattenfesseln'],
  ['blutsicheltritt'],
  ['blutkugeln'],
  ['blutwald'],
  [],
  []
];
// was Finn mit jeder Form sofort bekommt
const FINN_ARC_GRANTS = [[], ['blutspray'], ['hammerschlag', 'blitzschritt'], ['schattenfesseln'], ['blutkugeln'], ['himmelsstrahl'], ['goetterfall'], []];
const _finnGrantArc = finnGrant;
finnGrant = function (p, tier) {
  if (!GAME || !GAME.finnArcade) return _finnGrantArc(p, tier);
  for (const c of FINN_ARC_GRANTS[tier]) { if (p.ab[c]) continue; p.ab[c] = { lvl: 1, t: 0.4 }; p.order.push(c); }
  // Der letzte Vampir: jede Faehigkeit erreicht sofort ihre Ulti
  if (tier === 7) for (const k in p.ab) if (CARDS[k] && typeof ULTI !== 'undefined' && ULTI[k]) { p.ab[k].lvl = CARDS[k].max; p.ab[k].ulti = true; p.ab[k].ut = 1; }
};
// keine geteilten Fusionen fuer den Arcade-Finn
const _offersFinnArc = makeOffers;
makeOffers = function () {
  const out = _offersFinnArc();
  if (GAME.finnArcade || (HEROES[GAME.p.hero] && HEROES[GAME.p.hero].evoHero)) { const used = new Set(out.map((o) => o.id)); for (let i = 0; i < out.length; i++) if (out[i].fusion) { const f = ['bloodcup', 'soulgift', 'kristallsplitter'].find((k) => !used.has(k)); used.add(f); out[i] = { id: f, filler: true }; } }
  return out;
};

// Finn in die Arcade-Heldenwahl (vor Sen Draco)
(function () { if (!HERO_ORDER.includes('finn')) { const i = HERO_ORDER.indexOf('draco'); HERO_ORDER.splice(i >= 0 ? i : HERO_ORDER.length, 0, 'finn'); } })();
HEROES.finn.mech = { name: 'Evolution im Lauf', desc: 'Finn beginnt als Mensch und muss das Buch finden. Danach wächst er im Lauf Form für Form – bis zur höchsten Form, die du in der Kampagne freigeschaltet hast. Jede Form bringt mehr Leben, Tempo und Kraft, neue eigene Fähigkeiten und mehr Plätze.' };

const _poolOfArc = HEROES.finn.poolOf;
HEROES.finn.poolOf = function (p) {
  if (!GAME || !GAME.finnArcade) return _poolOfArc(p);
  const s = new Set(); for (let i = 0; i <= (p.tier || 0); i++) FINN_ARC_POOL[i].forEach((c) => s.add(c));
  return [...s].filter((c) => CARDS[c]);
};

// Lauf starten: immer als Mensch, zaehlt nicht fuer die Story-Evolution
const _newRunArc = newRun;
newRun = function (heroId, opts) {
  const arcade = heroId === 'finn' && !(opts && opts.story);
  if (arcade) PENDING_FINN = 0;
  _newRunArc(heroId, opts);
  if (arcade && GAME) { GAME.finnArcade = true; GAME.finnTest = true; }
};

// Evolution im Lauf pruefen
const _onUpdArc = HEROES.finn.onUpdate;
HEROES.finn.onUpdate = function (dt) {
  if (_onUpdArc) _onUpdArc(dt);
  const G = GAME; if (!G || !G.finnArcade || G.state !== 'play') return;
  const p = G.p; if (!p.alive || !p.tier) return;
  const N = FINN_ARC[p.tier + 1];
  if (!N || (G.evoLock || 0) > G.t) return;
  if (G.level >= N.lv || (N.ev && N.ev(G))) { G.evoLock = G.t + 2; finnEvolve(p.tier + 1); }
};

// Evolutions-Anzeige: naechste Form mit Arcade-Bedingung
const _evoUiArc = UI.evolution;
UI.evolution = function (T, N) {
  if (GAME && GAME.finnArcade && N) { const i = FINN_TIERS.indexOf(N); N = Object.assign({}, N, { level: FINN_ARC[i] ? String(FINN_ARC[i].lv) + (FINN_ARC[i].ev ? ' (' + FINN_ARC[i].txt.replace(/^Stufe \d+ oder /, 'oder ') + ')' : '') : '?' }); }
  return _evoUiArc.call(this, T, N);
};

// Ende des Laufs: nur zeigen, welche Form erreicht wurde
const _onEndArc = HEROES.finn.onEnd;
HEROES.finn.onEnd = function (won) {
  if (GAME && GAME.finnArcade) return { arcade: true, tier: GAME.p.tier || 0, won };
  return _onEndArc(won);
};
const _finnEndHtmlArc = finnEndHtml;
finnEndHtml = function (x) {
  if (!x.arcade) return _finnEndHtmlArc(x);
  const T = FINN_TIERS[x.tier];
  return `<div class="blk" style="margin-top:8px"><b class="lbl" style="color:${T.col}">ERREICHTE FORM</b><p style="color:${T.col};font-size:18px">${T.name}</p><p class="small">Stufe ${x.tier} von ${FINN_TIERS.length - 1} im Lauf. Im Arcade-Modus beginnt jeder Lauf neu als Mensch.</p></div>`;
};
// Heldenwahl: Weg der Evolution statt Formwahl
finnSelectHtml = function () {
  return `<div class="blk"><b class="lbl">EVOLUTION IM LAUF</b><p>${FINN_TIERS.slice(1).map((T, i) => `<span style="color:${T.col}">${T.name}</span> <span style="opacity:.7">(${FINN_ARC[i + 1].txt})</span>`).join(' → ')}</p></div>`;
};
