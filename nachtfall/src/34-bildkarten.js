'use strict';
/* ==========================================================================
   GPT-BILDER: Boss-Intro-Karten (Kampf, Kampagne, Inspektion),
   Etappenbilder (Kampagne) und Finns Formbilder (Charakterraum).
   ========================================================================== */

['form_1', 'form_2', 'form_3', 'form_4', 'form_6', 'form_7', 'form_8', 'etappe_1', 'etappe_2', 'etappe_3', 'etappe_4', 'etappe_5',
  'intro_ben', 'intro_boneclaw', 'intro_borden', 'intro_brandon', 'intro_chrimeta', 'intro_dalki', 'intro_duke', 'intro_emma_puppe', 'intro_feuerstein', 'intro_fex',
  'intro_hilston', 'intro_hypolord', 'intro_kinghunde', 'intro_krabbe', 'intro_kyle', 'intro_leo', 'intro_likmorn', 'intro_nate', 'intro_paul', 'intro_ranken',
  'intro_rylee', 'intro_sandruler', 'intro_scordana', 'intro_zwillinge'].forEach((n) => IMG_HAVE.add(n));

// Boss -> Intro-Karte
const BOSS_INTRO = {
  b1_kyle: 'kyle', b1_rylee: 'rylee', b1_brandon: 'brandon', b1_leo: 'leo', b1_nate: 'nate', b1_scordana: 'scordana', b1_ben: 'ben', c3_boss: 'dalki',
  b2_fex: 'fex', b2_emma: 'emma_puppe', b2_ranken: 'ranken', b2_likmorn: 'likmorn', c4_boss: 'duke',
  b3_boneclaw: 'boneclaw', b7_boneclaw: 'boneclaw', b3_borden: 'borden', b4_borden: 'borden', b3_paul: 'paul',
  b4_hypolord: 'hypolord', b4_hundR: 'kinghunde', b4_hundS: 'kinghunde', b4_chrimeta: 'chrimeta', b4_twins: 'zwillinge', b4_twinsF: 'zwillinge',
  b5_sand: 'sandruler', b5_feuerstein: 'feuerstein', b5_krabbe: 'krabbe', b5_krabbeF: 'krabbe', b5_hilston: 'hilston'
};
function bossIntroImg(id) { const k = BOSS_INTRO[id]; return k ? imgUrl('intro_' + k) : null; }
function etappeImg(e) { return imgUrl('etappe_' + e); }
function bossIdOf(e) { if (!e || !e.def) return null; if (e._bid !== undefined) return e._bid; for (const k in ENEMIES) if (ENEMIES[k] === e.def) return (e._bid = k); return (e._bid = null); }

/* ------------------------------------------------------------ Boss-Intro im Kampf */
const _hudIntro = UI.updateHud;
UI.updateHud = function () {
  _hudIntro.call(this);
  const G = GAME; if (!G || !G.camp || !G.boss || G.introFor === G.boss || !this.hud) return;
  G.introFor = G.boss;
  const id = bossIdOf(G.boss), u = bossIntroImg(id), d = ENEMIES[id] || G.boss.def;
  const L = G.lv, m = id && typeof BOSS_MACHT !== 'undefined' && BOSS_MACHT[id] && !(L && L.type === 'endure') ? BOSS_MACHT[id] : null;
  const el = document.createElement('div'); el.className = 'bossintro' + (u ? '' : ' noimg');
  el.innerHTML = `${u ? `<img src="${u}" alt="">` : ''}<div class="bitxt"><small>${L && L.type === 'endure' ? 'ÜBERLEBE' : 'BOSS'}</small><b>${d.name}</b>${m ? `<span>Macht ${m} · ${machtName(m)}</span>` : ''}</div>`;
  this.hud.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3300);
};

/* ------------------------------------------------------------ Kampagne: Etappenbild und Boss-Vorschau */
const _campSheetImg = UI.campSheet;
UI.campSheet = function () {
  let h = _campSheetImg.call(this);
  const C = campSave(), e = this.selEtappe || C.etappe || 1, u = etappeImg(e);
  if (u) h = h.replace('<div class="cshead">', `<div class="cshead csimg" style="background-image:linear-gradient(180deg, rgba(10,4,24,.15), rgba(10,4,24,.85)), url('${u}')">`);
  const L = lvDef(e, this.selLevel || 1), b = L && L.foe ? bossIntroImg(L.foe) : null;
  if (b) h = h.replace('<b class="csname">', `<img class="csboss" src="${b}" alt=""><b class="csname">`);
  return h;
};

/* ------------------------------------------------------------ Inspektion: Bild zum Boss */
if (typeof sysAnalyse === 'function') {
  const _sysAn = sysAnalyse;
  sysAnalyse = function () {
    let h = _sysAn();
    for (const id in BOSS_INTRO) {
      const u = bossIntroImg(id), s = seenStore()[id]; if (!u || !s || !ENEMIES[id]) continue;
      h = h.replace(`<b>${ENEMIES[id].name}</b><small>`, `<img class="sanimg" src="${u}" alt=""><b>${ENEMIES[id].name}</b><small>`);
    }
    return h;
  };
}

(function bkCss() {
  const st = document.createElement('style'); st.id = 'bildkartencss';
  st.textContent = `
.bossintro { position: absolute; left: 50%; top: calc(76px + var(--safe-t)); transform: translateX(-50%); width: min(360px, 88vw); border-radius: 14px; overflow: hidden; pointer-events: none; z-index: 30;
  border: 2px solid #c9a24c; box-shadow: 0 10px 40px rgba(0,0,0,.7), 0 0 30px rgba(255,60,80,.35); background: #12060e; animation: biIn .45s cubic-bezier(.2,1.4,.4,1); transition: opacity .6s, transform .6s; }
.bossintro img { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; }
.bossintro .bitxt { position: absolute; left: 0; right: 0; bottom: 0; padding: 22px 12px 10px; background: linear-gradient(180deg, transparent, rgba(8,2,10,.92)); text-align: center; }
.bossintro.noimg .bitxt { position: static; padding: 14px 12px; background: none; }
.bossintro small { display: block; font: 800 11px 'Cinzel', serif; letter-spacing: .35em; color: #ff6a7a; }
.bossintro b { display: block; font: 800 20px 'Cinzel', serif; color: #fff4c0; text-shadow: 0 2px 0 #000, 0 0 16px rgba(255,80,90,.6); line-height: 1.15; }
.bossintro span { font-size: 13px; color: #ffe6a0; }
.bossintro.out { opacity: 0; transform: translateX(-50%) translateY(-14px) scale(.96); }
@keyframes biIn { from { opacity: 0; transform: translateX(-50%) scale(.8); } to { opacity: 1; transform: translateX(-50%) scale(1); } }
@media (prefers-reduced-motion: reduce) { .bossintro { animation: none; } }
.cshead.csimg { background-size: cover; background-position: center; border-radius: 10px; padding: 26px 8px 8px; margin-bottom: 6px; border: 1px solid rgba(201,162,76,.45); }
.csboss { float: left; width: 64px; height: 44px; object-fit: cover; border-radius: 8px; margin: 2px 8px 2px 0; border: 1px solid rgba(201,162,76,.6); }
.csinfo::after { content: ''; display: block; clear: both; }
.sanimg { float: left; width: 42px; height: 30px; object-fit: cover; border-radius: 4px; margin-right: 6px; border: 1px solid rgba(110,200,255,.4); }
`;
  document.head.appendChild(st);
})();
