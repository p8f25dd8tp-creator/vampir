'use strict';
/* ==========================================================================
   PLATTFORM — Canvas, Ansicht und Handy-Steuerung
   Links: dynamischer Stick (Daumen setzt irgendwo auf).
   Rechts: Angriff (tippen = Combo, halten = aufgeladener Schlag), Ausweichen, Analyse.
   Tastatur zum Testen: WASD/Pfeile, J = Angriff, K/Leertaste = Ausweichen, I = Analyse.
   ========================================================================== */

const cv = document.getElementById('game');
const ctx = cv.getContext('2d', { alpha: true });
const VIEW = { cssW: 0, cssH: 0, dpr: 1, zoom: 1, w: 0, h: 0 };
function resizeCanvas() {
  VIEW.cssW = window.innerWidth; VIEW.cssH = window.innerHeight;
  VIEW.dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(VIEW.cssW * VIEW.dpr); cv.height = Math.round(VIEW.cssH * VIEW.dpr);
  cv.style.width = VIEW.cssW + 'px'; cv.style.height = VIEW.cssH + 'px';
  // Duelle brauchen Naehe: im Hochformat sind ~300 Welteinheiten in der Breite sichtbar
  VIEW.zoom = clamp(Math.min(VIEW.cssW / 290, VIEW.cssH / 500), 0.8, 3);
  VIEW.w = VIEW.cssW / VIEW.zoom; VIEW.h = VIEW.cssH / VIEW.zoom;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ------------------------------------------------------------ Eingabe */
const INPUT = { mx: 0, my: 0, keys: {}, events: [], atkHeld: false, stick: null };
function pushInput(type) { INPUT.events.push(type); }
function readMove() {
  let x = INPUT.mx, y = INPUT.my;
  const K = INPUT.keys;
  const kx = (K.ArrowRight || K.KeyD ? 1 : 0) - (K.ArrowLeft || K.KeyA ? 1 : 0);
  const ky = (K.ArrowDown || K.KeyS ? 1 : 0) - (K.ArrowUp || K.KeyW ? 1 : 0);
  if (kx || ky) { const l = Math.hypot(kx, ky); x = kx / l; y = ky / l; }
  return [x, y];
}
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  INPUT.keys[e.code] = true;
  if (e.code === 'KeyJ') { INPUT.atkHeld = true; pushInput('atkDown'); }
  if (e.code === 'KeyK' || e.code === 'Space') pushInput('dodge');
  if (e.code === 'KeyI') pushInput('inspect');
  if (e.code === 'Enter') pushInput('advance');
});
window.addEventListener('keyup', (e) => {
  INPUT.keys[e.code] = false;
  if (e.code === 'KeyJ') { INPUT.atkHeld = false; pushInput('atkUp'); }
});

// Stick-Zone und Knoepfe werden vom HUD angelegt und hier verdrahtet
const STICK_R = 52;
function bindStick(zone, knobEl) {
  const base = knobEl.parentElement;
  zone.addEventListener('pointerdown', (e) => {
    if (INPUT.stick) return;
    e.preventDefault(); zone.setPointerCapture(e.pointerId);
    INPUT.stick = { id: e.pointerId, x: e.clientX, y: e.clientY };
    base.style.display = 'block'; base.style.left = e.clientX + 'px'; base.style.top = e.clientY + 'px';
    knobEl.style.transform = 'translate(0,0)';
  });
  zone.addEventListener('pointermove', (e) => {
    const S = INPUT.stick; if (!S || S.id !== e.pointerId) return;
    let dx = e.clientX - S.x, dy = e.clientY - S.y; const d = Math.hypot(dx, dy);
    if (d > STICK_R) { dx = dx / d * STICK_R; dy = dy / d * STICK_R; }
    const k = Math.min(1, d / STICK_R), dead = 0.15;
    const m = k < dead ? 0 : (k - dead) / (1 - dead);
    INPUT.mx = d ? dx / Math.min(d, STICK_R) * m : 0; INPUT.my = d ? dy / Math.min(d, STICK_R) * m : 0;
    knobEl.style.transform = `translate(${dx}px,${dy}px)`;
  });
  const end = (e) => {
    const S = INPUT.stick; if (!S || S.id !== e.pointerId) return;
    INPUT.stick = null; INPUT.mx = 0; INPUT.my = 0; base.style.display = 'none';
  };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
}
function bindButton(el, down, up) {
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('on'); down && down(); AudioSys.init && AudioSys.init(); });
  const rel = (e) => { el.classList.remove('on'); up && up(); };
  el.addEventListener('pointerup', rel); el.addEventListener('pointercancel', rel);
}
const $ = (s, r) => (r || document).querySelector(s);
