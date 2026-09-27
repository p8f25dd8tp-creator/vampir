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
    <div class="foot">Private Fan-Umsetzung von „My Vampire System“.<br>Frühe Testversion · Etappe 2</div>`, '');
  el.querySelector('#tNew').onclick = () => { AudioSys.init(); if (started) resetSave(); startMission('prolog'); };
  if (started) el.querySelector('#tCont').onclick = () => { AudioSys.init(); startMission(nextMission()); };
  el.querySelector('#tSet').onclick = showSettings;
}
function nextMission() {
  if (!SAVE.progress.prolog) return 'prolog';
  if (!SAVE.progress.test) return 'test';
  return SAVE.flags.mono ? 'ende' : 'akademie';
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

function startMission(id, skipScene) {
  if (id === 'ende') return showEnd();
  const M = MISSIONS[id]; MISSION = M; G = null;
  if (M.type === 'hub') return beginHub(M);
  const go = () => (M.fight ? beginFight(M) : finishMission(M, true));
  if (M.scene && !skipScene) runScene(M.scene, go); else go();
}
function beginFight(M) {
  INPUT.events.length = 0; INPUT.atkHeld = false;
  newFight(Object.assign({}, M.fight, {
    onWin: () => finishMission(M, true),
    onLose: () => showLost(M)
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
function finishMission(M, won) {
  const P = SAVE.progress[M.id] || (SAVE.progress[M.id] = {});
  const first = !P.done;
  P.done = true;
  if (first && M.reward) {
    const Q = SAVE.quinn;
    Q.exp += M.reward.exp || 0;
    (M.reward.skills || []).forEach((s) => { if (!Q.skills.includes(s)) Q.skills.push(s); });
  }
  if (M.after) M.after();
  writeSave();
  G = null;
  const after = () => (M.next ? startMission(M.next) : showEnd(M));
  if (M.won) runScene(M.won, after); else after();
}
function showLost(M) {
  G = null; SCENE_BG.cur = 'kantine';
  const el = uiShow(`${sysBox({ head: 'NIEDERLAGE', lines: ['Quinn ist zu Boden gegangen.', 'Tipp: Achte auf die rote Fläche. Wer im letzten Moment ausweicht, bekommt ein Konterfenster mit doppeltem Schaden.'] })}
    <button class="btn" id="lRe">Noch einmal</button><button class="btn ghost" id="lMenu">Hauptmenü</button>`, 'dim');
  el.querySelector('#lRe').onclick = () => startMission(M.id, true);
  el.querySelector('#lMenu').onclick = showTitle;
}
function showEnd() {
  G = null; SCENE_BG.cur = 'nacht';
  const Q = SAVE.quinn;
  const el = uiShow(`${sysBox({ head: 'STATUS', kv: [['Name', 'Quinn Talen'], ['Rasse', 'Mensch'], ['Stufe', Q.level], ['EP', Q.exp + ' / 100'], ['Fähigkeiten', Q.skills.includes('inspect') ? 'Inspect' : '—']], quests: ['Hauptquest: Erreiche Stufe 10'] })}
    <div class="subtitle">Etappe 2 geschafft · Fortsetzung folgt</div>
    <button class="btn" id="eK">Kyle wiederholen</button><button class="btn" id="eN">Nachttraining wiederholen</button><button class="btn" id="eM">Mono wiederholen</button><button class="btn ghost" id="eMenu">Hauptmenü</button>`, 'dim');
  el.querySelector('#eK').onclick = () => { MISSIONS.kyle.replay = true; startMission('kyle', true); };
  el.querySelector('#eN').onclick = () => startMission('nacht', true);
  el.querySelector('#eM').onclick = () => startMission('mono', true);
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
