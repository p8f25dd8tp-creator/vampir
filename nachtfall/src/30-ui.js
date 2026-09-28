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
.btn:disabled, .btn.off { border-image-source: var(--ui-btn-grey); color: #9a90a8; filter: grayscale(.8) brightness(.72); opacity: .7; text-shadow: none; }
.bigplay:disabled, .startbtn:disabled { filter: grayscale(.9) brightness(.6); opacity: .75; }
.btn.small { border-width: 0 20px; border-image-width: 0 20px; padding: 6px 4px; }
.startbtn, .bigplay { border-style: solid; border-width: 0 46px; border-image: var(--ui-btn-gold) 0 132 fill / 0 46px stretch; border-radius: 0; background: none; box-shadow: none; color: #4a2200; text-shadow: 0 1px 0 rgba(255,240,180,.7); padding: 12px 0 10px; }
.bigplay:active, .startbtn:active { transform: translateY(2px) scale(.98); box-shadow: none; filter: brightness(1.1); }
.evrow .btn { border-width: 0 16px; border-image-width: 0 16px; }
/* Kopf- und Tab-Leiste */
.hometop { border-style: solid; border-width: 0 40px 10px; border-image: var(--ui-topbar) 40 150 30 fill / 0 40px 10px stretch; background: #140a2a; box-shadow: 0 3px 12px rgba(0,0,0,.5); padding-left: calc(var(--safe-l)); padding-right: calc(var(--safe-r)); }
.tabbar { border-style: solid; border-width: 10px 30px 0; border-image: var(--ui-tabbar) 30 110 0 fill / 10px 30px 0 stretch; background: #0e0826; padding-left: calc(var(--safe-l)); padding-right: calc(var(--safe-r)); }
.tabb { position: relative; }
.tabb.on { background: radial-gradient(ellipse 55% 75% at 50% 100%, rgba(255,190,80,.42), rgba(255,190,80,0) 72%); box-shadow: none; color: #ffe6a0; text-shadow: 0 1px 2px #000, 0 0 6px #000; }
.tabb.on::after { content: ''; position: absolute; left: 50%; bottom: 2px; width: min(52px, 62%); height: 3px; transform: translateX(-50%); border-radius: 2px; background: linear-gradient(90deg, rgba(255,208,112,0), #ffd070, rgba(255,208,112,0)); box-shadow: 0 0 10px #ffb040; }
.tabb.on img { opacity: 1; transform: scale(1.22) translateY(-3px); filter: drop-shadow(0 0 8px rgba(255,200,90,.85)); }
.tabb .dot { position: absolute; top: 2px; left: calc(50% + 10px); min-width: 16px; height: 16px; border-radius: 8px; background: #e0303a; color: #fff; font: 800 11px/16px sans-serif; font-style: normal; box-shadow: 0 0 6px #ff3a4e; }
.hcur span { background: var(--ui-pill) center / 100% 100% no-repeat; border: 0; box-shadow: none; padding: 5px 14px 5px 10px; }
.ibtn:not(.hasimg) { background: var(--ui-btn-square) center / 100% 100% no-repeat; border: 0; box-shadow: none; }
.sbtn { background: var(--ui-btn-square) center / 100% 100% no-repeat; border: 0; box-shadow: none; padding: 8px 0 6px; }
/* Kampf-HUD */
.sysmsg { width: min(300px, 78vw); font-size: 13.5px; padding: 6px 10px; background: rgba(8,14,40,.78); }
.hint { bottom: calc(132px + var(--safe-b)); font-size: 14px; padding: 6px 14px; border-radius: 999px; background: rgba(10,4,20,.72); border: 1px solid rgba(200,170,255,.35); width: max-content; max-width: 86vw; }
/* Zurueck-Pfeil oben links */
.box { position: relative; }
.box .backarrow + h2 { margin-top: 28px; }
.backarrow { position: absolute; top: 6px; left: 8px; z-index: 3; border: 0; background: rgba(10,4,20,.6); color: #ffe6a0; font-family: 'Cinzel', serif; font-weight: 800; font-size: 13px; padding: 5px 10px; border-radius: 999px; border: 1px solid rgba(201,162,76,.6); cursor: pointer; }
/* Macht */
.machtblk { margin: 8px 0; padding: 8px 10px; border-radius: 10px; background: rgba(8,14,40,.6); border: 1px solid rgba(110,170,255,.35); font-size: 13px; }
.machtblk .mrow { display: flex; justify-content: space-between; gap: 8px; margin: 2px 0; }
.machtblk .mbar { height: 6px; border-radius: 3px; background: rgba(255,255,255,.12); overflow: hidden; margin: 3px 0 6px; }
.machtblk .mbar i { display: block; height: 100%; background: linear-gradient(90deg, #4ad890, #9affb0); }
.machtblk .mscale { position: relative; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #3a3450, #6a2a8a 50%, #ff3a4e); margin: 5px 0 6px; }
.machtblk .mscale i { position: absolute; top: -2px; height: 12px; border: 1.5px solid #ffe6a0; border-radius: 6px; }
.machtblk .mscale u { position: absolute; top: -5px; width: 4px; height: 18px; margin-left: -2px; background: #fff; border-radius: 2px; box-shadow: 0 0 6px #fff; }
.machtblk small { color: #b8c8e8; }
.mrate { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 6px auto 0; max-width: 420px; padding: 4px 10px; border-radius: 999px; font-size: 12.5px; background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.15); }
.mrate b { font-family: 'Cinzel', serif; }
.mrate.r-leicht b { color: #7dff9a; } .mrate.r-fair b { color: #c8ff7a; } .mrate.r-hart b { color: #ffd070; } .mrate.r-sehrhart b { color: #ff9a5a; }
.mrate.r-schwach, .mrate.r-nie { border-color: #ff4a5a; } .mrate.r-schwach b, .mrate.r-nie b { color: #ff5a6a; }
.mwhy { display: block; color: #ffb0b0; margin-top: 3px; }
/* Kopfzeile */
.hprof > div { min-width: 0; overflow: hidden; }
.hprof small { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; letter-spacing: -.01em; }
.hcur, .hbtns { flex: none; }
.hcur { gap: 3px; } .hcur span { padding: 4px 9px 4px 6px !important; font-size: 12.5px; }
.hbtns { gap: 2px; }
/* Pause */
.pset { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.pset .btn { font-size: 11px; padding: 8px 0; white-space: nowrap; letter-spacing: 0; }
.maplabels { -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 56px); mask-image: linear-gradient(180deg, transparent 0, #000 56px); }
/* Helden */
.hcard .nm .hunl { display: block; margin-top: 2px; font-family: sans-serif; font-size: 9px; font-weight: 600; color: #ffcf8a; letter-spacing: 0; text-transform: none; }
.selbadge { margin-top: 8px; padding: 10px; text-align: center; font-family: 'Cinzel', serif; font-weight: 800; color: #9affb0; border: 1.5px solid rgba(120,255,160,.5); border-radius: 10px; background: rgba(40,120,70,.18); }
/* Kampagne */
.cshead { margin-top: 10px; }
.backcur { background: linear-gradient(180deg, rgba(40,20,80,.92), rgba(14,6,30,.92)); border: 1.5px solid #c9a24c; border-radius: 999px; padding: 6px 16px; font-size: 13px; box-shadow: 0 4px 14px rgba(0,0,0,.6); }
.backcur span { font-size: 18px; vertical-align: -2px; }
.campsheet { border-style: solid; border-width: 22px 34px 0; border-image: var(--ui-sheet) 70 110 0 fill / 22px 34px 0 stretch; background: #140a30; box-shadow: 0 -6px 20px rgba(0,0,0,.5); padding-left: calc(var(--safe-l)); padding-right: calc(var(--safe-r)); }
.lvdot { background: var(--ui-lv-open) center / 100% 100% no-repeat; border: 0; box-shadow: none; border-radius: 0; color: #fff; }
.lvdot.boss { background-image: var(--ui-lv-boss); }
.lvdot.sel { background: var(--ui-lv-sel) center / 100% 100% no-repeat; box-shadow: none; filter: drop-shadow(0 0 8px rgba(255,200,90,.7)); color: #4a2200; }
.lvdot.locked { background-image: var(--ui-lv-locked); opacity: .85; }
.mlab .mlt { background: linear-gradient(180deg, rgba(40,20,80,.92), rgba(14,6,30,.92)); border: 1.5px solid #c9a24c; border-radius: 12px; padding: 3px 14px 3px 4px; box-shadow: 0 4px 14px rgba(0,0,0,.6), inset 0 0 12px rgba(160,120,255,.25); }
.mlab .mlt b { font-size: 17px; -webkit-text-stroke: 0; text-shadow: 0 2px 0 #0a0418; }
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
