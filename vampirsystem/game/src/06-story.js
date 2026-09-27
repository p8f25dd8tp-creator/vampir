'use strict';
/* ==========================================================================
   STORY & OBERFLAECHE — Szenen (Dialog, Erzaehler, System-Fenster),
   Kampf-HUD mit Handy-Steuerung, System-Meldungen im Kampf.
   Alle Texte sind eigene Nacherzaehlungen, keine Zitate aus dem Roman.
   ========================================================================== */

const UI = { root: document.getElementById('ui'), hud: null, scene: null };
function uiShow(html, cls) {
  UI.root.innerHTML = `<div class="screen ${cls || ''}">${html}</div>`;
  UI.hud = null;
  return UI.root.firstElementChild;
}
function sysBox(S) {
  return `<div class="sys"><div class="head">[ ${S.head || 'SYSTEM'} ]</div>
    ${(S.lines || []).map((l) => `<div class="line">${l}</div>`).join('')}
    ${S.kv ? `<div class="kv">${S.kv.map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join('')}</div>` : ''}
    ${(S.quests || []).map((q) => `<div class="quest">▸ ${q}</div>`).join('')}</div>`;
}

/* ------------------------------------------------------------ Szenen */
// beats: { who, text } | { narr } | { sys: {...} } | { portrait: lookId, extra } | { bg } | { call: fn }
function runScene(beats, done) {
  let i = -1, portrait = null, extra = null;
  UI.hud = null;
  const next = () => {
    i++;
    while (i < beats.length && (beats[i].portrait !== undefined || beats[i].bg || beats[i].call)) {
      const b = beats[i];
      if (b.portrait !== undefined) { portrait = b.portrait; extra = b.extra || null; }
      if (b.bg) SCENE_BG.cur = b.bg;
      if (b.call) b.call();
      i++;
    }
    if (i >= beats.length) { done && done(); return; }
    const b = beats[i];
    let inner;
    if (b.sys) { inner = sysBox(b.sys) + '<div class="tap">TIPPEN</div>'; sfx('card'); }
    else if (b.narr) inner = `<div class="box narr"><div class="txt">${b.narr}</div><div class="tap">TIPPEN</div></div>`;
    else inner = `<div class="box"><div class="who" style="color:${WHO_COL[b.who] || 'var(--gold)'}">${b.who}</div><div class="txt">${b.text}</div><div class="tap">TIPPEN</div></div>`;
    UI.root.innerHTML = `<div class="screen scene" style="justify-content:${b.sys ? 'center' : 'flex-end'}">${portrait && !b.sys ? '<canvas class="portrait"></canvas>' : ''}${inner}</div>`;
    const sc = UI.root.firstElementChild;
    if (portrait && !b.sys) drawPortrait(sc.querySelector('canvas'), portrait, extra, b.who);
    sc.addEventListener('pointerup', () => { AudioSys.init(); sfx('click'); next(); });
    UI.scene = { next };
  };
  next();
}
const WHO_COL = { Quinn: '#9ab0ff', Peter: '#9aff9a', Kyle: '#ffb040', Vorden: '#ffd27a', Layla: '#c8a0ff' };
function drawPortrait(c, id, extra, who) {
  const W = 360, H = 360; c.width = W * VIEW.dpr; c.height = H * VIEW.dpr;
  const g = c.getContext('2d');
  const px = 5.2 * VIEW.dpr;
  const talking = who && LOOKS[id] && who.toLowerCase() === id;
  const spr = renderFigure(LOOKS[id], { t: 1 + (talking ? performance.now() / 1000 : 0), run: 0, cast: 0 }, px, null, extra);
  g.globalAlpha = 0.95;
  g.drawImage(spr.out, c.width / 2 - spr.S / 2, c.height * 0.98 - spr.anchorY);
}
// Hintergruende fuer Szenen ohne Kampf
const SCENE_BG = { cur: 'zimmer' };
function renderSceneBg(t) {
  const g = ctx, W = cv.width, H = cv.height;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const B = { zimmer: ['#1a1624', '#07060c', '#6a4a2a'], nacht: ['#0c1428', '#03050c', '#4a6aa0'], kantine: ['#3a4250', '#12161e', '#c8d0dc'], bus: ['#2a2e3a', '#0a0c12', '#8a9ab0'], system: ['#0a1a34', '#02060e', '#6ec8ff'] }[SCENE_BG.cur] || ['#101018', '#040408', '#888'];
  g.fillStyle = rg(g, W / 2, H * 0.3, 10, Math.max(W, H), [0, B[0], 1, B[1]]); g.fillRect(0, 0, W, H);
  // leichtes Glimmen / Staub
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 24; i++) {
    const x = (hash2(i, 1, 3) % 1000) / 1000 * W, y = ((hash2(i, 2, 3) % 1000) / 1000 * H + t * 12 * (1 + i % 3)) % H;
    g.globalAlpha = 0.08 + 0.06 * Math.sin(t + i);
    g.drawImage(glowSprite(B[2]), x - 20, y - 20, 40, 40);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

/* ------------------------------------------------------------ Kampf-HUD */
function buildHud(opt) {
  UI.root.innerHTML = `<div class="hud">
    <div class="me"><div class="nm">QUINN TALEN<small id="lvl">Stufe ${SAVE.quinn.level}</small></div>
      <div class="bar hp"><i id="hpb"></i></div><div class="hpnum" id="hpn"></div>
      <div class="bar st" id="stbw"><i id="stb"></i></div></div>
    <div class="foe" id="foe" style="display:none"><div class="nm" id="foen"></div><div class="bar"><i id="foeb"></i></div></div>
    <button class="pause" id="pauseBtn">❚❚</button>
    <div class="hint" id="hint"></div>
    <div class="stickzone" id="sz"><div class="stick" style="display:none"><i></i></div></div>
    <div class="pad">
      <button class="insp ${opt.inspect ? '' : 'off'}" id="bInsp">INSPECT</button>
      <button class="dodge" id="bDodge">AUS-<br>WEICHEN</button>
      <button class="atk" id="bAtk">ANGRIFF</button>
    </div>
    <div class="sysmsg" id="sysmsg"></div>
    <div class="inspect" id="insp"></div>
  </div>`;
  UI.hud = UI.root.firstElementChild;
  bindStick($('#sz'), $('#sz .stick i'));
  bindButton($('#bAtk'), () => { INPUT.atkHeld = true; pushInput('atkDown'); }, () => { INPUT.atkHeld = false; pushInput('atkUp'); });
  bindButton($('#bDodge'), () => pushInput('dodge'));
  bindButton($('#bInsp'), () => pushInput('inspect'));
  $('#pauseBtn').addEventListener('pointerup', () => showPause());
  UI.cache = {};
}
function updateHud() {
  if (!UI.hud || !G) return;
  const p = G.player, C = UI.cache;
  const hpK = p.hp + '/' + p.maxHp;
  if (C.hp !== hpK) { C.hp = hpK; $('#hpb').style.width = (p.hp / p.maxHp * 100) + '%'; $('#hpn').textContent = `HP ${Math.ceil(p.hp)} / ${p.maxHp}`; }
  const st = Math.round(p.stam);
  if (C.st !== st) { C.st = st; $('#stb').style.width = st + '%'; $('#stbw').classList.toggle('low', st < 25); }
  const f = G.foe;
  if (f && G.showFoe) {
    const k = f.name + f.hp;
    if (C.foe !== k) { C.foe = k; $('#foe').style.display = ''; $('#foen').textContent = f.name; $('#foeb').style.width = (f.hp / f.maxHp * 100) + '%'; }
  }
  const h = G.hint ? G.hint.text : '';
  if (C.hint !== h) { C.hint = h; $('#hint').innerHTML = h; }
  const ch = p.state === 'charge' && p.stateT > 0.45;
  if (C.ch !== ch) { C.ch = ch; $('#bAtk').classList.toggle('charge', ch); }
  const lowD = p.stam < 18;
  if (C.lowD !== lowD) { C.lowD = lowD; $('#bDodge').classList.toggle('cd', lowD); }
}
function banner(text) {
  if (!UI.hud) return;
  const el = document.createElement('div'); el.className = 'banner'; el.textContent = text;
  UI.hud.appendChild(el); setTimeout(() => el.remove(), 1200);
}
function sysMsg(S, ms) {
  const box = $('#sysmsg'); if (!box) return;
  box.innerHTML = sysBox(S); sfx('card');
  clearTimeout(sysMsg.tm); sysMsg.tm = setTimeout(() => { box.innerHTML = ''; }, ms || 3200);
}
function showPause() {
  if (!G || G.state !== 'play') return;
  G.paused = true;
  const el = document.createElement('div'); el.className = 'screen dim'; el.style.pointerEvents = 'auto';
  el.innerHTML = `${sysBox({ head: 'PAUSE', lines: [MISSION ? MISSION.title : ''], kv: [['Treffer gelandet', G.stats.hits], ['Perfekt ausgewichen', G.stats.perfect], ['Schaden erlitten', G.stats.taken]] })}
    <button class="btn" id="pRes">Weiter</button><button class="btn ghost" id="pRe">Kampf neu starten</button><button class="btn ghost" id="pMenu">Hauptmenü</button>`;
  UI.root.appendChild(el);
  el.querySelector('#pRes').onclick = () => { el.remove(); G.paused = false; };
  el.querySelector('#pRe').onclick = () => { el.remove(); startMission(MISSION.id, true); };
  el.querySelector('#pMenu').onclick = () => { G = null; showTitle(); };
}
