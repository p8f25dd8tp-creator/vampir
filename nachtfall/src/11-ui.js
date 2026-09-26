'use strict';
/* ==========================================================================
   OBERFLAECHE — Titel, Heldenwahl, HUD, Karten, Pause, Ende, Altar,
   Chronik, Einstellungen. DOM ueber dem Spiel-Canvas.
   ========================================================================== */

/* -------------------------------------------------------- Symbole (gemalt) */
const _icons = {};
function icon(id) {
  if (_icons[id]) return _icons[id];
  const S = 96, c = mkCanvas(S, S), g = c.getContext('2d');
  g.lineCap = 'round'; g.lineJoin = 'round';
  const sch = (CARDS[id] && CARDS[id].school) || (FUSIONS[id] && FUSIONS[id].schools[0]) || 'none';
  const col = SCHOOL[sch].col;
  // Hintergrund: dunkles Medaillon mit Schulfarbe
  g.fillStyle = rg(g, S / 2, S * 0.4, 4, S * 0.75, [0, shade(col, -0.55), 0.6, '#12060e', 1, '#050205']);
  g.fillRect(0, 0, S, S);
  g.translate(S / 2, S / 2);
  const glow = (c2, r) => { g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(glowSprite(c2, true), -r, -r, r * 2, r * 2); g.restore(); };
  const D = {
    blutnova() { glow('#ff2a40', 40); for (let i = 3; i >= 1; i--) { g.strokeStyle = i === 1 ? '#ffd0d6' : '#c0102a'; g.lineWidth = 5 - i; g.beginPath(); g.arc(0, 0, 10 + i * 10, 0, TAU); g.stroke(); } for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.drawImage(PART.drop, Math.cos(a) * 34 - 6, Math.sin(a) * 34 - 6, 12, 12); } },
    blutwisch() { glow('#ff2a40', 30); g.rotate(-0.6); g.drawImage(ASPR.crescent, -44, -44, 88, 88); },
    bluternte() { glow('#ff2a40', 26); for (let i = 0; i < 3; i++) { g.save(); g.rotate(i * TAU / 3); g.translate(0, -22); g.rotate(1.5); g.drawImage(ASPR.sickle, -22, -22, 44, 44); g.restore(); } },
    schattenflammen() { g.drawImage(PART.shadowwisp, -40, -30, 80, 70); for (let i = 0; i < 3; i++) { g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(ASPR.sflame, -34 + i * 18, -20 + (i % 2) * 18, 32, 26); g.restore(); } },
    nachbilder() { for (let i = 2; i >= 0; i--) { g.globalAlpha = 1 - i * 0.3; g.fillStyle = i ? '#5a3aa0' : '#c7a6ff'; g.beginPath(); g.arc(-12 + i * 12, -18, 8, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-24 + i * 12, 28); g.quadraticCurveTo(-12 + i * 12, -14, 0 + i * 12, 28); g.fill(); } g.globalAlpha = 1; },
    nachtschlund() { g.scale(1, 0.7); g.fillStyle = rg(g, 0, 0, 0, 40, [0, '#000', 0.6, '#12002a', 1, 'rgba(60,20,120,0)']); g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill(); g.strokeStyle = '#a77bff'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(0, 0, 12 + i * 7, i, i + 2); g.stroke(); } },
    qihand() { glow('#4ff0cc', 34); g.drawImage(ASPR.palm, -46, -36, 96, 76); },
    qikette() { glow('#4ff0cc', 30); g.strokeStyle = '#9affe6'; g.lineWidth = 4; g.beginPath(); g.moveTo(-34, 20); g.lineTo(-12, -8); g.lineTo(4, 14); g.lineTo(32, -22); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); for (const p of [[-34, 20], [-12, -8], [4, 14], [32, -22]]) { g.drawImage(glowSprite('#4ff0cc', true), p[0] - 9, p[1] - 9, 18, 18); } },
    lebensraub() { glow('#ff2a40', 24); g.fillStyle = '#c0102a'; g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-36, 4, -18, -30, 0, -12); g.bezierCurveTo(18, -30, 36, 4, 0, 30); g.fill(); g.strokeStyle = '#ffd0d6'; g.lineWidth = 2.5; g.stroke(); g.drawImage(PART.drop, -8, -36, 16, 16); },
    kettenreaktion() { for (const p of [[-18, 12, 18], [16, 4, 14], [-2, -20, 12]]) { g.save(); g.translate(p[0], p[1]); glow('#ff2a40', p[2] * 1.4); g.strokeStyle = '#ff8a96'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, p[2], 0, TAU); g.stroke(); g.restore(); } },
    vampirblut() { g.fillStyle = lg(g, -20, 0, 20, 0, [0, '#e8c070', 1, '#7a5a20']); g.beginPath(); g.moveTo(-24, -26); g.quadraticCurveTo(0, 16, 24, -26); g.closePath(); g.fill(); g.fillRect(-3, -6, 6, 26); g.fillRect(-14, 18, 28, 6); g.fillStyle = '#c0102a'; g.beginPath(); g.ellipse(0, -24, 22, 6, 0, 0, TAU); g.fill(); glow('#ff2a40', 18); },
    nebelgang() { g.drawImage(PART.shadowwisp, -44, -20, 88, 50); g.strokeStyle = '#c7a6ff'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-34, -14 + i * 14); g.quadraticCurveTo(0, -24 + i * 14, 34, -10 + i * 14); g.stroke(); } },
    grabesmacht() { glow('#e0b060', 28); g.fillStyle = '#efe6cc'; g.beginPath(); g.arc(0, 0, 20, Math.PI, 0); g.lineTo(14, 18); g.lineTo(-14, 18); g.closePath(); g.fill(); g.fillStyle = '#1a0a0a'; g.beginPath(); g.arc(-8, 2, 5, 0, TAU); g.arc(8, 2, 5, 0, TAU); g.fill(); g.fillStyle = '#e0b060'; g.beginPath(); g.moveTo(-18, -18); g.lineTo(-12, -34); g.lineTo(-4, -22); g.lineTo(0, -38); g.lineTo(4, -22); g.lineTo(12, -34); g.lineTo(18, -18); g.closePath(); g.fill(); },
    seelenmagnet() { glow('#b58cff', 30); g.strokeStyle = '#c7a6ff'; g.lineWidth = 2.5; for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(0, 0, i * 12, 0, TAU); g.stroke(); } g.drawImage(glowSprite('#ffffff', true), -10, -10, 20, 20); },
    eisenmeridiane() { glow('#4ff0cc', 22); g.strokeStyle = '#9affe6'; g.lineWidth = 3; g.beginPath(); g.arc(0, -26, 8, 0, TAU); g.moveTo(0, -18); g.lineTo(0, 16); g.moveTo(-22, -6); g.lineTo(22, -6); g.moveTo(0, 16); g.lineTo(-14, 36); g.moveTo(0, 16); g.lineTo(14, 36); g.stroke(); g.fillStyle = '#ffe6a0'; for (const p of [[0, -8], [0, 6], [-12, -6], [12, -6]]) { g.beginPath(); g.arc(p[0], p[1], 3, 0, TAU); g.fill(); } },
    finsternis() { g.drawImage(glowSprite('#ff1a3a', true), -46, -46, 92, 92); g.fillStyle = '#000'; g.beginPath(); g.arc(0, 0, 20, 0, TAU); g.fill(); g.strokeStyle = '#a77bff'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 26, 0, TAU); g.stroke(); },
    drachenherz() { glow('#ff6a50', 34); g.drawImage(ASPR.dragon, -46, -34, 92, 66); },
    spiegel() { g.globalCompositeOperation = 'lighter'; g.drawImage(ASPR.lotus, -40, -30, 80, 80); g.globalCompositeOperation = 'source-over'; D.nachbilder(); },
    blutmond() { glow('#ff2a40', 36); g.drawImage(ASPR.moon, -40, -40, 80, 80); },
    siegel() { g.globalCompositeOperation = 'lighter'; g.drawImage(ASPR.sigil, -44, -44, 88, 88); },
    bloodcup() { D.vampirblut(); },
    soulgift() { D.seelenmagnet(); },
    karminsturm() { glow('#ff1a3a', 44); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.save(); g.translate(Math.cos(a) * 26, Math.sin(a) * 26); glow('#ff5a6a', 12); g.restore(); } g.fillStyle = '#300'; g.beginPath(); g.arc(0, 0, 10, 0, TAU); g.fill(); },
    aderlass() { glow('#ff2a40', 36); g.rotate(-0.8); g.drawImage(ASPR.sickle, -40, -40, 80, 80); g.rotate(0.8); g.drawImage(PART.drop, -10, 10, 20, 20); },
    mitternacht() { g.drawImage(PART.shadowwisp, -46, -46, 92, 92); g.fillStyle = '#e8e0ff'; g.beginPath(); g.arc(4, -4, 20, 0, TAU); g.fill(); g.fillStyle = '#12061e'; g.beginPath(); g.arc(14, -10, 20, 0, TAU); g.fill(); },
    harmonie() { glow('#4ff0cc', 40); g.fillStyle = '#e8fff8'; g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.fill(); g.fillStyle = '#0a2a24'; g.beginPath(); g.arc(0, 0, 24, -Math.PI / 2, Math.PI / 2); g.arc(0, 12, 12, Math.PI / 2, -Math.PI / 2, true); g.arc(0, -12, 12, Math.PI / 2, -Math.PI / 2); g.fill(); g.fillStyle = '#e8fff8'; g.beginPath(); g.arc(0, 12, 4, 0, TAU); g.fill(); g.fillStyle = '#0a2a24'; g.beginPath(); g.arc(0, -12, 4, 0, TAU); g.fill(); },
    dodge_mist() { glow('#ff2a40', 30); g.drawImage(tinted('smoke', '#c0102a'), -40, -30, 80, 60); g.strokeStyle = '#ffd0d6'; g.lineWidth = 4; g.beginPath(); g.moveTo(-26, 10); g.lineTo(20, -10); g.lineTo(10, -20); g.moveTo(20, -10); g.lineTo(8, 2); g.stroke(); },
    dodge_roll() { glow('#ff2a40', 26); g.strokeStyle = '#ffd0d6'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 22, 0.4, TAU - 0.6); g.stroke(); g.beginPath(); g.moveTo(22, -14); g.lineTo(24, 4); g.lineTo(10, -4); g.fill(); },
    dodge_shadowstep() { g.drawImage(PART.shadowwisp, -40, -30, 80, 60); g.strokeStyle = '#c7a6ff'; g.lineWidth = 5; g.beginPath(); g.moveTo(-30, 16); g.lineTo(28, -16); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 1.6; g.stroke(); },
    blutspray() { glow('#ff2a40', 30); for (let i = -2; i <= 2; i++) { g.save(); g.rotate(-0.6 + i * 0.22); g.drawImage(PART.drop, 6 + Math.abs(i) * 3, -5, 30, 11); g.restore(); } g.fillStyle = '#300'; g.beginPath(); g.arc(-26, 14, 8, 0, TAU); g.fill(); },
    hammerschlag() { g.drawImage(ASPR.crack, -44, -20, 88, 60); glow('#ffb070', 20); g.fillStyle = lg(g, -12, -40, 12, 0, [0, '#e8d0c0', 1, '#8a6a5a']); g.beginPath(); g.ellipse(0, -14, 14, 16, 0, 0, TAU); g.fill(); g.strokeStyle = '#2a1a14'; g.lineWidth = 2; g.stroke(); for (let k = -1; k <= 2; k++) { g.beginPath(); g.moveTo(-10 + k * 6, -24); g.lineTo(-10 + k * 6, -12); g.stroke(); } },
    blitzschritt() { glow('#ff3a5a', 30); g.strokeStyle = '#ff3a5a'; g.lineWidth = 6; g.beginPath(); g.moveTo(-36, 20); g.lineTo(-8, 4); g.lineTo(-14, -2); g.lineTo(34, -24); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); },
    himmelsstrahl() { g.fillStyle = lg(g, -12, 0, 12, 0, [0, 'rgba(255,230,160,0)', 0.5, '#fff6d8', 1, 'rgba(255,230,160,0)']); g.fillRect(-12, -48, 24, 80); glow('#ffe6a0', 30); },
    goetterfall() { glow('#ffb040', 34); for (let i = -1; i <= 1; i++) { g.save(); g.translate(i * 16, -6 + Math.abs(i) * 8); g.rotate(0.15); g.fillStyle = lg(g, 0, -34, 0, 16, [0, '#ffd27a', 0.8, '#fff6d8', 1, '#c01030']); g.beginPath(); g.moveTo(-3, -34); g.lineTo(3, -34); g.lineTo(4, 8); g.lineTo(0, 18); g.lineTo(-4, 8); g.closePath(); g.fill(); g.restore(); } },
    erwachen() { g.drawImage(glowSprite('#ff2a40', true), -46, -46, 92, 92); g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(glowSprite('#ffe6a0', true), -26, -40, 52, 52); g.restore(); g.fillStyle = '#1a0006'; g.beginPath(); g.moveTo(-20, 30); g.lineTo(0, -30); g.lineTo(20, 30); g.lineTo(0, 16); g.closePath(); g.fill(); g.strokeStyle = '#ffd27a'; g.lineWidth = 2; g.stroke(); },
    dodge_blink() { D.blitzschritt(); },
    dodge_slide() { glow('#4ff0cc', 26); g.strokeStyle = '#9affe6'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-34, -12 + i * 12); g.lineTo(14, -12 + i * 12); g.stroke(); } g.drawImage(ASPR.palm, 0, -24, 50, 40); }
  };
  (D[id] || D.grabesmacht)();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.strokeStyle = rgba(col, 0.8); g.lineWidth = 3; g.strokeRect(1.5, 1.5, S - 3, S - 3);
  return (_icons[id] = c.toDataURL());
}

/* -------------------------------------------------------- UI-Objekt */
const $ = (s, r) => (r || document).querySelector(s);
const UI = {
  root: document.getElementById('ui'),
  cur: null, hud: null, previews: [], selHero: 'vorian', cache: {},
  show(html, id, cls) {
    this.clear();
    const d = document.createElement('div');
    d.className = 'screen ' + (cls || '');
    d.id = id; d.innerHTML = html;
    this.root.appendChild(d);
    this.cur = d;
    d.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', (e) => { AudioSys.init(); sfx('click'); this.act(b.dataset.act, b.dataset, e); }));
    return d;
  },
  clear() { if (this.cur) { this.cur.remove(); this.cur = null; } this.previews = []; },
  act(a, ds) {
    switch (a) {
      case 'play': return this.showSelect();
      case 'title': return this.showTitle();
      case 'altar': return this.showAltar();
      case 'codex': return this.showCodex();
      case 'settings': return this.showSettings();
      case 'hero': this.selHero = ds.id; return this.renderSelectDetail();
      case 'start': return startGame(this.selHero);
      case 'finnform': this.finnPick = +ds.t; return this.renderSelectDetail();
      case 'buyhero': {
        const H = HEROES[this.selHero];
        if (SAVE.souls >= H.unlock.cost) { SAVE.souls -= H.unlock.cost; SAVE.unlocked[this.selHero] = true; writeSave(); sfx('fusion'); this.showSelect(); }
        return;
      }
      case 'card': return chooseCard(+ds.i);
      case 'reroll': return rerollCards();
      case 'resume': return togglePause(false);
      case 'giveup': return giveUp();
      case 'again': return startGame(GAME.hero);
      case 'buymeta': {
        const M = META[ds.id], lv = SAVE.meta[ds.id] || 0;
        if (lv < M.max && SAVE.souls >= M.cost[lv]) { SAVE.souls -= M.cost[lv]; SAVE.meta[ds.id] = lv + 1; writeSave(); sfx('level'); this.showAltar(); }
        return;
      }
      case 'toggle': { SAVE.settings[ds.k] = !SAVE.settings[ds.k]; writeSave(); return this.showSettings(); }
      case 'quality': { const order = ['auto', 'hoch', 'mittel', 'niedrig']; SAVE.settings.quality = order[(order.indexOf(SAVE.settings.quality) + 1) % order.length]; writeSave(); applyQuality(); return this.showSettings(); }
      case 'reset': { if (confirm('Wirklich alle Fortschritte löschen?')) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } SAVE = loadSave(); this.showTitle(); } return; }
    }
  },

  /* ---------------------------------------------- Titel */
  showTitle() {
    GAME && GAME.state !== 'menu' && (GAME.state = 'menu');
    this.hideHud();
    menuScene();
    this.show(`
      <div class="logo"><h1>NACHTFALL</h1><div class="sub"><b>BLUT</b> · <i>SCHATTEN</i> · <u>QI</u></div></div>
      <div class="menu">
        <div class="souls">Seelen: <b>${SAVE.souls}</b></div>
        <button class="btn primary" data-act="play">Spielen</button>
        <button class="btn" data-act="altar">Altar der Nacht</button>
        <button class="btn" data-act="codex">Chronik</button>
        <button class="btn ghost" data-act="settings">Einstellungen</button>
        <div class="foot">Offline spielbar · keine Käufe · Version 0.1</div>
      </div>`, 'title');
  },

  /* ---------------------------------------------- Heldenwahl */
  showSelect() {
    menuScene();
    if (!isUnlocked(this.selHero)) this.selHero = 'vorian';
    const cards = HERO_ORDER.map((id) => `<div class="hcard ${id === this.selHero ? 'sel' : ''} ${isUnlocked(id) ? '' : 'locked'}" data-act="hero" data-id="${id}">
      <canvas data-prev="${id}"></canvas>${isUnlocked(id) ? '' : '<div class="lock">🔒</div>'}<div class="nm">${HEROES[id].name}</div></div>`).join('');
    const d = this.show(`<h2>Wähle deinen Helden</h2><div class="heroes">${cards}</div><div class="hdetail panel" id="hdet"></div>
      <div class="selbar"><button class="btn ghost" data-act="title">Zurück</button><button class="btn primary" id="startbtn" data-act="start">Nacht beginnen</button></div>`, 'select', 'dim');
    d.querySelectorAll('canvas[data-prev]').forEach((c) => {
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width * VIEW.dpr); c.height = Math.round(r.height * VIEW.dpr);
      this.previews.push({ c, id: c.dataset.prev, t: Math.random() * 5 });
    });
    this.renderSelectDetail();
  },
  renderSelectDetail() {
    const id = this.selHero, H = HEROES[id];
    this.cur.querySelectorAll('.hcard').forEach((c) => c.classList.toggle('sel', c.dataset.id === id));
    const un = isUnlocked(id);
    const sc = SCHOOL[H.school];
    const hs = SAVE.heroStats[id];
    $('#hdet').innerHTML = `
      <div class="ht"><h3>${H.name}</h3><span class="title2">${H.title}</span></div>
      <div class="role">${H.role} · Schwierigkeit <span class="diff">${'◆'.repeat(H.diff)}${'◇'.repeat(3 - H.diff)}</span></div>
      <div class="stats">
        <div class="stat"><div class="k">LEBEN</div><div class="v">${H.hp}</div></div>
        <div class="stat"><div class="k">TEMPO</div><div class="v">${H.speed}</div></div>
        <div class="stat"><div class="k">RÜSTUNG</div><div class="v">${H.armor}</div></div>
        <div class="stat"><div class="k">AUSWEICHEN</div><div class="v">${H.dodgeCd}s</div></div>
      </div>
      ${H.start ? `<div class="blk"><b class="lbl">START: ${CARDS[H.start].name.toUpperCase()}</b><p>${CARDS[H.start].lv[0]}</p></div>` : (finnSave().tier === 0 ? `<div class="blk"><b class="lbl">START: NICHTS</b><p>Kein Angriff, keine Kraft. Lauf zum leuchtenden Buch.</p></div>` : `<div class="blk"><b class="lbl">START</b><p>Mit allen Kräften seiner aktuellen Form.</p></div>`)}
      ${H.evo ? finnSelectHtml() : ''}
      <div class="blk"><b class="lbl" style="color:${sc.col}">MECHANIK: ${H.mech.name.toUpperCase()}</b><p>${H.mech.desc}</p></div>
      <div class="blk"><b class="lbl">ULTIMATIV: ${H.ult.name.toUpperCase()}</b><p>${H.ult.desc}</p></div>
      <div class="blk two"><div><b class="lbl">STÄRKEN</b><ul class="plus">${H.strengths.map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div><b class="lbl">SCHWÄCHEN</b><ul class="minus">${H.weaknesses.map((s) => `<li>${s}</li>`).join('')}</ul></div></div>
      <div class="blk"><b class="lbl">BUILDS</b><div class="builds">${H.builds.map((b) => `<div><span>${b.name}:</span> ${b.desc}</div>`).join('')}</div></div>
      ${hs ? `<div class="blk" style="color:var(--dim);font-size:14px">Läufe: ${hs.runs} · Beste Zeit: ${fmtTime(hs.best)} · Siege: ${hs.wins}</div>` : ''}
      ${un ? '' : `<div class="blk" style="color:#ffb0b0">🔒 ${H.unlock.desc}${SAVE.settings.testUnlock ? '' : ''}</div>`}`;
    const sb = $('#startbtn');
    if (un) { sb.textContent = 'Nacht beginnen'; sb.dataset.act = 'start'; sb.disabled = false; }
    else { sb.textContent = `Freischalten (${H.unlock.cost} Seelen)`; sb.dataset.act = 'buyhero'; sb.disabled = SAVE.souls < H.unlock.cost; }
    // Eventlistener fuer den umgeschalteten Knopf neu setzen
    const nb = sb.cloneNode(true); sb.parentNode.replaceChild(nb, sb);
    nb.addEventListener('click', () => { AudioSys.init(); sfx('click'); this.act(nb.dataset.act, nb.dataset); });
  },
  tickPreviews(dt) {
    for (const pv of this.previews) {
      pv.t += dt;
      const g = pv.c.getContext('2d');
      const w = pv.c.width, h = pv.c.height;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, w, h);
      const sel = pv.id === this.selHero;
      g.fillStyle = rg(g, w / 2, h * 0.62, 4, w * 0.8, [0, rgba(pv.id === 'finn' ? FINN_TIERS[pv.tier || 0].rim : HERO_ART[pv.id].rim, sel ? 0.35 : 0.14), 1, 'rgba(0,0,0,0)']);
      g.fillRect(0, 0, w, h);
      const px = h / 88;
      const cyc = pv.t % 6;
      const st = { t: pv.t, run: sel ? 1 : 0, phase: pv.t * 9, cast: sel && cyc > 4.2 && cyc < 5 ? Math.sin((cyc - 4.2) / 0.8 * Math.PI) : 0, aim: 0.1, rooted: pv.id === 'shen' && !sel ? 1 : 0 };
      const look = { glow: 0.6, rage: 0.4, flow: sel ? 0.8 : 0.2, qi: 0.6, crown: 1 };
      if (pv.id === 'finn') { pv.tier = sel && UI.finnPick !== undefined ? UI.finnPick : finnSave().tier; look.tier = pv.tier; look.rim = FINN_TIERS[pv.tier].rim; }
      pv.spr = renderHero(pv.id, st, look, px, pv.spr, { glow: sel });
      g.drawImage(pv.spr.out, w / 2 - pv.spr.S / 2, h * 0.86 - pv.spr.anchorY);
    }
  },

  /* ---------------------------------------------- HUD */
  showHud() {
    this.clear();
    if (this.hud) this.hud.remove();
    const H = HEROES[GAME.hero];
    const d = document.createElement('div');
    d.id = 'hud';
    d.innerHTML = `
      <div id="hurt"></div><div id="lowhp"></div>
      <div class="topbar">
        <div class="xpbar"><div class="xpfill" id="xpf"></div><div class="lvl" id="lvl">STUFE 1</div></div>
        <div class="hudrow">
          <div><div class="slots" id="slots"></div><div class="slots" id="pslots" style="margin-top:4px"></div></div>
          <div class="timer" id="timer">00:00</div>
          <div style="display:flex;flex-direction:column;align-items:flex-end"><div class="counts"><span id="kills">0</span> ☠ · <span id="souls">0</span> ✧</div><button class="pausebtn interactive" id="pbtn">❚❚</button></div>
        </div>
      </div>
      <div class="bossbar" id="bossbar"><div class="bn" id="bossname"></div><div class="bb"><div class="bf" id="bossfill"></div></div></div>
      <div class="announce" id="ann"></div><div class="toast" id="toast"></div>
      <div class="hint" id="hint">Daumen irgendwo aufsetzen und ziehen, um zu laufen.<br>Angriffe erfolgen automatisch.</div>
      <div class="mech" id="mech"><div id="mechname">${H.mech.name}</div><div class="mbar"><div class="mfill" id="mfill"></div></div></div>
      <div class="actions">
        <button class="abtn ult interactive" id="ubtn"><img src="${icon(H.ult.id)}"><canvas class="cd" id="ucd" width="160" height="160"></canvas><div class="cdt" id="ucdt"></div><div class="lbl">${H.ult.name}</div></button>
        <button class="abtn dodge interactive" id="dbtn"><img src="${icon('dodge_' + H.dodge)}"><canvas class="cd" id="dcd" width="140" height="140"></canvas><div class="cdt" id="dcdt"></div><div class="lbl">${H.dodge === 'shadowstep' ? 'Schattenschritt' : 'Ausweichen'}</div></button>
      </div>`;
    this.root.appendChild(d);
    this.hud = d;
    const press = (el, fn) => el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); AudioSys.init(); fn(); });
    press($('#dbtn'), () => { INPUT.dodgePressed = true; });
    press($('#ubtn'), () => { INPUT.ultPressed = true; });
    press($('#pbtn'), () => togglePause(true));
    this.cache = {};
    setTimeout(() => { const h = $('#hint'); if (h) h.style.opacity = '0'; }, 7000);
    this._hintMoved = false;
  },
  hideHud() { if (this.hud) { this.hud.remove(); this.hud = null; } },
  set(id, v, prop) { if (this.cache[id + (prop || '')] === v) return; this.cache[id + (prop || '')] = v; const el = document.getElementById(id); if (!el) return; if (prop) el.style[prop] = v; else el.textContent = v; },
  updateHud() {
    if (!this.hud || !GAME) return;
    const G = GAME, p = G.p, H = HEROES[p.hero];
    if (!this._hintMoved && G.t > 1.5 && Math.hypot(p.vx, p.vy) > 30) { this._hintMoved = true; const h = $('#hint'); if (h) setTimeout(() => { h.style.opacity = '0'; }, 1500); }
    this.set('xpf', (G.xp / G.xpNext * 100).toFixed(1) + '%', 'width');
    this.set('lvl', 'STUFE ' + G.level);
    this.set('timer', fmtTime(G.t));
    this.set('kills', String(G.kills));
    this.set('souls', String(G.souls));
    // Faehigkeiten
    const key = Object.keys(p.ab).map((k) => k + p.ab[k].lvl).join() + '|' + Object.keys(p.passives).map((k) => k + p.passives[k]).join();
    if (this.cache.slots !== key) {
      this.cache.slots = key;
      $('#slots').innerHTML = Object.keys(p.ab).map((k) => `<div class="slot ${FUSIONS[k] || !CARDS[k] ? 'fus' : ''}"><img src="${icon(k)}"><span class="lv">${FUSIONS[k] || !CARDS[k] ? '★' : p.ab[k].lvl}</span></div>`).join('');
      $('#pslots').innerHTML = Object.keys(p.passives).map((k) => `<div class="slot pas"><img src="${icon(k)}"><span class="lv">${p.passives[k]}</span></div>`).join('');
    }
    // Aktionen
    this.cdRing('dcd', p.dodgeCd / (H.dodgeCd * p.st.dodgeCdMul), '#ffffff');
    this.set('dcdt', p.dodgeCd > 0.05 ? p.dodgeCd.toFixed(1) : '');
    let ultFrac = p.ultCd / (H.ult.cd * (p.hero === 'shen' ? 1 : p.st.cd));
    if (p.hero === 'shen' && p.qi < 1) ultFrac = 1 - p.qi;
    this.cdRing('ucd', ultFrac, '#ffffff');
    this.set('ucdt', p.hero === 'shen' ? (Math.floor(p.qi) > 0 ? '☯' + Math.floor(p.qi) : '') : (p.ultCd > 0.05 ? Math.ceil(p.ultCd).toString() : ''));
    const ready = ultFrac <= 0;
    if (this.cache.ready !== ready) { this.cache.ready = ready; $('#ubtn').classList.toggle('ready', ready); }
    // Heldenmechanik-Anzeige
    let mv = 0, mc = '#ff3a4e', mt = H.mech.name;
    if (p.hero === 'vorian') { let n = 0; for (const e of G.enemies) if (!e.dead && e.bstack > 0) n += e.bstack; mv = Math.min(1, n / 60); mt = 'Blutmale: ' + n; }
    if (p.hero === 'liora') { mv = clamp((1 - p.hp / p.st.maxHp) / 0.72, 0, 1); mt = 'Blutrausch +' + Math.round(clamp((1 - p.hp / p.st.maxHp) * 1.25, 0, 0.9) * 100) + '%' + (p.buffAder > 0 ? ' · ADERLASS' : ''); }
    if (p.hero === 'nyx') { mv = p.flow; mc = '#a77bff'; mt = 'Schattenfluss +' + Math.round(p.flow * 45) + '%' + (p.ultT > 0 ? ' · MITTERNACHT' : ''); }
    if (p.hero === 'finn') { const T = FINN_TIERS[p.tier || 0], F = finnSave(), N = FINN_TIERS[F.tier + 1]; mc = T.col; const run = finnRunEssence(G, false); if (!p.tier) { mv = 0; mt = 'Mensch · finde das Buch!'; } else if (G.finnTest) { mv = 1; mt = T.name + ' (Testform)'; } else if (N && N.req.essence) { mv = clamp((F.essence + run) / N.req.essence, 0, 1); mt = T.name + ' · Essenz +' + run; } else { mv = 1; mt = T.name + ' · Essenz +' + run; } }
    if (p.hero === 'shen') { mv = p.qi / 5; mc = '#4ff0cc'; mt = 'Qi ' + Math.floor(p.qi) + '/5' + (p.rooted > 0.5 ? ' · Wurzelstand' : ''); }
    this.set('mfill', (mv * 100).toFixed(0) + '%', 'width');
    this.set('mfill', mc, 'background');
    this.set('mechname', mt);
    // Boss
    const B = G.boss && !G.boss.dead ? G.boss : (G.mini && !G.mini.dead ? G.mini : null);
    this.set('bossbar', B ? 'block' : 'none', 'display');
    if (B) { this.set('bossname', B.def.name.toUpperCase()); this.set('bossfill', clamp(B.hp / B.maxHp * 100, 0, 100).toFixed(1) + '%', 'width'); }
    this.set('lowhp', p.alive && p.hp < p.st.maxHp * 0.3 ? '1' : '0', 'opacity');
  },
  cdRing(id, frac, col) {
    const k = Math.round(clamp(frac, 0, 1) * 60);
    if (this.cache[id] === k) return;
    this.cache[id] = k;
    const c = document.getElementById(id); if (!c) return;
    const g = c.getContext('2d'), w = c.width;
    g.clearRect(0, 0, w, w);
    if (k <= 0) return;
    g.fillStyle = 'rgba(0,0,0,0.62)';
    g.beginPath(); g.moveTo(w / 2, w / 2); g.arc(w / 2, w / 2, w / 2, -Math.PI / 2, -Math.PI / 2 + TAU * k / 60); g.closePath(); g.fill();
  },
  hurtFlash(a) { const h = $('#hurt'); if (!h) return; h.style.transition = 'none'; h.style.opacity = String(a); requestAnimationFrame(() => { h.style.transition = 'opacity .45s'; h.style.opacity = '0'; }); },
  announce(txt, cls) {
    const a = $('#ann'); if (!a) return;
    a.className = 'announce ' + (cls || ''); a.textContent = txt;
    requestAnimationFrame(() => a.classList.add('show'));
    clearTimeout(this._annT); this._annT = setTimeout(() => a.classList.remove('show'), 2600);
  },
  evolution(T, N) {
    const hud = this.hud; if (!hud) return;
    if (T.id !== 'halbling' && T.id !== 'mensch') { const db = $('#dbtn'); if (db && GAME.p.dodgeKind === 'blink' && !db.dataset.blink) { db.dataset.blink = 1; db.querySelector('img').src = icon('dodge_blink'); db.querySelector('.lbl').textContent = 'Blitzschritt'; } }
    let el = $('#evo'); if (el) el.remove();
    el = document.createElement('div'); el.id = 'evo'; el.className = 'evo';
    const names = T.grants.map((c) => (CARDS[c] ? CARDS[c].name : FUSIONS[c] ? FUSIONS[c].name : SRC_NAMES[c] || c));
    el.innerHTML = `<div class="evk">EVOLUTION</div><div class="evn" style="color:${T.col}">${T.name}</div><div class="evd">${T.desc}</div>
      <div class="evg">${T.grants.map((c) => `<img src="${icon(c)}">`).join('')}</div><div class="evd small">${names.join(' · ')}${N ? '<br>Nächste Form: ' + N.name + ' ab Stufe ' + N.level : '<br>Höchste Form erreicht.'}</div>`;
    hud.appendChild(el);
    setTimeout(() => el.classList.add('out'), 3600); setTimeout(() => el.remove(), 4300);
  },
  toast(txt) {
    const t = $('#toast'); if (!t) return;
    t.textContent = txt; t.classList.add('show');
    clearTimeout(this._toT); this._toT = setTimeout(() => t.classList.remove('show'), 2200);
  },

  /* ---------------------------------------------- Karten */
  showLevelUp(offers) {
    const G = GAME, p = G.p;
    const html = offers.map((o, i) => {
      if (o.filler) {
        const nm = o.id === 'bloodcup' ? 'Blutkelch' : 'Seelenbeutel';
        const ds = o.id === 'bloodcup' ? 'Heilt sofort 35 % deines Lebens.' : '+25 Seelen für den Altar der Nacht.';
        return `<button class="card" data-act="card" data-i="${i}"><div class="ci"><img src="${icon(o.id)}"></div><div class="cb"><div class="cn">${nm}</div><div class="cm"><span class="tag t-none">GABE</span></div><div class="cd">${ds}</div></div></button>`;
      }
      if (o.fusion) {
        const F = FUSIONS[o.id];
        const tags = F.schools.map((s) => `<span class="tag t-${s}">${SCHOOL[s].name.toUpperCase()}</span>`).join('');
        const cons = F.consumes.length ? `Verschmilzt: ${F.consumes.map((c) => CARDS[c].name).join(' + ')}` : 'Neue Kraft — belegt keinen Platz';
        return `<button class="card fusion" data-act="card" data-i="${i}"><div class="ci"><img src="${icon(o.id)}"></div><div class="cb"><div class="cn">✦ ${F.name}</div><div class="cm"><span class="tag" style="color:#ffe6a0">FUSION</span>${tags}</div><div class="cd">${F.desc}</div><div class="next">${cons}</div></div></button>`;
      }
      const C = CARDS[o.id];
      const cur = C.kind === 'ability' ? (p.ab[o.id] ? p.ab[o.id].lvl : 0) : (p.passives[o.id] || 0);
      const stars = '★'.repeat(cur + 1) + `<i>${'★'.repeat(Math.max(0, C.max - cur - 1))}</i>`;
      const badge = cur === 0 ? '<span class="tag new">NEU</span>' : `<span class="tag t-none">STUFE ${cur + 1}</span>`;
      const kind = C.kind === 'ability' ? 'FÄHIGKEIT' : 'PASSIV';
      const tags = C.tags.map((t) => `<span class="tag" style="color:#c8b8a8">${t.toUpperCase()}</span>`).join('');
      const nx = cur + 1 < C.max ? `Nächste Stufe: ${C.lv[cur + 1]}` : 'Maximale Stufe';
      let fusionHint = '';
      for (const fid in FUSIONS) { const F = FUSIONS[fid]; if (F.heroes.includes(p.hero) && F.req[o.id] && !p.ab[fid]) fusionHint = ` · Fusion: ${F.name}`; }
      return `<button class="card" data-act="card" data-i="${i}"><div class="ci"><img src="${icon(o.id)}"></div><div class="cb"><div class="cn">${C.name} <span class="stars">${stars}</span></div>
        <div class="cm">${badge}<span class="tag t-${C.school}">${SCHOOL[C.school].name.toUpperCase()}</span><span class="tag" style="color:#b8a8a0">${kind}</span>${tags}</div>
        <div class="cd">${C.lv[cur]}</div><div class="next">${nx}${fusionHint}</div></div></button>`;
    }).join('');
    const d = this.show(`<h2>Stufe ${G.level}</h2><div class="lsub">Wähle eine Karte</div><div class="cards">${html}</div>
      <div class="lvbar"><button class="btn small" data-act="reroll" ${G.rerolls > 0 ? '' : 'disabled'}>Neu würfeln (${G.rerolls})</button></div>`, 'levelup', 'dim');
    d.style.zIndex = 8;
    // versehentliches Antippen direkt nach dem Aufpoppen verhindern
    d.style.pointerEvents = 'none'; setTimeout(() => { d.style.pointerEvents = ''; }, 380);
  },
  hideLevelUp() { this.clear(); },

  /* ---------------------------------------------- Pause */
  showPause() {
    const G = GAME, p = G.p;
    const rows = Object.keys(p.ab).map((k) => {
      const nm = FUSIONS[k] ? '✦ ' + FUSIONS[k].name : CARDS[k] ? CARDS[k].name : '✦ ' + (SRC_NAMES[k] || k);
      const ds = FUSIONS[k] ? FUSIONS[k].desc : CARDS[k] ? CARDS[k].lv.slice(0, p.ab[k].lvl).join(' ') : (FINN_TIERS.find((T) => T.grants.includes(k)) || { desc: '' }).desc;
      return `<div class="bl"><img src="${icon(k)}"><div><div class="bn2">${nm} ${FUSIONS[k] || !CARDS[k] ? '' : '· Stufe ' + p.ab[k].lvl}</div><div style="font-size:14px;color:#cdbdb0">${ds}</div></div></div>`;
    }).join('') + Object.keys(p.passives).map((k) => `<div class="bl"><img src="${icon(k)}"><div><div class="bn2">${CARDS[k].name} · Stufe ${p.passives[k]}</div></div></div>`).join('');
    // moegliche Fusionen fuer diesen Helden
    const fus = Object.keys(FUSIONS).filter((f) => FUSIONS[f].heroes.includes(p.hero)).map((f) => {
      const F = FUSIONS[f];
      const req = Object.keys(F.req).map((r) => r.startsWith('any') ? `eine ${ {anyBlood: 'Blut', anyShadow: 'Schatten', anyQi: 'Qi'}[r] }-Fähigkeit St. ${F.req[r]}` : `${CARDS[r].name} St. ${F.req[r]}`).join(' + ');
      return `<li><b style="color:${p.ab[f] ? '#7dff9a' : '#ffe6a0'}">${p.ab[f] ? '✓ ' : ''}${F.name}</b> — ${req}</li>`;
    }).join('');
    this.show(`<div class="box panel"><h2>Pause</h2>
      <div class="kv"><span>Zeit</span><span>${fmtTime(G.t)}</span><span>Stufe</span><span>${G.level}</span><span>Besiegt</span><span>${G.kills}</span><span>Reaktionen</span><span>${G.stats.reactions}</span></div>
      <div class="buildlist">${rows}</div>
      <div class="codex"><h3>Mögliche Fusionen</h3><ul>${fus}</ul></div>
      <div class="btns"><button class="btn primary" data-act="resume">Weiter</button><button class="btn ghost" data-act="giveup">Lauf aufgeben</button></div></div>`, 'pause', 'dim');
  },

  /* ---------------------------------------------- Ende */
  showEnd(won, souls, newly, extra) {
    this.hideHud();
    const G = GAME;
    const tot = Object.values(G.stats.dmg).reduce((a, b) => a + b, 0) || 1;
    const top = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const max = top.length ? top[0][1] : 1;
    const colOf = (k) => { const s = ABILITY_SCHOOL[k] || (FUSIONS[k] ? FUSIONS[k].schools[0] : null); return s ? SCHOOL[s].col : '#e0c890'; };
    const dm = top.map(([k, v]) => `<div class="dmgrow"><span>${SRC_NAMES[k] || k}</span><div class="bar"><i style="width:${(v / max * 100).toFixed(0)}%;background:${colOf(k)}"></i></div><span class="n">${Math.round(v / tot * 100)}%</span></div>`).join('');
    const nl = newly.map((id) => `<div style="color:#7dff9a;text-align:center;margin-top:6px">Freigeschaltet: <b>${HEROES[id].name}</b>!</div>`).join('');
    this.show(`<div class="box panel">
      <div class="bigres ${won ? 'win' : 'lose'}">${won ? 'SIEG' : 'GEFALLEN'}</div>
      <div style="text-align:center;color:var(--dim);margin-bottom:6px">${won ? 'Vaelgor ist gefallen. Der Morgen graut über Varn.' : 'Die Nacht hat dich verschlungen.'}</div>
      <div class="kv"><span>Held</span><span>${HEROES[G.hero].name}</span><span>Überlebt</span><span>${fmtTime(G.t)}</span><span>Stufe</span><span>${G.level}</span><span>Besiegt</span><span>${G.kills}</span>
      <span>Reaktionen</span><span>${G.stats.reactions}</span><span>Fusionen</span><span>${G.stats.fusions.map((f) => FUSIONS[f].name).join(', ') || '—'}</span><span>Seelen erhalten</span><span style="color:#d8c0ff">+${souls}</span></div>
      ${extra && G.hero === 'finn' ? finnEndHtml(extra) : ''}
      <div class="codex"><h3>Schaden nach Quelle</h3></div>${dm}${nl}
      <div class="btns"><button class="btn primary" data-act="again">Noch eine Nacht</button><button class="btn" data-act="play">Helden wechseln</button><button class="btn ghost" data-act="title">Hauptmenü</button></div></div>`, 'end', 'dim');
  },

  /* ---------------------------------------------- Altar */
  showAltar() {
    menuScene();
    const rows = Object.keys(META).map((id) => {
      const M = META[id], lv = SAVE.meta[id] || 0, max = lv >= M.max;
      return `<div class="mrow"><img src="${icon(metaIcon(id))}" style="width:40px;height:40px;border-radius:8px"><div class="mt"><b>${M.name}</b><small>${M.desc}</small><div class="pips">${'◆'.repeat(lv)}${'◇'.repeat(M.max - lv)}</div></div>
        <button class="btn small" data-act="buymeta" data-id="${id}" ${max || SAVE.souls < M.cost[lv] ? 'disabled' : ''}>${max ? 'Max' : M.cost[lv] + ' ✧'}</button></div>`;
    }).join('');
    this.show(`<div class="box panel"><h2>Altar der Nacht</h2><div class="souls">Seelen: <b>${SAVE.souls}</b></div>
      <p style="color:var(--dim);text-align:center;font-size:15px;margin-top:4px">Seelen bekommst du in jedem Lauf — auch wenn du fällst. Diese Gaben gelten dauerhaft für alle Helden.</p>
      <div class="meta">${rows}</div><div class="btns"><button class="btn" data-act="title">Zurück</button></div></div>`, 'altar', 'dim');
  },

  /* ---------------------------------------------- Chronik */
  showCodex() {
    menuScene();
    const fus = Object.keys(FUSIONS).map((f) => { const F = FUSIONS[f]; const req = Object.keys(F.req).map((r) => r.startsWith('any') ? `${ {anyBlood: 'Blut', anyShadow: 'Schatten', anyQi: 'Qi'}[r] }-Fähigkeit St. ${F.req[r]}` : `${CARDS[r].name} St. ${F.req[r]}`).join(' + ');
      return `<li><b style="color:#ffe6a0">${SAVE.seenFusions[f] ? '✦ ' : ''}${F.name}</b> (${F.heroes.map((h) => HEROES[h].name).join(', ')})<br>${req}<br><span style="color:var(--dim)">${F.desc}</span></li>`; }).join('');
    const re = Object.keys(REACTIONS).map((k) => `<li><b style="color:${REACTIONS[k].col}">${REACTIONS[k].name}</b> — ${REACTIONS[k].desc}</li>`).join('');
    const en = Object.keys(ENEMIES).map((k) => `<li><b>${ENEMIES[k].name}</b> — ${ENEMY_DESC[k]}</li>`).join('');
    const S = SAVE.stats;
    this.show(`<div class="box panel codex"><h2>Chronik</h2>
      <div class="kv"><span>Läufe</span><span>${S.runs}</span><span>Besiegte Gegner</span><span>${S.kills}</span><span>Längste Nacht</span><span>${fmtTime(S.bestTime)}</span><span>Höchste Stufe</span><span>${S.maxLevel}</span><span>Vaelgor besiegt</span><span>${S.bossKills}×</span><span>Fusionen</span><span>${S.fusions}</span></div>
      <h3>Element-Reaktionen</h3><p>Jeder Treffer hinterlässt ein Mal seiner Schule (3 s). Trifft eine andere Schule, entsteht eine Reaktion:</p><ul>${re}</ul>
      <h3>Fusionen</h3><ul>${fus}</ul>
      <h3>Die Toten von Varn</h3><ul>${en}</ul>
      <div class="btns"><button class="btn" data-act="title">Zurück</button></div></div>`, 'codex', 'dim');
  },

  /* ---------------------------------------------- Einstellungen */
  showSettings() {
    const s = SAVE.settings;
    const d = this.show(`<div class="box panel"><h2>Einstellungen</h2>
      <div class="setrow"><span>Effekte</span><input type="range" min="0" max="1" step="0.05" value="${s.sfx}" id="rsfx"></div>
      <div class="setrow"><span>Musik</span><input type="range" min="0" max="1" step="0.05" value="${s.music}" id="rmus"></div>
      <div class="setrow"><span>Bildschirmwackeln</span><input type="range" min="0" max="1.5" step="0.1" value="${s.shake}" id="rshk"></div>
      <div class="setrow"><span>Schadenszahlen</span><div class="toggle interactive ${s.dmgNumbers ? 'on' : ''}" data-act="toggle" data-k="dmgNumbers"></div></div>
      <div class="setrow"><span>Grafikqualität</span><button class="btn small" data-act="quality">${s.quality}</button></div>
      <div class="setrow"><span>Testmodus: alle Helden frei<br><small style="color:var(--dim)">für die Probeversion. Aus = Helden durch Spielen freischalten.</small></span><div class="toggle interactive ${s.testUnlock ? 'on' : ''}" data-act="toggle" data-k="testUnlock"></div></div>
      <div class="btns"><button class="btn" data-act="title">Zurück</button><button class="btn ghost small" data-act="reset">Fortschritt löschen</button></div></div>`, 'settings', 'dim');
    const bind = (id, k) => d.querySelector('#' + id).addEventListener('input', (e) => { SAVE.settings[k] = +e.target.value; AudioSys.applyVolumes(); writeSave(); });
    bind('rsfx', 'sfx'); bind('rmus', 'music'); bind('rshk', 'shake');
  }
};
const ENEMY_DESC = {
  ghoul: 'Hungrige Leichenfresser. Einzeln schwach, in Massen tödlich.',
  bat: 'Schnell und flatterhaft. Kommen in Schwärmen.',
  knight: 'Gepanzerte Skelettritter mit Turmschild. Rüstung schluckt schwache Treffer.',
  witch: 'Schwebt auf Abstand und schleudert grünes Seelenfeuer. Grüne Kugeln ausweichen!',
  brute: 'Aufgeblähter Koloss — platzt beim Tod in drei Ghule.',
  captain: 'Zwischenboss (5:00). Achte auf die rote Linie: Er stürmt los.',
  boss: 'Endboss (9:00). Rote Kreise = Hammerschlag, rote Bahn = Ansturm, Glocke = Ring aus Feuerkugeln.'
};
function metaIcon(id) { return { vitae: 'vampirblut', macht: 'grabesmacht', eile: 'nebelgang', magnet: 'seelenmagnet', gier: 'soulgift', wurf: 'qikette', wiedergeburt: 'lebensraub' }[id]; }
function isUnlocked(id) { return !!SAVE.unlocked[id] || SAVE.settings.testUnlock; }
function fmtTime(t) { t = Math.max(0, Math.floor(t)); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }

/* -------------------------------------------------------- Finn: Formwahl & Fortschritt */
function finnReqHtml(T, F) {
  if (!T.req) return '';
  if (!T.req.essence) return T.req.text;
  const ok = F.essence >= T.req.essence;
  return `${T.req.text} · Blutessenz <b style="color:${ok ? '#7dff9a' : '#ffb0b0'}">${Math.min(F.essence, T.req.essence)} / ${T.req.essence}</b>`;
}
function finnSelectHtml() {
  const F = finnSave(), cur = FINN_TIERS[F.tier], N = FINN_TIERS[F.tier + 1];
  const test = SAVE.settings.testUnlock;
  if (UI.finnPick === undefined || (!test && UI.finnPick !== F.tier)) UI.finnPick = F.tier;
  const chips = FINN_TIERS.map((T, i) => {
    const own = i <= F.tier, can = own && i === F.tier || test;
    return `<button class="btn small ${i === UI.finnPick ? 'primary' : 'ghost'}" data-act="finnform" data-t="${i}" ${can ? '' : 'disabled'} style="padding:6px 8px;min-height:32px;font-size:11px">${own ? '' : '🔒 '}${T.name}</button>`;
  }).join('');
  const bar = N && N.req.essence ? `<div class="mbar" style="width:100%;height:9px;border-radius:5px;background:rgba(0,0,0,.6);border:1px solid #5a3a3a;overflow:hidden;margin:4px 0"><div style="height:100%;width:${Math.min(100, F.essence / N.req.essence * 100).toFixed(0)}%;background:linear-gradient(90deg,#6a0a2a,#ff3a4e)"></div></div>` : '';
  return `<div class="blk"><b class="lbl">DAUERHAFTE FORM: <span style="color:${cur.col}">${cur.name.toUpperCase()}</span></b>
      <p>${cur.desc}</p>
      ${N ? `<p style="margin-top:4px">Nächste Form: <b style="color:${N.col}">${N.name}</b> — ${finnReqHtml(N, F)}</p>${bar}` : '<p>Höchste Form erreicht.</p>'}
      <div style="color:var(--dim);font-size:13.5px">Blutessenz gesamt: ${F.essence} · Läufe: ${F.runs} · Siege: ${F.wins}</div></div>
    <div class="blk"><b class="lbl">FORM FÜR DIESEN LAUF${test ? ' (TESTMODUS)' : ''}</b><div style="display:flex;flex-wrap:wrap;gap:5px">${chips}</div>
      ${test && UI.finnPick !== F.tier ? '<div style="color:#ffd27a;font-size:13.5px;margin-top:4px">Testform: dieser Lauf zählt nicht für Essenz und Evolution.</div>' : ''}</div>
    <div class="blk"><b class="lbl">DER WEG</b><div class="builds">${FINN_TIERS.slice(1).map((T) => `<div><span style="color:${T.col}">${T.name}:</span> ${T.desc}<br><small style="color:var(--dim)">Bedingung: ${T.req.essence ? T.req.essence + ' Blutessenz + ' : ''}${T.req.text}</small></div>`).join('')}</div></div>`;
}
function finnEndHtml(x) {
  const F = finnSave();
  if (x.test) return `<div class="codex"><h3>Evolution</h3><p>${x.note}</p></div>`;
  let h = `<div class="codex"><h3>Evolution</h3><p>Blutessenz: <b style="color:#ff8a96">+${x.gain}</b> (gesamt ${F.essence})</p>`;
  if (x.evolved) h += `<div style="text-align:center;margin:8px 0"><div class="cinzel" style="font-size:12px;letter-spacing:.4em;color:var(--gold2)">DAUERHAFTE EVOLUTION</div><div class="cinzel" style="font-size:24px;font-weight:800;color:${x.evolved.col};text-shadow:0 0 16px currentColor">${x.evolved.name}</div><p>${x.evolved.desc}</p></div>`;
  const N = x.next;
  if (N && N.req.essence) h += `<p>Nächste Form <b style="color:${N.col}">${N.name}</b>:<br>Prüfung: ${N.req.text} ${x.evolved ? '' : x.trial ? '<b style="color:#7dff9a">✓ bestanden</b>' : '<b style="color:#ffb0b0">✗ noch nicht</b>'}<br>Blutessenz ${Math.min(F.essence, N.req.essence)} / ${N.req.essence}</p>`;
  return h + '</div>';
}
