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
  UI.portrait = { c, id, extra, talking: who && LOOKS[id] && who.toLowerCase() === id, spr: null, t0: performance.now() };
  paintPortrait(performance.now());
}
function paintPortrait(now) {
  const P = UI.portrait; if (!P || !P.c.isConnected) { UI.portrait = null; return; }
  const g = P.c.getContext('2d'), px = 5.2 * VIEW.dpr;
  const t = (now - P.t0) / 1000;
  // Atmen; wer spricht, gestikuliert leicht
  const cast = P.talking ? Math.max(0, Math.sin(t * 3.1)) * 0.35 : 0;
  P.spr = renderFigure(LOOKS[P.id], { t: 1 + t, run: 0, cast, aim: -0.2 }, px, P.spr, P.extra);
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, P.c.width, P.c.height);
  const k = Math.min(1, t * 4);
  g.globalAlpha = k;
  g.drawImage(P.spr.out, P.c.width / 2 - P.spr.S / 2 + (1 - k) * 30, P.c.height * 0.98 - P.spr.anchorY);
  g.globalAlpha = 1;
}
// Hintergruende fuer Szenen ohne Kampf (gezeichnet, eigene Gestaltung)
const SCENE_BG = { cur: 'zimmer' };
const SCENE_ART = {}; // weitere Szenen-Hintergruende (spaetere Etappen)
function renderSceneBg(t) {
  const g = ctx, W = cv.width, H = cv.height, u = Math.min(W, H) / 100;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const id = SCENE_BG.cur;
  const glowField = (col, n) => { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const x = (hash2(i, 1, 3) % 1000) / 1000 * W, y = ((hash2(i, 2, 3) % 1000) / 1000 * H - t * 10 * (1 + i % 3) + H * 10) % H; g.globalAlpha = 0.07 + 0.05 * Math.sin(t + i); g.drawImage(glowSprite(col), x - 3 * u, y - 3 * u, 6 * u, 6 * u); } g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; };
  if (id === 'zimmer') {
    // kleines Zimmer bei Nacht: Wand, Fenster, Schreibtisch mit dem schwarzen Buch
    g.fillStyle = lg(g, 0, 0, 0, H, [0, '#1c1826', 1, '#0c0a12']); g.fillRect(0, 0, W, H);
    g.fillStyle = '#16121e'; g.fillRect(0, H * 0.62, W, H * 0.38);
    const wx = W * 0.62, wy = H * 0.12, ww = W * 0.3, wh = H * 0.22;
    g.fillStyle = lg(g, 0, wy, 0, wy + wh, [0, '#1a2a4a', 1, '#2a3a5a']); g.fillRect(wx, wy, ww, wh);
    g.fillStyle = '#e8ecf8'; g.beginPath(); g.arc(wx + ww * 0.7, wy + wh * 0.35, u * 3, 0, TAU); g.fill();
    g.strokeStyle = '#0c0a12'; g.lineWidth = u; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(120,150,220,0.06)'; g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx + ww, wy + wh); g.lineTo(wx + ww * 0.6, H); g.lineTo(wx - ww * 0.7, H); g.fill(); g.globalCompositeOperation = 'source-over';
    const dx = W * 0.08, dy = H * 0.6; g.fillStyle = '#3a2a20'; g.fillRect(dx, dy, W * 0.44, u * 3); g.fillRect(dx + u * 2, dy, u * 2, H * 0.2); g.fillRect(dx + W * 0.44 - u * 4, dy, u * 2, H * 0.2);
    // das Buch
    const bx = dx + W * 0.14, by = dy - u * 2.4;
    g.fillStyle = '#08060a'; g.fillRect(bx, by, u * 14, u * 2.6); g.fillStyle = '#2a0a12'; g.fillRect(bx, by + u * 2, u * 14, u * 0.6);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 + Math.sin(t * 2) * 0.1; g.drawImage(glowSprite('#ff2a40'), bx - u * 6, by - u * 8, u * 26, u * 18); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  } else if (id === 'bus') {
    // Transport: Fensterreihe, draussen zieht die Militaerstadt vorbei
    g.fillStyle = '#1a1c24'; g.fillRect(0, 0, W, H);
    const wy = H * 0.14, wh = H * 0.3;
    g.fillStyle = lg(g, 0, wy, 0, wy + wh, [0, '#8ab8e8', 1, '#e8d8b0']); g.fillRect(0, wy, W, wh);
    for (let i = 0; i < 14; i++) { const bw = W * (0.08 + (hash2(i, 5, 1) % 100) / 900), bh = wh * (0.3 + (hash2(i, 6, 1) % 100) / 160); const x = ((i * W * 0.14 - t * W * 0.12) % (W * 1.9) + W * 1.9) % (W * 1.9) - W * 0.3; g.fillStyle = i % 2 ? '#5a6a82' : '#4a5870'; g.fillRect(x, wy + wh - bh, bw, bh); g.fillStyle = 'rgba(255,240,200,0.5)'; for (let k = 0; k < 4; k++) g.fillRect(x + bw * 0.2, wy + wh - bh + k * bh / 4 + u, bw * 0.2, u * 0.8); }
    g.fillStyle = '#2a2e3a'; for (let x = 0; x < W; x += W / 3) g.fillRect(x - u, wy, u * 2.4, wh);
    g.fillStyle = '#12141a'; g.fillRect(0, wy + wh, W, H);
    for (let x = W * 0.05; x < W; x += W * 0.3) { g.fillStyle = '#3a2a4a'; g.fillRect(x, H * 0.62, W * 0.2, H * 0.12); g.fillStyle = '#2a1e36'; g.fillRect(x, H * 0.5, W * 0.2, H * 0.12); }
  } else if (id === 'kantine') {
    g.fillStyle = lg(g, 0, 0, 0, H, [0, '#4a5262', 1, '#2a2e38']); g.fillRect(0, 0, W, H * 0.5);
    for (let x = W * 0.05; x < W; x += W * 0.24) { g.fillStyle = '#9ec8e8'; g.fillRect(x, H * 0.08, W * 0.16, H * 0.16); g.strokeStyle = '#2a303c'; g.lineWidth = u; g.strokeRect(x, H * 0.08, W * 0.16, H * 0.16); }
    const T = u * 9; for (let y = H * 0.5; y < H; y += T) for (let x = 0; x < W; x += T) { g.fillStyle = ((x + y) / T | 0) % 2 ? '#9a9ea8' : '#8a8e98'; g.fillRect(x, y, T, T); }
    g.fillStyle = 'rgba(10,12,18,0.35)'; g.fillRect(0, 0, W, H);
    for (const [x, y] of [[0.05, 0.56], [0.6, 0.6], [0.2, 0.78]]) { g.fillStyle = '#6a4a30'; g.fillRect(W * x, H * y, W * 0.35, u * 4); }
  } else if (id === 'nacht') {
    g.fillStyle = lg(g, 0, 0, 0, H, [0, '#060a1c', 0.7, '#101a34', 1, '#1a2438']); g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { const x = (hash2(i, 9, 2) % 1000) / 1000 * W, y = (hash2(i, 8, 2) % 1000) / 1000 * H * 0.6; g.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + i)); g.fillStyle = '#fff'; g.fillRect(x, y, u * 0.35, u * 0.35); }
    g.globalAlpha = 1;
    g.fillStyle = '#e8ecf8'; g.beginPath(); g.arc(W * 0.78, H * 0.14, u * 5, 0, TAU); g.fill(); glowField('#9ab0ff', 6);
    g.fillStyle = '#070912'; g.beginPath(); g.moveTo(0, H * 0.7);
    for (let i = 0; i <= 12; i++) { const x = W * i / 12, h = H * (0.08 + (hash2(i, 3, 3) % 100) / 700); g.lineTo(x, H * 0.7 - h); g.lineTo(x + W / 12, H * 0.7 - h); }
    g.lineTo(W, H); g.lineTo(0, H); g.fill();
    for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,220,150,0.6)'; g.fillRect((hash2(i, 4, 7) % 1000) / 1000 * W, H * (0.6 + (hash2(i, 5, 7) % 100) / 1000), u * 0.8, u * 0.8); }
  } else if (id === 'system') {
    g.fillStyle = rg(g, W / 2, H * 0.45, u * 4, Math.max(W, H) * 0.8, [0, '#0e2a54', 1, '#02060e']); g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(110,200,255,0.08)'; g.lineWidth = 1;
    const gs = u * 8, off = (t * u * 3) % gs;
    for (let x = -gs; x < W + gs; x += gs) { g.beginPath(); g.moveTo(x + off, 0); g.lineTo(x + off, H); g.stroke(); }
    for (let y = -gs; y < H + gs; y += gs) { g.beginPath(); g.moveTo(0, y + off); g.lineTo(W, y + off); g.stroke(); }
    glowField('#6ec8ff', 18);
  } else if (SCENE_ART[id]) SCENE_ART[id](g, W, H, u, t, glowField);
  else { g.fillStyle = '#08080e'; g.fillRect(0, 0, W, H); }
  if (id !== 'system') glowField(id === 'zimmer' ? '#ff6a7a' : '#aab8d8', 10);
  if (UI.portrait) paintPortrait(performance.now());
}

/* ------------------------------------------------------------ Kampf-HUD */
function buildHud(opt) {
  UI.root.innerHTML = `<div class="hud">
    <div class="me"><div class="nm"><span id="pname">QUINN TALEN</span><small id="lvl">Stufe ${SAVE.quinn.level}</small></div>
      <div class="bar xp"><i id="xpb"></i></div>
      <div class="bar hp"><i id="hpb"></i></div><div class="hpnum" id="hpn"></div>
      <div class="bar st" id="stbw"><i id="stb"></i></div>
      ${SAVE.quinn.skills.includes('schatten') && !opt.hub ? '<div class="bar mc" id="mcw"><i id="mcb"></i></div>' : ''}
      <div class="goal" id="goal"></div></div>
    <div class="sunchip" id="sun">☀ SONNE · WERTE HALBIERT</div>
    <div class="foe" id="foe" style="display:none"><div class="nm" id="foen"></div><div class="bar"><i id="foeb"></i></div></div>
    <button class="pause" id="pauseBtn">❚❚</button>
    ${opt.hub ? '<button class="pause statusbtn" id="statusBtn">☰</button>' : ''}
    <div class="hint" id="hint"></div>
    <div class="party" id="party"></div>
    <div class="bank" id="bank"></div>
    <div class="stickzone" id="sz"><div class="stick" style="display:none"><i></i></div></div>
    <div class="pad">
      <button class="insp ${opt.inspect || SAVE.quinn.skills.includes('inspect') ? '' : 'off'}" id="bInsp">ANALYSE</button>
      ${SAVE.quinn.skills.includes('bloodswipe') && !opt.hub ? '<button class="skill" id="bSkill">BLUT-<br>SCHNITT<small>1 HP</small></button>' : ''}
      ${SAVE.quinn.skills.includes('flashstep') && !opt.hub ? '<button class="skill s2" id="bSkill2">BLITZ-<br>SCHRITT</button>' : ''}
      ${SAVE.quinn.skills.includes('hammer') && !opt.hub ? '<button class="skill s3" id="bSkill3">HAMMER-<br>SCHLAG</button>' : ''}
      ${SAVE.quinn.skills.includes('bloodspray') && !opt.hub ? '<button class="skill s4" id="bSkill4">BLUT-<br>SPRAY<small>5 HP</small></button>' : ''}
      ${SAVE.quinn.skills.includes('schatten') && !opt.hub ? '<button class="skill s5" id="bSkill5">SCHAT-<br>TEN<small>25 MC</small></button>' : ''}
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
  if ($('#bSkill')) bindButton($('#bSkill'), () => pushInput('skill1'));
  if ($('#bSkill2')) bindButton($('#bSkill2'), () => pushInput('skill2'));
  if ($('#bSkill3')) bindButton($('#bSkill3'), () => pushInput('skill3'));
  if ($('#bSkill4')) bindButton($('#bSkill4'), () => pushInput('skill4'));
  if ($('#bSkill5')) bindButton($('#bSkill5'), () => pushInput('skill5'));
  $('#pauseBtn').addEventListener('pointerup', () => showPause());
  if (opt.hub) $('#statusBtn').addEventListener('pointerup', () => { if (!G) return; G.paused = true; showStatus(() => { if (G) G.paused = false; }); });
  UI.cache = {};
}
function updateHud() {
  if (!UI.hud || !G) return;
  const p = G.player, C = UI.cache;
  const hpK = p.char + p.hp + '/' + p.maxHp;
  if (C.hp !== hpK) { C.hp = hpK; $('#hpb').style.width = (p.hp / p.maxHp * 100) + '%'; $('#hpn').textContent = `HP ${Math.ceil(p.hp)} / ${p.maxHp}`; }
  const xk = SAVE.quinn.level + ':' + SAVE.quinn.exp + ':' + Math.round(G.expGain || 0);
  if (C.xp !== xk) { C.xp = xk; $('#lvl').textContent = 'Stufe ' + SAVE.quinn.level + (SAVE.quinn.points ? ' · +' + SAVE.quinn.points : ''); $('#xpb').style.width = Math.min(100, (SAVE.quinn.exp + (G.expGain || 0)) / expNeed(SAVE.quinn.level) * 100) + '%'; }
  const st = Math.round(p.stam);
  if (C.st !== st) { C.st = st; $('#stb').style.width = (p.stam / p.maxStam * 100) + '%'; $('#stbw').classList.toggle('low', st < 25); }
  const mcK = p.maxMc ? Math.round(p.mc) : -1;
  if ($('#mcw') && C.mc !== mcK) { C.mc = mcK; $('#mcw').style.visibility = mcK < 0 ? 'hidden' : ''; if (mcK >= 0) $('#mcb').style.width = (p.mc / p.maxMc * 100) + '%'; }
  const f = G.foe;
  if (f && G.showFoe) {
    const k = f.name + f.hp;
    if (C.foe !== k) { C.foe = k; $('#foe').style.display = ''; $('#foen').textContent = f.name; $('#foeb').style.width = (f.hp / f.maxHp * 100) + '%'; }
  }
  const h = G.hint ? G.hint.text : '';
  if (C.hint !== h) { C.hint = h; $('#hint').innerHTML = h; }
  const ch = p.state === 'charge' && p.stateT > 0.3;
  if (C.ch !== ch) { C.ch = ch; $('#bAtk').classList.toggle('charge', ch); }
  // Tag-Team-Knoepfe
  if (G.party && G.party.length > 1) {
    const pk = G.party.map((m) => m.char + (m === G.player ? '*' : '') + Math.ceil(m.hp) + m.state.slice(0, 1)).join('|');
    if (C.party !== pk) {
      C.party = pk;
      const box = $('#party');
      box.innerHTML = G.party.map((m, i) => `<button class="pm ${m === G.player ? 'on' : ''} ${m.state === 'down' ? 'dead' : ''}" data-i="${i}" style="--c:${LOOKS[m.char].rim}"><b>${CHARS[m.char].name}</b><i style="width:${Math.max(0, m.hp / m.maxHp * 100)}%"></i></button>`).join('');
      box.querySelectorAll('.pm').forEach((b) => bindButton(b, () => pushInput('swap' + b.dataset.i)));
    }
  }
  // Skills nur fuer Quinn
  const isQ = p.char === 'quinn';
  if (C.isQ !== isQ) { C.isQ = isQ; UI.hud.querySelectorAll('.pad .skill, .pad .insp').forEach((b) => { b.style.visibility = isQ ? '' : 'hidden'; }); }
  const bk = SAVE.quinn.skills.includes('bloodbank') && !G.opt.hub && isQ ? SAVE.quinn.bank : -1;
  if (C.pn !== p.char) { C.pn = p.char; $('#pname').textContent = p.char === 'quinn' ? (G.opt.vr ? 'BLOOD EVOLVER' : 'QUINN TALEN') : CHARS[p.char].name.toUpperCase(); }
  if (C.bank !== bk) { C.bank = bk; $('#bank').innerHTML = bk >= 0 ? `<span>BLUTBANK</span><i><b style="width:${bk}%"></b></i><small>${bk} ml</small>` : ''; }
  const atkTxt = G.poi ? (G.poi.btn || 'LOS') : 'ANGRIFF';
  if (C.atk !== atkTxt) { C.atk = atkTxt; $('#bAtk').textContent = atkTxt; $('#bAtk').classList.toggle('act', !!G.poi); }
  const sun = !!G.inSun;
  if (C.sun !== sun) { C.sun = sun; $('#sun').classList.toggle('on', sun); }
  if (G.hubInfo) {
    const D = SAVE.day, gk = G.hubInfo.goal + D.water + Math.round(D.sun) + D.n + D.night;
    if (C.goal !== gk) {
      C.goal = gk;
      $('#goal').innerHTML = `<div class="gh">TAG ${D.n}${D.night ? ' · NACHT' : ''}</div>${G.hubInfo.goal ? `<div class="gq">▸ ${G.hubInfo.goal}</div>` : ''}` +
        (SAVE.quinn.thirst ? `<div class="gd bad">Blutdurst · HP −${SAVE.quinn.thirst}</div>` : '') + (D.night ? '' : `<div class="gd">${D.water ? '✔' : '▫'} 2 Liter Wasser trinken</div><div class="gd ${D.sun >= 6 ? 'bad' : ''}">${D.sun < 6 ? '▫' : '✘'} Sonne meiden (${Math.min(6, D.sun).toFixed(0)} / 6 s)</div>`);
    }
  }
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
    <button class="btn" id="pRes">Weiter</button><button class="btn" id="pStat">Status${SAVE.quinn.points ? ' · +' + SAVE.quinn.points : ''}</button><button class="btn ghost" id="pRe">Kampf neu starten</button><button class="btn ghost" id="pMenu">Hauptmenü</button>`;
  UI.root.appendChild(el);
  el.querySelector('#pRes').onclick = () => { el.remove(); G.paused = false; };
  el.querySelector('#pStat').onclick = () => showStatus();
  el.querySelector('#pRe').onclick = () => { el.remove(); startMission(MISSION.id, true); };
  el.querySelector('#pMenu').onclick = () => { G = null; showTitle(); };
}
