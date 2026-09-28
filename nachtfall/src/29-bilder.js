'use strict';
/* ==========================================================================
   GEMALTE GRAFIKEN (img/*.webp): Ausruestung, Waehrungen, Tab- und
   Seitensymbole, Heldenportraets, Logo, Titelbild und Menue-Hintergruende.
   In der Einzeldatei sind sie eingebettet (window.IMG_B64). Fehlt ein Bild,
   bleibt das bisherige gezeichnete Symbol.
   ========================================================================== */

const IMG_HAVE = new Set(['amulett_1', 'amulett_2', 'amulett_3', 'amulett_4', 'amulett_5', 'amulett_6', 'btn_aufgaben', 'btn_chronik', 'btn_endlos', 'btn_turm', 'handschuhe_1', 'handschuhe_2', 'handschuhe_3', 'handschuhe_4', 'handschuhe_6', 'held_agathon', 'held_chris', 'held_draco', 'held_emma', 'held_fabian', 'held_finn', 'held_leander', 'held_lena', 'held_leo', 'held_mia', 'held_peter', 'held_sam', 'held_sil', 'logo', 'menue_hg', 'ruestung_1', 'ruestung_2', 'ruestung_3', 'ruestung_4', 'ruestung_5', 'ruestung_6', 'schmiede_hg', 'seelen', 'stiefel_1', 'stiefel_3', 'stiefel_4', 'stiefel_5', 'stiefel_6', 'tab_events', 'tab_helden', 'tab_schmiede', 'tab_system', 'titel', 'waffe_1', 'waffe_2', 'waffe_3', 'waffe_4', 'waffe_5']);
function imgUrl(n) { if (window.IMG_B64 && window.IMG_B64[n]) return window.IMG_B64[n]; return IMG_HAVE.has(n) && !window.IMG_B64 ? 'img/' + n + '.webp' : null; }
function gearImg(id, r) { return imgUrl(id + '_' + ((r || 0) + 1)); }
const TAB_IMG = { kampagne: 'tab_kampagne', helden: 'tab_helden', ausruestung: 'tab_schmiede', familie: 'tab_familie', system: 'tab_system', events: 'tab_events' };
const CUR = { souls: () => imgUrl('seelen'), crystals: () => imgUrl('kristall') };
function curIcon(k, txt) { const u = CUR[k](); return u ? `<img class="curimg" src="${u}" alt="">` : txt; }

const _showHomeImg = UI.showHome;
UI.showHome = function (tab) {
  const d = _showHomeImg.call(this, tab); if (!d) return d;
  const C = campSave(), home = d.querySelector('.home');
  // Kopfleiste: Portraet und Waehrungen
  const hc = d.querySelector('#homehero'), pu = imgUrl('held_' + C.hero);
  if (hc && pu) { const im = document.createElement('img'); im.id = 'homehero'; im.className = 'hport'; im.src = pu; hc.replaceWith(im); }
  const cur = d.querySelector('.hcur');
  if (cur) cur.innerHTML = `<span style="color:#d8c0ff">${curIcon('souls', '✦')} ${SAVE.souls}</span><span style="color:#8ad8ff">${curIcon('crystals', '◆')} ${C.crystals}</span>`;
  const ib = { codex: 'btn_chronik', settings: 'btn_settings' };
  d.querySelectorAll('.ibtn').forEach((b) => { const u = imgUrl(ib[b.dataset.act]); if (u) { b.innerHTML = `<img src="${u}" alt="">`; b.classList.add('hasimg'); } });
  // Tab-Leiste
  d.querySelectorAll('.tabb').forEach((b) => { const u = imgUrl(TAB_IMG[b.dataset.tab]); if (u) b.querySelector('img').src = u; });
  // Seitenknoepfe der Karte
  d.querySelectorAll('.sbtn').forEach((b) => { const n = b.dataset.act === 'tower' ? 'btn_turm' : b.dataset.act === 'endless' ? 'btn_endlos' : b.dataset.tab === 'events' ? 'btn_aufgaben' : TAB_IMG[b.dataset.tab]; const u = imgUrl(n); if (u) b.querySelector('img').src = u; });
  // Schmiede: Ausruestung nach Stufe
  d.querySelectorAll('.gearrow').forEach((row) => { const bt = row.querySelector('[data-id]'); if (!bt) return; const id = bt.dataset.id, u = gearImg(id, gearOf(id).r); if (u) row.querySelector('.gicon img').src = u; });
  // Heldenkarten: Portraets statt kleiner Figur
  d.querySelectorAll('canvas[data-prev]').forEach((c) => { const u = imgUrl('held_' + c.dataset.prev); if (!u) return; const im = document.createElement('img'); im.className = 'hport'; im.src = u; c.replaceWith(im); });
  this.previews = this.previews.filter((pv) => pv.c.isConnected);
  // Hintergruende
  const bg = this.tab === 'ausruestung' ? imgUrl('schmiede_hg') : this.tab !== 'kampagne' ? imgUrl('menue_hg') : null;
  if (home) home.style.background = bg ? `linear-gradient(180deg, rgba(10,4,20,.35), rgba(10,4,20,.7)), url(${bg}) center / cover` : '';
  if (!UI.splashShown) figSplash();
  return d;
};

/* ------------------------------------------------------------ Startbildschirm */
function figSplash() {
  UI.splashShown = true;
  const t = imgUrl('titel'), l = imgUrl('logo'); if (!t) return;
  const s = document.createElement('div'); s.className = 'splash';
  s.innerHTML = `<div class="splbg" style="background-image:url(${t})"></div>${l ? `<img class="spllogo" src="${l}" alt="Nachtfall">` : '<h1 class="spltitle">NACHTFALL</h1>'}<div class="spltap">Tippen zum Starten</div>`;
  document.body.appendChild(s);
  s.addEventListener('pointerup', () => { try { AudioSys.init(); } catch (e) { /* egal */ } s.classList.add('out'); setTimeout(() => s.remove(), 450); });
}
