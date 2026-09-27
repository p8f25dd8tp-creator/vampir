'use strict';
/* ==========================================================================
   STORY-OBERFLAECHE — Hauptmenue mit zwei Modi, Kapitelwahl, System-Fenster
   (Kapitelstart, Quests, Status, Evolution), Bestienausruestung, Kapitelende.
   ========================================================================== */

const _ui = { showTitle: UI.showTitle, act: UI.act, showEnd: UI.showEnd, showPause: UI.showPause, showHud: UI.showHud, updateHud: UI.updateHud, showLevelUp: UI.showLevelUp };

UI.showTitle = function () {
  if (GAME && GAME.state !== 'menu') GAME.state = 'menu';
  this.hideHud();
  MENU = null; setTheme('friedhof'); menuScene();
  const S = storySave(), F = finnSave();
  this.show(`
    <div class="logo"><h1>NACHTFALL</h1><div class="sub"><b>BLUT</b> · <i>SCHATTEN</i> · <u>QI</u></div></div>
    <div class="menu">
      <button class="btn primary sysbtn" data-act="story"><span class="syst">[ SYSTEM ]</span><br>Das Vampirsystem<br><small>Story · Finn Müller · ${FINN_TIERS[F.tier].name}</small></button>
      <button class="btn" data-act="play">Nachtfall · Arcade<br><small>4 Helden · Seelen: ${SAVE.souls}</small></button>
      <div class="row" style="gap:10px"><button class="btn small" style="flex:1" data-act="gear">Ausrüstung · ${S.crystals} ◆</button><button class="btn small" style="flex:1" data-act="altar">Altar (Arcade)</button></div>
      <div class="row" style="gap:10px"><button class="btn small ghost" style="flex:1" data-act="codex">Chronik</button><button class="btn small ghost" style="flex:1" data-act="settings">Einstellungen</button></div>
      <div class="foot">Offline spielbar · keine Käufe · Version 0.3<br>„Das Vampirsystem“ ist eine private Fan-Umsetzung.</div>
    </div>`, 'title');
};

UI.act = function (a, ds, e) {
  switch (a) {
    case 'story': return this.showStory();
    case 'chapter': this.selChapter = +ds.n; return this.showStory();
    case 'chapterGo': return this.showChapterIntro(this.selChapter);
    case 'chapterStart': return storyStart(this.selChapter);
    case 'storyform': this.finnPick = +ds.t; return this.showStory();
    case 'comp': { const P0 = companionParty(); const i = P0.indexOf(ds.id); if (i >= 0) P0.splice(i, 1); else { if (P0.length >= partyMax()) P0.shift(); P0.push(ds.id); } writeSave(); return this.showStory(); }
    case 'gear': return this.showGear();
    case 'buygear': {
      const S = storySave(), G0 = GEAR[ds.id], lv = S.gear[ds.id] || 0;
      if (lv < G0.max && S.crystals >= G0.cost[lv]) { S.crystals -= G0.cost[lv]; S.gear[ds.id] = lv + 1; writeSave(); sfx('level'); }
      return this.showGear();
    }
    case 'again': if (GAME && GAME.story) return storyStart(GAME.story.n); break;
    case 'nextch': return (this.selChapter = Math.min(CHAPTERS.length, GAME.story.n + 1), this.showStory());
  }
  return _ui.act.call(this, a, ds, e);
};

/* ---------------------------------------------------------------- Kapitelwahl */
function chapterOpen(n) { const S = storySave(); return n === 1 || S.cleared[n - 1] || SAVE.settings.testUnlock; }
UI.showStory = function () {
  const S = storySave(), F = finnSave();
  if (!this.selChapter) { this.selChapter = 1; for (let n = 1; n <= CHAPTERS.length; n++) if (chapterOpen(n) && !S.cleared[n]) { this.selChapter = n; break; } }
  const ch = CHAPTERS[this.selChapter - 1];
  MENU = null; setTheme(ch.theme); menuScene();
  const test = SAVE.settings.testUnlock;
  if (this.finnPick === undefined || !test) this.finnPick = F.tier;
  const cards = CHAPTERS.map((c) => {
    const open = chapterOpen(c.n), done = S.cleared[c.n];
    return `<div class="chap ${c.n === this.selChapter ? 'sel' : ''} ${open ? '' : 'locked'}" data-act="chapter" data-n="${c.n}">
      <canvas data-boss="${c.n}"></canvas>
      <div class="cn"><span class="cnum">${c.n}</span> ${c.title}</div>
      <div class="cs">${done ? '✔ geschafft' : open ? 'offen' : '🔒'}</div></div>`;
  }).join('');
  const openSel = chapterOpen(ch.n);
  const chips = FINN_TIERS.map((T, i) => `<button class="btn small ${i === this.finnPick ? 'primary' : 'ghost'}" data-act="storyform" data-t="${i}" style="padding:5px 8px;min-height:30px;font-size:10.5px">${T.name}</button>`).join('');
  const d = this.show(`
    <div class="syswin" style="width:min(560px,100%)">
      <div class="syshead">[ SYSTEM ] · STATUS</div>
      <div class="statusrow"><canvas id="finnprev" width="180" height="200"></canvas>
        <div class="kv" style="flex:1;margin:0">
          <span>Name</span><span>Finn Müller</span>
          <span>Form</span><span style="color:${FINN_TIERS[F.tier].col}">${FINN_TIERS[F.tier].name}</span>
          <span>Titel</span><span>${S.king ? 'Vampirkönig' : '—'}</span>
          <span>Kapitel</span><span>${Object.keys(S.cleared).length} / ${CHAPTERS.length}</span>
          <span>Bestienkristalle</span><span style="color:#8ad8ff">${S.crystals} ◆</span>
        </div></div>
      <div class="sysnote">Kräfte: ${[...finnSkills()].map((k) => `<b style="color:#8ad8ff">${FINN_SKILLS[k].name}</b>`).join(' · ') || '—'}</div>
      ${test ? `<div class="sysnote">Testmodus: Form für den Lauf frei wählbar (zählt dann nicht für die Evolution)</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${chips}</div>` : ''}
    </div>
    <div class="chaps">${cards}</div>
    <div class="syswin" style="width:min(560px,100%);margin-bottom:10px">
      <div class="syshead">BEGLEITER (bis zu ${partyMax()})</div>
      <div class="comps">${COMP_ORDER.map((id) => { const C0 = COMPANIONS[id], open = companionOpen(id), on = companionParty().includes(id); return `<button class="comp ${on ? 'on' : ''}" data-act="${open ? 'comp' : ''}" data-id="${id}" ${open ? '' : 'disabled'}><b style="color:${C0.col}">${open ? '' : '🔒 '}${compName(id)}</b><small>${!open ? 'nach Kapitel ' + C0.unlock : companionFits(id, ch.n) ? C0.role : 'nicht in diesem Kapitel'}</small></button>`; }).join('')}</div>
      ${companionParty().length ? `<div class="sysnote">${companionParty().map((id) => COMPANIONS[id].desc).join('<br>')}</div>` : '<div class="sysnote">Finn kämpft allein.</div>'}
    </div>
    <div class="syswin" style="width:min(560px,100%)">
      <div class="syshead">KAPITEL ${ch.n} · ${ch.title.toUpperCase()}</div>
      <div class="sysplace">${ch.place} · <span style="opacity:.7">Vorlage ${ch.src}</span></div>
      ${ch.missions && typeof STORY_MISSIONS !== 'undefined' ? `<div class="sysnote">Storymissionen ${ch.missions[0]}–${ch.missions[1]}: ${STORY_MISSIONS.slice(ch.missions[0] - 1, ch.missions[1]).map((m) => m[1]).join(' · ')}</div>` : ''}
      <p class="sysp">${ch.intro[0]}</p>
      <div class="sysnote">Empfohlene Form: <b style="color:${FINN_TIERS[ch.tier].col}">${FINN_TIERS[ch.tier].name}</b> · Boss: <b>${ENEMIES[ch.roles.boss].name}</b></div>
      <div class="sysnote">Belohnung beim ersten Sieg: <b style="color:#ffe6a0">${ch.reward.text}</b>${S.cleared[ch.n] ? ' (erhalten)' : ''}</div>
      ${S.best[ch.n] ? `<div class="sysnote">Beste Zeit: ${fmtTime(S.best[ch.n])}</div>` : ''}
    </div>
    <div class="selbar"><button class="btn ghost" data-act="title">Zurück</button><button class="btn primary" data-act="chapterGo" ${openSel ? '' : 'disabled'}>${openSel ? 'Kapitel starten' : 'Gesperrt'}</button></div>`, 'story', 'dim');
  // Boss-Silhouetten auf den Kapitelkarten
  d.querySelectorAll('canvas[data-boss]').forEach((c) => {
    const n = +c.dataset.boss, C2 = CHAPTERS[n - 1];
    const r = c.getBoundingClientRect(); c.width = Math.round(r.width * VIEW.dpr); c.height = Math.round(r.height * VIEW.dpr);
    const g = c.getContext('2d');
    const th = THEMES[C2.theme];
    g.fillStyle = rg(g, c.width / 2, c.height * 0.7, 2, c.width, [0, th.ambient.replace('rgb', 'rgba').replace(')', ',0.9)'), 1, 'rgba(0,0,0,0)']);
    g.fillRect(0, 0, c.width, c.height);
    g.setTransform(c.height / 330, 0, 0, c.height / 330, c.width / 2, c.height * 0.94);
    g.lineCap = 'round'; g.lineJoin = 'round';
    try { BOSS_ART[ENEMIES[C2.roles.boss].bossDraw](g, { t: 1.2, run: 0 }); } catch (err) { /* egal */ }
    if (!chapterOpen(n)) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(0,0,0,0.9)'; g.fillRect(0, 0, c.width, c.height); }
  });
  this.previews = [{ c: $('#finnprev'), id: 'finn', t: 0, finn: true }];
};
// Finn-Vorschau im Statusfenster (ueberschreibt die Heldenvorschau nur fuer diese Leinwand)
const _tickPrev = UI.tickPreviews;
UI.tickPreviews = function (dt) {
  const pv = this.previews[0];
  if (pv && pv.finn) {
    pv.t += dt;
    const g = pv.c.getContext('2d'), w = pv.c.width, h = pv.c.height;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    const tier = this.finnPick !== undefined ? this.finnPick : finnSave().tier;
    g.fillStyle = rg(g, w / 2, h * 0.7, 4, w * 0.8, [0, rgba(FINN_TIERS[tier].rim, 0.35), 1, 'rgba(0,0,0,0)']); g.fillRect(0, 0, w, h);
    pv.spr = renderHero('finn', { t: pv.t, run: 0, phase: 0, cast: (pv.t % 4) > 3.2 ? Math.sin(((pv.t % 4) - 3.2) / 0.8 * Math.PI) : 0, aim: 0.2 }, { tier, rim: FINN_TIERS[tier].rim }, h / 90, pv.spr, { glow: true });
    g.drawImage(pv.spr.out, w / 2 - pv.spr.S / 2, h * 0.92 - pv.spr.anchorY);
    return;
  }
  _tickPrev.call(this, dt);
};

/* ---------------------------------------------------------------- Kapitelstart (System-Fenster) */
UI.showChapterIntro = function (n) {
  const ch = CHAPTERS[n - 1];
  const F = finnSave();
  const firstBook = n === 1 && F.tier === 0;
  this.show(`
    <div class="syswin big" style="width:min(520px,100%);margin:auto 0">
      <div class="syshead">[ SYSTEM ] · KAPITEL ${ch.n}</div>
      <div class="systitle">${ch.title}</div>
      <div class="sysplace">${ch.place}</div>
      ${ch.intro.map((l) => `<p class="sysp">${l}</p>`).join('')}
      ${firstBook ? '<p class="sysp" style="color:#ffb0b0">Du hast noch keine Kräfte. Lauf zum leuchtenden Buch!</p>' : ''}
      <div class="syshead" style="margin-top:10px">QUESTS</div>
      ${ch.quests.map((q) => `<div class="questline">▸ ${q.text} <span>+${q.reward.crystals} ◆</span></div>`).join('')}
      <div class="syshead" style="margin-top:10px">ZIEL</div>
      <div class="questline">▸ Besiege ${ENEMIES[ch.roles.boss].name}</div><div class="sysnote" style="color:#ffe6a0">Belohnung: ${ch.reward.text}</div>
      <div class="btns"><button class="btn primary" data-act="chapterStart">Annehmen</button><button class="btn ghost" data-act="story">Zurück</button></div>
    </div>`, 'intro', 'dim');
};

/* ---------------------------------------------------------------- System-Meldungen im Lauf */
UI.sysWindow = function (title, line, line2) {
  const hud = this.hud; if (!hud) return;
  const old = hud.querySelectorAll('.sysmsg'); if (old.length >= 2) old[0].remove();
  const el = document.createElement('div'); el.className = 'sysmsg';
  el.innerHTML = `<div class="syshead">[ ${title} ]</div><div>${line}</div>${line2 ? `<div class="sysnote">${line2}</div>` : ''}`;
  hud.appendChild(el);
  const others = hud.querySelectorAll('.sysmsg'); el.style.top = `calc(${Math.round(VIEW.cssH * 0.3) + (others.length - 1) * 78}px + var(--safe-t))`;
  setTimeout(() => el.classList.add('out'), 3200); setTimeout(() => el.remove(), 3800);
};
UI.showHud = function () {
  _ui.showHud.call(this);
  if (!GAME.story) return;
  const q = document.createElement('div'); q.className = 'questbox'; q.id = 'questbox';
  this.hud.appendChild(q);
  this.cache.quests = null;
  setTimeout(() => this.sysWindow('KAPITEL ' + GAME.story.n, GAME.story.title, GAME.story.place), 400);
};
UI.updateHud = function () {
  _ui.updateHud.call(this);
  const G = GAME;
  if (!G || !G.story || !this.hud) return;
  const key = G.quests.map((Q) => Q.prog + (Q.done ? 'd' : '')).join('|') + '|' + (G.crystals || 0);
  if (this.cache.quests === key) return;
  this.cache.quests = key;
  const box = $('#questbox'); if (!box) return;
  box.innerHTML = `<div class="qh">QUESTS · <span style="color:#8ad8ff">${G.crystals || 0} ◆</span></div>` + G.quests.map((Q) => {
    const q = Q.q, goal = q.type === 'mini' ? 1 : q.n;
    const pr = q.type === 'survive' ? fmtTime(Math.min(Q.prog, goal)) + '/' + fmtTime(goal) : Math.min(Q.prog, goal) + '/' + goal;
    return `<div class="ql ${Q.done ? 'done' : ''}">${Q.done ? '✔' : '▸'} ${q.text}${q.type === 'mini' ? '' : ' <b>' + pr + '</b>'}</div>`;
  }).join('');
};
UI.showLevelUp = function (offers) {
  _ui.showLevelUp.call(this, offers);
  if (GAME.story && this.cur) { this.cur.classList.add('sysmode'); const h = this.cur.querySelector('h2'); if (h) h.innerHTML = `<span class="syst">[ SYSTEM ]</span><br>Stufenaufstieg · Stufe ${GAME.level}`; }
};

/* ---------------------------------------------------------------- Statusfenster (Pause) */
UI.showPause = function () {
  if (!GAME.story) return _ui.showPause.call(this);
  _ui.showPause.call(this);
  const G = GAME, p = G.p, T = FINN_TIERS[p.tier || 0], S = storySave();
  const box = this.cur.querySelector('.box');
  const st = document.createElement('div'); st.className = 'syswin'; st.style.marginBottom = '10px';
  st.innerHTML = `<div class="syshead">[ SYSTEM ] · STATUS</div>
    <div class="kv" style="margin:4px 0">
      <span>Name</span><span>Finn Müller</span><span>Rasse</span><span style="color:${T.col}">${T.name}</span>
      <span>Titel</span><span>${S.king ? 'Vampirkönig' : '—'}</span><span>Stufe</span><span>${G.level}</span>
      <span>Leben</span><span>${Math.round(p.hp)} / ${Math.round(p.st.maxHp)}</span>
      <span>Stärke</span><span>${Math.round(p.st.might * 10 * T.might)}</span><span>Geschick</span><span>${Math.round(p.st.speed / 10)}</span>
      <span>Ausdauer</span><span>${Math.round(p.st.maxHp / 10)}</span><span>Kristalle (Lauf)</span><span>${G.crystals || 0} ◆</span>
    </div>
    <div class="syshead">QUESTS</div>${G.quests.map((Q) => `<div class="questline ${Q.done ? 'done' : ''}">${Q.done ? '✔' : '▸'} ${Q.q.text}</div>`).join('')}`;
  box.insertBefore(st, box.children[1]);
};

/* ---------------------------------------------------------------- Kapitelende */
UI.showEnd = function (won, souls, newly, extra) {
  if (!extra || !extra.story) return _ui.showEnd.call(this, won, souls, newly, extra);
  this.hideHud();
  const G = GAME, ch = extra.ch, S = storySave();
  const tot = Object.values(G.stats.dmg).reduce((a, b) => a + b, 0) || 1;
  const top = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = top.length ? top[0][1] : 1;
  const dm = top.map(([k, v]) => `<div class="dmgrow"><span>${SRC_NAMES[k] || k}</span><div class="bar"><i style="width:${(v / max * 100).toFixed(0)}%;background:#6ac8ff"></i></div><span class="n">${Math.round(v / tot * 100)}%</span></div>`).join('');
  let rew = '';
  if (extra.test) rew = '<div class="sysnote">Testform — Belohnungen der Form werden nicht vergeben.</div>';
  if (extra.evolved) rew += `<div style="text-align:center;margin:10px 0"><div class="syshead">[ SYSTEM ] · EVOLUTION</div><div class="cinzel" style="font-size:26px;font-weight:800;color:${extra.evolved.col};text-shadow:0 0 18px currentColor">${extra.evolved.name}</div><p class="sysp">${extra.evolved.desc}</p></div>`;
  else if (extra.reward && extra.reward.king) rew += `<div style="text-align:center;margin:10px 0"><div class="syshead">[ SYSTEM ] · TITEL ERHALTEN</div><div class="cinzel" style="font-size:24px;font-weight:800;color:#ffe6a0">Vampirkönig</div><p class="sysp">+10 % Leben und Schaden, dauerhaft.</p></div>`;
  if (extra.skills) rew += `<div style="text-align:center;margin:10px 0"><div class="syshead">[ SYSTEM ] · NEUE KRAFT</div>${extra.skills.map((k) => `<div class="cinzel" style="font-size:20px;font-weight:800;color:#8ad8ff">${FINN_SKILLS[k].name}</div><p class="sysp">${FINN_SKILLS[k].desc}</p>`).join('')}</div>`;
  const neuC = won && extra.firstClear ? COMP_ORDER.filter((id) => COMPANIONS[id].unlock === ch.n) : [];
  if (neuC.length) rew += `<div class="sysnote" style="text-align:center">Neue Begleiter: ${neuC.map((id) => `<b style="color:${COMPANIONS[id].col}">${COMPANIONS[id].name}</b>`).join(', ')}</div>`;
  if (won && ch.outro) rew += `<div class="syshead" style="margin-top:10px">[ SYSTEM ] · EPILOG</div>${ch.outro.map((l) => `<p class="sysp">${l}</p>`).join('')}`;
  const hasNext = won && ch.n < CHAPTERS.length;
  this.show(`<div class="syswin big" style="width:min(540px,100%);margin:auto 0">
    <div class="syshead">[ SYSTEM ] · KAPITEL ${ch.n}</div>
    <div class="bigres ${won ? 'win' : 'lose'}" style="font-size:clamp(26px,8vw,40px)">${won ? 'KAPITEL GESCHAFFT' : 'GESCHEITERT'}</div>
    <div class="sysplace" style="text-align:center">${ch.title} · ${fmtTime(G.t)} · Stufe ${G.level} · ${G.kills} besiegt</div>
    ${rew}
    <div class="kv"><span>Bestienkristalle</span><span style="color:#8ad8ff">+${extra.crystals} ◆ (gesamt ${S.crystals})</span>
      <span>Quests</span><span>${G.quests.filter((Q) => Q.done).length} / ${G.quests.length}</span></div>
    ${won ? '' : '<p class="sysp">Tipp: Mit Bestienkristallen verbesserst du im Menü „Ausrüstung“ Handschuhe, Stiefel, Panzer und Amulett — dauerhaft.</p>'}
    <div class="syshead" style="margin-top:6px">SCHADEN</div>${dm}
    <div class="btns">${hasNext ? '<button class="btn primary" data-act="nextch">Nächstes Kapitel</button>' : ''}
      <button class="btn ${hasNext ? '' : 'primary'}" data-act="again">${won ? 'Kapitel wiederholen' : 'Nochmal versuchen'}</button>
      <button class="btn" data-act="gear">Ausrüstung</button><button class="btn ghost" data-act="story">Kapitelübersicht</button></div>
  </div>`, 'end', 'dim');
};

/* ---------------------------------------------------------------- Ausruestung */
UI.showGear = function () {
  const S = storySave();
  const rows = Object.keys(GEAR).map((id) => {
    const G0 = GEAR[id], lv = S.gear[id] || 0, max = lv >= G0.max;
    return `<div class="mrow"><div class="mt"><b>${G0.name}</b><small>${G0.desc}</small><div class="pips">${'◆'.repeat(lv)}${'◇'.repeat(G0.max - lv)}</div></div>
      <button class="btn small" data-act="buygear" data-id="${id}" ${max || S.crystals < G0.cost[lv] ? 'disabled' : ''}>${max ? 'Max' : G0.cost[lv] + ' ◆'}</button></div>`;
  }).join('');
  this.show(`<div class="syswin big" style="width:min(520px,100%);margin:auto 0">
    <div class="syshead">[ SYSTEM ] · BESTIENAUSRÜSTUNG</div>
    <p class="sysp">Aus den Kristallen besiegter Bestien fertigst du Ausrüstung. Sie gilt dauerhaft in allen Kapiteln.</p>
    <div class="souls" style="color:#8ad8ff">Bestienkristalle: <b>${S.crystals} ◆</b></div>
    <div class="meta">${rows}</div>
    <div class="btns"><button class="btn primary" data-act="story">Zu den Kapiteln</button><button class="btn ghost" data-act="title">Hauptmenü</button></div></div>`, 'gear', 'dim');
};
