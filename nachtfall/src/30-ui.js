'use strict';
/* ==========================================================================
   GEMALTE BEDIENELEMENTE (img/ui_*.webp): Knoepfe, Leisten, Fenster,
   Stufen-Kacheln, Sterne und Schloss. Die Rahmen werden per border-image
   gestreckt (nur die Mitte waechst, Ecken bleiben unverzerrt).
   Fehlt ein Bild, bleibt das bisherige CSS-Aussehen.
   ========================================================================== */

const UI_IMGS = ['ui_topbar', 'ui_tabbar', 'ui_tab_active', 'ui_sheet', 'ui_btn_gold', 'ui_btn_purple', 'ui_btn_red', 'ui_btn_grey', 'ui_btn_round', 'ui_btn_square',
  'ui_lv_open', 'ui_lv_sel', 'ui_lv_locked', 'ui_lv_boss', 'ui_panel', 'ui_card', 'ui_nameplate', 'ui_badge', 'ui_pill', 'ui_star_on', 'ui_star_off', 'ui_lock', 'ui_skill_ring', 'ui_hpbar', 'ui_xpbar'];
UI_IMGS.forEach((n) => IMG_HAVE.add(n));

function uiSkinCss() {
  const v = UI_IMGS.map((n) => { const u = imgUrl(n); return u ? `--${n.replace(/_/g, '-')}: url("${u}");` : ''; }).join('\n');
  if (!imgUrl('ui_btn_gold')) return '';
  return `:root { ${v} }
/* Knoepfe: Ecken fest, Mitte gestreckt */
.btn { border-style: solid; border-width: 0 30px; border-image: var(--ui-btn-purple) 0 118 fill / 0 30px stretch; border-radius: 0; background: none; box-shadow: none; padding: 12px 6px; color: #fff4dc; text-shadow: 0 2px 0 rgba(20,0,30,.8); }
.btn.primary { border-image-source: var(--ui-btn-red); background: none; }
.btn.ghost { border-image-source: var(--ui-btn-grey); background: none; }
.btn:disabled, .btn.off { border-image-source: var(--ui-btn-grey); color: #c8c0d0; }
.btn.small { border-width: 0 20px; border-image-width: 0 20px; padding: 6px 4px; }
.startbtn, .bigplay { border-style: solid; border-width: 0 46px; border-image: var(--ui-btn-gold) 0 132 fill / 0 46px stretch; border-radius: 0; background: none; box-shadow: none; color: #4a2200; text-shadow: 0 1px 0 rgba(255,240,180,.7); padding: 12px 0 10px; }
.bigplay:active, .startbtn:active { transform: translateY(2px) scale(.98); box-shadow: none; filter: brightness(1.1); }
.evrow .btn { border-width: 0 16px; border-image-width: 0 16px; }
/* Kopf- und Tab-Leiste */
.hometop { border-style: solid; border-width: 0 40px 10px; border-image: var(--ui-topbar) 40 150 30 fill / 0 40px 10px stretch; background: #140a2a; box-shadow: 0 3px 12px rgba(0,0,0,.5); padding-left: calc(var(--safe-l)); padding-right: calc(var(--safe-r)); }
.tabbar { border-style: solid; border-width: 10px 30px 0; border-image: var(--ui-tabbar) 30 110 0 fill / 10px 30px 0 stretch; background: #0e0826; padding-left: calc(var(--safe-l)); padding-right: calc(var(--safe-r)); }
.tabb.on { background: var(--ui-tab-active) center / 100% 100% no-repeat; box-shadow: none; color: #fff4c0; text-shadow: 0 1px 2px #000, 0 0 6px #000; }
.hcur span { background: var(--ui-pill) center / 100% 100% no-repeat; border: 0; box-shadow: none; padding: 5px 14px 5px 10px; }
.ibtn:not(.hasimg) { background: var(--ui-btn-square) center / 100% 100% no-repeat; border: 0; box-shadow: none; }
.sbtn { background: var(--ui-btn-square) center / 100% 100% no-repeat; border: 0; box-shadow: none; padding: 8px 0 6px; }
/* Kampagne */
.campsheet { border-style: solid; border-width: 22px 34px 0; border-image: var(--ui-sheet) 70 110 0 fill / 22px 34px 0 stretch; background: #140a30; box-shadow: 0 -6px 20px rgba(0,0,0,.5); padding-left: calc(var(--safe-l)); padding-right: calc(var(--safe-r)); }
.lvdot { background: var(--ui-lv-open) center / 100% 100% no-repeat; border: 0; box-shadow: none; border-radius: 0; color: #fff; }
.lvdot.boss { background-image: var(--ui-lv-boss); }
.lvdot.sel { background: var(--ui-lv-sel) center / 100% 100% no-repeat; box-shadow: none; filter: drop-shadow(0 0 8px rgba(255,200,90,.7)); color: #4a2200; }
.lvdot.locked { background-image: var(--ui-lv-locked); opacity: .85; }
.mlab .mlt b { padding: 2px 4px; }
.mlab .mlt { border-style: solid; border-width: 0 26px; border-image: var(--ui-nameplate) 0 100 fill / 0 26px stretch; padding: 4px 0; }
.mnum { background: var(--ui-badge) center / 100% 100% no-repeat !important; border: 0; box-shadow: none; min-width: 34px; height: 36px; color: #ffe6a0 !important; }
/* Fenster und Karten */
.syswin, .box.panel { border-style: solid; border-width: 22px; border-image: var(--ui-panel) 90 fill / 22px stretch; border-radius: 0; background: none; box-shadow: 0 10px 30px rgba(0,0,0,.6); }
.card { border-style: solid; border-width: 16px 22px 16px 22px; border-image: var(--ui-card) 44 60 44 60 fill / 16px 22px 16px 22px stretch; border-radius: 0; background: none; box-shadow: 0 8px 20px rgba(0,0,0,.5); }
.card .ci { border-radius: 50%; border: 2px solid #c9a24c; }
.gearrow { border-style: solid; border-width: 12px 18px 12px 30px; border-image: var(--ui-card) 44 60 44 150 fill / 12px 18px 12px 30px stretch; border-radius: 0; background: none; }
.famrow, .evcard { border-style: solid; border-width: 14px; border-image: var(--ui-panel) 90 fill / 14px stretch; border-radius: 0; background: none; }
.tcard { border-style: solid; border-width: 14px; border-image: var(--ui-btn-square) 50 fill / 14px stretch; border-radius: 0; background: none; }
/* Sterne und Schloss */
.uistar { display: inline-block; width: 1em; height: 1em; vertical-align: -0.12em; background: var(--ui-star-on) center / contain no-repeat; }
.uistar.off { background-image: var(--ui-star-off); }
.uilock { display: inline-block; width: .9em; height: 1.2em; vertical-align: -0.2em; background: var(--ui-lock) center / contain no-repeat; }
/* Kampf */
.abtn { background: var(--ui-skill-ring) center / 100% 100% no-repeat !important; border: 0 !important; }
.xpbar { border-style: solid; border-width: 3px 14px; border-image: var(--ui-xpbar) 14 60 fill / 3px 14px stretch; border-radius: 0; background: none; height: 16px; overflow: visible; }
.xpfill { border-radius: 4px; }
.bossbar .bb { border-style: solid; border-width: 4px 18px 4px 34px; border-image: var(--ui-hpbar) 30 60 30 110 fill / 4px 18px 4px 34px stretch; border-radius: 0; background: none; height: 20px; overflow: visible; }
`;
}
(function uiSkinInstall() {
  const css = uiSkinCss(); if (!css) return;
  const st = document.createElement('style'); st.id = 'uiskin'; st.textContent = css; document.head.appendChild(st);
})();

// Text-Sterne und Schloss-Emojis gegen gemalte Symbole tauschen
function uiSkinDecorate(root) {
  if (!imgUrl('ui_star_on') || !root) return;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = []; let n;
  while ((n = walk.nextNode())) if (/[★☆🔒]/.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest('canvas,script,style,.nouiskin'))) hits.push(n);
  for (const t of hits) {
    const pe = t.parentElement, off = !!pe && (pe.tagName === 'U' || (pe.tagName === 'I' && !pe.closest('.lvdot')) || (!!pe.closest('.bigstars') && !pe.classList.contains('on')));
    const frag = document.createDocumentFragment();
    for (const ch of Array.from(t.nodeValue)) {
      if (ch === '★' || ch === '☆') { const s = document.createElement('span'); s.className = 'uistar' + (ch === '☆' || off ? ' off' : ''); frag.appendChild(s); }
      else if (ch === '🔒') { const s = document.createElement('span'); s.className = 'uilock'; frag.appendChild(s); }
      else frag.appendChild(document.createTextNode(ch));
    }
    t.replaceWith(frag);
  }
}
(function uiSkinObserve() {
  if (!imgUrl('ui_star_on')) return;
  let queued = false;
  const run = () => { queued = false; uiSkinDecorate(document.getElementById('ui')); };
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(document.getElementById('ui') || document.body, { childList: true, subtree: true, characterData: true });
})();
