'use strict';
/* ==========================================================================
   START & HAUPTSCHLEIFE
   ========================================================================== */

let MENU = null;
let PENDING_FINN;           // Hintergrundszene fuer die Menues
let lastT = 0, perfAcc = 0, perfN = 0, perfSlow = 0;

function applyQuality() {
  const q = SAVE.settings.quality;
  if (q === 'hoch') { VIEW.dprCap = 2; FXQ = 1; }
  else if (q === 'mittel') { VIEW.dprCap = 1.5; FXQ = 0.75; }
  else if (q === 'niedrig') { VIEW.dprCap = 1.1; FXQ = 0.5; }
  else { VIEW.dprCap = Math.min(2, window.devicePixelRatio || 1); FXQ = 1; }
  FX.maxParts = Math.round(900 * FXQ);
  resizeCanvas();
}
function autoQuality(dt) {
  if (SAVE.settings.quality !== 'auto' || !GAME || GAME.state !== 'play') return;
  perfAcc += dt; perfN++;
  if (perfAcc < 2) return;
  const avg = perfAcc / perfN;
  perfAcc = 0; perfN = 0;
  if (avg > 0.024) { // unter ~42 FPS: Aufloesung und Partikel senken
    perfSlow++;
    if (VIEW.dprCap > 1.25) { VIEW.dprCap = Math.max(1.25, VIEW.dprCap - 0.35); resizeCanvas(); }
    else if (FXQ > 0.5) { FXQ = Math.max(0.5, FXQ - 0.2); FX.maxParts = Math.round(900 * FXQ); }
  }
}

function menuScene() {
  if (MENU) return;
  MENU = { state: 'menu', t: 0, cam: { x: 820, y: 400, w: VIEW.w, h: VIEW.h }, enemies: [], images: [], pickups: [], eproj: [], shake: 0, slowmo: 0, p: null, boss: null, mini: null };
  for (let i = 0; i < 14; i++) {
    const type = i < 9 ? 'ghoul' : i < 12 ? 'bat' : 'witch';
    MENU.enemies.push({ id: -i - 1, type, def: ENEMIES[type], x: 820 + rand(-300, 300), y: 400 + rand(-500, 500), r: ENEMIES[type].r, scale: 1, face: Math.random() < 0.5 ? 1 : -1, animT: Math.random() * 5, spd: ENEMIES[type].spd * 0.5, flash: 0, dead: false, bstack: 0, stunT: 0, corruptT: 0, a: Math.random() * TAU });
  }
}
function updateMenuScene(dt) {
  const M = MENU;
  M.t += dt;
  M.cam.x = 820 + Math.sin(M.t * 0.07) * 260 + M.t * 12;
  M.cam.y = 400 + Math.cos(M.t * 0.05) * 160;
  M.cam.w = VIEW.w; M.cam.h = VIEW.h;
  FX.lights.length = 0;
  for (const e of M.enemies) {
    e.animT += dt;
    e.a += (Math.random() - 0.5) * dt;
    const vx = Math.cos(e.a) * e.spd, vy = Math.sin(e.a) * e.spd * 0.6;
    e.x += vx * dt; e.y += vy * dt;
    e.face = vx > 0 ? 1 : -1;
    if (Math.abs(e.x - M.cam.x) > VIEW.w * 0.6 || Math.abs(e.y - M.cam.y) > VIEW.h * 0.6) { e.x = M.cam.x + rand(-VIEW.w * 0.45, VIEW.w * 0.45); e.y = M.cam.y + rand(-VIEW.h * 0.45, VIEW.h * 0.45); }
    if (e.type === 'witch') addLight(e.x, e.y - 20, 90, '#7dff9a', 0.7);
  }
  addLight(M.cam.x, M.cam.y + 60, 380, '#ffd0b0', 0.55);
  updateFX(dt);
}

function startGame(hero) {
  AudioSys.init();
  MENU = null;
  UI.clear();
  applyQuality();
  PENDING_FINN = hero === 'finn' ? (UI.finnPick !== undefined ? UI.finnPick : finnSave().tier) : undefined;
  newRun(hero);
  UI.showHud();
}
function togglePause(on) {
  if (!GAME) return;
  if (on === undefined) on = GAME.state === 'play';
  if (on && GAME.state === 'play') { GAME.state = 'pause'; INPUT.joy.active = false; UI.showPause(); }
  else if (!on && GAME.state === 'pause') { GAME.state = 'play'; UI.clear(); lastT = performance.now(); }
}
function autoPause() { if (GAME && GAME.state === 'play') togglePause(true); }
function giveUp() { if (!GAME) return; UI.clear(); GAME.state = 'play'; endRun(false); }

function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - lastT) / 1000;
  lastT = now;
  if (!(dt > 0)) dt = 0.016;
  const rawDt = dt;
  dt = Math.min(dt, 0.05);
  if (MENU) {
    updateMenuScene(dt);
    renderWorld(MENU, MENU.t);
    UI.tickPreviews(dt);
    return;
  }
  if (!GAME) return;
  if (GAME.state === 'play') updateGame(dt);
  else if (GAME.state === 'over') { updateFX(dt * 0.3); }
  renderWorld(GAME, GAME.realT);
  UI.updateHud();
  autoQuality(rawDt);
}

async function boot() {
  const msg = (t) => { const m = document.getElementById('bootMsg'); if (m) m.textContent = t; };
  const tick = () => new Promise((r) => setTimeout(r, 0));
  applyQuality();
  try { await Promise.race([Promise.all([document.fonts.load('800 20px Cinzel'), document.fonts.load('700 20px "Cormorant Garamond"')]), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* Schriften optional */ }
  msg('Blut wird vergossen …'); await tick();
  buildParticleSprites(); buildAbilitySprites();
  msg('Die Toten erheben sich …'); await tick();
  bakeEnemies(clamp(VIEW.scale * 1.2, 1.6, 3));
  msg('Der Friedhof von Varn …'); await tick();
  buildGround(); buildPatches(); await tick();
  buildProps(); buildFog();
  msg('Die Nacht bricht herein …'); await tick();
  document.getElementById('boot').classList.add('hide');
  setTimeout(() => { const b = document.getElementById('boot'); if (b) b.remove(); }, 800);
  UI.showTitle();
  lastT = performance.now();
  requestAnimationFrame(frame);
  // erste Beruehrung schaltet Ton frei (iOS)
  const unlock = () => { AudioSys.init(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock);
}
resizeCanvas();
boot();
