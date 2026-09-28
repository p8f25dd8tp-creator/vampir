'use strict';
/* ==========================================================================
   EVOLUTIONS-FREISCHALTUNG — Mischform:
   Im Lauf entwickelt sich der Held weiter Stufe fuer Stufe, aber nur bis zur
   hoechsten dauerhaft freigeschalteten Form. Neue Formen kosten Seelen und
   Bestienkristalle und oeffnen sich erst nach der passenden Etappe.
   ========================================================================== */

function evoTiersOf(id) { if (id === 'finn') return FINN_TIERS; const H = HEROES[id]; return H && H.evoHero ? H.tiers : null; }
function evoBaseCap(id) { return id === 'finn' ? 2 : 1; } // Finn: Mensch, Buch, erste Stufe sind frei
function evoCap(id) {
  const T = evoTiersOf(id); if (!T) return 99;
  if (SAVE.settings.testUnlock) return T.length - 1;
  const C = campSave(); C.evo = C.evo || {};
  return Math.min(T.length - 1, Math.max(evoBaseCap(id), C.evo[id] || 0));
}
// Benoetigte Etappe: gleichmaessig ueber die Kampagne verteilt, nie vor der Heldenfreischaltung
function evoReqE(id, k) {
  const T = evoTiersOf(id), n = T.length, b = evoBaseCap(id);
  return Math.min(ETAPPEN.length, Math.max((HERO_UNLOCK_ETAPPE[id] || 0) + 1, Math.round((k - b) * 9 / Math.max(1, n - 1 - b)) + 1));
}
function evoCost(id, k) { return { souls: 120 + 110 * k, crystals: Math.round(20 * Math.pow(k, 1.7)) }; }
function evoCanUnlock(id) {
  const T = evoTiersOf(id), k = evoCap(id) + 1; if (!T || k >= T.length) return false;
  const c = evoCost(id, k), C = campSave();
  return etappeCleared(evoReqE(id, k)) && SAVE.souls >= c.souls && C.crystals >= c.crystals && isUnlocked(id);
}
function evoUnlock(id) {
  if (!evoCanUnlock(id)) return false;
  const k = evoCap(id) + 1, c = evoCost(id, k), C = campSave();
  SAVE.souls -= c.souls; C.crystals -= c.crystals; C.evo[id] = k; writeSave();
  sfx('fusion'); return true;
}

// Im Lauf: gesperrte Form blockt die Entwicklung (einmaliger Hinweis)
function evoBlocked(tier) {
  const G = GAME, p = G.p;
  if (G.evoCapShown === tier) return false;
  G.evoCapShown = tier;
  const T = evoTiersOf(p.hero)[tier];
  UI.sysWindow('NÄCHSTE FORM GESPERRT', T.name, 'Im Menü unter Helden freischalten');
  return false;
}
const _evoEvolveCap = evoEvolve;
evoEvolve = function (p, tier) { if (tier > evoCap(p.hero)) return evoBlocked(tier); return _evoEvolveCap(p, tier); };
const _finnEvolveCap = finnEvolve;
finnEvolve = function (tier) { if (GAME && GAME.p && tier > evoCap('finn')) return evoBlocked(tier); return _finnEvolveCap(tier); };

/* ------------------------------------------------------------ Heldenansicht */
// Bedingung im Lauf: Finn nutzt FINN_ARC, andere Helden stehen direkt in der Form
function evoRunText(id, i) {
  const src = id === 'finn' && typeof FINN_ARC !== 'undefined' ? FINN_ARC[i] : evoTiersOf(id)[i];
  if (!src) return '';
  if (src.txt) return 'im Lauf: ' + src.txt;
  return src.lv ? 'im Lauf ab Stufe ' + src.lv : '';
}
UI.evoUnlockHtml = function (id) {
  const T = evoTiersOf(id); if (!T) return '';
  const cap = evoCap(id), C = campSave();
  const rows = T.map((t, i) => {
    let st;
    if (i <= cap) st = `<span class="evok">✔</span>`;
    else if (i === cap + 1) {
      const c = evoCost(id, i), rq = evoReqE(id, i), done = etappeCleared(rq);
      st = done ? `<button class="btn small ${evoCanUnlock(id) ? 'primary' : ''}" data-act="evoup" data-id="${id}" ${evoCanUnlock(id) ? '' : 'disabled'}>Freischalten<br><small><span style="color:${SAVE.souls >= c.souls ? '#d8c0ff' : '#ff8a8a'}">${c.souls} ✦</span> · <span style="color:${C.crystals >= c.crystals ? '#8ad8ff' : '#ff8a8a'}">${c.crystals} ◆</span></small></button>`
        : `<span class="evlk">🔒 nach Etappe ${rq}</span>`;
    } else st = `<span class="evlk">🔒</span>`;
    return `<div class="evrow ${i <= cap ? 'on' : ''}"><i style="background:${t.col}"></i><div><b style="color:${i <= cap ? t.col : ''}">${t.name}</b>${i ? `<small>${evoRunText(id, i)}</small>` : '<small>Startform</small>'}</div>${st}</div>`;
  }).join('');
  return `<div class="blk"><b class="lbl">FORMEN · ${cap + 1} VON ${T.length} FREI</b><p class="small" style="margin:2px 0 6px">Im Lauf entwickelt sich der Held bis zur höchsten freigeschalteten Form.</p><div class="evlist">${rows}</div></div>`;
};
const _homeHeldenEvo = UI.homeHelden;
UI.homeHelden = function () {
  const html = _homeHeldenEvo.call(this), id = this.selHero;
  if (!evoTiersOf(id)) return html;
  return html.replace(/<div class="blk"><b class="lbl">EVOLUTION IM LAUF<\/b>[\s\S]*?<\/p><\/div>/, '')
    .replace(/(<div class="role">[\s\S]*?<\/div>)/, (m) => m + this.evoUnlockHtml(id));
};
const _actEvo = UI.act;
UI.act = function (a, ds, e) {
  if (a === 'evoup') { if (evoUnlock(ds.id)) this.toast(`Neue Form: ${evoTiersOf(ds.id)[evoCap(ds.id)].name}`); return this.showHome('helden'); }
  return _actEvo.call(this, a, ds, e);
};
