'use strict';
/* ==========================================================================
   HAUPTSCHLEIFE & ABLAUF — Titel, Missionen, Kampf, Ende
   ========================================================================== */

let MISSION = null;
buildParticleSprites();

function showTitle() {
  G = null; MISSION = null; SCENE_BG.cur = 'nacht';
  const started = Object.keys(SAVE.progress).length > 0;
  const el = uiShow(`
    <div class="title">MY VAMPIRE<br>SYSTEM</div>
    <div class="subtitle">AKT I · DER SCHWÄCHSTE SCHÜLER</div>
    <div style="height:18px"></div>
    <button class="btn" id="tNew">${started ? 'Von vorn beginnen' : 'Spiel starten'}</button>
    ${started ? '<button class="btn" id="tCont">Fortsetzen</button>' : ''}
    <button class="btn ghost" id="tSet">Einstellungen</button>
    <div class="foot">Private Fan-Umsetzung von „My Vampire System“.<br>Frühe Testversion · Etappe 6</div>`, '');
  el.querySelector('#tNew').onclick = () => { AudioSys.init(); if (started) resetSave(); startMission('prolog'); };
  if (started) el.querySelector('#tCont').onclick = () => { AudioSys.init(); startMission(nextMission()); };
  el.querySelector('#tSet').onclick = showSettings;
}
function nextMission() {
  if (!SAVE.progress.prolog) return 'prolog';
  if (!SAVE.progress.test) return 'test';
  const F = SAVE.flags;
  if (F.logan2) return 'ende';
  if (F.earl && !F.rettung) return E6_CHAIN.find((id) => !(SAVE.progress[id] && SAVE.progress[id].done)) || 'akademie';
  return 'akademie';
}
function showSettings() {
  const S = SAVE.settings;
  const el = uiShow(`${sysBox({ head: 'EINSTELLUNGEN', lines: ['Tippe zum Umschalten.'] })}
    <button class="btn" id="sSfx">Ton: ${S.sfx > 0 ? 'an' : 'aus'}</button>
    <button class="btn" id="sDodge">Weites Ausweich-Fenster: ${S.wideDodge ? 'an' : 'aus'}</button>
    <button class="btn" id="sShake">Bildschirmwackeln: ${S.shake > 0 ? 'an' : 'aus'}</button>
    <button class="btn ghost" id="sBack">Zurück</button>`, 'dim');
  el.querySelector('#sSfx').onclick = () => { S.sfx = S.sfx > 0 ? 0 : 0.8; writeSave(); AudioSys.applyVolumes && AudioSys.applyVolumes(); showSettings(); };
  el.querySelector('#sDodge').onclick = () => { S.wideDodge = !S.wideDodge; writeSave(); showSettings(); };
  el.querySelector('#sShake').onclick = () => { S.shake = S.shake > 0 ? 0 : 1; writeSave(); showSettings(); };
  el.querySelector('#sBack').onclick = showTitle;
}

let REPLAY = false;
function startMission(id, skipScene, replay) {
  REPLAY = !!replay;
  if (id === 'ende') return showEnd();
  const M = MISSIONS[id]; MISSION = M; G = null;
  if (M.type === 'hub') return beginHub(M);
  const go = () => (M.fight ? beginFight(M) : finishMission(M, true));
  if (M.scene && !skipScene) runScene(M.scene, go); else go();
}
function beginFight(M) {
  INPUT.events.length = 0; INPUT.atkHeld = false;
  newFight(Object.assign({}, M.fight, {
    onWin: (G0) => finishMission(M, true, G0),
    onLose: (G0) => showLost(M, G0)
  }));
  G.showFoe = !M.fight.noFoeBar;
  buildHud(M.fight);
  banner(M.title.toUpperCase());
}
function beginHub(M) {
  INPUT.events.length = 0; INPUT.atkHeld = false;
  const opt = hubSetup();
  newFight(opt);
  G.showFoe = false;
  buildHud(opt);
  const key = SAVE.day.n + '' + SAVE.day.night;
  if (beginHub.shown !== key) { beginHub.shown = key; banner(SAVE.day.night ? 'NACHT' : 'TAG ' + SAVE.day.n); }
}
function finishMission(M, won, G0) {
  const P = SAVE.progress[M.id] || (SAVE.progress[M.id] = {});
  const first = !P.done;
  P.done = true;
  if (M.onWinExtra) M.onWinExtra();
  const rep = G0 ? fightReport(G0, true) : null;
  if (first && M.reward) {
    const Q = SAVE.quinn;
    if (M.reward.exp) { const l0 = Q.level; gainExp(M.reward.exp); if (rep) { rep.kv.push(['Quest-Belohnung', '+' + M.reward.exp]); if (Q.level > l0) rep.up = true; } }
    (M.reward.skills || []).forEach((s) => { if (!Q.skills.includes(s)) Q.skills.push(s); });
  }
  if (first && M.after) M.after();
  writeSave();
  G = null;
  const after = () => (REPLAY ? showEnd() : M.next ? startMission(M.next) : showEnd(M));
  const story = () => (M.won && (first || !M.repeat) && !REPLAY ? runScene(M.won, after) : after());
  if (rep) showReport(rep, story); else story();
}
function showReport(rep, done) {
  SCENE_BG.cur = 'system';
  const Q = SAVE.quinn;
  if (rep.up) { sfx('level'); rep.lines.unshift(`STUFENAUFSTIEG · Stufe ${Q.level}`); }
  rep.kv.push(['Stufe', Q.level], ['EP', Q.exp + ' / ' + expNeed(Q.level)]);
  const el = uiShow(`${sysBox(rep)}${Q.points ? `<button class="btn" id="rStat">Wertepunkte verteilen (${Q.points})</button>` : ''}<button class="btn ${Q.points ? 'ghost' : ''}" id="rGo">Weiter</button>`, 'dim');
  if (Q.points) el.querySelector('#rStat').onclick = () => showStatus(() => showReport({ head: rep.head, lines: [], kv: [] }, done));
  el.querySelector('#rGo').onclick = done;
}
function showLost(M, G0) {
  const rep = G0 ? fightReport(G0, false) : { kv: [] };
  G = null; SCENE_BG.cur = 'kantine';
  const el = uiShow(`${sysBox({ head: 'NIEDERLAGE', lines: ['Quinn ist zu Boden gegangen.', 'Tipp: Achte auf die rote Fläche. Wer im letzten Moment ausweicht, bekommt ein Konterfenster mit doppeltem Schaden. Mit mehr Stufen und Wertepunkten wird es leichter.'], kv: rep.kv })}
    ${SAVE.quinn.points ? `<button class="btn" id="lStat">Wertepunkte verteilen (${SAVE.quinn.points})</button>` : ''}
    <button class="btn" id="lRe">Noch einmal</button><button class="btn ghost" id="lMenu">Hauptmenü</button>`, 'dim');
  el.querySelector('#lRe').onclick = () => startMission(M.id, true);
  if (SAVE.quinn.points) el.querySelector('#lStat').onclick = () => showStatus();
  el.querySelector('#lMenu').onclick = showTitle;
}
function showEnd() {
  G = null; SCENE_BG.cur = 'nacht';
  const Q = SAVE.quinn;
  const el = uiShow(`${sysBox({ head: 'STATUS', kv: [['Name', 'Quinn Talen'], ['Rasse', Q.race || 'Mensch'], ['Stufe', Q.level], ['EP', Q.exp + ' / ' + expNeed(Q.level)], ['Fähigkeiten', Q.skills.map((k) => SKILL_NAMES[k] || k).join(', ') || '—']], quests: [SAVE.quinn.race === 'Vampir' ? 'Hauptquest: Werde stärker' : 'Hauptquest: Erreiche Stufe 10'] })}
    <div class="subtitle">Etappe 6 geschafft · Fortsetzung folgt</div>
    <div class="subtitle" style="font-size:13px">Kämpfe wiederholen (für EP):</div>
    <button class="btn" id="eK">Kyle</button><button class="btn" id="eM">Mono</button><button class="btn" id="eR">Rylee im Park</button><button class="btn" id="eB">Brandon</button><button class="btn" id="eA">Aula</button><button class="btn" id="eA2">Raten gegen Mono</button><button class="btn" id="eT">Power Fighter (VR)</button><button class="btn" id="e6a">Rattaclaws</button><button class="btn" id="e6b">Scordana</button><button class="btn" id="e6c">Bloodsucker</button><button class="btn" id="e6d">Übungskampf Vorden</button><button class="btn" id="e6e">Erdnutzer (VR)</button>
    <button class="btn ghost" id="eStat">Status${SAVE.quinn.points ? ' · +' + SAVE.quinn.points : ''}</button><button class="btn ghost" id="eMenu">Hauptmenü</button>`, 'dim');
  el.querySelector('#eK').onclick = () => startMission('kyle', true, true);
  el.querySelector('#eM').onclick = () => startMission('mono', true, true);
  el.querySelector('#eR').onclick = () => startMission('rylee', true, true);
  el.querySelector('#eB').onclick = () => startMission('brandon', true, true);
  el.querySelector('#eA').onclick = () => startMission('aula', true, true);
  el.querySelector('#eA2').onclick = () => startMission('aula2', true, true);
  el.querySelector('#eT').onclick = () => showVrMenu(showEnd);
  [['#e6a', 'rattaclaw'], ['#e6b', 'scordana'], ['#e6c', 'bloodsucker'], ['#e6d', 'schatten'], ['#e6e', 'vrerde']].forEach(([s, id]) => { el.querySelector(s).onclick = () => startMission(id, true, true); });
  el.querySelector('#eStat').onclick = () => showStatus(showEnd);
  el.querySelector('#eMenu').onclick = showTitle;
}

/* ------------------------------------------------------------ Schleife */
let _last = performance.now();
function frame(now) {
  const rdt = Math.min(0.05, (now - _last) / 1000); _last = now;
  try {
    if (G && !G.paused) updateFight(rdt);
    if (G) { renderFight(); updateHud(); } else renderSceneBg(now / 1000);
  } catch (err) { console.error(err); }
  AudioSys.musicTick && AudioSys.musicTick(rdt, G ? 0.4 : 0.1);
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.state === 'play') showPause(); });
showTitle();
requestAnimationFrame(frame);
